import {ThreeCanvas} from '@remotion/three';
import {useThree} from '@react-three/fiber';
import {AbsoluteFill, useVideoConfig} from 'remotion';
import {Bloquinho} from '../submarino/Bloquinho';

// Foto de perfil do canal: apresentador de bloquinhos com microfone, centralizado para o recorte redondo.
type Props = {fundo1: string; fundo2: string; camisa: string; cabelo: string; boné: string};

const Camera = () => {
  const camera = useThree((s) => s.camera);
  camera.position.set(0.15, 2.0, 3.5);
  camera.lookAt(0.05, 1.6, 0);
  return null;
};

const Microfone = () => (
  <group position={[-0.5, 1.2, 0.42]} rotation={[0.35, 0, 0.45]}>
    <mesh>
      <cylinderGeometry args={[0.06, 0.05, 0.42, 12]} />
      <meshStandardMaterial color="#1a1a1a" metalness={0.5} roughness={0.4} />
    </mesh>
    <mesh position={[0, 0.27, 0]}>
      <sphereGeometry args={[0.12, 16, 16]} />
      <meshStandardMaterial color="#9aa0a8" metalness={0.8} roughness={0.25} />
    </mesh>
    <mesh position={[0, 0.06, 0]}>
      <boxGeometry args={[0.16, 0.12, 0.16]} />
      <meshStandardMaterial color="#e10600" />
    </mesh>
  </group>
);

export const Perfil = ({fundo1, fundo2, camisa, cabelo, boné}: Props) => {
  const {width, height} = useVideoConfig();
  return (
    <AbsoluteFill style={{background: `radial-gradient(circle at 50% 40%, ${fundo1} 0%, ${fundo2} 75%)`}}>
      {/* raios de fundo */}
      <AbsoluteFill
        style={{
          opacity: 0.18,
          background: `repeating-conic-gradient(from 0deg at 50% 45%, #ffffff 0deg 8deg, transparent 8deg 22deg)`,
        }}
      />
      <ThreeCanvas width={width} height={height} camera={{fov: 40}}>
        <Camera />
        <ambientLight intensity={1.1} />
        <hemisphereLight args={['#ffffff', '#555577', 1.1]} />
        <directionalLight position={[3, 5, 4]} intensity={2.2} />
        <pointLight position={[-2, 2.5, 2]} intensity={6} color={fundo1} />
        <Bloquinho pose="acenar" expressao="feliz" fase={1} camisa={camisa} calca="#22252b" pele="#e8b48a" chapeu="cabelo" corChapeu={cabelo} />
        {/* boné */}
        <mesh position={[0, 2.25, 0]}>
          <boxGeometry args={[0.62, 0.16, 0.62]} />
          <meshStandardMaterial color={boné} />
        </mesh>
        <mesh position={[0, 2.2, 0.42]}>
          <boxGeometry args={[0.56, 0.05, 0.3]} />
          <meshStandardMaterial color={boné} />
        </mesh>
        <Microfone />
      </ThreeCanvas>
    </AbsoluteFill>
  );
};
