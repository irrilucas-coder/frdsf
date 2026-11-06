// Motor de animação: lê um episódio (JSON), monta cenários e personagens e desenha qualquer quadro.
// Tudo é calculado a partir do tempo (sem estado), então dá para renderizar quadros em paralelo.
import * as THREE from 'three';
import { criarPersonagem } from './personagens.js';
import { CENARIOS } from './cenarios.js';
import { ease, clamp01, lerp, noise1, canvasTex } from './base.js';

const DEG = Math.PI / 180;

// ---------- Hora do dia ----------
export const HORAS = {
  amanhecer: { ceu: ['#f7a072', '#ffe0c2'], sol: '#ffb27a', forca: 1.7, elev: 9, hemi: 0.95, noite: false },
  manha: { ceu: ['#62b8ff', '#d8f0ff'], sol: '#fff2d6', forca: 2.3, elev: 38, hemi: 1.2, noite: false },
  meio_dia: { ceu: ['#3f9fff', '#cfeaff'], sol: '#ffffff', forca: 2.6, elev: 72, hemi: 1.3, noite: false },
  tarde: { ceu: ['#58a9f0', '#ffe7c2'], sol: '#ffe0a8', forca: 2.2, elev: 28, hemi: 1.1, noite: false },
  por_do_sol: { ceu: ['#3a3d8c', '#ff9356'], sol: '#ff7a3d', forca: 1.7, elev: 5, hemi: 0.7, noite: true },
  noite: { ceu: ['#050b20', '#1b2c58'], sol: '#9fb7ff', forca: 0.5, elev: 45, hemi: 0.38, noite: true, lua: true },
};
const smooth = (a, b, t) => { const x = clamp01((t - a) / (b - a)); return x * x * (3 - 2 * x); };

// ---------- Poses (rotação dos braços/pernas/cabeça em radianos) ----------
// Convenção: braço direito para fora = +z, esquerdo para fora = -z; levantar para frente = x negativo.
const GESTOS = {
  acenar: (t) => ({ armR: [-0.2, 0, 2.6 + Math.sin(t * 12) * 0.35] }),
  apontar: () => ({ armR: [-1.55, 0, 0.12] }),
  apontar_cima: () => ({ armR: [-2.9, 0, 0.25] }),
  apontar_esq: () => ({ armL: [-0.2, 0, -1.5] }),
  apontar_dir: () => ({ armR: [-0.2, 0, 1.5] }),
  pensar: (t) => ({ armR: [-2.1, 0, -0.75], armL: [-0.9, 0, 0.75], head: [0.08, 0, 0.12 + Math.sin(t * 2) * 0.03] }),
  bracos_cruzados: () => ({ armR: [-1.5, 0.2, -0.6], armL: [-1.4, -0.2, 0.6] }),
  maos_cabeca: (t) => ({ armR: [-2.85, 0, -0.55], armL: [-2.85, 0, 0.55], head: [0, Math.sin(t * 7) * 0.25, 0] }),
  comemorar: (t) => ({ armR: [0, 0, 2.6 + Math.sin(t * 14) * 0.25], armL: [0, 0, -2.6 - Math.sin(t * 14) * 0.25], pulo: Math.abs(Math.sin(t * 7)) * 0.9 }),
  explicar: (t) => ({ armR: [-0.9 + Math.sin(t * 5) * 0.25, 0, 0.3], armL: [-0.7 + Math.sin(t * 5 + 2) * 0.25, 0, -0.3] }),
  ombros: () => ({ armR: [-0.7, 0, 0.75], armL: [-0.7, 0, -0.75], head: [0, 0, 0.15] }),
  susto: (t) => ({ armR: [-0.6, 0, 2.1], armL: [-0.6, 0, -2.1], body: [-0.18, 0, 0], pulo: Math.max(0, Math.sin(Math.min(t, 0.5) / 0.5 * Math.PI)) * 1.3 }),
  segurar: () => ({ armR: [-1.2, 0, -0.25], armL: [-1.2, 0, 0.25] }),
  mao_cintura: () => ({ armR: [-0.3, 0, 0.9], armL: [-0.3, 0, -0.9] }),
  dancar: (t) => ({ armR: [-1 + Math.sin(t * 8) * 0.8, 0, 1.2], armL: [-1 - Math.sin(t * 8) * 0.8, 0, -1.2], body: [0, Math.sin(t * 4) * 0.4, Math.sin(t * 8) * 0.08], pulo: Math.abs(Math.sin(t * 8)) * 0.3 }),
  medo: (t) => ({ armR: [-1.6, 0, -0.5], armL: [-1.6, 0, 0.5], body: [0.05 + Math.sin(t * 40) * 0.03, 0, 0], head: [0.15, 0, 0] }),
  facepalm: () => ({ armR: [-2.4, 0, -0.5], head: [0.35, 0, 0] }),
  sentado: () => ({ legL: [-1.57, 0, 0], legR: [-1.57, 0, 0], armR: [-0.5, 0, 0], armL: [-0.5, 0, 0], desce: 0.15 }),
  sentado_chao: () => ({ legL: [-1.57, 0, -0.15], legR: [-1.57, 0, 0.15], armR: [-0.3, 0, 0.2], armL: [-0.3, 0, -0.2], desce: 1.95 }),
};
const EXPR_GESTO = { susto: 'assustado', maos_cabeca: 'assustado', comemorar: 'rindo', pensar: 'pensativo', medo: 'assustado', facepalm: 'triste', dancar: 'feliz' };

export class Motor {
  constructor({ largura = 1080, altura = 1920 } = {}) {
    this.W = largura; this.H = altura;
    this.renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(1); this.renderer.setSize(largura, altura, false);
    this.renderer.shadowMap.enabled = true; this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping; this.renderer.toneMappingExposure = 1.05;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(50, largura / altura, 0.3, 900);
    this.hemi = new THREE.HemisphereLight('#dff1ff', '#8a7a5a', 1.25); this.scene.add(this.hemi);
    this.sol = new THREE.DirectionalLight('#fff4e0', 2.4); this.sol.castShadow = true;
    this.sol.shadow.mapSize.set(2048, 2048); this.sol.shadow.bias = -0.0004; this.sol.shadow.normalBias = 0.03;
    const sc = this.sol.shadow.camera; sc.left = -45; sc.right = 45; sc.top = 45; sc.bottom = -45; sc.near = 1; sc.far = 260;
    this.scene.add(this.sol, this.sol.target);
    this.preench = new THREE.DirectionalLight('#cfe3ff', 0.6); this.scene.add(this.preench, this.preench.target);
    this.out = document.createElement('canvas'); this.out.width = largura; this.out.height = altura;
    this.ctx = this.out.getContext('2d');
    this.cacheCenario = new Map(); this.rigs = new Map();
    this.cenaAtiva = -1;
  }

