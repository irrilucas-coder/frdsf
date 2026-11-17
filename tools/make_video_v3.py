"""Video v3: voz robotica (espeak-ng), sem legenda, cortes na batida + simulacao de editor.
Uso: python3 make_video_v3.py pasta_trabalho saida.mp4 [frames_de_teste]
"""
import math, os, subprocess, wave, sys
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageChops, ImageFilter

WD, OUT = sys.argv[1], sys.argv[2]
os.makedirs(WD, exist_ok=True)
W, H, FPS, DUR = 1080, 1920, 30, 25.0
N = int(FPS * DUR)
BPM = 120; BEAT = 0.5; DROP = 9.0

F_XB = "/usr/share/fonts/opentype/inter/Inter-ExtraBold.otf"
F_BOLD = "/usr/share/fonts/opentype/inter/InterDisplay-Bold.otf"
F_SEMI = "/usr/share/fonts/opentype/inter/Inter-SemiBold.otf"
F_MONO = "/usr/share/fonts/truetype/jetbrains-mono/JetBrainsMono-Bold.ttf"
ORANGE = (217, 119, 87); CREAM = (245, 240, 230); DARK = (16, 15, 14); INK = (32, 28, 25)
GREEN = (110, 214, 140); PINK = (232, 92, 170); BLUE = (88, 120, 230); CYAN = (70, 190, 220)
YELLOW = (250, 210, 80); RED = (235, 60, 60); PANEL = (28, 28, 32); PANEL2 = (36, 36, 42)
LINE = (58, 58, 66); MUTED = (140, 140, 150)

# ================================================================ voice
LINES = [  # (start, text)
    (1.0, "Oi."), (2.0, "Eu sou o Claude."), (4.0, "E esse vídeo aqui?"), (6.0, "Fui eu que editei."),
    (7.6, "Sozinho."), (9.0, "Corte."), (10.0, "Trilha."), (11.0, "Efeito."), (12.0, "Tudo no automático."),
    (14.0, "Eu escrevo."), (15.0, "Eu programo."), (16.0, "Eu crio."), (17.5, "Você só grava."),
    (19.0, "O resto?"), (20.0, "É comigo."), (21.6, "Me manda o seu vídeo."),
]
SR = 44100

def load_wav(p):
    with wave.open(p) as w:
        sr = w.getframerate(); x = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(float) / 32768
    return np.interp(np.arange(int(len(x) / sr * SR)) / SR, np.arange(len(x)) / sr, x)

def robot(x):
    t = np.arange(len(x)) / SR
    x = 0.55 * x + 0.45 * x * np.sin(2 * np.pi * 55 * t)          # ring mod
    q = 2 ** 7; x = np.round(x * q) / q                          # bitcrush
    d = int(0.045 * SR); y = x.copy(); y[d:] += 0.35 * x[:-d]    # metallic slapback
    d2 = int(0.011 * SR); y[d2:] += 0.3 * x[:-d2]                # comb / flanger-ish
    return y

voice = np.zeros(int(SR * DUR))
for i, (st, txt) in enumerate(LINES):
    p = f"{WD}/l{i}.wav"
    subprocess.run(["espeak-ng", "-v", "pt-br+m3", "-s", "165", "-p", "30", "-w", p, txt], check=True)
    x = load_wav(p)
    nz = np.where(np.abs(x) > 0.02)[0]; x = x[nz[0]:nz[-1] + 1]
    x = robot(x)
    s = int(st * SR); e = min(len(voice), s + len(x)); voice[s:e] += x[:e - s]
voice /= np.abs(voice).max() + 1e-9

# ================================================================ helpers
_f = {}
def font(p, s):
    if (p, s) not in _f: _f[(p, s)] = ImageFont.truetype(p, s)
    return _f[(p, s)]
_c = {}
def timg(txt, size, color, path=F_XB):
    k = (txt, size, color, path)
    if k not in _c:
        f = font(path, size); x0, y0, x1, y1 = f.getbbox(txt)
        im = Image.new("RGBA", (x1 - x0 + 20, y1 - y0 + 20), (0, 0, 0, 0))
        ImageDraw.Draw(im).text((10 - x0, 10 - y0), txt, font=f, fill=color); _c[k] = im
    return _c[k]
