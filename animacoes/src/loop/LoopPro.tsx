import {Audio} from '@remotion/media';
import {ThreeCanvas} from '@remotion/three';
import {useThree} from '@react-three/fiber';
import {Backdrop, RoundedBox, SoftShadows} from '@react-three/drei';
import {DepthOfField, EffectComposer, N8AO, SMAA, Vignette} from '@react-three/postprocessing';
import {ACESFilmicToneMapping, type PerspectiveCamera} from 'three';
import {AbsoluteFill, Easing, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';

// "Cubos Comilões" em qualidade de estúdio: mesmo ciclo do Loop.tsx, com plástico brilhante, cantos
// arredondados, dentes, olhos com pálpebra, sombras suaves, oclusão de ambiente e profundidade de campo.
export const FPS_PRO = 30;
export const DUR_PRO = 8;
export const FRAMES_PRO = FPS_PRO * DUR_PRO;

type V3 = [number, number, number];
const AZUL = '#1f6fff';
const ROSA = '#ff2f86';
const ease = Easing.inOut(Easing.cubic);
const L = (t: number, a: number, b: number, de: number, para: number, e = ease) =>
  interpolate(t, [a, b], [de, para], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: e});
// balanço amortecido depois de um impacto
const balanco = (t: number, t0: number, forca = 1) => (t < t0 ? 0 : Math.exp(-(t - t0) * 6) * Math.sin((t - t0) * 26) * 0.22 * forca);
// antecipação (agacha) antes de um pulo em t0
const agacha = (t: number, t0: number) => -L(t, t0 - 0.25, t0 - 0.05, 0, 0.18) * (t < t0 + 0.05 ? 1 : 0);

const Plastico = ({cor, rug = 0.22}: {cor: string; rug?: number}) => (
  <meshPhysicalMaterial color={cor} roughness={rug} clearcoat={1} clearcoatRoughness={0.12} sheen={0.2} />
);

