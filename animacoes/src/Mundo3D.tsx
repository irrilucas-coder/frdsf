import {ThreeCanvas} from '@remotion/three';
import {useThree} from '@react-three/fiber';
import {Easing, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {Bip} from './Bip';
import {Arvore, Brilhos, CeuEstrelado, Clarao, Detalhes, EstrelaCadente, Ilha} from './Cenario';
import {prog} from './tempo';

type V3 = [number, number, number];

// Roteiro da câmera: em cada frame-chave, onde ela está e para onde olha.
const CAMERA: {f: number; pos: V3; olha: V3}[] = [
  {f: 0, pos: [0, 4.5, 17], olha: [0, 0.6, 0]},
  {f: 110, pos: [-0.8, 1.5, 6.2], olha: [-0.8, 0.7, 0]},
  {f: 135, pos: [-0.6, 1.8, 7.2], olha: [0, 1.4, 0]},
  {f: 185, pos: [1.2, 2.6, 9.5], olha: [1.5, 2.2, -1]},
  {f: 215, pos: [0.3, 1.5, 6.5], olha: [0.2, 0.6, 0]},
  {f: 260, pos: [0.6, 1.3, 5.6], olha: [0.5, 0.5, 0]},
  {f: 360, pos: [-1.8, 2.3, 7.6], olha: [0.3, 1.5, 0]},
  {f: 400, pos: [-1.2, 2.4, 8.5], olha: [0.2, 1.4, 0]},
  {f: 520, pos: [0, 3.8, 18], olha: [0, 1.6, -4]},
];

const valorCamera = (frame: number, chave: 'pos' | 'olha', eixo: number) =>
  interpolate(
    frame,
    CAMERA.map((k) => k.f),
    CAMERA.map((k) => k[chave][eixo]),
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic)},
  );

const Camera = () => {
  const frame = useCurrentFrame();
  const camera = useThree((s) => s.camera);
  // Pequeno balanço de "câmera na mão" para dar vida
  const mao = Math.sin(frame * 0.07) * 0.04;
  camera.position.set(
    valorCamera(frame, 'pos', 0) + mao,
    valorCamera(frame, 'pos', 1) + mao * 0.5,
    valorCamera(frame, 'pos', 2),
  );
  camera.lookAt(valorCamera(frame, 'olha', 0), valorCamera(frame, 'olha', 1), valorCamera(frame, 'olha', 2));
  return null;
};

const Luzes = () => {
  const frame = useCurrentFrame();
  const amanhecer = prog(frame, 380, 500);
  return (
    <>
      <ambientLight intensity={0.35 + amanhecer * 0.35} color={amanhecer > 0.5 ? '#ffe2c4' : '#9fb0ff'} />
      <hemisphereLight args={['#8fa8ff', '#3a2a4a', 0.6 + amanhecer * 0.6]} />
      <directionalLight
        position={[4 - amanhecer * 2, 8, 5]}
        intensity={1.1 + amanhecer * 1.6}
        color={amanhecer > 0.5 ? '#ffd1a1' : '#cbd5ff'}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-5}
        shadow-camera-right={5}
        shadow-camera-top={5}
        shadow-camera-bottom={-5}
      />
    </>
  );
};

// Ilhas distantes que "acendem" no final: o céu inteiro ganha vida
const ILHAS_LONGE: {pos: V3; raio: number; fase: number; frutas: number}[] = [
  {pos: [-7, -0.5, -12], raio: 1.4, fase: 1, frutas: 430},
  {pos: [7.5, 1.8, -15], raio: 1.6, fase: 2.5, frutas: 445},
  {pos: [-3.5, 4.5, -20], raio: 1.2, fase: 4, frutas: 460},
  {pos: [4, -2.5, -9], raio: 1.0, fase: 5.5, frutas: 470},
];

const IlhaLonge = ({pos, raio, fase, frutas}: (typeof ILHAS_LONGE)[number]) => {
  const frame = useCurrentFrame();
  const y = Math.sin(frame * 0.035 + fase) * 0.15;
  return (
    <group position={[pos[0], pos[1] + y, pos[2]]}>
      <Ilha raio={raio} flutua={false} />
      <Arvore inicio={-200} posicao={[0, 0, 0]} tamanho={raio * 0.45} inicioFrutas={frutas} />
    </group>
  );
};

export const Mundo3D = () => {
  const {width, height} = useVideoConfig();
  return (
    <ThreeCanvas width={width} height={height} shadows camera={{fov: 50, near: 0.1, far: 200}}>
      <Camera />
      <Luzes />
      <CeuEstrelado />
      <Ilha raio={2.4} flutua={false} />
      <Detalhes />
      <Bip />
      <EstrelaCadente />
      <Clarao />
      <Brilhos />
      <Arvore inicio={285} inicioFrutas={375} />
      {ILHAS_LONGE.map((ilha, i) => (
        <IlhaLonge key={i} {...ilha} />
      ))}
    </ThreeCanvas>
  );
};
