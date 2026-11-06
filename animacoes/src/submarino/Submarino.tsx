import {Audio} from '@remotion/media';
import React from 'react';
import {AbsoluteFill, Sequence, interpolate, staticFile} from 'remotion';
import {CenaDrebbel, CenaFinal, CenaFuncionou, CenaGancho, CenaHolland, CenaHunley, CenaNautilus, CenaTurtle} from './Cenas';
import {
  AnosLinhaDoTempo,
  BarraEnergia,
  Clarao,
  Comenta,
  Cronometro,
  Emoji,
  Escurecer,
  Impacto,
  Legendas,
  Progresso,
  Selo,
} from './Overlay';
import {
  CENAS,
  FPS,
  TODAS_FALAS,
  TOTAL_FRAMES,
  cena,
  type CenaId,
  duracaoCena,
  fimFala,
  inicioFala,
  quandoDiz,
  segFrame,
} from './roteiro';

// Segundo absoluto a partir de (cena, segundo relativo)
const T = (id: CenaId, rel: number) => cena(id).inicio + rel;
const Q = (id: CenaId, fala: string, palavra: string) => T(id, quandoDiz(id, fala, palavra));

const COMPONENTE: Record<CenaId, React.FC> = {
  gancho: CenaGancho,
  drebbel: CenaDrebbel,
  funcionou: CenaFuncionou,
  turtle: CenaTurtle,
  hunley: CenaHunley,
  holland: CenaHolland,
  nautilus: CenaNautilus,
  final: CenaFinal,
};

// ---------- Efeitos sonoros: [arquivo, segundo absoluto, volume] ----------
const fimL6 = T('turtle', fimFala('turtle', 'L6'));
const impactoHunley = Q('hunley', 'L7', 'guerra');
// som do impacto entra só depois da palavra "guerra" terminar, pra não abafar a voz
const somImpactoHunley = Q('hunley', 'L7', 'mas') - 0.15;
const SONS: [string, number, number, number?][] = [
  ['alarme', 0.05, 0.5],
  ['bolhas', 0.2, 0.6],
  ['pop', 0.15, 0.6],
  ['pop', Q('gancho', 'L0', 'de'), 0.6],
  // Drebbel
  ['carimbo', T('drebbel', 0.25), 0.8],
  ['pop', Q('drebbel', 'L1', 'couro'), 0.5],
  ['splash', Q('drebbel', 'L1', 'mergulhou') + 0.3, 0.8],
  ['bolhas', Q('drebbel', 'L1', 'mergulhou') + 0.6, 0.7],
  ['pop', Q('drebbel', 'L2', 'janela'), 0.6],
  // Funcionou
  ['tique', T('funcionou', 0.2), 0.5],
  ['tique', T('funcionou', 0.7), 0.5],
  ['tique', T('funcionou', 1.2), 0.5],
  ['ding', Q('funcionou', 'L3', 'horas'), 0.7],
  // Turtle
  ['carimbo', T('turtle', 0.25), 0.8],
  ['pop', Q('turtle', 'L4', 'Turtle'), 0.6],
  ['manivela', T('turtle', quandoDiz('turtle', 'L4', 'submarino')), 0.7],
  ['manivela', T('turtle', inicioFala('turtle', 'L5') - 0.1), 0.9],
  ['pop', Q('turtle', 'L6', 'bomba'), 0.6],
  ['broca', Q('turtle', 'L6', 'broca') + 0.1, 0.35, Q('turtle', 'L6', 'casco') - Q('turtle', 'L6', 'broca') - 0.25],
  ['buzzer', fimL6 + 0.35, 0.45],
  ['boom', fimL6 + 0.7, 0.9],
  // Hunley
  ['suspense', T('hunley', 0.05), 0.45],
  ['carimbo', T('hunley', 0.25), 0.7],
  ['boom', somImpactoHunley, 0.75],
  ['bolhas', Q('hunley', 'L7', 'mas'), 0.6],
  // Holland
  ['carimbo', T('holland', 0.25), 0.8],
  ['pop', Q('holland', 'L8', 'gasolina'), 0.6],
  ['pop', Q('holland', 'L8', 'baterias'), 0.6],
  ['splash', Q('holland', 'L8', 'baterias') + 0.2, 0.6],
  ['carimbo', Q('holland', 'L8', 'comprou'), 0.9],
  ['ding', Q('holland', 'L8', 'comprou') + 0.1, 0.7],
  ['splash', T('holland', inicioFala('holland', 'L9') + 0.4), 0.8],
  // Nautilus
  ['sonar', T('nautilus', 0.1), 0.7],
  ['carimbo', T('nautilus', 0.25), 0.7],
  ['sonar', Q('nautilus', 'L10', 'primeiro'), 0.5],
  ['carimbo', Q('nautilus', 'L10', '1958'), 0.8],
  // Final
  ['pop', T('final', 0.3), 0.6],
  ['pop', Q('final', 'L11', 'Comenta') - 0.3, 0.8],
  ['ding', Q('final', 'L11', 'Comenta'), 0.6],
  // Whoosh em cada troca de cena
  ...CENAS.slice(1).map((c) => ['whoosh', c.inicio - 0.2, 0.6] as [string, number, number, number?]),
];

