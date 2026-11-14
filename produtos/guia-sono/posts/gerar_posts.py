#!/usr/bin/env python3
"""Gera os posts de feed (1080x1350) da página Noites Tranquilas.

Uso: python3 produtos/guia-sono/posts/gerar_posts.py
Saída: produtos/guia-sono/posts/post-1.jpg ... post-6.jpg
"""
import os

from PIL import Image, ImageDraw, ImageFilter, ImageFont

AQUI = os.path.dirname(os.path.abspath(__file__))
BASE = os.path.dirname(AQUI)
F = os.path.join(BASE, "fontes")
ILU = os.path.join(BASE, "ilustracoes")
W, H = 1080, 1350

NOITE = (35, 39, 90)
TINTA = (35, 37, 63)
LAV = (184, 181, 232)
LAV_TINTA = (244, 243, 252)
OURO = (201, 150, 46)
OURO_CLARO = (232, 199, 122)
ROSA = (194, 96, 124)
ROSA_TINTA = (251, 240, 243)
MENTA = (59, 143, 122)
MENTA_TINTA = (238, 247, 244)
BRANCO = (255, 255, 255)


def fonte(nome, tam):
    return ImageFont.truetype(os.path.join(F, nome), tam)


SERIF = lambda t: fonte("Fraunces-SemiBold.ttf", t)
SERIF_IT = lambda t: fonte("Fraunces-Italic.ttf", t)
SANS = lambda t: fonte("NunitoSans-Regular.ttf", t)
SANS_B = lambda t: fonte("NunitoSans-Bold.ttf", t)
SANS_X = lambda t: fonte("NunitoSans-ExtraBold.ttf", t)


def quebrar(d, texto, f, largura):
    linhas, atual = [], ""
    for p in texto.split():
        teste = (atual + " " + p).strip()
        if d.textlength(teste, font=f) <= largura:
            atual = teste
        else:
            linhas.append(atual)
            atual = p
    if atual:
        linhas.append(atual)
    return linhas


def texto(d, x, y, t, f, cor, largura, entre=1.3, centro=False):
    for linha in quebrar(d, t, f, largura):
        lx = x + (largura - d.textlength(linha, font=f)) / 2 if centro else x
        d.text((lx, y), linha, font=f, fill=cor)
        y += int(f.size * entre)
    return y


def espacado(d, x, y, t, f, esp, cor, centro_em=None):
    larg = sum(d.textlength(c, font=f) for c in t) + esp * (len(t) - 1)
    if centro_em is not None:
        x = centro_em - larg / 2
    for c in t:
        d.text((x, y), c, font=f, fill=cor)
        x += d.textlength(c, font=f) + esp


def lua(d, cx, cy, r, cor, fundo):
    d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=cor)
    d.ellipse([cx - r * 0.55, cy - r * 1.15, cx + r * 1.25, cy + r * 0.65], fill=fundo)


def rodape(img, escuro=False):
    d = ImageDraw.Draw(img)
    cor = LAV if escuro else (110, 112, 144)
    fundo = NOITE if escuro else LAV_TINTA
    d.line([(90, H - 120), (W - 90, H - 120)], fill=(70, 74, 130) if escuro else (222, 221, 234), width=2)
    lua(d, 112, H - 72, 16, OURO_CLARO if escuro else OURO, fundo)
    d.text((140, H - 90), "Noites Tranquilas", font=SERIF(30), fill=BRANCO if escuro else NOITE)
    f = SANS_B(24)
    t = "@noitestranquilas.bebe"
    d.text((W - 90 - d.textlength(t, font=f), H - 84), t, font=f, fill=cor)


def colar(img, caminho, caixa, sombra=False):
    ilu = Image.open(caminho).convert("RGB")
    x0, y0, x1, y1 = caixa
    ilu.thumbnail((x1 - x0, y1 - y0), Image.LANCZOS)
    x = x0 + (x1 - x0 - ilu.width) // 2
    y = y0 + (y1 - y0 - ilu.height) // 2
    if sombra:
        s = Image.new("RGBA", (ilu.width + 80, ilu.height + 80), (0, 0, 0, 0))
        ImageDraw.Draw(s).rectangle([40, 52, 40 + ilu.width, 52 + ilu.height], fill=(0, 0, 0, 120))
        s = s.filter(ImageFilter.GaussianBlur(20))
        img.paste(s, (x - 40, y - 40), s)
    img.paste(ilu, (x, y))
    return (x, y, x + ilu.width, y + ilu.height)


