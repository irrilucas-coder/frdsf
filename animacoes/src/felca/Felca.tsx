import {Audio} from '@remotion/media';
import React from 'react';
import {AbsoluteFill, Sequence, interpolate, staticFile} from 'remotion';
import {sfx, type CategoriaSfx, VOLUME_SFX} from '../sfx';
import {Clarao, Comenta, Impacto, Legendas} from '../submarino/Overlay';
import {Carimbo, Citacao, Fontes, Numero, Tarja, Urgente, Vinheta} from '../maduro/Doc';
import {ContaDesativada, Disque100, Pena, Player, Protegido} from './Cartoes';
import {
  CenaAdolescente,
  CenaAlgoritmo,
  CenaCondenacao,
  CenaCongresso,
  CenaFelca,
  CenaFinal,
  CenaGancho,
  CenaMp,
  CenaPrisao,
  CenaTj,
  CenaVideo,
  CenaViral,
} from './Cenas';
import {CENAS, FPS, TODAS_FALAS, TOTAL_FRAMES, cena, type CenaId, duracaoCena, quandoDiz, segFrame} from './roteiro';

const T = (id: CenaId, rel: number) => cena(id).inicio + rel;
const Q = (id: CenaId, fala: string, palavra: string) => T(id, quandoDiz(id, fala, palavra));
const D = duracaoCena;
const R = (id: CenaId, fala: string, palavra: string) => quandoDiz(id, fala, palavra);

const COMPONENTE: Record<CenaId, React.FC> = {
  gancho: CenaGancho,
  video: CenaVideo,
  algoritmo: CenaAlgoritmo,
  adolescente: CenaAdolescente,
  viral: CenaViral,
  mp: CenaMp,
  prisao: CenaPrisao,
  congresso: CenaCongresso,
  condenacao: CenaCondenacao,
  tj: CenaTj,
  felca: CenaFelca,
  final: CenaFinal,
};

const DESTAQUES = /^(YouTube|lei|prisão|Felca|Adultização|2025|2026|algoritmos|Hytalo|dezessete|quinze|milhões|desativado|Ministério|Público|Israel|presos|Paulo|João|Pessoa|ECA|Digital|onze|oito|condenou|recorre|seguranças|ameaças|marco|Disque|100|Comenta|crianças)/i;

const SONS: [CategoriaSfx, number, number, number, number?][] = [
  ['impacto', 0, 0.35, 0.8],
  ['subida', 0, Q('gancho', 'L0', 'lei') - 0.6, 0.5],
  ['impacto', 1, Q('gancho', 'L0', 'prisão'), 0.9],
  ['pop', 0, T('video', 0.4), 0.7],
  ['tique', 0, Q('video', 'L1', 'Adultização'), 0.5],
  ['whoosh', 0, Q('algoritmo', 'L2', 'algoritmos'), 0.6],
  ['impacto', 2, Q('algoritmo', 'L2', 'Hytalo'), 0.9],
  ['tensao', 1, T('adolescente', 0.1), 0.45, 3],
  ['subida', 1, T('viral', 0.2), 0.5],
  ['pop', 1, Q('viral', 'L4', 'quinze'), 0.6],
  ['erro', 0, Q('viral', 'L4', 'desativado') - 0.1, 0.7],
  ['impacto', 0, Q('mp', 'L5', 'pediu'), 0.8],
  ['alarme', 2, T('prisao', 0.2), 0.45, 1.6],
  ['mecanico', 0, Q('prisao', 'L6', 'presos'), 0.6],
  ['whoosh', 3, Q('prisao', 'L6', 'levados'), 0.7],
  ['conquista', 0, Q('congresso', 'L7', 'recorde'), 0.5],
  ['impacto', 1, Q('congresso', 'L7', 'proíbe'), 0.8],
  ['impacto', 2, T('condenacao', 0.3), 0.6],
  ['impacto', 0, Q('condenacao', 'L8', 'onze'), 1],
  ['impacto', 1, Q('condenacao', 'L8', 'oito'), 0.9],
  ['mecanico', 1, Q('tj', 'L9', 'manteve'), 0.6],
  ['tensao', 2, T('felca', 0.1), 0.4, 2.5],
  ['acerto', 1, Q('felca', 'L10', 'marco'), 0.5],
  ['pop', 2, Q('final', 'L11', 'Disque'), 0.8],
  ['pop', 3, Q('final', 'L11', 'Comenta'), 0.8],
  ...CENAS.slice(1).map((c, i) => ['whoosh', i, c.inicio - 0.15, 0.45] as [CategoriaSfx, number, number, number]),
];

const Som = ({cat, n, em, vol, dur}: {cat: CategoriaSfx; n: number; em: number; vol: number; dur?: number}) => (
  <Sequence from={Math.max(0, segFrame(em))} durationInFrames={dur ? segFrame(dur) : undefined} layout="none" name={`som: ${cat}`}>
    <Audio src={sfx(cat, n)} volume={vol * VOLUME_SFX} />
  </Sequence>
);

