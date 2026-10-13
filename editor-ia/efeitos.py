#!/usr/bin/env python3
"""Edição "premium" só com efeitos próprios (sem cenas geradas): câmera, motion graphics, recorte da pessoa e som.

Uso:  python3 editor-ia/efeitos.py trabalhos/<nome>/edicao.json [--saida final.mp4] [--de S] [--ate S]

A fala da criadora não é cortada. O meio da tela fica livre para as legendas do CapCut.
Precisa: ffmpeg, Pillow, numpy, onnxruntime e o modelo u2net_human_seg.onnx em editor-ia/modelos/
(https://github.com/danielgatis/rembg/releases/download/v0.0.0/u2net_human_seg.onnx) — só para recorte/título atrás.

Elementos do edicao.json (tempos em segundos, posições de 0 a 1):
  camera        [{t, z, cx, cy, alvo:"produto", suave}]  corte seco ganha borrão de zoom automático
  tremor        [{inicio, fim, forca}]       glitch [{inicio, fim}]      flash [{t}]      luz [{t, dur}]
  cartao        [{inicio, fim, texto, emoji, y, estilo, tam}]   estilo: vidro | verde | branco | escuro | vermelho | lima
  lista         [{inicio, fim, y, estilo, itens:[{t, emoji, texto}], riscar, check}]
  carimbo       [{inicio, fim, texto, y, cor, rot}]
  selo          [{inicio, fim, linhas, x, y}]
  titulo_atras  [{inicio, fim, texto, y, cor, tam}]       texto gigante ATRÁS da pessoa
  foco          [{inicio, fim, fundo:"escuro"|"verde", raios}] fundo troca, pessoa + pote ganham contorno
  anel_produto  [{inicio, fim, texto}]        círculo animado seguindo o pote (rastreado pela cor)
  particulas    [{inicio, fim}]   preco [{inicio, fim, valor, sub, y}]   botao [{inicio, fim, texto, y}]
  final         {duracao, produto_t}          tela final: logo, foto do pote tirada do vídeo, botão
  musica        {volume, bpm} ou false        sfx [{t, som, volume}]
"""
import json, math, os, random, subprocess, sys, tempfile
import numpy as np
from PIL import Image, ImageChops, ImageDraw, ImageFilter, ImageFont

AQUI = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, AQUI)
import montar, sons

W, H, FPS = 1080, 1920, 30
EMOJI = "/usr/share/fonts/truetype/noto/NotoColorEmoji.ttf"
VERDE, VERDE_ESC, LIMA, VERMELHO = (31, 77, 58), (12, 34, 26), (182, 227, 90), (229, 57, 53)
ESTILOS = {  # fundo, texto, borda
    "vidro": ((255, 255, 255, 55), (255, 255, 255), (255, 255, 255, 150)),
    "verde": (VERDE + (235,), (255, 255, 255), LIMA + (200,)),
    "branco": ((255, 255, 255, 245), (20, 30, 25), None),
    "escuro": ((12, 16, 14, 215), (255, 255, 255), (255, 255, 255, 60)),
    "vermelho": (VERMELHO + (245,), (255, 255, 255), (255, 255, 255, 120)),
    "lima": (LIMA + (250,), VERDE_ESC, None),
}


# ---------- curvas ----------
def back(x):
    c1 = 1.70158
    return 1 + (c1 + 1) * (x - 1) ** 3 + c1 * (x - 1) ** 2


def suave(x):
    x = min(max(x, 0), 1)
    return x * x * (3 - 2 * x)


def entrada_saida(t, a, b, ent=0.3, sai=0.18):
    """(escala, opacidade, deslocamento_y) de um elemento visível entre a e b."""
    if t < a or t > b:
        return 0, 0, 0
    x, y = (t - a) / ent, (b - t) / sai
    if x < 1:
        return max(0.01, back(x)), min(1, x * 2.5), (1 - suave(x)) * 50
    if y < 1:
        return 1 - 0.12 * (1 - y), y, -(1 - y) * 30
    return 1, 1, 0


# ---------- sprites ----------
_fontes = {}


def fonte(tam):
    if tam not in _fontes:
        _fontes[tam] = montar.carregar_fonte(tam)
    return _fontes[tam]


def emoji_img(e, alto):
    img = Image.new("RGBA", (160, 160), (0, 0, 0, 0))
    ImageDraw.Draw(img).text((80, 80), e, font=ImageFont.truetype(EMOJI, 109), embedded_color=True, anchor="mm")
    img = img.crop(img.getbbox() or (0, 0, 1, 1))
    return img.resize((max(1, int(img.width * alto / img.height)), alto), Image.LANCZOS)


