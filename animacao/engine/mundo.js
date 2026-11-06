// Construções e objetos de cenário, todos feitos de blocos.
// Escala: personagem tem ~5,2 de altura; um andar tem 9.
import * as THREE from 'three';
import { add, box, rbox, mat, mesh, rng, canvasTex, shade } from './base.js';

const vidro = () => mat('#9fd8ff', { roughness: 0.15, metalness: 0.3, emissive: '#6fb8e8', emissiveIntensity: 0.15 });
const vidroNoite = () => mat('#ffe7a3', { roughness: 0.3, emissive: '#ffcf5a', emissiveIntensity: 0.9 });

export function janela(g, x, y, z, w = 2.6, h = 3, { cor = '#ffffff', rotY = 0, acesa = false } = {}) {
  const j = new THREE.Group(); j.position.set(x, y, z); j.rotation.y = rotY; g.add(j);
  add(j, [w + 0.4, h + 0.4, 0.3], cor, [0, 0, 0], { r: 0.05 });
  add(j, [w, h, 0.34], acesa ? vidroNoite() : vidro(), [0, 0, 0.02], { r: 0, cast: false });
  add(j, [0.18, h, 0.42], cor, [0, 0, 0.04], { r: 0 });
  add(j, [w, 0.18, 0.42], cor, [0, 0, 0.04], { r: 0 });
  add(j, [w + 0.7, 0.25, 0.6], shade(cor, -0.1), [0, -h / 2 - 0.25, 0.15], { r: 0.04 });
  return j;
}

export function porta(g, x, z, { cor = '#8a5a2b', rotY = 0, w = 3, h = 6.6, y = 0 } = {}) {
  const p = new THREE.Group(); p.position.set(x, y, z); p.rotation.y = rotY; g.add(p);
  add(p, [w + 0.5, h + 0.3, 0.3], '#f4f1ea', [0, h / 2, 0], { r: 0.04 });
  add(p, [w, h, 0.4], cor, [0, h / 2, 0.02], { r: 0.04 });
  add(p, [w * 0.7, h * 0.32, 0.45], shade(cor, -0.12), [0, h * 0.72, 0.03], { r: 0.03 });
  add(p, [w * 0.7, h * 0.32, 0.45], shade(cor, -0.12), [0, h * 0.3, 0.03], { r: 0.03 });
  add(p, [0.3, 0.3, 0.3], mat('#ffd23f', { metalness: 0.7, roughness: 0.3 }), [w * 0.36, h * 0.48, 0.3], { r: 0.1 });
  return p;
}

function telhado(g, w, d, h, cor, y) {
  // prisma triangular (duas águas) com beiral
  const shape = new THREE.Shape(); shape.moveTo(-w / 2 - 0.8, 0); shape.lineTo(w / 2 + 0.8, 0); shape.lineTo(0, h); shape.closePath();
  const geo = new THREE.ExtrudeGeometry(shape, { depth: d + 1.6, bevelEnabled: false });
  geo.translate(0, 0, -(d + 1.6) / 2);
  const m = mesh(geo, mat(cor)); m.position.y = y; g.add(m);
  // faixas de telha
  for (let i = 1; i < 4; i++) {
    const t = i / 4, ww = (w + 1.6) * (1 - t);
    add(g, [ww, 0.15, d + 1.7], shade(cor, -0.15), [0, y + h * t, 0], { r: 0 });
  }
  return m;
}

