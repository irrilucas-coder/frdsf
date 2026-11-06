// Cidade modular: peças separadas (trecho de rua, cruzamento, faixa, avenida, posto, ponto de ônibus…)
// e um mapa grande ("cidade") com bairros, trânsito andando e semáforos funcionando.
import * as THREE from 'three';
import { add, mat, rng, shade, canvasTex, box, mesh } from './base.js';
import * as M from './mundo.js';
import { veiculo, girarRodas, semaforo, pontoOnibus, TIPOS_VEICULO, CORES_CARRO } from './veiculos.js';

const ASFALTO = () => mat('#3a3e46', { roughness: 0.95 });
const CALCADA = () => mat('#cfcac0', { roughness: 0.9 });
const CORES_CASA = ['#f6c26b', '#8fd3c7', '#f49ac1', '#a7c7ff', '#ffe08a', '#c5e1a5', '#ffab91', '#e1bee7'];
const CORES_PREDIO = ['#c9d3e0', '#e8d9c4', '#b8c7b0', '#d7c3e8', '#f0c8a8', '#a9c4d9', '#e5e5e5', '#d9b8a0'];

// ---------- peças básicas ----------
export function arranhaCeu(p = {}) {
  const g = new THREE.Group();
  const w = p.largura || 20, d = p.profundidade || 20, h = p.altura || 90, cor = p.cor || '#5c8fb8';
  const vid = mat(cor, { roughness: 0.15, metalness: 0.65, emissive: p.noite ? '#ffd27a' : shade(cor, -0.4), emissiveIntensity: p.noite ? 0.25 : 0.05 });
  add(g, [w, h, d], vid, [0, h / 2, 0], { r: 0.1 });
  for (let y = 4; y < h; y += 4) add(g, [w + 0.3, 0.35, d + 0.3], mat('#d7dde3', { metalness: 0.5, roughness: 0.4 }), [0, y, 0], { r: 0, cast: false });
  for (let x = -w / 2; x <= w / 2; x += w / 5) { add(g, [0.35, h, 0.35], '#d7dde3', [x, h / 2, d / 2 + 0.1], { r: 0, cast: false }); add(g, [0.35, h, 0.35], '#d7dde3', [x, h / 2, -d / 2 - 0.1], { r: 0, cast: false }); }
  if (p.topo !== false) { add(g, [w * 0.6, 6, d * 0.6], '#cfd8dc', [0, h + 3, 0], { r: 0.1 }); add(g, [0.4, 14, 0.4], '#90a4ae', [0, h + 13, 0]); add(g, [0.8, 0.8, 0.8], mat('#ff2a2a', { emissive: '#ff0000', emissiveIntensity: 1.5 }), [0, h + 20.4, 0], { r: 0.3 }); }
  add(g, [w + 1, 5, d + 1], '#37474f', [0, 2.5, 0], { r: 0.05 });
  add(g, [w * 0.5, 4, 0.2], mat('#bfe6ff', { roughness: 0.1, metalness: 0.4 }), [0, 2.2, d / 2 + 0.6], { r: 0 });
  return g;
}

