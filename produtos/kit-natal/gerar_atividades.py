#!/usr/bin/env python3
"""Gera as atividades do Kit Natal Mágico em PDF (A4), em duas versões:

  saida/kit-natal-colorido.pdf   -> visual colorido e chamativo (pra vender e pra quem tem impressora colorida)
  saida/kit-natal-economico.pdf  -> mesmo conteúdo em preto e branco (não gasta tinta colorida)

Capa, sumário, página "como usar" pros pais, caça-palavras, labirintos, palavras embaralhadas,
matemática, caligrafia e gabaritos. Cada página tem passo a passo, nível de dificuldade,
"Dica do Noel" e as habilidades que a criança treina.

Desenhos de colorir: coloque as imagens em produtos/kit-natal/desenhos/ com o número do
prompt no nome (01.png, 02.jpg, ... ou "desenho 3.png"). Eles entram no começo do kit,
limpos (só preto e branco) e com o tema do arquivo prompts-colorir.md como título.

Uso: python3 produtos/kit-natal/gerar_atividades.py
"""
import math
import os
import random
import unicodedata

from reportlab.lib.colors import HexColor, white, black, Color
from reportlab.lib.pagesizes import A4
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader

try:
    from PIL import Image, ImageOps
except ImportError:  # sem Pillow, o kit sai sem os desenhos de colorir
    Image = None

W, H = A4
M = 36
AQUI = os.path.dirname(os.path.abspath(__file__))
FONTES = os.path.join(AQUI, "fontes")
for nome, arq in [("Titulo", "Fredoka-Bold.ttf"), ("Sub", "Fredoka-SemiBold.ttf"),
                  ("Texto", "Nunito-SemiBold.ttf"), ("Forte", "Nunito-ExtraBold.ttf")]:
    pdfmetrics.registerFont(TTFont(nome, os.path.join(FONTES, arq)))

# ---------- temas ----------
COLORIDO = dict(
    nome="colorido",
    vermelho=HexColor("#E63946"), verde=HexColor("#2A9D8F"), verde_escuro=HexColor("#1F6F5C"),
    dourado=HexColor("#FFB703"), azul=HexColor("#1D3557"), azul_claro=HexColor("#A8DADC"),
    creme=HexColor("#FFF6E5"), rosa=HexColor("#FFD6DA"), menta=HexColor("#D8F3EC"),
    amarelo_claro=HexColor("#FFF1C1"), texto=HexColor("#1D3557"), cinza=HexColor("#C9CED6"),
    pasteis=[HexColor(h) for h in ("#FFD6DA", "#D8F3EC", "#FFF1C1", "#DDE7FF", "#F3DFFF", "#FFE3CC")],
    fortes=[HexColor(h) for h in ("#E63946", "#2A9D8F", "#F4A261", "#457B9D", "#9B5DE5", "#E76F51")],
)
ECONOMICO = dict(
    nome="economico",
    vermelho=black, verde=black, verde_escuro=black, dourado=black, azul=black,
    azul_claro=HexColor("#BBBBBB"), creme=white, rosa=white, menta=white, amarelo_claro=white,
    texto=black, cinza=HexColor("#BBBBBB"), pasteis=[white] * 6, fortes=[black] * 6,
)


def sem_acento(p):
    return "".join(ch for ch in unicodedata.normalize("NFD", p) if unicodedata.category(ch) != "Mn").upper()


# ---------- formas ----------
def estrela(c, x, y, r, fill=None, stroke=None, lw=1):
    pts = []
    for i in range(10):
        a = math.pi / 2 + i * math.pi / 5
        rr = r if i % 2 == 0 else r * 0.45
        pts.append((x + rr * math.cos(a), y + rr * math.sin(a)))
    p = c.beginPath()
    p.moveTo(*pts[0])
    for pt in pts[1:]:
        p.lineTo(*pt)
    p.close()
    c.setLineWidth(lw)
    if fill is not None:
        c.setFillColor(fill)
    if stroke is not None:
        c.setStrokeColor(stroke)
    c.drawPath(p, stroke=1 if stroke is not None else 0, fill=1 if fill is not None else 0)


def floco(c, x, y, r, cor):
    c.setStrokeColor(cor)
    c.setLineWidth(1.2)
    for k in range(3):
        a = k * math.pi / 3
        dx, dy = r * math.cos(a), r * math.sin(a)
        c.line(x - dx, y - dy, x + dx, y + dy)
        for s in (1, -1):
            ex, ey = x + s * dx * 0.6, y + s * dy * 0.6
            for t in (1, -1):
                b = a + t * math.pi / 4
                c.line(ex, ey, ex + s * r * 0.3 * math.cos(b), ey + s * r * 0.3 * math.sin(b))


def bola_natal(c, x, y, r, cor, T):
    c.setStrokeColor(T["texto"])
    c.setLineWidth(1.2)
    c.setFillColor(cor)
    c.circle(x, y, r, stroke=1, fill=1)
    c.setFillColor(T["dourado"] if T["nome"] == "colorido" else white)
    c.rect(x - r * 0.3, y + r * 0.85, r * 0.6, r * 0.35, stroke=1, fill=1)
    if T["nome"] == "colorido":
        c.setFillColor(Color(1, 1, 1, alpha=0.55))
        c.circle(x - r * 0.35, y + r * 0.35, r * 0.22, stroke=0, fill=1)


def pinheiro(c, x, y, s, T):
    c.setStrokeColor(T["texto"])
    c.setLineWidth(1.2)
    c.setFillColor(HexColor("#8D5524") if T["nome"] == "colorido" else white)
    c.rect(x - s * 0.08, y, s * 0.16, s * 0.16, stroke=1, fill=1)
    c.setFillColor(T["verde"] if T["nome"] == "colorido" else white)
    for i, (w, h0) in enumerate([(0.9, 0.12), (0.7, 0.42), (0.5, 0.68)]):
        p = c.beginPath()
        p.moveTo(x, y + s * (h0 + 0.42))
        p.lineTo(x - s * w / 2, y + s * h0)
        p.lineTo(x + s * w / 2, y + s * h0)
        p.close()
        c.drawPath(p, stroke=1, fill=1)
    estrela(c, x, y + s * 1.1, s * 0.12, fill=T["dourado"] if T["nome"] == "colorido" else white, stroke=T["texto"])


