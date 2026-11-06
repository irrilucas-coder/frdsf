#!/usr/bin/env python3
"""Monta a biblioteca de efeitos sonoros dos vídeos usando só fontes gratuitas e livres (CC0):

- Open Game SFX Index (GitHub): pacotes do Kenney.nl e do OpenGameArt, ~1450 efeitos.
- uisfx (npm): efeitos de interface em 12 estilos.

Sem chave de API e sem custo. Cada efeito é cortado (sem silêncio nas pontas), equalizado em volume
(loudnorm) e salvo em public/sfx/<categoria>/1.mp3, 2.mp3...  A origem fica em public/sfx/creditos.json.

Uso: python3 scripts/biblioteca-sfx.py
"""
import json
import os
import shutil
import subprocess
import tarfile
import tempfile
import urllib.request

INDEX = "https://raw.githubusercontent.com/Mcamento8/open-game-sfx-index/main/index.json"
UISFX = "uisfx@0.4.0"

# categoria -> (volume alvo em LUFS, [fontes])
#   ("kenney", pacote, título)  -> Open Game SFX Index
#   ("uisfx", estilo, nome)     -> pacote uisfx
CATEGORIAS = {
    "whoosh": (-19, [("uisfx", "cinematic", "swipe"), ("kenney", "oga-battle", "swish 3"),
                     ("uisfx", "dreamy", "swipe"), ("kenney", "oga-battle", "swish 2")]),
    "pop": (-19, [("kenney", "interface-sounds", "drop 002"), ("kenney", "interface-sounds", "pluck 001"),
                  ("uisfx", "rubber", "select"), ("kenney", "interface-sounds", "drop 003")]),
    "impacto": (-18, [("kenney", "oga-hits-punches", "hit05.mp3"), ("kenney", "oga-hits-punches", "hit12.mp3"),
                      ("kenney", "oga-hits-punches", "hit20.mp3")]),
    "explosao": (-17, [("kenney", "sci-fi-sounds", "lowFrequency explosion 000"),
                       ("kenney", "sci-fi-sounds", "explosionCrunch 000"),
                       ("kenney", "sci-fi-sounds", "lowFrequency explosion 001")]),
    "erro": (-20, [("uisfx", "cinematic", "error"), ("kenney", "interface-sounds", "error 006"),
                   ("kenney", "interface-sounds", "error 004")]),
    "acerto": (-20, [("kenney", "music-jingles", "jingles PIZZI00"), ("uisfx", "cinematic", "success"),
                     ("kenney", "music-jingles", "jingles HIT04")]),
    "conquista": (-20, [("uisfx", "arcade", "level-up"), ("uisfx", "cinematic", "achievement"),
                        ("kenney", "oga-levelup-powerup", "Upper01")]),
    "agua": (-20, [("kenney", "sci-fi-sounds", "slime 000"), ("kenney", "sci-fi-sounds", "slime 001"),
                   ("kenney", "oga-rpg-pack", "slime3")]),
    "bolhas": (-22, [("kenney", "oga-rpg-pack", "bubble"), ("kenney", "oga-rpg-pack", "bubble2"),
                     ("kenney", "oga-rpg-pack", "bubble3")]),
    "alarme": (-22, [("kenney", "oga-levelup-powerup", "Alarm"), ("uisfx", "cinematic", "warning"),
                     ("uisfx", "scifi", "warning")]),
    "sonar": (-21, [("uisfx", "cinematic", "scanning"), ("uisfx", "scifi", "scanning"),
                    ("uisfx", "glass", "scanning")]),
    "mecanico": (-21, [("kenney", "rpg-audio", "creak1"), ("kenney", "rpg-audio", "metalLatch"),
                       ("uisfx", "mechanical", "processing")]),
    "motor": (-23, [("kenney", "sci-fi-sounds", "engineCircular 000"), ("kenney", "sci-fi-sounds", "forceField 000"),
                    ("kenney", "sci-fi-sounds", "engineCircular 002")]),
    "tique": (-23, [("uisfx", "minimal", "progress-step"), ("kenney", "interface-sounds", "click 002"),
                    ("uisfx", "glass", "progress-step")]),
    "tensao": (-24, [("kenney", "sci-fi-sounds", "spaceEngineLarge 000"), ("kenney", "sci-fi-sounds", "forceField 002"),
                     ("kenney", "sci-fi-sounds", "spaceEngineLarge 001")]),
    "subida": (-21, [("kenney", "oga-levelup-powerup", "Rise02"), ("kenney", "oga-levelup-powerup", "Rise04"),
                     ("kenney", "digital-audio", "phaserUp3")]),
}