const Olho = ({x, olhar, pisca, cor}: {x: number; olhar: number; pisca: number; cor: string}) => (
  <group position={[x, 0.27, 0.47]}>
    <mesh castShadow>
      <sphereGeometry args={[0.15, 32, 24]} />
      <meshPhysicalMaterial color="#ffffff" roughness={0.08} clearcoat={1} emissive="#ffffff" emissiveIntensity={0.28} />
    </mesh>
    <group rotation={[0, olhar * 0.45, 0]}>
      <mesh position={[0, 0, 0.115]} scale={[1, 1, 0.45]}>
        <sphereGeometry args={[0.075, 24, 18]} />
        <meshStandardMaterial color="#2a9d8f" roughness={0.3} />
      </mesh>
      <mesh position={[0, 0, 0.142]} scale={[1, 1, 0.3]}>
        <sphereGeometry args={[0.045, 20, 14]} />
        <meshStandardMaterial color="#0b0b0b" roughness={0.1} />
      </mesh>
      <mesh position={[0.025, 0.03, 0.15]}>
        <sphereGeometry args={[0.016, 10, 8]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
    </group>
    {/* pálpebra: casca do corpo que desce ao piscar */}
    <mesh rotation={[-1.25 + pisca * 1.9, 0, 0]} scale={1.08} castShadow>
      <sphereGeometry args={[0.15, 28, 14, 0, Math.PI * 2, 0, Math.PI / 2]} />
      <Plastico cor={cor} />
    </mesh>
  </group>
);

const Dentes = ({y, cima}: {y: number; cima: boolean}) => (
  <>
    {Array.from({length: 7}, (_, i) => (
      <mesh key={i} position={[-0.33 + i * 0.11, y, 0.4]} rotation={[cima ? Math.PI : 0, 0, 0]} castShadow>
        <coneGeometry args={[0.042, 0.11, 6]} />
        <meshPhysicalMaterial color="#fffaf0" roughness={0.2} clearcoat={0.6} />
      </mesh>
    ))}
  </>
);

// Cubo com boca de tampa articulada
const CuboPro = ({pos, esc = [1, 1, 1], rot = [0, 0, 0], cor, boca = 0, olhar = 0, pisca = 0}: {pos: V3; esc?: V3; rot?: V3; cor: string; boca?: number; olhar?: number; pisca?: number}) => (
  <group position={pos} rotation={rot} scale={esc}>
    {/* metade de baixo */}
    <RoundedBox args={[1, 0.5, 1]} radius={0.07} smoothness={4} position={[0, 0.25, 0]} castShadow receiveShadow>
      <Plastico cor={cor} />
    </RoundedBox>
    {/* boca: cavidade, gengiva, língua, dentes */}
    <mesh position={[0, 0.49, 0]}>
      <boxGeometry args={[0.84, 0.03, 0.84]} />
      <meshStandardMaterial color="#4a0716" roughness={0.6} />
    </mesh>
    <mesh position={[0, 0.505, 0.4]}>
      <boxGeometry args={[0.8, 0.03, 0.06]} />
      <meshStandardMaterial color="#ff7a9c" roughness={0.5} />
    </mesh>
    <mesh position={[0, 0.52, 0.02]} scale={[1.2, 0.35, 1.1]}>
      <sphereGeometry args={[0.25, 24, 16]} />
      <meshPhysicalMaterial color="#ff5f84" roughness={0.35} clearcoat={0.5} />
    </mesh>
    <Dentes y={0.56} cima={false} />
    {/* tampa (metade de cima) */}
    <group position={[0, 0.5, -0.5]} rotation={[-(0.09 + boca * 0.91), 0, 0]}>
      <group position={[0, 0, 0.5]}>
        <RoundedBox args={[1, 0.5, 1]} radius={0.07} smoothness={4} position={[0, 0.25, 0]} castShadow receiveShadow>
          <Plastico cor={cor} />
        </RoundedBox>
        <mesh position={[0, 0.01, 0]}>
          <boxGeometry args={[0.84, 0.03, 0.84]} />
          <meshStandardMaterial color="#4a0716" roughness={0.6} />
        </mesh>
        <mesh position={[0, -0.005, 0.4]}>
          <boxGeometry args={[0.8, 0.03, 0.06]} />
          <meshStandardMaterial color="#ff7a9c" roughness={0.5} />
        </mesh>
        <Dentes y={-0.05} cima />
        <Olho x={-0.22} olhar={olhar} pisca={pisca} cor={cor} />
        <Olho x={0.22} olhar={olhar} pisca={pisca} cor={cor} />
        {[-0.38, 0.38].map((x) => (
          <mesh key={x} position={[x, 0.09, 0.503]}>
            <circleGeometry args={[0.065, 20]} />
            <meshBasicMaterial color="#ffd1e3" transparent opacity={0.55} />
          </mesh>
        ))}
      </group>
    </group>
  </group>
);

// Pedestal e prateleira arredondados, listrados
const Pedestal = ({porta}: {porta: number}) => (
  <group>
    {Array.from({length: 7}, (_, i) => (
      <RoundedBox key={i} args={[1.26, 0.5, 1.26]} radius={0.04} smoothness={3} position={[0, -0.25 - i * 0.5, 0]} castShadow receiveShadow>
        <meshStandardMaterial color={i % 2 ? '#fff4e0' : '#ffb703'} roughness={0.45} />
      </RoundedBox>
    ))}
    {[-1, 1].map((l) => (
      <group key={l} position={[l * 0.56, 0.006, 0]} rotation={[0, 0, l * porta * 1.4]}>
        <RoundedBox args={[0.56, 0.03, 1.12]} radius={0.012} smoothness={2} position={[-l * 0.28, 0, 0]} castShadow>
          <meshStandardMaterial color="#7b2ff7" roughness={0.35} />
        </RoundedBox>
      </group>
    ))}
    <group position={[1.15, -0.85, 0.2]}>
      {Array.from({length: 6}, (_, i) => (
        <RoundedBox key={i} args={[1.1, 0.5, 1.6]} radius={0.04} smoothness={3} position={[0, -0.25 - i * 0.5, 0]} castShadow receiveShadow>
          <meshStandardMaterial color={i % 2 ? '#13a88a' : '#1fc7a3'} roughness={0.45} />
        </RoundedBox>
      ))}
    </group>
  </group>
);

const TOPO: V3 = [0, 1.0, 0];
const MEIO: V3 = [0, 0, 0];
const MINI: V3 = [1.15, -0.85, 0.35];
const ME = 0.45;

const Cena = ({t, frame}: {t: number; frame: number}) => {
  const pisca = (frame + 40) % 80 < 4 ? 1 : 0;
  // 1. azul pula e engole o cubinho
  const abre1 = L(t, 0.15, 0.55, 0, 1, Easing.out(Easing.back(2))) * L(t, 1.33, 1.5, 1, 0.12);
  const p1 = L(t, 0.55, 1.4, 0, 1, Easing.inOut(Easing.quad));
  const azulPos: V3 = [TOPO[0] + (MINI[0] - TOPO[0]) * p1, TOPO[1] + (MINI[1] - TOPO[1]) * p1 + Math.sin(p1 * Math.PI) * 0.9, TOPO[2] + (MINI[2] - TOPO[2]) * p1];
  const ach1 = L(t, 1.4, 1.7, 0, 1, Easing.out(Easing.back(2.2)));
  const voa1 = p1 > 0 && p1 < 1 ? Math.sin(p1 * Math.PI) * 0.12 : 0;
  const ag1 = agacha(t, 0.55);
  const b1 = balanco(t, 1.4);
  // 2. rosa pula e engole a placa azul
  const abre2 = L(t, 2.0, 2.4, 0, 1, Easing.out(Easing.back(2))) * L(t, 3.13, 3.3, 1, 0.1);
  const p2 = L(t, 2.4, 3.2, 0, 1, Easing.inOut(Easing.quad));
  const rosaPos: V3 = [MEIO[0] + (MINI[0] - MEIO[0]) * p2, MEIO[1] + (MINI[1] - MEIO[1]) * p2 + Math.sin(p2 * Math.PI) * 1.1, MEIO[2] + (MINI[2] - MEIO[2]) * p2];
  const ach2 = L(t, 3.2, 3.5, 0, 1, Easing.out(Easing.back(2.2)));
  const voa2 = p2 > 0 && p2 < 1 ? Math.sin(p2 * Math.PI) * 0.14 : 0;
  const ag2 = agacha(t, 2.4);
  const b2 = balanco(t, 3.2);
  // 3. encolhe
  const enc = L(t, 3.9, 4.8, 0, 1, Easing.inOut(Easing.back(1.6)));
  const b3 = balanco(t, 4.8, 0.6);
  // 4. portinha e rosa surge
  const porta = L(t, 4.9, 5.2, 0, 1) * L(t, 5.9, 6.1, 1, 0);
  const sobe = L(t, 5.1, 5.8, 0, 1, Easing.out(Easing.back(1.8)));
  const b4 = balanco(t, 5.8, 0.7);
  // 5. azul cai e encaixa
  const cai = L(t, 6.3, 6.95, 0, 1, Easing.in(Easing.quad));
  const b5 = balanco(t, 6.95, 1.2);
  const placaRosa: V3 =
    t < 3.9
      ? [1 + ach2 * 0.35 - b2, 1 - ach2 * 0.62 + b2 * 1.5, 1 + ach2 * 0.35 - b2]
      : [1.35 - (1.35 - ME) * enc + b3 * 0.3, 0.38 + (ME - 0.38) * enc - b3 * 0.3, 1.35 - (1.35 - ME) * enc + b3 * 0.3];
  return (
    <>
      <Pedestal porta={porta} />
      {t < 1.42 && <CuboPro pos={MINI} esc={[ME, ME, ME]} cor={ROSA} olhar={-1} pisca={L(t, 0.8, 1.0, 0, 1)} />}
      {t < 3.2 && t < 6.3 && (
        <CuboPro
          pos={t < 1.4 ? azulPos : MINI}
          rot={[0, 0, t < 1.4 ? Math.sin(p1 * Math.PI) * -0.5 : 0]}
          esc={t < 1.4 ? [1 - voa1 - ag1 * 0.5, 1 + voa1 + abre1 * 0.08 + ag1, 1 - voa1 - ag1 * 0.5] : [1 + ach1 * 0.3 - b1, 1 - ach1 * 0.6 + b1 * 1.5, 1 + ach1 * 0.3 - b1]}
          cor={AZUL}
          boca={abre1}
          olhar={t < 1.4 ? L(t, 0.05, 0.4, 0, 1) : 0}
          pisca={t >= 1.4 ? 0.6 : pisca}
        />
      )}
      <CuboPro
        pos={t < 3.2 ? rosaPos : MINI}
        rot={[0, 0, t < 3.2 ? Math.sin(p2 * Math.PI) * -0.6 : 0]}
        esc={t < 3.2 ? [1 - voa2 - ag2 * 0.5, 1 + voa2 + abre2 * 0.1 + ag2, 1 - voa2 - ag2 * 0.5] : placaRosa}
        cor={ROSA}
        boca={t < 3.2 ? abre2 : 0}
        olhar={t < 3.2 ? L(t, 1.6, 2.0, 0, 1) : -1}
        pisca={pisca}
      />
      {t >= 5.0 && <CuboPro pos={[0, -1.0 + sobe * 1.0, 0]} esc={[1 + b4 * 0.5, 1 - b4, 1 + b4 * 0.5]} cor={ROSA} pisca={pisca} />}
      {t >= 6.3 && <CuboPro pos={[0, TOPO[1] + (1 - cai) * 6, 0]} esc={[1 + b5 * 0.6, 1 - b5 + (t < 6.95 ? cai * 0.15 : 0), 1 + b5 * 0.6]} cor={AZUL} pisca={pisca} />}
    </>
  );
};

const Camera = () => {
  const camera = useThree((s) => s.camera) as PerspectiveCamera;
  camera.position.set(-1.0, 1.55, 7.6);
  camera.lookAt(0.55, 0.1, 0);
  camera.fov = 40;
  camera.updateProjectionMatrix();
  return null;
};

export const LoopCubosPro = () => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const t = (frame / FPS_PRO) % DUR_PRO;
  return (
    <AbsoluteFill style={{background: '#2a1f3d'}}>
      <ThreeCanvas width={width} height={height} shadows camera={{fov: 40, near: 0.1, far: 100}} gl={{toneMapping: ACESFilmicToneMapping, toneMappingExposure: 1.15}}>
        <Camera />
        <SoftShadows size={18} samples={12} focus={0.6} />
        <color attach="background" args={['#2a1f3d']} />
        {/* estúdio: fundo contínuo */}
        <Backdrop floor={2} segments={40} receiveShadow position={[0, -3.6, -2.5]} scale={[30, 12, 8]}>
          <meshStandardMaterial color="#5b3f8c" roughness={0.9} />
        </Backdrop>
        <hemisphereLight args={['#fff4e8', '#3a2a5a', 0.55]} />
        <directionalLight position={[-4, 7, 5]} intensity={2.6} color="#fff1dc" castShadow shadow-mapSize={[2048, 2048]} shadow-bias={-0.0004} shadow-camera-left={-6} shadow-camera-right={6} shadow-camera-top={6} shadow-camera-bottom={-6} />
        <directionalLight position={[5, 3, -4]} intensity={1.1} color="#ff9ad5" />
        <pointLight position={[2, 2, 3]} intensity={6} color="#8fd3ff" distance={10} />
        <Cena t={t} frame={frame} />
        <EffectComposer multisampling={0}>
          <N8AO aoRadius={0.6} distanceFalloff={1} intensity={2.2} quality="high" />
          <DepthOfField target={[0.5, 0.2, 0]} focalLength={0.04} bokehScale={2.2} />
          <Vignette offset={0.3} darkness={0.55} />
          <SMAA />
        </EffectComposer>
      </ThreeCanvas>
      <Audio src={staticFile('loop/som.wav')} />
    </AbsoluteFill>
  );
};
