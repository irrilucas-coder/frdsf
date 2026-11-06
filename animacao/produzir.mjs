#!/usr/bin/env node
// Produz um Short completo: roteiro/tema → direção (Claude Haiku) → vozes (ElevenLabs) → animação → MP4 vertical.
//
//   node produzir.mjs --tema "Por que o céu é azul?"          (Haiku escreve o roteiro e dirige)
//   node produzir.mjs --roteiro roteiros/ceu.txt               (Haiku só dirige o seu roteiro)
//   node produzir.mjs --direcao episodios/ceu.direcao.json     (pula o Haiku: usa uma direção pronta)
//   opções: --nome ceu  --sem-voz (testa sem ElevenLabs)  --rapido (540x960)  --so-json (não renderiza)
//
// Chaves: ANTHROPIC_API_KEY e ELEVENLABS_API_KEY no ambiente (ou injetadas pelo proxy do ambiente na nuvem).
// O fetch do Node só usa o proxy da rede com NODE_USE_ENV_PROXY=1: reabre o script com isso ligado.
if ((process.env.HTTPS_PROXY || process.env.https_proxy) && !process.env.NODE_USE_ENV_PROXY) {
  const { spawnSync: _sp } = await import('node:child_process');
  const r = _sp(process.execPath, process.argv.slice(1), { stdio: 'inherit', env: { ...process.env, NODE_USE_ENV_PROXY: '1', NODE_NO_WARNINGS: '1' } });
  process.exit(r.status ?? 1);
}
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import Anthropic from '@anthropic-ai/sdk';
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod';
import { z } from 'zod';

const RAIZ = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const opt = (n, d) => { const i = args.indexOf('--' + n); return i < 0 ? d : (args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : true); };
const log = (...a) => console.log('›', ...a);

// ---------- vocabulário do motor (o Haiku só pode usar isto) ----------
const BIB = JSON.parse(fs.readFileSync(path.join(RAIZ, 'biblioteca/personagens.json'), 'utf8'));
const IDS = BIB.map((p) => p.id);
const CENARIOS = ['rua_bairro', 'centro_cidade', 'canteiro_obras', 'parque', 'quarto', 'escola_sala', 'laboratorio', 'estudio', 'rua_trecho', 'cruzamento', 'faixa_pedestre', 'avenida', 'posto_gasolina', 'ponto_onibus', 'cidade'];
const HORAS = ['amanhecer', 'manha', 'meio_dia', 'tarde', 'por_do_sol', 'noite'];
const EXPR = ['neutro', 'feliz', 'rindo', 'surpreso', 'assustado', 'bravo', 'triste', 'pensativo', 'desconfiado', 'apaixonado', 'chorando', 'convencido'];
const GESTOS = ['nenhum', 'acenar', 'apontar', 'apontar_cima', 'apontar_esq', 'apontar_dir', 'pensar', 'bracos_cruzados', 'maos_cabeca', 'comemorar', 'explicar', 'ombros', 'susto', 'segurar', 'mao_cintura', 'dancar', 'medo', 'facepalm', 'pular', 'andar_frente', 'virar_camera', 'virar_outro'];
const CAMERAS = ['close', 'rosto', 'medio', 'corpo', 'geral', 'aberto', 'muito_aberto'];
const MOVS = ['nenhum', 'zoom_in', 'zoom_out', 'orbita', 'pan', 'tremor', 'zoom_rapido', 'subir'];
const ICONES = ['cerebro', 'coracao', 'raio', 'terra', 'sol', 'lua', 'agua', 'relogio', 'check', 'x', 'exclamacao', 'interrogacao', 'estrela', 'lampada'];
const GRAFICOS = ['nenhum', 'titulo', 'fato', 'contador', 'placa', 'icone', 'balao', 'seta', 'tela'];
const LUGARES = ['esquerda', 'centro', 'direita', 'fundo_esquerda', 'fundo_direita'];
const ENTRADAS = ['parado', 'entra_esquerda', 'entra_direita', 'entra_correndo'];

