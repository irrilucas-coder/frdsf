import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {FONTE} from '../submarino/Overlay';
import {cenaNoTempo, estadoEm} from './estado';
import {FPS} from './roteiro';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const useJanela = (inicio: number, dur: number) => {
  const s = useCurrentFrame() / FPS - inicio;
  const entra = interpolate(s, [0, 0.25], [0, 1], {...clamp, easing: Easing.out(Easing.back(2))});
  const sai = interpolate(s, [dur - 0.2, dur], [1, 0], clamp);
  return {visivel: s >= 0 && s <= dur, k: entra * sai, s};
};

// Painel ao vivo: ANDAR e VELOCIDADE (fica vermelho no perigo)
export const Painel = () => {
  const frame = useCurrentFrame();
  const {id, s} = cenaNoTempo(frame / FPS);
  const e = estadoEm(id, s);
  if (!e.painel) return null;
  const caixa = (rotulo: string, valor: string, unidade: string, perigo: boolean, lado: 'esq' | 'dir') => (
    <div
      style={{
        position: 'absolute',
        top: 70,
        [lado === 'esq' ? 'left' : 'right']: 60,
        background: perigo ? 'rgba(160,10,10,0.92)' : 'rgba(10,20,40,0.82)',
        border: `5px solid ${perigo ? '#ff5a4f' : lado === 'esq' ? '#3ddc84' : '#ffcc00'}`,
        borderRadius: 18,
        padding: '8px 22px',
        textAlign: 'center',
        minWidth: 190,
        scale: perigo ? 1.15 : 1,
        transformOrigin: lado === 'esq' ? 'left top' : 'right top',
      }}
    >
      <div style={{fontFamily: FONTE, fontSize: 24, color: '#ddd', letterSpacing: 2}}>{rotulo}</div>
      <div style={{fontFamily: FONTE, fontSize: 62, color: perigo ? '#fff' : lado === 'esq' ? '#3ddc84' : '#ffcc00', lineHeight: 1}}>{valor}</div>
      <div style={{fontFamily: FONTE, fontSize: 22, color: '#ddd'}}>{unidade}</div>
    </div>
  );
  return (
    <AbsoluteFill>
      {caixa('ANDAR', String(Math.round(e.andar)), 'de 100', false, 'esq')}
      {caixa('VELOCIDADE', e.vel.toFixed(e.vel < 10 ? 1 : 0).replace('.', ','), 'm/s', e.perigo, 'dir')}
    </AbsoluteFill>
  );
};

// Etiqueta em pílula (verde = bom, vermelho = ruim, amarelo = nome da peça)
const CORES = {verde: ['#1faa59', '#fff'], vermelho: ['#e10600', '#fff'], amarelo: ['#ffcc00', '#1a1a1a']} as const;
export const Pilula = ({inicio, dur, texto, cor = 'amarelo', topo = 330, rot = -3}: {inicio: number; dur: number; texto: string; cor?: keyof typeof CORES; topo?: number; rot?: number}) => {
  const {visivel, k} = useJanela(inicio, dur);
  if (!visivel) return null;
  const [fundo, letra] = CORES[cor];
  return (
    <AbsoluteFill style={{alignItems: 'center', top: topo}}>
      <div
        style={{
          scale: k,
          rotate: `${rot}deg`,
          fontFamily: FONTE,
          fontSize: 58,
          color: letra,
          background: fundo,
          padding: '10px 34px',
          borderRadius: 60,
          border: '5px solid rgba(0,0,0,0.85)',
          boxShadow: '0 8px 0 rgba(0,0,0,0.45)',
          letterSpacing: 1,
        }}
      >
        {texto}
      </div>
    </AbsoluteFill>
  );
};

