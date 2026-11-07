import {Audio} from '@remotion/media';
import React from 'react';
import {AbsoluteFill, Easing, Sequence, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {sfx, type CategoriaSfx, VOLUME_SFX} from '../sfx';
import {Clarao, Comenta, FONTE, Impacto, Legendas} from '../submarino/Overlay';
import {Carimbo, Citacao, Fontes, Numero, Tarja, Urgente, Vinheta} from '../maduro/Doc';
import {CenaAdeus, CenaAnuncio, CenaBriga, CenaClube, CenaCopa, CenaEstreia, CenaFinal, CenaGancho, CenaJesus, CenaRecordes, CenaSuspensao, CenaTitulos} from './Cenas';
import {CENAS, FPS, TODAS_FALAS, TOTAL_FRAMES, cena, type CenaId, duracaoCena, quandoDiz, segFrame} from './roteiro';

const T = (id: CenaId, rel: number) => cena(id).inicio + rel;
const Q = (id: CenaId, fala: string, palavra: string) => T(id, quandoDiz(id, fala, palavra));
const D = duracaoCena;
const R = quandoDiz;

const COMPONENTE: Record<CenaId, React.FC> = {
  gancho: CenaGancho,
  anuncio: CenaAnuncio,
  estreia: CenaEstreia,
  titulos: CenaTitulos,
  recordes: CenaRecordes,
  copa: CenaCopa,
  briga: CenaBriga,
  suspensao: CenaSuspensao,
  adeus: CenaAdeus,
  jesus: CenaJesus,
  clube: CenaClube,
  final: CenaFinal,
};

const DESTAQUES = /^(Acabou|vinte|Cristiano|Ronaldo|Portugal|cinco|quarenta|dois|dezoito|títulos|Eurocopa|dezesseis|Ligas|duzentos|cento|gols|história|Espanha|oitavas|acréscimos|briga|banco|Jorge|Jesus|abandonou|trinta|multa|adeus|aceitar|Nassr|sete|livre|Comenta)/i;

// Placar da eliminação
const Placar = ({inicio, dur}: {inicio: number; dur: number}) => {
  const frame = useCurrentFrame();
  const s = frame / FPS - inicio;
  if (s < 0 || s > dur) return null;
  const k = interpolate(s, [0, 0.3], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.back(1.6))});
  const caixa = (txt: string, cor: string) => (
    <div style={{fontFamily: FONTE, fontSize: 56, color: '#fff', background: cor, padding: '10px 26px', minWidth: 120, textAlign: 'center'}}>{txt}</div>
  );
  return (
    <AbsoluteFill style={{alignItems: 'center', top: 250}}>
      <div style={{scale: k, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10}}>
        <div style={{display: 'flex', alignItems: 'stretch', border: '5px solid #000', boxShadow: '0 10px 0 rgba(0,0,0,0.45)'}}>
          {caixa('ESP', '#c60b1e')}
          <div style={{fontFamily: FONTE, fontSize: 76, color: '#111', background: '#fff', padding: '2px 26px'}}>1 × 0</div>
          {caixa('POR', '#0b6b3a')}
        </div>
        <div style={{fontFamily: FONTE, fontSize: 36, color: '#ffcc00', background: 'rgba(8,10,18,0.88)', padding: '6px 20px'}}>COPA 2026 • OITAVAS • GOL AOS 90+1'</div>
      </div>
    </AbsoluteFill>
  );
};