def sombra(img, raio=18, desloc=10, forca=150):
    a = img.getchannel("A").point(lambda v: v * forca // 255)
    s = Image.new("RGBA", (img.width + 4 * raio, img.height + 4 * raio + desloc), (0, 0, 0, 0))
    base = Image.new("RGBA", img.size, (0, 0, 0, 255))
    base.putalpha(a)
    s.paste(base, (2 * raio, 2 * raio + desloc), base)
    s = s.filter(ImageFilter.GaussianBlur(raio))
    s.alpha_composite(img, (2 * raio, 2 * raio))
    s.info["corpo"] = img.size
    return s


def texto_com_sombra(d, xy, txt, f, cor, anchor="mm"):
    d.text((xy[0] + 2, xy[1] + 4), txt, font=f, fill=(0, 0, 0, 110), anchor=anchor)
    d.text(xy, txt, font=f, fill=cor, anchor=anchor)


def pilula(texto, emoji=None, estilo="vidro", tam=66, larg_max=int(W * 0.86)):
    fundo, cor, borda = ESTILOS[estilo]
    linhas = texto.upper().split("\n")
    while True:
        f = fonte(tam)
        larg_txt = max(f.getlength(l) for l in linhas)
        e = emoji_img(emoji, int(tam * 1.15)) if emoji else None
        pad, gap = int(tam * 0.55), int(tam * 0.3)
        w = int(larg_txt + 2 * pad + (e.width + gap if e else 0))
        if w <= larg_max or tam < 30:
            break
        tam -= 4
    alt_linha = int(tam * 1.12)
    h = int(alt_linha * len(linhas) + pad * 1.2)
    img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    raio = int(h * 0.32 if len(linhas) == 1 else tam * 0.5)
    d.rounded_rectangle((0, 0, w - 1, h - 1), radius=raio, fill=fundo, outline=borda, width=3 if borda else 0)
    x = pad
    if e:
        img.alpha_composite(e, (x, (h - e.height) // 2))
        x += e.width + gap
    for i, l in enumerate(linhas):
        y = (h - alt_linha * len(linhas)) / 2 + alt_linha * (i + 0.5)
        if estilo in ("vidro", "escuro", "verde", "vermelho"):
            texto_com_sombra(d, (x + larg_txt / 2, y), l, f, cor)
        else:
            d.text((x + larg_txt / 2, y), l, font=f, fill=cor, anchor="mm")
    spr = sombra(img, 18, 10, 90 if estilo == "vidro" else 150)
    spr.info["vidro"] = estilo == "vidro"
    spr.info["raio"] = raio
    return spr


def carimbo_img(texto, cor=VERMELHO, tam=110):
    f = fonte(tam)
    w, h = int(f.getlength(texto.upper()) + tam * 0.9), int(tam * 1.5)
    img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    esp = max(6, tam // 12)
    d.rounded_rectangle((esp, esp, w - esp, h - esp), radius=tam // 5, fill=(255, 255, 255, 40), outline=cor + (255,), width=esp)
    d.text((w / 2, h / 2), texto.upper(), font=f, fill=cor + (255,), anchor="mm")
    return sombra(img, 10, 6, 120)


def selo_img(linhas, d_px=330):
    img = Image.new("RGBA", (d_px, d_px), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    pts = []
    for k in range(48):
        r = d_px / 2 if k % 2 == 0 else d_px * 0.44
        a = math.pi * 2 * k / 48
        pts.append((d_px / 2 + r * math.cos(a), d_px / 2 + r * math.sin(a)))
    d.polygon(pts, fill=LIMA + (255,))
    d.ellipse((d_px * 0.1, d_px * 0.1, d_px * 0.9, d_px * 0.9), outline=VERDE_ESC + (255,), width=5)
    tams = [int(d_px * 0.2), int(d_px * 0.1), int(d_px * 0.09)]
    ys = [0.44, 0.64] if len(linhas) > 1 else [0.5]
    for i, l in enumerate(linhas):
        d.text((d_px / 2, d_px * ys[i]), l.upper(), font=fonte(tams[min(i, 2)]), fill=VERDE_ESC, anchor="mm")
    return sombra(img, 14, 8, 140)


def titulo_img(texto, cor=(255, 255, 255), tam=300, maiusc=True):
    texto = texto.upper() if maiusc else texto
    f = fonte(tam)
    while f.getlength(texto) > W * 0.96 and tam > 60:
        tam -= 10
        f = fonte(tam)
    w, h = int(f.getlength(texto) + 60), int(tam * 1.35)
    img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    ImageDraw.Draw(img).text((w / 2, h / 2), texto, font=f, fill=tuple(cor) + (255,), anchor="mm")
    return sombra(img, 22, 12, 120)


def raios_img(tam=1500, n=18):
    img = Image.new("RGBA", (tam, tam), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    c = tam / 2
    for k in range(n):
        a0, a1 = 2 * math.pi * k / n, 2 * math.pi * (k + 0.45) / n
        d.polygon([(c, c), (c + c * 1.5 * math.cos(a0), c + c * 1.5 * math.sin(a0)),
                   (c + c * 1.5 * math.cos(a1), c + c * 1.5 * math.sin(a1))], fill=LIMA + (70,))
    fade = Image.new("L", (tam, tam), 0)
    ImageDraw.Draw(fade).ellipse((0, 0, tam, tam), fill=255)
    fade = fade.filter(ImageFilter.GaussianBlur(tam / 6))
    img.putalpha(ImageChops.multiply(img.getchannel("A"), fade))
    return img


def seta_img(tam=150):
    img = Image.new("RGBA", (tam, int(tam * 1.2)), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    w, h = img.size
    pts = [(w * .3, 0), (w * .7, 0), (w * .7, h * .5), (w * .95, h * .5), (w / 2, h * .97), (w * .05, h * .5), (w * .3, h * .5)]
    d.polygon(pts, fill=VERMELHO + (255,), outline=(255, 255, 255, 255), width=6)
    return sombra(img, 10, 6, 120)


def fundo_marca():
    img = Image.new("RGB", (W, H), VERDE_ESC)
    g = Image.new("L", (W, H), 0)
    ImageDraw.Draw(g).ellipse((-W * .4, H * .1, W * 1.4, H * .8), fill=150)
    g = g.filter(ImageFilter.GaussianBlur(220))
    return Image.composite(Image.new("RGB", (W, H), (44, 110, 76)), img, g)


def luz_img():
    img = Image.new("RGB", (W // 4, H // 4), (0, 0, 0))
    d = ImageDraw.Draw(img)
    d.ellipse((-60, 40, 200, 300), fill=(255, 150, 60))
    d.ellipse((120, 160, 330, 420), fill=(200, 255, 120))
    d.ellipse((30, 330, 250, 520), fill=(255, 210, 120))
    return img.filter(ImageFilter.GaussianBlur(45)).resize((W, H), Image.BILINEAR)


def colar(quadro, spr, cx, cy, escala=1.0, alfa=1.0, rot=0):
    if alfa <= 0.01:
        return
    vidro, raio = spr.info.get("vidro"), spr.info.get("raio", 0)
    cw, ch = spr.info.get("corpo", spr.size)
    if escala != 1 or rot:
        spr = spr.resize((max(1, int(spr.width * escala)), max(1, int(spr.height * escala))), Image.BILINEAR)
        if rot:
            spr = spr.rotate(rot, Image.BILINEAR, expand=True)
    x0, y0 = int(cx - spr.width / 2), int(cy - spr.height / 2)
    if vidro and not rot:  # vidro fosco: desfoca o que está atrás do cartão
        bw, bh = int(cw * escala), int(ch * escala)
        bx, by = int(cx - bw / 2), int(cy - bh / 2 - 5 * escala)
        caixa = (max(bx, 0), max(by, 0), min(bx + bw, W), min(by + bh, H))
        if caixa[2] > caixa[0] and caixa[3] > caixa[1]:
            reg = quadro.crop(caixa).filter(ImageFilter.GaussianBlur(22))
            m = Image.new("L", reg.size, 0)
            ImageDraw.Draw(m).rounded_rectangle((bx - caixa[0], by - caixa[1], bx - caixa[0] + bw - 1, by - caixa[1] + bh - 1),
                                                radius=int(raio * escala), fill=int(255 * alfa))
            quadro.paste(reg, caixa[:2], m)
    if alfa < 1:
        a = np.asarray(spr.getchannel("A"), dtype=np.float32) * alfa
        spr = spr.copy()
        spr.putalpha(Image.fromarray(a.astype(np.uint8)))
    quadro.alpha_composite(spr, (x0, y0))


# ---------- análise: pote e pessoa ----------
def pote_na_imagem(img_peq):
    """Pote verde-escuro pela cor. Devolve (cx, cy, x0, y0, x1, y1) de 0 a 1, ou None."""
    hsv = np.asarray(img_peq.convert("HSV")).astype(np.int16)
    m = (hsv[..., 0] > 85) & (hsv[..., 0] < 130) & (hsv[..., 1] > 70) & (hsv[..., 2] > 25) & (hsv[..., 2] < 150)
    if m.sum() < m.size * 0.02:
        return None
    ys, xs = np.nonzero(m)
    w, h = img_peq.size
    x0, x1 = np.percentile(xs, [4, 96])
    y0, y1 = np.percentile(ys, [4, 96])
    return (xs.mean() / w, ys.mean() / h, x0 / w, y0 / h, x1 / w, y1 / h)


def rastrear_pote(bruto, dur):
    """Uma passada rápida em baixa resolução; suaviza o caminho do pote."""
    p = subprocess.Popen(["ffmpeg", "-v", "error", "-i", bruto, "-t", f"{dur:.3f}", "-vf", f"fps={FPS},scale=180:320",
                          "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], stdout=subprocess.PIPE)
    trilha, tam = [], 180 * 320 * 3
    while True:
        b = p.stdout.read(tam)
        if len(b) < tam:
            break
        trilha.append(pote_na_imagem(Image.frombuffer("RGB", (180, 320), b)))
    p.wait()
    suav, ant = [], None
    for r in trilha:
        if r is None:
            suav.append(None)
            ant = None
            continue
        ant = r if ant is None else tuple(a * 0.6 + b * 0.4 for a, b in zip(ant, r))
        suav.append(ant)
    return suav


class Recorte:
    def __init__(self):
        import onnxruntime as ort
        modelo = os.path.join(AQUI, "modelos", "u2net_human_seg.onnx")
        if not os.path.exists(modelo):
            sys.exit(f"Falta o modelo de recorte: {modelo}")
        self.s = ort.InferenceSession(modelo, providers=["CPUExecutionProvider"])
        self.nome = self.s.get_inputs()[0].name

    def mascara(self, img, pote=None):
        x = np.asarray(img.resize((320, 320), Image.BILINEAR), dtype=np.float32) / 255
        x = ((x - [0.485, 0.456, 0.406]) / [0.229, 0.224, 0.225]).transpose(2, 0, 1)[None].astype(np.float32)
        m = self.s.run(None, {self.nome: x})[0][0, 0]
        m = np.clip((m - m.min()) / (m.max() - m.min() + 1e-6) * 1.6 - 0.3, 0, 1)
        mk = Image.fromarray((m * 255).astype(np.uint8)).resize((W // 2, H // 2), Image.BILINEAR)
        if pote:  # o modelo só pega pessoa: soma o pote
            d = ImageDraw.Draw(mk)
            x0, y0, x1, y1 = pote[2] * W / 2, pote[3] * H / 2, pote[4] * W / 2, pote[5] * H / 2
            mx, my = (x1 - x0) * 0.08, (y1 - y0) * 0.08
            d.rounded_rectangle((x0 - mx, y0 - my, x1 + mx, y1 + my), radius=int((x1 - x0) * 0.12), fill=255)
        return mk.filter(ImageFilter.GaussianBlur(1.5)).resize((W, H), Image.BILINEAR)


# ---------- câmera ----------
def camera(kfs, t, pote_t):
    z, cx, cy, ini = 1.0, 0.5, 0.42, 0.0
    for k in kfs:
        if k["t"] > t:
            break
        if k.get("alvo") == "produto" and pote_t:
            alvo = (k.get("z", 1.4), pote_t[0], pote_t[1] - 0.04)
        else:
            alvo = (k.get("z", 1.0), k.get("cx", 0.5), k.get("cy", 0.42))
        if k.get("suave"):
            p = suave((t - k["t"]) / k["suave"])
            z, cx, cy = (a + (b - a) * p for a, b in zip((z, cx, cy), alvo))
        else:
            z, cx, cy = alvo
        ini = k["t"]
    z *= 1 + min(0.03, 0.01 * (t - ini))
    return z, cx, cy


def caixa_recorte(z, cx, cy, dx=0, dy=0):
    w, h = W / z, H / z
    x0 = min(max(cx * W - w / 2 + dx, 0), W - w)
    y0 = min(max(cy * H - h / 2 + dy, 0), H - h)
    return (x0, y0, x0 + w, y0 + h)


def para_tela(px, py, caixa):
    x0, y0, x1, y1 = caixa
    return (px * W - x0) * W / (x1 - x0), (py * H - y0) * H / (y1 - y0)


def glitch(img, forca, rnd):
    a = np.asarray(img.convert("RGB")).copy()
    s = int(14 * forca)
    a[..., 0] = np.roll(a[..., 0], s, axis=1)
    a[..., 2] = np.roll(a[..., 2], -s, axis=1)
    for _ in range(6):
        y = rnd.randrange(0, H - 120)
        hh = rnd.randrange(20, 110)
        a[y:y + hh] = np.roll(a[y:y + hh], rnd.randrange(-70, 70), axis=1)
    return Image.fromarray(a).convert("RGBA")


# ---------- áudio ----------
def montar_audio(cfg, base, bruto, tem_audio, de, dur, total, tmp):
    ent, filtros = [], []
    voz = "highpass=f=80,equalizer=f=250:t=q:w=1:g=-2,equalizer=f=3500:t=q:w=1.2:g=3,acompressor=threshold=0.08:ratio=3:attack=10:release=150:makeup=2"
    if tem_audio:
        ent += ["-ss", f"{de:.3f}", "-i", bruto]
        filtros.append(f"[0:a]atrim=duration={dur:.3f},aresample=48000,aformat=channel_layouts=stereo,{voz},apad=whole_dur={total:.3f},asplit=2[voz][sc]")
    else:
        filtros.append(f"anullsrc=r=48000:cl=stereo,atrim=duration={total:.3f},asplit=2[voz][sc]")
    rot, k = ["[voz]"], len(ent) // 4
    mus = cfg.get("musica", {"volume": 0.22, "bpm": 100})
    if mus:
        arq = sons.trilha(total + de, os.path.join(tmp, "trilha.wav"), mus.get("bpm", 100))
        ent += ["-i", arq]
        filtros.append(f"[{k}:a]atrim=start={de:.3f},asetpts=PTS-STARTPTS,volume={mus.get('volume', 0.22)}[m]")
        filtros.append("[m][sc]sidechaincompress=threshold=0.03:ratio=6:attack=30:release=500[md]")
        rot.append("[md]")
        k += 1
    else:
        filtros.append("[sc]anullsink")
    for j, s in enumerate(x for x in cfg.get("sfx", []) if de <= x["t"] < de + total):
        nome = s["som"]
        proprio = [os.path.join(base, "sfx", f"{nome}.{e}") for e in ("wav", "mp3")]
        arq = next((p for p in proprio if os.path.exists(p)), None) or (sons.sfx(nome) if nome in sons.NOMES else montar.arquivo_de_som(nome, base, tmp))
        ent += ["-i", arq]
        filtros.append(f"[{k}:a]aresample=48000,aformat=channel_layouts=stereo,adelay={int((s['t'] - de) * 1000)}:all=1,volume={s.get('volume', 0.5)}[f{j}]")
        rot.append(f"[f{j}]")
        k += 1
    filtros.append(f"{''.join(rot)}amix=inputs={len(rot)}:normalize=0:duration=first,loudnorm=I=-14:TP=-1.2:LRA=11,aresample=48000[a]")
    destino = os.path.join(tmp, "audio.wav")
    montar.rodar(["ffmpeg", "-y", "-loglevel", "error", *ent, "-filter_complex", ";".join(filtros), "-map", "[a]", "-t", f"{total:.3f}", destino])
    return destino


# ---------- principal ----------
def ativo(lista, t):
    return [e for e in lista if e["inicio"] <= t <= e["fim"]]


def main():
    args = sys.argv[1:]
    if not args:
        sys.exit(__doc__)
    cfg_path = os.path.abspath(args[0])
    base = os.path.dirname(cfg_path)
    cfg = json.load(open(cfg_path, encoding="utf-8"))
    saida = args[args.index("--saida") + 1] if "--saida" in args else os.path.join(base, "final.mp4")
    bruto = cfg["bruto"] if os.path.isabs(cfg["bruto"]) else os.path.join(base, cfg["bruto"])
    dur_total, tem_audio = montar.sonda(bruto)
    de = float(args[args.index("--de") + 1]) if "--de" in args else 0.0
    ate = float(args[args.index("--ate") + 1]) if "--ate" in args else dur_total
    dur = min(ate, dur_total) - de
    fim_cfg = cfg.get("final") if ate >= dur_total else None
    total = dur + (fim_cfg["duracao"] if fim_cfg else 0)
    tmp = tempfile.mkdtemp(prefix="efeitos-")

    print("Rastreando o pote...")
    trilha_pote = rastrear_pote(bruto, dur_total)
    pote = lambda t: trilha_pote[min(int(t * FPS), len(trilha_pote) - 1)] if trilha_pote else None
    precisa_recorte = cfg.get("titulo_atras") or cfg.get("foco")
    recorte = Recorte() if precisa_recorte else None

    cartoes = [(c, pilula(c["texto"], c.get("emoji"), c.get("estilo", "vidro"), c.get("tam", 72))) for c in cfg.get("cartao", [])]
    listas = [(L, [(it, pilula(it["texto"], it.get("emoji"), L.get("estilo", "vidro"), 62, int(W * 0.72))) for it in L["itens"]])
              for L in cfg.get("lista", [])]
    carimbos = [(c, carimbo_img(c["texto"], tuple(c.get("cor", VERMELHO)))) for c in cfg.get("carimbo", [])]
    selos = [(s, selo_img(s["linhas"])) for s in cfg.get("selo", [])]
    titulos = [(c, titulo_img(c["texto"], c.get("cor", (255, 255, 255)), c.get("tam", 300))) for c in cfg.get("titulo_atras", [])]
    aneis = [(a, pilula(a["texto"], "✨", "lima", 50)) for a in cfg.get("anel_produto", [])]
    precos = [(p, selo_img([p["valor"], p.get("sub", "")], 420)) for p in cfg.get("preco", [])]
    botoes = [(b, pilula(b["texto"], "👇", "vermelho", 66)) for b in cfg.get("botao", [])]
    seta, raios, luz = seta_img(), raios_img(), luz_img()
    xis, certo = emoji_img("❌", 70), emoji_img("✅", 64)
    marca = fundo_marca()
    logo_aura, logo_fresh = titulo_img("aura", LIMA, 240, maiusc=False), titulo_img("FRESH", (255, 255, 255), 120)
    botao_final = pilula((fim_cfg or {}).get("botao", "Adquira pelo link"), "👇", "vermelho", 66)
    rnd = random.Random(7)
    bolhas = [(rnd.random(), rnd.random(), 8 + rnd.random() * 26, 0.5 + rnd.random()) for _ in range(70)]
    foto_pote = None

    print("Montando o áudio...")
    audio = montar_audio(cfg, base, bruto, tem_audio, de, dur, total, tmp)

    grade = "eq=contrast=1.07:saturation=1.15:gamma=0.98,colorbalance=rs=0.02:bs=-0.03:rh=0.03:bh=-0.02,vignette=PI/5"
    dec = subprocess.Popen(["ffmpeg", "-v", "error", "-ss", f"{de:.3f}", "-i", bruto, "-t", f"{dur:.3f}", "-vf",
                            f"fps={FPS},scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H},{grade}",
                            "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], stdout=subprocess.PIPE)
    enc = subprocess.Popen(["ffmpeg", "-y", "-v", "error", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", str(FPS),
                            "-i", "-", "-i", audio, "-vf", "noise=alls=3:allf=t", "-c:v", "libx264", "-preset", "medium",
                            "-crf", "18", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k", "-shortest",
                            "-movflags", "+faststart", saida], stdin=subprocess.PIPE)
    kfs = sorted(cfg.get("camera", []), key=lambda k: k["t"])
    tam_q = W * H * 3
    ultimo, z_ant, borrao, z_de, masc, masc_n = None, None, 0, 1.0, None, -9
    n_quadros = int(total * FPS)
    print(f"Renderizando {n_quadros} quadros ({total:.1f}s)...")
    for n in range(n_quadros):
        tl = n / FPS          # tempo dentro do trecho renderizado
        t = de + tl           # tempo no vídeo original (é o que o edicao.json usa)
        dados = dec.stdout.read(tam_q) if tl < dur else b""
        pt = pote(t)
        caixa = None
        if len(dados) == tam_q:
            img = Image.frombuffer("RGB", (W, H), dados)
            if fim_cfg and foto_pote is None and t >= fim_cfg.get("produto_t", 1e9) and pt:
                x0, y0, x1, y1 = pt[2] * W, pt[3] * H, pt[4] * W, pt[5] * H
                mx, my = (x1 - x0) * 0.22, (y1 - y0) * 0.18
                fp = img.crop((int(x0 - mx), int(y0 - my), int(x1 + mx), int(y1 + my))).convert("RGBA")
                mk = Image.new("L", fp.size, 0)
                ImageDraw.Draw(mk).rounded_rectangle((0, 0, fp.width - 1, fp.height - 1), radius=fp.width // 8, fill=255)
                fp.putalpha(mk)
                fp = fp.resize((520, int(520 * fp.height / fp.width)), Image.LANCZOS)
                foto_pote = sombra(fp, 30, 18, 170)
            dx = dy = 0
            for tr in ativo(cfg.get("tremor", []), t):
                f = tr.get("forca", 18) * (1 - (t - tr["inicio"]) / (tr["fim"] - tr["inicio"] + 1e-6))
                dx, dy = f * math.sin(t * 91), f * math.cos(t * 73)
            z, cx, cy = camera(kfs, t, pt)
            if dx or dy:
                z = max(z, 1.04)
            if z_ant is not None and abs(z - z_ant) > 0.08:
                borrao, z_de = 4, z_ant
            z_ant = z
            caixa = caixa_recorte(z, cx, cy, dx, dy)
            quadro = img.resize((W, H), Image.BILINEAR, box=caixa)
            if borrao:  # borrão de zoom no corte seco
                for k, f in enumerate((0.55, 0.75, 0.9)):
                    fz = 1 - (1 - f) * borrao / 4
                    zz = z_de + (z - z_de) * fz
                    quadro = Image.blend(quadro, img.resize((W, H), Image.BILINEAR, box=caixa_recorte(zz, cx, cy, dx, dy)), 0.5 / (k + 1.5))
                borrao -= 1

            # recorte da pessoa (+ pote) para fundo trocado e título atrás
            focos = ativo(cfg.get("foco", []), t)
            tits = [(c, spr) for c, spr in titulos if c["inicio"] <= t <= c["fim"]]
            if focos or tits:
                if masc is None or n - masc_n >= 2:
                    pt_tela = None
                    if pt:
                        a0 = para_tela(pt[2], pt[3], caixa)
                        a1 = para_tela(pt[4], pt[5], caixa)
                        pt_tela = (0, 0, a0[0] / W, a0[1] / H, a1[0] / W, a1[1] / H)
                    masc, masc_n = recorte.mascara(quadro, pt_tela), n
                original = quadro
                for fc in focos:
                    a = min(1, (t - fc["inicio"]) / 0.25, (fc["fim"] - t) / 0.25)
                    if fc.get("fundo") == "verde":
                        fundo = marca.copy()
                    else:
                        fundo = quadro.filter(ImageFilter.GaussianBlur(18)).point(lambda v: int(v * 0.35))
                    if fc.get("raios"):
                        r = raios.rotate(t * 25, Image.BILINEAR)
                        fundo = fundo.convert("RGBA")
                        fundo.alpha_composite(r, (int(W / 2 - r.width / 2), int(H * 0.42 - r.height / 2)))
                        fundo = fundo.convert("RGB")
                    peq = masc.resize((W // 4, H // 4), Image.BILINEAR)
                    brilho = peq.filter(ImageFilter.MaxFilter(9)).filter(ImageFilter.GaussianBlur(6)).resize((W, H), Image.BILINEAR)
                    fundo = Image.composite(Image.new("RGB", (W, H), LIMA), fundo, brilho.point(lambda v: int(v * 0.85)))
                    novo = Image.composite(original, fundo, masc)
                    quadro = Image.blend(quadro, novo, a)
                for c, spr in tits:
                    e, a, oy = entrada_saida(t, c["inicio"], c["fim"], 0.35, 0.25)
                    com_texto = quadro.convert("RGBA")
                    colar(com_texto, spr, W / 2, H * c.get("y", 0.16) + oy, 1.15 - 0.15 * min(1, e), a)
                    quadro = Image.composite(quadro, com_texto.convert("RGB"), masc)
            quadro = quadro.convert("RGBA")
            ultimo = quadro
        elif fim_cfg and tl >= dur:
            tf = tl - dur
            quadro = marca.copy().convert("RGBA")
            camada = Image.new("RGBA", (W, H), (0, 0, 0, 0))
            d = ImageDraw.Draw(camada)
            for bx, by, r, v in bolhas[:40]:
                y = (by - tf * 0.12 * v) % 1.0
                d.ellipse((bx * W - r, y * H - r, bx * W + r, y * H + r), fill=LIMA + (60,))
            quadro.alpha_composite(camada.filter(ImageFilter.GaussianBlur(3)))
            p = suave(tf / 0.5)
            colar(quadro, logo_aura, W / 2, H * 0.17, 0.85 + 0.15 * back(min(1, tf / 0.45)), min(1, tf * 3))
            colar(quadro, logo_fresh, W / 2, H * 0.245, 1, min(1, max(0, tf - 0.15) * 3))
            if foto_pote:
                colar(quadro, foto_pote, W / 2, H * 0.52 + 14 * math.sin(tf * 2.5) + (1 - p) * 120, 1, p)
            colar(quadro, botao_final, W / 2, H * 0.82, (1 + 0.05 * math.sin(tf * 9)) * back(min(1, max(0.01, tf - 0.3) / 0.3)), min(1, max(0, tf - 0.3) * 4))
            if ultimo is not None and p < 1:
                quadro = Image.blend(ultimo, quadro, p)
        else:
            quadro = (ultimo or Image.new("RGBA", (W, H), (0, 0, 0, 255))).copy()

        if tl < dur:
            for P in ativo(cfg.get("particulas", []), t):
                a = min(1, (t - P["inicio"]) / 0.4, (P["fim"] - t) / 0.4)
                camada = Image.new("RGBA", (W, H), (0, 0, 0, 0))
                d = ImageDraw.Draw(camada)
                for bx, by, r, v in bolhas:
                    y = (by - (t - P["inicio"]) * 0.25 * v) % 1.0
                    x = bx + 0.02 * math.sin(t * 2 + by * 9)
                    d.ellipse((x * W - r, y * H - r, x * W + r, y * H + r), fill=LIMA + (int(150 * a),))
                quadro.alpha_composite(camada.filter(ImageFilter.GaussianBlur(3)))
            for c, spr in cartoes:
                e, a, oy = entrada_saida(t, c["inicio"], c["fim"])
                colar(quadro, spr, W * c.get("x", 0.5), H * c.get("y", 0.12) + oy, e, a)
            for L, itens in listas:
                _, aL, _ = entrada_saida(t, L["inicio"], L["fim"])
                if aL <= 0:
                    continue
                y = H * L.get("y", 0.12)
                for it, spr in itens:
                    if t >= it["t"]:
                        p = suave((t - it["t"]) / 0.25)
                        x = W * 0.5 - (1 - p) * W * 0.5
                        colar(quadro, spr, x, y, 1, aL * p)
                        if L.get("riscar") and t >= L["riscar"]:
                            colar(quadro, xis, x + spr.width / 2 + 5, y - 6, back(min(1, (t - L["riscar"]) / 0.2)), aL)
                        elif L.get("check") and t >= it["t"] + 0.3:
                            colar(quadro, certo, x + spr.width / 2 + 5, y - 6, back(min(1, (t - it["t"] - 0.3) / 0.2)), aL)
                        y += spr.height * 0.74
            for a_, spr in aneis:
                if a_["inicio"] <= t <= a_["fim"] and pt and caixa:
                    al = min(1, (a_["fim"] - t) / 0.2)
                    p = suave((t - a_["inicio"]) / 0.45)
                    x0, y0 = para_tela(pt[2], pt[3], caixa)
                    x1, y1 = para_tela(pt[4], pt[5], caixa)
                    mx, my = (x1 - x0) * 0.2, (y1 - y0) * 0.16
                    caixa_a = (x0 - mx, y0 - my, x1 + mx, y1 + my)
                    camada = Image.new("RGBA", (W, H), (0, 0, 0, 0))
                    d = ImageDraw.Draw(camada)
                    d.arc(caixa_a, -90, -90 + 360 * p, fill=LIMA + (int(170 * al),), width=26)
                    camada = camada.filter(ImageFilter.GaussianBlur(10))
                    d = ImageDraw.Draw(camada)
                    d.arc(caixa_a, -90, -90 + 360 * p, fill=(255, 255, 255, int(255 * al)), width=9)
                    quadro.alpha_composite(camada)
                    e, a, _ = entrada_saida(t, a_["inicio"] + 0.3, a_["fim"])
                    colar(quadro, spr, (caixa_a[0] + caixa_a[2]) / 2, caixa_a[1] - 70 + 8 * math.sin(t * 5), e, a * al)
            for c, spr in carimbos:
                if c["inicio"] <= t <= c["fim"]:
                    x = (t - c["inicio"]) / 0.18
                    e = 2.4 - 1.4 * suave(x) if x < 1 else 1
                    colar(quadro, spr, W * c.get("x", 0.5), H * c.get("y", 0.22), e, min(1, x * 2, (c["fim"] - t) / 0.15), c.get("rot", -8))
            for s, spr in selos:
                e, a, _ = entrada_saida(t, s["inicio"], s["fim"])
                colar(quadro, spr, W * s.get("x", 0.24), H * s.get("y", 0.2), e, a, 8 * math.sin(t * 3))
            for p_, spr in precos:
                e, a, _ = entrada_saida(t, p_["inicio"], p_["fim"], 0.35)
                colar(quadro, spr, W * p_.get("x", 0.5), H * p_.get("y", 0.18), e * (1 + 0.04 * math.sin(t * 8)), a, -6)
            for b, spr in botoes:
                e, a, _ = entrada_saida(t, b["inicio"], b["fim"])
                yb = H * b.get("y", 0.8)
                colar(quadro, spr, W / 2, yb, e * (1 + 0.05 * math.sin(t * 9)), a)
                colar(quadro, seta, W / 2, yb + spr.height * 0.55 + 70 + 14 * math.sin(t * 9), 0.8, a)
            for g in ativo(cfg.get("glitch", []), t):
                quadro = glitch(quadro, 1 - (t - g["inicio"]) / (g["fim"] - g["inicio"] + 1e-6) * 0.5, rnd)
            for lz in cfg.get("luz", []):
                d_ = lz.get("dur", 0.6)
                if lz["t"] <= t < lz["t"] + d_:
                    p = (t - lz["t"]) / d_
                    camada = ImageChops.offset(luz, int((p - 0.5) * W * 0.8), 0).point(lambda v, k=math.sin(math.pi * p): int(v * k * 0.55))
                    quadro = ImageChops.screen(quadro.convert("RGB"), camada).convert("RGBA")
            for fl in cfg.get("flash", []):
                if fl["t"] <= t < fl["t"] + 0.25:
                    quadro = Image.blend(quadro, Image.new("RGBA", (W, H), (255, 255, 255, 255)), (1 - (t - fl["t"]) / 0.25) * 0.85)
            ImageDraw.Draw(quadro).rectangle((0, 0, int(W * tl / dur), 7), fill=LIMA + (255,))

        enc.stdin.write(quadro.convert("RGB").tobytes())
        if n % (FPS * 10) == 0:
            print(f"  {t:5.1f}s")
    enc.stdin.close()
    dec.stdout.close()
    dec.wait()
    if enc.wait() != 0:
        sys.exit("Erro ao codificar o vídeo")
    print("Pronto:", saida)


if __name__ == "__main__":
    main()
