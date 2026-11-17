# CATÁLOGO COMPLETO: AURA FRESH (PROMPTS PARA O FLOW)

> Complemento do `CLAUDE.md`. Aqui está tudo o que foi feito: blocos-base, decisões do usuário, textos dos roteiros e as cenas criadas (versão final de cada uma).
> Cada cena abaixo é um resumo fiel do prompt final. Para gerar o prompt completo, **prefixe com o bloco-base do tipo** (seção 0) e siga o formato de saída do `CLAUDE.md` (seção 7).

---

## 0. BLOCOS-BASE (PREFIXOS)

**[R] REALISTA**
> Vídeo realista cinematográfico de campanha publicitária premium, 4K, formato 9:16, fotografia high-key clara e vibrante, balanço de branco neutro (cerca de 5500K), sem tom amarelado, sem cena escura e sem vinheta, pele realista, cores fiéis. Pessoas: "mulher brasileira, pele morena clara, cabelo castanho". Câmera estável, foco raso com bokeh cremoso, iluminação de estúdio simulando luz natural. Reações sutis, sem exagero.

**[A] ANATÔMICO 3D**
> Animação médica 3D cinematográfica, estilo infográfico científico premium, altíssima produção, 4K. Figura humana adulta em pé, de frente, anatômica, translúcida e sofisticada, estética de vidro médico fosco, paleta predominantemente azul, silhueta suave e proporções naturais. Superfície lisa e uniforme, sem brilho especular, sem reflexos de espelho, sem aparência de plástico ou vidro polido, luz difusa e homogênea. Fundo azul-marinho profundo e desfocado, gradiente sutil, sem chroma key. Travelling suave e estabilizado, foco raso. Iluminação clínica azulada, volumétrica, highlights em verde-esmeralda só nas partículas. Estética: medical CGI, translucent human body, matte translucent material, high-end CGI. Sem textos, sem setas, sem sangue, sem sujeira, sem fumaça pesada.

**[M] MOTION 3D**
> Motion graphics 3D premium de campanha, 4K, fundo azul-marinho profundo e desfocado com gradiente sutil e partículas de luz suaves, sem chroma key. Cores: azul-marinho de base, verde-esmeralda nos destaques, dourado nos brilhos. Dolly in lento e estável, foco raso. Sem texto (o texto entra na edição, em pt-BR). Quarto inferior do quadro livre e escuro quando for CTA.

**[C] CARTOON 3D**
> Animação 3D estilo cartoon premium (acabamento de filme de animação), 4K, cores vibrantes, iluminação clara, sem chroma key, timing de comédia clássico (antecipação, exagero, reação). Cheiro = ondas grossas ondulantes em verde-amarelado translúcido. Sem sangue, sem nada gráfico, sem terror, sem textos.

---

## 1. DECISÕES E CORREÇÕES DO USUÁRIO (cronológico)

