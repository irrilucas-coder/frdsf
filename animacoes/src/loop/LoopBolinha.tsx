import {Audio} from '@remotion/media';
import {ThreeCanvas} from '@remotion/three';
import {useThree} from '@react-three/fiber';
import {Backdrop, Environment, Lightformer, RoundedBox, SoftShadows} from '@react-three/drei';
import {DepthOfField, EffectComposer, N8AO, SMAA, Vignette} from '@react-three/postprocessing';
import {useMemo} from 'react';
import {ACESFilmicToneMapping, LatheGeometry, Vector2, type PerspectiveCamera} from 'three';
import {AbsoluteFill, Easing, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';

// "Bolinha Infinita": máquina de bolinha em loop de 8 s (o fim encaixa no começo).
export const FPS_BOL = 30;
export const DUR_BOL = 16;
export const FRAMES_BOL = FPS_BOL * DUR_BOL;

type V2 = [number, number];
const R = 0.14; // raio da bolinha
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const seg = (t: number, a: number, b: number, e = (x: number) => x) => e(Math.max(0, Math.min(1, (t - a) / (b - a))));
const easeIn = (x: number) => x * x;
const easeOut = (x: number) => 1 - (1 - x) * (1 - x);
const suave = (x: number) => x * x * (3 - 2 * x);

// ---- Andar de cima ----
const P0: V2 = [-0.95, 9.0];
const P1: V2 = [0.95, 8.5];
const P2: V2 = [0.95, 7.8];
const P3: V2 = [-0.95, 7.3];
const BARRAS_A: V2[] = [[-0.72, 6.8], [-0.32, 6.48], [0.08, 6.16], [0.48, 5.84], [0.88, 5.52]];
const HITS_A = [3.1, 3.5, 3.9, 4.3, 4.7];
// ---- Andar de baixo ----
const P4: V2 = [0.95, 4.9];
const P5: V2 = [-0.95, 4.4];
const BARRAS_B: V2[] = [[-0.72, 3.9], [-0.32, 3.58], [0.08, 3.26], [0.48, 2.94], [0.88, 2.62]];
const HITS_B = [6.7, 7.1, 7.5, 7.9, 8.3];
const FUNIL = {x: 0.15, topo: 2.0, base: 1.4, raio: 0.68};
const CALHA: [V2, V2] = [[0.15, 1.2], [-1.35, 0.95]];
const ELEV_X = -1.35;
const ELEV_TOPO = 9.15;
const BARRAS = [...BARRAS_A, ...BARRAS_B];
const HITS = [...HITS_A, ...HITS_B];

const sobreBarra = (b: V2): V2 => [b[0], b[1] + R + 0.06];
const pulos = (t: number, pts: V2[], tempos: number[], altoPrimeiro = 0.05) => {
  for (let i = 0; i < pts.length - 1; i++) {
    if (t < tempos[i + 1]) {
      const k = seg(t, tempos[i], tempos[i + 1]);
      return {x: lerp(pts[i][0], pts[i + 1][0], k), y: lerp(pts[i][1], pts[i + 1][1], k) + Math.sin(k * Math.PI) * (i === 0 ? altoPrimeiro : 0.28), z: 0, giro: k * 3};
    }
  }
  return null;
};

// posição da bolinha em função do tempo
const posBola = (t: number): {x: number; y: number; z: number; giro: number} => {
  if (t < 1.3) {
    const k = seg(t, 0, 1.3, easeIn);
    return {x: lerp(P0[0], P1[0], k), y: lerp(P0[1], P1[1], k), z: 0, giro: -k * 2.0 / R};
  }
  if (t < 1.6) {
    const k = seg(t, 1.3, 1.6, easeIn);
    return {x: P1[0] + k * 0.05, y: lerp(P1[1], P2[1], k), z: 0, giro: -2.0 / R};
  }
  if (t < 2.8) {
    const k = seg(t, 1.6, 2.8, (x) => x * 0.6 + easeIn(x) * 0.4);
    return {x: lerp(P2[0], P3[0], k), y: lerp(P2[1], P3[1], k), z: 0, giro: (-2.0 + k * 2.0) / R};
  }
  if (t < 4.7) return pulos(t, [P3, ...BARRAS_A.map(sobreBarra)], [2.8, ...HITS_A])!;
  if (t < 5.1) {
    const k = seg(t, 4.7, 5.1);
    const a = sobreBarra(BARRAS_A[4]);
    return {x: lerp(a[0], P4[0], k), y: lerp(a[1], P4[1], k) + Math.sin(k * Math.PI) * 0.22, z: 0, giro: 3};
  }
  if (t < 6.4) {
    const k = seg(t, 5.1, 6.4, (x) => x * 0.6 + easeIn(x) * 0.4);
    return {x: lerp(P4[0], P5[0], k), y: lerp(P4[1], P5[1], k), z: 0, giro: 3 + k * 1.9 / R};
  }
  if (t < 8.3) return pulos(t, [P5, ...BARRAS_B.map(sobreBarra)], [6.4, ...HITS_B])!;
  if (t < 8.7) {
    const k = seg(t, 8.3, 8.7);
    const a = sobreBarra(BARRAS_B[4]);
    return {x: lerp(a[0], FUNIL.x + FUNIL.raio - 0.1, k), y: lerp(a[1], FUNIL.topo, k) + Math.sin(k * Math.PI) * 0.25, z: 0, giro: 20};
  }
  if (t < 9.6) {
    const k = seg(t, 8.7, 9.6, easeIn);
    const raio = lerp(FUNIL.raio - 0.1, 0.1, k);
    const ang = k * Math.PI * 2 * 2.5;
    return {x: FUNIL.x + Math.cos(ang) * raio, y: lerp(FUNIL.topo, FUNIL.base, k), z: Math.sin(ang) * raio, giro: 20 + k * 20};
  }
  if (t < 10.1) {
    const k = seg(t, 9.6, 10.1, easeOut);
    return {x: lerp(CALHA[0][0], CALHA[1][0], k), y: lerp(CALHA[0][1], CALHA[1][1], k) + (1 - seg(t, 9.6, 9.72)) * 0.2, z: 0, giro: 40 + k * 10};
  }
  if (t < 14.6) {
    const k = seg(t, 10.1, 14.6, suave);
    return {x: ELEV_X, y: lerp(CALHA[1][1], ELEV_TOPO, k), z: 0, giro: 50};
  }
  if (t < 15.0) {
    const k = seg(t, 14.6, 15.0, easeOut);
    return {x: lerp(ELEV_X, P0[0], k), y: lerp(ELEV_TOPO, P0[1], k), z: 0, giro: 50 + k * 3};
  }
  // parada no topo antes de recomeçar
  return {x: P0[0], y: P0[1], z: 0, giro: 0};
};

// câmera acompanha a bolinha com atraso suave (média do passado, com volta no loop)
const alturaCamera = (t: number) => {
  let soma = 0;
  const N = 12;
  for (let k = 0; k < N; k++) soma += posBola((((t - k * 0.07) % DUR_BOL) + DUR_BOL) % DUR_BOL).y;
  return Math.min(8.1, Math.max(2.2, soma / N));
};

const Madeira = ({c = '#c98a4b'}: {c?: string}) => <meshStandardMaterial color={c} roughness={0.55} />;

const Rampa = ({a, b}: {a: V2; b: V2}) => {
  const cx = (a[0] + b[0]) / 2;
  const cy = (a[1] + b[1]) / 2 - R - 0.04;
  const comp = Math.hypot(b[0] - a[0], b[1] - a[1]) + 0.3;
  const ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
  return (
    <group position={[cx, cy, 0]} rotation={[0, 0, ang]}>
      <RoundedBox args={[comp, 0.08, 0.42]} radius={0.02} smoothness={3} castShadow receiveShadow>
        <Madeira />
      </RoundedBox>
      {[-0.19, 0.19].map((z) => (
        <RoundedBox key={z} args={[comp, 0.16, 0.04]} radius={0.015} smoothness={2} position={[0, 0.08, z]} castShadow>
          <Madeira c="#a86d36" />
        </RoundedBox>
      ))}
    </group>
  );
};

const CORES_BARRAS = ['#ff3b5c', '#ff9f1c', '#ffd60a', '#2ec4b6', '#4361ee', '#4361ee', '#2ec4b6', '#ffd60a', '#ff9f1c', '#ff3b5c'];

const Funil = () => {
  const geo = useMemo(() => {
    const pts = [new Vector2(0.12, FUNIL.base - 0.12), new Vector2(0.16, FUNIL.base), new Vector2(0.35, FUNIL.base + 0.18), new Vector2(0.6, FUNIL.topo - 0.12), new Vector2(FUNIL.raio + 0.08, FUNIL.topo - 0.02)];
    return new LatheGeometry(pts, 48);
  }, []);
  return (
    <mesh geometry={geo} position={[FUNIL.x, -R, 0]} castShadow receiveShadow>
      <meshPhysicalMaterial color="#ffc23d" metalness={0.35} roughness={0.25} clearcoat={0.8} side={2} />
    </mesh>
  );
};

const Engrenagem = ({pos, r, giro, cor}: {pos: [number, number, number]; r: number; giro: number; cor: string}) => (
  <group position={pos} rotation={[0, 0, giro]}>
    <mesh castShadow>
      <cylinderGeometry args={[r, r, 0.1, 24]} />
      <meshStandardMaterial color={cor} metalness={0.7} roughness={0.3} />
    </mesh>
    {Array.from({length: 10}, (_, i) => (
      <mesh key={i} position={[Math.cos((i / 10) * Math.PI * 2) * r, 0, Math.sin((i / 10) * Math.PI * 2) * r]} rotation={[0, -(i / 10) * Math.PI * 2, 0]} castShadow>
        <boxGeometry args={[0.09, 0.1, 0.09]} />
        <meshStandardMaterial color={cor} metalness={0.7} roughness={0.3} />
      </mesh>
    ))}
  </group>
);

const Maquina = ({t, frame}: {t: number; frame: number}) => {
  const b = posBola(t);
  // barra do xilofone vibra quando a bola bate
  const vib = (i: number) => {
    const d = t - HITS[i];
    return d > 0 && d < 0.5 ? Math.sin(d * 70) * Math.exp(-d * 9) * 0.03 : 0;
  };
  const elevK = t >= 10.1 && t < 14.6 ? seg(t, 10.1, 14.6, suave) : t >= 14.6 ? 1 - seg(t, 14.8, 15.6, suave) : 0;
  const plataformaY = lerp(CALHA[1][1] - R - 0.03, ELEV_TOPO - R - 0.03, elevK);
  const gira = (frame / FPS_BOL) * Math.PI * 2 * (1 / 2); // meia volta por segundo, 16 s = 8 voltas (loop perfeito)
  return (
    <group>
      {/* painel de fundo (pegboard) */}
      <RoundedBox args={[3.6, 9.8, 0.12]} radius={0.04} smoothness={3} position={[-0.1, 5.05, -0.45]} receiveShadow>
        <meshStandardMaterial color="#f4ead8" roughness={0.8} />
      </RoundedBox>
      {Array.from({length: 11}, (_, i) =>
        Array.from({length: 29}, (_, j) => (
          <mesh key={`${i}-${j}`} position={[-1.7 + i * 0.32, 0.45 + j * 0.32, -0.385]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.025, 0.025, 0.01, 8]} />
            <meshStandardMaterial color="#c9bba3" />
          </mesh>
        )),
      )}
      <Rampa a={P0} b={P1} />
      <Rampa a={P2} b={P3} />
      <Rampa a={P4} b={P5} />
      {/* xilofone em escada */}
      {BARRAS.map((p, i) => (
        <group key={i} position={[p[0], p[1] + vib(i), 0]}>
          <RoundedBox args={[0.5, 0.11, 0.42]} radius={0.035} smoothness={3} castShadow receiveShadow>
            <meshPhysicalMaterial color={CORES_BARRAS[i]} roughness={0.25} clearcoat={1} emissive={CORES_BARRAS[i]} emissiveIntensity={Math.max(0, 0.6 - (t - HITS[i]) * 2) * (t > HITS[i] ? 1 : 0)} />
          </RoundedBox>
          {[-0.14, 0.14].map((x) => (
            <mesh key={x} position={[x, -0.08, 0]} castShadow>
              <cylinderGeometry args={[0.02, 0.02, 0.12, 8]} />
              <meshStandardMaterial color="#555" metalness={0.8} roughness={0.3} />
            </mesh>
          ))}
        </group>
      ))}
      <Funil />
      {/* calha até o elevador */}
      <group position={[(CALHA[0][0] + CALHA[1][0]) / 2, (CALHA[0][1] + CALHA[1][1]) / 2 - R - 0.04, 0]} rotation={[0, 0, Math.atan2(CALHA[1][1] - CALHA[0][1], CALHA[1][0] - CALHA[0][0])]}>
        <RoundedBox args={[1.75, 0.07, 0.36]} radius={0.02} smoothness={2} castShadow receiveShadow>
          <meshStandardMaterial color="#8d99ae" metalness={0.6} roughness={0.3} />
        </RoundedBox>
        {[-0.17, 0.17].map((z) => (
          <RoundedBox key={z} args={[1.75, 0.14, 0.03]} radius={0.01} smoothness={2} position={[0, 0.07, z]} castShadow>
            <meshStandardMaterial color="#6c7a91" metalness={0.6} roughness={0.3} />
          </RoundedBox>
        ))}
      </group>
      {/* elevador de vidro */}
      <mesh position={[ELEV_X, (CALHA[1][1] + ELEV_TOPO) / 2, 0]}>
        <cylinderGeometry args={[0.24, 0.24, ELEV_TOPO - CALHA[1][1] + 0.5, 32, 1, true]} />
        <meshPhysicalMaterial color="#d8f3ff" transmission={0.6} transparent opacity={0.28} roughness={0.05} side={2} depthWrite={false} />
      </mesh>
      {[CALHA[1][1] - 0.25, ELEV_TOPO + 0.25].map((y) => (
        <mesh key={y} position={[ELEV_X, y, 0]}>
          <torusGeometry args={[0.24, 0.035, 10, 32]} />
          <meshStandardMaterial color="#e63946" metalness={0.5} roughness={0.3} />
        </mesh>
      ))}
      <mesh position={[ELEV_X, plataformaY, 0]} castShadow>
        <cylinderGeometry args={[0.2, 0.2, 0.05, 24]} />
        <meshStandardMaterial color="#e63946" metalness={0.5} roughness={0.3} />
      </mesh>
      {/* engrenagens girando (período de 2 s: emenda perfeita) */}
      <group rotation={[Math.PI / 2, 0, 0]}>
        <Engrenagem pos={[ELEV_X + 0.0, 0, -(ELEV_TOPO + 0.55)]} r={0.28} giro={gira} cor="#ffb703" />
        <Engrenagem pos={[ELEV_X + 0.5, 0, -(ELEV_TOPO + 0.75)]} r={0.2} giro={-gira * 1.4} cor="#219ebc" />
        <Engrenagem pos={[ELEV_X, 0, -(CALHA[1][1] - 0.6)]} r={0.22} giro={-gira} cor="#fb8500" />
      </group>
      {/* bolinha de metal */}
      <mesh position={[b.x, b.y, b.z]} rotation={[0, 0, b.giro]} castShadow>
        <sphereGeometry args={[R, 48, 32]} />
        <meshPhysicalMaterial color="#ff1f4b" metalness={0.15} roughness={0.12} clearcoat={1} clearcoatRoughness={0.05} />
      </mesh>
    </group>
  );
};

