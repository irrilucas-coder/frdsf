// Renderização em partes (retomável). Uso: node scripts/render-retomavel.mjs <Composicao> <nome-do-arquivo>
// - Renderiza o vídeo em blocos de frames (sem áudio) em out/partes/<nome>/; blocos prontos são pulados.
// - Renderiza o áudio inteiro separado (sem emendas) e junta tudo no final em out/<nome>.mp4.
// Se o processo for interrompido, rodar de novo continua do bloco que faltava.
import {bundle} from '@remotion/bundler';
import {renderMedia, selectComposition, openBrowser} from '@remotion/renderer';
import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const [, , id, nome, blocoArg] = process.argv;
const BLOCO = Number(blocoArg || 300);
const raiz = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const pasta = path.join(raiz, 'out', 'partes', nome);
fs.mkdirSync(pasta, {recursive: true});
const final = path.join(raiz, 'out', `${nome}.mp4`);
if (fs.existsSync(final)) {
  console.log('já pronto:', final);
  process.exit(0);
}

const navegador = '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell';
const chromiumOptions = {gl: 'swangle'};
const serveUrl = await bundle({entryPoint: path.join(raiz, 'src/index.ts'), publicDir: path.join(raiz, 'public')});
const browser = await openBrowser('chrome', {browserExecutable: navegador, chromiumOptions});
const composition = await selectComposition({serveUrl, id, puppeteerInstance: browser, chromiumOptions});
const total = composition.durationInFrames;

const partes = [];
for (let a = 0; a < total; a += BLOCO) {
  const b = Math.min(total - 1, a + BLOCO - 1);
  const arq = path.join(pasta, `parte-${String(a).padStart(5, '0')}.mp4`);
  partes.push(arq);
  if (fs.existsSync(arq)) continue;
  const tmp = arq.replace('.mp4', '.tmp.mp4');
  console.log(`renderizando frames ${a}-${b} de ${total}…`);
  await renderMedia({composition, serveUrl, codec: 'h264', crf: 16, muted: true, frameRange: [a, b], outputLocation: tmp, puppeteerInstance: browser, chromiumOptions, concurrency: 4, imageFormat: 'jpeg', jpegQuality: 92});
  fs.renameSync(tmp, arq);
}

const audio = path.join(pasta, 'audio.wav');
if (!fs.existsSync(audio)) {
  console.log('renderizando áudio…');
  await renderMedia({composition, serveUrl, codec: 'wav', outputLocation: audio + '.tmp.wav', puppeteerInstance: browser, chromiumOptions});
  fs.renameSync(audio + '.tmp.wav', audio);
}
await browser.close({silent: true});

const lista = path.join(pasta, 'lista.txt');
fs.writeFileSync(lista, partes.map((p) => `file '${p}'`).join('\n'));
const video = path.join(pasta, 'video.mp4');
execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', lista, '-c', 'copy', video]);
execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', video, '-i', audio, '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-shortest', final + '.tmp.mp4']);
fs.renameSync(final + '.tmp.mp4', final);
console.log('pronto:', final);
