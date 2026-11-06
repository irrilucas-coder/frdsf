import {useMemo} from 'react';
import {DoubleSide} from 'three';
import {useCurrentFrame} from 'remotion';
import {aleatorio} from '../tempo';

type V3 = [number, number, number];

// Superfície da água vista de cima
export const AguaCima = ({cor = '#2b7bb9', y = 0, tam = 200}) => {
  const frame = useCurrentFrame();
  return (
    <group>
      <mesh position={[0, y, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[tam, tam]} />
        <meshStandardMaterial color={cor} roughness={0.55} metalness={0.05} transparent opacity={0.92} />
      </mesh>
      {/* Ondinhas em bloco que sobem e descem */}
      <Ondinhas y={y} frame={frame} />
    </group>
  );
};

const Ondinhas = ({y, frame}: {y: number; frame: number}) => {
  const itens = useMemo(() => {
    const r = aleatorio(11);
    return Array.from({length: 70}, () => ({x: (r() - 0.5) * 50, z: (r() - 0.5) * 40 - 5, f: r() * 6}));
  }, []);
  return (
    <>
      {itens.map((o, i) => (
        <mesh key={i} position={[o.x, y + 0.02 + Math.sin(frame * 0.08 + o.f) * 0.03, o.z]}>
          <boxGeometry args={[0.9, 0.04, 0.12]} />
          <meshStandardMaterial color="#cfefff" transparent opacity={0.45} />
        </mesh>
      ))}
    </>
  );
};

// Superfície da água vista de baixo (quando a câmera está submersa)
export const AguaBaixo = ({y = 0, cor = '#9fe3ff'}) => (
  <mesh position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
    <planeGeometry args={[300, 300]} />
    <meshBasicMaterial color={cor} transparent opacity={0.55} side={DoubleSide} />
  </mesh>
);

// Fundo do mar/rio
export const Fundo = ({y = -8, cor = '#3b4a3a'}) => {
  const pedras = useMemo(() => {
    const r = aleatorio(5);
    return Array.from({length: 40}, () => ({x: (r() - 0.5) * 40, z: (r() - 0.5) * 30 - 4, s: 0.3 + r() * 0.9}));
  }, []);
  return (
    <group>
      <mesh position={[0, y, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial color={cor} roughness={1} />
      </mesh>
      {pedras.map((p, i) => (
        <mesh key={i} position={[p.x, y + p.s * 0.3, p.z]} scale={p.s}>
          <dodecahedronGeometry args={[0.6, 0]} />
          <meshStandardMaterial color="#56604f" flatShading />
        </mesh>
      ))}
    </group>
  );
};

// Bolhas subindo
export const Bolhas = ({origem = [0, -3, 0] as V3, qtd = 30, espalha = 2, altura = 6, semente = 1}) => {
  const frame = useCurrentFrame();
  const bs = useMemo(() => {
    const r = aleatorio(semente + 100);
    return Array.from({length: qtd}, () => ({
      x: (r() - 0.5) * espalha,
      z: (r() - 0.5) * espalha,
      v: 0.6 + r() * 0.8,
      f: r() * 100,
      s: 0.04 + r() * 0.09,
    }));
  }, [qtd, espalha, semente]);
  return (
    <group position={origem}>
      {bs.map((b, i) => {
        const tt = ((frame * 0.012 * b.v + b.f / 100) % 1) * altura;
        return (
          <mesh key={i} position={[b.x + Math.sin(frame * 0.1 + b.f) * 0.1, tt, b.z]} scale={b.s}>
            <sphereGeometry args={[1, 8, 8]} />
            <meshStandardMaterial color="#e6fbff" transparent opacity={0.55} emissive="#bdf3ff" emissiveIntensity={0.3} />
          </mesh>
        );
      })}
    </group>
  );
};

// Raios de luz atravessando a água
export const RaiosDeLuz = ({y = 0}) => {
  const frame = useCurrentFrame();
  return (
    <group>
      {[-6, -2.5, 1, 4.5, 8].map((x, i) => (
        <mesh key={x} position={[x, y - 5, -4 - i]} rotation={[0, 0, 0.25 + Math.sin(frame * 0.02 + i) * 0.04]}>
          <boxGeometry args={[0.9, 12, 0.05]} />
          <meshBasicMaterial color="#d9f7ff" transparent opacity={0.07 + Math.sin(frame * 0.05 + i) * 0.03} />
        </mesh>
      ))}
    </group>
  );
};

// Casinhas de bloquinhos (Londres antiga)
export const CasasLondres = ({z = -9, y = 0.6}) => {
  const casas = useMemo(() => {
    const r = aleatorio(21);
    return Array.from({length: 16}, (_, i) => ({
      x: -16 + i * 2.1 + r() * 0.4,
      h: 1.6 + r() * 1.8,
      w: 1.6 + r() * 0.5,
      cor: ['#e9d8b4', '#d4b48c', '#c98f6b', '#efe3c8', '#b9a07a'][Math.floor(r() * 5)],
      telhado: ['#7a3b2a', '#5a3a2a', '#40414a'][Math.floor(r() * 3)],
    }));
  }, []);
  return (
    <group position={[0, y, z]}>
      {/* Margem */}
      <mesh position={[0, -0.3, 1.2]} receiveShadow>
        <boxGeometry args={[60, 1.2, 3.5]} />
        <meshStandardMaterial color="#6a8a4a" />
      </mesh>
      {casas.map((c, i) => (
        <group key={i} position={[c.x, c.h / 2, 0]}>
          <mesh castShadow>
            <boxGeometry args={[c.w, c.h, 1.6]} />
            <meshStandardMaterial color={c.cor} />
          </mesh>
          <mesh position={[0, c.h / 2 + 0.35, 0]} rotation={[0, 0, Math.PI / 4]} castShadow>
            <boxGeometry args={[c.w * 0.72, c.w * 0.72, 1.65]} />
            <meshStandardMaterial color={c.telhado} />
          </mesh>
          {[-0.35, 0.35].map((wx) => (
            <mesh key={wx} position={[wx * c.w * 0.6, 0.1, 0.81]}>
              <boxGeometry args={[0.3, 0.4, 0.02]} />
              <meshStandardMaterial color="#3b5d7a" />
            </mesh>
          ))}
        </group>
      ))}
      {/* Torre de igreja */}
      <mesh position={[6, 3.5, -1]} castShadow>
        <boxGeometry args={[1.4, 7, 1.4]} />
        <meshStandardMaterial color="#cbbf9f" />
      </mesh>
      <mesh position={[6, 7.8, -1]} castShadow>
        <coneGeometry args={[1, 2, 4]} />
        <meshStandardMaterial color="#40414a" />
      </mesh>
    </group>
  );
};

// Árvores de bloquinhos
export const ArvoreBloco = ({posicao = [0, 0, 0] as V3, escala = 1}) => (
  <group position={posicao} scale={escala}>
    <mesh position={[0, 0.6, 0]} castShadow>
      <boxGeometry args={[0.35, 1.2, 0.35]} />
      <meshStandardMaterial color="#7a4a26" />
    </mesh>
    <mesh position={[0, 1.6, 0]} castShadow>
      <boxGeometry args={[1.3, 1.1, 1.3]} />
      <meshStandardMaterial color="#3e9a4a" />
    </mesh>
    <mesh position={[0, 2.3, 0]} castShadow>
      <boxGeometry args={[0.8, 0.6, 0.8]} />
      <meshStandardMaterial color="#4cb35a" />
    </mesh>
  </group>
);

// Céu noturno: lua e estrelas
export const Noite = () => {
  const frame = useCurrentFrame();
  const est = useMemo(() => {
    const r = aleatorio(8);
    return Array.from({length: 120}, () => ({
      p: [(r() - 0.5) * 120, 8 + r() * 40, -40 - r() * 20] as V3,
      s: 0.06 + r() * 0.14,
      f: r() * 10,
    }));
  }, []);
  return (
    <group>
      <mesh position={[14, 22, -45]}>
        <boxGeometry args={[4, 4, 0.5]} />
        <meshBasicMaterial color="#fff6d6" />
      </mesh>
      
      {est.map((e, i) => (
        <mesh key={i} position={e.p} scale={e.s * (0.8 + Math.sin(frame * 0.1 + e.f) * 0.2)}>
          <boxGeometry args={[1, 1, 1]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      ))}
    </group>
  );
};

// Píer de madeira com guindaste (estaleiro de 1900)
export const Pier = ({posicao = [0, 0, 0] as V3}) => (
  <group position={posicao}>
    <mesh position={[0, 0.5, 0]} receiveShadow castShadow>
      <boxGeometry args={[14, 0.3, 3]} />
      <meshStandardMaterial color="#8a6a45" />
    </mesh>
    {[-6, -3, 0, 3, 6].map((x) => (
      <mesh key={x} position={[x, -0.6, 1.3]} castShadow>
        <boxGeometry args={[0.3, 2.2, 0.3]} />
        <meshStandardMaterial color="#5a4128" />
      </mesh>
    ))}
    {/* Galpão */}
    <mesh position={[-3, 2.2, -0.6]} castShadow>
      <boxGeometry args={[5, 3.2, 1.8]} />
      <meshStandardMaterial color="#a33b2b" />
    </mesh>
    <mesh position={[-3, 4.1, -0.6]} castShadow>
      <boxGeometry args={[5.3, 0.6, 2.1]} />
      <meshStandardMaterial color="#3b3b44" />
    </mesh>
    {/* Guindaste */}
    <mesh position={[4, 3.5, -0.5]} castShadow>
      <boxGeometry args={[0.4, 6, 0.4]} />
      <meshStandardMaterial color="#e0a526" />
    </mesh>
    <mesh position={[2.6, 6.3, -0.5]} castShadow>
      <boxGeometry args={[3.6, 0.35, 0.35]} />
      <meshStandardMaterial color="#e0a526" />
    </mesh>
    <mesh position={[1.1, 5.2, -0.5]}>
      <boxGeometry args={[0.05, 2.2, 0.05]} />
      <meshStandardMaterial color="#333" />
    </mesh>
    {/* Bandeirinhas de festa */}
    {Array.from({length: 9}, (_, i) => (
      <mesh key={i} position={[-6.5 + i * 1.4, 4.9 - Math.sin((i / 8) * Math.PI) * 0.4, 1.2]} rotation={[0, 0, Math.PI]}>
        <coneGeometry args={[0.22, 0.4, 3]} />
        <meshStandardMaterial color={['#e63946', '#f1faee', '#457b9d'][i % 3]} />
      </mesh>
    ))}
  </group>
);

// Placas de gelo do Polo Norte (vistas de baixo e de cima)
export const Gelo = ({y = 0}) => {
  const placas = useMemo(() => {
    const r = aleatorio(31);
    const out: {x: number; z: number; w: number; d: number; h: number}[] = [];
    for (let i = -6; i <= 6; i++) {
      for (let j = -5; j <= 2; j++) {
        out.push({x: i * 4 + (r() - 0.5), z: j * 4 + (r() - 0.5), w: 3.6 + r() * 0.5, d: 3.6 + r() * 0.5, h: 0.8 + r() * 1.2});
      }
    }
    return out;
  }, []);
  return (
    <group position={[0, y, 0]}>
      {placas.map((p, i) => (
        <mesh key={i} position={[p.x, p.h / 2, p.z]} castShadow receiveShadow>
          <boxGeometry args={[p.w, p.h, p.d]} />
          <meshStandardMaterial color={i % 3 ? '#e8f6ff' : '#cfeaf7'} roughness={0.4} />
        </mesh>
      ))}
    </group>
  );
};
