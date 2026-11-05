# -*- coding: utf-8 -*-
"""
Conteúdo do e-book: as 20 receitas.

Cada ingrediente é uma tupla: (medida caseira + nome, medida em g/ml, chave da lista de compras)
A chave liga o ingrediente à Lista de Compras do bônus (None = item que todo mundo tem, como água).

Medidas usadas: 1 xícara (chá) = 240 ml | 1 colher (sopa) = 15 ml | 1 colher (chá) = 5 ml
"""

SECOES = [
    {
        "id": "salgados",
        "titulo": "Salgados",
        "subtitulo": "Pratos principais e acompanhamentos",
        "texto": "O coração da ceia. Carnes que saem do forno douradas e "
                 "acompanhamentos que todo mundo espera encontrar na mesa.",
    },
    {
        "id": "sobremesas",
        "titulo": "Sobremesas",
        "subtitulo": "Doces que fecham a noite",
        "texto": "Receitas geladas e cremosas, quase todas feitas na véspera. "
                 "Assim, no dia 24 sobra tempo para você.",
    },
    {
        "id": "extras",
        "titulo": "Entradas e Bebidas",
        "subtitulo": "Para receber bem desde a chegada",
        "texto": "Petiscos para enganar a fome enquanto o peru termina de "
                 "assar e bebidas sem álcool para a família toda.",
    },
]

