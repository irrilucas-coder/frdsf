"""Gera o video v2: narracao + legenda karaoke + simulacao de editor (estilo After Effects).
Uso: python3 make_video_v2.py narracao.wav saida.mp4
"""
import math, subprocess, wave, sys
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageChops

NARR, OUT = sys.argv[1], sys.argv[2]
W, H, FPS, DUR = 1080, 1920, 30, 25.0
N = int(FPS * DUR)
NO = 0.5  # narration offset (s)
BPM = 120; BEAT = 60 / BPM

F_BOLD = "/usr/share/fonts/opentype/inter/InterDisplay-Bold.otf"
F_XB = "/usr/share/fonts/opentype/inter/Inter-ExtraBold.otf"
F_SEMI = "/usr/share/fonts/opentype/inter/Inter-SemiBold.otf"
F_MONO = "/usr/share/fonts/truetype/jetbrains-mono/JetBrainsMono-Bold.ttf"

ORANGE = (217, 119, 87); CREAM = (245, 240, 230); DARK = (20, 18, 16); INK = (32, 28, 25)
GREEN = (110, 214, 140); PINK = (232, 92, 170); BLUE = (88, 120, 230); CYAN = (70, 190, 220)
YELLOW = (250, 210, 80); PANEL = (28, 28, 32); PANEL2 = (36, 36, 42); LINE = (58, 58, 66); MUTED = (140, 140, 150)

# ------------------------------------------------------------------ helpers
_fonts = {}
def font(p, s):
    k = (p, s)
    if k not in _fonts: _fonts[k] = ImageFont.truetype(p, s)
    return _fonts[k]

_cache = {}
def text_img(txt, size, color, path=F_XB, stroke=0, stroke_color=(0, 0, 0)):
    k = (txt, size, color, path, stroke, stroke_color)
    if k not in _cache:
        f = font(path, size)
        x0, y0, x1, y1 = f.getbbox(txt, stroke_width=stroke)
        im = Image.new("RGBA", (x1 - x0 + 20, y1 - y0 + 20), (0, 0, 0, 0))
        ImageDraw.Draw(im).text((10 - x0, 10 - y0), txt, font=f, fill=color,
                                stroke_width=stroke, stroke_fill=stroke_color)
        _cache[k] = im
    return _cache[k]

def paste(canvas, im, cx, cy, scale=1.0, alpha=1.0, rot=0):
    if scale <= 0.01 or alpha <= 0.01: return
    if abs(scale - 1) > 0.01:
        im = im.resize((max(1, int(im.width * scale)), max(1, int(im.height * scale))), Image.BILINEAR)
    if rot: im = im.rotate(rot, Image.BILINEAR, expand=True)
    if alpha < 0.99:
        im = im.copy(); im.putalpha(im.getchannel("A").point(lambda v: int(v * alpha)))
    canvas.alpha_composite(im, (int(cx - im.width / 2), int(cy - im.height / 2)))

def clamp(x, a=0.0, b=1.0): return max(a, min(b, x))
def ease_out(t): t = clamp(t); return 1 - (1 - t) ** 3
def ease_io(t): t = clamp(t); return t * t * (3 - 2 * t)
def back(t):
    t = clamp(t); c1, c3 = 1.9, 2.9
    return 1 + c3 * (t - 1) ** 3 + c1 * (t - 1) ** 2

def star(d, cx, cy, r, rot, color):
    pts = []
    for i in range(16):
        a = rot + i * math.pi / 8; rr = r if i % 2 == 0 else r * 0.28
        pts.append((cx + rr * math.cos(a), cy + rr * math.sin(a)))
    d.polygon(pts, fill=color)

def rgb_split(c, amt):
    if amt < 1: return c
    r, g, b, a = c.split()
    return Image.merge("RGBA", (ImageChops.offset(r, int(amt), 0), g, ImageChops.offset(b, -int(amt), 0), a))

