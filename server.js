// Tiny local server: serves the dashboard and forwards requests to Kie.ai.
// No dependencies — just run `node server.js` and open http://localhost:3000
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 3000;
const KIE_API = "https://api.kie.ai/api/v1/jobs";
const KIE_CREDIT = "https://api.kie.ai/api/v1/chat/credit";
const KIE_UPLOAD = "https://kieai.redpandaai.co/api/file-base64-upload";

// Character photos for "Modo Novela" live on this computer, in data/characters/
const CAST_DIR = path.join(__dirname, "data", "characters");
const CAST_INDEX = path.join(CAST_DIR, "index.json");
fs.mkdirSync(CAST_DIR, { recursive: true });
const readCast = () => { try { return JSON.parse(fs.readFileSync(CAST_INDEX, "utf8")); } catch { return []; } };
const writeCast = (list) => fs.writeFileSync(CAST_INDEX, JSON.stringify(list, null, 2));
const IMAGE_TYPES = { png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", webp: "image/webp", gif: "image/gif" };

// "Estúdio de Shorts": fixed library of characters and sets, saved on this computer in data/biblioteca/
const LIB_DIR = path.join(__dirname, "data", "biblioteca");
const LIB_TYPES = ["personagens", "cenarios"];
LIB_TYPES.forEach((t) => fs.mkdirSync(path.join(LIB_DIR, t), { recursive: true }));
const libIndex = (t) => path.join(LIB_DIR, t, "index.json");
const readLib = (t) => { try { return JSON.parse(fs.readFileSync(libIndex(t), "utf8")); } catch { return []; } };
const writeLib = (t, list) => fs.writeFileSync(libIndex(t), JSON.stringify(list, null, 2));
const STYLE_FILE = path.join(LIB_DIR, "estilo.json");
const AUDIO_DIR = path.join(__dirname, "data", "audios");
fs.mkdirSync(AUDIO_DIR, { recursive: true });
const ELEVEN_API = process.env.ELEVEN_API || "https://api.elevenlabs.io/v1";
const newId = () => `${Date.now()}${Math.random().toString(36).slice(2, 6)}`;

function saveImage(dir, dataUrl) {
  const m = /^data:image\/(png|jpe?g|webp|gif);base64,(.+)$/.exec(dataUrl || "");
  if (!m) return null;
  const file = `${newId()}.${m[1] === "jpeg" ? "jpg" : m[1]}`;
  fs.writeFileSync(path.join(dir, file), Buffer.from(m[2], "base64"));
  return file;
}

function serveFile(res, full, type) {
  if (!type || !fs.existsSync(full)) { res.writeHead(404); return res.end("Not found"); }
  res.writeHead(200, { "Content-Type": type });
  return fs.createReadStream(full).pipe(res);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

function sendJson(res, status, obj) {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(obj));
}

async function forward(res, url, apiKey, init = {}) {
  try {
    const r = await fetch(url, {
      ...init,
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    });
    const text = await r.text();
    res.writeHead(r.status, { "Content-Type": "application/json" });
    res.end(text);
  } catch (err) {
    sendJson(res, 502, { code: 502, msg: `Could not reach Kie.ai: ${err.message}` });
  }
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  // ----- Local endpoints (no Kie key needed) -----
  if (url.pathname === "/api/characters" && req.method === "GET") {
    return sendJson(res, 200, readCast());
  }
  if (url.pathname === "/api/characters" && req.method === "POST") {
    let body;
    try { body = JSON.parse(await readBody(req)); } catch { return sendJson(res, 400, { msg: "JSON inválido" }); }
    const m = /^data:image\/(png|jpe?g|webp|gif);base64,(.+)$/.exec(body.dataUrl || "");
    const name = String(body.name || "").trim();
    if (!m || !name) return sendJson(res, 400, { msg: "Precisa de nome e foto." });
    const ext = m[1] === "jpeg" ? "jpg" : m[1];
    const id = `${Date.now()}${Math.random().toString(36).slice(2, 6)}`;
    fs.writeFileSync(path.join(CAST_DIR, `${id}.${ext}`), Buffer.from(m[2], "base64"));
    const list = readCast();
    list.push({ id, name, file: `${id}.${ext}` });
    writeCast(list);
    return sendJson(res, 200, list);
  }
  if (url.pathname === "/api/characters" && req.method === "DELETE") {
    const id = url.searchParams.get("id");
    const list = readCast();
    const gone = list.find((c) => c.id === id);
    if (gone) fs.rmSync(path.join(CAST_DIR, gone.file), { force: true });
    writeCast(list.filter((c) => c.id !== id));
    return sendJson(res, 200, readCast());
  }
  if (url.pathname.startsWith("/characters/") && req.method === "GET") {
    const file = path.basename(url.pathname);
    const full = path.join(CAST_DIR, file);
    const type = IMAGE_TYPES[path.extname(file).slice(1).toLowerCase()];
    if (!type || !fs.existsSync(full)) { res.writeHead(404); return res.end("Not found"); }
    res.writeHead(200, { "Content-Type": type });
    return fs.createReadStream(full).pipe(res);
  }
  // ----- Estúdio de Shorts: library (characters / sets) -----
  if (url.pathname === "/api/lib") {
    const tipo = url.searchParams.get("tipo");
    if (!LIB_TYPES.includes(tipo)) return sendJson(res, 400, { msg: "tipo deve ser personagens ou cenarios" });
    const dir = path.join(LIB_DIR, tipo);
    if (req.method === "GET") return sendJson(res, 200, readLib(tipo));
    if (req.method === "POST") {
      // Create or update: { id?, nome, descricao, vozId?, novasImagens: [dataUrl], removerImagens: [file], imagemUrl? }
      let b;
      try { b = JSON.parse(await readBody(req)); } catch { return sendJson(res, 400, { msg: "JSON inválido" }); }
      const list = readLib(tipo);
      let item = list.find((x) => x.id === b.id);
      if (!item) {
        if (!String(b.nome || "").trim()) return sendJson(res, 400, { msg: "Dê um nome." });
        item = { id: newId(), nome: "", descricao: "", vozId: "", imagens: [] };
        list.push(item);
      }
      if (b.nome !== undefined) item.nome = String(b.nome).trim();
      if (b.descricao !== undefined) item.descricao = String(b.descricao);
      if (b.vozId !== undefined) item.vozId = String(b.vozId);
      for (const f of b.removerImagens || []) {
        const name = path.basename(f);
        if (item.imagens.includes(name)) fs.rmSync(path.join(dir, name), { force: true });
        item.imagens = item.imagens.filter((x) => x !== name);
      }
      for (const d of b.novasImagens || []) { const f = saveImage(dir, d); if (f) item.imagens.push(f); }
      if (b.imagemUrl && /^https:\/\//.test(b.imagemUrl)) {
        // Image generated on Kie: download it so the reference stays on this computer
        try {
          const r = await fetch(b.imagemUrl);
          const type = (r.headers.get("content-type") || "image/png").split(";")[0];
          const ext = Object.keys(IMAGE_TYPES).find((k) => IMAGE_TYPES[k] === type) || "png";
          const file = `${newId()}.${ext}`;
          fs.writeFileSync(path.join(dir, file), Buffer.from(await r.arrayBuffer()));
          if (b.principal) item.imagens.unshift(file); else item.imagens.push(file);
        } catch (err) { return sendJson(res, 502, { msg: `Não consegui baixar a imagem: ${err.message}` }); }
      }
      writeLib(tipo, list);
      return sendJson(res, 200, list);
    }
    if (req.method === "DELETE") {
      const id = url.searchParams.get("id");
      const list = readLib(tipo);
      const gone = list.find((x) => x.id === id);
      if (gone) gone.imagens.forEach((f) => fs.rmSync(path.join(dir, f), { force: true }));
      writeLib(tipo, list.filter((x) => x.id !== id));
      return sendJson(res, 200, readLib(tipo));
    }
  }
  const libFile = /^\/lib\/(personagens|cenarios)\/([^/]+)$/.exec(url.pathname);
  if (libFile && req.method === "GET") {
    const file = path.basename(libFile[2]);
    return serveFile(res, path.join(LIB_DIR, libFile[1], file), IMAGE_TYPES[path.extname(file).slice(1).toLowerCase()]);
  }
  if (url.pathname === "/api/estilo") {
    if (req.method === "GET") {
      try { return sendJson(res, 200, JSON.parse(fs.readFileSync(STYLE_FILE, "utf8"))); } catch { return sendJson(res, 200, {}); }
    }
    if (req.method === "POST") {
      try { fs.writeFileSync(STYLE_FILE, JSON.stringify(JSON.parse(await readBody(req)), null, 2)); }
      catch { return sendJson(res, 400, { msg: "JSON inválido" }); }
      return sendJson(res, 200, { ok: true });
    }
  }

  // ----- ElevenLabs (voice). Key comes from the browser, never saved on disk. -----
  if (url.pathname.startsWith("/api/eleven/")) {
    const xiKey = req.headers["x-eleven-key"];
    if (!xiKey) return sendJson(res, 401, { msg: "Cole sua chave da ElevenLabs primeiro." });
    try {
      if (url.pathname === "/api/eleven/voices" && req.method === "GET") {
        const r = await fetch(`${ELEVEN_API}/voices`, { headers: { "xi-api-key": xiKey } });
        const j = await r.json();
        if (!r.ok) return sendJson(res, r.status, { msg: j?.detail?.message || j?.detail || `Erro ${r.status}` });
        return sendJson(res, 200, (j.voices || []).map((v) => ({ id: v.voice_id, nome: v.name, categoria: v.category, preview: v.preview_url, labels: v.labels })));
      }
      if (url.pathname === "/api/eleven/user" && req.method === "GET") {
        const r = await fetch(`${ELEVEN_API}/user/subscription`, { headers: { "xi-api-key": xiKey } });
        const j = await r.json();
        if (!r.ok) return sendJson(res, r.status, { msg: j?.detail?.message || j?.detail || `Erro ${r.status}` });
        return sendJson(res, 200, { usados: j.character_count, limite: j.character_limit, plano: j.tier });
      }
      if (url.pathname === "/api/eleven/tts" && req.method === "POST") {
        const b = JSON.parse(await readBody(req));
        if (!b.vozId || !String(b.texto || "").trim()) return sendJson(res, 400, { msg: "Precisa de voz e texto." });
        const r = await fetch(`${ELEVEN_API}/text-to-speech/${encodeURIComponent(b.vozId)}?output_format=mp3_44100_128`, {
          method: "POST",
          headers: { "xi-api-key": xiKey, "Content-Type": "application/json", Accept: "audio/mpeg" },
          body: JSON.stringify({
            text: b.texto,
            model_id: b.modelo || "eleven_multilingual_v2",
            voice_settings: { stability: b.estabilidade ?? 0.45, similarity_boost: 0.8, style: b.estilo ?? 0.3, use_speaker_boost: true },
          }),
        });
        if (!r.ok) {
          let msg = `Erro ${r.status}`;
          try { const j = await r.json(); msg = j?.detail?.message || j?.detail?.status || JSON.stringify(j.detail || j); } catch {}
          return sendJson(res, r.status, { msg });
        }
        const name = `${String(b.nome || "fala").replace(/[^\w\-]+/g, "_").slice(0, 60)}-${newId()}.mp3`;
        fs.writeFileSync(path.join(AUDIO_DIR, name), Buffer.from(await r.arrayBuffer()));
        return sendJson(res, 200, { url: `/audios/${name}` });
      }
    } catch (err) {
      return sendJson(res, 502, { msg: `Não consegui falar com a ElevenLabs: ${err.message}` });
    }
    return sendJson(res, 404, { msg: "Unknown endpoint" });
  }
  if (url.pathname.startsWith("/audios/") && req.method === "GET") {
    const file = path.basename(url.pathname);
    const full = path.join(AUDIO_DIR, file);
    if (url.searchParams.has("baixar") && fs.existsSync(full)) {
      res.writeHead(200, { "Content-Type": "audio/mpeg", "Content-Disposition": `attachment; filename="${file}"` });
      return fs.createReadStream(full).pipe(res);
    }
    return serveFile(res, full, file.endsWith(".mp3") ? "audio/mpeg" : null);
  }

  if (url.pathname === "/api/download" && req.method === "GET") {
    // Saves a finished video with a friendly file name (e.g. episodio-cena-01.mp4)
    const target = url.searchParams.get("url") || "";
    const name = (url.searchParams.get("name") || "video.mp4").replace(/[^\w.\-]+/g, "_");
    if (!/^https:\/\//.test(target)) return sendJson(res, 400, { msg: "URL inválida" });
    try {
      const r = await fetch(target);
      if (!r.ok) return sendJson(res, 502, { msg: `Download falhou (${r.status})` });
      res.writeHead(200, {
        "Content-Type": r.headers.get("content-type") || "application/octet-stream",
        "Content-Disposition": `attachment; filename="${name}"`,
      });
      return res.end(Buffer.from(await r.arrayBuffer()));
    } catch (err) {
      return sendJson(res, 502, { msg: `Download falhou: ${err.message}` });
    }
  }

  if (url.pathname.startsWith("/api/")) {
    // The key comes from the browser (pasted on the page); it is never saved on disk.
    const apiKey = req.headers["x-kie-key"];
    if (!apiKey) return sendJson(res, 401, { code: 401, msg: "Paste your Kie API key first." });

    if (url.pathname === "/api/create" && req.method === "POST") {
      return forward(res, `${KIE_API}/createTask`, apiKey, { method: "POST", body: await readBody(req) });
    }
    if (url.pathname === "/api/status" && req.method === "GET") {
      const taskId = encodeURIComponent(url.searchParams.get("taskId") || "");
      return forward(res, `${KIE_API}/recordInfo?taskId=${taskId}`, apiKey);
    }
    if (url.pathname === "/api/credit" && req.method === "GET") {
      return forward(res, KIE_CREDIT, apiKey);
    }
    if (url.pathname === "/api/upload" && req.method === "POST") {
      return forward(res, KIE_UPLOAD, apiKey, { method: "POST", body: await readBody(req) });
    }
    return sendJson(res, 404, { code: 404, msg: "Unknown endpoint" });
  }

  if (url.pathname === "/" || url.pathname === "/index.html") {
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    return fs.createReadStream(path.join(__dirname, "public", "index.html")).pipe(res);
  }
  if (url.pathname === "/shorts" || url.pathname === "/shorts.html") {
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    return fs.createReadStream(path.join(__dirname, "public", "shorts.html")).pipe(res);
  }
  res.writeHead(404);
  res.end("Not found");
});

server.listen(PORT, () => {
  console.log(`\n  Dashboard running: http://localhost:${PORT}\n`);
});