1. Primeiro tudo era chroma key verde. **Depois proibiu:** "chroma key é passado", "enjoa". Padrão passou a ser fundo azul-marinho, corpo e órgãos azuis, efeitos verdes só do produto.
2. Os elementos de cena **não podem ser verdes** quando o fundo era verde (conflita com a remoção). Superado pelo fim do chroma key.
3. "Cecê" = cheiro de **axila/sovaco**, não cocô. Corrigir cenas que associavam errado.
4. Mau cheiro deve ser comunicado **sem fumaça preta**, com formas variadas: opacidade, partículas esféricas definidas, ondas translúcidas, medidor, ícones, comparação.
5. Quer anatomia **mais sutil, corpo mais distante, corpo e órgãos da mesma cor** (azul), nada pesado ou que assuste.
6. O efeito do produto no intestino deve ser **verde, não amarelo/dourado**.
7. Produto é **pó** (não líquido). Pote real: tampa com o logo, corpo com o rótulo. Prefere **compor a foto real** na edição.
8. Pessoas devem ser **brasileiras** (o Flow gerava traços indianos/japoneses e imagem amarelada/escura). Quer cenário "casa de rico", luminoso.
9. **Texto em cena sempre em pt-BR.**
10. Quer ordem de bandeiras **EUA primeiro**; produtos **já existem** nos EUA/Japão/Coreia/Europa, só replicaram a fórmula para o Brasil (não é "novidade/primazia").
11. Efeito do produto é **no corpo, não externo** ("desodorante interno": brilho contido dentro do corpo).
12. "Perfume no caixão" = piada irônica (feita em cartoon).
13. CTA: **sem barra/botão gerado** (o link gera isso automaticamente); seta mais para cima; zona inferior livre.
14. Moedas: **moeda real de R$ 1 do Brasil** (aro dourado, miolo prateado).
15. Abertura anatômica: **ordem parte íntima, axilas, hálito**; corpo feminino; fosco, sem brilho; só passou no Flow em **16:9** (vertical violava). A versão final trata a parte íntima como onda no corpo inteiro.
16. Metrô: efeito **preso a pessoas específicas** (não sobre todos), câmera **mais perto**, metrô chegando ao fundo.
17. Foto do pote: **seguir a referência exata**, logo na tampa, sem mudar nada.
18. Para o roteiro com vídeo da farmacêutica real: as cenas são **cutaways/insets**; descartar prompts de "ela falando".

---

## 2. ROTEIROS (TEXTOS ORIGINAIS)

### R0: Linha do tempo 24 h / 3 dias / 1 semana (primeiro roteiro)
Se uma mulher com hálito matinal tomasse a Aura Fresh diariamente, veja o que aconteceria. Nas primeiras 24 horas, sua flora intestinal desequilibrada começa a se neutralizar. Menos toxinas saem do corpo, então as axilas, os pés, a região íntima e até o hálito dela voltam a ficar frescos. 3 dias depois, o cocô dela começa a ficar esverdeado. É assim que ela sabe que o intestino está sendo curado. A clorofila elimina o odor na raiz, e a salsa desintoxica o corpo. Ao final da primeira semana, o intestino dela está saudável, liberando menos toxinas, então o corpo dela não tem cheiro em lugar nenhum e terá mais confiança para realizar as atividades do dia a dia.

### R1: "Seu bafo tem cheiro de cocô" (namorado e três semanas)
Seu bafo tem cheiro de cocô. Então presta atenção em mim que eu tenho a solução para você. Você pode até não perceber porque a sua boca fica perto do seu nariz e você se acostuma com o cheiro. Mas o seu namorado percebe, os seus amigos do trabalho, percebe? E se eu te falar que isso não é falta de higiene dentro da sua boca? O cheiro ruim, na verdade, ele começa no seu intestino e o problema está dentro do corpo. E resolver isso é muito mais simples do que você imagina. É só você tomar todos os dias de manhã. O Aura Fresh serve para neutralizar todo esse cheiro ruim por dentro do nosso corpo. Eu estou usando tem três semanas e estou tendo resultados incríveis com esse produto. Então, se você quiser testar também, clique aqui no link abaixo e aproveite que eles estão com frete grátis para todo o Brasil.

### R2: "Cecê azedo nunca mais"
Cc azedo nunca mais. Fica aqui comigo que eu vou te mostrar como resolver isso. Tem três semanas que eu estou usando um produto que se chama Aura Fresh. Gente, é um produto natural que você toma todos os dias e ele neutraliza todo esse fedor que nosso corpo produz, porque às vezes é algo que está dentro da gente, né? A gente às vezes tenta mascarar com perfume, com desodorante e não adianta. Logo depois, o mal cheiro, o bafo volta. Gente, isso daqui é a solução. Aura Fresh. E sabe o que é melhor? Eles estão com frete grátis para todo o Brasil, então aproveita e peça o seu!