def paste(c, im, cx, cy, s=1.0, a=1.0, rot=0):
    if s <= 0.01 or a <= 0.01: return
    if abs(s - 1) > 0.01: im = im.resize((max(1, int(im.width * s)), max(1, int(im.height * s))), Image.BILINEAR)
    if rot: im = im.rotate(rot, Image.BILINEAR, expand=True)
    if a < 0.99: im = im.copy(); im.putalpha(im.getchannel("A").point(lambda v: int(v * a)))
    c.alpha_composite(im, (int(cx - im.width / 2), int(cy - im.height / 2)))
def word(c, txt, size, color, cx, cy, s=1.0, a=1.0, rot=0, maxw=960, path=F_XB):
    im = timg(txt, size, color, path); fit = min(1.0, maxw / im.width); paste(c, im, cx, cy, s * fit, a, rot)
def clamp(x, a=0.0, b=1.0): return max(a, min(b, x))
def eo(t): t = clamp(t); return 1 - (1 - t) ** 3
def eio(t): t = clamp(t); return t * t * (3 - 2 * t)
def back(t):
    t = clamp(t); return 1 + 2.9 * (t - 1) ** 3 + 1.9 * (t - 1) ** 2
def bg(col): return Image.new("RGBA", (W, H), col + (255,))
def star(d, cx, cy, r, rot, col):
    d.polygon([(cx + (r if i % 2 == 0 else r * .28) * math.cos(rot + i * math.pi / 8),
                cy + (r if i % 2 == 0 else r * .28) * math.sin(rot + i * math.pi / 8)) for i in range(16)], fill=col)
def rgb_split(c, amt, vert=False):
    if abs(amt) < 1: return c
    r, g, b, a = c.split(); dx, dy = (0, int(amt)) if vert else (int(amt), 0)
    return Image.merge("RGBA", (ImageChops.offset(r, dx, dy), g, ImageChops.offset(b, -dx, -dy), a))
def zoom(c, s, cx=W / 2, cy=H / 2, rot=0):
    if rot: c = c.rotate(rot, Image.BILINEAR, center=(cx, cy), fillcolor=(0, 0, 0))
    s = max(s, 1.0)
    if abs(s - 1) < 0.002: return c
    w, h = W / s, H / s; x0 = clamp(cx - w / 2, 0, W - w) if s > 1 else cx - w / 2
    y0 = clamp(cy - h / 2, 0, H - h) if s > 1 else cy - h / 2
    return c.resize((W, H), Image.BILINEAR, box=(x0, y0, x0 + w, y0 + h))
def grid(d, col, step=90, off=0):
    for x in range(-step, W + step, step): d.line((x + off % step, 0, x + off % step, H), fill=col, width=1)
    for y in range(-step, H + step, step): d.line((0, y + off % step, W, y + off % step), fill=col, width=1)

# ================================================================ editor UI
TL_X0, TL_X1, TR_Y0, TR_H = 200, 1060, 1300, 104
TRACKS = [("V3", "TEXTO", PINK), ("V2", "MOTION", ORANGE), ("V1", "CENA", BLUE), ("A1", "VOZ", GREEN), ("A2", "TRILHA", CYAN)]
def tx(u): return TL_X0 + (TL_X1 - TL_X0) * u
def ty(i): return TR_Y0 + i * TR_H
rng = np.random.default_rng(7)
CLIPS = []  # (track, u0, u1, label, order)
lab = {0: ["oi", "claude", "vídeo", "editei", "sozinho", "corte", "trilha", "efeito", "auto", "crio", "grava", "comigo"],
       1: ["boot", "logo", "reveal", "glitch", "zoom", "shake", "flash", "whip", "end"], 2: ["intro", "demo", "prova", "final"]}
for tr in range(5):
    if tr == 4: CLIPS.append((4, 0.0, 1.0, "trilha_120bpm.wav")); continue
    if tr == 3:
        for st, txt in LINES: CLIPS.append((3, st / DUR, (st + 0.25 + len(txt) * 0.055) / DUR, ""))
        continue
    names = lab[tr]; n = len(names); u = 0.0
    for k, nm in enumerate(names):
        w = (1.0 / n) * (0.7 + 0.6 * rng.random()); u1 = min(1.0, u + w)
        CLIPS.append((tr, u, u1 - 0.004, nm)); u = u1
        if u >= 1: break
