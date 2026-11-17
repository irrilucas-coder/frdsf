import math, subprocess, wave, sys, random
import numpy as np
from PIL import Image, ImageDraw, ImageFont

OUT = sys.argv[1]
W, H, FPS, DUR = 1080, 1920, 30, 30.0
BPM = 120; BEAT = 60 / BPM
N = int(FPS * DUR)
F_BOLD = "/usr/share/fonts/opentype/inter/InterDisplay-Bold.otf"
F_XB = "/usr/share/fonts/opentype/inter/Inter-ExtraBold.otf"
F_MONO = "/usr/share/fonts/truetype/jetbrains-mono/JetBrainsMono-Bold.ttf"

ORANGE = (217, 119, 87); CREAM = (245, 240, 230); DARK = (20, 18, 16)
INK = (32, 28, 25); GREEN = (120, 220, 140)

_fonts = {}
def font(path, size):
    k = (path, size)
    if k not in _fonts: _fonts[k] = ImageFont.truetype(path, size)
    return _fonts[k]

_cache = {}
def text_img(txt, size, color, path=F_XB):
    k = (txt, size, color, path)
    if k not in _cache:
        f = font(path, size)
        x0, y0, x1, y1 = f.getbbox(txt)
        im = Image.new("RGBA", (x1 - x0 + 20, y1 - y0 + 20), (0, 0, 0, 0))
        ImageDraw.Draw(im).text((10 - x0, 10 - y0), txt, font=f, fill=color)
        _cache[k] = im
    return _cache[k]

def paste(canvas, im, cx, cy, scale=1.0, alpha=1.0):
    if scale <= 0.01 or alpha <= 0.01: return
    if abs(scale - 1) > 0.01:
        im = im.resize((max(1, int(im.width * scale)), max(1, int(im.height * scale))), Image.BILINEAR)
    if alpha < 1:
        a = im.getchannel("A").point(lambda v: int(v * alpha))
        im = im.copy(); im.putalpha(a)
    canvas.alpha_composite(im, (int(cx - im.width / 2), int(cy - im.height / 2)))

def clamp(x, a=0, b=1): return max(a, min(b, x))
def ease_out(t): t = clamp(t); return 1 - (1 - t) ** 3
def back(t):
    t = clamp(t); c1, c3 = 1.9, 2.9
    return 1 + c3 * (t - 1) ** 3 + c1 * (t - 1) ** 2

def bg(color):
    return Image.new("RGBA", (W, H), color + (255,))

# precomputed gradient bg
yy = np.linspace(0, 1, H)[:, None]
grad = (np.array(DARK) * (1 - yy[..., None] * 0.0) + np.array([40, 22, 14]) * yy[..., None]).astype(np.uint8)
grad = np.repeat(grad, W, axis=1)
GRAD = Image.fromarray(grad, "RGB").convert("RGBA")

def beat_pulse(t):
    ph = (t % BEAT) / BEAT
    return math.exp(-ph * 8)

def star(canvas, cx, cy, r, rot, color):
    d = ImageDraw.Draw(canvas)
    pts = []
    for i in range(16):
        ang = rot + i * math.pi / 8
        rr = r if i % 2 == 0 else r * 0.28
        pts.append((cx + rr * math.cos(ang), cy + rr * math.sin(ang)))
    d.polygon(pts, fill=color)

def rgb_split(canvas, amt):
    if amt < 1: return canvas
    r, g, b, a = canvas.split()
    from PIL import ImageChops
    r = ImageChops.offset(r, int(amt), 0); b = ImageChops.offset(b, -int(amt), 0)
    return Image.merge("RGBA", (r, g, b, a))

# ---------- scenes ----------
def s_intro(t, lt):  # 0-3
    c = bg(DARK)
    star(c, W / 2, 700, 160 * back(lt / 0.5), lt * 1.5, ORANGE)
    if lt < 1.5:
        paste(c, text_img("Oi.", 260, CREAM), W / 2, 1150, back((lt - 0.2) / 0.4))
    else:
        s = back((lt - 1.5) / 0.4)
        paste(c, text_img("Eu sou o", 110, CREAM, F_BOLD), W / 2, 1080, s)
        paste(c, text_img("Claude", 240, ORANGE), W / 2, 1260, back((lt - 1.75) / 0.4))
    return c

