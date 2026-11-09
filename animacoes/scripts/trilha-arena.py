#!/usr/bin/env python3
"""Trilha original de game show tenso (46 s) para "Arena do Milhão – ep. 1": baixo pulsando,
chimbal, acordes menores, subida na contagem (29-32 s) e virada de vitória (33 s). Sem direitos autorais.

Uso: python3 scripts/trilha-arena.py  ->  public/arena1/trilha.mp3
"""
import os
import subprocess
import wave

import numpy as np

SR = 44100
DUR = 46
BPM = 122
rng = np.random.default_rng(11)
saida = os.path.join(os.path.dirname(__file__), "..", "public", "arena1")
os.makedirs(saida, exist_ok=True)
n = int(SR * DUR)
t = np.arange(n) / SR
mix = np.zeros(n)


def env(m, a, d):
    tt = np.arange(m) / SR
    return np.clip(tt / a, 0, 1) * np.exp(-tt * d)


def poe(x, seg, vol):
    i = int(seg * SR)
    if i >= n or i < 0:
        return
    j = min(n, i + len(x))
    mix[i:j] += x[: j - i] * vol


def serra(f, dur, d=6):
    m = int(SR * dur)
    tt = np.arange(m) / SR
    onda = 2 * ((f * tt) % 1) - 1
    onda = np.convolve(onda, np.ones(8) / 8, mode="same")  # suaviza
    return onda * env(m, 0.005, d)


b = 60 / BPM
# progressão: Lá menor, Fá, Ré menor, Mi (tensão de game show)
RAIZ = [55.0, 43.65, 36.71, 41.2]
ACORDE = [(220, 261.6, 329.6), (174.6, 220, 261.6), (146.8, 174.6, 220), (164.8, 207.7, 246.9)]
s = 0.0
k = 0
while s < DUR:
    vitoria = 32.8 <= s < 37.5
    final = s >= 37.5
    idx = (k // 8) % 4
    # baixo em colcheias
    poe(serra(RAIZ[idx] * (2 if k % 2 else 1), b / 2 * 0.95, 9), s, 0.32)
    # chimbal
    m = int(SR * 0.04)
    poe(rng.standard_normal(m) * env(m, 0.0005, 90), s + b / 4, 0.05 if not vitoria else 0.08)
    # bumbo no tempo, palma no 2 e 4
    if k % 2 == 0:
        m = int(SR * 0.4)
        f = np.geomspace(120, 40, m)
        poe(np.sin(2 * np.pi * np.cumsum(f) / SR) * env(m, 0.002, 8), s, 0.6)
    if k % 4 == 2:
        m = int(SR * 0.18)
        poe(rng.standard_normal(m) * env(m, 0.001, 22), s, 0.18)
    # acordes (stabs) a cada compasso
    if k % 8 == 0:
        for fr in ACORDE[idx]:
            poe(serra(fr if not vitoria else fr * 1.335, b * 1.6, 2.5), s, 0.05)
    k += 1
    s += b / 2

# subida (riser) na contagem
m = int(SR * 3.2)
tt = np.arange(m) / SR
f = np.geomspace(200, 1600, m)
riser = np.sin(2 * np.pi * np.cumsum(f) / SR) * (tt / 3.2) ** 2 + rng.standard_normal(m) * 0.15 * (tt / 3.2) ** 3
poe(riser, 29.4, 0.12)

curva = np.interp(t, [0, 1.5, 9, 13, 20, 25, 29.3, 32.7, 33.0, 37.5, DUR - 3, DUR], [0, 0.8, 0.8, 0.85, 0.85, 0.8, 0.9, 1.0, 0.95, 0.8, 0.75, 0])
mix *= curva
mix = mix / (np.abs(mix).max() + 1e-9) * 0.85
wav = os.path.join(saida, "trilha.wav")
with wave.open(wav, "wb") as w:
    w.setnchannels(1)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((mix * 32767).astype(np.int16).tobytes())
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", wav, "-b:a", "160k", wav.replace(".wav", ".mp3")], check=True)
os.remove(wav)
print("trilha.mp3 ok")
