// Veículos de blocos. Todos apontam para +x (frente) e ficam com as rodas no chão (y=0).
// veiculo(tipo, {cor}) → THREE.Group ; group.userData.rodas = rodas (para girar) ; userData.comprimento
import * as THREE from 'three';
import { add, mat, mesh, shade, canvasTex, box } from './base.js';

const vidro = () => mat('#8fcdf2', { roughness: 0.1, metalness: 0.4, emissive: '#5aa7d6', emissiveIntensity: 0.1 });
const farol = () => mat('#fff6c0', { emissive: '#fff1a8', emissiveIntensity: 0.6 });
const lanterna = () => mat('#ff3030', { emissive: '#ff2020', emissiveIntensity: 0.5 });
const pneu = new THREE.CylinderGeometry(1, 1, 0.8, 14);
const calota = new THREE.CylinderGeometry(0.45, 0.45, 0.84, 8);

function rodas(g, pts, r = 1) {
  const lista = [];
  for (const [x, z] of pts) {
    const w = new THREE.Group(); w.position.set(x, r, z); g.add(w);
    const p = mesh(pneu, mat('#1c1c1c', { roughness: 0.9 })); p.rotation.x = Math.PI / 2; p.scale.set(r, 1, r); w.add(p);
    const c = mesh(calota, mat('#c8c8c8', { metalness: 0.7, roughness: 0.3 })); c.rotation.x = Math.PI / 2; c.scale.set(r, 1, r); w.add(c);
    lista.push(w);
  }
  g.userData.rodas = lista; g.userData.raio = r;
  return lista;
}
function luzes(g, L, y, z, l = 0.5) {
  add(g, [0.3, 0.6, 1], farol(), [L / 2 + 0.02, y, z], { r: 0.1 }); add(g, [0.3, 0.6, 1], farol(), [L / 2 + 0.02, y, -z], { r: 0.1 });
  add(g, [0.3, l, 0.9], lanterna(), [-L / 2 - 0.02, y, z], { r: 0.1 }); add(g, [0.3, l, 0.9], lanterna(), [-L / 2 - 0.02, y, -z], { r: 0.1 });
}
function textoLateral(g, texto, [x, y, z], w, h, cor = '#fff', fundo = null, rotY = 0) {
  const tex = canvasTex(512, Math.round(512 * h / w), (ctx, W, H) => { if (fundo) { ctx.fillStyle = fundo; ctx.fillRect(0, 0, W, H); } else ctx.clearRect(0, 0, W, H); ctx.fillStyle = cor; ctx.font = `bold ${Math.round(H * 0.62)}px Arial`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(texto, W / 2, H / 2 + 3); });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: tex, transparent: !fundo }));
  m.position.set(x, y, z); m.rotation.y = rotY; g.add(m); return m;
}

