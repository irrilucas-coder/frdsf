#!/usr/bin/env python3
"""Monta a biblioteca de efeitos sonoros a partir do Openverse (sons do Freesound).

- Só baixa efeitos com licença CC0 (livre total, sem precisar de crédito, seguro para monetizar).
- Não precisa de chave de API.
- Corta o silêncio do começo/fim e deixa todos no mesmo volume (loudnorm), para não estourar.
- Salva em public/sfx/<categoria>/1.mp3, 2.mp3, ... e registra a origem em public/sfx/creditos.json.

Uso:  python3 scripts/buscar-sons.py            (baixa só as categorias que ainda não existem)
      python3 scripts/buscar-sons.py --refazer  (baixa tudo de novo)
      python3 scripts/buscar-sons.py boom pop   (só essas categorias)
"""
import json
import os
import subprocess
import sys
import time
import urllib.parse
import urllib.request

API = "https://api.openverse.org/v1/audio/"
POR_CATEGORIA = 3

# categoria: (busca, duração mínima ms, duração máxima ms, volume alvo LUFS)
CATEGORIAS = {
    "whoosh": ("whoosh swoosh transition", 250, 1600, -18),
    "pop": ("pop bubble cartoon", 40, 700, -18),
    "boom": ("cinematic boom impact", 700, 5000, -16),
    "explosao": ("explosion", 1000, 5000, -16),
    "erro": ("wrong answer buzzer", 300, 2200, -19),
    "acerto": ("success notification chime", 300, 2500, -19),
    "splash": ("water splash", 300, 2500, -18),
    "bolhas": ("underwater bubbles", 800, 5000, -21),
    "alarme": ("submarine alarm", 800, 5000, -21),
    "manivela": ("ratchet crank wind", 400, 3500, -20),
    "broca": ("drill metal", 400, 3500, -21),
    "sonar": ("sonar ping", 400, 5000, -20),
    "impacto": ("punch hit impact", 80, 900, -18),
    "tique": ("clock tick", 40, 600, -22),
    "suspense": ("suspense tension riser", 2500, 12000, -22),
    "subida": ("riser swell", 800, 4000, -20),
}

raiz = os.path.join(os.path.dirname(__file__), "..", "public", "sfx")
os.makedirs(raiz, exist_ok=True)
arq_creditos = os.path.join(raiz, "creditos.json")
creditos = json.load(open(arq_creditos)) if os.path.exists(arq_creditos) else {}

args = [a for a in sys.argv[1:] if not a.startswith("--")]
refazer = "--refazer" in sys.argv
escolhidas = args or list(CATEGORIAS)


def busca(q, pagina=1):
    params = urllib.parse.urlencode(
        {"q": q, "license": "cc0", "source": "freesound", "page_size": 20, "page": pagina, "mature": "false"}
    )
    req = urllib.request.Request(f"{API}?{params}", headers={"User-Agent": "animacoes-sfx/1.0"})
    with urllib.request.urlopen(req, timeout=40) as r:
        return json.load(r)["results"]


def baixa(url, destino):
    req = urllib.request.Request(url, headers={"User-Agent": "animacoes-sfx/1.0"})
    with urllib.request.urlopen(req, timeout=60) as r, open(destino, "wb") as f:
        f.write(r.read())


def trata(origem, destino, lufs):
    # corta silêncio nas pontas, normaliza volume e limita picos
    filtro = (
        "silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.02,"
        "areverse,silenceremove=start_periods=1:start_threshold=-50dB:start_silence=0.05,areverse,"
        f"loudnorm=I={lufs}:TP=-2:LRA=11,alimiter=limit=0.8"
    )
    subprocess.run(
        ["ffmpeg", "-y", "-loglevel", "error", "-i", origem, "-af", filtro,
         "-ar", "44100", "-ac", "2", "-b:a", "160k", destino],
        check=True,
    )


tmp = os.path.join(raiz, ".tmp")
os.makedirs(tmp, exist_ok=True)
for cat in escolhidas:
    q, dmin, dmax, lufs = CATEGORIAS[cat]
    pasta = os.path.join(raiz, cat)
    if os.path.isdir(pasta) and len(os.listdir(pasta)) >= POR_CATEGORIA and not refazer:
        print(f"{cat}: já existe")
        continue
    os.makedirs(pasta, exist_ok=True)
    candidatos = []
    for pagina in (1, 2):
        candidatos += [r for r in busca(q, pagina) if r.get("duration") and dmin <= r["duration"] <= dmax and r.get("url")]
        if len(candidatos) >= POR_CATEGORIA:
            break
        time.sleep(2)
    escolhidos = candidatos[:POR_CATEGORIA]
    creditos[cat] = []
    for i, r in enumerate(escolhidos, 1):
        bruto = os.path.join(tmp, f"{cat}{i}.mp3")
        baixa(r["url"], bruto)
        trata(bruto, os.path.join(pasta, f"{i}.mp3"), lufs)
        creditos[cat].append({
            "arquivo": f"{cat}/{i}.mp3",
            "titulo": r["title"],
            "autor": r.get("creator"),
            "licenca": f"{r['license']} {r.get('license_version') or ''}".strip(),
            "origem": r["foreign_landing_url"],
            "duracao_ms": r["duration"],
        })
    print(f"{cat}: {len(escolhidos)} sons -> " + " | ".join(r["title"][:30] for r in escolhidos))
    time.sleep(2)

for f in os.listdir(tmp):
    os.remove(os.path.join(tmp, f))
os.rmdir(tmp)
json.dump(creditos, open(arq_creditos, "w"), ensure_ascii=False, indent=1)
print("creditos.json ok")