### R3: "A solução não é isso" (EUA, Japão, Coreia)
Se o seu bafo tem cheiro de cocô, a solução não é isso. Você pode até não perceber que tem bafo, mas o seu nariz já tá acostumado com cheiro, mas o seu namorado percebe. A sua amiga, seus colegas de trabalho também e até gente que te atende na padaria consegue sentir esse cheiro ruim. Se eu te falar que isso não é falta de higiene bucal, você acredita em mim? O cheiro ruim, na verdade, começa lá no seu intestino. Isso mesmo, o problema tá lá dentro do seu corpo e não na sua boca. Resolver isso é mais fácil do que você imagina. Só você usar o desodorante interno Aura Fresh todos os dias. Esse produto é muito usado nos Estados Unidos, no Japão, na Coreia do Sul. Chegou no Brasil tem pouco tempo, mas confie em mim, ele funciona porque eu testei. Ele serve para neutralizar o odor de dentro para fora. Diferente desse daqui que disfarça só por fora. Eu já estou usando já tem três semanas e o resultado tá sendo incrível. Eu fico com uma sensação de frescor o dia inteiro, gente, é muito bom e por isso eu me sinto mais confiante para fazer tudo que eu quero. Então se você quiser testar também, clica aqui nesse link abaixo e garanta o Aura Fresh que tá com frete grátis para todo o Brasil.

### R4: Teste da colher
Amiga, vem cá, você já fez o teste para saber se tem bafo? Pode ser que você esteja incomodando todo mundo com esse bafão e só você não percebeu ainda. Então eu vou te ensinar um teste bem rápido para você descobrir se tem bafo de bicho morto. Você só precisa de uma colher e vai lamber ela muitão. Assim eu fiz isso. Agora é só esperar ela secar um pouquinho e ó. Menina, se tiver fedendo você já sabe. Tem bafão e você não sente normalmente porque o seu nariz já acostumou com esse cheiro. Mas usando esse truque da colher, você consegue enganar o seu nariz e ver a realidade que todo mundo sente. E eu sei que você escova o dente, usa enxaguante bucal, passa fio dental às vezes, né? Mas o problema não tá na boca. O problema começa lá no intestino. É por isso que pasta de dente, enxaguante bucal, nada disso vai funcionar porque você tá tentando arrumar o problema do jeito errado. Eu não tô falando para você parar de escovar os dentes. Estou falando para você tratar o problema pela raiz e é por isso que eu estou usando esse produto aqui. Ele tem uma fórmula importada que é a mesma usada em países como Estados Unidos e Coreia do Sul, que atacam os compostos que geram o mau odor no intestino. E para ele funcionar é muito fácil. Só precisa tomar uma dose diária e pronto. Ele trabalha por mim enquanto eu sigo a minha vida. E assim eu sei que parece lorota, mas não é, gente. Eu testei e tá aprovado. Passei no teste da colher para vocês entenderem melhor. Esse aqui é um conceito inovador aqui no Brasil que se chama desodorante interno. E como ele age no intestino, ele atua diretamente no mau hálito, no cecê, no mau odor íntimo também. Bafo na virilha e tudo mais. Tudo de uma vez. Então, se você quiser acreditar na colega aqui, clica nesse link que tá aqui embaixo e vem também experimentar Aura Fresh. Aproveita que ele tá com frete grátis para todo o Brasil. E é isso.

### R5: Pós-parto
Eu tenho vergonha de admitir isso, mas depois da gestação eu comecei a exalar um cheiro muito forte. Me avisaram de muita coisa depois do pós-parto, privação de sono, mudanças hormonais, mas ninguém me avisou que meu cheiro mudaria tanto. Eu comecei a usar muitos tipos de desodorante e cremes e tomava muito banho e mesmo assim aquele cheiro que me incomodava ele não passava. Então eu comecei a procurar outro tipo de solução para o meu problema e eu só achava produtos importados. Até que um dia, pesquisando muito bem, eu encontrei o Aura Fresh, que é um produto totalmente brasileiro nas fórmulas americanas, que contém clorofila, que é um dos princípios ativos que ajuda a inibir o odor do nosso corpo de dentro para fora. Depois que eu comecei a usar todos os dias, eu comecei a ver muito resultado não só na questão do meu cheiro, mas na questão de hálito, até no frescor íntimo. E eu achei que fez muita diferença. Se você está passando por algo do tipo, também acho que compensa testar aqui no link aqui embaixo.

