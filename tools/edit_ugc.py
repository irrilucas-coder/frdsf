"""Edicao estilo retencao para video UGC falado: corta silencios, jump-cut zoom, impactos,
gancho de abertura, grade escuro + vinheta + grao. SEM legenda e SEM musica de fundo.
Uso: python3 edit_ugc.py entrada.mp4 pasta_trabalho saida.mp4 [frames_teste_saida]
"""
import math, subprocess, sys, wave, os
import numpy as np
from PIL import Image, ImageChops, ImageFilter

SRC, WD, OUT = sys.argv[1], sys.argv[2], sys.argv[3]
os.makedirs(WD, exist_ok=True)
W, H, FPS, SR = 1080, 1920, 24, 44100
END_SRC = 62.26
SIL = [(1.058, 1.584), (3.314, 3.702), (4.741, 5.123), (5.916, 6.441), (9.164, 9.785), (11.86, 12.44),
       (13.13, 13.51), (15.46, 15.94), (17.98, 18.66), (20.07, 20.54), (23.67, 24.23), (24.87, 25.34),
       (27.41, 27.95), (30.80, 31.25), (33.18, 34.01), (36.20, 36.72), (38.84, 39.40), (42.38, 42.83),
       (43.71, 44.25), (44.78, 45.38), (48.12, 48.76), (50.55, 51.08), (55.20, 55.75), (59.05, 59.67)]
PRE, POST = 0.05, 0.08

# ---------------------------------------------------------------- segments (source times)
segs, cur = [], 0.0
for a, b in SIL:
    segs.append((max(0, cur - PRE), a + POST)); cur = b
segs.append((cur - PRE, END_SRC))
segs = [(round(a * FPS) / FPS, round(b * FPS) / FPS) for a, b in segs]

HOOK = (58.25, 58.95)  # flash-forward abertura (sem audio da fala)

def region(ts):
    """centro de zoom (x, y) e zoom base por trecho do video."""
    if ts < 25.2: return (540, 640), 1.0
    if ts < 34.5: return (540, 1080), 1.0
    if ts < 45.2: return (640, 1150), 1.0
    if ts < 51.0: return (560, 760), 1.0
    if ts < 57.5: return (540, 900), 1.0
    return (540, 1000), 1.0
PUNCH = [1.0, 1.12, 1.04, 1.18, 1.0, 1.1, 1.15, 1.05]
IMPACT_SRC = [25.29, 36.67, 45.33, 55.70, 59.62]  # revelacao, mistura, bebe, resultado, final

# timeline: list of (src_start, src_end, seg_kind, zoom, idx)
plan = [(HOOK[0], HOOK[1], "hook", 1.35, -1)]
for i, (a, b) in enumerate(segs):
    plan.append((a, b, "main", PUNCH[i % len(PUNCH)], i))
out_t, timeline = 0.0, []
for a, b, kind, z, i in plan:
    timeline.append(dict(a=a, b=b, kind=kind, z=z, i=i, o=out_t)); out_t += b - a
TOTAL = out_t
impacts_out = [0.0]
for it in IMPACT_SRC:
    for seg in timeline[1:]:
        if seg["a"] - 0.02 <= it <= seg["b"]: impacts_out.append(seg["o"] + it - seg["a"])
impacts_out.append(timeline[1]["o"])  # entrada no video depois do gancho
print(f"{len(segs)} trechos, duracao {TOTAL:.2f}s (original {END_SRC:.2f}s)")

