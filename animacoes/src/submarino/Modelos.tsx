import {useCurrentFrame} from 'remotion';

type V3 = [number, number, number];

const Bloco = ({
  tam,
  pos = [0, 0, 0],
  rot = [0, 0, 0],
  cor,
  metal = 0,
  rug = 0.7,
  emissivo = 0,
}: {
  tam: V3;
  pos?: V3;
  rot?: V3;
  cor: string;
  metal?: number;
  rug?: number;
  emissivo?: number;
}) => (
  <mesh position={pos} rotation={rot} castShadow receiveShadow>
    <boxGeometry args={tam} />
    <meshStandardMaterial
      color={cor}
      metalness={metal}
      roughness={rug}
      emissive={emissivo ? cor : '#000'}
      emissiveIntensity={emissivo}
    />
  </mesh>
);

// Cilindro deitado ao longo do eixo X
const Tubo = ({
  raio,
  comp,
  pos = [0, 0, 0],
  cor,
  lados = 12,
  metal = 0.3,
  raioFim,
}: {
  raio: number;
  comp: number;
  pos?: V3;
  cor: string;
  lados?: number;
  metal?: number;
  raioFim?: number;
}) => (
  <mesh position={pos} rotation={[0, 0, Math.PI / 2]} castShadow>
    <cylinderGeometry args={[raioFim ?? raio, raio, comp, lados]} />
    <meshStandardMaterial color={cor} metalness={metal} roughness={0.5} flatShading />
  </mesh>
);

const Helice = ({pos, giro, cor = '#c9a227', tam = 0.35}: {pos: V3; giro: number; cor?: string; tam?: number}) => (
  <group position={pos} rotation={[giro, 0, 0]}>
    {[0, 1, 2].map((i) => (
      <Bloco key={i} tam={[0.04, tam, 0.12]} pos={[0, 0, 0]} rot={[(i * Math.PI * 2) / 3, 0, 0.3]} cor={cor} metal={0.7} />
    ))}
  </group>
);

// ---------- 0. Barril do gancho ----------
export const Barril = ({posicao = [0, 0, 0] as V3, rot = 0}) => (
  <group position={posicao} rotation={[0, 0, rot]}>
    <mesh castShadow>
      <cylinderGeometry args={[0.9, 0.9, 1.9, 14]} />
      <meshStandardMaterial color="#8b5a2b" roughness={0.9} flatShading />
    </mesh>
    {[-0.6, 0, 0.6].map((y) => (
      <mesh key={y} position={[0, y, 0]}>
        <cylinderGeometry args={[0.93, 0.93, 0.1, 14]} />
        <meshStandardMaterial color="#555" metalness={0.6} roughness={0.4} flatShading />
      </mesh>
    ))}
    {/* Janelinha */}
    <mesh position={[0, 0.25, 0.88]} rotation={[Math.PI / 2, 0, 0]}>
      <cylinderGeometry args={[0.28, 0.28, 0.08, 16]} />
      <meshStandardMaterial color="#9fe8ff" emissive="#ff3b3b" emissiveIntensity={0.6} transparent opacity={0.85} />
    </mesh>
  </group>
);