raiz = os.path.join(os.path.dirname(__file__), "..", "public", "sfx")
tmp = tempfile.mkdtemp(prefix="sfx-")


def baixa(url, destino):
    with urllib.request.urlopen(url, timeout=60) as r, open(destino, "wb") as f:
        f.write(r.read())


def trata(origem, destino, lufs):
    """Corta silêncio, equaliza volume e limita picos. Sons contínuos (sem silêncio) às vezes
    travam o corte de silêncio no ffmpeg; nesses casos só equaliza."""
    normaliza = f"loudnorm=I={lufs}:TP=-3:LRA=11,alimiter=limit=0.75"
    corte = (
        "silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.01,"
        "areverse,silenceremove=start_periods=1:start_threshold=-50dB:start_silence=0.05,areverse,"
    )
    for filtro in (corte + normaliza, normaliza):
        try:
            subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-t", "10", "-i", origem, "-af", filtro,
                            "-ar", "44100", "-ac", "2", "-b:a", "160k", destino], check=True, timeout=40)
            if os.path.getsize(destino) > 500:
                return
        except (subprocess.TimeoutExpired, subprocess.CalledProcessError):
            pass
    raise RuntimeError(f"não consegui tratar {origem}")


# --- fonte 1: índice do Kenney/OpenGameArt
print("baixando índice do Open Game SFX Index…")
with urllib.request.urlopen(INDEX, timeout=60) as r:
    sons = json.load(r)["sounds"]
por_titulo = {(s["pack"], s["title"]): s for s in sons}

# --- fonte 2: pacote uisfx (só arquivos de áudio, nada é executado)
print("baixando uisfx do npm…")
subprocess.run(["npm", "pack", UISFX, "--silent", "--pack-destination", tmp], check=True, capture_output=True)
tgz = next(f for f in os.listdir(tmp) if f.endswith(".tgz"))
with tarfile.open(os.path.join(tmp, tgz)) as t:
    membros = [m for m in t.getmembers() if m.isfile() and m.name.startswith("package/sounds/") and m.name.endswith(".mp3")]
    t.extractall(tmp, members=membros, filter="data")

if os.path.isdir(raiz):
    shutil.rmtree(raiz)
creditos = {}
for cat, (lufs, fontes) in CATEGORIAS.items():
    os.makedirs(os.path.join(raiz, cat), exist_ok=True)
    creditos[cat] = []
    for i, fonte in enumerate(fontes, 1):
        bruto = os.path.join(tmp, f"{cat}{i}")
        if fonte[0] == "kenney":
            s = por_titulo[(fonte[1], fonte[2])]
            url = s.get("download_url_ogg") or s.get("download_url_mp3") or s.get("download_url_wav") or s.get("download_url_flac")
            baixa(url, bruto)
            origem = {"fonte": f"{fonte[1]} ({s['source']})", "licenca": s["license"], "titulo": s["title"]}
        else:
            caminho = os.path.join(tmp, "package", "sounds", fonte[1], f"{fonte[2]}.mp3")
            shutil.copy(caminho, bruto)
            origem = {"fonte": f"uisfx/{fonte[1]}", "licenca": "CC0-1.0", "titulo": fonte[2]}
        destino = os.path.join(raiz, cat, f"{i}.mp3")
        trata(bruto, destino, lufs)
        creditos[cat].append({"arquivo": f"{cat}/{i}.mp3", **origem})
    print(f"{cat}: {len(fontes)}")

json.dump(creditos, open(os.path.join(raiz, "creditos.json"), "w"), ensure_ascii=False, indent=1)
shutil.rmtree(tmp)
print("biblioteca pronta em public/sfx/")
