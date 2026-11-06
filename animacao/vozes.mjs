#!/usr/bin/env node
// Lista as vozes da sua conta ElevenLabs e grava a escolha em biblioteca/vozes.json
//   node vozes.mjs                       → lista as vozes
//   node vozes.mjs narrador=ID tito=ID   → define quem fala com qual voz
// O fetch do Node só usa o proxy da rede com NODE_USE_ENV_PROXY=1: reabre o script com isso ligado.
if ((process.env.HTTPS_PROXY || process.env.https_proxy) && !process.env.NODE_USE_ENV_PROXY) {
  const { spawnSync: _sp } = await import('node:child_process');
  const r = _sp(process.execPath, process.argv.slice(1), { stdio: 'inherit', env: { ...process.env, NODE_USE_ENV_PROXY: '1', NODE_NO_WARNINGS: '1' } });
  process.exit(r.status ?? 1);
}
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const RAIZ = path.dirname(fileURLToPath(import.meta.url));
const ARQ = path.join(RAIZ, 'biblioteca/vozes.json');
const cfg = fs.existsSync(ARQ) ? JSON.parse(fs.readFileSync(ARQ, 'utf8')) : { modelo: 'eleven_multilingual_v2', estabilidade: 0.4, exagero: 0.35 };
const pares = process.argv.slice(2).filter((a) => a.includes('='));
if (pares.length) {
  for (const p of pares) { const [k, v] = p.split('='); cfg[k] = isNaN(+v) ? v : +v; }
  fs.writeFileSync(ARQ, JSON.stringify(cfg, null, 2));
  console.log('salvo:', cfg);
  process.exit(0);
}
const r = await fetch('https://api.elevenlabs.io/v1/voices', { headers: { 'xi-api-key': process.env.ELEVENLABS_API_KEY || 'injetada-pelo-proxy' } });
if (!r.ok) { console.error(`ElevenLabs ${r.status}: ${await r.text()}`); process.exit(1); }
const { voices } = await r.json();
for (const v of voices) console.log(`${v.voice_id}  ${v.name.padEnd(22)} ${[v.category, v.labels?.gender, v.labels?.age, v.labels?.accent].filter(Boolean).join(' · ')}`);
console.log('\nConfiguração atual:', cfg);
