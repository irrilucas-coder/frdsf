#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Gera o e-book em PDF.

Uso:
    python3 gerar_pdf.py

O script:
  1. Lê as receitas de receitas.py
  2. Procura as fotos na pasta imagens/ (capa.jpg, receita-01.jpg ... receita-20.jpg)
     - se a foto existir, ela entra no livro
     - se não existir, aparece um espaço reservado com o nome do arquivo
  3. Monta o arquivo ebook.html (HTML + estilo.css)
  4. Gera o ebook-natal.pdf com o WeasyPrint
"""
import html
import os
import shutil
import subprocess
import sys

from receitas import COMPRAS, ORDEM_CATEGORIAS, RECEITAS, SECOES, UTILIDADES

# ============================================================================
# CONFIGURAÇÕES — altere aqui
# ============================================================================
TITULO = "A Ceia que Dá Certo"
SUBTITULO = "20 receitas de Natal para encantar a família sem gastar demais"
AUTORA = ""          # ex.: "Maria Aparecida" (deixe "" para não mostrar)
CONTATO = ""         # ex.: "@cozinhadamaria" (aparece na página final)
ANO = "2026"
ARQUIVO_PDF = "ebook-natal.pdf"
# ============================================================================

PASTA = os.path.dirname(os.path.abspath(__file__))
PASTA_IMAGENS = os.path.join(PASTA, "imagens")
PASTA_CACHE = os.path.join(PASTA, ".cache-imagens")
EXTENSOES = (".jpg", ".jpeg", ".png", ".webp")

e = html.escape


# ---------------------------------------------------------------- imagens
def achar_imagem(nome_base):
    """Retorna o caminho relativo da imagem (otimizada, se possível) ou None."""
    for ext in EXTENSOES:
        original = os.path.join(PASTA_IMAGENS, nome_base + ext)
        if os.path.exists(original):
            return otimizar(original, nome_base)
    return None


def otimizar(caminho, nome_base):
    """Reduz fotos muito grandes para o PDF não ficar pesado (precisa do Pillow)."""
    try:
        from PIL import Image
    except ImportError:
        return os.path.relpath(caminho, PASTA)
    os.makedirs(PASTA_CACHE, exist_ok=True)
    destino = os.path.join(PASTA_CACHE, nome_base + ".jpg")
    if not os.path.exists(destino) or os.path.getmtime(destino) < os.path.getmtime(caminho):
        with Image.open(caminho) as img:
            img = img.convert("RGB")
            img.thumbnail((2200, 2200))
            img.save(destino, "JPEG", quality=85, optimize=True)
    return os.path.relpath(destino, PASTA)


def bloco_foto(nome_base, classe="foto"):
    caminho = achar_imagem(nome_base)
    if caminho:
        return f'<div class="{classe}"><img src="{e(caminho)}" alt=""></div>'
    return (
        f'<div class="{classe} vazia"><div class="ph">'
        f'{ICONE["camera"]}'
        f'<div class="ph-t">Espaço reservado para a foto</div>'
        f'<div class="ph-f">imagens/{nome_base}.jpg</div>'
        f"</div></div>"
    )


# ---------------------------------------------------------------- ícones (SVG simples)
def svg(corpo, cor="#9C7A3C", tam=22):
    return (
        f'<svg class="ic" width="{tam}" height="{tam}" viewBox="0 0 24 24" fill="none" '
        f'stroke="{cor}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">{corpo}</svg>'
    )


ICONE = {
    "tempo": svg('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/>'),
    "porcoes": svg('<circle cx="9" cy="8" r="3.2"/><path d="M3 20c0-3.6 2.7-6 6-6s6 2.4 6 6"/>'
                   '<circle cx="17" cy="9" r="2.6"/><path d="M16 14.2c2.9.2 5 2.4 5 5.8"/>'),
    "dificuldade": svg('<path d="M6 13.5a4 4 0 1 1 2.2-7.4A4.5 4.5 0 0 1 16 5.4a4 4 0 1 1 2 8.1"/>'
                       '<path d="M6.5 13.5V20h11v-6.5"/><path d="M6.5 17h11"/>'),
    "custo": svg('<rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 10h18"/>'
                 '<circle cx="16.5" cy="14.5" r="1.4"/>'),
    "camera": svg('<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.6"/>', "#B8924A", 38),
    "estrela": svg('<path d="M12 3l2.6 5.6 6 .7-4.5 4.1 1.2 6L12 16.4 6.7 19.4l1.2-6L3.4 9.3l6-.7z"/>',
                   "#9C7A3C", 20),
    "calendario": svg('<rect x="3.5" y="5" width="17" height="15" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4"/>'
                      '<path d="M8.5 14.5l2 2 4-4"/>', "#55642F", 20),
}

ORNAMENTO = (
    '<svg class="orn" width="150" height="16" viewBox="0 0 150 16" fill="none">'
    '<path d="M0 8h58M92 8h58" stroke="#C9A75E" stroke-width="0.8"/>'
    '<path d="M75 1.5l2.6 4.2 4.9.9-3.4 3.6.7 4.8L75 12.9l-4.8 2.1.7-4.8-3.4-3.6 4.9-.9z" fill="#C9A75E"/>'
    '<circle cx="63" cy="8" r="1.4" fill="#C9A75E"/><circle cx="87" cy="8" r="1.4" fill="#C9A75E"/>'
    "</svg>"
)


# ---------------------------------------------------------------- partes do livro
def sem_viuva(t):
    """Evita uma palavra sozinha na última linha de um título."""
    t = e(t)
    if " " in t:
        a, b = t.rsplit(" ", 1)
        if len(b) < 10:
            return a + "&nbsp;" + b
    return t


def num(i):
    return f"{i:02d}"


def secao_por_id(sid):
    return next(s for s in SECOES if s["id"] == sid)


def capa():
    return f"""
