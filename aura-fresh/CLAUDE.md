# PROJETO AURA FRESH: PROMPTS DE VÍDEO PARA O FLOW (GOOGLE)

> Como usar: salve este arquivo como `CLAUDE.md` na pasta do projeto. Depois cole no Claude Code o **COMANDO INICIAL** (abaixo) e mande cada roteiro novo.

---

## 1. COMANDO INICIAL (colar no Claude Code)

```
Leia o arquivo CLAUDE.md desta pasta. Ele reúne tudo o que foi combinado em um trabalho anterior: o produto, o estilo visual, as regras do Flow e o formato dos prompts. Siga essas regras como padrão, sem eu precisar repetir.

Seu trabalho: eu vou te mandar roteiros narrados (UGC já gravado). Para cada roteiro, você cria os prompts de apoio (cenas que entram como inset ou tela cheia sobre o vídeo da narradora), cada um indicando em qual trecho da fala entra.

Regras de trabalho:
1. Responda em português, direto e conciso. Não explique demais.
2. Para cada roteiro, crie uma pasta em /roteiros/ com um arquivo .md contendo o texto do roteiro e os prompts.
3. Todo prompt segue o FORMATO DE SAÍDA da seção 7.
4. Antes de escrever, confira a seção 5 (gatilhos de violação do Flow) e a seção 8 (limites).
5. Se um pedido for ambíguo, faça UMA pergunta curta. Se eu disser "1 prompt só", entregue um prompt único.
6. Quando eu disser que um prompt "violou" ou "não ficou bom", reescreva só o ponto problemático, mantenha o resto e explique em uma linha o que mudou.
7. Mantenha um arquivo /prompts_aprovados.md com os prompts que eu aprovar, para reutilizar o padrão.

Comece lendo o CLAUDE.md e me confirme em 5 linhas o que entendeu.
```

---

## 2. CONTEXTO

- **Produto:** Aura Fresh, vendido como "desodorante interno". É um **pó para preparo de bebida** (clorofila + menta + salsa, sabor abacaxi com hortelã, 30 porções, 90 g). Não é líquido pronto nem cápsula.
- **Mensagem central dos roteiros:** o mau cheiro (hálito, cecê/axilas, chulé, odor íntimo, suor) não vem só da higiene. Para o roteiro, a origem está no intestino, e o produto age "de dentro para fora". Produtos que só disfarçam (enxaguante, bala, spray, desodorante, perfume) "não resolvem".
- **Formato dos vídeos:** a narradora (UGC) já está gravada. As cenas geradas entram **em tela dividida (inset)** ou **cobrindo a tela toda**, em **9:16** ou **16:9**.
- **Ferramenta de geração:** Flow (Google), texto para vídeo, com opção de imagem de referência/primeiro quadro.
- **Quem pede:** Jhol, freelancer de vídeo com IA. Comunica-se em português, quer comunicação direta e fica frustrado com repetição de erro e excesso de explicação.
- **Edição:** feita depois pelo usuário (CapCut/Premiere). Texto, logo, pote real e preço entram na edição.

---

## 3. ESTILO VISUAL (REGRAS FIXAS)

**Dois tipos de cena, intercalados:**

**A) Realista (pessoa/ambiente)**
- Estilo "campanha publicitária premium", 4K, high-key, clara e vibrante.
- Balanço de branco neutro (~5500K), **sem tom amarelado, sem cena escura, sem vinheta**.
- Pessoas brasileiras (especificar "mulher brasileira, pele morena clara, cabelo castanho"). O Flow tende a gerar traços indianos/japoneses se isso não for dito.
- Ambientes claros e sofisticados (casa de alto padrão, cozinha gourmet, café moderno, terraço).
- Pele com textura realista. Reações sutis, sem exagero.

**B) Animação 3D anatômica**
- Fundo **azul-marinho profundo e desfocado, com gradiente sutil**.
- **Sem chroma key.** O usuário rejeitou o fundo verde ("enjoa", "amador"). Nunca usar fundo verde.
- Corpo e órgãos na **mesma paleta azul translúcida e FOSCA** ("vidro médico fosco, matte translucent material"), sem brilho especular, sem reflexos de espelho, sem aparência de plástico. Brilho/espelhado já "quebrou" o padrão da abertura.
- **Verde-esmeralda é a cor do produto** e só aparece onde o produto age.
- Partículas de odor: cinza-esverdeadas, discretas. **Sem fumaça pesada, sem aparência nojenta.**
- Corpo inteiro sempre visível, sem zoom isolando regiões sensíveis.
- Estética: "medical CGI, cinematic scientific visualization, translucent human body, high-end CGI, 4K".

