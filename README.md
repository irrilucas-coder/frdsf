# Estúdio Kie — GPT Image 2 + Seedance 2.0 + Chat Claude

Dashboard local para gerar **imagens** (GPT Image 2) e **vídeos** (Seedance 2.0) usando a API da [Kie.ai](https://kie.ai).

## Jeito mais fácil (Windows): dois cliques
1. Instale o [Node.js](https://nodejs.org) (só uma vez).
2. Dê dois cliques em **`Abrir Estudio.bat`**. Na primeira vez ele instala o chat sozinho (leva 1 minuto).
3. O navegador abre no **Chat Claude**. Para desligar, feche a janela preta.

## 💬 Chat Claude
Conversa com o Claude usando a **sua chave da API da Anthropic** (gasta os seus créditos, não precisa de plano Pro).
1. Cole a chave no campo lá em cima (fica salva só neste navegador; o servidor local só repassa para a Anthropic).
2. Escreva e aperte Enter. A resposta aparece enquanto o Claude escreve; o botão vira **Parar**.
3. Embaixo de cada resposta: quantos tokens gastou e o custo aproximado em dólar.
- **Modelo:** Opus 5.5 (mais inteligente), Sonnet 5.5 (metade do preço), Haiku 5.5 (rápido e bem barato).
- **Instruções fixas:** um texto que vale para a conversa toda (ex.: "você é roteirista de novelas").
- As conversas ficam salvas no navegador; **＋ Nova conversa** começa outra.
- Também abre pelo botão **💬 Chat Claude** no estúdio, ou em http://localhost:3000/chat

## Como rodar (pelo terminal)

1. Instale o [Node.js](https://nodejs.org) 18 ou mais novo.
2. No terminal, dentro desta pasta:
   ```bash
   npm start
   ```
3. Abra **http://localhost:3000** no navegador.
4. Cole sua KIE API key no topo da página e clique em **Testar conexão**.

A parte de imagem e vídeo não precisa de mais nada. O chat precisa de `npm install` uma vez (o `Abrir Estudio.bat` faz isso sozinho).

## O que tem

- **Imagem (GPT Image 2):** sem imagens = texto → imagem; com imagens (até 16) = imagem → imagem.
  Formatos: auto, 1:1, 16:9, 9:16, 4:3, 3:4. Resolução 1K/2K/4K (auto só 1K; 1:1 até 2K).
- **Vídeo (Seedance 2.0 / 2.0 Fast):** texto → vídeo, primeiro/último quadro, imagens de referência
  (cite como `@Image1`, `@Image2`… no prompt), 16:9/9:16/1:1, 480p/720p/1080p, 5/10/15 s, áudio e web search.
- Histórico dos resultados com links para baixar. Antes de cada geração a página pede confirmação (gasta créditos).

## Sobre a chave

A chave fica salva só no seu navegador (localStorage) e é enviada ao servidor local, que repassa para a Kie.ai.
Ela nunca é gravada em arquivo. O servidor existe porque o navegador não deixa a página falar direto com a Kie (CORS).