// Ícone de rebobinar ⏪
export const Rebobina = ({inicio, dur = 0.8}: {inicio: number; dur?: number}) => {
  const {visivel, k, s} = useJanela(inicio, dur);
  if (!visivel) return null;
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
      <div style={{scale: k * (1 + Math.sin(s * 20) * 0.04), fontSize: 220, color: '#fff', filter: 'drop-shadow(0 8px 0 rgba(0,0,0,0.5))'}}>⏪</div>
      <AbsoluteFill style={{background: `rgba(255,255,255,${(1 - k) * 0 + 0.12})`}} />
    </AbsoluteFill>
  );
};

// Pergunta-gancho no topo, palavra-chave em amarelo
export const Pergunta = ({dur, linhas = [['POR QUE O ELEVADOR'], ['NÃO DESPENCA', true], ['SE O CABO ARREBENTAR?']]}: {dur: number; linhas?: [string, boolean?][]}) => {
  const {visivel, k} = useJanela(-0.4, dur + 0.4);
  if (!visivel) return null;
  const cont = '0 5px 0 #000, 4px 0 #000, -4px 0 #000, 0 -4px #000, 3px 3px #000, -3px 3px #000, 3px -3px #000, -3px -3px #000';
  return (
    <AbsoluteFill style={{alignItems: 'center', top: 250}}>
      <div style={{opacity: k, textAlign: 'center', fontFamily: FONTE, fontSize: 84, lineHeight: 1.05, color: '#fff', textShadow: cont, maxWidth: 920}}>
        {linhas.map(([t, amarelo], i) => (
          <div key={i} style={{color: amarelo ? '#ffcc00' : '#fff'}}>
            {t}
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

// Botão "MANDA PRA ELE"
export const Manda = ({inicio, dur, texto = '📲 MANDA PRA ELE'}: {inicio: number; dur: number; texto?: string}) => {
  const {visivel, k, s} = useJanela(inicio, dur);
  if (!visivel) return null;
  return (
    <AbsoluteFill style={{alignItems: 'center', top: 300}}>
      <div
        style={{
          scale: k * (1 + Math.sin(s * 8) * 0.04),
          fontFamily: FONTE,
          fontSize: 86,
          color: '#fff',
          background: 'linear-gradient(180deg, #25d366, #128c4a)',
          border: '8px solid #111',
          borderRadius: 40,
          padding: '16px 46px',
          boxShadow: '0 12px 0 #111',
        }}
      >
        {texto}
      </div>
    </AbsoluteFill>
  );
};

// Painel genérico com duas caixas (outros vídeos)
export const Painel2 = ({a, b}: {a: {rotulo: string; valor: string; unidade: string; perigo?: boolean}; b: {rotulo: string; valor: string; unidade: string; perigo?: boolean}}) => {
  const caixa = (x: typeof a, lado: 'esq' | 'dir') => (
    <div
      style={{
        position: 'absolute',
        top: 70,
        [lado === 'esq' ? 'left' : 'right']: 60,
        background: x.perigo ? 'rgba(160,10,10,0.92)' : 'rgba(10,20,40,0.82)',
        border: `5px solid ${x.perigo ? '#ff5a4f' : lado === 'esq' ? '#3ddc84' : '#ffcc00'}`,
        borderRadius: 18,
        padding: '8px 22px',
        textAlign: 'center',
        minWidth: 190,
        scale: x.perigo ? 1.15 : 1,
        transformOrigin: lado === 'esq' ? 'left top' : 'right top',
      }}
    >
      <div style={{fontFamily: FONTE, fontSize: 24, color: '#ddd', letterSpacing: 2}}>{x.rotulo}</div>
      <div style={{fontFamily: FONTE, fontSize: 62, color: x.perigo ? '#fff' : lado === 'esq' ? '#3ddc84' : '#ffcc00', lineHeight: 1}}>{x.valor}</div>
      <div style={{fontFamily: FONTE, fontSize: 22, color: '#ddd'}}>{x.unidade}</div>
    </div>
  );
  return (
    <AbsoluteFill>
      {caixa(a, 'esq')}
      {caixa(b, 'dir')}
    </AbsoluteFill>
  );
};