ORDER = sorted(range(len(CLIPS)), key=lambda i: (CLIPS[i][1], CLIPS[i][0]))
RANK = {ci: r / len(CLIPS) for r, ci in enumerate(ORDER)}
VW = np.array([np.sqrt(np.mean(voice[int(DUR * SR * (x - TL_X0) / (TL_X1 - TL_X0)):
                                     int(DUR * SR * (x + 2 - TL_X0) / (TL_X1 - TL_X0))] ** 2) + 1e-12)
               for x in range(TL_X0, TL_X1)]); VW /= VW.max()

BASE = bg((18, 18, 21)); bd = ImageDraw.Draw(BASE)
bd.rectangle((0, 0, W, 104), fill=PANEL); star(bd, 50, 52, 22, .3, ORANGE)
bd.text((86, 26), "Claude Studio", font=font(F_XB, 36), fill=CREAM)
bd.text((86, 68), "eu_sou_o_claude_v3.aep", font=font(F_SEMI, 22), fill=MUTED)
bd.rectangle((36, 126, 1044, 1134), outline=LINE, width=3)
bd.rectangle((0, 1140, W, 1240), fill=PANEL); bd.rectangle((0, 1240, W, H), fill=PANEL2); bd.rectangle((0, 1240, TL_X0, H), fill=PANEL)
for i, (code, name, col) in enumerate(TRACKS):
    y = ty(i); bd.line((0, y, W, y), fill=LINE); bd.rectangle((14, y + 22, 22, y + TR_H - 22), fill=col)
    bd.text((36, y + 24), code, font=font(F_XB, 26), fill=CREAM); bd.text((36, y + 58), name, font=font(F_SEMI, 20), fill=MUTED)
for s in range(26):
    x = tx(s / DUR); big = s % 5 == 0
    bd.line((x, 1278 - (16 if big else 8), x, 1278), fill=MUTED if big else LINE, width=2)
    if big: bd.text((x + 4, 1244), f"00:{s:02d}", font=font(F_MONO, 18), fill=MUTED)
bd.rectangle((0, 1830, W, H), fill=PANEL); bd.text((24, 1856), "Render: 1080×1920 · 30fps · H.264", font=font(F_SEMI, 22), fill=MUTED)
AG = [("Claude · corte", GREEN), ("Claude · texto", PINK), ("Claude · motion", ORANGE), ("Claude · trilha", CYAN)]