**C) Variações aceitas:** 3D cartoon premium (para humor), motion graphics 3D institucional (bandeiras, mapa do Brasil, moedas), still-life premium (ingredientes).

---

## 4. PRODUTO (POTE) E TEXTO

**Pote real (referência fiel):**
- Cilindro baixo e largo de papelão rígido, **fosco**, verde-escuro profundo (quase verde-musgo). Corpo e tampa na mesma cor.
- **Tampa** encaixada no terço superior, com linha de emenda horizontal visível.
- **Logotipo "aura FRESH" fica na TAMPA**, acima da linha de emenda, em verde-limão ("aura" em minúsculas arredondadas e grossas; "FRESH" em maiúsculas finas ao lado). Nunca muda de lugar.
- **Corpo, de cima para baixo:** "Inner Freshness Complex / Daily Blend"; tarja lilás-rosada "CLOROFILA + MENTA + SALSA"; "PÓ PARA O PREPARO DE BEBIDA"; "ABACAXI COM HORTELÃ"; selo "30 porções / uso oral"; "peso líquido 90g".

**Regras para o pote:**
1. O Flow **distorce rótulo e letras**, principalmente em movimento. Por isso:
   - Prefira **espaço central vazio e iluminado** no prompt e **coloque a foto real do pote na edição**.
   - Se precisar gerar o pote: use a foto como **primeiro quadro/referência**, mantenha o pote **parado, de frente, sem girar**, com o rótulo legível e os dedos sem cobrir a tampa.
   - Cenas com pessoa: use **pote liso, sem rótulo e sem texto**, e troque pela foto real na edição.
2. Foto de referência principal: a das 3 unidades empilhadas (mostra "aura FRESH" inteiro). Na foto da mesa, "FRESH" está cortado.
3. Nunca gerar outras marcas no mesmo quadro. Embalagens de "produtos que não resolvem" são **genéricas, sem marca e sem texto**, para o Flow não inventar "Aura" nelas.

**Texto em cena:**
- Todo texto deve estar em **português do Brasil**. Em prompts com possibilidade de texto, incluir: "qualquer texto deve estar em português do Brasil".
- **Regra padrão:** o Flow erra letras, números e acentos. Gere a animação **sem texto** e escreva o texto na edição (liste os textos sugeridos). Só peça texto ao Flow quando o usuário insistir, e então escreva a palavra exata entre aspas e avise que ele deve conferir cada letra.

---

## 5. GATILHOS DE VIOLAÇÃO DO FLOW (APRENDIDOS NA PRÁTICA)

Evite ou contorne:

| Gatilho | O que fazer |
|---|---|
| "região íntima", "parte íntima", "virilha" nomeadas e enquadradas | Tratar como **onda no corpo inteiro, plano aberto e fixo**, sem nomear nem aproximar. A narração cobre o resto. |
| "corpo feminino" + região íntima / parte inferior do tronco | Remover "feminino" e "formas femininas". Testar só depois que a versão neutra passar. |
| Frases de negação como "sem nudez, sem detalhes íntimos" | O filtro lê as palavras. Preferir descrever só o que mostrar. |
| Zoom/close em região sensível, "silhueta + região abdominal em destaque" | Corpo inteiro sempre em quadro, sem zoom isolado. |
| Telão com conteúdo médico atrás de uma pessoa ("médica + tela + corpo") | Gerar separado (a pessoa e a animação) e compor na edição. |
| Cortes bruscos, flashes, tremor de câmera em cenas de corpo | Travelling contínuo, suave, sem flashes. |
| Gesto explícito de tapar o nariz / humilhação direta | Reação sutil: recuo discreto, desviar o olhar, narinas se contraindo. |
| Vertical 9:16 barrando e horizontal passando | Gerar em **16:9 com a ação no terço central** e recortar em 9:16 na edição. |
| Marcas reais (Listerine, Halls, Mounjaro etc.) | Descrever o objeto sem citar a marca. |
| Personagens protegidos (Fiona/Shrek etc.) | Não gerar. Oferecer personagem original. |

**Plano B quando barrar:** pedir ao usuário **qual take travou**, gerar em partes e unir na edição.

---

## 6. FÓRMULAS REUTILIZÁVEIS

