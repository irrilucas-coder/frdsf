import {staticFile} from 'remotion';

// Biblioteca de efeitos (public/sfx), montada por scripts/biblioteca-sfx.py com fontes gratuitas CC0
// (Kenney.nl, OpenGameArt e uisfx). Cada categoria tem algumas versões; use `sfx(categoria, n)`
// variando n para o som não ficar repetitivo.
export const SFX_VERSOES = {
  whoosh: 4,
  pop: 4,
  impacto: 3,
  explosao: 3,
  erro: 3,
  acerto: 3,
  conquista: 3,
  agua: 3,
  bolhas: 3,
  alarme: 3,
  sonar: 3,
  mecanico: 3,
  motor: 3,
  tique: 3,
  tensao: 3,
  subida: 3,
  // gravações reais (CC0, Wikimedia Commons)
  aplausos: 1,
  rufar: 1,
  grito: 1,
} as const;

export type CategoriaSfx = keyof typeof SFX_VERSOES;

// n pode ser qualquer número: ele dá a volta nas versões disponíveis (0 -> 1.mp3, 1 -> 2.mp3, ...)
export const sfx = (categoria: CategoriaSfx, n = 0) =>
  staticFile(`sfx/${categoria}/${(Math.abs(n) % SFX_VERSOES[categoria]) + 1}.mp3`);

// Volume recomendado para efeitos ficarem abaixo da narração
export const VOLUME_SFX = 0.45;
