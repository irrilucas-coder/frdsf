#!/usr/bin/env python3
"""Gera as falas dos vídeos em português (voz padrão Matheus) pela API do Vibi
e monta src/elevador/falas.json com a duração e o tempo de cada palavra da legenda.

Uso:  VIBI_API_KEY=sk_... python3 scripts/vozes-pt.py freio|fila [L1 L4 ...]
      (sem ids gera todas; --so-json só recalcula a legenda a partir dos áudios existentes)

Cada fala gerada é conferida: o áudio é transcrito (speech-to-text do Vibi) e comparado
com o roteiro. Se tiver palavra repetida, faltando ou trocada, gera de novo (até 4 tentativas).
A transcrição também dá o tempo real de cada palavra, usado na legenda.
"""
import difflib, json, os, re, subprocess, sys, time, unicodedata

API = "https://api.vibi.pro/v1"
MODELO = "eleven_v3"  # voz expressiva: aceita marcações de emoção como [curious], [gasps]
VOZES = {"narrador": "36rVQA1AOIPwpA3Hg1tC"}  # Matheus - voz padrão do canal

# Uso: python3 scripts/vozes-pt.py freio|fila [L1 L2 ...]
PROJETOS = {
    "freio": [
        ("L0", "[curious] Como um carro a cem por hora consegue parar em poucos segundos?"),
        ("L1", "Se você está a cem por hora e tenta parar com o pé no chão, [laughs] fica sem sola e sem pé."),
        ("L2", "Então você encosta um bloco de madeira na roda e puxa uma alavanca. O atrito freia a roda. Esse é o freio de sapata."),
        ("L3", "Mas a madeira esquenta, gasta rápido e, numa descida, [gasps] pega fogo."),
        ("L4", "Então você coloca um tambor de metal na roda e empurra duas sapatas contra ele, por dentro. Esse é o freio a tambor."),
        ("L5", "Só que, em freadas fortes e seguidas, o tambor esquenta tanto que o freio perde a força."),
        ("L6", "Então você troca o tambor por um disco que gira com a roda, e duas pastilhas apertam o disco dos dois lados. O vento esfria o disco. Esse é o freio a disco."),
        ("L7", "Mas pra apertar as quatro rodas ao mesmo tempo, você precisaria de quatro pés. [laughs]"),
        ("L8", "Então você liga o pedal a canos cheios de óleo. Quando você pisa, o óleo empurra as pastilhas nas quatro rodas com a mesma força. Esse é o fluido de freio."),
        ("L9", "Mas numa freada de susto, [gasps] a roda trava, o pneu desliza e você perde o controle."),
        ("L10", "Então você coloca um sensor em cada roda. Quando ela começa a travar, o sistema solta e aperta o freio várias vezes por segundo. Esse é o ABS."),
        ("L11", "[excited] Parabéns! Você construiu um freio. Conhece alguém que só freia em cima da hora? [laughs] Manda pra ele."),
    ],
    "fila": [
        ("L0", "[curious] Por que a fila do lado sempre anda mais rápido?"),
        ("L1", "Não é azar. [laughs] É matemática. Olha só."),
        ("L2", "Num mercado com três caixas, você escolhe uma. Pra sua fila ser a mais rápida, ela tem que ganhar das outras duas."),
        ("L3", "Ou seja: só uma chance em três. Em duas de cada três vezes, alguma fila do lado vai andar mais rápido que a sua."),
        ("L4", "E basta um imprevisto: o cliente que esqueceu a senha, [sighs] o produto sem código, a moeda que caiu no chão."),
        ("L5", "Uma demora dessas trava a sua fila inteira, e as outras continuam andando."),
        ("L6", "Ainda tem o seu cérebro: quando a sua fila anda, você nem percebe. Mas quando ela para, você lembra por semanas."),
        ("L7", "Por isso alguns bancos e aeroportos usam fila única: todo mundo numa fila só, e o próximo vai para o primeiro caixa livre."),
        ("L8", "Assim, o imprevisto não prende só uma fila, e o tempo de espera fica mais justo e mais previsível."),
        ("L9", "Então, fica a dica: se tiver fila única, não reclama. Ela é a mais justa."),
        ("L10", "Conhece alguém que vive trocando de fila? [laughs] Manda pra ele."),
    ],
    # ---- Versões remodeladas para o público do México (voz David, mexicano) ----
    "freio-mx": [
        ("L0", "[curious] ¿Cómo hace un carro a cien kilómetros por hora para frenar en unos segundos?"),
        ("L1", "Si vas a cien y tratas de frenar con el pie en el pavimento, [laughs] te quedas sin suela y sin pie."),
        ("L2", "Entonces le pegas un bloque de madera a la llanta y jalas una palanca. La fricción frena la rueda. Ese es el freno de zapata."),
        ("L3", "Pero la madera se calienta, se gasta rapidísimo y, en una bajada, [gasps] se prende."),
        ("L4", "Entonces pones un tambor de metal en la rueda y empujas dos zapatas contra él, por dentro. Ese es el freno de tambor."),
        ("L5", "Pero si frenas fuerte varias veces seguidas, el tambor se calienta tanto que el freno pierde fuerza."),
        ("L6", "Entonces cambias el tambor por un disco que gira con la rueda, y dos balatas lo aprietan por los dos lados. El aire enfría el disco. Ese es el freno de disco."),
        ("L7", "Pero para apretar las cuatro llantas al mismo tiempo, ocuparías cuatro pies. [laughs]"),
        ("L8", "Entonces conectas el pedal a unos tubos llenos de líquido. Cuando pisas, el líquido empuja las balatas en las cuatro llantas con la misma fuerza. Ese es el líquido de frenos."),
        ("L9", "Pero en un frenón de susto, [gasps] la llanta se bloquea, el carro se derrapa y pierdes el control."),
        ("L10", "Entonces pones un sensor en cada rueda. Cuando empieza a bloquearse, el sistema suelta y aprieta el freno varias veces por segundo. Ese es el ABS."),
        ("L11", "[excited] ¡Felicidades! Construiste un freno. ¿Conoces a alguien que siempre frena de último momento? [laughs] Mándaselo."),
    ],
    "fila-mx": [
        ("L0", "[curious] ¿Por qué la fila de al lado siempre avanza más rápido?"),
        ("L1", "No es mala suerte. [laughs] Son matemáticas. Mira."),
        ("L2", "En el súper hay tres cajas y tú eliges una. Para que tu fila sea la más rápida, tiene que ganarle a las otras dos."),
        ("L3", "O sea, solo tienes una oportunidad de tres. Dos de cada tres veces, alguna fila de al lado va a avanzar más rápido que la tuya."),
        ("L4", "Y basta con un imprevisto: el señor que no se sabe el NIP, [sighs] el producto sin código, las monedas que se caen al piso."),
        ("L5", "Una tardanza así frena toda tu fila, y las otras siguen avanzando."),
        ("L6", "Y luego está tu cerebro: cuando tu fila avanza, ni lo notas. Pero cuando se detiene, te acuerdas por semanas."),
        ("L7", "Por eso algunos bancos y aeropuertos usan fila única: todos en una sola fila, y el siguiente pasa a la primera caja libre."),
        ("L8", "Así un imprevisto no atora solo una fila, y la espera es más justa y más predecible."),
        ("L9", "Así que ya sabes: si hay fila única, no te quejes. Es la más justa."),
        ("L10", "¿Conoces a alguien que siempre se cambia de fila? [laughs] Mándaselo."),
    ],
    # ---- Documentário: Cristiano Ronaldo deixa a seleção (notícia de 05/11/2026) ----
    "cr7": [
        ("L0", "[suspenseful] Acabou. Depois de vinte e três anos, Cristiano Ronaldo não vai mais vestir a camisa de Portugal."),
        ("L1", "No dia cinco de novembro, aos quarenta e um anos, ele anunciou num vídeo nas redes sociais: [sighs] Portugal estará sempre em mim."),
        ("L2", "Tudo começou em dois mil e três, quando um garoto de dezoito anos estreou pela seleção."),
        ("L3", "Depois vieram os títulos: [excited] a Eurocopa de dois mil e dezesseis e duas Ligas das Nações."),
        ("L4", "E os recordes: duzentos e trinta e quatro jogos e cento e quarenta e seis gols. Nenhum jogador marcou mais por uma seleção na história."),
        ("L5", "Mas em julho, a Espanha eliminou Portugal nas oitavas da Copa do Mundo, com um gol nos acréscimos."),
        ("L6", "Em setembro, veio a briga. Depois de começar no banco contra a Noruega, Ronaldo acusou o técnico Jorge Jesus de não cumprir o combinado, [gasps] e abandonou a concentração."),
        ("L7", "A Federação Portuguesa suspendeu Ronaldo por trinta dias e ainda aplicou uma multa."),
        ("L8", "Semanas depois, um dia antes da nova convocação, veio o adeus."),
        ("L9", "Jorge Jesus disse que pediu pra ele ficar, [sighs] mas que tem que aceitar a decisão."),
        ("L10", "Ronaldo segue jogando pelo Al Nassr, na Arábia Saudita. Mas a camisa sete de Portugal agora está livre."),
        ("L11", "[curious] E pra você, quem merece herdar a camisa sete? Comenta aqui."),
    ],
}
IDIOMAS = {"freio-mx": "es", "fila-mx": "es"}
VOZES_PROJETO = {"freio-mx": "qRUgOhnxGASxirG4fKjv", "fila-mx": "qRUgOhnxGASxirG4fKjv"}  # David - mexicano
PROJETO = next((a for a in sys.argv[1:] if a in PROJETOS), None)
if not PROJETO:
    sys.exit("Uso: python3 scripts/vozes-pt.py freio|fila|freio-mx|fila-mx [L1 ...]")