def editor(t, build, playhead, preview_img, blade=None):
    """build: 0..1 fraction of clips placed. playhead: 0..1."""
    c = BASE.copy(); d = ImageDraw.Draw(c)
    for i in range(4):
        d.ellipse((700 + i * 22, 44, 714 + i * 22, 58), fill=AG[i][1] if (int(t * 6) + i) % 4 else LINE)
    d.text((800, 36), "4 agentes ativos", font=font(F_SEMI, 24), fill=CREAM)
    c.alpha_composite(preview_img, (40, 130))
    f = int(playhead * DUR * FPS)
    d.text((40, 1152), f"00:00:{f // FPS:02d}:{f % FPS:02d}", font=font(F_MONO, 34), fill=ORANGE)
    d.polygon([(470, 1156), (470, 1186), (496, 1171)], fill=CREAM)
    pul = math.exp(-((t % BEAT) / BEAT) * 6)
    for i, (k, v) in enumerate([("Escala", f"{100 + 14 * pul:5.1f}%"), ("Rot.", f"{4 * math.sin(t * 3):+4.1f}°"),
                                ("Glitch", f"{int(60 * pul):02d}"), ("Blur", f"{int(30 * pul):02d}")]):
        x = 40 + i * 260
        d.polygon([(x, 1215), (x + 7, 1208), (x + 14, 1215), (x + 7, 1222)], fill=YELLOW if pul > .5 else MUTED)
        d.text((x + 24, 1200), k, font=font(F_SEMI, 22), fill=MUTED)
        d.text((x + 34 + font(F_SEMI, 22).getlength(k), 1200), v, font=font(F_MONO, 22), fill=BLUE)
    fl = font(F_SEMI, 18); last = {}
    for ci, (tr, u0, u1, nm) in enumerate(CLIPS):
        r = RANK[ci]
        if build < r: continue
        k = eo((build - r) * 30)
        col = TRACKS[tr][2]; x0, x1 = tx(u0), tx(u1); y0, y1 = ty(tr) + 14, ty(tr) + TR_H - 14
        cy = (y0 + y1) / 2; hh = (y1 - y0) / 2 * k
        d.rounded_rectangle((x0, cy - hh, max(x0 + 3, x1), cy + hh), 6, fill=tuple(int(v * .55) for v in col), outline=col, width=2)
        if tr == 3 and k > .5:
            for x in range(int(x0) + 1, int(x1), 2):
                a = VW[min(len(VW) - 1, x - TL_X0)] * (hh - 6); d.line((x, cy - a, x, cy + a), fill=col)
        elif tr == 4 and k > .5:
            for b in np.arange(0, DUR, BEAT): xb = tx(b / DUR); d.line((xb, cy - 10, xb, cy + 10), fill=col)
            d.text((x0 + 10, y0 + 4), nm, font=fl, fill=CREAM)
        elif nm and x1 - x0 > 40 and k > .8:
            s_ = nm
            while s_ and fl.getlength(s_) > x1 - x0 - 10: s_ = s_[:-1]
            d.text((x0 + 6, y0 + 6), s_, font=fl, fill=CREAM)
        if tr == 1 and k > .8:
            for kx in (x0 + 8, (x0 + x1) / 2):
                d.polygon([(kx, y1 - 14), (kx + 6, y1 - 20), (kx + 12, y1 - 14), (kx + 6, y1 - 8)], fill=YELLOW)
        last[tr] = (x1, cy)
    if blade is not None:
        bx, prog = blade
        d.line((bx, 1290, bx, 1290 + 540 * eo(prog)), fill=(255, 255, 255), width=5)
    px = tx(playhead); d.line((px, 1250, px, 1830), fill=YELLOW, width=3)
    d.polygon([(px - 10, 1250), (px + 10, 1250), (px, 1266)], fill=YELLOW)
    fc = font(F_XB, 20)
    for ai, (name, col) in enumerate(AG):
        tr = [3, 0, 1, 4][ai]
        x, y = last.get(tr, (TL_X0 + 40 + ai * 160, ty(tr) + 50))
        x += 6 * math.sin(t * 7 + ai); y += 4 * math.cos(t * 9 + ai)
        d.polygon([(x, y), (x, y + 30), (x + 8, y + 23), (x + 20, y + 24)], fill=col, outline=(0, 0, 0))
        tw = fc.getlength(name); bx = min(x + 16, W - tw - 30)
        d.rounded_rectangle((bx, y + 26, bx + tw + 20, y + 58), 10, fill=col); d.text((bx + 10, y + 29), name, font=fc, fill=DARK)
    return c

def pv_word(txt, colbg, colfg, s=1.0, rot=0):
    c = Image.new("RGBA", (1000, 1000), colbg + (255,))
    im = timg(txt, 170, colfg); fit = min(1.0, 880 / im.width); paste(c, im, 500, 500, s * fit, 1, rot)
    return c

# ================================================================ shots
PVC = (540, 630)
def sh_boot(t, lt):
    c = bg((6, 6, 8)); d = ImageDraw.Draw(c); f = font(F_MONO, 44)
    lines = ["> claude.exe", "> carregando editor...", "> agentes: 4", "> pronto_"]
    for i, ln in enumerate(lines):
        n = int(len(ln) * clamp((lt - i * 0.2) / 0.18))
        d.text((90, 760 + i * 80), ln[:n], font=f, fill=GREEN if i == 3 else CREAM)
    d.rectangle((90, 1120, 90 + 900 * eo(lt / 0.9), 1140), fill=ORANGE)
    return rgb_split(c, 10 * math.sin(lt * 40))

def sh_hi(t, lt):
    c = bg(ORANGE); d = ImageDraw.Draw(c)
    for k in range(6):
        r = (lt * 1400 + k * 260) % 1600; d.ellipse((W / 2 - r, H / 2 - r, W / 2 + r, H / 2 + r), outline=(235, 140, 108), width=10)
    word(c, "Oi.", 420, DARK, W / 2, H / 2, back(lt / 0.25), rot=-6 + 12 * eo(lt / 0.3))
    return c

