import {Audio} from '@remotion/media';
import React from 'react';
import {AbsoluteFill, Sequence, interpolate, staticFile} from 'remotion';
import {sfx, type CategoriaSfx, VOLUME_SFX} from '../sfx';
import {Clarao, Comenta, Impacto, Legendas, Progresso} from '../submarino/Overlay';
import {
  CenaAnuncio,
  CenaAtaque,
  CenaCaptura,
  CenaCia,
  CenaContexto,
  CenaDebate,
  CenaDelcy,
  CenaFinal,
  CenaGancho,
  CenaIwoJima,
  CenaPortaAvioes,
  CenaTribunal,
} from './Cenas';
import {Carimbo, Celular, Citacao, Contador, Fontes, Numero, Recriacao, Tarja, Urgente, Vinheta} from './Doc';
import {CENAS, FPS, TODAS_FALAS, TOTAL_FRAMES, cena, type CenaId, duracaoCena, quandoDiz, segFrame} from './roteiro';

const T = (id: CenaId, rel: number) => cena(id).inicio + rel;
const Q = (id: CenaId, fala: string, palavra: string) => T(id, quandoDiz(id, fala, palavra));
const D = duracaoCena;

const COMPONENTE: Record<CenaId, React.FC> = {
  gancho: CenaGancho,
  contexto: CenaContexto,
  portaavioes: CenaPortaAvioes,
  cia: CenaCia,
  ataque: CenaAtaque,
  captura: CenaCaptura,
  iwojima: CenaIwoJima,
  anuncio: CenaAnuncio,
  tribunal: CenaTribunal,
  delcy: CenaDelcy,
  debate: CenaDebate,
  final: CenaFinal,
};

// Palavras em destaque na legenda
const DESTAQUES = /^(2026|2025|Maduro|Nicolás|Estados|Unidos|Trump|CIA|cinquenta|milhões|dólares|Cartel|Gerald|Ford|Caracas|cento|cinquenta|aeronaves|Cilia|Flores|Iwo|Jima|Nova|York|Manhattan|inocente|sequestrado|Delcy|Rodríguez|trinta|dois|legalidade|Comenta|capturaram|capturaram)/i;

// Efeitos: [categoria, versão, segundo absoluto, volume relativo, duração máx]
const fimCena = (id: CenaId) => cena(id).fim;
const SONS: [CategoriaSfx, number, number, number, number?][] = [
  ['alarme', 0, 0.1, 0.5, 2.5],
  ['impacto', 0, 0.45, 0.9],
  ['explosao', 0, Q('gancho', 'L0', 'Em') + 0.5, 0.9],
  ['impacto', 1, Q('contexto', 'L1', 'Cartel'), 0.8],
  ['subida', 0, Q('contexto', 'L1', 'agosto') + 0.5, 0.6],
  ['conquista', 1, Q('contexto', 'L1', 'cinquenta'), 0.6],
  ['whoosh', 0, Q('portaavioes', 'L2', 'maior') , 0.8],
  ['whoosh', 2, Q('portaavioes', 'L2', 'maior') + 1.4, 0.7],
  ['explosao', 1, Q('portaavioes', 'L2', 'Barcos') + 1.6, 0.6],
  ['sonar', 0, T('cia', 0.3), 0.7],
  ['sonar', 1, T('cia', 2.4), 0.6],
  ['tique', 0, Q('cia', 'L3', 'passo'), 0.6],
  ['impacto', 2, Q('cia', 'L3', 'verde'), 0.8],
  ['motor', 0, T('ataque', 0.2), 0.45, 3],
  ['whoosh', 1, Q('ataque', 'L4', 'aeronaves'), 0.8],
  ['explosao', 0, Q('ataque', 'L4', 'Explosões'), 1],
  ['explosao', 2, Q('ataque', 'L4', 'Explosões') + 0.7, 0.9],
  ['explosao', 1, Q('ataque', 'L4', 'Explosões') + 1.4, 0.8],
  ['motor', 2, T('captura', 0.1), 0.4, 2.2],
  ['impacto', 0, Q('captura', 'L5', 'invadiram'), 0.9],
  ['impacto', 1, Q('captura', 'L5', 'capturaram'), 1],
  ['subida', 1, T('iwojima', 0.2), 0.5],
  ['whoosh', 3, Q('iwojima', 'L6', 'Nova') - 0.4, 0.8],
  ['pop', 0, T('anuncio', 0.4), 0.8],
  ['tique', 1, T('anuncio', 0.9), 0.6],
  ['impacto', 2, T('tribunal', 0.3), 0.6],
  ['mecanico', 1, Q('tribunal', 'L8', 'inocente') - 0.3, 0.7],
  ['impacto', 0, Q('delcy', 'L9', 'sequestrado'), 0.6],
  ['conquista', 2, Q('delcy', 'L9', 'interina') - 0.2, 0.4],
  ['tensao', 1, T('debate', 0.2), 0.5, 3],
  ['impacto', 1, Q('debate', 'L10', 'trinta'), 0.7],
  ['subida', 2, Q('debate', 'L10', 'legalidade'), 0.6],
  ['pop', 2, Q('final', 'L11', 'Comenta'), 0.9],
  ['acerto', 1, Q('final', 'L11', 'Comenta') + 0.2, 0.5],
  ...CENAS.slice(1).map((c, i) => ['whoosh', i, c.inicio - 0.15, 0.5] as [CategoriaSfx, number, number, number]),
];

