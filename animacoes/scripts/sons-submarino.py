#!/usr/bin/env python3
"""Sintetiza os efeitos sonoros e a trilha do vídeo do submarino (sem API, sem banco de sons).

Uso: python3 scripts/sons-submarino.py  ->  public/submarino/sfx/*.wav e public/submarino/musica.wav
"""
import os
import wave

import numpy as np

SR = 44100
rng = np.random.default_rng(3)
raiz = os.path.join(os.path.dirname(__file__), "..", "public", "submarino")
os.makedirs(os.path.join(raiz, "sfx"), exist_ok=True)


def t_(d):
    return np.arange(int(SR * d)) / SR


def env(n, a=0.005, dec=6.0):
    t = np.arange(n) / SR
    return np.clip(t / a, 0, 1) * np.exp(-t * dec)


def seno(f, d, dec=6, harm=(1,), a=0.005):
    t = t_(d)
    return sum(h * np.sin(2 * np.pi * f * (i + 1) * t) for i, h in enumerate(harm)) * env(len(t), a, dec)


def gliss(f0, f1, d, dec=3, forma="seno"):
    t = t_(d)
    f = np.geomspace(f0, f1, len(t))
    fase = 2 * np.pi * np.cumsum(f) / SR
    onda = np.sin(fase) if forma == "seno" else np.sign(np.sin(fase)) * 0.5
    return onda * env(len(t), 0.005, dec)


def ruido(d):
    return rng.standard_normal(int(SR * d))


def passa_baixa(x, corte):
    """Passa-baixa simples (corte pode ser número ou vetor)."""
    corte = np.broadcast_to(corte, x.shape)
    a = 1 - np.exp(-2 * np.pi * corte / SR)
    y = np.empty_like(x)
    acc = 0.0
    for i in range(len(x)):
        acc += a[i] * (x[i] - acc)
        y[i] = acc
    return y


def norm(x, pico=0.9):
    return x / (np.abs(x).max() + 1e-9) * pico


