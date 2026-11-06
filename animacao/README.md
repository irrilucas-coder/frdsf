# Animação de Shorts (sem IA de vídeo)

Tudo aqui é animação feita em código: personagens de blocos, cenários, câmera, gestos, legendas e efeitos.
O vídeo sai sempre **vertical 1080x1920**, a partir de um tema ou de um roteiro.

```
tema/roteiro ──► Claude Haiku (escreve o roteiro e dirige as cenas)
            ──► ElevenLabs (vozes com o tempo de cada palavra)
            ──► motor 3D (three.js no Chromium, quadro a quadro)
            ──► ffmpeg (MP4 com voz, efeitos sonoros e legenda palavra por palavra)
```

## Uso

```bash
cd animacao && npm install                        # uma vez
node vozes.mjs                                     # lista as vozes da ElevenLabs
node vozes.mjs narrador=ID_DA_VOZ nina=ID tito=ID  # escolhe quem fala com qual voz

node produzir.mjs --tema "Por que o céu é azul?"   # o Haiku cria o roteiro e a direção
node produzir.mjs --roteiro roteiros/meu.txt        # o Haiku só dirige o seu roteiro
node produzir.mjs --direcao arquivo.direcao.json    # usa uma direção pronta (sem Haiku)
#   --sem-voz  testa sem ElevenLabs   --rapido  prévia em 540x960   --nativo  desenha direto em 1080p
```

O resultado fica em `saida/<nome>/<nome>.mp4`, junto com a direção (`direcao.json`), o episódio do motor e as falas em MP3.

## Chaves
- `ANTHROPIC_API_KEY`: console.anthropic.com. O Haiku 5.5 custa US$ 0,10 por milhão de tokens de entrada e US$ 0,50 por milhão de saída, o que dá menos de 1 centavo de dólar por vídeo.
- `ELEVENLABS_API_KEY`: elevenlabs.io → Profile → API Keys. O plano gratuito tem uma cota mensal de caracteres; um vídeo de 1 minuto usa cerca de 1.000.

No ambiente de nuvem do Claude Code, as chaves ficam salvas como *network secrets* do ambiente e são injetadas automaticamente.

## O que existe

**Elenco** (`biblioteca/personagens.json`): Tito (protagonista), Dra. Nina (cientista), Duda, Vô Zeca, Bit (robô), Pipoca (cachorro),
mãe, pai, Professor Caio, Seu Jorge (mestre de obras), Lia e Rei Otávio. Personagens que não estão na lista viram figurantes automáticos.
12 expressões, mais de 20 gestos (acenar, apontar, pensar, susto, comemorar, dançar…), andar, correr e pular.

**Cenários** (`engine/cenarios.js`, `engine/cidade.js`):
- Peças separadas: `rua_trecho`, `cruzamento` (com semáforos funcionando), `faixa_pedestre`, `avenida`, `posto_gasolina`, `ponto_onibus`, `garagem_veiculos`
- Mapa grande: `cidade` (bairros de casas, prédios, comércio, arranha-céus, praça, parque, obra, posto e escola, com trânsito)
- Outros: `rua_bairro`, `centro_cidade`, `canteiro_obras`, `parque`, `quarto`, `escola_sala`, `laboratorio`, `estudio` (com telão)
- Hora do dia em qualquer cenário externo: `amanhecer`, `manha`, `meio_dia`, `tarde`, `por_do_sol`, `noite` (estrelas, lua e luzes acesas)

**Veículos** (`engine/veiculos.js`): sedan, hatch, SUV, picape, táxi, polícia, ambulância, van, ônibus, caminhão baú,
caminhão betoneira, moto, bicicleta e carrinho de sorvete.

**Na tela**: título, cartão de fato com número contando, placa presa no personagem, ícones, balão de fala, seta, pergunta final,
botão "inscreva-se" animado, flash, vinheta e legenda palavra por palavra com destaque.

## Formato do episódio
`episodios/*.json` descreve cenas, atores, eventos (andar, gesto, expressão…), câmera (close/médio/geral, zoom, órbita, tremor) e HUD.
`produzir.mjs` gera esse arquivo sozinho. Para editar à mão, veja `episodios/teste-movimento.json`.
Para conferir um quadro sem renderizar tudo: `node render.js episodios/x.json --foto 3.5`.
