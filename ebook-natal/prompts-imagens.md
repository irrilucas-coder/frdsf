# Prompts para as imagens do e-book

Todos os prompts usam o **mesmo bloco de estilo** no final. É isso que garante que as 21 fotos pareçam da mesma sessão de fotos. Não altere esse bloco entre uma imagem e outra.

## Como usar

1. Copie o prompt de cada imagem e gere na sua IA de imagem (Midjourney, DALL·E, Ideogram, Leonardo, Gemini etc.).
2. Formato: **receitas em paisagem 3:2** (ex.: 1800 x 1200 px) e **capa em 5:4** (ex.: 2000 x 1600 px). O prato deve ficar no centro, com um pouco de espaço em volta, porque as bordas podem ser cortadas no layout.
3. Salve na pasta `imagens/` com o nome exato indicado (ex.: `receita-01.jpg`). Também aceita `.png` ou `.webp` com o mesmo nome.
4. Rode `python3 gerar_pdf.py` e o PDF sai com as fotos.

**Se a sua IA aceitar prompt negativo**, use:

> text, letters, watermark, logo, people, hands, cartoon, illustration, plastic look, oversaturated colors, cluttered table

**Dica de consistência:** gere primeiro a capa ou a receita 01, escolha a que mais gostar e, se a ferramenta permitir, use-a como imagem de referência de estilo (Midjourney: `--sref`; outras: "style reference") para todas as outras.

**Bloco de estilo (já incluído em cada prompt abaixo):**

> professional food photography, photorealistic, soft natural window light from the left, warm and cozy Brazilian Christmas table, cream linen tablecloth, dark red and olive green napkins, small gold Christmas ornaments and pine sprigs as props, warm out-of-focus string lights in the background, shallow depth of field, 45-degree camera angle, rich warm tones, elegant editorial cookbook style, high detail

---

## capa.jpg

Formato: 5:4 (paisagem)

```
A festive view of a complete Brazilian Christmas dinner table: a golden roasted turkey in the center on a white platter with orange slices and rosemary, a glazed tender ham with pineapple, bowls of colorful Christmas rice, farofa and potato salad, a chocolate trifle and a panettone, glasses of red fruit punch, candles glowing, professional food photography, photorealistic, soft natural window light from the left, warm and cozy Brazilian Christmas table, cream linen tablecloth, dark red and olive green napkins, small gold Christmas ornaments and pine sprigs as props, warm out-of-focus string lights in the background, shallow depth of field, 45-degree camera angle, rich warm tones, elegant editorial cookbook style, high detail --ar 5:4
```

## receita-01.jpg — Peru Assado com Manteiga de Ervas

Formato: 3:2 (paisagem)

```
A whole golden roasted turkey on a large white porcelain platter, glossy crisp skin, garnished with orange slices, fresh rosemary sprigs and green grapes, professional food photography, photorealistic, soft natural window light from the left, warm and cozy Brazilian Christmas table, cream linen tablecloth, dark red and olive green napkins, small gold Christmas ornaments and pine sprigs as props, warm out-of-focus string lights in the background, shallow depth of field, 45-degree camera angle, rich warm tones, elegant editorial cookbook style, high detail --ar 3:2
```

## receita-02.jpg — Tender Glaceado com Abacaxi

Formato: 3:2 (paisagem)

```
A glazed Brazilian Christmas tender ham with a diamond-scored surface studded with cloves, shiny caramelized glaze, pineapple rings and red cherries around it on a wooden board, professional food photography, photorealistic, soft natural window light from the left, warm and cozy Brazilian Christmas table, cream linen tablecloth, dark red and olive green napkins, small gold Christmas ornaments and pine sprigs as props, warm out-of-focus string lights in the background, shallow depth of field, 45-degree camera angle, rich warm tones, elegant editorial cookbook style, high detail --ar 3:2
```

## receita-03.jpg — Lombo Suíno ao Molho de Laranja

Formato: 3:2 (paisagem)