# ------------------------------------------------------------------ narration timing
# speech segments (narration time) detected with ffmpeg silencedetect
SEGS = [
    (0.23, 0.45, "Oi!"),
    (0.92, 1.77, "Eu sou o Claude,"),
    (2.28, 5.15, "uma inteligência artificial criada pela Anthropic."),
    (5.36, 6.81, "Me pede pra editar um vídeo..."),
    (7.12, 8.56, "e eu corto, legendo"),
    (8.70, 9.98, "e sincronizo a música."),
    (10.21, 10.83, "Eu escrevo,"),
    (10.98, 11.49, "programo,"),
    (11.71, 12.63, "analiso e crio."),
    (13.01, 13.94, "E esse vídeo aqui?"),
    (14.43, 15.26, "Fui eu que fiz."),
    (15.61, 16.66, "Novecentos frames,"),
    (16.92, 17.50, "um script,"),
    (17.76, 18.52, "zero cliques."),
    (18.93, 19.50, "Você grava."),
    (20.00, 20.58, "Eu edito."),
    (21.05, 21.90, "Me manda o seu vídeo!"),
]
HILITE = {"claude", "anthropic", "editar", "corto", "legendo", "sincronizo", "escrevo", "programo",
          "analiso", "crio", "eu", "fiz", "novecentos", "script", "zero", "grava", "edito", "vídeo"}
WORDS = []  # (start, end, word)
for a, b, txt in SEGS:
    ws = txt.split(); tot = sum(len(w) + 1 for w in ws); t = a
    for w in ws:
        d = (b - a) * (len(w) + 1) / tot
        WORDS.append((t + NO, t + d + NO, w)); t += d
GROUPS = []  # list of lists of word idx
cur = []
for i, (s, e, w) in enumerate(WORDS):
    cur.append(i)
    if len(cur) == 3 or w[-1] in ",.!?" or (i + 1 < len(WORDS) and WORDS[i + 1][0] - e > 0.25):
        GROUPS.append(cur); cur = []
if cur: GROUPS.append(cur)

def T(seg_idx): return SEGS[seg_idx][0] + NO

# ------------------------------------------------------------------ preview scenes (1000x1000)
PV = 1000
def pv_bg(col): return Image.new("RGBA", (PV, PV), col + (255,))

def sc_hi(lt):
    c = pv_bg(DARK); d = ImageDraw.Draw(c)
    star(d, 500, 330, 150 * back(lt / 0.5), lt * 1.5, ORANGE)
    paste(c, text_img("Oi!", 230, CREAM), 500, 680, back((lt - 0.15) / 0.35))
    return c

def sc_logo(lt):
    c = pv_bg(DARK); d = ImageDraw.Draw(c)
    star(d, 500, 330, 120, 1.0 + lt * 1.2, ORANGE)
    paste(c, text_img("Claude", 190, CREAM), 500, 640, back(lt / 0.35))
    return c

def sc_ai(lt):
    c = pv_bg(CREAM); d = ImageDraw.Draw(c)
    for i in range(7):  # neural dots
        for j in range(7):
            ph = clamp((lt - (i + j) * 0.06) / 0.3)
            r = 9 * ease_out(ph)
            x, y = 230 + i * 90, 160 + j * 55
            if r > 0: d.ellipse((x - r, y - r, x + r, y + r), fill=ORANGE if (i * j) % 3 == 0 else INK)
    paste(c, text_img("IA", 260, INK), 500, 690, back((lt - 0.3) / 0.4))
    if lt > 1.6:
        paste(c, text_img("by Anthropic", 64, ORANGE, F_BOLD), 500, 860, 1, ease_out((lt - 1.6) / 0.3))
    return c

def sc_term(lt):
    c = pv_bg((14, 14, 16)); d = ImageDraw.Draw(c)
    d.rounded_rectangle((170, 220, 830, 800), 24, fill=(8, 8, 10), outline=LINE, width=3)
    for i, col in enumerate([(255, 95, 86), (255, 189, 46), (39, 201, 63)]):
        d.ellipse((200 + i * 40, 245, 224 + i * 40, 269), fill=col)
    f = font(F_MONO, 40)
    t0 = T(3) - T(3)
    steps = [(0.0, "> edita meu video", CREAM, 0.9),
             (T(4) - T(3) + 0.25, "  cortando...   ok", GREEN, 0.25),
             (T(4) - T(3) + 0.8, "  legendando... ok", GREEN, 0.25),
             (T(5) - T(3) + 0.1, "  musica...     ok", GREEN, 0.25)]
    y = 320
    for st, txt, col, du in steps:
        if lt >= st:
            n = int(len(txt) * clamp((lt - st) / du))
            d.text((210, y), txt[:n], font=f, fill=col)
            if n < len(txt):
                tw = f.getlength(txt[:n]); d.rectangle((212 + tw, y + 4, 234 + tw, y + 48), fill=ORANGE)
        y += 95
    return c