<section class="capa" style='string-set: livro "{e(TITULO)}"'>
  <div class="capa-moldura"></div>
  {bloco_foto("capa", "capa-foto")}
  <div class="capa-texto">
    <div class="capa-kicker">E-book de receitas de Natal</div>
    <h1 class="capa-titulo">{sem_viuva(TITULO)}</h1>
    {ORNAMENTO}
    <p class="capa-sub">{sem_viuva(SUBTITULO)}</p>
    <div class="capa-selo">10 salgados · 5 sobremesas · 5 entradas e bebidas <span>+ 4 bônus</span></div>
    {f'<div class="capa-autora">{e(AUTORA)}</div>' if AUTORA else ''}
  </div>
</section>"""


def boas_vindas():
    assinatura = f"<p class='assinatura'>Com carinho,<br><span>{e(AUTORA)}</span></p>" if AUTORA else \
        "<p class='assinatura'>Com carinho e um Feliz Natal!</p>"
    return f"""
<section class="pagina boas-vindas" data-secao="Boas-vindas">
  <div class="kicker">Antes de começar</div>
  <h1 class="titulo-pagina">Que bom ter você aqui</h1>
  {ORNAMENTO}
  <p class="lead">Preparar a ceia de Natal é um gesto de amor. É você quem faz a casa cheirar a festa e
  reúne todo mundo em volta da mesa. Mas a gente sabe: também dá um friozinho na barriga. Será que o peru
  vai ficar seco? Vai dar comida para todos? Vai sobrar tempo para me arrumar?</p>
  <p>Este livro foi feito para tirar esse peso das suas costas. São <strong>20 receitas tradicionais do Natal
  brasileiro</strong>, explicadas passo a passo, com ingredientes que você encontra em qualquer supermercado.
  Em cada uma, você vai encontrar uma <strong>Dica de ouro</strong>, aquele segredo que faz a receita dar certo,
  e o quadro <strong>Pode fazer antes?</strong>, que mostra o que adiantar nos dias 23 e 24.</p>
  <p>No final, preparei quatro bônus para você planejar tudo com calma: cardápios prontos, um cronograma da
  ceia, uma tabela de quantidades por pessoa e uma lista de compras para imprimir.</p>
  {assinatura}

  <div class="duas-caixas">
    <div class="caixa-info">
      <h3>Como usar este e-book</h3>
      <ul>
        <li>Escolha o cardápio na página de bônus e anote as receitas.</li>
        <li>Leia a receita inteira antes de começar.</li>
        <li>Separe e meça todos os ingredientes antes de ligar o fogo.</li>
        <li>Siga o cronograma: quase tudo pode ser adiantado.</li>
        <li>No sumário, clique no nome da receita para ir direto a ela.</li>
      </ul>
    </div>
    <div class="caixa-info verde">
      <h3>As medidas deste livro</h3>
      <table class="medidas">
        <tr><td>1 xícara (chá)</td><td>240 ml</td></tr>
        <tr><td>½ xícara (chá)</td><td>120 ml</td></tr>
        <tr><td>1 colher (sopa)</td><td>15 ml</td></tr>
        <tr><td>1 colher (chá)</td><td>5 ml</td></tr>
        <tr><td>1 caixinha de creme de leite</td><td>200 g</td></tr>
        <tr><td>1 lata de leite condensado</td><td>395 g</td></tr>
      </table>
      <p class="nota">Use xícaras e colheres de medida, rasas. Os tempos são para forno convencional
      preaquecido; cada forno é um pouco diferente, então fique de olho nos últimos minutos.</p>
    </div>
  </div>
