import {Audio} from '@remotion/media';
import React from 'react';
import {AbsoluteFill, Sequence, interpolate, staticFile} from 'remotion';
import {sfx, type CategoriaSfx, VOLUME_SFX} from '../sfx';
import {Clarao, Comenta, Impacto, Legendas} from '../submarino/Overlay';
import {Carimbo, Contador, Fontes, Numero, Tarja, Urgente, Vinheta} from '../maduro/Doc';
import {
  CenaAeropuerto,
  CenaAhora,
  CenaCargos,
  CenaFebrero,
  CenaFianza,
  CenaFinal,
  CenaGancho,
  CenaJuez,
  CenaPegasus,
  CenaRecaptura,
  CenaWedding,
} from './Cenas';
import {CENAS, FPS, TODAS_FALAS, TOTAL_FRAMES, cena, type CenaId, duracaoCena, quandoDiz, segFrame} from './roteiro';

const T = (id: CenaId, rel: number) => cena(id).inicio + rel;
const Q = (id: CenaId, fala: string, palavra: string) => T(id, quandoDiz(id, fala, palavra));
const R = quandoDiz;
const D = duracaoCena;

const COMPONENTE: Record<CenaId, React.FC> = {
  gancho: CenaGancho,
  aeropuerto: CenaAeropuerto,
  juez: CenaJuez,
  febrero: CenaFebrero,
  wedding: CenaWedding,
  fianza: CenaFianza,
  recaptura: CenaRecaptura,
  cargos: CenaCargos,
  pegasus: CenaPegasus,
  ahora: CenaAhora,
  final: CenaFinal,
};

const DESTAQUES = /^(dos|millones|dólares|narco|atraparon|aeropuerto|FBI|Bogotá|juez|Luis|Benítez|Alcántara|Reclusorio|soborno|2025|Andrew|Clark|Ryan|Wedding|olímpico|snowboard|fianza|mismo|recapturado|extraditado|nueve|cargos|quince|Pegasus|Colombia|probarse|comentarios)/i;

const SONS: [CategoriaSfx, number, number, number, number?][] = [
  ['impacto', 0, 0.0, 1],
  ['subida', 0, 0.05, 0.6],
  ['pop', 0, Q('gancho', 'L0', 'millones'), 0.8],
  ['impacto', 1, Q('gancho', 'L0', 'atraparon'), 1],
  ['alarme', 1, Q('gancho', 'L0', 'atraparon') + 0.2, 0.4, 1.2],
  ['motor', 1, T('aeropuerto', 0.1), 0.35, 2.5],
  ['impacto', 2, Q('aeropuerto', 'L1', 'FBI'), 0.8],
  ['impacto', 0, Q('aeropuerto', 'L1', 'juez'), 1],
  ['tique', 0, Q('juez', 'L2', 'Cuarenta'), 0.6],
  ['mecanico', 1, Q('juez', 'L2', 'Reclusorio'), 0.6],
  ['subida', 1, Q('febrero', 'L3', 'regresar'), 0.6],
  ['whoosh', 2, Q('wedding', 'L4', 'Wedding') - 0.2, 0.8],
  ['conquista', 0, Q('wedding', 'L4', 'olímpico'), 0.5],
  ['impacto', 1, Q('wedding', 'L4', 'narcotraficante'), 0.8],
  ['mecanico', 0, Q('fianza', 'L5', 'fianza'), 0.7],
  ['acerto', 0, Q('fianza', 'L5', 'recibió'), 0.6],
  ['pop', 1, Q('fianza', 'L5', 'millones'), 0.8],
  ['erro', 0, Q('recaptura', 'L6', 'recapturado'), 0.7],
  ['whoosh', 3, Q('recaptura', 'L6', 'extraditado') - 0.3, 0.7],
  ['impacto', 2, Q('cargos', 'L7', 'nueve'), 0.9],
  ['impacto', 0, Q('cargos', 'L7', 'quince'), 1],
  ['sonar', 0, T('pegasus', 0.2), 0.6],
  ['tensao', 1, T('ahora', 0.1), 0.4, 3],
  ['pop', 2, Q('final', 'L10', 'comentarios'), 0.8],
  ...CENAS.slice(1).map((c, i) => ['whoosh', i, c.inicio - 0.15, 0.5] as [CategoriaSfx, number, number, number]),
];

const Som = ({cat, n, em, vol, dur}: {cat: CategoriaSfx; n: number; em: number; vol: number; dur?: number}) => (
  <Sequence from={Math.max(0, segFrame(em))} durationInFrames={dur ? segFrame(dur) : undefined} layout="none" name={`som: ${cat}`}>
    <Audio src={sfx(cat, n)} volume={vol * VOLUME_SFX} />
  </Sequence>
);