**Bloco do corpo 3D (abertura, aprovado):**
> Animação médica 3D cinematográfica, estilo infográfico científico premium, altíssima produção, 4K. Figura humana adulta em pé, de frente, anatômica, translúcida e sofisticada, estética de vidro médico fosco, paleta predominantemente azul, silhueta suave e proporções naturais. Superfície lisa e uniforme, sem brilho especular, sem reflexos de espelho, sem aparência de plástico ou de vidro polido, luz difusa e homogênea. Fundo azul-marinho profundo e desfocado, com gradiente sutil, sem chroma key. Travelling vertical contínuo, suave e estabilizado. Iluminação clínica azulada, difusa e volumétrica, com highlights em verde-esmeralda apenas nas partículas.

**Ação do produto no intestino (padrão):**
> Corte transversal elegante do abdômen, contorno do corpo e intestino na mesma paleta azul translúcida e fosca. Partículas esféricas cinza-esverdeadas ao longo do trajeto. Um brilho verde-esmeralda surge em um ponto e se espalha em ondas suaves, dissolvendo cada partícula uma a uma, até o intestino ficar limpo e iluminado em verde. O verde é o único elemento fora da paleta azul.

**Zona segura para anúncio:** "o quarto inferior do quadro fica totalmente livre e escuro, sem nenhum elemento, porque a plataforma coloca o botão do link ali".

**Humor (cecê/bafo):** preferir **3D cartoon premium** com reações de bichinhos e plantas (planta murchando, passarinho caindo duro com olhos em espiral). É o estilo que mais passa.

**Bancadas "o que não resolve":** produtos genéricos sem marca e sem texto, dolly lateral lento, "X" dourado sutil sobre cada um (nunca vermelho), nunca o mesmo padrão em dois roteiros diferentes (o usuário separa por vídeo).

---

## 7. FORMATO DE SAÍDA DE CADA PROMPT

```
## [Número]. [Nome curto da cena] ([tipo: realista | 3D anatômico | motion | cartoon], [9:16 ou 16:9], [duração])

(bloco de código com o prompt, em português)

*Fala: "trecho do roteiro em que entra"*
*Observação (1 linha): o que editar depois ou o risco principal.*
```

Regras:
- Prompt completo em um bloco de código, pronto para colar no Flow.
- Duração indicada (os roteiros usaram 8 s e 10 s por cena).
- Indicar formato e se é **inset** ou **tela cheia**.
- Listar "Textos para colocar na edição (pt-BR)" quando houver texto.
- Depois do bloco de prompts: 1 a 3 linhas com riscos e alternativas. Nada de relatório longo.

---

## 8. LIMITES E ALERTAS (OBRIGATÓRIO)

**Não gerar, em nenhuma forma ou estilo:**
- **Fezes** ("cocô", "bosta", borrado, desfocado, trocado por "quibe", sobre imagem enviada ou como animação de descarga). A alternativa aceita é **água do vaso com coloração verde, sem conteúdo visível**, ou o corte para o intestino com brilho verde. Informar o limite em uma frase e oferecer a alternativa.
- Personagens protegidos por direitos autorais (Fiona, Shrek).
- Associar medicamentos reais (ex.: Mounjaro) ao produto.
- Nudez ou cenas íntimas.

**Alertas ao usuário (1 linha, quando o roteiro tiver):**
- "Detox", "primeiro desodorante interno", "mesma fórmula dos mais usados", "só o Aura Fresh oferece" e "estudos comprovam": anúncios de saúde costumam exigir comprovação. Sugerir alternativa mais segura ("ajuda a reduzir o odor de dentro para fora", "fórmula inspirada em produtos usados nos EUA, Japão e Europa").
- "Você tá fedendo": o Meta e o TikTok podem reprovar anúncios que afirmem ou sugiram uma característica pessoal do público. Sugerir "muita gente nem percebe que está com cheiro".
- **Preço:** "R$ 3 por dia" e "1 pote = 1 mês" precisam bater com o valor real do pote ÷ 30. "Devolvemos o dinheiro" deve refletir a garantia real.
- Marca real nas cenas (Halls, Listerine) em anúncio pago pode gerar notificação do detentor. Preferir embalagens genéricas.
- Sobrevoo de "sede da empresa": o prédio é inventado e não representa a sede real. Avisar.

---

## 9. REGRAS DE COLABORAÇÃO COM O USUÁRIO

