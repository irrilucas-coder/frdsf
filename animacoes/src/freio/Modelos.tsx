import type React from 'react';
import {useMemo} from 'react';
import {useCurrentFrame} from 'remotion';
import {Bloquinho} from '../submarino/Bloquinho';
import {aleatorio} from '../tempo';

type V3 = [number, number, number];

export const B = ({tam, pos = [0, 0, 0], rot = [0, 0, 0], cor, emi = 0, metal = 0.1, rug = 0.6, op = 1}: {tam: V3; pos?: V3; rot?: V3; cor: string; emi?: number; metal?: number; rug?: number; op?: number}) => (
  <mesh position={pos} rotation={rot} castShadow receiveShadow>
    <boxGeometry args={tam} />
    <meshStandardMaterial color={cor} roughness={rug} metalness={metal} emissive={emi ? cor : '#000'} emissiveIntensity={emi} transparent={op < 1} opacity={op} />
  </mesh>
);

// Cilindro deitado no eixo X (rodas, discos, tambores)
export const Cil = ({r, l, pos = [0, 0, 0], rot = 0, cor, metal = 0.5, emi = 0, lados = 28, op = 1}: {r: number; l: number; pos?: V3; rot?: number; cor: string; metal?: number; emi?: number; lados?: number; op?: number}) => (
  <mesh position={pos} rotation={[rot, 0, Math.PI / 2]} castShadow>
    <cylinderGeometry args={[r, r, l, lados]} />
    <meshStandardMaterial color={cor} metalness={metal} roughness={0.4} emissive={emi ? cor : '#000'} emissiveIntensity={emi} transparent={op < 1} opacity={op} />
  </mesh>
);

// ---------- Roda completa: pneu, aro e raios. giro = ângulo ----------
export const Roda = ({giro = 0, raio = 0.42, larg = 0.3, travada = false}: {giro?: number; raio?: number; larg?: number; travada?: boolean}) => (
  <group rotation={[travada ? 0 : giro, 0, 0]}>
    <Cil r={raio} l={larg} cor="#1a1a1a" metal={0} />
    <Cil r={raio * 0.62} l={larg + 0.02} cor="#c9ced4" metal={0.8} />
    {[0, 1, 2, 3, 4].map((i) => (
      <mesh key={i} rotation={[(i * Math.PI * 2) / 5, 0, 0]} position={[larg / 2 + 0.012, 0, 0]}>
        <boxGeometry args={[0.02, raio * 1.1, 0.07]} />
        <meshStandardMaterial color="#8a9098" metalness={0.8} />
      </mesh>
    ))}
    <Cil r={0.06} l={larg + 0.04} cor="#555" metal={0.8} />
  </group>
);

// ---------- Carro estilizado (hatch), frente para +X ----------
export const Carro = ({posicao = [0, 0, 0] as V3, rotY = 0, giro = 0, travada = false, cor = '#e10600', motorista, inclina = 0, raiox = false}: {posicao?: V3; rotY?: number; giro?: number; travada?: boolean; cor?: string; motorista?: React.ReactNode; inclina?: number; raiox?: boolean}) => {
  const op = raiox ? 0.25 : 1;
  return (
    <group position={posicao} rotation={[0, rotY, inclina]}>
      {/* carroceria */}
      <B tam={[3.6, 0.7, 1.7]} pos={[0, 0.65, 0]} cor={cor} metal={0.4} rug={0.3} op={op} />
      <B tam={[2.0, 0.65, 1.6]} pos={[-0.25, 1.32, 0]} cor={cor} metal={0.4} rug={0.3} op={op} />
      {/* vidros */}
      <B tam={[0.05, 0.5, 1.45]} pos={[0.78, 1.32, 0]} rot={[0, 0, -0.35]} cor="#9ec9e8" metal={0.6} rug={0.1} op={raiox ? 0.15 : 0.7} />
      <B tam={[1.6, 0.45, 0.04]} pos={[-0.3, 1.33, 0.81]} cor="#9ec9e8" metal={0.6} rug={0.1} op={raiox ? 0.15 : 0.6} />
      <B tam={[1.6, 0.45, 0.04]} pos={[-0.3, 1.33, -0.81]} cor="#9ec9e8" metal={0.6} rug={0.1} op={raiox ? 0.15 : 0.6} />
      {/* faróis, lanternas, para-choques */}
      {[-0.55, 0.55].map((z) => (
        <group key={z}>
          <B tam={[0.05, 0.18, 0.35]} pos={[1.81, 0.78, z]} cor="#fff6d6" emi={1.2} />
          <B tam={[0.05, 0.16, 0.3]} pos={[-1.81, 0.8, z]} cor="#e10600" emi={1} />
        </group>
      ))}
      <B tam={[0.12, 0.2, 1.75]} pos={[1.82, 0.38, 0]} cor="#222" op={op} />
      <B tam={[0.12, 0.2, 1.75]} pos={[-1.82, 0.38, 0]} cor="#222" op={op} />
      {motorista && <group position={[0.1, 0.35, 0.35]}>{motorista}</group>}
      {/* rodas (giram em torno do eixo Z do carro: rotacionamos o grupo para alinhar) */}
      {[
        [1.15, 0.85],
        [1.15, -0.85],
        [-1.15, 0.85],
        [-1.15, -0.85],
      ].map(([x, z], i) => (
        <group key={i} position={[x, 0.42, z]} rotation={[0, Math.PI / 2, 0]}>
          <Roda giro={-giro} travada={travada} />
        </group>
      ))}
    </group>
  );
};