### R6: Farmacêutica (vídeo real dela; cenas entram como cutaway)
Você sofre com mau hálito e isso aqui pode acabar com o seu problema. Fica aqui que eu vou te explicar como. Olá, eu sou Cleycianne, farmacêutica, e em um minuto eu vou te explicar o porquê que essas folhas verdes podem ser a solução para o seu problema. Todo mundo sabe que folhas verdes são riquíssimas em clorofila. O que pouca gente sabe é que existem estudos que comprovam que grandes quantidades de clorofila no nosso organismo ajudam a inibir maus odores como mau hálito, mau odor na região íntima, mau odor nas axilas. O problema é que para você obter uma quantidade relevante de clorofila apenas através da alimentação, você teria que consumir uma quantidade enorme de vegetais verdes todos os dias. O que é impossível para o ser humano comum. Mas existe uma solução: o uso controlado da clorofilina. A clorofilina é um derivado hidrossolúvel da clorofila, desenvolvida para ser mais facilmente utilizada em formulações. E ela é o principal ingrediente do produto e uma dose diária já entrega a quantidade de clorofila que a gente precisa. Nos primeiros dias de uso, as fezes ficam esverdeadas devido à ação de limpeza do produto no organismo e o seu intestino funciona melhor. Já com duas semanas de uso todos os dias você já começa a sentir um frescor nos odores do seu corpo. Então, se você já tentou de tudo para combater o mau cheiro no seu corpo e ele continua voltando, talvez esteja na hora de você iniciar uma nova abordagem terapêutica. Clique aqui e experimente o Aura Fresh, diferente de tudo que você já experimentou.

### R7: Dentista / "bosta" (UGC)
Esse é o cheiro que meu dentista disse que saía da minha boca. Bosta. E o pior que ele disse que o problema não tinha nada a ver com a minha boca. Você acredita? Aí eu caí na real que fazia sentido, porque o problema não era porque eu não escovava os dentes direito. Eu passava fio dental de vez em quando. Usava Listerine todo dia e mesmo assim ficava com esse cheiro de bosta. Ele me explicou que no meu caso, o meu cheiro começava no processo digestivo. O problema estava no meu intestino e minha boca era o local que o cheiro saía. Eu fiquei passada. Aí eu falei tá. E aí eu vou ficar com esse bafo pro resto da vida? Ou você quer que eu escove o meu intestino? Só faltava essa, né? Aí ele me falou que o segredo estava em consumir alimentos ricos em clorofila e folhas verdes vegetais para regular o intestino e eliminar o mau cheiro. Só que aí eu vou ficar mastigando o maço de coentro e rúcula todo santo dia, só para não ter bafo. Não dá, né, Brasil? Aí eu fui pesquisar sobre isso aqui em casa e descobri um negócio que eu nunca tinha ouvido falar: desodorante interno. É isso aqui, ó. E eu vi que é uma parada inovadora no Brasil, mas que já tá sendo usado no exterior há muitos anos. Ele tem clorofila concentrada e basta tomar uma dose por dia para ter o equivalente a um monte dessas folhas aí. Aí eu comecei a tomar todo dia de manhã, depois de uma semaninha minha mãe disse que o cheiro da minha boca já tava muito melhor. Com duas semanas o efeito já tava absurdo, zero bafo durante o dia e nem quando eu acordo. Dá pra acreditar? Eu já fui correndo e comprei mais três potes pros próximos meses. Acredita que o negócio funciona mesmo? Então, se você escova os dentes, usa enxaguante, chupa pastilha e esse bendito bafo continua voltando, vale a pena você testar essa opção aqui também, tá? Eu estou colocando o link aqui embaixo porque eu comprei nesse link. Aproveita que eles estão com frete grátis para todo o Brasil.

