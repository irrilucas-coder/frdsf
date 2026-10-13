#!/usr/bin/env python3
"""Efeitos sonoros e trilha de fundo sintetizados em numpy (estéreo, 48 kHz). Sem arquivos externos.

sfx(nome) → caminho de um .wav: whoosh, whoosh_rev, subida, pop, bolha, ding, brilho, impacto, erro, moeda,
clique, glitch, swipe.
trilha(segundos, destino, bpm=100) → batida discreta (kick, chimbal, baixo e acordes suaves) para ficar por baixo da voz.
"""
import os, wave
import numpy as np

SR = 48000
PASTA = os.path.join(os.path.expanduser("~"), ".cache", "editor-ia-sons")
rng = np.random.default_rng(3)


def _t(d):
    return np.arange(int(SR * d)) / SR


def _env(n, ataque=0.005, queda=None, d=None):
    t = np.arange(n) / SR
    a = np.clip(t / max(ataque, 1e-4), 0, 1)
    return a * (np.exp(-t / queda) if queda else 1)


def _passa_banda(x, f_ini, f_fim, q=1.2):
    """Filtro passa-banda com frequência variando no tempo (biquad atualizado por bloco)."""
    y = np.zeros_like(x)
    n, bloco = len(x), 256
    z1 = z2 = 0.0
    for i in range(0, n, bloco):
        f = f_ini * (f_fim / f_ini) ** (i / max(n - 1, 1))
        w = 2 * np.pi * f / SR
        al = np.sin(w) / (2 * q)
        b0, b2 = al, -al
        a0, a1, a2 = 1 + al, -2 * np.cos(w), 1 - al
        b0, b2, a1, a2 = b0 / a0, b2 / a0, a1 / a0, a2 / a0
        for k in range(i, min(i + bloco, n)):  # forma transposta II
            v = x[k]
            out = b0 * v + z1
            z1 = -a1 * out + z2
            z2 = b2 * v - a2 * out
            y[k] = out
    return y


def _estereo(x, largura=0.0, atraso_ms=8):
    if largura <= 0:
        return np.stack([x, x], 1)
    d = int(SR * atraso_ms / 1000)
    r = np.concatenate([np.zeros(d), x[:-d]]) if d else x
    return np.stack([x, x * (1 - largura) + r * largura], 1)


def _norm(x, pico=0.9):
    m = np.max(np.abs(x)) or 1
    return x / m * pico