# ---------------------------------------------------------------- look
yy, xx = np.mgrid[0:H, 0:W]
r = np.sqrt(((xx - W / 2) / (W / 2)) ** 2 + ((yy - H * 0.45) / (H / 2)) ** 2)
VIG = np.clip(1 - 0.55 * np.clip(r - 0.45, 0, None) ** 1.6, 0.25, 1)[..., None].astype(np.float32)
x = np.arange(256) / 255.0
curve = np.clip(0.5 + (x - 0.5) * 1.22, 0, 1) ** 1.12               # contraste + sombras mais densas
LUT = (curve * 255).astype(np.uint8)
RNG = np.random.default_rng(5)
GRAIN = [RNG.normal(0, 4, (H // 2, W // 2, 1)).astype(np.float32).repeat(2, 0).repeat(2, 1) for _ in range(6)]

def grade(img, fi):
    a = np.asarray(img.convert("RGB"))
    a = LUT[a].astype(np.float32)
    g = a.mean(axis=2, keepdims=True)
    a = g + (a - g) * 0.86                                          # menos saturacao
    a[..., 0] *= 0.97; a[..., 2] *= 1.02                            # leve frio nas sombras
    a = a + GRAIN[fi % 6]
    return Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))

def zoom(img, s, cx, cy, dx=0, dy=0):
    w, h = W / s, H / s
    x0 = min(max(cx - w / 2 + dx, 0), W - w); y0 = min(max(cy - h / 2 + dy, 0), H - h)
    return img.resize((W, H), Image.BILINEAR, box=(x0, y0, x0 + w, y0 + h))

def rgb_split(img, amt):
    if amt < 1: return img
    r_, g_, b_ = img.split()
    return Image.merge("RGB", (ImageChops.offset(r_, int(amt), 0), g_, ImageChops.offset(b_, -int(amt), 0)))

def ease(t): t = min(max(t, 0), 1); return 1 - (1 - t) ** 3

def fx(img, seg, lt, ot, fi):
    (cx, cy), _ = region(seg["a"] + lt)
    dur = seg["b"] - seg["a"]
    if seg["kind"] == "hook":
        s = 1.35 - 0.25 * ease(lt / dur); cx, cy = 540, 1000
    else:
        s = seg["z"] * (1 + 0.025 * lt)                             # push-in lento dentro do trecho
    # punch nos impactos
    dx = dy = 0
    for it in impacts_out:
        d = ot - it
        if 0 <= d < 0.35:
            s *= 1 + 0.12 * (1 - ease(d / 0.35))
            amp = 10 * (1 - d / 0.35) ** 2; dx = amp * math.sin(ot * 95); dy = amp * math.cos(ot * 77)
    # enfase (picos de voz): punch curto
    for et in EMPH:
        d = ot - et
        if 0 <= d < 0.25:
            s *= 1 + 0.06 * (1 - ease(d / 0.25))
    # transicao em todo jump cut: zoom-in rapido + smear alternando direcao
    cut_p = 0.0
    if seg["kind"] == "main" and seg["i"] > 0 and lt < 0.1:
        cut_p = (1 - lt / 0.1) ** 2; s *= 1 + 0.06 * cut_p
    if seg["kind"] == "hook":
        img = img.rotate(-5 * (1 - ease(lt / dur)), Image.BILINEAR, center=(540, 1000))
    img = zoom(img, s, cx, cy, dx, dy)
    if cut_p > 0:
        sgn = 1 if seg["i"] % 2 else -1; sm = img
        for k in (1, 2):
            sm = Image.blend(sm, ImageChops.offset(img, int(sgn * 30 * cut_p * k), 0), 0.35)
        img = rgb_split(sm, 6 * cut_p)
    # brilho (bloom) nos trechos de produto
    ts = seg["a"] + lt
    if 25.3 <= ts < 34.5 or ts >= 57.5 or seg["kind"] == "hook":
        small = img.resize((270, 480), Image.BILINEAR).filter(ImageFilter.GaussianBlur(8))
        small = small.point(lambda v: int(max(0, v - 130) * 1.6))
        img = ImageChops.screen(img, small.resize((W, H), Image.BILINEAR))
    # whip / smear nos primeiros frames de trechos com impacto
    for it in impacts_out:
        d = ot - it
        if 0 <= d < 0.12:
            p = 1 - d / 0.12
            sm = img
            for k in (1, 2, 3):
                sm = Image.blend(sm, ImageChops.offset(img, int(-70 * p * k / 3), 0), 0.33)
            img = rgb_split(sm, 16 * p)
    img = grade(img, fi)
    for it in impacts_out[:2] + [impacts_out[1 + 0]]:  # flash: abertura e revelacao
        d = ot - it
        if 0 <= d < 0.08: img = Image.blend(img, Image.new("RGB", (W, H), (255, 255, 255)), 0.6 * (1 - d / 0.08))
    if seg["kind"] == "hook" and lt > dur - 0.1:
        img = Image.blend(img, Image.new("RGB", (W, H), (0, 0, 0)), (lt - (dur - 0.1)) / 0.1)
    return img

# ---------------------------------------------------------------- audio
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", SRC, "-ac", "1", "-ar", str(SR), f"{WD}/src.wav"], check=True)
with wave.open(f"{WD}/src.wav") as w:
    src = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float32) / 32768
n = int(TOTAL * SR) + 1
aud = np.zeros(n, np.float32); sfx = np.zeros(n, np.float32)
fade = int(0.006 * SR)
for seg in timeline:
    if seg["kind"] == "hook": continue
    x_ = src[int(seg["a"] * SR):int(seg["b"] * SR)].copy()
    x_[:fade] *= np.linspace(0, 1, fade); x_[-fade:] *= np.linspace(1, 0, fade)
    s0 = int(seg["o"] * SR); aud[s0:s0 + len(x_)] += x_[:n - s0]
# picos de voz -> momentos de enfase
win = int(0.1 * SR); nw = len(aud) // win
rms = np.sqrt((aud[:nw * win].reshape(nw, win) ** 2).mean(1))
thr = np.percentile(rms[rms > 0.01], 88)
EMPH = []
for k in np.argsort(-rms):
    if rms[k] < thr: break
    tk = k * 0.1
    if tk < timeline[1]["o"] + 0.5 or any(abs(tk - e) < 2.2 for e in EMPH) or any(abs(tk - e) < 0.8 for e in impacts_out): continue
    EMPH.append(tk)