```
Sliced roasted pork loin with golden edges and juicy center, glossy orange sauce drizzled over it, fresh orange slices and rosemary on an oval ceramic platter, professional food photography, photorealistic, soft natural window light from the left, warm and cozy Brazilian Christmas table, cream linen tablecloth, dark red and olive green napkins, small gold Christmas ornaments and pine sprigs as props, warm out-of-focus string lights in the background, shallow depth of field, 45-degree camera angle, rich warm tones, elegant editorial cookbook style, high detail --ar 3:2
```

## receita-04.jpg — Pernil Assado de Festa

Formato: 3:2 (paisagem)

```
A large roasted pork leg with crackling golden-brown skin in a rustic roasting pan with its juices, bay leaves and roasted garlic, one part sliced to show tender meat, professional food photography, photorealistic, soft natural window light from the left, warm and cozy Brazilian Christmas table, cream linen tablecloth, dark red and olive green napkins, small gold Christmas ornaments and pine sprigs as props, warm out-of-focus string lights in the background, shallow depth of field, 45-degree camera angle, rich warm tones, elegant editorial cookbook style, high detail --ar 3:2
```

## receita-05.jpg — Bacalhoada de Forno com Batatas

Formato: 3:2 (paisagem)

```
A Portuguese-Brazilian baked codfish casserole (bacalhoada) in a rustic oval clay dish, large flakes of salt cod over sliced potatoes, onions, red and yellow peppers, black olives and quartered boiled eggs, glistening olive oil, professional food photography, photorealistic, soft natural window light from the left, warm and cozy Brazilian Christmas table, cream linen tablecloth, dark red and olive green napkins, small gold Christmas ornaments and pine sprigs as props, warm out-of-focus string lights in the background, shallow depth of field, 45-degree camera angle, rich warm tones, elegant editorial cookbook style, high detail --ar 3:2
```

## receita-06.jpg — Arroz Natalino Colorido

Formato: 3:2 (paisagem)

```
A white ceramic bowl of fluffy Brazilian Christmas rice with golden raisins, cashew nuts, diced carrots, green peas and corn, sprinkled with chopped parsley, professional food photography, photorealistic, soft natural window light from the left, warm and cozy Brazilian Christmas table, cream linen tablecloth, dark red and olive green napkins, small gold Christmas ornaments and pine sprigs as props, warm out-of-focus string lights in the background, shallow depth of field, 45-degree camera angle, rich warm tones, elegant editorial cookbook style, high detail --ar 3:2
```

## receita-07.jpg — Farofa Rica de Natal

Formato: 3:2 (paisagem)

```
A rustic wooden bowl of golden Brazilian cassava flour farofa with crispy bacon bits, sliced sausage, scrambled egg pieces, green olives and fresh chives, professional food photography, photorealistic, soft natural window light from the left, warm and cozy Brazilian Christmas table, cream linen tablecloth, dark red and olive green napkins, small gold Christmas ornaments and pine sprigs as props, warm out-of-focus string lights in the background, shallow depth of field, 45-degree camera angle, rich warm tones, elegant editorial cookbook style, high detail --ar 3:2
```

## receita-08.jpg — Salpicão de Frango Cremoso

Formato: 3:2 (paisagem)

```
A glass bowl of creamy Brazilian chicken salad (salpicao) with shredded chicken, grated carrot, corn, green apple cubes and raisins, topped with a generous layer of crispy shoestring potatoes, professional food photography, photorealistic, soft natural window light from the left, warm and cozy Brazilian Christmas table, cream linen tablecloth, dark red and olive green napkins, small gold Christmas ornaments and pine sprigs as props, warm out-of-focus string lights in the background, shallow depth of field, 45-degree camera angle, rich warm tones, elegant editorial cookbook style, high detail --ar 3:2
```

## receita-09.jpg — Maionese de Batata da Vovó

Formato: 3:2 (paisagem)

