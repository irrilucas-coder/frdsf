import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {FONTE} from '../submarino/Overlay';
import {FPS} from './roteiro';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const useJanela = (inicio: number, dur: number) => {
  const s = useCurrentFrame() / FPS - inicio;
  const entra = interpolate(s, [0, 0.35], [0, 1], {...clamp, easing: Easing.out(Easing.back(1.3))});
  const sai = interpolate(s, [dur - 0.3, dur], [1, 0], clamp);
  return {visivel: s >= 0 && s <= dur, k: entra * sai, s};
};

// Player de vídeo genérico (sem logotipo de nenhuma plataforma)
export const Player = ({inicio, dur, views = false}: {inicio: number; dur: number; views?: boolean}) => {
  const {visivel, k, s} = useJanela(inicio, dur);
  if (!visivel) return null;
  const v = interpolate(s, [0.3, dur - 0.6], [0, 15], {...clamp, easing: Easing.out(Easing.cubic)});
  return (
    <AbsoluteFill style={{alignItems: 'center', top: 230}}>
      <div style={{opacity: k, scale: 0.9 + k * 0.1, width: 900}}>
        <div
          style={{
            height: 506,
            borderRadius: 24,
            background: 'linear-gradient(135deg, #1a1d29, #2b1630)',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 30px 60px rgba(0,0,0,0.6)',
          }}
        >
          <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONTE, fontSize: 110, color: '#fff', letterSpacing: 2, textShadow: '0 6px 0 #000'}}>
            ADULTIZAÇÃO
          </div>
          <div style={{position: 'absolute', right: 20, bottom: 20, background: 'rgba(0,0,0,0.8)', color: '#fff', fontFamily: 'monospace', fontWeight: 700, fontSize: 34, padding: '4px 12px', borderRadius: 8}}>
            49:59
          </div>
          <div style={{position: 'absolute', left: 0, bottom: 0, height: 10, width: `${Math.min(1, s / dur) * 100}%`, background: '#e10600'}} />
        </div>
        <div style={{fontFamily: FONTE, fontSize: 44, color: '#fff', marginTop: 20}}>adultização</div>
        <div style={{fontFamily: FONTE, fontSize: 34, color: '#bbb', marginTop: 6}}>
          Felca · {views ? `${v.toFixed(1).replace('.', ',')} mi de visualizações` : '6 de ago. de 2025'}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// Aviso de proteção da identidade de menores
export const Protegido = ({inicio, dur}: {inicio: number; dur: number}) => {
  const {visivel, k} = useJanela(inicio, dur);
  if (!visivel) return null;
  return (
    <AbsoluteFill style={{alignItems: 'center', top: 250}}>
      <div style={{opacity: k, scale: 0.9 + k * 0.1, background: 'rgba(8,10,18,0.9)', border: '4px solid #ffcc00', borderRadius: 24, padding: '24px 36px', maxWidth: 860, textAlign: 'center'}}>
        <div style={{fontSize: 90}}>🛡️</div>
        <div style={{fontFamily: FONTE, fontSize: 52, color: '#fff', lineHeight: 1.1, marginTop: 6}}>IDENTIDADE PROTEGIDA</div>
        <div style={{fontFamily: FONTE, fontSize: 34, color: '#ffcc00', marginTop: 10}}>Imagens e nomes de menores não são mostrados</div>
      </div>
    </AbsoluteFill>
  );
};

// Conta desativada (genérica, sem logotipo)
export const ContaDesativada = ({inicio, dur}: {inicio: number; dur: number}) => {
  const {visivel, k} = useJanela(inicio, dur);
  if (!visivel) return null;
  return (
    <AbsoluteFill style={{alignItems: 'center', top: 300}}>
      <div style={{opacity: k, scale: 0.85 + k * 0.15, width: 760, background: '#f4f4f6', borderRadius: 30, padding: 36, textAlign: 'center', boxShadow: '0 30px 60px rgba(0,0,0,0.6)'}}>
        <div style={{width: 150, height: 150, borderRadius: 75, background: '#c7c7cc', margin: '0 auto'}} />
        <div style={{fontFamily: FONTE, fontSize: 44, color: '#111', marginTop: 20}}>@hytalosantos</div>
        <div style={{fontFamily: FONTE, fontSize: 56, color: '#e10600', marginTop: 16}}>CONTA DESATIVADA</div>
        <div style={{fontFamily: FONTE, fontSize: 30, color: '#888', marginTop: 8}}>(representação)</div>
      </div>
    </AbsoluteFill>
  );
};

// Pena (condenação)
export const Pena = ({inicio, dur, nome, pena, topo}: {inicio: number; dur: number; nome: string; pena: string; topo: number}) => {
  const {visivel, k} = useJanela(inicio, dur);
  if (!visivel) return null;
  return (
    <div style={{position: 'absolute', top: topo, left: 0, right: 0, display: 'flex', justifyContent: 'center', opacity: k}}>
      <div style={{display: 'flex', alignItems: 'stretch', translate: `${(1 - k) * 80}px 0px`}}>
        <div style={{background: '#e10600', fontFamily: FONTE, fontSize: 44, color: '#fff', padding: '12px 22px', display: 'flex', alignItems: 'center'}}>{nome}</div>
        <div style={{background: 'rgba(8,10,18,0.9)', fontFamily: FONTE, fontSize: 64, color: '#ffcc00', padding: '8px 26px'}}>{pena}</div>
      </div>
    </div>
  );
};

// Disque 100
export const Disque100 = ({inicio, dur}: {inicio: number; dur: number}) => {
  const {visivel, k, s} = useJanela(inicio, dur);
  if (!visivel) return null;
  const pulsa = 1 + Math.sin(s * 6) * 0.03;
  return (
    <AbsoluteFill style={{alignItems: 'center', top: 220}}>
      <div style={{opacity: k, scale: (0.9 + k * 0.1) * pulsa, textAlign: 'center'}}>
        <div style={{fontFamily: FONTE, fontSize: 44, color: '#fff', letterSpacing: 4}}>DENUNCIE</div>
        <div style={{fontFamily: FONTE, fontSize: 170, color: '#fff', background: 'linear-gradient(180deg, #1f6feb, #0b3d91)', borderRadius: 40, padding: '6px 50px', border: '8px solid #fff', boxShadow: '0 14px 0 rgba(0,0,0,0.5)'}}>
          📞 100
        </div>
        <div style={{fontFamily: FONTE, fontSize: 36, color: '#fff', marginTop: 16}}>Disque Direitos Humanos · grátis e anônimo</div>
      </div>
    </AbsoluteFill>
  );
};