def s_anthropic(t, lt):  # 3-6
    c = bg(CREAM)
    words = [("uma IA", 0.0), ("criada pela", 0.5), ("Anthropic", 1.0)]
    for i, (w, st) in enumerate(words):
        col = ORANGE if i == 2 else INK
        size = 200 if i == 2 else 130
        e = ease_out((lt - st) / 0.35)
        paste(c, text_img(w, size, col), W / 2 + (1 - e) * 300, 760 + i * 230, 1, e)
    if lt > 2.0:
        paste(c, text_img("feita pra ajudar de verdade.", 62, INK, F_BOLD), W / 2, 1500, 1, ease_out((lt - 2.0) / 0.4))
    return c

def s_terminal(t, lt):  # 6-10
    c = GRAD.copy(); d = ImageDraw.Draw(c)
    x0, y0, x1, y1 = 80, 560, W - 80, 1360
    d.rounded_rectangle((x0, y0, x1, y1), 30, fill=(12, 12, 14), outline=(70, 60, 55), width=3)
    for i, col in enumerate([(255, 95, 86), (255, 189, 46), (39, 201, 63)]):
        d.ellipse((x0 + 40 + i * 50, y0 + 30, x0 + 70 + i * 50, y0 + 60), fill=col)
    f = font(F_MONO, 50)
    lines = [
        (0.0, "> edita meu video", CREAM, 1.0),
        (1.2, "  cortando silencios...", (170, 170, 170), 0.3),
        (1.7, "  gerando legendas...", (170, 170, 170), 0.3),
        (2.2, "  sincronizando musica...", (170, 170, 170), 0.3),
        (2.9, "  pronto. 30s, 9:16", GREEN, 0.3),
    ]
    y = y0 + 130
    for st, txt, col, dur in lines:
        if lt >= st:
            n = int(len(txt) * clamp((lt - st) / dur))
            d.text((x0 + 50, y), txt[:n], font=f, fill=col)
            if n < len(txt) or (st == lines[-1][0] and int(lt * 3) % 2 == 0):
                tw = f.getlength(txt[:n])
                d.rectangle((x0 + 52 + tw, y + 5, x0 + 80 + tw, y + 60), fill=ORANGE)
        y += 100
    return c

def s_verbs(t, lt):  # 10-14 : one word per beat
    verbs = ["ESCREVO", "PROGRAMO", "ANALISO", "PESQUISO", "TRADUZO", "CALCULO", "EDITO", "CRIO"]
    i = min(int(lt / BEAT), len(verbs) - 1)
    bl = lt - i * BEAT
    inv = i % 2 == 1
    c = bg(ORANGE if inv else DARK)
    col = DARK if inv else CREAM
    if i == len(verbs) - 1: c = bg(CREAM); col = ORANGE
    s = 1.2 - 0.2 * ease_out(bl / 0.25)
    im = text_img(verbs[i], 210, col)
    fit = min(1.0, 880 / im.width)
    paste(c, im, W / 2, H / 2, s * fit)
    paste(c, text_img(f"{i+1:02d}/08", 50, col, F_MONO), W / 2, H / 2 + 260, 1, 0.6)
    c = rgb_split(c, 18 * math.exp(-bl * 20))
    return c

def s_meta(t, lt):  # 14-18
    c = bg(DARK)
    if lt < 1.6:
        paste(c, text_img("Esse vídeo?", 170, CREAM), W / 2, H / 2, back(lt / 0.4))
    else:
        l2 = lt - 1.6
        paste(c, text_img("Eu que fiz.", 170, ORANGE), W / 2, 860, back(l2 / 0.35))
        paste(c, text_img("sem editor. só código.", 72, CREAM, F_BOLD), W / 2, 1080, 1, ease_out((l2 - 0.6) / 0.4))
    return c

def s_stats(t, lt):  # 18-23
    c = GRAD.copy()
    stats = [(900, "frames desenhados", 0.0), (1, "script Python", 0.9), (0, "cliques no mouse", 1.8)]
    for i, (v, lab, st) in enumerate(stats):
        e = ease_out((lt - st) / 0.6)
        if e <= 0: continue
        y = 560 + i * 380
        val = int(round(v * e)) if v > 1 else v
        paste(c, text_img(str(val), 220, ORANGE), W / 2, y, 1, e)
        paste(c, text_img(lab, 64, CREAM, F_BOLD), W / 2, y + 150, 1, e)
    if lt > 3.4:
        paste(c, text_img("(trilha também.)", 54, (170, 160, 150), F_BOLD), W / 2, 1720, 1, ease_out((lt - 3.4) / 0.4))
    return c

def s_cta1(t, lt):  # 23-27
    first = lt < 2.0
    c = bg(CREAM if first else ORANGE)
    if first:
        paste(c, text_img("Você grava.", 170, INK), W / 2, H / 2, back(lt / 0.35))
    else:
        paste(c, text_img("Eu edito.", 190, CREAM), W / 2, H / 2, back((lt - 2) / 0.35))
    return c