def sh_logo(t, lt):
    c = bg(DARK); d = ImageDraw.Draw(c); grid(d, (30, 28, 26), 90, int(lt * 120))
    star(d, W / 2, 700, 210 * back(lt / 0.4), lt * 2.5, ORANGE)
    word(c, "Claude", 250, CREAM, W / 2, 1150, back((lt - 0.35) / 0.3))
    word(c, "eu sou o", 80, MUTED, W / 2, 1000, 1, eo((lt - 0.1) / 0.3), path=F_BOLD)
    return zoom(c, 1 + 0.12 * lt)

def sh_reveal(t, lt):  # 4.0 - 6.0  "E esse video aqui?"
    pv = pv_word("ESSE VÍDEO?", DARK, CREAM, back(lt / 0.3))
    ui = editor(t, 0.15 + 0.2 * lt / 2, 0.16 + lt / DUR, pv)
    k = eio((lt - 0.55) / 0.5)
    return zoom(ui, 1.62 + (1.0 - 1.62) * k, PVC[0], PVC[1] + (H / 2 - PVC[1]) * k)

def sh_edit(t, lt):  # 6.0 - 7.6  "Fui eu que editei"
    pv = pv_word("FUI EU.", ORANGE, DARK, back(lt / 0.3), rot=-4)
    ui = editor(t, 0.35 + 0.35 * eo(lt / 1.6), 0.24 + lt / DUR, pv)
    k = eio((lt - 0.3) / 0.6)
    return zoom(ui, 1 + 0.4 * k, 620, 960 + 600 * k, rot=-2 * k)

def sh_alone(t, lt):  # 7.6 - 9.0
    c = bg((8, 8, 9)); d = ImageDraw.Draw(c)
    x, y = W / 2 + 160, H / 2 + 120
    d.polygon([(x, y), (x, y + 60), (x + 16, y + 46), (x + 40, y + 48)], fill=ORANGE)
    word(c, "sozinho.", 190, CREAM, W / 2, H / 2 - 40, 1, eo(lt / 0.3))
    c = zoom(c, 1 + 0.25 * eio(lt / 1.4))
    return c

def sh_cut(t, lt):  # 9 - 10  CORTE
    pv = pv_word("CORTE", DARK, CREAM, 1.15 - 0.15 * eo(lt / 0.2))
    ui = editor(t, 0.72, 0.36 + lt / DUR, pv, blade=(tx(0.42), lt / 0.25))
    c = zoom(ui, 1.55, tx(0.42), 1520)
    word(c, "CORTE", 260, CREAM, W / 2, 420, back(lt / 0.2), rot=-5)
    return c

def sh_track(t, lt):  # 10 - 11 TRILHA
    c = bg((10, 22, 28)); d = ImageDraw.Draw(c)
    nb = 24
    for i in range(nb):
        h = (0.3 + 0.7 * abs(math.sin(i * 1.7 + lt * 9))) * math.exp(-((t % BEAT) / BEAT) * 2) * 700
        x = 60 + i * (W - 120) / nb; d.rounded_rectangle((x, 1500 - h, x + 28, 1500), 8, fill=CYAN if i % 3 else ORANGE)
    word(c, "TRILHA", 240, CREAM, W / 2, 520, back(lt / 0.2))
    return c

def sh_fx(t, lt):  # 11 - 12 EFEITO
    c = bg((24, 10, 30)); d = ImageDraw.Draw(c)
    for k in range(12):
        a = lt * 3 + k * math.pi / 6; r = 380 + 60 * math.sin(lt * 8 + k)
        x, y = W / 2 + r * math.cos(a), H / 2 + r * math.sin(a)
        d.rectangle((x - 40, y - 40, x + 40, y + 40), fill=[PINK, ORANGE, CYAN, YELLOW][k % 4])
    word(c, "EFEITO", 230, CREAM, W / 2, H / 2, back(lt / 0.2), rot=8 * math.sin(lt * 10))
    c = rgb_split(c, 30 * math.sin(lt * 25))
    return zoom(c, 1 + 0.1 * math.sin(lt * 6), rot=4 * math.sin(lt * 5))

