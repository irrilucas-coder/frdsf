// Tiny local server: serves the dashboard and forwards requests to Kie.ai.
// No dependencies — just run `node server.js` and open http://localhost:3000
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 3000;
const KIE_API = "https://api.kie.ai/api/v1/jobs";
const KIE_CREDIT = "https://api.kie.ai/api/v1/chat/credit";
const KIE_UPLOAD = "https://kieai.redpandaai.co/api/file-base64-upload";

// Chat Claude: usa a biblioteca oficial da Anthropic (instalada com `npm install`; o Abrir Estudio.bat faz isso sozinho)
let Anthropic = null;
try { const sdk = require("@anthropic-ai/sdk"); Anthropic = sdk.default || sdk; } catch { /* chat fica desligado até instalar */ }
const CLAUDE_MODELS = ["claude-opus-5-5", "claude-sonnet-5-5", "claude-haiku-5-5"];
const CLAUDE_SYSTEM = "Você é um assistente prestativo. Responda sempre em português do Brasil, de forma clara e direta.";

function claudeErro(err) {
  if (Anthropic && err instanceof Anthropic.AuthenticationError) return "Chave inválida. Confira se colou a chave inteira.";
  if (Anthropic && err instanceof Anthropic.PermissionDeniedError) return "Essa chave não tem permissão para esse modelo.";
  if (Anthropic && err instanceof Anthropic.RateLimitError) return "Muitos pedidos seguidos. Espere um pouco e tente de novo.";
  if (Anthropic && err instanceof Anthropic.BadRequestError) return `Pedido recusado pela Anthropic: ${err.message}`;
  if (Anthropic && err instanceof Anthropic.APIConnectionError) return "Sem conexão com a Anthropic. Confira sua internet.";
  if (Anthropic && err instanceof Anthropic.APIError) return `Erro da Anthropic (${err.status}): ${err.message}`;
  return err.message || String(err);
}

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

  if (url.pathname === "/api/claude/chat" && req.method === "POST") {
    if (!Anthropic) return sendJson(res, 500, { msg: "Falta instalar o chat: rode `npm install` nesta pasta (o Abrir Estudio.bat faz isso sozinho)." });
    const apiKey = req.headers["x-claude-key"];
    if (!apiKey) return sendJson(res, 401, { msg: "Cole sua chave da API do Claude primeiro." });
    let body;
    try { body = JSON.parse(await readBody(req)); } catch { return sendJson(res, 400, { msg: "JSON inválido" }); }
    const messages = Array.isArray(body.messages) ? body.messages : [];
    if (!messages.length) return sendJson(res, 400, { msg: "Escreva uma mensagem." });
    const model = CLAUDE_MODELS.includes(body.model) ? body.model : CLAUDE_MODELS[0];
    const params = {
      model,
      max_tokens: 64000,
      system: body.instrucoes ? `${CLAUDE_SYSTEM}\n\n${String(body.instrucoes)}` : CLAUDE_SYSTEM,
      messages,
      output_config: { effort: ["low", "medium", "high"].includes(body.esforco) ? body.esforco : "medium" },
    };
    if (model !== "claude-haiku-5-5") {
      // se um filtro de segurança recusar por engano, a Anthropic refaz o pedido num modelo reserva
      params.betas = ["server-side-fallback-2026-07-01"];
      params.fallbacks = "default";
    }
    const client = new Anthropic({ apiKey });
    const stream = client.beta.messages.stream(params);
    res.on("close", () => { if (!res.writableEnded) stream.abort(); });
    let comecou = false;
    const comecar = () => {
      if (!comecou) res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-cache" });
      comecou = true;
    };
    try {
      for await (const ev of stream) {
        if (ev.type === "content_block_delta" && ev.delta.type === "text_delta") {
          comecar();
          res.write(ev.delta.text);
        }
      }
      const final = await stream.finalMessage();
      comecar();
      if (final.stop_reason === "refusal") res.write("\n\n_(O Claude não pode ajudar com esse pedido.)_");
      if (final.stop_reason === "max_tokens") res.write("\n\n_(A resposta foi cortada no limite de tamanho.)_");
      // depois do caractere \u0000 vai o consumo de tokens, que a página usa para mostrar o gasto
      res.write(`\u0000${JSON.stringify({ usage: final.usage, model: final.model })}`);
      return res.end();
    } catch (err) {
      if (!comecou) return sendJson(res, err.status && err.status < 600 ? err.status : 502, { msg: claudeErro(err) });
      res.write(`\n\n[erro: ${claudeErro(err)}]`);
      return res.end();
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

  if (url.pathname === "/chat" || url.pathname === "/chat.html") {
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    return fs.createReadStream(path.join(__dirname, "public", "chat.html")).pipe(res);
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