  async carregar(ep, biblioteca) {
    this.ep = ep; this.fps = ep.fps || 30;
    this.fichas = Object.fromEntries(biblioteca.map((d) => [d.id, d]));
    let t = 0;
    ep.cenas.forEach((c) => { c._ini = t; t += c.duracao; });
    this.duracao = t; this.totalQuadros = Math.round(t * this.fps);
    this.legendas = ep.legendas || [];
    // fontes da legenda
    await document.fonts.ready;
  }

  rig(id) {
    if (!this.rigs.has(id)) {
      let def = this.fichas[id];
      if (!def) { const base = this.fichas[id.split('#')[0]]; if (base) def = { ...base, id }; }
      if (!def) def = figurante(id);
      this.rigs.set(id, criarPersonagem(def));
    }
    return this.rigs.get(id);
  }

  montarCena(i) {
    if (this.cenaAtiva === i) return;
    const c = this.ep.cenas[i];
    if (this.grupoAtual) this.scene.remove(this.grupoAtual);
    this.rigs.forEach((r) => this.scene.remove(r.root));
    const hora = HORAS[c.hora || this.ep.hora || 'manha'] || HORAS.manha;
    const opcoes = { ...(c.opcoes || {}) };
    if (hora.noite && opcoes.noite === undefined) opcoes.noite = true;
    if (!CENARIOS[c.cenario]) throw new Error(`Cenário desconhecido: ${c.cenario}`);
    const key = c.cenario + JSON.stringify(opcoes);
    if (!this.cacheCenario.has(key)) this.cacheCenario.set(key, CENARIOS[c.cenario](opcoes));
    const cen = this.cacheCenario.get(key);
    this.cen = cen; this.grupoAtual = cen.grupo; this.scene.add(cen.grupo);
    this.hora = cen.interior ? null : hora;
    const [c1, c2] = cen.interior ? cen.ceu : hora.ceu;
    this.scene.background = canvasTex(4, 256, (ctx, W, H) => { const gr = ctx.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, c1); gr.addColorStop(1, c2); ctx.fillStyle = gr; ctx.fillRect(0, 0, W, H); });
    this.scene.fog = cen.interior ? null : new THREE.Fog(c2, 120, 420);
    if (cen.interior) { this.hemi.intensity = 1.5; this.sol.intensity = 1.6; this.sol.color.set('#fff4e0'); this.hemi.color.set('#dff1ff'); }
    else {
      this.hemi.intensity = hora.hemi; this.sol.intensity = hora.forca; this.sol.color.set(hora.sol);
      this.hemi.color.set(hora.noite ? '#7f93c8' : '#dff1ff'); this.hemi.groundColor.set(hora.noite ? '#2a2a3a' : '#8a7a5a');
      this.scene.fog = new THREE.Fog(c2, 140, 520);
    }
    this.montarAstros(cen.interior ? null : hora);
    this.atores = Object.entries(c.atores || {}).map(([id, a]) => ({ id, a, rig: this.rig(id), ev: (c.eventos || []).filter((e) => e.quem === id).sort((x, y) => x.t - y.t) }));
    this.atores.forEach((at) => this.scene.add(at.rig.root));
    this.cenaAtiva = i;
  }

  montarAstros(hora) {
    if (this.astros) this.scene.remove(this.astros);
    this.astros = null;
    if (!hora) return;
    const g = new THREE.Group();
    const lua = !!hora.lua, cor = lua ? '#f5f3ce' : hora.elev < 12 ? '#ffb070' : '#fff8e0';
    this.disco = new THREE.Mesh(new THREE.CircleGeometry(lua ? 18 : 26, 40), new THREE.MeshBasicMaterial({ color: cor, fog: false }));
    g.add(this.disco);
    if (hora.noite) {
      const n = 900, pos = new Float32Array(n * 3);
      for (let i = 0; i < n; i++) { const u = Math.sin(i * 12.9898) * 43758.5453, v = Math.sin(i * 78.233) * 12345.678; const a = (u - Math.floor(u)) * Math.PI * 2, b = Math.acos(1 - (v - Math.floor(v)) * 0.95); pos.set([Math.sin(b) * Math.cos(a) * 650, Math.cos(b) * 650, Math.sin(b) * Math.sin(a) * 650], i * 3); }
      const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      g.add(new THREE.Points(geo, new THREE.PointsMaterial({ color: '#ffffff', size: 2.2, sizeAttenuation: false, fog: false, transparent: true, opacity: lua ? 0.9 : 0.5 })));
    }
    this.camera.far = 900; this.astros = g; this.scene.add(g);
  }

  ponto(ref, extra) {
    if (Array.isArray(ref)) return new THREE.Vector3(ref[0], ref.length === 3 ? ref[1] : 0, ref.length === 3 ? ref[2] : ref[1]);
    const p = this.cen.pontos[ref] || [0, 0, 0];
    return new THREE.Vector3(p[0] + (extra?.dx || 0), p[1], p[2] + (extra?.dz || 0));
  }

  // ---------- estado de um ator no tempo t (segundos desde o início da cena) ----------
  estado(at, t) {
    const a = at.a;
    const base = this.ponto(a.em || 'centro', a);
    const pos = base.clone();
    let rotY = (a.olhar ?? 0) * DEG, andando = 0, passo = 0, correndo = false, escala = a.escala || 1, visivel = a.visivel !== false, pop = 1;
    let expr = a.expr || 'neutro', exprAte = Infinity, olharAlvo = null;
    const gestos = [];
    let pose = a.pose || null;
    for (const e of at.ev) {
      if (e.t > t) break;
      const dur = e.dur ?? 0.5, k = dur > 0 ? clamp01((t - e.t) / dur) : 1;
      switch (e.faz) {
        case 'andar': case 'correr': {
          const de = pos.clone(), para = this.ponto(e.para, e);
          para.y = e.para && !Array.isArray(e.para) ? para.y : de.y;
          const dist = de.distanceTo(para);
          const ang = Math.atan2(para.x - de.x, para.z - de.z);
          const kk = k < 0.1 ? k * k / 0.18 : k > 0.9 ? 1 - (1 - k) * (1 - k) / 0.18 : (k - 0.05) / 0.9; // acelera/freia nas pontas
          pos.lerpVectors(de, para, clamp01(kk));
          if (k < 1) { andando = 1; passo = dist * clamp01(kk); correndo = e.faz === 'correr'; rotY = angLerp(rotY, e.costas ? ang + Math.PI : ang, clamp01((t - e.t) / 0.25)); }
          else if (e.virarFim !== undefined) rotY = e.virarFim * DEG; else rotY = e.costas ? ang + Math.PI : ang;
          break;
        }
        case 'virar': {
          let alvo = typeof e.para === 'number' ? e.para * DEG : null;
          if (e.para === 'camera') alvo = this.anguloCamera(pos);
          else if (typeof e.para === 'string') { const o = this.atores.find((x) => x.id === e.para); if (o) { const op = this.posicaoBase(o, e.t); alvo = Math.atan2(op.x - pos.x, op.z - pos.z); } }
          if (alvo !== null) rotY = angLerp(rotY, alvo, ease.inOut(k));
          break;
        }
        case 'teleporte': pos.copy(this.ponto(e.para, e)); if (e.olhar !== undefined) rotY = e.olhar * DEG; break;
        case 'expr': expr = e.valor; exprAte = e.dur ? e.t + e.dur : Infinity; break;
        case 'gesto': gestos.push({ nome: e.valor, t0: e.t, t1: e.t + (e.dur ?? 1.5), local: t - e.t }); if (e.expr !== false && EXPR_GESTO[e.valor] && e.dur) { expr = e.expr || EXPR_GESTO[e.valor]; exprAte = e.t + e.dur; } break;
        case 'pular': gestos.push({ nome: 'pulo', t0: e.t, t1: e.t + (e.dur ?? 0.6), local: t - e.t, dur: e.dur ?? 0.6, altura: e.altura || 1.6 }); break;
        case 'susto': gestos.push({ nome: 'susto', t0: e.t, t1: e.t + (e.dur ?? 1.2), local: t - e.t }); expr = 'assustado'; exprAte = e.t + (e.dur ?? 1.2) + 0.6; break;
        case 'pose': pose = e.valor; break;
        case 'olhar': olharAlvo = e.para === null ? null : e.para; break;
        case 'escala': escala = lerp(escala, e.valor, ease.inOut(k)); break;
        case 'sumir': visivel = k < 1; pop = 1 - ease.in(k); break;
        case 'aparecer': visivel = true; pop = ease.back(k); break;
      }
    }
    if (t > exprAte) expr = a.expr || 'neutro';
    return { pos, rotY, andando, passo, correndo, escala, visivel, pop, expr, gestos, pose, olharAlvo };
  }
  posicaoBase(at, t) { return this.estado({ ...at, ev: at.ev.filter((e) => e.faz !== 'virar') }, t).pos; }
  anguloCamera(pos) { return Math.atan2(this.camera.position.x - pos.x, this.camera.position.z - pos.z); }

  aplicar(at, s, t, falando) {
    const r = at.rig;
    r.root.visible = s.visivel;
    r.root.position.copy(s.pos);
    r.root.rotation.y = s.rotY;
    r.root.scale.setScalar((r.def.escala || 1) * s.escala * s.pop);
    const J = { armL: [0, 0, 0], armR: [0, 0, 0], legL: [0, 0, 0], legR: [0, 0, 0], head: [0, 0, 0], body: [0, 0, 0] };
    let dy = 0;
    const seed = hash(at.id);
    // respiração / parado
    const resp = Math.sin(t * 2.2 + seed) * 0.04;
    J.armL[2] = -0.06 - resp * 0.5; J.armR[2] = 0.06 + resp * 0.5;
    J.head[1] = noise1(t * 0.35, seed) * 0.12; J.head[0] = noise1(t * 0.3, seed + 3) * 0.05;
    dy += resp * 0.5;
    if (r.tipo === 'cachorro') return this.aplicarCachorro(r, s, t);
    // andar / correr
    if (s.andando) {
      const amp = s.correndo ? 1.0 : 0.6, fase = s.passo / (s.correndo ? 3.4 : 2.4) * Math.PI * 2;
      J.legL[0] = Math.sin(fase) * amp; J.legR[0] = -Math.sin(fase) * amp;
      J.armL[0] = -Math.sin(fase) * amp * 0.85; J.armR[0] = Math.sin(fase) * amp * 0.85;
      dy += Math.abs(Math.cos(fase)) * (s.correndo ? 0.35 : 0.15);
      if (s.correndo) J.body[0] = 0.18;
    }
    // pose fixa (ex.: sentado)
    const camadas = [];
    if (s.pose && GESTOS[s.pose]) camadas.push({ p: GESTOS[s.pose](t), w: 1 });
    for (const gst of s.gestos) {
      const w = Math.min(smooth(gst.t0, gst.t0 + 0.22, t), 1 - smooth(gst.t1 - 0.22, gst.t1, t));
      if (w <= 0) continue;
      if (gst.nome === 'pulo') { dy += Math.sin(clamp01(gst.local / gst.dur) * Math.PI) * gst.altura; J.armL[2] -= 0.8 * w; J.armR[2] += 0.8 * w; J.legL[0] = -0.4 * w; J.legR[0] = 0.2 * w; continue; }
      if (GESTOS[gst.nome]) camadas.push({ p: GESTOS[gst.nome](gst.local), w });
    }
    for (const { p, w } of camadas) {
      for (const j of ['armL', 'armR', 'legL', 'legR', 'head', 'body']) if (p[j]) for (let k = 0; k < 3; k++) J[j][k] = lerp(J[j][k], p[j][k] + (j === 'head' ? J[j][k] : 0), w);
      if (p.pulo) dy += p.pulo * w;
      if (p.desce) dy -= p.desce * w;
    }
    // olhar para alguém (gira a cabeça)
    if (s.olharAlvo) {
      let alvo;
      if (s.olharAlvo === 'camera') alvo = this.camera.position;
      else { const o = this.atores.find((x) => x.id === s.olharAlvo); if (o) alvo = o.rig.root.position; }
      if (alvo) { let a = Math.atan2(alvo.x - s.pos.x, alvo.z - s.pos.z) - s.rotY; a = Math.atan2(Math.sin(a), Math.cos(a)); J.head[1] = Math.max(-1.0, Math.min(1.0, a)); }
    }
    // falar: cabeça balança um pouco
    if (falando) { J.head[0] += Math.sin(t * 9) * 0.04; J.head[2] += Math.sin(t * 4.3) * 0.03; }
    r.armL.rotation.set(...J.armL); r.armR.rotation.set(...J.armR);
    r.legL.rotation.set(...J.legL); r.legR.rotation.set(...J.legR);
    r.neck.rotation.set(...J.head); r.body.rotation.set(...J.body);
    r.body.position.y = dy;
    // rosto
    const piscar = ((t + seed % 3) % 3.7) < 0.12;
    let boca = 0;
    if (falando) { const v = (noise1(t * 11, seed) + 1) / 2; boca = v > 0.62 ? 2 : v > 0.3 ? 1 : 0; }
    r.setFace(s.expr, boca, piscar);
  }

  aplicarCachorro(r, s, t) {
    const f = s.andando ? s.passo / 1.6 * Math.PI * 2 : 0;
    r.legs.forEach((l, i) => { l.rotation.x = s.andando ? Math.sin(f + (i === 0 || i === 3 ? 0 : Math.PI)) * 0.7 : 0; });
    r.tail.rotation.y = Math.sin(t * 14) * 0.6;
    r.body.position.y = s.andando ? Math.abs(Math.cos(f)) * 0.15 : Math.sin(t * 3) * 0.02;
    r.neck.rotation.x = Math.sin(t * 1.3) * 0.08;
    let pulo = 0; for (const g of s.gestos) if (g.nome === 'pulo') pulo += Math.sin(clamp01(g.local / g.dur) * Math.PI) * 1.2;
    r.body.position.y += pulo;
  }

  falandoAgora(id, tc, c) {
    return (c.falas || []).some((f) => f.quem === id && tc >= f.t && tc <= f.t + f.dur);
  }

  // ---------- câmera ----------
  posicionarCamera(c, tc) {
    const keys = c.camera && c.camera.length ? c.camera : [{ t: 0, enq: 'geral', alvo: Object.keys(c.atores || {}) }];
    let i = 0; for (let k = 0; k < keys.length; k++) if (keys[k].t <= tc) i = k;
    const key = keys[i], prox = keys[i + 1];
    const fim = prox ? prox.t : c.duracao;
    const k = clamp01((tc - key.t) / Math.max(0.01, fim - key.t));
    let [pos, alvo] = this.poseCamera(key, tc, k);
    if (key.transicao === 'suave' && i > 0) {
      const ant = keys[i - 1], fimAnt = key.t;
      const [p0, a0] = this.poseCamera(ant, tc, clamp01((fimAnt - ant.t) / Math.max(0.01, fimAnt - ant.t)));
      const w = ease.inOut(clamp01((tc - key.t) / (key.durTransicao || 0.8)));
      pos.lerpVectors(p0, pos, w); alvo.lerpVectors(a0, alvo, w);
    }
    this.camera.fov = key.fov || 50; this.camera.updateProjectionMatrix();
    this.camera.position.copy(pos); this.camera.lookAt(alvo);
    if (key.mov === 'tremor' || key.tremor) {
      const f = key.tremor || 0.25;
      this.camera.rotation.z += noise1(tc * 18, 7) * 0.03 * f * 4;
      this.camera.position.x += noise1(tc * 20, 1) * f; this.camera.position.y += noise1(tc * 22, 2) * f;
    }
    if (key.inclinar) this.camera.rotation.z += key.inclinar * DEG;
    // sombra acompanha
    const el = (this.hora ? this.hora.elev : 55) * DEG, az = 35 * DEG;
    const dir = new THREE.Vector3(Math.cos(el) * Math.sin(az), Math.sin(el), Math.cos(el) * Math.cos(az));
    this.sol.position.copy(alvo).addScaledVector(dir, 120); this.sol.target.position.copy(alvo);
    if (this.astros) { this.astros.position.copy(this.camera.position); this.disco.position.copy(dir).multiplyScalar(600); this.disco.lookAt(0, 0, 0); }
    this.preench.position.set(pos.x - 30, pos.y + 20, pos.z); this.preench.target.position.copy(alvo);
  }

  poseCamera(key, tc, k) {
    if (key.pos) {
      const p = new THREE.Vector3(...key.pos), a = new THREE.Vector3(...(key.olhar || [0, 3, 0]));
      if (key.ate) p.lerp(new THREE.Vector3(...key.ate), ease.inOut(k));
      if (key.olharAte) a.lerp(new THREE.Vector3(...key.olharAte), ease.inOut(k));
      return [p, a];
    }
    const ids = key.alvo === undefined ? this.atores.map((x) => x.id) : [].concat(key.alvo);
    const pts = ids.map((id) => {
      if (typeof id === 'string' && id.startsWith('ponto:')) return this.ponto(id.slice(6));
      const at = this.atores.find((x) => x.id === id); if (!at) return new THREE.Vector3();
      const p = at.rig.root.position.clone(); return p;
    });
    if (!pts.length) pts.push(new THREE.Vector3());
    const centro = pts.reduce((s, p) => s.add(p), new THREE.Vector3()).multiplyScalar(1 / pts.length);
    let spread = 0; pts.forEach((p) => { spread = Math.max(spread, p.distanceTo(centro) * 2); });
    const altPers = ids.length === 1 && this.atores.find((x) => x.id === ids[0]) ? this.atores.find((x) => x.id === ids[0]).rig.altura * this.atores.find((x) => x.id === ids[0]).rig.root.scale.x / ((this.atores.find((x) => x.id === ids[0]).rig.def.escala) || 1) : 5.25;
    const enq = { close: [4.8, 0.8], rosto: [3.4, 0.84], medio: [6.2, 0.66], corpo: [9.5, 0.5], geral: [17, 0.45], aberto: [36, 0.4], muito_aberto: [70, 0.35] }[key.enq || 'medio'] || [6.2, 0.66];
    const escalaRef = altPers / 5.25;
    let D = enq[0] * escalaRef, yAlvo = centro.y + altPers * enq[1];
    if (spread > 0) D = Math.max(D, (spread + 5) / (0.93 * 0.5625) * 0.9);
    D *= key.dist || 1;
    if (key.mov === 'zoom_in') D *= lerp(1.15, 0.8, ease.inOut(k));
    if (key.mov === 'zoom_out') D *= lerp(0.8, 1.15, ease.inOut(k));
    if (key.mov === 'zoom_rapido') D *= lerp(1.6, 1, ease.out(clamp01(k * 4)));
    let ang = (key.angulo || 0) * DEG;
    if (ids.length === 1 && key.relativo !== false) { const at = this.atores.find((x) => x.id === ids[0]); if (at) ang += (at.a.olharCam ?? at.a.olhar ?? 0) * DEG; }
    if (key.mov === 'orbita') ang += lerp(-12, 12, ease.inOut(k)) * DEG * (key.forca || 1);
    const alt = key.altura ?? (key.enq === 'aberto' || key.enq === 'muito_aberto' ? D * 0.35 : 0.3);
    let subir = key.mov === 'subir' ? lerp(0, 6, ease.inOut(k)) : key.mov === 'descer' ? lerp(6, 0, ease.inOut(k)) : 0;
    const alvo = new THREE.Vector3(centro.x + (key.dx || 0), yAlvo + (key.dy || 0), centro.z);
    const pos = new THREE.Vector3(alvo.x + Math.sin(ang) * D, yAlvo + alt + subir, alvo.z + Math.cos(ang) * D);
    if (key.lateral) { const lado = new THREE.Vector3(Math.cos(ang), 0, -Math.sin(ang)).multiplyScalar(key.lateral); pos.add(lado); alvo.add(lado); }
    if (key.mov === 'pan') { const lado = new THREE.Vector3(Math.cos(ang), 0, -Math.sin(ang)).multiplyScalar(lerp(-2, 2, ease.inOut(k)) * (key.forca || 1)); pos.add(lado); alvo.add(lado); }
    if (key.colisao !== false && !this.livre(alvo, pos)) {
      // tenta girar a câmera para achar um ângulo sem obstáculo; se não achar, aproxima
      let achou = false;
      for (const d of [25, -25, 50, -50, 75, -75]) {
        const a2 = ang + d * DEG, p2 = new THREE.Vector3(alvo.x + Math.sin(a2) * D, pos.y, alvo.z + Math.cos(a2) * D);
        if (this.livre(alvo, p2)) { pos.copy(p2); achou = true; break; }
      }
      if (!achou) this.evitarObstaculos(alvo, pos);
    }
    return [pos, alvo];
  }

  livre(alvo, pos) {
    if (!this._ray) this._ray = new THREE.Raycaster();
    const dir = pos.clone().sub(alvo), dist = dir.length(); if (dist < 2.5) return true;
    this._ray.set(alvo, dir.normalize()); this._ray.far = dist + 1; this._ray.near = 1.0;
    return !this._ray.intersectObject(this.cen.grupo, true).some((h) => h.object.visible && !h.object.isPoints && h.object.geometry?.type !== 'CircleGeometry' && !semColisao(h.object));
  }

  // puxa a câmera para frente se tiver uma árvore/poste/parede entre ela e o personagem
  evitarObstaculos(alvo, pos) {
    if (!this._ray) { this._ray = new THREE.Raycaster(); }
    const dir = pos.clone().sub(alvo), dist = dir.length(); if (dist < 2.5) return;
    dir.normalize();
    this._ray.set(alvo, dir); this._ray.far = dist; this._ray.near = 1.2;
    const atoresRoots = new Set(this.atores.map((a) => a.rig.root));
    const hits = this._ray.intersectObject(this.cen.grupo, true).filter((h) => h.object.visible && !h.object.isPoints && h.object.geometry?.type !== 'CircleGeometry' && !semColisao(h.object));
    if (hits.length) { const d = Math.max(2.2, hits[0].distance - 0.6); pos.copy(alvo).addScaledVector(dir, d); }
  }

  // ---------- quadro ----------
  desenhar(f) {
    const t = f / this.fps;
    let i = 0; while (i < this.ep.cenas.length - 1 && t >= this.ep.cenas[i + 1]._ini) i++;
    const c = this.ep.cenas[i], tc = t - c._ini;
    this.montarCena(i);
    if (this.cen.tela && c.tela) this.desenharTela(c.tela, tc);
    if (this.cen.grupo.userData.animar) this.cen.grupo.userData.animar(tc);
    const estados = this.atores.map((at) => [at, this.estado(at, tc)]);
    estados.forEach(([at, s]) => this.aplicar(at, s, tc, this.falandoAgora(at.id, tc, c)));
    this.scene.updateMatrixWorld(true); // posições atualizadas antes de testar obstáculos
    this.posicionarCamera(c, tc);
    this.renderer.render(this.scene, this.camera);
    const ctx = this.ctx;
    ctx.drawImage(this.renderer.domElement, 0, 0);
    for (const h of c.hud || []) desenharHud(ctx, this, h, tc, c);
    desenharLegenda(ctx, this, t);
    if (c.transicao === 'flash' && tc < 0.25) { ctx.fillStyle = `rgba(255,255,255,${1 - tc / 0.25})`; ctx.fillRect(0, 0, this.W, this.H); }
    if (c.transicao === 'preto' && tc < 0.35) { ctx.fillStyle = `rgba(0,0,0,${1 - tc / 0.35})`; ctx.fillRect(0, 0, this.W, this.H); }
    return this.out;
  }

  desenharTela(tela, tc) {
    const tex = this.cen.tela.userData.tex, cv = tex.image, ctx = cv.getContext('2d'), W = cv.width, H = cv.height;
    const atual = [].concat(tela).filter((x) => (x.t ?? 0) <= tc).pop();
    if (!atual) return;
    const key = JSON.stringify(atual) + Math.floor(tc * 10);
    if (this._telaKey === key) return; this._telaKey = key;
    const k = clamp01((tc - (atual.t ?? 0)) / 0.4);
    ctx.fillStyle = atual.fundo || '#0d1b2a'; ctx.fillRect(0, 0, W, H);
    ctx.save(); ctx.translate(W / 2, H / 2); ctx.scale(ease.back(k), ease.back(k));
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    if (atual.grande) { ctx.fillStyle = atual.cor || '#38e8ff'; ctx.font = `${atual.tamanho || 230}px "Lilita One"`; ctx.fillText(atual.grande, 0, atual.texto ? -60 : 0); }
    if (atual.texto) { ctx.fillStyle = '#ffffff'; ctx.font = `${atual.grande ? 64 : 96}px "Lilita One"`; quebrar(ctx, atual.texto, 0, atual.grande ? 150 : 0, W * 0.85, atual.grande ? 74 : 110); }
    if (atual.icone) desenharIcone(ctx, atual.icone, 0, atual.texto ? -80 : 0, 220, atual.cor);
    ctx.restore();
    tex.needsUpdate = true;
  }

  projetar(id, dy = 0.6) {
    const at = this.atores.find((x) => x.id === id); if (!at) return null;
    const p = at.rig.root.position.clone(); p.y += at.rig.altura * (at.rig.root.scale.x / (at.rig.def.escala || 1)) + dy;
    p.project(this.camera);
    if (p.z > 1) return null;
    return [(p.x + 1) / 2 * this.W, (1 - p.y) / 2 * this.H];
  }
}