const SONS: [CategoriaSfx, number, number, number, number?][] = [
  ['impacto', 0, 0.3, 1],
  ['tensao', 0, 0.4, 0.4, 4],
  ['impacto', 1, Q('gancho', 'L0', 'Cristiano'), 0.7],
  ['pop', 0, Q('anuncio', 'L1', 'vídeo'), 0.6],
  ['subida', 0, T('estreia', 0.2), 0.45],
  ['conquista', 0, Q('titulos', 'L3', 'Eurocopa'), 0.55],
  ['pop', 1, Q('titulos', 'L3', 'Ligas'), 0.7],
  ['whoosh', 2, T('recordes', 17 / FPS), 0.8],
  ['impacto', 2, T('recordes', 17 / FPS + 0.55), 0.8],
  ['pop', 2, Q('recordes', 'L4', 'duzentos'), 0.8],
  ['pop', 3, Q('recordes', 'L4', 'cento'), 0.8],
  ['acerto', 0, Q('recordes', 'L4', 'Nenhum'), 0.6],
  ['erro', 0, Q('copa', 'L5', 'eliminou'), 0.6],
  ['impacto', 0, Q('copa', 'L5', 'acréscimos'), 0.8],
  ['tensao', 1, T('briga', 0.1), 0.4, 3],
  ['impacto', 1, Q('briga', 'L6', 'Ronaldo'), 0.7],
  ['whoosh', 3, Q('briga', 'L6', 'abandonou'), 0.7],
  ['impacto', 2, T('suspensao', R('suspensao', 'L7', 'suspendeu') + 0.25), 1],
  ['tique', 0, Q('suspensao', 'L7', 'multa'), 0.6],
  ['subida', 1, T('adeus', 0.2), 0.4],
  ['pop', 0, Q('jesus', 'L9', 'aceitar'), 0.5],
  ['conquista', 1, T('clube', 0.3), 0.4],
  ['impacto', 1, Q('clube', 'L10', 'Mas'), 0.7],
  ['pop', 3, Q('final', 'L11', 'Comenta'), 0.9],
  ...CENAS.slice(1).map((c, i) => ['whoosh', i, c.inicio - 0.12, 0.4] as [CategoriaSfx, number, number, number]),
];

const Som = ({cat, n, em, vol, dur}: {cat: CategoriaSfx; n: number; em: number; vol: number; dur?: number}) => (
  <Sequence from={Math.max(0, segFrame(em))} durationInFrames={dur ? Math.max(1, segFrame(dur)) : undefined} layout="none" name={`som: ${cat}`}>
    <Audio src={sfx(cat, n)} volume={vol * VOLUME_SFX} />
  </Sequence>
);