VERBS = [("ESCREVO", T(6) + 0.25 - NO), ("PROGRAMO", T(7) - NO), ("ANALISO", T(8) - NO), ("CRIO", T(8) + 0.62 - NO)]
def sc_verbs(lt, t):
    i = 0
    for k, (_, st) in enumerate(VERBS):
        if t >= st + NO - 0.05: i = k
    st = VERBS[i][1] + NO; bl = t - st
    inv = i % 2 == 1
    c = pv_bg(ORANGE if inv else DARK)
    col = DARK if inv else CREAM
    if i == 3: c = pv_bg(CREAM); col = ORANGE
    im = text_img(VERBS[i][0], 150, col)
    fit = min(1.0, 560 / im.width)
    paste(c, im, 500, 500, (1.12 - 0.12 * ease_out(bl / 0.2)) * fit)
    return rgb_split(c, 16 * math.exp(-max(bl, 0) * 18))

def sc_meta(lt, t):
    c = pv_bg(DARK)
    if t < T(10) - 0.05:
        paste(c, text_img("Esse", 150, CREAM), 500, 420, back(lt / 0.3))
        paste(c, text_img("vídeo?", 150, CREAM), 500, 590, back((lt - 0.2) / 0.3))
    else:
        l2 = t - T(10)
        paste(c, text_img("Eu que", 150, ORANGE), 500, 420, back(l2 / 0.3))
        paste(c, text_img("fiz.", 190, ORANGE), 500, 600, back((l2 - 0.25) / 0.3), rot=-4)
    return c

def sc_stats(lt, t):
    c = pv_bg((24, 20, 18))
    rows = [(900, "frames", T(11)), (1, "script", T(12)), (0, "cliques", T(13))]
    for k, (v, lab, st) in enumerate(rows):
        e = ease_out((t - st) / 0.45)
        if e <= 0: continue
        y = 260 + k * 250
        val = int(round(v * e)) if v > 1 else v
        paste(c, text_img(str(val), 150, ORANGE), 380, y, 1, e)
        paste(c, text_img(lab, 64, CREAM, F_BOLD), 640, y + 10, 1, e)
    return c

def sc_cta(lt, t):
    if t < T(15) - 0.05:
        c = pv_bg(CREAM)
        paste(c, text_img("Você", 170, INK), 500, 420, back(lt / 0.3))
        paste(c, text_img("grava.", 170, INK), 500, 600, back((lt - 0.15) / 0.3))
    else:
        c = pv_bg(ORANGE); l2 = t - T(15)
        paste(c, text_img("Eu", 170, CREAM), 500, 420, back(l2 / 0.3))
        paste(c, text_img("edito.", 190, CREAM), 500, 610, back((l2 - 0.15) / 0.3))
    return c

PSCENES = [  # (start video time, label, fn, kind)
    (0.0, "Oi!", sc_hi, 0), (T(1), "Logo", sc_logo, 0), (T(2), "IA", sc_ai, 0),
    (T(3) - 0.2, "Terminal", sc_term, 0), (T(6) - 0.1, "Verbos", sc_verbs, 1),
    (T(9) - 0.1, "Meta", sc_meta, 1), (T(11) - 0.2, "Números", sc_stats, 1),
    (T(14) - 0.15, "CTA", sc_cta, 1), (21.6, "Export", None, 0),
]
def preview(t):
    for k in range(len(PSCENES) - 1, -1, -1):
        st, _, fn, kind = PSCENES[k]
        if t >= st:
            if fn is None: fn, st, kind = sc_cta, PSCENES[k - 1][0], 1
            lt = t - st
            c = fn(lt, t) if kind else fn(lt)
            if lt < 0.1 and st > 0: c = rgb_split(c, 30 * (1 - lt / 0.1))
            return c

# ------------------------------------------------------------------ timeline model
TL_X0, TL_X1 = 200, 1060
TR_Y0, TR_H = 1300, 104
TRACKS = [("V3", "LEGENDA", PINK), ("V2", "MOTION", ORANGE), ("V1", "CENA", BLUE),
          ("A1", "VOZ", GREEN), ("A2", "TRILHA", CYAN)]
def tx(t): return TL_X0 + (TL_X1 - TL_X0) * t / DUR
def ty(tr): return TR_Y0 + tr * TR_H