function semColisao(o) { while (o) { if (o.userData?.semColisao) return true; o = o.parent; } return false; }
function angLerp(a, b, t) { let d = b - a; d = Math.atan2(Math.sin(d), Math.cos(d)); return a + d * t; }
function hash(s) { let h = 0; for (const ch of s) h = (h * 31 + ch.charCodeAt(0)) | 0; return Math.abs(h) % 1000; }

const PELES = ['#f2c9a0', '#e0ac7e', '#c68b5e', '#8d5a3b', '#ffd8b8', '#a8714c'];
const ROUPAS = ['#e23b3b', '#3d7bff', '#43a047', '#ffb300', '#8e44ad', '#ff7043', '#26a69a', '#ec407a', '#5d6d7e'];
const CABELOS = ['#2b1d12', '#5a3a1e', '#111111', '#c8902e', '#8a3b12', '#d0d0d0'];
const ESTILOS = ['curto', 'franja', 'longo', 'rabo', 'black', 'espetado', 'coque', 'calvo'];
export function figurante(id) {
  const h = hash(id);
  return { id, nome: id, pele: PELES[h % PELES.length], cabelo: { estilo: ESTILOS[(h >> 2) % ESTILOS.length], cor: CABELOS[(h >> 3) % CABELOS.length] },
    roupa: { camisa: ROUPAS[(h >> 1) % ROUPAS.length], calca: ['#2b3a55', '#4f7cc9', '#3e3e3e', '#6d4c41'][(h >> 4) % 4], sapato: ['#f4f4f4', '#222', '#8a5a2b'][h % 3], manga: h % 2 ? 'curta' : 'longa', estampa: ['lisa', 'listrada', 'lisa', 'estrela'][(h >> 5) % 4] } };
}

