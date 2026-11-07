# 📌 Progresso do projeto (para retomar de onde parou)

Atualizado a cada etapa. Se a conversa for interrompida (limite de uso), a próxima sessão começa por aqui.

## Em andamento
- **Elevador v2** (`npx remotion render Elevador`): refazer a narração com a voz **Matheus**
  (`36rVQA1AOIPwpA3Hg1tC`, a voz masculina pt-BR mais usada por criadores) em `scripts/vozes-elevador.py`,
  conferir pela transcrição, renderizar em Full HD e entregar `videos/por-que-o-elevador-nao-despenca-v2.mp4`.
  - Já feito: guincho com mãos na manopla, poço sem atravessar lajes, trilhos fora da cabine, cabine e casa de
    máquinas realistas, visual cinema, música "Monkeys Spinning Monkeys" (crédito CC BY na descrição).
  - Amostras de voz para o usuário escolher: `amostras-voz/` (Matheus, Will, Keren, Raquel).

## Como renderizar (retomável)
- `node scripts/render-retomavel.mjs <Composicao> <nome>`: renderiza em blocos de 300 frames em `out/partes/<nome>/`
  (pula blocos prontos), áudio separado e junta em `out/<nome>.mp4`. Se cair, é só rodar de novo.
- Depois: comprimir para `videos/<nome>.mp4` (crf 18), transcrever o áudio final e entregar.
- Fila de render concluída (Elevador, Freio, Fila, FreioMX, FilaMX).

## Entregues nesta rodada (todos conferidos: 0 erros de decodificação + transcrição batendo com o roteiro)
- `videos/como-um-carro-consegue-parar.mp4` (Freio, Matheus)
- `videos/por-que-a-fila-do-lado-anda-mais-rapido.mp4` (Fila, Matheus)
- `videos/como-frena-un-carro-mx.mp4` (FreioMX, David)
- `videos/por-que-la-fila-de-al-lado-mx.mp4` (FilaMX, David)
- Roteiros: `roteiro/freio-e-fila.md`. Crédito da música na descrição (CC BY).

## Próximo
- Aguardando novos pedidos do usuário. Pendência opcional: baixar mais músicas (`scripts/biblioteca-musicas.py`).
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