CLIPS = []  # dict(track, s, e, label, agent)
for g in GROUPS:
    s, e = WORDS[g[0]][0], WORDS[g[-1]][1]
    CLIPS.append(dict(track=0, s=s, e=e, label=WORDS[g[0]][2], agent=1))
for k in range(len(PSCENES) - 1):
    CLIPS.append(dict(track=1, s=PSCENES[k][0], e=PSCENES[k + 1][0] - 0.04, label=PSCENES[k][1], agent=2))
for s, e, lab in [(0, 5.8, "intro"), (5.8, 13.4, "demo"), (13.4, 19.3, "prova"), (19.3, DUR, "final")]:
    CLIPS.append(dict(track=2, s=s, e=e - 0.04, label=lab, agent=0))
for a, b, txt in SEGS:
    CLIPS.append(dict(track=3, s=a + NO - 0.03, e=b + NO + 0.03, label="", agent=0))
CLIPS.append(dict(track=4, s=0.0, e=DUR, label="trilha_120bpm.wav", agent=3))

AGENTS = [("Claude · corte", GREEN), ("Claude · legenda", PINK), ("Claude · motion", ORANGE), ("Claude · trilha", CYAN)]
LEAD = 2.2
for c in CLIPS:
    c["b"] = max(0.15, c["s"] - LEAD)
# space builds per agent so cursors visibly travel
for ai in range(len(AGENTS)):
    lst = sorted([c for c in CLIPS if c["agent"] == ai], key=lambda c: c["b"])
    last = -1
    for c in lst:
        c["b"] = max(c["b"], last + 0.22); last = c["b"]
    AGENTS_L = lst
for ai in range(len(AGENTS)):
    pass

def agent_pos(ai, t):
    lst = sorted([c for c in CLIPS if c["agent"] == ai], key=lambda c: c["b"])
    home = (TL_X0 + 60 + ai * 150, 1270)
    prev = home
    for c in lst:
        tgt = (tx(c["s"]) + 6, ty(c["track"]) + TR_H * 0.55)
        if t < c["b"] - 0.3: return prev, False
        if t < c["b"]:
            k = ease_io((t - (c["b"] - 0.3)) / 0.3)
            return (prev[0] + (tgt[0] - prev[0]) * k, prev[1] + (tgt[1] - prev[1]) * k), True
        prev = tgt
    return prev, False

# narration waveform per pixel column of the A1 track
with wave.open(NARR) as wf:
    nsr = wf.getframerate(); nch = wf.getnchannels(); sw = wf.getsampwidth()
    raw = wf.readframes(wf.getnframes())
narr = np.frombuffer(raw, dtype=np.int16 if sw == 2 else np.int32).astype(np.float64)
if nch > 1: narr = narr.reshape(-1, nch).mean(axis=1)
narr /= (np.abs(narr).max() + 1e-9)
WAVE = {}
for x in range(TL_X0, TL_X1):
    t0 = (x - TL_X0) / (TL_X1 - TL_X0) * DUR - NO; t1 = t0 + DUR / (TL_X1 - TL_X0)
    a, b = int(max(0, t0) * nsr), int(max(0, t1) * nsr)
    seg = narr[a:b]
    WAVE[x] = float(np.sqrt((seg ** 2).mean())) if len(seg) else 0.0
wm = max(WAVE.values()) or 1
WAVE = {k: v / wm for k, v in WAVE.items()}

# ------------------------------------------------------------------ static UI
PX0, PY0 = 40, 130  # preview position
BASE = Image.new("RGBA", (W, H), (18, 18, 21, 255))
bd = ImageDraw.Draw(BASE)
bd.rectangle((0, 0, W, 104), fill=PANEL)
star(bd, 50, 52, 22, 0.3, ORANGE)
bd.text((86, 26), "Claude Studio", font=font(F_XB, 36), fill=CREAM)
bd.text((86, 68), "eu_sou_o_claude_v2.aep", font=font(F_SEMI, 22), fill=MUTED)
bd.line((0, 104, W, 104), fill=LINE, width=2)
bd.rectangle((PX0 - 4, PY0 - 4, PX0 + PV + 4, PY0 + PV + 4), outline=LINE, width=3)
bd.rectangle((0, 1140, W, 1240), fill=PANEL)
bd.rectangle((0, 1240, W, H), fill=PANEL2)
bd.rectangle((0, 1240, TL_X0, H), fill=PANEL)
for i, (code, name, col) in enumerate(TRACKS):
    y = ty(i)
    bd.line((0, y, W, y), fill=LINE, width=1)
    bd.rectangle((14, y + 22, 22, y + TR_H - 22), fill=col)
    bd.text((36, y + 24), code, font=font(F_XB, 26), fill=CREAM)
    bd.text((36, y + 58), name, font=font(F_SEMI, 20), fill=MUTED)