</section>"""


def sumario():
    partes = []
    for s in SECOES:
        itens = "".join(
            f'<li><a href="#receita-{num(i)}"><span class="n">{num(i)}</span>{e(r["nome"])}</a></li>'
            for i, r in enumerate(RECEITAS, 1) if r["secao"] == s["id"]
        )
        partes.append(f'<h3><a href="#secao-{s["id"]}">{e(s["titulo"])}</a></h3><ul>{itens}</ul>')
    bonus = "".join(
        f'<li><a href="#{bid}"><span class="n">{n}</span>{e(t)}</a></li>'
        for n, bid, t in BONUS
    )
    partes.append(f'<h3><a href="#secao-bonus">Bônus</a></h3><ul>{bonus}</ul>')
    return f"""
<section class="pagina sumario" data-secao="Sumário">
  <h1 class="titulo-pagina">Sumário</h1>
  {ORNAMENTO}
  <p class="sumario-dica">Toque no nome de uma receita para ir direto até ela.</p>
  <ul class="toc-topo">
    <li><a href="#boas-vindas">Boas-vindas e medidas</a></li>
  </ul>
  {''.join(partes)}
</section>"""


def divisoria(sid, titulo, subtitulo, texto, itens, cor, parte):
    lista = "".join(f'<li><span>{n}</span>{e(t)}</li>' for n, t in itens)
    return f"""
<section class="divisoria {cor}" id="secao-{sid}">
  <div class="div-moldura"></div>
  <div class="div-conteudo">
    <div class="div-parte">{e(parte)}</div>
    <h1 class="div-titulo">{e(titulo)}</h1>
    {ORNAMENTO}
    <div class="div-sub">{e(subtitulo)}</div>
    <p class="div-texto">{e(texto)}</p>
    <ul class="div-lista">{lista}</ul>
  </div>
</section>"""


def receita(i, r):
    s = secao_por_id(r["secao"])
    grupos = []
    for titulo, itens in r["ingredientes"]:
        lis = "".join(
            f'<li><span class="q">{e(t)}</span>'
            + (f'<span class="m">{e(m)}</span>' if m and m != "—" else "")
            + "</li>"
            for t, m, _ in itens
        )
        h = f'<h4>{e(titulo)}</h4>' if titulo else ""
        grupos.append(f'<div class="grupo">{h}<ul>{lis}</ul></div>')
    passos = "".join(f"<li>{e(p)}</li>" for p in r["preparo"])
    dif_nivel = 1 if r["dificuldade"] == "Fácil" else 2
    barras = "".join(f'<i class="{"on" if k < dif_nivel else ""}"></i>' for k in range(3))
    custo_nivel = 1 if r["custo"] == "Barato" else 2
    moedas = "".join(f'<i class="{"on" if k < custo_nivel else ""}"></i>' for k in range(3))
    return f"""
<section class="receita" id="receita-{num(i)}" data-secao="{e(s['titulo'])}">
  {bloco_foto("receita-" + num(i))}
  <div class="rec-kicker">Receita {num(i)} · {e(s['titulo'])}</div>
  <h2 class="rec-titulo">{sem_viuva(r['nome'])}</h2>
  <p class="rec-intro">{e(r['intro'])}</p>
  <table class="meta"><tr>
    <td>{ICONE['porcoes']}<div><small>Rendimento</small><b>{e(r['porcoes'])}</b></div></td>
    <td>{ICONE['tempo']}<div><small>Tempo</small><b>{e(r['tempo'])}</b></div></td>
    <td>{ICONE['dificuldade']}<div><small>Dificuldade</small><b>{e(r['dificuldade'])}</b>
        <span class="niveis">{barras}</span></div></td>
    <td>{ICONE['custo']}<div><small>Custo</small><b>{e(r['custo'])}</b>
        <span class="niveis">{moedas}</span></div></td>
  </tr></table>
  <div class="ingredientes">
    <h3>Ingredientes</h3>
    <div class="ing-colunas">{''.join(grupos)}</div>
  </div>
  <div class="preparo">
    <h3>Modo de preparo</h3>
    <ol>{passos}</ol>
  </div>
  <div class="dicas">
  <div class="box dica">
    <div class="box-t">{ICONE['estrela']} Dica de ouro</div>
    <p>{e(r['dica'])}</p>
  </div>
  <div class="box antes">
    <div class="box-t">{ICONE['calendario']} Pode fazer antes?</div>
    <p>{e(r['antes'])}</p>
  </div>
  </div>
