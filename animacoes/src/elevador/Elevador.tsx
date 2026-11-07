import {Audio} from '@remotion/media';
import React from 'react';
import {AbsoluteFill, Sequence, interpolate, staticFile} from 'remotion';
import {sfx, type CategoriaSfx, VOLUME_SFX} from '../sfx';
import {Clarao, Impacto, Legendas} from '../submarino/Overlay';
import {Vinheta} from '../maduro/Doc';
import {
  CenaArrebenta,
  CenaCabos,
  CenaContrapeso,
  CenaEscada,
  CenaFreio,
  CenaGancho,
  CenaInventor,
  CenaManda,
  CenaManivela,
  CenaMolas,
  CenaMotor,
  CenaParabens,
} from './Cenas';
import {Manda, Painel, Pergunta, Pilula, Rebobina} from './Hud';
import {CENAS, FPS, TODAS_FALAS, TOTAL_FRAMES, cena, type CenaId, duracaoCena, quandoDiz, segFrame} from './roteiro';

const T = (id: CenaId, rel: number) => cena(id).inicio + rel;
const Q = (id: CenaId, fala: string, palavra: string) => T(id, quandoDiz(id, fala, palavra));
const D = duracaoCena;

const COMPONENTE: Record<CenaId, React.FC> = {
  gancho: CenaGancho,
  escada: CenaEscada,
  manivela: CenaManivela,
  contrapeso: CenaContrapeso,
  motor: CenaMotor,
  arrebenta: CenaArrebenta,
  cabos: CenaCabos,
  freio: CenaFreio,
  molas: CenaMolas,
  inventor: CenaInventor,
  parabens: CenaParabens,
  manda: CenaManda,
};

const DESTAQUES = /^(despenca|arrebentar|cem|perna|manivela|braço|contrapeso|motor|botão|arrebenta|quadragésimo|térreo|cinco|aço|sozinho|seguram|garras|trilhos|freio|segurança|molas|inventor|cortar|Parabéns|Manda)/i;

const SONS: [CategoriaSfx, number, number, number, number?][] = [
  ['impacto', 0, 0.0, 1],
  ['alarme', 0, 0.05, 0.5, 2.6],
  ['whoosh', 0, 0.3, 0.8],
  ['impacto', 1, T('gancho', D('gancho') * 0.85), 1],
  ['subida', 2, T('escada', 0.1), 0.4],
  ['mecanico', 0, T('manivela', 0.6), 0.6],
  ['mecanico', 1, T('manivela', 1.6), 0.6],
  ['erro', 0, Q('manivela', 'L2', 'desiste'), 0.6],
  ['pop', 0, Q('contrapeso', 'L3', 'contrapeso'), 0.8],
  ['motor', 0, Q('motor', 'L4', 'botão') - 0.2, 0.4, 2.4],
  ['pop', 1, Q('motor', 'L4', 'botão'), 0.7],
  ['impacto', 2, Q('arrebenta', 'L5', 'arrebenta'), 1],
  ['whoosh', 1, Q('arrebenta', 'L5', 'arrebenta') + 0.2, 0.8],
  ['impacto', 0, Q('arrebenta', 'L5', 'segundos') + 0.3, 1],
  ['mecanico', 2, Q('cabos', 'L6', 'aço'), 0.6],
  ['impacto', 1, Q('cabos', 'L6', 'rompe'), 0.6],
  ['acerto', 0, Q('cabos', 'L6', 'seguram'), 0.5],
  ['tensao', 0, T('freio', 0.2), 0.4, 2.5],
  ['whoosh', 2, Q('freio', 'L7', 'velocidade'), 0.7],
  ['impacto', 2, Q('freio', 'L7', 'mordem'), 1],
  ['mecanico', 1, Q('freio', 'L7', 'travam'), 0.8],
  ['pop', 2, Q('freio', 'L7', 'segurança'), 0.8],
  ['agua', 0, Q('molas', 'L8', 'amortecem'), 0.5],
  ['pop', 3, Q('molas', 'L8', 'molas'), 0.7],
  ['tensao', 2, Q('inventor', 'L9', 'cortar') - 1, 0.4, 1.2],
  ['impacto', 0, Q('inventor', 'L9', 'cortar') + 0.3, 1],
  ['conquista', 0, Q('inventor', 'L9', 'cima'), 0.6],
  ['subida', 1, T('parabens', 0.1), 0.5],
  ['conquista', 1, Q('parabens', 'L10', 'Parabéns'), 0.8],
  ['acerto', 1, Q('parabens', 'L10', 'despenca'), 0.6],
  ['pop', 0, Q('manda', 'L11', 'Manda'), 0.9],
  ...CENAS.slice(1).map((c, i) => ['whoosh', i, c.inicio - 0.12, 0.45] as [CategoriaSfx, number, number, number]),
];