bd.line((0, ty(5), W, ty(5)), fill=LINE, width=1)
for s in range(0, int(DUR) + 1):  # ruler
    x = tx(s); big = s % 5 == 0
    bd.line((x, 1278 - (16 if big else 8), x, 1278), fill=MUTED if big else LINE, width=2)
    if big: bd.text((x + 4, 1244), f"00:{s:02d}", font=font(F_MONO, 18), fill=MUTED)
bd.text((24, 1258), "Linha do tempo", font=font(F_SEMI, 18), fill=MUTED)
bd.rectangle((0, 1830, W, H), fill=PANEL)
bd.text((24, 1856), "Render: 1080×1920 · 30fps · H.264", font=font(F_SEMI, 22), fill=MUTED)

def tc(t):
    f = int(round(t * FPS)); return f"00:00:{f // FPS:02d}:{f % FPS:02d}"

def draw_ui(t):
    c = BASE.copy(); d = ImageDraw.Draw(c)
    # agents indicator
    nact = sum(1 for ai in range(len(AGENTS)) if agent_pos(ai, t)[1]) or 1
    for i in range(4):
        on = (int(t * 4) + i) % 4 != 0
        d.ellipse((700 + i * 22, 44, 714 + i * 22, 58), fill=AGENTS[i][1] if on else LINE)
    d.text((800, 36), f"{max(nact, 2)} agentes ativos", font=font(F_SEMI, 24), fill=CREAM)
    # preview
    c.alpha_composite(preview(t), (PX0, PY0))
    # transport + properties
    d.text((40, 1152), tc(t), font=font(F_MONO, 34), fill=ORANGE)
    d.polygon([(470, 1156), (470, 1186), (496, 1171)], fill=CREAM)
    d.rectangle((420, 1158, 428, 1184), fill=MUTED); d.rectangle((538, 1158, 546, 1184), fill=MUTED)
    d.text((620, 1158), "100%  ·  Completa", font=font(F_SEMI, 24), fill=MUTED)
    pulse = math.exp(-((t % BEAT) / BEAT) * 6)
    props = [("Escala", f"{100 + 12 * pulse:5.1f}%"), ("Rotação", f"{3 * math.sin(t * 2):+4.1f}°"),
             ("Opac.", "100%"), ("Glitch", f"{int(40 * pulse):02d}")]
    for i, (k, v) in enumerate(props):
        x = 40 + i * 260
        d.polygon([(x, 1215), (x + 7, 1208), (x + 14, 1215), (x + 7, 1222)], fill=YELLOW if pulse > 0.5 else MUTED)
        d.text((x + 24, 1200), k, font=font(F_SEMI, 22), fill=MUTED)
        d.text((x + 24 + font(F_SEMI, 22).getlength(k) + 10, 1200), v, font=font(F_MONO, 22), fill=BLUE)
    # clips
    fl = font(F_SEMI, 18)
    for cl in CLIPS:
        if t < cl["b"]: continue
        k = ease_out((t - cl["b"]) / 0.18)
        col = TRACKS[cl["track"]][2]
        x0, x1 = tx(cl["s"]), tx(cl["e"])
        y0 = ty(cl["track"]) + 14; y1 = ty(cl["track"]) + TR_H - 14
        cy = (y0 + y1) / 2; hh = (y1 - y0) / 2 * k
        dark = tuple(int(v * 0.55) for v in col)
        d.rounded_rectangle((x0, cy - hh, max(x0 + 3, x1), cy + hh), 6, fill=dark, outline=col, width=2)
        if cl["track"] == 3 and k > 0.5:
            for x in range(int(x0) + 2, int(x1) - 1, 2):
                a = WAVE.get(x, 0) * (hh - 6)
                d.line((x, cy - a, x, cy + a), fill=col)
        elif cl["track"] == 4 and k > 0.5:
            for b in np.arange(0, DUR, BEAT):
                x = tx(b); d.line((x, cy - 10, x, cy + 10), fill=col, width=1)
            d.text((x0 + 10, y0 + 4), cl["label"], font=fl, fill=CREAM)
        elif cl["label"] and x1 - x0 > 34 and k > 0.8:
            lab = cl["label"]
            while lab and fl.getlength(lab) > x1 - x0 - 10: lab = lab[:-1]
            d.text((x0 + 6, y0 + 6), lab, font=fl, fill=CREAM)
        if cl["track"] == 1 and k > 0.8:
            for kx in (x0 + 8, (x0 + x1) / 2):
                d.polygon([(kx, y1 - 14), (kx + 6, y1 - 20), (kx + 12, y1 - 14), (kx + 6, y1 - 8)], fill=YELLOW)
    # playhead
    px = tx(t)
    d.line((px, 1250, px, 1830), fill=YELLOW, width=3)
    d.polygon([(px - 10, 1250), (px + 10, 1250), (px, 1266)], fill=YELLOW)
    # agent cursors
    fc = font(F_XB, 20)
    for ai, (name, col) in enumerate(AGENTS):
        (x, y), moving = agent_pos(ai, t)
        if t > 21.3: continue
        d.polygon([(x, y), (x, y + 30), (x + 8, y + 23), (x + 20, y + 24)], fill=col, outline=(0, 0, 0))
        tw = fc.getlength(name)
        bx = min(x + 16, W - tw - 30)
        d.rounded_rectangle((bx, y + 26, bx + tw + 20, y + 58), 10, fill=col)
        d.text((bx + 10, y + 29), name, font=fc, fill=DARK)
    return c