export function posto(p = {}) {
  const g = new THREE.Group();
  add(g, [40, 0.3, 30], '#9e9e9e', [0, 0.15, 0], { r: 0, cast: false });
  [-8, 8].forEach((x) => [-6, 6].forEach((z) => add(g, [0.9, 8, 0.9], '#eceff1', [x, 4.3, z])));
  add(g, [24, 1.6, 18], '#e53935', [0, 9, 0], { r: 0.2 }); add(g, [24.2, 0.5, 18.2], '#ffffff', [0, 8.1, 0], { r: 0 });
  [-4, 4].forEach((x) => { const b = new THREE.Group(); b.position.set(x, 0.3, 0); g.add(b); add(b, [2.2, 4.4, 1.4], '#ffffff', [0, 2.2, 0], { r: 0.2 }); add(b, [1.6, 1, 0.1], mat('#21e06b', { emissive: '#21e06b', emissiveIntensity: 0.4 }), [0, 3.4, 0.72], { r: 0 }); add(b, [0.3, 1.4, 0.3], '#222', [0.9, 1.8, 0.8]); });
  add(g, [16, 7, 10], '#eceff1', [-10, 3.8, -12], { r: 0.1 }); add(g, [10, 3.5, 0.2], mat('#bfe6ff', { roughness: 0.1 }), [-10, 3, -6.9], { r: 0 });
  M.placaTexto(g, 'CONVENIÊNCIA', [-10, 8.2, -6.85], 14, 1.6, '#e53935');
  const totem = new THREE.Group(); totem.position.set(17, 0, 13); g.add(totem);
  add(totem, [1, 14, 1], '#9e9e9e', [0, 7, 0]); add(totem, [5, 7, 1], '#e53935', [0, 12, 0], { r: 0.2 });
  const tex = canvasTex(256, 360, (ctx, W, H) => { ctx.fillStyle = '#e53935'; ctx.fillRect(0, 0, W, H); ctx.fillStyle = '#fff'; ctx.font = 'bold 70px Arial'; ctx.textAlign = 'center'; ctx.fillText('POSTO', W / 2, 90); ctx.font = 'bold 54px Arial'; ctx.fillText('G 5,99', W / 2, 200); ctx.fillText('E 3,89', W / 2, 290); });
  const pl = new THREE.Mesh(new THREE.PlaneGeometry(4.6, 6.6), new THREE.MeshStandardMaterial({ map: tex, emissive: '#ffffff', emissiveMap: tex, emissiveIntensity: 0.3 })); pl.position.set(0, 12, 0.52); totem.add(pl);
  return g;
}

export function loja(p = {}) { // loja de esquina / comércio térreo
  const g = new THREE.Group(), w = p.largura || 18, d = p.profundidade || 14, cor = p.cor || '#ffe08a';
  add(g, [w, 9, d], cor, [0, 4.5, 0], { r: 0.1 }); add(g, [w + 0.6, 0.8, d + 0.6], shade(cor, -0.3), [0, 9.2, 0], { r: 0.05 });
  add(g, [w * 0.8, 4.6, 0.2], mat('#bfe6ff', { roughness: 0.1, metalness: 0.3, emissive: p.noite ? '#ffe08a' : '#000', emissiveIntensity: p.noite ? 0.5 : 0 }), [0, 3, d / 2 + 0.1], { r: 0 });
  const toldo = new THREE.Group(); toldo.position.set(0, 6.4, d / 2 + 1.3); g.add(toldo);
  for (let i = 0; i < 6; i++) add(toldo, [w / 6, 0.3, 2.8], i % 2 ? '#ffffff' : (p.corToldo || '#2e7d32'), [-w / 2 + w / 12 + i * w / 6, 0, 0], { r: 0, rot: [0.3, 0, 0] });
  M.placaTexto(g, p.nome || 'LOJA', [0, 8.2, d / 2 + 0.25], w * 0.7, 1.5, p.corPlaca || '#1d2b53');
  return g;
}

// ---------- ruas ----------
function marcasRuaX(g, x0, x1, z, largura, duplo = false) {
  for (let x = x0; x < x1; x += 8) add(g, [4, 0.12, 0.35], duplo ? '#ffc400' : '#f2f2f2', [x + 2, 0.06, z], { r: 0, cast: false });
}
function faixa(g, x, z, largura, rotY = 0) {
  const f = new THREE.Group(); f.position.set(x, 0, z); f.rotation.y = rotY; g.add(f);
  for (let i = 0; i < Math.floor(largura / 1.6); i++) add(f, [1.0, 0.13, 5], '#f2f2f2', [-largura / 2 + 0.8 + i * 1.6, 0.07, 0], { r: 0, cast: false });
  return f;
}
function calcadaRet(g, cx, cz, w, d, h = 0.5) {
  add(g, [w, h, d], CALCADA(), [cx, h / 2, cz], { r: 0, cast: false });
  add(g, [w + 0.4, h + 0.05, 0.4], '#9a958c', [cx, h / 2, cz + d / 2], { r: 0, cast: false }); add(g, [w + 0.4, h + 0.05, 0.4], '#9a958c', [cx, h / 2, cz - d / 2], { r: 0, cast: false });
  add(g, [0.4, h + 0.05, d], '#9a958c', [cx + w / 2, h / 2, cz], { r: 0, cast: false }); add(g, [0.4, h + 0.05, d], '#9a958c', [cx - w / 2, h / 2, cz], { r: 0, cast: false });
}

