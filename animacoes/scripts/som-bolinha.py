#!/usr/bin/env python3
"""Som original da "Bolinha Infinita" (8,0 s, emenda perfeita): rolagem na madeira, quedas, notas de
xilofone (pentatônica), zunido do funil, calha metálica, tic-tic do elevador e um plim no topo.
Uso: python3 scripts/som-bolinha.py -> public/loop/bolinha.wav"""
import os, wave
import numpy as np

SR = 44100
DUR = 16.0
rng = np.random.default_rng(9)
n = int(SR * DUR)
mix = np.zeros(n)
saida = os.path.join(os.path.dirname(__file__), "..", "public", "loop")


def poe(x, seg, vol):
    i = int(seg * SR)
    j = min(n, i + len(x))
    if i < n:
        mix[i:j] += x[: j - i] * vol


def passa_baixa(x, k):
    return np.convolve(x, np.ones(k) / k, mode="same")


def rolar(ini, fim, vol=0.12, brilho=8):
    m = int(SR * (fim - ini))
    t = np.arange(m) / SR
    ruido = passa_baixa(rng.standard_normal(m), brilho)
    roda = 0.6 + 0.4 * np.sin(2 * np.pi * (6 + 10 * t / (fim - ini)) * t)
    env = np.clip(t / 0.08, 0, 1) * np.clip((fim - ini - t) / 0.08, 0, 1)
    poe(ruido * roda * env, ini, vol)


def toque(tom=180, vol=0.6):
    m = int(SR * 0.25)
    t = np.arange(m) / SR
    poe((np.sin(2 * np.pi * tom * t) * np.exp(-t * 22) + rng.standard_normal(m) * np.exp(-t * 90) * 0.3), 0, 0)
    return (np.sin(2 * np.pi * tom * t) * np.exp(-t * 22) + rng.standard_normal(m) * np.exp(-t * 90) * 0.3) * vol


def xilofone(f):
    m = int(SR * 1.2)
    t = np.arange(m) / SR
    s = np.sin(2 * np.pi * f * t) * np.exp(-t * 4.5) + 0.35 * np.sin(2 * np.pi * f * 3.98 * t) * np.exp(-t * 12) + 0.15 * np.sin(2 * np.pi * f * 9.2 * t) * np.exp(-t * 30)
    ataque = rng.standard_normal(m) * np.exp(-t * 400) * 0.25
    return s + ataque


def tic(tom=2600):
    m = int(SR * 0.03)
    t = np.arange(m) / SR
    return np.sin(2 * np.pi * tom * t) * np.exp(-t * 200) + rng.standard_normal(m) * np.exp(-t * 300) * 0.3


# andar de cima
rolar(0.0, 1.3, 0.11)
poe(toque(170, 0.7), 1.6, 1)
rolar(1.6, 2.8, 0.11)
for t0, f in zip([3.1, 3.5, 3.9, 4.3, 4.7], [523.25, 587.33, 659.25, 783.99, 880.0]):
    poe(xilofone(f), t0, 0.5)
poe(toque(160, 0.7), 5.1, 1)
# andar de baixo (melodia descendo)
rolar(5.1, 6.4, 0.11)
for t0, f in zip([6.7, 7.1, 7.5, 7.9, 8.3], [880.0, 783.99, 659.25, 587.33, 523.25]):
    poe(xilofone(f), t0, 0.5)
# funil
poe(toque(320, 0.5), 8.7, 1)
m = int(SR * 0.9)
tt = np.arange(m) / SR
f = np.geomspace(120, 520, m)
zun = np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.4 + passa_baixa(rng.standard_normal(m), 4) * 0.3
poe(zun * np.clip(tt / 0.1, 0, 1) * np.clip((0.9 - tt) / 0.05, 0, 1), 8.7, 0.25)
# calha
poe(toque(900, 0.5), 9.65, 1)
rolar(9.65, 10.1, 0.1, brilho=3)
poe(toque(260, 0.5), 10.1, 1)
# elevador (tic-tic) e subida
t0 = 10.15
while t0 < 14.55:
    poe(tic(2300 + 300 * ((t0 * 10) % 2)), t0, 0.32)
    t0 += 0.09
m = int(SR * 4.4)
tt = np.arange(m) / SR
f = np.geomspace(90, 260, m)
poe(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.clip(tt / 0.3, 0, 1) * np.clip((4.4 - tt) / 0.3, 0, 1), 10.15, 0.08)
# plim no topo e rolagem até o início
poe(xilofone(1046.5), 14.6, 0.4)
rolar(14.62, 14.98, 0.08)

mix = mix / (np.abs(mix).max() + 1e-9) * 0.85
est = np.stack([mix, mix], axis=1)
with wave.open(os.path.join(saida, "bolinha.wav"), "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((est * 32767).astype(np.int16).tobytes())
print("bolinha.wav ok")
