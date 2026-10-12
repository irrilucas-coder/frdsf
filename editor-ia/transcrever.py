#!/usr/bin/env python3
"""Transcreve a fala de um vídeo e gera um .srt (com tempos), sem internet, usando Whisper via sherpa-onnx.

Uso:  python3 editor-ia/transcrever.py video.mp4 [--modelos pasta] [--saida video.srt]

Instalação (uma vez):
  pip install sherpa-onnx numpy
  baixar para editor-ia/modelos/ (ou indicar outra pasta com --modelos):
    https://github.com/k2-fsa/sherpa-onnx/releases/download/asr-models/sherpa-onnx-whisper-small.tar.bz2  (extrair)
    https://github.com/k2-fsa/sherpa-onnx/releases/download/asr-models/silero_vad.onnx

O .srt serve para o Claude saber o que é falado e quando, e posicionar as cenas.
Cada trecho de fala vira um bloco; trechos longos são quebrados em blocos de até ~6 palavras.
"""
import os, subprocess, sys
import numpy as np
import sherpa_onnx

AQUI = os.path.dirname(os.path.abspath(__file__))
TAXA = 16000


def audio(video):
    bruto = subprocess.run(["ffmpeg", "-v", "error", "-i", video, "-ac", "1", "-ar", str(TAXA), "-f", "f32le", "-"],
                           capture_output=True, check=True).stdout
    return np.frombuffer(bruto, dtype=np.float32)


def tempo(s):
    ms = int(round(s * 1000))
    return f"{ms // 3600000:02}:{ms // 60000 % 60:02}:{ms // 1000 % 60:02},{ms % 1000:03}"


def main():
    args = sys.argv[1:]
    if not args:
        sys.exit(__doc__)
    video = args[0]
    pasta = args[args.index("--modelos") + 1] if "--modelos" in args else os.path.join(AQUI, "modelos")
    saida = args[args.index("--saida") + 1] if "--saida" in args else os.path.splitext(video)[0] + ".srt"
    w = os.path.join(pasta, "sherpa-onnx-whisper-small")

    reconhecedor = sherpa_onnx.OfflineRecognizer.from_whisper(
        encoder=os.path.join(w, "small-encoder.int8.onnx"),
        decoder=os.path.join(w, "small-decoder.int8.onnx"),
        tokens=os.path.join(w, "small-tokens.txt"),
        language="pt", task="transcribe", num_threads=os.cpu_count() or 4,
    )
    cfg = sherpa_onnx.VadModelConfig()
    cfg.silero_vad.model = os.path.join(pasta, "silero_vad.onnx")
    cfg.silero_vad.min_silence_duration = 0.2   # pausas curtas já separam trechos → tempos mais precisos
    cfg.silero_vad.min_speech_duration = 0.15
    cfg.silero_vad.max_speech_duration = 12
    cfg.sample_rate = TAXA
    vad = sherpa_onnx.VoiceActivityDetector(cfg, buffer_size_in_seconds=600)

    amostras = audio(video)
    janela = cfg.silero_vad.window_size
    trechos = []

    def esvaziar():
        while not vad.empty():
            seg = vad.front
            ini = seg.start / TAXA
            s = reconhecedor.create_stream()
            s.accept_waveform(TAXA, seg.samples)
            reconhecedor.decode_stream(s)
            texto = s.result.text.strip()
            if texto:
                trechos.append((ini, ini + len(seg.samples) / TAXA, texto))
            vad.pop()

    for i in range(0, len(amostras), janela):
        vad.accept_waveform(amostras[i:i + janela])
        esvaziar()
    vad.flush()
    esvaziar()

    # quebra trechos longos em blocos curtos, dividindo o tempo pelo tamanho das palavras
    blocos = []
    for ini, fim, texto in trechos:
        ws = texto.split()
        pesos = [len(x) + 2 for x in ws]
        total, t = sum(pesos), ini
        for k in range(0, len(ws), 6):
            p = sum(pesos[k:k + 6])
            d = (fim - ini) * p / total
            blocos.append((t, t + d, " ".join(ws[k:k + 6])))
            t += d

    with open(saida, "w", encoding="utf-8") as f:
        for n, (a, b, txt) in enumerate(blocos, 1):
            f.write(f"{n}\n{tempo(a)} --> {tempo(b)}\n{txt}\n\n")
    print(f"{len(blocos)} blocos → {saida}")


if __name__ == "__main__":
    main()
