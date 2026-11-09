import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {FONTE} from '../submarino/Overlay';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const CONTORNO = (px: number) =>
  Array.from({length: 16}, (_, i) => {
    const a = (i / 16) * Math.PI * 2;
    return `${(Math.cos(a) * px).toFixed(1)}px ${(Math.sin(a) * px).toFixed(1)}px 0 #000`;
  }).join(', ') + `, 0 ${px + 4}px 0 #000`;

// Uma palavra-chave grande no meio da tela (substitui a legenda corrida)
export const PalavraChave = ({inicio, dur, texto, cor = '#ffffff', topo = '60%', tamanho = 118, rot = -3}: {inicio: number; dur: number; texto: string; cor?: string; topo?: string; tamanho?: number; rot?: number}) => {
  const {fps} = useVideoConfig();
  const s = useCurrentFrame() / fps - inicio;
  if (s < 0 || s > dur) return null;
  const entra = interpolate(s, [0, 0.22], [0, 1], {...clamp, easing: Easing.out(Easing.back(2.6))});
  const sai = interpolate(s, [dur - 0.15, dur], [1, 0], clamp);
  const k = entra * sai;
  const balanco = Math.sin(s * 5) * 1.5;
  return (
    <AbsoluteFill style={{alignItems: 'center', top: topo, pointerEvents: 'none'}}>
      <div style={{fontFamily: FONTE, fontSize: tamanho, color: cor, textShadow: CONTORNO(7), scale: k, rotate: `${rot + balanco}deg`, letterSpacing: 1, whiteSpace: 'nowrap', translate: '0 -50%'}}>{texto}</div>
    </AbsoluteFill>
  );
};

// Cortes dinâmicos: em cada corte a imagem entra com zoom + desfoque de movimento (chicote)
export const Cortes = ({momentos, children, forca = 1}: {momentos: number[]; children: React.ReactNode; forca?: number}) => {
  const {fps} = useVideoConfig();
  const s = useCurrentFrame() / fps;
  let d = 99;
  let idx = 0;
  momentos.forEach((m, i) => {
    if (s >= m && s - m < d) {
      d = s - m;
      idx = i;
    }
  });
  const k = interpolate(d, [0, 0.2], [1, 0], {...clamp, easing: Easing.out(Easing.cubic)});
  const lado = idx % 2 ? -1 : 1;
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <AbsoluteFill style={{scale: 1 + k * 0.18 * forca, translate: `${lado * k * 120 * forca}px 0`, filter: k > 0.02 ? `blur(${k * 14 * forca}px)` : undefined}}>{children}</AbsoluteFill>
      {k > 0.5 && <AbsoluteFill style={{background: '#fff', opacity: (k - 0.5) * 0.5}} />}
    </AbsoluteFill>
  );
};

// Câmera lenta: converte o tempo real da cena em tempo "de animação" (trechos com fator < 1 ficam lentos)
export const rampa = (s: number, trechos: [number, number, number][]) => {
  // trechos: [inicio, fim, fator]
  let t = 0;
  let ultimo = 0;
  for (const [a, b, f] of trechos) {
    if (s <= a) break;
    t += a - ultimo;
    const ate = Math.min(s, b);
    t += (ate - a) * f;
    ultimo = b;
    if (s <= b) return t;
  }
  return t + Math.max(0, s - ultimo);
};

