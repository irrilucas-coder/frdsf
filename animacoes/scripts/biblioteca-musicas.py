#!/usr/bin/env python3
"""Monta a biblioteca de trilhas musicais livres a partir da Wikimedia Commons (via busca do Openverse).

- Só aceita licenças CC0, domínio público (pdm) ou CC BY (gratuita, exige crédito na descrição do vídeo).
- Sem chave de API e sem custo.
- Normaliza o volume (loudnorm) e salva em public/musicas/<categoria>/<nome>.mp3.
- public/musicas/creditos.json guarda a linha de crédito pronta de cada faixa.

Uso: python3 scripts/biblioteca-musicas.py
"""
import json
import os
import re
import subprocess
import tempfile
import time
import urllib.error
import urllib.parse
import urllib.request

API = "https://api.openverse.org/v1/audio/"
UA = {"User-Agent": "animacoes-video-builder/1.0 (projeto pessoal de videos educativos)"}

# categoria: [títulos a procurar]
CATALOGO = {
    "curiosidade": ["Monkeys Spinning Monkeys", "Hep Cats", "Fluffing a Duck", "Sneaky Snitch", "Home Base Groove"],
    "suspense": ["Investigations", "Deliberate Thought", "Darkling", "Ossuary"],
    "aventura": ["Mega Hyper Ultrastorm", "Volatile Reaction", "Digital Bark"],
    "noticia": ["Infados", "Dark Glitch Technology", "Lifelike"],
    "leve": ["Cattails", "Carefree", "Wallpaper"],
}
LICENCAS_OK = {"cc0", "pdm", "by"}

raiz = os.path.join(os.path.dirname(__file__), "..", "public", "musicas")
os.makedirs(raiz, exist_ok=True)
tmp = tempfile.mkdtemp(prefix="mus-")


def busca(titulo):
    q = urllib.parse.urlencode({"q": titulo, "source": "wikimedia_audio", "page_size": 20})
    with urllib.request.urlopen(urllib.request.Request(f"{API}?{q}", headers=UA), timeout=40) as r:
        res = json.load(r)["results"]
    palavras = titulo.lower().split()
    for item in res:
        nome = item["title"].lower()
        if item["license"] in LICENCAS_OK and all(p in nome for p in palavras) and (item.get("duration") or 0) > 40000:
            return item
    return None


def slug(t):
    return re.sub(r"[^a-z0-9]+", "-", t.lower()).strip("-")[:40]


creditos = {}
for cat, titulos in CATALOGO.items():
    os.makedirs(os.path.join(raiz, cat), exist_ok=True)
    for titulo in titulos:
        item = busca(titulo)
        if not item:
            print(f"{cat}: '{titulo}' não encontrado com licença livre")
            continue
        bruto = os.path.join(tmp, slug(titulo))
        if os.path.exists(os.path.join(raiz, cat, f"{slug(titulo)}.mp3")):
            print(f"{cat}: {titulo} já existe")
            continue
        for tentativa in range(3):  # respeita o limite da Wikimedia: espera e tenta de novo
            try:
                with urllib.request.urlopen(urllib.request.Request(item["url"], headers=UA), timeout=120) as r, open(bruto, "wb") as f:
                    f.write(r.read())
                break
            except urllib.error.HTTPError as e:
                if e.code != 429 or tentativa == 2:
                    raise
                print("  Wikimedia pediu calma, esperando 90 s…")
                time.sleep(90)
        time.sleep(12)  # pausa entre downloads
        destino = os.path.join(raiz, cat, f"{slug(titulo)}.mp3")
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", bruto, "-t", "150", "-af", "loudnorm=I=-20:TP=-2:LRA=11",
                        "-ar", "44100", "-ac", "2", "-b:a", "160k", destino], check=True, timeout=180)
        os.remove(bruto)
        autor = item.get("creator") or "autor desconhecido"
        lic = item["license"]
        versao = item.get("license_version") or ""
        if lic == "by":
            credito = f'"{titulo}" – {autor}. Licença Creative Commons CC BY {versao}. Fonte: Wikimedia Commons.'
        else:
            credito = f'"{titulo}" – {autor} ({"domínio público" if lic == "pdm" else "CC0"}).'
        creditos[f"{cat}/{slug(titulo)}.mp3"] = {
            "titulo": item["title"],
            "autor": autor,
            "licenca": f"{lic} {versao}".strip(),
            "origem": item.get("foreign_landing_url"),
            "credito": credito,
        }
        print(f"{cat}: {titulo} ok ({lic} {versao})")

json.dump(creditos, open(os.path.join(raiz, "creditos.json"), "w"), ensure_ascii=False, indent=1)
os.rmdir(tmp)
print("biblioteca de músicas pronta")
