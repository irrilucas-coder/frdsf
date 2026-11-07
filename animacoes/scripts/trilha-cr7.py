#!/usr/bin/env python3
"""Trilha épica/emocional (72 s) para "Cristiano Ronaldo deixa a seleção": piano em arpejo, cordas,
tambores que crescem nos títulos/recordes, parte escura na briga e final emocionado. Sem direitos autorais.

Uso: python3 scripts/trilha-cr7.py  ->  public/cr7/trilha.mp3
"""
import os
import subprocess
import wave

import numpy as np

SR = 44100
DUR = 72
BPM = 80
rng = np.random.default_rng(7)
saida = os.path.join(os.path.dirname(__file__), "..", "public", "cr7")
os.makedirs(saida, exist_ok=True)
n = int(SR * DUR)
t = np.arange(n) / SR
pad = np.zeros(n)
piano = np.zeros(n)
bateria = np.zeros(n)


def env(m, a, d):
    tt = np.arange(m) / SR
    return np.clip(tt / a, 0, 1) * np.exp(-tt * d)


def poe(buf, x, seg, vol):
    i = int(seg * SR)
    if i >= n:
        return
    j = min(n, i + len(x))
    buf[i:j] += x[: j - i] * vol


def nota(f, dur, d=3.0):
    m = int(SR * dur)
    tt = np.arange(m) / SR
    onda = np.sin(2 * np.pi * f * tt) + 0.4 * np.sin(2 * np.pi * 2 * f * tt) * np.exp(-tt * 4) + 0.15 * np.sin(2 * np.pi * 3 * f * tt) * np.exp(-tt * 6)
    return onda * env(m, 0.004, d)


batida = 60 / BPM
compasso = batida * 4
# Lá menor - Fá - Dó - Sol (épico); na briga (35-49 s): Ré menor - Lá menor (escuro)
ACORDES = {"Am": [110.0, 130.8, 164.8], "F": [87.3, 130.8, 174.6], "C": [130.8, 164.8, 196.0], "G": [98.0, 123.5, 146.8], "Dm": [73.4, 110.0, 146.8], "E": [82.4, 123.5, 164.8]}
s = 0.0
k = 0
while s < DUR:
    escuro = 34.5 <= s < 49
    nome = (["Dm", "Am", "Dm", "E"] if escuro else ["Am", "F", "C", "G"])[k % 4]
    fs = ACORDES[nome]
    # cordas (pad)
    m = int(SR * (compasso + 0.6))
    tt = np.arange(m) / SR
    forma = np.sin(np.pi * np.clip(tt / (compasso + 0.6), 0, 1)) ** 0.7
    for f in fs:
        onda = sum(np.sin(2 * np.pi * f * dt * tt + ph) for dt, ph in ((1, 0), (1.004, 1.3), (0.996, 2.1))) / 3
        poe(pad, onda * forma, s, 0.06)
        poe(pad, np.sin(2 * np.pi * f / 2 * tt) * forma, s, 0.035)
    # piano em arpejo (colcheias)
    seq = [fs[0] * 2, fs[1] * 2, fs[2] * 2, fs[1] * 4, fs[2] * 2, fs[1] * 2, fs[0] * 4, fs[2] * 2]
    for i, f in enumerate(seq):
        poe(piano, nota(f, batida * 1.5, 2.6), s + i * batida / 2, 0.11 if not escuro else 0.07)
    k += 1
    s += compasso

# Tambores: entram nos títulos (17 s), crescem nos recordes, somem no adeus, voltam leves no fim
def bumbo(seg, vol):
    m = int(SR * 0.5)
    f = np.geomspace(110, 38, m)
    poe(bateria, np.sin(2 * np.pi * np.cumsum(f) / SR) * env(m, 0.002, 7), seg, vol)


def caixa(seg, vol):
    m = int(SR * 0.25)
    poe(bateria, rng.standard_normal(m) * env(m, 0.001, 18), seg, vol)


s = 0.0
while s < DUR:
    b = round(s / batida)
    if 17 <= s < 34.5 or 57.5 <= s < 66:
        bumbo(s, 0.55)
        if b % 2 == 1:
            caixa(s, 0.12)
        if 22 <= s < 34.5 and b % 4 == 3:
            bumbo(s + batida / 2, 0.35)
    elif 34.5 <= s < 49:
        if b % 2 == 0:
            bumbo(s, 0.4)  # batida de coração na briga
    s += batida
# rufar antes dos recordes
for i in range(16):
    caixa(21.2 + i * 0.09, 0.04 + i * 0.006)

mix = pad + piano + bateria
curva = np.interp(t, [0, 2, 17, 22, 34, 36, 49, 50, 57, 64, DUR - 4, DUR], [0.0, 0.7, 0.75, 1.0, 1.0, 0.8, 0.8, 0.6, 0.7, 0.9, 0.8, 0])
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
