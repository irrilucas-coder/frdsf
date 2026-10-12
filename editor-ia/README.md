# Editor IA — edição automática de UGC no estilo da casa

Objetivo: receber um UGC bruto e devolver o vídeo editado do mesmo jeito que é feito à mão no CapCut
(cortes, zooms, legendas, sobreposições, tela dividida, B-roll gerado com Seedance 2.0 pela Kie.ai).

## Etapas
1. **Aprender o estilo** ← estamos aqui
   Pares antes/depois em `exemplos/aura-fresh/`. Rode:
   ```bash
   node editor-ia/analisar.js
   ```
   Gera em `editor-ia/analise/` (fora do git): ritmo dos cortes, duração dos planos, quanto do bruto foi
   aproveitado, pausas removidas, volume, mosaicos e um quadro de cada plano para revisão visual.
   Com isso + a revisão dos quadros sai o **guia de estilo**.
2. **Plano de edição**: o agente lê o UGC novo (quadros + transcrição), identifica o ângulo
   (bafo, cecê, chulé, geral) e monta a timeline seguindo o guia de estilo e `produtos/aura-fresh.md`.
3. **Cenas extras**: gera o B-roll que faltar no Seedance 2.0, usando a foto do produto como referência.
4. **Render**: monta o vídeo final em 9:16.

## Arquivos
- `produtos/aura-fresh.md` — o que é o produto, ângulos, ganchos, cuidados com promessas e prompts de B-roll
- `analisar.js` — análise dos pares antes/depois (precisa de ffmpeg)
