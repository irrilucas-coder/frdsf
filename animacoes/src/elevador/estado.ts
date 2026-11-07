import {Easing, interpolate} from 'remotion';
import {cena, quandoDiz, type CenaId} from './roteiro';

// Estado da cabine ao longo do vídeo (usado pela cena 3D e pelo painel ANDAR/VELOCIDADE).
// Cada cena define pontos-chave relativos ao início dela: [segundo, andar].
export type Estado = {andar: number; vel: number; painel: boolean; perigo: boolean};

const R = (id: CenaId, fala: string, palavra: string) => quandoDiz(id, fala, palavra);
const dur = (id: CenaId) => cena(id).fim - cena(id).inicio;

const ROTEIRO_ANDAR: Partial<Record<CenaId, () => [number, number][]>> = {
  gancho: () => [
    [0, 40],
    [dur('gancho') * 0.85, 0],
  ],
  escada: () => [
    [0, 0],
    [dur('escada'), 2],
  ],
  manivela: () => [
    [0, 0],
    [R('manivela', 'L2', 'terceiro'), 3],
    [dur('manivela'), 3],
  ],
  contrapeso: () => [
    [0, 3],
    [dur('contrapeso'), 8],
  ],
  motor: () => [
    [0, 8],
    [R('motor', 'L4', 'botão'), 12],
    [dur('motor'), 40],
  ],
  arrebenta: () => [
    [0, 40],
    [R('arrebenta', 'L5', 'arrebenta'), 40],
    [R('arrebenta', 'L5', 'segundos'), 0],
    [dur('arrebenta'), 0],
  ],
  cabos: () => [
    [0, 30],
    [dur('cabos'), 40],
  ],
  freio: () => [
    [0, 40],
    [R('freio', 'L7', 'velocidade'), 36],
    [R('freio', 'L7', 'mordem') + 0.3, 33],
    [dur('freio'), 33],
  ],
  molas: () => [
    [0, 1.5],
    [dur('molas') * 0.6, 0],
    [dur('molas'), 0],
  ],
  parabens: () => [
    [0, 40],
    [dur('parabens') * 0.7, 100],
    [dur('parabens'), 100],
  ],
};

const SEM_PAINEL: CenaId[] = ['inventor', 'manda'];
const QUEDA: CenaId[] = ['gancho', 'arrebenta', 'freio'];

export const estadoEm = (id: CenaId, s: number): Estado => {
  const pts = ROTEIRO_ANDAR[id]?.();
  if (!pts) return {andar: 0, vel: 0, painel: false, perigo: false};
  const andarDe = (t: number) =>
    interpolate(
      t,
      pts.map((p) => p[0]),
      pts.map((p) => p[1]),
      {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.quad)},
    );
  const andar = andarDe(s);
  // velocidade em m/s (3 m por andar), pela variação do andar
  const bruta = Math.abs(andarDe(s + 0.05) - andarDe(s - 0.05)) * 3 * 10;
  // o tempo do vídeo é comprimido: mostramos valores realistas
  // (queda livre de ~40 andares chega perto de 30 m/s; elevador normal fica em até 6 m/s)
  const caindo = andarDe(s + 0.05) < andarDe(s - 0.05) && QUEDA.includes(id);
  const vel = caindo ? Math.min(bruta * 0.35, 32) : Math.min(bruta * 0.12, 6);
  return {andar, vel, painel: !SEM_PAINEL.includes(id), perigo: vel > 12};
};

export const cenaNoTempo = (sAbs: number): {id: CenaId; s: number} => {
  const ids: CenaId[] = ['gancho', 'escada', 'manivela', 'contrapeso', 'motor', 'arrebenta', 'cabos', 'freio', 'molas', 'inventor', 'parabens', 'manda'];
  for (const id of ids) {
    const c = cena(id);
    if (sAbs < c.fim) return {id, s: sAbs - c.inicio};
  }
  return {id: 'manda', s: sAbs - cena('manda').inicio};
};

export const ALTURA_ANDAR = 3; // unidades 3D por andar
