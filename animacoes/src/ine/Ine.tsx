import {Audio} from '@remotion/media';
import React from 'react';
import {AbsoluteFill, Sequence, interpolate, staticFile} from 'remotion';
import {sfx, type CategoriaSfx, VOLUME_SFX} from '../sfx';
import {Clarao, Comenta, Impacto, Legendas} from '../submarino/Overlay';
import {Carimbo, Citacao, Fontes, Numero, Tarja, Urgente, Vinheta} from '../maduro/Doc';
import {CenaAsf, CenaEleccion, CenaFgr, CenaFinal, CenaGancho, CenaIne, CenaInterina, CenaOjo, CenaOrigen, CenaTaddei, CenaUif} from './Cenas';
import {CENAS, FPS, TODAS_FALAS, TOTAL_FRAMES, cena, type CenaId, duracaoCena, quandoDiz, segFrame} from './roteiro';

const T = (id: CenaId, rel: number) => cena(id).inicio + rel;
const Q = (id: CenaId, fala: string, palavra: string) => T(id, quandoDiz(id, fala, palavra));
const R = quandoDiz;
const D = duracaoCena;

const COMPONENTE: Record<CenaId, React.FC> = {
  gancho: CenaGancho,
  uif: CenaUif,
  ine: CenaIne,
  taddei: CenaTaddei,
  ojo: CenaOjo,
  origen: CenaOrigen,
  fgr: CenaFgr,
  asf: CenaAsf,
  interina: CenaInterina,
  eleccion: CenaEleccion,
  final: CenaFinal,
};

const DESTAQUES = /^(Congelaron|cuarenta|INE|expresidenta|Unidad|Inteligencia|Financiera|veinticinco|quince|bloqueadas|Instituto|Nacional|Electoral|árbitro|Guadalupe|Taddei|renunció|ojo|confirmado|preventiva|condena|conflictos|interés|Fiscalía|Auditoría|Superior|Blanca|interina|2027|recorte|confías|comentarios)/i;

const SONS: [CategoriaSfx, number, number, number, number?][] = [
  ['impacto', 0, 0.0, 1],
  ['agua', 0, 0.05, 0.6],
  ['agua', 2, 0.6, 0.5],
  ['agua', 1, 1.2, 0.5],
  ['impacto', 1, Q('gancho', 'L0', 'expresidenta'), 1],
  ['mecanico', 1, Q('gancho', 'L0', 'expresidenta') + 0.35, 0.8],
  ['tique', 0, Q('uif', 'L1', 'veinticinco'), 0.6],
  ['tique', 1, Q('uif', 'L1', 'quince'), 0.6],
  ['impacto', 2, Q('uif', 'L1', 'bloqueadas'), 0.8],
  ['pop', 0, Q('ine', 'L2', 'árbitro'), 0.6],
  ['impacto', 0, Q('taddei', 'L3', 'Guadalupe'), 0.9],
  ['whoosh', 2, Q('taddei', 'L3', 'renunció'), 0.6],
  ['erro', 1, Q('ojo', 'L4', 'ojo'), 0.7],
  ['impacto', 1, Q('ojo', 'L4', 'preventiva'), 0.7],
  ['tique', 2, Q('origen', 'L5', 'investigaciones'), 0.5],
  ['impacto', 2, Q('fgr', 'L6', 'denuncia'), 0.8],
  ['mecanico', 0, Q('asf', 'L7', 'auditoría'), 0.6],
  ['conquista', 1, Q('interina', 'L8', 'interina') - 0.2, 0.4],
  ['subida', 2, Q('eleccion', 'L9', '2027') - 0.5, 0.6],
  ['impacto', 0, Q('eleccion', 'L9', 'recorte'), 0.9],
  ['pop', 2, Q('final', 'L10', 'comentarios'), 0.8],
  ...CENAS.slice(1).map((c, i) => ['whoosh', i, c.inicio - 0.15, 0.5] as [CategoriaSfx, number, number, number]),
];

const Som = ({cat, n, em, vol, dur}: {cat: CategoriaSfx; n: number; em: number; vol: number; dur?: number}) => (
  <Sequence from={Math.max(0, segFrame(em))} durationInFrames={dur ? segFrame(dur) : undefined} layout="none" name={`som: ${cat}`}>
    <Audio src={sfx(cat, n)} volume={vol * VOLUME_SFX} />
  </Sequence>
);

