// Tiny local server: serves the dashboard and forwards requests to Kie.ai.
// No dependencies — just run `node server.js` and open http://localhost:3000
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 3000;
const KIE_API = "https://api.kie.ai/api/v1/jobs";
const KIE_UPLOAD = "https://kieai.redpandaai.co/api/file-base64-upload";

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
