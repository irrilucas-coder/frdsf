import {useCurrentFrame} from 'remotion';

type V3 = [number, number, number];
// Seta 3D (força, movimento, direção). Cresce ao aparecer e pulsa.
export const Seta3D = ({de, para, cor = '#e53935', espessura = 0.07, k = 1}: {de: V3; para: V3; cor?: string; espessura?: number; k?: number}) => {
  const frame = useCurrentFrame();
  const dx = para[0] - de[0];
  const dy = para[1] - de[1];
  const dz = para[2] - de[2];
  const comp = Math.hypot(dx, dy, dz) * Math.max(0.001, k);
  const pulso = 1 + Math.sin(frame * 0.35) * 0.06;
  // orienta o eixo Y local na direção de "de" para "para"
  const yaw = Math.atan2(dx, dz);
  const pitch = Math.acos(Math.max(-1, Math.min(1, dy / (Math.hypot(dx, dy, dz) || 1))));
  if (k <= 0.01) return null;
  const ponta = Math.min(espessura * 4.5, comp * 0.45);
  return (
    <group position={de} rotation={[0, yaw, 0]}>
      <group rotation={[pitch, 0, 0]} scale={[pulso, 1, pulso]}>
        <mesh position={[0, (comp - ponta) / 2, 0]}>
          <cylinderGeometry args={[espessura, espessura, comp - ponta, 10]} />
          <meshStandardMaterial color={cor} emissive={cor} emissiveIntensity={0.45} roughness={0.4} />
        </mesh>
        <mesh position={[0, comp - ponta / 2, 0]}>
          <coneGeometry args={[espessura * 2.4, ponta, 12]} />
          <meshStandardMaterial color={cor} emissive={cor} emissiveIntensity={0.45} roughness={0.4} />
        </mesh>
      </group>
    </group>
  );
};