</section>"""


# ---------------------------------------------------------------- bônus
BONUS = [
    ("1", "bonus-cardapios", "Cardápios prontos"),
    ("2", "bonus-cronograma", "Cronograma da ceia"),
    ("3", "bonus-quantidades", "Tabela de quantidades por pessoa"),
    ("4", "bonus-compras", "Lista de compras para imprimir"),
]


def idx(nome_parcial):
    for i, r in enumerate(RECEITAS, 1):
        if nome_parcial.lower() in r["nome"].lower():
            return i
    raise KeyError(nome_parcial)


def link_receita(nome_parcial):
    i = idx(nome_parcial)
    return f'<a class="ref" href="#receita-{num(i)}">{e(RECEITAS[i-1]["nome"])}</a>'


def bonus_cardapios():
    def cardapio(classe, titulo, para, desc, linhas):
        corpo = "".join(
            f'<div class="card-cat"><b>{e(cat)}</b>{"".join(f"<div>{link_receita(n)}</div>" for n in nomes)}</div>'
            for cat, nomes in linhas
        )
        return f"""
<div class="cardapio {classe}">
  <div class="card-cab"><h3>{e(titulo)}</h3><span>{e(para)}</span></div>
  <p class="card-desc">{e(desc)}</p>
  {corpo}
</div>"""

    eco = cardapio(
        "eco", "Ceia Econômica", "para 10 pessoas",
        "Carne que rende muito e sobremesas feitas na véspera. Farta e com o orçamento sob controle.",
        [
            ("Entrada", ["Patê Cremoso"]),
            ("Prato principal", ["Pernil Assado"]),
            ("Acompanhamentos", ["Arroz Natalino", "Farofa Rica", "Maionese de Batata"]),
            ("Sobremesas", ["Pavê de Chocolate", "Rabanada"]),
            ("Bebida", ["Ponche de Frutas"]),
        ],
    )
    esp = cardapio(
        "esp", "Ceia Especial", "para 12 pessoas",
        "Para impressionar: duas carnes, bacalhau na entrada e uma mesa de sobremesas de dar água na boca.",
        [
            ("Entradas", ["Bolinho de Bacalhau", "Bruschetta"]),
            ("Pratos principais", ["Peru Assado", "Tender Glaceado"]),
            ("Acompanhamentos", ["Arroz Natalino", "Salpicão", "Batata Gratinada"]),
            ("Sobremesas", ["Torta de Limão", "Panetone Recheado", "Delícia Gelada"]),
            ("Bebidas", ["Ponche de Frutas", "Chá Gelado"]),
        ],
    )
    return f"""
<section class="pagina bonus" id="bonus-cardapios" data-secao="Bônus">
  <div class="kicker">Bônus 1</div>
  <h2 class="titulo-pagina">Cardápios prontos</h2>
  {ORNAMENTO}
  <p class="lead">Duas sugestões de ceia completa, já equilibradas entre salgados, doces e bebidas.
  Os números ao lado de cada receita indicam a página.</p>
  <div class="cardapios">{eco}{esp}</div>
  <p class="nota-centro">Quer uma ceia ao estilo português? Troque o tender pela {link_receita("Bacalhoada")}.</p>
