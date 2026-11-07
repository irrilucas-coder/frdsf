import {ThreeCanvas} from '@remotion/three';
import {useThree} from '@react-three/fiber';
import type {PerspectiveCamera} from 'three';
import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import type {V3} from './camera';
import {Environment, Lightformer} from '@react-three/drei';
import {Bloom, EffectComposer, Vignette} from '@react-three/postprocessing';
import {ContornoCtx} from './Bloquinho';

const SincronizaCamera = ({pos, olha, fov}: {pos: V3; olha: V3; fov: number}) => {
  const camera = useThree((s) => s.camera) as PerspectiveCamera;
  const frame = useCurrentFrame();
  // pequeno balanço de "câmera na mão"
  const m = Math.sin(frame * 0.09) * 0.03;
  camera.position.set(pos[0] + m, pos[1] + m * 0.6, pos[2]);
  camera.lookAt(olha[0], olha[1], olha[2]);
  if (camera.fov !== fov) {
    camera.fov = fov;
    camera.updateProjectionMatrix();
  }
  return null;
};

export type Clima = 'dia' | 'noite' | 'submerso' | 'submersoEscuro' | 'interior' | 'artico' | 'espaco' | 'estudio';

const CEU: Record<Clima, [string, string]> = {
  dia: ['#5fb4ff', '#d6efff'],
  noite: ['#0b1440', '#2a3a78'],
  submerso: ['#0b5d84', '#0a2f4d'],
  submersoEscuro: ['#0b3a5a', '#03121f'],
  interior: ['#2a1a10', '#120a05'],
  artico: ['#0d4e66', '#041a2a'],
  espaco: ['#0a0f2e', '#000000'],
  estudio: ['#ffb36b', '#ff5f8f'],
};
const NEBLINA: Partial<Record<Clima, [string, number, number]>> = {
  submerso: ['#0b4a6b', 4, 30],
  submersoEscuro: ['#0a3350', 5, 30],
  artico: ['#0a3a50', 4, 34],
  noite: ['#0d1435', 20, 80],
  dia: ['#cfe9ff', 30, 110],
};

export const Palco = ({
  clima,
  pos,
  olha,
  fov = 50,
  children,
  sombras = true,
  cinema = false,
}: {
  clima: Clima;
  pos: V3;
  olha: V3;
  fov?: number;
  children: React.ReactNode;
  sombras?: boolean;
  cinema?: boolean; // visual novo: contorno, brilho nas luzes, vinheta e reflexos suaves
}) => {
  const {width, height} = useVideoConfig();
  const [topo, base] = CEU[clima];
  const neb = NEBLINA[clima];
  const luzDia = clima === 'dia' || clima === 'estudio';
  // no modo cinema o Environment já ilumina: reduzimos as outras luzes para não estourar
  const k = cinema ? 0.55 : 1;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{background: `linear-gradient(180deg, ${topo} 0%, ${base} 100%)`}} />
      <ThreeCanvas width={width} height={height} shadows={sombras} camera={{fov, near: 0.1, far: 300}}>
        <SincronizaCamera pos={pos} olha={olha} fov={fov} />
        {neb && <fog attach="fog" args={neb} />}
        <ambientLight intensity={k * (luzDia ? 0.9 : clima === 'interior' ? 0.35 : clima === 'noite' || clima === 'submersoEscuro' ? 1.1 : 0.6)} color={luzDia ? '#ffffff' : '#9fc4ff'} />
        <hemisphereLight args={[luzDia ? '#bfe3ff' : '#6f9fd8', '#2a2a2a', k * (luzDia ? 0.9 : 1.0)]} />
        <directionalLight
          position={[6, 12, 8]}
          intensity={k * (luzDia ? 2.4 : clima === 'interior' ? 0.3 : 1.1)}
          color={luzDia ? '#fff3dd' : '#b8d4ff'}
          castShadow
          shadow-mapSize={[1024, 1024]}
          shadow-camera-left={-12}
          shadow-camera-right={12}
          shadow-camera-top={12}
          shadow-camera-bottom={-12}
        />
        <ContornoCtx.Provider value={cinema}>{children}</ContornoCtx.Provider>
        {cinema && (
          <>
            <Environment resolution={64}>
              <Lightformer intensity={1.2} position={[0, 5, 5]} scale={[10, 5, 1]} />
              <Lightformer intensity={1} position={[-5, 2, 2]} scale={[4, 4, 1]} color="#9fc4ff" />
              <Lightformer intensity={1} position={[5, 2, 2]} scale={[4, 4, 1]} color="#ffd9a8" />
            </Environment>
            <EffectComposer multisampling={4}>
              <Bloom intensity={0.5} luminanceThreshold={0.95} luminanceSmoothing={0.15} mipmapBlur />
              <Vignette offset={0.25} darkness={0.55} />
            </EffectComposer>
          </>
        )}
      </ThreeCanvas>
    </AbsoluteFill>
  );
};
