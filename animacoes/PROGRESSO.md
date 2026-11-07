# 📌 Progresso do projeto (para retomar de onde parou)

Atualizado a cada etapa. Se a conversa for interrompida (limite de uso), a próxima sessão começa por aqui.

## Em andamento
- **Elevador v2** (`npx remotion render Elevador`): refazer a narração com a voz **Matheus**
  (`36rVQA1AOIPwpA3Hg1tC`, a voz masculina pt-BR mais usada por criadores) em `scripts/vozes-elevador.py`,
  conferir pela transcrição, renderizar em Full HD e entregar `videos/por-que-o-elevador-nao-despenca-v2.mp4`.
  - Já feito: guincho com mãos na manopla, poço sem atravessar lajes, trilhos fora da cabine, cabine e casa de
    máquinas realistas, visual cinema, música "Monkeys Spinning Monkeys" (crédito CC BY na descrição).
  - Amostras de voz para o usuário escolher: `amostras-voz/` (Matheus, Will, Keren, Raquel).

## Padrões decididos com o usuário
- Vertical 1080×1920, até 1min30s, legenda **numa linha só** (máx. 3 palavras), sem selo "recriação" nem barra de tempo.
- Roteiros seguem `roteiro/GUIA_ESTILO.md` (você constrói) e `roteiro/GUIA_ESTILO_2_CURIOSIDADE.md` (curiosidade).
- Toda narração passa pela conferência automática (transcrição do Vibi) antes e depois de renderizar.
- Visual: `<Palco cinema>`; mãos segurando objetos com `alvoMaoE/alvoMaoD`; nada atravessando parede/chão.
- Efeitos: biblioteca CC0 `public/sfx` (`src/sfx.ts`). Música: `public/musicas` (crédito em `creditos.json`).
- Voz: `eleven_v3` com marcações de emoção; vozes pt-BR preferidas: Matheus, Will, Keren, Raquel.
- Vídeos do México em espanhol mexicano: vozes Adriel e Carlos Garza (`scripts/vozes-mx.py`).

## Vídeos entregues (`videos/`)
Bip e a Estrela · Submarino · Captura de Maduro · Felca/Hytalo · Juez soborno (MX) · INE cuentas (MX) · Elevador v1.

## Pendências
- Chave do Vibi: precisa estar salva em Settings → Environments → Default → Network secrets
  (host `api.vibi.pro`, header `xi-api-key`) para funcionar em sessões novas.
- Biblioteca de músicas: rodar `python3 scripts/biblioteca-musicas.py` de novo para baixar o resto
  (a Wikimedia limita downloads seguidos).
