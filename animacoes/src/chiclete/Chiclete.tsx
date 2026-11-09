import {Audio} from '@remotion/media';
import React from 'react';
import {AbsoluteFill, Easing, Sequence, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {sfx, type CategoriaSfx, VOLUME_SFX} from '../sfx';
import {FONTE} from '../submarino/Overlay';
import {Avanca, ComentaFinal, Cortes, Etiqueta, PalavraChave} from '../edicao/Edicao';
import {CenaDias, CenaEmpurra, CenaEsofago, CenaEstomago, CenaFinal, CenaGancho, CenaMito, CenaPerigo} from './Cenas';
import {CENAS, FPS, TODAS_FALAS, TOTAL_FRAMES, cena, type CenaId, duracaoCena, quandoDiz, segFrame} from './roteiro';

const T = (id: CenaId, rel: number) => cena(id).inicio + rel;
const Q = (id: CenaId, fala: string, palavra: string) => T(id, quandoDiz(id, fala, palavra));
const D = duracaoCena;
const R = quandoDiz;
const ATE = (id: CenaId) => cena(id).fim;

const COMPONENTE: Record<CenaId, React.FC> = {
  gancho: CenaGancho,
  mito: CenaMito,
  esofago: CenaEsofago,
  estomago: CenaEstomago,
  empurra: CenaEmpurra,
  dias: CenaDias,
  perigo: CenaPerigo,
  final: CenaFinal,
};

// Calendário passando os dias
const Calendario = ({inicio, fim}: {inicio: number; fim: number}) => {
  const s = useCurrentFrame() / FPS;
  if (s < inicio || s > fim) return null;
  const k = interpolate(s, [inicio, inicio + 0.2, fim - 0.15, fim], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const dia = Math.min(5, 1 + Math.floor(((s - inicio) / (fim - inicio)) * 5));
  const virada = ((s - inicio) / (fim - inicio)) * 5 % 1;
  return (
    <AbsoluteFill style={{alignItems: 'center', top: 300}}>
      <div style={{scale: k, width: 330, borderRadius: 26, overflow: 'hidden', border: '7px solid #111', boxShadow: '0 14px 0 rgba(0,0,0,0.35)', background: '#fff'}}>
        <div style={{background: '#e53935', fontFamily: FONTE, fontSize: 44, color: '#fff', textAlign: 'center', padding: '8px 0'}}>DIA</div>
        <div style={{fontFamily: FONTE, fontSize: 190, color: '#111', textAlign: 'center', lineHeight: 1.05, rotate: `x ${virada < 0.18 ? (1 - virada / 0.18) * 80 : 0}deg`}}>{dia}</div>
      </div>
    </AbsoluteFill>
  );
};

// Placa de alerta piscando
const Alerta = ({inicio, fim}: {inicio: number; fim: number}) => {
  const f = useCurrentFrame();
  const s = f / FPS;
  if (s < inicio || s > fim) return null;
  return <AbsoluteFill style={{boxShadow: 'inset 0 0 160px 40px rgba(255,0,0,0.55)', opacity: Math.floor(f / 6) % 2 ? 1 : 0.35}} />;
};

const SONS: [CategoriaSfx, number, number, number, number?][] = [
  ['subida', 0, 0.1, 0.5],
  ['pop', 0, Q('gancho', 'L0', 'engolir') - 0.15, 1],
  ['impacto', 0, Q('gancho', 'L0', 'chiclete'), 0.7],
  ['erro', 0, Q('gancho', 'L0', 'sete'), 0.6],
  ['tique', 0, Q('mito', 'L1', 'Mas'), 0.5],
  ['whoosh', 1, T('mito', D('mito') - 0.5), 0.9],
  ['agua', 0, Q('esofago', 'L2', 'estômago') + 0.15, 0.5],
  ['bolhas', 0, T('estomago', 0.1), 0.45, 5.5],
  ['pop', 1, Q('estomago', 'L3', 'pão'), 0.6],
  ['pop', 2, Q('estomago', 'L3', 'carne'), 0.6],
  ['pop', 3, Q('estomago', 'L3', 'fruta'), 0.6],
  ['impacto', 1, Q('estomago', 'L3', 'dissolve'), 0.7],
  ['mecanico', 0, Q('empurra', 'L4', 'espreme'), 0.6],
  ['whoosh', 2, Q('empurra', 'L4', 'intestino'), 0.9],
  ['tique', 0, Q('dias', 'L5', 'dois'), 0.6],
  ['tique', 1, Q('dias', 'L5', 'dois') + 0.35, 0.6],
  ['tique', 2, Q('dias', 'L5', 'dois') + 0.7, 0.6],
  ['conquista', 0, Q('dias', 'L5', 'sai'), 0.55],
  ['alarme', 0, Q('perigo', 'L6', 'intestino'), 0.45, 2.5],
  ['impacto', 2, Q('perigo', 'L6', 'entupir'), 0.8],
  ['impacto', 0, Q('final', 'L7', 'mito'), 0.9],
  ['pop', 0, Q('final', 'L7', 'Já'), 0.8],
  ['pop', 1, Q('final', 'L7', 'Não'), 0.8],
  ...CENAS.slice(1).map((c, i) => ['whoosh', i, c.inicio - 0.1, 0.45] as [CategoriaSfx, number, number, number]),
];

const Som = ({cat, n, em, vol, dur}: {cat: CategoriaSfx; n: number; em: number; vol: number; dur?: number}) => (
  <Sequence from={Math.max(0, segFrame(em))} durationInFrames={dur ? Math.max(1, segFrame(dur)) : undefined} layout="none" name={`som: ${cat}`}>
    <Audio src={sfx(cat, n)} volume={vol * VOLUME_SFX} />
  </Sequence>
);

// Cortes (troca de plano) para o efeito de chicote
const CORTES = [
  ...CENAS.slice(1).map((c) => c.inicio),
  Q('gancho', 'L0', 'chiclete'),
  Q('gancho', 'L0', 'sete'),
  Q('mito', 'L1', 'Mas'),
  Q('estomago', 'L3', 'mas'),
  Q('empurra', 'L4', 'intestino'),
  Q('dias', 'L5', 'sai'),
  Q('perigo', 'L6', 'intestino'),
  Q('final', 'L7', 'Já'),
].sort((a, b) => a - b);

export const ChicleteVideo = ({semVideo = false}: {semVideo?: boolean}) => {
  const volumeTrilha = (f: number) => 0.09 * interpolate(f, [TOTAL_FRAMES - 40, TOTAL_FRAMES], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const fimPalavra = (id: CenaId, fala: string, palavra: string, dur = 1.3) => ({inicio: Q(id, fala, palavra), dur: Math.min(dur, ATE(id) - Q(id, fala, palavra))});
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

          {/* palavras-chave (sem legenda corrida) */}
          <PalavraChave {...fimPalavra('gancho', 'L0', 'sete', 2)} texto="7 ANOS?!" cor="#ffd23f" tamanho={140} />
          <PalavraChave {...fimPalavra('mito', 'L1', 'Mas', 1.4)} texto="SERÁ?" />
          <PalavraChave {...fimPalavra('esofago', 'L2', 'esôfago', 1.2)} texto="ESÔFAGO" />
          <PalavraChave {...fimPalavra('estomago', 'L3', 'ácido', 1.4)} texto="ÁCIDO" cor="#c6f05a" />
          <PalavraChave {...fimPalavra('estomago', 'L3', 'dissolve', 2)} texto="NÃO DISSOLVE" cor="#ff7eb6" />
          <PalavraChave {...fimPalavra('empurra', 'L4', 'espreme', 1.3)} texto="ESPREME" />
          <PalavraChave {...fimPalavra('empurra', 'L4', 'intestino', 2)} texto="INTESTINO" />
          <PalavraChave {...fimPalavra('dias', 'L5', 'dois', 2.2)} texto="2 A 5 DIAS" cor="#ffd23f" topo="72%" />
          <PalavraChave {...fimPalavra('perigo', 'L6', 'muitos', 1.6)} texto="MUITOS DE UMA VEZ" tamanho={92} />
          <PalavraChave {...fimPalavra('perigo', 'L6', 'entupir', 2.2)} texto="⚠ PERIGO" cor="#ff3b30" />
          <PalavraChave {...fimPalavra('final', 'L7', 'mito', 1.6)} texto="MITO!" cor="#ff3b30" tamanho={170} rot={-6} />

          <Etiqueta inicio={Q('estomago', 'L3', 'mas')} dur={ATE('estomago') - Q('estomago', 'L3', 'mas')} texto="GOMA" x="62%" y="38%" fundo="#ff4f9a" />
          <Etiqueta inicio={Q('perigo', 'L6', 'criança')} dur={ATE('perigo') - Q('perigo', 'L6', 'criança')} texto="CRIANÇAS" x="50%" y="30%" />

          <Avanca inicio={T('dias', 0.05)} dur={0.6} />
          <Calendario inicio={Q('dias', 'L5', 'dois')} fim={Q('dias', 'L5', 'sai')} />
          <Alerta inicio={Q('perigo', 'L6', 'intestino')} fim={ATE('perigo')} />
          <ComentaFinal inicio={Q('final', 'L7', 'Já') - 0.1} dur={ATE('final') - Q('final', 'L7', 'Já') + 0.1} sim="CHICLETE" nao="MITO" />
        </>
      )}
      {/* Música: "Monkeys Spinning Monkeys" – Kevin MacLeod (incompetech.com), CC BY 3.0 */}
      <Audio src={staticFile('musicas/curiosidade/monkeys-spinning-monkeys.mp3')} volume={volumeTrilha} loop />
      {TODAS_FALAS.map((f) => (
        <Sequence key={f.id} name={`Voz ${f.id}`} from={segFrame(f.inicio)} layout="none">
          <Audio src={staticFile(`chiclete/${f.id}.mp3`)} />
        </Sequence>
      ))}
      {SONS.map(([cat, n, em, vol, dur], i) => (
        <Som key={i} cat={cat} n={n} em={em} vol={vol} dur={dur} />
      ))}
    </AbsoluteFill>
  );
};
void Easing;