// ---------- Casa ----------
export function casa(p = {}) {
  const r = rng(p.seed || 7);
  const g = new THREE.Group();
  const w = p.largura || 16, d = p.profundidade || 12, andares = p.andares || 1, H = 9;
  const cor = p.cor || '#f6c26b', base = shade(cor, -0.25);
  add(g, [w + 0.4, 0.8, d + 0.4], base, [0, 0.4, 0], { r: 0.05 });
  add(g, [w, H * andares, d], cor, [0, H * andares / 2 + 0.4, 0], { r: 0.1 });
  // faixa entre andares e quinas
  for (let a = 1; a < andares; a++) add(g, [w + 0.3, 0.4, d + 0.3], '#ffffff', [0, H * a + 0.4, 0], { r: 0.05 });
  [-1, 1].forEach((sx) => [-1, 1].forEach((sz) => add(g, [0.6, H * andares, 0.6], '#ffffff', [sx * w / 2, H * andares / 2 + 0.4, sz * d / 2], { r: 0.05 })));
  const zf = d / 2 + 0.05;
  porta(g, p.portaX ?? -w * 0.22, zf, { cor: p.corPorta || '#8a5a2b', y: 0.8 });
  add(g, [4.2, 0.4, 2], '#d8d2c4', [p.portaX ?? -w * 0.22, 0.2, zf + 1], { r: 0.05 });
  janela(g, w * 0.22, 4.6, zf, 3.2, 3, { cor: p.corJanela || '#ffffff', acesa: p.noite });
  for (let a = 1; a < andares; a++) { janela(g, -w * 0.22, H * a + 4.6, zf, 3, 3, { cor: p.corJanela || '#ffffff', acesa: p.noite }); janela(g, w * 0.22, H * a + 4.6, zf, 3, 3, { cor: p.corJanela || '#ffffff', acesa: p.noite && r() > 0.4 }); }
  janela(g, w / 2 + 0.05, 4.6, 0, 3, 3, { rotY: Math.PI / 2, cor: p.corJanela || '#ffffff' });
  janela(g, -w / 2 - 0.05, 4.6, 0, 3, 3, { rotY: -Math.PI / 2, cor: p.corJanela || '#ffffff' });
  if (p.telhado === 'plano') add(g, [w + 1, 0.8, d + 1], shade(cor, -0.35), [0, H * andares + 0.8, 0], { r: 0.05 });
  else telhado(g, w, d, p.alturaTelhado || 5, p.corTelhado || '#c4473a', H * andares + 0.4);
  if (p.chamine !== false && p.telhado !== 'plano') add(g, [1.4, 4, 1.4], '#b5654a', [w * 0.25, H * andares + 3.5, -d * 0.15], { r: 0.05 });
  if (p.cerca) cerca(g, w + 6, zf + 5, p.corCerca || '#ffffff');
  if (p.jardim !== false) { arbusto(g, w * 0.36, zf + 1.2, 1.4); arbusto(g, -w * 0.45, zf + 1.2, 1.1); }
  return g;
}

export function cerca(g, w, z, cor = '#ffffff') {
  const f = new THREE.Group(); f.position.z = z; g.add(f);
  for (let x = -w / 2; x <= w / 2; x += 1.2) add(f, [0.5, 2.6, 0.25], cor, [x, 1.3, 0], { r: 0.05 });
  add(f, [w, 0.3, 0.2], cor, [0, 1.9, -0.12], { r: 0 }); add(f, [w, 0.3, 0.2], cor, [0, 0.8, -0.12], { r: 0 });
  return f;
}

