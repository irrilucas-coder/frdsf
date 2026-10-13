# Editor IA — edição automática de UGC no estilo da casa

Objetivo: receber um UGC bruto e devolver o vídeo editado do mesmo jeito que é feito à mão no CapCut
(cortes, zooms, legendas, sobreposições, tela dividida, B-roll gerado com Seedance 2.0 pela Kie.ai).

## Etapas
1. **Aprender o estilo** ✅ (1º par analisado, ver `estilo/aura-fresh.md`)
   Pares antes/depois em `exemplos/aura-fresh/`. Rode:
   ```bash
   node editor-ia/analisar.js
   ```
   Gera em `editor-ia/analise/` (fora do git): ritmo dos cortes, duração dos planos, quanto do bruto foi
   aproveitado, pausas removidas, volume, mosaicos e um quadro de cada plano para revisão visual.
   Com isso + a revisão dos quadros sai o **guia de estilo**.
2. **Plano de edição** ← próximo: o agente lê o UGC novo (quadros + transcrição), identifica o ângulo
   (bafo, cecê, chulé, geral) e monta a timeline seguindo o guia de estilo e `produtos/aura-fresh.md`.
3. **Cenas extras**: gera o B-roll que faltar no Seedance 2.0, usando a foto do produto como referência.
4. **Render**: monta o vídeo final em 9:16.

## Arquivos
- `produtos/aura-fresh.md` — o que é o produto, ângulos, ganchos, cuidados com promessas e prompts de B-roll
- `estilo/aura-fresh.md` — guia de estilo aprendido dos exemplos (regras + mapa do vídeo 01-bafo)
- `analisar.js` — análise dos pares antes/depois (precisa de ffmpeg)
- `transcrever.py` — transcreve a fala do vídeo liso em `.srt` com tempos (offline)
- `efeitos.py` — edição "premium" só com efeitos próprios a partir de um `edicao.json`: câmera com borrão de zoom, cartões de vidro,
  título atrás da pessoa e troca de fundo (recorte por IA), anel seguindo o pote, glitch, luz, música e voz tratada
- `sons.py` — efeitos sonoros e trilha sintetizados (sem arquivos externos)
- `montar.py` — monta o vídeo final a partir de um `plano.json` (ver `COMO-USAR.md`)
- `fontes/` — Montserrat (licença OFL) usada nas legendas
