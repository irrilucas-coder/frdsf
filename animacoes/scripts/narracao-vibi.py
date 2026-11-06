#!/usr/bin/env python3
"""Gera as falas da narração pela API do Vibi (compatível com ElevenLabs).

Uso:  VIBI_API_KEY=sk_... python3 scripts/narracao-vibi.py
A chave vem só da variável de ambiente; nunca escreva ela em arquivo do repositório.
Os MP3 vão para public/audio/fala1.mp3 ... fala5.mp3
"""
import json, os, subprocess, sys, time

API = "https://api.vibi.pro/v1"
VOZ = "lWq4KDY8znfkV0DrK8Vb"  # Yasmin Alves - Light, Clear and Musical (pt-BR)
MODELO = "eleven_multilingual_v2"
FALAS = [
    "Bip vivia sozinho numa ilhazinha no céu...",
    "Até que, numa noite... uma estrela caiu!",
    "Ele plantou a estrela com todo o cuidado...",
    "...e dela nasceu uma árvore de luz.",
    "Agora, o céu inteiro brilha com ele.",
]

chave = os.environ.get("VIBI_API_KEY")
if not chave:
    sys.exit("Defina VIBI_API_KEY")
destino = os.path.join(os.path.dirname(__file__), "..", "public", "audio")


def curl(*args):
    out = subprocess.run(["curl", "-sS", "--max-time", "120", "-H", f"xi-api-key: {chave}", *args],
                         check=True, capture_output=True)
    return out.stdout


for i, texto in enumerate(FALAS, 1):
    corpo = json.dumps({"text": texto, "model_id": MODELO, "language_code": "pt",
                        "voice_settings": {"stability": 0.45, "similarity_boost": 0.8, "style": 0.35}})
    tarefa = json.loads(curl("-X", "POST", "-H", "Content-Type: application/json", "-d", corpo,
                             f"{API}/text-to-speech/{VOZ}?output_format=mp3_44100_128"))
    for _ in range(60):
        info = json.loads(curl(f"{API}/history/{tarefa['id']}"))
        if info["status"] == "completed":
            break
        if info["status"] == "failed":
            sys.exit(f"Fala {i} falhou: {info.get('error')}")
        time.sleep(2)
    audio = curl(info["result"]["audio_url"])
    with open(os.path.join(destino, f"fala{i}.mp3"), "wb") as f:
        f.write(audio)
    print(f"fala{i}.mp3 ok ({info['credits_deducted']} créditos)")
