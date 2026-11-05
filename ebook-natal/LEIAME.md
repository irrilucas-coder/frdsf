# E-book "A Ceia que Dá Certo"

20 receitas de Natal + 4 bônus, em PDF A4, pronto para vender.

## Arquivos

| Arquivo | O que é |
|---|---|
| `ebook-natal.pdf` | O e-book pronto |
| `prompts-imagens.md` | Prompts em inglês para gerar as 21 fotos (capa + 20 receitas) |
| `receitas.py` | **Todo o texto das receitas** (ingredientes, preparo, dicas). Edite aqui. |
| `gerar_pdf.py` | Script que monta o livro. No topo dele ficam **título, subtítulo e nome da autora**. |
| `estilo.css` | Visual do livro (cores, fontes, tamanhos) |
| `ebook.html` | HTML gerado pelo script (abre no navegador, mas o resultado final é o PDF) |
| `imagens/` | Coloque aqui as fotos: `capa.jpg`, `receita-01.jpg` ... `receita-20.jpg` |
| `fontes/` | Fontes Playfair Display e Lato (licença livre SIL OFL, podem ser usadas em produto comercial) |

## Como gerar o PDF de novo (com as fotos)

1. Salve as fotos na pasta `imagens/` com os nomes exatos (`capa.jpg`, `receita-01.jpg` ... `receita-20.jpg`).
   Também vale `.png` ou `.webp`. As fotos que faltarem continuam aparecendo como espaço reservado.
2. No terminal, dentro desta pasta, rode:

```
python3 gerar_pdf.py
```

O script avisa quantas fotos encontrou e cria o `ebook-natal.pdf` atualizado. Fotos muito grandes são
reduzidas automaticamente (se o Pillow estiver instalado) para o PDF não ficar pesado.

## Instalação (só na primeira vez)

Precisa de Python 3 e do WeasyPrint.

- **Mac:** `brew install weasyprint` (ou `pip3 install weasyprint pillow`)
- **Linux:** `pip3 install weasyprint pillow`
- **Windows:** o mais simples é baixar o `weasyprint.exe` (versão standalone) na página de releases do
  WeasyPrint no GitHub e colocar na mesma pasta deste projeto, ou seguir o guia oficial de instalação
  (doc.courtbouillon.org/weasyprint, seção "Installation > Windows"). Depois rode `python gerar_pdf.py`:
  o script usa o `weasyprint` instalado no sistema se não encontrar a biblioteca do Python.

## Personalizar

- **Título, subtítulo, autora, Instagram:** topo do `gerar_pdf.py` (`TITULO`, `SUBTITULO`, `AUTORA`, `CONTATO`).
- **Receitas:** `receitas.py`. Cada ingrediente tem medida caseira, medida em g/ml e a chave da lista de
  compras; a lista de compras do bônus é montada sozinha a partir delas.
- **Cores:** início do `estilo.css`.

Cada receita ocupa exatamente 2 páginas (foto + ingredientes / preparo + dicas). Se você aumentar
muito um texto, gere o PDF e confira se a receita continua em 2 páginas.