### R8: "Donzela" (desodorante interno, R$ 3 por dia, garantia)
As axilas dela pararam de feder. O hálito parou de feder. Os pés também pararam de feder. Nada no corpo dessa donzela tinha mau cheiro. E eu vou te contar o porquê. Ela começou a usar o primeiro desodorante interno feito no Brasil, chamado Aura Fresh. É a mesma fórmula dos produtos mais usados nos Estados Unidos, Japão e Europa. Ela nunca tinha ouvido falar desse tipo de produto, mas ela andava com uma catinga tão braba que uma amiga acabou indicando. Basta usar um scoop de salsa, hortelã e clorofila para fazer um detox lá dentro do seu intestino. Isso mesmo, esse seu bafo e fedor no sovaco começa lá no intestino. Já nas primeiras semanas você começa a sentir a diferença e vai parar de andar por aí com cheiro de pizza podre por apenas 3 reais por dia. Você garante um pote desse para um mês inteiro. E se o seu mau cheiro não desaparecer, eles devolvem o seu dinheiro. Clica no link e saiba mais.

### Gancho solto
"Todos os lugares que podem começar a feder do nada e acabar com a sua dignidade." / "Parte íntima, sovaco e hálito: você tá fedendo, mas ninguém vai te contar, deixa eu ser a primeira." / "Somos um pouco diferentes, né? Porque você tá fedendo e eu não tô" (vídeo para mulheres).

---

## 3. CATÁLOGO DE CENAS (VERSÃO FINAL)

### 3.1 REALISTAS: ROTINA DE HIGIENE E "NADA RESOLVE" — usar [R]
- **Escovar os dentes:** mulher brasileira no espelho do banheiro de manhã, movimentos ritmados, expressão neutra. Variante: "sem entender o problema" (pausa, olha o espelho, franze a testa, suspira). Variante masculina (homem brasileiro, barba curta).
- **Fio dental:** mãos esticando o fio entre os dedos, passa entre os dentes, expressão neutra e concentrada. Variante masculina.
- **Enxaguante líquido azul:** despeja em copo dosador, bochecha. **Sem citar a marca Listerine**, descrever "frasco com líquido azul translúcido, tampa dosadora, rótulo neutro".
- **Rotina completa e satisfação:** escova, limpa a língua, enxaguante, sorri ao espelho convencida de "hálito perfeito". Versão com **efeito sparkle** de comercial de pasta (paródia).
- **Bafo volta horas depois:** manhã satisfeita, transição de tempo (luz), depois leva a mão à boca e percebe. "Meia hora depois parece que morreu um gambá na boca": choque exagerado mas realista, sem cobrir o nariz.
- **Bancada com todos os produtos bucais:** ela olha de um a outro, balança a cabeça sem entender; **virada final**: a expressão relaxa e vira esperança, como quem ouve a solução (luz esquenta).
- **Assoprar na mão para testar:** sopra em concha, cheira, reação de dúvida e leve desconforto.
- **Sente que está com bafo e come uma bala:** assopra na mão, pega uma bala às pressas, olha em volta aliviada e ansiosa.
- **Teste da colher:** lamber a parte de trás, esperar secar (macro), cheirar com reação de surpresa.
- **Vários produtos de odor na bancada (banheiro de alto padrão):** roll-on, aerossol, stick, creme, body splash, sabonete, talco, tudo sem marca e sem texto; ela olha de um a outro, braços cruzados, dúvida; "não resolve 100%".
- **Desodorante roll-on:** descrever o objeto (cilindro de plástico ~12 cm, bolinha visível, desliza 2-3 vezes) para o Flow acertar.
- **Creme nos braços e perfume no pescoço** (névoa rosada em câmera lenta).
- **Banho:** **só do ombro para cima**, sem nudez. **Pós-banho:** roupão fechado, cheira a axila ou o braço, decepção ("acabei de tomar banho, como pode?"), com onda cinza-esverdeada fina por um instante.
- **Sabonete íntimo na pia:** só o frasco e a mão apertando a bomba, totalmente neutro.