def s_end(t, lt):  # 27-30
    c = bg(DARK)
    star(c, W / 2, 720, 130 * back(lt / 0.5), lt * 0.8, ORANGE)
    paste(c, text_img("Claude", 230, CREAM), W / 2, 1060, back((lt - 0.2) / 0.4))
    paste(c, text_img("me manda seu vídeo →", 66, ORANGE, F_BOLD), W / 2, 1240, 1, ease_out((lt - 0.8) / 0.4))
    return c

SCENES = [(0, 3, s_intro), (3, 6, s_anthropic), (6, 10, s_terminal), (10, 14, s_verbs),
          (14, 18, s_meta), (18, 23, s_stats), (23, 27, s_cta1), (27, 30, s_end)]

def frame(i):
    t = i / FPS
    for a, b, fn in SCENES:
        if a <= t < b:
            lt = t - a
            c = fn(t, lt)
            # whip-in at scene start
            if lt < 0.12 and a > 0:
                off = int((1 - lt / 0.12) * 120)
                c = rgb_split(c, off / 4)
            break
    # beat zoom punch
    p = beat_pulse(t) * 0.025
    if t < 29.5 and p > 0.002:
        s = 1 + p
        big = c.resize((int(W * s), int(H * s)), Image.BILINEAR)
        l = (big.width - W) // 2; tp = (big.height - H) // 2
        c = big.crop((l, tp, l + W, tp + H))
    # progress bar
    d = ImageDraw.Draw(c)
    d.rectangle((0, H - 12, int(W * t / DUR), H), fill=ORANGE)
    # fade out
    if t > 29.4:
        a = clamp((t - 29.4) / 0.6)
        c = Image.blend(c, bg((0, 0, 0)), a)
    return c.convert("RGB")

# ---------- audio ----------
SR = 44100
n = int(SR * DUR)
audio = np.zeros(n)
tt = np.arange(n) / SR
def add(sig, start):
    s = int(start * SR); e = min(n, s + len(sig)); audio[s:e] += sig[:e - s]
kl = int(0.35 * SR); kt = np.arange(kl) / SR
kick = np.sin(2 * np.pi * (45 + 120 * np.exp(-kt * 30)) * kt) * np.exp(-kt * 9)
hl = int(0.06 * SR); hat = np.random.randn(hl) * np.exp(-np.arange(hl) / SR * 70) * 0.18
sl = int(0.2 * SR); snare = (np.random.randn(sl) * 0.5 + np.sin(2*np.pi*190*np.arange(sl)/SR)) * np.exp(-np.arange(sl) / SR * 18) * 0.45
bass_notes = [55, 55, 65.4, 49]  # A, A, C, G
nb = int(DUR / BEAT)
for b in range(nb):
    st = b * BEAT
    if st >= 29.4: break
    drop = st >= 10
    if b % 1 == 0 and (drop or b % 2 == 0): add(kick * 0.9, st)
    add(hat, st + BEAT / 2)
    if drop and b % 2 == 1: add(snare, st)
    if drop:
        f = bass_notes[(b // 4) % 4]
        bl = int(BEAT * SR); bt = np.arange(bl) / SR
        add(np.sign(np.sin(2*np.pi*f*bt)) * 0.12 * np.exp(-bt * 3), st)
# pad chords
for i, f in enumerate([220, 261.6, 329.6]):
    audio += 0.03 * np.sin(2 * np.pi * f * tt) * (0.6 + 0.4 * np.sin(2 * np.pi * 0.25 * tt))
# riser into drop (8-10s)
rl = int(2 * SR); rt = np.arange(rl) / SR
add(np.random.randn(rl) * (rt / 2) ** 2 * 0.25 + np.sin(2*np.pi*(200 + 800*rt/2)*rt) * (rt/2)**2 * 0.1, 8.0)
fade = np.clip((DUR - tt) / 0.8, 0, 1); audio *= fade
audio /= np.max(np.abs(audio)) * 1.1
wav = OUT + ".wav"
with wave.open(wav, "wb") as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((audio * 32767).astype(np.int16).tobytes())

# ---------- render ----------
p = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}",
                      "-r", str(FPS), "-i", "-", "-i", wav, "-c:v", "libx264", "-preset", "medium", "-crf", "20",
                      "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "160k", "-shortest", "-movflags", "+faststart", OUT],
                     stdin=subprocess.PIPE)
for i in range(N):
    p.stdin.write(frame(i).tobytes())
    if i % 150 == 0: print("frame", i, flush=True)
p.stdin.close(); p.wait()
print("done", p.returncode)
