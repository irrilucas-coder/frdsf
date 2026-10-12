# Como usar o Editor IA (fluxo completo)

```
1. Você manda só o vídeo liso (a fala é transcrita automaticamente)
2. O Claude analisa e cria o plano: onde entra cada cena + os prompts + efeitos sonoros
3. Você gera as cenas (Seedance / GPT Image) com os prompts e manda de volta
4. O Claude monta o vídeo final (montar.py) e te entrega
```

## 1. Mandar o vídeo liso
1. Suba o vídeo num Release do GitHub (aceita até 2 GB):
   https://github.com/irrilucas-coder/frdsf/releases/new
   - Tag: o nome do trabalho, ex.: `bafo-02`
   - Arquivo: `bruto.mp4`
2. Avise o Claude: "subi o bafo-02".

## 2. O plano (feito pelo Claude)
Primeiro a fala é transcrita com tempos (`python3 editor-ia/transcrever.py bruto.mp4` → `bruto.srt`, sem internet,
Whisper via sherpa-onnx — instalação no topo do arquivo). Depois o Claude cria a pasta `trabalhos/<nome>/` com:
- `prompts.md` — uma lista numerada de cenas: o que gerar, o prompt pronto para copiar, o formato
  (**9:16** para tela cheia e quadrinho/PiP, **16:9** para tela dividida) e a duração mínima
- `plano.json` — onde cada cena entra, legendas em destaque, seta de CTA e efeitos sonoros

## 3. Gerar e mandar as cenas
Gere cada cena com o prompt dela e salve com o número do `prompts.md`: `c01.mp4`, `c02.mp4`, `c03.png`...
(imagem também serve: ganha um zoom lento automático). Suba no **mesmo Release** do trabalho
(Edit release → arrastar os arquivos → Update release) e avise o Claude.

## 4. Montagem
```bash
python3 editor-ia/montar.py trabalhos/<nome>/plano.json            # final 1080x1920, 50 fps
python3 editor-ia/montar.py trabalhos/<nome>/plano.json --previa   # rascunho rápido 540x960
python3 editor-ia/montar.py trabalhos/<nome>/plano.json --previa --marcadores  # cartões no lugar das cenas que faltam
```
Precisa de ffmpeg e Pillow (`pip install pillow`).

Exemplo completo: `trabalhos/bafo-01-demo/` (plano feito a partir do vídeo liso 01-bafo).

## Formato do plano.json
```json
{
  "bruto": "bruto.mp4",
  "legendas": "bruto.srt",
  "legendas_na_tela": false,
  "destaques": ["bafo", "aura", "fresh"],
  "abertura": true,
  "final_preto": 1.0,
  "cenas": [
    {"id": "c01", "tipo": "cheia",    "inicio": 12.2, "fim": 13.0, "arquivo": "c01.mp4"},
    {"id": "c02", "tipo": "dividida", "inicio": 30.1, "fim": 31.3, "arquivo": "c02.mp4", "inicio_no_clipe": 1.5},
    {"id": "c03", "tipo": "pip",      "inicio": 54.7, "fim": 56.0, "arquivo": "c03.png"}
  ],
  "seta": [{"inicio": 71.4, "fim": 81.5, "posicao": "esquerda"}],
  "sfx": [{"t": 12.2, "som": "whoosh", "volume": 0.6}]
}
```
- `tipo`: `cheia` (cobre a tela), `dividida` (cena 16:9 na parte de baixo, criadora em cima),
  `pip` (cena 9:16 de fundo, criadora no quadro do canto inferior esquerdo)
- `legendas_na_tela`: `false` por padrão — o vídeo sai sem legenda, para você fazer no CapCut.
  O `.srt` serve só para o Claude saber o que é falado e quando. `true` queima as legendas no estilo da casa.
- `destaques`: palavras da legenda que saem em verde-limão em vez de branco
- `sfx`: `whoosh`, `pop`, `ding`, `impacto`, `erro`, `moeda`, `clique`, `subida`.
  Para usar um som seu, ponha `sfx/<nome>.wav` na pasta do trabalho e use esse nome.
- Em vez de `legendas`, dá para passar `"palavras": [{"t": 0.2, "fim": 0.5, "texto": "SE"}, ...]`.