// ---------- Estrada com faixas que correm (velocidade) ----------
export const Estrada = ({deslocamento = 0, ladeira = 0}: {deslocamento?: number; ladeira?: number}) => {
  const arvores = useMemo(() => {
    const r = aleatorio(4);
    return Array.from({length: 24}, (_, i) => ({x: i * 6 - 60, z: (r() > 0.5 ? 1 : -1) * (5 + r() * 4), s: 0.8 + r() * 0.6}));
  }, []);
  const d = ((deslocamento % 6) + 6) % 6;
  return (
    <group rotation={[0, 0, ladeira]}>
      <B tam={[200, 0.1, 30]} pos={[0, -0.06, 0]} cor="#7fb069" />
      <B tam={[200, 0.12, 5]} pos={[0, -0.04, 0]} cor="#3a3d44" />
      {Array.from({length: 40}, (_, i) => (
        <B key={i} tam={[2, 0.13, 0.15]} pos={[i * 6 - 120 - d, -0.03, 0]} cor="#f2f2f2" />
      ))}
      {arvores.map((a, i) => (
        <group key={i} position={[(((a.x - deslocamento) % 144) + 144) % 144 - 72, 0, a.z]} scale={a.s}>
          <B tam={[0.3, 1.2, 0.3]} pos={[0, 0.6, 0]} cor="#7a4a26" />
          <B tam={[1.3, 1.2, 1.3]} pos={[0, 1.7, 0]} cor="#3e9a4a" />
        </group>
      ))}
    </group>
  );
};

// ---------- Fogo / fumaça ----------
export const Fogo = ({posicao, intensidade = 1}: {posicao: V3; intensidade?: number}) => {
  const frame = useCurrentFrame();
  return (
    <group position={posicao} scale={intensidade}>
      {Array.from({length: 8}, (_, i) => {
        const t = ((frame * 0.05 + i * 0.13) % 1);
        return (
          <mesh key={i} position={[Math.sin(i * 2.1) * 0.1, t * 0.8, Math.cos(i * 1.7) * 0.1]} scale={(1 - t) * 0.22}>
            <icosahedronGeometry args={[1, 0]} />
            <meshStandardMaterial color={t < 0.4 ? '#ffd23f' : '#ff6a00'} emissive={t < 0.4 ? '#ffb703' : '#ff3d00'} emissiveIntensity={3} transparent opacity={1 - t} />
          </mesh>
        );
      })}
      {Array.from({length: 6}, (_, i) => {
        const t = ((frame * 0.025 + i * 0.17) % 1);
        return (
          <mesh key={`f${i}`} position={[Math.sin(i) * 0.2 + t * 0.3, 0.6 + t * 1.6, 0]} scale={0.15 + t * 0.4}>
            <icosahedronGeometry args={[1, 0]} />
            <meshStandardMaterial color="#6b6b6b" transparent opacity={(1 - t) * 0.5} />
          </mesh>
        );
      })}
      <pointLight color="#ff7a1a" intensity={20 * intensidade} distance={4} />
    </group>
  );
};

