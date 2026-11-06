import {Easing, interpolate} from 'remotion';

// Progresso de 0 a 1 entre dois frames, com suavização.
export const prog = (
  frame: number,
  inicio: number,
  fim: number,
  easing: (t: number) => number = Easing.inOut(Easing.cubic),
) =>
  interpolate(frame, [inicio, fim], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing,
  });

export const mix = (a: number, b: number, t: number) => a + (b - a) * t;

// Gerador pseudoaleatório fixo: as estrelas ficam sempre no mesmo lugar em todo frame.
export const aleatorio = (semente: number) => {
  let s = semente;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
};

// Fases da história (em frames, 30 fps)
export const CENA = {
  acorda: [0, 120],
  estrelaCai: [120, 240],
  planta: [240, 360],
  final: [360, 540],
} as const;