// trânsito: lista de carros andando em faixas retas; anima(t) reposiciona
function transito(g, faixas, r) {
  const carros = [];
  for (const f of faixas) {
    const n = f.n ?? 3;
    for (let i = 0; i < n; i++) {
      const tipo = f.tipos ? f.tipos[Math.floor(r() * f.tipos.length)] : pesoTipo(r());
      const v = veiculo(tipo, { cor: CORES_CARRO[Math.floor(r() * CORES_CARRO.length)] });
      g.add(v);
      carros.push({ v, f, off: (i / n) * f.comp + r() * 6, vel: f.vel ?? (9 + r() * 5) });
    }
  }
  return (t) => {
    for (const c of carros) {
      const { f } = c; let s = (c.off + c.vel * t) % f.comp; if (s < 0) s += f.comp;
      const u = s - f.comp / 2;
      if (f.eixo === 'x') { c.v.position.set(f.dir > 0 ? u : -u, 0, f.z); c.v.rotation.y = f.dir > 0 ? 0 : Math.PI; }
      else { c.v.position.set(f.x, 0, f.dir > 0 ? u : -u); c.v.rotation.y = f.dir > 0 ? -Math.PI / 2 : Math.PI / 2; }
      girarRodas(c.v, c.vel * t);
    }
  };
}
function pesoTipo(x) { // mais carros comuns, menos caminhões
  const t = [['sedan', 0.22], ['hatch', 0.2], ['suv', 0.14], ['taxi', 0.08], ['picape', 0.08], ['moto', 0.08], ['van', 0.05], ['onibus', 0.05], ['caminhao', 0.04], ['policia', 0.02], ['ambulancia', 0.02], ['caminhao_betoneira', 0.02]];
  let a = 0; for (const [k, p] of t) { a += p; if (x < a) return k; } return 'sedan';
}

function fundoCidade(g, r, raio = 170, noite = false) { // silhueta de prédios ao longe
  for (let i = 0; i < 46; i++) {
    const a = (i / 46) * Math.PI * 2, d = raio + r() * 40, h = 30 + r() * 80;
    add(g, [16 + r() * 12, h, 16 + r() * 12], mat(shade(CORES_PREDIO[i % 8], -0.15), { emissive: noite ? '#ffd27a' : '#000', emissiveIntensity: noite ? 0.12 : 0 }), [Math.cos(a) * d, h / 2, Math.sin(a) * d], { r: 0, cast: false });
  }
}

