#!/usr/bin/env python3
"""Gera as atividades de texto/lógica do Kit Natal Mágico em PDF (A4, preto e branco).

Caça-palavras, labirintos, palavras embaralhadas, matemática natalina e caligrafia,
com gabarito no final. Tudo gerado por código: grátis e sem erro de letra.

Uso: python3 produtos/kit-natal/gerar_atividades.py
Saída: produtos/kit-natal/saida/atividades-natal.pdf
"""
import math
import os
import random
import unicodedata

from reportlab.lib.pagesizes import A4
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas

random.seed(2026)  # mesmo resultado toda vez que rodar
W, H = A4
M = 40  # margem
AQUI = os.path.dirname(os.path.abspath(__file__))
SAIDA = os.path.join(AQUI, "saida", "atividades-natal.pdf")

FONTES = "/usr/share/fonts/truetype/dejavu/"
pdfmetrics.registerFont(TTFont("Texto", FONTES + "DejaVuSans.ttf"))
pdfmetrics.registerFont(TTFont("Negrito", FONTES + "DejaVuSans-Bold.ttf"))
pdfmetrics.registerFont(TTFont("Mono", FONTES + "DejaVuSansMono-Bold.ttf"))

gabaritos = []  # funções que desenham as respostas no fim


def sem_acento(p):
    return "".join(c for c in unicodedata.normalize("NFD", p) if unicodedata.category(c) != "Mn").upper()


# ---------- moldura e cabeçalho ----------
def estrela(c, x, y, r, preenchida=False):
    pts = []
    for i in range(10):
        ang = math.pi / 2 + i * math.pi / 5
        rr = r if i % 2 == 0 else r * 0.45
        pts.append((x + rr * math.cos(ang), y + rr * math.sin(ang)))
    p = c.beginPath()
    p.moveTo(*pts[0])
    for pt in pts[1:]:
        p.lineTo(*pt)
    p.close()
    c.drawPath(p, stroke=1, fill=1 if preenchida else 0)


def bolinha(c, x, y, r):
    c.circle(x, y, r, stroke=1, fill=0)
    c.rect(x - r * 0.3, y + r * 0.85, r * 0.6, r * 0.35, stroke=1, fill=0)


def arvore(c, x, y, s):
    p = c.beginPath()
    p.moveTo(x, y + s)
    p.lineTo(x - s * 0.5, y)
    p.lineTo(x + s * 0.5, y)
    p.close()
    c.drawPath(p, stroke=1, fill=0)
    c.rect(x - s * 0.08, y - s * 0.18, s * 0.16, s * 0.18, stroke=1, fill=0)


def moldura(c):
    c.setLineWidth(2)
    c.roundRect(M - 15, M - 15, W - 2 * (M - 15), H - 2 * (M - 15), 18)
    c.setLineWidth(1)
    for x in range(int(M + 10), int(W - M), 60):
        estrela(c, x, H - M + 6, 5)
        estrela(c, x + 30, M - 6, 5)


def cabecalho(c, titulo, instrucao):
    moldura(c)
    c.setFont("Negrito", 26)
    c.drawCentredString(W / 2, H - M - 40, titulo)
    c.setFont("Texto", 12)
    c.drawCentredString(W / 2, H - M - 62, instrucao)
    c.setFont("Texto", 11)
    c.drawString(M + 10, H - M - 92, "Nome: ________________________________     Data: ____/____")
    return H - M - 115  # y onde o conteúdo começa


def rodape(c):
    c.setFont("Texto", 8)
    c.drawCentredString(W / 2, M - 2, "Kit Natal Mágico")


# ---------- caça-palavras ----------
DIRS_FACIL = [(1, 0), (0, 1)]
DIRS_MEDIO = [(1, 0), (0, 1), (1, 1)]
DIRS_DIFICIL = [(1, 0), (0, 1), (1, 1), (-1, 0), (0, -1), (1, -1)]


def montar_grade(palavras, n, dirs):
    for _ in range(200):
        g = [[""] * n for _ in range(n)]
        pos = {}
        ok = True
        for p in sorted(palavras, key=len, reverse=True):
            w = sem_acento(p).replace(" ", "")
            colocou = False
            for _ in range(400):
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
            letras = "ABCDEFGHIJLMNOPRSTUVZ"
            for yy in range(n):
                for xx in range(n):
                    if not g[yy][xx]:
                        g[yy][xx] = random.choice(letras)
            return g, pos
    raise RuntimeError("não coube")