FALAS = [(fid, "narrador", txt) for fid, txt in PROJETOS[PROJETO]]
IDIOMA = IDIOMAS.get(PROJETO, "pt")
if PROJETO in VOZES_PROJETO:
    VOZES = {"narrador": VOZES_PROJETO[PROJETO]}

chave = os.environ.get("VIBI_API_KEY")
if not chave:
    sys.exit("Defina VIBI_API_KEY")
raiz = os.path.join(os.path.dirname(__file__), "..")
pasta_audio = os.path.join(raiz, "public", PROJETO)
os.makedirs(pasta_audio, exist_ok=True)
so_json = "--so-json" in sys.argv  # recalcula o JSON sem gastar créditos


def curl(*args):
    out = subprocess.run(["curl", "-sS", "--max-time", "120", "-H", f"xi-api-key: {chave}", *args],
                         check=True, capture_output=True)
    return out.stdout


def separa(legenda):
    """Devolve (texto falado, [(palavra da tela, peso)])."""
    falado, tokens = [], []
    legenda = re.sub(r"\{([^}]+)\}", lambda m: "{" + m.group(1).replace(" ", "\u00a0") + "}", legenda)
    for parte in legenda.split(" "):
        if re.fullmatch(r"\[[a-z ]+\]", parte):
            falado.append(parte)
            continue
        m = re.match(r"^(.*?)\{(.+)\}(.*)$", parte)
        if m:
            tela = m.group(1) + m.group(3)
            voz = m.group(2) + m.group(3)
        else:
            tela = voz = parte
        voz = voz.replace("\u00a0", " ")
        falado.append(voz)
        # peso ~ quanto tempo leva pra falar; pontuação vira pausa
        peso = len(re.sub(r"[^\wÀ-ú]", "", voz)) + 1.5
        if re.search(r"[,:]$", voz):
            peso += 3
        if re.search(r"[.!?…]$", voz):
            peso += 6
        tokens.append((tela, peso))
    return " ".join(falado).replace("{", "").replace("}", ""), tokens