RECEITAS = [
    # ------------------------------------------------------------------ SALGADOS
    {
        "secao": "salgados",
        "nome": "Peru Assado com Manteiga de Ervas",
        "intro": "O rei da ceia. A manteiga passada por baixo da pele é o que deixa "
                 "o peito macio e a casca bem dourada.",
        "porcoes": "12 porções",
        "tempo": "3 h + 1 noite na marinada",
        "dificuldade": "Médio",
        "custo": "Médio",
        "ingredientes": [
            ("Peru", [
                ("1 peru inteiro, descongelado", "4 kg", "peru"),
            ]),
            ("Marinada", [
                ("6 dentes de alho", "30 g", "alho"),
                ("1 cebola média", "150 g", "cebola"),
                ("Suco de 3 laranjas (cerca de 1 xícara)", "240 ml", "laranja"),
                ("½ xícara (chá) de vinho branco seco ou suco de laranja", "120 ml", "vinho"),
                ("2 colheres (sopa) de azeite", "30 ml", "azeite"),
                ("1 colher (sopa) de sal (só se o peru não for temperado)", "15 g", None),
                ("½ colher (chá) de pimenta-do-reino moída", "1 g", "pimenta"),
                ("2 folhas de louro", "—", "louro"),
            ]),
            ("Manteiga de ervas", [
                ("4 colheres (sopa) de manteiga amolecida", "80 g", "manteiga"),
                ("1 colher (sopa) de alecrim fresco picado", "2 g", "alecrim"),
                ("1 colher (sopa) de salsinha picada", "4 g", "cheiroverde"),
                ("Raspas da casca de 1 laranja", "—", "laranja"),
            ]),
            ("Para assar", [
                ("1 xícara (chá) de água", "240 ml", None),
            ]),
        ],
        "preparo": [
            "Descongele o peru na geladeira, ainda na embalagem, por 2 a 3 dias. Nunca deixe descongelar fora da geladeira.",
            "Retire o pacotinho de miúdos de dentro do peru, se houver. Seque o peru por dentro e por fora com papel-toalha (não precisa lavar).",
            "Bata no liquidificador o alho, a cebola, o suco de laranja, o vinho, o azeite, o sal e a pimenta. Essa é a marinada.",
            "Coloque o peru numa vasilha grande ou num saco próprio para alimentos. Espalhe a marinada por dentro e por fora e junte as folhas de louro.",
            "Cubra e leve à geladeira por 8 a 24 horas (de preferência uma noite inteira), virando o peru uma vez.",
            "Na hora de assar, misture a manteiga com o alecrim, a salsinha e as raspas de laranja.",
            "Preaqueça o forno a 180 °C por 15 minutos.",
            "Coloque o peru na assadeira com o peito para cima. Com cuidado, solte a pele do peito com os dedos e espalhe metade da manteiga de ervas por baixo dela. Passe o resto por fora.",
            "Despeje na assadeira a marinada que sobrou e a água.",
            "Cubra com papel-alumínio, com o lado brilhante para dentro, e asse por cerca de 2 horas (mais ou menos 30 minutos por quilo).",
            "Retire o papel-alumínio, regue o peru com o caldo da assadeira e asse por mais 30 a 40 minutos, regando a cada 15 minutos, até ficar bem dourado.",
            "Confira o ponto: o pino do peru salta, ou o caldo sai transparente (sem nada rosado) quando você fura a coxa perto do osso.",
            "Deixe descansar 20 minutos coberto com papel-alumínio antes de fatiar. Coe o caldo da assadeira e sirva como molho.",
        ],
        "dica": "Não pule o descanso de 20 minutos. É nesse tempo que o suco volta para dentro da carne. "
                "Se cortar logo, o caldo escorre na tábua e o peito fica seco.",
        "antes": "Dia 21 ou 22: passe o peru do freezer para a geladeira. Dia 23 à noite: prepare a marinada e tempere. "
                 "A manteiga de ervas também pode ser feita no dia 23 e guardada na geladeira (tire 1 hora antes para amolecer).",
        "foto": "a whole golden roasted turkey on a large white porcelain platter, glossy crisp skin, "
                "garnished with orange slices, fresh rosemary sprigs and green grapes",
    },
    {
        "secao": "salgados",
        "nome": "Tender Glaceado com Abacaxi",
        "intro": "Fácil e muito vistoso. O tender já vem cozido: aqui a gente só aquece e "
                 "faz uma calda brilhante que carameliza no forno.",
        "porcoes": "10 porções",
        "tempo": "1 h 10 min",
        "dificuldade": "Fácil",
        "custo": "Médio",
        "ingredientes": [
            (None, [
                ("1 tender (peça defumada) de cerca de 1,5 kg", "1,5 kg", "tender"),
                ("20 cravos-da-índia", "2 g", "cravo"),
                ("1 lata de abacaxi em rodelas em calda", "400 g", "abacaxiLata"),
                ("6 cerejas em calda (opcional)", "—", "cereja"),
            ]),
            ("Calda para glacear", [
                ("A calda do abacaxi em lata (cerca de 1 xícara)", "240 ml", None),
                ("½ xícara (chá) de açúcar mascavo", "80 g", "mascavo"),
                ("2 colheres (sopa) de mostarda", "30 g", "mostarda"),
                ("2 colheres (sopa) de mel", "40 g", "mel"),
                ("1 colher (sopa) de manteiga", "20 g", "manteiga"),
            ]),
        ],
        "preparo": [
            "Preaqueça o forno a 180 °C.",
            "Retire a rede e o plástico do tender. Com uma faca, faça cortes rasos (cerca de 1 cm) por toda a superfície, formando losangos.",
            "Espete um cravo em cada cruzamento dos cortes.",
            "Escorra o abacaxi e reserve a calda da lata.",
            "Numa panela, junte a calda do abacaxi, o açúcar mascavo, a mostarda, o mel e a manteiga. Ferva em fogo baixo por 8 a 10 minutos, mexendo, até virar um xarope levemente grosso.",
            "Coloque o tender numa assadeira forrada com papel-alumínio e pincele metade da calda por cima.",
            "Cubra com papel-alumínio e asse por 30 minutos.",
            "Retire o papel, arrume as rodelas de abacaxi e as cerejas ao redor do tender e pincele mais calda.",
            "Volte ao forno por 20 a 25 minutos, pincelando o restante da calda a cada 10 minutos, até o tender ficar brilhante e dourado.",
            "Deixe descansar 10 minutos e corte em fatias finas.",
        ],
        "dica": "Como o tender já é cozido, o segredo é não deixar o forno alto demais: acima de 200 °C o açúcar "
                "da calda queima antes de o tender esquentar por dentro.",
        "antes": "Dia 23: faça os cortes, espete os cravos e prepare a calda. Guarde o tender embrulhado e a calda num "
                 "pote, ambos na geladeira. No dia 24, é só levar ao forno.",
        "foto": "a glazed Brazilian Christmas tender ham with a diamond-scored surface studded with cloves, "
                "shiny caramelized glaze, pineapple rings and red cherries around it on a wooden board",
    },
    {
        "secao": "salgados",
        "nome": "Lombo Suíno ao Molho de Laranja",
        "intro": "Carne macia, perfumada e barata. O molho de laranja feito com o caldo da "
                 "assadeira é de passar o pão.",
        "porcoes": "8 porções",
        "tempo": "1 h 40 min + marinada",
        "dificuldade": "Fácil",
        "custo": "Barato",
        "ingredientes": [
            ("Lombo e marinada", [
                ("1 peça de lombo suíno", "1,5 kg", "lombo"),
                ("Suco de 3 laranjas (cerca de 1 xícara)", "240 ml", "laranja"),
                ("4 dentes de alho amassados", "20 g", "alho"),
                ("1 cebola média ralada", "150 g", "cebola"),
                ("2 colheres (sopa) de azeite", "30 ml", "azeite"),
                ("2 colheres (chá) de sal", "10 g", None),
                ("½ colher (chá) de pimenta-do-reino moída", "1 g", "pimenta"),
                ("1 colher (chá) de páprica doce", "2 g", "paprica"),
                ("2 ramos de alecrim fresco", "—", "alecrim"),
            ]),
            ("Molho", [
                ("O caldo que se formar na assadeira", "—", None),
                ("Suco de 1 laranja", "120 ml", "laranja"),
                ("2 colheres (sopa) de açúcar mascavo (ou mel)", "25 g", "mascavo"),
                ("1 colher (sopa) de manteiga", "20 g", "manteiga"),
                ("1 colher (chá) de amido de milho", "5 g", "amido"),
                ("2 colheres (sopa) de água fria", "30 ml", None),
            ]),
            ("Para decorar", [
                ("1 laranja em rodelas finas", "—", "laranja"),
            ]),
        ],
        "preparo": [
            "Seque o lombo com papel-toalha e faça furinhos por toda a peça com a ponta de uma faca.",
            "Misture o suco de laranja, o alho, a cebola, o azeite, o sal, a pimenta e a páprica.",
            "Coloque o lombo numa vasilha com a marinada e o alecrim. Cubra e deixe na geladeira de 6 a 12 horas, virando de vez em quando.",
            "Preaqueça o forno a 180 °C.",
            "Passe o lombo e a marinada para uma assadeira, cubra com papel-alumínio e asse por 50 minutos.",
            "Retire o papel, aumente o forno para 200 °C e asse por mais 25 a 30 minutos, regando com o caldo, até dourar. Está pronto quando, ao furar o centro, o caldo sai claro.",
            "Passe o lombo para uma tábua, cubra com papel-alumínio e deixe descansar 10 minutos.",
            "Para o molho: coe o caldo da assadeira para uma panela (deve dar cerca de 1 xícara; se tiver menos, complete com água). Junte o suco de 1 laranja, o açúcar mascavo e a manteiga e ferva por 5 minutos.",
            "Dissolva o amido de milho nas 2 colheres de água fria, despeje na panela e mexa por 1 a 2 minutos, até engrossar.",
            "Fatie o lombo, regue com o molho e decore com as rodelas de laranja.",
        ],
        "dica": "O lombo é uma carne magra e resseca se passar do ponto. Assim que o caldo sair claro, tire do forno: "
                "ele termina de cozinhar no descanso.",
        "antes": "Dia 23 à noite: deixe o lombo na marinada. Dá para assar na manhã do dia 24, fatiar e reaquecer à "
                 "noite coberto com o molho, a 160 °C por 15 a 20 minutos.",
        "foto": "sliced roasted pork loin with golden edges and juicy center, glossy orange sauce drizzled over it, "
                "fresh orange slices and rosemary on an oval ceramic platter",
    },
    {
        "secao": "salgados",
        "nome": "Pernil Assado de Festa",
        "intro": "Rende muito, custa pouco e agrada a todos. Temperado na véspera, sai do "
                 "forno desmanchando.",
        "porcoes": "15 porções",
        "tempo": "3 h 30 min + 12 h de marinada",
        "dificuldade": "Médio",
        "custo": "Barato",
        "ingredientes": [
            ("Pernil", [
                ("1 pernil suíno, com ou sem osso, de cerca de 3 kg", "3 kg", "pernil"),
            ]),
            ("Marinada", [
                ("1 cabeça de alho descascada (cerca de 12 dentes)", "50 g", "alho"),
                ("2 cebolas médias", "300 g", "cebola"),
                ("Suco de 2 limões", "60 ml", "limao"),
                ("1 xícara (chá) de vinho branco seco (ou ½ xícara de vinagre + ½ xícara de água)", "240 ml", "vinho"),
                ("¼ de xícara (chá) de azeite", "60 ml", "azeite"),
                ("½ xícara (chá) de cheiro-verde (salsinha e cebolinha)", "20 g", "cheiroverde"),
                ("1 e ½ colher (sopa) de sal", "25 g", None),
                ("1 colher (chá) de pimenta-do-reino moída", "2 g", "pimenta"),
                ("1 colher (sopa) de páprica doce", "7 g", "paprica"),
                ("3 folhas de louro", "—", "louro"),
            ]),
            ("Para assar", [
                ("1 xícara (chá) de água (e mais um pouco, se precisar)", "240 ml", None),
            ]),
        ],
        "preparo": [
            "Com uma faca de ponta, faça furos profundos por todo o pernil, dos dois lados, principalmente na parte mais grossa.",
            "Bata no liquidificador o alho, a cebola, o suco de limão, o vinho, o azeite, o cheiro-verde, o sal, a pimenta e a páprica.",
            "Coloque o pernil numa vasilha grande ou num saco próprio para alimentos e esfregue a marinada por toda a carne, empurrando um pouco para dentro dos furos. Junte o louro.",
            "Cubra e deixe na geladeira de 12 a 24 horas, virando 2 vezes.",
            "Tire o pernil da geladeira 30 minutos antes de assar. Preaqueça o forno a 180 °C.",
            "Coloque o pernil na assadeira com a parte da gordura para cima. Despeje a marinada e a água por cima.",
            "Cubra muito bem com papel-alumínio, vedando as bordas, e asse por 2 horas e 30 minutos. Confira a cada hora: se o caldo secar, junte ½ xícara de água.",
            "Retire o papel-alumínio, aumente o forno para 200 °C e asse por mais 40 minutos, regando a cada 15 minutos, até dourar bem.",
            "O ponto certo é quando um garfo entra com facilidade e o caldo que sai é claro.",
            "Deixe descansar 15 minutos antes de fatiar. Regue as fatias com o caldo da assadeira.",
        ],
        "dica": "Os furos profundos e a marinada longa são o segredo: o tempero chega no meio da carne. "
                "E vede bem o papel-alumínio na primeira etapa, para o pernil cozinhar no próprio vapor.",
        "antes": "Dia 23 pela manhã: tempere o pernil (pode ficar até 24 horas na marinada). Se preferir, asse no dia 23 "
                 "à noite, guarde fatiado com o caldo na geladeira e reaqueça coberto, a 180 °C, por 30 minutos.",
        "foto": "a large roasted pork leg with crackling golden-brown skin in a rustic roasting pan with its juices, "
                "bay leaves and roasted garlic, one part sliced to show tender meat",
    },
    {
        "secao": "salgados",
        "nome": "Bacalhoada de Forno com Batatas",
        "intro": "Tradição portuguesa que virou nossa. Bacalhau em lascas, batatas, "
                 "cebola, pimentão e muito azeite.",
        "porcoes": "8 porções",
        "tempo": "1 h 30 min + dessalgue",
        "dificuldade": "Médio",
        "custo": "Médio",
        "ingredientes": [
            (None, [
                ("1 kg de bacalhau salgado em postas (o Saithe é mais em conta)", "1 kg", "bacalhau"),
                ("1 kg de batatas (cerca de 6 médias)", "1 kg", "batata"),
                ("1 colher (sopa) de sal, para a água das batatas", "15 g", None),
                ("4 ovos", "—", "ovos"),
                ("¾ de xícara (chá) de azeite", "180 ml", "azeite"),
                ("2 cebolas grandes em rodelas", "400 g", "cebola"),
                ("4 dentes de alho fatiados", "20 g", "alho"),
                ("1 pimentão vermelho em tiras", "150 g", "pimentaoVermelho"),
                ("1 pimentão amarelo ou verde em tiras", "150 g", "pimentaoAmarelo"),
                ("½ xícara (chá) de azeitonas pretas", "80 g", "azeitonaPreta"),
                ("Pimenta-do-reino moída a gosto", "—", "pimenta"),
                ("2 colheres (sopa) de salsinha picada", "8 g", "cheiroverde"),
            ]),
        ],
        "preparo": [
            "Dessalgue o bacalhau: lave as postas em água corrente e deixe numa vasilha com água gelada, na geladeira, trocando a água 4 vezes por dia. Postas grossas levam de 36 a 48 horas. Prove uma lasquinha: deve ficar só levemente salgada.",
            "Ferva água numa panela, desligue o fogo e coloque o bacalhau por 10 minutos. Escorra, tire a pele e as espinhas e separe em lascas grandes.",
            "Cozinhe os ovos em água fervente por 10 minutos. Passe para água fria, descasque e corte em quatro.",
            "Descasque as batatas e corte em rodelas de 1 cm. Cozinhe em água com o sal por 8 a 10 minutos, até ficarem macias, mas ainda firmes. Escorra.",
            "Preaqueça o forno a 200 °C.",
            "Numa frigideira, aqueça metade do azeite e refogue a cebola e o alho por 5 minutos, até murcharem. Junte os pimentões e refogue por mais 3 minutos.",
            "Num refratário grande, regue um fio de azeite e faça uma camada com as batatas. Por cima, espalhe metade do refogado, depois as lascas de bacalhau e o restante do refogado.",
            "Distribua as azeitonas e os ovos, regue com o restante do azeite e polvilhe pimenta-do-reino.",
            "Asse por 25 a 30 minutos, até as bordas dourarem e o azeite borbulhar.",
            "Salpique a salsinha e sirva quente.",
        ],
        "dica": "Faça o dessalgue sempre dentro da geladeira e com água gelada: além de seguro, o bacalhau fica mais "
                "firme e em lascas bonitas. E não economize no azeite, é ele que dá o sabor da bacalhoada.",
        "antes": "Dia 22: comece o dessalgue. Dia 23: escalde o bacalhau, cozinhe batatas e ovos, faça o refogado e monte "
                 "tudo no refratário, sem o azeite final. Cubra e guarde na geladeira. Dia 24: regue o azeite e asse "
                 "por 35 a 40 minutos (10 a mais por estar gelado).",
        "foto": "a Portuguese-Brazilian baked codfish casserole (bacalhoada) in a rustic oval clay dish, large flakes of "
                "salt cod over sliced potatoes, onions, red and yellow peppers, black olives and quartered boiled eggs, "
                "glistening olive oil",
    },
    {
        "secao": "salgados",
        "nome": "Arroz Natalino Colorido",
        "intro": "Soltinho, cheio de cor e com aquele toque doce das passas que é a cara "
                 "do Natal (quem não gosta, é só tirar).",
        "porcoes": "8 porções",
        "tempo": "40 min",
        "dificuldade": "Fácil",
        "custo": "Barato",
        "ingredientes": [
            ("Arroz", [
                ("2 xícaras (chá) de arroz branco", "400 g", "arroz"),
                ("2 colheres (sopa) de azeite", "30 ml", "azeite"),
                ("1 cebola pequena picada", "100 g", "cebola"),
                ("2 dentes de alho picados", "10 g", "alho"),
                ("4 xícaras (chá) de água quente", "960 ml", None),
                ("2 colheres (chá) de sal", "10 g", None),
                ("1 cenoura média em cubinhos", "130 g", "cenoura"),
            ]),
            ("Para finalizar", [
                ("2 colheres (sopa) de manteiga", "40 g", "manteiga"),
                ("½ xícara (chá) de uva-passa (opcional)", "75 g", "passa"),
                ("½ xícara (chá) de castanha-de-caju ou amêndoas picadas (opcional)", "60 g", "castanha"),
                ("1 lata de milho verde escorrido", "170 g", "milho"),
                ("1 lata de ervilha escorrida", "170 g", "ervilha"),
                ("3 colheres (sopa) de cheiro-verde picado", "10 g", "cheiroverde"),
            ]),
        ],
        "preparo": [
            "Lave o arroz numa peneira e deixe escorrer bem.",
            "Numa panela, aqueça o azeite e refogue a cebola por 3 minutos. Junte o alho e refogue por mais 1 minuto.",
            "Acrescente o arroz e mexa por 2 minutos, até os grãos ficarem bem envolvidos no tempero.",
            "Junte a água quente, o sal e a cenoura. Quando ferver, abaixe o fogo, tampe deixando uma pequena fresta e cozinhe por cerca de 15 minutos, até a água secar.",
            "Desligue o fogo, tampe totalmente e deixe descansar por 5 minutos.",
            "Enquanto isso, derreta a manteiga numa frigideira, junte as passas e a castanha e mexa por 2 minutos. Acrescente o milho e a ervilha e aqueça por mais 2 minutos.",
            "Solte o arroz com um garfo e misture delicadamente o conteúdo da frigideira e o cheiro-verde.",
        ],
        "dica": "Misture tudo com um garfo, nunca com colher: o garfo solta os grãos sem amassar, e o arroz fica "
                "soltinho como de restaurante.",
        "antes": "Dia 23: pique a cebola, o alho, a cenoura e o cheiro-verde e guarde em potes na geladeira. "
                 "O arroz é melhor feito na hora, mas também pode ser cozido no dia 23 e aquecido no dia 24 na frigideira "
                 "com a manteiga, antes de misturar o restante.",
        "foto": "a white ceramic bowl of fluffy Brazilian Christmas rice with golden raisins, cashew nuts, diced carrots, "
                "green peas and corn, sprinkled with chopped parsley",
    },
    {
        "secao": "salgados",
        "nome": "Farofa Rica de Natal",
        "intro": "Douradinha, úmida e cheia de sabor, com bacon, calabresa e ovos. "
                 "Daquelas que acabam antes do peru.",
        "porcoes": "10 porções",
        "tempo": "30 min",
        "dificuldade": "Fácil",
        "custo": "Barato",
        "ingredientes": [
            (None, [
                ("200 g de bacon em cubinhos (cerca de 1 e ½ xícara)", "200 g", "bacon"),
                ("1 linguiça calabresa picada em cubinhos", "250 g", "calabresa"),
                ("3 colheres (sopa) de manteiga", "60 g", "manteiga"),
                ("1 cebola grande picada", "200 g", "cebola"),
                ("3 dentes de alho picados", "15 g", "alho"),
                ("3 ovos", "—", "ovos"),
                ("3 xícaras (chá) de farinha de mandioca torrada", "450 g", "farinhaMandioca"),
                ("½ xícara (chá) de azeitonas verdes picadas (opcional)", "70 g", "azeitonaVerde"),
                ("½ xícara (chá) de uva-passa (opcional)", "75 g", "passa"),
                ("½ xícara (chá) de cheiro-verde picado", "20 g", "cheiroverde"),
                ("Sal a gosto (cerca de ½ colher de chá)", "3 g", None),
            ]),
        ],
        "preparo": [
            "Numa panela grande ou frigideira funda, coloque o bacon sem óleo e frite em fogo médio por cerca de 8 minutos, até dourar e soltar a gordura.",
            "Junte a calabresa e frite por mais 5 minutos.",
            "Acrescente 2 colheres da manteiga e a cebola e refogue por 5 minutos, até dourar levemente. Junte o alho e mexa por 1 minuto.",
            "Afaste tudo para um canto da panela, quebre os ovos no espaço livre e mexa até cozinharem, como ovos mexidos. Depois, misture com o restante.",
            "Abaixe o fogo e junte a farinha aos poucos, mexendo sempre, por cerca de 5 minutos, até ficar soltinha e levemente torrada.",
            "Desligue o fogo e misture a manteiga restante, as azeitonas, as passas e o cheiro-verde. Prove e acerte o sal.",
        ],
        "dica": "Bacon e calabresa já são salgados, por isso só coloque sal no final, depois de provar. "
                "E a última colher de manteiga com o fogo desligado é o que deixa a farofa úmida.",
        "antes": "Dia 23: pique todos os ingredientes. A farofa pronta também pode ser feita no dia 23: guarde em pote "
                 "fechado na geladeira e aqueça na frigideira por 3 minutos. Deixe o cheiro-verde para a hora de servir.",
        "foto": "a rustic wooden bowl of golden Brazilian cassava flour farofa with crispy bacon bits, sliced sausage, "
                "scrambled egg pieces, green olives and fresh chives",
    },
    {
        "secao": "salgados",
        "nome": "Salpicão de Frango Cremoso",
        "intro": "Fresquinho, cremoso e crocante. Perfeito para a noite quente de Natal.",
        "porcoes": "10 porções",
        "tempo": "50 min + 1 h na geladeira",
        "dificuldade": "Fácil",
        "custo": "Barato",
        "ingredientes": [
            ("Frango", [
                ("Peito de frango sem osso", "600 g", "frango"),
                ("½ cebola", "75 g", "cebola"),
                ("1 folha de louro", "—", "louro"),
                ("1 colher (chá) de sal", "5 g", None),
            ]),
            ("Salada", [
                ("2 cenouras médias raladas", "250 g", "cenoura"),
                ("1 maçã verde em cubinhos, com casca", "150 g", "macaVerde"),
                ("Suco de ½ limão", "15 ml", "limao"),
                ("1 lata de milho escorrido", "170 g", "milho"),
                ("½ xícara (chá) de azeitonas verdes picadas", "70 g", "azeitonaVerde"),
                ("½ xícara (chá) de uva-passa (opcional)", "75 g", "passa"),
                ("2 talos de salsão picados (opcional)", "100 g", "salsao"),
                ("Presunto em tirinhas (opcional)", "100 g", "presunto"),
            ]),
            ("Molho e cobertura", [
                ("1 xícara (chá) de maionese", "220 g", "maionese"),
                ("½ caixinha de creme de leite", "100 g", "cremeLeite"),
                ("1 colher (sopa) de mostarda", "15 g", "mostarda"),
                ("Sal e pimenta-do-reino a gosto", "—", "pimenta"),
                ("2 colheres (sopa) de cheiro-verde picado", "8 g", "cheiroverde"),
                ("1 pacote de batata palha", "120 g", "batataPalha"),
            ]),
        ],
        "preparo": [
            "Coloque o frango numa panela com a cebola, o louro e o sal e cubra com água. Quando ferver, cozinhe por 20 a 25 minutos, até ficar macio.",
            "Deixe o frango amornar no próprio caldo (assim ele não resseca). Depois, desfie em tiras finas e deixe esfriar completamente.",
            "Misture a maçã com o suco de limão, para ela não escurecer.",
            "Numa tigela grande, junte o frango, a cenoura, a maçã, o milho, as azeitonas, as passas, o salsão e o presunto.",
            "Em outra tigela, misture a maionese, o creme de leite e a mostarda.",
            "Despeje o molho sobre a salada e misture bem. Prove, acerte o sal e a pimenta e junte o cheiro-verde.",
            "Leve à geladeira por pelo menos 1 hora.",
            "Na hora de servir, cubra com a batata palha.",
        ],
        "dica": "Coloque a batata palha somente na hora de levar à mesa. Se ficar na geladeira em contato com o molho, "
                "ela amolece e perde a graça.",
        "antes": "Dia 23: cozinhe e desfie o frango e guarde em pote fechado na geladeira. O salpicão pode ser montado "
                 "até 24 horas antes, sem a batata palha. Guarde o caldo do frango: ele dá sabor ao arroz.",
        "foto": "a glass bowl of creamy Brazilian chicken salad (salpicao) with shredded chicken, grated carrot, corn, "
                "green apple cubes and raisins, topped with a generous layer of crispy shoestring potatoes",
    },
    {
        "secao": "salgados",
        "nome": "Maionese de Batata da Vovó",
        "intro": "A salada que não pode faltar. Batatas firmes, bem temperadas, com ovos e "
                 "cenoura, do jeito que a família gosta.",
        "porcoes": "10 porções",
        "tempo": "50 min + 1 h na geladeira",
        "dificuldade": "Fácil",
        "custo": "Barato",
        "ingredientes": [
            ("Legumes e ovos", [
                ("1,2 kg de batatas (cerca de 8 médias)", "1,2 kg", "batata"),
                ("2 cenouras médias", "250 g", "cenoura"),
                ("1 colher (sopa) de sal, para a água", "15 g", None),
                ("1 colher (sopa) de vinagre, para a água", "15 ml", "vinagre"),
                ("4 ovos", "—", "ovos"),
            ]),
            ("Tempero", [
                ("2 colheres (sopa) de azeite", "30 ml", "azeite"),
                ("Suco de ½ limão", "15 ml", "limao"),
                ("½ cebola roxa bem picadinha", "75 g", "cebolaRoxa"),
                ("1 lata de ervilha escorrida", "170 g", "ervilha"),
                ("1 xícara (chá) de maionese", "220 g", "maionese"),
                ("3 colheres (sopa) de cheiro-verde picado", "10 g", "cheiroverde"),
                ("Sal e pimenta-do-reino a gosto", "—", "pimenta"),
            ]),
        ],
        "preparo": [
            "Descasque as batatas e as cenouras. Corte as batatas em cubos de 2 cm e as cenouras em cubos de 1 cm (a cenoura demora mais para cozinhar).",
            "Coloque batatas e cenouras numa panela, cubra com água fria e junte o sal e o vinagre. Quando ferver, cozinhe por 8 a 10 minutos, até o garfo entrar com uma leve resistência.",
            "Escorra imediatamente e espalhe numa assadeira para esfriar, sem amassar.",
            "Cozinhe os ovos em água fervente por 10 minutos. Passe para água fria, descasque e pique. Reserve 1 ovo em rodelas para decorar.",
            "Com as batatas ainda mornas, tempere com o azeite, o suco de limão e uma pitada de sal.",
            "Quando estiverem frias, junte a cebola roxa, a ervilha e os ovos picados.",
            "Acrescente a maionese e misture delicadamente com uma espátula.",
            "Prove, acerte o sal e a pimenta, junte o cheiro-verde e decore com as rodelas de ovo. Leve à geladeira por pelo menos 1 hora.",
        ],
        "dica": "Temperar as batatas ainda mornas faz toda a diferença: elas absorvem o azeite e o limão e a salada "
                "fica saborosa por dentro, não só por fora. E o vinagre na água ajuda as batatas a não desmancharem.",
        "antes": "Dia 23: a maionese pode ser feita inteira e guardada na geladeira por até 2 dias. Mantenha sempre "
                 "gelada e não deixe fora da geladeira por mais de 2 horas.",
        "foto": "a white porcelain bowl of Brazilian potato salad with mayonnaise, diced potatoes and carrots, green peas, "
                "chopped parsley, decorated with boiled egg slices on top",
    },
    {
        "secao": "salgados",
        "nome": "Batata Gratinada Cremosa",
        "intro": "Camadas de batata, creme e queijo derretido com casquinha dourada. "
                 "Combina com qualquer carne da ceia.",
        "porcoes": "8 porções",
        "tempo": "1 h 10 min",
        "dificuldade": "Fácil",
        "custo": "Barato",
        "ingredientes": [
            ("Batatas", [
                ("1,2 kg de batatas (cerca de 8 médias)", "1,2 kg", "batata"),
                ("1 colher (sopa) de sal, para a água", "15 g", None),
                ("1 colher (sopa) de manteiga, para untar", "20 g", "manteiga"),
            ]),
            ("Molho", [
                ("1 colher (sopa) de manteiga", "20 g", "manteiga"),
                ("3 dentes de alho picados", "15 g", "alho"),
                ("1 xícara (chá) de leite", "240 ml", "leite"),
                ("2 caixinhas de creme de leite", "400 g", "cremeLeite"),
                ("½ colher (chá) de sal", "3 g", None),
                ("¼ de colher (chá) de noz-moscada ralada", "—", "nozMoscada"),
                ("Pimenta-do-reino moída a gosto", "—", "pimenta"),
            ]),
            ("Para gratinar", [
                ("1 e ½ xícara (chá) de mussarela ralada", "150 g", "mussarela"),
                ("½ xícara (chá) de queijo parmesão ralado", "40 g", "parmesao"),
            ]),
        ],
        "preparo": [
            "Preaqueça o forno a 200 °C e unte um refratário médio (cerca de 20 x 30 cm) com a manteiga.",
            "Descasque as batatas e corte em fatias finas, de meio centímetro.",
            "Coloque as fatias em água fervente com o sal e cozinhe por apenas 5 minutos. Escorra com cuidado.",
            "Numa panela, derreta a manteiga do molho e doure o alho por 1 minuto, sem deixar queimar. Junte o leite, o creme de leite, o sal, a noz-moscada e a pimenta e aqueça, mexendo, até quase ferver.",
            "Faça uma camada de batatas no refratário, cubra com um pouco do molho e da mussarela. Repita as camadas e termine com molho, mussarela e parmesão.",
            "Cubra com papel-alumínio e asse por 25 minutos.",
            "Retire o papel e asse por mais 15 a 20 minutos, até gratinar e ficar dourado.",
            "Espere 10 minutos antes de servir, para o creme firmar.",
        ],
        "dica": "Os 5 minutos de pré-cozimento garantem que nenhuma batata fique crua no meio. Não cozinhe mais "
                "que isso, senão as fatias se desmancham na hora de montar.",
        "antes": "Dia 23: monte o gratinado inteiro, cubra com filme plástico e guarde na geladeira. No dia 24, "
                 "troque o filme por papel-alumínio e asse com 10 minutos a mais na primeira etapa.",
        "foto": "a creamy potato gratin in a white rectangular baking dish, thin potato layers with bubbling melted "
                "cheese and a golden-brown crust, one portion removed to show the creamy layers",
    },
    # ------------------------------------------------------------------ SOBREMESAS
    {
        "secao": "sobremesas",
        "nome": "Pavê de Chocolate da Família",
        "intro": "Creme de baunilha, bolachas molhadinhas e uma cobertura de chocolate "
                 "que brilha. Quanto mais tempo na geladeira, melhor fica.",
        "porcoes": "12 porções",
        "tempo": "40 min + 4 h na geladeira",
        "dificuldade": "Fácil",
        "custo": "Barato",
        "ingredientes": [
            ("Creme branco", [
                ("1 lata de leite condensado", "395 g", "leiteCondensado"),
                ("2 xícaras (chá) de leite", "480 ml", "leite"),
                ("3 gemas", "—", "ovos"),
                ("2 colheres (sopa) de amido de milho", "20 g", "amido"),
                ("1 colher (chá) de essência de baunilha", "5 ml", "baunilha"),
            ]),
            ("Cobertura de chocolate", [
                ("200 g de chocolate meio amargo ou ao leite picado", "200 g", "chocolate"),
                ("1 caixinha de creme de leite", "200 g", "cremeLeite"),
            ]),
            ("Montagem", [
                ("1 pacote de bolacha maisena ou champanhe", "200 g", "bolachaMaisena"),
                ("1 xícara (chá) de leite, para molhar", "240 ml", "leite"),
            ]),
        ],
        "preparo": [
            "Numa panela, misture o leite condensado, o leite, as gemas e o amido de milho antes de ligar o fogo, até o amido dissolver.",
            "Leve ao fogo médio, mexendo sem parar, por 8 a 10 minutos, até engrossar como um mingau cremoso. Desligue e junte a baunilha.",
            "Cubra o creme com filme plástico encostando na superfície (para não formar película) e deixe amornar por 15 minutos.",
            "Para a cobertura, coloque o chocolate e o creme de leite numa tigela e leve ao micro-ondas por 30 segundos de cada vez, mexendo entre uma e outra, até ficar liso e brilhante.",
            "Molhe as bolachas rapidamente no leite (só um segundo) e forre o fundo de um refratário de cerca de 20 x 30 cm.",
            "Espalhe metade do creme branco. Faça outra camada de bolachas molhadas e cubra com o restante do creme.",
            "Espalhe a cobertura de chocolate e alise com uma espátula.",
            "Leve à geladeira por pelo menos 4 horas, de preferência de um dia para o outro.",
        ],
        "dica": "Molhe a bolacha só por um segundo. Ela vai continuar absorvendo a umidade do creme na geladeira; "
                "se molhar demais, o pavê fica empapado. Guarde as claras: elas viram o merengue da Torta de Limão.",
        "antes": "Dia 23: faça o pavê inteiro. Ele fica até mais gostoso no dia seguinte e dura 3 dias na geladeira, "
                 "bem coberto.",
        "foto": "a glass trifle dish of Brazilian chocolate pave showing neat layers of cookies and vanilla cream, "
                "topped with glossy chocolate ganache and chocolate shavings, one spoonful served on a small plate",
    },
    {
        "secao": "sobremesas",
        "nome": "Rabanada Cremosa (Frita ou Assada)",
        "intro": "Crocante por fora, cremosa por dentro e coberta de açúcar com canela. "
                 "Aqui você escolhe: na frigideira ou no forno.",
        "porcoes": "16 unidades (8 porções)",
        "tempo": "40 min",
        "dificuldade": "Fácil",
        "custo": "Barato",
        "ingredientes": [
            ("Pão e banho", [
                ("4 pães franceses amanhecidos (de 1 dia)", "200 g", "paoFrances"),
                ("2 xícaras (chá) de leite", "480 ml", "leite"),
                ("½ lata de leite condensado", "200 g", "leiteCondensado"),
                ("1 colher (chá) de essência de baunilha (opcional)", "5 ml", "baunilha"),
                ("3 ovos batidos", "—", "ovos"),
            ]),
            ("Para fritar ou assar", [
                ("Óleo para fritar (cerca de 1 litro), se for fritar", "1 L", "oleo"),
                ("3 colheres (sopa) de manteiga derretida, se for assar", "60 g", "manteiga"),
            ]),
            ("Cobertura", [
                ("½ xícara (chá) de açúcar", "90 g", "acucar"),
                ("1 colher (sopa) de canela em pó", "7 g", "canelaPo"),
            ]),
        ],
        "preparo": [
            "Corte cada pão em 4 fatias de cerca de 2 cm, na diagonal.",
            "Num prato fundo, misture o leite, o leite condensado e a baunilha. Em outro prato, deixe os ovos batidos.",
            "Num terceiro prato, misture o açúcar e a canela.",
            "Passe cada fatia rapidamente no leite (2 a 3 segundos de cada lado), deixe escorrer o excesso e passe nos ovos.",
            "Para fritar: aqueça o óleo numa panela funda em fogo médio. Ele está no ponto quando um pedacinho de pão sobe e borbulha logo. Frite poucas fatias por vez, 1 a 2 minutos de cada lado, até dourar. Escorra em papel-toalha.",
            "Para assar: preaqueça o forno a 200 °C. Pincele uma assadeira com metade da manteiga, arrume as fatias e pincele o restante por cima. Asse por 12 minutos, vire e asse por mais 10 a 12 minutos, até dourar.",
            "Passe as rabanadas ainda quentes no açúcar com canela.",
        ],
        "dica": "Use pão de ontem: o pão fresco absorve leite demais e desmancha. E mantenha o óleo em fogo médio. "
                "Se estiver muito quente, a rabanada escurece por fora e fica crua por dentro.",
        "antes": "Dia 23: compre os pães e deixe num saco de papel para ficarem amanhecidos. A mistura de leite pode "
                 "ser feita e guardada na geladeira. Frite ou asse no dia 24; se sobrar, reaqueça no forno a 180 °C "
                 "por 5 minutos.",
        "foto": "a stack of golden Brazilian rabanadas (French toast slices from baguette) coated in cinnamon sugar on a "
                "vintage plate, cinnamon sticks beside them",
    },
    {
        "secao": "sobremesas",
        "nome": "Torta de Limão com Merengue",
        "intro": "Base crocante, recheio azedinho na medida e um merengue alto e "
                 "brilhante. Uma sobremesa fresca para a noite quente.",
        "porcoes": "10 fatias",
        "tempo": "1 h + 3 h na geladeira",
        "dificuldade": "Médio",
        "custo": "Barato",
        "ingredientes": [
            ("Base", [
                ("1 pacote de bolacha maisena", "200 g", "bolachaMaisena"),
                ("5 colheres (sopa) de manteiga derretida", "100 g", "manteiga"),
            ]),
            ("Recheio", [
                ("1 lata de leite condensado", "395 g", "leiteCondensado"),
                ("1 caixinha de creme de leite", "200 g", "cremeLeite"),
                ("½ xícara (chá) de suco de limão espremido na hora (cerca de 4 limões)", "120 ml", "limao"),
                ("Raspas da casca de 1 limão (só a parte verde)", "—", "limao"),
            ]),
            ("Merengue", [
                ("3 claras", "100 g", "ovos"),
                ("¾ de xícara (chá) de açúcar", "135 g", "acucar"),
                ("1 pitada de sal", "—", None),
            ]),
        ],
        "preparo": [
            "Preaqueça o forno a 180 °C. Use uma fôrma de fundo removível de 22 a 24 cm.",
            "Triture as bolachas no liquidificador ou num saco plástico com um rolo, até virar uma farofa fina.",
            "Misture com a manteiga derretida até parecer areia molhada.",
            "Pressione a massa no fundo e nas laterais da fôrma com o fundo de um copo.",
            "Asse por 10 a 12 minutos, até dourar levemente. Deixe esfriar.",
            "Bata no liquidificador o leite condensado e o creme de leite por 1 minuto. Com o aparelho ligado, junte o suco de limão aos poucos: o creme vai engrossar. Desligue e misture as raspas.",
            "Despeje o recheio sobre a base fria e leve à geladeira por 2 horas.",
            "Para o merengue, coloque as claras, o açúcar e o sal numa tigela de vidro ou inox, sobre uma panela com água quase fervendo (a tigela não pode tocar a água).",
            "Mexa sem parar com um batedor de arame por 4 a 5 minutos, até o açúcar dissolver: esfregue um pouco entre os dedos e não deve sentir grãos.",
            "Passe para a batedeira e bata em velocidade alta por 8 a 10 minutos, até formar picos firmes e brilhantes.",
            "Cubra a torta com o merengue, fazendo ondinhas com as costas de uma colher. Doure com maçarico ou no forno a 220 °C por 3 a 5 minutos, sem tirar o olho.",
            "Volte à geladeira por mais 1 hora antes de servir.",
        ],
        "dica": "Coloque o suco de limão com o liquidificador ligado, em fio. É a reação do limão com o leite "
                "condensado que faz o recheio firmar, sem precisar ir ao fogo. Este merengue aquecido em banho-maria "
                "é mais seguro e não murcha.",
        "antes": "Dia 23: faça a base e o recheio e guarde na geladeira. Dia 24: prepare o merengue até 6 horas antes "
                 "de servir.",
        "foto": "a lemon meringue pie on a cake stand with tall toasted swirled meringue peaks, one slice cut to show the "
                "pale yellow lemon filling and crumbly cookie crust, fresh limes beside it",
    },
    {
        "secao": "sobremesas",
        "nome": "Panetone Recheado de Brigadeiro",
        "intro": "Transforma um panetone comum em sobremesa de confeitaria. Recheado de "
                 "brigadeiro cremoso e coberto de chocolate.",
        "porcoes": "12 fatias",
        "tempo": "1 h + 2 h na geladeira",
        "dificuldade": "Fácil",
        "custo": "Médio",
        "ingredientes": [
            ("Panetone", [
                ("1 panetone ou chocotone de 500 g", "500 g", "panetone"),
                ("½ xícara (chá) de leite, para umedecer", "120 ml", "leite"),
            ]),
            ("Recheio de brigadeiro", [
                ("1 lata de leite condensado", "395 g", "leiteCondensado"),
                ("4 colheres (sopa) de chocolate em pó", "30 g", "chocolatePo"),
                ("1 colher (sopa) de manteiga", "20 g", "manteiga"),
                ("1 caixinha de creme de leite", "200 g", "cremeLeite"),
            ]),
            ("Cobertura", [
                ("150 g de chocolate ao leite ou meio amargo picado", "150 g", "chocolate"),
                ("½ caixinha de creme de leite", "100 g", "cremeLeite"),
                ("2 colheres (sopa) de confeitos ou castanhas picadas (opcional)", "20 g", "confeitos"),
            ]),
        ],
        "preparo": [
            "Numa panela, junte o leite condensado, o chocolate em pó e a manteiga. Cozinhe em fogo baixo, mexendo sempre, por cerca de 10 minutos, até engrossar e começar a soltar do fundo.",
            "Desligue, misture o creme de leite e deixe esfriar completamente. O recheio fica mais firme quando frio.",
            "Com uma faca de serra, corte uma tampa de cerca de 3 cm no topo do panetone. Mantenha a forminha de papel: ela segura a estrutura.",
            "Retire o miolo com as mãos ou uma colher, deixando paredes e fundo de uns 2 cm. Esfarele 1 xícara desse miolo e misture ao recheio frio.",
            "Pincele o leite na parte de dentro do panetone e na tampa.",
            "Coloque o recheio dentro do panetone e recoloque a tampa.",
            "Para a cobertura, aqueça o chocolate e o creme de leite no micro-ondas por 30 segundos de cada vez, mexendo, até ficar liso.",
            "Espalhe a cobertura sobre a tampa, deixando escorrer pelas laterais, e decore com os confeitos.",
            "Leve à geladeira por 2 horas. Tire 15 minutos antes de servir e corte com faca de serra.",
        ],
        "dica": "Espere o brigadeiro esfriar de verdade antes de rechear. Morno, ele umedece demais o panetone e "
                "escorre ao cortar. O miolo que sobrar pode virar rabanada ou ser servido com o café.",
        "antes": "Dia 22 ou 23: faça o recheio e guarde na geladeira. Dia 23: monte o panetone. Ele dura até 3 dias "
                 "na geladeira, bem embalado.",
        "foto": "a filled Brazilian panettone with the top cut off, a slice removed revealing a thick creamy chocolate "
                "brigadeiro filling, glossy chocolate glaze dripping down the sides, gold sprinkles",
    },
    {
        "secao": "sobremesas",
        "nome": "Delícia Gelada de Abacaxi com Coco",
        "intro": "Abacaxi em calda, creme de coco e chantilly. Leve, gelada e com cara "
                 "de festa, perfeita para dezembro.",
        "porcoes": "12 porções",
        "tempo": "50 min + 4 h na geladeira",
        "dificuldade": "Fácil",
        "custo": "Barato",
        "ingredientes": [
            ("Abacaxi", [
                ("1 abacaxi médio maduro em cubinhos (cerca de 4 xícaras)", "800 g", "abacaxi"),
                ("½ xícara (chá) de açúcar", "90 g", "acucar"),
            ]),
            ("Creme de coco", [
                ("1 lata de leite condensado", "395 g", "leiteCondensado"),
                ("1 e ½ xícara (chá) de leite", "360 ml", "leite"),
                ("1 vidro de leite de coco", "200 ml", "leiteCoco"),
                ("3 gemas", "—", "ovos"),
                ("3 colheres (sopa) de amido de milho", "30 g", "amido"),
            ]),
            ("Cobertura", [
                ("1 caixinha de chantilly (creme vegetal) bem gelado", "200 ml", "chantilly"),
                ("½ xícara (chá) de coco ralado em flocos", "40 g", "cocoRalado"),
            ]),
        ],
        "preparo": [
            "Leve o abacaxi e o açúcar a uma panela em fogo médio, mexendo de vez em quando, por 15 a 20 minutos, até o líquido reduzir e virar uma calda grossa. Deixe esfriar.",
            "Em outra panela, misture o leite condensado, o leite, o leite de coco, as gemas e o amido de milho antes de ligar o fogo.",
            "Cozinhe em fogo médio, mexendo sem parar, por cerca de 10 minutos, até engrossar. Deixe amornar por 15 minutos.",
            "Separe 3 colheres de abacaxi para decorar. Espalhe o restante no fundo de um refratário de cerca de 20 x 30 cm e cubra com o creme.",
            "Quando esfriar, leve à geladeira por 3 horas, até firmar.",
            "Bata o chantilly bem gelado na batedeira por 3 a 5 minutos, até ficar firme.",
            "Espalhe o chantilly sobre o creme e decore com o abacaxi reservado e o coco ralado. Leve à geladeira por mais 1 hora.",
        ],
        "dica": "Cozinhe o abacaxi até a calda ficar grossa. Se ficar aguado, ele solta líquido na geladeira e a "
                "sobremesa desanda. E o chantilly só bate bem se estiver muito gelado.",
        "antes": "Dia 23: faça a calda de abacaxi e o creme e monte as duas primeiras camadas. O chantilly pode ser "
                 "colocado no dia 23 ou no dia 24 pela manhã.",
        "foto": "a layered chilled pineapple and coconut dessert in a clear glass dish, golden caramelized pineapple layer, "
                "white coconut cream and whipped cream topping sprinkled with toasted coconut flakes, a square portion "
                "served beside it",
    },
    # ------------------------------------------------------------------ ENTRADAS E BEBIDAS
    {
        "secao": "extras",
        "nome": "Patê Cremoso de Ricota com Ervas",
        "intro": "Pronto em 15 minutos, leve e muito saboroso. Ótimo para receber os "
                 "convidados com torradinhas.",
        "porcoes": "10 porções (cerca de 2 xícaras)",
        "tempo": "15 min + 1 h na geladeira",
        "dificuldade": "Fácil",
        "custo": "Barato",
        "ingredientes": [
            (None, [
                ("1 ricota fresca", "250 g", "ricota"),
                ("1 copo de requeijão cremoso", "200 g", "requeijao"),
                ("2 colheres (sopa) de azeite", "30 ml", "azeite"),
                ("1 dente de alho pequeno ralado", "5 g", "alho"),
                ("Suco de ½ limão", "15 ml", "limao"),
                ("½ colher (chá) de sal", "3 g", None),
                ("3 colheres (sopa) de cheiro-verde picado", "10 g", "cheiroverde"),
                ("1 colher (sopa) de manjericão ou hortelã picados", "3 g", "manjericao"),
                ("Pimenta-do-reino moída a gosto", "—", "pimenta"),
            ]),
            ("Para servir", [
                ("1 pacote de torradas ou 1 pão italiano fatiado", "160 g", "torradas"),
            ]),
        ],
        "preparo": [
            "Esfarele a ricota com um garfo.",
            "Bata no processador ou com um mixer a ricota, o requeijão, 1 colher do azeite, o alho, o suco de limão e o sal, até ficar bem cremoso. Sem processador, amasse bem com o garfo e misture com vigor.",
            "Misture o cheiro-verde, o manjericão e a pimenta com uma colher. Prove e acerte o sal.",
            "Passe para uma tigelinha e regue com o azeite restante.",
            "Leve à geladeira por 1 hora para os sabores se misturarem.",
            "Sirva com as torradas.",
        ],
        "dica": "Deixe o alho bem ralado, quase uma pasta, e use pouco: ele fica mais forte depois de algumas horas "
                "na geladeira.",
        "antes": "Dia 23: o patê pode ser feito inteiro e dura até 3 dias na geladeira, em pote fechado.",
        "foto": "a small ceramic bowl of creamy white ricotta herb dip drizzled with olive oil and topped with fresh herbs, "
                "surrounded by golden toasts on a wooden board",
    },
    {
        "secao": "extras",
        "nome": "Bolinho de Bacalhau Sequinho",
        "intro": "Crocante por fora, macio por dentro e com bastante bacalhau. "
                 "Some da travessa em minutos.",
        "porcoes": "35 bolinhos (10 porções)",
        "tempo": "1 h 30 min + dessalgue",
        "dificuldade": "Médio",
        "custo": "Médio",
        "ingredientes": [
            (None, [
                ("300 g de bacalhau salgado desfiado", "300 g", "bacalhauDesfiado"),
                ("3 batatas médias", "500 g", "batata"),
                ("2 colheres (sopa) de azeite", "30 ml", "azeite"),
                ("1 cebola pequena ralada", "100 g", "cebola"),
                ("2 dentes de alho picados", "10 g", "alho"),
                ("3 colheres (sopa) de salsinha picada", "10 g", "cheiroverde"),
                ("2 ovos", "—", "ovos"),
                ("2 colheres (sopa) de farinha de trigo", "16 g", "farinhaTrigo"),
                ("Pimenta-do-reino moída a gosto", "—", "pimenta"),
                ("Sal, só se precisar", "—", None),
                ("Óleo para fritar (cerca de 1 litro)", "1 L", "oleo"),
            ]),
        ],
        "preparo": [
            "Dessalgue o bacalhau na geladeira, em água gelada, de 12 a 24 horas, trocando a água 3 ou 4 vezes.",
            "Cozinhe as batatas com casca em água, sem sal, por 25 a 30 minutos, até ficarem macias. Descasque ainda quentes, passe no espremedor e deixe esfriar.",
            "Coloque o bacalhau em água fervente por 5 minutos e escorra. Esprema bem num pano de prato limpo para tirar a água e desfie bem fininho com os dedos, retirando espinhas.",
            "Numa frigideira, aqueça o azeite e refogue a cebola e o alho por 3 minutos. Junte o bacalhau e refogue por 3 a 4 minutos, até ficar sequinho. Deixe esfriar.",
            "Numa tigela, misture a batata, o bacalhau, a salsinha, os ovos, a farinha e a pimenta. Prove e só coloque sal se precisar.",
            "Modele os bolinhos com duas colheres de sopa, passando a massa de uma para a outra, ou com as mãos untadas.",
            "Aqueça o óleo numa panela funda em fogo médio e frite poucos bolinhos por vez, por 3 a 4 minutos, virando, até dourarem. Escorra em papel-toalha.",
        ],
        "dica": "O bacalhau precisa estar bem seco antes de entrar na massa. Bacalhau úmido faz o bolinho abrir e "
                "encharcar de óleo. Na air fryer: pincele um pouco de óleo e asse a 200 °C por 12 a 15 minutos.",
        "antes": "Dia 23: faça a massa e modele os bolinhos. Guarde na geladeira numa travessa coberta. Também dá "
                 "para congelar crus por até 3 meses e fritar ainda congelados, em fogo médio.",
        "foto": "a pile of golden crispy Portuguese-style codfish fritters (bolinhos de bacalhau) in a ceramic bowl lined "
                "with paper, lemon wedges and parsley, one fritter broken open showing flaky cod",
    },
    {
        "secao": "extras",
        "nome": "Bruschetta nas Cores do Natal",
        "intro": "Vermelho do tomate, verde do manjericão e branco do queijo. Simples, "
                 "barata e linda na mesa de entradas.",
        "porcoes": "20 unidades (8 porções)",
        "tempo": "30 min",
        "dificuldade": "Fácil",
        "custo": "Barato",
        "ingredientes": [
            ("Torradas", [
                ("1 baguete ou pão italiano", "250 g", "baguete"),
                ("2 colheres (sopa) de azeite", "30 ml", "azeite"),
                ("1 dente de alho inteiro descascado", "5 g", "alho"),
            ]),
            ("Cobertura", [
                ("4 tomates italianos maduros, sem sementes, em cubinhos", "500 g", "tomate"),
                ("½ colher (chá) de sal", "3 g", None),
                ("½ cebola roxa bem picadinha", "75 g", "cebolaRoxa"),
                ("1 dente de alho picadinho", "5 g", "alho"),
                ("10 folhas de manjericão fresco, e mais algumas para decorar", "—", "manjericao"),
                ("2 colheres (sopa) de azeite", "30 ml", "azeite"),
                ("1 colher (chá) de vinagre balsâmico (opcional)", "5 ml", "balsamico"),
                ("Pimenta-do-reino moída a gosto", "—", "pimenta"),
                ("150 g de queijo minas frescal em cubinhos (opcional)", "150 g", "queijoMinas"),
            ]),
        ],
        "preparo": [
            "Misture os tomates com o sal e deixe escorrer numa peneira por 10 minutos. Isso tira o excesso de água e o pão não amolece.",
            "Numa tigela, junte o tomate, a cebola roxa, o alho picado, o manjericão rasgado com as mãos, o azeite da cobertura, o vinagre e a pimenta. Guarde na geladeira.",
            "Preaqueça o forno a 200 °C. Corte o pão em 20 fatias de cerca de 1,5 cm, arrume numa assadeira e pincele com o azeite das torradas.",
            "Asse por 8 a 10 minutos, até ficarem douradas e crocantes.",
            "Ainda quentes, esfregue de leve o dente de alho inteiro sobre cada torrada.",
            "Na hora de servir, coloque uma colherada da cobertura em cada torrada, alguns cubinhos de queijo e uma folhinha de manjericão.",
        ],
        "dica": "Monte só na hora de servir. A torrada é crocante e a cobertura é úmida: juntas, elas só ficam "
                "perfeitas por uns 30 minutos.",
        "antes": "Dia 23: asse as torradas e guarde em pote bem fechado (duram até 5 dias). A cobertura pode ser "
                 "feita até 6 horas antes, no dia 24.",
        "foto": "Italian-style bruschetta on toasted baguette slices topped with diced red tomatoes, fresh green basil "
                "leaves and small white cheese cubes, arranged on a long rectangular slate or wooden board",
    },
    {
        "secao": "extras",
        "nome": "Ponche de Frutas sem Álcool",
        "intro": "Colorido, geladinho e para todas as idades. Fica lindo numa poncheira "
                 "de vidro no centro da mesa.",
        "porcoes": "3 litros (15 copos)",
        "tempo": "20 min + 2 h na geladeira",
        "dificuldade": "Fácil",
        "custo": "Barato",
        "ingredientes": [
            ("Frutas", [
                ("1 lata de pêssego em calda, picado (com a calda)", "400 g", "pessego"),
                ("1 maçã vermelha em cubinhos, com casca", "150 g", "macaVermelha"),
                ("1 xícara (chá) de uvas sem semente cortadas ao meio", "150 g", "uva"),
                ("1 xícara (chá) de abacaxi em cubinhos", "150 g", "abacaxi"),
                ("1 laranja em rodelas finas", "—", "laranja"),
            ]),
            ("Líquidos", [
                ("1 litro de suco de uva integral, gelado", "1 L", "sucoUva"),
                ("1,5 litro de refrigerante de guaraná ou soda limonada, bem gelado", "1,5 L", "refrigerante"),
            ]),
            ("Para servir", [
                ("1 ramo de hortelã", "—", "hortela"),
                ("Gelo a gosto", "—", "gelo"),
            ]),
        ],
        "preparo": [
            "Pique as frutas em cubinhos do mesmo tamanho. Deixe a casca da maçã, que dá cor.",
            "Numa poncheira ou jarra grande, junte o pêssego com a calda, a maçã, as uvas, o abacaxi e o suco de uva. Misture.",
            "Leve à geladeira por 2 horas para as frutas pegarem sabor.",
            "Na hora de servir, junte o refrigerante bem gelado, as rodelas de laranja, as folhas de hortelã e o gelo.",
        ],
        "dica": "Coloque o refrigerante só na hora de servir, para não perder o gás. Para o ponche não aguar, faça "
                "cubos de gelo com suco de uva.",
        "antes": "Dia 23: pique o abacaxi e as uvas e guarde na geladeira. Dia 24 pela manhã: prepare a base com as "
                 "frutas e o suco. A maçã, pique no dia 24, porque escurece.",
        "foto": "a large clear glass punch bowl filled with red grape fruit punch, floating diced peaches, apples, grapes, "
                "pineapple and orange slices, mint leaves, a ladle and glasses beside it",
    },
    {
        "secao": "extras",
        "nome": "Chá Gelado de Hibisco, Laranja e Canela",
        "intro": "Vermelho rubi, perfumado e refrescante. Uma bebida diferente, barata e "
                 "com sabor de Natal.",
        "porcoes": "2 litros (10 copos)",
        "tempo": "20 min + 3 h na geladeira",
        "dificuldade": "Fácil",
        "custo": "Barato",
        "ingredientes": [
            (None, [
                ("6 xícaras (chá) de água", "1,5 L", None),
                ("2 paus de canela", "—", "canelaPau"),
                ("4 cravos-da-índia", "—", "cravo"),
                ("½ xícara (chá) de flor de hibisco seca", "15 g", "hibisco"),
                ("½ xícara (chá) de açúcar ou mel (ou a gosto)", "90 g", "acucar"),
                ("Suco de 3 laranjas (cerca de 1 xícara)", "240 ml", "laranja"),
            ]),
            ("Para servir", [
                ("1 laranja em rodelas", "—", "laranja"),
                ("Gelo e folhas de hortelã", "—", "hortela"),
            ]),
        ],
        "preparo": [
            "Ferva a água com a canela e os cravos por 5 minutos.",
            "Desligue o fogo, junte o hibisco, tampe e deixe em infusão por 10 minutos, não mais que isso, para não amargar.",
            "Coe e adoce ainda quente, mexendo até dissolver.",
            "Deixe esfriar, junte o suco de laranja e leve à geladeira por pelo menos 3 horas.",
            "Sirva numa jarra com as rodelas de laranja, gelo e hortelã.",
        ],
        "dica": "Nunca ferva o hibisco junto com a água: ele fica amargo. Desligue o fogo antes de colocar as flores. "
                "Atenção: o chá de hibisco não é indicado para gestantes.",
        "antes": "Dia 23: faça o chá inteiro. Ele dura até 3 dias na geladeira, em jarra fechada. Acrescente as "
                 "rodelas de laranja e o gelo só na hora.",
        "foto": "a tall glass pitcher and two glasses of deep ruby-red iced hibiscus tea with orange slices, cinnamon "
                "sticks, ice cubes and mint, dried hibiscus flowers scattered on the table",
    },
]

