// Peças básicas: geometrias/materiais com cache, ruído determinístico, easing.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

const geoCache = new Map();
export function rbox(w, h, d, r = 0.08) {
  const k = `${w},${h},${d},${r}`;
  if (!geoCache.has(k)) geoCache.set(k, r > 0 ? new RoundedBoxGeometry(w, h, d, 2, Math.min(r, w / 2, h / 2, d / 2)) : new THREE.BoxGeometry(w, h, d));
  return geoCache.get(k);
}
export function box(w, h, d) { return rbox(w, h, d, 0); }

const matCache = new Map();
export function mat(color, opts = {}) {
  const k = color + JSON.stringify(opts);
  if (!matCache.has(k)) matCache.set(k, new THREE.MeshStandardMaterial({ color, roughness: 0.8, metalness: 0, ...opts }));
  return matCache.get(k);
}

export function mesh(geo, material, { cast = true, receive = true } = {}) {
  const m = new THREE.Mesh(geo, material);
  m.castShadow = cast; m.receiveShadow = receive;
  return m;
}

// Adiciona um bloco ao grupo: add(g, [w,h,d], cor, [x,y,z], {r, rot, cast})
export function add(group, [w, h, d], color, [x, y, z] = [0, 0, 0], o = {}) {
  const m = mesh(o.r === undefined ? rbox(w, h, d, 0.04) : rbox(w, h, d, o.r), typeof color === 'string' ? mat(color, o.mat) : color, o);
  m.position.set(x, y, z);
  if (o.rot) m.rotation.set(...o.rot);
  group.add(m);
  return m;
}

// Gerador pseudoaleatório com semente (cenários sempre iguais)
export function rng(seed = 1) {
  let s = seed >>> 0 || 1;
  return () => { s ^= s << 13; s ^= s >>> 17; s ^= s << 5; return ((s >>> 0) % 100000) / 100000; };
}

export const ease = {
  linear: (t) => t,
  inOut: (t) => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2,
  out: (t) => 1 - Math.pow(1 - t, 3),
  in: (t) => t * t * t,
  back: (t) => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); },
};
export const clamp01 = (x) => Math.max(0, Math.min(1, x));
export const lerp = (a, b, t) => a + (b - a) * t;
// ruído suave determinístico em [-1,1]
export function noise1(x, seed = 0) {
  const h = (n) => { const s = Math.sin(n * 127.1 + seed * 311.7) * 43758.5453; return (s - Math.floor(s)) * 2 - 1; };
  const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f);
  return h(i) * (1 - u) + h(i + 1) * u;
}

export function canvasTex(w, h, draw) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

export function shade(hex, f) {
  const c = new THREE.Color(hex);
  if (f >= 0) c.lerp(new THREE.Color('#ffffff'), f); else c.lerp(new THREE.Color('#000000'), -f);
  return '#' + c.getHexString();
}
