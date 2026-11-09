import {Audio} from '@remotion/media';
import React from 'react';
import {AbsoluteFill, Sequence, interpolate, staticFile} from 'remotion';
import {sfx, type CategoriaSfx, VOLUME_SFX} from '../sfx';
import {Cortes} from '../edicao/Edicao';
import * as C from './Cenas';
import {CENAS, TODAS_FALAS, TOTAL_FRAMES, cena, type CenaId, quandoDiz, segFrame} from './roteiro';

const T = (id: CenaId, rel: number) => cena(id).inicio + rel;
const Q = (id: CenaId, fala: string, palavra: string) => T(id, quandoDiz(id, fala, palavra));

const COMPONENTE: Record<CenaId, React.FC> = {
  jogo: C.CenaJogo, infarto: C.CenaInfarto, minuto: C.CenaMinuto, tosse: C.CenaTosse, chave: C.CenaChave, caminho: C.CenaCaminho,
  ligar: C.CenaLigar, sentado: C.CenaSentado, aas: C.CenaAas, desmaio: C.CenaDesmaio, maos: C.CenaMaos, afundar: C.CenaAfundar,
  ritmo: C.CenaRitmo, revezar: C.CenaRevezar, samu: C.CenaSamu, mulheres: C.CenaMulheres, cada: C.CenaCada, fim: C.CenaFim,
};

// metrônomo de massagem (103 por minuto) do início de "afundar" até o fim de "revezar"
const BATIDAS: number[] = [];
for (let t = T('afundar', 0.2); t < cena('revezar').fim; t += 60 / 103) BATIDAS.push(t);

const SONS: [CategoriaSfx, number, number, number, number?][] = [
  ['impacto', 0, Q('jogo', 'L0', 'repente'), 0.8],
  ['subida', 0, T('infarto', 0.2), 0.4],
  ['erro', 0, Q('infarto', 'L1', 'coágulo') + 0.3, 0.5],
  ['tique', 0, Q('minuto', 'L2', 'minuto') - 0.6, 0.5],
  ['tique', 1, Q('minuto', 'L2', 'minuto') - 0.3, 0.5],
  ['erro', 1, Q('tosse', 'L3', 'Não'), 0.7],
  ['erro', 2, Q('chave', 'L4', 'Também'), 0.7],
  ['erro', 0, Q('caminho', 'L5', 'ninguém'), 0.5],
  ['alarme', 1, Q('caminho', 'L5', 'ambulância'), 0.4, 2.2],
  ['acerto', 0, Q('caminho', 'L5', 'ambulância') + 0.6, 0.5],
  ['tique', 2, Q('ligar', 'L6', '192') - 0.3, 0.6],
  ['tique', 0, Q('ligar', 'L6', '192'), 0.6],
  ['tique', 1, Q('ligar', 'L6', '192') + 0.3, 0.6],
  ['acerto', 1, Q('ligar', 'L6', '192') + 0.8, 0.5],
  ['pop', 0, Q('aas', 'L8', 'comprimido'), 0.6],
  ['acerto', 2, Q('aas', 'L8', 'Isso') + 0.4, 0.4],
  ['impacto', 1, Q('desmaio', 'L9', 'desmaiar'), 0.6],
  ['pop', 1, T('maos', 0.3), 0.5],
  ['alarme', 2, T('samu', 0.1), 0.35, 2.5],
  ['whoosh', 2, Q('samu', 'L14', 'ambulância'), 0.4],
  ['conquista', 0, T('fim', 0.2), 0.5],
  ...CENAS.slice(1).map((c, i) => ['whoosh', i, c.inicio - 0.1, 0.25] as [CategoriaSfx, number, number, number]),
];

const Som = ({cat, n, em, vol, dur}: {cat: CategoriaSfx; n: number; em: number; vol: number; dur?: number}) => (
  <Sequence from={Math.max(0, segFrame(em))} durationInFrames={dur ? Math.max(1, segFrame(dur)) : undefined} layout="none">
    <Audio src={sfx(cat, n)} volume={vol * VOLUME_SFX} />
  </Sequence>
);

const CORTES = [
  ...CENAS.slice(1).map((c) => c.inicio),
  Q('jogo', 'L0', 'repente'),
  Q('caminho', 'L5', 'ambulância'),
  Q('aas', 'L8', 'comprimido'),
  Q('aas', 'L8', 'Isso'),
  Q('desmaio', 'L9', 'deite'),
  Q('samu', 'L14', 'ambulância'),
  Q('samu', 'L14', 'hospital') + 0.4,
  Q('mulheres', 'L15', 'cansaço'),
].sort((a, b) => a - b);

// Sem nenhum texto na tela (o usuário legenda no CapCut).
// so: renderiza só uma faixa de áudio (para entregar os áudios separados)
export const InfartoVideo = ({semVideo = false, so}: {semVideo?: boolean; so?: 'voz' | 'musica' | 'efeitos'}) => {
  const volumeTrilha = (f: number) => 0.14 * interpolate(f, [TOTAL_FRAMES - 45, TOTAL_FRAMES], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{background: '#000'}}>
      {!semVideo && (
        <Cortes momentos={CORTES} forca={0.7}>
          {CENAS.map((c) => {
            const Comp = COMPONENTE[c.id];
            return (
              <Sequence key={c.id} name={`Cena: ${c.id}`} from={segFrame(c.inicio)} durationInFrames={segFrame(c.fim) - segFrame(c.inicio)}>
                <Comp />
              </Sequence>
            );
          })}
        </Cortes>
      )}
      {(!so || so === 'musica') && <Audio src={staticFile('infarto/trilha.mp3')} volume={volumeTrilha} />}
      {(!so || so === 'voz') &&
        TODAS_FALAS.map((f) => (
          <Sequence key={f.id} from={segFrame(f.inicio)} layout="none">
            <Audio src={staticFile(`infarto/${f.id}.mp3`)} />
          </Sequence>
        ))}
      {(!so || so === 'efeitos') && (
        <>
          {SONS.map(([cat, n, em, vol, dur], i) => (
            <Som key={i} cat={cat} n={n} em={em} vol={vol} dur={dur} />
          ))}
          {BATIDAS.map((b, i) => (
            <Som key={`b${i}`} cat="tique" n={i % 2} em={b} vol={0.55} dur={0.3} />
          ))}
        </>
      )}
    </AbsoluteFill>
  );
};