- Português, direto, curto. Não repita regras que ele já sabe.
- Ele manda mensagens curtas e por ditado, com erros de digitação ("cece" = cecê, "sovaco/suvaco" = axila, "chule" = chulé, "bafo/bafão" = mau hálito). Interprete o contexto e só pergunte se for realmente ambíguo.
- **"Violou"** = o Flow barrou. **"Ficou estranho/feio"** = ajustar o estilo, não refazer do zero.
- **"Como fez antes"** ou "o padrão" = reutilizar um prompt já aprovado, em /prompts_aprovados.md.
- Se ele colar um prompt sem instrução, pergunte o que mudar (até 4 palpites).
- Ele costuma pedir: variação de ordem dos takes, versão "só anatomia", versão em 16:9 para recortar, versão sem texto, "mais profissional/animado".
- Quando houver imagem de referência (pote, moedas de R$ 1, embalagem), pedir ao Flow para seguir a referência **exata** e dizer que o rótulo pode distorcer.
- Para moedas de R$ 1: bimetálica, aro dourado e miolo prateado, "BRASIL" e "1 REAL" em relevo. Pedir foto de referência de cada face.

---

## 10. ROTEIROS JÁ TRABALHADOS (HISTÓRICO)

1. **Barra de contagem 24h / 3 dias / 1 semana:** PNG com fundo verde (antigo, abandonado).
2. **Roteiro "bafo de bosta / dentista":** 15 cenas, intercalando realista e 3D azul.
3. **Roteiro "teste da colher":** colher, rotina bucal, intestino, desodorante interno, bandeiras, CTA.
4. **Roteiro "pós-parto":** cecê, hormônios 3D, produto brasileiro, clorofila.
5. **Roteiro "farmacêutica Cleycianne":** cutaways sobre vídeo real (clorofila, clorofilina, intestino).
6. **Roteiro "donzela / desodorante interno":** 8 cenas de 8 s + 3 extras de 10 s (axilas, hálito, pés, scoop, intestino, "cheiro de pizza podre", preço e CTA).

**Cenas avulsas criadas (podem ser reaproveitadas):** bancadas de alternativas (bucal, desodorantes, íntimo, pés, probióticos, Halls + enxaguante), bandeiras EUA/Japão/Coreia/Europa, "versão brasileira" da fórmula, ingredientes still-life, molécula de clorofilina 3D, perfume, banho, vestiário, metrô visto do alto (aura presa a pessoas específicas), date com virada, marido/beijo, homem bocão com bafo (cartoon), "ERRO Nº 1/2/3" em motion, "DESFEDORIZAÇÃO" com interrogação e corpinhos, "R$ 3 por dia" com moedas, frete grátis para todo o Brasil (sem barra, zona segura embaixo), pote com referência da foto.

---

## 11. PRIMEIRA TAREFA SUGERIDA PARA O CLAUDE CODE

1. Criar a estrutura: `/roteiros/`, `/prompts_aprovados.md`, `/assets/` (para fotos do pote e das moedas).
2. Criar `/roteiros/_modelo.md` com o formato da seção 7.
3. Aguardar o próximo roteiro do usuário e gerar os prompts seguindo este arquivo.
4. Ao final de cada roteiro, listar: textos para a edição (pt-BR), cenas com risco de violação e alertas de publicidade.

---

## 12. BIBLIOTECA DE ESTILOS (BLOCOS PRONTOS PARA REUTILIZAR)

Use estes blocos como base e adapte a cena. Cada estilo tem o "tom" e as palavras que funcionaram no Flow.

### 12.1 Realista premium (lifestyle / campanha)
> Vídeo realista cinematográfico de campanha publicitária premium, 4K, fotografia high-key clara e vibrante, balanço de branco neutro (cerca de 5500K), sem tom amarelado, sem cena escura e sem vinheta, pele realista, cores fiéis. Câmera estável, foco raso com bokeh cremoso, iluminação de estúdio simulando luz natural (janela como luz principal, sombras leves). Pessoas: "mulher brasileira, pele morena clara, cabelo castanho". Reações sutis, tom observacional e levemente irônico.

### 12.2 Realista com VFX integrado
> Mesmo bloco do 12.1 + "VFX sutil e translúcido". Exemplos aprovados: fumacinha fina cinza-esverdeada saindo do braço até o nariz de outra pessoa; balão de pensamento com pizza que murcha em "puff"; aura fina presa ao corpo de pessoas específicas (nunca espalhada pelo ambiente); onda fraca saindo da boca. Regra: o efeito nasce da pessoa certa e fica colado nela.

### 12.3 3D anatômico azul fosco
> Ver bloco da seção 6. Reforços: "matte translucent material", "luz difusa e homogênea", "sem brilho especular". Verde-esmeralda só no produto agindo. Para 9:16 que viola, gerar em 16:9 com ação no terço central.

