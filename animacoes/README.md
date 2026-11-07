# 🎞️ Animações 3D (Remotion + Three.js)

Historinhas animadas em 3D feitas inteiramente em código pelo Claude, com a skill oficial do Remotion
(`.claude/skills/remotion-best-practices`). Formato vertical 9:16 (1080×1920), 30 fps.

## Bip e a Estrela (teste, 19,5 s)

Um robozinho que mora sozinho numa ilha flutuante vê uma estrela cair, planta a estrela e dela nasce uma
árvore de luz que acende o céu inteiro.

- `src/Bip.tsx`: o personagem e toda a animação dele
- `src/Cenario.tsx`: ilha, estrela cadente, árvore, brilhos e céu estrelado
- `src/Mundo3D.tsx`: câmera, luzes e ilhas distantes
- `src/BipEAEstrela.tsx`: céu em degradê, legendas, título e áudio
- `roteiro/narracao.srt`: falas com os tempos

## Áudio

- **Narração:** API do Vibi (compatível com ElevenLabs), voz *Yasmin Alves* em pt-BR.
  Para gerar de novo: `VIBI_API_KEY=sk_... python3 scripts/narracao-vibi.py`
  A chave fica só na variável de ambiente, nunca em arquivo.
- **Efeitos e música:** sintetizados por `python3 scripts/gerar-sons.py` (precisa de `numpy`).

## Comandos

```bash
npm install
npm run studio   # pré-visualização interativa no navegador
npm run render   # gera out/bip-e-a-estrela.mp4
```

## Biblioteca de efeitos sonoros (grátis, CC0)

`python3 scripts/biblioteca-sfx.py` baixa e prepara `public/sfx/` com 16 categorias (whoosh, pop, impacto,
explosão, erro, acerto, conquista, água, bolhas, alarme, sonar, mecânico, motor, tique, tensão, subida),
de 3 a 4 versões cada. Fontes: Kenney.nl e OpenGameArt (via Open Game SFX Index no GitHub) e o pacote
`uisfx` do npm, todas CC0, sem chave e sem custo. Origem de cada arquivo em `public/sfx/creditos.json`.
Nos vídeos, use `sfx('whoosh', n)` de `src/sfx.ts`, variando `n`.

## Visual "cinema" (drei + pós-processamento)

`<Palco cinema>` liga: contorno preto nos personagens (estilo desenho), reflexos suaves (Environment com
Lightformers, sem baixar nada), brilho nas luzes (Bloom) e vinheta. Desligado por padrão, então os vídeos
antigos não mudam. Comparação em `roteiro/comparacao-visual-cinema.png`.

## Músicas livres

`python3 scripts/biblioteca-musicas.py` baixa trilhas da Wikimedia Commons (CC0, domínio público ou CC BY)
para `public/musicas/<categoria>/`, respeitando o limite de downloads deles (rode de novo para continuar).
A linha de crédito para a descrição do vídeo fica em `public/musicas/creditos.json`.

## Voz expressiva

O Vibi aceita o modelo `eleven_v3` com marcações de emoção no texto (`[curious]`, `[gasps]`, `[laughs]`…),
pelo mesmo preço por caractere. As marcações não são faladas.
