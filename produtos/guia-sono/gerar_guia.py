#!/usr/bin/env python3
"""Gera o e-book "Noites Tranquilas — Guia Prático do Sono do Bebê" em PDF (A4), com diagramação editorial.

Uso: python3 produtos/guia-sono/gerar_guia.py
Saída: produtos/guia-sono/saida/noites-tranquilas.pdf

Ilustrações (opcionais): produtos/guia-sono/ilustracoes/ com o número do prompt no nome
(01.png, 2.jpg...). Veja prompts-ilustracoes.md.

Conteúdo educativo, baseado em orientações gerais de sono seguro e sono infantil
(Sociedade Brasileira de Pediatria, Academia Americana de Pediatria e Academia Americana
de Medicina do Sono). Não substitui o acompanhamento do pediatra.
"""
import os
import random
import re
import tempfile

from reportlab.lib.colors import HexColor, white
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.utils import ImageReader, simpleSplit
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (BaseDocTemplate, CondPageBreak, Flowable, Frame, KeepTogether, NextPageTemplate,
                                PageBreak, PageTemplate, Paragraph, Spacer, Table, TableStyle)
from reportlab.platypus import Image as ImagemPDF
from reportlab.platypus.tableofcontents import TableOfContents

W, H = A4
AQUI = os.path.dirname(os.path.abspath(__file__))
FONTES = os.path.join(AQUI, "fontes")
for nome, arq in [("Serif", "Fraunces-Regular.ttf"), ("SerifSemi", "Fraunces-SemiBold.ttf"),
                  ("SerifIt", "Fraunces-Italic.ttf"), ("Sans", "NunitoSans-Regular.ttf"),
                  ("SansIt", "NunitoSans-Italic.ttf"), ("SansBold", "NunitoSans-Bold.ttf"),
                  ("SansBlack", "NunitoSans-ExtraBold.ttf")]:
    pdfmetrics.registerFont(TTFont(nome, os.path.join(FONTES, arq)))
pdfmetrics.registerFontFamily("Sans", normal="Sans", bold="SansBold", italic="SansIt", boldItalic="SansBold")
pdfmetrics.registerFontFamily("Serif", normal="Serif", bold="SerifSemi", italic="SerifIt", boldItalic="SerifSemi")

# ---------- paleta ----------
TINTA = HexColor("#23253F")
NOITE = HexColor("#2B2D5B")
LAVANDA = HexColor("#B8B5E8")
LAVANDA_SUAVE = HexColor("#DCDAF5")
LAVANDA_TINTA = HexColor("#F4F3FC")
OURO = HexColor("#C9962E")
OURO_TINTA = HexColor("#FBF5E6")
ROSA = HexColor("#C2607C")
ROSA_TINTA = HexColor("#FBF0F3")
MENTA = HexColor("#3B8F7A")
MENTA_TINTA = HexColor("#EEF7F4")
CINZA = HexColor("#8A8CA3")
FIO = HexColor("#DEDDEA")

MI, ME, MT, MB = 64, 64, 80, 72  # margens: interna, externa, topo, base
LARGURA = W - MI - ME

# ---------- estilos ----------
st = {
    "corpo": ParagraphStyle("corpo", fontName="Sans", fontSize=10.5, leading=16.2, textColor=TINTA, spaceAfter=7),
    "lede": ParagraphStyle("lede", fontName="SerifIt", fontSize=13, leading=19.5, textColor=NOITE, spaceAfter=12),
    "lista": ParagraphStyle("lista", fontName="Sans", fontSize=10.6, leading=16.5, textColor=TINTA, leftIndent=16,
                            bulletIndent=3, bulletFontName="SansBlack", bulletFontSize=10, bulletColor=OURO, spaceAfter=3),
    "h2": ParagraphStyle("h2", fontName="SerifSemi", fontSize=17, leading=22, textColor=NOITE, spaceBefore=16, spaceAfter=7, keepWithNext=1),
    "h3": ParagraphStyle("h3", fontName="SansBlack", fontSize=8.6, leading=12, textColor=OURO, spaceBefore=9, spaceAfter=4, keepWithNext=1),
    "caixa": ParagraphStyle("caixa", fontName="Sans", fontSize=10, leading=15, textColor=TINTA, spaceAfter=3),
    "caixa_tit": ParagraphStyle("caixa_tit", fontName="SansBlack", fontSize=8.4, leading=11, spaceAfter=5),
    "cel": ParagraphStyle("cel", fontName="Sans", fontSize=9.6, leading=13.5, textColor=TINTA),
    "cel_tit": ParagraphStyle("cel_tit", fontName="SansBlack", fontSize=8, leading=11, textColor=NOITE),
    "centro": ParagraphStyle("centro", fontName="Sans", fontSize=10.6, leading=17, textColor=TINTA, alignment=TA_CENTER),
    "citacao": ParagraphStyle("citacao", fontName="SerifIt", fontSize=15.5, leading=23, textColor=NOITE, alignment=TA_CENTER),
    "toc": ParagraphStyle("toc", fontName="Serif", fontSize=12.5, leading=27, textColor=TINTA),
    "pequeno": ParagraphStyle("pequeno", fontName="SansIt", fontSize=8.8, leading=13, textColor=CINZA, alignment=TA_CENTER),
}


def P(t, s="corpo"):
    return Paragraph(t, st[s])


def H3(t):
    return Paragraph(t.upper(), st["h3"])


def lista(itens):
    return [Paragraph(t, st["lista"], bulletText="•") for t in itens]


def lista_alerta(itens):
    s = ParagraphStyle("la", parent=st["lista"], bulletColor=ROSA)
    return [Paragraph(t, s, bulletText="!") for t in itens]


