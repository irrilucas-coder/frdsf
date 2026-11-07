import {useMemo} from 'react';
import {useCurrentFrame} from 'remotion';
import {Bloquinho, type Pose, type Expressao} from '../submarino/Bloquinho';
import {aleatorio} from '../tempo';

type V3 = [number, number, number];

const B = ({tam, pos = [0, 0, 0], rot = [0, 0, 0], cor, emi = 0, metal = 0.2}: {tam: V3; pos?: V3; rot?: V3; cor: string; emi?: number; metal?: number}) => (
  <mesh position={pos} rotation={rot} castShadow receiveShadow>
    <boxGeometry args={tam} />
    <meshStandardMaterial color={cor} roughness={0.6} metalness={metal} emissive={emi ? cor : '#000'} emissiveIntensity={emi} />
  </mesh>
);

// ---------- Personagens (representações estilizadas) ----------
type P = {posicao?: V3; rotacaoY?: number; pose?: Pose; expressao?: Expressao; escala?: number; fase?: number; falando?: boolean};

export const Maduro = (p: P) => (
  <Bloquinho
    {...p}
    pele="#c98b5e"
    camisa="#1d2b4a"
    calca="#1d2b4a"
    chapeu="cabelo"
    corChapeu="#1b1b1b"
    bigode
    faixa={['#f4c300', '#0033a0', '#cf142b']}
  />
);
export const MaduroPreso = (p: P) => (
  <Bloquinho {...p} pele="#c98b5e" camisa="#3a3f47" calca="#2b2f36" chapeu="cabelo" corChapeu="#1b1b1b" bigode />
);
export const Cilia = (p: P) => (
  <Bloquinho {...p} pele="#d9a27a" camisa="#7a1f3d" calca="#2b2b3a" chapeu="cabelo" corChapeu="#e8d7b0" />
);
export const Trump = (p: P) => (
  <Bloquinho {...p} pele="#f0b98a" camisa="#1c2a4a" calca="#1c2a4a" chapeu="cabelo" corChapeu="#f2c94c" gravata="#c8102e" />
);
export const Delcy = (p: P) => (
  <Bloquinho {...p} pele="#d9a27a" camisa="#d72638" calca="#1d1d2b" chapeu="cabelo" corChapeu="#2a1a10" faixa={['#f4c300', '#0033a0', '#cf142b']} />
);
export const Juiz = (p: P) => (
  <Bloquinho {...p} pele="#f2d0b0" camisa="#111111" calca="#111111" chapeu="cabelo" corChapeu="#d9d9d9" capa="#111111" />
);
export const Soldado = (p: P) => (
  <Bloquinho {...p} pele="#c99a72" camisa="#4b5a3a" calca="#3e4a30" colete="#2f3826" capacete="#3e4a30" expressao="serio" />
);
export const Agente = (p: P) => (
  <Bloquinho {...p} pele="#e0b08a" camisa="#1a1a1a" calca="#1a1a1a" chapeu="cabelo" corChapeu="#3a2a1a" gravata="#1a1a1a" expressao="serio" />
);

// ---------- Veículos ----------
export const Caca = ({posicao = [0, 0, 0] as V3, rotY = 0, escala = 1}) => (
  <group position={posicao} rotation={[0, rotY, 0]} scale={escala}>
    <B tam={[3, 0.35, 0.45]} cor="#6b7684" />
    <mesh position={[1.75, 0, 0]} rotation={[0, 0, -Math.PI / 2]} castShadow>
      <coneGeometry args={[0.22, 0.6, 6]} />
      <meshStandardMaterial color="#6b7684" />
    </mesh>
    <B tam={[1.1, 0.08, 2.6]} pos={[-0.2, 0, 0]} cor="#5c6673" />
    <B tam={[0.6, 0.06, 1.2]} pos={[-1.3, 0, 0]} cor="#5c6673" />
    <B tam={[0.5, 0.6, 0.06]} pos={[-1.3, 0.3, 0.15]} rot={[0.3, 0, 0]} cor="#5c6673" />
    <B tam={[0.5, 0.6, 0.06]} pos={[-1.3, 0.3, -0.15]} rot={[-0.3, 0, 0]} cor="#5c6673" />
    <B tam={[0.7, 0.2, 0.3]} pos={[0.8, 0.25, 0]} cor="#1e2f45" metal={0.7} />
    <mesh position={[-1.6, 0, 0]}>
      <sphereGeometry args={[0.16, 8, 8]} />
      <meshStandardMaterial color="#ffb347" emissive="#ff7b00" emissiveIntensity={4} />
    </mesh>
  </group>
);

