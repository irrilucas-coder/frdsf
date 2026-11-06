import falasJson from './falas.json';

export const FPS = 30;

export type Palavra = {texto: string; inicio: number; fim: number};
export type Fala = {id: string; quem: string; duracao: number; palavras: Palavra[]};
export const FALAS = falasJson as Fala[];
const fala = (id: string) => FALAS.find((f) => f.id === id)!;

export type CenaId = 'gancho' | 'drebbel' | 'funcionou' | 'turtle' | 'hunley' | 'holland' | 'nautilus' | 'final';

const ORDEM: {id: CenaId; falas: string[]; antes?: number; depois?: number}[] = [
  {id: 'gancho', falas: ['L0'], antes: 0.35, depois: 0.25},
  {id: 'drebbel', falas: ['L1', 'L2']},
  {id: 'funcionou', falas: ['L3'], depois: 0.5},
  {id: 'turtle', falas: ['L4', 'L5', 'L6'], depois: 0.9},
  {id: 'hunley', falas: ['L7'], depois: 0.8},
  {id: 'holland', falas: ['L8', 'L9']},
  {id: 'nautilus', falas: ['L10'], depois: 0.5},
  {id: 'final', falas: ['L11'], depois: 2.2},
];

const PAUSA_ENTRE_FALAS = 0.2;

export type FalaNoTempo = Fala & {inicio: number}; // inicio em segundos, absoluto
export type CenaNoTempo = {
  id: CenaId;
  inicio: number; // segundos
  fim: number;
  falas: FalaNoTempo[];
};

const montar = () => {
  let t = 0;
  const cenas: CenaNoTempo[] = [];
  for (const c of ORDEM) {
    const inicio = t;
    t += c.antes ?? 0.15;
    const falas: FalaNoTempo[] = [];
    c.falas.forEach((id, i) => {
      if (i > 0) t += PAUSA_ENTRE_FALAS;
      const f = fala(id);
      falas.push({...f, inicio: t});
      t += f.duracao;
    });
    t += c.depois ?? 0.3;
    cenas.push({id: c.id, inicio, fim: t, falas});
  }
  return cenas;
};

export const CENAS = montar();
export const DURACAO_TOTAL = CENAS[CENAS.length - 1].fim;
export const TOTAL_FRAMES = Math.ceil(DURACAO_TOTAL * FPS);
export const TODAS_FALAS = CENAS.flatMap((c) => c.falas);

export const cena = (id: CenaId) => CENAS.find((c) => c.id === id)!;
export const segFrame = (s: number) => Math.round(s * FPS);

// Momento (segundos, relativo ao início da cena) em que uma palavra é dita.
// Útil para sincronizar efeitos com a narração.
export const quandoDiz = (cenaId: CenaId, falaId: string, trecho: string) => {
  const c = cena(cenaId);
  const f = c.falas.find((x) => x.id === falaId)!;
  const p = f.palavras.find((w) => w.texto.toLowerCase().includes(trecho.toLowerCase()));
  return f.inicio - c.inicio + (p ? p.inicio : 0);
};
export const inicioFala = (cenaId: CenaId, falaId: string) => {
  const c = cena(cenaId);
  return c.falas.find((x) => x.id === falaId)!.inicio - c.inicio;
};
export const fimFala = (cenaId: CenaId, falaId: string) => {
  const c = cena(cenaId);
  const f = c.falas.find((x) => x.id === falaId)!;
  return f.inicio - c.inicio + f.duracao;
};
export const duracaoCena = (id: CenaId) => cena(id).fim - cena(id).inicio;

export const COR_PERSONAGEM: Record<string, string> = {
  narrador: '#ffffff',
  drebbel: '#ffb347',
  ezra: '#7ee081',
  holland: '#7ec8ff',
};
export const NOME_PERSONAGEM: Record<string, string> = {
  drebbel: 'DREBBEL',
  ezra: 'EZRA',
  holland: 'HOLLAND',
};