# ------------------------------------------------------------------ camera
PVC = (PX0 + PV / 2, PY0 + PV / 2)
FULL = (1.0, W / 2, H / 2)
PUNCH = (1.62, PVC[0], PVC[1])
TLV = (1.38, 600, 1560)
CAM = [  # (time, (scale, cx, cy))
    (0.0, PUNCH), (T(2) + 0.6, PUNCH), (T(2) + 1.0, FULL), (T(3) + 0.9, FULL), (T(4) - 0.1, TLV),
    (T(6) - 0.5, TLV), (T(6) - 0.15, PUNCH), (T(9) - 0.2, PUNCH), (T(9) + 0.15, FULL),
    (T(10) - 0.2, FULL), (T(10) + 0.05, PUNCH), (T(11) - 0.3, PUNCH), (T(11) + 0.1, FULL),
    (T(14) - 0.3, FULL), (T(14) - 0.05, PUNCH), (21.2, PUNCH), (21.55, FULL), (DUR, FULL),
]
def camera(t):
    for (t0, a), (t1, b) in zip(CAM, CAM[1:]):
        if t0 <= t <= t1:
            k = ease_io((t - t0) / (t1 - t0)) if t1 > t0 else 1
            sp = (abs(b[0] - a[0]) + abs(b[2] - a[2]) / 500) / max(t1 - t0, 0.01)
            return tuple(a[i] + (b[i] - a[i]) * k for i in range(3)), sp * math.sin(math.pi * clamp((t - t0) / (t1 - t0)))
    return CAM[-1][1], 0

def apply_cam(img, cam):
    s, cx, cy = cam
    w, h = W / s, H / s
    x0 = clamp(cx - w / 2, 0, W - w); y0 = clamp(cy - h / 2, 0, H - h)
    if s > 1.001: img = img.resize((W, H), Image.BILINEAR, box=(x0, y0, x0 + w, y0 + h))
    return img, (s, x0, y0)

# ------------------------------------------------------------------ captions (screen space)
def draw_caption(c, t, cam_t, end_mode):
    gi = None
    for k, g in enumerate(GROUPS):
        s = WORDS[g[0]][0] - 0.08; e = WORDS[g[-1]][1] + 0.12
        nxt = WORDS[GROUPS[k + 1][0]][0] - 0.08 if k + 1 < len(GROUPS) else e + 0.5
        if s <= t < min(max(e, s + 0.5), nxt): gi = k
    if gi is None: return
    g = GROUPS[gi]
    s0 = WORDS[g[0]][0] - 0.08
    pop = back((t - s0) / 0.22)
    s, x0, y0 = cam_t
    cy = 1500 if end_mode else min(1680, (PY0 + 860 - y0) * s)
    size = 92
    ims = []
    for i in g:
        ws, we, w = WORDS[i]
        active = ws - 0.03 <= t
        key = w.lower().strip(",.!?") in HILITE
        col = (ORANGE if key else YELLOW) if (ws - 0.03 <= t < we + 0.1) else CREAM
        ims.append((text_img(w.upper(), size, col, F_XB, stroke=7, stroke_color=(0, 0, 0)),
                    1.12 if (ws - 0.03 <= t < we + 0.1) else 1.0))
    GAP = 6
    total = sum(im.width * sc for im, sc in ims) + GAP * (len(ims) - 1)
    fit = min(1.0, (W - 80) / total)
    x = W / 2 - total * fit / 2
    for im, sc in ims:
        wpx = im.width * sc * fit
        cxw = W / 2 + (x + wpx / 2 - W / 2) * pop
        paste(c, im, cxw, cy, sc * fit * pop)
        x += wpx + GAP * fit

