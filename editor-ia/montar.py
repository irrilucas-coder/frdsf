#!/usr/bin/env python3
"""Monta o vídeo final a partir de um plano.json (estilo Aura Fresh: a fala fica intacta, tudo entra em camadas).

Uso:  python3 editor-ia/montar.py pasta-do-trabalho/plano.json [--saida final.mp4] [--previa]
Precisa: ffmpeg/ffprobe e Pillow (pip install pillow).

Os caminhos dentro do plano são relativos à pasta do plano.json. Tipos de cena:
  cheia     → cena 9:16 cobrindo a tela toda
  dividida  → criadora em cima, cena 16:9 embaixo, com linha verde separando
  pip       → cena 9:16 de fundo, criadora num quadro no canto inferior esquerdo
Uma cena pode ser vídeo (.mp4/.mov) ou imagem (.png/.jpg — ganha zoom lento).
Efeitos sonoros: whoosh, pop, ding, impacto, erro, moeda, clique, subida.
Para usar o seu próprio som, coloque sfx/<nome>.wav (ou .mp3) na pasta do plano.
"""
import json, math, os, re, shutil, subprocess, sys, tempfile
from PIL import Image, ImageDraw, ImageFilter, ImageFont

AQUI = os.path.dirname(os.path.abspath(__file__))
FONTE = os.path.join(AQUI, "fontes", "Montserrat-Italic.ttf")
FONTE_RESERVA = "/usr/share/fonts/opentype/inter/Inter-BoldItalic.otf"
VERDE_LINHA = "0x7BC043"
IMAGEM = re.compile(r"\.(png|jpe?g|webp)$", re.I)

# Sons sintetizados (expressões do aevalsrc do ffmpeg) — usados quando não há sfx/<nome>.wav
SONS = {
    "whoosh": ("anoisesrc=d=0.55:c=pink:a=0.9,lowpass=f=2600,highpass=f=300,afade=in:d=0.3:curve=exp,afade=out:st=0.3:d=0.25", None),
    "pop": (None, "sin(2*PI*(500+900*exp(-30*t))*t)*exp(-22*t)|0.18"),
    "ding": (None, "(sin(2*PI*1318*t)*exp(-4*t)+0.4*sin(2*PI*2637*t)*exp(-7*t))*0.6|1.3"),
    "impacto": (None, "sin(2*PI*(45+90*exp(-9*t))*t)*exp(-3.2*t)|1.1"),
    "erro": (None, "0.35*sgn(sin(2*PI*140*t))*exp(-3*t)*lt(t,0.18)+0.35*sgn(sin(2*PI*110*(t-0.2)))*exp(-3*(t-0.2))*gte(t,0.2)|0.55"),
    "moeda": (None, "0.5*sin(2*PI*2093*t)*exp(-9*t)+0.5*sin(2*PI*2637*(t-0.09))*exp(-6*(t-0.09))*gte(t,0.09)|0.9"),
    "clique": (None, "(random(0)*2-1)*exp(-180*t)|0.05"),
    "subida": (None, "0.5*sin(2*PI*(180+500*t*t)*t)*(t/1.4)|1.4"),
}


def rodar(cmd):
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0:
        sys.exit("Erro no ffmpeg:\n" + " ".join(cmd)[:2000] + "\n\n" + r.stderr[-3000:])
    return r


def sonda(arquivo):
    j = json.loads(rodar(["ffprobe", "-v", "error", "-print_format", "json", "-show_format", "-show_streams", arquivo]).stdout)
    return float(j["format"]["duration"]), any(s["codec_type"] == "audio" for s in j["streams"])


# ---------- legendas ----------
def tempo_srt(s):
    h, m, rest = s.strip().replace(".", ",").split(":")
    seg, ms = rest.split(",")
    return int(h) * 3600 + int(m) * 60 + int(seg) + int(ms) / 1000


def palavras_do_srt(caminho):
    """Cada bloco do SRT vira palavras, dividindo o tempo do bloco pelo tamanho de cada palavra."""
    texto = open(caminho, encoding="utf-8-sig").read().replace("\r", "")
    saida = []
    for bloco in re.split(r"\n\s*\n", texto.strip()):
        linhas = bloco.strip().split("\n")
        idx = next((i for i, l in enumerate(linhas) if "-->" in l), None)
        if idx is None:
            continue
        ini, fim = (tempo_srt(x) for x in linhas[idx].split("-->"))
        ws = " ".join(linhas[idx + 1:]).split()
        if not ws:
            continue
        pesos = [len(w) + 2 for w in ws]
        total, t = sum(pesos), ini
        for w, p in zip(ws, pesos):
            d = (fim - ini) * p / total
            saida.append({"t": round(t, 3), "fim": round(t + d, 3), "texto": w})
            t += d
    return saida


