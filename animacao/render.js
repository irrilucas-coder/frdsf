#!/usr/bin/env node
// Renderiza um episódio em MP4 vertical (1080x1920) usando o Chromium sem tela + ffmpeg.
//   node render.js episodios/meu-ep.json            → saida/meu-ep.mp4
//   node render.js episodios/meu-ep.json --foto 3.5 → saida/meu-ep-3.5s.png (um quadro só)
//   opções: --workers 4  --de 0 --ate 10 (segundos)  --rapido (540x960 para conferir)
const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn, execFileSync } = require('child_process');
const { chromium } = require('playwright');

const RAIZ = __dirname;
const args = process.argv.slice(2);
const opt = (n, d) => { const i = args.indexOf('--' + n); return i < 0 ? d : (args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : true); };
const epArq = args.find((a) => a.endsWith('.json'));
if (!epArq) { console.log('uso: node render.js episodios/arquivo.json [--foto 2.5] [--workers 4] [--rapido]'); process.exit(1); }

const TIPOS = { '.js': 'text/javascript', '.html': 'text/html', '.json': 'application/json', '.woff2': 'font/woff2', '.woff': 'font/woff', '.png': 'image/png', '.jpg': 'image/jpeg', '.mp3': 'audio/mpeg' };
function servidor() {
  return new Promise((res) => {
    const s = http.createServer((req, rsp) => {
      const p = path.join(RAIZ, decodeURIComponent(new URL(req.url, 'http://x').pathname));
      if (!p.startsWith(RAIZ) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { rsp.writeHead(404); return rsp.end(); }
      rsp.writeHead(200, { 'Content-Type': TIPOS[path.extname(p)] || 'application/octet-stream' });
      fs.createReadStream(p).pipe(rsp);
    }).listen(0, () => res(s));
  });
}

async function abrir(browser, porta, ep, bib) {
  const page = await browser.newPage({ viewport: { width: 400, height: 400 } });
  page.on('pageerror', (e) => console.error('ERRO na página:', e.message));
  page.on('console', (m) => { if (m.type() === 'error') console.error('console:', m.text()); });
  await page.goto(`http://localhost:${porta}/engine/index.html`);
  await page.waitForFunction(() => window.pronto === true);
  const info = await page.evaluate(([e, b]) => window.iniciar(e, b), [ep, bib]);
  return { page, info };
}

(async () => {
  const ep = JSON.parse(fs.readFileSync(path.resolve(epArq), 'utf8'));
  const bib = JSON.parse(fs.readFileSync(path.join(RAIZ, 'biblioteca/personagens.json'), 'utf8'));
  // padrão: desenha em 720x1280 e amplia para 1080x1920 no ffmpeg (≈2x mais rápido). --nativo desenha em 1080x1920.
  const finalW = ep.largura || 1080, finalH = ep.altura || 1920;
  if (opt('rapido')) { ep.largura = 540; ep.altura = 960; }
  else if (!opt('nativo') && !opt('foto') && finalW === 1080 && finalH === 1920) { ep.largura = 720; ep.altura = 1280; }
  const escala = (ep.largura !== finalW && !opt('rapido')) ? ['-vf', `scale=${finalW}:${finalH}:flags=lanczos`] : [];
  const nome = path.basename(epArq, '.json');
  fs.mkdirSync(path.join(RAIZ, 'saida'), { recursive: true });
  const srv = await servidor(); const porta = srv.address().port;
  const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--disable-gpu-sandbox'] });
  const t0 = Date.now();
  try {
    if (opt('foto')) {
      const { page, info } = await abrir(browser, porta, ep, bib);
      const seg = parseFloat(opt('foto'));
      const f = Math.min(info.quadros - 1, Math.round(seg * info.fps));
      const b64 = await page.evaluate((x) => window.png(x), f);
      const out = opt('saida', path.join(RAIZ, 'saida', `${nome}-${seg}s.png`));
      fs.writeFileSync(out, Buffer.from(b64, 'base64'));
      console.log('foto:', out);
      return;
    }
    const nW = Number(opt('workers', 4));
    const { page: p0, info } = await abrir(browser, porta, ep, bib);
    const fps = info.fps;
    const de = Math.round(Number(opt('de', 0)) * fps), ate = Math.min(info.quadros, Math.round(Number(opt('ate', info.duracao)) * fps));
    const total = ate - de, bloco = Math.ceil(total / nW);
    console.log(`${nome}: ${info.duracao.toFixed(1)} s, ${total} quadros, ${nW} processos`);
    const tmp = path.join(RAIZ, 'saida', `.tmp-${nome}`); fs.mkdirSync(tmp, { recursive: true });
    let feitos = 0;
    const partes = await Promise.all(Array.from({ length: nW }, async (_, w) => {
      const ini = de + w * bloco, fim = Math.min(ate, ini + bloco);
      if (ini >= fim) return null;
      const page = w === 0 ? p0 : (await abrir(browser, porta, ep, bib)).page;
      const arq = path.join(tmp, `parte${w}.mp4`);
      const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'mjpeg', '-i', '-', ...escala, '-c:v', 'libx264', '-preset', 'medium', '-crf', '19', '-pix_fmt', 'yuv420p', arq], { stdio: ['pipe', 'inherit', 'inherit'] });
      for (let f = ini; f < fim; f++) {
        const b64 = await page.evaluate((x) => window.quadro(x), f);
        if (!ff.stdin.write(Buffer.from(b64, 'base64'))) await new Promise((r) => ff.stdin.once('drain', r));
        feitos++;
        if (feitos % 30 === 0) process.stdout.write(`\r  ${feitos}/${total} quadros (${((Date.now() - t0) / 1000).toFixed(0)} s)`);
      }
      ff.stdin.end(); await new Promise((r) => ff.on('close', r));
      return arq;
    }));
    process.stdout.write('\n');
    const lista = path.join(tmp, 'lista.txt');
    fs.writeFileSync(lista, partes.filter(Boolean).map((p) => `file '${p}'`).join('\n'));
    const out = opt('saida', path.join(RAIZ, 'saida', `${nome}.mp4`));
    const audio = ep.audio && fs.existsSync(path.join(RAIZ, ep.audio)) ? path.join(RAIZ, ep.audio) : null;
    const musica = ep.musica && fs.existsSync(path.join(RAIZ, ep.musica)) ? path.join(RAIZ, ep.musica) : null;
    const a = ['-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', lista];
    if (audio) a.push('-ss', String(de / fps), '-i', audio);
    if (musica) a.push('-stream_loop', '-1', '-i', musica);
    if (audio && musica) a.push('-filter_complex', `[2:a]volume=${ep.volumeMusica ?? 0.12}[m];[1:a][m]amix=inputs=2:duration=first:dropout_transition=0[a]`, '-map', '0:v', '-map', '[a]');
    else if (audio) a.push('-map', '0:v', '-map', '1:a');
    else if (musica) a.push('-map', '0:v', '-map', '1:a', '-shortest');
    a.push('-c:v', 'copy');
    if (audio || musica) a.push('-c:a', 'aac', '-b:a', '192k', '-shortest');
    a.push('-movflags', '+faststart', out);
    execFileSync('ffmpeg', a, { stdio: 'inherit' });
    fs.rmSync(tmp, { recursive: true, force: true });
    console.log(`pronto: ${out} (${((Date.now() - t0) / 1000).toFixed(0)} s)`);
  } finally {
    await browser.close(); srv.close();
  }
})().catch((e) => { console.error(e); process.exit(1); });