# ------------------------------------------------------------------ export + end card
def draw_export(c, t):
    k = ease_out((t - 21.6) / 0.25)
    if k <= 0: return
    d = ImageDraw.Draw(c)
    ov = Image.new("RGBA", (W, H), (0, 0, 0, int(140 * k))); c.alpha_composite(ov)
    bx0, by0, bx1, by1 = 140, 760, 940, 1100
    sc = 0.8 + 0.2 * back((t - 21.6) / 0.3)
    cxm, cym = (bx0 + bx1) / 2, (by0 + by1) / 2
    bx0, bx1 = cxm - (cxm - bx0) * sc, cxm + (bx1 - cxm) * sc
    by0, by1 = cym - (cym - by0) * sc, cym + (by1 - cym) * sc
    d.rounded_rectangle((bx0, by0, bx1, by1), 28, fill=PANEL, outline=LINE, width=3)
    p = clamp((t - 21.75) / 0.9)
    d.text((bx0 + 50, by0 + 44), "Exportando..." if p < 1 else "Pronto ✓", font=font(F_XB, 48), fill=CREAM if p < 1 else GREEN)
    d.rounded_rectangle((bx0 + 50, by0 + 150, bx1 - 50, by0 + 190), 20, fill=(50, 50, 58))
    d.rounded_rectangle((bx0 + 50, by0 + 150, bx0 + 50 + (bx1 - bx0 - 100) * p, by0 + 190), 20, fill=ORANGE)
    d.text((bx0 + 50, by0 + 220), f"{int(p * 100)}%  ·  claude_30s.mp4", font=font(F_MONO, 30), fill=MUTED)

END_T = 22.8
def end_card(t):
    lt = t - END_T
    c = Image.new("RGBA", (W, H), DARK + (255,)); d = ImageDraw.Draw(c)
    star(d, W / 2, 700, 150 * back(lt / 0.5), lt * 0.8, ORANGE)
    paste(c, text_img("Claude", 220, CREAM), W / 2, 1060, back((lt - 0.15) / 0.35))
    paste(c, text_img("me manda seu vídeo →", 64, ORANGE, F_BOLD), W / 2, 1240, 1, ease_out((lt - 0.6) / 0.4))
    return c

# ------------------------------------------------------------------ frame
def frame(i):
    t = i / FPS
    if t >= END_T:
        c = end_card(t)
        if t - END_T < 0.35:  # circle wipe
            ui = draw_ui(t); draw_export(ui, t)
            r = ease_io((t - END_T) / 0.35) * 1300
            m = Image.new("L", (W, H), 0); ImageDraw.Draw(m).ellipse((W / 2 - r, H / 2 - r, W / 2 + r, H / 2 + r), fill=255)
            c = Image.composite(c, ui, m)
        draw_caption(c, t, (1, 0, 0), True)
    else:
        ui = draw_ui(t)
        cam, speed = camera(t)
        c, cam_t = apply_cam(ui, cam)
        if speed > 0.5: c = rgb_split(c, min(24, speed * 3))
        draw_export(c, t)
        if t < 21.6: draw_caption(c, t, cam_t, False)
    if t > DUR - 0.5:
        c = Image.blend(c, Image.new("RGBA", (W, H), (0, 0, 0, 255)), clamp((t - (DUR - 0.5)) / 0.5))
    if t < 0.15:
        c = Image.blend(Image.new("RGBA", (W, H), (0, 0, 0, 255)), c, t / 0.15)
    return c.convert("RGB")