export const IneDoc = () => {
  const volumeTrilha = (f: number) => 0.2 * interpolate(f, [TOTAL_FRAMES - 40, TOTAL_FRAMES], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Impacto
        zooms={[0.0, Q('gancho', 'L0', 'expresidenta'), Q('uif', 'L1', 'bloqueadas'), Q('ojo', 'L4', 'ojo'), Q('eleccion', 'L9', 'recorte')]}
        tremidas={[
          {inicio: 0, dur: 0.4, forca: 12},
          {inicio: Q('gancho', 'L0', 'expresidenta'), dur: 0.5, forca: 10},
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

      {/* Gancho visível já no primeiro quadro */}
      <Urgente inicio={-0.4} dur={R('gancho', 'L0', 'expresidenta') + 1.2} selo="ESCÁNDALO EN EL INE" linhas={['40 CUENTAS', 'CONGELADAS']} />

      <Carimbo inicio={T('uif', 0.2)} dur={D('uif') - 0.3} texto="04.11.2026  UIF • HACIENDA" />
      <Numero inicio={Q('uif', 'L1', 'veinticinco')} dur={R('uif', 'L1', 'quince') - R('uif', 'L1', 'veinticinco')} valor="25" rotulo="PERSONAS" cor="#ffcc00" topo={300} />
      <Numero inicio={Q('uif', 'L1', 'quince')} dur={D('uif') - R('uif', 'L1', 'quince')} valor="15" rotulo="EMPRESAS" cor="#ffcc00" topo={300} />

      <Tarja inicio={T('ine', 0.3)} dur={D('ine') - 0.4} titulo="INSTITUTO NACIONAL ELECTORAL" sub="ORGANIZA LAS ELECCIONES EN MÉXICO" />

      <Tarja inicio={Q('taddei', 'L3', 'Guadalupe')} dur={D('taddei') - R('taddei', 'L3', 'Guadalupe')} titulo="GUADALUPE TADDEI" sub="EXPRESIDENTA DEL INE • RENUNCIÓ EN OCTUBRE" />

      <Citacao inicio={T('ojo', 0.3)} dur={R('ojo', 'L4', 'bloqueo') - 0.4} texto="Sin confirmación oficial sobre la cuenta de Taddei" autor="UIF, según La Razón" />
      <Tarja inicio={Q('ojo', 'L4', 'bloqueo')} dur={D('ojo') - R('ojo', 'L4', 'bloqueo')} titulo="MEDIDA PREVENTIVA" sub="NO ES UNA CONDENA" />

      <Tarja inicio={T('origen', 0.3)} dur={D('origen') - 0.4} titulo="INVESTIGACIONES PERIODÍSTICAS" sub="POSIBLES CONFLICTOS DE INTERÉS EN CONTRATOS" />
      <Tarja inicio={T('fgr', 0.3)} dur={D('fgr') - 0.4} titulo="DENUNCIA ANTE LA FGR" sub="SEGÚN FUENTES DEL GOBIERNO FEDERAL" />
      <Tarja inicio={T('asf', 0.3)} dur={D('asf') - 0.4} titulo="AUDITORÍA SUPERIOR DE LA FEDERACIÓN" sub="AUDITORÍA INTEGRAL AL INE Y OPLES" />
      <Tarja inicio={T('interina', 0.3)} dur={D('interina') - 0.4} titulo="BLANCA YASSAHARA CRUZ GARCÍA" sub="PRESIDENTA INTERINA DEL INE" />

      <Numero inicio={Q('eleccion', 'L9', '2027')} dur={R('eleccion', 'L9', 'Congreso') - R('eleccion', 'L9', '2027') - 0.1} valor="2027" rotulo="ELECCIÓN EN PUERTA" cor="#ff5a9f" topo={280} />
      <Tarja inicio={Q('eleccion', 'L9', 'Congreso')} dur={D('eleccion') - R('eleccion', 'L9', 'Congreso')} titulo="PRESUPUESTO 2027" sub="DIPUTADOS DISCUTEN RECORTE AL INE" />

      <Comenta inicio={T('final', 0.3)} dur={D('final') - 0.3} texto="💬 ¡COMENTA!" />
      <Fontes inicio={T('final', 0.2)} dur={D('final') - 0.2} texto="Fuentes: El Financiero, La Razón, AM, SDP Noticias, Milenio. Información al 6/11/2026." />

      <Clarao momentos={[cena('uif').inicio, cena('ojo').inicio]} />
      <Legendas falas={TODAS_FALAS} destaques={DESTAQUES} corFalando="#ffcc00" corDestaque="#ff5a9f" topo="60%" tamanho={88} />

      <Audio src={staticFile('ine/trilha.mp3')} volume={volumeTrilha} />
      {TODAS_FALAS.map((f) => (
        <Sequence key={f.id} name={`Voz ${f.id}`} from={segFrame(f.inicio)} layout="none">
          <Audio src={staticFile(`ine/${f.id}.mp3`)} />
        </Sequence>
      ))}
      {SONS.map(([cat, n, em, vol, dur], i) => (
        <Som key={i} cat={cat} n={n} em={em} vol={vol} dur={dur} />
      ))}
    </AbsoluteFill>
  );
};