// ---------- CENÁRIOS MODULARES ----------
export const CENARIOS_CIDADE = {
  // um trechinho de rua sozinho
  rua_trecho({ seed = 5, noite = false, carros = true, lado = 'casas' } = {}) {
    const g = new THREE.Group(), r = rng(seed);
    add(g, [500, 0.2, 500], mat('#7cc35a', { roughness: 1 }), [0, -0.1, 0], { r: 0, cast: false });
    add(g, [70, 0.1, 14], ASFALTO(), [0, 0.05, 0], { r: 0, cast: false }); marcasRuaX(g, -35, 35, 0, 14);
    calcadaRet(g, 0, -10, 70, 6); calcadaRet(g, 0, 10, 70, 6);
    if (lado === 'casas') { [-22, 0, 22].forEach((x, i) => { const c = M.casa({ seed: seed + i, cor: CORES_CASA[(seed + i) % 8], andares: i === 1 ? 2 : 1, cerca: true, noite }); c.position.set(x, 0, -24); g.add(c); }); }
    else { [-24, 0, 24].forEach((x, i) => { const p = M.predio({ seed: seed + i, andares: 4 + i * 3, cor: CORES_PREDIO[i], loja: i !== 1, placa: ['PADARIA', '', 'MERCADO'][i], noite }); p.position.set(x, 0, -26); g.add(p); }); }
    M.poste(g, -12, -8.5, 0, noite); M.poste(g, 14, -8.5, 0, noite); M.arvore(g, 2, -9, 0.75); M.hidrante(g, 8, -9); M.lixeira(g, -4, -9.5);
    fundoCidade(g, r, 160, noite);
    let animar = null;
    if (carros) animar = transito(g, [{ eixo: 'x', z: 3.5, dir: 1, comp: 140, n: 2 }, { eixo: 'x', z: -3.5, dir: -1, comp: 140, n: 2 }], r);
    else { const c = veiculo('sedan', { cor: '#1e88e5' }); c.position.set(-10, 0, 4); g.add(c); }
    if (animar) g.userData.animar = animar;
    return { grupo: g, noite, pontos: { centro: [0, 0.5, -10], calcada: [0, 0.5, -10], calcada_frente: [0, 0.5, 10], rua: [0, 0, 0], casa: [0, 0, -24] } };
  },

  // cruzamento com 4 faixas de pedestre e semáforos funcionando
  cruzamento({ seed = 9, noite = false } = {}) {
    const g = new THREE.Group(), r = rng(seed), W = 16;
    add(g, [500, 0.2, 500], mat('#9a958c'), [0, -0.1, 0], { r: 0, cast: false });
    add(g, [200, 0.1, W], ASFALTO(), [0, 0.05, 0], { r: 0, cast: false }); add(g, [W, 0.1, 200], ASFALTO(), [0, 0.05, 0], { r: 0, cast: false });
    marcasRuaX(g, -100, -W, 0, W); marcasRuaX(g, W, 100, 0, W);
    for (let z = -100; z < -W; z += 8) add(g, [0.35, 0.12, 4], '#f2f2f2', [0, 0.06, z + 2], { r: 0, cast: false });
    for (let z = W; z < 100; z += 8) add(g, [0.35, 0.12, 4], '#f2f2f2', [0, 0.06, z + 2], { r: 0, cast: false });
    faixa(g, 0, -W / 2 - 3.5, W); faixa(g, 0, W / 2 + 3.5, W); faixa(g, -W / 2 - 3.5, 0, W, Math.PI / 2); faixa(g, W / 2 + 3.5, 0, W, Math.PI / 2);
    // quarteirões das quinas
    const Q = 60;
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sz], i) => {
      calcadaRet(g, sx * (W / 2 + Q / 2), sz * (W / 2 + Q / 2), Q, Q);
      const tipo = i % 2 ? M.predio({ seed: seed + i, andares: 6 + i * 2, cor: CORES_PREDIO[i], loja: true, placa: ['FARMÁCIA', 'CAFÉ', 'BANCO', 'PIZZA'][i], noite }) : loja({ nome: ['MERCADO', 'LIVROS', 'SORVETES', 'PADARIA'][i], cor: CORES_CASA[i + 2], noite });
      tipo.position.set(sx * (W / 2 + 20), 0.5, sz * (W / 2 + 20)); tipo.rotation.y = sz < 0 ? 0 : Math.PI; g.add(tipo);
    });
    const sems = [[-1, -1, 0], [1, 1, Math.PI], [1, -1, Math.PI / 2], [-1, 1, -Math.PI / 2]].map(([sx, sz, ry]) => semaforo(g, sx * (W / 2 + 1.5), sz * (W / 2 + 1.5), ry));
    [[-12, -12], [12, 12]].forEach(([x, z]) => M.poste(g, x, z, 0, noite));
    fundoCidade(g, r, 170, noite);
    const anim = transito(g, [{ eixo: 'x', z: 4, dir: 1, comp: 220, n: 3 }, { eixo: 'x', z: -4, dir: -1, comp: 220, n: 3 }, { eixo: 'z', x: -4, dir: 1, comp: 220, n: 2 }, { eixo: 'z', x: 4, dir: -1, comp: 220, n: 2 }], r);
    g.userData.animar = (t) => { anim(t); sems.forEach((s, i) => s.userData.ciclo(t, i % 2 ? 6 : 0)); };
    return { grupo: g, noite, pontos: { centro: [W / 2 + 5, 0.5, W / 2 + 5], esquina: [W / 2 + 5, 0.5, W / 2 + 5], faixa: [0, 0, W / 2 + 3.5], cruzamento: [0, 0, 0] } };
  },

  // só uma faixa de pedestre com semáforo (para cenas de atravessar)
  faixa_pedestre({ seed = 13, noite = false, carros = false } = {}) {
    const s = CENARIOS_CIDADE.rua_trecho({ seed, noite, carros, lado: 'predios' });
    faixa(s.grupo, 0, 0, 14, Math.PI / 2);
    const a = semaforo(s.grupo, -5, -8.6, 0), b = semaforo(s.grupo, 5, 8.6, Math.PI);
    const old = s.grupo.userData.animar;
    s.grupo.userData.animar = (t) => { if (old) old(t); a.userData.ciclo(t); b.userData.ciclo(t); };
    s.pontos.faixa = [0, 0.5, -9]; s.pontos.outro_lado = [0, 0.5, 9];
    return s;
  },

  // avenida larga com canteiro central e arranha-céus
  avenida({ seed = 17, noite = false } = {}) {
    const g = new THREE.Group(), r = rng(seed);
    add(g, [500, 0.2, 500], mat('#9a958c'), [0, -0.1, 0], { r: 0, cast: false });
    add(g, [260, 0.1, 34], ASFALTO(), [0, 0.05, 0], { r: 0, cast: false });
    add(g, [260, 0.7, 4], '#7cc35a', [0, 0.35, 0], { r: 0, cast: false });
    for (let x = -120; x < 120; x += 16) { M.arvore(g, x, 0, 0.6); }
    [-8.5, 8.5].forEach((z) => marcasRuaX(g, -130, 130, z, 34));
    calcadaRet(g, 0, -21, 260, 8); calcadaRet(g, 0, 21, 260, 8);
    for (let i = -5; i <= 5; i++) {
      const tall = r() > 0.4;
      const b1 = tall ? arranhaCeu({ altura: 60 + r() * 70, cor: ['#5c8fb8', '#4e6e8e', '#7aa6c2', '#3f5f7a'][i & 3], noite }) : M.predio({ seed: seed + i, andares: 6 + Math.floor(r() * 8), cor: CORES_PREDIO[(i + 8) % 8], loja: true, placa: 'LOJA', noite });
      b1.position.set(i * 24, 0.5, -38); g.add(b1);
      const b2 = r() > 0.5 ? arranhaCeu({ altura: 50 + r() * 80, cor: ['#7aa6c2', '#5c8fb8'][i & 1], noite }) : M.predio({ seed: seed + i + 3, andares: 5 + Math.floor(r() * 9), cor: CORES_PREDIO[(i + 11) % 8], noite });
      b2.position.set(i * 24 + 12, 0.5, 38); b2.rotation.y = Math.PI; g.add(b2);
      M.poste(g, i * 24, -17.5, 0, noite);
    }
    pontoOnibus(g, 10, -21, 0);
    fundoCidade(g, r, 190, noite);
    g.userData.animar = transito(g, [{ eixo: 'x', z: 5, dir: 1, comp: 280, n: 4 }, { eixo: 'x', z: 12, dir: 1, comp: 280, n: 3 }, { eixo: 'x', z: -5, dir: -1, comp: 280, n: 4 }, { eixo: 'x', z: -12, dir: -1, comp: 280, n: 3 }], r);
    return { grupo: g, noite, pontos: { centro: [0, 0.5, -20], calcada: [0, 0.5, -20], ponto_onibus: [10, 0.5, -20], canteiro: [0, 0.7, 0] } };
  },

  posto_gasolina({ seed = 23, noite = false } = {}) {
    const g = new THREE.Group(), r = rng(seed);
    add(g, [500, 0.2, 500], mat('#7cc35a', { roughness: 1 }), [0, -0.1, 0], { r: 0, cast: false });
    add(g, [200, 0.1, 16], ASFALTO(), [0, 0.05, 26], { r: 0, cast: false }); marcasRuaX(g, -100, 100, 26, 16);
    const p = posto({ noite }); g.add(p);
    const c1 = veiculo('suv', { cor: '#212121' }); c1.position.set(-4, 0.3, 3); g.add(c1);
    const c2 = veiculo('hatch', { cor: '#e53935' }); c2.position.set(4, 0.3, -3); c2.rotation.y = Math.PI; g.add(c2);
    fundoCidade(g, r, 170, noite);
    g.userData.animar = transito(g, [{ eixo: 'x', z: 29.5, dir: 1, comp: 220, n: 2 }, { eixo: 'x', z: 22.5, dir: -1, comp: 220, n: 2 }], r);
    return { grupo: g, noite, pontos: { centro: [0, 0.3, 8], bomba: [-4, 0.3, 1.5], loja: [-10, 0.3, -5] } };
  },

  ponto_onibus({ seed = 29, noite = false } = {}) {
    const s = CENARIOS_CIDADE.rua_trecho({ seed, noite, carros: false, lado: 'predios' });
    pontoOnibus(s.grupo, 0, -10.2, 0);
    const o = veiculo('onibus'); o.position.set(-30, 0, 4); s.grupo.add(o);
    s.grupo.userData.animar = (t) => { const x = Math.min(2, -30 + t * 12); o.position.x = x; girarRodas(o, x + 30); };
    s.pontos.ponto = [0, 0.5, -9.5];
    return s;
  },

  garagem_veiculos({ noite = false } = {}) { // vitrine com todos os veículos
    const g = new THREE.Group();
    add(g, [300, 0.2, 200], mat('#5f6670'), [0, -0.1, 0], { r: 0, cast: false });
    TIPOS_VEICULO.forEach((t, i) => {
      const v = veiculo(t); const col = i % 4, lin = Math.floor(i / 4);
      v.position.set(-39 + col * 26, 0, -22 + lin * 20); v.rotation.y = -0.5; g.add(v);
      for (let k = -1; k <= 1; k += 2) add(g, [0.4, 0.12, 14], '#f2f2f2', [-39 + col * 26 + k * 12, 0.05, -22 + lin * 20], { r: 0, cast: false });
    });
    return { grupo: g, noite, pontos: { centro: [0, 0, 0] } };
  },

  // ---------- MAPA GRANDE ----------
  cidade({ seed = 101, noite = false, transito: comTransito = true } = {}) {
    const g = new THREE.Group(), r = rng(seed);
    const N = 5, B = 56, R = 18, P = B + R, L = N * P;
    add(g, [L + 400, 0.2, L + 400], mat('#7cc35a', { roughness: 1 }), [0, -0.12, 0], { r: 0, cast: false });
    add(g, [L + R, 0.1, L + R], ASFALTO(), [0, 0.04, 0], { r: 0, cast: false });
    const c = (i) => (i - (N - 1) / 2) * P;
    // marcações das ruas e faixas de pedestre
    for (let k = 0; k <= N; k++) {
      const pos = -L / 2 + k * P;
      for (let i = 0; i < N; i++) {
        const a = c(i) - B / 2, b = c(i) + B / 2;
        marcasRuaX(g, a, b, pos, R);
        const z = new THREE.Group(); z.position.set(pos, 0, 0); z.rotation.y = Math.PI / 2; g.add(z); marcasRuaX(z, -b, -a, 0, R);
      }
    }
    for (let ix = 1; ix < N; ix++) for (let iz = 1; iz < N; iz++) {
      const x = -L / 2 + ix * P, z = -L / 2 + iz * P;
      faixa(g, x, z - R / 2 - 3, R); faixa(g, x, z + R / 2 + 3, R); faixa(g, x - R / 2 - 3, z, R, Math.PI / 2); faixa(g, x + R / 2 + 3, z, R, Math.PI / 2);
    }
    // bairros
    const BAIRRO = [
      ['casas', 'casas', 'casas', 'casas', 'parque'],
      ['casas', 'comercio', 'predios', 'comercio', 'casas'],
      ['obra', 'predios', 'praca', 'arranha', 'posto'],
      ['casas', 'comercio', 'arranha', 'arranha', 'casas'],
      ['escola', 'casas', 'predios', 'casas', 'casas'],
    ];
    const pontos = {};
    for (let ix = 0; ix < N; ix++) for (let iz = 0; iz < N; iz++) {
      const cx = c(ix), cz = c(iz), tipo = BAIRRO[iz][ix];
      calcadaRet(g, cx, cz, B, B);
      const q = new THREE.Group(); q.position.set(cx, 0.5, cz); g.add(q);
      pontos[`${tipo}_${ix}${iz}`] = [cx, 0.5, cz + B / 2 - 3];
      if (!pontos[tipo]) pontos[tipo] = [cx, 0.5, cz + B / 2 - 3];
      switch (tipo) {
        case 'casas':
          [[-13, -13], [13, -13], [-13, 13], [13, 13]].forEach(([x, z], k) => { const h = M.casa({ seed: seed + ix * 7 + iz * 3 + k, cor: CORES_CASA[(ix + iz + k) % 8], largura: 13, profundidade: 11, andares: r() > 0.6 ? 2 : 1, cerca: false, jardim: false, noite }); h.position.set(x, 0, z); h.rotation.y = z < 0 ? Math.PI : 0; q.add(h); });
          M.arvore(q, 0, 0, 0.8); break;
        case 'predios':
          [[-13, -13], [13, -13], [-13, 13], [13, 13]].forEach(([x, z], k) => { const p = M.predio({ seed: seed + k + ix, largura: 18, profundidade: 18, andares: 5 + Math.floor(r() * 8), cor: CORES_PREDIO[(ix + iz * 2 + k) % 8], noite }); p.position.set(x, 0, z); p.rotation.y = z < 0 ? Math.PI : 0; q.add(p); }); break;
        case 'comercio':
          [[-13, 14, 'MERCADO'], [13, 14, 'FARMÁCIA'], [-13, -14, 'PADARIA'], [13, -14, 'PIZZARIA']].forEach(([x, z, nome], k) => { const l = loja({ nome, cor: CORES_CASA[(k + ix) % 8], noite, corToldo: ['#2e7d32', '#e53935', '#1e88e5', '#fb8c00'][k] }); l.position.set(x, 0, z); l.rotation.y = z < 0 ? Math.PI : 0; q.add(l); }); break;
        case 'arranha':
          [[-12, -12], [12, 12], [12, -12], [-12, 12]].forEach(([x, z], k) => { if (k > 1 && r() > 0.5) return; const a = arranhaCeu({ altura: 70 + r() * 90, largura: 18, profundidade: 18, cor: ['#5c8fb8', '#4e6e8e', '#7aa6c2', '#3f5f7a'][k], noite }); a.position.set(x, 0, z); q.add(a); }); break;
        case 'praca': {
          add(q, [B - 4, 0.15, B - 4], '#7cc35a', [0, 0.08, 0], { r: 0, cast: false });
          add(q, [6, 0.2, B - 4], '#e2c79a', [0, 0.1, 0], { r: 0, cast: false }); add(q, [B - 4, 0.2, 6], '#e2c79a', [0, 0.1, 0], { r: 0, cast: false });
          add(q, [10, 1.2, 10], '#b0bec5', [0, 0.6, 0], { r: 4 }); add(q, [8, 0.4, 8], mat('#4fc3f7', { roughness: 0.1, metalness: 0.2 }), [0, 1.2, 0], { r: 3.5, cast: false }); add(q, [1.2, 4, 1.2], '#b0bec5', [0, 2.5, 0], { r: 0.4 });
          [[-16, -16], [16, -16], [-16, 16], [16, 16]].forEach(([x, z]) => M.arvore(q, x, z, 0.9));
          M.banco(q, -8, 10, 0); M.banco(q, 8, -10, Math.PI); M.poste(q, 6, 6, 0, noite); M.poste(q, -6, -6, Math.PI, noite);
          const sv = veiculo('sorvete'); sv.position.set(10, 0, 8); q.add(sv);
          break;
        }
        case 'parque':
          add(q, [B - 4, 0.15, B - 4], '#74c955', [0, 0.08, 0], { r: 0, cast: false });
          add(q, [20, 0.25, 14], mat('#4fc3f7', { roughness: 0.1, metalness: 0.2 }), [-6, 0.1, -6], { r: 3, cast: false });
          for (let k = 0; k < 9; k++) (r() > 0.4 ? M.arvore : M.pinheiro)(q, (r() - 0.5) * 44, (r() - 0.5) * 44, 0.7 + r() * 0.4);
          M.banco(q, 10, 14, 0); break;
        case 'obra': {
          const o = M.obra({ andares: 6, prontos: 3, largura: 18, profundidade: 14 }); o.position.set(-6, 0, -6); q.add(o);
          const gu = M.guindaste({ altura: 50, lanca: 32, giro: 0.6, carga: true }); gu.position.set(14, 0, -14); q.add(gu);
          M.tapume(q, 50, B / 2 - 2); M.betoneira(q, 12, 10); M.tijolos(q, -14, 14); M.cone(q, -4, 20); M.cone(q, 4, 20);
          break;
        }
        case 'posto': { const p = posto({ noite }); p.scale.setScalar(0.85); q.add(p); break; }
        case 'escola': {
          const e = M.predio({ andares: 3, largura: 40, profundidade: 22, cor: '#ffcc80', noite }); e.position.set(0, 0, -6); q.add(e);
          M.placaTexto(q, 'ESCOLA', [0, 27.5, 5.3], 14, 2.4, '#1565c0');
          M.cerca(q, B - 6, 22, '#1565c0'); add(q, [30, 0.15, 12], '#e57373', [0, 0.1, 15], { r: 0, cast: false });
          break;
        }
      }
      if (tipo !== 'praca' && tipo !== 'parque') { M.poste(q, B / 2 - 2.5, B / 2 - 2.5, Math.PI / 4, noite); M.arvore(q, -B / 2 + 3, B / 2 - 3, 0.55); }
    }
    // semáforos nos cruzamentos centrais
    const sems = [];
    for (let ix = 2; ix <= 3; ix++) for (let iz = 2; iz <= 3; iz++) {
      const x = -L / 2 + ix * P, z = -L / 2 + iz * P;
      sems.push(semaforo(g, x - R / 2 - 1.5, z - R / 2 - 1.5, 0), semaforo(g, x + R / 2 + 1.5, z + R / 2 + 1.5, Math.PI));
    }
    pontoOnibus(g, c(2) + 10, c(2) + B / 2 + 0.5, Math.PI);
    fundoCidade(g, r, L / 2 + 120, noite);
    // trânsito nas ruas (duas mãos)
    const faixasT = [];
    if (comTransito) for (let k = 1; k < N; k++) {
      const pos = -L / 2 + k * P;
      faixasT.push({ eixo: 'x', z: pos + 4.5, dir: 1, comp: L + 40, n: 3 }, { eixo: 'x', z: pos - 4.5, dir: -1, comp: L + 40, n: 3 });
      faixasT.push({ eixo: 'z', x: pos - 4.5, dir: 1, comp: L + 40, n: 2 }, { eixo: 'z', x: pos + 4.5, dir: -1, comp: L + 40, n: 2 });
    }
    const anim = transito(g, faixasT, r);
    g.userData.animar = (t) => { anim(t); sems.forEach((s, i) => s.userData.ciclo(t, i % 2 ? 6 : 0)); };
    pontos.centro = [c(2) + 6, 0.5, c(2) + B / 2 - 3];
    pontos.cruzamento = [-L / 2 + 2 * P, 0, -L / 2 + 2 * P];
    pontos.alto = [0, 0, 0];
    return { grupo: g, noite, pontos, tamanho: L };
  },
};
