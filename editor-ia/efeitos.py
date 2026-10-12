#!/usr/bin/env python3
"""Edição "premium" só com efeitos próprios (sem cenas geradas): câmera dinâmica, gráficos animados e efeitos sonoros.

Uso:  python3 editor-ia/efeitos.py trabalhos/<nome>/edicao.json [--saida final.mp4] [--ate SEGUNDOS]

O vídeo da criadora não é cortado: a câmera dá zoom/punch-in nos momentos fortes e os gráficos entram por cima,
sempre no alto ou embaixo da tela (o meio fica livre para as legendas do CapCut).
Elementos do edicao.json (tempos em segundos, posições de 0 a 1):
  camera     [{t, z, cx, cy, corte|suave}]   zoom: corte = instantâneo, suave = segundos de transição
  tremor     [{inicio, fim, forca}]
  flash      [{t}]
  cartao     [{inicio, fim, texto, emoji, y, estilo}]           estilo: verde | branco | escuro | vermelho
  lista      [{inicio, fim, y, estilo, itens:[{t, emoji, texto}], riscar, check}]
  carimbo    [{inicio, fim, texto, y, cor, rot}]
  selo       [{inicio, fim, linhas:[...], x, y}]                 selo redondo
  produto    [{inicio, fim, texto, x, y}]                        etiqueta apontando para o produto
  particulas [{inicio, fim}]
  preco      [{inicio, fim, valor, sub, y}]
  botao      [{inicio, fim, texto, y}]
  final      {duracao, linhas:[...]}                             tela final da marca depois da fala
  sfx        [{t, som, volume}]                                  mesmos sons do montar.py
"""
import json, math, os, random, subprocess, sys, tempfile
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import montar  # reaproveita fontes e efeitos sonoros

W, H, FPS = 1080, 1920, 30
EMOJI = "/usr/share/fonts/truetype/noto/NotoColorEmoji.ttf"
VERDE, VERDE_ESC, LIMA, VERMELHO = (31, 77, 58), (16, 42, 32), (182, 227, 90), (229, 57, 53)
ESTILOS = {  # fundo, texto
    "verde": (VERDE + (240,), (255, 255, 255)),
    "branco": ((255, 255, 255, 245), (20, 30, 25)),
    "escuro": ((15, 20, 18, 225), (255, 255, 255)),
    "vermelho": (VERMELHO + (245,), (255, 255, 255)),
    "lima": (LIMA + (250,), VERDE_ESC),
}


# ---------- curvas de animação ----------
def back(x):
    c1 = 1.70158
    return 1 + (c1 + 1) * (x - 1) ** 3 + c1 * (x - 1) ** 2


def suave(x):
    x = min(max(x, 0), 1)
    return x * x * (3 - 2 * x)


def entrada_saida(t, a, b, ent=0.28, sai=0.18):
    """(escala, opacidade) de um elemento visível entre a e b, com 'pop' na entrada."""
    if t < a or t > b:
        return 0, 0
    x, y = (t - a) / ent, (b - t) / sai
    if x < 1:
        return max(0.01, back(x)), min(1, x * 2.5)
    if y < 1:
        return 1 - 0.15 * (1 - y), y
    return 1, 1


# ---------- desenho de sprites ----------
_fontes = {}


def fonte(tam):
    if tam not in _fontes:
        _fontes[tam] = montar.carregar_fonte(tam)
    return _fontes[tam]


def emoji_img(e, alto):
    f = ImageFont.truetype(EMOJI, 109)
    img = Image.new("RGBA", (160, 160), (0, 0, 0, 0))
    ImageDraw.Draw(img).text((80, 80), e, font=f, embedded_color=True, anchor="mm")
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
    return s