def desenhar_grade(c, g, topo, pos=None):
    n = len(g)
    cel = min((W - 2 * M - 20) / n, 34)
    x0 = (W - cel * n) / 2
    y0 = topo
    c.setLineWidth(1.2)
    c.roundRect(x0 - 6, y0 - cel * n - 6, cel * n + 12, cel * n + 12, 8)
    c.setFont("Mono", cel * 0.6)
    for yy in range(n):
        for xx in range(n):
            c.drawCentredString(x0 + xx * cel + cel / 2, y0 - yy * cel - cel * 0.7, g[yy][xx])
    if pos:
        c.setLineWidth(cel * 0.55)
        c.setStrokeGray(0.75)
        c.setLineCap(1)
        for (x, y, xe, ye) in pos.values():
            c.line(x0 + x * cel + cel / 2, y0 - y * cel - cel / 2, x0 + xe * cel + cel / 2, y0 - ye * cel - cel / 2)
        c.setStrokeGray(0)
        c.setLineCap(0)
        c.setFont("Mono", cel * 0.6)
        for yy in range(n):
            for xx in range(n):
                c.drawCentredString(x0 + xx * cel + cel / 2, y0 - yy * cel - cel * 0.7, g[yy][xx])
    c.setLineWidth(1)
    return y0 - cel * n - 20