```
A white porcelain bowl of Brazilian potato salad with mayonnaise, diced potatoes and carrots, green peas, chopped parsley, decorated with boiled egg slices on top, professional food photography, photorealistic, soft natural window light from the left, warm and cozy Brazilian Christmas table, cream linen tablecloth, dark red and olive green napkins, small gold Christmas ornaments and pine sprigs as props, warm out-of-focus string lights in the background, shallow depth of field, 45-degree camera angle, rich warm tones, elegant editorial cookbook style, high detail --ar 3:2
```

## receita-10.jpg — Batata Gratinada Cremosa

Formato: 3:2 (paisagem)

```
A creamy potato gratin in a white rectangular baking dish, thin potato layers with bubbling melted cheese and a golden-brown crust, one portion removed to show the creamy layers, professional food photography, photorealistic, soft natural window light from the left, warm and cozy Brazilian Christmas table, cream linen tablecloth, dark red and olive green napkins, small gold Christmas ornaments and pine sprigs as props, warm out-of-focus string lights in the background, shallow depth of field, 45-degree camera angle, rich warm tones, elegant editorial cookbook style, high detail --ar 3:2
```

## receita-11.jpg — Pavê de Chocolate da Família

Formato: 3:2 (paisagem)

```
A glass trifle dish of Brazilian chocolate pave showing neat layers of cookies and vanilla cream, topped with glossy chocolate ganache and chocolate shavings, one spoonful served on a small plate, professional food photography, photorealistic, soft natural window light from the left, warm and cozy Brazilian Christmas table, cream linen tablecloth, dark red and olive green napkins, small gold Christmas ornaments and pine sprigs as props, warm out-of-focus string lights in the background, shallow depth of field, 45-degree camera angle, rich warm tones, elegant editorial cookbook style, high detail --ar 3:2
```

## receita-12.jpg — Rabanada Cremosa (Frita ou Assada)

Formato: 3:2 (paisagem)

```
A stack of golden Brazilian rabanadas (French toast slices from baguette) coated in cinnamon sugar on a vintage plate, cinnamon sticks beside them, professional food photography, photorealistic, soft natural window light from the left, warm and cozy Brazilian Christmas table, cream linen tablecloth, dark red and olive green napkins, small gold Christmas ornaments and pine sprigs as props, warm out-of-focus string lights in the background, shallow depth of field, 45-degree camera angle, rich warm tones, elegant editorial cookbook style, high detail --ar 3:2
```

## receita-13.jpg — Torta de Limão com Merengue

Formato: 3:2 (paisagem)

```
A lemon meringue pie on a cake stand with tall toasted swirled meringue peaks, one slice cut to show the pale yellow lemon filling and crumbly cookie crust, fresh limes beside it, professional food photography, photorealistic, soft natural window light from the left, warm and cozy Brazilian Christmas table, cream linen tablecloth, dark red and olive green napkins, small gold Christmas ornaments and pine sprigs as props, warm out-of-focus string lights in the background, shallow depth of field, 45-degree camera angle, rich warm tones, elegant editorial cookbook style, high detail --ar 3:2
```

## receita-14.jpg — Panetone Recheado de Brigadeiro

Formato: 3:2 (paisagem)

```
A filled Brazilian panettone with the top cut off, a slice removed revealing a thick creamy chocolate brigadeiro filling, glossy chocolate glaze dripping down the sides, gold sprinkles, professional food photography, photorealistic, soft natural window light from the left, warm and cozy Brazilian Christmas table, cream linen tablecloth, dark red and olive green napkins, small gold Christmas ornaments and pine sprigs as props, warm out-of-focus string lights in the background, shallow depth of field, 45-degree camera angle, rich warm tones, elegant editorial cookbook style, high detail --ar 3:2
```

## receita-15.jpg — Delícia Gelada de Abacaxi com Coco

Formato: 3:2 (paisagem)