### 12.4 3D cartoon premium (humor)
> Animação 3D estilo cartoon premium (acabamento de filme de animação), 4K, cores vibrantes, iluminação clara, sem chroma key. Personagens de proporções estilizadas, olhos grandes e expressivos. Timing de comédia clássico (antecipação, exagero, reação). Cheiro = ondas grossas e ondulantes em verde-amarelado translúcido, como as linhas de cheiro dos desenhos. Reações dos arredores: planta murcha, passarinho cai duro com olhos em espiral, cachorro foge, flores baixam as pétalas. Sempre "sem sangue, sem nada gráfico, sem terror". É o estilo mais seguro para piadas de bafo, cecê, chulé e "difunto".

### 12.5 Motion graphics 3D institucional (CTA, bandeiras, mapa, moedas)
> Motion graphics 3D premium de campanha, 4K, fundo azul-marinho profundo e desfocado com gradiente sutil e partículas de luz suaves, sem chroma key. Cores: azul-marinho de base, verde-esmeralda nos destaques e dourado nos brilhos. Câmera: dolly in lento e estável, leve rotação orbital, foco raso. Elementos aprovados: mapa do Brasil (contorno dourado + preenchimento verde-esmeralda translúcido) com pontos de luz e caixa 3D cruzando; seta grande para baixo em verde-esmeralda com contorno dourado, pulsando; bandeiras estilizadas com halo dourado; moedas; grade de 30 quadradinhos que acende. **Zona segura:** quarto inferior livre e escuro (botão do link da plataforma).

### 12.6 Motion tipográfico (títulos e palavras-chave)
> Fundo azul-marinho profundo, partículas suaves. Texto em maiúsculas, fonte sans-serif grossa e moderna, branca com contorno dourado fino e leve brilho verde. Entradas: golpe de escala + flash curto, deslize lateral com motion blur, letras surgindo uma a uma. "X" dourado grande sobre o item errado + pulso de luz percorrendo o contorno. Interrogação gigante em 3D, acabamento metálico fosco verde-esmeralda com contorno dourado, ondas concêntricas e corpinhos curiosos (bonequinhos de vidro azul fosco, sem rosto, com pontinhos de luz). **Padrão:** gerar sem letras e escrever na edição; se pedir texto, escrever a palavra exata e conferir letra por letra (til, cedilha, "Nº").

### 12.7 Still-life editorial (ingredientes, produto)
> Fotografia de produto editorial de nutracêutico premium, lente macro 100 mm, f/2.8, bancada de mármore Carrara branco fosco, luz principal suave em caixa de luz do lado esquerdo (~5200K), contraluz fino nas folhas e gotas, fundo em gradiente claro perolado/verde-sálvia desfocado. Composição assimétrica com espaço negativo e **espaço central vazio** para o pote real. Elementos: monte cônico de clorofilina em pó, salsa lisa fresca, folhas de hortelã com gotas de água, partículas de pó no contraluz. Dolly in ou slider lateral muito lento.

### 12.8 Bancada "o que não resolve"
> Produtos **genéricos, sem marca, sem logotipo e sem texto**, em bancada de mármore claro, dolly lateral lento em plano baixo. "X" **dourado** sutil (ou vermelho fino, conforme pedido) surge com fade-in sobre cada item quando a câmera passa. Categorias já feitas: higiene bucal, desodorantes, íntimo, pés, probióticos, Halls + enxaguante azul, leite de magnésia/perfume/receitas caseiras. Nunca repetir a mesma bancada em roteiros diferentes. No final, opcional: espaço vazio com halo dourado e "check" para o pote real.

### 12.9 Câmera elevada e aérea
> **Metrô:** câmera fixa em passarela, ~4 m de altura, inclinada 45°, perto da ação (pessoas grandes no quadro, rostos sem close), metrô chegando ao fundo, aura fina presa a poucas pessoas específicas (máx. meio metro do corpo). **Sobrevoo institucional:** drone, 16:9, dia claro, fachada minimalista verde-escura e vidro, letreiro só na edição, avisar que o prédio é inventado.

### 12.10 Composição para inset e tela dividida
> **9:16 inset:** objeto centralizado, forte contraste, sem detalhes finos nas bordas. **16:9 para recorte:** figura centralizada ocupando a altura toda, ação no terço central, laterais vazias. **Tela dividida:** ação concentrada na metade do quadro, margem livre. **Fundo removido:** preferir fundo azul-marinho escuro, não verde.

### 12.11 Imagem de referência
> Anexar no Flow como primeiro quadro/referência (pote, moedas de R$ 1, embalagens). Escrever no prompt: "reprodução EXATA da referência, sem redesenhar, sem trocar palavras, o objeto não gira". Se o rótulo distorcer, gerar o objeto liso e trocar pela foto real na edição.
