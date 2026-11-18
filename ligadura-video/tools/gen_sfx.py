"""Gera public/sfx.wav: so efeitos sonoros (sem musica), sincronizados com src/timeline.json."""
import json, os, wave
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TL = json.load(open(os.path.join(ROOT, "src", "timeline.json")))
SR = 44100
n = int(TL["duration"] * SR)
out = np.zeros(n)
R = np.random.default_rng(11)

def add(sig, t, g=1.0):
    s = int(t * SR)
    if 0 <= s < n:
        e = min(n, s + len(sig)); out[s:e] += sig[: e - s] * g

def tt(d): return np.arange(int(d * SR)) / SR
def smooth(x, k): return np.convolve(x, np.ones(k) / k, "same")

t = tt(0.35); whoosh = smooth(R.standard_normal(len(t)), 12) * np.sin(np.pi * t / 0.35) ** 2
t = tt(0.12); pop = np.sin(2 * np.pi * (300 + 900 * np.exp(-t * 35)) * t) * np.exp(-t * 30)
t = tt(0.6); thud = np.sin(2 * np.pi * (55 + 90 * np.exp(-t * 12)) * t) * np.exp(-t * 7)
t = tt(0.5); ding = sum(np.sin(2 * np.pi * f * t) * np.exp(-t * 7) for f in (1318, 1976)) * 0.5
t = tt(0.25); snap = (R.standard_normal(len(t)) * np.exp(-t * 60) * 0.6 + np.sin(2 * np.pi * 180 * t) * np.exp(-t * 25))
t = tt(0.8); sparkle = sum(np.sin(2 * np.pi * f * t) * np.exp(-np.clip(t - d, 0, None) * 8) * (t >= d)
                          for f, d in [(2093, 0), (2637, .07), (3136, .14), (4186, .21)]) * 0.35
t = tt(0.05); tick = np.sin(2 * np.pi * 2500 * t) * np.exp(-t * 120)
t = tt(0.9); fall = np.sin(2 * np.pi * (900 * np.exp(-t * 2.5)) * t) * np.exp(-t * 2.5) * 0.5

for s in TL["scenes"][1:]:
    add(whoosh, s["from"] - 0.2, 0.5)
for l in TL["labels"]:
    add(pop, l["t"], 0.45)
for c in TL["checklist"]:
    add(ding, c["t"], 0.5)
E = TL["events"]
add(thud, E["scalpelX"], 0.9)
add(snap, E["bandSnap"], 0.9)
add(fall, E["detach"] - 0.05, 0.6); add(sparkle, E["detach"], 0.8)
add(sparkle, TL["checklist"][3]["t"], 0.7)
add(sparkle, TL["labels"][20]["t"], 0.8)
add(thud, E["endCard"], 0.7); add(sparkle, E["endCard"] + 0.4, 0.9)
# clock ticking in the consultorio scene, speeding up on "solo minutos"
clinic = TL["scenes"][3]; fast = TL["labels"][12]["t"]
x = clinic["from"] + 0.3
while x < clinic["to"] - 0.2:
    add(tick, x, 0.35); x += 0.5 if x < fast else 0.12
# walking footsteps
for x in np.arange(TL["scenes"][1]["from"] + 0.2, TL["scenes"][1]["to"], 0.39):
    add(thud[: int(0.12 * SR)], x, 0.25)
for x in np.arange(E["walkStart"], TL["scenes"][4]["to"], 0.31):
    add(thud[: int(0.12 * SR)], x, 0.25)

out *= np.clip((TL["duration"] - np.arange(n) / SR) / 0.5, 0, 1)
out /= np.abs(out).max() * 1.1
with wave.open(os.path.join(ROOT, "public", "sfx.wav"), "wb") as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((out * 32767).astype(np.int16).tobytes())
print("sfx ok")