const Som = ({arquivo, em, volume, dur}: {arquivo: string; em: number; volume: number; dur?: number}) => (
  <Sequence
    from={Math.max(0, segFrame(em))}
    durationInFrames={dur ? Math.max(1, segFrame(dur)) : undefined}
    layout="none"
    name={`som: ${arquivo}`}
  >
    <Audio src={staticFile(`submarino/sfx/${arquivo}.wav`)} volume={volume} />
  </Sequence>
);

export const Submarino = () => {
  const hunley = cena('hunley');
  const volumeMusica = (f: number) => {
    const s = f / FPS;
    const baixaNoHunley = interpolate(s, [hunley.inicio - 0.3, hunley.inicio, hunley.fim - 0.2, hunley.fim + 0.3], [1, 0.15, 0.15, 1], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
    const fade = interpolate(f, [TOTAL_FRAMES - 45, TOTAL_FRAMES], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
    return 0.16 * baixaNoHunley * fade;
  };

  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Impacto
        zooms={[
          0.05,
          Q('gancho', 'L0', 'de'),
          Q('drebbel', 'L1', 'mergulhou') + 0.3,
          T('drebbel', inicioFala('drebbel', 'L2')),
          Q('turtle', 'L6', 'casco'),
          fimL6 + 0.7,
          impactoHunley,
          Q('holland', 'L8', 'comprou'),
          Q('nautilus', 'L10', '1958'),
          Q('final', 'L11', 'Comenta'),
        ]}
        tremidas={[
          {inicio: Q('gancho', 'L0', 'de'), dur: 0.8, forca: 10},
          {inicio: T('turtle', inicioFala('turtle', 'L5')), dur: 2.6, forca: 8},
          {inicio: Q('turtle', 'L6', 'casco'), dur: 0.6, forca: 22},
          {inicio: fimL6 + 0.7, dur: 0.7, forca: 16},
          {inicio: impactoHunley, dur: 1.2, forca: 28},
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

      {/* ---------- Textos e elementos na tela ---------- */}
      <Selo inicio={0.1} dur={duracaoCena('gancho') - 0.1} texto="O 1º SUBMARINO" sub="DA HISTÓRIA?! 😱" cor="#ffe14d" topo={200} />
      <Emoji inicio={Q('gancho', 'L0', 'de')} dur={1.4} emoji="😱" x={720} y={520} />

      <Selo inicio={T('drebbel', 0.2)} dur={2.6} texto="1620" sub="📍 LONDRES" />
      <Selo inicio={Q('drebbel', 'L1', 'couro')} dur={2.2} texto="COURO ENGRAXADO" cor="#ffb347" topo={260} tamanho={84} rot={3} />
      <Emoji inicio={Q('drebbel', 'L2', 'janela')} dur={1.4} emoji="🚫" x={760} y={300} />

      <Cronometro inicio={T('funcionou', 0.1)} dur={duracaoCena('funcionou') - 0.2} />
      <Selo inicio={Q('funcionou', 'L3', 'horas')} dur={1.8} texto="FUNCIONOU! ✅" cor="#4cd964" topo={460} tamanho={100} />

      <Selo inicio={T('turtle', 0.2)} dur={2.6} texto="1776" sub="📍 NOVA YORK" />
      <Selo inicio={Q('turtle', 'L4', 'Turtle')} dur={2.4} texto="TURTLE 🐢" cor="#7ee081" topo={260} tamanho={110} rot={3} />
      <Emoji inicio={Q('turtle', 'L4', 'manivela')} dur={1.6} emoji="⚙️" x={740} y={330} />
      <BarraEnergia inicio={T('turtle', inicioFala('turtle', 'L5'))} dur={fimFala('turtle', 'L5') - inicioFala('turtle', 'L5') + 0.2} />
      <Emoji inicio={T('turtle', inicioFala('turtle', 'L5') + 0.6)} dur={1.8} emoji="😫" x={90} y={420} />
      <Emoji inicio={Q('turtle', 'L6', 'bomba')} dur={1.6} emoji="💣" x={760} y={300} />
      <Selo inicio={Q('turtle', 'L6', 'casco')} dur={1.6} texto="FALHOU ❌" cor="#ff3b30" topo={300} tamanho={140} rot={-6} />
      <Emoji inicio={fimL6 + 0.75} dur={1.0} emoji="💥" x={120} y={380} tam={220} />

      <Selo inicio={T('hunley', 0.2)} dur={2.6} texto="1864" sub="📍 CAROLINA DO SUL" />
      <Selo inicio={impactoHunley + 0.25} dur={2.6} texto="1º NAVIO AFUNDADO" sub="POR UM SUBMARINO 💥" cor="#ff9f1c" topo={300} tamanho={92} />
      <Escurecer inicio={Q('hunley', 'L7', 'mas')} fim={hunley.fim - 0.1} max={0.65} />

      <Selo inicio={T('holland', 0.2)} dur={2.6} texto="1900" sub="📍 EUA" />
      <Selo inicio={Q('holland', 'L8', 'gasolina')} dur={2.0} texto="⛽ GASOLINA" sub="NA SUPERFÍCIE" cor="#ffcc00" topo={300} tamanho={96} />
      <Selo inicio={Q('holland', 'L8', 'baterias')} dur={2.2} texto="🔋 BATERIAS" sub="DEBAIXO D'ÁGUA" cor="#4cd964" topo={300} tamanho={96} />
      <Selo inicio={Q('holland', 'L8', 'comprou')} dur={2.2} texto="VENDIDO! ✅" sub="PRA MARINHA DOS EUA" cor="#7ec8ff" topo={300} tamanho={120} rot={-5} />
      <Emoji inicio={T('holland', inicioFala('holland', 'L9') + 1.1)} dur={1.6} emoji="🎉" x={740} y={360} />

      <Selo inicio={T('nautilus', 0.2)} dur={2.8} texto="1954" sub="☢️ 1º SUBMARINO NUCLEAR" />
      <Selo inicio={Q('nautilus', 'L10', '1958')} dur={3.0} texto="1958" sub="🧊 POR BAIXO DO POLO NORTE" cor="#9be7ff" />

      <AnosLinhaDoTempo inicio={T('final', 0.3)} dur={duracaoCena('final') * 0.6} />
      <Comenta inicio={Q('final', 'L11', 'Comenta') - 0.3} dur={duracaoCena('final') - quandoDiz('final', 'L11', 'Comenta') + 0.3} />
      <Emoji inicio={Q('final', 'L11', 'Comenta')} dur={2.2} emoji="👇" x={470} y={600} tam={150} />

      <Clarao momentos={CENAS.slice(1).map((c) => c.inicio)} />
      <Legendas />
      <Progresso total={TOTAL_FRAMES} />

      {/* ---------- Áudio ---------- */}
      <Audio src={staticFile('submarino/musica.mp3')} volume={volumeMusica} />
      {TODAS_FALAS.map((f) => (
        <Sequence key={f.id} name={`Voz ${f.id} (${f.quem})`} from={segFrame(f.inicio)} layout="none">
          <Audio src={staticFile(`submarino/${f.id}.mp3`)} volume={1} />
        </Sequence>
      ))}
      {SONS.map(([arquivo, em, volume, dur], i) => (
        <Som key={i} arquivo={arquivo} em={em} volume={volume * 0.7} dur={dur} />
      ))}
    </AbsoluteFill>
  );
};
