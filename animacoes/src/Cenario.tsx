import {useMemo} from 'react';
import {Easing, useCurrentFrame} from 'remotion';
import {aleatorio, mix, prog} from './tempo';

// Onde a estrela cai e a árvore nasce
export const PONTO_ARVORE: [number, number, number] = [0.8, 0, 0.35];

// ---------- Ilha flutuante ----------
export const Ilha = ({
  raio = 2.4,
  posicao = [0, 0, 0] as [number, number, number],
  balanco = 0,
  flutua = true,
}: {
  raio?: number;
  posicao?: [number, number, number];
  balanco?: number;
  flutua?: boolean;
}) => {
  const frame = useCurrentFrame();
  const sobeDesce = flutua ? Math.sin(frame * 0.04 + balanco) * 0.06 * raio : 0;
  return (
    <group position={[posicao[0], posicao[1] + sobeDesce, posicao[2]]}>
      {/* Grama */}
      <mesh position={[0, -0.15 * raio * 0.4, 0]} receiveShadow>
        <cylinderGeometry args={[raio, raio * 0.96, 0.3 * raio * 0.4, 48]} />
        <meshStandardMaterial color="#5cc46a" roughness={0.9} />
      </mesh>
      {/* Terra */}
      <mesh position={[0, -0.32 * raio * 0.4, 0]}>
        <cylinderGeometry args={[raio * 0.97, raio * 0.92, 0.12 * raio * 0.4, 48]} />
        <meshStandardMaterial color="#8a5a3b" roughness={1} />
      </mesh>
      {/* Pedra de baixo (cone de cabeça para baixo) */}
      <mesh position={[0, -raio * 0.7, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[raio * 0.92, raio * 1.1, 9, 1]} />
        <meshStandardMaterial color="#6b5a7a" roughness={1} flatShading />
      </mesh>
    </group>
  );
};

// ---------- Florzinhas e pedras na ilha principal ----------
export const Detalhes = () => {
  const itens = useMemo(() => {
    const r = aleatorio(7);
    return Array.from({length: 14}, () => {
      const ang = r() * Math.PI * 2;
      const dist = 1.2 + r() * 0.95;
      return {
        x: Math.cos(ang) * dist,
        z: Math.sin(ang) * dist,
        cor: ['#ff9fd1', '#fff4a3', '#ffffff', '#b9a6ff'][Math.floor(r() * 4)],
        pedra: r() > 0.7,
      };
    });
  }, []);
  return (
    <group>
      {itens.map((it, i) =>
        it.pedra ? (
          <mesh key={i} position={[it.x, 0.06, it.z]} scale={[1, 0.6, 0.8]} castShadow>
            <dodecahedronGeometry args={[0.13, 0]} />
            <meshStandardMaterial color="#a69bb3" flatShading />
          </mesh>
        ) : (
          <group key={i} position={[it.x, 0, it.z]}>
            <mesh position={[0, 0.08, 0]}>
              <cylinderGeometry args={[0.012, 0.012, 0.16, 6]} />
              <meshStandardMaterial color="#2f8a3e" />
            </mesh>
            <mesh position={[0, 0.17, 0]}>
              <sphereGeometry args={[0.045, 12, 12]} />
              <meshStandardMaterial color={it.cor} emissive={it.cor} emissiveIntensity={0.25} />
            </mesh>
          </group>
        ),
      )}
    </group>
  );
};

// ---------- Estrela que cai do céu ----------
const posicaoEstrela = (frame: number): [number, number, number] => {
  const t = prog(frame, 130, 185, Easing.in(Easing.quad));
  const ini: [number, number, number] = [6, 9, -4];
  const fim: [number, number, number] = [PONTO_ARVORE[0], 0.22, PONTO_ARVORE[2]];
  return [mix(ini[0], fim[0], t), mix(ini[1], fim[1], t), mix(ini[2], fim[2], t)];
};

export const EstrelaCadente = () => {
  const frame = useCurrentFrame();
  if (frame < 125 || frame > 290) return null;

  const pos = posicaoEstrela(frame);
  // Depois de cair, quica um pouquinho e fica girando devagar
  const quique = frame > 185 && frame < 200 ? Math.sin(((frame - 185) / 15) * Math.PI) * 0.25 : 0;
  // Bip empurra a estrela para dentro da terra
  const enterra = prog(frame, 255, 280);
  const y = pos[1] + quique - enterra * 0.3;
  const escala = 1 - enterra * 0.85;
  const brilho = 3 + Math.sin(frame * 0.4) * 0.8;

  const rastro = Array.from({length: 10}, (_, i) => {
    const f = frame - (i + 1) * 1.6;
    if (frame > 186 || f < 130) return null;
    return {p: posicaoEstrela(f), k: 1 - i / 10};
  }).filter(Boolean) as {p: [number, number, number]; k: number}[];

  return (
    <group>
      <group position={[pos[0], y, pos[2]]} rotation={[frame * 0.05, frame * 0.08, 0]} scale={escala}>
        <mesh>
          <octahedronGeometry args={[0.2, 0]} />
          <meshStandardMaterial color="#fff3b0" emissive="#ffd23f" emissiveIntensity={brilho} />
        </mesh>
        <mesh rotation={[0, Math.PI / 4, Math.PI / 4]}>
          <octahedronGeometry args={[0.17, 0]} />
          <meshStandardMaterial color="#fff3b0" emissive="#ffd23f" emissiveIntensity={brilho} />
        </mesh>
        <pointLight color="#ffd23f" intensity={6 * escala} distance={5} />
      </group>
      {rastro.map(({p, k}, i) => (
        <mesh key={i} position={p} scale={k}>
          <sphereGeometry args={[0.12, 12, 12]} />
          <meshBasicMaterial color="#ffe58a" transparent opacity={k * 0.7} />
        </mesh>
      ))}
    </group>
  );
};

// Clarão quando a estrela bate no chão
export const Clarao = () => {
  const frame = useCurrentFrame();
  const t = prog(frame, 185, 215, Easing.out(Easing.cubic));
  if (frame < 185 || frame > 215) return null;
  return (
    <group position={[PONTO_ARVORE[0], 0.05, PONTO_ARVORE[2]]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} scale={0.2 + t * 2.2}>
        <ringGeometry args={[0.8, 1, 48]} />
        <meshBasicMaterial color="#fff0a0" transparent opacity={1 - t} />
      </mesh>
      <pointLight color="#ffe08a" intensity={(1 - t) * 25} distance={8} position={[0, 0.5, 0]} />
    </group>
  );
};

// ---------- Árvore que nasce da estrela ----------
const FRUTAS: [number, number, number][] = [
  [0.55, 0.15, 0.55],
  [-0.6, 0.05, 0.45],
  [0.1, 0.62, 0.55],
  [0.7, -0.25, -0.1],
  [-0.45, 0.45, -0.35],
  [-0.15, -0.3, 0.7],
  [0.35, 0.5, -0.5],
];

export const Arvore = ({
  inicio,
  posicao = PONTO_ARVORE,
  tamanho = 1,
  inicioFrutas,
}: {
  inicio: number;
  posicao?: [number, number, number];
  tamanho?: number;
  inicioFrutas: number;
}) => {
  const frame = useCurrentFrame();
  const tronco = prog(frame, inicio, inicio + 60, Easing.out(Easing.cubic));
  const copa = prog(frame, inicio + 40, inicio + 85, Easing.out(Easing.back(1.8)));
  if (tronco <= 0) return null;
  const alturaTronco = 1.5;
  const balanca = Math.sin(frame * 0.05) * 0.03;

  return (
    <group position={posicao} scale={tamanho} rotation={[0, 0, balanca]}>
      {/* Tronco cresce de baixo para cima */}
      <mesh position={[0, (alturaTronco * tronco) / 2, 0]} scale={[1, Math.max(tronco, 0.001), 1]} castShadow>
        <cylinderGeometry args={[0.09, 0.15, alturaTronco, 10]} />
        <meshStandardMaterial color="#8a5a3b" roughness={1} />
      </mesh>
      {/* Copa: três bolas de folhas */}
      <group position={[0, alturaTronco + 0.25, 0]} scale={Math.max(copa, 0.001)}>
        <mesh castShadow>
          <icosahedronGeometry args={[0.8, 1]} />
          <meshStandardMaterial color="#3fae5a" flatShading roughness={0.8} />
        </mesh>
        <mesh position={[0.55, -0.15, 0.1]}>
          <icosahedronGeometry args={[0.5, 1]} />
          <meshStandardMaterial color="#4cc06a" flatShading roughness={0.8} />
        </mesh>
        <mesh position={[-0.5, -0.1, -0.05]}>
          <icosahedronGeometry args={[0.55, 1]} />
          <meshStandardMaterial color="#38a050" flatShading roughness={0.8} />
        </mesh>
        {/* Frutas-estrela que brilham */}
        {FRUTAS.map((p, i) => {
          const s = prog(frame, inicioFrutas + i * 5, inicioFrutas + i * 5 + 15, Easing.out(Easing.back(3)));
          if (s <= 0) return null;
          return (
            <mesh key={i} position={p} scale={s}>
              <octahedronGeometry args={[0.11, 0]} />
              <meshStandardMaterial color="#fff3b0" emissive="#ffc93c" emissiveIntensity={2.5} />
            </mesh>
          );
        })}
        {prog(frame, inicioFrutas, inicioFrutas + 30) > 0 && (
          <pointLight
            color="#ffd76a"
            intensity={prog(frame, inicioFrutas, inicioFrutas + 30) * 8}
            distance={6}
            position={[0, 0, 1]}
          />
        )}
      </group>
    </group>
  );
};

// ---------- Brilhinhos que sobem quando a árvore nasce ----------
export const Brilhos = () => {
  const frame = useCurrentFrame();
  const parts = useMemo(() => {
    const r = aleatorio(42);
    return Array.from({length: 24}, () => ({
      ang: r() * Math.PI * 2,
      raio: 0.2 + r() * 1.2,
      atraso: r() * 60,
      vel: 0.6 + r() * 0.8,
    }));
  }, []);
  const inicio = 280;
  if (frame < inicio) return null;
  return (
    <group position={[PONTO_ARVORE[0], 0, PONTO_ARVORE[2]]}>
      {parts.map((p, i) => {
        const t = (frame - inicio - p.atraso) / 70;
        if (t < 0 || t > 1) return null;
        const y = t * 3 * p.vel;
        const ang = p.ang + t * 2;
        return (
          <mesh key={i} position={[Math.cos(ang) * p.raio, y, Math.sin(ang) * p.raio]} scale={1 - t}>
            <sphereGeometry args={[0.035, 8, 8]} />
            <meshBasicMaterial color="#fff2a8" transparent opacity={1 - t} />
          </mesh>
        );
      })}
    </group>
  );
};

// ---------- Estrelas do céu (somem quando amanhece) ----------
export const CeuEstrelado = () => {
  const frame = useCurrentFrame();
  const estrelas = useMemo(() => {
    const r = aleatorio(3);
    return Array.from({length: 160}, () => {
      const ang = r() * Math.PI * 2;
      const alt = r() * 1.2 - 0.2;
      const d = 40;
      return {
        p: [Math.cos(ang) * d * Math.cos(alt), Math.sin(alt) * d + 6, Math.sin(ang) * d * Math.cos(alt) - 10] as [
          number,
          number,
          number,
        ],
        s: 0.05 + r() * 0.12,
        fase: r() * 10,
      };
    });
  }, []);
  const amanhecer = prog(frame, 380, 500);
  return (
    <group>
      {estrelas.map((e, i) => (
        <mesh key={i} position={e.p} scale={e.s * (0.7 + Math.sin(frame * 0.1 + e.fase) * 0.3)}>
          <sphereGeometry args={[1, 6, 6]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={1 - amanhecer * 0.85} />
        </mesh>
      ))}
    </group>
  );
};
