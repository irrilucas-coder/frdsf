// Compara pares de vídeo "antes" (UGC bruto) e "depois" (editado no CapCut) para descobrir o estilo de edição.
// Uso: node editor-ia/analisar.js [pasta-dos-exemplos] [--limiar 0.2]
// Pasta padrão: exemplos/aura-fresh — arquivos em pares: 01-antes.mp4 + 01-depois.mp4, 02-antes.mov + 02-depois.mov...
// Precisa de ffmpeg e ffprobe instalados. Resultado em editor-ia/analise/<par>/ (relatorio.json, resumo.md e mosaicos).
const { execFileSync, spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const args = process.argv.slice(2);
const flag = args.indexOf("--limiar");
const LIMIAR = flag >= 0 ? Number(args.splice(flag, 2)[1]) : 0.2;
const PASTA = path.resolve(args[0] || path.join(__dirname, "..", "exemplos", "aura-fresh"));
const SAIDA = path.join(__dirname, "analise");
const VIDEO = /\.(mp4|mov|m4v|webm|mkv)$/i;

const r2 = (n) => Math.round(n * 100) / 100;
const media = (xs) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);
const mediana = (xs) => {
  if (!xs.length) return 0;
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};

// ffmpeg escreve os filtros de análise no stderr
function ffmpegLog(entrada, filtroArgs) {
  const r = spawnSync("ffmpeg", ["-hide_banner", "-nostats", "-i", entrada, ...filtroArgs, "-f", "null", "-"], {
    encoding: "utf8",
    maxBuffer: 256 * 1024 * 1024,
  });
  return r.stderr || "";
}

function info(arquivo) {
  const j = JSON.parse(
    execFileSync("ffprobe", ["-v", "error", "-print_format", "json", "-show_format", "-show_streams", arquivo], { encoding: "utf8" })
  );
  const v = j.streams.find((s) => s.codec_type === "video") || {};
  const [num, den] = String(v.avg_frame_rate || "0/1").split("/").map(Number);
  // vídeo de celular gravado em pé costuma vir deitado com rotação nos metadados
  const rot = Math.abs(Number(v.tags?.rotate || v.side_data_list?.find((s) => s.rotation != null)?.rotation || 0));
  const [w, h] = rot === 90 || rot === 270 ? [v.height, v.width] : [v.width, v.height];
  return {
    duracao: r2(Number(j.format.duration)),
    largura: w,
    altura: h,
    formato: w && h ? (w < h ? "vertical" : w > h ? "horizontal" : "quadrado") : "?",
    fps: den ? r2(num / den) : 0,
    temAudio: j.streams.some((s) => s.codec_type === "audio"),
  };
}

function cortes(arquivo) {
  const log = ffmpegLog(arquivo, ["-an", "-vf", `select='gt(scene,${LIMIAR})',showinfo`]);
  return [...log.matchAll(/pts_time:([\d.]+)/g)].map((m) => r2(Number(m[1])));
}

function silencios(arquivo) {
  const log = ffmpegLog(arquivo, ["-vn", "-af", "silencedetect=noise=-32dB:d=0.35"]);
  const ini = [...log.matchAll(/silence_start: ([\d.]+)/g)].map((m) => Number(m[1]));
  const fim = [...log.matchAll(/silence_end: ([\d.]+) \| silence_duration: ([\d.]+)/g)].map((m) => Number(m[2]));
  return { quantidade: ini.length, total: r2(fim.reduce((a, b) => a + b, 0)) };
}

function volume(arquivo) {
  const log = ffmpegLog(arquivo, ["-vn", "-af", "volumedetect"]);
  const m = /mean_volume: (-?[\d.]+) dB/.exec(log);
  const p = /max_volume: (-?[\d.]+) dB/.exec(log);
  return { medio_dB: m ? Number(m[1]) : null, pico_dB: p ? Number(p[1]) : null };
}

// Uma imagem com até 30 quadros espalhados pelo vídeo, para dar para "ver" a edição de uma vez
function mosaico(arquivo, duracao, destino) {
  const n = 30;
  execFileSync("ffmpeg", [
    "-hide_banner", "-loglevel", "error", "-y", "-i", arquivo,
    "-vf", `fps=${n / Math.max(duracao, 1)},scale=240:-2,tile=6x5:padding=4:color=white`,
    "-frames:v", "1", destino,
  ]);
}

// Um quadro do meio de cada plano do vídeo editado (até 60), com o tempo no nome do arquivo
function quadrosDosPlanos(arquivo, planos, pasta) {
  fs.mkdirSync(pasta, { recursive: true });
  planos.slice(0, 60).forEach((p, i) => {
    const t = (p.inicio + p.fim) / 2;
    const nome = `${String(i + 1).padStart(2, "0")}-${t.toFixed(1)}s.jpg`;
    execFileSync("ffmpeg", [
      "-hide_banner", "-loglevel", "error", "-y", "-ss", String(t), "-i", arquivo,
      "-frames:v", "1", "-vf", "scale=360:-2", path.join(pasta, nome),
    ]);
  });
}

