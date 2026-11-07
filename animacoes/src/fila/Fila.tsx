import {Audio} from '@remotion/media';
import React from 'react';
import {AbsoluteFill, Sequence, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {sfx, type CategoriaSfx, VOLUME_SFX} from '../sfx';
import {Clarao, Impacto, Legendas} from '../submarino/Overlay';
import {Vinheta} from '../maduro/Doc';
import {Manda, Painel2, Pergunta, Pilula} from '../elevador/Hud';
import {CenaAzar, CenaCerebro, CenaChance, CenaDica, CenaGancho, CenaImprevisto, CenaJusto, CenaManda, CenaTrava, CenaTres, CenaUnica, painelEm} from './Cenas';
import {CENAS, FPS, TODAS_FALAS, TOTAL_FRAMES, cena, type CenaId, duracaoCena, quandoDiz, segFrame} from './roteiro';

const T = (id: CenaId, rel: number) => cena(id).inicio + rel;
const Q = (id: CenaId, fala: string, palavra: string) => T(id, quandoDiz(id, fala, palavra));
const D = duracaoCena;
const R = quandoDiz;

const COMPONENTE: Record<CenaId, React.FC> = {
  gancho: CenaGancho,
  azar: CenaAzar,
  tres: CenaTres,
  chance: CenaChance,
  imprevisto: CenaImprevisto,
  trava: CenaTrava,
  cerebro: CenaCerebro,
  unica: CenaUnica,
  justo: CenaJusto,
  dica: CenaDica,
  manda: CenaManda,
};

const DESTAQUES = /^(fila|rápido|azar|matemática|três|uma|chance|duas|imprevisto|senha|código|moeda|trava|cérebro|semanas|única|livre|justo|previsível|dica|Manda)/i;

const mmss = (seg: number) => `${Math.floor(seg / 60)}:${String(Math.floor(seg % 60)).padStart(2, '0')}`;
const PainelFila = () => {
  const frame = useCurrentFrame();
  const sAbs = frame / FPS;
  const c = CENAS.find((x) => sAbs < x.fim) ?? CENAS[CENAS.length - 1];
  const p = painelEm(c.id, sAbs - c.inicio);
  if (!p) return null;
  return (
    <Painel2
      a={{rotulo: 'POSIÇÃO', valor: `${p.pos}º`, unidade: 'na fila'}}
      b={{rotulo: 'TEMPO NA FILA', valor: mmss(p.tempo), unidade: 'min', perigo: p.tempo > 240}}
    />
  );
};

const SONS: [CategoriaSfx, number, number, number, number?][] = [
  ['impacto', 0, 0.0, 1],
  ['tique', 0, 0.3, 0.5],
  ['tique', 1, 0.9, 0.5],
  ['tique', 2, 1.5, 0.5],
  ['erro', 0, Q('azar', 'L1', 'azar'), 0.6],
  ['pop', 0, Q('azar', 'L1', 'matemática'), 0.8],
  ['whoosh', 0, T('tres', 0.1), 0.6],
  ['pop', 1, Q('chance', 'L3', 'chance'), 0.9],
  ['acerto', 0, Q('chance', 'L3', 'duas'), 0.4],
  ['mecanico', 1, Q('imprevisto', 'L4', 'senha'), 0.5],
  ['erro', 1, Q('imprevisto', 'L4', 'código'), 0.6],
  ['agua', 2, Q('imprevisto', 'L4', 'moeda'), 0.3],
  ['tique', 0, Q('imprevisto', 'L4', 'moeda') + 0.1, 0.6],
  ['tique', 1, Q('imprevisto', 'L4', 'moeda') + 0.25, 0.6],
  ['impacto', 1, Q('trava', 'L5', 'trava'), 0.8],
  ['sonar', 2, T('cerebro', 0.2), 0.5],
  ['impacto', 2, Q('cerebro', 'L6', 'para'), 0.9],
  ['pop', 2, Q('unica', 'L7', 'única'), 0.8],
  ['acerto', 1, Q('unica', 'L7', 'livre'), 0.6],
  ['conquista', 0, Q('justo', 'L8', 'justo'), 0.5],
  ['pop', 3, Q('dica', 'L9', 'dica'), 0.8],
  ['pop', 0, Q('manda', 'L10', 'Manda'), 0.9],
  ...CENAS.slice(1).map((c, i) => ['whoosh', i, c.inicio - 0.12, 0.45] as [CategoriaSfx, number, number, number]),
];

const Som = ({cat, n, em, vol, dur}: {cat: CategoriaSfx; n: number; em: number; vol: number; dur?: number}) => (
  <Sequence from={Math.max(0, segFrame(em))} durationInFrames={dur ? Math.max(1, segFrame(dur)) : undefined} layout="none" name={`som: ${cat}`}>
    <Audio src={sfx(cat, n)} volume={vol * VOLUME_SFX} />
  </Sequence>
);

export const FilaVideo = () => {
  const volumeTrilha = (f: number) => 0.09 * interpolate(f, [TOTAL_FRAMES - 40, TOTAL_FRAMES], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Impacto zooms={[0, Q('azar', 'L1', 'matemática'), Q('chance', 'L3', 'chance'), Q('cerebro', 'L6', 'para'), Q('unica', 'L7', 'única')]} tremidas={[{inicio: 0, dur: 0.3, forca: 8}]}>
        {CENAS.map((c) => {
          const Comp = COMPONENTE[c.id];
          return (
            <Sequence key={c.id} name={`Cena: ${c.id}`} from={segFrame(c.inicio)} durationInFrames={segFrame(c.fim) - segFrame(c.inicio)}>
              <Comp />
            </Sequence>
          );
        })}
      </Impacto>
      <Vinheta />
      <PainelFila />

      <Pergunta dur={D('gancho')} linhas={[['POR QUE A FILA'], ['DO LADO', true], ['SEMPRE ANDA MAIS RÁPIDO?']]} />
      <Pilula inicio={Q('azar', 'L1', 'azar')} dur={D('azar') - R('azar', 'L1', 'azar')} texto="AZAR? NÃO." cor="vermelho" />
      <Pilula inicio={Q('tres', 'L2', 'três')} dur={D('tres') - R('tres', 'L2', 'três')} texto="3 CAIXAS" />
      <Pilula inicio={Q('chance', 'L3', 'chance')} dur={D('chance') - R('chance', 'L3', 'chance')} texto="1 EM 3" />
      <Pilula inicio={Q('imprevisto', 'L4', 'imprevisto')} dur={D('imprevisto') - R('imprevisto', 'L4', 'imprevisto')} texto="IMPREVISTO" cor="vermelho" rot={4} />
      <Pilula inicio={Q('trava', 'L5', 'trava')} dur={D('trava') - R('trava', 'L5', 'trava')} texto="SUA FILA TRAVOU" cor="vermelho" rot={-4} />
      <Pilula inicio={Q('cerebro', 'L6', 'para')} dur={D('cerebro') - R('cerebro', 'L6', 'para')} texto="LEMBRA POR SEMANAS" cor="vermelho" />
      <Pilula inicio={Q('unica', 'L7', 'única')} dur={D('unica') - R('unica', 'L7', 'única')} texto="FILA ÚNICA" />
      <Pilula inicio={Q('justo', 'L8', 'justo')} dur={D('justo') - R('justo', 'L8', 'justo')} texto="MAIS JUSTO" cor="verde" />
      <Pilula inicio={Q('dica', 'L9', 'dica')} dur={D('dica') - R('dica', 'L9', 'dica')} texto="DE BOA" cor="verde" rot={3} />
      <Manda inicio={Q('manda', 'L10', 'Manda') - 0.3} dur={D('manda') - R('manda', 'L10', 'Manda') + 0.3} />

      <Clarao momentos={[cena('tres').inicio, cena('unica').inicio]} />
      <Legendas falas={TODAS_FALAS} destaques={DESTAQUES} corFalando="#ffcc00" corDestaque="#ffffff" topo="66%" tamanho={66} umaLinha maxPalavras={3} />

      {/* Música: "Monkeys Spinning Monkeys" – Kevin MacLeod (incompetech.com), CC BY 3.0 */}
      <Audio src={staticFile('musicas/curiosidade/monkeys-spinning-monkeys.mp3')} volume={volumeTrilha} loop />
      {TODAS_FALAS.map((f) => (
        <Sequence key={f.id} name={`Voz ${f.id}`} from={segFrame(f.inicio)} layout="none">
          <Audio src={staticFile(`fila/${f.id}.mp3`)} />
        </Sequence>
      ))}
      {SONS.map(([cat, n, em, vol, dur], i) => (
        <Som key={i} cat={cat} n={n} em={em} vol={vol} dur={dur} />
      ))}
    </AbsoluteFill>
  );
};