export const JuezDoc = () => {
  const volumeTrilha = (f: number) => 0.2 * interpolate(f, [TOTAL_FRAMES - 40, TOTAL_FRAMES], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Impacto
        zooms={[0.0, Q('gancho', 'L0', 'atraparon'), Q('aeropuerto', 'L1', 'juez'), Q('fianza', 'L5', 'recibió'), Q('cargos', 'L7', 'quince')]}
        tremidas={[
          {inicio: 0, dur: 0.4, forca: 12},
          {inicio: Q('gancho', 'L0', 'atraparon'), dur: 0.5, forca: 10},
          {inicio: Q('aeropuerto', 'L1', 'juez'), dur: 0.4, forca: 8},
        ]}
      >
        {CENAS.map((c) => {
          const Comp = COMPONENTE[c.id];
          return (
            <Sequence key={c.id} name={`Escena: ${c.id}`} from={segFrame(c.inicio)} durationInFrames={segFrame(c.fim) - segFrame(c.inicio)}>
              <Comp />
            </Sequence>
          );
        })}
      </Impacto>
      <Vinheta />

      {/* Gancho: texto grande já no primeiro quadro */}
      <Urgente inicio={-0.4} dur={R('gancho', 'L0', 'atraparon') + 1.6} selo="ÚLTIMA HORA" linhas={['JUEZ MEXICANO', 'ACUSADO DE COBRAR', 'US$ 2 MILLONES']} />

      <Carimbo inicio={T('aeropuerto', 0.2)} dur={R('aeropuerto', 'L1', 'juez') - 0.2} texto="01.11.2026  BOGOTÁ, COLOMBIA" />
      <Tarja inicio={Q('aeropuerto', 'L1', 'FBI')} dur={D('aeropuerto') - R('aeropuerto', 'L1', 'FBI')} titulo="AEROPUERTO EL DORADO" sub="POLICÍA DE COLOMBIA + FBI" topo={420} />

      <Tarja inicio={T('juez', 0.3)} dur={D('juez') - 0.4} titulo="LUIS BENÍTEZ ALCÁNTARA" sub="JUEZ FEDERAL • 49 AÑOS • RECLUSORIO SUR, CDMX" />

      <Carimbo inicio={Q('febrero', 'L3', 'febrero')} dur={D('febrero') - R('febrero', 'L3', 'febrero')} texto="◀◀ FEBRERO 2025" />

      <Tarja inicio={T('wedding', 0.3)} dur={R('wedding', 'L4', 'Wedding') - 0.4} titulo="ANDREW CLARK" sub="CANADIENSE • SEÑALADO COMO N.º 2 DE LA RED" />
      <Tarja inicio={Q('wedding', 'L4', 'Wedding')} dur={D('wedding') - R('wedding', 'L4', 'Wedding')} titulo="RYAN WEDDING" sub="EXATLETA OLÍMPICO DE SNOWBOARD" />

      <Carimbo inicio={T('fianza', 0.2)} dur={R('fianza', 'L5', 'mismo') - 0.2} texto="24.02.2025  LIBERTAD BAJO FIANZA" />
      <Contador inicio={Q('fianza', 'L5', 'recibió')} dur={D('fianza') - R('fianza', 'L5', 'recibió')} ate={2} prefixo="US$ " sufixo=" MILLONES" rotulo="SEGÚN LA ACUSACIÓN" />

      <Tarja inicio={Q('recaptura', 'L6', 'recapturado')} dur={2.6} titulo="RECAPTURADO" sub="DÍAS DESPUÉS" />

      <Numero inicio={Q('cargos', 'L7', 'nueve')} dur={R('cargos', 'L7', 'Cada') - R('cargos', 'L7', 'nueve')} valor="9" rotulo="CARGOS EN EE. UU." cor="#ffcc00" topo={280} />
      <Numero inicio={Q('cargos', 'L7', 'Cada')} dur={D('cargos') - R('cargos', 'L7', 'Cada')} valor="15 AÑOS" rotulo="MÁXIMO POR CADA CARGO" cor="#ff5a4f" topo={280} />

      <Tarja inicio={T('pegasus', 0.3)} dur={D('pegasus') - 0.4} titulo="CASO PEGASUS" sub="ESPIONAJE CON SOFTWARE MALICIOSO" />

      <Tarja inicio={T('ahora', 0.3)} dur={R('ahora', 'L9', 'cargos') - 0.4} titulo="DETENIDO EN COLOMBIA" sub="EXTRADICIÓN SIN FECHA" />
      <Tarja inicio={Q('ahora', 'L9', 'cargos')} dur={D('ahora') - R('ahora', 'L9', 'cargos')} titulo="PRESUNCIÓN DE INOCENCIA" sub="LOS CARGOS DEBEN PROBARSE EN CORTE" />

      <Comenta inicio={T('final', 0.3)} dur={D('final') - 0.3} texto="💬 ¡COMENTA!" />
      <Fontes inicio={T('final', 0.2)} dur={D('final') - 0.2} texto="Fuentes: N+, El Universal, Milenio, El Tiempo, Forbes México, Mexico News Daily." />

      <Clarao momentos={[cena('aeropuerto').inicio, cena('fianza').inicio]} />
      <Legendas falas={TODAS_FALAS} destaques={DESTAQUES} corFalando="#ffcc00" corDestaque="#3ddc84" topo="60%" tamanho={88} />

      <Audio src={staticFile('juez/trilha.mp3')} volume={volumeTrilha} />
      {TODAS_FALAS.map((f) => (
        <Sequence key={f.id} name={`Voz ${f.id}`} from={segFrame(f.inicio)} layout="none">
          <Audio src={staticFile(`juez/${f.id}.mp3`)} />
        </Sequence>
      ))}
      {SONS.map(([cat, n, em, vol, dur], i) => (
        <Som key={i} cat={cat} n={n} em={em} vol={vol} dur={dur} />
      ))}
    </AbsoluteFill>
  );
};