</section>"""


def lista_checagem(itens):
    return "<ul class='check'>" + "".join(f"<li><span class='cx'></span>{t}</li>" for t in itens) + "</ul>"


def bonus_cronograma():
    blocos = [
        ("Antes de tudo", "dias 19 a 21 de dezembro", "neutro", [
            "Escolha o cardápio e faça a lista de compras (Bônus 4).",
            "Compre as carnes, o bacalhau e tudo o que não estraga.",
            "<strong>Dia 21 ou 22:</strong> passe o peru do freezer para a geladeira. Ele leva 2 a 3 dias para descongelar.",
        ]),
        ("2 dias antes", "22 de dezembro", "vermelho", [
            "Comece a dessalgar o bacalhau, na geladeira, trocando a água 4 vezes por dia.",
            "Compre as frutas, as verduras e os ovos.",
            "Faça o recheio de brigadeiro do panetone.",
            "Confira se tem papel-alumínio, filme plástico, assadeiras e espaço livre na geladeira.",
            "Gele as bebidas e faça bastante gelo (inclusive cubos de suco de uva para o ponche).",
        ]),
        ("1 dia antes", "23 de dezembro", "verde", [
            "<strong>Manhã:</strong> tempere o pernil (12 a 24 horas de marinada).",
            "Faça as sobremesas geladas: pavê, delícia de abacaxi e base e recheio da torta de limão.",
            "Monte o panetone recheado.",
            "Faça o patê, as torradas da bruschetta e o chá de hibisco.",
            "Cozinhe e desfie o frango do salpicão; cozinhe batatas e ovos da maionese.",
            "Monte a maionese de batata, o salpicão (sem batata palha) e o gratinado.",
            "Modele os bolinhos de bacalhau e monte a bacalhoada no refratário.",
            "Faça os cortes e os cravos no tender e prepare a calda.",
            "Pique cebola, alho, cenoura e cheiro-verde para o dia seguinte.",
            "Compre o pão francês da rabanada.",
            "<strong>Noite:</strong> tempere o peru e o lombo e deixe na geladeira.",
        ]),
        ("No dia", "24 de dezembro (ceia às 22h)", "dourado", [
            "<strong>Manhã:</strong> faça o merengue da torta e a base do ponche. Se o lombo está no cardápio, asse agora (à noite é só reaquecer). Arrume a mesa.",
            "<strong>Só tem um forno?</strong> Asse o pernil no dia 23 e reaqueça hoje, assim o forno fica livre para o peru.",
            "<strong>17h:</strong> frite ou asse as rabanadas e prepare a farofa.",
            "<strong>17h30:</strong> pernil no forno, se não assou na véspera (pronto por volta das 20h40).",
            "<strong>18h30:</strong> peru no forno (pronto por volta das 21h10).",
            "<strong>19h30:</strong> tome banho e se arrume. Você merece!",
            "<strong>21h10:</strong> o peru sai para descansar. Entram o tender, o gratinado e o que for reaquecer.",
            "<strong>21h15:</strong> frite os bolinhos, monte as bruschettas e sirva as entradas.",
            "<strong>21h30:</strong> faça o arroz e o molho do lombo e finalize o ponche.",
            "<strong>22h:</strong> batata palha no salpicão, carnes fatiadas e... Feliz Natal!",
        ]),
    ]
    html_blocos = "".join(
        f"""<div class="crono {cor}">
  <div class="crono-cab"><b>{e(t)}</b><span>{e(sub)}</span></div>
  {lista_checagem(itens)}
</div>"""
        for t, sub, cor, itens in blocos
    )
    return f"""
<section class="pagina bonus" id="bonus-cronograma" data-secao="Bônus">
  <div class="kicker">Bônus 2</div>
  <h2 class="titulo-pagina">Cronograma da ceia</h2>
  {ORNAMENTO}
  <p class="lead">O segredo de uma ceia tranquila é não deixar tudo para o dia 24. Este cronograma vale
  para as 20 receitas do livro: risque o que não estiver no seu cardápio e marque o que for ficando pronto.</p>
  {html_blocos}
