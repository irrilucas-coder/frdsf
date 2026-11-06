import {Audio} from '@remotion/media';
import {AbsoluteFill, Easing, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Mundo3D} from './Mundo3D';
import {mix, prog} from './tempo';

// Céu em degradê: noite azul -> amanhecer rosado
const Ceu = () => {
  const frame = useCurrentFrame();
  const t = prog(frame, 380, 510);
  const cor = (a: [number, number, number], b: [number, number, number]) =>
    `rgb(${a.map((v, i) => Math.round(mix(v, b[i], t))).join(',')})`;
  const topo = cor([8, 12, 40], [70, 80, 170]);
  const meio = cor([30, 30, 90], [210, 120, 170]);
  const base = cor([60, 45, 120], [255, 190, 140]);
  return <AbsoluteFill style={{background: `linear-gradient(180deg, ${topo} 0%, ${meio} 60%, ${base} 100%)`}} />;
};

const Legenda = ({texto}: {texto: string}) => {
  const frame = useCurrentFrame();
  const {durationInFrames, fps} = useVideoConfig();
  const entra = interpolate(frame, [0, 0.4 * fps], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });
  const sai = interpolate(frame, [durationInFrames - 0.3 * fps, durationInFrames], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return (
    <AbsoluteFill style={{justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 230}}>
      <div
        style={{
          opacity: entra * sai,
          translate: `0px ${(1 - entra) * 40}px`,
          maxWidth: 900,
          padding: '28px 44px',
          borderRadius: 36,
          background: 'rgba(10, 12, 35, 0.55)',
          color: 'white',
          fontFamily: '"Nunito", "Segoe UI", "Helvetica Neue", Arial, sans-serif',
          fontWeight: 800,
          fontSize: 62,
          lineHeight: 1.2,
          textAlign: 'center',
          textShadow: '0 4px 14px rgba(0,0,0,0.45)',
        }}
      >
        {texto}
      </div>
    </AbsoluteFill>
  );
};

const Titulo = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = interpolate(frame, [0, 0.7 * fps], [0.6, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.back(2)),
  });
  const o = interpolate(frame, [0, 0.4 * fps], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{justifyContent: 'flex-start', alignItems: 'center', paddingTop: 260}}>
      <div
        style={{
          opacity: o,
          scale: s,
          textAlign: 'center',
          color: 'white',
          fontFamily: '"Nunito", "Segoe UI", "Helvetica Neue", Arial, sans-serif',
          textShadow: '0 6px 24px rgba(60, 20, 80, 0.6)',
        }}
      >
        <div style={{fontSize: 120, fontWeight: 900, lineHeight: 1}}>Bip e a Estrela</div>
        <div style={{fontSize: 52, fontWeight: 700, marginTop: 24, opacity: 0.9}}>✦ fim ✦</div>
      </div>
    </AbsoluteFill>
  );
};

export const BipEAEstrela = () => {
  const {fps} = useVideoConfig();
  return (
    <AbsoluteFill>
      <Ceu />
      <Mundo3D />
      <Audio src={staticFile('audio/musica.wav')} volume={0.35} />
      <Audio src={staticFile('audio/efeitos.wav')} volume={0.8} />
      <Sequence name="Legenda 1" from={0.3 * fps} durationInFrames={3.5 * fps}>
        <Legenda texto="Bip vivia sozinho numa ilhazinha no céu…" />
        <Audio src={staticFile('audio/fala1.mp3')} />
      </Sequence>
      <Sequence name="Legenda 2" from={3.9 * fps} durationInFrames={3.9 * fps}>
        <Legenda texto="Até que, numa noite, uma estrela caiu!" />
        <Audio src={staticFile('audio/fala2.mp3')} />
      </Sequence>
      <Sequence name="Legenda 3" from={Math.round(8.2 * fps)} durationInFrames={3.6 * fps}>
        <Legenda texto="Ele plantou a estrela com todo o cuidado…" />
        <Audio src={staticFile('audio/fala3.mp3')} />
      </Sequence>
      <Sequence name="Legenda 4" from={12.2 * fps} durationInFrames={3 * fps}>
        <Legenda texto="…e dela nasceu uma árvore de luz." />
        <Audio src={staticFile('audio/fala4.mp3')} />
      </Sequence>
      <Sequence name="Legenda 5" from={15.4 * fps} durationInFrames={Math.round(4.1 * fps)}>
        <Legenda texto="Agora o céu inteiro brilha com ele." />
        <Audio src={staticFile('audio/fala5.mp3')} />
      </Sequence>
      <Sequence name="Título" from={15.3 * fps} durationInFrames={4.2 * fps}>
        <Titulo />
      </Sequence>
    </AbsoluteFill>
  );
};
