import {Audio} from '@remotion/media';
import React from 'react';
import {AbsoluteFill, Sequence, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {sfx, type CategoriaSfx, VOLUME_SFX} from '../sfx';
import {Clarao, Impacto, Legendas} from '../submarino/Overlay';
import {Vinheta} from '../maduro/Doc';
import {Manda, Painel2, Pergunta, Pilula, Rebobina} from '../elevador/Hud';
import {CenaAbs, CenaDisco, CenaFinal, CenaFluido, CenaFogo, CenaGancho, CenaPe, CenaPerde, CenaQuatropes, CenaSapata, CenaTambor, CenaTrava, painelEm} from './Cenas';
import {CENAS, FPS, TODAS_FALAS, TOTAL_FRAMES, cena, type CenaId, duracaoCena, quandoDiz, segFrame} from './roteiro';

const T = (id: CenaId, rel: number) => cena(id).inicio + rel;
const Q = (id: CenaId, fala: string, palavra: string) => T(id, quandoDiz(id, fala, palavra));
const D = duracaoCena;
const R = quandoDiz;

const COMPONENTE: Record<CenaId, React.FC> = {
  gancho: CenaGancho,
  pe: CenaPe,
  sapata: CenaSapata,
  fogo: CenaFogo,
  tambor: CenaTambor,
  perde: CenaPerde,
  disco: CenaDisco,
  quatropes: CenaQuatropes,
  fluido: CenaFluido,
  trava: CenaTrava,
  abs: CenaAbs,
  final: CenaFinal,
};

const DESTAQUES = /^(cem|parar|pé|sola|madeira|atrito|sapata|fogo|tambor|força|disco|pastilhas|vento|quatro|pés|óleo|fluido|trava|controle|sensor|ABS|Parabéns|Manda)/i;

const PainelFreio = () => {
  const frame = useCurrentFrame();
  const sAbs = frame / FPS;
  const c = CENAS.find((x) => sAbs < x.fim) ?? CENAS[CENAS.length - 1];
  const p = painelEm(c.id, sAbs - c.inicio);
  if (!p) return null;
  return (
    <Painel2
      a={{rotulo: 'VELOCIDADE', valor: String(Math.round(p.vel)), unidade: 'km/h'}}
      b={{rotulo: 'TEMP. DO FREIO', valor: String(Math.round(p.temp)), unidade: '°C', perigo: p.temp > 300}}
    />
  );
};

const SONS: [CategoriaSfx, number, number, number, number?][] = [
  ['impacto', 0, 0.0, 1],
  ['motor', 1, 0.05, 0.5, 3],
  ['whoosh', 0, 0.3, 0.8],
  ['mecanico', 1, Q('pe', 'L1', 'chão'), 0.6],
  ['erro', 0, Q('pe', 'L1', 'pé.') , 0.6],
  ['mecanico', 0, Q('sapata', 'L2', 'alavanca'), 0.7],
  ['pop', 0, Q('sapata', 'L2', 'sapata'), 0.8],
  ['impacto', 2, Q('fogo', 'L3', 'fogo'), 1],
  ['tensao', 0, T('fogo', 0.2), 0.4, 2],
  ['mecanico', 2, Q('tambor', 'L4', 'empurra'), 0.7],
  ['pop', 1, Q('tambor', 'L4', 'tambor.'), 0.8],
  ['erro', 1, Q('perde', 'L5', 'força'), 0.7],
  ['mecanico', 1, Q('disco', 'L6', 'apertam'), 0.7],
  ['whoosh', 2, Q('disco', 'L6', 'vento'), 0.7],
  ['pop', 2, Q('disco', 'L6', 'disco.'), 0.8],
  ['erro', 2, Q('quatropes', 'L7', 'pés'), 0.5],
  ['subida', 0, Q('fluido', 'L8', 'pisa'), 0.6],
  ['pop', 3, Q('fluido', 'L8', 'fluido'), 0.8],
  ['alarme', 2, T('trava', 0.1), 0.4, 1.2],
  ['impacto', 1, Q('trava', 'L9', 'trava'), 0.9],
  ['whoosh', 1, Q('trava', 'L9', 'controle'), 0.8],
  ['sonar', 1, Q('abs', 'L10', 'sensor'), 0.6],
  ['tique', 0, Q('abs', 'L10', 'solta'), 0.6],
  ['tique', 1, Q('abs', 'L10', 'solta') + 0.2, 0.6],
  ['tique', 2, Q('abs', 'L10', 'solta') + 0.4, 0.6],
  ['pop', 0, Q('abs', 'L10', 'ABS'), 0.9],
  ['conquista', 1, Q('final', 'L11', 'Parabéns'), 0.8],
  ['pop', 1, Q('final', 'L11', 'Manda'), 0.9],
  ...CENAS.slice(1).map((c, i) => ['whoosh', i, c.inicio - 0.12, 0.45] as [CategoriaSfx, number, number, number]),
];

const Som = ({cat, n, em, vol, dur}: {cat: CategoriaSfx; n: number; em: number; vol: number; dur?: number}) => (
  <Sequence from={Math.max(0, segFrame(em))} durationInFrames={dur ? Math.max(1, segFrame(dur)) : undefined} layout="none" name={`som: ${cat}`}>
    <Audio src={sfx(cat, n)} volume={vol * VOLUME_SFX} />
  </Sequence>
);

export const FreioVideo = () => {
  const volumeTrilha = (f: number) => 0.09 * interpolate(f, [TOTAL_FRAMES - 40, TOTAL_FRAMES], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Impacto
        zooms={[0, Q('fogo', 'L3', 'fogo'), Q('trava', 'L9', 'trava'), Q('abs', 'L10', 'ABS'), Q('final', 'L11', 'Parabéns')]}
        tremidas={[
          {inicio: 0, dur: 0.4, forca: 10},
          {inicio: Q('trava', 'L9', 'trava'), dur: 0.8, forca: 14},
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
      <PainelFreio />

      <Pergunta dur={D('gancho')} linhas={[['COMO UM CARRO'], ['A 100 KM/H', true], ['CONSEGUE PARAR?']]} />
      <Rebobina inicio={T('pe', D('pe') - 0.5)} dur={0.7} />
      <Pilula inicio={Q('pe', 'L1', 'sola')} dur={2} texto="– SOLA" cor="vermelho" />
      <Pilula inicio={Q('sapata', 'L2', 'sapata')} dur={D('sapata') - R('sapata', 'L2', 'sapata')} texto="FREIO DE SAPATA" />
      <Pilula inicio={Q('fogo', 'L3', 'fogo')} dur={D('fogo') - R('fogo', 'L3', 'fogo')} texto="PEGOU FOGO" cor="vermelho" rot={-5} />
      <Rebobina inicio={T('fogo', D('fogo') - 0.5)} dur={0.7} />
      <Pilula inicio={Q('tambor', 'L4', 'tambor.')} dur={D('tambor') - R('tambor', 'L4', 'tambor.')} texto="FREIO A TAMBOR" />
      <Pilula inicio={Q('perde', 'L5', 'força')} dur={D('perde') - R('perde', 'L5', 'força')} texto="PERDEU A FORÇA" cor="vermelho" rot={4} />
      <Pilula inicio={Q('disco', 'L6', 'pastilhas')} dur={2.2} texto="PASTILHAS" />
      <Pilula inicio={Q('disco', 'L6', 'disco.')} dur={D('disco') - R('disco', 'L6', 'disco.')} texto="FREIO A DISCO" />
      <Pilula inicio={Q('quatropes', 'L7', 'quatro')} dur={D('quatropes') - R('quatropes', 'L7', 'quatro')} texto="4 PÉS?" cor="vermelho" rot={-4} />
      <Pilula inicio={Q('fluido', 'L8', 'fluido')} dur={D('fluido') - R('fluido', 'L8', 'fluido')} texto="FLUIDO DE FREIO" />
      <Pilula inicio={Q('trava', 'L9', 'trava')} dur={D('trava') - R('trava', 'L9', 'trava')} texto="RODA TRAVADA" cor="vermelho" rot={5} />
      <Rebobina inicio={T('trava', D('trava') - 0.5)} dur={0.7} />
      <Pilula inicio={Q('abs', 'L10', 'ABS')} dur={D('abs') - R('abs', 'L10', 'ABS')} texto="ABS" />
      <Pilula inicio={Q('final', 'L11', 'Parabéns')} dur={R('final', 'L11', 'Conhece') - R('final', 'L11', 'Parabéns')} texto="PAROU CERTINHO ✅" cor="verde" />
      <Manda inicio={Q('final', 'L11', 'Manda') - 0.3} dur={D('final') - R('final', 'L11', 'Manda') + 0.3} />

      <Clarao momentos={[cena('tambor').inicio, cena('disco').inicio, cena('abs').inicio]} />
      <Legendas falas={TODAS_FALAS} destaques={DESTAQUES} corFalando="#ffcc00" corDestaque="#ffffff" topo="66%" tamanho={66} umaLinha maxPalavras={3} />

      {/* Música: "Monkeys Spinning Monkeys" – Kevin MacLeod (incompetech.com), CC BY 3.0 */}
      <Audio src={staticFile('musicas/curiosidade/monkeys-spinning-monkeys.mp3')} volume={volumeTrilha} loop />
      {TODAS_FALAS.map((f) => (
        <Sequence key={f.id} name={`Voz ${f.id}`} from={segFrame(f.inicio)} layout="none">
          <Audio src={staticFile(`freio/${f.id}.mp3`)} />
        </Sequence>
      ))}
      {SONS.filter(([, , , v]) => v > 0).map(([cat, n, em, vol, dur], i) => (
        <Som key={i} cat={cat} n={n} em={em} vol={vol} dur={dur} />
      ))}
    </AbsoluteFill>
  );
};