// semVideo: só o áudio, para renderizar o som rápido sem desenhar as cenas
export const CR7Doc = ({semVideo = false}: {semVideo?: boolean}) => {
  const volumeTrilha = (f: number) => 0.16 * interpolate(f, [TOTAL_FRAMES - 45, TOTAL_FRAMES], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{background: '#000'}}>
      {!semVideo && (
        <>
          <Impacto
            zooms={[0.3, Q('gancho', 'L0', 'Cristiano'), Q('titulos', 'L3', 'Eurocopa'), Q('copa', 'L5', 'acréscimos'), Q('briga', 'L6', 'Ronaldo'), T('suspensao', R('suspensao', 'L7', 'suspendeu') + 0.25)]}
            tremidas={[{inicio: T('suspensao', R('suspensao', 'L7', 'suspendeu') + 0.25), dur: 0.4, forca: 9}]}
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

          <Urgente inicio={0.3} dur={D('gancho') - 0.3} selo="FIM DE UMA ERA" linhas={['CR7 SE DESPEDE', 'DE PORTUGAL']} />

          <Carimbo inicio={T('anuncio', 0.2)} dur={R('anuncio', 'L1', 'Portugal') - 0.3} texto="05.11.2026  REDES SOCIAIS" />
          <Tarja inicio={Q('anuncio', 'L1', 'quarenta')} dur={R('anuncio', 'L1', 'Portugal') - R('anuncio', 'L1', 'quarenta') - 0.1} titulo="41 ANOS" sub="23 ANOS DE SELEÇÃO" />
          <Citacao inicio={Q('anuncio', 'L1', 'Portugal')} dur={D('anuncio') - R('anuncio', 'L1', 'Portugal')} texto="Portugal estará sempre em mim." autor="Cristiano Ronaldo" />

          <Tarja inicio={Q('estreia', 'L2', 'dois')} dur={D('estreia') - R('estreia', 'L2', 'dois')} titulo="2003 • A ESTREIA" sub="UM GAROTO DE 18 ANOS" />

          <Tarja inicio={Q('titulos', 'L3', 'Eurocopa')} dur={R('titulos', 'L3', 'Ligas') - R('titulos', 'L3', 'Eurocopa')} titulo="🏆 EUROCOPA 2016" sub="CAMPEÃO" />
          <Tarja inicio={Q('titulos', 'L3', 'Ligas')} dur={D('titulos') - R('titulos', 'L3', 'Ligas')} titulo="🏆 LIGA DAS NAÇÕES" sub="2019 E 2025" />

          <Numero inicio={Q('recordes', 'L4', 'duzentos')} dur={R('recordes', 'L4', 'Nenhum') - R('recordes', 'L4', 'duzentos')} valor="234" rotulo="JOGOS" cor="#ffcc00" topo={240} esquerda={90} />
          <Numero inicio={Q('recordes', 'L4', 'cento')} dur={R('recordes', 'L4', 'Nenhum') - R('recordes', 'L4', 'cento')} valor="146" rotulo="GOLS" cor="#3ddc84" topo={240} esquerda={620} />
          <Tarja inicio={Q('recordes', 'L4', 'Nenhum')} dur={D('recordes') - R('recordes', 'L4', 'Nenhum')} titulo="MAIOR ARTILHEIRO" sub="DE SELEÇÕES NA HISTÓRIA" />

          <Placar inicio={Q('copa', 'L5', 'Espanha')} dur={D('copa') - R('copa', 'L5', 'Espanha')} />

          <Tarja inicio={T('briga', 0.2)} dur={R('briga', 'L6', 'Ronaldo') - 0.3} titulo="SETEMBRO DE 2026" sub="NO BANCO CONTRA A NORUEGA" />
          <Tarja inicio={Q('briga', 'L6', 'Jorge')} dur={R('briga', 'L6', 'abandonou') - R('briga', 'L6', 'Jorge')} titulo="JORGE JESUS" sub="TÉCNICO DE PORTUGAL" />
          <Carimbo inicio={Q('briga', 'L6', 'abandonou')} dur={D('briga') - R('briga', 'L6', 'abandonou')} texto="SAIU DA CONCENTRAÇÃO" />

          <Tarja inicio={T('suspensao', R('suspensao', 'L7', 'suspendeu') + 0.25)} dur={D('suspensao') - R('suspensao', 'L7', 'suspendeu') - 0.25} titulo="SUSPENSO 30 DIAS" sub="+ MULTA DA FEDERAÇÃO" />

          <Tarja inicio={T('adeus', 0.2)} dur={D('adeus') - 0.3} titulo="05.11.2026" sub="1 DIA ANTES DA CONVOCAÇÃO" />

          <Citacao inicio={Q('jesus', 'L9', 'pediu')} dur={D('jesus') - R('jesus', 'L9', 'pediu')} texto="Tenho de aceitar a decisão dele." autor="Jorge Jesus, técnico de Portugal" />

          <Tarja inicio={Q('clube', 'L10', 'Nassr')} dur={R('clube', 'L10', 'Mas') - R('clube', 'L10', 'Nassr')} titulo="AL NASSR" sub="SEGUE JOGANDO NA ARÁBIA SAUDITA" />
          <Tarja inicio={Q('clube', 'L10', 'livre')} dur={D('clube') - R('clube', 'L10', 'livre') + D('final') - 0.2} titulo="A CAMISA 7 ESTÁ LIVRE" sub="QUEM VAI HERDAR?" />

          <Comenta inicio={Q('final', 'L11', 'Comenta') - 0.1} dur={D('final') - R('final', 'L11', 'Comenta') + 0.1} texto="💬 QUEM HERDA A 7?" />
          <Fontes inicio={T('final', 0.2)} dur={D('final') - 0.2} texto="Fontes: Agência Brasil, ESPN, Al Jazeera, Correio Braziliense, Observador. Recriação ilustrativa." />

          <Clarao momentos={[cena('titulos').inicio, cena('briga').inicio]} />
          <Legendas falas={TODAS_FALAS} destaques={DESTAQUES} corFalando="#ffcc00" corDestaque="#ffffff" topo="66%" tamanho={66} umaLinha maxPalavras={3} />
        </>
      )}
      <Audio src={staticFile('cr7/trilha.mp3')} volume={volumeTrilha} />
      {TODAS_FALAS.map((f) => (
        <Sequence key={f.id} name={`Voz ${f.id}`} from={segFrame(f.inicio)} layout="none">
          <Audio src={staticFile(`cr7/${f.id}.mp3`)} />
        </Sequence>
      ))}
      {SONS.map(([cat, n, em, vol, dur], i) => (
        <Som key={i} cat={cat} n={n} em={em} vol={vol} dur={dur} />
      ))}
    </AbsoluteFill>
  );
};
