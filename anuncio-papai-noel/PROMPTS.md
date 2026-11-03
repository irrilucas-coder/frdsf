# Anúncio Papai Noel — Vídeo personalizado para crianças

**Ferramentas:** Nano Banana (imagem de referência) → Flow / Gemini Omni Flash (vídeo, usando a imagem como *ingrediente*)\
**Formato:** 9:16 vertical (Reels/Stories/Feed Meta) · 4 cenas de ~8 s · total ≈ 32 s\
**Idioma da fala:** português do Brasil

> Os prompts estão em inglês porque o modelo segue melhor as instruções visuais assim. As falas ficam em português, entre aspas, e o modelo vai falar exatamente aquele texto.

---

## Roteiro (cerca de 18–20 palavras por cena, que cabem em 8 s com ritmo natural)

| Cena | Função | Fala do Papai Noel |
|---|---|---|
| 1 | Gancho | "Ho, ho, ho! Papai e mamãe, sou eu, o Papai Noel! Este Natal, eu quero gravar um vídeo só pro seu filho." |
| 2 | Oferta | "Eu falo o nome dele, conto que ele se comportou muito bem... e deixo uma mensagem que ele nunca vai esquecer." |
| 3 | Escassez | "Mas atenção: as vagas na minha oficina são limitadas! Quem garantir agora recebe o vídeo antes do Natal." |
| 4 | Chamada | "Chama o Jonathan no WhatsApp, clica no botão aqui embaixo e faz o seu pedido. Te espero! Ho, ho, ho!" |

---

## PASSO 1 — Imagem de referência (Nano Banana)

Gere primeiro a ficha do personagem. Depois gere **também um retrato frontal isolado** (prompt 1B): ele costuma funcionar melhor como ingrediente principal no Flow, e a ficha de personagem entra como ingrediente secundário.

### 1A — Ficha de personagem (frente, perfil, costas, 3/4)

```
Ultra-photorealistic professional character reference sheet of an authentic, traditional Santa Claus, shot like a high-end commercial casting photo. Four full-body views of the SAME man side by side on a seamless neutral light-grey studio backdrop, evenly spaced, identical scale, identical lighting: (1) front view, (2) three-quarter view, (3) left side profile, (4) back view. Standing relaxed, arms slightly away from the body so the costume details are visible.

THE MAN: Caucasian man in his late 60s, warm and kind face, rosy cheeks and nose with natural capillaries, deep smile lines and crow's feet, light-blue twinkling eyes, natural skin texture with visible pores, fine wrinkles, subtle age spots, no plastic or airbrushed look. Thick, real, full white beard reaching mid-chest, softly wavy, natural silver-white with slight creamy tones and individual strands visible, neatly groomed moustache curling slightly at the ends. Real white hair, shoulder-length, soft waves. Bushy white eyebrows. Round, sturdy, jolly build with a genuine natural belly. Small round gold wire-rimmed spectacles resting low on the nose.

THE COSTUME: Deep cardinal-red crushed velvet coat (rich crimson, not orange, not pink), knee-length, with plush, dense ivory-white faux-fur trim on the cuffs, hem and front opening, fur fibres clearly visible. Wide black genuine-leather belt with a soft matte sheen and a large antique brushed-gold rectangular buckle. Matching red velvet trousers. Tall black polished leather boots with subtle creases and white fur cuffs at the top. White cotton gloves tucked into the belt. Classic red velvet stocking cap with thick white fur brim and a white fur pom-pom falling to the right side. Back view shows the coat's seamless back panel, the belt continuing around, the cap's pom-pom and the hair falling over the collar.

PHOTOGRAPHY: Shot on a full-frame camera, 85mm lens, f/8, soft large-softbox key light from front-left, gentle fill, subtle rim light, true-to-life colours, 8K detail, sharp focus on all four views. Consistent identity, proportions and costume across every view. No text, no labels, no watermark, no extra people, no props, no cartoon or CGI style, no distortion, anatomically correct hands with five fingers.
```

### 1B — Retrato frontal (ingrediente principal)

```
Ultra-photorealistic medium close-up portrait of the same authentic traditional Santa Claus: late 60s, warm kind face, rosy cheeks, light-blue twinkling eyes, natural skin texture with pores and fine wrinkles, thick full real white wavy beard to mid-chest with individual strands visible, curled moustache, small round gold wire-rimmed spectacles, deep cardinal-red crushed velvet coat with dense ivory faux-fur trim, wide black leather belt with antique gold buckle, red velvet stocking cap with white fur brim and pom-pom. Facing the camera, gentle genuine smile, mouth slightly open as if about to speak. Seated in a cozy, luxurious modern Christmas living room: tall decorated Christmas tree with warm white lights and red and gold ornaments, stone fireplace with crackling fire, wrapped gifts, soft bokeh fairy lights. Warm golden cinematic lighting, 85mm lens, f/2.0, shallow depth of field, 8K, true-to-life colours, Netflix-level production quality. Vertical 9:16. No text, no watermark, no cartoon, no CGI look, no distortion.
```