const Camera = ({y}: {y: number}) => {
  const camera = useThree((s) => s.camera) as PerspectiveCamera;
  camera.position.set(0.9, y + 0.35, 7.2);
  camera.lookAt(-0.2, y, 0);
  camera.fov = 40;
  camera.updateProjectionMatrix();
  return null;
};

export const LoopBolinha = () => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const t = (frame / FPS_BOL) % DUR_BOL;
  const camY = alturaCamera(t);
  return (
    <AbsoluteFill style={{background: '#0f3b45'}}>
      <ThreeCanvas width={width} height={height} shadows camera={{fov: 40, near: 0.1, far: 100}} gl={{toneMapping: ACESFilmicToneMapping, toneMappingExposure: 1.1}}>
        <Camera y={camY} />
        <SoftShadows size={16} samples={12} focus={0.5} />
        <color attach="background" args={['#0f3b45']} />
        <Backdrop floor={2} segments={40} receiveShadow position={[0, 0.3, -1.4]} scale={[24, 22, 6]}>
          <meshStandardMaterial color="#1d6a78" roughness={0.9} />
        </Backdrop>
        <Environment resolution={128}>
          <Lightformer intensity={2} position={[0, 5, 5]} scale={[10, 4, 1]} />
          <Lightformer intensity={1.2} position={[-5, 2, 3]} scale={[3, 6, 1]} color="#ffd6a5" />
          <Lightformer intensity={1.2} position={[5, 2, 3]} scale={[3, 6, 1]} color="#a5f3ff" />
        </Environment>
        <hemisphereLight args={['#fff4e8', '#103a44', 0.5]} />
        <directionalLight position={[-3, 11, 6]} intensity={2.4} color="#fff1dc" castShadow shadow-mapSize={[2048, 2048]} shadow-bias={-0.0004} shadow-camera-left={-7} shadow-camera-right={7} shadow-camera-top={7} shadow-camera-bottom={-7} />
        <directionalLight position={[4, 2, -3]} intensity={0.8} color="#7ae7ff" />
        <pointLight position={[0.6, 2.6, 2.5]} intensity={10} color="#fff1dc" distance={6} />
        <Maquina t={t} frame={frame} />
        <EffectComposer multisampling={0}>
          <N8AO aoRadius={0.5} distanceFalloff={1} intensity={2} quality="high" />
          <DepthOfField target={[-0.2, camY, 0]} focalLength={0.05} bokehScale={1.4} />
          <Vignette offset={0.3} darkness={0.5} />
          <SMAA />
        </EffectComposer>
      </ThreeCanvas>
      <Audio src={staticFile('loop/bolinha.wav')} />
    </AbsoluteFill>
  );
};
void Easing;
void interpolate;
