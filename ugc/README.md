# 📱 UGC Ultra-Realista — Nano Banana + Google Flow

Guia mestre para criar vídeos UGC (pessoa "comum" falando para a câmera do celular) que parecem gravados de verdade.
Serve para qualquer nicho: oferta de vídeo para empresas (restaurante, lanchonete, padaria, oficina…), IPTV,
produto na mão, serviço local, depoimento etc.

- `modelos.md` — modelos para preencher (personagem, personagem + produto, cenas faladas, cena de produto, CTA) e banco de personagens
- `exemplos/` — pacotes completos e prontos para usar:
  - `01-oferta-video-para-empresas.md` — vender vídeo UGC para restaurante, lanchonete, padaria, oficina (38 s)
  - `02-iptv.md` — serviço de IPTV (28 s)
  - `03-produto-na-mao.md` — produto físico com foto do produto como ingrediente (36 s)
  - `04-padaria-cliente.md` — vídeo entregue para um cliente local (26 s)
  - `05-app-novelinhas-luana.md` — trecho de novelinha + Luana apresentando o app (38 s)

---

## 1. Fluxo de trabalho (sempre igual)

| Etapa | Ferramenta | O que entra | O que sai |
|---|---|---|---|
| 1. Personagem | Nano Banana (Pro / 2) | **Prompt da personagem** (eu mando) | Foto selfie ultra-realista da UGC, 9:16 |
| 2. Produto (se tiver) | Nano Banana | Foto do produto + foto da UGC + **prompt de composição** | UGC segurando o produto, rótulo legível |
| 3. Cenas | Flow → *Ingredients to Video* | Imagem da UGC + imagem do produto + **prompt de cada cena** | Clipes de 8 s (Veo 3.1) ou 10 s (Omni Flash) com fala |
| 4. Montagem | Flow / CapCut | Clipes na ordem | Vídeo final de 26–40 s |

**Pacote que eu entrego em cada pedido:**
1. Prompt da personagem (Nano Banana)
2. Prompt de composição com o produto (quando houver produto)
3. Roteiro com tempo de cada fala
4. Prompt de cada cena, já dizendo quais ingredientes usar
5. Legenda/texto do post e CTA (opcional)

---

## 2. Duração: quantas cenas fazer

| Modelo no Flow | Duração por clipe | Referências (ingredientes) | Observação |
|---|---|---|---|
| Veo 3.1 Fast / Lite | 4, 6 ou **8 s** | Sim (até 3 imagens) | Só clipe de 8 s pode usar **Extend** |
| Veo 3.1 Quality | 8 s | **Não** aceita ingredientes | Use só para cena sem personagem |
| Gemini Omni Flash | até **10 s**, 720p | **Sim** (imagem da UGC + imagem do produto) | Extend pode não estar liberado ainda |

**Padrão recomendado para UGC: Gemini Omni Flash** — 10 s por cena e aceita as imagens da personagem e do produto como ingredientes.
O Veo 3.1 Fast (8 s) fica como alternativa; o Veo 3.1 Quality é o único que não aceita ingredientes.

| Vídeo final | Clipes de 10 s | Clipes de 8 s |
|---|---|---|
| ~26 s | 3 cenas (corta o excesso) | 4 cenas |
| 30–40 s | 4 cenas | 5 cenas |

**Limite de fala por cena (português falado em ritmo natural ≈ 2,5 palavras/s):**
- Cena de 8 s → **até 16–18 palavras**
- Cena de 10 s → **até 20–22 palavras**

Fala demais = a personagem acelera, corta a frase ou erra a boca. Deixe ~1 s de respiro no começo e no fim.

---

## 3. As regras de ouro do ultra-realismo

