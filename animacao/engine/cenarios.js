// Cenários prontos. Cada um devolve { grupo, ceu, chao, pontos } — "pontos" são marcas com nome
// para posicionar personagens e câmera sem decorar coordenadas (ex.: "porta", "calcada", "lousa").
import * as THREE from 'three';
import { add, mat, rng, shade } from './base.js';
import * as M from './mundo.js';
import { CENARIOS_CIDADE } from './cidade.js';

const CORES_CASA = ['#f6c26b', '#8fd3c7', '#f49ac1', '#a7c7ff', '#ffe08a', '#c5e1a5', '#ffab91', '#e1bee7'];
const CORES_TELHADO = ['#c4473a', '#4a5568', '#8a5a2b', '#2f6f4f', '#b5654a'];
const CORES_PREDIO = ['#c9d3e0', '#e8d9c4', '#b8c7b0', '#d7c3e8', '#f0c8a8', '#a9c4d9', '#e5e5e5'];

function grama(g, w = 400, d = 400, cor = '#6cbf4b') { add(g, [w, 0.2, d], mat(cor, { roughness: 1 }), [0, -0.1, 0], { r: 0, cast: false }); }

export const CENARIOS = {
  rua_bairro({ seed = 11, noite = false } = {}) {
    const g = new THREE.Group(), r = rng(seed);
    grama(g);
    M.rua(g, { comprimento: 260, largura: 14 });
    for (let i = -4; i <= 4; i++) {
      const x = i * 26;
      const c1 = M.casa({ seed: seed + i, cor: CORES_CASA[(i + 8 + seed) % 8], corTelhado: CORES_TELHADO[(i + 5) % 5], andares: r() > 0.6 ? 2 : 1, cerca: r() > 0.4, noite });
      c1.position.set(x, 0, -27); g.add(c1);
      const c2 = M.casa({ seed: seed + i + 50, cor: CORES_CASA[(i + 11) % 8], corTelhado: CORES_TELHADO[(i + 7) % 5], andares: r() > 0.5 ? 2 : 1, cerca: r() > 0.5, noite });
      c2.position.set(x + 8, 0, 27); c2.rotation.y = Math.PI; g.add(c2);
      M.arvore(g, x + 12, -12.5, 0.8 + r() * 0.3); M.poste(g, x - 2, -10.5, 0, noite);
      if (r() > 0.55) M.carro(g, x + 4, 4, 0, ['#e23b3b', '#3d7bff', '#ffd23f', '#ffffff', '#2e7d32'][Math.floor(r() * 5)]);
    }
    M.hidrante(g, 6, -11); M.lixeira(g, -6, -11.5);
    return { grupo: g, ceu: noite ? ['#0b1a3a', '#28406e'] : ['#5fb6ff', '#cdeaff'], noite,
      pontos: { centro: [0, 0.5, -11], calcada: [0, 0.5, -11], calcada_frente: [0, 0.5, 11], rua: [0, 0, 0], porta: [-3.5, 0.5, -19.5], casa: [0, 0, -27] } };
  },

  centro_cidade({ seed = 21, noite = false } = {}) {
    const g = new THREE.Group(), r = rng(seed);
    add(g, [400, 0.2, 400], mat('#9a958c'), [0, -0.1, 0], { r: 0, cast: false });
    M.rua(g, { comprimento: 300, largura: 20, calcada: 8 });
    M.faixaPedestre(g, 0, 0, 20, Math.PI / 2);
    const lojas = ['PADARIA', 'MERCADO', 'FARMÁCIA', 'CAFÉ', 'LIVROS', 'PIZZA'];
    for (let i = -5; i <= 5; i++) {
      const x = i * 22;
      const p1 = M.predio({ seed: seed + i, andares: 5 + Math.floor(r() * 9), cor: CORES_PREDIO[(i + 14) % 7], loja: r() > 0.4, placa: lojas[(i + 6) % 6], noite });
      p1.position.set(x, 0, -27); g.add(p1);
      const p2 = M.predio({ seed: seed + i + 9, andares: 4 + Math.floor(r() * 10), cor: CORES_PREDIO[(i + 17) % 7], loja: r() > 0.5, placa: lojas[(i + 9) % 6], noite });
      p2.position.set(x + 11, 0, 27); p2.rotation.y = Math.PI; g.add(p2);
      M.poste(g, x, -15, 0, noite); M.poste(g, x + 11, 15, Math.PI, noite);
      if (i % 2 === 0) M.arvore(g, x + 6, -16, 0.7);
      if (r() > 0.4) M.carro(g, x + 5, r() > 0.5 ? 5 : -5, r() > 0.5 ? 0 : Math.PI, ['#e23b3b', '#3d7bff', '#ffd23f', '#ffffff', '#222222'][Math.floor(r() * 5)]);
    }
    M.banco(g, -8, -16.5); M.lixeira(g, 4, -16.5); M.hidrante(g, 10, -15);
    return { grupo: g, ceu: noite ? ['#0b1a3a', '#28406e'] : ['#6ab8ff', '#e3f2ff'], noite,
      pontos: { centro: [0, 0.5, -15], calcada: [0, 0.5, -15], faixa: [0, 0, 0], rua: [0, 0, 6] } };
  },

  canteiro_obras({ seed = 31 } = {}) {
    const g = new THREE.Group();
    grama(g, 400, 400, '#7cc35a');
    add(g, [70, 0.25, 50], mat('#b08a5a', { roughness: 1 }), [0, 0.02, -10], { r: 0, cast: false }); // terra
    M.rua(g, { comprimento: 260, largura: 14, z: 26 });
    const o = M.obra({ andares: 6, prontos: 3 }); o.position.set(-6, 0, -18); g.add(o);
    const gu = M.guindaste({ altura: 52, lanca: 38, giro: -0.5, carga: true }); gu.position.set(20, 0, -24); g.add(gu);
    M.tapume(g, 60, 14);
    for (let i = 0; i < 5; i++) M.cone(g, -14 + i * 7, 9);
    M.betoneira(g, 14, -2); M.tijolos(g, 20, 4); M.tijolos(g, 25, -4, 2);
    add(g, [6, 2.2, 4], '#3d7bff', [-26, 1.1, -2], { r: 0.1 }); // container/escritório
    add(g, [6.4, 0.3, 4.4], '#2b5cc4', [-26, 2.35, -2], { r: 0.05 });
    M.placaTexto(g, 'CUIDADO', [-26, 3.6, 0.2], 4.5, 1.3, '#e8a400');
    const p2 = M.predio({ andares: 10, cor: '#d7c3e8' }); p2.position.set(-60, 0, -30); g.add(p2);
    const p3 = M.predio({ andares: 7, cor: '#a9c4d9' }); p3.position.set(55, 0, -34); g.add(p3);
    return { grupo: g, ceu: ['#64b5f6', '#e1f5fe'],
      pontos: { centro: [0, 0.3, 2], obra: [-6, 0, -18], betoneira: [14, 0.3, -2], tijolos: [20, 0.3, 4], tapume: [0, 0.5, 18], guindaste: [20, 0, -24] } };
  },

  parque({ seed = 41 } = {}) {
    const g = new THREE.Group(), r = rng(seed);
    grama(g, 400, 400, '#74c955');
    add(g, [8, 0.22, 200], mat('#e2c79a'), [0, 0, 0], { r: 0, cast: false }); // caminho
    add(g, [36, 0.25, 22], mat('#4fc3f7', { roughness: 0.1, metalness: 0.2 }), [-30, 0.02, -24], { r: 3, cast: false }); // lago
    for (let i = 0; i < 26; i++) { const x = (r() - 0.5) * 160, z = -20 - r() * 70; if (Math.abs(x) > 8) (r() > 0.3 ? M.arvore : M.pinheiro)(g, x, z, 0.8 + r() * 0.5); }
    for (let i = 0; i < 10; i++) M.arvore(g, (r() > 0.5 ? 1 : -1) * (14 + r() * 50), 20 + r() * 30, 0.9 + r() * 0.3);
    M.banco(g, 7.5, -6, -Math.PI / 2); M.banco(g, -7.5, 6, Math.PI / 2); M.lixeira(g, 7, 4); M.poste(g, 6, -16, Math.PI / 2);
    // escorregador
    const e = new THREE.Group(); e.position.set(22, 0, -10); g.add(e);
    add(e, [0.3, 7, 0.3], '#e23b3b', [-1.5, 3.5, -1.5]); add(e, [0.3, 7, 0.3], '#e23b3b', [1.5, 3.5, -1.5]); add(e, [0.3, 7, 0.3], '#e23b3b', [-1.5, 3.5, 1.5]); add(e, [0.3, 7, 0.3], '#e23b3b', [1.5, 3.5, 1.5]);
    add(e, [3.6, 0.4, 3.6], '#ffd23f', [0, 6, 0]); add(e, [3, 0.3, 10], '#3d7bff', [0, 3.2, 6.3], { rot: [0.62, 0, 0] });
    for (let k = 0; k < 6; k++) add(e, [3, 0.2, 0.5], '#ffd23f', [0, k, -2.2]);
    for (let i = 0; i < 6; i++) { const x = (r() - 0.5) * 30; M.arbusto(g, x > 0 ? x + 6 : x - 6, (r() - 0.5) * 30, 0.8 + r() * 0.5, ['#43a047', '#66bb6a', '#ec407a'][i % 3]); }
    return { grupo: g, ceu: ['#58b4ff', '#d8efff'], pontos: { centro: [0, 0.2, 0], banco: [7.5, 0, -6], lago: [-30, 0, -12], escorregador: [22, 0, -10] } };
  },

  quarto({ cor = '#a7c7ff' } = {}) {
    const g = new THREE.Group();
    M.sala(g, { w: 36, d: 28, h: 14, parede: cor, piso: '#c9a37a' });
    add(g, [16, 0.15, 10], '#ff8a65', [0, 0.06, 2], { r: 0.5, cast: false }); // tapete
    // cama
    const c = new THREE.Group(); c.position.set(-11, 0, -7); g.add(c);
    add(c, [8, 1.6, 12], '#8a5a2b', [0, 0.8, 0]); add(c, [7.6, 1, 11.6], '#ffffff', [0, 2.1, 0], { r: 0.3 });
    add(c, [7.8, 0.6, 7], '#3d7bff', [0, 2.7, 2.2], { r: 0.25 }); add(c, [5, 0.8, 2.2], '#ffffff', [0, 2.9, -4.4], { r: 0.35 });
    add(c, [8, 5, 0.6], '#8a5a2b', [0, 2.5, -6]);
    // escrivaninha com computador
    M.mesa(g, 9, -10.5, { w: 9, d: 4, h: 3 }); M.cadeira(g, 9, -6.8, Math.PI, '#e23b3b');
    add(g, [4.2, 2.6, 0.3], '#222', [9, 5.0, -11.4], { r: 0.1 }); add(g, [3.8, 2.2, 0.32], mat('#4fc3f7', { emissive: '#4fc3f7', emissiveIntensity: 0.6 }), [9, 5.0, -11.36], { r: 0, cast: false });
    add(g, [0.4, 1.2, 0.4], '#222', [9, 3.6, -11.4]); add(g, [3, 0.15, 1.2], '#333', [9, 3.25, -9.8]);
    // estante, janela, pôster, luminária
    const e = new THREE.Group(); e.position.set(16.5, 0, 2); e.rotation.y = -Math.PI / 2; g.add(e);
    add(e, [8, 10, 2], '#b07a45', [0, 5, 0]); for (let k = 1; k < 4; k++) add(e, [7.6, 0.25, 2.2], '#8a5a2b', [0, k * 2.6, 0.05]);
    ['#e23b3b', '#3d7bff', '#ffd23f', '#43a047', '#ab47bc'].forEach((cc, i) => add(e, [0.6, 1.8, 1.4], cc, [-3 + i * 0.75, 3.55, 0.2], { r: 0.05 }));
    M.janela(g, -1, 8, -13.7, 6, 4.5, { cor: '#ffffff' });
    M.quadro(g, [-11, 9, -13.7], 4, 5, (ctx, W, H) => { ctx.fillStyle = '#1d2b53'; ctx.fillRect(0, 0, W, H); ctx.fillStyle = '#ffd23f'; ctx.beginPath(); ctx.arc(W / 2, H * 0.4, W * 0.22, 0, 7); ctx.fill(); ctx.fillStyle = '#ff6b6b'; ctx.beginPath(); ctx.arc(W * 0.7, H * 0.7, W * 0.1, 0, 7); ctx.fill(); for (let i = 0; i < 60; i++) { ctx.fillStyle = '#fff'; ctx.fillRect((i * 97) % W, (i * 61) % H, 6, 6); } }, 0, '#ffffff');
    return { grupo: g, interior: true, ceu: ['#bfe3ff', '#ffffff'], pontos: { centro: [0, 0, 2], cama: [-11, 0, -2], mesa: [9, 0, -6], janela: [-1, 0, -10] } };
  },

  escola_sala() {
    const g = new THREE.Group();
    M.sala(g, { w: 46, d: 36, h: 15, parede: '#f3e9d2', piso: '#b9a07e' });
    M.quadro(g, [0, 8, -17.6], 22, 7.5, (ctx, W, H) => { ctx.fillStyle = '#2f5a3e'; ctx.fillRect(0, 0, W, H); ctx.fillStyle = 'rgba(255,255,255,.85)'; ctx.font = 'bold 70px Arial'; ctx.fillText('Curiosidades do dia', 60, 120); ctx.font = '50px Arial'; ctx.fillText('1 + 1 = 2', 80, 230); ctx.fillText('H₂O = água', 80, 300); }, 0, '#8a5a2b');
    M.mesa(g, -12, -11, { w: 8, d: 4, h: 3.2, cor: '#8a5a2b' }); M.cadeira(g, -12, -14.5, 0, '#4a5568');
    for (let fila = 0; fila < 3; fila++) for (let col = 0; col < 4; col++) {
      const x = -13.5 + col * 9, z = -2 + fila * 8;
      M.mesa(g, x, z, { w: 4.4, d: 3, h: 2.8, cor: '#d9b483' }); M.cadeira(g, x, z + 2.6, Math.PI, ['#3d7bff', '#e23b3b', '#43a047', '#ffb300'][(fila + col) % 4]);
    }
    [-12, 0, 12].forEach((z) => M.janela(g, 22.9, 8, z, 6, 5, { rotY: -Math.PI / 2 }));
    add(g, [2.4, 2.4, 0.3], '#ffffff', [16, 12, -17.6], { r: 1.1 }); add(g, [0.15, 0.9, 0.35], '#222', [16, 12.35, -17.4], { r: 0 }); add(g, [0.7, 0.15, 0.35], '#222', [16.3, 12, -17.4], { r: 0 }); // relógio
    return { grupo: g, interior: true, ceu: ['#bfe3ff', '#ffffff'], pontos: { centro: [0, 0, -8], lousa: [0, 0, -13], professora: [-6, 0, -12], carteiras: [0, 0, 4] } };
  },

  laboratorio() {
    const g = new THREE.Group();
    M.sala(g, { w: 44, d: 32, h: 15, parede: '#dfe9ef', piso: '#e8edf0' });
    for (let i = -20; i < 20; i += 4) for (let k = -14; k < 16; k += 4) add(g, [3.9, 0.02, 3.9], (i / 4 + k / 4) % 2 ? '#ffffff' : '#cfd8dc', [i + 2, 0.01, k], { r: 0, cast: false });
    [[-10, -11], [10, -11], [-10, 2], [10, 2]].forEach(([x, z], j) => {
      add(g, [12, 3.2, 4.5], '#eceff1', [x, 1.6, z], { r: 0.05 }); add(g, [12.3, 0.3, 4.8], '#37474f', [x, 3.35, z], { r: 0.04 });
      ['#3ddc84', '#ff4d6d', '#4fc3f7', '#ffd23f', '#b388ff'].forEach((c, i) => M.frasco(g, x - 4.5 + i * 2.2, 3.5, z + (i % 2 ? 0.8 : -0.6), c, 1 + (i % 3) * 0.2));
    });
    M.quadro(g, [0, 8.5, -15.6], 18, 7, (ctx, W, H) => { ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, W, H); ctx.fillStyle = '#1d3557'; ctx.font = 'bold 64px Arial'; ctx.fillText('E = mc²', 60, 120); ctx.font = '48px Arial'; ctx.fillText('C₆H₁₂O₆ + 6O₂ → 6CO₂', 60, 220); ctx.strokeStyle = '#e63946'; ctx.lineWidth = 8; ctx.beginPath(); ctx.arc(820, 200, 80, 0, 7); ctx.stroke(); ctx.beginPath(); ctx.ellipse(820, 200, 150, 50, 0.4, 0, 7); ctx.stroke(); }, 0, '#90a4ae');
    // microscópio
    const mi = new THREE.Group(); mi.position.set(14, 3.5, -11); g.add(mi);
    add(mi, [1.6, 0.3, 1.6], '#263238'); add(mi, [0.4, 2.2, 0.4], '#263238', [0, 1.2, -0.5]); add(mi, [0.5, 1.6, 0.5], '#eceff1', [0, 2.2, 0], { rot: [0.5, 0, 0] });
    return { grupo: g, interior: true, ceu: ['#cfe8ff', '#ffffff'], pontos: { centro: [0, 0, -4], bancada: [-10, 0, -7.5], quadro: [0, 0, -11] } };
  },

  // Fundo de apresentação para explicar curiosidades: telão no meio (o HUD desenha nele)
  estudio({ cor = '#2b2d6e', cor2 = '#7c5cff' } = {}) {
    const g = new THREE.Group();
    add(g, [60, 0.4, 40], mat('#1b1d4a', { roughness: 0.4, metalness: 0.2 }), [0, -0.2, 0], { r: 0, cast: false });
    add(g, [60, 24, 0.5], cor, [0, 12, -16], { r: 0 });
    for (let i = -5; i <= 5; i++) add(g, [0.5, 24, 0.6], i % 2 ? cor2 : shade(cor, 0.15), [i * 5.4, 12, -15.7], { r: 0, cast: false });
    const tela = M.quadro(g, [0, 10, -15.2], 20, 11.25, (ctx, W, H) => { ctx.fillStyle = '#0d1b2a'; ctx.fillRect(0, 0, W, H); ctx.fillStyle = '#38e8ff'; ctx.font = 'bold 260px Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('?', W / 2, H / 2); }, 0, '#111');
    tela.children[1].material.emissive = new THREE.Color('#ffffff'); tela.children[1].material.emissiveMap = tela.userData.tex; tela.children[1].material.emissiveIntensity = 0.85;
    // palco redondo
    add(g, [16, 0.6, 9], mat(cor2, { emissive: cor2, emissiveIntensity: 0.25 }), [0, 0.3, 2], { r: 3, cast: false });
    // "?" gigantes decorativos
    [[-22, 1], [22, -1]].forEach(([x, s]) => { const q = M.placaTexto(g, '?', [x, 7, -12], 5, 7, '#ffd23f', s * 0.3); q.scale.z = 3; });
    return { grupo: g, interior: true, ceu: ['#14163a', '#2b2d6e'], tela, pontos: { centro: [0, 0.6, 2], palco: [0, 0.6, 2], tela: [0, 10, -15] } };
  },
};
Object.assign(CENARIOS, CENARIOS_CIDADE);
export const LISTA_CENARIOS = Object.keys(CENARIOS);