def duracao(caminho):
    out = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", caminho],
                         check=True, capture_output=True, text=True)
    return float(out.stdout)


def silencio_inicio_fim(caminho):
    """Acha onde a fala começa e termina (corta silêncio das pontas)."""
    out = subprocess.run(["ffmpeg", "-i", caminho, "-af", "silencedetect=n=-40dB:d=0.12", "-f", "null", "-"],
                         capture_output=True, text=True).stderr
    ini = [float(x) for x in re.findall(r"silence_start: ([\d.]+)", out)]
    fim = [float(x) for x in re.findall(r"silence_end: ([\d.]+)", out)]
    total = duracao(caminho)
    comeco = fim[0] if ini and ini[0] < 0.05 and fim else 0.0
    termino = ini[-1] if ini and (len(fim) < len(ini) or fim[-1] >= total - 0.05) and ini[-1] > comeco else total
    return comeco, termino


# Ritmo de vídeo curto: narrador um pouco mais rápido (sem mudar o tom da voz)
VELOCIDADE = {"narrador": 1.1}


def acelera(origem, destino, quem):
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", origem, "-af", f"atempo={VELOCIDADE[quem]}",
                    "-b:a", "160k", destino], check=True)


def pausas_internas(caminho, comeco, termino):
    out = subprocess.run(["ffmpeg", "-i", caminho, "-af", "silencedetect=n=-38dB:d=0.13", "-f", "null", "-"],
                         capture_output=True, text=True).stderr
    ini = [float(x) for x in re.findall(r"silence_start: ([\d.]+)", out)]
    fim = [float(x) for x in re.findall(r"silence_end: ([\d.]+)", out)]
    return [((a + b) / 2) for a, b in zip(ini, fim) if a > comeco + 0.1 and b < termino - 0.1]