# ---------------------------------------------------------------------- LISTA DE COMPRAS
# chave -> (nome na lista, categoria)
COMPRAS = {
    # Carnes, aves e peixes
    "peru": ("Peru inteiro (cerca de 4 kg)", "Carnes, aves e peixes"),
    "tender": ("Tender (cerca de 1,5 kg)", "Carnes, aves e peixes"),
    "lombo": ("Lombo suíno (1,5 kg)", "Carnes, aves e peixes"),
    "pernil": ("Pernil suíno (cerca de 3 kg)", "Carnes, aves e peixes"),
    "bacalhau": ("Bacalhau em postas (1 kg)", "Carnes, aves e peixes"),
    "bacalhauDesfiado": ("Bacalhau desfiado (300 g)", "Carnes, aves e peixes"),
    "frango": ("Peito de frango sem osso (600 g)", "Carnes, aves e peixes"),
    "bacon": ("Bacon em cubos (200 g)", "Carnes, aves e peixes"),
    "calabresa": ("Linguiça calabresa (1 unidade)", "Carnes, aves e peixes"),
    # Frios, laticínios e ovos
    "presunto": ("Presunto (100 g)", "Frios, laticínios e ovos"),
    "ovos": ("Ovos", "Frios, laticínios e ovos"),
    "manteiga": ("Manteiga", "Frios, laticínios e ovos"),
    "leite": ("Leite integral", "Frios, laticínios e ovos"),
    "cremeLeite": ("Creme de leite (caixinha 200 g)", "Frios, laticínios e ovos"),
    "leiteCondensado": ("Leite condensado (lata 395 g)", "Frios, laticínios e ovos"),
    "mussarela": ("Mussarela ralada (150 g)", "Frios, laticínios e ovos"),
    "parmesao": ("Queijo parmesão ralado", "Frios, laticínios e ovos"),
    "ricota": ("Ricota fresca (250 g)", "Frios, laticínios e ovos"),
    "requeijao": ("Requeijão cremoso (200 g)", "Frios, laticínios e ovos"),
    "queijoMinas": ("Queijo minas frescal (150 g)", "Frios, laticínios e ovos"),
    "chantilly": ("Chantilly / creme vegetal (200 ml)", "Frios, laticínios e ovos"),
    "maionese": ("Maionese", "Frios, laticínios e ovos"),
    # Hortifrúti
    "alho": ("Alho", "Hortifrúti"),
    "cebola": ("Cebola", "Hortifrúti"),
    "cebolaRoxa": ("Cebola roxa", "Hortifrúti"),
    "batata": ("Batata", "Hortifrúti"),
    "cenoura": ("Cenoura", "Hortifrúti"),
    "tomate": ("Tomate italiano", "Hortifrúti"),
    "pimentaoVermelho": ("Pimentão vermelho", "Hortifrúti"),
    "pimentaoAmarelo": ("Pimentão amarelo ou verde", "Hortifrúti"),
    "salsao": ("Salsão", "Hortifrúti"),
    "laranja": ("Laranja", "Hortifrúti"),
    "limao": ("Limão taiti", "Hortifrúti"),
    "abacaxi": ("Abacaxi", "Hortifrúti"),
    "macaVerde": ("Maçã verde", "Hortifrúti"),
    "macaVermelha": ("Maçã vermelha", "Hortifrúti"),
    "uva": ("Uva sem semente", "Hortifrúti"),
    "cheiroverde": ("Cheiro-verde (salsinha e cebolinha)", "Hortifrúti"),
    "alecrim": ("Alecrim fresco", "Hortifrúti"),
    "manjericao": ("Manjericão fresco", "Hortifrúti"),
    "hortela": ("Hortelã", "Hortifrúti"),
    # Mercearia
    "arroz": ("Arroz branco", "Mercearia"),
    "farinhaMandioca": ("Farinha de mandioca torrada", "Mercearia"),
    "farinhaTrigo": ("Farinha de trigo", "Mercearia"),
    "amido": ("Amido de milho", "Mercearia"),
    "acucar": ("Açúcar refinado", "Mercearia"),
    "mascavo": ("Açúcar mascavo", "Mercearia"),
    "mel": ("Mel", "Mercearia"),
    "azeite": ("Azeite de oliva", "Mercearia"),
    "oleo": ("Óleo para fritura", "Mercearia"),
    "vinagre": ("Vinagre", "Mercearia"),
    "balsamico": ("Vinagre balsâmico", "Mercearia"),
    "mostarda": ("Mostarda", "Mercearia"),
    "milho": ("Milho verde (lata)", "Mercearia"),
    "ervilha": ("Ervilha (lata)", "Mercearia"),
    "azeitonaVerde": ("Azeitona verde", "Mercearia"),
    "azeitonaPreta": ("Azeitona preta", "Mercearia"),
    "passa": ("Uva-passa", "Mercearia"),
    "castanha": ("Castanha-de-caju ou amêndoas", "Mercearia"),
    "abacaxiLata": ("Abacaxi em rodelas em calda (lata)", "Mercearia"),
    "pessego": ("Pêssego em calda (lata)", "Mercearia"),
    "cereja": ("Cereja em calda", "Mercearia"),
    "leiteCoco": ("Leite de coco (200 ml)", "Mercearia"),
    "cocoRalado": ("Coco ralado em flocos", "Mercearia"),
    "chocolate": ("Chocolate em barra (meio amargo ou ao leite)", "Mercearia"),
    "chocolatePo": ("Chocolate em pó", "Mercearia"),
    "baunilha": ("Essência de baunilha", "Mercearia"),
    "confeitos": ("Confeitos para decorar", "Mercearia"),
    "batataPalha": ("Batata palha (120 g)", "Mercearia"),
    "hibisco": ("Flor de hibisco seca", "Mercearia"),
    # Temperos
    "pimenta": ("Pimenta-do-reino moída", "Temperos e especiarias"),
    "louro": ("Folhas de louro", "Temperos e especiarias"),
    "paprica": ("Páprica doce", "Temperos e especiarias"),
    "nozMoscada": ("Noz-moscada", "Temperos e especiarias"),
    "cravo": ("Cravo-da-índia", "Temperos e especiarias"),
    "canelaPo": ("Canela em pó", "Temperos e especiarias"),
    "canelaPau": ("Canela em pau", "Temperos e especiarias"),
    # Padaria
    "paoFrances": ("Pão francês (4 unidades, do dia 23)", "Padaria e biscoitos"),
    "baguete": ("Baguete ou pão italiano", "Padaria e biscoitos"),
    "torradas": ("Torradas (pacote)", "Padaria e biscoitos"),
    "bolachaMaisena": ("Bolacha maisena (pacote 200 g)", "Padaria e biscoitos"),
    "panetone": ("Panetone ou chocotone (500 g)", "Padaria e biscoitos"),
    # Bebidas
    "vinho": ("Vinho branco seco (para cozinhar)", "Bebidas"),
    "sucoUva": ("Suco de uva integral (1 L)", "Bebidas"),
    "refrigerante": ("Guaraná ou soda limonada (1,5 L)", "Bebidas"),
    "gelo": ("Gelo", "Bebidas"),
}

ORDEM_CATEGORIAS = [
    "Carnes, aves e peixes",
    "Frios, laticínios e ovos",
    "Hortifrúti",
    "Mercearia",
    "Temperos e especiarias",
    "Padaria e biscoitos",
    "Bebidas",
    "Utilidades",
]

# Itens que não são ingredientes, mas fazem falta no dia
UTILIDADES = [
    "Papel-alumínio (rolo grande)",
    "Filme plástico",
    "Papel-toalha",
    "Sacos próprios para alimentos (para marinar)",
    "Potes com tampa",
    "Guardanapos",
]