// ---------- HUD (textos e elementos na tela) ----------
function pill(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
function quebrar(ctx, texto, x, y, maxW, lh) {
  const pal = String(texto).split(' '); const linhas = []; let l = '';
  for (const p of pal) { const tt = l ? l + ' ' + p : p; if (ctx.measureText(tt).width > maxW && l) { linhas.push(l); l = p; } else l = tt; }
  if (l) linhas.push(l);
  linhas.forEach((ln, i) => ctx.fillText(ln, x, y + (i - (linhas.length - 1) / 2) * lh));
  return linhas.length;
}
function textoContorno(ctx, txt, x, y, { cor = '#fff', contorno = '#000', larg = 12 } = {}) {
  ctx.lineJoin = 'round'; ctx.miterLimit = 2; ctx.lineWidth = larg; ctx.strokeStyle = contorno; ctx.strokeText(txt, x, y); ctx.fillStyle = cor; ctx.fillText(txt, x, y);
}
export function desenharIcone(ctx, nome, x, y, s, cor = '#ffd23f') {
  ctx.save(); ctx.translate(x, y); ctx.fillStyle = cor; ctx.strokeStyle = cor; ctx.lineWidth = s * 0.08; ctx.lineCap = 'round';
  const r = s / 2;
  switch (nome) {
    case 'cerebro': ctx.fillStyle = '#ff8fb1'; [[-0.35, -0.1, 0.45], [0.3, -0.15, 0.45], [0, 0.25, 0.42], [-0.45, 0.25, 0.3], [0.45, 0.25, 0.3]].forEach(([a, b, c]) => { ctx.beginPath(); ctx.arc(a * r, b * r, c * r, 0, 7); ctx.fill(); }); ctx.strokeStyle = '#d6587f'; ctx.beginPath(); ctx.moveTo(0, -0.5 * r); ctx.lineTo(0, 0.5 * r); ctx.stroke(); break;
    case 'coracao': ctx.fillStyle = '#ff3b6b'; ctx.beginPath(); ctx.moveTo(0, r * 0.8); ctx.bezierCurveTo(-r * 1.4, -r * 0.2, -r * 0.6, -r * 1.2, 0, -r * 0.4); ctx.bezierCurveTo(r * 0.6, -r * 1.2, r * 1.4, -r * 0.2, 0, r * 0.8); ctx.fill(); break;
    case 'raio': ctx.beginPath(); ctx.moveTo(r * 0.1, -r); ctx.lineTo(-r * 0.5, r * 0.1); ctx.lineTo(0, r * 0.1); ctx.lineTo(-r * 0.15, r); ctx.lineTo(r * 0.55, -r * 0.2); ctx.lineTo(r * 0.05, -r * 0.2); ctx.closePath(); ctx.fill(); break;
    case 'terra': ctx.fillStyle = '#2f80ed'; ctx.beginPath(); ctx.arc(0, 0, r, 0, 7); ctx.fill(); ctx.fillStyle = '#43a047'; [[-0.3, -0.3, 0.35], [0.35, 0.2, 0.3], [-0.1, 0.45, 0.2]].forEach(([a, b, c]) => { ctx.beginPath(); ctx.arc(a * r, b * r, c * r, 0, 7); ctx.fill(); }); break;
    case 'sol': ctx.fillStyle = '#ffd23f'; ctx.beginPath(); ctx.arc(0, 0, r * 0.55, 0, 7); ctx.fill(); for (let i = 0; i < 8; i++) { ctx.save(); ctx.rotate(i * Math.PI / 4); ctx.fillRect(-r * 0.07, -r, r * 0.14, r * 0.3); ctx.restore(); } break;
    case 'lua': ctx.fillStyle = '#f5f3ce'; ctx.beginPath(); ctx.arc(0, 0, r * 0.8, 0, 7); ctx.fill(); ctx.globalCompositeOperation = 'destination-out'; ctx.beginPath(); ctx.arc(r * 0.35, -r * 0.2, r * 0.65, 0, 7); ctx.fill(); break;
    case 'agua': ctx.fillStyle = '#4fc3f7'; ctx.beginPath(); ctx.moveTo(0, -r); ctx.bezierCurveTo(r * 0.9, 0, r * 0.7, r, 0, r); ctx.bezierCurveTo(-r * 0.7, r, -r * 0.9, 0, 0, -r); ctx.fill(); break;
    case 'relogio': ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(0, 0, r, 0, 7); ctx.fill(); ctx.strokeStyle = '#222'; ctx.stroke(); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -r * 0.6); ctx.moveTo(0, 0); ctx.lineTo(r * 0.45, 0); ctx.stroke(); break;
    case 'check': ctx.strokeStyle = '#2ecc71'; ctx.lineWidth = s * 0.16; ctx.beginPath(); ctx.moveTo(-r * 0.6, 0); ctx.lineTo(-r * 0.1, r * 0.5); ctx.lineTo(r * 0.7, -r * 0.5); ctx.stroke(); break;
    case 'x': ctx.strokeStyle = '#ff4d4d'; ctx.lineWidth = s * 0.16; ctx.beginPath(); ctx.moveTo(-r * 0.6, -r * 0.6); ctx.lineTo(r * 0.6, r * 0.6); ctx.moveTo(r * 0.6, -r * 0.6); ctx.lineTo(-r * 0.6, r * 0.6); ctx.stroke(); break;
    case 'exclamacao': ctx.font = `${s * 1.2}px "Lilita One"`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; textoContorno(ctx, '!', 0, 0, { cor, larg: s * 0.1 }); break;
    case 'interrogacao': ctx.font = `${s * 1.2}px "Lilita One"`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; textoContorno(ctx, '?', 0, 0, { cor, larg: s * 0.1 }); break;
    case 'estrela': ctx.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.45 : r; ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); } ctx.closePath(); ctx.fill(); break;
    case 'lampada': ctx.strokeStyle = '#1b1b22'; ctx.lineWidth = s * 0.05; ctx.fillStyle = '#ffd23f'; ctx.beginPath(); ctx.arc(0, -r * 0.15, r * 0.55, 0, 7); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#9aa4b2'; ctx.fillRect(-r * 0.25, r * 0.38, r * 0.5, r * 0.38); ctx.strokeRect(-r * 0.25, r * 0.38, r * 0.5, r * 0.38); ctx.strokeStyle = '#ffd23f'; ctx.lineWidth = s * 0.06; for (let i = -2; i <= 2; i++) { const a = -Math.PI / 2 + i * 0.55; ctx.beginPath(); ctx.moveTo(Math.cos(a) * r * 0.75, -r * 0.15 + Math.sin(a) * r * 0.75); ctx.lineTo(Math.cos(a) * r, -r * 0.15 + Math.sin(a) * r); ctx.stroke(); } break;
    default: ctx.font = `${s}px "Lilita One"`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; textoContorno(ctx, nome, 0, 0, { cor, larg: s * 0.08 });
  }
  ctx.restore();
}