EMPH.sort(); print("enfases:", len(EMPH))
def add(sig, t, g=1.0):
    s0 = int(t * SR)
    if 0 <= s0 < n: e = min(n, s0 + len(sig)); sfx[s0:e] += sig[:e - s0] * g
wl = int(0.3 * SR); wt = np.arange(wl) / SR
whoosh = np.convolve(RNG.standard_normal(wl) * np.sin(np.pi * wt / 0.3) ** 2, np.ones(14) / 14, "same").astype(np.float32)
bl = int(0.6 * SR); bt = np.arange(bl) / SR
boom = (np.sin(2 * np.pi * (42 + 70 * np.exp(-bt * 9)) * bt) * np.exp(-bt * 6)).astype(np.float32)
add(boom, 0.0, 0.5); add(whoosh, timeline[1]["o"] - 0.15, 0.25)
for it in impacts_out[1:-1]: add(whoosh, it - 0.15, 0.22); add(boom, it, 0.3)
# swish curto em todo jump cut (pitch alternado)
sl = int(0.14 * SR); st_ = np.arange(sl) / SR
for seg in timeline[2:]:
    hp = RNG.standard_normal(sl); hp = hp - np.convolve(hp, np.ones(4 if seg["i"] % 2 else 9) / (4 if seg["i"] % 2 else 9), "same")
    add((hp * np.sin(np.pi * st_ / 0.14) ** 2).astype(np.float32), seg["o"] - 0.06, 0.11)
# pop nas enfases
pl = int(0.09 * SR); pt = np.arange(pl) / SR
pop = (np.sin(2 * np.pi * (180 + 500 * np.exp(-pt * 40)) * pt) * np.exp(-pt * 35)).astype(np.float32)
for et in EMPH: add(pop, et, 0.25)
# riser antes da revelacao
rl = int(1.3 * SR); rt = np.arange(rl) / SR
riser = (RNG.standard_normal(rl) * (rt / 1.3) ** 2.5 * 0.5 + np.sin(2 * np.pi * (200 + 700 * (rt / 1.3) ** 2) * rt) * (rt / 1.3) ** 2 * 0.25).astype(np.float32)
add(riser, impacts_out[1] - 1.3, 0.35)
# brilho (sparkle) nos momentos de produto
kl = int(0.5 * SR); kt = np.arange(kl) / SR
sparkle = sum(np.sin(2 * np.pi * f * kt) * np.exp(-(kt - d0).clip(0) * 9) * (kt >= d0)
              for f, d0 in [(2093, 0), (2637, 0.06), (3136, 0.12), (4186, 0.18)]).astype(np.float32) * 0.12
for t_ in [0.05, impacts_out[1] + 0.05, impacts_out[-2] + 0.05]: add(sparkle, t_, 0.8)
# whoosh grande + shutter no final
add(whoosh, TOTAL - 0.35, 0.3)
mix = aud + sfx
mix /= max(1e-6, np.abs(mix).max()) / 0.95
with wave.open(f"{WD}/out.wav", "wb") as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((mix * 32767).astype(np.int16).tobytes())

# ---------------------------------------------------------------- video
def seg_frames(seg):
    nfr = int(round((seg["b"] - seg["a"]) * FPS))
    p = subprocess.Popen(["ffmpeg", "-v", "error", "-ss", f"{seg['a']:.4f}", "-i", SRC, "-frames:v", str(nfr),
                          "-vf", f"scale={W}:{H}", "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], stdout=subprocess.PIPE)
    for k in range(nfr):
        buf = p.stdout.read(W * H * 3)
        if len(buf) < W * H * 3: break
        yield k, Image.frombuffer("RGB", (W, H), buf, "raw", "RGB", 0, 1)
    p.stdout.close(); p.wait()

test = set(map(float, sys.argv[4].split(","))) if len(sys.argv) > 4 else None
enc = None
if not test:
    enc = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", str(FPS),
                            "-i", "-", "-i", f"{WD}/out.wav", "-c:v", "libx264", "-preset", "medium", "-crf", "19",
                            "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k", "-shortest", "-movflags", "+faststart", OUT],
                           stdin=subprocess.PIPE)
fi = 0
for seg in timeline:
    if test and not any(seg["o"] <= tt < seg["o"] + seg["b"] - seg["a"] for tt in test):
        fi += int(round((seg["b"] - seg["a"]) * FPS)); continue
    for k, img in seg_frames(seg):
        ot = seg["o"] + k / FPS
        if test:
            if any(abs(ot - tt) < 0.5 / FPS for tt in test): fx(img, seg, k / FPS, ot, fi).save(f"{WD}/t{ot:.2f}.png")
        else:
            enc.stdin.write(fx(img, seg, k / FPS, ot, fi).tobytes())
        fi += 1
if enc: enc.stdin.close(); enc.wait(); print("done", enc.returncode)
