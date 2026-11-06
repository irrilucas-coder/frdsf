#!/usr/bin/env python3
"""Gera as falas do vídeo "Como o Submarino Foi Inventado" pela API do Vibi
e monta src/submarino/falas.json com a duração e o tempo de cada palavra da legenda.

Uso:  VIBI_API_KEY=sk_... python3 scripts/vozes-submarino.py [L1 L4 ...]
      (sem ids gera todas; --so-json só recalcula a legenda a partir dos áudios existentes)

Cada fala gerada é conferida: o áudio é transcrito (speech-to-text do Vibi) e comparado
com o roteiro. Se tiver palavra repetida, faltando ou trocada, gera de novo (até 4 tentativas).
A transcrição também dá o tempo real de cada palavra, usado na legenda.
"""
import difflib, json, os, re, subprocess, sys, time, unicodedata

API = "https://api.vibi.pro/v1"
MODELO = "eleven_multilingual_v2"
VOZES = {
    "narrador": "KYiPxIY4UPHAGI5KsrPJ",  # Johnny - Cheerful & Lively
    "drebbel": "6PhbMr9YjdeOaTNz9y24",  # Davi Leão - Natural & Conversational
    "ezra": "Qm7jWQB7wyQQFcNsORBD",  # Lucao - Brasil Interior
    "holland": "jKCVPYeBYhiBZRS5hbIL",  # Rozeng - Mature, Deep
}

# Cada fala: (id, quem, legenda). Na legenda, "1620{mil seiscentos e vinte}" mostra 1620
# na tela mas manda o texto entre chaves para a voz.
FALAS = [
    ("L0", "narrador", "Imagina entrar num barco que afunda… de propósito."),
    ("L1", "narrador", "Em 1620{mil seiscentos e vinte}, o inventor holandês Cornelis Drebbel cobriu um barco a remo com couro engraxado e mergulhou no rio Tâmisa, em Londres."),
    ("L2", "drebbel", "Remem, pessoal! E ninguém abre a janela!"),
    ("L3", "narrador", "Funcionou! Eles ficaram horas debaixo d'água."),
    ("L4", "narrador", "Em 1776{mil setecentos e setenta e seis}, na guerra de independência dos Estados Unidos, David Bushnell criou o Turtle: um submarino pra uma pessoa, movido a manivela."),
    ("L5", "ezra", "Minhas pernas! Isso é pior que academia!"),
    ("L6", "narrador", "A missão era prender uma bomba no navio inimigo… mas a broca não furou o casco."),
    ("L7", "narrador", "Em 1864{mil oitocentos e sessenta e quatro}, o Hunley virou o primeiro submarino a afundar um navio de guerra… mas também afundou logo depois."),
    ("L8", "narrador", "Até que, em 1900{mil e novecentos}, John Philip Holland juntou tudo: motor a gasolina na superfície e baterias elétricas debaixo d'água. A Marinha americana comprou!"),
    ("L9", "holland", "Agora sim: ele mergulha e volta!"),
    ("L10", "narrador", "Em 1954{mil novecentos e cinquenta e quatro} veio o Nautilus, o primeiro submarino nuclear. E em 1958{mil novecentos e cinquenta e oito} ele passou por baixo do Polo Norte!"),
    ("L11", "narrador", "De um barco de couro até um gigante que atravessa o oceano escondido. Qual invenção você quer ver agora? Comenta aí!"),
]

chave = os.environ.get("VIBI_API_KEY")
if not chave:
    sys.exit("Defina VIBI_API_KEY")
raiz = os.path.join(os.path.dirname(__file__), "..")
pasta_audio = os.path.join(raiz, "public", "submarino")
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
VELOCIDADE = {"narrador": 1.14, "drebbel": 1.06, "ezra": 1.06, "holland": 1.04}


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
    return re.findall(r"[a-z0-9']+", t)


def transcreve(arq):
    tarefa = json.loads(curl("-X", "POST", "-F", "model_id=scribe_v1", "-F", "language_code=pt",
                             "-F", f"file=@{arq}", f"{API}/speech-to-text"))
    for _ in range(90):
        info = json.loads(curl(f"{API}/speech-to-text/{tarefa['task_id']}"))
        if info["status"] == "completed":
            return info["result"]
        if info["status"] == "failed":
            raise RuntimeError(f"transcrição falhou: {info}")
        time.sleep(2)
    raise RuntimeError("transcrição demorou demais")


def confere(tela_texto, stt):
    """Compara o que devia ser dito (texto da tela, com números em dígitos) com o que foi dito."""
    esperado = normaliza(tela_texto)
    ouvido = normaliza(stt["text"])
    sm = difflib.SequenceMatcher(a=esperado, b=ouvido, autojunk=False)
    problemas = []
    for op, a1, a2, b1, b2 in sm.get_opcodes():
        if op == "equal":
            continue
        a, b = " ".join(esperado[a1:a2]), " ".join(ouvido[b1:b2])
        # o STT às vezes escreve número diferente do roteiro (ex.: "pra" x "para"); tolera trocas pequenas
        if op == "replace" and difflib.SequenceMatcher(a=a, b=b).ratio() > 0.75:
            continue
        problemas.append(f"{op}: roteiro='{a}' áudio='{b}'")
    repetidas = [w for i, w in enumerate(ouvido[1:], 1) if w == ouvido[i - 1] and len(w) > 2]
    if repetidas:
        problemas.append(f"palavra repetida: {repetidas}")
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
    corpo = json.dumps({"text": texto, "model_id": MODELO, "language_code": "pt",
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


pedidos = [a for a in sys.argv[1:] if not a.startswith("--")]
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
            problemas = confere(tela_texto, stt)
            if not problemas:
                print(f"{fid} ok na tentativa {tentativa} ({creditos} créditos) -> {stt['text']}")
                relatorio.append(f"{fid}: OK (tentativa {tentativa})")
                break
            print(f"{fid} tentativa {tentativa} com problema: {problemas}")
        else:
            relatorio.append(f"{fid}: AINDA COM PROBLEMA {problemas}")
    elif not so_json:
        stt = transcreve(arq)
        problemas = confere(tela_texto, stt)
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

destino = os.path.join(raiz, "src", "submarino", "falas.json")
os.makedirs(os.path.dirname(destino), exist_ok=True)
with open(destino, "w") as f:
    json.dump(resultado, f, ensure_ascii=False, indent=1)
print("falas.json ok")
if relatorio:
    print("\n=== CONFERÊNCIA DAS FALAS ===")
    print("\n".join(relatorio))