---

## PASSO 2 — Vídeos (Flow · Omni Flash)

**Configuração em cada cena:**
- Modelo: Omni Flash · Proporção: **9:16** · Duração: 8 s (ou 10 s, com corte em 8 s na edição)
- Ingredientes: **retrato 1B** + **ficha 1A** (sempre os mesmos nas 4 cenas)
- Gere 4 variações por cena e escolha a que tiver melhor sincronia labial e voz
- Para manter a mesma voz: depois de aprovar a cena 1, use o áudio/clipe dela como referência nas cenas seguintes, se o Flow deixar. Mantenha sempre a mesma descrição de voz.

**Bloco fixo (já incluído em todos os prompts abaixo):** identidade, cenário, luz e voz são descritos do mesmo jeito em todas as cenas, para manter a continuidade.

### CENA 1 — Gancho (0–8 s)

```
Use the reference images as the exact identity, face, beard, glasses and costume of Santa Claus. Keep him 100% consistent with the references.

SCENE: Ultra-photorealistic cinematic Christmas commercial, vertical 9:16. A cozy, luxurious modern living room on Christmas Eve: tall Christmas tree with warm white lights and red and gold ornaments behind him on the left, stone fireplace with a gently crackling fire on the right, wrapped gifts, soft golden fairy-light bokeh, light snow falling outside a large window. Warm golden key light, soft fill, subtle rim light on the beard.

ACTION: Santa sits in a large deep-red leather armchair. The shot opens on a slow push-in from medium shot to medium close-up. He looks up from a big leather-bound book of children's names, closes it gently on his lap, smiles warmly, looks straight into the camera and speaks with a friendly wave of his right hand on "Ho, ho, ho!" and then leans slightly toward the viewer.

DIALOGUE (Brazilian Portuguese, natural Brazilian accent, perfect lip-sync): "Ho, ho, ho! Papai e mamãe, sou eu, o Papai Noel! Este Natal, eu quero gravar um vídeo só pro seu filho."

VOICE: deep, warm, slightly raspy grandfatherly baritone, joyful and gentle, unhurried but energetic delivery.
AUDIO: soft crackling fireplace, faint sleigh bells, very low gentle Christmas music bed under the voice.

STYLE: real-life footage, 35mm film look, shallow depth of field, natural skin texture and beard strands, realistic eye blinks and micro-expressions, natural hand anatomy. No text on screen, no subtitles, no watermark, no distortion, no morphing, no extra people, no cartoon or CGI look.
```

### CENA 2 — Oferta (8–16 s)

```
Use the reference images as the exact identity, face, beard, glasses and costume of Santa Claus. Keep him 100% consistent with the references and with the previous scene.

SCENE: Same cozy luxurious Christmas living room, same red leather armchair, same Christmas tree, fireplace, warm golden lighting and falling snow outside, vertical 9:16.

ACTION: Continuous from the previous shot. Camera slowly arcs slightly to the right, medium close-up. Santa opens the leather-bound book of names again, runs his gloved finger down a handwritten page as if finding a child's name, then lifts his gaze back to the camera with a proud, tender expression, touches his heart with his right hand on "uma mensagem", and gives a gentle wink at the end.

DIALOGUE (Brazilian Portuguese, natural Brazilian accent, perfect lip-sync): "Eu falo o nome dele, conto que ele se comportou muito bem... e deixo uma mensagem que ele nunca vai esquecer."

VOICE: same deep, warm, slightly raspy grandfatherly baritone as before, affectionate and heartfelt.
AUDIO: soft crackling fireplace, page-turn sound, very low gentle Christmas music bed.

STYLE: real-life footage, 35mm film look, shallow depth of field, natural skin texture and beard strands, realistic blinks and micro-expressions, natural hand anatomy, readable but unspecific handwriting in the book. No on-screen text, no subtitles, no watermark, no distortion, no morphing, no extra people, no cartoon or CGI look.
```

### CENA 3 — Escassez (16–24 s)