function desenharHud(ctx, m, h, tc, c) {
  const t0 = h.t ?? 0, t1 = h.ate ?? c.duracao;
  if (tc < t0 || tc > t1) return;
  const W = m.W, H = m.H, k = clamp01((tc - t0) / 0.3), sai = clamp01((t1 - tc) / 0.2);
  const pop = ease.back(k) * Math.min(1, sai * 1.5 + 0.0001);
  ctx.save();
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  switch (h.tipo) {
    case 'placa': { // etiqueta presa em cima de um personagem (ex.: "50 m")
      const p = h.em ? m.projetar(h.em, h.dy ?? 0.8) : [W / 2, H * (h.y ?? 0.12)];
      if (!p) break;
      const txt = typeof h.texto === 'function' ? h.texto(tc) : contadorTexto(h, tc);
      ctx.font = `${h.tamanho || 96}px "Lilita One"`;
      const w = ctx.measureText(txt).width + 70, hh = (h.tamanho || 96) * 1.25;
      ctx.translate(p[0], p[1] - hh / 2); ctx.scale(pop, pop);
      ctx.fillStyle = h.fundo || 'rgba(20,20,28,.88)'; pill(ctx, -w / 2, -hh / 2, w, hh, 22); ctx.fill();
      ctx.lineWidth = 8; ctx.strokeStyle = h.borda || '#ffffff'; ctx.stroke();
      ctx.fillStyle = h.cor || '#ffd23f'; ctx.fillText(txt, 0, 6);
      break;
    }
    case 'titulo': { // faixa grande no topo
      ctx.translate(W / 2, H * (h.y ?? 0.13)); ctx.rotate((h.giro ?? -3) * DEG); ctx.scale(pop, pop);
      let tam = h.tamanho || 120; ctx.font = `${tam}px "Lilita One"`;
      while (ctx.measureText(h.texto).width + 90 > W * 0.92 && tam > 50) { tam -= 4; ctx.font = `${tam}px "Lilita One"`; }
      const w = ctx.measureText(h.texto).width + 90, hh = tam * 1.35;
      ctx.fillStyle = h.fundo || '#ffd23f'; pill(ctx, -w / 2, -hh / 2, w, hh, 28); ctx.fill();
      ctx.lineWidth = 10; ctx.strokeStyle = '#1b1b22'; ctx.stroke();
      ctx.fillStyle = h.cor || '#1b1b22'; ctx.fillText(h.texto, 0, 8);
      break;
    }
    case 'fato': { // cartão central com número/frase grande
      ctx.translate(W / 2, H * (h.y ?? 0.3)); ctx.scale(pop, pop);
      const bw = W * 0.86, bh = h.sub ? 470 : 330;
      ctx.fillStyle = h.fundo || 'rgba(255,255,255,.96)'; pill(ctx, -bw / 2, -bh / 2, bw, bh, 40); ctx.fill();
      ctx.lineWidth = 12; ctx.strokeStyle = h.borda || '#1b1b22'; ctx.stroke();
      ctx.fillStyle = h.cor || '#ff3b5c'; ctx.font = `${h.tamanho || 170}px "Lilita One"`;
      ctx.fillText(contadorTexto(h, tc), 0, h.sub ? -70 : 6);
      if (h.sub) { ctx.fillStyle = '#1b1b22'; ctx.font = '64px "Lilita One"'; quebrar(ctx, h.sub, 0, 120, bw * 0.88, 72); }
      break;
    }
    case 'icone': {
      const p = h.em ? m.projetar(h.em, h.dy ?? 1.2) : [W * (h.x ?? 0.5), H * (h.y ?? 0.3)];
      if (!p) break;
      ctx.translate(p[0], p[1] + Math.sin(tc * 5) * 12); ctx.scale(pop, pop); ctx.rotate(Math.sin(tc * 3) * 0.08);
      desenharIcone(ctx, h.icone, 0, 0, h.tamanho || 200, h.cor);
      break;
    }
    case 'seta': {
      const p = h.em ? m.projetar(h.em, h.dy ?? 1.5) : [W * (h.x ?? 0.5), H * (h.y ?? 0.3)];
      if (!p) break;
      ctx.translate(p[0], p[1] - 40 + Math.sin(tc * 8) * 22); ctx.scale(pop, pop);
      ctx.fillStyle = h.cor || '#ff3b5c'; ctx.strokeStyle = '#fff'; ctx.lineWidth = 10;
      ctx.beginPath(); ctx.moveTo(-50, -110); ctx.lineTo(50, -110); ctx.lineTo(50, -30); ctx.lineTo(95, -30); ctx.lineTo(0, 60); ctx.lineTo(-95, -30); ctx.lineTo(-50, -30); ctx.closePath(); ctx.stroke(); ctx.fill();
      break;
    }
    case 'balao': { // balão de fala/pensamento acima do personagem
      const p = h.em ? m.projetar(h.em, h.dy ?? 1.0) : [W / 2, H * 0.25];
      if (!p) break;
      ctx.font = `${h.tamanho || 62}px "Lilita One"`;
      const maxW = W * 0.7; const linhas = Math.ceil(ctx.measureText(h.texto).width / maxW);
      const bw = Math.min(maxW, ctx.measureText(h.texto).width) + 80, bh = linhas * (h.tamanho || 62) * 1.15 + 60;
      const x = Math.max(bw / 2 + 20, Math.min(W - bw / 2 - 20, p[0])), y = p[1] - bh / 2 - 60;
      ctx.translate(x, y); ctx.scale(pop, pop);
      ctx.fillStyle = '#fff'; pill(ctx, -bw / 2, -bh / 2, bw, bh, 36); ctx.fill(); ctx.lineWidth = 7; ctx.strokeStyle = '#1b1b22'; ctx.stroke();
      ctx.beginPath(); ctx.moveTo(p[0] - x - 25, bh / 2 - 4); ctx.lineTo(p[0] - x + 10, bh / 2 + 55); ctx.lineTo(p[0] - x + 30, bh / 2 - 4); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#fff'; ctx.fillRect(p[0] - x - 22, bh / 2 - 10, 50, 10);
      ctx.fillStyle = '#1b1b22'; quebrar(ctx, h.texto, 0, 4, maxW, (h.tamanho || 62) * 1.15);
      break;
    }
    case 'pergunta': { // pergunta final para os comentários
      ctx.translate(W / 2, H * (h.y ?? 0.2)); ctx.scale(pop, pop);
      ctx.font = `${h.tamanho || 74}px "Lilita One"`;
      const bw = W * 0.86, bh = 300;
      ctx.fillStyle = '#ffffff'; pill(ctx, -bw / 2, -bh / 2, bw, bh, 40); ctx.fill(); ctx.lineWidth = 10; ctx.strokeStyle = '#1b1b22'; ctx.stroke();
      ctx.fillStyle = '#1b1b22'; quebrar(ctx, h.texto, 0, 0, bw * 0.86, (h.tamanho || 74) * 1.12);
      break;
    }
    case 'inscrevase': {
      const cl = tc - t0 > 1.0; // "clicou"
      ctx.translate(W / 2, H * (h.y ?? 0.8)); ctx.scale(pop * (cl && tc - t0 < 1.15 ? 0.9 : 1), pop * (cl && tc - t0 < 1.15 ? 0.9 : 1));
      const bw = 560, bh = 140;
      ctx.fillStyle = cl ? '#3a3a3a' : '#ff0033'; pill(ctx, -bw / 2, -bh / 2, bw, bh, 70); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.font = '72px "Lilita One"'; ctx.fillText(cl ? 'INSCRITO' : 'INSCREVA-SE', cl ? -30 : 0, 6);
      if (cl) { ctx.font = '70px "Lilita One"'; ctx.save(); ctx.translate(200, 2); ctx.rotate(Math.sin(tc * 20) * 0.3 * clamp01(1.8 - (tc - t0))); desenharSino(ctx); ctx.restore(); }
      // cursor de mão
      const mk = clamp01((tc - t0 - 0.3) / 0.6);
      ctx.save(); ctx.translate(lerp(300, 60, ease.out(mk)), lerp(220, 40, ease.out(mk)));
      ctx.fillStyle = '#fff'; ctx.strokeStyle = '#000'; ctx.lineWidth = 6;
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 80); ctx.lineTo(22, 62); ctx.lineTo(38, 96); ctx.lineTo(52, 89); ctx.lineTo(36, 56); ctx.lineTo(62, 56); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.restore();
      break;
    }
    case 'texto': { // texto livre com contorno
      ctx.translate(W * (h.x ?? 0.5), H * (h.y ?? 0.2)); ctx.scale(pop, pop); ctx.rotate((h.giro || 0) * DEG);
      ctx.font = `${h.tamanho || 100}px "Lilita One"`;
      const linhas = String(h.texto).split('\n');
      linhas.forEach((ln, i) => textoContorno(ctx, ln, 0, (i - (linhas.length - 1) / 2) * (h.tamanho || 100) * 1.1, { cor: h.cor || '#fff', larg: (h.tamanho || 100) * 0.16 }));
      break;
    }
    case 'barra': { // barra de progresso / medidor
      ctx.translate(W / 2, H * (h.y ?? 0.1)); ctx.scale(pop, pop);
      const bw = W * 0.8, bh = 64, v = lerp(h.de ?? 0, h.ate_valor ?? 1, ease.inOut(clamp01((tc - t0) / (h.dur || 2))));
      ctx.fillStyle = 'rgba(20,20,28,.85)'; pill(ctx, -bw / 2, -bh / 2, bw, bh, 32); ctx.fill();
      ctx.fillStyle = h.cor || '#2ecc71'; pill(ctx, -bw / 2 + 8, -bh / 2 + 8, Math.max(48, (bw - 16) * v), bh - 16, 24); ctx.fill();
      if (h.rotulo) { ctx.font = '56px "Lilita One"'; textoContorno(ctx, h.rotulo, 0, -bh - 10, { larg: 10 }); }
      break;
    }
    case 'vinheta': { const g = ctx.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, H * 0.75); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, h.cor || 'rgba(120,0,0,.55)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); break; }
    case 'flash': { const a = 1 - clamp01((tc - t0) / (t1 - t0)); ctx.fillStyle = `rgba(255,255,255,${a})`; ctx.fillRect(0, 0, W, H); break; }
    case 'escurecer': { ctx.fillStyle = `rgba(0,0,0,${(h.forca ?? 0.5) * k})`; ctx.fillRect(0, 0, W, H); break; }
  }
  ctx.restore();
}
function contadorTexto(h, tc) {
  if (h.contar) {
    const [de, ate] = h.contar, k = ease.out(clamp01((tc - (h.t ?? 0)) / (h.dur || 1.5)));
    const v = de + (ate - de) * k;
    const casas = h.casas ?? 0;
    return (h.prefixo || '') + v.toLocaleString('pt-BR', { minimumFractionDigits: casas, maximumFractionDigits: casas }) + (h.sufixo || '');
  }
  return h.texto;
}
function desenharSino(ctx) { ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.moveTo(-26, 22); ctx.quadraticCurveTo(-26, -30, 0, -32); ctx.quadraticCurveTo(26, -30, 26, 22); ctx.closePath(); ctx.fill(); ctx.beginPath(); ctx.arc(0, 30, 9, 0, 7); ctx.fill(); }

