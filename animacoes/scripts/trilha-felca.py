#!/usr/bin/env python3
"""Trilha de documentário tenso (90 s) para "Felca e o caso Hytalo Santos": pulso grave, pad escuro e tique-taque.

Uso: python3 scripts/trilha-maduro.py  ->  public/felca/trilha.mp3
"""
import os
import subprocess
import wave

import numpy as np

SR = 44100
DUR = 92
BPM = 84
rng = np.random.default_rng(23)
saida = os.path.join(os.path.dirname(__file__), "..", "public", "felca")
os.makedirs(saida, exist_ok=True)

n = int(SR * DUR)
t = np.arange(n) / SR
mus = np.zeros(n)


def env(m, a, d):
    tt = np.arange(m) / SR
    return np.clip(tt / a, 0, 1) * np.exp(-tt * d)


def poe(x, seg, vol):
    i = int(seg * SR)
    if i >= n:
        return
    j = min(n, i + len(x))
    mus[i:j] += x[: j - i] * vol


# Pad escuro (Ré menor -> Si bemol -> Fá -> Lá), troca a cada 2 compassos
batida = 60 / BPM
bloco = batida * 8
acordes = [(73.4, 110.0, 174.6), (58.3, 116.5, 146.8), (87.3, 130.8, 174.6), (55.0, 110.0, 164.8)]
k = 0
s = 0.0
while s < DUR:
    m = int(SR * (bloco + 1))
    tt = np.arange(m) / SR
    forma = np.sin(np.pi * np.clip(tt / (bloco + 1), 0, 1))
    for f in acordes[k % 4]:
        onda = np.sin(2 * np.pi * f * tt) + 0.35 * np.sin(2 * np.pi * f * 2.003 * tt) + 0.15 * np.sin(2 * np.pi * f * 3.01 * tt)
        poe(onda * forma, s, 0.05)
    k += 1
    s += bloco

# Pulso grave (batida de coração) e tique-taque
s = 0.0
i = 0
while s < DUR:
    m = int(SR * 0.35)
    tt = np.arange(m) / SR
    f = np.geomspace(90, 40, m)
    poe(np.sin(2 * np.pi * np.cumsum(f) / SR) * env(m, 0.003, 9), s, 0.45 if i % 2 == 0 else 0.25)
    tique = rng.standard_normal(int(SR * 0.03)) * env(int(SR * 0.03), 0.0005, 120)
    poe(tique, s + batida / 2, 0.06)
    s += batida
    i += 1

# Entrada e saída suaves; a parte da ação (35 s a 50 s) fica um pouco mais forte
curva = np.interp(t, [0, 3, 30, 33, 46, 50, DUR - 4, DUR], [0, 0.75, 0.75, 1.0, 1.0, 0.8, 0.8, 0])
mus *= curva
mus = mus / (np.abs(mus).max() + 1e-9) * 0.85

wav = os.path.join(saida, "trilha.wav")
with wave.open(wav, "wb") as w:
    w.setnchannels(1)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((mus * 32767).astype(np.int16).tobytes())
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", wav, "-b:a", "160k", wav.replace(".wav", ".mp3")], check=True)
os.remove(wav)
print("trilha.mp3 ok")