# ---------- ilustrações ----------
def _otimizar(caminho, n):
    """Reduz pra ~1100 px e salva em JPEG: o PDF fica leve sem perda visível."""
    try:
        from PIL import Image as PILImage
    except ImportError:
        return caminho
    destino = os.path.join(tempfile.gettempdir(), "noites-tranquilas-ilustracoes")
    os.makedirs(destino, exist_ok=True)
    saida = os.path.join(destino, f"{n:02d}.jpg")
    img = PILImage.open(caminho).convert("RGB")
    img.thumbnail((1100, 1100))
    img.save(saida, "JPEG", quality=86, optimize=True)
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


def ilustracao(n, largura=250, altura=160):
    caminho = ILUSTRACOES.get(n)
    if not caminho:
        return Spacer(1, 0)
    iw, ih = ImageReader(caminho).getSize()
    esc = min(largura / iw, altura / ih)
    img = ImagemPDF(caminho, iw * esc, ih * esc)
    img.hAlign = "CENTER"
    return KeepTogether([Spacer(1, 0), img, Spacer(1, 10)])


def lado_a_lado(n, textos, larg=170, alt=135, direita=False):
    """Ilustração ao lado do texto (economiza espaço e dá ritmo à página)."""
    caminho = ILUSTRACOES.get(n)
    if not caminho:
        return textos
    iw, ih = ImageReader(caminho).getSize()
    esc = min(larg / iw, alt / ih)
    img = ImagemPDF(caminho, iw * esc, ih * esc)
    col_img, col_txt = larg + 18, LARGURA - larg - 18
    linha = [textos, img] if direita else [img, textos]
    larguras = [col_txt, col_img] if direita else [col_img, col_txt]
    t = Table([linha], colWidths=larguras)
    t.setStyle(TableStyle([("VALIGN", (0, 0), (-1, -1), "MIDDLE"), ("LEFTPADDING", (0, 0), (-1, -1), 0),
                           ("RIGHTPADDING", (0, 0), (-1, -1), 0), ("ALIGN", (1 if direita else 0, 0), (1 if direita else 0, 0), "CENTER"),
                           ("TOPPADDING", (0, 0), (-1, -1), 0), ("BOTTOMPADDING", (0, 0), (-1, -1), 8)]))
    return [t]


# ---------- componentes editoriais ----------
def espacado(c, x, y, texto, fonte, tam, esp, centro=False, direita=False):
    """Texto com espaçamento entre letras (versalete)."""
    largura = c.stringWidth(texto, fonte, tam) + esp * (len(texto) - 1)
    if centro:
        x -= largura / 2
    elif direita:
        x -= largura
    t = c.beginText(x, y)
    t.setFont(fonte, tam)
    t.setCharSpace(esp)
    t.textOut(texto)
    t.setCharSpace(0)  # não deixa o espaçamento vazar pro próximo texto
    c.drawText(t)


class Abertura(Flowable):
    """Abertura de capítulo: numeral grande, rótulo em versalete, título serifado e fio dourado."""

    def __init__(self, numero, titulo, subtitulo="", rotulo=None):
        super().__init__()
        self.numero, self.titulo, self.subtitulo = numero, titulo, subtitulo
        self.rotulo = rotulo or (f"CAPÍTULO {numero}" if numero else "")

    def wrap(self, aw, ah):
        self.width = aw
        self.linhas = simpleSplit(self.titulo, "SerifSemi", 27, aw - (125 if self.numero else 10))
        self.height = 96 + len(self.linhas) * 32 + (24 if self.subtitulo else 0)
        return aw, self.height

    def draw(self):
        c = self.canv
        topo = self.height
        if self.numero:
            c.setFillColor(LAVANDA_SUAVE)
            c.setFont("Serif", 84)
            c.drawRightString(self.width, topo - 68, f"{self.numero:02d}")
        c.setFillColor(OURO)
        espacado(c, 0, topo - 40, self.rotulo, "SansBlack", 8.5, 2.2)
        c.setFillColor(NOITE)
        c.setFont("SerifSemi", 27)
        y = topo - 80
        for linha in self.linhas:
            c.drawString(0, y, linha)
            y -= 32
        if self.subtitulo:
            c.setFillColor(CINZA)
            c.setFont("SerifIt", 13)
            c.drawString(0, y + 6, self.subtitulo)
            y -= 26
        c.setStrokeColor(OURO)
        c.setLineWidth(1.6)
        c.line(0, y + 12, 44, y + 12)


class Citacao(Flowable):
    """Frase de destaque entre fios dourados."""

    def __init__(self, texto):
        super().__init__()
        self.p = Paragraph(texto, st["citacao"])

    def wrap(self, aw, ah):
        self.width = aw
        _, h = self.p.wrap(aw - 80, ah)
        self.ph = h
        self.height = h + 32
        return aw, self.height

    def draw(self):
        c = self.canv
        c.setStrokeColor(OURO)
        c.setLineWidth(0.8)
        c.line(self.width / 2 - 24, self.height - 6, self.width / 2 + 24, self.height - 6)
        c.line(self.width / 2 - 24, 6, self.width / 2 + 24, 6)
        self.p.drawOn(c, 40, 16)


def caixa(titulo, textos, tinta=OURO_TINTA, cor=OURO):
    """Destaque com barra lateral: discreto e elegante."""
    conteudo = []
    if titulo:
        tit = ParagraphStyle("t", parent=st["caixa_tit"], textColor=cor)
        conteudo.append(Paragraph(titulo.upper(), tit))
    for t in textos:
        conteudo.append(t if isinstance(t, Flowable) else Paragraph(t, st["caixa"]))
    t = Table([["", conteudo]], colWidths=[3.5, LARGURA - 3.5])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (0, 0), cor), ("BACKGROUND", (1, 0), (1, 0), tinta),
        ("LEFTPADDING", (0, 0), (0, 0), 0), ("RIGHTPADDING", (0, 0), (0, 0), 0),
        ("LEFTPADDING", (1, 0), (1, 0), 16), ("RIGHTPADDING", (1, 0), (1, 0), 16),
        ("TOPPADDING", (1, 0), (1, 0), 10), ("BOTTOMPADDING", (1, 0), (1, 0), 7),
    ]))
    return KeepTogether([Spacer(1, 4), t, Spacer(1, 10)])


