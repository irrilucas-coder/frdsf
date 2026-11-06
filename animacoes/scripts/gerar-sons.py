#!/usr/bin/env python3
"""Cria a trilha de efeitos sonoros e a musiquinha de fundo do "Bip e a Estrela".

Tudo é sintetizado aqui (ondas senoidais e ruído), sem banco de sons nem API.
Uso: python3 scripts/gerar-sons.py   ->  public/audio/efeitos.wav e public/audio/musica.wav
"""
import os
import wave

import numpy as np

SR = 44100
DUR = 19.5
FPS = 30
rng = np.random.default_rng(7)
destino = os.path.join(os.path.dirname(__file__), "..", "public", "audio")


def trilha():
    return np.zeros(int(SR * DUR))


def t_(dur):
    return np.arange(int(SR * dur)) / SR


def env(n, ataque=0.005, decai=6.0):
    t = np.arange(n) / SR
    a = np.clip(t / ataque, 0, 1)
    return a * np.exp(-t * decai)


def nota(freq, dur, decai=6.0, harm=(1, 0.3, 0.1), ataque=0.005):
    t = t_(dur)
    s = sum(h * np.sin(2 * np.pi * freq * (i + 1) * t) for i, h in enumerate(harm))
    return s * env(len(t), ataque, decai)


def glissando(f0, f1, dur, decai=3.0):
    t = t_(dur)
    f = np.geomspace(f0, f1, len(t))
    fase = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(fase) * env(len(t), 0.005, decai)


def ruido_filtrado(dur, corte0, corte1):
    n = int(SR * dur)
    x = rng.standard_normal(n)
    cortes = np.geomspace(corte0, corte1, n)
    y = np.zeros(n)
    acc = 0.0
    for i in range(n):  # passa-baixa de um polo com corte variável
        a = 1 - np.exp(-2 * np.pi * cortes[i] / SR)
        acc += a * (x[i] - acc)
        y[i] = acc
    return y / (np.abs(y).max() + 1e-9)


def poe(tr, som, seg, vol=1.0):
    i = int(seg * SR)
    j = min(len(tr), i + len(som))
    tr[i:j] += som[: j - i] * vol


def f(frame):
    return frame / FPS


# ---------------- Efeitos ----------------
fx = trilha()

# Bip acorda: "bi-biip" subindo
poe(fx, nota(880, 0.12, 18, (1, 0.2)), f(60), 0.35)
poe(fx, glissando(1100, 1760, 0.22, 8), f(64), 0.35)
# Piscadas
for p in (100, 228, 372, 480):
    poe(fx, nota(2400, 0.05, 60, (1,)), f(p), 0.12)
# Bip vira e estranha: "bip?"
poe(fx, glissando(700, 1300, 0.25, 6), f(152), 0.3)

# Estrela cai: assovio descendo + chiado
cai = 185 - 130
whoosh = ruido_filtrado(f(cai) + 0.1, 400, 5000)
whoosh *= np.linspace(0.1, 1, len(whoosh)) ** 2
poe(fx, whoosh, f(130), 0.25)
poe(fx, glissando(2600, 500, f(cai), 0.6), f(130), 0.12)
for k in range(14):  # faíscas no rastro
    poe(fx, nota(rng.uniform(2500, 4200), 0.15, 25, (1,)), f(130) + k * f(cai) / 14, 0.06)

# Impacto: baque grave + acorde de sino
poe(fx, glissando(140, 45, 0.6, 7), f(185), 0.7)
for fr in (1046.5, 1318.5, 1568.0, 2093.0):
    poe(fx, nota(fr, 2.2, 1.8, (1, 0.25, 0.08)), f(186), 0.12)

# Pulinhos ("boing")
for p in (195, 210, 225, 285, 300, 400, 417, 435, 452):
    poe(fx, glissando(320, 640, 0.14, 14), f(p), 0.22)

# Empurrando a estrela na terra: esforço + afundar
poe(fx, nota(500, 0.3, 8, (1, 0.5, 0.3)), f(250), 0.18)
poe(fx, ruido_filtrado(0.5, 300, 120) * env(int(SR * 0.5), 0.05, 5), f(262), 0.25)

# Árvore crescendo: brilho subindo
cresce = trilha()
inicio, fim = f(285), f(372)
for k in range(70):
    pos = (k / 70) ** 0.8
    tt = inicio + pos * (fim - inicio)
    fr = 600 * 2 ** (pos * 2.2) * rng.uniform(0.97, 1.03)
    poe(cresce, nota(fr, 0.3, 14, (1, 0.15)), tt, 0.05 + 0.05 * pos)
poe(cresce, glissando(130, 520, fim - inicio, 0.05) * 0.5, inicio, 0.18)
fx += cresce

# Frutas-estrela: "plim" em escala pentatônica subindo
penta = [1046.5, 1174.7, 1318.5, 1568.0, 1760.0, 2093.0, 2349.3]
for i, fr in enumerate(penta):
    poe(fx, nota(fr, 1.0, 4.5, (1, 0.3, 0.1)), f(375 + i * 5), 0.16)

# Bip comemora: melodia de bips
for k, fr in enumerate((1046.5, 1318.5, 1568.0, 2093.0, 1568.0, 2093.0)):
    poe(fx, nota(fr, 0.11, 20, (1, 0.4)), f(402) + k * 0.13, 0.22)

# Ilhas distantes acendendo
for p, fr in zip((430, 445, 460, 470), (784.0, 987.8, 1174.7, 1568.0)):
    poe(fx, nota(fr, 1.6, 2.5, (1, 0.2)), f(p), 0.1)

# Final: acorde brilhante
for fr in (523.3, 659.3, 784.0, 1046.5, 1318.5):
    poe(fx, nota(fr, 3.5, 1.2, (1, 0.2), ataque=0.03), f(459), 0.09)

# ---------------- Música de fundo ----------------
mus = trilha()
# Acordes suaves (pad): Dó, Lá menor, Fá, Sol
acordes = [(261.6, 329.6, 392.0), (220.0, 261.6, 329.6), (174.6, 220.0, 261.6), (196.0, 246.9, 293.7)]
passo = 2.4
k = 0
s = 0.0
while s < DUR:
    for fr in acordes[k % 4]:
        n = int(SR * (passo + 0.8))
        t = np.arange(n) / SR
        pad = (np.sin(2 * np.pi * fr * t) + 0.3 * np.sin(2 * np.pi * fr * 2 * t + 0.5)) * np.sin(
            np.pi * np.clip(t / (passo + 0.8), 0, 1)
        )
        poe(mus, pad, s, 0.05)
    k += 1
    s += passo
# Caixinha de música
melodia = [784.0, 659.3, 784.0, 1046.5, 880.0, 784.0, 659.3, 587.3, 659.3, 784.0, 659.3, 523.3]
s = 0.6
k = 0
while s < DUR - 0.5:
    poe(mus, nota(melodia[k % len(melodia)], 1.2, 3.5, (1, 0.15, 0.05)), s, 0.07)
    k += 1
    s += 0.6
# Começa e termina suave
fade = np.ones(len(mus))
fade[: SR * 2] = np.linspace(0, 1, SR * 2)
fade[-SR * 2 :] = np.linspace(1, 0, SR * 2)
mus *= fade


def salva(nome, x):
    x = x / (np.abs(x).max() + 1e-9) * 0.89
    pcm = (x * 32767).astype(np.int16)
    with wave.open(os.path.join(destino, nome), "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())
    print(nome, "ok")


salva("efeitos.wav", fx)
salva("musica.wav", mus)