def carregar_fonte(tam):
    try:
        f = ImageFont.truetype(FONTE, tam)
        f.set_variation_by_axes([900])
        return f
    except Exception:
        return ImageFont.truetype(FONTE_RESERVA, tam)


def png_palavra(texto, destino, W, cor, escala=1.0):
    alto = int(W * 0.24)
    tam = int(W * 0.085 * escala)
    texto = re.sub(r"[^\w%$!?\-+&ºª/]", "", texto, flags=re.U).upper() or " "
    fonte = carregar_fonte(tam)
    while fonte.getlength(texto) > W * 0.9 and tam > 20:
        tam -= 4
        fonte = carregar_fonte(tam)
    img = Image.new("RGBA", (W, alto), (0, 0, 0, 0))
    sombra = Image.new("RGBA", (W, alto), (0, 0, 0, 0))
    ds = ImageDraw.Draw(sombra)
    x, y = W / 2, alto / 2
    ds.text((x + tam * 0.04, y + tam * 0.06), texto, font=fonte, fill=(0, 0, 0, 200), anchor="mm")
    sombra = sombra.filter(ImageFilter.GaussianBlur(tam * 0.06))
    img.alpha_composite(sombra)
    d = ImageDraw.Draw(img)
    d.text((x, y), texto, font=fonte, fill=cor, anchor="mm",
           stroke_width=max(1, tam // 40), stroke_fill=(0, 0, 0, 90))
    img.save(destino)


def faixa_de_legendas(palavras, destaques, tmp, W, total):
    """Gera os PNGs de cada palavra e uma lista do concat do ffmpeg (com 'pop' de entrada)."""
    pasta = os.path.join(tmp, "leg")
    os.makedirs(pasta, exist_ok=True)
    vazio = os.path.join(pasta, "vazio.png")
    Image.new("RGBA", (W, int(W * 0.24)), (0, 0, 0, 0)).save(vazio)
    dest = {re.sub(r"\W", "", w.lower()) for w in destaques}
    linhas, t = [], 0.0

    def item(arq, dur):
        if dur > 0.001:
            linhas.append(f"file '{arq}'\nduration {dur:.3f}")

    for i, p in enumerate(palavras):
        ini, fim = max(p["t"], t), min(p["fim"], total)
        if fim <= ini:
            continue
        item(vazio, ini - t)
        cor = (182, 227, 90, 255) if re.sub(r"\W", "", p["texto"].lower()) in dest else (255, 255, 255, 255)
        a, b = os.path.join(pasta, f"{i}p.png"), os.path.join(pasta, f"{i}.png")
        png_palavra(p["texto"], a, W, cor, 0.86)
        png_palavra(p["texto"], b, W, cor)
        pop = min(0.06, (fim - ini) / 2)
        item(a, pop)
        item(b, fim - ini - pop)
        t = fim
    item(vazio, max(total - t, 0.1))
    linhas.append(f"file '{vazio}'")
    lista = os.path.join(tmp, "legendas.txt")
    open(lista, "w").write("ffconcat version 1.0\n" + "\n".join(linhas) + "\n")
    return lista


# ---------- gráficos e sons ----------
def png_seta(destino, W):
    w, h = int(W * 0.14), int(W * 0.19)
    img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    hast = w * 0.22
    pts = [(w / 2 - hast, 0), (w / 2 + hast, 0), (w / 2 + hast, h * 0.5), (w * 0.95, h * 0.5),
           (w / 2, h * 0.97), (w * 0.05, h * 0.5), (w / 2 - hast, h * 0.5)]
    d.polygon(pts, fill=(229, 57, 53, 255), outline=(255, 255, 255, 255), width=max(3, w // 30))
    img.save(destino)


def arquivo_de_som(nome, pasta_plano, tmp):
    for ext in ("wav", "mp3", "m4a", "ogg"):
        p = os.path.join(pasta_plano, "sfx", f"{nome}.{ext}")
        if os.path.exists(p):
            return p
    if nome not in SONS:
        sys.exit(f"Efeito sonoro desconhecido: {nome}. Use um destes: {', '.join(SONS)} ou ponha sfx/{nome}.wav")
    destino = os.path.join(tmp, f"sfx-{nome}.wav")
    if not os.path.exists(destino):
        filtro, expr = SONS[nome]
        if expr:
            e, d = expr.split("|")
            filtro = f"aevalsrc='{e}':s=48000:d={d}"
        rodar(["ffmpeg", "-y", "-loglevel", "error", "-f", "lavfi", "-i", filtro, "-ac", "2", "-ar", "48000", destino])
    return destino


# ---------- montagem ----------
def cobrir(w, h):
    return f"scale={w}:{h}:force_original_aspect_ratio=increase,crop={w}:{h},setsar=1"


def main():
    args = sys.argv[1:]
    if not args:
        sys.exit(__doc__)
    previa = "--previa" in args
    saida = args[args.index("--saida") + 1] if "--saida" in args else None
    plano_path = os.path.abspath(args[0])
    base = os.path.dirname(plano_path)
    plano = json.load(open(plano_path, encoding="utf-8"))
    cam = lambda p: p if os.path.isabs(p) else os.path.join(base, p)

    W, H = (540, 960) if previa else (1080, 1920)
    FPS = 25 if previa else plano.get("fps", 50)
    bruto = cam(plano["bruto"])
    dur_bruto, tem_audio = sonda(bruto)
    preto = plano.get("final_preto", 1.0)
    total = dur_bruto + preto
    saida = saida or os.path.join(base, "previa.mp4" if previa else "final.mp4")
    tmp = tempfile.mkdtemp(prefix="montar-")

    if "palavras" in plano:
        palavras = plano["palavras"]
    elif plano.get("legendas"):
        palavras = palavras_do_srt(cam(plano["legendas"]))
    else:
        palavras = []

    entradas = ["-i", bruto]
    n = 1  # índice da próxima entrada
    cenas = sorted(plano.get("cenas", []), key=lambda c: c["inicio"])
    pips = sum(1 for c in cenas if c["tipo"] == "pip")
    filtros = [f"[0:v]fps={FPS},{cobrir(W, H)},format=yuv420p,"
               f"tpad=stop_mode=add:stop_duration={preto}:color=black"
               + (f",boxblur=20:1:enable='lt(t,0.12)'" if plano.get("abertura", True) else "")
               + (f",split={pips + 1}[v0]" + "".join(f"[cri{i}]" for i in range(pips)) if pips else "[v0]")]
    atual, k_pip = "v0", 0
    painel = int(H * 0.375)  # altura da cena de baixo na tela dividida (1080x720 em Full HD)

    for i, c in enumerate(cenas):
        arq = cam(c["arquivo"])
        if not os.path.exists(arq):
            sys.exit(f"Cena {c.get('id', i + 1)}: arquivo não encontrado: {arq}")
        a, b = float(c["inicio"]), float(c["fim"])
        d = b - a
        tipo = c["tipo"]
        w, h = (W, painel) if tipo == "dividida" else (W, H)
        if IMAGEM.search(arq):
            entradas += ["-loop", "1", "-framerate", str(FPS), "-t", f"{d:.3f}", "-i", arq]
            z = int(d * FPS) + 1
            mov = (f"scale={w * 2}:{h * 2}:force_original_aspect_ratio=increase,crop={w * 2}:{h * 2},"
                   f"zoompan=z='1+0.1*on/{z}':d=1:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s={w}x{h}:fps={FPS},setsar=1")
        else:
            entradas += ["-i", arq]
            ini = float(c.get("inicio_no_clipe", 0))
            mov = (f"trim=start={ini},setpts=PTS-STARTPTS,fps={FPS},{cobrir(w, h)},"
                   f"tpad=stop_mode=clone:stop_duration={d:.3f}")
        cadeia = f"[{n}:v]{mov},trim=duration={d:.3f},format=yuv420p"
        if tipo == "dividida":
            cadeia += f",drawbox=x=0:y=0:w=iw:h={max(3, H // 300)}:color={VERDE_LINHA}:t=fill"
        filtros.append(f"{cadeia},setpts=PTS-STARTPTS+{a:.3f}/TB[c{i}]")
        en = f"enable='between(t,{a:.3f},{b:.3f})'"
        y = H - painel if tipo == "dividida" else 0
        filtros.append(f"[{atual}][c{i}]overlay=0:{y}:eof_action=pass:{en}[o{i}]")
        atual = f"o{i}"
        if tipo == "pip":
            pw, ph = int(W * 0.45), int(W * 0.45 * 16 / 9)
            borda = max(2, W // 180)
            filtros.append(f"[cri{k_pip}]{cobrir(pw, ph)},pad=iw+{2 * borda}:ih+{2 * borda}:{borda}:{borda}:color=white[pp{i}]")
            filtros.append(f"[{atual}][pp{i}]overlay={int(W * 0.03)}:{H - ph - 2 * borda - int(H * 0.025)}:{en}[q{i}]")
            atual = f"q{i}"
            k_pip += 1
        n += 1

    if plano.get("abertura", True):
        filtros.append(f"color=white:s={W}x{H}:d=0.3:r={FPS},format=rgba,fade=out:st=0:d=0.3:alpha=1[flash]")
        filtros.append(f"[{atual}][flash]overlay=0:0:eof_action=pass[fl]")
        atual = "fl"

    for j, s in enumerate(plano.get("seta", [])):
        seta = os.path.join(tmp, "seta.png")
        png_seta(seta, W)
        entradas += ["-loop", "1", "-framerate", str(FPS), "-i", seta]
        x = {"esquerda": int(W * 0.1), "centro": int(W * 0.43), "direita": int(W * 0.76)}[s.get("posicao", "esquerda")]
        filtros.append(f"[{atual}][{n}:v]overlay={x}:'{int(H * 0.8)}+{int(H * 0.012)}*sin(2*PI*2.2*t)'"
                       f":shortest=0:eof_action=pass:enable='between(t,{s['inicio']},{s['fim']})'[s{j}]")
        atual = f"s{j}"
        n += 1

    if palavras:
        lista = faixa_de_legendas(palavras, plano.get("destaques", []), tmp, W, dur_bruto)
        entradas += ["-f", "concat", "-safe", "0", "-i", lista]
        filtros.append(f"[{n}:v]fps={FPS},format=rgba[leg]")
        filtros.append(f"[{atual}][leg]overlay=0:{int(H * 0.62 - W * 0.12)}:eof_action=pass[lg]")
        atual = "lg"
        n += 1
    filtros.append(f"[{atual}]trim=duration={total:.3f},format=yuv420p[vout]")

    # áudio: voz original + efeitos
    if tem_audio:
        filtros.append(f"[0:a]aresample=48000,aformat=channel_layouts=stereo,apad=whole_dur={total:.3f}[voz]")
    else:
        filtros.append(f"anullsrc=r=48000:cl=stereo,atrim=duration={total:.3f}[voz]")
    sfx = list(plano.get("sfx", []))
    if plano.get("abertura", True) and not any(float(s["t"]) < 0.3 for s in sfx):
        sfx.insert(0, {"t": 0, "som": "whoosh", "volume": 0.5})
    rotulos = ["[voz]"]
    for j, s in enumerate(sfx):
        entradas += ["-i", arquivo_de_som(s["som"], base, tmp)]
        ms = int(float(s["t"]) * 1000)
        filtros.append(f"[{n}:a]aresample=48000,aformat=channel_layouts=stereo,adelay={ms}:all=1,volume={s.get('volume', 0.6)}[fx{j}]")
        rotulos.append(f"[fx{j}]")
        n += 1
    filtros.append(f"{''.join(rotulos)}amix=inputs={len(rotulos)}:normalize=0:duration=first,alimiter=limit=0.95[aout]")

    script = os.path.join(tmp, "filtro.txt")
    open(script, "w").write(";\n".join(filtros))
    cmd = ["ffmpeg", "-y", "-hide_banner", "-loglevel", "error", *entradas, "-filter_complex_script", script,
           "-map", "[vout]", "-map", "[aout]", "-t", f"{total:.3f}", "-r", str(FPS),
           "-c:v", "libx264", "-preset", "ultrafast" if previa else "medium", "-crf", "28" if previa else "19",
           "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", saida]
    print(f"Montando {len(cenas)} cenas, {len(palavras)} palavras de legenda, {len(sfx)} efeitos → {saida}")
    rodar(cmd)
    shutil.rmtree(tmp, ignore_errors=True)
    print("Pronto:", saida)


if __name__ == "__main__":
    main()