def gorro(c, x, y, s, T):
    c.setStrokeColor(T["texto"])
    c.setLineWidth(1)
    c.setFillColor(T["vermelho"] if T["nome"] == "colorido" else white)
    p = c.beginPath()
    p.moveTo(x - s * 0.5, y)
    p.curveTo(x - s * 0.3, y + s * 0.8, x + s * 0.2, y + s * 0.9, x + s * 0.55, y + s * 0.55)
    p.lineTo(x + s * 0.5, y)
    p.close()
    c.drawPath(p, stroke=1, fill=1)
    c.setFillColor(white)
    c.roundRect(x - s * 0.58, y - s * 0.15, s * 1.16, s * 0.25, s * 0.1, stroke=1, fill=1)
    c.circle(x + s * 0.58, y + s * 0.55, s * 0.13, stroke=1, fill=1)


def presente(c, x, y, s, cor, T):
    c.setStrokeColor(T["texto"])
    c.setLineWidth(1.2)
    c.setFillColor(cor)
    c.rect(x - s / 2, y, s, s * 0.75, stroke=1, fill=1)
    c.setFillColor(T["dourado"] if T["nome"] == "colorido" else white)
    c.rect(x - s * 0.08, y, s * 0.16, s * 0.75, stroke=1, fill=1)
    c.rect(x - s / 2, y + s * 0.3, s, s * 0.14, stroke=1, fill=1)
    c.ellipse(x - s * 0.3, y + s * 0.75, x, y + s * 0.95, stroke=1, fill=1)
    c.ellipse(x, y + s * 0.75, x + s * 0.3, y + s * 0.95, stroke=1, fill=1)