def caca_palavras(c, titulo, palavras, n, dirs, nivel):
    g, pos = montar_grade(palavras, n, dirs)
    topo = cabecalho(c, titulo, f"Encontre as palavras escondidas na grade. Nível: {nivel}")
    y = desenhar_grade(c, g, topo)
    c.setFont("Negrito", 13)
    c.drawString(M + 10, y - 10, "Palavras:")
    c.setFont("Texto", 13)
    cols = 3
    for i, p in enumerate(palavras):
        cx = M + 10 + (i % cols) * ((W - 2 * M) / cols)
        cy = y - 32 - (i // cols) * 22
        c.rect(cx, cy - 2, 10, 10)
        c.drawString(cx + 16, cy, p.upper())
    rodape(c)
    c.showPage()

    def gab(c, t=titulo, g=g, pos=pos):
        topo = cabecalho(c, "Gabarito", t)
        desenhar_grade(c, g, topo, pos)
        rodape(c)
        c.showPage()

    gabaritos.append(gab)


# ---------- labirinto ----------
def gerar_labirinto(cols, rows):
    paredes = {(x, y): {"N", "S", "L", "O"} for x in range(cols) for y in range(rows)}
    vis = {(0, 0)}
    pilha = [(0, 0)]
    viz = {"N": (0, -1, "S"), "S": (0, 1, "N"), "L": (1, 0, "O"), "O": (-1, 0, "L")}
    while pilha:
        x, y = pilha[-1]
        opcoes = [(d, x + dx, y + dy, op) for d, (dx, dy, op) in viz.items()
                  if 0 <= x + dx < cols and 0 <= y + dy < rows and (x + dx, y + dy) not in vis]
        if not opcoes:
            pilha.pop()
            continue
        d, nx, ny, op = random.choice(opcoes)
        paredes[(x, y)].discard(d)
        paredes[(nx, ny)].discard(op)
        vis.add((nx, ny))
        pilha.append((nx, ny))
    return paredes


def resolver(paredes, cols, rows):
    viz = {"N": (0, -1), "S": (0, 1), "L": (1, 0), "O": (-1, 0)}
    alvo = (cols - 1, rows - 1)
    anterior = {(0, 0): None}
    fila = [(0, 0)]
    while fila:
        cur = fila.pop(0)
        if cur == alvo:
            break
        for d, (dx, dy) in viz.items():
            if d not in paredes[cur]:
                nxt = (cur[0] + dx, cur[1] + dy)
                if nxt not in anterior:
                    anterior[nxt] = cur
                    fila.append(nxt)
    caminho, cur = [], alvo
    while cur:
        caminho.append(cur)
        cur = anterior[cur]
    return caminho[::-1]


def desenhar_labirinto(c, paredes, cols, rows, topo, caminho=None, inicio="", fim=""):
    cel = min((W - 2 * M - 40) / cols, (topo - M - 60) / rows)
    x0 = (W - cel * cols) / 2
    y0 = topo - 20
    c.setLineWidth(2)
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
    if caminho:
        c.setStrokeGray(0.55)
        c.setLineWidth(cel * 0.3)
        p = c.beginPath()
        for i, (x, y) in enumerate(caminho):
            px, py = x0 + x * cel + cel / 2, y0 - y * cel - cel / 2
            p.moveTo(px, py) if i == 0 else p.lineTo(px, py)
        c.drawPath(p, stroke=1, fill=0)
        c.setStrokeGray(0)
    c.setLineWidth(1)
    c.setLineCap(0)
    c.setFont("Negrito", 12)
    c.drawString(x0, y0 + 8, f"▼ {inicio}")
    c.drawRightString(x0 + cel * cols, y0 - cel * rows - 18, f"{fim} ▲")


def labirinto(c, titulo, cols, rows, inicio, fim, nivel):
    paredes = gerar_labirinto(cols, rows)
    topo = cabecalho(c, titulo, f"Ajude a chegar do começo ao fim! Nível: {nivel}")
    desenhar_labirinto(c, paredes, cols, rows, topo, inicio=inicio, fim=fim)
    rodape(c)
    c.showPage()

    def gab(c, t=titulo):
        topo = cabecalho(c, "Gabarito", t)
        desenhar_labirinto(c, paredes, cols, rows, topo, resolver(paredes, cols, rows), inicio, fim)
        rodape(c)
        c.showPage()

    gabaritos.append(gab)


# ---------- palavras embaralhadas ----------
def embaralhadas(c, titulo, palavras):
    topo = cabecalho(c, titulo, "Desembaralhe as letras e descubra as palavras de Natal.")
    y = topo - 20
    resp = []
    for i, p in enumerate(palavras):
        w = sem_acento(p)
        letras = list(w)
        while "".join(letras) == w:
            random.shuffle(letras)
        resp.append(p.upper())
        c.setFont("Mono", 18)
        c.drawString(M + 20, y, f"{i + 1}.  {' '.join(letras)}")
        c.setFont("Texto", 14)
        c.drawString(M + 280, y, "_" * 22)
        if i % 2 == 0:
            estrela(c, W - M - 20, y + 6, 7)
        else:
            bolinha(c, W - M - 20, y + 4, 7)
        y -= 52
    rodape(c)
    c.showPage()

    def gab(c, t=titulo):
        topo = cabecalho(c, "Gabarito", t)
        yy = topo - 20
        c.setFont("Texto", 16)
        for i, r in enumerate(resp):
            c.drawString(M + 40, yy, f"{i + 1}. {r}")
            yy -= 36
        rodape(c)
        c.showPage()

    gabaritos.append(gab)


# ---------- matemática ----------
def contar(c, titulo):
    topo = cabecalho(c, titulo, "Conte os desenhos de cada caixa e escreva o número no quadrado.")
    desenhos = [estrela, bolinha, arvore]
    caixa_w, caixa_h = (W - 2 * M - 30) / 2, 125
    for i in range(8):
        col, lin = i % 2, i // 2
        x = M + 10 + col * (caixa_w + 10)
        y = topo - 10 - (lin + 1) * (caixa_h + 10)
        c.roundRect(x, y, caixa_w, caixa_h, 10)
        n = random.randint(2, 10)
        f = desenhos[i % 3]
        for k in range(n):
            px = x + 22 + (k % 5) * 36
            py = y + caixa_h - 32 - (k // 5) * 44
            if f is arvore:
                f(c, px, py - 14, 28)
            else:
                f(c, px, py, 12)
        c.rect(x + caixa_w - 50, y + 12, 38, 38)
    rodape(c)
    c.showPage()


def contas(c, titulo, op, maximo):
    topo = cabecalho(c, titulo, "Resolva as continhas do Papai Noel!")
    resp = []
    y = topo - 20
    for i in range(12):
        a, b = random.randint(1, maximo), random.randint(1, maximo)
        if op == "-" and b > a:
            a, b = b, a
        r = a + b if op == "+" else a - b
        resp.append(f"{a} {op} {b} = {r}")
        col = i % 2
        x = M + 40 + col * (W / 2 - M + 10)
        c.setFont("Mono", 24)
        c.drawString(x, y, f"{a:>2} {op} {b:>2} = ")
        c.rect(x + 160, y - 10, 48, 36)
        estrela(c, x - 14, y + 7, 6)
        if col == 1:
            y -= 95
    rodape(c)
    c.showPage()

    def gab(c, t=titulo):
        topo = cabecalho(c, "Gabarito", t)
        yy = topo - 20
        c.setFont("Mono", 16)
        for i, r in enumerate(resp):
            c.drawString(M + 40 + (i % 2) * (W / 2 - M), yy, r)
            if i % 2 == 1:
                yy -= 32
        rodape(c)
        c.showPage()

    gabaritos.append(gab)


# ---------- caligrafia ----------
def caligrafia(c, titulo, frases):
    topo = cabecalho(c, titulo, "Cubra as letras pontilhadas e depois escreva sozinho na linha de baixo.")
    y = topo - 30
    for f in frases:
        c.setFont("Negrito", 34)
        c.setFillGray(0.78)
        c.drawString(M + 20, y, f)
        c.setFillGray(0)
        c.setDash(2, 3)
        c.line(M + 20, y - 4, W - M - 20, y - 4)
        c.line(M + 20, y - 52, W - M - 20, y - 52)
        c.setDash()
        y -= 112
    rodape(c)
    c.showPage()


# ---------- montar o PDF ----------
def main():
    os.makedirs(os.path.dirname(SAIDA), exist_ok=True)
    c = canvas.Canvas(SAIDA, pagesize=A4)
    c.setTitle("Kit Natal Mágico — Atividades")

    caca_palavras(c, "Caça-Palavras de Natal", ["Natal", "Noel", "Rena", "Neve", "Sino", "Estrela", "Presente", "Árvore"], 10, DIRS_FACIL, "fácil")
    caca_palavras(c, "Caça-Palavras do Presépio", ["Jesus", "Maria", "José", "Anjo", "Estrela", "Pastor", "Magos", "Ovelha"], 11, DIRS_FACIL, "fácil")
    caca_palavras(c, "Caça-Palavras da Ceia", ["Peru", "Panetone", "Rabanada", "Farofa", "Uva", "Pudim", "Chester", "Arroz", "Salpicão"], 12, DIRS_MEDIO, "médio")
    caca_palavras(c, "Caça-Palavras dos Enfeites", ["Bola", "Laço", "Pisca", "Guirlanda", "Vela", "Fita", "Sinos", "Meia", "Gorro", "Festão"], 12, DIRS_MEDIO, "médio")
    caca_palavras(c, "Caça-Palavras do Papai Noel", ["Trenó", "Duende", "Rena", "Saco", "Barba", "Carta", "Chaminé", "Brinquedo", "Biscoito", "Polo Norte"], 14, DIRS_DIFICIL, "difícil")
    caca_palavras(c, "Caça-Palavras das Férias", ["Praia", "Piscina", "Sorvete", "Bicicleta", "Pipa", "Viagem", "Sol", "Areia", "Brincar", "Descansar"], 14, DIRS_DIFICIL, "difícil")

    labirinto(c, "Labirinto do Trenó", 8, 10, "Papai Noel", "Presente", "fácil")
    labirinto(c, "Labirinto da Rena", 10, 12, "Rena", "Trenó", "fácil")
    labirinto(c, "Labirinto da Estrela", 12, 15, "Reis Magos", "Estrela", "médio")
    labirinto(c, "Labirinto do Duende", 15, 19, "Duende", "Oficina", "médio")
    labirinto(c, "Labirinto da Chaminé", 18, 23, "Papai Noel", "Chaminé", "difícil")

    embaralhadas(c, "Palavras Embaralhadas", ["Natal", "Noel", "Sino", "Rena", "Neve", "Presente", "Estrela", "Biscoito", "Duende", "Trenó", "Guirlanda", "Panetone"])

    contar(c, "Vamos Contar?")
    contar(c, "Vamos Contar? 2")
    contas(c, "Continhas de Somar", "+", 10)
    contas(c, "Continhas de Somar 2", "+", 20)
    contas(c, "Continhas de Diminuir", "-", 20)

    caligrafia(c, "Caligrafia de Natal", ["Feliz Natal", "Papai Noel", "Boas Festas", "Amor e Paz", "Estrela"])
    caligrafia(c, "Caligrafia: Letras de Natal", ["A de Anjo", "N de Neve", "R de Rena", "S de Sino", "P de Presente"])

    # página de separação + gabaritos
    moldura(c)
    c.setFont("Negrito", 40)
    c.drawCentredString(W / 2, H / 2 + 10, "Gabaritos")
    c.setFont("Texto", 14)
    c.drawCentredString(W / 2, H / 2 - 22, "Para o adulto conferir as respostas")
    estrela(c, W / 2, H / 2 + 90, 30)
    c.showPage()
    for g in gabaritos:
        g(c)

    c.save()
    print(f"PDF gerado: {SAIDA} ({c.getPageNumber() - 1} páginas)")


if __name__ == "__main__":
    main()