# ------------------------------------------------------------------ audio
SR = 44100; n = int(SR * DUR); tt = np.arange(n) / SR
music = np.zeros(n); sfx = np.zeros(n)
def add(buf, sig, start, g=1.0):
    s = int(start * SR)
    if s >= n: return
    e = min(n, s + len(sig)); buf[s:e] += sig[:e - s] * g
kl = int(0.35 * SR); kt = np.arange(kl) / SR
kick = np.sin(2 * np.pi * (45 + 120 * np.exp(-kt * 30)) * kt) * np.exp(-kt * 9)
hl = int(0.06 * SR); rng = np.random.default_rng(1)
hat = rng.standard_normal(hl) * np.exp(-np.arange(hl) / SR * 70) * 0.18
sl = int(0.2 * SR); snare = (rng.standard_normal(sl) * 0.5 + np.sin(2 * np.pi * 190 * np.arange(sl) / SR)) * np.exp(-np.arange(sl) / SR * 18) * 0.45
DROP = T(6) - 0.1
for b in range(int(DUR / BEAT)):
    st = b * BEAT
    if st >= END_T + 1.5: break
    drop = st >= DROP - 0.01
    if drop or b % 2 == 0: add(music, kick, st, 0.9)
    add(music, hat, st + BEAT / 2)
    if drop and b % 2 == 1: add(music, snare, st)
    if drop:
        f = [55, 55, 65.4, 49][(b // 4) % 4]; bl = int(BEAT * SR); bt = np.arange(bl) / SR
        add(music, np.sign(np.sin(2 * np.pi * f * bt)) * 0.12 * np.exp(-bt * 3), st)
for f in [220, 261.6, 329.6]:
    music += 0.03 * np.sin(2 * np.pi * f * tt) * (0.6 + 0.4 * np.sin(2 * np.pi * 0.25 * tt))
rl = int(1.5 * SR); rt = np.arange(rl) / SR
add(music, rng.standard_normal(rl) * (rt / 1.5) ** 2 * 0.25, DROP - 1.5)
# whooshes on camera moves + end impact
wl = int(0.4 * SR); wt = np.arange(wl) / SR
whoosh = rng.standard_normal(wl) * np.sin(np.pi * wt / 0.4) ** 2 * 0.35
whoosh = np.convolve(whoosh, np.ones(12) / 12, mode="same")
for (t0, a), (t1, b) in zip(CAM, CAM[1:]):
    if a != b and t1 - t0 < 1.2: add(sfx, whoosh, t0)
add(sfx, kick * 1.2, END_T); add(sfx, whoosh, END_T - 0.3)
cl = int(0.02 * SR); click = np.sin(2 * np.pi * 2400 * np.arange(cl) / SR) * np.exp(-np.arange(cl) / SR * 300) * 0.12
for c_ in CLIPS:
    if c_["track"] in (1, 2): add(sfx, click, c_["b"])
# narration (resample to SR)
nt = np.arange(len(narr)) / nsr
voice = np.interp(np.arange(int(len(narr) / nsr * SR)) / SR, nt, narr)
vbuf = np.zeros(n); add(vbuf, voice, NO)
env = np.convolve(np.abs(vbuf), np.ones(int(0.15 * SR)) / int(0.15 * SR), mode="same")
duck = 1 - 0.6 * np.clip(env / (env.max() + 1e-9) * 4, 0, 1)
music *= 0.55 * duck
mix = music + sfx + vbuf * 1.0
mix *= np.clip((DUR - tt) / 0.6, 0, 1)
mix /= np.max(np.abs(mix)) * 1.05
WAV = OUT + ".wav"
with wave.open(WAV, "wb") as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((mix * 32767).astype(np.int16).tobytes())

# ------------------------------------------------------------------ render
if len(sys.argv) > 3:  # preview frames only
    for fi in map(int, sys.argv[3].split(",")):
        frame(fi).save(f"{OUT}.f{fi}.png")
    sys.exit()
p = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}",
                      "-r", str(FPS), "-i", "-", "-i", WAV, "-c:v", "libx264", "-preset", "medium", "-crf", "20",
                      "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k", "-shortest", "-movflags", "+faststart", OUT],
                     stdin=subprocess.PIPE)
for i in range(N):
    p.stdin.write(frame(i).tobytes())
    if i % 150 == 0: print("frame", i, flush=True)
p.stdin.close(); p.wait()
print("done", p.returncode)