```
A layered chilled pineapple and coconut dessert in a clear glass dish, golden caramelized pineapple layer, white coconut cream and whipped cream topping sprinkled with toasted coconut flakes, a square portion served beside it, professional food photography, photorealistic, soft natural window light from the left, warm and cozy Brazilian Christmas table, cream linen tablecloth, dark red and olive green napkins, small gold Christmas ornaments and pine sprigs as props, warm out-of-focus string lights in the background, shallow depth of field, 45-degree camera angle, rich warm tones, elegant editorial cookbook style, high detail --ar 3:2
```

## receita-16.jpg — Patê Cremoso de Ricota com Ervas

Formato: 3:2 (paisagem)

```
A small ceramic bowl of creamy white ricotta herb dip drizzled with olive oil and topped with fresh herbs, surrounded by golden toasts on a wooden board, professional food photography, photorealistic, soft natural window light from the left, warm and cozy Brazilian Christmas table, cream linen tablecloth, dark red and olive green napkins, small gold Christmas ornaments and pine sprigs as props, warm out-of-focus string lights in the background, shallow depth of field, 45-degree camera angle, rich warm tones, elegant editorial cookbook style, high detail --ar 3:2
```

## receita-17.jpg — Bolinho de Bacalhau Sequinho

Formato: 3:2 (paisagem)

```
A pile of golden crispy Portuguese-style codfish fritters (bolinhos de bacalhau) in a ceramic bowl lined with paper, lemon wedges and parsley, one fritter broken open showing flaky cod, professional food photography, photorealistic, soft natural window light from the left, warm and cozy Brazilian Christmas table, cream linen tablecloth, dark red and olive green napkins, small gold Christmas ornaments and pine sprigs as props, warm out-of-focus string lights in the background, shallow depth of field, 45-degree camera angle, rich warm tones, elegant editorial cookbook style, high detail --ar 3:2
```

## receita-18.jpg — Bruschetta nas Cores do Natal

Formato: 3:2 (paisagem)

```
Italian-style bruschetta on toasted baguette slices topped with diced red tomatoes, fresh green basil leaves and small white cheese cubes, arranged on a long rectangular slate or wooden board, professional food photography, photorealistic, soft natural window light from the left, warm and cozy Brazilian Christmas table, cream linen tablecloth, dark red and olive green napkins, small gold Christmas ornaments and pine sprigs as props, warm out-of-focus string lights in the background, shallow depth of field, 45-degree camera angle, rich warm tones, elegant editorial cookbook style, high detail --ar 3:2
```

## receita-19.jpg — Ponche de Frutas sem Álcool

Formato: 3:2 (paisagem)

```
A large clear glass punch bowl filled with red grape fruit punch, floating diced peaches, apples, grapes, pineapple and orange slices, mint leaves, a ladle and glasses beside it, professional food photography, photorealistic, soft natural window light from the left, warm and cozy Brazilian Christmas table, cream linen tablecloth, dark red and olive green napkins, small gold Christmas ornaments and pine sprigs as props, warm out-of-focus string lights in the background, shallow depth of field, 45-degree camera angle, rich warm tones, elegant editorial cookbook style, high detail --ar 3:2
```

## receita-20.jpg — Chá Gelado de Hibisco, Laranja e Canela

Formato: 3:2 (paisagem)

```
A tall glass pitcher and two glasses of deep ruby-red iced hibiscus tea with orange slices, cinnamon sticks, ice cubes and mint, dried hibiscus flowers scattered on the table, professional food photography, photorealistic, soft natural window light from the left, warm and cozy Brazilian Christmas table, cream linen tablecloth, dark red and olive green napkins, small gold Christmas ornaments and pine sprigs as props, warm out-of-focus string lights in the background, shallow depth of field, 45-degree camera angle, rich warm tones, elegant editorial cookbook style, high detail --ar 3:2
```

---

*O final `--ar 3:2` / `--ar 5:4` é o formato no Midjourney. Em outras ferramentas, apague esse trecho e escolha o formato na tela da própria ferramenta.*