const en = (lista, d = '') => z.string().describe(`um destes: ${lista.join(', ')}${d ? '. ' + d : ''}`);
const Fala = z.object({
  quem: z.string().describe(`id do personagem que fala, ou "narrador" (voz em off do protagonista contando a história). ids: ${IDS.join(', ')}`),
  texto: z.string().describe('o que é dito, em português do Brasil, frase curta e falada (máx. ~22 palavras)'),
  destaques: z.array(z.string()).describe('1 a 2 palavras do texto que aparecem em vermelho na legenda'),
  camera: en(CAMERAS), foco: z.string().describe('id do personagem que a câmera enquadra, ou "grupo"'),
  movimento: en(MOVS),
  acoes: z.array(z.object({ quem: z.string(), gesto: en(GESTOS), expr: en(EXPR) })).describe('o que os personagens fazem durante essa fala'),
  grafico: z.object({
    tipo: en(GRAFICOS), texto: z.string().describe('texto curto do gráfico (ou vazio)'),
    numero_de: z.number(), numero_ate: z.number(), sufixo: z.string(),
    icone: en(ICONES), em: z.string().describe('id do personagem onde o gráfico fica preso (placa/icone/balao/seta), ou "tela"'),
  }),
});
const Cena = z.object({
  cenario: en(CENARIOS), hora: en(HORAS),
  personagens: z.array(z.object({ id: z.string(), lugar: en(LUGARES), entrada: en(ENTRADAS), expr: en(EXPR) })),
  falas: z.array(Fala),
});
const Direcao = z.object({
  titulo: z.string().describe('título do Short em CAIXA ALTA com 1 emoji, estilo "NÃO OLHE PRO CÉU! 😰"'),
  protagonista: z.string(),
  cenas: z.array(Cena), pergunta_final: z.string(),
});

const SISTEMA = `Você é roteirista e diretor de animação de um canal de Shorts de CURIOSIDADES em português do Brasil.
Os vídeos são animações 3D de personagens de blocos, verticais 9:16, com narração em primeira pessoa no estilo "storytime":
o protagonista conta uma situação ("Eu acordei e…", "Num mundo onde…"), com gancho fortíssimo nos 2 primeiros segundos,
fatos reais e surpreendentes explicados de forma simples, reações exageradas dos personagens e uma pergunta final para os comentários.

Regras:
- Duração: 60 a 75 segundos de fala no total (≈ 160 a 200 palavras somando todas as falas). Nunca menos de 150 palavras.
- 7 a 12 cenas; cada cena tem 1 a 3 falas. Troque de câmera a cada fala (varie close, médio, geral) para dar ritmo.
- Os fatos precisam ser verdadeiros. Se não tiver certeza de um número, não use número.
- Use só os personagens da lista e combine o personagem com a função: ${BIB.map((p) => `${p.id} = ${p.nome} (${p.papel})`).join('; ')}.
- Escolha cenários e horas do dia que combinem com a história. Varie os cenários. "estudio" tem um telão: use grafico.tipo "tela" para mostrar um número/ícone nele.
- Gráficos: "titulo" para a frase-gancho, "fato"/"contador" para números (preencha numero_de/numero_ate/sufixo), "placa"/"icone"/"balao"/"seta" presos a um personagem. Use "nenhum" quando não precisar. Pelo menos 4 falas com gráfico.
- Todo personagem que aparece numa fala (quem/foco/acoes) precisa estar em "personagens" daquela cena.
- O narrador é a voz do protagonista; quando "quem" é "narrador", o protagonista deve estar na cena reagindo.
- Texto falado natural, sem emojis, sem hashtags, números por extenso quando curtos.`;