// ---------- Prédio ----------
export function predio(p = {}) {
  const r = rng(p.seed || 3);
  const g = new THREE.Group();
  const andares = p.andares || 8, H = p.peDireito || 7, w = p.largura || 18, d = p.profundidade || 16;
  const cor = p.cor || '#c9d3e0', alt = andares * H + 3;
  add(g, [w, alt, d], cor, [0, alt / 2, 0], { r: 0.15 });
  add(g, [w + 0.8, 0.8, d + 0.8], shade(cor, -0.3), [0, alt + 0.4, 0], { r: 0.05 }); // platibanda
  // térreo
  add(g, [w + 0.2, 3.2, d + 0.2], p.corTerreo || shade(cor, -0.35), [0, 1.6, 0], { r: 0.05 });
  if (p.loja) {
    const toldo = new THREE.Group(); toldo.position.set(0, 6.5, d / 2 + 1.3); g.add(toldo);
    for (let i = 0; i < 8; i++) add(toldo, [w / 8, 0.3, 2.8], i % 2 ? '#ffffff' : (p.corToldo || '#e23b3b'), [-w / 2 + w / 16 + i * w / 8, 0, 0], { r: 0, rot: [0.3, 0, 0] });
    add(g, [w * 0.8, 3.5, 0.3], vidro(), [0, 3.2, d / 2 + 0.1], { r: 0 });
    if (p.placa) placaTexto(g, p.placa, [0, 8.3, d / 2 + 0.3], w * 0.6, 1.6, p.corPlaca || '#1d2b53');
  } else porta(g, 0, d / 2 + 0.1, { cor: '#4a5568', w: 4, h: 6 });
  // grade de janelas com InstancedMesh (rápido)
  const cols = Math.max(2, Math.floor(w / 4)), linhasIni = p.loja ? 1 : 1;
  const jw = 2.2, jh = 3.2;
  const faces = [[0, d / 2 + 0.06, 0, w], [Math.PI, -d / 2 - 0.06, 0, w], [Math.PI / 2, w / 2 + 0.06, 1, d], [-Math.PI / 2, -w / 2 - 0.06, 1, d]];
  const lit = p.noite ? vidroNoite() : vidro();
  faces.forEach(([rot, off, lado, len]) => {
    const n = Math.max(2, Math.floor(len / 4));
    const count = n * (andares - linhasIni + 1);
    const glass = new THREE.InstancedMesh(box(jw, jh, 0.2), lit, count);
    const frame = new THREE.InstancedMesh(box(jw + 0.5, jh + 0.5, 0.12), mat(p.corJanela || shade(cor, -0.45)), count);
    const m4 = new THREE.Matrix4(), q = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), rot), s = new THREE.Vector3(1, 1, 1);
    let i = 0;
    for (let a = linhasIni; a <= andares; a++) for (let c = 0; c < n; c++) {
      const u = -len / 2 + (len / n) * (c + 0.5), y = a * H - H / 2 + 3;
      const pos = lado ? new THREE.Vector3(off, y, -u) : new THREE.Vector3(u * (rot ? -1 : 1), y, off);
      m4.compose(pos, q, s); glass.setMatrixAt(i, m4); frame.setMatrixAt(i, m4); i++;
    }
    glass.castShadow = false; frame.castShadow = false; frame.receiveShadow = true;
    g.add(frame, glass);
  });
  // faixas horizontais
  for (let a = 2; a <= andares; a += 1) add(g, [w + 0.25, 0.3, d + 0.25], shade(cor, 0.25), [0, a * H - H + 3 - 0.2, 0], { r: 0, cast: false });
  // telhado: caixa d'água, antena, ar-condicionado
  if (p.caixaDagua !== false) { add(g, [4, 3, 4], '#e8e8e8', [w * 0.2, alt + 2.3, -d * 0.2], { r: 0.1 }); add(g, [3, 2.2, 3], '#3a7bd5', [w * 0.2, alt + 4.9, -d * 0.2], { r: 0.4 }); }
  if (r() > 0.4) add(g, [0.2, 6, 0.2], '#9aa4b2', [-w * 0.3, alt + 3.8, d * 0.2], { r: 0 });
  return g;
}

// ---------- Construção (obra) ----------
export function obra(p = {}) {
  const g = new THREE.Group();
  const andares = p.andares || 5, prontos = p.prontos ?? 3, H = 7, w = p.largura || 20, d = p.profundidade || 16;
  const concreto = mat('#b9b6ae'), concretoE = mat('#9d9a92');
  for (let a = 0; a <= andares; a++) {
    if (a <= prontos + 1) add(g, [w, 0.6, d], concreto, [0, a * H + 0.3, 0], { r: 0.03 }); // lajes
    if (a < andares && a <= prontos) {
      for (let x = -w / 2 + 1; x <= w / 2 - 1; x += (w - 2) / 3) for (let z of [-d / 2 + 1, d / 2 - 1]) add(g, [1, H - 0.6, 1], concretoE, [x, a * H + H / 2 + 0.3, z], { r: 0.03 });
      if (a < prontos) { // paredes de tijolo parciais
        add(g, [w - 2, H * 0.55, 0.6], '#c46a4a', [0, a * H + H * 0.3 + 0.6, -d / 2 + 1], { r: 0.02 });
        add(g, [0.6, H * 0.55, d - 2], '#c46a4a', [-w / 2 + 1, a * H + H * 0.3 + 0.6, 0], { r: 0.02 });
      }
    }
  }
  // vergalhões no topo
  const topo = (prontos + 1) * H + 0.6;
  for (let x = -w / 2 + 1; x <= w / 2 - 1; x += (w - 2) / 3) for (let z of [-d / 2 + 1, d / 2 - 1]) for (let k = 0; k < 4; k++) add(g, [0.1, 2.4, 0.1], '#6b4a3a', [x + (k % 2 - 0.5) * 0.4, topo + 1.2, z + (k > 1 ? 0.2 : -0.2)], { r: 0, cast: false });
  andaime(g, w + 2, (prontos + 1) * H, d / 2 + 1.6);
  return g;
}