// Painel de valores (estilo HUD)
export const Hud = ({itens, topo = 70}: {itens: {rotulo: string; valor: string; unidade?: string; perigo?: boolean}[]; topo?: number}) => (
  <AbsoluteFill style={{flexDirection: 'row', justifyContent: 'space-between', padding: `${topo}px 50px 0`, alignItems: 'flex-start', pointerEvents: 'none'}}>
    {itens.map((x, i) => (
      <div key={i} style={{background: x.perigo ? 'rgba(200,20,20,0.92)' : 'rgba(16,40,90,0.88)', border: `4px solid ${x.perigo ? '#ffb3ad' : '#9fd3ff'}`, borderRadius: 16, padding: '6px 20px', textAlign: 'center', minWidth: 170, boxShadow: '0 6px 0 rgba(0,0,0,0.35)'}}>
        <div style={{fontFamily: FONTE, fontSize: 22, color: '#cfe8ff', letterSpacing: 2}}>{x.rotulo}</div>
        <div style={{fontFamily: FONTE, fontSize: 58, color: '#fff', lineHeight: 1}}>{x.valor}</div>
        {x.unidade && <div style={{fontFamily: FONTE, fontSize: 20, color: '#cfe8ff'}}>{x.unidade}</div>}
      </div>
    ))}
  </AbsoluteFill>
);

// Etiqueta pequena presa a um objeto (ex.: "ÁCIDO", "GOMA")
export const Etiqueta = ({inicio, dur, texto, x, y, cor = '#ffffff', fundo = '#e10600'}: {inicio: number; dur: number; texto: string; x: string; y: string; cor?: string; fundo?: string}) => {
  const {fps} = useVideoConfig();
  const s = useCurrentFrame() / fps - inicio;
  if (s < 0 || s > dur) return null;
  const k = interpolate(s, [0, 0.2], [0, 1], {...clamp, easing: Easing.out(Easing.back(2))}) * interpolate(s, [dur - 0.12, dur], [1, 0], clamp);
  return (
    <div style={{position: 'absolute', left: x, top: y, translate: '-50% -50%', scale: k, fontFamily: FONTE, fontSize: 58, color: cor, background: fundo, border: '5px solid #000', borderRadius: 40, padding: '4px 20px', boxShadow: '0 5px 0 rgba(0,0,0,0.4)'}}>
      {texto}
    </div>
  );
};

// Fechamento: "JÁ SABIA? COMENTA X / NÃO SABIA? COMENTA Y"
export const ComentaFinal = ({inicio, dur, sim, nao}: {inicio: number; dur: number; sim: string; nao: string}) => {
  const {fps} = useVideoConfig();
  const s = useCurrentFrame() / fps - inicio;
  if (s < 0 || s > dur) return null;
  const k1 = interpolate(s, [0, 0.25], [0, 1], {...clamp, easing: Easing.out(Easing.back(2))});
  const k2 = interpolate(s, [0.35, 0.6], [0, 1], {...clamp, easing: Easing.out(Easing.back(2))});
  const linha = (a: string, b: string, k: number, rot: number) => (
    <div style={{scale: k, rotate: `${rot}deg`, textAlign: 'center', marginBottom: 18}}>
      <div style={{fontFamily: FONTE, fontSize: 66, color: '#fff', textShadow: CONTORNO(6)}}>{a}</div>
      <div style={{fontFamily: FONTE, fontSize: 124, color: '#ffd23f', textShadow: CONTORNO(8), lineHeight: 1}}>“{b}”</div>
    </div>
  );
  return (
    <AbsoluteFill style={{alignItems: 'center', paddingTop: 230}}>
      {linha('JÁ SABIA? COMENTA', sim, k1, -2)}
      {linha('NÃO SABIA? COMENTA', nao, k2, 2)}
    </AbsoluteFill>
  );
};

// Ícone de avançar (⏩) indicando passagem de tempo
export const Avanca = ({inicio, dur}: {inicio: number; dur: number}) => {
  const {fps} = useVideoConfig();
  const s = useCurrentFrame() / fps - inicio;
  if (s < 0 || s > dur) return null;
  const k = interpolate(s, [0, 0.15, dur - 0.15, dur], [0, 1, 1, 0], clamp);
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
      <div style={{fontSize: 200, opacity: k, scale: 0.8 + k * 0.2, filter: 'drop-shadow(0 8px 0 rgba(0,0,0,0.5))', color: '#fff'}}>⏩</div>
    </AbsoluteFill>
  );
};
