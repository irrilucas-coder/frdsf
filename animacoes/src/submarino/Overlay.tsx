import '@fontsource/lilita-one/400.css';
import '@fontsource/nunito/900.css';
import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {COR_PERSONAGEM, FPS, NOME_PERSONAGEM, TODAS_FALAS, type FalaNoTempo, type Palavra} from './roteiro';

export const FONTE = '"Lilita One", "Nunito", Arial, sans-serif';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// Contorno grosso estilo jogo
const contorno = (px: number, cor = '#000') =>
  [
    `${px}px 0 ${cor}`,
    `-${px}px 0 ${cor}`,
    `0 ${px}px ${cor}`,
    `0 -${px}px ${cor}`,
    `${px * 0.7}px ${px * 0.7}px ${cor}`,
    `-${px * 0.7}px ${px * 0.7}px ${cor}`,
    `${px * 0.7}px -${px * 0.7}px ${cor}`,
    `-${px * 0.7}px -${px * 0.7}px ${cor}`,
    `0 ${px * 2}px 0 rgba(0,0,0,0.35)`,
  ].join(',');

// Palavras que ganham destaque (cor diferente)
const DESTAQUES = /^(1620|1776|1864|1900|1954|1958|propósito|horas|Turtle|bomba|FALHOU|Hunley|navio|afundou|gasolina|baterias|elétricas|comprou|volta|nuclear|Polo|Norte|Comenta|couro|manivela|academia|janela|Drebbel|Holland|Nautilus|submarino)/i;

// ---------- Legendas palavra por palavra ----------
type Pagina = {palavras: Palavra[]; inicio: number; fim: number};

const paginar = (f: FalaNoTempo): Pagina[] => {
  const paginas: Pagina[] = [];
  let atual: Palavra[] = [];
  f.palavras.forEach((p, i) => {
    atual.push(p);
    const quebra = /[,.!?…:]$/.test(p.texto) || atual.length >= 3 || i === f.palavras.length - 1;
    if (quebra) {
      paginas.push({palavras: atual, inicio: f.inicio + atual[0].inicio, fim: f.inicio + p.fim});
      atual = [];
    }
  });
  // cada página fica até a próxima começar (sem buraco piscando)
  return paginas.map((pg, i) => ({...pg, fim: i + 1 < paginas.length ? paginas[i + 1].inicio : pg.fim + 0.25}));
};

const PAGINAS = TODAS_FALAS.map((f) => ({fala: f, paginas: paginar(f)}));

// Outros vídeos reaproveitam as legendas passando as próprias falas, destaques e cores.
type OpcoesLegenda = {
  falas?: FalaNoTempo[];
  destaques?: RegExp;
  cores?: Record<string, string>;
  nomes?: Record<string, string>;
  corFalando?: string;
  corDestaque?: string;
  topo?: string;
  tamanho?: number;
};
const cachePaginas = new WeakMap<FalaNoTempo[], {fala: FalaNoTempo; paginas: Pagina[]}[]>();

