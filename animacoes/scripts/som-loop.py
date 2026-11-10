#!/usr/bin/env python3
"""Som original do loop "Cubos Comilões" (8,0 s, emenda perfeita): catraca mecânica que acelera/desacelera
com os movimentos e batidas graves nos pousos, no estilo de desenho animado. Sem direitos autorais.
Uso: python3 scripts/som-loop.py -> public/loop/som.wav"""
import os, wave
import numpy as np

SR = 44100
DUR = 8.0
rng = np.random.default_rng(5)
n = int(SR * DUR)
mix = np.zeros(n)
saida = os.path.join(os.path.dirname(__file__), "..", "public", "loop")
os.makedirs(saida, exist_ok=True)


def poe(x, seg, vol):
    i = int(seg * SR)
    j = min(n, i + len(x))
    if i < n:
        mix[i:j] += x[: j - i] * vol


def clique(tom=1900.0):
    m = int(SR * 0.035)
    t = np.arange(m) / SR
    ruido = rng.standard_normal(m) * np.exp(-t * 260)
    corpo = np.sin(2 * np.pi * tom * t) * np.exp(-t * 140) + 0.5 * np.sin(2 * np.pi * tom * 2.3 * t) * np.exp(-t * 220)
    return ruido * 0.5 + corpo


def batida(grave=1.0):
    m = int(SR * 0.45)
    t = np.arange(m) / SR
    f = np.geomspace(140 * grave, 45, m)
    corpo = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 9)
    estalo = rng.standard_normal(m) * np.exp(-t * 60) * 0.35
    return corpo + estalo


def nhac():
    # mordida: dois estalos úmidos rápidos
    m = int(SR * 0.12)
    t = np.arange(m) / SR
    return (np.sin(2 * np.pi * 420 * t) * np.exp(-t * 45) + rng.standard_normal(m) * np.exp(-t * 80) * 0.4)


def trem(ini, fim, int_ini, int_fim, tom=1900.0, vol=0.35):
    """sequência de cliques cujo intervalo vai de int_ini a int_fim (acelera ou desacelera)"""
    t = ini
    while t < fim:
        k = (t - ini) / max(1e-6, fim - ini)
        poe(clique(tom * (1 + 0.15 * k)), t, vol * (0.7 + 0.3 * k))
        t += int_ini + (int_fim - int_ini) * k


# 1. tampa abre e o azul pula (catraca acelerando), mordida e pouso
trem(0.15, 1.38, 0.09, 0.035, tom=1700)
poe(nhac(), 1.36, 0.6)
poe(batida(1.0), 1.42, 0.9)
trem(1.5, 1.85, 0.05, 0.09, tom=2300, vol=0.25)  # quique da placa
# 2. o rosa abre e pula
trem(2.0, 3.18, 0.085, 0.035, tom=1600)
poe(nhac(), 3.16, 0.6)
poe(batida(0.9), 3.22, 0.9)
trem(3.3, 3.6, 0.05, 0.09, tom=2300, vol=0.25)
# 3. encolhe (catraca desacelerando, tom subindo)
trem(3.9, 4.8, 0.035, 0.11, tom=2100, vol=0.3)
# 4. portinha e o rosa surge
trem(4.9, 5.15, 0.06, 0.06, tom=1300, vol=0.3)
poe(batida(1.4), 5.4, 0.55)
# 5. o azul cai (cliques acelerando na queda), pouso e quiques desacelerando até a emenda
trem(6.3, 6.93, 0.08, 0.03, tom=1500, vol=0.3)
poe(batida(1.0), 6.95, 1.0)
trem(7.05, 7.9, 0.07, 0.16, tom=2000, vol=0.28)

mix = mix / (np.abs(mix).max() + 1e-9) * 0.8
est = np.stack([mix, mix], axis=1)
with wave.open(os.path.join(saida, "som.wav"), "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((est * 32767).astype(np.int16).tobytes())
print("som.wav ok")
