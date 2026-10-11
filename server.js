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
  res.writeHead(404);
  res.end("Not found");
});

server.listen(PORT, () => {
  console.log(`\n  Dashboard running: http://localhost:${PORT}\n`);
});
