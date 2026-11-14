#!/usr/bin/env python3
"""Gera o e-book "Noites Tranquilas — Guia Prático do Sono do Bebê" em PDF (A4).

Ilustrações (opcionais): coloque em produtos/guia-sono/ilustracoes/ com o número do
prompt no nome (1.png, 02.jpg, "ilustração 4.png"...). Veja prompts-ilustracoes.md.

Uso: python3 produtos/guia-sono/gerar_guia.py
Saída: produtos/guia-sono/saida/noites-tranquilas.pdf

Conteúdo educativo, baseado em orientações gerais de sono seguro e sono infantil
(Sociedade Brasileira de Pediatria, Academia Americana de Pediatria e Academia Americana
de Medicina do Sono). Não substitui o acompanhamento do pediatra.
"""
import math
import os
import random

from reportlab.lib.colors import HexColor, white
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (BaseDocTemplate, CondPageBreak, Flowable, Frame, KeepTogether, NextPageTemplate,
                                PageBreak, PageTemplate, Paragraph, Spacer, Table, TableStyle)
from reportlab.platypus.tableofcontents import TableOfContents
from reportlab.platypus import Image as ImagemPDF
from reportlab.lib.utils import ImageReader
import re

W, H = A4
AQUI = os.path.dirname(os.path.abspath(__file__))
FONTES = os.path.join(AQUI, "..", "kit-natal", "fontes")
for nome, arq in [("Titulo", "Fredoka-Bold.ttf"), ("Sub", "Fredoka-SemiBold.ttf"),
                  ("Texto", "Nunito-SemiBold.ttf"), ("Forte", "Nunito-ExtraBold.ttf")]:
    pdfmetrics.registerFont(TTFont(nome, os.path.join(FONTES, arq)))
pdfmetrics.registerFontFamily("Texto", normal="Texto", bold="Forte", italic="Texto", boldItalic="Forte")

NOITE = HexColor("#2B2D5B")
NOITE_2 = HexColor("#3E4180")
LAVANDA = HexColor("#B8B5E8")
LAVANDA_CLARA = HexColor("#EEEDFB")
LUA = HexColor("#FFD166")
LUA_CLARA = HexColor("#FFF4D6")
ROSA = HexColor("#F8D7E3")
ROSA_FORTE = HexColor("#E07A9B")
MENTA = HexColor("#D6F1EA")
MENTA_FORTE = HexColor("#3BA78C")
TEXTO = HexColor("#2B2D42")
CINZA = HexColor("#8D8FA8")
MARGEM = 54

# ---------- estilos ----------
st = {
    "corpo": ParagraphStyle("corpo", fontName="Texto", fontSize=11.2, leading=17, textColor=TEXTO, spaceAfter=7),
    "lista": ParagraphStyle("lista", fontName="Texto", fontSize=11.2, leading=16.5, textColor=TEXTO,
                            leftIndent=16, bulletIndent=2, spaceAfter=4),
    "h2": ParagraphStyle("h2", fontName="Titulo", fontSize=16, leading=21, textColor=NOITE, spaceBefore=10, spaceAfter=6),
    "h3": ParagraphStyle("h3", fontName="Sub", fontSize=13, leading=17, textColor=NOITE_2, spaceBefore=6, spaceAfter=4),
    "caixa": ParagraphStyle("caixa", fontName="Texto", fontSize=10.8, leading=16, textColor=TEXTO, spaceAfter=3),
    "caixa_tit": ParagraphStyle("caixa_tit", fontName="Titulo", fontSize=12.5, leading=16, textColor=NOITE, spaceAfter=4),
    "cel": ParagraphStyle("cel", fontName="Texto", fontSize=10, leading=13.5, textColor=TEXTO),
    "cel_tit": ParagraphStyle("cel_tit", fontName="Forte", fontSize=10, leading=13, textColor=white),
    "centro": ParagraphStyle("centro", fontName="Texto", fontSize=11, leading=16, textColor=TEXTO, alignment=TA_CENTER),
    "toc1": ParagraphStyle("toc1", fontName="Sub", fontSize=13, leading=24, textColor=NOITE, leftIndent=8),
}


def P(t, s="corpo"):
    return Paragraph(t, st[s])


def lista(itens, marcador="•", cor="#6C63C7"):
    return [Paragraph(f'<font color="{cor}"><b>{marcador}</b></font>&nbsp; {t}', st["lista"]) for t in itens]


def checklist(itens):
    return [Paragraph(f'<font name="Forte" color="#3BA78C">☐</font>&nbsp; {t}'.replace("☐", "[  ]"), st["lista"]) for t in itens]


# ---------- elementos visuais ----------
def lua(c, x, y, r, cor=LUA, fundo=NOITE):
    c.setFillColor(cor)
    c.circle(x, y, r, stroke=0, fill=1)
    c.setFillColor(fundo)
    c.circle(x + r * 0.45, y + r * 0.3, r * 0.85, stroke=0, fill=1)


def estrela(c, x, y, r, cor=LUA):
    p = c.beginPath()
    for i in range(10):
        a = math.pi / 2 + i * math.pi / 5
        rr = r if i % 2 == 0 else r * 0.45
        px, py = x + rr * math.cos(a), y + rr * math.sin(a)
        p.moveTo(px, py) if i == 0 else p.lineTo(px, py)
    p.close()
    c.setFillColor(cor)
    c.drawPath(p, stroke=0, fill=1)


def nuvem(c, x, y, s, cor=white):
    c.setFillColor(cor)
    for dx, dy, r in ((0, 0, 0.32), (0.3, 0.12, 0.38), (0.62, 0, 0.3), (0.32, -0.12, 0.3)):
        c.circle(x + dx * s, y + dy * s, r * s, stroke=0, fill=1)