function analisarPar(id, antes, depois) {
  const dir = path.join(SAIDA, id);
  fs.mkdirSync(dir, { recursive: true });
  const rel = { par: id, limiarDeCena: LIMIAR };

  if (antes) {
    const i = info(antes);
    rel.antes = { arquivo: path.basename(antes), ...i, silencios: i.temAudio ? silencios(antes) : null };
    mosaico(antes, i.duracao, path.join(dir, "mosaico-antes.jpg"));
  }

  if (depois) {
    const i = info(depois);
    const tc = cortes(depois);
    const limites = [0, ...tc, i.duracao];
    const planos = limites.slice(1).map((fim, k) => ({ inicio: limites[k], fim, duracao: r2(fim - limites[k]) }));
    const dur = planos.map((p) => p.duracao);
    rel.depois = {
      arquivo: path.basename(depois),
      ...i,
      cortes: tc.length,
      cortesPor10s: r2((tc.length / Math.max(i.duracao, 1)) * 10),
      plano: { medio: r2(media(dur)), mediano: r2(mediana(dur)), menor: r2(Math.min(...dur)), maior: r2(Math.max(...dur)) },
      cortesNos3PrimeirosSegundos: tc.filter((t) => t <= 3).length,
      audio: i.temAudio ? { ...volume(depois), silencios: silencios(depois) } : null,
      planos,
    };
    mosaico(depois, i.duracao, path.join(dir, "mosaico-depois.jpg"));
    quadrosDosPlanos(depois, planos, path.join(dir, "quadros-depois"));
  }

  if (rel.antes && rel.depois) {
    rel.comparacao = {
      aproveitamento: `${Math.round((rel.depois.duracao / rel.antes.duracao) * 100)}% da duração do bruto`,
      segundosRemovidos: r2(rel.antes.duracao - rel.depois.duracao),
      mudouFormato: rel.antes.formato !== rel.depois.formato,
    };
  }

  fs.writeFileSync(path.join(dir, "relatorio.json"), JSON.stringify(rel, null, 2));
  fs.writeFileSync(path.join(dir, "resumo.md"), resumo(rel));
  return rel;
}

function resumo(r) {
  const l = [`# Par ${r.par}`, ""];
  if (r.antes) {
    const a = r.antes;
    l.push(`**Antes:** ${a.arquivo} — ${a.duracao}s, ${a.largura}x${a.altura} (${a.formato}), ${a.fps} fps`);
    if (a.silencios) l.push(`- ${a.silencios.quantidade} pausas, somando ${a.silencios.total}s de silêncio`);
    l.push("");
  }
  if (r.depois) {
    const d = r.depois;
    l.push(`**Depois:** ${d.arquivo} — ${d.duracao}s, ${d.largura}x${d.altura} (${d.formato}), ${d.fps} fps`);
    l.push(`- ${d.cortes} cortes (${d.cortesPor10s} a cada 10s), ${d.cortesNos3PrimeirosSegundos} nos 3 primeiros segundos`);
    l.push(`- Plano médio ${d.plano.medio}s (mediano ${d.plano.mediano}s, de ${d.plano.menor}s a ${d.plano.maior}s)`);
    if (d.audio) l.push(`- Áudio: volume médio ${d.audio.medio_dB} dB, pico ${d.audio.pico_dB} dB, ${d.audio.silencios.quantidade} pausas`);
    l.push("");
  }
  if (r.comparacao) {
    l.push(`**Comparação:** sobrou ${r.comparacao.aproveitamento} (${r.comparacao.segundosRemovidos}s removidos)` +
      (r.comparacao.mudouFormato ? ", mudou o formato da tela" : ""));
  }
  return l.join("\n") + "\n";
}

function main() {
  if (!fs.existsSync(PASTA)) {
    console.error(`Pasta não encontrada: ${PASTA}`);
    process.exit(1);
  }
  const pares = {};
  for (const f of fs.readdirSync(PASTA).filter((f) => VIDEO.test(f))) {
    const m = /^(.+?)[-_ ](antes|depois)\./i.exec(f);
    if (!m) { console.warn(`Ignorado (nome não termina em -antes ou -depois): ${f}`); continue; }
    (pares[m[1]] ||= {})[m[2].toLowerCase()] = path.join(PASTA, f);
  }
  const ids = Object.keys(pares).sort();
  if (!ids.length) {
    console.error(`Nenhum vídeo em ${PASTA}. Nomeie assim: 01-antes.mp4 e 01-depois.mp4`);
    process.exit(1);
  }

  const todos = ids.map((id) => {
    console.log(`Analisando par ${id}...`);
    return analisarPar(id, pares[id].antes, pares[id].depois);
  });

  const editados = todos.filter((r) => r.depois).map((r) => r.depois);
  const geral = ["# Estilo geral (todos os pares)", ""];
  if (editados.length) {
    geral.push(`- Duração final média: ${r2(media(editados.map((d) => d.duracao)))}s`);
    geral.push(`- Cortes a cada 10s (média): ${r2(media(editados.map((d) => d.cortesPor10s)))}`);
    geral.push(`- Duração média do plano: ${r2(media(editados.map((d) => d.plano.medio)))}s`);
    geral.push(`- Formatos finais: ${[...new Set(editados.map((d) => d.formato))].join(", ")}`);
  }
  const comp = todos.filter((r) => r.comparacao);
  if (comp.length) {
    const ap = comp.map((r) => r.depois.duracao / r.antes.duracao);
    geral.push(`- Aproveitamento médio do bruto: ${Math.round(media(ap) * 100)}%`);
  }
  geral.push("", ...todos.map((r) => `- Par ${r.par}: veja analise/${r.par}/resumo.md e os mosaicos`));
  fs.writeFileSync(path.join(SAIDA, "estilo-geral.md"), geral.join("\n") + "\n");
  console.log("\n" + geral.join("\n"));
}

main();