### 3.2 REALISTAS: "OS OUTROS PERCEBEM" — usar [R]
- **Namorado** (sofá ou cozinha): recua o rosto, sorriso educado, desconforto contido.
- **Amiga** (café): inclina-se para trás, desvia o olhar, gesto de ajeitar o cabelo.
- **Colegas de trabalho** (escritório): um se inclina, troca olhar rápido.
- **Atendente da padaria:** sorriso profissional, desvia o olhar, inclina a cabeça.
- **Sequência única** (namorado → amiga → colegas → padaria), 3 a 4 cortes de 2-3 s.
- **Amiga em pé dá um passo nítido para trás** com a mão perto do rosto em gesto ambíguo (nunca tapar o nariz); câmera acompanha o novo espaçamento.
- **Colega se afastando aos poucos** durante a conversa.
- **Esteticista (depilação):** versão sutil, close no rosto dela com narinas se contraindo, mantendo o profissionalismo; mulher deitada **vestida**.
- **Marido e beijo ao acordar:** ela aceita, depois careta contida, sorriso forçado, sem tapar o nariz; onda fina sai da boca dele.
- **Date:** ela acha que o rapaz tem bafo (onda sai dele na imaginação dela), virada: a onda sai da boca dela e ele se segura.
- **Elevador:** ela entra relaxada, três pessoas reagem de leve, distorção cinza-esverdeada quase imperceptível ao redor dela.
- **Metrô (versão final):** câmera fixa em passarela, ~4 m, 45°, perto da ação; metrô chegando ao fundo; **3 pessoas com aura fina e translúcida presa ao corpo** (máx. meio metro, origem nas axilas), as outras sem efeito; quem passa perto desvia levemente. Versão anterior: câmera de teto distante (rejeitada).
- **Fumacinha da axila até o nariz da outra** + balão de pensamento com pizza que murcha em "puff" + careta sem tapar o nariz. Variante com **cebola** (azedo de cebola) no lugar da pizza.
- **Rua ao sol:** ela cheira a axila (camisa levemente úmida de suor), constrangimento. **Vestiário feminino:** fim do turno, uniforme sem logo, cheira o braço (tudo vestido).
- **Amiga indicando o produto:** sala clara, entrega o pote com as duas mãos, rótulo de frente. **Com referência da foto do pote** (bloco "REFERÊNCIA DO PRODUTO", pote não gira).
- **Pesquisando:** no celular (luz azulada no rosto) ou **no notebook com câmera pelas costas** (tela sem texto legível, só a rolagem).
- **Alimentos ricos em clorofila:** feira livre brasileira; **mulher olhando pilha de vegetais**: "como comer tudo isso todo dia"; pilha exagerada na bancada.
- **Mulher preparando o produto** em cozinha gourmet "casa de rico", luz de manhã, pó dissolvendo em espiral no copo (usar fotos do pote como referência exata).
- **Frescor o dia inteiro:** manhã, tarde e noite em cortes suaves. **Resultado em semanas:** início com luz fria e dessaturada, passagem de tempo, depois luz quente e ela sente o hálito melhor.
- **Pessoas na Coreia/EUA/Japão tomando o produto** (3 cenas por país com ambiente característico).
- **Amiga americana** com bandeira dos EUA discreta ao fundo.
- **Contraste entre duas mulheres (tela dividida):** uma com ar fresco e planta viçosa, outra com névoa fraca e planta murchando; final com olhar cúmplice.
- **Reportagem com médica:** só a médica (sem telão com conteúdo), animação 3D separada para compor.
- **Gancho "tô com bafo de bosta":** primeiro plano livre para foto e texto na edição + pessoa desfocada ao fundo soltando onda.