export const Legendas = ({
  falas,
  destaques = DESTAQUES,
  cores = COR_PERSONAGEM,
  nomes = NOME_PERSONAGEM,
  corFalando = '#ffe14d',
  corDestaque = '#5ef2ff',
  topo = '58%',
  tamanho = 100,
}: OpcoesLegenda = {}) => {
  let PAGINAS_USADAS = PAGINAS;
  if (falas) {
    if (!cachePaginas.has(falas)) cachePaginas.set(falas, falas.map((f) => ({fala: f, paginas: paginar(f)})));
    PAGINAS_USADAS = cachePaginas.get(falas)!;
  }
  const frame = useCurrentFrame();
  const s = frame / FPS;
  const {width} = useVideoConfig();
  let ativa: {fala: FalaNoTempo; pagina: Pagina} | null = null;
  for (const {fala, paginas} of PAGINAS_USADAS) {
    for (const pg of paginas) if (s >= pg.inicio && s < pg.fim) ativa = {fala, pagina: pg};
  }
  if (!ativa) return null;
  const {fala, pagina} = ativa;
  const entra = interpolate(s, [pagina.inicio, pagina.inicio + 0.12], [0.7, 1], {...clamp, easing: Easing.out(Easing.back(2.5))});
  const corBase = cores[fala.quem] ?? '#fff';
  const nome = nomes[fala.quem];
  return (
    <AbsoluteFill style={{justifyContent: 'flex-start', alignItems: 'center', top: topo}}>
      {nome && (
        <div
          style={{
            fontFamily: FONTE,
            fontSize: 44,
            color: '#111',
            background: corBase,
            padding: '6px 26px',
            borderRadius: 18,
            border: '5px solid #111',
            marginBottom: 18,
            rotate: '-3deg',
          }}
        >
          {nome}
        </div>
      )}
      <div
        style={{
          scale: entra,
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: '0 34px',
          maxWidth: width - 160,
          fontFamily: FONTE,
          fontSize: tamanho,
          lineHeight: 1.08,
          textAlign: 'center',
          textTransform: 'uppercase',
        }}
      >
        {pagina.palavras.map((p, i) => {
          const ini = fala.inicio + p.inicio;
          const falando = s >= ini && s < fala.inicio + p.fim + 0.05;
          const dita = s >= ini;
          const pop = falando ? interpolate(s, [ini, ini + 0.08, ini + 0.18], [1, 1.12, 1.05], clamp) : 1;
          const destaque = destaques.test(p.texto.replace(/[^\wÀ-ú]/g, ''));
          const cor = falando ? corFalando : destaque && dita ? corDestaque : corBase;
          return (
            <span
              key={i}
              style={{
                color: cor,
                opacity: dita ? 1 : 0.55,
                scale: pop,
                margin: falando ? '0 8px' : 0,
                display: 'inline-block',
                textShadow: contorno(7),
              }}
            >
              {p.texto}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ---------- Elementos que "pulam" na tela ----------
const usePop = (inicio: number, dur: number) => {
  const frame = useCurrentFrame();
  const s = frame / FPS - inicio;
  const entra = interpolate(s, [0, 0.25], [0, 1], {...clamp, easing: Easing.out(Easing.back(2.2))});
  const sai = interpolate(s, [dur - 0.2, dur], [1, 0], clamp);
  return {visivel: s >= 0 && s <= dur, k: entra * sai, s};
};

export const Selo = ({
  inicio,
  dur,
  texto,
  sub,
  cor = '#ffcc00',
  topo = 220,
  rot = -4,
  tamanho = 120,
}: {
  inicio: number;
  dur: number;
  texto: string;
  sub?: string;
  cor?: string;
  topo?: number;
  rot?: number;
  tamanho?: number;
}) => {
  const {visivel, k} = usePop(inicio, dur);
  if (!visivel) return null;
  return (
    <AbsoluteFill style={{alignItems: 'center', top: topo}}>
      <div style={{scale: k, rotate: `${rot}deg`, textAlign: 'center'}}>
        <div
          style={{
            fontFamily: FONTE,
            fontSize: tamanho,
            color: cor,
            textShadow: contorno(8),
            lineHeight: 1,
          }}
        >
          {texto}
        </div>
        {sub && (
          <div
            style={{
              display: 'inline-block',
              marginTop: 14,
              fontFamily: FONTE,
              fontSize: 50,
              color: '#111',
              background: '#fff',
              border: '5px solid #111',
              borderRadius: 16,
              padding: '4px 22px',
            }}
          >
            {sub}
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};

export const Emoji = ({inicio, dur, emoji, x, y, tam = 170}: {inicio: number; dur: number; emoji: string; x: number; y: number; tam?: number}) => {
  const {visivel, k, s} = usePop(inicio, dur);
  if (!visivel) return null;
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        fontSize: tam,
        scale: k,
        rotate: `${Math.sin(s * 6) * 10}deg`,
        filter: 'drop-shadow(0 8px 0 rgba(0,0,0,0.35))',
      }}
    >
      {emoji}
    </div>
  );
};

// Barra de energia do Ezra
export const BarraEnergia = ({inicio, dur}: {inicio: number; dur: number}) => {
  const {visivel, k, s} = usePop(inicio, dur);
  if (!visivel) return null;
  const vida = interpolate(s, [0.2, dur - 0.3], [1, 0.08], clamp);
  const cor = vida > 0.5 ? '#4cd964' : vida > 0.25 ? '#ffcc00' : '#ff3b30';
  return (
    <AbsoluteFill style={{alignItems: 'center', top: 300}}>
      <div style={{scale: k, display: 'flex', alignItems: 'center', gap: 18}}>
        <span style={{fontSize: 80}}>💪</span>
        <div style={{width: 600, height: 64, background: '#222', border: '7px solid #111', borderRadius: 18, overflow: 'hidden'}}>
          <div style={{width: `${vida * 100}%`, height: '100%', background: cor}} />
        </div>
      </div>
    </AbsoluteFill>
  );
};

// Cronômetro subindo rápido
export const Cronometro = ({inicio, dur}: {inicio: number; dur: number}) => {
  const {visivel, k, s} = usePop(inicio, dur);
  if (!visivel) return null;
  const minutos = Math.floor(interpolate(s, [0.2, dur - 0.4], [0, 180], clamp));
  const h = Math.floor(minutos / 60);
  const m = minutos % 60;
  return (
    <AbsoluteFill style={{alignItems: 'center', top: 230}}>
      <div
        style={{
          scale: k,
          fontFamily: FONTE,
          fontSize: 110,
          color: '#fff',
          background: 'rgba(0,0,0,0.55)',
          border: '7px solid #fff',
          borderRadius: 30,
          padding: '10px 40px',
          textShadow: contorno(5),
        }}
      >
        ⏱ {h}h {String(m).padStart(2, '0')}min
      </div>
    </AbsoluteFill>
  );
};

// Linha do tempo com os anos (final)
export const AnosLinhaDoTempo = ({inicio, dur}: {inicio: number; dur: number}) => {
  const {visivel, k} = usePop(inicio, dur);
  if (!visivel) return null;
  const anos = ['1620', '1776', '1864', '1900', '1954'];
  return (
    <AbsoluteFill style={{alignItems: 'center', top: 240}}>
      <div style={{scale: k, display: 'flex', gap: 14}}>
        {anos.map((a, i) => (
          <div
            key={a}
            style={{
              fontFamily: FONTE,
              fontSize: 54,
              color: '#111',
              background: ['#e63946', '#f4a261', '#2a9d8f', '#7ec8ff', '#ffd23f'][i],
              border: '5px solid #111',
              borderRadius: 16,
              padding: '6px 14px',
            }}
          >
            {a}
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

// Botão "comenta" pulsando
export const Comenta = ({inicio, dur}: {inicio: number; dur: number}) => {
  const {visivel, k, s} = usePop(inicio, dur);
  if (!visivel) return null;
  const pulsa = 1 + Math.sin(s * 8) * 0.04;
  return (
    <AbsoluteFill style={{alignItems: 'center', top: 420}}>
      <div
        style={{
          scale: k * pulsa,
          fontFamily: FONTE,
          fontSize: 92,
          color: '#fff',
          background: 'linear-gradient(180deg, #ff4d6d, #c9184a)',
          border: '8px solid #111',
          borderRadius: 40,
          padding: '18px 50px',
          textShadow: contorno(5),
          boxShadow: '0 12px 0 #111',
        }}
      >
        💬 COMENTA AÍ!
      </div>
    </AbsoluteFill>
  );
};

// Escurece a tela aos poucos (momento triste)
export const Escurecer = ({inicio, fim, max = 0.6}: {inicio: number; fim: number; max?: number}) => {
  const frame = useCurrentFrame();
  const s = frame / FPS;
  const o = interpolate(s, [inicio, fim], [0, max], clamp) * interpolate(s, [fim, fim + 0.3], [1, 0], clamp);
  if (o <= 0) return null;
  return <AbsoluteFill style={{background: `radial-gradient(circle, rgba(0,0,0,${o * 0.5}) 30%, rgba(0,0,0,${o}) 100%)`}} />;
};

// Clarão branco entre cenas
export const Clarao = ({momentos}: {momentos: number[]}) => {
  const frame = useCurrentFrame();
  const s = frame / FPS;
  let o = 0;
  for (const m of momentos) o = Math.max(o, interpolate(s, [m - 0.04, m, m + 0.18], [0, 0.85, 0], clamp));
  if (o <= 0) return null;
  return <AbsoluteFill style={{background: `rgba(255,255,255,${o})`}} />;
};

// Barra de progresso no topo (segura a atenção até o fim)
export const Progresso = ({total}: {total: number}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', top: 0, left: 0, height: 14, width: `${(frame / total) * 100}%`, background: '#ffe14d', boxShadow: '0 0 12px #ffe14d'}} />
    </AbsoluteFill>
  );
};

// Envolve a cena com zoom-soco e tremida de câmera
export const Impacto = ({
  children,
  zooms,
  tremidas,
}: {
  children: React.ReactNode;
  zooms: number[];
  tremidas: {inicio: number; dur: number; forca?: number}[];
}) => {
  const frame = useCurrentFrame();
  const s = frame / FPS;
  let z = 1;
  for (const m of zooms) z = Math.max(z, interpolate(s, [m, m + 0.08, m + 0.45], [1, 1.12, 1], clamp));
  let dx = 0;
  let dy = 0;
  for (const t of tremidas) {
    if (s >= t.inicio && s <= t.inicio + t.dur) {
      const f = (t.forca ?? 18) * (1 - (s - t.inicio) / t.dur);
      dx += Math.sin(frame * 2.1) * f;
      dy += Math.cos(frame * 2.7) * f;
    }
  }
  return <AbsoluteFill style={{scale: z, translate: `${dx}px ${dy}px`}}>{children}</AbsoluteFill>;
};