def base_clara(rotulo, titulo):
    img = Image.new("RGB", (W, H), LAV_TINTA)
    d = ImageDraw.Draw(img)
    espacado(d, 90, 100, rotulo, SANS_X(26), 5, OURO)
    y = texto(d, 90, 150, titulo, SERIF(68), NOITE, W - 180, 1.18)
    d.rectangle([90, y + 18, 160, y + 22], fill=OURO)
    return img, d, y + 60


# ---------- posts ----------
def post1():
    img = Image.new("RGB", (W, H), NOITE)
    d = ImageDraw.Draw(img)
    espacado(d, 0, 110, "BEM-VINDA", SANS_X(28), 6, OURO_CLARO, centro_em=W / 2)
    texto(d, 90, 160, "Noites Tranquilas", SERIF(86), BRANCO, W - 180, 1.1, centro=True)
    d.rectangle([W / 2 - 40, 290, W / 2 + 40, 294], fill=OURO)
    texto(d, 120, 320, "Aqui a gente fala do sono do bebê com carinho, informação e zero julgamento.",
          SERIF_IT(40), LAV, W - 240, 1.35, centro=True)
    caixa = (240, 500, 840, 1100)
    # fundo branco circular para a ilustração
    d.ellipse([caixa[0] - 10, caixa[1] - 10, caixa[2] + 10, caixa[3] + 10], fill=BRANCO)
    mask = Image.new("L", (W, H), 0)
    ImageDraw.Draw(mask).ellipse(caixa, fill=255)
    camada = Image.new("RGB", (W, H), BRANCO)
    colar(camada, os.path.join(ILU, "10.png"), caixa)
    img.paste(camada, (0, 0), mask)
    texto(d, 120, 1135, "Dicas gentis para bebês de 0 a 2 anos", SANS_B(34), OURO_CLARO, W - 240, centro=True)
    rodape(img, escuro=True)
    return img


def post2():
    img, d, y = base_clara("DICA DE SONO", "Quanto tempo o bebê aguenta acordado?")
    y = texto(d, 90, y, "É a janela de sono. Passou dela, o bebê fica cansado demais e dorme pior.",
              SANS(36), TINTA, W - 180, 1.4) + 30
    linhas = [("0 a 3 meses", "45 min a 1h30"), ("4 a 6 meses", "1h30 a 2h30"), ("7 a 9 meses", "2h30 a 3h30"),
              ("10 a 12 meses", "3h a 4h"), ("1 a 2 anos", "4h a 5h30")]
    d.rectangle([90, y, W - 90, y + 70], fill=NOITE)
    d.text((120, y + 18), "IDADE", font=SANS_X(28), fill=BRANCO)
    d.text((560, y + 18), "TEMPO ACORDADO", font=SANS_X(28), fill=BRANCO)
    y += 70
    for i, (a, b) in enumerate(linhas):
        d.rectangle([90, y, W - 90, y + 92], fill=BRANCO if i % 2 == 0 else (236, 235, 250))
        d.text((120, y + 24), a, font=SANS_B(38), fill=TINTA)
        d.text((560, y + 22), b, font=SERIF(42), fill=NOITE)
        y += 92
    texto(d, 90, y + 40, "Comece o ritual do sono nos primeiros sinais de cansaço.", SERIF_IT(34), NOITE, W - 180)
    rodape(img)
    return img