class Capitulo(Flowable):
    """Faixa de abertura de capítulo com número na lua."""

    def __init__(self, numero, titulo, subtitulo=""):
        super().__init__()
        self.numero, self.titulo, self.subtitulo = numero, titulo, subtitulo
        self.height = 92

    def wrap(self, aw, ah):
        self.width = aw
        return aw, self.height

    def draw(self):
        c = self.canv
        c.setFillColor(NOITE)
        c.roundRect(0, 0, self.width, self.height, 18, stroke=0, fill=1)
        rnd = random.Random(self.numero or 99)
        for _ in range(14):
            estrela(c, rnd.uniform(110, self.width - 20), rnd.uniform(10, self.height - 10), rnd.uniform(1.5, 3.2), LAVANDA)
        c.setFillColor(LUA)
        c.circle(48, self.height / 2, 30, stroke=0, fill=1)
        if self.numero:
            c.setFillColor(NOITE)
            c.setFont("Titulo", 26)
            c.drawCentredString(48, self.height / 2 - 9, str(self.numero))
        else:
            estrela(c, 48, self.height / 2, 17, NOITE)
        c.setFillColor(white)
        tam = 22
        while c.stringWidth(self.titulo, "Titulo", tam) > self.width - 116 and tam > 14:
            tam -= 1  # títulos longos diminuem pra caber
        c.setFont("Titulo", tam)
        c.drawString(96, self.height / 2 + (4 if self.subtitulo else -8), self.titulo)
        if self.subtitulo:
            c.setFillColor(LAVANDA)
            c.setFont("Texto", 11.5)
            c.drawString(96, self.height / 2 - 16, self.subtitulo)


def caixa(titulo, textos, fundo=LUA_CLARA, borda=LUA, icone=None):
    """Caixa de destaque (dica, atenção, mito x verdade)."""
    conteudo = []
    if titulo:
        conteudo.append(Paragraph((icone + " " if icone else "") + titulo, st["caixa_tit"]))
    for t in textos:
        conteudo.append(t if isinstance(t, Flowable) else Paragraph(t, st["caixa"]))
    t = Table([[conteudo]], colWidths=[W - 2 * MARGEM])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), fundo),
        ("BOX", (0, 0), (-1, -1), 1.4, borda),
        ("ROUNDEDCORNERS", [12, 12, 12, 12]),
        ("LEFTPADDING", (0, 0), (-1, -1), 14), ("RIGHTPADDING", (0, 0), (-1, -1), 14),
        ("TOPPADDING", (0, 0), (-1, -1), 10), ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
    ]))
    return KeepTogether([Spacer(1, 4), t, Spacer(1, 8)])


def dica(*textos):
    return caixa("Dica de ouro", list(textos), LUA_CLARA, LUA)


def atencao(*textos):
    return caixa("Atenção", list(textos), ROSA, ROSA_FORTE)


def tabela(cabecalho, linhas, larguras, cor=NOITE_2, alturas=None):
    dados = [[Paragraph(h, st["cel_tit"]) for h in cabecalho]]
    dados += [[Paragraph(str(v), st["cel"]) for v in linha] for linha in linhas]
    total = W - 2 * MARGEM
    t = Table(dados, colWidths=[total * l for l in larguras], rowHeights=alturas, repeatRows=1)
    estilo = [
        ("BACKGROUND", (0, 0), (-1, 0), cor),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("GRID", (0, 0), (-1, -1), 0.6, LAVANDA),
        ("ROUNDEDCORNERS", [10, 10, 10, 10]),
        ("LEFTPADDING", (0, 0), (-1, -1), 8), ("RIGHTPADDING", (0, 0), (-1, -1), 8),
        ("TOPPADDING", (0, 0), (-1, -1), 6), ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
    ]
    for i in range(1, len(dados)):
        if i % 2 == 0:
            estilo.append(("BACKGROUND", (0, i), (-1, i), LAVANDA_CLARA))
    t.setStyle(TableStyle(estilo))
    return KeepTogether([t, Spacer(1, 10)])


# ---------- ilustrações ----------
def _otimizar(caminho, n):
    """Reduz pra ~1100 px e salva em JPEG: o PDF fica leve sem perder qualidade visível."""
    try:
        from PIL import Image as PILImage
    except ImportError:
        return caminho
    import tempfile
    destino = os.path.join(tempfile.gettempdir(), "noites-tranquilas-ilustracoes")
    os.makedirs(destino, exist_ok=True)
    saida = os.path.join(destino, f"{n:02d}.jpg")
    img = PILImage.open(caminho).convert("RGB")
    img.thumbnail((1100, 1100))
    img.save(saida, "JPEG", quality=85, optimize=True)
    return saida


def _achar_ilustracoes():
    pasta = os.path.join(AQUI, "ilustracoes")
    achadas = {}
    if os.path.isdir(pasta):
        for arq in sorted(os.listdir(pasta)):
            m = re.search(r"(\d+)", arq)
            if m and arq.lower().endswith((".png", ".jpg", ".jpeg", ".webp")) and int(m.group(1)) not in achadas:
                achadas[int(m.group(1))] = _otimizar(os.path.join(pasta, arq), int(m.group(1)))
    return achadas


ILUSTRACOES = _achar_ilustracoes()


def ilustracao(n, largura=250, altura=170):
    """Imagem centralizada; se o arquivo nº n não existir, não ocupa espaço."""
    caminho = ILUSTRACOES.get(n)
    if not caminho:
        return Spacer(1, 0)
    iw, ih = ImageReader(caminho).getSize()
    esc = min(largura / iw, altura / ih)
    img = ImagemPDF(caminho, iw * esc, ih * esc)
    img.hAlign = "CENTER"
    return KeepTogether([Spacer(1, 4), img, Spacer(1, 10)])


