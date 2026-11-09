import {Audio} from '@remotion/media';
import React from 'react';
import {AbsoluteFill, Easing, Sequence, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {sfx, type CategoriaSfx, VOLUME_SFX} from '../sfx';
import {Clarao, FONTE} from '../submarino/Overlay';
import {Cortes, Etiqueta, Hud, PalavraChave} from '../edicao/Edicao';
import {CenaAzarado, CenaCatorze, CenaContagem, CenaDetalhe, CenaFinal, CenaGancho, CenaProva, CenaQuase, CenaRegra, CenaRestam} from './Cenas';
import {CENAS, FPS, TODAS_FALAS, TOTAL_FRAMES, cena, type CenaId, duracaoCena, quandoDiz, segFrame} from './roteiro';

const T = (id: CenaId, rel: number) => cena(id).inicio + rel;
const Q = (id: CenaId, fala: string, palavra: string) => T(id, quandoDiz(id, fala, palavra));
const D = duracaoCena;
const ATE = (id: CenaId) => cena(id).fim;
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

const COMPONENTE: Record<CenaId, React.FC> = {
  gancho: CenaGancho,
  prova: CenaProva,
  regra: CenaRegra,
  catorze: CenaCatorze,
  azarado: CenaAzarado,
  quase: CenaQuase,
  detalhe: CenaDetalhe,
  contagem: CenaContagem,
  restam: CenaRestam,
  final: CenaFinal,
};

const CONT = (px: number) =>
  Array.from({length: 16}, (_, i) => {
    const a = (i / 16) * Math.PI * 2;
    return `${(Math.cos(a) * px).toFixed(1)}px ${(Math.sin(a) * px).toFixed(1)}px 0 #000`;
  }).join(', ') + `, 0 ${px + 4}px 0 #000`;

// Painel: jogadores restantes + prêmio
const PainelArena = () => {
  const s = useCurrentFrame() / FPS;
  const t3 = Q('contagem', 'L7', 'Três');
  const tUm = Q('contagem', 'L7', 'um');
  let n = 100;
  if (s > Q('prova', 'L1', 'água') + 0.2) n = 99;
  if (s > Q('regra', 'L2', 'afunda') + 0.5) n = 98;
  if (s > t3) n = Math.round(interpolate(s, [t3, tUm + 0.6], [98, 12], clamp));
  if (s < 0.3 || s > ATE('restam')) return null;
  return <Hud itens={[{rotulo: 'JOGADORES', valor: String(n), perigo: s > t3 && s < tUm + 0.6}, {rotulo: 'PRÊMIO', valor: 'R$ 1 MI'}]} topo={60} />;
};

// Carimbo "ELIMINADO"
const Eliminado = ({inicio, dur = 1.1, numero}: {inicio: number; dur?: number; numero?: string}) => {
  const s = useCurrentFrame() / FPS - inicio;
  if (s < 0 || s > dur) return null;
  const k = interpolate(s, [0, 0.12], [2.2, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  const op = interpolate(s, [0, 0.06, dur - 0.15, dur], [0, 1, 1, 0], clamp);
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
      <div style={{scale: k, opacity: op, rotate: '-12deg', border: '12px solid #ff2d2d', borderRadius: 18, padding: '6px 34px', fontFamily: FONTE, fontSize: 120, color: '#ff2d2d', background: 'rgba(0,0,0,0.25)', textShadow: '0 6px 0 #000'}}>
        {numero ? `#${numero} ` : ''}ELIMINADO
      </div>
    </AbsoluteFill>
  );
};

// Contagem gigante
const Numero321 = ({inicio, dur, n}: {inicio: number; dur: number; n: string}) => {
  const s = useCurrentFrame() / FPS - inicio;
  if (s < 0 || s > dur) return null;
  const k = interpolate(s, [0, 0.15], [0.3, 1], {...clamp, easing: Easing.out(Easing.back(3))});
  const op = interpolate(s, [dur - 0.12, dur], [1, 0], clamp);
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
      <div style={{fontFamily: FONTE, fontSize: 420, color: '#ffd23f', textShadow: CONT(12), scale: k, opacity: op}}>{n}</div>
    </AbsoluteFill>
  );
};

// Final: "EM QUEM VOCÊ APOSTA?" + "COMENTA O NÚMERO" + "PARTE 2"
const Aposta = ({inicio, dur}: {inicio: number; dur: number}) => {
  const s = useCurrentFrame() / FPS - inicio;
  if (s < 0 || s > dur) return null;
  const a = interpolate(s, [0, 0.25], [0, 1], {...clamp, easing: Easing.out(Easing.back(2))});
  const b = interpolate(s, [0.9, 1.15], [0, 1], {...clamp, easing: Easing.out(Easing.back(2))});
  const c = interpolate(s, [2.2, 2.45], [0, 1], {...clamp, easing: Easing.out(Easing.back(2))});
  return (
    <AbsoluteFill style={{alignItems: 'center', paddingTop: 210}}>
      <div style={{fontFamily: FONTE, fontSize: 92, color: '#fff', textShadow: CONT(7), scale: a, rotate: '-2deg', textAlign: 'center', lineHeight: 1}}>EM QUEM VOCÊ<br />APOSTA?</div>
      <div style={{marginTop: 26, fontFamily: FONTE, fontSize: 66, color: '#111', background: '#ffd23f', border: '6px solid #000', borderRadius: 50, padding: '6px 34px', scale: b, boxShadow: '0 8px 0 rgba(0,0,0,0.45)'}}>💬 COMENTA O NÚMERO</div>
      <div style={{position: 'absolute', bottom: 240, fontFamily: FONTE, fontSize: 80, color: '#fff', background: '#ff2d2d', border: '6px solid #000', borderRadius: 20, padding: '6px 40px', scale: c, rotate: '2deg', boxShadow: '0 8px 0 rgba(0,0,0,0.45)'}}>PARTE 2 ▶</div>
    </AbsoluteFill>
  );
};

const SONS: [CategoriaSfx, number, number, number, number?][] = [
  ['impacto', 0, 0.4, 0.9],
  ['conquista', 0, Q('gancho', 'L0', 'milhão'), 0.5],
  ['impacto', 1, Q('gancho', 'L0', 'Só'), 0.7],
  ['agua', 0, Q('prova', 'L1', 'água') + 0.15, 0.7],
  ['erro', 0, Q('prova', 'L1', 'água') + 0.2, 0.6],
  ['tique', 0, T('regra', 0.2), 0.5],
  ['tique', 1, T('regra', 0.7), 0.5],
  ['tique', 2, T('regra', 1.2), 0.5],
  ['agua', 1, Q('regra', 'L2', 'afunda') + 0.45, 0.6],
  ['whoosh', 2, Q('catorze', 'L3', 'pula'), 0.8],
  ['impacto', 2, Q('catorze', 'L3', 'pula') + 0.7, 0.6],
  ['mecanico', 0, Q('azarado', 'L4', 'balança') - 0.3, 0.5],
  ['impacto', 0, Q('quase', 'L5', 'afunda'), 0.8],
  ['agua', 0, Q('quase', 'L5', 'afunda') + 0.5, 0.7],
  ['subida', 0, Q('quase', 'L5', 'mas') - 0.2, 0.5],
  ['acerto', 0, Q('detalhe', 'L6', 'azuis'), 0.6],
  ['tensao', 0, T('contagem', 0.0), 0.45, 3],
  ['tique', 0, Q('contagem', 'L7', 'Três'), 0.9],
  ['tique', 1, Q('contagem', 'L7', 'dois'), 0.9],
  ['impacto', 1, Q('contagem', 'L7', 'um'), 1],
  ['agua', 1, Q('contagem', 'L7', 'um') + 0.3, 0.8],
  ['conquista', 1, T('restam', 0.2), 0.6],
  ['pop', 0, Q('final', 'L9', 'Comenta'), 0.8],
  ['impacto', 2, Q('final', 'L9', 'parte'), 0.7],
  ...CENAS.slice(1).map((c, i) => ['whoosh', i, c.inicio - 0.1, 0.4] as [CategoriaSfx, number, number, number]),
];

const Som = ({cat, n, em, vol, dur}: {cat: CategoriaSfx; n: number; em: number; vol: number; dur?: number}) => (
  <Sequence from={Math.max(0, segFrame(em))} durationInFrames={dur ? Math.max(1, segFrame(dur)) : undefined} layout="none" name={`som: ${cat}`}>
    <Audio src={sfx(cat, n)} volume={vol * VOLUME_SFX} />
  </Sequence>
);

const CORTES = [...CENAS.slice(1).map((c) => c.inicio), Q('gancho', 'L0', 'milhão'), Q('gancho', 'L0', 'Só'), Q('detalhe', 'L6', 'plataformas'), Q('restam', 'L8', 'milhão')].sort((a, b) => a - b);

export const Arena1Video = ({semVideo = false}: {semVideo?: boolean}) => {
  const volumeTrilha = (f: number) => 0.18 * interpolate(f, [TOTAL_FRAMES - 40, TOTAL_FRAMES], [1, 0], clamp);
  const pal = (id: CenaId, fala: string, palavra: string, dur = 1.3) => ({inicio: Q(id, fala, palavra), dur: Math.min(dur, ATE(id) - Q(id, fala, palavra))});
  return (
    <AbsoluteFill style={{background: '#000'}}>
      {!semVideo && (
        <>
          <Cortes momentos={CORTES}>
            {CENAS.map((c) => {
              const Comp = COMPONENTE[c.id];
              return (
                <Sequence key={c.id} name={`Cena: ${c.id}`} from={segFrame(c.inicio)} durationInFrames={segFrame(c.fim) - segFrame(c.inicio)}>
                  <Comp />
                </Sequence>
              );
            })}
          </Cortes>
          <PainelArena />

          <PalavraChave {...pal('gancho', 'L0', 'Cem', 1.2)} texto="100 JOGADORES" />
          <PalavraChave {...pal('gancho', 'L0', 'milhão', 1.2)} texto="R$ 1.000.000" cor="#ffd23f" tamanho={130} />
          <PalavraChave {...pal('gancho', 'L0', 'Só', 1.4)} texto="SÓ 1 VENCE" cor="#ff2d2d" />
          <PalavraChave {...pal('prova', 'L1', 'plataformas', 1.4)} texto="PROVA 1" cor="#ffd23f" topo="30%" tamanho={100} />
          <Eliminado inicio={Q('prova', 'L1', 'água') + 0.25} numero="3" />
          <PalavraChave {...pal('regra', 'L2', 'dez', 1.6)} texto="A CADA 10s" />
          <Etiqueta inicio={Q('catorze', 'L3', 'catorze')} dur={ATE('catorze') - Q('catorze', 'L3', 'catorze')} texto="#14" x="50%" y="24%" fundo="#ff7a1a" />
          <Etiqueta inicio={Q('azarado', 'L4', 'oitenta')} dur={ATE('azarado') - Q('azarado', 'L4', 'oitenta')} texto="#82" x="50%" y="24%" fundo="#ff7a1a" />
          <PalavraChave {...pal('quase', 'L5', 'mas', 1.4)} texto="QUASE!" cor="#ffd23f" tamanho={150} />
          <Etiqueta inicio={Q('detalhe', 'L6', 'trinta')} dur={Q('detalhe', 'L6', 'plataformas') - Q('detalhe', 'L6', 'trinta')} texto="#37" x="50%" y="24%" fundo="#ff7a1a" />
          <PalavraChave {...pal('detalhe', 'L6', 'azuis', 1.4)} texto="AZUIS = SALVAS" cor="#7fb8ff" tamanho={100} />
          <Numero321 inicio={Q('contagem', 'L7', 'Três')} dur={0.6} n="3" />
          <Numero321 inicio={Q('contagem', 'L7', 'dois')} dur={0.25} n="2" />
          <Numero321 inicio={Q('contagem', 'L7', 'um')} dur={0.7} n="1" />
          <PalavraChave {...pal('restam', 'L8', 'Restam', 1.6)} texto="RESTAM 12" cor="#ffd23f" tamanho={140} />
          <Aposta inicio={T('final', 0.05)} dur={D('final') - 0.05} />
          <Clarao momentos={[Q('contagem', 'L7', 'um'), T('restam', 0)]} />
        </>
      )}
      <Audio src={staticFile('arena1/trilha.mp3')} volume={volumeTrilha} />
      {TODAS_FALAS.map((f) => (
        <Sequence key={f.id} name={`Voz ${f.id}`} from={segFrame(f.inicio)} layout="none">
          <Audio src={staticFile(`arena1/${f.id}.mp3`)} />
        </Sequence>
      ))}
      {SONS.map(([cat, n, em, vol, dur], i) => (
        <Som key={i} cat={cat} n={n} em={em} vol={vol} dur={dur} />
      ))}
    </AbsoluteFill>
  );
};
