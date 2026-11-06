#!/usr/bin/env python3
"""Coleta um retrato de um canal do YouTube (sem chave de API).

Uso: python3 monitoramento/coletar.py <handle> [pasta_saida]
Ex.: python3 monitoramento/coletar.py Custki monitoramento/custki

Fontes: página /@handle/shorts (inscritos, nº de vídeos, todos os Shorts
visíveis com views) + feed RSS (data de publicação dos 15 mais recentes).
Grava:
  <saida>/snapshots.jsonl  - uma linha por coleta (histórico)
  <saida>/videos.json      - estado atual de cada vídeo (primeira vez visto,
                             data, views ao longo do tempo)
  <saida>/resumo.md        - tabela legível gerada a cada coleta
"""
import json
import os
import re
import sys
import urllib.request
import xml.etree.ElementTree as ET
from datetime import datetime, timezone

UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/130 Safari/537.36")


def get(url):
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept-Language": "pt-BR"})
    with urllib.request.urlopen(req, timeout=30) as r:
        return r.read().decode("utf-8")


def parse_count(txt):
    """'1,1 mi de visualizações' -> 1100000 ; '605 mil' -> 605000"""
    if not txt:
        return None
    t = txt.replace("\xa0", " ").lower()
    m = re.search(r"([\d.,]+)\s*(mil|mi|bi)?", t)
    if not m:
        return None
    n = float(m.group(1).replace(".", "").replace(",", "."))
    mult = {"mil": 1e3, "mi": 1e6, "bi": 1e9}.get(m.group(2), 1)
    return int(n * mult)


def walk(o, out):
    if isinstance(o, dict):
        if "shortsLockupViewModel" in o:
            v = o["shortsLockupViewModel"]
            vid = v.get("onTap", {}).get("innertubeCommand", {}).get("reelWatchEndpoint", {}).get("videoId")
            om = v.get("overlayMetadata", {})
            out.append({"id": vid, "titulo": om.get("primaryText", {}).get("content"),
                        "views_txt": om.get("secondaryText", {}).get("content")})
        if "videoRenderer" in o:
            v = o["videoRenderer"]
            out.append({"id": v["videoId"], "titulo": v["title"]["runs"][0]["text"],
                        "views_txt": v.get("viewCountText", {}).get("simpleText")})
        for x in o.values():
            walk(x, out)
    elif isinstance(o, list):
        for x in o:
            walk(x, out)


def main():
    handle = sys.argv[1].lstrip("@")
    out_dir = sys.argv[2] if len(sys.argv) > 2 else f"monitoramento/{handle.lower()}"
    os.makedirs(out_dir, exist_ok=True)
    now = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

    html = get(f"https://www.youtube.com/@{handle}/shorts")
    data = json.loads(re.search(r"var ytInitialData = (\{.*?\});</script>", html).group(1))
    hdr = json.dumps(data.get("header", {}), ensure_ascii=False)
    subs = re.search(r'"content": "([^"]*inscritos)"', hdr)
    nvid = re.search(r'"content": "([\d.,]+\s*v[ií]deos?)"', hdr)
    channel_id = data.get("metadata", {}).get("channelMetadataRenderer", {}).get("externalId")

    items = []
    walk(data.get("contents", {}), items)
    seen, vids = set(), []
    for it in items:
        if it["id"] and it["id"] not in seen:
            seen.add(it["id"])
            it["views"] = parse_count(it["views_txt"])
            vids.append(it)

    # datas exatas e views exatas via RSS (15 mais recentes)
    dates = {}
    if channel_id:
        ns = {"a": "http://www.w3.org/2005/Atom", "m": "http://search.yahoo.com/mrss/",
              "yt": "http://www.youtube.com/xml/schemas/2015"}
        root = ET.fromstring(get(f"https://www.youtube.com/feeds/videos.xml?channel_id={channel_id}"))
        for e in root.findall("a:entry", ns):
            vid = e.find("yt:videoId", ns).text
            st = e.find("m:group/m:community/m:statistics", ns)
            dates[vid] = {"publicado": e.find("a:published", ns).text,
                          "views_exatas": int(st.get("views")) if st is not None else None}

    snap = {"coletado_em": now, "inscritos": subs.group(1) if subs else None,
            "videos": nvid.group(1) if nvid else None, "channel_id": channel_id,
            "lista": [{"id": v["id"], "views": dates.get(v["id"], {}).get("views_exatas") or v["views"]}
                      for v in vids]}
    with open(os.path.join(out_dir, "snapshots.jsonl"), "a", encoding="utf-8") as f:
        f.write(json.dumps(snap, ensure_ascii=False) + "\n")

    vpath = os.path.join(out_dir, "videos.json")
    state = json.load(open(vpath, encoding="utf-8")) if os.path.exists(vpath) else {}
    novos = []
    for v in vids:
        s = state.get(v["id"])
        views = dates.get(v["id"], {}).get("views_exatas") or v["views"]
        if not s:
            s = state[v["id"]] = {"titulo": v["titulo"], "primeira_vez_visto": now,
                                  "publicado": None, "historico_views": []}
            novos.append(v["titulo"])
        s["titulo"] = v["titulo"]
        if v["id"] in dates:
            s["publicado"] = dates[v["id"]]["publicado"]
        s["historico_views"].append([now, views])
    with open(vpath, "w", encoding="utf-8") as f:
        json.dump(state, f, ensure_ascii=False, indent=1)

    # ordem da página (mais novo primeiro); vídeos que sumiram da página vão ao fim
    order = [v["id"] for v in vids] + [k for k in state if k not in seen]
    rows = [(k, state[k]) for k in order]
    lines = [f"# @{handle} — resumo automático", "",
             f"Última coleta: {now} · {snap['inscritos']} · {snap['videos']}", "",
             f"Vídeos novos nesta coleta: {len(novos)}" + (" — " + "; ".join(novos) if novos else ""), "",
             "| Publicado | Título | Views agora | Δ desde a coleta anterior |", "|---|---|---:|---:|"]
    for vid, s in rows:
        h = s["historico_views"]
        cur = h[-1][1]
        delta = (cur - h[-2][1]) if len(h) > 1 and cur is not None and h[-2][1] is not None else None
        pub = (s["publicado"] or "")[:16].replace("T", " ") or "?"
        lines.append(f"| {pub} | [{s['titulo']}](https://youtube.com/shorts/{vid}) | "
                     f"{cur:,} | {'' if delta is None else f'{delta:+,}'} |".replace(",", "."))
    with open(os.path.join(out_dir, "resumo.md"), "w", encoding="utf-8") as f:
        f.write("\n".join(lines) + "\n")

    print(f"{now}: {snap['inscritos']}, {snap['videos']}, {len(vids)} na página, {len(novos)} novos")


if __name__ == "__main__":
    main()