# ---------- páginas ----------
def desenha_capa(c, doc):
    c.saveState()
    fundo = NOITE
    if ILUSTRACOES.get(1):  # usa o mesmo azul do fundo da ilustração da capa
        try:
            from PIL import Image as PILImage
            px = PILImage.open(ILUSTRACOES[1]).convert("RGB").getpixel((4, 4))
            fundo = HexColor("#%02X%02X%02X" % px)
        except ImportError:
            pass
    c.setFillColor(fundo)
    c.rect(0, 0, W, H, stroke=0, fill=1)
    rnd = random.Random(3)
    for _ in range(90):
        x, y = rnd.uniform(15, W - 15), rnd.uniform(200, H - 15)
        r, cor = rnd.uniform(1.2, 3.8), rnd.choice([LUA, LAVANDA, white])
        if x < 400 and H - 340 < y < H - 90:
            continue  # não cobre o título nem o subtítulo
        estrela(c, x, y, r, cor)
    tem_ilu = bool(ILUSTRACOES.get(1))
    if tem_ilu:
        # ilustração grande no centro, faixa lavanda fina embaixo
        lado = 300
        iw, ih = ImageReader(ILUSTRACOES[1]).getSize()
        esc = min(lado / iw, lado / ih)
        c.drawImage(ILUSTRACOES[1], (W - iw * esc) / 2, 100, iw * esc, ih * esc)
        c.setFillColor(HexColor("#E9E8FA"))
        c.rect(0, 0, W, 92, stroke=0, fill=1)
    else:
        lua(c, W - 150, H - 190, 80)
        nuvem(c, 60, 260, 150, HexColor("#E9E8FA"))
        nuvem(c, W - 230, 215, 190, HexColor("#E9E8FA"))
        c.setFillColor(HexColor("#E9E8FA"))
        c.rect(0, 0, W, 225, stroke=0, fill=1)
    # títulos
    c.setFillColor(LUA)
    c.setFont("Sub", 16)
    c.drawString(MARGEM, H - 120, "GUIA PRÁTICO DO SONO DO BEBÊ")
    c.setFillColor(white)
    c.setFont("Titulo", 60)
    c.drawString(MARGEM, H - 195, "Noites")
    c.drawString(MARGEM, H - 258, "Tranquilas")
    c.setFillColor(LAVANDA)
    c.setFont("Texto", 15)
    c.drawString(MARGEM, H - 300, "Rotina por idade, ritual do sono e um plano")
    c.drawString(MARGEM, H - 320, "de 7 noites para o bebê (e você) dormirem melhor.")
    # selos
    for i, (t1, t2) in enumerate((("0 a 2", "anos"), ("Plano", "7 noites"), ("Com", "imprimíveis"))):
        x = MARGEM + 52 + i * 120
        c.setFillColor(LUA if i == 0 else LAVANDA)
        c.circle(x, H - (380 if tem_ilu else 430), 46, stroke=0, fill=1)
        c.setFillColor(NOITE)
        c.setFont("Titulo", 16)
        c.drawCentredString(x, H - (376 if tem_ilu else 426), t1)
        c.setFont("Sub", 11)
        c.drawCentredString(x, H - (393 if tem_ilu else 443), t2)
    # rodapé da capa
    c.setFillColor(NOITE)
    c.setFont("Titulo", 15)
    c.drawCentredString(W / 2, 56 if tem_ilu else 120, "Rotina por idade • Ritual do sono • Sonecas • Despertares")
    c.setFont("Texto", 11.5)
    c.setFillColor(NOITE_2)
    c.drawCentredString(W / 2, 36 if tem_ilu else 98, "Inclui quadro de rotina, diário do sono e checklist para imprimir")
    c.restoreState()


def desenha_pagina(c, doc):
    c.saveState()
    c.setFillColor(LAVANDA_CLARA)
    c.rect(0, H - 34, W, 34, stroke=0, fill=1)
    lua(c, MARGEM + 6, H - 17, 8, LUA, LAVANDA_CLARA)
    for i, x in enumerate((MARGEM + 26, MARGEM + 38, W - MARGEM - 30, W - MARGEM - 12)):
        estrela(c, x, H - 17 + (3 if i % 2 else -2), 3, LAVANDA)
    c.setFillColor(NOITE)
    c.setFont("Sub", 9.5)
    c.drawCentredString(W / 2, H - 21, "Noites Tranquilas  •  Guia Prático do Sono do Bebê")
    c.setFillColor(CINZA)
    c.setFont("Sub", 9.5)
    c.drawCentredString(W / 2, 26, f"— {doc.page} —")
    c.restoreState()


class Guia(BaseDocTemplate):
    def __init__(self, caminho):
        super().__init__(caminho, pagesize=A4, title="Noites Tranquilas — Guia Prático do Sono do Bebê",
                         author="Noites Tranquilas", leftMargin=MARGEM, rightMargin=MARGEM,
                         topMargin=58, bottomMargin=50)
        frame = Frame(MARGEM, 50, W - 2 * MARGEM, H - 58 - 50, id="f", leftPadding=0, rightPadding=0,
                      topPadding=0, bottomPadding=0)
        self.addPageTemplates([PageTemplate("capa", [frame], onPage=desenha_capa),
                               PageTemplate("conteudo", [frame], onPage=desenha_pagina)])

    def afterFlowable(self, f):
        if isinstance(f, Capitulo) and f.numero:
            self.notify("TOCEntry", (0, f"{f.numero}. {f.titulo}", self.page))
        elif isinstance(f, Capitulo) and f.titulo not in ("Sumário",):
            self.notify("TOCEntry", (0, f.titulo, self.page))