def dica(*t):
    return caixa("Dica de ouro", list(t), OURO_TINTA, OURO)


def atencao(*t):
    return caixa("Atenção", list(t), ROSA_TINTA, ROSA)


def tabela(cabecalho, linhas, larguras, alturas=None, total=None):
    dados = [[Paragraph(h.upper(), st["cel_tit"]) for h in cabecalho]]
    dados += [[Paragraph(str(v), st["cel"]) for v in linha] for linha in linhas]
    t = Table(dados, colWidths=[(total or LARGURA) * l for l in larguras], rowHeights=alturas, repeatRows=1)
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), LAVANDA_TINTA),
        ("LINEABOVE", (0, 0), (-1, 0), 1.2, NOITE),
        ("LINEBELOW", (0, 0), (-1, 0), 0.8, NOITE),
        ("LINEBELOW", (0, 1), (-1, -1), 0.5, FIO),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("LEFTPADDING", (0, 0), (-1, -1), 8), ("RIGHTPADDING", (0, 0), (-1, -1), 8),
        ("TOPPADDING", (0, 0), (-1, -1), 6), ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
    ]))
    if total:  # dentro de uma coluna: tabela simples (sem bloco "mantenha junto")
        return t
    return KeepTogether([Spacer(1, 2), t, Spacer(1, 12)])


def duas_colunas(esquerda, direita, vao=20):
    """Dois blocos lado a lado (ex.: duas rotinas curtas)."""
    t = Table([[esquerda, direita]], colWidths=[(LARGURA - vao) / 2 + vao / 2] * 2)
    t.setStyle(TableStyle([("VALIGN", (0, 0), (-1, -1), "TOP"), ("LEFTPADDING", (0, 0), (-1, -1), 0),
                           ("RIGHTPADDING", (0, 0), (0, 0), vao / 2), ("LEFTPADDING", (1, 0), (1, 0), vao / 2),
                           ("RIGHTPADDING", (1, 0), (1, 0), 0), ("TOPPADDING", (0, 0), (-1, -1), 0)]))
    return t


MEIA = (LARGURA - 20) / 2
st["h2c"] = ParagraphStyle("h2c", parent=st["h2"], fontSize=14, leading=18, spaceBefore=12, keepWithNext=0)
st["nota"] = ParagraphStyle("nota", parent=st["corpo"], fontSize=9.6, leading=14.5, spaceBefore=8)


# ---------- páginas ----------
def fundo_capa():
    if ILUSTRACOES.get(1):
        try:
            from PIL import Image as PILImage
            return HexColor("#%02X%02X%02X" % PILImage.open(ILUSTRACOES[1]).convert("RGB").getpixel((4, 4)))
        except ImportError:
            pass
    return NOITE


def desenha_capa(c, doc):
    c.saveState()
    fundo = fundo_capa()
    c.setFillColor(fundo)
    c.rect(0, 0, W, H, stroke=0, fill=1)
    # moldura fina dourada
    c.setStrokeColor(OURO)
    c.setLineWidth(0.7)
    c.rect(28, 28, W - 56, H - 56, stroke=1, fill=0)
    c.setFillColor(HexColor("#E8C77A"))
    espacado(c, W / 2, H - 110, "GUIA PRÁTICO DO SONO DO BEBÊ", "SansBlack", 9.5, 3, centro=True)
    c.setFillColor(white)
    c.setFont("SerifSemi", 58)
    c.drawCentredString(W / 2, H - 182, "Noites")
    c.drawCentredString(W / 2, H - 244, "Tranquilas")
    c.setStrokeColor(OURO)
    c.setLineWidth(1.2)
    c.line(W / 2 - 30, H - 270, W / 2 + 30, H - 270)
    c.setFillColor(LAVANDA)
    c.setFont("SerifIt", 13.5)
    c.drawCentredString(W / 2, H - 300, "Rotina, ritual e um plano gentil de 7 noites")
    c.drawCentredString(W / 2, H - 320, "para o bebê (e você) dormirem melhor")
    if ILUSTRACOES.get(1):
        lado = 330
        iw, ih = ImageReader(ILUSTRACOES[1]).getSize()
        esc = min(lado / iw, lado / ih)
        c.drawImage(ILUSTRACOES[1], (W - iw * esc) / 2, 110, iw * esc, ih * esc)
    c.setFillColor(LAVANDA)
    espacado(c, W / 2, 78, "DE 0 A 2 ANOS  ·  ROTINA POR IDADE  ·  IMPRIMÍVEIS", "SansBold", 8.5, 2, centro=True)
    c.restoreState()


def inicio_pagina(c, doc):
    doc.abertura_na_pagina = False


def fim_pagina(c, doc):
    c.saveState()
    if not doc.abertura_na_pagina:
        c.setFillColor(CINZA)
        espacado(c, MI, H - 46, "NOITES TRANQUILAS", "SansBold", 7, 1.8)
        c.setFont("SerifIt", 9.5)
        c.drawRightString(W - ME, H - 46, doc.capitulo_atual)
        c.setStrokeColor(FIO)
        c.setLineWidth(0.6)
        c.line(MI, H - 54, W - ME, H - 54)
    c.setFillColor(NOITE)
    c.setFont("Serif", 10)
    c.drawCentredString(W / 2, 36, str(doc.page))
    c.setStrokeColor(OURO)
    c.setLineWidth(0.6)
    c.line(W / 2 - 22, 40, W / 2 - 12, 40)
    c.line(W / 2 + 12, 40, W / 2 + 22, 40)
    c.restoreState()


