#!/bin/bash
# Revisão automática de um vídeo (barata): integridade, quadros pretos/congelados, áudio e um
# mosaico pequeno com 12 quadros para uma olhada rápida.
# Uso: scripts/qa-video.sh videos/arquivo.mp4 [pasta_saida]
F="$1"; OUT="${2:-/tmp}"; N=$(basename "$F" .mp4)
DUR=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$F")
echo "== $N ($(printf '%.1f' $DUR)s, $(ffprobe -v error -select_streams v -show_entries stream=width,height,r_frame_rate -of csv=p=0 "$F"))"
ERR=$(ffmpeg -v error -i "$F" -f null - 2>&1 | wc -l); echo "erros de decodificação: $ERR"
ffmpeg -v info -i "$F" -vf "blackdetect=d=0.15:pix_th=0.06,freezedetect=n=0.002:d=1.2" -an -f null - 2>&1 \
  | grep -oE "black_start:[0-9.]+ black_end:[0-9.]+|freeze_start: [0-9.]+|freeze_duration: [0-9.]+" | tr '\n' ' ' | sed 's/^/pretos\/congelados: /'; echo
ffmpeg -v info -i "$F" -af "silencedetect=n=-45dB:d=1.5,astats=metadata=0:reset=0,ebur128=framelog=quiet" -vn -f null - 2>&1 \
  | grep -E "silence_start|silence_end|Peak level dB|  I:" | awk '{$1=$1};1' | sort -u | head -8
ffmpeg -v error -y -i "$F" -vf "fps=12/$DUR,scale=180:-1,tile=6x2" -frames:v 1 "$OUT/$N-mosaico.jpg"
echo "mosaico: $OUT/$N-mosaico.jpg"