def distribui(tokens, comeco, termino):
    soma = sum(p for _, p in tokens)
    t, saida = comeco, []
    for tela, peso in tokens:
        d = (termino - comeco) * peso / soma
        saida.append([tela, t, t + d])
        t += d
    return saida


def normaliza(texto):
    t = unicodedata.normalize("NFD", texto.lower())
    t = "".join(c for c in t if unicodedata.category(c) != "Mn")
    t = re.sub(r"(\d)-(\d)", r"\1 \2", t)
    # palavras com o mesmo som não contam como erro (ex.: "cem" e "sem")
    HOMOFONOS = {"cem": "sem", "cento": "sento", "conserto": "concerto"}
    return [HOMOFONOS.get(w, w) for w in re.findall(r"[a-z0-9']+", t)]


def transcreve(arq):
    tarefa = json.loads(curl("-X", "POST", "-F", "model_id=scribe_v1", "-F", f"language_code={IDIOMA}",
                             "-F", f"file=@{arq}", f"{API}/speech-to-text"))
    for _ in range(90):
        info = json.loads(curl(f"{API}/speech-to-text/{tarefa['task_id']}"))
        if info["status"] == "completed":
            return info["result"]
        if info["status"] == "failed":
            raise RuntimeError(f"transcrição falhou: {info}")
        time.sleep(2)
    raise RuntimeError("transcrição demorou demais")


def _problemas(esperado, ouvido):
    sm = difflib.SequenceMatcher(a=esperado, b=ouvido, autojunk=False)
    out = []
    for op, a1, a2, b1, b2 in sm.get_opcodes():
        if op == "equal":
            continue
        a, b = " ".join(esperado[a1:a2]), " ".join(ouvido[b1:b2])
        if op == "replace" and difflib.SequenceMatcher(a=a, b=b).ratio() > 0.75:
            continue
        # número escrito diferente ("50" x "cinquenta"): não é erro de fala
        if op == "replace" and (re.search(r"\d", a) or re.search(r"\d", b)):
            continue
        out.append(f"{op}: roteiro='{a}' áudio='{b}'")
    return out


def confere(tela_texto, stt, falado_texto=""):
    """Compara o áudio transcrito com o roteiro (texto da tela e texto falado; vale o mais parecido)."""
    ouvido = normaliza(stt["text"])
    candidatos = [_problemas(normaliza(tela_texto), ouvido)]
    if falado_texto:
        candidatos.append(_problemas(normaliza(falado_texto), ouvido))
    problemas = min(candidatos, key=len)
    repetidas = [w for i, w in enumerate(ouvido[1:], 1) if w == ouvido[i - 1] and len(w) > 2]
    # número dito duas vezes seguidas (o erro do vídeo do submarino)
    # número dito duas vezes colado (ex.: "1900-1900" ou "1900 1900"), não números iguais em lugares diferentes
    dobrados = re.findall(r"\b(\d+)[\s-]+\1\b", stt["text"])
    if repetidas:
        problemas.append(f"palavra repetida: {repetidas}")
    if dobrados:
        problemas.append(f"número repetido: {dobrados}")
    return problemas


def tempos_reais(tokens, stt, comeco, termino):
    """Casa cada palavra da legenda com a palavra transcrita e usa o tempo real dela."""
    palavras_stt = [w for w in stt.get("words", []) if w.get("type") == "word"]
    alvo = [(normaliza(t) or [""])[0] for t, _ in tokens]
    ouvido = [(normaliza(w["text"]) or [""])[0] for w in palavras_stt]
    sm = difflib.SequenceMatcher(a=alvo, b=ouvido, autojunk=False)
    inicio = [None] * len(tokens)
    fim = [None] * len(tokens)
    for op, a1, a2, b1, b2 in sm.get_opcodes():
        if op in ("equal", "replace") and (a2 - a1) == (b2 - b1):
            for k in range(a2 - a1):
                inicio[a1 + k] = palavras_stt[b1 + k]["start"]
                fim[a1 + k] = palavras_stt[b1 + k]["end"]
    estimado = distribui(tokens, comeco, termino)
    for i in range(len(tokens)):
        if inicio[i] is None:
            inicio[i], fim[i] = estimado[i][1], estimado[i][2]
    return [{"texto": t, "inicio": round(inicio[i], 3), "fim": round(max(fim[i], inicio[i] + 0.08), 3)}
            for i, (t, _) in enumerate(tokens)]