</section>"""


def bonus_quantidades():
    linhas = [
        ("Carnes sem osso (lombo, tender, bacalhau)", "300 g", "1,8 kg", "3 kg", "4,5 kg"),
        ("Carnes com osso (peru, pernil com osso)", "450 g", "2,7 kg", "4,5 kg", "6,8 kg"),
        ("Arroz (cru)", "60 g", "360 g", "600 g", "900 g"),
        ("Farinha para farofa", "40 g", "240 g", "400 g", "600 g"),
        ("Saladas frias (maionese, salpicão)", "150 g", "900 g", "1,5 kg", "2,3 kg"),
        ("Entradas e petiscos", "5 unid.", "30 unid.", "50 unid.", "75 unid."),
        ("Sobremesas (somando todas)", "150 g", "900 g", "1,5 kg", "2,3 kg"),
        ("Rabanadas", "2 unid.", "12 unid.", "20 unid.", "30 unid."),
        ("Panetone (500 g)", "—", "1", "2", "3"),
        ("Refrigerante, suco e ponche", "600 ml", "3,6 L", "6 L", "9 L"),
        ("Água", "500 ml", "3 L", "5 L", "7,5 L"),
        ("Gelo", "500 g", "3 kg", "5 kg", "7,5 kg"),
    ]
    corpo = "".join("<tr>" + "".join(f"<td>{c}</td>" for c in l) + "</tr>" for l in linhas)
    return f"""
<section class="pagina bonus" id="bonus-quantidades" data-secao="Bônus">
  <div class="kicker">Bônus 3</div>
  <h2 class="titulo-pagina">Quanto comprar?</h2>
  {ORNAMENTO}
  <p class="lead">Nem faltar, nem sobrar demais. A tabela mostra quanto calcular por adulto, somando
  todas as opções de cada tipo: se vai servir peru e lombo, divida a quantidade entre os dois.</p>
  <table class="quant">
    <thead><tr><th>Item</th><th>Por pessoa</th><th>6 pessoas</th><th>10 pessoas</th><th>15 pessoas</th></tr></thead>
    <tbody>{corpo}</tbody>
  </table>
  <div class="duas-caixas">
    <div class="caixa-info">
      <h3>Para acertar na conta</h3>
      <ul>
        <li><strong>Crianças</strong> até 10 anos: conte como meia pessoa.</li>
        <li>Os pesos de carne são <strong>crus</strong>. No forno, elas perdem cerca de 30% do peso.</li>
      </ul>
    </div>
    <div class="caixa-info verde">
      <h3>Sobrou? Que bom!</h3>
      <ul>
        <li>Peru e pernil desfiados viram sanduíche ou torta no dia 25.</li>
        <li>Carnes assadas duram 3 dias na geladeira.</li>
        <li>Não deixe comida fora da geladeira por mais de 2 horas.</li>
      </ul>
    </div>
  </div>
</section>"""


def bonus_compras():
    usados = {}
    for i, r in enumerate(RECEITAS, 1):
        for _, itens in r["ingredientes"]:
            for _, _, chave in itens:
                if chave:
                    usados.setdefault(chave, [])
                    if i not in usados[chave]:
                        usados[chave].append(i)
    por_cat = {c: [] for c in ORDEM_CATEGORIAS}
    for chave, recs in usados.items():
        nome, cat = COMPRAS[chave]
        por_cat[cat].append((nome, recs))
    por_cat["Utilidades"] = [(u, []) for u in UTILIDADES]

    blocos = []
    for cat in ORDEM_CATEGORIAS:
        itens = sorted(por_cat[cat], key=lambda x: x[0]) if cat != "Utilidades" else por_cat[cat]
        lis = "".join(
            f"<li><span class='cx'></span><span class='it'>{e(n)}"
            + (f"<small>receitas {', '.join(num(x) for x in recs)}</small>" if recs else "")
            + "</span><span class='qt'></span></li>"
            for n, recs in itens
        )
        blocos.append(f"<div class='cat'><h4>{e(cat)}</h4><ul>{lis}</ul></div>")
    return f"""
<section class="pagina bonus compras" id="bonus-compras" data-secao="Bônus">
  <div class="kicker">Bônus 4</div>
  <h2 class="titulo-pagina">Lista de compras</h2>
  {ORNAMENTO}
  <p class="lead">Todos os ingredientes das 20 receitas, separados pelos corredores do supermercado.
  Imprima, risque o que não for usar e anote a quantidade na linha ao lado de cada item, conferindo
  na receita. Os números mostram em quais receitas o ingrediente aparece.</p>
  <div class="colunas">{''.join(blocos)}</div>
</section>"""


def final():
    contato = (f'<p class="fim-texto">Se alguma receita fizer sucesso na sua casa, conte para mim. '
               f'Vou adorar saber!</p><div class="fim-contato">{e(CONTATO)}</div>') if CONTATO else ""
    dono = e(AUTORA) if AUTORA else e(TITULO)
    return f"""