export const Helicoptero = ({posicao = [0, 0, 0] as V3, rotY = 0, escala = 1, inclina = 0}) => {
  const frame = useCurrentFrame();
  return (
    <group position={posicao} rotation={[0, rotY, inclina]} scale={escala}>
      <B tam={[2.2, 0.9, 0.9]} cor="#2b3328" />
      <B tam={[0.7, 0.55, 0.85]} pos={[1.35, -0.1, 0]} cor="#2b3328" />
      <B tam={[0.5, 0.4, 0.82]} pos={[1.45, 0.05, 0]} cor="#1a2433" metal={0.7} />
      <B tam={[2.2, 0.22, 0.22]} pos={[-2, 0.15, 0]} cor="#2b3328" />
      <B tam={[0.1, 0.7, 0.5]} pos={[-3.05, 0.4, 0]} cor="#2b3328" />
      <B tam={[2, 0.06, 0.06]} pos={[0.2, -0.65, 0.4]} cor="#1a1a1a" />
      <B tam={[2, 0.06, 0.06]} pos={[0.2, -0.65, -0.4]} cor="#1a1a1a" />
      <group position={[0.1, 0.62, 0]} rotation={[0, frame * 1.3, 0]}>
        <B tam={[4.2, 0.04, 0.22]} cor="#151515" />
        <B tam={[0.22, 0.04, 4.2]} cor="#151515" />
      </group>
      <group position={[-3.05, 0.45, 0.28]} rotation={[0, 0, frame * 1.6]}>
        <B tam={[0.06, 0.9, 0.04]} cor="#151515" />
      </group>
      <mesh position={[-1, -0.5, 0]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshStandardMaterial color="#ff2a2a" emissive="#ff2a2a" emissiveIntensity={frame % 30 < 15 ? 4 : 0.2} />
      </mesh>
    </group>
  );
};

export const PortaAvioes = ({posicao = [0, 0, 0] as V3, rotY = 0, escala = 1}) => (
  <group position={posicao} rotation={[0, rotY, 0]} scale={escala}>
    <B tam={[16, 1.6, 3.4]} pos={[0, 0, 0]} cor="#5d6670" />
    <B tam={[17, 0.2, 4.6]} pos={[0.5, 0.9, 0]} cor="#3f454c" />
    <B tam={[16.5, 0.03, 0.08]} pos={[0.5, 1.01, 0]} cor="#e8e8e8" emi={0.2} />
    <B tam={[1.6, 2, 1]} pos={[2.5, 2, 1.6]} cor="#6b737c" />
    <B tam={[0.2, 1.3, 0.2]} pos={[2.5, 3.6, 1.6]} cor="#444" />
    <B tam={[0.9, 0.4, 0.05]} pos={[2.5, 2.2, 2.12]} cor="#e8e8e8" emi={0.1} />
    {[-5, -2.5, 5.5].map((x, i) => (
      <group key={i} position={[x, 1.25, -0.8 + i * 0.6]} rotation={[0, Math.PI, 0]}>
        <Caca escala={0.45} />
      </group>
    ))}
  </group>
);

export const NavioAnfibio = ({posicao = [0, 0, 0] as V3, rotY = 0, escala = 1}) => (
  <group position={posicao} rotation={[0, rotY, 0]} scale={escala}>
    <B tam={[12, 1.8, 2.8]} cor="#59626b" />
    <B tam={[12.4, 0.2, 3.4]} pos={[0.2, 1, 0]} cor="#3c4148" />
    <B tam={[1.4, 1.8, 0.9]} pos={[1, 2, 1.2]} cor="#69717a" />
    <B tam={[1.2, 0.35, 0.05]} pos={[-3.5, 0.3, 1.42]} cor="#e8e8e8" emi={0.15} />
    {/* H de heliponto */}
    <B tam={[0.9, 0.02, 0.12]} pos={[-3, 1.11, 0]} cor="#f2f2f2" emi={0.3} />
    <B tam={[0.12, 0.02, 0.8]} pos={[-3.4, 1.11, 0]} cor="#f2f2f2" emi={0.3} />
    <B tam={[0.12, 0.02, 0.8]} pos={[-2.6, 1.11, 0]} cor="#f2f2f2" emi={0.3} />
  </group>
);

export const Lancha = ({posicao = [0, 0, 0] as V3, rotY = 0}) => (
  <group position={posicao} rotation={[0, rotY, 0]}>
    <B tam={[1.8, 0.35, 0.7]} cor="#e8e8e8" />
    <mesh position={[1.05, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
      <coneGeometry args={[0.36, 0.5, 4]} />
      <meshStandardMaterial color="#e8e8e8" />
    </mesh>
    <B tam={[0.4, 0.3, 0.5]} pos={[-0.2, 0.3, 0]} cor="#2a6fb0" />
    <B tam={[0.25, 0.4, 0.25]} pos={[-1, 0.1, 0]} cor="#222" />
  </group>
);

// ---------- Cidade de Caracas à noite ----------
export const Caracas = ({z = -6, luzes = 1}) => {
  const predios = useMemo(() => {
    const r = aleatorio(77);
    return Array.from({length: 44}, (_, i) => ({
      x: -22 + (i % 22) * 2.05 + r() * 0.4,
      zz: Math.floor(i / 22) * -3.5 + r() * 0.6,
      h: 1.5 + r() * (i % 22 > 8 && i % 22 < 14 ? 7 : 4),
      w: 1.4 + r() * 0.5,
      cor: ['#3b4252', '#434c5e', '#4c566a', '#2e3440'][Math.floor(r() * 4)],
      janelas: Array.from({length: 8}, () => r()),
    }));
  }, []);
  return (
    <group position={[0, 0, z]}>
      {/* Montanha El Ávila ao fundo */}
      <mesh position={[0, 3, -14]} rotation={[0, 0, Math.PI / 4]}>
        <boxGeometry args={[16, 16, 2]} />
        <meshStandardMaterial color="#1c2a2a" />
      </mesh>
      <mesh position={[14, 1.5, -13]} rotation={[0, 0, Math.PI / 4]}>
        <boxGeometry args={[11, 11, 2]} />
        <meshStandardMaterial color="#1a2626" />
      </mesh>
      {predios.map((p, i) => (
        <group key={i} position={[p.x, p.h / 2, p.zz]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[p.w, p.h, 1.6]} />
            <meshStandardMaterial color={p.cor} />
          </mesh>
          {p.janelas.map((j, k) =>
            j * luzes > 0.45 && (k * 0.8 + 0.6) < p.h ? (
              <mesh key={k} position={[((k % 2) - 0.5) * p.w * 0.5, -p.h / 2 + 0.6 + Math.floor(k / 2) * 0.8 * (p.h / 4), 0.81]}>
                <boxGeometry args={[0.28, 0.22, 0.02]} />
                <meshStandardMaterial color="#ffd27a" emissive="#ffb347" emissiveIntensity={1.4} />
              </mesh>
            ) : null,
          )}
        </group>
      ))}
      <mesh position={[0, -0.01, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[80, 40]} />
        <meshStandardMaterial color="#20242c" />
      </mesh>
    </group>
  );
};

// Complexo militar (onde Maduro estava, representado de forma genérica)
export const Complexo = ({posicao = [0, 0, 0] as V3}) => (
  <group position={posicao}>
    <mesh position={[0, -0.01, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[40, 40]} />
      <meshStandardMaterial color="#2c3326" />
    </mesh>
    <B tam={[7, 2.6, 4]} pos={[0, 1.3, -3]} cor="#b8ab92" />
    <B tam={[7.4, 0.3, 4.4]} pos={[0, 2.75, -3]} cor="#7a5a3a" />
    <B tam={[1.2, 1.8, 0.1]} pos={[0, 0.9, -0.95]} cor="#3a2a1a" />
    {[-2.5, 2.5].map((x) => (
      <B key={x} tam={[0.9, 0.7, 0.05]} pos={[x, 1.6, -0.97]} cor="#ffd27a" emi={1.2} />
    ))}
    {/* Muro */}
    <B tam={[18, 1.2, 0.4]} pos={[0, 0.6, 4]} cor="#8c826e" />
    <B tam={[0.4, 1.2, 12]} pos={[-9, 0.6, -2]} cor="#8c826e" />
    <B tam={[0.4, 1.2, 12]} pos={[9, 0.6, -2]} cor="#8c826e" />
    {/* Heliponto */}
    <B tam={[3, 0.04, 3]} pos={[4.5, 0.02, 1.5]} cor="#3a3a3a" />
    <B tam={[0.2, 0.05, 1.6]} pos={[4, 0.05, 1.5]} cor="#f2f2f2" />
    <B tam={[0.2, 0.05, 1.6]} pos={[5, 0.05, 1.5]} cor="#f2f2f2" />
    <B tam={[1, 0.05, 0.2]} pos={[4.5, 0.05, 1.5]} cor="#f2f2f2" />
  </group>
);

// Tribunal
export const Tribunal = ({bandeira = 'eua' as 'eua' | 'brasil'}) => (
  <group>
    <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[30, 30]} />
      <meshStandardMaterial color="#5a3a24" />
    </mesh>
    <B tam={[20, 8, 0.3]} pos={[0, 4, -5]} cor="#d8cdb8" />
    {[-6, -2, 2, 6].map((x) => (
      <B key={x} tam={[0.5, 8, 0.5]} pos={[x, 4, -4.7]} cor="#efe6d2" />
    ))}
    {/* Bancada do juiz */}
    <B tam={[5, 1.8, 1.4]} pos={[0, 0.9, -3]} cor="#6b4428" />
    <B tam={[5.2, 0.15, 1.6]} pos={[0, 1.85, -3]} cor="#4a2e1a" />
    {/* Brasão */}
    <mesh position={[0, 4.6, -4.8]}>
      <cylinderGeometry args={[0.9, 0.9, 0.1, 24]} />
      <meshStandardMaterial color="#c9a227" metalness={0.8} roughness={0.3} />
    </mesh>
    {/* Bandeira estilizada */}
    <group position={[-4, 3.2, -4.6]}>
      <B tam={[0.08, 4, 0.08]} pos={[0, -1.2, 0]} cor="#c9a227" metal={0.8} />
      {bandeira === 'eua' ? (
        <>
          {Array.from({length: 7}, (_, i) => (
            <B key={i} tam={[1.6, 0.16, 0.03]} pos={[0.85, 0.5 - i * 0.16, 0]} cor={i % 2 ? '#f2f2f2' : '#b22234'} />
          ))}
          <B tam={[0.65, 0.48, 0.04]} pos={[0.37, 0.34, 0.01]} cor="#3c3b6e" />
        </>
      ) : (
        <>
          <B tam={[1.6, 1.1, 0.03]} pos={[0.85, 0.05, 0]} cor="#009c3b" />
          <mesh position={[0.85, 0.05, 0.02]} rotation={[0, 0, Math.PI / 4]}>
            <boxGeometry args={[0.62, 0.62, 0.02]} />
            <meshStandardMaterial color="#ffdf00" />
          </mesh>
          <mesh position={[0.85, 0.05, 0.04]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.24, 0.24, 0.02, 20]} />
            <meshStandardMaterial color="#002776" />
          </mesh>
        </>
      )}
    </group>
    {/* Mesa da defesa */}
    <B tam={[3, 0.9, 1.2]} pos={[0, 0.45, 1.2]} cor="#7a5232" />
  </group>
);

// Mapa estilizado: Venezuela, Caribe e EUA em blocos
export const Mapa = ({destaque = 'venezuela' as 'venezuela' | 'rota', progresso = 0}) => {
  const frame = useCurrentFrame();
  const pulso = 1 + Math.sin(frame * 0.2) * 0.15;
  const caracas: V3 = [0.5, 0.3, 3.2];
  const ny: V3 = [2.5, 0.3, -6.5];
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial color="#0e3a5a" />
      </mesh>
      {/* América do Sul (norte) */}
      <B tam={[8, 0.3, 4]} pos={[0, 0.15, 5.5]} cor="#4a7a3a" />
      <B tam={[3.6, 0.32, 2.2]} pos={[0.6, 0.16, 3.6]} cor={destaque === 'venezuela' ? '#d4a017' : '#5a8a46'} emi={destaque === 'venezuela' ? 0.15 : 0} />
      {/* América Central e EUA */}
      <B tam={[1.5, 0.3, 3]} pos={[-4.5, 0.15, 0.8]} cor="#4a7a3a" />
      <B tam={[9, 0.3, 6]} pos={[-1, 0.15, -6]} cor="#4a7a3a" />
      <B tam={[1.2, 0.3, 2]} pos={[2.6, 0.15, -2.6]} cor="#4a7a3a" />
      {/* Ilhas do Caribe */}
      {[
        [0, 0],
        [1.5, 0.4],
        [3, 0.9],
        [-1.4, -0.3],
      ].map(([x, z], i) => (
        <B key={i} tam={[1, 0.25, 0.4]} pos={[x, 0.12, z]} cor="#4a7a3a" />
      ))}
      {/* Marcador em Caracas */}
      <mesh position={caracas} scale={pulso}>
        <cylinderGeometry args={[0.25, 0.25, 0.1, 16]} />
        <meshStandardMaterial color="#ff3b30" emissive="#ff3b30" emissiveIntensity={2} />
      </mesh>
      {destaque === 'rota' &&
        Array.from({length: 24}, (_, i) => {
          const t = i / 23;
          if (t > progresso) return null;
          const p: V3 = [caracas[0] + (ny[0] - caracas[0]) * t, 0.5 + Math.sin(t * Math.PI) * 1.5, caracas[2] + (ny[2] - caracas[2]) * t];
          return (
            <mesh key={i} position={p} scale={0.12}>
              <boxGeometry args={[1, 1, 1]} />
              <meshBasicMaterial color="#ffd23f" />
            </mesh>
          );
        })}
      {destaque === 'rota' && (
        <mesh position={ny} scale={pulso}>
          <cylinderGeometry args={[0.25, 0.25, 0.1, 16]} />
          <meshStandardMaterial color="#4cc9f0" emissive="#4cc9f0" emissiveIntensity={2} />
        </mesh>
      )}
    </group>
  );
};