def _salvar(x, destino):
    x = np.clip(x, -1, 1)
    if x.ndim == 1:
        x = np.stack([x, x], 1)
    with wave.open(destino, "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((x * 32767).astype("<i2").tobytes())
    return destino


def _gerar(nome):
    if nome in ("whoosh", "whoosh_rev", "swipe"):
        d = {"whoosh": 0.55, "whoosh_rev": 0.6, "swipe": 0.25}[nome]
        n = int(SR * d)
        ruido = rng.standard_normal(n)
        f0, f1 = (300, 4500) if nome != "whoosh_rev" else (4500, 300)
        x = _passa_banda(ruido, f0, f1, 0.9)
        t = np.arange(n) / n
        env = np.sin(np.pi * t) ** (1.5 if nome == "swipe" else 2.2)
        if nome == "whoosh_rev":
            env = t ** 2.5 * (t < 0.92) + (t >= 0.92) * (1 - (t - 0.92) / 0.08)
        return _estereo(_norm(x * env, 0.8), 0.5)
    if nome == "subida":
        t = _t(1.4)
        f = 150 + 900 * (t / 1.4) ** 2
        x = np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.4 + _passa_banda(rng.standard_normal(len(t)), 400, 6000) * 0.5
        return _estereo(_norm(x * (t / 1.4) ** 2, 0.7), 0.4)
    if nome in ("pop", "bolha"):
        t = _t(0.16)
        f = (420 if nome == "pop" else 300) + 1400 * np.exp(-t * (40 if nome == "pop" else 25))
        x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 28)
        return _estereo(_norm(x, 0.8))
    if nome in ("ding", "brilho"):
        t = _t(1.6)
        base = 1318.5 if nome == "ding" else 2093
        x = sum(a * np.sin(2 * np.pi * base * h * t) * np.exp(-t * q) for h, a, q in
                [(1, 1, 3), (2.01, .5, 5), (3.02, .25, 8), (4.2, .12, 12)])
        if nome == "brilho":
            x = x + 0.6 * np.sin(2 * np.pi * base * 1.5 * (t - .07)) * np.exp(-np.clip(t - .07, 0, None) * 5) * (t > .07)
        return _estereo(_norm(x * _env(len(t), 0.002), 0.6), 0.6, 15)
    if nome == "impacto":
        t = _t(1.3)
        f = 38 + 110 * np.exp(-t * 14)
        sub = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 3.2)
        estalo = _passa_banda(rng.standard_normal(len(t)), 2500, 800, 0.7) * np.exp(-t * 35)
        x = np.tanh(2.2 * (sub + 0.6 * estalo))
        return _estereo(_norm(x, 0.95), 0.3)
    if nome == "erro":
        t = _t(0.5)
        x = np.sign(np.sin(2 * np.pi * 155 * t)) * (t < .2) + np.sign(np.sin(2 * np.pi * 115 * t)) * (t >= .24)
        x = _passa_banda(x * 0.5, 900, 900, 0.6) * np.exp(-((t % .24) * 4))
        return _estereo(_norm(x, 0.6))
    if nome == "moeda":
        t = _t(1.0)
        x = 0.6 * np.sin(2 * np.pi * 1975 * t) * np.exp(-t * 10) * (t < .09)
        t2 = np.clip(t - .09, 0, None)
        x = x + (np.sin(2 * np.pi * 2637 * t2) + .4 * np.sin(2 * np.pi * 5274 * t2)) * np.exp(-t2 * 5) * (t >= .09)
        return _estereo(_norm(x, 0.6), 0.5, 12)
    if nome == "clique":
        t = _t(0.06)
        x = _passa_banda(rng.standard_normal(len(t)), 3000, 3000, 2) * np.exp(-t * 160)
        return _estereo(_norm(x, 0.6))
    if nome == "glitch":
        t = _t(0.35)
        x = np.sign(np.sin(2 * np.pi * (80 + 1200 * (rng.random(len(t)) > .97).cumsum() % 7 * 90) * t))
        x = x * (rng.random(len(t) // 600 + 1).repeat(600)[:len(t)] > .35) * 0.4
        return _estereo(_norm(_passa_banda(x, 1800, 1800, 0.5), 0.55), 0.6)
    raise KeyError(nome)


NOMES = ["whoosh", "whoosh_rev", "swipe", "subida", "pop", "bolha", "ding", "brilho", "impacto", "erro", "moeda", "clique", "glitch"]


def sfx(nome):
    os.makedirs(PASTA, exist_ok=True)
    destino = os.path.join(PASTA, f"v2-{nome}.wav")
    if not os.path.exists(destino):
        _salvar(_gerar(nome), destino)
    return destino


def trilha(segundos, destino, bpm=100):
    """Batida leve: kick no 1 e 3, palma no 2 e 4, chimbal em colcheias, baixo e acordes Am–F–C–G."""
    n = int(SR * segundos)
    mix = np.zeros((n, 2))
    tempo = 60 / bpm
    t = _t(0.5)
    kick = np.sin(2 * np.pi * np.cumsum(45 + 120 * np.exp(-t * 30)) / SR) * np.exp(-t * 7)
    t = _t(0.25)
    palma = _passa_banda(rng.standard_normal(len(t)), 1500, 1500, 0.8) * np.exp(-t * 22)
    t = _t(0.06)
    chimbal = _passa_banda(rng.standard_normal(len(t)), 8000, 8000, 1.5) * np.exp(-t * 90)
    acordes = [(220.0, 261.6, 329.6), (174.6, 220.0, 261.6), (261.6, 329.6, 392.0), (196.0, 246.9, 293.7)]

    def soma(sinal, ini, ganho, pan=0.0):
        i = int(ini * SR)
        if i >= n:
            return
        s = sinal[: n - i] * ganho
        mix[i:i + len(s), 0] += s * (1 - pan)
        mix[i:i + len(s), 1] += s * (1 + pan)

    batida, compasso = 0, 0
    while batida * tempo < segundos:
        b = batida % 4
        ini = batida * tempo
        if b in (0, 2):
            soma(kick, ini, 0.9)
        if b in (1, 3):
            soma(palma, ini, 0.35)
        soma(chimbal, ini, 0.12, 0.3)
        soma(chimbal, ini + tempo / 2, 0.08, -0.3)
        if b == 0:
            ac = acordes[compasso % 4]
            tt = _t(tempo * 4)
            pad = sum(np.sin(2 * np.pi * f * tt) + 0.5 * np.sin(2 * np.pi * f * 1.003 * tt) for f in ac)
            pad = pad * np.minimum(1, tt / 0.3) * np.exp(-tt * 0.35) * 0.07
            soma(pad, ini, 1, -0.2)
            soma(pad, ini + 0.012, 1, 0.2)
            grave = np.sin(2 * np.pi * ac[0] / 2 * tt) * np.exp(-tt * 1.2) * 0.35
            soma(grave, ini, 1)
            compasso += 1
        batida += 1
    fade = int(SR * 1.5)
    mix[-fade:] *= np.linspace(1, 0, fade)[:, None]
    return _salvar(_norm(mix, 0.8), destino)


if __name__ == "__main__":
    for nome in NOMES:
        print(sfx(nome))