const MODELOS = {
  sedan(g, cor) {
    add(g, [9.4, 2.0, 4.4], cor, [0, 1.9, 0], { r: 0.45 });
    add(g, [4.8, 1.8, 4.0], cor, [-0.6, 3.7, 0], { r: 0.45 });
    add(g, [4.3, 1.4, 4.08], vidro(), [-0.6, 3.75, 0], { r: 0.3, cast: false });
    add(g, [9.6, 0.4, 4.5], shade(cor, -0.3), [0, 1.0, 0], { r: 0.15 });
    luzes(g, 9.4, 2.2, 1.45); rodas(g, [[-3, 2.15], [3, 2.15], [-3, -2.15], [3, -2.15]]);
    return 9.6;
  },
  hatch(g, cor) {
    add(g, [7.4, 2.1, 4.2], cor, [0, 1.95, 0], { r: 0.5 });
    add(g, [4.4, 1.9, 3.9], cor, [-0.9, 3.8, 0], { r: 0.5 });
    add(g, [4.0, 1.5, 3.98], vidro(), [-0.8, 3.85, 0], { r: 0.35, cast: false });
    luzes(g, 7.4, 2.3, 1.4); rodas(g, [[-2.4, 2.05], [2.4, 2.05], [-2.4, -2.05], [2.4, -2.05]]);
    return 7.4;
  },
  suv(g, cor) {
    add(g, [9.6, 2.6, 4.8], cor, [0, 2.4, 0], { r: 0.4 });
    add(g, [6.6, 2.2, 4.5], cor, [-1.0, 4.6, 0], { r: 0.4 });
    add(g, [6.2, 1.7, 4.58], vidro(), [-0.9, 4.7, 0], { r: 0.3, cast: false });
    add(g, [6, 0.25, 0.25], '#333', [-1, 5.85, 1.8]); add(g, [6, 0.25, 0.25], '#333', [-1, 5.85, -1.8]); // rack
    luzes(g, 9.6, 2.8, 1.6); rodas(g, [[-3.1, 2.3], [3.1, 2.3], [-3.1, -2.3], [3.1, -2.3]], 1.2);
    return 9.6;
  },
  picape(g, cor) {
    add(g, [11, 2.4, 4.8], cor, [0, 2.3, 0], { r: 0.35 });
    add(g, [4.2, 2.2, 4.5], cor, [1.6, 4.5, 0], { r: 0.4 });
    add(g, [3.8, 1.7, 4.58], vidro(), [1.7, 4.6, 0], { r: 0.3, cast: false });
    add(g, [5.2, 1.0, 4.4], shade(cor, -0.35), [-2.6, 3.6, 0], { r: 0.05 }); // caçamba
    add(g, [5.2, 0.2, 3.6], '#2a2a2a', [-2.6, 3.55, 0], { r: 0 });
    luzes(g, 11, 2.6, 1.6); rodas(g, [[-3.6, 2.3], [3.4, 2.3], [-3.6, -2.3], [3.4, -2.3]], 1.2);
    return 11;
  },
  taxi(g) {
    const L = MODELOS.sedan(g, '#ffcc00');
    add(g, [1.8, 0.7, 1.2], '#ffffff', [-0.6, 4.95, 0], { r: 0.15 });
    textoLateral(g, 'TÁXI', [-0.6, 4.95, 0.62], 1.6, 0.6, '#222');
    for (let i = 0; i < 9; i++) add(g, [0.5, 0.35, 0.05], i % 2 ? '#222' : '#ffcc00', [-2 + i * 0.5, 2.3, 2.23], { r: 0, cast: false });
    return L;
  },
  policia(g) {
    const L = MODELOS.sedan(g, '#f4f4f4');
    add(g, [4.6, 1.5, 4.46], '#1d2b53', [1.6, 1.9, 0], { r: 0.3 });
    textoLateral(g, 'POLÍCIA', [-1.8, 2.1, 2.24], 3.6, 0.8, '#1d2b53');
    add(g, [0.9, 0.5, 2.4], mat('#ff2a2a', { emissive: '#ff0000', emissiveIntensity: 1 }), [-0.6, 4.85, 0.6], { r: 0.1 });
    add(g, [0.9, 0.5, 2.4], mat('#2a6bff', { emissive: '#0044ff', emissiveIntensity: 1 }), [-0.6, 4.85, -0.6], { r: 0.1 });
    return L;
  },
  ambulancia(g) {
    add(g, [12, 5.6, 5], '#ffffff', [-0.8, 3.9, 0], { r: 0.3 });
    add(g, [3.2, 3.4, 4.8], '#ffffff', [5.8, 2.8, 0], { r: 0.4 });
    add(g, [0.2, 1.6, 4.0], vidro(), [7.4, 3.6, 0], { r: 0, cast: false });
    add(g, [12.1, 0.6, 5.05], '#e53935', [-0.8, 2.8, 0], { r: 0 });
    [-1, 1].forEach((s) => { const c = new THREE.Group(); c.position.set(-1.5, 4.8, s * 2.53); g.add(c); add(c, [2, 0.6, 0.05], '#e53935', [0, 0, 0], { r: 0 }); add(c, [0.6, 2, 0.05], '#e53935', [0, 0, 0], { r: 0 }); });
    add(g, [1.2, 0.5, 3], mat('#ff2a2a', { emissive: '#ff0000', emissiveIntensity: 1 }), [4.8, 6.95, 0], { r: 0.1 });
    luzes(g, 15.2, 2.2, 1.7); g.children.slice(-4).forEach((m) => { m.position.x = m.position.x > 0 ? 7.42 : -6.82; });
    rodas(g, [[-4.6, 2.4], [4.6, 2.4], [-4.6, -2.4], [4.6, -2.4]], 1.2);
    return 15;
  },
  van(g, cor) {
    add(g, [11, 4.8, 4.8], cor, [-0.5, 3.4, 0], { r: 0.45 });
    add(g, [2.2, 2.8, 4.6], cor, [5.6, 2.4, 0], { r: 0.5 });
    add(g, [0.2, 1.6, 4.1], vidro(), [6.75, 3.3, 0], { r: 0, cast: false });
    [-3.5, -0.5, 2.5].forEach((x) => { add(g, [2.2, 1.3, 0.1], vidro(), [x, 4.3, 2.42], { r: 0, cast: false }); add(g, [2.2, 1.3, 0.1], vidro(), [x, 4.3, -2.42], { r: 0, cast: false }); });
    luzes(g, 13.4, 2.2, 1.6); g.children.slice(-4).forEach((m) => { if (m.position.x > 0) m.position.x = 6.72; else m.position.x = -6.02; });
    rodas(g, [[-3.8, 2.3], [4.6, 2.3], [-3.8, -2.3], [4.6, -2.3]], 1.15);
    return 13.4;
  },
  onibus(g, cor = '#1e88e5') {
    const L = 24;
    add(g, [L, 6.2, 5.4], cor, [0, 4.4, 0], { r: 0.4 });
    add(g, [L + 0.1, 1.2, 5.45], '#ffffff', [0, 2.2, 0], { r: 0 });
    for (let x = -L / 2 + 2.4; x < L / 2 - 3; x += 2.9) { add(g, [2.5, 2.0, 0.1], vidro(), [x, 5.2, 2.72], { r: 0, cast: false }); add(g, [2.5, 2.0, 0.1], vidro(), [x, 5.2, -2.72], { r: 0, cast: false }); }
    add(g, [0.15, 3.2, 4.8], vidro(), [L / 2 + 0.05, 4.9, 0], { r: 0, cast: false });
    add(g, [2.2, 4.4, 0.12], '#333', [L / 2 - 2.6, 3.4, 2.72], { r: 0 }); // porta
    textoLateral(g, 'CENTRO', [L / 2 - 0.02, 7.0, 0], 3.6, 0.8, '#ffb300', '#111', Math.PI / 2);
    luzes(g, L, 2.4, 1.9);
    rodas(g, [[-L / 2 + 4, 2.6], [L / 2 - 4.5, 2.6], [-L / 2 + 4, -2.6], [L / 2 - 4.5, -2.6]], 1.3);
    return L;
  },
  caminhao(g, cor = '#e53935') {
    add(g, [5, 5.4, 5], cor, [7.2, 3.9, 0], { r: 0.4 });
    add(g, [0.15, 2, 4.4], vidro(), [9.75, 5.0, 0], { r: 0, cast: false });
    add(g, [16, 7.2, 5.4], '#eceff1', [-3.6, 5.2, 0], { r: 0.15 }); // baú
    textoLateral(g, 'ENTREGAS', [-3.6, 5.6, 2.72], 10, 1.8, '#1d2b53');
    textoLateral(g, 'ENTREGAS', [-3.6, 5.6, -2.72], 10, 1.8, '#1d2b53', null, Math.PI);
    add(g, [21, 0.7, 4], '#333', [-1.2, 1.5, 0], { r: 0 });
    luzes(g, 19.6, 2.0, 1.8); g.children.slice(-4).forEach((m) => { if (m.position.x > 0) m.position.x = 9.8; else m.position.x = -11.62; });
    rodas(g, [[7.0, 2.4], [-6, 2.4], [-9.2, 2.4], [7.0, -2.4], [-6, -2.4], [-9.2, -2.4]], 1.3);
    return 21;
  },
  caminhao_betoneira(g) {
    add(g, [4.6, 5, 5], '#ff8a1f', [6.8, 3.7, 0], { r: 0.4 });
    add(g, [0.15, 1.8, 4.3], vidro(), [9.15, 4.7, 0], { r: 0, cast: false });
    add(g, [17, 0.8, 4], '#333', [-0.8, 1.6, 0], { r: 0 });
    const t = new THREE.Group(); t.position.set(-1.6, 5.0, 0); t.rotation.z = 0.18; g.add(t); g.userData.tambor = t;
    const tam = mesh(new THREE.CylinderGeometry(2.6, 3.0, 11, 10), mat('#eceff1')); tam.rotation.z = Math.PI / 2; t.add(tam);
    for (let i = 0; i < 4; i++) { const f = mesh(box(11.2, 0.4, 0.5), mat('#e53935')); f.rotation.x = i * Math.PI / 4; t.add(f); }
    luzes(g, 18, 2.0, 1.8); g.children.slice(-4).forEach((m) => { if (m.position.x > 0) m.position.x = 9.15; else m.position.x = -9.3; });
    rodas(g, [[6.6, 2.4], [-4.6, 2.4], [-7.6, 2.4], [6.6, -2.4], [-4.6, -2.4], [-7.6, -2.4]], 1.3);
    return 18;
  },
  moto(g, cor) {
    add(g, [3.6, 0.9, 0.8], cor, [0, 2.3, 0], { r: 0.3 });
    add(g, [1.6, 0.6, 0.9], '#1b1b1b', [-0.6, 2.95, 0], { r: 0.2 });
    add(g, [1.0, 1.1, 0.9], cor, [1.1, 3.0, 0], { r: 0.3 });
    add(g, [0.15, 1.6, 0.15], '#888', [1.8, 2.6, 0], { r: 0, rot: [0, 0, 0.4] });
    add(g, [0.15, 0.15, 2.0], '#333', [1.6, 3.5, 0], { r: 0 });
    add(g, [0.2, 0.45, 0.5], farol(), [2.0, 3.0, 0], { r: 0.1 });
    rodas(g, [[-1.7, 0], [1.9, 0]], 1.0).forEach((w) => w.scale.set(1, 1, 0.45));
    return 5;
  },
  bicicleta(g, cor) {
    const q = mat(cor);
    add(g, [2.6, 0.18, 0.18], q, [0, 1.9, 0], { r: 0, rot: [0, 0, -0.25] });
    add(g, [0.18, 1.6, 0.18], q, [-0.5, 1.8, 0], { r: 0, rot: [0, 0, 0.3] });
    add(g, [0.18, 1.6, 0.18], q, [1.1, 1.9, 0], { r: 0, rot: [0, 0, -0.3] });
    add(g, [0.9, 0.25, 0.5], '#1b1b1b', [-0.75, 2.75, 0], { r: 0.1 });
    add(g, [0.15, 0.15, 1.4], '#333', [1.4, 2.75, 0], { r: 0 });
    rodas(g, [[-1.4, 0], [1.5, 0]], 0.9).forEach((w) => { w.scale.set(1, 1, 0.18); });
    return 4;
  },
  sorvete(g) { // carrinho de sorvete
    add(g, [4, 3, 2.6], '#ffffff', [0, 2.6, 0], { r: 0.3 }); add(g, [4.4, 0.4, 3], '#ff6fae', [0, 5.4, 0], { r: 0.1 });
    add(g, [0.15, 1.6, 0.15], '#888', [1.8, 4.6, 0]); add(g, [0.15, 1.6, 0.15], '#888', [-1.8, 4.6, 0]);
    textoLateral(g, 'SORVETE', [0, 2.9, 1.32], 3.4, 0.9, '#ff3b8a');
    rodas(g, [[-1.2, 1.3], [1.2, 1.3], [-1.2, -1.3], [1.2, -1.3]], 0.6);
    return 4.4;
  },
};
export const TIPOS_VEICULO = Object.keys(MODELOS);
export const CORES_CARRO = ['#e53935', '#1e88e5', '#fdd835', '#f4f4f4', '#2e7d32', '#212121', '#8e24aa', '#fb8c00', '#90a4ae', '#00897b'];