// ---------- Freio de sapata (carrinho de madeira) ----------
export const Carrinho = ({giro = 0, alavanca = 0, sapata = 0, quente = 0, motorista}: {giro?: number; alavanca?: number; sapata?: number; quente?: number; motorista?: React.ReactNode}) => (
  <group>
    <B tam={[2.6, 0.15, 1.3]} pos={[0, 0.75, 0]} cor="#8a5a2b" />
    <B tam={[2.6, 0.5, 0.08]} pos={[0, 1.05, 0.62]} cor="#7a4a26" />
    <B tam={[2.6, 0.5, 0.08]} pos={[0, 1.05, -0.62]} cor="#7a4a26" />
    {[
      [0.9, 0.72],
      [-0.9, 0.72],
      [0.9, -0.72],
      [-0.9, -0.72],
    ].map(([x, z], i) => (
      <group key={i} position={[x, 0.5, z]} rotation={[0, Math.PI / 2, 0]}>
        <group rotation={[-giro, 0, 0]}>
          <Cil r={0.5} l={0.12} cor="#6b4423" metal={0} />
          {[0, 1, 2, 3].map((k) => (
            <mesh key={k} rotation={[(k * Math.PI) / 4, 0, 0]}>
              <boxGeometry args={[0.13, 0.9, 0.06]} />
              <meshStandardMaterial color="#5a3a1c" />
            </mesh>
          ))}
          <Cil r={0.52} l={0.08} cor="#3a3a3a" metal={0.6} />
        </group>
      </group>
    ))}
    {/* sapata de madeira encostando na roda traseira + alavanca */}
    <group position={[-0.9 + 0.62 - sapata * 0.06, 0.62, 0.72]}>
      <B tam={[0.16, 0.35, 0.14]} cor={quente > 0.5 ? '#3a1a0a' : '#a07040'} emi={quente * 0.6} />
    </group>
    <group position={[-0.25, 0.85, 0.75]} rotation={[0, 0, -0.3 - alavanca * 0.6]}>
      <B tam={[0.07, 1.1, 0.07]} pos={[0, 0.55, 0]} cor="#5a3a1c" />
      <B tam={[0.14, 0.14, 0.14]} pos={[0, 1.1, 0]} cor="#3a2a1a" />
    </group>
    {motorista && <group position={[0.2, 0.82, 0]}>{motorista}</group>}
  </group>
);

// ---------- Freio a tambor em corte ----------
export const Tambor = ({giro = 0, abertura = 0, calor = 0}: {giro?: number; abertura?: number; calor?: number}) => {
  const quente = calor > 0.5;
  return (
    <group>
      {/* tambor (anel cortado: só a borda e o fundo) */}
      <group rotation={[giro, 0, 0]}>
        <mesh rotation={[0, Math.PI / 2, 0]}>
          <torusGeometry args={[1.05, 0.12, 12, 48]} />
          <meshStandardMaterial color={quente ? '#c0392b' : '#7d858e'} metalness={0.7} roughness={0.4} emissive={quente ? '#ff3b1a' : '#000'} emissiveIntensity={calor * 1.2} />
        </mesh>
        <Cil r={1.15} l={0.06} pos={[-0.18, 0, 0]} cor="#5d6670" />
        {[0, 1, 2, 3, 4].map((i) => (
          <mesh key={i} rotation={[(i * Math.PI * 2) / 5, 0, 0]} position={[-0.2, 0.7, 0]}>
            <cylinderGeometry args={[0.05, 0.05, 0.1, 8]} />
            <meshStandardMaterial color="#c9a227" metalness={0.8} />
          </mesh>
        ))}
      </group>
      {/* sapatas (meia-lua) que abrem por dentro */}
      {[1, -1].map((l) => (
        <group key={l} position={[0, l * (0.42 + abertura * 0.12), 0]}>
          <mesh rotation={[l > 0 ? 0 : Math.PI, Math.PI / 2, 0]}>
            <torusGeometry args={[0.45, 0.12, 8, 24, Math.PI]} />
            <meshStandardMaterial color="#c9a227" metalness={0.4} />
          </mesh>
        </group>
      ))}
      {/* cilindro que empurra as sapatas */}
      <B tam={[0.2, 0.3, 0.3]} pos={[0, 0, 0.8]} cor="#3a3f46" metal={0.6} />
      {/* mola de retorno */}
      <B tam={[0.05, 0.6, 0.05]} pos={[0, 0, -0.6]} cor="#e10600" />
    </group>
  );
};