class Guia(BaseDocTemplate):
    def __init__(self, caminho):
        super().__init__(caminho, pagesize=A4, title="Noites Tranquilas — Guia Prático do Sono do Bebê",
                         author="Noites Tranquilas", leftMargin=MI, rightMargin=ME, topMargin=MT, bottomMargin=MB)
        self.capitulo_atual = ""
        self.abertura_na_pagina = False
        frame = Frame(MI, MB, LARGURA, H - MT - MB, id="f", leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0)
        self.addPageTemplates([
            PageTemplate("capa", [frame], onPage=desenha_capa),
            PageTemplate("conteudo", [frame], onPage=inicio_pagina, onPageEnd=fim_pagina),
        ])

    def afterFlowable(self, f):
        if isinstance(f, Abertura):
            self.abertura_na_pagina = True
            self.capitulo_atual = f.titulo
            if f.titulo != "Sumário":
                rotulo = f"{f.numero}   {f.titulo}" if f.numero else f.titulo
                self.notify("TOCEntry", (0, rotulo, self.page))


def fim_capitulo():
    """Próximo capítulo começa na mesma página se sobrar mais da metade dela."""
    return [CondPageBreak(H * 0.5), Spacer(1, 26)]


# ---------- conteúdo ----------
def conteudo():
    s = [NextPageTemplate("conteudo"), PageBreak()]

    s += [Abertura(None, "Boas-vindas", "Antes de começar, leia esta página", "INTRODUÇÃO"),
          ilustracao(2, 220, 125),
          P("Se você está lendo este guia, provavelmente está cansada. Talvez o bebê acorde várias vezes por noite, "
            "só durma no colo ou lute contra o sono. Respire: isso é muito comum e, na maioria das vezes, melhora "
            "com informação certa, rotina e constância.", "lede"),
          P("Aqui você vai encontrar, de forma direta e prática:"),
          *lista(["como o sono do bebê funciona (e por que ele acorda tanto);",
                  "quanto ele precisa dormir em cada idade;",
                  "rotinas prontas para cada fase, de 0 a 2 anos;",
                  "um ritual do sono passo a passo;",
                  "um plano gentil de 7 noites, sem deixar o bebê chorando sozinho;",
                  "quadros para imprimir e colar na geladeira."]),
          P("<b>Como usar:</b> leia os capítulos 1 a 3 primeiro: eles são a base. Depois vá direto para a rotina da "
            "idade do seu bebê e escolha uma noite tranquila para começar o plano de 7 noites."),
          atencao("Este guia é educativo e não substitui o pediatra. Cada bebê é único. Se o seu bebê tem alguma "
                  "condição de saúde, nasceu prematuro, ronca, tem pausas na respiração, não ganha peso ou chora de "
                  "forma inconsolável, converse com o pediatra antes de mudar a rotina."),
          PageBreak()]

    toc = TableOfContents()
    toc.levelStyles = [st["toc"]]
    toc.dotsMinLevel = 0
    s += [Abertura(None, "Sumário", "", "ÍNDICE"), Spacer(1, 6), toc, PageBreak()]

    # 1
    s += [Abertura(1, "Como o sono do bebê funciona", "Entender acaba com metade da angústia"),
          *lado_a_lado(3, [P("O sono do bebê é diferente do nosso. Entender como ele funciona tira um peso enorme das costas.", "lede")], 190, 110, direita=True),
          P("Os <b>ciclos de sono</b> do bebê são curtos: cerca de 40 a 50 minutos nos primeiros meses (o adulto tem "
            "ciclos de 90 minutos). No fim de cada ciclo, todo mundo desperta rapidinho. O adulto vira de lado e volta "
            "a dormir sem perceber. O bebê, muitas vezes, ainda não sabe fazer essa \"ponte\" sozinho e chama por ajuda."),
          Citacao("Acordar à noite é normal. O objetivo é um bebê que dorme o suficiente e que, aos poucos, "
                  "aprende a voltar a dormir com menos ajuda."),
          H3("O relógio interno"),
          P("O recém-nascido ainda não diferencia dia e noite. Esse relógio biológico (o ritmo circadiano) começa a se "
            "formar entre 2 e 4 meses, com a ajuda da luz do dia, da escuridão à noite e da rotina. Por isso a rotina "
            "faz tanta diferença."),
          H3("Cansaço demais atrapalha"),
          P("Parece estranho, mas <b>bebê muito cansado dorme pior</b>. Quando passa do ponto, o corpo libera hormônios "
            "de alerta, o bebê fica agitado, briga com o sono e acorda mais à noite. Respeitar o tempo acordado certo "
            "para a idade (as <b>janelas de sono</b>, no capítulo 3) é um dos segredos deste guia."),
          caixa("Mito x verdade", [
              "<b>Mito:</b> \"Se deixar acordado o dia todo, ele dorme melhor à noite.\"<br/>"
              "<b>Verdade:</b> é o contrário. Boas sonecas de dia ajudam a noite.",
              "<b>Mito:</b> \"Bebê que acorda à noite sempre tem fome.\"<br/>"
              "<b>Verdade:</b> nos primeiros meses, muitas vezes sim. Depois, muitos despertares são por hábito "
              "ou para voltar a dormir do mesmo jeito que adormeceu.",
              "<b>Mito:</b> \"Cereal na mamadeira faz dormir a noite toda.\"<br/>"
              "<b>Verdade:</b> não há evidência disso e não é recomendado. Alimentação é com o pediatra."],
              MENTA_TINTA, MENTA),
          caixa("Em resumo", lista(["Acordar à noite é normal: os ciclos de sono do bebê são curtos.",
                                    "O relógio biológico se forma entre 2 e 4 meses, com luz de dia e escuro à noite.",
                                    "Bebê cansado demais dorme pior: respeite as janelas de sono."]), LAVANDA_TINTA, NOITE),
          *fim_capitulo()]

    # 2
    s += [Abertura(2, "Sono seguro em primeiro lugar", "Regras que valem para todos os bebês"),
          *lado_a_lado(4, [P("Antes de qualquer rotina, o mais importante: o sono precisa ser seguro.", "lede"),
                           P("Estas orientações seguem as recomendações das sociedades de pediatria para reduzir o risco de morte "
                             "súbita do lactente.")], 175, 120),
          caixa("O ABC do sono seguro", [
              "<b>A — Sozinho:</b> o bebê dorme no próprio berço ou moisés, sem dividir a cama com adultos.",
              "<b>B — De barriga para cima:</b> sempre, em todos os sonos, inclusive as sonecas.",
              "<b>C — No berço vazio:</b> colchão firme e lençol bem ajustado. Sem travesseiro, protetor de berço, "
              "pelúcias, mantas soltas ou almofadas."], LAVANDA_TINTA, NOITE),
          H3("Outras orientações importantes"),
          *lista(["De preferência, o berço fica <b>no quarto dos pais</b> nos primeiros 6 meses.",
                  "Ambiente <b>sem fumaça</b> de cigarro, inclusive na roupa de quem pega o bebê.",
                  "Não deixe o bebê dormir em sofá, poltrona, cadeirinha de carro ou bebê-conforto fora do carro.",
                  "Não aqueça demais: roupa leve e quarto arejado. Se precisar, use saco de dormir próprio para bebê.",
                  "Se o bebê já rola sozinho para os dois lados, pode ficar na posição que escolher, mas sempre coloque "
                  "para dormir de barriga para cima."]),
          dica("Quer usar um <b>cueiro</b> (charutinho) no recém-nascido? Deixe os quadris soltos e pare assim que o bebê "
               "mostrar sinais de que vai rolar (geralmente perto dos 2 a 3 meses). Pergunte ao pediatra."),
          *fim_capitulo()]

    # 3
    s += [Abertura(3, "Quanto o bebê precisa dormir", "A tabela que vai guiar a sua rotina"),
          *lado_a_lado(5, [P("Os números abaixo são <b>médias de referência</b>. Alguns bebês dormem um pouco mais, outros um pouco menos. "
                             "Se o bebê está bem-humorado, se desenvolvendo e ganhando peso, está tudo bem.")], 95, 95, direita=True),
          tabela(["Idade", "Sono em 24h", "Sonecas", "Janela acordado*", "Hora de dormir"],
                 [["0 a 3 meses", "14 a 17 h", "4 a 6 (curtas)", "45 min a 1h30", "Ainda sem horário fixo"],
                  ["4 a 6 meses", "12 a 16 h", "3 a 4", "1h30 a 2h30", "19h às 20h30"],
                  ["7 a 9 meses", "12 a 15 h", "2 a 3", "2h30 a 3h30", "19h às 20h"],
                  ["10 a 12 meses", "12 a 15 h", "2", "3h a 4h", "19h às 20h"],
                  ["1 a 2 anos", "11 a 14 h", "1 a 2", "4h a 5h30", "19h às 20h30"]],
                 [0.18, 0.17, 0.17, 0.22, 0.26]),
          P("<b>*Janela acordado</b> é quanto tempo o bebê aguenta acordado entre um sono e outro sem ficar cansado demais. "
            "Conte a partir do momento em que ele <b>acordou</b>."),
          H3("Sinais de sono"),
          tabela(["Sinais iniciais: hora de preparar", "Cansaço demais: passou do ponto"],
                 [["Olhar parado, perde o interesse nos brinquedos", "Choro forte, irritação, arqueia as costas"],
                  ["Esfrega os olhos ou as orelhas", "Fica \"elétrico\", agitado, rindo de nervoso"],
                  ["Boceja, fica mais quietinho", "Luta contra o sono e acorda logo depois de dormir"]],
                 [0.5, 0.5]),
          dica("Comece o ritual do sono <b>nos primeiros sinais</b>, e não quando o bebê já está chorando de cansaço. "
               "Essa única mudança já melhora muito o sono de muitos bebês."),
          *fim_capitulo()]

    # 4
    s += [Abertura(4, "Rotina por idade", "Exemplos prontos para adaptar ao seu dia"),
          P("Ajuste os horários à realidade da sua casa, mas mantenha o horário de acordar e de dormir parecido todos "
            "os dias, com até 30 minutos de diferença. O corpo do bebê adora previsibilidade.", "lede"),
          P("0 a 3 meses: a fase da adaptação", "h2"),
          P("Aqui ainda não existe rotina rígida. O recém-nascido dorme e mama em ciclos ao longo do dia e da noite, e isso "
            "é normal. O foco é ajudar o bebê a diferenciar <b>dia e noite</b>:"),
          *lista(["De dia: claridade, barulhos normais da casa, conversa e brincadeira nos momentos acordado.",
                  "À noite: luz baixa, voz baixinha, troca de fralda rápida e sem brincadeira.",
                  "Respeite janelas curtas: muitas vezes 45 minutos a 1 hora acordado já é suficiente.",
                  "Mamadas noturnas são esperadas e necessárias nessa fase."]),
          P("4 a 6 meses: a rotina começa a aparecer", "h2"),
          tabela(["Horário", "Atividade"],
                 [["7h00", "Acordar, abrir a cortina, mamada"], ["8h45", "Soneca 1 (até ~10h)"],
                  ["12h00", "Soneca 2 (até ~13h30)"], ["15h30", "Soneca 3 (até ~16h15)"],
                  ["18h15", "Soneca curta de 30 min, se precisar"], ["19h00", "Início do ritual: banho, massagem, pijama"],
                  ["19h30", "Mamada no quarto com luz baixa e berço"]], [0.18, 0.82]),
          atencao("Por volta dos 4 meses muitos bebês passam pela <b>regressão dos 4 meses</b>: o sono amadurece e ele passa "
                  "a acordar mais. É uma fase. Manter a rotina ajuda a passar mais rápido."),
          duas_colunas(
              [P("7 a 12 meses: duas sonecas", "h2c"),
               tabela(["Horário", "Atividade"],
                      [["7h00", "Acordar, café da manhã ou mamada"], ["9h30", "Soneca 1 (1h a 1h30)"], ["11h30", "Almoço"],
                       ["14h00", "Soneca 2 (1h a 1h30)"], ["17h00", "Jantar, brincadeira calma"], ["18h30", "Ritual do sono"],
                       ["19h00", "Mamada e berço"]], [0.26, 0.74], total=MEIA),
               P("Entre 7 e 9 meses a maioria passa de 3 para 2 sonecas: o bebê começa a recusar a terceira ou a "
                 "dormir cada vez mais tarde à noite.", "nota")],
              [P("1 a 2 anos: uma soneca só", "h2c"),
               tabela(["Horário", "Atividade"],
                      [["7h00", "Acordar, café da manhã"], ["12h00", "Almoço"], ["12h30", "Soneca única (1h30 a 2h30)"],
                       ["15h30", "Lanche e brincadeira ao ar livre"], ["18h00", "Jantar"],
                       ["19h00", "Banho, pijama, dentes, história"], ["19h30", "Cama"]], [0.26, 0.74], total=MEIA),
               P("A transição de 2 para 1 soneca costuma acontecer entre 13 e 18 meses. Faça aos poucos, adiantando "
                 "o jantar e a hora de dormir por alguns dias.", "nota")]),
          *fim_capitulo()]

    # 5
    s += [Abertura(5, "Os 7 erros que mais atrapalham", "Por que o bebê acorda à noite e o que fazer no lugar")]
    erros = [
        ("Deixar o bebê acordado tempo demais", "Bebê cansado demais dorme pior e acorda mais. Use a tabela de janelas do capítulo 3."),
        ("Pular sonecas para \"cansar\"", "O sono do dia ajuda a noite. Mantenha as sonecas adequadas para a idade."),
        ("Mudar o ritual toda noite", "O cérebro do bebê aprende pela repetição. Faça sempre os mesmos passos, na mesma ordem."),
        ("Quarto claro, quente ou barulhento", "Escuro, temperatura agradável e ruído constante e baixo ajudam a manter o sono."),
        ("Ir dormir muito tarde", "Horários tardios costumam deixar o bebê cansado demais. Para a maioria, entre 19h e 20h30 funciona bem."),
        ("Telas e agitação antes de dormir", "Desligue TV e celular pelo menos 1 hora antes. Prefira brincadeiras calmas e luz baixa."),
        ("Responder a cada resmungo na hora", "Bebês resmungam e se mexem dormindo. Espere alguns instantes: às vezes ele volta a dormir sozinho."),
    ]
    num = ParagraphStyle("num", fontName="Serif", fontSize=30, leading=32, textColor=OURO)
    tit = ParagraphStyle("tit", fontName="SerifSemi", fontSize=13, leading=17, textColor=NOITE, spaceAfter=3)
    linhas = []
    for i, (erro, solucao) in enumerate(erros, 1):
        linhas.append([Paragraph(str(i), num),
                       [Paragraph(erro, tit), Paragraph(f'<font name="SansBold" color="#3B8F7A">Faça assim:</font> {solucao}', st["corpo"])]])
    t = Table(linhas, colWidths=[44, LARGURA - 44])
    t.setStyle(TableStyle([("VALIGN", (0, 0), (-1, -1), "TOP"), ("LINEBELOW", (0, 0), (-1, -2), 0.5, FIO),
                           ("TOPPADDING", (0, 0), (-1, -1), 10), ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
                           ("LEFTPADDING", (0, 0), (-1, -1), 0)]))
    s += [t, *fim_capitulo()]

    # 6
    s += [Abertura(6, "O ritual do sono passo a passo", "30 a 40 minutos que mudam a noite"),
          *lado_a_lado(6, [P("O ritual é uma sequência de passos sempre igual, que avisa o corpo do bebê: \"está chegando a hora de "
                             "dormir\". Com alguns dias de repetição, ele começa a relaxar logo nos primeiros passos.", "lede")], 200, 115),
          tabela(["Passo", "O que fazer", "Tempo"],
                 [["1. Desacelerar", "Desligue as telas, diminua as luzes e o barulho da casa", "—"],
                  ["2. Banho morno", "Rápido e tranquilo (se o bebê se agita no banho, faça mais cedo)", "5 a 10 min"],
                  ["3. Massagem", "Movimentos suaves nas pernas, barriga e costas", "5 min"],
                  ["4. Pijama e fralda", "Fralda noturna e roupa confortável, já no quarto", "5 min"],
                  ["5. Mamada", "No quarto, com luz baixa. Se possível, sem adormecer totalmente mamando", "10 a 20 min"],
                  ["6. Momento calmo", "Uma história curta, uma canção ou uma frase de boa-noite sempre igual", "5 min"],
                  ["7. Berço", "Coloque o bebê sonolento, mas ainda acordado. Fique por perto se ele precisar", "—"]],
                 [0.22, 0.6, 0.18]),
          dica("Crie uma <b>frase de boa-noite</b> só sua, como \"Agora é hora de nanar, amanhã a gente vai brincar\". "
               "Repita todas as noites. Ela vira um sinal poderoso de sono."),
          H3("Por que \"sonolento, mas acordado\"?"),
          P("Se o bebê sempre adormece mamando ou no colo, quando acordar no meio da noite vai querer exatamente a mesma "
            "coisa para voltar a dormir. Colocar no berço ainda acordadinho ajuda ele a aprender a fazer a última parte "
            "sozinho. Não precisa ser perfeito: comece por uma vez ao dia, na hora de dormir à noite."),
          *fim_capitulo()]

    # 7
    s += [Abertura(7, "O quarto ideal para dormir", "Ambiente que convida ao sono"),
          ilustracao(7, 210, 130),
          tabela(["Item", "Como deixar"],
                 [["Luz", "Bem escuro para dormir, inclusive nas sonecas. Use cortina blackout se puder. Para trocas à noite, luz fraca e amarelada."],
                  ["Temperatura", "Agradável, em torno de 20 °C a 24 °C. A nuca ou as costas devem estar mornas, não suadas."],
                  ["Barulho", "Um ruído branco baixo e constante (chuva, ventilador, \"shhh\") ajuda a abafar barulhos da casa."],
                  ["Roupa", "Uma camada a mais do que você usaria. Evite gorros e excesso de mantas."],
                  ["Berço", "Firme e vazio (veja o capítulo 2). Móbile só para olhar acordado."]], [0.2, 0.8]),
          H3("De dia, ao contrário: luz natural"),
          P("Abra as cortinas logo ao acordar e, se possível, leve o bebê para tomar um pouco de luz do dia pela manhã. "
            "A claridade de dia e o escuro à noite são o que mais ajudam a acertar o relógio biológico."),
          dica("Mantenha o ruído branco ligado durante <b>todo</b> o sono, num volume baixo e longe do berço. Assim ele "
               "ajuda também nos despertares entre os ciclos."),
          *fim_capitulo()]

    # 8
    s += [Abertura(8, "Plano gentil de 7 noites", "Para bebês a partir de 6 meses"),
          *lado_a_lado(8, [P("Este plano ajuda o bebê a adormecer com menos ajuda, sem deixá-lo chorando sozinho. É o chamado método da "
                             "cadeira: você fica presente e vai se afastando aos pouquinhos.", "lede")], 180, 120, direita=True),
          atencao("Comece só depois dos 6 meses, com o bebê saudável (sem febre, vacina recente ou dentes nascendo) e com o "
                  "aval do pediatra. Escolha uma semana tranquila, sem viagens ou visitas."),
          tabela(["Noite", "Onde você fica", "O que fazer"],
                 [["1 e 2", "Sentada ao lado do berço", "Faça o ritual e coloque o bebê acordado no berço. Pode tocar, fazer \"shhh\" e acalmar com a voz. Pegue no colo só se o choro aumentar muito e devolva ao berço quando acalmar."],
                  ["3 e 4", "Cadeira no meio do quarto", "Mesmo ritual. Agora acalme mais com a voz e menos com o toque."],
                  ["5 e 6", "Cadeira perto da porta", "Fale baixinho e mostre que você está ali. Toque só se necessário."],
                  ["7", "Na porta ou fora do quarto", "Ritual, berço e frase de boa-noite. Volte para tranquilizar se preciso."]],
                 [0.12, 0.26, 0.62]),
          H3("Regras de ouro do plano"),
          *lista(["<b>Constância:</b> todos os adultos fazem igual, todas as noites.",
                  "Nos despertares da noite, repita a mesma estratégia da posição em que você está naquela noite.",
                  "Pode haver uma piora na 2ª ou 3ª noite. É normal: não desista no meio.",
                  "Se o bebê precisa de mamada noturna pela idade, mantenha. O plano não é para cortar alimentação."]),
          *fim_capitulo()]

    # 9
    s += [Abertura(9, "Despertares, mamadas e fases difíceis", "O que é normal e como agir"),
          H3("Despertares noturnos"),
          P("Quando o bebê acordar, espere alguns instantes: muitas vezes ele está só passando de um ciclo para outro. Se "
            "precisar ir, faça tudo no escuro, com voz baixa e o mínimo de estímulo. O recado é: <b>\"ainda é noite\"</b>."),
          H3("Mamadas noturnas"),
          P("Nos primeiros meses, as mamadas noturnas são necessárias. A partir do segundo semestre, muitos bebês reduzem a "
            "necessidade, mas isso varia muito. <b>Quando e como diminuir as mamadas da noite é uma conversa com o "
            "pediatra</b>, que acompanha o peso e o desenvolvimento do seu bebê."),
          Citacao("Em fases difíceis, ofereça mais conforto sem abandonar a rotina. É ela que faz o sono voltar ao normal."),
          H3("As fases que bagunçam o sono"),
          tabela(["Fase", "Quando costuma acontecer", "Como passar por ela"],
                 [["Regressão dos 4 meses", "3 a 5 meses", "O sono amadurece. Mantenha a rotina e o ritual, sem criar hábitos novos."],
                  ["Engatinhar e ficar em pé", "8 a 10 meses", "Treine bastante durante o dia para ele não \"praticar\" à noite."],
                  ["Ansiedade de separação", "8 a 12 meses", "Brinque de esconde-esconde, despeça-se sempre e volte quando prometer."],
                  ["Dentes", "Variável", "Fale com o pediatra sobre o alívio da dor. Volte à rotina assim que passar."],
                  ["Regressão dos 18 meses", "17 a 19 meses", "Limites claros e carinhosos e a mesma rotina de sempre."]],
                 [0.28, 0.24, 0.48]),
          *fim_capitulo()]

    # 10
    s += [Abertura(10, "Sonecas sem drama", "O dia bem dormido ajuda a noite"),
          ilustracao(9, 110, 100),
          *lista(["Faça um <b>mini-ritual</b> de 5 minutos antes da soneca: fralda, quarto escuro, ruído branco e a frase de sempre.",
                  "Sonecas curtas (30 a 45 minutos) são comuns até uns 5 a 6 meses. Ao primeiro resmungo, acalme no berço para ver se ele volta a dormir.",
                  "Sempre que der, a soneca é no berço. No carrinho ou no colo de vez em quando, tudo bem.",
                  "Evite soneca muito perto da hora de dormir (menos de 2 horas antes, para bebês maiores).",
                  "Se uma soneca for ruim, adiante um pouco a próxima ou o horário de dormir."]),
          Spacer(1, 6),
          tabela(["Problema", "Possível causa", "Experimente"],
                 [["Briga com a soneca", "Cansado demais ou de menos", "Ajustar a janela acordado em 15 minutos para mais ou para menos"],
                  ["Acorda após 30 min", "Transição de ciclo", "Quarto mais escuro, ruído branco, acalmar no berço"],
                  ["Só dorme no colo", "Hábito de adormecer", "Começar o berço por uma soneca do dia (a da manhã costuma ser a mais fácil)"]],
                 [0.24, 0.28, 0.48]),
          *fim_capitulo()]

    # 11
    s += [Abertura(11, "Quando procurar o pediatra", "Sinais que merecem atenção"),
          P("Procure o pediatra se notar:"),
          *lista_alerta(["ronco frequente, respiração ruidosa ou <b>pausas na respiração</b> durante o sono;",
                         "choro inconsolável por longos períodos ou que parece de dor;",
                         "febre, vômitos frequentes, refluxo intenso ou recusa alimentar;",
                         "ganho de peso abaixo do esperado ou sonolência excessiva (difícil de acordar);",
                         "o sono piorou muito de repente, sem motivo aparente;",
                         "você está exausta a ponto de não conseguir cuidar de si ou do bebê."]),
          caixa("Cuide de você também", [
              "Dormir pouco por muito tempo afeta o humor e a saúde. Peça ajuda, divida as noites com outra pessoa quando "
              "puder e descanse nas sonecas do bebê de vez em quando. Se a tristeza, o choro ou a ansiedade estiverem "
              "constantes, fale com um médico: você merece cuidado."], ROSA_TINTA, ROSA),
          P("Perguntas frequentes", "h2")]
    pq = ParagraphStyle("pq", fontName="SerifSemi", fontSize=11.5, leading=16, textColor=NOITE, spaceBefore=6, spaceAfter=3, keepWithNext=1)
    for q, r in [
        ("Posso começar a rotina com qualquer idade?", "Sim. Para menores de 4 meses, foque em diferenciar dia e noite e em respeitar as janelas. O plano de 7 noites é a partir dos 6 meses."),
        ("Em quanto tempo vejo resultado?", "Muitas famílias notam melhora em 1 a 2 semanas de rotina constante. Cada bebê tem seu tempo."),
        ("E se o bebê dormir na creche ou com a avó?", "Compartilhe a rotina impressa (está no fim do guia) para que todos sigam os mesmos horários e passos."),
        ("Chupeta ajuda?", "Para muitos bebês, sim, e ela faz parte das recomendações de sono seguro depois que a amamentação está bem estabelecida. Converse com o pediatra."),
    ]:
        s += [KeepTogether([Paragraph(q, pq), P(r)])]
    s += [PageBreak()]

    # Imprimíveis
    s += [Abertura(None, "Imprimíveis", "Quadro de rotina, diário do sono e checklist", "MATERIAL DE APOIO"),
          P("Imprima estas páginas e cole na geladeira ou deixe no quarto do bebê. Assim todo mundo da casa segue a mesma rotina.", "lede"),
          P("Quadro de rotina do bebê", "h2"),
          P("Nome do bebê: ______________________________    Idade: __________"),
          tabela(["Horário", "Atividade", "Observações"],
                 [["", "Acordar", ""], ["", "Soneca 1", ""], ["", "Soneca 2", ""], ["", "Soneca 3", ""],
                  ["", "Início do ritual", ""], ["", "Hora de dormir", ""]],
                 [0.2, 0.32, 0.48], alturas=[26] + [36] * 6),
          PageBreak(),
          P("Diário do sono — 7 dias", "h2"),
          P("Anote por uma semana. Depois de alguns dias, você vai enxergar o padrão do seu bebê e saber o que ajustar."),
          tabela(["Dia", "Acordou", "Sonecas", "Dormiu", "Despertares", "Como foi?"],
                 [[d, "", "", "", "", ""] for d in ("Dia 1", "Dia 2", "Dia 3", "Dia 4", "Dia 5", "Dia 6", "Dia 7")],
                 [0.11, 0.13, 0.28, 0.13, 0.16, 0.19], alturas=[26] + [62] * 7),
          PageBreak(),
          P("Checklist do ritual do sono", "h2"),
          P("Marque todas as noites. Constância é o que faz funcionar."),
          tabela(["Passo", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"],
                 [[p, "", "", "", "", "", "", ""] for p in
                  ("Telas desligadas 1h antes", "Luzes baixas", "Banho morno", "Massagem", "Pijama e fralda",
                   "Mamada no quarto", "História ou canção", "Frase de boa-noite", "Berço sonolento, mas acordado")],
                 [0.37] + [0.09] * 7, alturas=[26] + [32] * 9),
          caixa("Checklist do sono seguro", [
              "[  ]  Bebê dorme de barriga para cima", "[  ]  No próprio berço, no quarto dos pais",
              "[  ]  Colchão firme, lençol ajustado, berço vazio", "[  ]  Ambiente sem fumaça",
              "[  ]  Sem roupa ou mantas em excesso"], LAVANDA_TINTA, NOITE),
          PageBreak()]

    # Fechamento
    tem10 = bool(ILUSTRACOES.get(10))
    s += [Spacer(1, 30 if tem10 else 150), ilustracao(10, 230, 220),
          Paragraph('<font name="SerifIt" size="32" color="#2B2D5B">Boa noite</font>', st["centro"]), Spacer(1, 20),
          P("Não existe mãe perfeita nem bebê perfeito. Existe constância, carinho e paciência. "
            "Alguns dias vão ser melhores que outros, e tudo bem.", "centro"),
          P("Você está fazendo um ótimo trabalho. Que venham muitas noites tranquilas para vocês.", "centro"),
          Spacer(1, 40),
          P("Este material tem caráter educativo e não substitui consultas, diagnósticos ou orientações do pediatra. "
            "Siga sempre as recomendações do profissional que acompanha o seu bebê.", "pequeno")]
    return s


def juntar_titulos(historia):
    """Título nunca fica sozinho no pé da página: vai junto com o bloco seguinte."""
    saida, i = [], 0
    while i < len(historia):
        f = historia[i]
        titulo = isinstance(f, Paragraph) and getattr(f.style, "keepWithNext", 0)
        if titulo and i + 1 < len(historia):
            saida.append(KeepTogether([f, historia[i + 1]]))
            i += 2
        else:
            saida.append(f)
            i += 1
    return saida


def main():
    os.makedirs(os.path.join(AQUI, "saida"), exist_ok=True)
    caminho = os.path.join(AQUI, "saida", "noites-tranquilas.pdf")
    doc = Guia(caminho)
    doc.multiBuild(juntar_titulos(conteudo()))
    print(f"PDF gerado: {caminho} ({doc.page} páginas)")


if __name__ == "__main__":
    main()