def gera(fid, quem, texto, arq):
    corpo = json.dumps({"text": texto, "model_id": MODELO, "language_code": IDIOMA,
                        "voice_settings": {"stability": 0.5, "similarity_boost": 0.8, "style": 0.35}})
    tarefa = json.loads(curl("-X", "POST", "-H", "Content-Type: application/json", "-d", corpo,
                             f"{API}/text-to-speech/{VOZES[quem]}?output_format=mp3_44100_128"))
    for _ in range(90):
        info = json.loads(curl(f"{API}/history/{tarefa['id']}"))
        if info["status"] == "completed":
            break
        if info["status"] == "failed":
            sys.exit(f"{fid} falhou: {info.get('error')}")
        time.sleep(2)
    bruto = arq.replace(".mp3", ".bruto.mp3")
    with open(bruto, "wb") as f:
        f.write(curl(info["result"]["audio_url"]))
    acelera(bruto, arq, quem)
    os.remove(bruto)
    return info["credits_deducted"]


pedidos = [a for a in sys.argv[1:] if not a.startswith("--") and a not in PROJETOS]
relatorio = []

resultado = []
for fid, quem, legenda in FALAS:
    texto, tokens = separa(legenda)
    arq = os.path.join(pasta_audio, f"{fid}.mp3")
    tela_texto = " ".join(t for t, _ in tokens)
    stt = None
    if not so_json and (not pedidos or fid in pedidos):
        for tentativa in range(1, 5):
            creditos = gera(fid, quem, texto, arq)
            stt = transcreve(arq)
            problemas = confere(tela_texto, stt, texto)
            if not problemas:
                print(f"{fid} ok na tentativa {tentativa} ({creditos} créditos) -> {stt['text']}")
                relatorio.append(f"{fid}: OK (tentativa {tentativa})")
                break
            print(f"{fid} tentativa {tentativa} com problema: {problemas}")
        else:
            relatorio.append(f"{fid}: AINDA COM PROBLEMA {problemas}")
    elif not so_json:
        stt = transcreve(arq)
        problemas = confere(tela_texto, stt, texto)
        relatorio.append(f"{fid}: {'OK' if not problemas else 'PROBLEMA ' + str(problemas)} (sem regerar)")
    total = duracao(arq)
    comeco, termino = silencio_inicio_fim(arq)
    # Ancora as pausas reais do áudio nas vírgulas/pontos mais próximos e redistribui
    estimado = distribui(tokens, comeco, termino)
    quebras = [i for i, (tela, _) in enumerate(tokens) if re.search(r"[,:.!?…]$", tela) and i < len(tokens) - 1]
    ancoras = {}
    for pausa in pausas_internas(arq, comeco, termino):
        livres = [i for i in quebras if i not in ancoras]
        if not livres:
            break
        melhor = min(livres, key=lambda i: abs(estimado[i][2] - pausa))
        if abs(estimado[melhor][2] - pausa) < 1.2:
            ancoras[melhor] = pausa
    if stt is not None:
        palavras = tempos_reais(tokens, stt, comeco, termino)
        with open(arq.replace(".mp3", ".stt.json"), "w") as f:
            json.dump(stt, f, ensure_ascii=False)
        resultado.append({"id": fid, "quem": quem, "duracao": round(total, 3), "palavras": palavras})
        continue
    cache = arq.replace(".mp3", ".stt.json")
    if os.path.exists(cache):
        palavras = tempos_reais(tokens, json.load(open(cache)), comeco, termino)
        resultado.append({"id": fid, "quem": quem, "duracao": round(total, 3), "palavras": palavras})
        continue
    palavras, ini_seg, idx = [], comeco, 0
    for corte in sorted(ancoras) + [len(tokens) - 1]:
        fim_seg = ancoras.get(corte, termino)
        for tela, a, b in distribui(tokens[idx:corte + 1], ini_seg, fim_seg):
            palavras.append({"texto": tela, "inicio": round(a, 3), "fim": round(b, 3)})
        idx, ini_seg = corte + 1, fim_seg
    resultado.append({"id": fid, "quem": quem, "duracao": round(total, 3), "palavras": palavras})

destino = os.path.join(raiz, "src", PROJETO, "falas.json")
os.makedirs(os.path.dirname(destino), exist_ok=True)
with open(destino, "w") as f:
    json.dump(resultado, f, ensure_ascii=False, indent=1)
print("falas.json ok")
if relatorio:
    print("\n=== CONFERÊNCIA DAS FALAS ===")
    print("\n".join(relatorio))