### Na imagem (Nano Banana)
1. **Escreva como celular, não como cinema.** Use *smartphone front camera selfie, iPhone, arm's length, 24mm wide-angle*. **Evite** *cinematic, 4K, 8K, studio lighting, masterpiece, perfect skin* — isso puxa para "anúncio de estúdio" e plastifica a pele.
2. **Descreva a pele como ela é:** poros visíveis no nariz e bochechas, penugem fina (peach fuzz), leve vermelhidão no nariz, olheira suave, sardas, uma marquinha/espinha cicatrizada, linhas naturais da boca, brilho natural na testa (zona T).
3. **Descreva o cabelo com detalhe de cor e fio:** cor base + reflexo + raiz crescida (ex.: *caramel balayage grown out 3 cm at the roots*), fios soltos (*flyaway strands, baby hairs at the hairline*), frizz leve, mecha atrás da orelha. Cor de cabelo vaga ("brown hair") vira cabelo genérico de IA.
4. **Imperfeição é realismo:** roupa com amassado, alça torta, unha natural, fundo de casa real (almofada, planta, carregador na tomada), luz mista.
5. **Luz real:** janela lateral, luz da tarde, abajur quente + janela fria. Uma fonte principal com queda de luz no outro lado do rosto.
6. **Características de foto de celular:** leve distorção grande-angular, ruído digital nas sombras, processamento HDR de celular, foco nos olhos, fundo levemente desfocado (não bokeh exagerado).
7. **Negativo semântico (dica oficial do Google):** descreva o que você quer em vez de só listar "não". Ex.: em vez de "no makeup" → *bare skin with only mascara and lip balm*. Feche com uma linha curta de exclusão: *unretouched, no beauty filter, no airbrushing, no text, no watermark*.
8. **Sem rosto famoso.** Pessoa parecida com celebridade é bloqueada no Flow — use traços específicos e comuns.
9. **Formato 9:16** sempre no prompt e na configuração.

### No vídeo (Flow)
1. **Referência define a aparência; o prompt define a ação.** Use *"the woman from the reference image"* e uma âncora curta (idade, cabelo, roupa). Não reescreva o rosto inteiro.
2. **Câmera de UGC:** *handheld smartphone selfie video, natural micro-shake, slight sway, single continuous take, no cuts*.
3. **Uma ação principal por cena** + a fala. Ação demais = deformação.
4. **Fala entre aspas, em português do Brasil, com tom:** *says in Brazilian Portuguese, casual and excited, natural pace with small pauses: "…"*
5. **Rosto vivo:** *natural lip sync, natural blinking, eyebrows move while she talks, small head tilts, genuine micro-expressions*.
6. **Áudio de celular:** *only her voice, close to the phone microphone, quiet room tone*. E sempre: **no background music, no subtitles, no on-screen text, no logos** (legenda você coloca na edição).
7. **Continuidade entre cenas:** mesmo lugar, mesma luz, mesma roupa escritos igualzinho em todas as cenas. Termine uma cena na posição em que a próxima começa.
8. **Números e preços por extenso:** "quarenta e nove e noventa", "trinta segundos" — evita a IA ler errado.
9. **Palavra estrangeira/marca:** escreva como se fala ("ai-pi-ti-vi") ou troque por termo em português.
10. **Produto:** *holding the product from the reference image, label facing the camera, label text stays sharp and unchanged*. Mão segurando por baixo/lateral, sem cobrir o rótulo.

---

## 4. Estrutura do roteiro UGC que converte

| Bloco | Tempo | Função |
|---|---|---|
| **Gancho** | 0–3 s | Dor, pergunta ou frase de choque. Ninguém fica se os 2 primeiros segundos forem fracos. |
| **Problema / Identificação** | 3–10 s | "Eu também…" / "Seu negócio tá assim?" |
| **Solução / Demonstração** | 10–25 s | Mostra o produto/serviço, benefício concreto, prova |
| **CTA** | últimos 5–8 s | Uma ação só: "me chama no direct", "clica no link", "manda 'quero'" |

Tipos de gancho que funcionam: pergunta direta ("Seu restaurante tá com salão vazio?"), confissão ("Eu pagava três assinaturas…"),
revelação ("Esse vídeo foi feito com IA."), contrário ("Para de gastar com…"), resultado ("Em sete dias minha pele…").

---

## 5. Problemas comuns e como resolver