def pilula(texto, emoji=None, estilo="verde", tam=64, larg_max=int(W * 0.86)):
    fundo, cor = ESTILOS[estilo]
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
    d.rounded_rectangle((0, 0, w - 1, h - 1), radius=int(h * 0.32 if len(linhas) == 1 else tam * 0.5), fill=fundo)
    x = pad
    if e:
        img.alpha_composite(e, (x, (h - e.height) // 2))
        x += e.width + gap
    for i, l in enumerate(linhas):
        y = (h - alt_linha * len(linhas)) / 2 + alt_linha * (i + 0.5)
        d.text((x + larg_txt / 2, y), l, font=f, fill=cor, anchor="mm")
    return sombra(img)


def carimbo_img(texto, cor=VERMELHO, tam=110):
    f = fonte(tam)
    w, h = int(f.getlength(texto.upper()) + tam * 0.9), int(tam * 1.5)
    img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    esp = max(6, tam // 12)
    d.rounded_rectangle((esp, esp, w - esp, h - esp), radius=tam // 5, outline=cor + (255,), width=esp)
    d.text((w / 2, h / 2), texto.upper(), font=f, fill=cor + (255,), anchor="mm")
    return sombra(img, 10, 6, 120)


def selo_img(linhas, d_px=330):
    img = Image.new("RGBA", (d_px, d_px), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    pts = []
    for k in range(48):  # estrela/"burst" com 24 pontas
        r = d_px / 2 if k % 2 == 0 else d_px * 0.44
        a = math.pi * 2 * k / 48
        pts.append((d_px / 2 + r * math.cos(a), d_px / 2 + r * math.sin(a)))
    d.polygon(pts, fill=LIMA + (255,))
    d.ellipse((d_px * 0.1, d_px * 0.1, d_px * 0.9, d_px * 0.9), outline=VERDE_ESC + (255,), width=5)
    tams = [int(d_px * 0.2), int(d_px * 0.1), int(d_px * 0.09)]
    ys = [0.42, 0.62, 0.74] if len(linhas) > 1 else [0.5]
    for i, l in enumerate(linhas):
        d.text((d_px / 2, d_px * ys[i]), l.upper(), font=fonte(tams[min(i, 2)]), fill=VERDE_ESC, anchor="mm")
    return sombra(img, 14, 8, 140)


def seta_img(tam=150):
    img = Image.new("RGBA", (tam, int(tam * 1.2)), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    w, h = img.size
    pts = [(w * .3, 0), (w * .7, 0), (w * .7, h * .5), (w * .95, h * .5), (w / 2, h * .97), (w * .05, h * .5), (w * .3, h * .5)]
    d.polygon(pts, fill=VERMELHO + (255,), outline=(255, 255, 255, 255), width=6)
    return sombra(img, 10, 6, 120)


def final_img(linhas):
    img = Image.new("RGB", (W, H), VERDE_ESC)
    g = Image.new("L", (W, H), 0)
    ImageDraw.Draw(g).ellipse((-W * .3, H * .15, W * 1.3, H * .85), fill=110)
    g = g.filter(ImageFilter.GaussianBlur(160))
    img = Image.composite(Image.new("RGB", (W, H), VERDE), img, g)
    d = ImageDraw.Draw(img)
    d.text((W / 2, H * .42), "aura", font=fonte(230), fill=LIMA, anchor="ms")
    d.text((W / 2, H * .47), "FRESH", font=fonte(110), fill=(255, 255, 255), anchor="ms")
    for i, l in enumerate(linhas):
        d.text((W / 2, H * .56 + i * 90), l.upper(), font=fonte(58), fill=(255, 255, 255), anchor="mm")
    return img


def colar(quadro, spr, cx, cy, escala=1.0, alfa=1.0, rot=0):
    if alfa <= 0.01:
        return
    if escala != 1 or rot:
        spr = spr.resize((max(1, int(spr.width * escala)), max(1, int(spr.height * escala))), Image.BILINEAR)
        if rot:
            spr = spr.rotate(rot, Image.BILINEAR, expand=True)
    if alfa < 1:
        a = np.asarray(spr.getchannel("A"), dtype=np.float32) * alfa
        spr = spr.copy()
        spr.putalpha(Image.fromarray(a.astype(np.uint8)))
    quadro.alpha_composite(spr, (int(cx - spr.width / 2), int(cy - spr.height / 2)))


# ---------- câmera ----------
def camera(kfs, t):
    """Zoom e centro no tempo t. Cada ponto: corte (pula na hora) ou suave (transição de N segundos)."""
    z, cx, cy, ini = 1.0, 0.5, 0.42, 0.0
    for k in kfs:
        if k["t"] > t:
            break
        alvo = (k.get("z", 1.0), k.get("cx", 0.5), k.get("cy", 0.42))
        if k.get("suave"):
            p = suave((t - k["t"]) / k["suave"])
            z, cx, cy = (a + (b - a) * p for a, b in zip((z, cx, cy), alvo))
        else:
            z, cx, cy = alvo
        ini = k["t"]
    z *= 1 + min(0.03, 0.01 * (t - ini))  # empurrão lento contínuo: a imagem nunca fica parada
    return z, cx, cy


def recorte(img, z, cx, cy, dx=0, dy=0):
    w, h = W / z, H / z
    x0 = min(max(cx * W - w / 2 + dx, 0), W - w)
    y0 = min(max(cy * H - h / 2 + dy, 0), H - h)
    return img.resize((W, H), Image.BILINEAR, box=(x0, y0, x0 + w, y0 + h))


# ---------- principal ----------
def main():
    args = sys.argv[1:]
    if not args:
        sys.exit(__doc__)
    cfg_path = os.path.abspath(args[0])
    base = os.path.dirname(cfg_path)
    cfg = json.load(open(cfg_path, encoding="utf-8"))
    saida = args[args.index("--saida") + 1] if "--saida" in args else os.path.join(base, "final.mp4")
    bruto = cfg["bruto"] if os.path.isabs(cfg["bruto"]) else os.path.join(base, cfg["bruto"])
    dur, tem_audio = montar.sonda(bruto)
    if "--ate" in args:
        dur = min(dur, float(args[args.index("--ate") + 1]))
    fim_cfg = cfg.get("final")
    total = dur + (fim_cfg["duracao"] if fim_cfg else 0)
    n_quadros = int(total * FPS)
    tmp = tempfile.mkdtemp(prefix="efeitos-")

    # sprites prontos (desenhados uma vez)
    cartoes = [(c, pilula(c["texto"], c.get("emoji"), c.get("estilo", "verde"), c.get("tam", 72))) for c in cfg.get("cartao", [])]
    listas = []
    for L in cfg.get("lista", []):
        itens = [(it, pilula(it["texto"], it.get("emoji"), L.get("estilo", "branco"), 62, int(W * 0.72))) for it in L["itens"]]
        listas.append((L, itens))
    carimbos = [(c, carimbo_img(c["texto"], tuple(c.get("cor", VERMELHO)))) for c in cfg.get("carimbo", [])]
    selos = [(s, selo_img(s["linhas"])) for s in cfg.get("selo", [])]
    produtos = [(p, pilula(p["texto"], "✨", "lima", 50)) for p in cfg.get("produto", [])]
    precos = [(p, selo_img([p["valor"], p.get("sub", "")], 420)) for p in cfg.get("preco", [])]
    botoes = [(b, pilula(b["texto"], "👇", "vermelho", 66)) for b in cfg.get("botao", [])]
    seta = seta_img()
    xis = emoji_img("❌", 70)
    certo = emoji_img("✅", 64)
    tela_final = final_img(fim_cfg.get("linhas", [])) if fim_cfg else None
    rnd = random.Random(7)
    bolhas = [(rnd.random(), rnd.random(), 8 + rnd.random() * 26, 0.5 + rnd.random()) for _ in range(70)]

    # áudio: voz + efeitos
    audio = os.path.join(tmp, "audio.wav")
    ent, filtros, rot = [], [], []
    if tem_audio:
        ent += ["-i", bruto]
        filtros.append(f"[0:a]atrim=duration={dur:.3f},aresample=48000,aformat=channel_layouts=stereo,apad=whole_dur={total:.3f}[voz]")
    else:
        filtros.append(f"anullsrc=r=48000:cl=stereo,atrim=duration={total:.3f}[voz]")
    rot.append("[voz]")
    sons = [s for s in cfg.get("sfx", []) if s["t"] < total]
    for j, s in enumerate(sons):
        ent += ["-i", montar.arquivo_de_som(s["som"], base, tmp)]
        k = j + (1 if tem_audio else 0)
        filtros.append(f"[{k}:a]aresample=48000,aformat=channel_layouts=stereo,adelay={int(s['t'] * 1000)}:all=1,volume={s.get('volume', 0.5)}[f{j}]")
        rot.append(f"[f{j}]")
    filtros.append(f"{''.join(rot)}amix=inputs={len(rot)}:normalize=0:duration=first,alimiter=limit=0.95[a]")
    montar.rodar(["ffmpeg", "-y", "-loglevel", "error", *ent, "-filter_complex", ";".join(filtros), "-map", "[a]", "-t", f"{total:.3f}", audio])

    # vídeo: decodifica já com correção de cor, aplica câmera + gráficos, codifica
    grade = "eq=contrast=1.07:saturation=1.15:gamma=0.98,colorbalance=rs=0.02:bs=-0.03:rh=0.03:bh=-0.02,vignette=PI/5"
    dec = subprocess.Popen(["ffmpeg", "-v", "error", "-i", bruto, "-t", f"{dur:.3f}", "-vf",
                            f"fps={FPS},scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H},{grade}",
                            "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], stdout=subprocess.PIPE)
    enc = subprocess.Popen(["ffmpeg", "-y", "-v", "error", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", str(FPS),
                            "-i", "-", "-i", audio, "-vf", "noise=alls=3:allf=t", "-c:v", "libx264", "-preset", "medium",
                            "-crf", "18", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k", "-shortest",
                            "-movflags", "+faststart", saida], stdin=subprocess.PIPE)
    kfs = sorted(cfg.get("camera", []), key=lambda k: k["t"])
    tam_q = W * H * 3
    ultimo = None
    print(f"Renderizando {n_quadros} quadros ({total:.1f}s)...")
    for n in range(n_quadros):
        t = n / FPS
        dados = dec.stdout.read(tam_q) if t < dur else b""
        if len(dados) == tam_q:
            img = Image.frombuffer("RGB", (W, H), dados)
            dx = dy = 0
            for tr in cfg.get("tremor", []):
                if tr["inicio"] <= t <= tr["fim"]:
                    f = tr.get("forca", 18) * (1 - (t - tr["inicio"]) / (tr["fim"] - tr["inicio"] + 1e-6))
                    dx, dy = f * math.sin(t * 91), f * math.cos(t * 73)
            z, cx, cy = camera(kfs, t)
            if dx or dy:
                z = max(z, 1.04)
            quadro = recorte(img, z, cx, cy, dx, dy).convert("RGBA")
            ultimo = quadro
        elif tela_final is not None and t >= dur:
            quadro = tela_final.convert("RGBA")
            p = suave((t - dur) / 0.5)
            if ultimo is not None and p < 1:
                quadro = Image.blend(ultimo, quadro, p)
            zf = 1 + 0.04 * (t - dur) / max(fim_cfg["duracao"], 0.1)
            quadro = recorte(quadro.convert("RGB"), zf, 0.5, 0.5).convert("RGBA")
        else:
            quadro = (ultimo or Image.new("RGBA", (W, H), (0, 0, 0, 255))).copy()

        # partículas verdes subindo
        for P in cfg.get("particulas", []):
            if P["inicio"] <= t <= P["fim"]:
                a = min(1, (t - P["inicio"]) / 0.4, (P["fim"] - t) / 0.4)
                camada = Image.new("RGBA", (W, H), (0, 0, 0, 0))
                d = ImageDraw.Draw(camada)
                for bx, by, r, v in bolhas:
                    y = (by - (t - P["inicio"]) * 0.25 * v) % 1.0
                    x = bx + 0.02 * math.sin(t * 2 + by * 9)
                    d.ellipse((x * W - r, y * H - r, x * W + r, y * H + r), fill=LIMA + (int(150 * a),))
                camada = camada.filter(ImageFilter.GaussianBlur(3))
                quadro.alpha_composite(camada)

        for c, spr in cartoes:
            e, a = entrada_saida(t, c["inicio"], c["fim"])
            colar(quadro, spr, W * c.get("x", 0.5), H * c.get("y", 0.12), e, a)
        for L, itens in listas:
            _, aL = entrada_saida(t, L["inicio"], L["fim"])
            if aL <= 0:
                continue
            y = H * L.get("y", 0.12)
            for it, spr in itens:
                if t >= it["t"]:
                    p = suave((t - it["t"]) / 0.25)
                    cx = W * 0.5 - (1 - p) * W * 0.6
                    colar(quadro, spr, cx, y, 1, aL * p)
                    if L.get("riscar") and t >= L["riscar"]:
                        ex = back(min(1, (t - L["riscar"]) / 0.2))
                        colar(quadro, xis, cx + spr.width / 2 + 5, y - 6, ex, aL)
                    elif L.get("check") and t >= it["t"] + 0.3:
                        ex = back(min(1, (t - it["t"] - 0.3) / 0.2))
                        colar(quadro, certo, cx + spr.width / 2 + 5, y - 6, ex, aL)
                    y += spr.height * 0.74
        for c, spr in carimbos:
            if c["inicio"] <= t <= c["fim"]:
                x = (t - c["inicio"]) / 0.18
                e = 2.4 - 1.4 * suave(x) if x < 1 else 1
                a = min(1, x * 2, (c["fim"] - t) / 0.15)
                colar(quadro, spr, W * c.get("x", 0.5), H * c.get("y", 0.22), e, a, c.get("rot", -8))
        for s, spr in selos:
            e, a = entrada_saida(t, s["inicio"], s["fim"])
            colar(quadro, spr, W * s.get("x", 0.24), H * s.get("y", 0.2), e, a, 8 * math.sin(t * 3))
        for p, spr in produtos:
            e, a = entrada_saida(t, p["inicio"], p["fim"])
            colar(quadro, spr, W * p.get("x", 0.66), H * p.get("y", 0.4) + 10 * math.sin(t * 5), e, a)
        for p, spr in precos:
            e, a = entrada_saida(t, p["inicio"], p["fim"], 0.35)
            colar(quadro, spr, W * p.get("x", 0.5), H * p.get("y", 0.18), e * (1 + 0.04 * math.sin(t * 8)), a, -6)
        for b, spr in botoes:
            e, a = entrada_saida(t, b["inicio"], b["fim"])
            yb = H * b.get("y", 0.8)
            colar(quadro, spr, W / 2, yb, e * (1 + 0.05 * math.sin(t * 9)), a)
            colar(quadro, seta, W / 2, yb + spr.height * 0.55 + 70 + 14 * math.sin(t * 9), 0.8, a)
        for fl in cfg.get("flash", []):
            if fl["t"] <= t < fl["t"] + 0.25:
                a = 1 - (t - fl["t"]) / 0.25
                quadro = Image.blend(quadro, Image.new("RGBA", (W, H), (255, 255, 255, 255)), a * 0.85)

        # barra de progresso fina no topo (segura a atenção até o fim)
        if t < dur:
            ImageDraw.Draw(quadro).rectangle((0, 0, int(W * t / dur), 7), fill=LIMA + (255,))
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