export function andaime(g, w, h, z) {
  const a = new THREE.Group(); a.position.z = z; g.add(a);
  const tubo = mat('#5c6b7a', { metalness: 0.5, roughness: 0.4 }), tabua = mat('#c9a063');
  for (let x = -w / 2; x <= w / 2 + 0.01; x += w / 4) for (const dz of [0, 2]) add(a, [0.18, h, 0.18], tubo, [x, h / 2, dz], { r: 0 });
  for (let y = 3.5; y <= h; y += 3.5) {
    add(a, [w, 0.18, 0.18], tubo, [0, y, 0], { r: 0 }); add(a, [w, 0.18, 0.18], tubo, [0, y, 2], { r: 0 });
    add(a, [w, 0.15, 2], tabua, [0, y - 0.1, 1], { r: 0 });
  }
  for (let x = -w / 2; x < w / 2 - 0.01; x += w / 4) add(a, [Math.hypot(w / 4, 3.5), 0.14, 0.14], tubo, [x + w / 8, 1.75, 2.05], { r: 0, rot: [0, 0, Math.atan2(3.5, w / 4)] });
  return a;
}

export function guindaste(p = {}) {
  const g = new THREE.Group();
  const h = p.altura || 48, L = p.lanca || 36, am = mat(p.cor || '#ffc21a', { roughness: 0.5 });
  // torre treliçada
  const s = 2;
  for (const [x, z] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) add(g, [0.3, h, 0.3], am, [x * s / 2, h / 2, z * s / 2], { r: 0 });
  for (let y = 0; y < h; y += 2) {
    add(g, [s, 0.2, 0.2], am, [0, y, s / 2], { r: 0 }); add(g, [s, 0.2, 0.2], am, [0, y, -s / 2], { r: 0 });
    add(g, [0.2, 0.2, s], am, [s / 2, y, 0], { r: 0 }); add(g, [0.2, 0.2, s], am, [-s / 2, y, 0], { r: 0 });
    add(g, [Math.hypot(s, 2), 0.15, 0.15], am, [0, y + 1, s / 2], { r: 0, rot: [0, 0, (y / 2) % 2 ? 0.785 : -0.785] });
    add(g, [Math.hypot(s, 2), 0.15, 0.15], am, [0, y + 1, -s / 2], { r: 0, rot: [0, 0, (y / 2) % 2 ? -0.785 : 0.785] });
  }
  // cabine + lança + contralança
  const topo = new THREE.Group(); topo.position.y = h; topo.rotation.y = p.giro || 0; g.add(topo); g.userData.topo = topo;
  add(topo, [3, 2.5, 2.6], am, [0, 1.2, 1.8], { r: 0.1 }); add(topo, [2.4, 1.4, 0.2], vidro(), [0, 1.5, 3.12], { r: 0 });
  add(topo, [L, 1.2, 1.2], am, [L / 2 - 2, 3, 0], { r: 0 });
  for (let x = 0; x < L; x += 2) add(topo, [0.15, 1.6, 0.15], mat('#d9a400'), [x - 1, 3, 0.55], { r: 0, rot: [0, 0, 0.5] });
  add(topo, [12, 1, 1], am, [-8, 3, 0], { r: 0 });
  add(topo, [3, 2.5, 2.5], '#7a7a7a', [-12, 2.2, 0], { r: 0.05 }); // contrapeso
  add(topo, [0.4, 6, 0.4], am, [0, 6, 0], { r: 0 }); // torre de topo
  const cabo = p.cabo || 22, cx = p.carro || L * 0.6;
  add(topo, [0.08, cabo, 0.08], '#222', [cx, 3 - cabo / 2, 0], { r: 0, cast: false });
  add(topo, [0.8, 0.8, 0.5], '#e23b3b', [cx, 3 - cabo - 0.3, 0], { r: 0.1 });
  if (p.carga) { add(topo, [5, 0.6, 2], '#c9a063', [cx, 3 - cabo - 1.5, 0], { r: 0.05 }); for (let i = 0; i < 3; i++) add(topo, [1.4, 0.6, 1.6], '#c46a4a', [cx - 1.6 + i * 1.6, 3 - cabo - 0.9, 0], { r: 0.05 }); }
  return g;
}