### 3.3 3D ANATÔMICO AZUL — usar [A]
- **Abertura (final aprovada):** 16:9, ação no terço central, ordem **bafo → cecê → chulé → corpo inteiro (onda) → suor**; antes: ordem parte íntima → axilas → hálito. **Sem as palavras "íntima", "virilha" e "feminino"** quando o Flow barrar.
- **Problema na boca? Não, no intestino:** corpo inteiro, "X" dourado discreto na boca, brilho verde-esmeralda no tronco; versão com corte do abdômen e região acinzentada sutil (sem massa, sem fumaça).
- **Intestino eliminando mau cheiro:** partículas cinza-esverdeadas dissolvidas por brilho **verde** (não amarelo), órgãos e corpo na mesma paleta azul.
- **Age no intestino e impede o cheiro de chegar à boca:** interceptação das partículas no trajeto ascendente.
- **Produto de dentro para fora:** núcleo verde no tronco expandindo em ondas até o contorno; versão **contida dentro do corpo** (desodorante interno).
- **Corpo bebe o líquido e reage na raiz:** copo verde, líquido desce pelo esôfago, dissolve as partículas no intestino, plano final do corpo inteiro.
- **Trajeto boca → intestino:** zoom contínuo; versão sutil e mais distante (corpo inteiro).
- **Digestão lenta:** partículas douradas circulando devagar em um núcleo translúcido no tronco.
- **Nariz que se acostuma:** versão final em **3D realista colorido**, ondas verde-amarelas saindo da boca, expressão relaxa, ícone de nariz azul apaga, segunda pessoa reage (a anatomia com receptores foi rejeitada: "estranho, não representa o que pedi").
- **Hormônios:** formas coloridas abstratas (rosa, lilás, coral, dourado) flutuando de forma desordenada, sem corpo.
- **Timelapse 3 semanas:** silhueta com calendário e brilho verde crescendo (antigo, chroma key); pode ser refeito em azul.
- **Clorofilina:** molécula 3D se reorganizando (derivado hidrossolúvel); ativo principal com halo; com silhueta absorvendo o brilho; folhas orbitando e sendo absorvidas por uma esfera verde (clorofila concentrada = equivalência a muitas folhas).

### 3.4 CARTOON E HUMOR — usar [C]
- **Difunto debaixo do braço:** figurinha de defunto (olhos em X, pele verde-pálida) desmaia; estrelinhas.
- **Bafo / chulé / odor íntimo (cartoon):** passarinho desmaia, vaso murcha, mosquinha tonta, cachorro tapa o focinho; íntimo **só pela reação dos bichinhos**, personagem vestida.
- **Fumacinha da axila com balão de pizza e careta** (versão cartoon e versão realista com VFX).
- **Profundezas do inferno debaixo do braço:** portal, caverna com fogo e ondas verde-amarelas, sem demônios.
- **Perfume no caixão:** mulher perfuma o "defunto" em velório estilizado, o cheiro volta, flores murcham.
- **Homem cabeçudo e bocão na calçada movimentada:** a cada gargalhada sai onda verde-amarelada; planta murcha, passarinho cai, cachorro foge.
- **Piscina de desodorante:** mergulho exagerado em espuma branca com frascos flutuando (humor publicitário).