def sh_auto(t, lt):  # 12 - 14 TUDO NO AUTOMATICO (timelapse)
    pv = pv_word("AUTOMÁTICO", CREAM, ORANGE, back(lt / 0.3))
    b = 0.72 + 0.28 * eo(lt / 1.6)
    ui = editor(t, b, (lt * 0.6) % 1.0, pv)
    s = 1.06 + 0.06 * math.sin(lt * 4)
    c = zoom(ui, s, W / 2, H / 2 + 200 * math.sin(lt * 2))
    if lt < 0.9:
        ov = Image.new("RGBA", (W, H), (0, 0, 0, 0)); word(ov, "TUDO NO", 120, YELLOW, W / 2, 1180, back(lt / 0.2))
        c.alpha_composite(ov)
    return c

def sh_verb(txt, bgc, fgc, deco):
    def f(t, lt):
        c = bg(bgc); d = ImageDraw.Draw(c)
        if deco == "code":
            fm = font(F_MONO, 34)
            for i in range(30):
                y = (i * 70 - lt * 900) % (H + 70) - 70
                d.text((40, y), ["def editar(v):", "  cortes = ia(v)", "  return render()", "for f in frames:", "  f.glitch()"][i % 5],
                       font=fm, fill=tuple(int(v * 0.8 + bgc[j] * 0.2) if False else int(bgc[j] + (fgc[j] - bgc[j]) * 0.18) for j, v in enumerate(fgc)))
        elif deco == "burst":
            for k in range(16):
                a = k * math.pi / 8; r0, r1 = 200 + lt * 900, 300 + lt * 1300
                d.line((W / 2 + r0 * math.cos(a), H / 2 + r0 * math.sin(a), W / 2 + r1 * math.cos(a), H / 2 + r1 * math.sin(a)), fill=ORANGE, width=18)
        word(c, txt, 230, fgc, W / 2, H / 2, 1.25 - 0.25 * eo(lt / 0.15))
        return rgb_split(c, 22 * math.exp(-lt * 15))
    return f

def sh_rec(t, lt):  # 17 - 19 VOCE SO GRAVA
    c = bg((12, 12, 12)); d = ImageDraw.Draw(c)
    for (x, y, sx, sy) in [(80, 200, 1, 1), (W - 80, 200, -1, 1), (80, H - 200, 1, -1), (W - 80, H - 200, -1, -1)]:
        d.line((x, y, x + 120 * sx, y), fill=CREAM, width=8); d.line((x, y, x, y + 120 * sy), fill=CREAM, width=8)
    if int(lt * 3) % 2 == 0: d.ellipse((120, 260, 170, 310), fill=RED)
    d.text((190, 258), "REC", font=font(F_XB, 48), fill=CREAM)
    f = int(lt * FPS); d.text((W - 420, 262), f"00:00:{f // FPS:02d}:{f % FPS:02d}", font=font(F_MONO, 40), fill=CREAM)
    word(c, "você", 200, CREAM, W / 2, 860, back(lt / 0.25))
    word(c, "só grava.", 200, ORANGE, W / 2, 1080, back((lt - 0.35) / 0.25))
    return zoom(c, 1 + 0.06 * lt)

def sh_rest(t, lt):  # 19 - 20 O RESTO?
    pv = pv_word("O RESTO?", DARK, CREAM, back(lt / 0.25))
    ui = editor(t, 1.0, 0.76 + lt / DUR, pv)
    return zoom(ui, 1.5 - 0.5 * eo(lt / 0.5), PVC[0], PVC[1] + (H / 2 - PVC[1]) * eo(lt / 0.5), rot=6 * (1 - eo(lt / 0.5)))

def sh_mine(t, lt):  # 20 - 21.6 E COMIGO
    c = bg(ORANGE); d = ImageDraw.Draw(c)
    star(d, W / 2, 640, 260 * back(lt / 0.3), lt * 3, DARK)
    word(c, "É COMIGO.", 220, DARK, W / 2, 1200, back((lt - 0.08) / 0.25))
    return c