export function cone(g, x, z) {
  const c = new THREE.Group(); c.position.set(x, 0, z); g.add(c);
  add(c, [1.3, 0.2, 1.3], '#ff6b1a', [0, 0.1, 0], { r: 0.03 });
  const geo = new THREE.ConeGeometry(0.5, 1.8, 4); const m = mesh(geo, mat('#ff6b1a')); m.position.y = 1.1; m.rotation.y = Math.PI / 4; c.add(m);
  add(c, [0.72, 0.3, 0.72], '#ffffff', [0, 1.0, 0], { r: 0.02 });
  return c;
}
export function betoneira(g, x, z) {
  const b = new THREE.Group(); b.position.set(x, 0, z); g.add(b);
  add(b, [2.6, 0.4, 1.6], '#e23b3b', [0, 1.2, 0], { r: 0.05 });
  const tambor = mesh(new THREE.CylinderGeometry(1.0, 1.3, 2.2, 8), mat('#ff8a1f')); tambor.position.set(0, 2.6, 0); tambor.rotation.z = 0.5; b.add(tambor);
  [[-1, 0.8], [1, 0.8]].forEach(([dx]) => add(b, [0.3, 1.0, 0.3], '#555', [dx, 0.5, 0], { r: 0 }));
  const roda = mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.3, 10), mat('#222')); roda.rotation.x = Math.PI / 2; roda.position.set(0, 0.5, 0.9); b.add(roda);
  return b;
}
export function tijolos(g, x, z, n = 3) {
  const t = new THREE.Group(); t.position.set(x, 0, z); g.add(t);
  add(t, [4, 0.4, 3], '#c9a063', [0, 0.2, 0], { r: 0.02 });
  for (let l = 0; l < n; l++) for (let i = 0; i < 3; i++) for (let k = 0; k < 2; k++) add(t, [1.2, 0.55, 1.3], '#c46a4a', [-1.3 + i * 1.3, 0.7 + l * 0.6, -0.7 + k * 1.4], { r: 0.04 });
  return t;
}
export function tapume(g, w, z, x = 0) {
  const t = new THREE.Group(); t.position.set(x, 0, z); g.add(t);
  const tex = canvasTex(512, 128, (ctx) => { ctx.fillStyle = '#e8e2d0'; ctx.fillRect(0, 0, 512, 128); ctx.fillStyle = '#1d2b53'; ctx.font = 'bold 54px Arial'; ctx.textAlign = 'center'; ctx.fillText('OBRA', 256, 84); for (let i = -2; i < 12; i++) { ctx.fillStyle = '#ffcc00'; ctx.beginPath(); ctx.moveTo(i * 48, 128); ctx.lineTo(i * 48 + 24, 128); ctx.lineTo(i * 48 + 48, 104); ctx.lineTo(i * 48 + 24, 104); ctx.fill(); } });
  for (let x2 = -w / 2; x2 < w / 2; x2 += 6) {
    const m = mesh(box(5.9, 4, 0.2), [mat('#d6d0bd'), mat('#d6d0bd'), mat('#d6d0bd'), mat('#d6d0bd'), new THREE.MeshStandardMaterial({ map: tex }), mat('#d6d0bd')]);
    m.position.set(x2 + 3, 2, 0); t.add(m);
  }
  return t;
}