const Som = ({cat, n, em, vol, dur}: {cat: CategoriaSfx; n: number; em: number; vol: number; dur?: number}) => (
  <Sequence from={Math.max(0, segFrame(em))} durationInFrames={dur ? segFrame(dur) : undefined} layout="none" name={`som: ${cat}`}>
    <Audio src={sfx(cat, n)} volume={vol * VOLUME_SFX} />
  </Sequence>
);

export const ElevadorVideo = () => {
  const volumeTrilha = (f: number) => 0.12 * interpolate(f, [TOTAL_FRAMES - 40, TOTAL_FRAMES], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Impacto
        zooms={[0.0, Q('arrebenta', 'L5', 'arrebenta'), Q('freio', 'L7', 'mordem'), Q('inventor', 'L9', 'cortar') + 0.3, Q('parabens', 'L10', 'Parabéns')]}
        tremidas={[
          {inicio: 0, dur: 0.5, forca: 12},
          {inicio: Q('arrebenta', 'L5', 'segundos') + 0.3, dur: 0.6, forca: 16},
          {inicio: Q('freio', 'L7', 'mordem'), dur: 0.6, forca: 14},
        ]}
      >
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
      <Painel />

      <Pergunta dur={D('gancho')} />
      <Rebobina inicio={T('gancho', D('gancho') - 0.5)} dur={0.7} />

      <Pilula inicio={Q('escada', 'L1', 'cem')} dur={2.2} texto="100 ANDARES" cor="vermelho" />
      <Pilula inicio={Q('manivela', 'L2', 'manivela')} dur={2.2} texto="MANIVELA" />
      <Pilula inicio={Q('manivela', 'L2', 'desiste')} dur={1.8} texto="– BRAÇO" cor="vermelho" rot={4} />
      <Pilula inicio={Q('contrapeso', 'L3', 'contrapeso')} dur={D('contrapeso') - quandoDiz('contrapeso', 'L3', 'contrapeso')} texto="CONTRAPESO" />
      <Pilula inicio={Q('motor', 'L4', 'botão')} dur={2.2} texto="DE BOA" cor="verde" rot={3} />
      <Pilula inicio={Q('arrebenta', 'L5', 'arrebenta')} dur={2.6} texto="DEU RUIM" cor="vermelho" rot={-5} />
      <Rebobina inicio={T('arrebenta', D('arrebenta') - 0.5)} dur={0.7} />
      <Pilula inicio={Q('cabos', 'L6', 'aço')} dur={2.6} texto="CABOS DE AÇO" />
      <Pilula inicio={Q('cabos', 'L6', 'seguram')} dur={1.8} texto="SEGUROU!" cor="verde" rot={4} />
      <Pilula inicio={Q('freio', 'L7', 'garras')} dur={2.4} texto="GARRAS" />
      <Pilula inicio={Q('freio', 'L7', 'segurança')} dur={D('freio') - quandoDiz('freio', 'L7', 'segurança')} texto="FREIO DE SEGURANÇA" />
      <Pilula inicio={Q('molas', 'L8', 'molas')} dur={2.6} texto="AMORTECEDORES" />
      <Pilula inicio={Q('inventor', 'L9', 'cortar') + 0.4} dur={D('inventor') - quandoDiz('inventor', 'L9', 'cortar') - 0.4} texto="CONFIANÇA TOTAL" cor="verde" />
      <Pilula inicio={Q('parabens', 'L10', 'Parabéns')} dur={D('parabens') - quandoDiz('parabens', 'L10', 'Parabéns')} texto="100 ANDARES ✅" cor="verde" />
      <Manda inicio={Q('manda', 'L11', 'Manda') - 0.3} dur={D('manda') - quandoDiz('manda', 'L11', 'Manda') + 0.3} />

      <Clarao momentos={[cena('arrebenta').inicio, cena('inventor').inicio]} />
      <Legendas falas={TODAS_FALAS} destaques={DESTAQUES} corFalando="#ffcc00" corDestaque="#ffffff" topo="66%" tamanho={66} umaLinha maxPalavras={3} />

      <Audio src={staticFile('submarino/musica.mp3')} volume={volumeTrilha} />
      {TODAS_FALAS.map((f) => (
        <Sequence key={f.id} name={`Voz ${f.id}`} from={segFrame(f.inicio)} layout="none">
          <Audio src={staticFile(`elevador/${f.id}.mp3`)} />
        </Sequence>
      ))}
      {SONS.map(([cat, n, em, vol, dur], i) => (
        <Som key={i} cat={cat} n={n} em={em} vol={vol} dur={dur} />
      ))}
    </AbsoluteFill>
  );
};