def sh_end(t, lt):  # 21.6 - 25
    c = bg(DARK); d = ImageDraw.Draw(c); grid(d, (28, 26, 24), 90, int(lt * 60))
    star(d, W / 2, 680, 150 * back(lt / 0.4), lt * 0.9, ORANGE)
    word(c, "Claude", 230, CREAM, W / 2, 1020, back((lt - 0.1) / 0.3))
    word(c, "me manda seu vídeo →", 66, ORANGE, W / 2, 1200, 1, eo((lt - 0.5) / 0.3), path=F_BOLD)
    p = eo((lt - 0.9) / 1.2)
    d = ImageDraw.Draw(c); d.rounded_rectangle((240, 1400, 840, 1424), 12, fill=(50, 50, 58))
    d.rounded_rectangle((240, 1400, 240 + 600 * p, 1424), 12, fill=ORANGE)
    d.text((240, 1440), "exportado ✓" if p >= 1 else f"exportando {int(p * 100)}%", font=font(F_MONO, 30), fill=GREEN if p >= 1 else MUTED)
    return c

SHOTS = [(0.0, sh_boot), (1.0, sh_hi), (2.0, sh_logo), (4.0, sh_reveal), (6.0, sh_edit), (7.6, sh_alone),
         (9.0, sh_cut), (10.0, sh_track), (11.0, sh_fx), (12.0, sh_auto),
         (14.0, sh_verb("ESCREVO", DARK, CREAM, "code")), (15.0, sh_verb("PROGRAMO", CREAM, INK, "code")),
         (16.0, sh_verb("CRIO", DARK, ORANGE, "burst")), (17.5, sh_rec), (19.0, sh_rest), (20.0, sh_mine), (21.6, sh_end)]
IMPACTS = [1.0, 2.35, 9.0, 14.0, 15.0, 16.0, 20.0, 21.6]
FLASH = [1.0, 9.0, 20.0, 21.6]