// ---------- 1. Barco de Drebbel (1620) ----------
export const BarcoDrebbel = ({posicao = [0, 0, 0] as V3, remando = true}) => {
  const frame = useCurrentFrame();
  const remo = Math.sin(frame * 0.18) * 0.45;
  return (
    <group position={posicao}>
      {/* Casco de madeira */}
      <Bloco tam={[4, 0.5, 1.3]} pos={[0, 0, 0]} cor="#7a4a26" />
      <Bloco tam={[0.8, 0.45, 1.0]} pos={[2.3, 0.05, 0]} rot={[0, 0, 0.35]} cor="#7a4a26" />
      <Bloco tam={[0.8, 0.45, 1.0]} pos={[-2.3, 0.05, 0]} rot={[0, 0, -0.35]} cor="#7a4a26" />
      {/* Cobertura de couro engraxado */}
      <mesh position={[0, 0.25, 0]} scale={[2.1, 0.55, 0.68]} castShadow>
        <sphereGeometry args={[1, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#3b2416" roughness={0.25} metalness={0.15} flatShading />
      </mesh>
      {/* Escotilha */}
      <Bloco tam={[0.5, 0.25, 0.5]} pos={[0.6, 0.8, 0]} cor="#5c3b22" />
      {/* Remos saindo pelos lados */}
      {[-1.2, -0.4, 0.4, 1.2].map((x) =>
        [1, -1].map((lado) => (
          <group key={`${x}${lado}`} position={[x, 0.05, 0.62 * lado]} rotation={[lado * 0.5, remo * lado, 0]}>
            <Bloco tam={[0.08, 0.08, 1.6]} pos={[0, 0, 0.8 * lado]} cor="#a0703c" />
            <Bloco tam={[0.25, 0.04, 0.45]} pos={[0, 0, 1.55 * lado]} cor="#a0703c" />
          </group>
        )),
      )}
    </group>
  );
};

// ---------- 2. Turtle (1776) ----------
export const Turtle = ({posicao = [0, 0, 0] as V3, girando = true, rotY = 0, escala = 1}) => {
  const frame = useCurrentFrame();
  const giro = girando ? frame * 0.5 : 0;
  return (
    <group position={posicao} rotation={[0, rotY, 0]} scale={escala}>
      {/* Casca em forma de ovo/tartaruga */}
      <mesh scale={[0.85, 1.1, 0.75]} castShadow>
        <sphereGeometry args={[1, 14, 12]} />
        <meshStandardMaterial color="#6e4524" roughness={0.85} flatShading />
      </mesh>
      {/* Faixas de ferro */}
      {[-0.4, 0.2].map((y) => (
        <mesh key={y} position={[0, y, 0]} scale={[0.87, 1, 0.77]}>
          <torusGeometry args={[0.96, 0.04, 6, 24]} />
          <meshStandardMaterial color="#444" metalness={0.7} />
        </mesh>
      ))}
      {/* Torre de latão com janelinhas */}
      <mesh position={[0, 1.1, 0]} castShadow>
        <cylinderGeometry args={[0.32, 0.38, 0.35, 10]} />
        <meshStandardMaterial color="#c9a227" metalness={0.8} roughness={0.3} flatShading />
      </mesh>
      {[0, 1, 2, 3].map((i) => (
        <mesh
          key={i}
          position={[Math.sin((i * Math.PI) / 2) * 0.36, 1.12, Math.cos((i * Math.PI) / 2) * 0.36]}
          rotation={[0, (i * Math.PI) / 2, 0]}
        >
          <boxGeometry args={[0.12, 0.1, 0.03]} />
          <meshStandardMaterial color="#bff4ff" emissive="#ffd27a" emissiveIntensity={0.8} />
        </mesh>
      ))}
      {/* Hélice da frente e de cima */}
      <group position={[0, 0.1, 0.8]} rotation={[0, Math.PI / 2, 0]}>
        <Helice pos={[0, 0, 0]} giro={giro} />
      </group>
      <group position={[0, 1.4, 0]} rotation={[0, giro, 0]}>
        <Bloco tam={[0.5, 0.03, 0.1]} cor="#c9a227" metal={0.7} />
        <Bloco tam={[0.1, 0.03, 0.5]} cor="#c9a227" metal={0.7} />
      </group>
      {/* Leme e broca */}
      <Bloco tam={[0.06, 0.6, 0.4]} pos={[0, -0.1, -0.85]} cor="#5a3a1c" />
      <mesh position={[0, 1.25, 0.45]} rotation={[Math.PI / 2.4, 0, 0]}>
        <coneGeometry args={[0.06, 0.4, 8]} />
        <meshStandardMaterial color="#999" metalness={0.9} />
      </mesh>
    </group>
  );
};

// ---------- Navio de guerra a vela ----------
export const NavioVela = ({posicao = [0, 0, 0] as V3, escala = 1, rotY = 0, inclina = 0}) => (
  <group position={posicao} scale={escala} rotation={[0, rotY, inclina]}>
    <Bloco tam={[8, 1.6, 2.2]} pos={[0, 0, 0]} cor="#3d2817" />
    <Bloco tam={[8.2, 0.25, 2.3]} pos={[0, 0.6, 0]} cor="#c9a227" metal={0.4} />
    <Bloco tam={[1.8, 1.0, 2.2]} pos={[-3.3, 1.2, 0]} cor="#4a311c" />
    <Bloco tam={[1.6, 0.4, 1.4]} pos={[4.6, 0.4, 0]} rot={[0, 0, 0.3]} cor="#3d2817" />
    {/* Portinholas de canhão */}
    {[-2.5, -1.5, -0.5, 0.5, 1.5, 2.5].map((x) => (
      <Bloco key={x} tam={[0.35, 0.3, 0.05]} pos={[x, 0.15, 1.12]} cor="#111" />
    ))}
    {/* Mastros e velas */}
    {[-1.8, 0.4, 2.4].map((x, i) => (
      <group key={x} position={[x, 0.8, 0]}>
        <Bloco tam={[0.18, 5.5 - i * 0.6, 0.18]} pos={[0, (5.5 - i * 0.6) / 2, 0]} cor="#5a3a1c" />
        <Bloco tam={[0.1, 1.7, 2.6]} pos={[0, 2.2, 0]} cor="#efe6d2" />
        <Bloco tam={[0.1, 1.3, 2.1]} pos={[0, 4.0 - i * 0.4, 0]} cor="#efe6d2" />
      </group>
    ))}
    {/* Lanternas acesas */}
    {[-3.6, 3.8].map((x) => (
      <mesh key={x} position={[x, 2, 0]}>
        <sphereGeometry args={[0.12, 8, 8]} />
        <meshStandardMaterial color="#ffd27a" emissive="#ffb347" emissiveIntensity={3} />
      </mesh>
    ))}
  </group>
);

// ---------- Navio a vapor (Housatonic, 1864) ----------
export const NavioVapor = ({posicao = [0, 0, 0] as V3, inclina = 0, escala = 1}) => (
  <group position={posicao} rotation={[0, 0, inclina]} scale={escala}>
    <Bloco tam={[9, 1.5, 2]} cor="#2a2a2e" />
    <Bloco tam={[9.1, 0.2, 2.05]} pos={[0, 0.5, 0]} cor="#7a1f1f" />
    <Bloco tam={[1.4, 0.4, 1.3]} pos={[5, 0.3, 0]} rot={[0, 0, 0.3]} cor="#2a2a2e" />
    <Tubo raio={0.35} comp={2.2} pos={[0.6, 1.8, 0]} cor="#1b1b1b" />
    <mesh position={[0.6, 2.0, 0]}>
      <cylinderGeometry args={[0.38, 0.38, 2.2, 12]} />
      <meshStandardMaterial color="#1b1b1b" />
    </mesh>
    {[-2.4, 3].map((x) => (
      <group key={x} position={[x, 0.8, 0]}>
        <Bloco tam={[0.15, 4.5, 0.15]} pos={[0, 2.25, 0]} cor="#3a2a1a" />
        <Bloco tam={[0.08, 1.4, 2]} pos={[0, 2.4, 0]} cor="#d8d0bd" />
      </group>
    ))}
  </group>
);

// ---------- 3. H.L. Hunley (1864) ----------
export const Hunley = ({posicao = [0, 0, 0] as V3, rotY = 0, inclina = 0}) => {
  const frame = useCurrentFrame();
  return (
    <group position={posicao} rotation={[0, rotY, inclina]}>
      <Tubo raio={0.45} comp={5} cor="#4b4f55" lados={10} metal={0.6} />
      <mesh position={[2.5, 0, 0]} rotation={[0, 0, -Math.PI / 2]} castShadow>
        <coneGeometry args={[0.45, 1.2, 10]} />
        <meshStandardMaterial color="#4b4f55" metalness={0.6} roughness={0.5} flatShading />
      </mesh>
      <mesh position={[-2.5, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <coneGeometry args={[0.45, 1.0, 10]} />
        <meshStandardMaterial color="#4b4f55" metalness={0.6} roughness={0.5} flatShading />
      </mesh>
      {[1.3, -1.3].map((x) => (
        <Bloco key={x} tam={[0.5, 0.35, 0.35]} pos={[x, 0.55, 0]} cor="#3e4247" metal={0.6} />
      ))}
      {/* Vara com a carga explosiva */}
      <Bloco tam={[3.2, 0.07, 0.07]} pos={[4.5, -0.2, 0]} rot={[0, 0, -0.08]} cor="#6b6b6b" metal={0.7} />
      <mesh position={[6.1, -0.33, 0]}>
        <cylinderGeometry args={[0.18, 0.18, 0.5, 10]} />
        <meshStandardMaterial color="#2b2b2b" metalness={0.5} />
      </mesh>
      <Helice pos={[-3.05, 0, 0]} giro={frame * 0.4} cor="#8a8f96" tam={0.5} />
    </group>
  );
};

// ---------- 4. USS Holland (1900) ----------
export const SubHolland = ({posicao = [0, 0, 0] as V3, rotY = 0, inclina = 0, fumaca = false}) => {
  const frame = useCurrentFrame();
  return (
    <group position={posicao} rotation={[0, rotY, inclina]}>
      <mesh scale={[3, 0.6, 0.6]} castShadow>
        <sphereGeometry args={[1, 20, 12]} />
        <meshStandardMaterial color="#6f7a80" metalness={0.65} roughness={0.35} flatShading />
      </mesh>
      <Bloco tam={[2.4, 0.08, 0.7]} pos={[0.2, 0.55, 0]} cor="#5c666b" metal={0.6} />
      <mesh position={[0.4, 0.75, 0]} castShadow>
        <cylinderGeometry args={[0.25, 0.3, 0.45, 10]} />
        <meshStandardMaterial color="#7d888e" metalness={0.7} roughness={0.3} flatShading />
      </mesh>
      <Helice pos={[-3.05, 0, 0]} giro={frame * 0.6} cor="#b08d2a" tam={0.55} />
      <Bloco tam={[0.05, 0.7, 0.3]} pos={[-2.8, 0, 0]} cor="#5c666b" />
      {fumaca &&
        [0, 1, 2, 3].map((i) => {
          const tt = ((frame + i * 12) % 48) / 48;
          return (
            <mesh key={i} position={[-1.2 - tt * 1.2, 0.9 + tt * 1.2, 0]} scale={0.15 + tt * 0.35}>
              <sphereGeometry args={[1, 8, 8]} />
              <meshStandardMaterial color="#9a9a9a" transparent opacity={(1 - tt) * 0.6} />
            </mesh>
          );
        })}
    </group>
  );
};

// ---------- 5. USS Nautilus (1954) ----------
export const Nautilus = ({posicao = [0, 0, 0] as V3, rotY = 0, escala = 1}) => {
  const frame = useCurrentFrame();
  return (
    <group position={posicao} rotation={[0, rotY, 0]} scale={escala}>
      <mesh scale={[5.5, 0.85, 0.85]} castShadow>
        <sphereGeometry args={[1, 28, 16]} />
        <meshStandardMaterial color="#25282d" metalness={0.5} roughness={0.45} />
      </mesh>
      {/* Vela (torre) com lemes */}
      <Bloco tam={[1.6, 1.1, 0.45]} pos={[1.6, 1.1, 0]} cor="#2c3036" metal={0.5} />
      <Bloco tam={[0.6, 0.06, 1.6]} pos={[1.7, 1.2, 0]} cor="#2c3036" metal={0.5} />
      <Bloco tam={[0.08, 0.6, 0.08]} pos={[1.3, 1.9, 0]} cor="#555" />
      <Bloco tam={[0.08, 0.4, 0.08]} pos={[1.7, 1.8, 0]} cor="#555" />
      {/* Número no casco */}
      <Bloco tam={[0.9, 0.3, 0.02]} pos={[3.2, 0.25, 0.79]} cor="#e8e8e8" emissivo={0.15} />
      {/* Lemes de popa */}
      <Bloco tam={[0.8, 0.06, 2]} pos={[-4.9, 0, 0]} cor="#2c3036" />
      <Bloco tam={[0.8, 1.6, 0.06]} pos={[-4.9, 0, 0]} cor="#2c3036" />
      <Helice pos={[-5.5, 0, 0]} giro={frame * 0.5} cor="#a88a3a" tam={0.7} />
    </group>
  );
};