# ---------- conteúdo ----------
def conteudo():
    s = [NextPageTemplate("conteudo"), PageBreak()]

    # Boas-vindas
    s += [Capitulo(None, "Boas-vindas", "Antes de começar, leia esta página"),
          Spacer(1, 10), ilustracao(2, 240, 150),
          P("Se você está lendo este guia, provavelmente está cansada. Talvez o bebê acorde várias vezes por noite, "
            "só durma no colo ou lute contra o sono como se fosse um inimigo. <b>Respire: isso é muito comum</b> "
            "e, na maioria das vezes, melhora com informação certa, rotina e constância."),
          P("Aqui você vai encontrar, de forma direta e prática:"),
          *lista(["como o sono do bebê funciona (e por que ele acorda tanto);",
                  "quanto ele precisa dormir em cada idade;",
                  "rotinas prontas para cada fase, de 0 a 2 anos;",
                  "um ritual do sono passo a passo;",
                  "um plano gentil de 7 noites, sem deixar o bebê chorando sozinho;",
                  "quadros para imprimir e colar na geladeira."]),
          P("<b>Como usar:</b> leia os capítulos 1 a 3 primeiro (são a base). Depois vá direto para a rotina da idade "
            "do seu bebê e escolha uma noite para começar o plano de 7 noites."),
          atencao("Este guia é educativo e não substitui o pediatra. Cada bebê é único. Se o seu bebê tem alguma "
                  "condição de saúde, nasceu prematuro, ronca, tem pausas na respiração, não ganha peso ou chora de "
                  "forma inconsolável, converse com o pediatra antes de mudar a rotina."),
          PageBreak()]

    # Sumário
    toc = TableOfContents()
    toc.levelStyles = [st["toc1"]]
    toc.dotsMinLevel = 0
    s += [Capitulo(None, "Sumário"), Spacer(1, 16), toc, PageBreak()]

    # 1
    s += [Capitulo(1, "Como o sono do bebê funciona", "Entender acaba com metade da angústia"), Spacer(1, 10),
          ilustracao(3, 170, 95),
          P("O sono do bebê é diferente do nosso. Os <b>ciclos de sono</b> dele são curtos: cerca de 40 a 50 minutos "
            "nos primeiros meses (o adulto tem ciclos de 90 minutos). No fim de cada ciclo, todo mundo desperta "
            "rapidinho. O adulto vira de lado e volta a dormir sem perceber. O bebê, muitas vezes, ainda não sabe "
            "fazer essa \"ponte\" sozinho e chama por ajuda."),
          P("Por isso, <b>acordar à noite é normal</b>, principalmente no primeiro ano. O objetivo não é um bebê "
            "que nunca acorda, e sim um bebê que dorme o suficiente para a idade e que, aos poucos, aprende a "
            "voltar a dormir com menos ajuda."),
          P("O relógio interno", "h3"),
          P("O recém-nascido ainda não diferencia dia e noite. Esse relógio biológico (o ritmo circadiano) começa a "
            "se formar entre 2 e 4 meses, com a ajuda da luz do dia, da escuridão à noite e da rotina. "
            "Por isso a rotina faz tanta diferença."),
          P("Cansaço demais atrapalha", "h3"),
          P("Parece estranho, mas <b>bebê muito cansado dorme pior</b>. Quando passa do ponto, o corpo libera "
            "hormônios de alerta, o bebê fica agitado, briga com o sono e acorda mais à noite. Respeitar o tempo "
            "acordado certo para a idade (as <b>janelas de sono</b>, no capítulo 3) é um dos segredos deste guia."),
          caixa("Mito x Verdade", [
              "<b>Mito:</b> \"Se deixar acordado o dia todo, ele dorme melhor à noite.\"<br/>"
              "<b>Verdade:</b> o contrário. Boas sonecas de dia ajudam a noite.",
              "<b>Mito:</b> \"Bebê que acorda à noite tem fome sempre.\"<br/>"
              "<b>Verdade:</b> nos primeiros meses, muitas vezes sim. Depois, muitos despertares são por hábito "
              "ou para voltar a dormir do mesmo jeito que adormeceu.",
              "<b>Mito:</b> \"Dar cereal na mamadeira faz dormir a noite toda.\"<br/>"
              "<b>Verdade:</b> não há evidência disso e não é recomendado. Alimentação é com o pediatra."],
              MENTA, MENTA_FORTE),
          PageBreak()]

    # 2
    s += [Capitulo(2, "Sono seguro em primeiro lugar", "Regras que valem para todos os bebês"), Spacer(1, 10),
          ilustracao(4, 230, 140),
          P("Antes de qualquer rotina, o mais importante: o sono precisa ser <b>seguro</b>. Estas orientações seguem "
            "as recomendações das sociedades de pediatria para reduzir o risco de morte súbita do lactente."),
          caixa("O ABC do sono seguro", [
              "<b>A — Sozinho:</b> o bebê dorme no próprio berço ou moisés, sem dividir a cama com adultos.",
              "<b>B — De barriga para cima:</b> sempre, em todos os sonos, inclusive as sonecas.",
              "<b>C — No berço vazio:</b> colchão firme e lençol bem ajustado. Sem travesseiro, protetor de berço, "
              "pelúcias, mantas soltas ou almofadas."], LAVANDA_CLARA, LAVANDA),
          P("Outras orientações importantes:", "h3"),
          *lista(["De preferência, o berço fica <b>no quarto dos pais</b> nos primeiros 6 meses.",
                  "Ambiente <b>sem fumaça</b> de cigarro, inclusive na roupa de quem pega o bebê.",
                  "Não deixe o bebê dormir em sofá, poltrona, cadeirinha de carro ou bebê-conforto fora do carro.",
                  "Não aqueça demais: roupa leve e quarto arejado. Se precisar, use saco de dormir próprio para bebê.",
                  "Se o bebê já rola sozinho para os dois lados, pode deixar na posição que ele escolher, mas sempre "
                  "coloque para dormir de barriga para cima."]),
          dica("Quer usar um <b>cueiro</b> (charutinho) no recém-nascido? Deixe os quadris soltos e pare assim que o "
               "bebê mostrar sinais de que vai rolar (geralmente perto dos 2 a 3 meses). Pergunte ao pediatra."),
          PageBreak()]

    # 3
    s += [Capitulo(3, "Quanto o bebê precisa dormir", "A tabela que vai guiar a sua rotina"), Spacer(1, 10),
          ilustracao(5, 140, 110),
          P("Os números abaixo são <b>médias de referência</b>. Alguns bebês dormem um pouco mais, outros um pouco "
            "menos. Se o bebê está bem-humorado, se desenvolvendo e ganhando peso, está tudo bem."),
          tabela(["Idade", "Sono total em 24h", "Sonecas por dia", "Janela acordado*", "Hora de dormir"],
                 [["0 a 3 meses", "14 a 17 horas", "4 a 6 (curtas)", "45 min a 1h30", "Ainda sem horário fixo"],
                  ["4 a 6 meses", "12 a 16 horas", "3 a 4", "1h30 a 2h30", "19h às 20h30"],
                  ["7 a 9 meses", "12 a 15 horas", "2 a 3", "2h30 a 3h30", "19h às 20h"],
                  ["10 a 12 meses", "12 a 15 horas", "2", "3h a 4h", "19h às 20h"],
                  ["1 a 2 anos", "11 a 14 horas", "1 a 2", "4h a 5h30", "19h às 20h30"]],
                 [0.16, 0.2, 0.18, 0.2, 0.26]),
          P("<b>*Janela acordado</b> (ou janela de sono) é quanto tempo o bebê aguanta acordado entre um sono e "
            "outro sem ficar cansado demais. Conte a partir do momento em que ele <b>acordou</b>."),
          P("Sinais de sono: fique de olho!", "h3"),
          tabela(["Sinais iniciais (hora de preparar)", "Sinais de cansaço demais (passou do ponto)"],
                 [["Olhar parado, perde o interesse nos brinquedos", "Choro forte, irritação, arqueia as costas"],
                  ["Esfrega os olhos ou as orelhas", "Fica \"elétrico\", agitado, rindo de nervoso"],
                  ["Boceja, fica mais quietinho", "Luta contra o sono e acorda logo depois de dormir"]],
                 [0.5, 0.5], MENTA_FORTE),
          dica("Comece o ritual do sono <b>nos primeiros sinais</b>, e não quando o bebê já está chorando de cansaço. "
               "Essa única mudança já melhora muito o sono de muitos bebês."),
          PageBreak()]

    # 4 — rotinas por idade
    s += [Capitulo(4, "Rotina por idade", "Exemplos prontos para adaptar ao seu dia"), Spacer(1, 14),
          P("As rotinas abaixo são <b>exemplos</b>. Ajuste os horários à realidade da sua casa, mas tente manter "
            "o horário de acordar e de dormir parecido todos os dias (até 30 minutos de diferença). "
            "O corpo do bebê adora previsibilidade."),
          P("0 a 3 meses: a fase da adaptação", "h2"),
          P("Aqui ainda não existe rotina rígida. O recém-nascido dorme e mama em ciclos ao longo do dia e da noite, "
            "e isso é normal. O foco é ajudar o bebê a diferenciar <b>dia e noite</b>:"),
          *lista(["De dia: claridade, barulhos normais da casa, conversa e brincadeira nos momentos acordado.",
                  "À noite: luz baixa, voz baixinha, troca de fralda rápida e sem brincadeira.",
                  "Respeite janelas curtas: muitas vezes 45 minutos a 1 hora acordado já é suficiente.",
                  "Mamadas noturnas são esperadas e necessárias nessa fase."]),
          P("4 a 6 meses: a rotina começa a aparecer", "h2"),
          tabela(["Horário", "Atividade"],
                 [["7h00", "Acordar, abrir a cortina, mamada"],
                  ["8h45", "Soneca 1 (até ~10h)"],
                  ["12h00", "Soneca 2 (até ~13h30)"],
                  ["15h30", "Soneca 3 (até ~16h15)"],
                  ["18h15", "Soneca curta de 30 min, se precisar (bebês com 3 a 4 sonecas)"],
                  ["19h00", "Início do ritual: banho, massagem, pijama"],
                  ["19h30", "Mamada no quarto com luz baixa e berço"]],
                 [0.2, 0.8]),
          atencao("Por volta dos 4 meses muitos bebês passam pela famosa <b>regressão dos 4 meses</b>: o sono amadurece "
                  "e ele passa a acordar mais. É uma fase. Manter a rotina ajuda a passar mais rápido."),
          CondPageBreak(300),
          P("7 a 12 meses: duas sonecas e noites mais longas", "h2"),
          tabela(["Horário", "Atividade"],
                 [["7h00", "Acordar, café da manhã / mamada"],
                  ["9h30", "Soneca 1 (1h a 1h30)"],
                  ["11h30", "Almoço"],
                  ["14h00", "Soneca 2 (1h a 1h30)"],
                  ["17h00", "Jantar, brincadeira calma"],
                  ["18h30", "Ritual do sono"],
                  ["19h00", "Mamada e berço"]],
                 [0.2, 0.8]),
          P("Entre 7 e 9 meses a maioria passa de 3 para 2 sonecas. Sinal de que chegou a hora: o bebê começa a "
            "recusar a 3ª soneca ou a dormir cada vez mais tarde à noite."),
          CondPageBreak(300),
          P("1 a 2 anos: rumo a uma soneca só", "h2"),
          tabela(["Horário", "Atividade"],
                 [["7h00", "Acordar, café da manhã"],
                  ["12h00", "Almoço"],
                  ["12h30", "Soneca única (1h30 a 2h30)"],
                  ["15h30", "Lanche e brincadeira ao ar livre"],
                  ["18h00", "Jantar"],
                  ["19h00", "Banho, pijama, escovar os dentes, história"],
                  ["19h30", "Cama"]],
                 [0.2, 0.8]),
          P("A transição de 2 para 1 soneca costuma acontecer entre 13 e 18 meses. Faça aos poucos, adiantando o "
            "jantar e o horário de dormir por alguns dias para compensar."),
          PageBreak()]

    # 5
    s += [Capitulo(5, "Os 7 erros que mais atrapalham", "Por que o bebê acorda à noite e o que fazer no lugar"), Spacer(1, 14)]
    erros = [
        ("Deixar o bebê acordado tempo demais", "Bebê cansado demais dorme pior e acorda mais. Use a tabela de janelas do capítulo 3."),
        ("Pular sonecas para \"cansar\"", "O sono do dia ajuda a noite. Mantenha as sonecas adequadas para a idade."),
        ("Mudar o ritual toda noite", "O cérebro do bebê aprende pela repetição. Faça sempre os mesmos passos, na mesma ordem."),
        ("Quarto claro, quente ou barulhento", "Escuro, temperatura agradável e ruído constante e baixo ajudam a manter o sono."),
        ("Ir dormir muito tarde", "Horários tardios costumam deixar o bebê cansado demais. Para a maioria, entre 19h e 20h30 funciona bem."),
        ("Telas e agitação antes de dormir", "Desligue TV e celular pelo menos 1 hora antes. Prefira brincadeiras calmas e luz baixa."),
        ("Responder a cada resmungo na hora", "Bebês resmungam e se mexem dormindo. Espere alguns instantes antes de intervir: às vezes ele volta a dormir sozinho."),
    ]
    for i, (erro, solucao) in enumerate(erros, 1):
        t = Table([[Paragraph(f'<font name="Titulo" size="20" color="#2B2D5B">{i}</font>', st["centro"]),
                    [Paragraph(f"<b>{erro}</b>", st["caixa_tit"]), Paragraph(f'<font color="#3BA78C"><b>Faça assim:</b></font> {solucao}', st["caixa"])]]],
                  colWidths=[46, W - 2 * MARGEM - 46])
        t.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (0, 0), LUA), ("BACKGROUND", (1, 0), (1, 0), LAVANDA_CLARA if i % 2 else MENTA),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"), ("ROUNDEDCORNERS", [12, 12, 12, 12]),
            ("LEFTPADDING", (1, 0), (1, 0), 12), ("TOPPADDING", (0, 0), (-1, -1), 8), ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
        ]))
        s += [t, Spacer(1, 8)]
    s += [PageBreak()]

    # 6
    s += [Capitulo(6, "O ritual do sono passo a passo", "30 a 40 minutos que mudam a noite"), Spacer(1, 10),
          ilustracao(6, 160, 90),
          P("O ritual é uma sequência de passos sempre igual, que avisa o corpo do bebê: <b>\"está chegando a hora de "
            "dormir\"</b>. Com alguns dias de repetição, o bebê começa a relaxar logo nos primeiros passos."),
          tabela(["Passo", "O que fazer", "Tempo"],
                 [["1. Desacelerar", "Desligue as telas, diminua as luzes e o barulho da casa", "—"],
                  ["2. Banho morno", "Rápido e tranquilo (se o bebê gosta; se ele se agita, faça mais cedo)", "5 a 10 min"],
                  ["3. Massagem", "Movimentos suaves nas pernas, barriga e costas, com creme ou óleo indicado", "5 min"],
                  ["4. Pijama e fralda", "Fralda noturna e roupa confortável, já no quarto", "5 min"],
                  ["5. Mamada", "No quarto, com luz baixa. Se possível, não deixe o bebê adormecer totalmente mamando", "10 a 20 min"],
                  ["6. Momento calmo", "Uma história curta, uma canção de ninar ou uma frase de boa-noite sempre igual", "5 min"],
                  ["7. Berço", "Coloque o bebê sonolento, mas ainda acordado. Fique por perto se ele precisar", "—"]],
                 [0.22, 0.6, 0.18]),
          dica("Crie uma <b>frase de boa-noite</b> só sua, como \"Agora é hora de nanar, amanhã a gente vai brincar\". "
               "Repita todas as noites. Ela vira um sinal poderoso de sono."),
          P("Por que \"sonolento, mas acordado\"?", "h3"),
          P("Se o bebê sempre adormece mamando ou no colo, quando acordar no meio da noite vai querer exatamente "
            "a mesma coisa para voltar a dormir. Colocar no berço ainda acordadinho ajuda ele a aprender a fazer "
            "a última parte sozinho. Não precisa ser perfeito: comece por uma vez ao dia, na hora de dormir à noite."),
          PageBreak()]

    # 7
    s += [Capitulo(7, "O quarto ideal para dormir", "Ambiente que convida ao sono"), Spacer(1, 10),
          ilustracao(7, 280, 180),
          tabela(["Item", "Como deixar"],
                 [["Luz", "Bem escuro para dormir, inclusive nas sonecas. Use cortina blackout se puder. Para trocas à noite, luz fraca e amarelada."],
                  ["Temperatura", "Agradável, em torno de 20 °C a 24 °C. Toque na nuca ou nas costas: deve estar morna, não suada."],
                  ["Barulho", "Um ruído branco baixo e constante (som de chuva, ventilador, \"shhh\") ajuda a abafar barulhos da casa."],
                  ["Roupa", "Uma camada a mais do que você usaria. Evite gorros e excesso de mantas."],
                  ["Berço", "Firme e vazio (veja o capítulo 2). Móbile só para olhar acordado, não para dormir."]],
                 [0.2, 0.8]),
          P("De dia, ao contrário: <b>luz natural</b>", "h3"),
          P("Abra as cortinas logo ao acordar e, se possível, leve o bebê para tomar um pouco de luz do dia pela manhã. "
            "A claridade de dia e o escuro à noite são o que mais ajudam a acertar o relógio biológico."),
          dica("Mantenha o ruído branco ligado durante <b>todo</b> o sono (não só para adormecer) e num volume baixo, "
               "longe do berço. Assim ele ajuda também nos despertares entre os ciclos."),
          PageBreak()]

    # 8
    s += [Capitulo(8, "Plano gentil de 7 noites", "Para bebês a partir de 6 meses"), Spacer(1, 10),
          ilustracao(8, 220, 130),
          P("Este plano ajuda o bebê a adormecer com menos ajuda, sem deixá-lo chorando sozinho. É o chamado "
            "<b>método da cadeira</b>: você fica presente e vai se afastando aos pouquinhos."),
          atencao("Comece só depois dos 6 meses, com o bebê saudável (sem febre, vacina recente ou dentes nascendo) e "
                  "com o aval do pediatra. Escolha uma semana tranquila, sem viagens ou visitas."),
          tabela(["Noite", "Onde você fica", "O que fazer"],
                 [["1 e 2", "Sentada ao lado do berço", "Faça o ritual, coloque o bebê acordado no berço. Pode tocar, fazer \"shhh\" e acalmar com a voz. Pegue no colo só se o choro aumentar muito, e devolva ao berço quando acalmar."],
                  ["3 e 4", "Cadeira no meio do quarto", "Mesmo ritual. Agora acalme mais com a voz e menos com o toque."],
                  ["5 e 6", "Cadeira perto da porta", "Fale baixinho e mostre que você está ali. Toque só se necessário."],
                  ["7", "Na porta / fora do quarto", "Ritual, berço, frase de boa-noite. Fique na porta ou do lado de fora e volte para tranquilizar se preciso."]],
                 [0.12, 0.25, 0.63]),
          P("Regras de ouro do plano", "h3"),
          *lista(["<b>Constância:</b> todos os adultos fazem igual, todas as noites.",
                  "Nos despertares da noite, repita a mesma estratégia da posição em que você está naquela noite.",
                  "Pode haver uma piora na 2ª ou 3ª noite. É normal: não desista no meio.",
                  "Se o bebê precisa de mamada noturna pela idade, mantenha. O plano não é para cortar alimentação."]),
          PageBreak()]

    # 9
    s += [Capitulo(9, "Despertares, mamadas e fases difíceis", "O que é normal e como agir"), Spacer(1, 14),
          P("Despertares noturnos", "h3"),
          P("Quando o bebê acordar, espere alguns instantes (muitas vezes ele está só passando de um ciclo para outro). "
            "Se precisar ir, faça tudo no escuro, com voz baixa e o mínimo de estímulo: o recado é <b>\"ainda é "
            "noite\"</b>."),
          P("Mamadas noturnas", "h3"),
          P("Nos primeiros meses, as mamadas noturnas são necessárias. A partir do segundo semestre, muitos bebês "
            "reduzem a necessidade, mas isso varia muito. <b>Quando e como diminuir as mamadas da noite é uma "
            "conversa com o pediatra</b>, que acompanha o peso e o desenvolvimento do seu bebê."),
          P("As fases que bagunçam o sono", "h3"),
          tabela(["Fase", "Quando costuma acontecer", "Como passar por ela"],
                 [["Regressão dos 4 meses", "3 a 5 meses", "O sono amadurece. Mantenha a rotina e o ritual, sem criar hábitos novos."],
                  ["Engatinhar e ficar em pé", "8 a 10 meses", "Treine bastante durante o dia para ele não \"praticar\" à noite."],
                  ["Ansiedade de separação", "8 a 12 meses", "Brinque de esconde-esconde, despeça-se sempre e volte quando prometer."],
                  ["Dentes", "Variável", "Fale com o pediatra sobre o alívio da dor. Volte à rotina assim que passar."],
                  ["Regressão dos 18 meses", "17 a 19 meses", "Limites claros e carinhosos e a mesma rotina de sempre."]],
                 [0.28, 0.24, 0.48]),
          dica("Em fases difíceis, ofereça mais conforto <b>sem abandonar a rotina</b>. O que você mantém agora é o que "
               "faz o sono voltar ao normal mais rápido."),
          PageBreak()]

    # 10
    s += [Capitulo(10, "Sonecas sem drama", "O dia bem dormido ajuda a noite"), Spacer(1, 10),
          ilustracao(9, 170, 140),
          *lista(["Faça um <b>mini-ritual</b> de 5 minutos antes da soneca: fralda, quarto escuro, ruído branco e a frase de sempre.",
                  "Sonecas curtas (de 30 a 45 minutos) são comuns até uns 5 a 6 meses. Tente \"emendar\": ao primeiro resmungo, acalme no berço para ver se ele volta a dormir.",
                  "Sempre que der, a soneca é no berço. No carrinho ou no colo de vez em quando, tudo bem.",
                  "Evite soneca muito perto da hora de dormir (menos de 2 horas antes, para bebês maiores).",
                  "Se uma soneca for ruim, adiante um pouco a próxima ou o horário de dormir."]),
          tabela(["Problema", "Possível causa", "Experimente"],
                 [["Briga com a soneca", "Cansado demais ou de menos", "Ajustar a janela acordado em 15 minutos para mais ou para menos"],
                  ["Acorda após 30 min", "Transição de ciclo", "Quarto mais escuro, ruído branco, acalmar no berço"],
                  ["Só dorme no colo", "Hábito de adormecer", "Começar o berço por uma soneca do dia (a da manhã costuma ser a mais fácil)"]],
                 [0.24, 0.3, 0.46]),
          PageBreak()]

    # 11
    s += [Capitulo(11, "Quando procurar o pediatra", "Sinais que merecem atenção"), Spacer(1, 14),
          P("Procure o pediatra se notar:"),
          *lista(["ronco frequente, respiração ruidosa ou <b>pausas na respiração</b> durante o sono;",
                  "choro inconsolável por longos períodos ou que parece de dor;",
                  "febre, vômitos frequentes, refluxo intenso ou recusa alimentar;",
                  "ganho de peso abaixo do esperado ou sonolência excessiva (difícil de acordar);",
                  "o sono piorou muito de repente, sem motivo aparente;",
                  "você está exausta a ponto de não conseguir cuidar de si ou do bebê."], "!", "#E07A9B"),
          caixa("Cuide de você também", [
              "Dormir pouco por muito tempo afeta o humor e a saúde. Peça ajuda, divida as noites com outra pessoa "
              "quando puder e descanse nas sonecas do bebê de vez em quando. Se a tristeza, o choro ou a ansiedade "
              "estiverem constantes, fale com um médico: você merece cuidado."], ROSA, ROSA_FORTE),
          Spacer(1, 6),
          P("Perguntas frequentes", "h2")]
    faq = [
        ("Posso começar a rotina com qualquer idade?", "Sim. Para menores de 4 meses, foque em diferenciar dia e noite e em respeitar as janelas. O plano de 7 noites é a partir dos 6 meses."),
        ("Em quanto tempo vejo resultado?", "Muitas famílias notam melhora em 1 a 2 semanas de rotina constante. Cada bebê tem seu tempo."),
        ("E se o bebê dormir na creche ou com a avó?", "Compartilhe a rotina impressa (está no fim do guia) para que todos sigam os mesmos horários e passos."),
        ("Chupeta ajuda?", "Para muitos bebês, sim, e ela faz parte das recomendações de sono seguro para dormir depois que a amamentação está bem estabelecida. Converse com o pediatra."),
    ]
    for q, r in faq:
        s += [P(f'<font color="#6C63C7"><b>P:</b></font> <b>{q}</b>'), P(f'<font color="#3BA78C"><b>R:</b></font> {r}')]
    s += [PageBreak()]

    # Imprimíveis
    s += [Capitulo(None, "Imprimíveis", "Quadro de rotina, diário do sono e checklist"), Spacer(1, 12),
          P("Imprima estas páginas e cole na geladeira ou deixe no quarto do bebê. Assim todo mundo da casa "
            "segue a mesma rotina."),
          P("Quadro de rotina do bebê", "h2"),
          P("Nome do bebê: ___________________________   Idade: ________"),
          tabela(["Horário", "Atividade", "Observações"],
                 [["", "Acordar", ""], ["", "Soneca 1", ""], ["", "Soneca 2", ""], ["", "Soneca 3", ""],
                  ["", "Início do ritual", ""], ["", "Hora de dormir", ""]],
                 [0.2, 0.35, 0.45], alturas=[24] + [34] * 6),
          PageBreak(),
          P("Diário do sono — 7 dias", "h2"),
          P("Anote por uma semana. Depois de alguns dias, você vai enxergar o padrão do seu bebê e saber o que ajustar."),
          tabela(["Dia", "Acordou", "Sonecas (início–fim)", "Dormiu", "Despertares", "Como foi?"],
                 [[d, "", "", "", "", ""] for d in ("Dia 1", "Dia 2", "Dia 3", "Dia 4", "Dia 5", "Dia 6", "Dia 7")],
                 [0.1, 0.13, 0.3, 0.13, 0.16, 0.18], alturas=[26] + [56] * 7),
          PageBreak(),
          P("Checklist do ritual do sono", "h2"),
          P("Marque todas as noites. Constância é o que faz funcionar!"),
          tabela(["Passo", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"],
                 [[p, "", "", "", "", "", "", ""] for p in
                  ("Telas desligadas 1h antes", "Luzes baixas", "Banho morno", "Massagem", "Pijama e fralda",
                   "Mamada no quarto", "História ou canção", "Frase de boa-noite", "Berço sonolento, mas acordado")],
                 [0.37] + [0.09] * 7, MENTA_FORTE, alturas=[24] + [32] * 9),
          Spacer(1, 10),
          caixa("Checklist do sono seguro", checklist([
              "Bebê dorme de barriga para cima", "No próprio berço, no quarto dos pais",
              "Colchão firme, lençol ajustado, berço vazio", "Ambiente sem fumaça", "Sem roupa ou mantas em excesso"]),
              LAVANDA_CLARA, LAVANDA),
          PageBreak()]

    # Fechamento
    s += [Spacer(1, 40 if ILUSTRACOES.get(10) else 120), ilustracao(10, 260, 230),
          Paragraph('<font name="Titulo" size="30" color="#2B2D5B">Boa noite!</font>', st["centro"]), Spacer(1, 18),
          P("Lembre-se: não existe mãe perfeita nem bebê perfeito. Existe constância, carinho e paciência. "
            "Alguns dias vão ser melhores que outros, e tudo bem.", "centro"),
          P("Você está fazendo um ótimo trabalho. Que venham muitas noites tranquilas para vocês. 💛".replace(" 💛", ""), "centro"),
          Spacer(1, 30),
          caixa(None, ["<i>Este material tem caráter educativo e não substitui consultas, diagnósticos ou orientações "
                       "do pediatra. Siga sempre as recomendações do profissional que acompanha o seu bebê.</i>"],
                LAVANDA_CLARA, LAVANDA)]
    return s


def main():
    os.makedirs(os.path.join(AQUI, "saida"), exist_ok=True)
    caminho = os.path.join(AQUI, "saida", "noites-tranquilas.pdf")
    doc = Guia(caminho)
    doc.multiBuild(conteudo())
    print(f"PDF gerado: {caminho} ({doc.page} páginas)")


if __name__ == "__main__":
    main()