// ---------- legenda palavra por palavra ----------
function desenharLegenda(ctx, m, t) {
  const L = m.legendas; if (!L.length) return;
  let w = null;
  for (let i = 0; i < L.length; i++) { if (L[i].t0 <= t && t < (L[i + 1] ? Math.min(L[i + 1].t0, L[i].t1 + 0.6) : L[i].t1 + 0.4)) { w = L[i]; break; } }
  if (!w) return;
  const k = clamp01((t - w.t0) / 0.12);
  const s = 0.75 + 0.25 * ease.back(k);
  ctx.save();
  ctx.translate(m.W / 2, m.H * (m.ep.legendaY ?? 0.6)); ctx.scale(s, s);
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  let size = 128; ctx.font = `${size}px "Lilita One"`;
  while (ctx.measureText(w.palavra).width > m.W * 0.9 && size > 60) { size -= 6; ctx.font = `${size}px "Lilita One"`; }
  ctx.shadowColor = 'rgba(0,0,0,.45)'; ctx.shadowOffsetY = 8; ctx.shadowBlur = 0;
  textoContorno(ctx, w.palavra, 0, 0, { cor: w.destaque ? (w.cor || '#ff3b3b') : '#ffffff', contorno: '#000', larg: 22 });
  ctx.restore();
}