# ---------- estrutura da página ----------
class Kit:
    AREA_BAIXO = M + 60  # onde o conteúdo termina (acima da Dica do Noel)

    def __init__(self, caminho, T, semente=2026):
        random.seed(semente)  # as duas versões têm exatamente as mesmas atividades
        self.T = T
        self.c = canvas.Canvas(caminho, pagesize=A4)
        self.c.setTitle("Kit Natal Mágico")
        self.c.setAuthor("Kit Natal Mágico")
        self.pagina = 0
        self.gabaritos = []

    def cor(self):
        return self.T["nome"] == "colorido"

    def borda(self):
        c, T = self.c, self.T
        r = (M - 18, M - 18, W - 2 * (M - 18), H - 2 * (M - 18), 22)
        c.setLineWidth(9)
        c.setStrokeColor(T["vermelho"])
        c.roundRect(*r, stroke=1, fill=0)
        if self.cor():  # bengala-doce: listras brancas por cima do vermelho
            c.setStrokeColor(white)
            c.setDash(7, 14)
            c.roundRect(*r, stroke=1, fill=0)
            c.setDash()
        else:
            c.setStrokeColor(white)
            c.setLineWidth(5)
            c.roundRect(*r, stroke=1, fill=0)
        c.setLineWidth(1)

    def cabecalho(self, titulo, nivel=None, passos=None, nome=True):
        c, T = self.c, self.T
        self.borda()
        y = H - M - 52
        c.setFillColor(T["verde"] if self.cor() else white)
        c.setStrokeColor(T["verde_escuro"])
        c.setLineWidth(2)
        # pontas da fita
        for lado in (-1, 1):
            bx = W / 2 + lado * (W / 2 - M - 40)
            p = c.beginPath()
            p.moveTo(bx, y + 40)
            p.lineTo(bx + lado * 30, y + 40)
            p.lineTo(bx + lado * 20, y + 23)
            p.lineTo(bx + lado * 30, y + 6)
            p.lineTo(bx, y + 6)
            p.close()
            c.setFillColor(T["vermelho"] if self.cor() else white)
            c.drawPath(p, stroke=1, fill=1)
        c.setFillColor(T["verde"] if self.cor() else white)
        c.roundRect(M + 36, y, W - 2 * M - 72, 46, 23, stroke=1, fill=1)
        c.setFillColor(white if self.cor() else black)
        c.setFont("Titulo", 25)
        c.drawCentredString(W / 2, y + 14, titulo)
        # bolinhas penduradas nos cantos
        for bx, cr in ((M + 6, T["dourado"]), (W - M - 6, T["vermelho"])):
            c.setStrokeColor(T["texto"])
            c.setLineWidth(0.8)
            c.line(bx, H - M + 4, bx, H - M - 24)
            bola_natal(c, bx, H - M - 34, 9, cr, T)
        yy = y - 26
        if nome:
            c.setFillColor(T["texto"])
            c.setFont("Forte", 12)
            c.drawString(M + 10, yy, "Nome:")
            c.setStrokeColor(T["texto"])
            c.setLineWidth(0.8)
            c.line(M + 52, yy - 2, M + 300, yy - 2)
        if nivel:
            self.selo_nivel(W - M - 150, yy - 8, nivel)
        yy -= 20
        if passos:
            yy = self.passo_a_passo(passos, yy)
        return yy - 8

    def selo_nivel(self, x, y, nivel):
        c, T = self.c, self.T
        n = {"fácil": 1, "médio": 2, "difícil": 3}[nivel]
        c.setFillColor(T["amarelo_claro"])
        c.setStrokeColor(T["dourado"])
        c.setLineWidth(1.5)
        c.roundRect(x, y, 140, 24, 12, stroke=1, fill=1)
        c.setFillColor(T["texto"])
        c.setFont("Forte", 11)
        c.drawString(x + 10, y + 8, f"Nível {nivel}")
        for i in range(3):
            estrela(c, x + 95 + i * 16, y + 12, 7, fill=T["dourado"] if i < n else white, stroke=T["texto"], lw=0.8)

    def passo_a_passo(self, passos, y):
        c, T = self.c, self.T
        h = 34
        c.setFillColor(T["menta"])
        c.setStrokeColor(T["verde"])
        c.setLineWidth(1.2)
        c.roundRect(M + 6, y - h, W - 2 * M - 12, h, 10, stroke=1, fill=1)
        larg = (W - 2 * M - 30) / len(passos)
        for i, p in enumerate(passos):
            x = M + 18 + i * larg
            c.setFillColor(T["fortes"][i % 6] if self.cor() else white)
            c.setStrokeColor(T["texto"])
            c.circle(x + 8, y - h / 2, 9, stroke=1, fill=1)
            c.setFillColor(white if self.cor() else black)
            c.setFont("Titulo", 11)
            c.drawCentredString(x + 8, y - h / 2 - 4, str(i + 1))
            c.setFillColor(T["texto"])
            c.setFont("Texto", 10)
            c.drawString(x + 22, y - h / 2 - 3.5, p)
        return y - h

    def numero_pagina(self):
        c, T = self.c, self.T
        self.pagina += 1
        c.setFillColor(T["texto"])
        c.setFont("Sub", 9)
        c.drawCentredString(W / 2, M - 13, f"Kit Natal Mágico  •  página {self.pagina}")
        c.showPage()

    def rodape(self, dica=None, habilidades=None):
        c, T = self.c, self.T
        if dica:
            y, h = M + 6, 44
            c.setFillColor(T["amarelo_claro"])
            c.setStrokeColor(T["dourado"])
            c.setLineWidth(1.5)
            c.roundRect(M + 6, y, W - 2 * M - 12, h, 12, stroke=1, fill=1)
            gorro(c, M + 30, y + 14, 26, T)
            c.setFillColor(T["vermelho"])
            c.setFont("Titulo", 12)
            c.drawString(M + 56, y + 26, "Dica do Noel:")
            c.setFillColor(T["texto"])
            c.setFont("Texto", 10.5)
            c.drawString(M + 56, y + 10, dica)
            if habilidades:
                c.setFont("Forte", 8.5)
                c.setFillColor(T["verde_escuro"])
                c.drawRightString(W - M - 16, y + 28, "Treina: " + " • ".join(habilidades))
        self.numero_pagina()

    def titulo_gabarito(self, t):
        topo = self.cabecalho("Gabarito", nome=False)
        self.c.setFillColor(self.T["texto"])
        self.c.setFont("Sub", 15)
        self.c.drawCentredString(W / 2, topo - 4, t)
        return topo - 22

    # ---------- capa / como usar / sumário ----------
    def capa(self):
        c, T = self.c, self.T
        cor = self.cor()
        if cor:
            c.setFillColor(T["azul"])
            c.rect(0, 0, W, H, stroke=0, fill=1)
            rnd = random.Random(7)
            for _ in range(45):
                floco(c, rnd.uniform(20, W - 20), rnd.uniform(260, H - 20), rnd.uniform(4, 10), T["azul_claro"])
            c.setFillColor(white)
            p = c.beginPath()
            p.moveTo(0, 0)
            p.lineTo(0, 230)
            p.curveTo(W * 0.3, 290, W * 0.6, 180, W, 250)
            p.lineTo(W, 0)
            p.close()
            c.drawPath(p, stroke=0, fill=1)
        else:
            self.borda()
        c.setFillColor(T["dourado"] if cor else black)
        c.setFont("Sub", 22)
        c.drawCentredString(W / 2, H - 120, "atividades para imprimir")
        for lado in (-1, 1):
            estrela(c, W / 2 + lado * 150, H - 113, 9, fill=T["dourado"] if cor else white, stroke=None if cor else black)
        c.setFont("Titulo", 66)
        c.setFillColor(white if cor else black)
        c.drawCentredString(W / 2, H - 200, "Kit Natal")
        c.setFillColor(T["vermelho"] if cor else black)
        c.drawCentredString(W / 2, H - 268, "Mágico")
        c.setFillColor(T["dourado"] if cor else white)
        c.setStrokeColor(white if cor else black)
        c.setLineWidth(3)
        c.circle(W - 105, H - 335, 48, stroke=1, fill=1)
        c.setFillColor(T["azul"] if cor else black)
        c.setFont("Titulo", 16)
        c.drawCentredString(W - 105, H - 328, "3 a 10")
        c.drawCentredString(W - 105, H - 348, "anos")
        pinheiro(c, W / 2, 190, 240, T)
        for i, (bx, by) in enumerate([(-55, 285), (45, 320), (-25, 375), (38, 245), (-70, 225), (8, 300), (-10, 420), (60, 280)]):
            bola_natal(c, W / 2 + bx, by, 8, T["fortes"][i % 6] if cor else white, T)
        presente(c, W / 2 - 160, 150, 75, T["vermelho"] if cor else white, T)
        presente(c, W / 2 + 160, 150, 64, T["verde"] if cor else white, T)
        presente(c, W / 2 + 100, 140, 42, HexColor("#9B5DE5") if cor else white, T)
        presente(c, W / 2 - 100, 140, 40, T["dourado"] if cor else white, T)
        c.setFillColor(T["vermelho"] if cor else white)
        c.setStrokeColor(white if cor else black)
        c.setLineWidth(3)
        c.roundRect(M + 10, 56, W - 2 * M - 20, 62, 31, stroke=1, fill=1)
        c.setFillColor(white if cor else black)
        c.setFont("Titulo", 18)
        c.drawCentredString(W / 2, 92, "Caça-palavras • Labirintos • Matemática")
        c.setFont("Sub", 14)
        c.drawCentredString(W / 2, 71, "Palavras embaralhadas • Caligrafia • Gabaritos")
        self.pagina += 1
        c.showPage()

    def como_usar(self):
        c, T = self.c, self.T
        y = self.cabecalho("Como usar o kit", nome=False) - 4
        dicas = [
            ("Imprima em A4", "Em casa ou na papelaria. Imprima quantas vezes quiser, pra filhos, sobrinhos ou alunos."),
            ("Uma atividade por dia", "Faça um 'calendário do Advento' de atividades até o Natal: a criança espera ansiosa!"),
            ("Comece pelo nível fácil", "As estrelinhas no topo de cada página mostram a dificuldade: 1 = fácil, 3 = difícil."),
            ("Leia junto", "Pra quem ainda não lê, leia o passo a passo e as palavras em voz alta."),
            ("Elogie o esforço", "Mais importante que acertar é tentar. Comemore cada página terminada!"),
            ("Confira no gabarito", "As respostas estão no fim do kit. Deixe a criança conferir sozinha."),
            ("Versão econômica", "Sem impressora colorida? Use o arquivo em preto e branco: a criança ainda pinta!"),
        ]
        alt = (y - self.AREA_BAIXO) / len(dicas)
        for i, (tit, txt) in enumerate(dicas):
            c.setFillColor(T["pasteis"][i % 6])
            c.setStrokeColor(T["fortes"][i % 6])
            c.setLineWidth(1.5)
            c.roundRect(M + 10, y - alt + 6, W - 2 * M - 20, alt - 10, 14, stroke=1, fill=1)
            mid = y - alt / 2 + 1
            estrela(c, M + 38, mid, 14, fill=T["dourado"] if self.cor() else white, stroke=T["texto"])
            c.setFillColor(T["texto"])
            c.setFont("Titulo", 15)
            c.drawString(M + 64, mid + 4, tit)
            c.setFont("Texto", 10.5)
            c.drawString(M + 64, mid - 13, txt)
            y -= alt
        self.rodape(dica="Guarde as atividades prontas numa pastinha: vira um livro de recordações do Natal!")

    def sumario(self, itens):
        c, T = self.c, self.T
        y = self.cabecalho("O que tem no kit", nome=False) - 2
        alt = (y - self.AREA_BAIXO) / len(itens)
        for i, (nome, pag, icone) in enumerate(itens):
            c.setFillColor(T["pasteis"][i % 6])
            c.setStrokeColor(T["cinza"])
            c.setLineWidth(0.8)
            c.roundRect(M + 20, y - alt + 2, W - 2 * M - 40, alt - 4, 9, stroke=1, fill=1)
            mid = y - alt / 2
            if icone == "estrela":
                estrela(c, M + 40, mid, 7, fill=T["dourado"] if self.cor() else white, stroke=T["texto"])
            elif icone == "bola":
                bola_natal(c, M + 40, mid - 2, 6, T["vermelho"] if self.cor() else white, T)
            else:
                pinheiro(c, M + 40, mid - 8, 13, T)
            c.setFillColor(T["texto"])
            c.setFont("Sub", 12)
            c.drawString(M + 58, mid - 4, nome)
            c.setFont("Titulo", 12)
            c.drawRightString(W - M - 34, mid - 4, f"pág. {pag}")
            y -= alt
        self.rodape(dica="Faça as atividades na ordem que quiser: cada página é independente.")

    # ---------- caça-palavras ----------
    def caca_palavras(self, titulo, palavras, n, dirs, nivel):
        g, pos = montar_grade(palavras, n, dirs)
        topo = self.cabecalho(titulo, nivel, ["Leia a palavra da lista", "Procure na grade", "Pinte e marque a bolinha"])
        lista_h = 30 * math.ceil(len(palavras) / 3) + 6
        y = self.grade(g, topo - 10, self.AREA_BAIXO + lista_h + 16)
        self.lista_palavras(palavras, y - 6)
        dicas = {"fácil": "As palavras estão só deitadas ou em pé. Procure primeiro a letra inicial!",
                 "médio": "Agora tem palavra na diagonal também. Use o dedinho pra seguir as letras.",
                 "difícil": "Desafio! Tem palavra de trás pra frente e de baixo pra cima."}
        self.rodape(dicas[nivel], ["atenção", "leitura", "vocabulário"])

        def gab(t=titulo, g=g, pos=pos):
            topo = self.titulo_gabarito(t)
            self.grade(g, topo - 8, self.AREA_BAIXO, pos)
            self.numero_pagina()
        self.gabaritos.append(gab)

    def grade(self, g, topo, baixo, pos=None):
        c, T = self.c, self.T
        n = len(g)
        cel = min((W - 2 * M - 40) / n, (topo - baixo - 16) / n, 34)
        x0 = (W - cel * n) / 2
        y0 = topo - 8
        c.setFillColor(white)
        c.setStrokeColor(T["verde"])
        c.setLineWidth(2.5)
        c.roundRect(x0 - 8, y0 - cel * n - 8, cel * n + 16, cel * n + 16, 12, stroke=1, fill=1)
        if self.cor():
            c.setFillColor(T["creme"])
            for yy in range(n):
                for xx in range(n):
                    if (xx + yy) % 2 == 0:
                        c.rect(x0 + xx * cel, y0 - (yy + 1) * cel, cel, cel, stroke=0, fill=1)
        if pos:
            c.setLineCap(1)
            for i, (x, y, xe, ye) in enumerate(pos.values()):
                f = T["fortes"][i % 6]
                c.setStrokeColor(Color(f.red, f.green, f.blue, alpha=0.45) if self.cor() else HexColor("#BBBBBB"))
                c.setLineWidth(cel * 0.62)
                c.line(x0 + x * cel + cel / 2, y0 - y * cel - cel / 2, x0 + xe * cel + cel / 2, y0 - ye * cel - cel / 2)
            c.setLineCap(0)
        c.setFillColor(T["texto"])
        c.setFont("Sub", cel * 0.6)
        for yy in range(n):
            for xx in range(n):
                c.drawCentredString(x0 + xx * cel + cel / 2, y0 - yy * cel - cel * 0.72, g[yy][xx])
        return y0 - cel * n - 16

    def lista_palavras(self, palavras, y):
        c, T = self.c, self.T
        cols = 3
        larg = (W - 2 * M - 20) / cols
        for i, p in enumerate(palavras):
            x = M + 10 + (i % cols) * larg
            yy = y - (i // cols) * 30
            c.setFillColor(T["pasteis"][i % 6])
            c.setStrokeColor(T["fortes"][i % 6])
            c.setLineWidth(1.2)
            c.roundRect(x, yy - 24, larg - 10, 24, 12, stroke=1, fill=1)
            c.setFillColor(white)
            c.circle(x + 14, yy - 12, 6, stroke=1, fill=1)
            c.setFillColor(T["texto"])
            c.setFont("Forte", 12)
            c.drawString(x + 26, yy - 16.5, p.upper())

    # ---------- labirinto ----------
    def labirinto(self, titulo, cols, rows, inicio, fim, nivel, dica):
        paredes = gerar_labirinto(cols, rows)
        topo = self.cabecalho(titulo, nivel, ["Comece no INÍCIO", "Siga sem cruzar paredes", f"Chegue: {fim}!"])
        self.desenhar_labirinto(paredes, cols, rows, topo, inicio, fim)
        self.rodape(dica, ["coordenação", "planejamento", "paciência"])

        def gab(t=titulo):
            topo = self.titulo_gabarito(t)
            self.desenhar_labirinto(paredes, cols, rows, topo, inicio, fim, resolver(paredes, cols, rows))
            self.numero_pagina()
        self.gabaritos.append(gab)

    def desenhar_labirinto(self, paredes, cols, rows, topo, inicio, fim, caminho=None):
        c, T = self.c, self.T
        cel = min((W - 2 * M - 60) / cols, (topo - self.AREA_BAIXO - 70) / rows)
        x0 = (W - cel * cols) / 2
        y0 = topo - 34
        if self.cor():
            c.setFillColor(T["menta"])
            c.roundRect(x0 - 10, y0 - cel * rows - 10, cel * cols + 20, cel * rows + 20, 12, stroke=0, fill=1)
            c.setFillColor(white)
            c.rect(x0, y0 - cel * rows, cel * cols, cel * rows, stroke=0, fill=1)
        if caminho:
            c.setStrokeColor(T["vermelho"] if self.cor() else HexColor("#999999"))
            c.setLineWidth(cel * 0.3)
            c.setLineCap(1)
            c.setLineJoin(1)
            p = c.beginPath()
            for i, (x, y) in enumerate(caminho):
                px, py = x0 + x * cel + cel / 2, y0 - y * cel - cel / 2
                p.moveTo(px, py) if i == 0 else p.lineTo(px, py)
            c.drawPath(p, stroke=1, fill=0)
        c.setStrokeColor(T["verde_escuro"])
        c.setLineWidth(max(2, cel * 0.12))
        c.setLineCap(1)
        for (x, y), ps in paredes.items():
            X, Y = x0 + x * cel, y0 - y * cel
            if "N" in ps and (x, y) != (0, 0):
                c.line(X, Y, X + cel, Y)
            if "O" in ps:
                c.line(X, Y, X, Y - cel)
            if "S" in ps and (x, y) != (cols - 1, rows - 1):
                c.line(X, Y - cel, X + cel, Y - cel)
            if "L" in ps:
                c.line(X + cel, Y, X + cel, Y - cel)
        c.setLineCap(0)
        self.selo(x0, y0 + 20, "INÍCIO: " + inicio, T["vermelho"])
        self.selo(x0 + cel * cols, y0 - cel * rows - 22, "FIM: " + fim, T["dourado"], direita=True)

    def selo(self, x, y, texto, cr, direita=False):
        c, T = self.c, self.T
        c.setFont("Titulo", 11)
        w = c.stringWidth(texto, "Titulo", 11) + 22
        bx = x - w if direita else x
        c.setFillColor(cr if self.cor() else white)
        c.setStrokeColor(T["texto"])
        c.setLineWidth(1.2)
        c.roundRect(bx, y - 10, w, 20, 10, stroke=1, fill=1)
        c.setFillColor(white if self.cor() and cr != T["dourado"] else T["texto"])
        c.drawString(bx + 11, y - 4, texto)

    # ---------- palavras embaralhadas ----------
    def embaralhadas(self, titulo, palavras, nivel):
        c, T = self.c, self.T
        topo = self.cabecalho(titulo, nivel, ["Leia as letras misturadas", "Descubra a palavra", "Escreva nos quadrinhos"])
        y = topo - 4
        resp = []
        alt = (topo - self.AREA_BAIXO - 6) / len(palavras)
        for i, p in enumerate(palavras):
            w = sem_acento(p)
            letras = list(w)
            while "".join(letras) == w:
                random.shuffle(letras)
            resp.append(p.upper())
            c.setFillColor(T["pasteis"][i % 6])
            c.setStrokeColor(T["fortes"][i % 6])
            c.setLineWidth(1.2)
            c.roundRect(M + 10, y - alt + 6, W - 2 * M - 20, alt - 8, 14, stroke=1, fill=1)
            mid = y - alt / 2 + 2
            c.setFillColor(T["fortes"][i % 6] if self.cor() else white)
            c.setStrokeColor(T["texto"])
            c.circle(M + 34, mid, 13, stroke=1, fill=1)
            c.setFillColor(white if self.cor() else black)
            c.setFont("Titulo", 14)
            c.drawCentredString(M + 34, mid - 5, str(i + 1))
            t = 26
            for k, l in enumerate(letras):  # peças com as letras misturadas
                lx = M + 62 + k * (t + 5)
                c.setFillColor(white)
                c.setStrokeColor(T["fortes"][(i + k) % 6])
                c.setLineWidth(1.6)
                c.roundRect(lx, mid + 6, t, t, 6, stroke=1, fill=1)
                c.setFillColor(T["fortes"][(i + k) % 6] if self.cor() else black)
                c.setFont("Titulo", 16)
                c.drawCentredString(lx + t / 2, mid + 13, l)
            for k in range(len(w)):  # quadrinhos de resposta: mostram quantas letras tem
                lx = M + 62 + k * (t + 5)
                c.setFillColor(white)
                c.setStrokeColor(T["texto"])
                c.setLineWidth(1)
                c.rect(lx, mid - 30, t, t, stroke=1, fill=1)
            y -= alt
        self.rodape("Os quadrinhos mostram quantas letras a palavra tem. Comece pela primeira!",
                    ["leitura", "ortografia", "raciocínio"])

        def gab(t=titulo, resp=resp):
            yy = self.titulo_gabarito(t) - 24
            for i, r in enumerate(resp):
                c.setFont("Titulo", 20)
                c.setFillColor(T["fortes"][i % 6] if self.cor() else black)
                c.drawString(M + 80, yy, f"{i + 1}.")
                c.setFillColor(T["texto"])
                c.drawString(M + 115, yy, r)
                yy -= 44
            self.numero_pagina()
        self.gabaritos.append(gab)

    # ---------- matemática ----------
    def contar(self, titulo, nivel):
        c, T = self.c, self.T
        topo = self.cabecalho(titulo, nivel, ["Aponte cada desenho", "Conte em voz alta", "Escreva o número"])
        cw = (W - 2 * M - 30) / 2
        ch = (topo - self.AREA_BAIXO - 12) / 4
        tipos = ["estrela", "bola", "pinheiro", "presente"]
        for i in range(8):
            col, lin = i % 2, i // 2
            x = M + 10 + col * (cw + 10)
            y = topo - 6 - (lin + 1) * ch
            c.setFillColor(T["pasteis"][i % 6])
            c.setStrokeColor(T["fortes"][i % 6])
            c.setLineWidth(1.5)
            c.roundRect(x, y + 4, cw, ch - 8, 12, stroke=1, fill=1)
            n = random.randint(2, 10) if nivel == "fácil" else random.randint(8, 15)
            tipo = tipos[i % 4]
            por_linha = 5
            esp = (cw - 76) / por_linha
            linhas = math.ceil(n / por_linha)
            dy = min(30, (ch - 24) / linhas)
            for k in range(n):
                px = x + 22 + (k % por_linha) * esp
                py = y + ch - 26 - (k // por_linha) * dy
                if tipo == "estrela":
                    estrela(c, px, py, 10, fill=T["dourado"] if self.cor() else white, stroke=T["texto"])
                elif tipo == "bola":
                    bola_natal(c, px, py - 3, 8, T["fortes"][k % 6] if self.cor() else white, T)
                elif tipo == "pinheiro":
                    pinheiro(c, px, py - 11, 20, T)
                else:
                    presente(c, px, py - 9, 18, T["fortes"][(k + 1) % 6] if self.cor() else white, T)
            c.setFillColor(white)
            c.setStrokeColor(T["texto"])
            c.setLineWidth(2)
            c.roundRect(x + cw - 52, y + 14, 40, 40, 8, stroke=1, fill=1)
        self.rodape("Toque em cada desenho com o dedo enquanto conta. Assim não pula nenhum!",
                    ["contagem", "números", "atenção"])

    def contas(self, titulo, op, maximo, nivel, bolinhas=False):
        c, T = self.c, self.T
        passos = ["Leia a continha", "Conte as bolinhas", "Escreva o resultado"] if bolinhas else \
                 ["Leia a continha", "Some os números" if op == "+" else "Tire o menor do maior", "Escreva o resultado"]
        topo = self.cabecalho(titulo, nivel, passos)
        resp = []
        cw = (W - 2 * M - 30) / 2
        ch = (topo - self.AREA_BAIXO - 6) / 5
        for i in range(10):
            a, b = random.randint(1, maximo), random.randint(1, maximo)
            if op == "-" and b > a:
                a, b = b, a
            r = a + b if op == "+" else a - b
            resp.append(f"{a} {op} {b} = {r}")
            col, lin = i % 2, i // 2
            x = M + 10 + col * (cw + 10)
            y = topo - 4 - (lin + 1) * ch
            c.setFillColor(T["pasteis"][i % 6])
            c.setStrokeColor(T["fortes"][i % 6])
            c.setLineWidth(1.5)
            c.roundRect(x, y + 4, cw, ch - 8, 12, stroke=1, fill=1)
            ty = y + ch - 42 if bolinhas else y + ch / 2 - 8
            c.setFillColor(T["texto"])
            c.setFont("Titulo", 28)
            c.drawString(x + 18, ty, f"{a} {op} {b} =")
            c.setFillColor(white)
            c.setStrokeColor(T["texto"])
            c.setLineWidth(2)
            c.roundRect(x + cw - 66, ty - 10, 50, 40, 8, stroke=1, fill=1)
            if bolinhas:
                c.setLineWidth(0.8)
                for k in range(a):
                    c.setFillColor(T["vermelho"] if self.cor() else white)
                    c.circle(x + 24 + k * 15, y + 26, 5.5, stroke=1, fill=1)
                ox = x + 24 + a * 15 + 10
                for k in range(b):
                    c.setFillColor(T["verde"] if self.cor() else HexColor("#BBBBBB"))
                    c.circle(ox + k * 15, y + 26, 5.5, stroke=1, fill=1)
        dica = ("Conte as bolinhas da primeira cor e continue contando nas da segunda!" if bolinhas else
                "Quer ajuda? Use os dedinhos ou pegue tampinhas pra contar junto!")
        self.rodape(dica, ["soma" if op == "+" else "subtração", "cálculo", "concentração"])

        def gab(t=titulo, resp=resp):
            yy = self.titulo_gabarito(t) - 30
            for i, r in enumerate(resp):
                c.setFont("Titulo", 20)
                c.setFillColor(T["texto"])
                c.drawString(M + 70 + (i % 2) * (W / 2 - M), yy, r)
                if i % 2 == 1:
                    yy -= 42
            self.numero_pagina()
        self.gabaritos.append(gab)

    # ---------- caligrafia ----------
    def caligrafia(self, titulo, frases, nivel):
        c, T = self.c, self.T
        topo = self.cabecalho(titulo, nivel, ["Cubra o pontilhado", "Da esquerda pra direita", "Escreva sozinho embaixo"])
        alt = (topo - self.AREA_BAIXO - 6) / len(frases)
        y = topo - 4
        for i, f in enumerate(frases):
            base1 = y - alt * 0.42
            base2 = y - alt * 0.85
            for base in (base1, base2):  # pauta: linha de cima, do meio (tracejada) e de base
                for dy, cr, lw, dash in ((30, T["azul_claro"], 1, None), (15, T["cinza"], 0.8, (3, 3)), (0, T["vermelho"], 1.4, None)):
                    c.setStrokeColor(cr)
                    c.setLineWidth(lw)
                    if dash:
                        c.setDash(*dash)
                    c.line(M + 62, base + dy, W - M - 14, base + dy)
                    c.setDash()
            if i % 3 == 0:
                estrela(c, M + 30, base1 + 14, 13, fill=T["dourado"] if self.cor() else white, stroke=T["texto"])
            elif i % 3 == 1:
                bola_natal(c, M + 30, base1 + 12, 11, T["vermelho"] if self.cor() else white, T)
            else:
                pinheiro(c, M + 30, base1 - 4, 30, T)
            c.setFont("Titulo", 36)
            c.setStrokeColor(HexColor("#5B6573"))
            c.setLineWidth(1.1)
            c.setDash(2.4, 2.4)
            t = c.beginText(M + 68, base1 + 1)
            t.setTextRenderMode(1)  # só o contorno pontilhado, pra criança cobrir
            t.textOut(f)
            t.setTextRenderMode(0)  # volta ao normal pro resto da página
            c.drawText(t)
            c.setDash()
            y -= alt
        self.rodape("Segure o lápis com calma. Letra bonita vem com prática, não com pressa!",
                    ["coordenação motora", "escrita", "foco"])

    # ---------- desenho de colorir ----------
    def colorir(self, titulo, img):
        c, T = self.c, self.T
        topo = self.cabecalho(titulo, None, ["Escolha suas cores", "Pinte devagar, por dentro", "Capriche nos detalhes!"])
        caixa = (M + 10, self.AREA_BAIXO + 6, W - 2 * M - 20, topo - self.AREA_BAIXO - 12)
        c.setFillColor(white)
        c.setStrokeColor(T["verde"])
        c.setLineWidth(2)
        c.roundRect(*caixa, 14, stroke=1, fill=1)
        iw, ih = img.size
        esc = min((caixa[2] - 24) / iw, (caixa[3] - 24) / ih)
        w, h = iw * esc, ih * esc
        c.drawImage(ImageReader(img), caixa[0] + (caixa[2] - w) / 2, caixa[1] + (caixa[3] - h) / 2, w, h)
        self.rodape("Use cores diferentes pra cada parte. Não existe cor errada: a arte é sua!",
                    ["criatividade", "coordenação motora", "cores"])

    def separador(self):
        c, T = self.c, self.T
        self.borda()
        estrela(c, W / 2, H / 2 + 110, 50, fill=T["dourado"] if self.cor() else white, stroke=T["texto"], lw=2)
        c.setFillColor(T["vermelho"])
        c.setFont("Titulo", 50)
        c.drawCentredString(W / 2, H / 2 + 10, "Gabaritos")
        c.setFillColor(T["texto"])
        c.setFont("Sub", 16)
        c.drawCentredString(W / 2, H / 2 - 24, "Pra conferir as respostas")
        self.numero_pagina()


# ---------- algoritmos ----------
DIRS_FACIL = [(1, 0), (0, 1)]
DIRS_MEDIO = [(1, 0), (0, 1), (1, 1)]
DIRS_DIFICIL = [(1, 0), (0, 1), (1, 1), (-1, 0), (0, -1), (1, -1)]


def montar_grade(palavras, n, dirs):
    for _ in range(300):
        g = [[""] * n for _ in range(n)]
        pos = {}
        ok = True
        for p in sorted(palavras, key=len, reverse=True):
            w = sem_acento(p).replace(" ", "")
            colocou = False
            for _ in range(500):
                dx, dy = random.choice(dirs)
                x, y = random.randrange(n), random.randrange(n)
                xe, ye = x + dx * (len(w) - 1), y + dy * (len(w) - 1)
                if not (0 <= xe < n and 0 <= ye < n):
                    continue
                if all(g[y + dy * i][x + dx * i] in ("", w[i]) for i in range(len(w))):
                    for i in range(len(w)):
                        g[y + dy * i][x + dx * i] = w[i]
                    pos[p] = (x, y, xe, ye)
                    colocou = True
                    break
            if not colocou:
                ok = False
                break
        if ok:
            for yy in range(n):
                for xx in range(n):
                    if not g[yy][xx]:
                        g[yy][xx] = random.choice("ABCDEFGHIJLMNOPRSTUVZ")
            return g, pos
    raise RuntimeError("palavras não couberam na grade")


def gerar_labirinto(cols, rows):
    paredes = {(x, y): {"N", "S", "L", "O"} for x in range(cols) for y in range(rows)}
    vis, pilha = {(0, 0)}, [(0, 0)]
    viz = {"N": (0, -1, "S"), "S": (0, 1, "N"), "L": (1, 0, "O"), "O": (-1, 0, "L")}
    while pilha:
        x, y = pilha[-1]
        op = [(d, x + dx, y + dy, o) for d, (dx, dy, o) in viz.items()
              if 0 <= x + dx < cols and 0 <= y + dy < rows and (x + dx, y + dy) not in vis]
        if not op:
            pilha.pop()
            continue
        d, nx, ny, o = random.choice(op)
        paredes[(x, y)].discard(d)
        paredes[(nx, ny)].discard(o)
        vis.add((nx, ny))
        pilha.append((nx, ny))
    return paredes


def resolver(paredes, cols, rows):
    viz = {"N": (0, -1), "S": (0, 1), "L": (1, 0), "O": (-1, 0)}
    alvo = (cols - 1, rows - 1)
    ant = {(0, 0): None}
    fila = [(0, 0)]
    while fila:
        cur = fila.pop(0)
        if cur == alvo:
            break
        for d, (dx, dy) in viz.items():
            if d not in paredes[cur]:
                nxt = (cur[0] + dx, cur[1] + dy)
                if nxt not in ant:
                    ant[nxt] = cur
                    fila.append(nxt)
    cam, cur = [], alvo
    while cur:
        cam.append(cur)
        cur = ant[cur]
    return cam[::-1]


# ---------- desenhos de colorir ----------
def temas_colorir():
    """Lê os títulos ('**3. Árvore de Natal**') do prompts-colorir.md."""
    temas = {}
    try:
        import re
        for m in re.finditer(r"^\*\*(\d+)\. (.+?)\*\*", open(os.path.join(AQUI, "prompts-colorir.md")).read(), re.M):
            temas[int(m.group(1))] = m.group(2)
    except OSError:
        pass
    return temas


def limpar_desenho(caminho):
    """Deixa o desenho só em preto e branco (tira cinza, sombra e cor) e recorta as bordas brancas."""
    img = Image.open(caminho).convert("L")
    img = ImageOps.autocontrast(img)
    img = img.point(lambda v: 255 if v > 150 else 0).convert("L")
    inv = ImageOps.invert(img)
    caixa = inv.getbbox()
    if caixa:
        x0, y0, x1, y1 = caixa
        pad = 20
        img = img.crop((max(0, x0 - pad), max(0, y0 - pad), min(img.width, x1 + pad), min(img.height, y1 + pad)))
    return img


def desenhos_colorir():
    pasta = os.path.join(AQUI, "desenhos")
    if Image is None or not os.path.isdir(pasta):
        return []
    import re
    temas = temas_colorir()
    lista = []
    for arq in os.listdir(pasta):
        m = re.search(r"(\d+)", arq)
        if not m or not arq.lower().endswith((".png", ".jpg", ".jpeg", ".webp")):
            continue
        n = int(m.group(1))
        lista.append((n, os.path.join(pasta, arq), temas.get(n, f"Desenho {n}")))
    return sorted(lista)


# ---------- conteúdo do kit ----------
ATIVIDADES = [
    ("Caça-Palavras de Natal", "estrela", lambda k: k.caca_palavras("Caça-Palavras de Natal", ["Natal", "Noel", "Rena", "Neve", "Sino", "Estrela", "Presente", "Árvore", "Anjo"], 10, DIRS_FACIL, "fácil")),
    ("Caça-Palavras do Presépio", "estrela", lambda k: k.caca_palavras("Caça-Palavras do Presépio", ["Jesus", "Maria", "José", "Anjo", "Estrela", "Pastor", "Magos", "Ovelha", "Burrinho"], 11, DIRS_FACIL, "fácil")),
    ("Caça-Palavras da Ceia", "estrela", lambda k: k.caca_palavras("Caça-Palavras da Ceia", ["Peru", "Panetone", "Rabanada", "Farofa", "Uva", "Pudim", "Chester", "Arroz", "Salpicão"], 12, DIRS_MEDIO, "médio")),
    ("Caça-Palavras dos Enfeites", "estrela", lambda k: k.caca_palavras("Caça-Palavras dos Enfeites", ["Bola", "Laço", "Pisca", "Guirlanda", "Vela", "Fita", "Sinos", "Meia", "Gorro"], 12, DIRS_MEDIO, "médio")),
    ("Caça-Palavras do Papai Noel", "estrela", lambda k: k.caca_palavras("Caça-Palavras do Papai Noel", ["Trenó", "Duende", "Rena", "Saco", "Barba", "Carta", "Chaminé", "Brinquedo", "Biscoito"], 13, DIRS_DIFICIL, "difícil")),
    ("Caça-Palavras das Férias", "estrela", lambda k: k.caca_palavras("Caça-Palavras das Férias", ["Praia", "Piscina", "Sorvete", "Bicicleta", "Pipa", "Viagem", "Areia", "Brincar", "Descansar"], 13, DIRS_DIFICIL, "difícil")),
    ("Labirinto do Trenó", "pinheiro", lambda k: k.labirinto("Labirinto do Trenó", 7, 8, "Papai Noel", "Presente", "fácil", "Passe o dedo pelo caminho antes, depois desenhe com o lápis.")),
    ("Labirinto da Rena", "pinheiro", lambda k: k.labirinto("Labirinto da Rena", 9, 10, "Rena", "Trenó", "fácil", "Chegou numa parede? Volte e tente outro caminho. Tudo bem errar!")),
    ("Labirinto da Estrela", "pinheiro", lambda k: k.labirinto("Labirinto da Estrela", 11, 13, "Reis Magos", "Estrela", "médio", "Olhe o caminho todo antes de começar. Quem planeja chega mais rápido!")),
    ("Labirinto do Duende", "pinheiro", lambda k: k.labirinto("Labirinto do Duende", 14, 16, "Duende", "Oficina", "médio", "Dica secreta: às vezes é mais fácil começar pelo FIM e voltar.")),
    ("Labirinto da Chaminé", "pinheiro", lambda k: k.labirinto("Labirinto da Chaminé", 17, 20, "Papai Noel", "Chaminé", "difícil", "Labirinto de campeão! Vá devagar e com calma.")),
    ("Palavras Embaralhadas 1", "bola", lambda k: k.embaralhadas("Palavras Embaralhadas", ["Natal", "Noel", "Sino", "Rena", "Neve", "Anjo"], "fácil")),
    ("Palavras Embaralhadas 2", "bola", lambda k: k.embaralhadas("Palavras Embaralhadas 2", ["Presente", "Estrela", "Biscoito", "Duende", "Guirlanda", "Panetone"], "médio")),
    ("Vamos Contar?", "bola", lambda k: k.contar("Vamos Contar?", "fácil")),
    ("Vamos Contar? 2", "bola", lambda k: k.contar("Vamos Contar? 2", "médio")),
    ("Somar com Bolinhas", "bola", lambda k: k.contas("Somar com Bolinhas", "+", 5, "fácil", bolinhas=True)),
    ("Continhas de Somar", "bola", lambda k: k.contas("Continhas de Somar", "+", 10, "médio")),
    ("Continhas de Somar 2", "bola", lambda k: k.contas("Continhas de Somar 2", "+", 20, "difícil")),
    ("Continhas de Diminuir", "bola", lambda k: k.contas("Continhas de Diminuir", "-", 20, "difícil")),
    ("Caligrafia de Natal", "estrela", lambda k: k.caligrafia("Caligrafia de Natal", ["Feliz Natal", "Papai Noel", "Boas Festas", "Amor e Paz", "Estrela"], "médio")),
    ("Letras de Natal", "estrela", lambda k: k.caligrafia("Letras de Natal", ["A de Anjo", "N de Neve", "R de Rena", "S de Sino", "P de Presente"], "fácil")),
]


def gerar(caminho, T, desenhos):
    k = Kit(caminho, T)
    k.capa()
    k.como_usar()
    pag = 4  # capa(1), como usar(2), sumário(3)
    itens = []
    if desenhos:
        itens.append((f"Desenhos para Colorir ({len(desenhos)})", pag, "pinheiro"))
        pag += len(desenhos)
    for i, (nome, icone, _) in enumerate(ATIVIDADES):
        itens.append((nome, pag + i, icone))
    itens.append(("Gabaritos", pag + len(ATIVIDADES), "estrela"))
    k.sumario(itens)
    for _, img, tema in desenhos:
        k.colorir(tema, img)
    for _, _, f in ATIVIDADES:
        f(k)
    k.separador()
    for g in k.gabaritos:
        g()
    k.c.save()
    print(f"PDF gerado: {caminho} ({k.pagina} páginas)")


if __name__ == "__main__":
    os.makedirs(os.path.join(AQUI, "saida"), exist_ok=True)
    desenhos = [(n, limpar_desenho(arq), tema) for n, arq, tema in desenhos_colorir()]
    print(f"{len(desenhos)} desenhos de colorir encontrados em produtos/kit-natal/desenhos/")
    gerar(os.path.join(AQUI, "saida", "kit-natal-colorido.pdf"), COLORIDO, desenhos)
    gerar(os.path.join(AQUI, "saida", "kit-natal-economico.pdf"), ECONOMICO, desenhos)