const Som = ({cat, n, em, vol, dur}: {cat: CategoriaSfx; n: number; em: number; vol: number; dur?: number}) => (
  <Sequence from={Math.max(0, segFrame(em))} durationInFrames={dur ? segFrame(dur) : undefined} layout="none" name={`som: ${cat}`}>
    <Audio src={sfx(cat, n)} volume={vol * VOLUME_SFX} />
  </Sequence>
);

export const MaduroDoc = () => {
  const ataque = cena('ataque');
  const volumeTrilha = (f: number) => {
    const s = f / FPS;
    const fim = interpolate(f, [TOTAL_FRAMES - 40, TOTAL_FRAMES], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
    const acao = interpolate(s, [ataque.inicio - 0.5, ataque.inicio, cena('captura').fim, cena('captura').fim + 0.5], [1, 1.25, 1.25, 1], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
    return 0.22 * fim * acao;
  };
  const tExpl = Q('ataque', 'L4', 'Explosões');

  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Impacto
        zooms={[0.45, Q('gancho', 'L0', 'capturaram'), Q('contexto', 'L1', 'cinquenta'), tExpl, Q('captura', 'L5', 'capturaram'), Q('tribunal', 'L8', 'inocente')]}
        tremidas={[
          {inicio: Q('gancho', 'L0', 'Em') + 0.5, dur: 0.8, forca: 10},
          {inicio: tExpl, dur: 2.2, forca: 18},
          {inicio: Q('captura', 'L5', 'invadiram'), dur: 0.5, forca: 10},
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

      {/* ---------- Elementos de documentário ---------- */}
      <Urgente inicio={0.3} dur={Q('gancho', 'L0', 'Em') - 0.3} />
      <Carimbo inicio={Q('gancho', 'L0', 'Em')} dur={D('gancho') - quandoDiz('gancho', 'L0', 'Em')} texto="03.01.2026  02:00  CARACAS" />
      <Tarja inicio={Q('gancho', 'L0', 'Nicolás')} dur={2.6} titulo="NICOLÁS MADURO" sub="PRESIDENTE DA VENEZUELA" />

      <Tarja inicio={T('contexto', 0.3)} dur={3.2} titulo="ACUSAÇÃO DOS EUA" sub="NARCOTRÁFICO • CARTEL DE LOS SOLES" />
      <Contador inicio={Q('contexto', 'L1', 'cinquenta')} dur={D('contexto') - quandoDiz('contexto', 'L1', 'cinquenta')} ate={50} prefixo="US$ " sufixo=" MI" />

      <Tarja inicio={T('portaavioes', 0.3)} dur={3.4} titulo="USS GERALD R. FORD" sub="NOV. 2025 • MAR DO CARIBE" />
      <Tarja inicio={Q('portaavioes', 'L2', 'Barcos')} dur={2.8} titulo="ATAQUES A BARCOS" sub="DESDE SET. 2025" topo={420} />

      <Carimbo inicio={T('cia', 0.2)} dur={quandoDiz('cia', 'L3', 'Pouco') - 0.2} texto="ALVO: MONITORADO" />
      <Tarja inicio={Q('cia', 'L3', 'Pouco')} dur={D('cia') - quandoDiz('cia', 'L3', 'Pouco')} titulo="SINAL VERDE" sub="DEZ. 2025 • CASA BRANCA" />

      <Carimbo inicio={T('ataque', 0.2)} dur={D('ataque') - 0.3} texto="03.01.2026  02:00  CARACAS" />
      <Numero inicio={Q('ataque', 'L4', 'cento')} dur={2.6} valor="+150" rotulo="AERONAVES" cor="#ffcc00" topo={300} />

      <Tarja inicio={T('captura', 0.4)} dur={2.6} titulo="OPERAÇÃO RESOLUÇÃO ABSOLUTA" sub="FORÇAS ESPECIAIS DOS EUA" />
      <Tarja inicio={Q('captura', 'L5', 'Cilia')} dur={D('captura') - quandoDiz('captura', 'L5', 'Cilia')} titulo="MADURO E CILIA FLORES" sub="CAPTURADOS" topo={420} />

      <Tarja inicio={T('iwojima', 0.3)} dur={2.5} titulo="USS IWO JIMA" sub="NAVIO DA MARINHA DOS EUA" />

      <Celular inicio={T('anuncio', 0.3)} dur={D('anuncio') - 0.3} />

      <Tarja inicio={T('tribunal', 0.3)} dur={3} titulo="TRIBUNAL FEDERAL • NOVA YORK" sub="05.01.2026" />
      <Citacao inicio={Q('tribunal', 'L8', 'inocente')} dur={D('tribunal') - quandoDiz('tribunal', 'L8', 'inocente')} texto="Inocente de todas as acusações" autor="defesa de Maduro" />

      <Citacao inicio={T('delcy', 0.3)} dur={quandoDiz('delcy', 'L9', 'Venezuela') - 0.5} texto="Sou um presidente sequestrado" autor="Maduro, no tribunal" />
      <Tarja inicio={Q('delcy', 'L9', 'Delcy')} dur={D('delcy') - quandoDiz('delcy', 'L9', 'Delcy')} titulo="DELCY RODRÍGUEZ" sub="PRESIDENTE INTERINA" />

      <Numero inicio={T('debate', 0.3)} dur={quandoDiz('debate', 'L10', 'Cuba') - 0.3} valor="0" rotulo="MORTES DE MILITARES DOS EUA (EUA)" topo={300} />
      <Numero inicio={Q('debate', 'L10', 'Cuba')} dur={quandoDiz('debate', 'L10', 'legalidade') - quandoDiz('debate', 'L10', 'Cuba')} valor="32" rotulo="AGENTES CUBANOS MORTOS (CUBA)" cor="#ff6b6b" topo={300} />
      <Tarja inicio={Q('debate', 'L10', 'legalidade')} dur={D('debate') - quandoDiz('debate', 'L10', 'legalidade')} titulo="OPERAÇÃO LEGAL?" sub="DEBATE INTERNACIONAL" />

      <Comenta inicio={Q('final', 'L11', 'Comenta') - 0.2} dur={D('final') - quandoDiz('final', 'L11', 'Comenta') + 0.2} />
      <Fontes inicio={T('final', 0.2)} dur={D('final') - 0.2} />

      <Recriacao />
      <Clarao momentos={[cena('ataque').inicio, cena('captura').inicio]} />
      <Legendas falas={TODAS_FALAS} destaques={DESTAQUES} corFalando="#ffcc00" corDestaque="#ff5a4f" topo="60%" tamanho={88} />
      <Progresso total={TOTAL_FRAMES} />

      {/* ---------- Áudio ---------- */}
      <Audio src={staticFile('maduro/trilha.mp3')} volume={volumeTrilha} />
      {TODAS_FALAS.map((f) => (
        <Sequence key={f.id} name={`Voz ${f.id}`} from={segFrame(f.inicio)} layout="none">
          <Audio src={staticFile(`maduro/${f.id}.mp3`)} />
        </Sequence>
      ))}
      {SONS.map(([cat, n, em, vol, dur], i) => (
        <Som key={i} cat={cat} n={n} em={em} vol={vol} dur={dur} />
      ))}
    </AbsoluteFill>
  );
};