export function veiculo(tipo = 'sedan', { cor } = {}) {
  const g = new THREE.Group();
  const corso = cor || CORES_CARRO[Math.abs(hashStr(tipo + (cor || ''))) % CORES_CARRO.length];
  g.userData.comprimento = (MODELOS[tipo] || MODELOS.sedan)(g, corso);
  g.userData.tipo = tipo;
  g.userData.semColisao = true; // a câmera não desvia de carros
  g.traverse((o) => { if (o.isMesh && o.castShadow === undefined) o.castShadow = true; });
  return g;
}
function hashStr(s) { let h = 0; for (const c of s) h = (h * 31 + c.charCodeAt(0)) | 0; return h; }

// gira as rodas conforme a distância percorrida
export function girarRodas(v, dist) { const r = v.userData.raio || 1; (v.userData.rodas || []).forEach((w) => { w.rotation.z = -dist / r; }); if (v.userData.tambor) v.userData.tambor.rotation.x = dist * 0.15; }

// ---------- Semáforo ----------
export function semaforo(g, x, z, rotY = 0) {
  const s = new THREE.Group(); s.position.set(x, 0, z); s.rotation.y = rotY; g.add(s);
  const m = mat('#37474f', { metalness: 0.4, roughness: 0.5 });
  add(s, [0.4, 9, 0.4], m, [0, 4.5, 0], { r: 0.08 });
  add(s, [0.3, 0.3, 4.5], m, [0, 8.8, 2.1], { r: 0.05 });
  add(s, [1.3, 3.6, 1.2], '#263238', [0, 7.6, 4.2], { r: 0.15 });
  const luzesS = ['#ff2a2a', '#ffc400', '#21e06b'].map((c, i) => { const l = mesh(new THREE.SphereGeometry(0.42, 12, 8), new THREE.MeshStandardMaterial({ color: '#222', emissive: c, emissiveIntensity: 0 })); l.position.set(0, 8.75 - i * 1.15, 4.85); s.add(l); return l; });
  // semáforo de pedestre no poste
  add(s, [0.8, 1.6, 0.8], '#263238', [0, 3.8, 0.55], { r: 0.1 });
  const ped = [mesh(box(0.55, 0.55, 0.1), new THREE.MeshStandardMaterial({ color: '#222', emissive: '#ff2a2a', emissiveIntensity: 0 })), mesh(box(0.55, 0.55, 0.1), new THREE.MeshStandardMaterial({ color: '#222', emissive: '#ffffff', emissiveIntensity: 0 }))];
  ped[0].position.set(0, 4.15, 0.97); ped[1].position.set(0, 3.45, 0.97); ped.forEach((p) => s.add(p));
  s.userData.ciclo = (t, fase = 0) => { // 0 verde, 1 amarelo, 2 vermelho
    const c = ((t + fase) % 12 + 12) % 12, est = c < 5 ? 2 : c < 6.2 ? 1 : c < 12 ? 0 : 0;
    const e = c < 5.5 ? 2 : c < 6.7 ? 1 : 0;
    luzesS.forEach((l, i) => { l.material.emissiveIntensity = i === e ? 2.2 : 0; });
    ped[0].material.emissiveIntensity = e === 2 ? 0 : 1.6; ped[1].material.emissiveIntensity = e === 2 ? 1.6 : 0;
    return est;
  };
  s.userData.ciclo(0);
  return s;
}

// ponto de ônibus
export function pontoOnibus(g, x, z, rotY = 0) {
  const p = new THREE.Group(); p.position.set(x, 0.5, z); p.rotation.y = rotY; g.add(p);
  const m = mat('#455a64', { metalness: 0.4 });
  [-3.6, 3.6].forEach((dx) => add(p, [0.3, 6.5, 0.3], m, [dx, 3.25, -1.2]));
  add(p, [8.2, 0.3, 3.4], m, [0, 6.6, 0], { r: 0.05 });
  add(p, [7.6, 4.6, 0.12], mat('#bfe6ff', { transparent: true, opacity: 0.45, roughness: 0.1 }), [0, 3.6, -1.3], { r: 0, cast: false });
  add(p, [6, 0.3, 1.2], '#8d6e63', [0, 1.8, -0.7], { r: 0.05 });
  add(p, [0.3, 1.8, 0.3], m, [-2.4, 0.9, -0.7]); add(p, [0.3, 1.8, 0.3], m, [2.4, 0.9, -0.7]);
  add(p, [1.6, 1.0, 0.15], '#1e88e5', [3.0, 7.3, 1.6], { r: 0.05 });
  return p;
}