// ---------- 1. direção ----------
async function gerarDirecao() {
  if (opt('direcao')) return JSON.parse(fs.readFileSync(opt('direcao'), 'utf8'));
  const roteiro = opt('roteiro') ? fs.readFileSync(opt('roteiro'), 'utf8') : null;
  const tema = opt('tema');
  if (!roteiro && !tema) throw new Error('Passe --tema "..." ou --roteiro arquivo.txt ou --direcao arquivo.json');
  const pedido = roteiro
    ? `Dirija este roteiro (mantenha o conteúdo e o texto falado o mais fiel possível, só divida em cenas e falas e complete se ficar com menos de 60 segundos):\n\n${roteiro}`
    : `Crie o roteiro completo e a direção de um Short sobre este tema: ${tema}`;
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY || 'injetada-pelo-proxy' });
  log('Claude Haiku escrevendo a direção…');
  let resp;
  try {
    resp = await client.messages.parse({
      model: 'claude-haiku-5-5', max_tokens: 16000,
      system: SISTEMA,
      messages: [{ role: 'user', content: pedido }],
      output_config: { format: zodOutputFormat(Direcao) },
    });
  } catch (e) {
    if (e instanceof Anthropic.AuthenticationError) throw new Error('A chave da Anthropic foi recusada (401). Confira a ANTHROPIC_API_KEY.');
    if (e instanceof Anthropic.RateLimitError) throw new Error('Limite de uso da Anthropic atingido (429). Tente de novo em instantes.');
    if (e instanceof Anthropic.APIConnectionError) throw new Error('Não consegui conectar em api.anthropic.com (rede bloqueada?).');
    throw e;
  }
  if (resp.stop_reason === 'refusal') throw new Error('O Haiku recusou esse tema.');
  if (resp.stop_reason === 'max_tokens') throw new Error('A resposta do Haiku foi cortada (max_tokens).');
  if (!resp.parsed_output) throw new Error('O Haiku não devolveu uma direção válida.');
  log(`Haiku: ${resp.usage.input_tokens} tokens de entrada, ${resp.usage.output_tokens} de saída`);
  return resp.parsed_output;
}

// corrige valores fora do vocabulário (o modelo às vezes inventa)
function normalizar(dir) {
  const pega = (v, lista, d) => (lista.includes(v) ? v : d);
  dir.protagonista = IDS.includes(dir.protagonista) ? dir.protagonista : 'tito';
  dir.cenas = (dir.cenas || []).filter((c) => c.falas?.length).map((c) => {
    c.cenario = pega(c.cenario, CENARIOS, 'rua_trecho'); c.hora = pega(c.hora, HORAS, 'manha');
    c.personagens = (c.personagens || []).filter((p) => IDS.includes(p.id)).map((p) => ({ id: p.id, lugar: pega(p.lugar, LUGARES, 'centro'), entrada: pega(p.entrada, ENTRADAS, 'parado'), expr: pega(p.expr, EXPR, 'neutro') }));
    const usados = new Set(c.personagens.map((p) => p.lugar));
    const garantir = (id) => { if (IDS.includes(id) && !c.personagens.some((p) => p.id === id)) { const l = LUGARES.find((x) => !usados.has(x)) || 'centro'; usados.add(l); c.personagens.push({ id, lugar: l, entrada: 'parado', expr: 'neutro' }); } };
    if (!c.personagens.length) garantir(dir.protagonista);
    c.falas = c.falas.map((f) => {
      if (f.quem === 'narrador') garantir(dir.protagonista); else garantir(f.quem);
      const g = f.grafico || {};
      return { quem: f.quem === 'narrador' || IDS.includes(f.quem) ? f.quem : 'narrador', texto: String(f.texto || '').replace(/[\u{1F300}-\u{1FAFF}]/gu, '').trim(), destaques: f.destaques || [],
        camera: pega(f.camera, CAMERAS, 'medio'), foco: f.foco === 'grupo' || IDS.includes(f.foco) ? f.foco : 'grupo', movimento: pega(f.movimento, MOVS, 'nenhum'),
        acoes: (f.acoes || []).filter((a) => IDS.includes(a.quem)).map((a) => ({ quem: a.quem, gesto: pega(a.gesto, GESTOS, 'nenhum'), expr: pega(a.expr, EXPR, 'neutro') })),
        grafico: { tipo: pega(g.tipo, GRAFICOS, 'nenhum'), texto: g.texto || '', numero_de: +g.numero_de || 0, numero_ate: +g.numero_ate || 0, sufixo: g.sufixo || '', icone: pega(g.icone, ICONES, 'exclamacao'), em: g.em || '' } };
    }).filter((f) => f.texto);
    return c;
  });
  return dir;
}

