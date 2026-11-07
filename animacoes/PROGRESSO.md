# 📌 Progresso do projeto (para retomar de onde parou)

Atualizado a cada etapa. Se a conversa for interrompida (limite de uso), a próxima sessão começa por aqui.

## Em andamento
- **Elevador v2** (`npx remotion render Elevador`): refazer a narração com a voz **Matheus**
  (`36rVQA1AOIPwpA3Hg1tC`, a voz masculina pt-BR mais usada por criadores) em `scripts/vozes-elevador.py`,
  conferir pela transcrição, renderizar em Full HD e entregar `videos/por-que-o-elevador-nao-despenca-v2.mp4`.
  - Já feito: guincho com mãos na manopla, poço sem atravessar lajes, trilhos fora da cabine, cabine e casa de
    máquinas realistas, visual cinema, música "Monkeys Spinning Monkeys" (crédito CC BY na descrição).
  - Amostras de voz para o usuário escolher: `amostras-voz/` (Matheus, Will, Keren, Raquel).

## Na fila de renderização (depois do elevador)
- **Freio** (`npx remotion render Freio` → `videos/como-um-carro-consegue-parar.mp4`), narração Matheus conferida.
- **Fila** (`npx remotion render Fila` → `videos/por-que-a-fila-do-lado-anda-mais-rapido.mp4`), narração Matheus conferida.
- Roteiros: `roteiro/freio-e-fila.md`. Depois de renderizar: transcrever o áudio final e entregar.

## Próximo trabalho (pedido do usuário): versões em espanhol do México
- FEITO: roteiros remodelados (balatas, NIP, súper, frenón, mándaselo), narração com **David** (`qRUgOhnxGASxirG4fKjv`,
  mexicano, o mais adotado no estilo), conferida. Composições `FreioMX` e `FilaMX` prontas (`src/freio-mx`, `src/fila-mx`).
- FALTA: renderizar (`videos/como-frena-un-carro-mx.mp4`, `videos/por-que-la-fila-de-al-lado-mx.mp4`), conferir o áudio final e entregar.
- Conferir a narração (transcrição em espanhol), renderizar em Full HD, entregar e sugerir título/descrição em espanhol.
- O usuário pediu: **mesmo se o limite da conversa chegar, continuar quando voltar.**

## Padrões decididos com o usuário
- Vertical 1080×1920, até 1min30s, legenda **numa linha só** (máx. 3 palavras), sem selo "recriação" nem barra de tempo.
- Roteiros seguem `roteiro/GUIA_ESTILO.md` (você constrói) e `roteiro/GUIA_ESTILO_2_CURIOSIDADE.md` (curiosidade).
- Toda narração passa pela conferência automática (transcrição do Vibi) antes e depois de renderizar.
- Visual: `<Palco cinema>` completo sempre (o usuário prefere qualidade a velocidade; render ~1h por vídeo); mãos segurando objetos com `alvoMaoE/alvoMaoD`; nada atravessando parede/chão.
- Efeitos: biblioteca CC0 `public/sfx` (`src/sfx.ts`). Música: `public/musicas` (crédito em `creditos.json`).
- Voz: `eleven_v3` com marcações de emoção. **Voz padrão do canal (escolhida pelo usuário): Matheus** (`36rVQA1AOIPwpA3Hg1tC`). Alternativas: Will, Keren, Raquel.
- Vídeos do México em espanhol mexicano: vozes Adriel e Carlos Garza (`scripts/vozes-mx.py`).

## Vídeos entregues (`videos/`)
Bip e a Estrela · Submarino · Captura de Maduro · Felca/Hytalo · Juez soborno (MX) · INE cuentas (MX) · Elevador v1.

## Pendências
- Chave do Vibi: precisa estar salva em Settings → Environments → Default → Network secrets
  (host `api.vibi.pro`, header `xi-api-key`) para funcionar em sessões novas.
- Biblioteca de músicas: rodar `python3 scripts/biblioteca-musicas.py` de novo para baixar o resto
  (a Wikimedia limita downloads seguidos).