<section class="final">
  <div class="div-moldura"></div>
  <div class="fim-conteudo">
    {ORNAMENTO}
    <h1 class="fim-titulo">Feliz Natal!</h1>
    <p class="fim-texto">Que a sua ceia seja cheia de sabor, de abraços e de histórias para contar.
    Gratidão por levar este livro para a sua cozinha e por confiar nestas receitas para um momento
    tão especial.</p>
    {contato}
    {ORNAMENTO}
    <p class="fim-direitos">© {ANO} {dono}. Todos os direitos reservados.<br>
    Este e-book é para uso pessoal. É proibido copiar, revender ou distribuir este material,
    total ou parcialmente, sem autorização.</p>
  </div>
</section>"""


# ---------------------------------------------------------------- montagem
def validar():
    erros = []
    for i, r in enumerate(RECEITAS, 1):
        for _, itens in r["ingredientes"]:
            for t, _, chave in itens:
                if chave and chave not in COMPRAS:
                    erros.append(f"Receita {i}: chave de compras desconhecida '{chave}' ({t})")
        for campo in ("nome", "intro", "porcoes", "tempo", "dificuldade", "custo", "preparo", "dica", "antes"):
            if not r.get(campo):
                erros.append(f"Receita {i}: campo '{campo}' vazio")
    if len(RECEITAS) != 20:
        erros.append(f"Esperava 20 receitas, encontrei {len(RECEITAS)}")
    if erros:
        print("\n".join(erros))
        sys.exit(1)


def montar_html():
    partes = [capa(), boas_vindas().replace('class="pagina boas-vindas"',
                                             'class="pagina boas-vindas" id="boas-vindas"', 1), sumario()]
    cores = {"salgados": "vermelho", "sobremesas": "verde", "extras": "vermelho"}
    for n, s in enumerate(SECOES, 1):
        itens = [(num(i), r["nome"]) for i, r in enumerate(RECEITAS, 1) if r["secao"] == s["id"]]
        partes.append(divisoria(s["id"], s["titulo"], s["subtitulo"], s["texto"], itens,
                                cores[s["id"]], f"Parte {n}"))
        for i, r in enumerate(RECEITAS, 1):
            if r["secao"] == s["id"]:
                partes.append(receita(i, r))
    partes.append(divisoria("bonus", "Bônus", "Para planejar sem estresse",
                            "Tudo o que você precisa para organizar a ceia com calma, "
                            "do cardápio à última compra.",
                            [(n, t) for n, _, t in BONUS], "verde", "Parte 4"))
    partes += [bonus_cardapios(), bonus_cronograma(), bonus_quantidades(), bonus_compras(), final()]
    meta_autor = f'<meta name="author" content="{e(AUTORA)}">' if AUTORA else ""
    return f"""<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<title>{e(TITULO)}</title>
{meta_autor}
<meta name="description" content="{e(SUBTITULO)}">
<link rel="stylesheet" href="fontes/fontes.css">
<link rel="stylesheet" href="estilo.css">
</head>
<body>
{''.join(partes)}
</body>
</html>"""


def gerar_pdf(caminho_html, caminho_pdf):
    try:
        from weasyprint import HTML
        HTML(caminho_html, base_url=PASTA).write_pdf(caminho_pdf)
        return
    except ImportError:
        pass
    exe = shutil.which("weasyprint")
    if exe:
        subprocess.run([exe, caminho_html, caminho_pdf], check=True, cwd=PASTA)
        return
    print("\nWeasyPrint não encontrado. Instale com:  pip install weasyprint")
    print("(No Windows, veja as instruções no LEIAME.md.)")
    sys.exit(1)


def main():
    validar()
    caminho_html = os.path.join(PASTA, "ebook.html")
    with open(caminho_html, "w", encoding="utf-8") as f:
        f.write(montar_html())

    fotos = ["capa"] + [f"receita-{num(i)}" for i in range(1, 21)]
    com_foto = [f for f in fotos if achar_imagem(f)]
    print(f"Fotos encontradas: {len(com_foto)} de {len(fotos)}")
    faltando = [f for f in fotos if f not in com_foto]
    if faltando:
        print("  Sem foto (espaço reservado): " + ", ".join(faltando))

    caminho_pdf = os.path.join(PASTA, ARQUIVO_PDF)
    print("Gerando PDF... (pode levar alguns segundos)")
    gerar_pdf(caminho_html, caminho_pdf)
    print(f"Pronto! {caminho_pdf}")


if __name__ == "__main__":
    main()