export const FelcaDoc = () => {
  const volumeTrilha = (f: number) => 0.2 * interpolate(f, [TOTAL_FRAMES - 40, TOTAL_FRAMES], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Impacto
        zooms={[0.35, Q('gancho', 'L0', 'prisão'), Q('algoritmo', 'L2', 'Hytalo'), Q('viral', 'L4', 'desativado'), Q('condenacao', 'L8', 'onze')]}
        tremidas={[{inicio: Q('condenacao', 'L8', 'onze'), dur: 0.5, forca: 8}]}
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

      {/* ---------- Elementos de documentário ---------- */}
      <Urgente inicio={0.3} dur={D('gancho') - 0.3} selo="O CASO QUE MUDOU A INTERNET" linhas={['FELCA', 'X', 'HYTALO SANTOS']} />

      <Player inicio={T('video', 0.3)} dur={R('video', 'L1', 'Felca') - 0.2} />
      <Tarja inicio={Q('video', 'L1', 'Felca')} dur={D('video') - R('video', 'L1', 'Felca')} titulo="FELCA" sub="YOUTUBER • FELIPE BRESSANIM PEREIRA" />

      <Tarja inicio={T('algoritmo', 0.3)} dur={R('algoritmo', 'L2', 'deles') - 0.4} titulo="O ALGORITMO" sub="ENTREGA E ESPALHA ESSE CONTEÚDO" />
      <Tarja inicio={Q('algoritmo', 'L2', 'Hytalo')} dur={D('algoritmo') - R('algoritmo', 'L2', 'Hytalo')} titulo="HYTALO SANTOS" sub="INFLUENCIADOR • PARAÍBA" />

      <Protegido inicio={T('adolescente', 0.3)} dur={D('adolescente') - 0.4} />

      <Player inicio={T('viral', 0.2)} dur={R('viral', 'L4', 'Dois') - 0.1} views />
      <ContaDesativada inicio={Q('viral', 'L4', 'Dois')} dur={D('viral') - R('viral', 'L4', 'Dois')} />

      <Tarja inicio={T('mp', 0.3)} dur={D('mp') - 0.4} titulo="MINISTÉRIO PÚBLICO DA PARAÍBA" sub="GAECO • PEDIDO DE PRISÃO" />

      <Carimbo inicio={T('prisao', 0.2)} dur={R('prisao', 'L6', 'levados') - 0.2} texto="15.08.2025  SÃO PAULO" />
      <Tarja inicio={Q('prisao', 'L6', 'presos')} dur={2.4} titulo="HYTALO E ISRAEL PRESOS" sub="PRISÃO PREVENTIVA" topo={420} />
      <Tarja inicio={Q('prisao', 'L6', 'levados')} dur={D('prisao') - R('prisao', 'L6', 'levados')} titulo="SÃO PAULO → JOÃO PESSOA" sub="PRESÍDIO NA PARAÍBA" />

      <Tarja inicio={T('congresso', 0.3)} dur={R('congresso', 'L7', 'proíbe') - 0.4} titulo="ECA DIGITAL • LEI 15.211" sub="APELIDADA DE “LEI FELCA”" />
      <Citacao inicio={Q('congresso', 'L7', 'proíbe')} dur={D('congresso') - R('congresso', 'L7', 'proíbe')} texto="Proibido lucrar com conteúdo que sexualize menores" autor="resumo da lei (em vigor desde mar. 2026)" />

      <Tarja inicio={T('condenacao', 0.3)} dur={R('condenacao', 'L8', 'Hytalo') - 0.4} titulo="FEVEREIRO DE 2026" sub="SENTENÇA EM PRIMEIRA INSTÂNCIA" />
      <Pena inicio={Q('condenacao', 'L8', 'onze')} dur={D('condenacao') - R('condenacao', 'L8', 'onze')} nome="HYTALO" pena="11 ANOS E 4 MESES" topo={260} />
      <Pena inicio={Q('condenacao', 'L8', 'oito')} dur={D('condenacao') - R('condenacao', 'L8', 'oito')} nome="ISRAEL" pena="8 ANOS E 10 MESES" topo={380} />

      <Tarja inicio={T('tj', 0.3)} dur={R('tj', 'L9', 'novembro') - 0.4} titulo="CABE RECURSO" sub="A DEFESA RECORRE DA CONDENAÇÃO" />
      <Tarja inicio={Q('tj', 'L9', 'novembro')} dur={D('tj') - R('tj', 'L9', 'novembro')} titulo="TJPB • NOV. 2026" sub="PRISÃO PREVENTIVA MANTIDA" />

      <Numero inicio={T('felca', 0.3)} dur={R('felca', 'L10', 'Mas') - 0.4} valor="15 MI+" rotulo="VISUALIZAÇÕES DO VÍDEO" cor="#ffcc00" topo={270} />
      <Tarja inicio={Q('felca', 'L10', 'marco')} dur={D('felca') - R('felca', 'L10', 'marco')} titulo="UM MARCO" sub="NA PROTEÇÃO DE CRIANÇAS NA INTERNET" />

      <Disque100 inicio={T('final', 0.2)} dur={R('final', 'L11', 'Comenta') - 0.1} />
      <Comenta inicio={Q('final', 'L11', 'Comenta') - 0.1} dur={D('final') - R('final', 'L11', 'Comenta') + 0.1} />
      <Fontes inicio={T('final', 0.2)} dur={D('final') - 0.2} texto="Fontes: CNN Brasil, Terra, Migalhas, Metrópoles, Diário do Nordeste. Recriação ilustrativa." />

      <Clarao momentos={[cena('prisao').inicio, cena('condenacao').inicio]} />
      <Legendas falas={TODAS_FALAS} destaques={DESTAQUES} corFalando="#ffcc00" corDestaque="#ff5a4f" topo="60%" tamanho={88} />

      {/* ---------- Áudio ---------- */}
      <Audio src={staticFile('felca/trilha.mp3')} volume={volumeTrilha} />
      {TODAS_FALAS.map((f) => (
        <Sequence key={f.id} name={`Voz ${f.id}`} from={segFrame(f.inicio)} layout="none">
          <Audio src={staticFile(`felca/${f.id}.mp3`)} />
        </Sequence>
      ))}
      {SONS.map(([cat, n, em, vol, dur], i) => (
        <Som key={i} cat={cat} n={n} em={em} vol={vol} dur={dur} />
      ))}
    </AbsoluteFill>
  );
};
