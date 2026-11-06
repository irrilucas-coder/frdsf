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