def frame(i):
    t = i / FPS
    k = max(j for j in range(len(SHOTS)) if SHOTS[j][0] <= t)
    st, fn = SHOTS[k]; lt = t - st
    c = fn(t, lt)
    # beat pulse (stronger after drop)
    if t < 21.6:
        pul = math.exp(-((t % BEAT) / BEAT) * 7) * (0.045 if t >= DROP else 0.02)
        c = zoom(c, 1 + pul)
    # shake on impacts
    for it in IMPACTS:
        if 0 <= t - it < 0.3:
            a = 26 * (1 - (t - it) / 0.3)
            c = ImageChops.offset(c, int(a * math.sin(t * 90)), int(a * math.cos(t * 73)))
    # whip transition: directional smear + slide in
    if k > 0 and lt < 0.12:
        p = 1 - lt / 0.12; off = int(p * 260)
        sm = c
        for s in (1, 2, 3):
            sm = Image.blend(sm, ImageChops.offset(c, 0, -off * s // 3), 0.35)
        c = rgb_split(sm, p * 30, vert=True)
    for ft in FLASH:
        if 0 <= t - ft < 0.1:
            c = Image.blend(c, bg((255, 255, 255)), 0.8 * (1 - (t - ft) / 0.1))
    if t > DUR - 0.5: c = Image.blend(c, bg((0, 0, 0)), clamp((t - DUR + 0.5) / 0.5))
    return c.convert("RGB")

# ================================================================ music + sfx
n = int(SR * DUR); tt = np.arange(n) / SR
mus = np.zeros(n); sfx = np.zeros(n); R = np.random.default_rng(3)
def add(buf, sig, st, g=1.0):
    s = int(st * SR)
    if 0 <= s < n: e = min(n, s + len(sig)); buf[s:e] += sig[:e - s] * g
def env(l, k): return np.exp(-np.arange(l) / SR * k)
kl = int(.35 * SR); kt = np.arange(kl) / SR
kick = np.sin(2 * np.pi * (45 + 140 * np.exp(-kt * 32)) * kt) * np.exp(-kt * 8)
hat = R.standard_normal(int(.05 * SR)) * env(int(.05 * SR), 80) * .2
snare = (R.standard_normal(int(.22 * SR)) * .6 + np.sin(2 * np.pi * 185 * np.arange(int(.22 * SR)) / SR)) * env(int(.22 * SR), 16) * .5
for b in range(int(DUR / BEAT)):
    st = b * BEAT
    if st >= 21.6: break
    drop = st >= DROP
    if st < 1.0: continue
    if drop or b % 2 == 0: add(mus, kick, st)
    add(mus, hat, st + BEAT / 2);
    if drop: add(mus, hat, st + BEAT / 4, .6); add(mus, hat, st + 3 * BEAT / 4, .6)
    if drop and b % 2 == 1: add(mus, snare, st)
    if drop or st >= 4:
        f = [55, 55, 65.4, 49][(b // 4) % 4]; bl = int(BEAT * SR); bt = np.arange(bl) / SR
        add(mus, (np.sign(np.sin(2 * np.pi * f * bt)) * .5 + np.sin(2 * np.pi * f * 2 * bt) * .5) * .14 * np.exp(-bt * 4), st)
pad = sum(np.sin(2 * np.pi * f * tt) for f in [220, 261.6, 329.6]) * .025 * (0.6 + 0.4 * np.sin(2 * np.pi * .25 * tt))
pad[tt >= 21.6] *= np.exp(-(tt[tt >= 21.6] - 21.6) * 0.8); mus += pad
rl = int(1.4 * SR); rt = np.arange(rl) / SR
add(mus, R.standard_normal(rl) * (rt / 1.4) ** 2.5 * .35 + np.sin(2 * np.pi * (150 + 900 * (rt / 1.4) ** 2) * rt) * (rt / 1.4) ** 2 * .12, DROP - 1.4)
wl = int(.25 * SR); wt = np.arange(wl) / SR
whoosh = np.convolve(R.standard_normal(wl) * np.sin(np.pi * wt / .25) ** 2, np.ones(10) / 10, "same") * .35
boom = np.sin(2 * np.pi * (40 + 60 * np.exp(-np.arange(int(.9 * SR)) / SR * 6)) * np.arange(int(.9 * SR)) / SR) * env(int(.9 * SR), 3.5)
for st, _ in SHOTS[1:]: add(sfx, whoosh, st - 0.12)
for it in IMPACTS: add(sfx, boom, it, .8)
tick = np.sin(2 * np.pi * 3000 * np.arange(int(.015 * SR)) / SR) * env(int(.015 * SR), 300) * .25
for k in range(40): add(sfx, tick, k * 0.022 + (k // 10) * 0.04)
for k in range(24): add(sfx, tick, 12.0 + k * 0.075, .6)
glitch = R.standard_normal(int(.08 * SR)) * .25
for gt in [11.0, 11.25, 11.5, 11.75, 14.0, 15.0, 16.0]: add(sfx, glitch, gt)
add(sfx, R.standard_normal(int(.12 * SR)) * env(int(.12 * SR), 30) * .5, 9.0)  # blade
beep = np.sin(2 * np.pi * 1000 * np.arange(int(.12 * SR)) / SR) * .25
add(sfx, beep, 17.5)
vbuf = voice.copy()
ev = np.convolve(np.abs(vbuf), np.ones(int(.12 * SR)) / int(.12 * SR), "same")
duck = 1 - .5 * np.clip(ev / (ev.max() + 1e-9) * 4, 0, 1)
mix = mus * .6 * duck + sfx * .7 + vbuf * 1.1
mix *= np.clip((DUR - tt) / .6, 0, 1); mix /= np.abs(mix).max() * 1.05
WAV = f"{WD}/mix.wav"
with wave.open(WAV, "wb") as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((mix * 32767).astype(np.int16).tobytes())

if len(sys.argv) > 3:
    for fi in map(int, sys.argv[3].split(",")): frame(fi).save(f"{WD}/f{fi}.png")
    sys.exit()
p = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", str(FPS),
                      "-i", "-", "-i", WAV, "-c:v", "libx264", "-preset", "medium", "-crf", "20", "-pix_fmt", "yuv420p",
                      "-c:a", "aac", "-b:a", "192k", "-shortest", "-movflags", "+faststart", OUT], stdin=subprocess.PIPE)
for i in range(N):
    p.stdin.write(frame(i).tobytes())
    if i % 150 == 0: print("frame", i, flush=True)
p.stdin.close(); p.wait(); print("done", p.returncode)
