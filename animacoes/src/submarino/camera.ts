import {Easing, interpolate} from 'remotion';

export type V3 = [number, number, number];

// Um "plano" de câmera: de/até em segundos (relativos à cena), e a câmera
// desliza de pos[0] até pos[1] olhando de olha[0] até olha[1]. Entre planos há corte seco.
export type Plano = {de: number; pos: [V3, V3]; olha: [V3, V3]; fov?: number};

export const camNoTempo = (planos: Plano[], s: number, fim: number) => {
  let i = 0;
  for (let k = 0; k < planos.length; k++) if (s >= planos[k].de) i = k;
  const p = planos[i];
  const ate = i + 1 < planos.length ? planos[i + 1].de : fim;
  const t = interpolate(s, [p.de, Math.max(ate, p.de + 0.01)], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.quad),
  });
  const lerp = (a: V3, b: V3): V3 => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
  return {pos: lerp(p.pos[0], p.pos[1]), olha: lerp(p.olha[0], p.olha[1]), fov: p.fov ?? 50, plano: i};
};
