# Estúdio Kie — GPT Image 2 + Seedance 2.0

Dashboard local para gerar **imagens** (GPT Image 2) e **vídeos** (Seedance 2.0) usando a API da [Kie.ai](https://kie.ai).

## Como rodar

1. Instale o [Node.js](https://nodejs.org) 18 ou mais novo.
2. No terminal, dentro desta pasta:
   ```bash
   npm start
   ```
3. Abra **http://localhost:3000** no navegador.
4. Cole sua KIE API key no topo da página e clique em **Testar conexão**.

Não precisa instalar nenhuma dependência.

## O que tem

- **Imagem (GPT Image 2):** sem imagens = texto → imagem; com imagens (até 16) = imagem → imagem.
  Formatos: auto, 1:1, 16:9, 9:16, 4:3, 3:4. Resolução 1K/2K/4K (auto só 1K; 1:1 até 2K).
- **Vídeo (Seedance 2.0 / 2.0 Fast):** texto → vídeo, primeiro/último quadro, imagens de referência
  (cite como `@Image1`, `@Image2`… no prompt), 16:9/9:16/1:1, 480p/720p/1080p, 5/10/15 s, áudio e web search.
- Histórico dos resultados com links para baixar. Antes de cada geração a página pede confirmação (gasta créditos).

## Sobre a chave

A chave fica salva só no seu navegador (localStorage) e é enviada ao servidor local, que repassa para a Kie.ai.
Ela nunca é gravada em arquivo. O servidor existe porque o navegador não deixa a página falar direto com a Kie (CORS).

## Estúdio de Shorts (http://localhost:3000/shorts)

Produção em série de Shorts com personagens e cenários fixos e a voz da ElevenLabs:

1. **Biblioteca:** cadastre uma vez os personagens e os cenários (casa, rua, escola…), cada um com uma "ficha visual".
   Gere a imagem de referência com GPT Image 2 (botão ✨) ou envie uma foto. Tudo fica salvo neste computador em `data/biblioteca/`.
   Cada personagem pode ter a própria voz.
2. **Estilo e voz:** defina o estilo visual fixo do canal (entra em todo prompt), a voz do narrador e o modelo da ElevenLabs.
3. **Episódio:** escreva a regra do mundo e as cenas. Para cada cena, escolha o cenário, os personagens, a ação/câmera e a fala.
   - 🎙️ gera a fala na ElevenLabs (o MP3 fica em `data/audios/` e o estúdio avisa se a voz ficou mais longa que a cena);
   - 🎬 gera o clipe vertical 9:16 no Seedance, enviando as imagens dos personagens e do cenário como `@Image1`, `@Image2`…
     para manter o mesmo visual em todos os episódios.
   - "Exportar roteiro" baixa o episódio inteiro, com os prompts, em Markdown.

A chave da ElevenLabs (elevenlabs.io → Profile → API Keys) fica só no navegador, assim como a da Kie.