def salva(nome, x, pico=0.9):
    x = norm(x, pico)
    with wave.open(os.path.join(raiz, nome), "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((x * 32767).astype(np.int16).tobytes())
    print(nome)


def mix(*partes):
    n = max(len(p) for p in partes)
    out = np.zeros(n)
    for p in partes:
        out[: len(p)] += p
    return out


def em(x, seg, total):
    out = np.zeros(int(SR * total))
    i = int(seg * SR)
    out[i : i + len(x)] += x[: len(out) - i]
    return out


# ---------------- Efeitos ----------------
d = 0.55
w = ruido(d) * np.sin(np.linspace(0, np.pi, int(SR * d))) ** 2
salva("sfx/whoosh.wav", passa_baixa(w, np.geomspace(300, 4000, len(w))), 0.8)

salva("sfx/pop.wav", mix(gliss(400, 1200, 0.12, 22), seno(1800, 0.08, 40) * 0.3), 0.8)

boom = mix(gliss(120, 30, 1.8, 2.2) * 1.2, passa_baixa(ruido(1.8), 600) * env(int(SR * 1.8), 0.002, 2.5) * 3)
salva("sfx/boom.wav", boom, 0.95)

bz = mix(em(gliss(220, 200, 0.32, 1, "quadrada"), 0, 0.8), em(gliss(180, 150, 0.42, 1, "quadrada"), 0.36, 0.8))
salva("sfx/buzzer.wav", passa_baixa(bz, 2500), 0.7)

ding = mix(*[em(seno(f, 1.0, 4, (1, 0.3, 0.1)), i * 0.09, 1.4) for i, f in enumerate((1046.5, 1318.5, 1568.0, 2093.0))])
salva("sfx/ding.wav", ding, 0.75)

sp = passa_baixa(ruido(1.0), np.geomspace(5000, 400, int(SR * 1.0))) * env(int(SR * 1.0), 0.01, 4)
sp = mix(sp, gliss(300, 80, 0.5, 6) * 0.6)
salva("sfx/splash.wav", sp, 0.8)

bol = np.zeros(int(SR * 2.2))
for k in range(26):
    f0 = rng.uniform(300, 900)
    bol = mix(bol, em(gliss(f0, f0 * 2.2, 0.07, 30), rng.uniform(0, 2.0), 2.2))
salva("sfx/bolhas.wav", bol, 0.6)

al = np.zeros(int(SR * 2.6))
for k in range(6):
    f = 880 if k % 2 == 0 else 660
    al = mix(al, em(seno(f, 0.42, 2, (1, 0.5, 0.25), 0.01), k * 0.43, 2.6))
salva("sfx/alarme.wav", al, 0.55)

mv = np.zeros(int(SR * 3))
for k in range(24):
    mv = mix(mv, em(passa_baixa(ruido(0.03), 3000) * env(int(SR * 0.03), 0.001, 80), k * 0.125, 3))
    if k % 4 == 0:
        mv = mix(mv, em(seno(180, 0.15, 20, (1, 0.6)), k * 0.125, 3))
salva("sfx/manivela.wav", mv, 0.6)

tb = t_(2.0)
broca = np.sign(np.sin(2 * np.pi * (180 + 30 * np.sin(2 * np.pi * 6 * tb)) * tb)) * 0.4
broca = passa_baixa(broca + ruido(2.0)[: len(tb)] * 0.2, 2200) * np.clip(tb / 0.1, 0, 1) * np.clip((2 - tb) / 0.2, 0, 1)
salva("sfx/broca.wav", broca, 0.55)

son = mix(seno(1450, 2.0, 1.6, (1, 0.1)), em(seno(1450, 1.5, 3, (1,)) * 0.3, 0.35, 2.0))
salva("sfx/sonar.wav", son, 0.6)

carimbo = mix(gliss(160, 60, 0.3, 14) * 1.2, passa_baixa(ruido(0.12), 1500) * env(int(SR * 0.12), 0.001, 40))
salva("sfx/carimbo.wav", carimbo, 0.85)

ts = t_(10)
drone = (np.sin(2 * np.pi * 55 * ts) + 0.6 * np.sin(2 * np.pi * 82.4 * ts) + 0.3 * np.sin(2 * np.pi * 110.5 * ts))
drone *= 0.6 + 0.4 * np.sin(2 * np.pi * 0.25 * ts)
batida = np.zeros(len(ts))
for k in range(12):
    batida = mix(batida, em(gliss(70, 40, 0.25, 12), 0.2 + k * 0.82, 10))
    batida = mix(batida, em(gliss(65, 38, 0.2, 14) * 0.7, 0.45 + k * 0.82, 10))
susp = (drone * 0.5 + batida[: len(ts)]) * np.clip(ts / 1.0, 0, 1) * np.clip((10 - ts) / 1.0, 0, 1)
salva("sfx/suspense.wav", susp, 0.7)

salva("sfx/tique.wav", mix(seno(2600, 0.04, 80), passa_baixa(ruido(0.02), 4000) * 0.3), 0.5)

# ---------------- Trilha de aventura (100 s, 112 bpm, Ré menor) ----------------
DUR = 100
BPM = 112
batida_s = 60 / BPM
mus = np.zeros(int(SR * DUR))
# progressão: Dm - Bb - F - C
acordes = [(146.8, 174.6, 220.0), (116.5, 146.8, 174.6), (174.6, 220.0, 261.6), (130.8, 164.8, 196.0)]
baixos = [73.4, 58.3, 87.3, 65.4]
compasso = batida_s * 4
n_comp = int(DUR / compasso) + 1


def adiciona(x, seg, vol):
    i = int(seg * SR)
    if i >= len(mus):
        return
    j = min(len(mus), i + len(x))
    mus[i:j] += x[: j - i] * vol


for c in range(n_comp):
    base = c * compasso
    ac = acordes[c % 4]
    # baixo pulsando em colcheias
    for k in range(8):
        adiciona(seno(baixos[c % 4], batida_s / 2, 7, (1, 0.5, 0.2)), base + k * batida_s / 2, 0.22)
    # arpejo "pluck"
    padrao = [0, 1, 2, 1, 0, 2, 1, 2]
    for k, idx in enumerate(padrao):
        adiciona(seno(ac[idx] * 2, 0.35, 9, (1, 0.4, 0.2, 0.1)), base + k * batida_s / 2, 0.12)
    # pad
    for f in ac:
        tt = t_(compasso)
        adiciona(np.sin(2 * np.pi * f * tt) * np.sin(np.pi * tt / compasso), base, 0.035)
    # bateria: bumbo 1 e 3, caixa 2 e 4, chimbal em colcheias
    for k in (0, 2):
        adiciona(gliss(110, 45, 0.25, 14), base + k * batida_s, 0.5)
    for k in (1, 3):
        adiciona(passa_baixa(ruido(0.15), 3500) * env(int(SR * 0.15), 0.001, 22), base + k * batida_s, 0.18)
    for k in range(8):
        adiciona(ruido(0.04) * env(int(SR * 0.04), 0.001, 90) * 0.5, base + k * batida_s / 2, 0.08)

fade = np.ones(len(mus))
fade[: SR] = np.linspace(0, 1, SR)
mus *= fade
salva("musica.wav", mus, 0.8)

# A trilha fica em MP3 para não pesar no repositório
import subprocess  # noqa: E402

wav = os.path.join(raiz, "musica.wav")
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", wav, "-b:a", "160k", wav.replace(".wav", ".mp3")], check=True)
os.remove(wav)
print("musica.mp3")