// ---------- 2. vozes ----------
const VOZES_ARQ = path.join(RAIZ, 'biblioteca/vozes.json');
const vozes = fs.existsSync(VOZES_ARQ) ? JSON.parse(fs.readFileSync(VOZES_ARQ, 'utf8')) : {};
async function tts(texto, vozId, arq) {
  const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(vozId)}/with-timestamps?output_format=mp3_44100_128`, {
    method: 'POST',
    headers: { 'xi-api-key': process.env.ELEVENLABS_API_KEY || 'injetada-pelo-proxy', 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: texto, model_id: vozes.modelo || 'eleven_multilingual_v2', voice_settings: { stability: vozes.estabilidade ?? 0.4, similarity_boost: 0.8, style: vozes.exagero ?? 0.35, use_speaker_boost: true } }),
  });
  if (!r.ok) throw new Error(`ElevenLabs ${r.status}: ${(await r.text()).slice(0, 300)}`);
  const j = await r.json();
  fs.writeFileSync(arq, Buffer.from(j.audio_base64, 'base64'));
  const a = j.alignment || j.normalized_alignment;
  return { dur: duracaoAudio(arq), palavras: palavrasDeAlinhamento(a) };
}
function duracaoAudio(arq) { return parseFloat(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', arq]).toString()); }
function palavrasDeAlinhamento(a) {
  const out = []; let atual = null;
  a.characters.forEach((ch, i) => {
    if (/\s/.test(ch)) { if (atual) { out.push(atual); atual = null; } return; }
    if (!atual) atual = { palavra: '', t0: a.character_start_times_seconds[i], t1: 0 };
    atual.palavra += ch; atual.t1 = a.character_end_times_seconds[i];
  });
  if (atual) out.push(atual);
  return out;
}
function palavrasEstimadas(texto) { // sem voz: ~2,7 palavras/s
  const ps = texto.split(/\s+/).filter(Boolean); let t = 0;
  return { dur: Math.max(1.2, ps.reduce((s, p) => s + 0.18 + p.length * 0.045, 0)), palavras: ps.map((p) => { const d = 0.18 + p.length * 0.045; const w = { palavra: p, t0: t, t1: t + d }; t += d; return w; }) };
}

// ---------- 3. direção → episódio do motor ----------
const LUGAR = { esquerda: [-3.4, 0], centro: [0, 0], direita: [3.4, 0], fundo_esquerda: [-2.2, -3.5], fundo_direita: [2.2, -3.5] };
const limpa = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^\w]/g, '');

function montarEpisodio(dir, audios) {
  const ep = { titulo: dir.titulo, fps: 30, legendaY: 0.62, cenas: [], legendas: [], efeitos: [] };
  let T = 0, k = 0, angAlt = 1;
  dir.cenas.forEach((c, ci) => {
    const presentes = new Set(c.personagens.map((p) => p.id));
    const valido = (id) => presentes.has(id);
    const atores = {}, eventos = [], camera = [], hud = [], falas = [];
    c.personagens.forEach((p, i) => {
      if (!IDS.includes(p.id)) return;
      const [dx, dz] = LUGAR[p.lugar] || [0, 0];
      const a = { em: 'centro', dx, dz, olhar: dx > 0.5 ? -20 : dx < -0.5 ? 20 : 0, expr: p.expr };
      if (p.entrada !== 'parado') {
        const de = p.entrada === 'entra_direita' ? 16 : -16;
        a.dx = dx + de; a.olhar = de > 0 ? -90 : 90;
        eventos.push({ t: 0, quem: p.id, faz: p.entrada === 'entra_correndo' ? 'correr' : 'andar', para: 'centro', dx, dz, dur: p.entrada === 'entra_correndo' ? 1.0 : 1.7, virarFim: dx > 0.5 ? -20 : dx < -0.5 ? 20 : 0 });
      }
      a.olharCam = dx > 0.5 ? -20 : dx < -0.5 ? 20 : 0; // a câmera se orienta pela frente final do personagem
      atores[p.id] = a;
    });
    const temEntrada = c.personagens.some((p) => p.entrada !== 'parado');
    let t = temEntrada ? 1.6 : 0.35; // espera quem está entrando chegar
    c.falas.forEach((f) => {
      const au = audios[k++]; const d = au.dur;
      const quem = f.quem === 'narrador' ? null : (valido(f.quem) ? f.quem : null);
      if (quem) falas.push({ quem, t, dur: d });
      const foco = valido(f.foco) ? f.foco : (quem || [...presentes][0]);
      angAlt = -angAlt;
      if (!camera.length && t > 0.5) camera.push({ t: 0, enq: 'geral', alvo: undefined, angulo: 15 * angAlt });
      camera.push({ t: !camera.length ? 0 : t - 0.05, enq: f.foco === 'grupo' && f.camera !== 'close' && f.camera !== 'rosto' ? f.camera : f.camera, alvo: f.foco === 'grupo' || !foco ? undefined : foco, angulo: f.camera === 'aberto' || f.camera === 'muito_aberto' ? 25 * angAlt : (10 + (k % 3) * 8) * angAlt, mov: f.movimento === 'nenhum' ? undefined : f.movimento, tremor: f.movimento === 'tremor' ? 0.2 : undefined });
      for (const a of f.acoes) {
        if (!valido(a.quem)) continue;
        if (a.expr) eventos.push({ t, quem: a.quem, faz: 'expr', valor: a.expr, dur: d + 0.4 });
        const g = a.gesto, du = Math.min(d, 2.8);
        if (g === 'nenhum') continue;
        if (g === 'pular') eventos.push({ t: t + 0.1, quem: a.quem, faz: 'pular', dur: 0.6 });
        else if (g === 'susto') eventos.push({ t: t + 0.05, quem: a.quem, faz: 'susto', dur: 1.1 });
        else if (g === 'andar_frente') eventos.push({ t: t + 0.1, quem: a.quem, faz: 'andar', para: 'centro', dx: atores[a.quem]?.dx ?? 0, dz: 3, dur: Math.min(d, 1.8) });
        else if (g === 'virar_camera') eventos.push({ t, quem: a.quem, faz: 'virar', para: 'camera', dur: 0.35 });
        else if (g === 'virar_outro') { const o = [...presentes].find((x) => x !== a.quem); if (o) eventos.push({ t, quem: a.quem, faz: 'virar', para: o, dur: 0.35 }); }
        else eventos.push({ t: t + 0.05, quem: a.quem, faz: 'gesto', valor: g, dur: du });
      }
      const gr = f.grafico;
      if (gr && gr.tipo !== 'nenhum') {
        const em = valido(gr.em) ? gr.em : (quem || foco);
        const h = { t: t + 0.1, ate: t + d + 0.2 };
        if (gr.tipo === 'titulo') hud.push({ ...h, tipo: 'titulo', texto: gr.texto.toUpperCase() });
        else if (gr.tipo === 'fato' || gr.tipo === 'contador') hud.push({ ...h, tipo: 'fato', ...(gr.numero_ate ? { contar: [gr.numero_de || 0, gr.numero_ate], sufixo: gr.sufixo, dur: Math.min(1.5, d) } : { texto: gr.texto }), sub: gr.numero_ate ? gr.texto : undefined, y: 0.26 });
        else if (gr.tipo === 'placa') hud.push({ ...h, tipo: 'placa', em, texto: gr.numero_ate ? undefined : gr.texto, contar: gr.numero_ate ? [gr.numero_de || 0, gr.numero_ate] : undefined, sufixo: gr.sufixo, cor: '#ffd23f' });
        else if (gr.tipo === 'icone') hud.push({ ...h, tipo: 'icone', em, icone: gr.icone });
        else if (gr.tipo === 'balao') hud.push({ ...h, tipo: 'balao', em, texto: gr.texto });
        else if (gr.tipo === 'seta') hud.push({ ...h, tipo: 'seta', em });
        else if (gr.tipo === 'tela') { (c._tela ||= []).push({ t, grande: gr.numero_ate ? `${gr.numero_ate}${gr.sufixo || ''}` : undefined, icone: gr.numero_ate ? undefined : gr.icone, texto: gr.texto, cor: '#ffd23f' }); }
        ep.efeitos.push({ tipo: 'pop', t: T + t + 0.1 });
      }
      const dests = new Set((f.destaques || []).map(limpa));
      au.palavras.forEach((w) => ep.legendas.push({ palavra: w.palavra, t0: T + t + w.t0, t1: T + t + w.t1, destaque: dests.has(limpa(w.palavra)) }));
      au.inicio = T + t;
      if (k > 1) ep.efeitos.push({ tipo: 'whoosh', t: T + t - 0.05 });
      t += d + 0.25;
    });
    const cena = { cenario: c.cenario, hora: c.hora, duracao: +(t + 0.15).toFixed(2), atores, eventos, camera, hud, falas, transicao: ci === 0 ? 'preto' : (ci % 4 === 0 ? 'flash' : undefined) };
    if (c._tela) cena.tela = c._tela;
    if (c.cenario === 'estudio' && !c._tela) cena.tela = [{ t: 0, icone: 'interrogacao' }];
    ep.cenas.push(cena); T += cena.duracao;
  });
  // final: pergunta + inscreva-se
  const prot = IDS.includes(dir.protagonista) ? dir.protagonista : 'tito';
  ep.cenas.push({ cenario: 'estudio', hora: 'noite', duracao: 3.4, transicao: 'flash', atores: { [prot]: { em: 'palco', expr: 'feliz' } },
    eventos: [{ t: 0, quem: prot, faz: 'gesto', valor: 'acenar', dur: 3.4 }], camera: [{ t: 0, enq: 'corpo', alvo: prot, mov: 'zoom_in', dy: 1.2, dist: 1.5 }],
    tela: [{ t: 0, icone: 'interrogacao' }], hud: [{ tipo: 'pergunta', texto: dir.pergunta_final, t: 0.1, y: 0.18 }, { tipo: 'inscrevase', t: 0.5, y: 0.84 }] });
  ep.efeitos.push({ tipo: 'pop', t: T + 0.6 }, { tipo: 'pop', t: T + 1.6 });
  return ep;
}

// ---------- 4. trilha de áudio (vozes nos tempos certos + efeitos) ----------
function efeitosSonoros(pasta) {
  const w = path.join(pasta, 'whoosh.wav'), p = path.join(pasta, 'pop.wav');
  if (!fs.existsSync(w)) execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'lavfi', '-i', 'anoisesrc=color=pink:duration=0.45:amplitude=0.5', '-af', 'highpass=f=300,lowpass=f=3500,afade=t=in:d=0.2,afade=t=out:st=0.2:d=0.25,volume=0.5', w]);
  if (!fs.existsSync(p)) execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'lavfi', '-i', "aevalsrc='0.6*sin(2*PI*(900-700*t/0.12)*t)*exp(-t*30)':s=44100:d=0.15", p]);
  return { whoosh: w, pop: p };
}
function montarTrilha(audios, efeitos, total, saida, pasta) {
  const sfx = efeitosSonoros(pasta);
  const entradas = [], filtros = []; let i = 0;
  for (const a of audios) { if (!a.arq) continue; entradas.push('-i', a.arq); filtros.push(`[${i}:a]adelay=${Math.round(a.inicio * 1000)}|${Math.round(a.inicio * 1000)},aresample=44100[v${i}]`); i++; }
  for (const e of efeitos) { entradas.push('-i', sfx[e.tipo]); filtros.push(`[${i}:a]volume=${e.tipo === 'pop' ? 0.35 : 0.25},adelay=${Math.round(e.t * 1000)}|${Math.round(e.t * 1000)},aresample=44100[v${i}]`); i++; }
  if (!i) return null;
  const mix = `${Array.from({ length: i }, (_, k) => `[v${k}]`).join('')}amix=inputs=${i}:normalize=0:dropout_transition=0,apad,atrim=0:${total.toFixed(2)},loudnorm=I=-15:TP=-1.5[a]`;
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', ...entradas, '-filter_complex', filtros.join(';') + ';' + mix, '-map', '[a]', '-ac', '2', '-c:a', 'libmp3lame', '-b:a', '192k', saida]);
  return saida;
}

// ---------- principal ----------
const t0 = Date.now();
const dir = normalizar(await gerarDirecao());
const nome = (opt('nome') || dir.titulo || 'episodio').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^\w]+/g, '-').replace(/^-|-$/g, '').slice(0, 50) || 'episodio';
const pasta = path.join(RAIZ, 'saida', nome); fs.mkdirSync(pasta, { recursive: true });
fs.writeFileSync(path.join(pasta, 'direcao.json'), JSON.stringify(dir, null, 2));
log(`direção: "${dir.titulo}", ${dir.cenas.length} cenas, ${dir.cenas.reduce((s, c) => s + c.falas.length, 0)} falas, ${dir.cenas.reduce((s, c) => s + c.falas.reduce((a, f) => a + f.texto.split(/\s+/).length, 0), 0)} palavras`);

const semVoz = !!opt('sem-voz');
const audios = [];
let n = 0;
for (const c of dir.cenas) for (const f of c.falas) {
  n++;
  if (semVoz) { audios.push(palavrasEstimadas(f.texto)); continue; }
  const quem = f.quem === 'narrador' ? (dir.protagonista || 'narrador') : f.quem;
  const vozId = vozes[quem] || vozes.narrador;
  if (!vozId) throw new Error('Defina as vozes em biblioteca/vozes.json (rode: node vozes.mjs)');
  const arq = path.join(pasta, `fala${String(n).padStart(2, '0')}.mp3`);
  process.stdout.write(`\r› ElevenLabs: fala ${n}…`);
  const r = await tts(f.texto, f.quem === 'narrador' ? (vozes.narrador || vozId) : vozId, arq);
  audios.push({ ...r, arq });
}
if (!semVoz) process.stdout.write('\n');

const ep = montarEpisodio(dir, audios);
const total = ep.cenas.reduce((s, c) => s + c.duracao, 0);
const epArq = path.join(pasta, `${nome}.json`);
const trilha = montarTrilha(audios, ep.efeitos, total, path.join(pasta, 'trilha.mp3'), pasta);
if (trilha) ep.audio = path.relative(RAIZ, trilha);
fs.writeFileSync(epArq, JSON.stringify(ep, null, 1));
log(`episódio: ${ep.cenas.length} cenas, ${total.toFixed(1)} s${total < 60 ? '  ⚠️ menos de 60 s' : ''}`);
if (opt('so-json')) process.exit(0);

const r = spawnSync('node', [path.join(RAIZ, 'render.js'), epArq, '--saida', path.join(pasta, `${nome}.mp4`), ...(opt('rapido') ? ['--rapido'] : []), '--workers', String(opt('workers', 4))], { stdio: 'inherit' });
if (r.status !== 0) process.exit(r.status || 1);
log(`pronto em ${((Date.now() - t0) / 1000).toFixed(0)} s → ${path.join(pasta, nome + '.mp4')}`);