```
Use the reference images as the exact identity, face, beard, glasses and costume of Santa Claus. Keep him 100% consistent with the references and with the previous scenes.

SCENE: Santa's workshop corner adjoining the same cozy living room: wooden workbench with handcrafted wooden toys, ribbons and wrapped gifts, shelves of presents, warm string lights, the decorated Christmas tree glowing softly in the background, warm golden lighting, vertical 9:16.

ACTION: Santa stands beside the workbench, medium shot slowly pushing in to medium close-up. He raises his right index finger in a playful "attention" gesture, eyebrows raised, then gestures toward a short stack of beautifully wrapped gift boxes (only a few left) and taps the top box, then returns his eyes to the camera with an encouraging, urgent-but-kind expression.

DIALOGUE (Brazilian Portuguese, natural Brazilian accent, perfect lip-sync): "Mas atenção: as vagas na minha oficina são limitadas! Quem garantir agora recebe o vídeo antes do Natal."

VOICE: same deep, warm, slightly raspy grandfatherly baritone, a little more energetic and urgent, still friendly.
AUDIO: soft workshop ambience, a tiny bell jingle on "atenção", low upbeat Christmas music bed.

STYLE: real-life footage, 35mm film look, shallow depth of field, natural skin texture and beard strands, realistic blinks and micro-expressions, natural hand anatomy with five fingers. No on-screen text, no subtitles, no watermark, no distortion, no morphing, no extra people, no cartoon or CGI look.
```

### CENA 4 — Chamada para ação (24–32 s)

```
Use the reference images as the exact identity, face, beard, glasses and costume of Santa Claus. Keep him 100% consistent with the references and with the previous scenes.

SCENE: Back in the same cozy luxurious Christmas living room in front of the glowing Christmas tree and fireplace, warm golden lighting, snow falling outside the window, vertical 9:16.

ACTION: Santa stands facing the camera, medium close-up. He holds a modern smartphone in his left gloved hand, screen facing away from the camera, and taps it with his right finger. Then he points downward toward the bottom of the frame with his right hand on "aqui embaixo", smiles broadly, opens his arms in a warm welcoming gesture, places his hands on his belly and laughs a hearty "Ho, ho, ho!" at the end. Camera slowly pulls back slightly for the final laugh, leaving clean space in the lower third of the frame.

DIALOGUE (Brazilian Portuguese, natural Brazilian accent, perfect lip-sync): "Chama o Jonathan no WhatsApp, clica no botão aqui embaixo e faz o seu pedido. Te espero! Ho, ho, ho!"

VOICE: same deep, warm, slightly raspy grandfatherly baritone, inviting and joyful, hearty belly laugh at the end.
AUDIO: soft crackling fireplace, sleigh bells swelling on the final laugh, gentle Christmas music bed rising slightly at the end.

STYLE: real-life footage, 35mm film look, shallow depth of field, natural skin texture and beard strands, realistic blinks and micro-expressions, natural hand anatomy with five fingers, phone screen not visible. No on-screen text, no subtitles, no logos, no watermark, no distortion, no morphing, no extra people, no cartoon or CGI look.
```

---

## PASSO 3 — Edição e montagem

1. Corte cada clipe em ~8 s, começando no primeiro movimento útil (tire o "respiro" morto do início).
2. Use transições curtas (crossfade de 4–6 frames) ou cortes secos entre as cenas. As cenas 1, 2 e 4 são no mesmo cenário, então o corte seco fica natural.
3. **Legendas queimadas** no vídeo (a maioria vê no mudo): fonte branca com contorno, palavras-chave em vermelho ("vídeo só pro seu filho", "nome dele", "VAGAS LIMITADAS", "WhatsApp").
4. **Texto da cena 4** colocado na edição, no terço inferior que ficou livre: ícone do WhatsApp + "Fale com o Jonathan" + número. Não peça para a IA escrever o número; ela costuma errar texto.
5. Selo "VAGAS LIMITADAS" piscando de leve na cena 3.
6. Música de fundo uniforme por baixo de tudo, para esconder pequenas diferenças de áudio entre as cenas.
7. Exporte em 1080×1920, 30 fps.

## Sugestão de texto do anúncio (Meta)

> 🎅 Seu filho vai receber um vídeo do Papai Noel falando o NOME dele!
> Uma mensagem personalizada e emocionante, que ele vai guardar para sempre. ❤️
> ⚠️ Vagas limitadas: garanta antes do Natal.
> 👉 Clique em "Enviar mensagem" e fale com o Jonathan no WhatsApp.

**Objetivo de campanha sugerido:** Engajamento → Mensagens (WhatsApp), botão "Enviar mensagem".

## Dicas para realismo máximo

- Se o rosto variar entre as cenas, regenere usando só o retrato 1B como ingrediente e reforce: "same face as reference, no changes".
- Se a boca não sincronizar, encurte a fala em 2–3 palavras. O ritmo vale mais que a frase completa.
- Para corrigir um detalhe, edite só a parte do prompt que causa o problema (ex.: "slower hand movement") em vez de reescrever tudo.
- Evite closes extremos nas mãos; mãos ainda são o ponto mais fraco.
