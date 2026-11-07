import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {FONTE} from '../submarino/Overlay';
import {FPS} from './roteiro';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

const useJanela = (inicio: number, dur: number) => {
  const s = useCurrentFrame() / FPS - inicio;
  const entra = interpolate(s, [0, 0.35], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  const sai = interpolate(s, [dur - 0.3, dur], [1, 0], clamp);
  return {visivel: s >= 0 && s <= dur, k: entra * sai, s};
};

// Selo fixo de que é uma recriação (honestidade com quem assiste)
export const Recriacao = () => (
  <div
    style={{
      position: 'absolute',
      top: 40,
      right: 40,
      fontFamily: FONTE,
      fontSize: 30,
      letterSpacing: 2,
      color: '#fff',
      background: 'rgba(0,0,0,0.55)',
      border: '2px solid rgba(255,255,255,0.6)',
      borderRadius: 10,
      padding: '6px 14px',
    }}
  >
    RECRIAÇÃO ANIMADA
  </div>
);

// Tarja de telejornal: faixa vermelha + texto
export const Tarja = ({inicio, dur, titulo, sub, topo = 250}: {inicio: number; dur: number; titulo: string; sub?: string; topo?: number}) => {
  const {visivel, k} = useJanela(inicio, dur);
  if (!visivel) return null;
  return (
    <div style={{position: 'absolute', left: 60, top: topo, translate: `${(1 - k) * -120}px 0px`, opacity: k}}>
      <div style={{display: 'flex', alignItems: 'stretch'}}>
        <div style={{width: 16, background: '#e10600'}} />
        <div style={{background: 'rgba(8,10,18,0.88)', padding: '14px 26px'}}>
          <div style={{fontFamily: FONTE, fontSize: 64, color: '#fff', lineHeight: 1}}>{titulo}</div>
          {sub && <div style={{fontFamily: FONTE, fontSize: 36, color: '#ffcc00', marginTop: 8, letterSpacing: 1}}>{sub}</div>}
        </div>
      </div>
    </div>
  );
};

// Data/hora/local estilo câmera de vigilância
export const Carimbo = ({inicio, dur, texto}: {inicio: number; dur: number; texto: string}) => {
  const {visivel, k, s} = useJanela(inicio, dur);
  if (!visivel) return null;
  const pisca = Math.floor(s * 2) % 2 === 0;
  return (
    <div style={{position: 'absolute', left: 60, top: 140, opacity: k, fontFamily: 'monospace', fontWeight: 700, fontSize: 40, color: '#fff', textShadow: '0 0 8px #000'}}>
      <span style={{color: '#ff3b30', opacity: pisca ? 1 : 0.2}}>● </span>
      {texto}
    </div>
  );
};

// Faixa "URGENTE" do gancho
export const Urgente = ({inicio, dur, selo = 'URGENTE', linhas = ['MADURO É', 'CAPTURADO']}: {inicio: number; dur: number; selo?: string; linhas?: string[]}) => {
  const {visivel, k, s} = useJanela(inicio, dur);
  if (!visivel) return null;
  return (
    <AbsoluteFill style={{alignItems: 'center', top: 300}}>
      <div style={{scale: 0.9 + k * 0.1, opacity: k, textAlign: 'center'}}>
        <div
          style={{
            display: 'inline-block',
            fontFamily: FONTE,
            fontSize: 60,
            color: '#fff',
            background: '#e10600',
            padding: '6px 26px',
            letterSpacing: 4,
            opacity: Math.floor(s * 3) % 2 === 0 ? 1 : 0.85,
          }}
        >
          {selo}
        </div>
        <div style={{fontFamily: FONTE, fontSize: 92, color: '#fff', marginTop: 16, lineHeight: 1.05, textShadow: '0 6px 20px #000'}}>
          {linhas.map((l, i) => (
            <div key={i}>{l}</div>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// Número que sobe rápido (recompensa)
export const Contador = ({inicio, dur, ate, prefixo = '', sufixo = '', topo = 300, rotulo = 'RECOMPENSA'}: {inicio: number; dur: number; ate: number; prefixo?: string; sufixo?: string; topo?: number; rotulo?: string}) => {
  const {visivel, k, s} = useJanela(inicio, dur);
  if (!visivel) return null;
  const v = Math.round(interpolate(s, [0.1, 1.2], [0, ate], {...clamp, easing: Easing.out(Easing.cubic)}));
  return (
    <AbsoluteFill style={{alignItems: 'center', top: topo}}>
      <div style={{opacity: k, textAlign: 'center'}}>
        <div style={{fontFamily: FONTE, fontSize: 40, color: '#fff', letterSpacing: 6, background: '#e10600', padding: '4px 18px', display: 'inline-block'}}>{rotulo}</div>
        <div style={{fontFamily: FONTE, fontSize: 150, color: '#ffcc00', lineHeight: 1, marginTop: 10, textShadow: '0 8px 0 #000, 0 0 30px rgba(255,204,0,0.5)'}}>
          {prefixo}
          {v}
          {sufixo}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// Citação com atribuição
export const Citacao = ({inicio, dur, texto, autor, topo = 260}: {inicio: number; dur: number; texto: string; autor: string; topo?: number}) => {
  const {visivel, k} = useJanela(inicio, dur);
  if (!visivel) return null;
  return (
    <AbsoluteFill style={{alignItems: 'center', top: topo}}>
      <div style={{opacity: k, scale: 0.94 + k * 0.06, maxWidth: 900, background: 'rgba(8,10,18,0.85)', borderLeft: '12px solid #ffcc00', padding: '26px 34px'}}>
        <div style={{fontFamily: FONTE, fontSize: 58, color: '#fff', lineHeight: 1.1}}>“{texto}”</div>
        <div style={{fontFamily: FONTE, fontSize: 34, color: '#ffcc00', marginTop: 14}}>— {autor}</div>
      </div>
    </AbsoluteFill>
  );
};

// Placar de números (mortes, aeronaves etc.)
export const Numero = ({inicio, dur, valor, rotulo, cor = '#fff', topo = 260, esquerda}: {inicio: number; dur: number; valor: string; rotulo: string; cor?: string; topo?: number; esquerda?: number}) => {
  const {visivel, k} = useJanela(inicio, dur);
  if (!visivel) return null;
  return (
    <div style={{position: 'absolute', top: topo, left: esquerda ?? 0, right: esquerda === undefined ? 0 : undefined, textAlign: 'center', opacity: k, scale: 0.8 + k * 0.2}}>
      <div style={{fontFamily: FONTE, fontSize: 130, color: cor, lineHeight: 1, textShadow: '0 8px 0 #000'}}>{valor}</div>
      <div style={{fontFamily: FONTE, fontSize: 38, color: '#fff', background: 'rgba(0,0,0,0.6)', display: 'inline-block', padding: '4px 16px', marginTop: 6}}>{rotulo}</div>
    </div>
  );
};

// Celular com a notícia (sem imitar a interface de nenhuma rede real)
export const Celular = ({inicio, dur}: {inicio: number; dur: number}) => {
  const {visivel, k, s} = useJanela(inicio, dur);
  if (!visivel) return null;
  const sobe = interpolate(s, [0, 0.5], [300, 0], {...clamp, easing: Easing.out(Easing.back(1.4))});
  return (
    <AbsoluteFill style={{alignItems: 'center', top: 230}}>
      <div style={{translate: `0px ${sobe}px`, opacity: k, width: 560, height: 820, background: '#111', borderRadius: 60, padding: 22, boxShadow: '0 30px 60px rgba(0,0,0,0.6)'}}>
        <div style={{width: '100%', height: '100%', background: '#f4f4f6', borderRadius: 42, padding: 30, boxSizing: 'border-box'}}>
          <div style={{fontFamily: FONTE, fontSize: 34, color: '#999'}}>3 jan. 2026 · manhã</div>
          <div style={{display: 'flex', alignItems: 'center', gap: 16, marginTop: 30}}>
            <div style={{width: 80, height: 80, borderRadius: 40, background: '#1c2a4a'}} />
            <div style={{fontFamily: FONTE, fontSize: 40, color: '#111'}}>Presidente dos EUA</div>
          </div>
          <div style={{fontFamily: FONTE, fontSize: 50, color: '#111', marginTop: 34, lineHeight: 1.15}}>
            Anuncia que Maduro e a esposa foram capturados e levados para fora da Venezuela.
          </div>
          <div style={{marginTop: 40, height: 220, borderRadius: 24, background: 'linear-gradient(135deg, #1d2b4a, #0b1020)'}} />
          <div style={{fontFamily: FONTE, fontSize: 30, color: '#999', marginTop: 20}}>(representação)</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// Faixa de fontes no final
export const Fontes = ({inicio, dur, texto = 'Fontes: CNN, CNN Brasil, Parlamento Britânico, Congresso dos EUA, Jurist. Recriação ilustrativa.'}: {inicio: number; dur: number; texto?: string}) => {
  const {visivel, k} = useJanela(inicio, dur);
  if (!visivel) return null;
  return (
    <div style={{position: 'absolute', bottom: 70, left: 60, right: 60, opacity: k * 0.9, fontFamily: FONTE, fontSize: 28, color: '#ddd', textAlign: 'center'}}>
      {texto}
    </div>
  );
};

// Escurecimento cinematográfico nas bordas (vinheta) e granulado leve
export const Vinheta = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(0,0,0,0.55) 100%)'}} />
      <AbsoluteFill style={{opacity: 0.018 + (frame % 3) * 0.004, backgroundImage: 'repeating-linear-gradient(0deg, #fff 0 1px, transparent 1px 4px)'}} />
    </AbsoluteFill>
  );
};