def post3():
    img = Image.new("RGB", (W, H), BRANCO)
    d = ImageDraw.Draw(img)
    espacado(d, 90, 100, "MITO OU VERDADE?", SANS_X(28), 5, OURO)
    y = texto(d, 90, 160, "“Se deixar o bebê acordado o dia todo, ele dorme melhor à noite.”",
              SERIF(60), NOITE, W - 180, 1.2) + 40
    d.rounded_rectangle([90, y, 330, y + 84], radius=42, fill=ROSA)
    d.text((133, y + 14), "MITO", font=SANS_X(46), fill=BRANCO)
    y += 130
    d.rounded_rectangle([90, y, W - 90, y + 330], radius=30, fill=MENTA_TINTA)
    d.rectangle([90, y, 100, y + 330], fill=MENTA)
    d.text((140, y + 40), "A VERDADE", font=SANS_X(30), fill=MENTA)
    texto(d, 140, y + 100, "Bebê cansado demais dorme pior. O corpo libera hormônios de alerta, ele fica agitado, "
                           "briga com o sono e acorda mais à noite. Boas sonecas de dia ajudam a noite.",
          SANS(38), TINTA, W - 280, 1.45)
    rodape(img)
    return img


def post4():
    img, d, y = base_clara("PASSO A PASSO", "O ritual do sono em 7 passos")
    passos = ["Desligue as telas e baixe as luzes", "Banho morno e tranquilo", "Massagem suave",
              "Pijama e fralda no quarto", "Mamada com luz baixa", "Historinha ou canção de ninar",
              "Berço: sonolento, mas acordado"]
    y += 10
    for i, p in enumerate(passos, 1):
        d.ellipse([90, y, 160, y + 70], fill=NOITE)
        f = SERIF(38)
        d.text((125 - d.textlength(str(i), font=f) / 2, y + 8), str(i), font=f, fill=OURO_CLARO)
        d.text((190, y + 14), p, font=SANS_B(38), fill=TINTA)
        y += 104
    texto(d, 90, y + 20, "Repita na mesma ordem todas as noites. O bebê aprende pela repetição.",
          SERIF_IT(34), NOITE, W - 180)
    rodape(img)
    return img


def post5():
    img, d, y = base_clara("SONO SEGURO", "O ABC do sono seguro")
    colar(img, os.path.join(ILU, "04.png"), (90, y, W - 90, y + 360))
    y += 400
    itens = [("A", "Sozinho", "No próprio berço, sem dividir a cama com adultos."),
             ("B", "De barriga para cima", "Sempre, em todos os sonos, inclusive as sonecas."),
             ("C", "No berço vazio", "Colchão firme, sem travesseiro, protetor, pelúcia ou manta solta.")]
    for letra, tit, desc in itens:
        d.ellipse([90, y, 170, y + 80], fill=OURO)
        d.text((130 - d.textlength(letra, font=SERIF(46)) / 2, y + 6), letra, font=SERIF(46), fill=BRANCO)
        d.text((200, y + 2), tit, font=SERIF(40), fill=NOITE)
        texto(d, 200, y + 56, desc, SANS(30), TINTA, W - 290, 1.35)
        y += 160
    rodape(img)
    return img


def post6():
    img = Image.new("RGB", (W, H), NOITE)
    d = ImageDraw.Draw(img)
    espacado(d, 0, 100, "GUIA PRÁTICO DO SONO DO BEBÊ", SANS_X(26), 5, OURO_CLARO, centro_em=W / 2)
    texto(d, 90, 150, "Noites tranquilas começam com a rotina certa", SERIF(62), BRANCO, W - 180, 1.18, centro=True)
    capa = os.path.join(BASE, "saida", "capa-retrato.jpg")
    colar(img, capa, (330, 370, 750, 960), sombra=True)
    itens = ["Rotinas prontas de 0 a 2 anos", "Plano gentil de 7 noites", "Imprimíveis inclusos"]
    y = 1000
    for t in itens:
        f = SANS_B(36)
        larg = d.textlength(t, font=f) + 50
        x = (W - larg) / 2
        d.line([(x, y + 22), (x + 12, y + 34), (x + 32, y + 8)], fill=OURO_CLARO, width=5)
        d.text((x + 50, y), t, font=f, fill=BRANCO)
        y += 56
    rodape(img, escuro=True)
    return img


if __name__ == "__main__":
    for i, f in enumerate([post1, post2, post3, post4, post5, post6], 1):
        caminho = os.path.join(AQUI, f"post-{i}.jpg")
        f().save(caminho, "JPEG", quality=90)
        print(caminho)
