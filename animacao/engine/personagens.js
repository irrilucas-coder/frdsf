// Personagens de blocos (estilo "boneco de montar") com rosto desenhado e expressões.
// Cada personagem vem de uma ficha em biblioteca/personagens.json.
import * as THREE from 'three';
import { add, rbox, mat, mesh, canvasTex, shade } from './base.js';

// ---------- Rosto ----------
export const EXPRESSOES = ['neutro', 'feliz', 'rindo', 'surpreso', 'assustado', 'bravo', 'triste', 'pensativo', 'desconfiado', 'apaixonado', 'chorando', 'convencido'];

function drawFace(ctx, W, def, expr, boca, piscar) {
  ctx.clearRect(0, 0, W, W);
  const robo = def.tipo === 'robo';
  const s = W / 256;
  ctx.save(); ctx.scale(s, s);
  const ink = robo ? (def.corOlhos || '#38e8ff') : '#1b1b22';
  if (robo) { // tela
    ctx.fillStyle = '#0d1b2a'; roundRect(ctx, 22, 40, 212, 170, 34); ctx.fill();
    ctx.shadowColor = ink; ctx.shadowBlur = 16;
  }
  // ---- olhos
  const eyeY = 108, ex = 70;
  const eye = (cx, side) => {
    ctx.fillStyle = ink;
    if (piscar && expr !== 'rindo') { ctx.fillRect(cx - 18, eyeY - 3, 36, 7); return; }
    switch (expr) {
      case 'feliz': case 'convencido':
        ctx.lineWidth = 10; ctx.strokeStyle = ink; ctx.lineCap = 'round';
        if (expr === 'convencido') { ctx.beginPath(); ctx.ellipse(cx, eyeY + 4, 15, 13, 0, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = def.pele || '#f2c9a0'; if (!robo) ctx.fillRect(cx - 20, eyeY - 14, 40, 14); else { ctx.fillStyle = '#0d1b2a'; ctx.fillRect(cx - 20, eyeY - 14, 40, 14); } break; }
        ctx.beginPath(); ctx.ellipse(cx, eyeY, 16, 22, 0, 0, Math.PI * 2); ctx.fill(); glint(ctx, cx, eyeY, robo); break;
      case 'rindo':
        ctx.lineWidth = 9; ctx.strokeStyle = ink; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.arc(cx, eyeY + 8, 15, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke(); break;
      case 'surpreso': case 'assustado':
        ctx.fillStyle = robo ? ink : '#fff'; ctx.beginPath(); ctx.ellipse(cx, eyeY, 21, 27, 0, 0, Math.PI * 2); ctx.fill();
        if (!robo) { ctx.lineWidth = 4; ctx.strokeStyle = ink; ctx.stroke(); ctx.fillStyle = ink; ctx.beginPath(); ctx.ellipse(cx, eyeY + 2, expr === 'assustado' ? 6 : 10, expr === 'assustado' ? 7 : 12, 0, 0, Math.PI * 2); ctx.fill(); }
        break;
      case 'apaixonado':
        ctx.fillStyle = '#ff3b6b'; heart(ctx, cx, eyeY, 22); break;
      case 'triste': case 'chorando':
        ctx.beginPath(); ctx.ellipse(cx, eyeY + 4, 14, 18, 0, 0, Math.PI * 2); ctx.fill(); glint(ctx, cx, eyeY + 4, robo);
        if (expr === 'chorando') { ctx.fillStyle = '#5ec8ff'; ctx.beginPath(); ctx.ellipse(cx + side * 4, eyeY + 34, 6, 12, 0, 0, Math.PI * 2); ctx.fill(); }
        break;
      case 'desconfiado':
        ctx.beginPath(); ctx.ellipse(cx, eyeY + 4, 15, 9, 0, 0, Math.PI * 2); ctx.fill(); break;
      default:
        ctx.beginPath(); ctx.ellipse(cx, eyeY, 15, 21, 0, 0, Math.PI * 2); ctx.fill(); glint(ctx, cx, eyeY, robo);
    }
  };
  eye(128 - ex / 1.15, -1); eye(128 + ex / 1.15, 1);

  // ---- sobrancelhas
  if (!robo) {
    ctx.strokeStyle = def.corSobrancelha || shade(def.cabelo?.cor || '#3a2a1a', -0.25); ctx.lineWidth = 9; ctx.lineCap = 'round';
    const brow = (cx, side) => {
      let a = 0, dy = 0;
      if (expr === 'bravo') { a = 0.45 * side; dy = 6; }
      else if (expr === 'triste' || expr === 'chorando' || expr === 'assustado') { a = -0.4 * side; dy = -4; }
      else if (expr === 'surpreso') dy = -12;
      else if (expr === 'desconfiado') { a = side < 0 ? 0.3 * side : 0; dy = side < 0 ? 4 : -8; }
      else if (expr === 'pensativo') { a = side > 0 ? -0.35 : 0.1 * side; dy = side > 0 ? -10 : 0; }
      ctx.save(); ctx.translate(cx, eyeY - 38 + dy); ctx.rotate(a);
      ctx.beginPath(); ctx.moveTo(-18, 0); ctx.lineTo(18, 0); ctx.stroke(); ctx.restore();
    };
    brow(128 - ex / 1.15, -1); brow(128 + ex / 1.15, 1);
  }

  // ---- bochechas
  if (!robo && ['feliz', 'rindo', 'apaixonado', 'convencido'].includes(expr)) {
    ctx.fillStyle = 'rgba(255,110,110,0.35)';
    ctx.beginPath(); ctx.ellipse(52, 150, 16, 9, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(204, 150, 16, 9, 0, 0, Math.PI * 2); ctx.fill();
  }
  // ---- bigode / barba
  if (def.bigode) { ctx.fillStyle = def.bigode; roundRect(ctx, 84, 150, 88, 18, 9); ctx.fill(); }

  // ---- boca
  const my = 176;
  ctx.fillStyle = robo ? ink : '#3a1418'; ctx.strokeStyle = ink; ctx.lineWidth = 8; ctx.lineCap = 'round';
  const open = boca; // 0 fechada, 1 meio, 2 aberta
  if (open > 0) {
    const h = open === 1 ? 14 : 26, w = open === 1 ? 26 : 32;
    const big = ['assustado', 'surpreso'].includes(expr) ? 1.25 : 1;
    ctx.beginPath(); ctx.ellipse(128, my, w * big, h * big, 0, 0, Math.PI * 2); ctx.fill();
    if (!robo && open === 2) { ctx.fillStyle = '#e8566a'; ctx.beginPath(); ctx.ellipse(128, my + h * big * 0.5, w * big * 0.6, h * big * 0.35, 0, 0, Math.PI * 2); ctx.fill(); }
  } else {
    switch (expr) {
      case 'feliz': case 'apaixonado':
        ctx.beginPath(); ctx.arc(128, my - 14, 30, Math.PI * 0.2, Math.PI * 0.8); ctx.stroke(); break;
      case 'rindo':
        ctx.beginPath(); ctx.moveTo(90, my - 10); ctx.quadraticCurveTo(128, my + 40, 166, my - 10); ctx.closePath(); ctx.fill();
        if (!robo) { ctx.fillStyle = '#fff'; ctx.fillRect(100, my - 9, 56, 8); } break;
      case 'convencido':
        ctx.beginPath(); ctx.moveTo(100, my); ctx.quadraticCurveTo(140, my + 12, 162, my - 12); ctx.stroke(); break;
      case 'surpreso':
        ctx.beginPath(); ctx.ellipse(128, my, 13, 16, 0, 0, Math.PI * 2); ctx.fill(); break;
      case 'assustado':
        ctx.beginPath(); ctx.moveTo(92, my + 6);
        for (let i = 0; i <= 6; i++) ctx.lineTo(92 + i * 12, my + (i % 2 ? -6 : 6));
        ctx.stroke(); break;
      case 'triste': case 'chorando':
        ctx.beginPath(); ctx.arc(128, my + 26, 26, Math.PI * 1.2, Math.PI * 1.8); ctx.stroke(); break;
      case 'bravo':
        ctx.beginPath(); ctx.moveTo(100, my + 4); ctx.lineTo(156, my - 2); ctx.stroke(); break;
      case 'pensativo': case 'desconfiado':
        ctx.beginPath(); ctx.moveTo(108, my + 2); ctx.lineTo(150, my - 4); ctx.stroke(); break;
      default:
        ctx.beginPath(); ctx.arc(128, my - 20, 24, Math.PI * 0.28, Math.PI * 0.72); ctx.stroke();
    }
  }
  // ---- óculos
  if (def.oculos) {
    ctx.shadowBlur = 0; ctx.strokeStyle = def.oculos; ctx.lineWidth = 7;
    ctx.beginPath(); ctx.arc(128 - ex / 1.15, eyeY, 30, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.arc(128 + ex / 1.15, eyeY, 30, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(128 - 30 + 30 - ex / 1.15 + 30, eyeY - 4); ctx.lineTo(128 + ex / 1.15 - 30, eyeY - 4); ctx.stroke();
  }
  ctx.restore();
}
function glint(ctx, x, y, robo) { if (robo) return; ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(x + 5, y - 8, 5, 0, Math.PI * 2); ctx.fill(); }
function heart(ctx, x, y, s) { ctx.beginPath(); ctx.moveTo(x, y + s * 0.8); ctx.bezierCurveTo(x - s * 1.4, y - s * 0.2, x - s * 0.6, y - s * 1.2, x, y - s * 0.4); ctx.bezierCurveTo(x + s * 0.6, y - s * 1.2, x + s * 1.4, y - s * 0.2, x, y + s * 0.8); ctx.fill(); }
export function roundRect(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }

// ---------- Estampa da camisa (frente do tronco) ----------
function shirtTexture(def) {
  const r = def.roupa || {};
  return canvasTex(256, 256, (ctx, W, H) => {
    ctx.fillStyle = r.camisa || '#3d7bff'; ctx.fillRect(0, 0, W, H);
    const e = r.estampa || 'lisa';
    if (e === 'listrada') { ctx.fillStyle = r.cor2 || '#ffffff'; for (let y = 0; y < H; y += 44) ctx.fillRect(0, y, W, 22); }
    if (e === 'estrela') { ctx.fillStyle = r.cor2 || '#ffd23f'; star(ctx, 128, 120, 52, 24); }
    if (e === 'raio') { ctx.fillStyle = r.cor2 || '#ffd23f'; ctx.beginPath(); ctx.moveTo(140, 40); ctx.lineTo(90, 135); ctx.lineTo(125, 135); ctx.lineTo(108, 215); ctx.lineTo(170, 110); ctx.lineTo(135, 110); ctx.closePath(); ctx.fill(); }
    if (e === 'interrogacao') { ctx.fillStyle = r.cor2 || '#ffffff'; ctx.font = 'bold 170px Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('?', 128, 135); }
    if (e === 'moletom') { ctx.fillStyle = shade(r.camisa, -0.15); ctx.fillRect(60, 150, 136, 70); ctx.strokeStyle = shade(r.camisa, -0.3); ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(110, 0); ctx.lineTo(110, 70); ctx.moveTo(146, 0); ctx.lineTo(146, 70); ctx.stroke(); if (r.cor2) { ctx.fillStyle = r.cor2; star(ctx, 128, 95, 30, 14); } }
    if (e === 'jaleco') {
      ctx.fillStyle = r.cor2 || '#5aa0ff'; ctx.beginPath(); ctx.moveTo(88, 0); ctx.lineTo(168, 0); ctx.lineTo(140, 256); ctx.lineTo(116, 256); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#d0d4dc'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(88, 0); ctx.lineTo(116, 256); ctx.moveTo(168, 0); ctx.lineTo(140, 256); ctx.stroke();
      ctx.strokeRect(160, 150, 46, 40); ctx.fillStyle = '#ff5c5c'; ctx.fillRect(170, 140, 6, 22); ctx.fillStyle = '#3d7bff'; ctx.fillRect(182, 140, 6, 22);
    }
    if (e === 'terno') {
      ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.moveTo(98, 0); ctx.lineTo(158, 0); ctx.lineTo(128, 120); ctx.closePath(); ctx.fill();
      ctx.fillStyle = r.cor2 || '#e23b3b'; ctx.beginPath(); ctx.moveTo(120, 8); ctx.lineTo(136, 8); ctx.lineTo(142, 100); ctx.lineTo(128, 118); ctx.lineTo(114, 100); ctx.closePath(); ctx.fill();
    }
    if (e === 'macacao') { ctx.fillStyle = r.cor2 || '#2f5fb3'; ctx.fillRect(40, 110, 176, 146); ctx.fillRect(56, 0, 34, 120); ctx.fillRect(166, 0, 34, 120); ctx.fillStyle = '#ffd23f'; ctx.beginPath(); ctx.arc(73, 112, 8, 0, 7); ctx.arc(183, 112, 8, 0, 7); ctx.fill(); }
    if (e === 'colete') { ctx.fillStyle = '#ff8a1f'; ctx.fillRect(0, 0, 100, 256); ctx.fillRect(156, 0, 100, 256); ctx.fillStyle = '#e8ecef'; ctx.fillRect(0, 150, 100, 18); ctx.fillRect(156, 150, 100, 18); ctx.fillRect(0, 200, 100, 18); ctx.fillRect(156, 200, 100, 18); }
    if (r.texto) { ctx.fillStyle = r.cor2 || '#fff'; ctx.font = 'bold 54px Arial'; ctx.textAlign = 'center'; ctx.fillText(r.texto, 128, 150); }
  });
}
function star(ctx, x, y, R, r) { ctx.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r : R; ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } ctx.closePath(); ctx.fill(); }

// ---------- Cabelo e acessórios ----------
function addHair(head, hair) {
  if (!hair || hair.estilo === 'careca') return;
  const c = hair.cor || '#3a2a1a', m = mat(c), y0 = 1.2;
  const cap = (h = 0.32) => add(head, [1.34, h, 1.3], m, [0, y0 + h / 2 - 0.08, 0], { r: 0.1 });
  switch (hair.estilo) {
    case 'espetado': {
      cap();
      const cone = new THREE.ConeGeometry(0.26, 0.6, 4);
      [[-0.4, 0.3], [0, 0.35], [0.4, 0.3], [-0.2, -0.1], [0.25, -0.15], [-0.45, -0.4], [0.45, -0.4], [0, -0.45]].forEach(([x, z], i) => {
        const s = mesh(cone, m); s.position.set(x, y0 + 0.42, z); s.rotation.set(-0.35 + z * 0.4, 0.78, x * -0.6); head.add(s);
      });
      add(head, [1.34, 0.22, 0.2], m, [0, y0 - 0.02, 0.6], { r: 0.06 });
      break;
    }
    case 'franja':
      cap(); add(head, [1.36, 0.36, 0.24], m, [0, y0 - 0.1, 0.56], { r: 0.08 });
      add(head, [0.2, 0.7, 1.24], m, [-0.62, y0 - 0.3, -0.02]); add(head, [0.2, 0.7, 1.24], m, [0.62, y0 - 0.3, -0.02]);
      break;
    case 'longo':
      cap(0.36); add(head, [1.4, 1.75, 0.34], m, [0, y0 - 0.75, -0.55], { r: 0.1 });
      add(head, [0.22, 1.3, 1.0], m, [-0.66, y0 - 0.55, -0.1], { r: 0.08 }); add(head, [0.22, 1.3, 1.0], m, [0.66, y0 - 0.55, -0.1], { r: 0.08 });
      add(head, [1.36, 0.26, 0.22], m, [0, y0 - 0.06, 0.56], { r: 0.08 });
      break;
    case 'coque':
      cap(0.3); add(head, [0.62, 0.55, 0.62], m, [0, y0 + 0.38, -0.25], { r: 0.25 });
      add(head, [1.34, 0.22, 0.2], m, [0, y0 - 0.02, 0.6], { r: 0.06 });
      break;
    case 'rabo':
      cap(0.32); add(head, [1.34, 0.24, 0.2], m, [0, y0 - 0.04, 0.6], { r: 0.06 });
      add(head, [0.42, 1.2, 0.42], m, [0, y0 - 0.45, -0.8], { r: 0.18, rot: [0.25, 0, 0] });
      break;
    case 'black':
      add(head, [1.75, 1.0, 1.65], m, [0, y0 + 0.22, -0.08], { r: 0.45 });
      break;
    case 'calvo':
      add(head, [0.18, 0.5, 0.9], m, [-0.67, y0 - 0.45, -0.1], { r: 0.06 }); add(head, [0.18, 0.5, 0.9], m, [0.67, y0 - 0.45, -0.1], { r: 0.06 });
      add(head, [1.36, 0.5, 0.2], m, [0, y0 - 0.45, -0.6], { r: 0.06 });
      break;
    default: // curto
      cap(0.3); add(head, [1.34, 0.2, 0.2], m, [0, y0 - 0.02, 0.6], { r: 0.06 });
      add(head, [1.36, 0.45, 0.3], m, [0, y0 - 0.2, -0.55], { r: 0.06 });
  }
}

function addAcessorios(rig, def) {
  const a = def.acessorios || [];
  if (a.includes('bone')) {
    const c = mat(def.corBone || '#e23b3b');
    add(rig.head, [1.38, 0.42, 1.34], c, [0, 1.36, 0], { r: 0.16 });
    add(rig.head, [1.2, 0.08, 0.6], c, [0, 1.2, 0.85], { r: 0.03 });
  }
  if (a.includes('capacete')) {
    const c = mat('#ffcc00', { roughness: 0.4 });
    add(rig.head, [1.5, 0.55, 1.45], c, [0, 1.42, 0], { r: 0.25 });
    add(rig.head, [1.7, 0.08, 1.65], c, [0, 1.18, 0.05], { r: 0.04 });
  }
  if (a.includes('mochila')) add(rig.torso, [1.5, 1.6, 0.6], mat(def.corMochila || '#ff8a1f'), [0, 0, -0.78], { r: 0.15 });
  if (a.includes('fone')) {
    const c = mat('#222'); add(rig.head, [1.5, 0.12, 0.2], c, [0, 1.3, 0], { r: 0.05 });
    add(rig.head, [0.2, 0.45, 0.45], c, [-0.72, 0.6, 0], { r: 0.08 }); add(rig.head, [0.2, 0.45, 0.45], c, [0.72, 0.6, 0], { r: 0.08 });
  }
  if (a.includes('antena')) {
    add(rig.head, [0.08, 0.5, 0.08], mat('#9aa4b2', { metalness: 0.6, roughness: 0.3 }), [0, 1.45, 0]);
    add(rig.head, [0.22, 0.22, 0.22], mat('#ff4d4d', { emissive: '#ff2020', emissiveIntensity: 0.8 }), [0, 1.75, 0], { r: 0.1 });
  }
  if (a.includes('coroa')) {
    const g = mat('#ffd23f', { metalness: 0.7, roughness: 0.3 });
    add(rig.head, [1.2, 0.3, 1.2], g, [0, 1.35, 0], { r: 0.03 });
    [[-0.45, 0.45], [0.45, 0.45], [-0.45, -0.45], [0.45, -0.45]].forEach(([x, z]) => add(rig.head, [0.22, 0.3, 0.22], g, [x, 1.6, z], { r: 0.03 }));
  }
}

// ---------- Construção do boneco ----------
// Hierarquia: root(pés no chão) > body > [torso, pernaE/D (pivô no quadril), braçoE/D (pivô no ombro), pescoço > cabeça]
export function criarPersonagem(def) {
  if (def.tipo === 'cachorro') return criarCachorro(def);
  const robo = def.tipo === 'robo';
  const esc = def.escala || 1;
  const pele = def.pele || '#f2c9a0';
  const r = def.roupa || {};
  const metal = (c) => mat(c, { metalness: 0.55, roughness: 0.35 });
  const skin = robo ? metal(pele) : mat(pele);
  const shirt = robo ? metal(r.camisa || '#c9d1dc') : mat(r.camisa || '#3d7bff');
  const sleeve = r.estampa === 'jaleco' ? mat('#f4f6f8') : r.estampa === 'colete' ? mat(r.camisa || '#3d7bff') : r.estampa === 'terno' ? mat(r.corManga || r.camisa) : shirt;
  const pants = robo ? metal(r.calca || '#8a94a3') : mat(r.calca || '#2b3a55');
  const shoes = mat(r.sapato || '#f4f4f4');

  const root = new THREE.Group(); root.name = def.id;
  const body = new THREE.Group(); root.add(body);
  const rig = { root, body, def };

  // tronco
  const torsoMats = [sleeve, sleeve, sleeve, sleeve, new THREE.MeshStandardMaterial({ map: shirtTexture(def), roughness: robo ? 0.35 : 0.8, metalness: robo ? 0.5 : 0 }), sleeve];
  if (r.estampa === 'jaleco') torsoMats[4].map = shirtTexture({ roupa: { ...r, camisa: '#f4f6f8' } });
  const torsoW = def.largo ? 2.25 : 2;
  rig.torso = new THREE.Group(); rig.torso.position.y = 3; body.add(rig.torso);
  const torsoMesh = mesh(rbox(torsoW, 2, 1, 0.1), torsoMats); rig.torso.add(torsoMesh);
  if (def.barriga) add(rig.torso, [torsoW * 0.8, 1.1, 0.35], torsoMats[4].color ? shirt : shirt, [0, -0.35, 0.55], { r: 0.15 });
  if (r.estampa === 'jaleco') add(rig.torso, [torsoW + 0.08, 0.6, 1.08], mat('#f4f6f8'), [0, -1.0, 0], { r: 0.06 }); // barra do jaleco
  if (r.saia) add(rig.torso, [torsoW + 0.2, 0.8, 1.2], mat(r.saia), [0, -1.25, 0], { r: 0.08 });

  // pernas (pivô no quadril, y=2)
  const leg = (x) => {
    const g = new THREE.Group(); g.position.set(x, 2, 0); body.add(g);
    add(g, [0.98, 1.68, 0.98], pants, [0, -0.84, 0], { r: 0.08 });
    add(g, [1.0, 0.36, 1.12], shoes, [0, -1.82, 0.05], { r: 0.1 });
    return g;
  };
  rig.legL = leg(-0.5); rig.legR = leg(0.5);

  // braços (pivô no ombro)
  const arm = (side) => {
    const g = new THREE.Group(); g.position.set(side * (torsoW / 2 + 0.48), 3.85, 0); body.add(g);
    const curta = r.manga === 'curta' && !robo;
    const sl = curta ? 0.75 : 1.75;
    add(g, [0.95, sl, 0.95], sleeve, [0, -sl / 2 + 0.15, 0], { r: 0.08 });
    if (curta) add(g, [0.9, 2 - sl, 0.9], skin, [0, -sl - (2 - sl) / 2 + 0.15, 0], { r: 0.08 });
    else add(g, [0.85, 0.35, 0.85], skin, [0, -1.72, 0], { r: 0.1 }); // mão
    return g;
  };
  rig.armL = arm(-1); rig.armR = arm(1);

  // cabeça
  rig.neck = new THREE.Group(); rig.neck.position.y = 4.02; body.add(rig.neck);
  rig.head = new THREE.Group(); rig.neck.add(rig.head);
  const headMesh = mesh(rbox(1.25, 1.2, 1.2, robo ? 0.12 : 0.18), skin); headMesh.position.y = 0.6; rig.head.add(headMesh);
  if (robo) { add(rig.head, [0.2, 0.5, 0.5], metal('#9aa4b2'), [-0.68, 0.6, 0]); add(rig.head, [0.2, 0.5, 0.5], metal('#9aa4b2'), [0.68, 0.6, 0]); }
  addHair(rig.head, def.cabelo);
  addAcessorios(rig, def);

  // rosto (textura trocável)
  const faceCanvas = document.createElement('canvas'); faceCanvas.width = faceCanvas.height = 256;
  const faceTex = new THREE.CanvasTexture(faceCanvas); faceTex.colorSpace = THREE.SRGBColorSpace; faceTex.anisotropy = 4;
  const face = new THREE.Mesh(new THREE.PlaneGeometry(1.14, 1.1), new THREE.MeshStandardMaterial({ map: faceTex, transparent: true, roughness: 0.9, emissive: robo ? '#ffffff' : '#000000', emissiveMap: robo ? faceTex : null, emissiveIntensity: robo ? 0.9 : 0 }));
  face.position.set(0, 0.58, 0.605); rig.head.add(face);
  let last = '';
  rig.setFace = (expr = 'neutro', boca = 0, piscar = false) => {
    const k = `${expr}|${boca}|${piscar}`;
    if (k === last) return; last = k;
    drawFace(faceCanvas.getContext('2d'), 256, def, expr, boca, piscar);
    faceTex.needsUpdate = true;
  };
  rig.setFace('neutro');
  root.scale.setScalar(esc);
  root.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  face.castShadow = false;
  rig.altura = 5.25 * esc;
  return rig;
}

function criarCachorro(def) {
  const root = new THREE.Group(), body = new THREE.Group(); root.add(body);
  const c = mat(def.pele || '#d9a066'), c2 = mat(def.cor2 || '#fff3e0'), esc = def.escala || 1;
  const rig = { root, body, def, tipo: 'cachorro' };
  rig.torso = new THREE.Group(); rig.torso.position.y = 1.2; body.add(rig.torso);
  add(rig.torso, [1.1, 0.9, 2.0], c, [0, 0, 0], { r: 0.2 });
  add(rig.torso, [0.9, 0.5, 1.4], c2, [0, -0.25, 0.1], { r: 0.15 });
  const leg = (x, z) => { const g = new THREE.Group(); g.position.set(x, 1.0, z); body.add(g); add(g, [0.32, 0.9, 0.32], c, [0, -0.45, 0], { r: 0.08 }); add(g, [0.36, 0.18, 0.42], c2, [0, -0.9, 0.04], { r: 0.06 }); return g; };
  rig.legs = [leg(-0.35, 0.7), leg(0.35, 0.7), leg(-0.35, -0.7), leg(0.35, -0.7)];
  rig.legL = rig.legs[0]; rig.legR = rig.legs[1];
  rig.neck = new THREE.Group(); rig.neck.position.set(0, 1.55, 0.9); body.add(rig.neck);
  rig.head = new THREE.Group(); rig.neck.add(rig.head);
  add(rig.head, [0.95, 0.85, 0.85], c, [0, 0.3, 0.15], { r: 0.2 });
  add(rig.head, [0.55, 0.4, 0.45], c2, [0, 0.12, 0.65], { r: 0.12 });
  add(rig.head, [0.2, 0.14, 0.12], mat('#222'), [0, 0.3, 0.9], { r: 0.05 });
  add(rig.head, [0.24, 0.55, 0.14], mat(def.corOrelha || '#8a5a2b'), [-0.48, 0.45, 0.05], { r: 0.06, rot: [0, 0, 0.35] });
  add(rig.head, [0.24, 0.55, 0.14], mat(def.corOrelha || '#8a5a2b'), [0.48, 0.45, 0.05], { r: 0.06, rot: [0, 0, -0.35] });
  const eyeM = mat('#141414', { roughness: 0.3 });
  add(rig.head, [0.14, 0.18, 0.05], eyeM, [-0.22, 0.48, 0.58], { r: 0.05 }); add(rig.head, [0.14, 0.18, 0.05], eyeM, [0.22, 0.48, 0.58], { r: 0.05 });
  rig.tail = new THREE.Group(); rig.tail.position.set(0, 1.45, -1.0); body.add(rig.tail);
  add(rig.tail, [0.18, 0.18, 0.7], c, [0, 0.15, -0.3], { r: 0.08, rot: [-0.6, 0, 0] });
  rig.setFace = () => {};
  root.scale.setScalar(esc);
  rig.altura = 2.2 * esc;
  return rig;
}