// ---------- Freio a disco: disco ventilado + pinça com pastilhas ----------
export const Disco = ({giro = 0, aperto = 0, calor = 0}: {giro?: number; aperto?: number; calor?: number}) => (
  <group>
    <group rotation={[giro, 0, 0]}>
      <Cil r={1.1} l={0.12} pos={[0.1, 0, 0]} cor={calor > 0.5 ? '#c0392b' : '#c4c9cf'} metal={0.45} emi={calor} />
      <Cil r={1.1} l={0.12} pos={[-0.1, 0, 0]} cor={calor > 0.5 ? '#c0392b' : '#c4c9cf'} metal={0.45} emi={calor} />
      {/* aletas de ventilação entre as duas faces */}
      {Array.from({length: 16}, (_, i) => (
        <mesh key={i} rotation={[(i * Math.PI * 2) / 16, 0, 0]} position={[0, 0, 0]}>
          <boxGeometry args={[0.1, 2.0, 0.05]} />
          <meshStandardMaterial color="#6b737c" metalness={0.8} />
        </mesh>
      ))}
      {/* furos */}
      {Array.from({length: 10}, (_, i) => (
        <mesh key={`h${i}`} position={[0.17, Math.sin((i * Math.PI * 2) / 10) * 0.8, Math.cos((i * Math.PI * 2) / 10) * 0.8]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.05, 0.05, 0.02, 8]} />
          <meshStandardMaterial color="#222" />
        </mesh>
      ))}
      <Cil r={0.4} l={0.4} cor="#5d6670" metal={0.7} />
    </group>
    {/* pinça (abraça a borda do disco por cima) */}
    <group position={[0, 0.95, 0]}>
      <B tam={[0.8, 0.5, 0.7]} pos={[0, 0.15, 0]} cor="#e10600" metal={0.4} rug={0.3} />
      {/* pastilhas: aproximam do disco com o aperto */}
      <B tam={[0.08, 0.4, 0.55]} pos={[0.24 - aperto * 0.07, -0.05, 0]} cor="#3a3a3a" />
      <B tam={[0.08, 0.4, 0.55]} pos={[-0.24 + aperto * 0.07, -0.05, 0]} cor="#3a3a3a" />
    </group>
  </group>
);

// Seta azul de física
export const Seta = ({posicao, rot = 0, escala = 1, cor = '#3fa9f5'}: {posicao: V3; rot?: number; escala?: number; cor?: string}) => (
  <group position={posicao} rotation={[0, 0, rot]} scale={escala}>
    <mesh position={[0, 0.35, 0]}>
      <coneGeometry args={[0.22, 0.38, 4]} />
      <meshStandardMaterial color={cor} emissive={cor} emissiveIntensity={0.8} />
    </mesh>
    <mesh>
      <boxGeometry args={[0.1, 0.5, 0.1]} />
      <meshStandardMaterial color={cor} emissive={cor} emissiveIntensity={0.8} />
    </mesh>
  </group>
);

export const Motorista = ({expressao = 'feliz', pose = 'parado', alvoMaoE, alvoMaoD}: {expressao?: 'feliz' | 'assustado' | 'cansado' | 'serio'; pose?: 'parado' | 'susto' | 'comemorar' | 'apontar' | 'acenar'; alvoMaoE?: V3; alvoMaoD?: V3}) => (
  <Bloquinho escala={0.62} rotacaoY={Math.PI / 2} pele="#e8b48a" camisa="#ffcc00" calca="#1f5fa8" chapeu="cabelo" corChapeu="#2a1d14" expressao={expressao} pose={pose} alvoMaoE={alvoMaoE} alvoMaoD={alvoMaoD} />
);