// ---------- Rua, natureza e mobiliário ----------
export function rua(g, { comprimento = 200, largura = 14, z = 0, x = 0, rotY = 0, calcada = 6 } = {}) {
  const r = new THREE.Group(); r.position.set(x, 0, z); r.rotation.y = rotY; g.add(r);
  add(r, [comprimento, 0.1, largura], mat('#3b3f47', { roughness: 0.95 }), [0, 0.05, 0], { r: 0, cast: false });
  for (let i = -comprimento / 2; i < comprimento / 2; i += 8) add(r, [4, 0.12, 0.4], '#f2f2f2', [i + 2, 0.07, 0], { r: 0, cast: false });
  [-1, 1].forEach((s) => {
    add(r, [comprimento, 0.5, calcada], mat('#cfcac0'), [0, 0.25, s * (largura / 2 + calcada / 2)], { r: 0, cast: false });
    add(r, [comprimento, 0.55, 0.4], '#9a958c', [0, 0.27, s * (largura / 2 + 0.2)], { r: 0, cast: false });
    for (let i = -comprimento / 2; i < comprimento / 2; i += 3) add(r, [0.08, 0.52, calcada], '#bdb8ae', [i, 0.26, s * (largura / 2 + calcada / 2)], { r: 0, cast: false });
  });
  return r;
}
export function faixaPedestre(g, x, z, largura = 14, rotY = 0) {
  const f = new THREE.Group(); f.position.set(x, 0, z); f.rotation.y = rotY; g.add(f);
  for (let i = 0; i < 6; i++) add(f, [1, 0.13, largura - 1], '#f2f2f2', [-3 + i * 1.3, 0.07, 0], { r: 0, cast: false });
}
export function arvore(g, x, z, s = 1, cor = '#4caf50') {
  const a = new THREE.Group(); a.position.set(x, 0, z); a.scale.setScalar(s); g.add(a);
  add(a, [1.1, 5, 1.1], '#8a5a2b', [0, 2.5, 0], { r: 0.1 });
  add(a, [5.4, 3.4, 5.4], cor, [0, 6.2, 0], { r: 0.5 });
  add(a, [4, 2.6, 4], shade(cor, 0.12), [0.3, 8.6, -0.2], { r: 0.5 });
  add(a, [2.4, 1.8, 2.4], shade(cor, 0.22), [-0.2, 10.2, 0.2], { r: 0.5 });
  return a;
}
export function pinheiro(g, x, z, s = 1) {
  const a = new THREE.Group(); a.position.set(x, 0, z); a.scale.setScalar(s); g.add(a);
  add(a, [0.9, 3, 0.9], '#7a4d2a', [0, 1.5, 0], { r: 0.1 });
  [[5, 2.5], [3.8, 4.6], [2.5, 6.5], [1.3, 8.1]].forEach(([w, y], i) => add(a, [w, 2, w], shade('#2e7d32', i * 0.08), [0, y, 0], { r: 0.2 }));
  return a;
}
export function arbusto(g, x, z, s = 1, cor = '#43a047') { add(g, [2.2 * s, 1.6 * s, 2.2 * s], cor, [x, 0.8 * s, z], { r: 0.6 * s }); }
export function poste(g, x, z, rotY = 0, aceso = false) {
  const p = new THREE.Group(); p.position.set(x, 0, z); p.rotation.y = rotY; g.add(p);
  const m = mat('#4a5568', { metalness: 0.4, roughness: 0.5 });
  add(p, [0.45, 12, 0.45], m, [0, 6, 0], { r: 0.08 });
  add(p, [0.3, 0.3, 3], m, [0, 11.8, 1.4], { r: 0.05 });
  add(p, [1.2, 0.5, 1.4], aceso ? mat('#fff6d0', { emissive: '#ffe08a', emissiveIntensity: 1.2 }) : mat('#f1f1e6'), [0, 11.5, 2.8], { r: 0.1 });
  return p;
}
export function banco(g, x, z, rotY = 0) {
  const b = new THREE.Group(); b.position.set(x, 0, z); b.rotation.y = rotY; g.add(b);
  const mad = mat('#b07a45'), fer = mat('#333');
  for (let i = 0; i < 3; i++) add(b, [5, 0.25, 0.5], mad, [0, 1.7, -0.6 + i * 0.6], { r: 0.05 });
  for (let i = 0; i < 2; i++) add(b, [5, 0.5, 0.2], mad, [0, 2.4 + i * 0.7, -1.0], { r: 0.05 });
  [-2.1, 2.1].forEach((dx) => { add(b, [0.25, 1.7, 1.6], fer, [dx, 0.85, -0.1], { r: 0.03 }); add(b, [0.25, 1.6, 0.25], fer, [dx, 2.6, -1.1], { r: 0.03 }); });
  return b;
}
export function carro(g, x, z, rotY = 0, cor = '#e23b3b') {
  const c = new THREE.Group(); c.position.set(x, 0, z); c.rotation.y = rotY; g.add(c);
  add(c, [9, 2.2, 4.4], cor, [0, 1.9, 0], { r: 0.4 });
  add(c, [5, 2, 4], cor, [-0.4, 3.9, 0], { r: 0.4 });
  add(c, [4.4, 1.5, 4.08], vidro(), [-0.4, 4.0, 0], { r: 0.3, cast: false });
  add(c, [0.3, 0.6, 1], '#fff6c0', [4.52, 2.2, 1.4], { r: 0.1 }); add(c, [0.3, 0.6, 1], '#fff6c0', [4.52, 2.2, -1.4], { r: 0.1 });
  add(c, [0.3, 0.5, 0.9], '#ff3030', [-4.52, 2.2, 1.4], { r: 0.1 }); add(c, [0.3, 0.5, 0.9], '#ff3030', [-4.52, 2.2, -1.4], { r: 0.1 });
  const roda = new THREE.CylinderGeometry(1.0, 1.0, 0.8, 12);
  [[-2.8, 2.1], [2.8, 2.1], [-2.8, -2.1], [2.8, -2.1]].forEach(([dx, dz]) => { const w = mesh(roda, mat('#1d1d1d')); w.rotation.x = Math.PI / 2; w.position.set(dx, 1.0, dz); c.add(w); const cal = mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.85, 8), mat('#c0c0c0', { metalness: 0.7 })); cal.rotation.x = Math.PI / 2; cal.position.set(dx, 1.0, dz); c.add(cal); });
  return c;
}
export function hidrante(g, x, z) { const h = new THREE.Group(); h.position.set(x, 0.5, z); g.add(h); add(h, [0.9, 1.6, 0.9], '#e23b3b', [0, 0.8, 0], { r: 0.2 }); add(h, [1.5, 0.35, 0.35], '#e23b3b', [0, 1.0, 0], { r: 0.1 }); add(h, [1.1, 0.3, 1.1], '#b52a2a', [0, 1.7, 0], { r: 0.1 }); }
export function lixeira(g, x, z, cor = '#2e7d32') { const l = new THREE.Group(); l.position.set(x, 0.5, z); g.add(l); add(l, [1.4, 2.2, 1.4], cor, [0, 1.1, 0], { r: 0.15 }); add(l, [1.6, 0.25, 1.6], shade(cor, -0.2), [0, 2.3, 0], { r: 0.08 }); }
export function placaTexto(g, texto, [x, y, z], w = 6, h = 1.6, fundo = '#1d6b3a', rotY = 0) {
  const tex = canvasTex(512, Math.round(512 * h / w), (ctx, W, H) => { ctx.fillStyle = fundo; ctx.fillRect(0, 0, W, H); ctx.strokeStyle = '#fff'; ctx.lineWidth = 10; ctx.strokeRect(8, 8, W - 16, H - 16); ctx.fillStyle = '#fff'; ctx.font = `bold ${Math.round(H * 0.5)}px Arial`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(texto, W / 2, H / 2 + 4); });
  const m = mesh(box(w, h, 0.2), [mat(fundo), mat(fundo), mat(fundo), mat(fundo), new THREE.MeshStandardMaterial({ map: tex }), mat(fundo)]);
  m.position.set(x, y, z); m.rotation.y = rotY; g.add(m); return m;
}
export function nuvem(g, x, y, z, s = 1) {
  const n = new THREE.Group(); n.position.set(x, y, z); n.scale.setScalar(s); g.add(n);
  const b = mat('#ffffff', { roughness: 1, emissive: '#ffffff', emissiveIntensity: 0.25 });
  add(n, [10, 3, 5], b, [0, 0, 0], { r: 1.2, cast: false }); add(n, [6, 3, 4.5], b, [-1.5, 2, 0], { r: 1.2, cast: false }); add(n, [5, 2.5, 4], b, [3, 1.5, 0.3], { r: 1.1, cast: false });
  return n;
}
export function quadro(g, [x, y, z], w, h, desenhar, rotY = 0, moldura = '#8a5a2b') {
  const tex = canvasTex(1024, Math.round(1024 * h / w), desenhar);
  const q = new THREE.Group(); q.position.set(x, y, z); q.rotation.y = rotY; g.add(q);
  add(q, [w + 0.6, h + 0.6, 0.3], moldura, [0, 0, 0], { r: 0.05 });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.9 })); m.position.z = 0.17; q.add(m);
  q.userData.tex = tex; return q;
}
export function mesa(g, x, z, { w = 5, d = 3, h = 2.6, cor = '#b07a45', rotY = 0 } = {}) {
  const m = new THREE.Group(); m.position.set(x, 0, z); m.rotation.y = rotY; g.add(m);
  add(m, [w, 0.3, d], cor, [0, h, 0], { r: 0.05 });
  [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(([sx, sz]) => add(m, [0.3, h, 0.3], shade(cor, -0.2), [sx * (w / 2 - 0.3), h / 2, sz * (d / 2 - 0.3)], { r: 0.03 }));
  return m;
}
export function cadeira(g, x, z, rotY = 0, cor = '#3d7bff') {
  const c = new THREE.Group(); c.position.set(x, 0, z); c.rotation.y = rotY; g.add(c);
  add(c, [2, 0.3, 2], cor, [0, 1.7, 0], { r: 0.08 }); add(c, [2, 2, 0.3], cor, [0, 2.85, -0.85], { r: 0.08 });
  [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(([sx, sz]) => add(c, [0.2, 1.7, 0.2], '#555', [sx * 0.8, 0.85, sz * 0.8], { r: 0 }));
  return c;
}
export function sala(g, { w = 40, d = 30, h = 14, parede = '#f3e9d2', piso = '#c9a37a', rodape = '#8a5a2b', fundoApenas = false } = {}) {
  add(g, [w, 0.4, d], mat(piso, { roughness: 0.7 }), [0, -0.2, 0], { r: 0, cast: false });
  for (let i = -w / 2; i < w / 2; i += 4) add(g, [0.06, 0.41, d], shade(piso, -0.1), [i, -0.19, 0], { r: 0, cast: false });
  add(g, [w, h, 0.5], parede, [0, h / 2, -d / 2], { r: 0 });
  add(g, [w, 0.8, 0.6], rodape, [0, 0.4, -d / 2 + 0.3], { r: 0 });
  if (!fundoApenas) {
    add(g, [0.5, h, d], shade(parede, -0.05), [-w / 2, h / 2, 0], { r: 0 }); add(g, [0.5, h, d], shade(parede, -0.05), [w / 2, h / 2, 0], { r: 0 });
    add(g, [0.6, 0.8, d], rodape, [-w / 2 + 0.3, 0.4, 0], { r: 0 }); add(g, [0.6, 0.8, d], rodape, [w / 2 - 0.3, 0.4, 0], { r: 0 });
  }
}
export function frasco(g, x, y, z, cor = '#3ddc84', s = 1) {
  const f = new THREE.Group(); f.position.set(x, y, z); f.scale.setScalar(s); g.add(f);
  add(f, [0.8, 1.1, 0.8], mat('#e6f6ff', { transparent: true, opacity: 0.45, roughness: 0.1 }), [0, 0.55, 0], { r: 0.25, cast: false });
  add(f, [0.66, 0.7, 0.66], mat(cor, { emissive: cor, emissiveIntensity: 0.5 }), [0, 0.38, 0], { r: 0.2, cast: false });
  add(f, [0.35, 0.5, 0.35], mat('#e6f6ff', { transparent: true, opacity: 0.45 }), [0, 1.3, 0], { r: 0.08, cast: false });
  return f;
}