### 3.5 MOTION E VFX — usar [M]
- **Barra 24 h / 3 dias / 1 semana** (PNG verde, descartado) e **contagem regressiva 60 s** (sugerido HTML se o Flow errar).
- **"ERRO Nº 1/2/3":** texto branco com contorno dourado, entradas diferentes (escala, deslize, letras em sequência), "X" dourado sobre o número, partículas; sem outro texto.
- **"DESFEDORIZAÇÃO" + interrogação gigante + corpinhos curiosos:** interrogação 3D verde-esmeralda metálico fosco, 5 bonequinhos de vidro azul fosco sem rosto, faixa com a palavra escrita em letras maiúsculas, til e cedilha corretos (conferir).
- **Frete grátis (final):** mapa do Brasil + caixa cruzando + seta alta + **sem barra**; quarto inferior livre. **"Só o Aura Fresh oferece"**: alertar sobre comprovação.
- **R$ 3 por dia:** 3 moedas reais de R$ 1 caindo, grade de 30 dias acendendo, espaço para o texto.
- **"Problema solucionado":** check grande + halo; seta "clique no link abaixo" (cores sem verde quando o fundo era verde, hoje sem chroma).
- **Perfil do Instagram (@aurafreshbrasil):** o Flow recria a tela e distorce o texto. **Solução:** gerar só moldura/brilho de reveal e **colocar o print real por cima na edição**.
- **Bancadas "o que não resolve":** higiene bucal, desodorantes, íntimo (perfume/sabonete/pomada), pés (talco, spray, receitas caseiras), probióticos/enxaguante/pastilha/spray, desodorante/leite de magnésia/perfume/receitas caseiras, Halls + enxaguante azul. "Ele não é bala, nem spray, nem enxaguante": X dourado em cada um e **espaço vazio para o pote** no final.
- **Halls como disfarce que falha (cena 3D):** embalagem apagada e parada, frescor fraco e curto, odor domina, "X" dourado (a primeira versão deixou o Halls "herói", rejeitada).
- **Comparação disfarçar vs. de dentro para fora:** enxaguante cobre e some, produto age de dentro até dissolver o ponto cinza.
- **Bandeiras:** EUA primeiro (depois Japão, Coreia do Sul, Europa); "já existe, só replicaram a fórmula": bandeiras lado a lado, **molécula/ícones (hortelã, salsa, clorofilina)** idênticos nos três, fluem para o espaço central do pote e a bandeira do Brasil surge. Sequência anterior: bandeiras + corpo bebendo + efeito na **boca, axila, região íntima (símbolo) ou pés**.
- **"Produzido no Brasil":** bandeira do Brasil com espaço para a foto real do produto (Aura aparece primeiro).

### 3.6 PRODUTO E INGREDIENTES
- **Ingredientes (final premium):** mármore Carrara, clorofilina em pó, salsa, hortelã com gotas, espaço central vazio para o pote, macro 100 mm f/2.8, luz ~5200K.
- **Pote em cenário full com clorofila, salsa e hortelã:** pote real entra na edição.
- **Motion de frete grátis com pote como referência:** o pote saía com texto trocado; solução final: **gerar o fundo e colocar o pote na edição** (escala 100→105% e sombra suave).
- **Pote travado:** prompt "TRAVA DO PRODUTO": logo na tampa acima da linha de emenda, pote parado, só o entorno se mexe, foto das 3 unidades como primeiro quadro.
- **Sobrevoo da empresa:** drone sobre sede moderna verde-escura com jardim, letreiro na edição, avisar que o prédio é inventado.

---

## 4. CASOS RECUSADOS (NÃO REPETIR)
- **Fezes** em qualquer forma (cocô verde na privada, "sutil", "borrado", "quibe verde", animação de descarga, imagem enviada). Alternativa oferecida: água do vaso com tom verde, sem conteúdo; corte ao intestino com brilho.
- **Fiona (Shrek)** com bafinho: personagem protegido, oferecer ogro original.
- **Mounjaro** ligado a mau hálito: associação enganosa; oferecer tratamento genérico.
- **Cenas humilhantes explícitas:** mão no nariz, apontar para a axila, depiladora com máscara: suavizadas para reações sutis.

## 5. PONTOS DE ATENÇÃO LEGAL E DE ANÚNCIO
- "Detox", "cura", "elimina toxinas", "estudos comprovam", "primeiro desodorante interno", "mesma fórmula dos mais usados", "só o Aura Fresh oferece", "você tá fedendo": risco de reprovação no Meta/TikTok e de questionamento por falta de comprovação.
- Preço de R$ 3/dia e garantia de devolução: devem refletir a oferta real.
- Marcas reais (Halls, Listerine) em anúncio pago: usar embalagem genérica ou descrever sem citar.
- Imagens de pessoas geradas por IA em depoimentos: lembrar que são ilustrativas quando for exigido pela plataforma.