| Problema | Solução |
|---|---|
| Pele de plástico / cara de IA | Tire *4K, cinematic, perfect*. Acrescente poros, penugem, olheira, *unretouched*. Peça *phone HDR processing, mild noise*. |
| Cabelo genérico | Detalhe cor + reflexo + raiz + fios soltos + comprimento + textura (1A–4C). |
| Rosto muda entre cenas | Use sempre a MESMA imagem como ingrediente; repita a âncora (idade, cabelo, roupa) igual em todas as cenas. |
| Fala cortada ou acelerada | Corte palavras (limites da seção 2). |
| Sotaque estranho / fala em inglês | *speaks in Brazilian Portuguese with a natural Brazilian accent*; fala sempre entre aspas. |
| Legenda aparecendo no vídeo | *no subtitles, no captions, no on-screen text* no fim do prompt. |
| Música de fundo indesejada | *no background music, only her voice and room tone*. |
| Rótulo do produto deformado | Foto do produto limpa e frontal; *label stays sharp and unchanged*; evite girar o produto. Close do rótulo pode ser feito com a própria foto na edição. |
| Mão/dedo estranho | Mão mais simples: segurando por baixo, sem gesto complexo; menos movimento. |
| Cena bloqueada | Tire nomes de marcas, times, canais, celebridades; troque palavras sensíveis. |

---

## 6. Boas práticas e transparência

- Meta, TikTok e YouTube pedem marcação de **conteúdo feito com IA** quando é realista. Marque no post — e use isso como argumento de venda ("esse vídeo foi feito com IA").
- Não use rosto, voz ou nome de pessoa real sem autorização, nem logos/marcas de terceiros.
- Em anúncio de produto, a personagem não deve prometer resultado que o produto não entrega (saúde, estética, dinheiro).

---

## 7. Como me pedir um vídeo novo

Mande só isto:

```
Nicho/negócio: (ex.: hamburgueria, oficina, IPTV, creme facial)
Objetivo: (vender serviço de vídeo / vender produto / gerar mensagens no WhatsApp)
Duração: (26 s / 30 s / 40 s)
Modelo no Flow: (Veo 3.1 Fast 8 s / Omni Flash 10 s)
Personagem: (mulher/homem, idade, estilo) ou "você escolhe"
Produto: (sim/não — se sim, você manda a foto no Flow como ingrediente)
CTA: (direct, WhatsApp, link, cupom)
```

Eu devolvo o pacote completo no formato dos arquivos em `exemplos/`.

---

## Fontes da pesquisa

- [Google — Veo 3.1 e Ingredients to Video (Gemini API)](https://developers.googleblog.com/introducing-veo-3-1-and-new-creative-capabilities-in-the-gemini-api/)
- [Google — Atualizações do Flow (fev/2026)](https://blog.google/innovation-and-ai/models-and-research/google-labs/flow-updates-february-2026/)
- [Google AI — Gemini Omni Flash](https://ai.google.dev/gemini-api/docs/omni)
- [Duração e Extend no Flow](https://toolfolio.com/articles/make-videos-longer-than-eight-seconds-in-veo)
- [Guia de prompt Omni Flash (Atlabs)](https://www.atlabs.ai/blog/ultimate-gemini-omni-flash-prompting-guide-2026)
- [UGC com Veo 3.1 — ângulos de celular (Dupple)](https://www.dupple.com/tutorial/produce-ugc-style-marketing-videos-with-realistic-camera-angles-using-veo-3-1)
- [Guia de prompt Nano Banana (VEED)](https://www.veed.io/learn/nano-banana-pro-prompts)
- [Teste de realismo de pele em modelos de imagem (Contra)](https://contra.com/community/Jb87yxot-ai-image-models-tested-realism-in)
- [Prompts Nano Banana Pro realistas (Atlabs)](https://www.atlabs.ai/blog/viral-nano-banana-pro-prompts-that-are-mind-blowing)

As especificações do Flow mudam rápido: confira a duração e os modelos disponíveis na sua conta antes de planejar as cenas.
