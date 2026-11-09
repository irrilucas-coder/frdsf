#!/usr/bin/env python3
"""Trilha original (105 s) para o vídeo do infarto: pulso grave tipo batimento, pad em tom menor,
fica mais leve durante a massagem (62-81 s) para o metrônomo aparecer e resolve em tom maior no final.
Uso: python3 scripts/trilha-infarto.py -> public/infarto/trilha.mp3"""
import os, subprocess, wave
import numpy as np

SR = 44100
DUR = 105
saida = os.path.join(os.path.dirname(__file__), "..", "public", "infarto")
os.makedirs(saida, exist_ok=True)
n = int(SR * DUR)
t = np.arange(n) / SR
mix = np.zeros(n)

def env(m, a, d):
    tt = np.arange(m) / SR
    return np.clip(tt / a, 0, 1) * np.exp(-tt * d)

def poe(x, seg, vol):
    i = int(seg * SR)
    if i >= n:
        return
    j = min(n, i + len(x))
    mix[i:j] += x[: j - i] * vol

MENOR = [(110.0, 130.8, 164.8), (87.3, 110.0, 130.8), (98.0, 123.5, 146.8), (82.4, 103.8, 123.5)]
MAIOR = [(130.8, 164.8, 196.0), (174.6, 220.0, 261.6), (196.0, 246.9, 293.7), (130.8, 164.8, 196.0)]
bloco = 3.4
s, k = 0.0, 0
while s < DUR:
    final = s >= 94
    fs = (MAIOR if final else MENOR)[k % 4]
    m = int(SR * (bloco + 0.8))
    tt = np.arange(m) / SR
    forma = np.sin(np.pi * np.clip(tt / (bloco + 0.8), 0, 1)) ** 0.8
    for f in fs:
        onda = (np.sin(2 * np.pi * f * tt) + np.sin(2 * np.pi * f * 1.004 * tt + 1) + 0.4 * np.sin(2 * np.pi * f * 2 * tt)) / 2.4
        poe(onda * forma, s, 0.07)
    # piano: notas soltas
    for j, f in enumerate([fs[0] * 2, fs[2] * 2, fs[1] * 2]):
        mm = int(SR * 1.6)
        t2 = np.arange(mm) / SR
        poe((np.sin(2 * np.pi * f * t2) + 0.3 * np.sin(4 * np.pi * f * t2)) * env(mm, 0.005, 2.5), s + j * bloco / 3, 0.07)
    k += 1
    s += bloco

# batimento (tum-tum) a ~70 bpm, exceto na massagem
s = 0.0
while s < DUR:
    if not (61.5 <= s < 81.5):
        for d, v in ((0, 0.55), (0.22, 0.35)):
            m = int(SR * 0.3)
            f = np.geomspace(85, 40, m)
            poe(np.sin(2 * np.pi * np.cumsum(f) / SR) * env(m, 0.003, 10), s + d, v)
    s += 60 / 70

curva = np.interp(t, [0, 1, 15, 33, 49, 61.5, 62, 81, 82, 94, DUR - 3, DUR], [0.6, 0.9, 1.0, 0.9, 1.0, 0.9, 0.45, 0.45, 0.85, 1.0, 0.9, 0])
mix *= curva
mix = mix / (np.abs(mix).max() + 1e-9) * 0.85
wav = os.path.join(saida, "trilha.wav")
with wave.open(wav, "wb") as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((mix * 32767).astype(np.int16).tobytes())
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", wav, "-b:a", "160k", wav.replace(".wav", ".mp3")], check=True)
os.remove(wav)
print("trilha.mp3 ok")
