import {useMemo} from 'react';
import {useCurrentFrame} from 'remotion';
import {Bloquinho, type Expressao, type Pose} from '../submarino/Bloquinho';
import {aleatorio} from '../tempo';

type V3 = [number, number, number];

const B = ({tam, pos = [0, 0, 0], rot = [0, 0, 0], cor, emi = 0, metal = 0.1}: {tam: V3; pos?: V3; rot?: V3; cor: string; emi?: number; metal?: number}) => (
  <mesh position={pos} rotation={rot} castShadow receiveShadow>
    <boxGeometry args={tam} />
    <meshStandardMaterial color={cor} roughness={0.6} metalness={metal} emissive={emi ? cor : '#000'} emissiveIntensity={emi} />
  </mesh>
);

// ---------- Personagens (representações estilizadas, sem imitar aparência real) ----------
type P = {posicao?: V3; rotacaoY?: number; pose?: Pose; expressao?: Expressao; escala?: number; fase?: number; falando?: boolean};

export const Felca = (p: P) => <Bloquinho {...p} pele="#e8b48a" camisa="#22252b" calca="#2f3542" chapeu="cabelo" corChapeu="#2a1d14" />;
export const Hytalo = (p: P) => <Bloquinho {...p} pele="#c98b5e" camisa="#e8e8e8" calca="#1f2a44" chapeu="cabelo" corChapeu="#141414" />;
export const Israel = (p: P) => <Bloquinho {...p} pele="#d9a27a" camisa="#3b3f46" calca="#22252b" chapeu="cabelo" corChapeu="#3a2a1a" />;
export const Policial = (p: P) => (
  <Bloquinho {...p} pele="#d9a27a" camisa="#2b2f3a" calca="#2b2f3a" colete="#1b1e25" chapeu="coco" corChapeu="#1b1e25" expressao="serio" />
);
export const Seguranca = (p: P) => (
  <Bloquinho {...p} pele="#b07a52" camisa="#111111" calca="#111111" chapeu="cabelo" corChapeu="#111111" gravata="#111111" expressao="serio" />
);
export const Juiz = (p: P) => <Bloquinho {...p} pele="#e0b896" camisa="#111111" calca="#111111" chapeu="cabelo" corChapeu="#7a7a7a" capa="#111111" />;
export const Promotor = (p: P) => (
  <Bloquinho {...p} pele="#d9a27a" camisa="#1c2a4a" calca="#1c2a4a" chapeu="cabelo" corChapeu="#2a1a10" gravata="#7a1f1f" expressao="serio" />
);
export const Deputado = (p: P) => (
  <Bloquinho {...p} pele={p.fase && p.fase % 2 ? '#c98b5e' : '#e8b48a'} camisa="#2a2f3a" calca="#2a2f3a" chapeu="cabelo" corChapeu={p.fase && p.fase % 3 ? '#555' : '#2a1a10'} gravata={['#1f5fa8', '#7a1f1f', '#2e7d32'][(p.fase ?? 0) % 3]} />
);

// ---------- Estúdio de youtuber ----------
export const Estudio = () => {
  const frame = useCurrentFrame();
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#2a2a30" />
      </mesh>
      <B tam={[12, 6, 0.2]} pos={[0, 3, -2]} cor="#1e2230" />
      {/* Prateleira com luz de LED */}
      <B tam={[3, 0.08, 0.4]} pos={[-2.5, 2.8, -1.8]} cor="#3a3f52" />
      <B tam={[3, 0.04, 0.04]} pos={[-2.5, 2.74, -1.6]} cor="#b46cff" emi={2.5} />
      <B tam={[0.04, 3, 0.04]} pos={[3.5, 2.5, -1.85]} cor="#4cc9f0" emi={2.5} />
      {[-3.2, -2.6, -1.9].map((x, i) => (
        <B key={x} tam={[0.3, 0.4 + i * 0.1, 0.3]} pos={[x, 3.05 + i * 0.05, -1.8]} cor={['#e63946', '#ffcc00', '#4cc9f0'][i]} />
      ))}
      {/* Mesa, monitor, microfone */}
      <B tam={[3.2, 0.12, 1.4]} pos={[0, 1.05, 0.9]} cor="#3a2a1e" />
      <B tam={[0.1, 1, 0.1]} pos={[-1.4, 0.5, 0.4]} cor="#222" />
      <B tam={[0.1, 1, 0.1]} pos={[1.4, 0.5, 0.4]} cor="#222" />
      <B tam={[1.2, 0.75, 0.06]} pos={[1.75, 1.55, 0.9]} rot={[0, Math.PI - 0.7, 0]} cor="#111" />
      <B tam={[1.1, 0.65, 0.02]} pos={[1.72, 1.55, 0.87]} rot={[0, Math.PI - 0.7, 0]} cor="#e10600" emi={0.6 + Math.sin(frame * 0.1) * 0.1} />
      <B tam={[0.06, 0.5, 0.06]} pos={[-0.5, 1.35, 0.7]} cor="#222" />
      <mesh position={[-0.5, 1.7, 0.7]} castShadow>
        <capsuleGeometry args={[0.1, 0.18, 4, 8]} />
        <meshStandardMaterial color="#333" metalness={0.6} />
      </mesh>
      {/* Ring light */}
      <mesh position={[1.8, 2.2, 2.4]} rotation={[0, -0.6, 0]}>
        <torusGeometry args={[0.45, 0.06, 8, 32]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={2} />
      </mesh>
      <pointLight position={[1.6, 2.2, 2.2]} intensity={14} color="#fff6e6" distance={8} />
      <pointLight position={[-1.2, 2.6, 3]} intensity={12} color="#cfd8ff" distance={9} />
    </group>
  );
};

// Celular/feed com conteúdo borrado (nenhuma pessoa real é mostrada)
export const Feed = ({posicao = [0, 0, 0] as V3, rotY = 0, rolagem = 0, borrado = true}) => {
  const cards = useMemo(() => {
    const r = aleatorio(19);
    return Array.from({length: 10}, () => ({cor: ['#ff6b9a', '#ffb347', '#c77dff', '#4cc9f0', '#ff4d6d'][Math.floor(r() * 5)]}));
  }, []);
  return (
    <group position={posicao} rotation={[0, rotY, 0]}>
      <B tam={[1.3, 2.5, 0.1]} cor="#111" />
      <group position={[0, 0, 0.06]}>
        {cards.map((c, i) => {
          const y = 0.85 - i * 0.62 + (rolagem % 6.2);
          if (y < -1.1 || y > 1.1) return null;
          return (
            <group key={i} position={[0, y, 0]}>
              <B tam={[1.1, 0.52, 0.02]} cor={borrado ? '#8a8a96' : c.cor} />
              {borrado && <B tam={[0.95, 0.4, 0.025]} pos={[0, 0, 0.003]} cor="#5c5c66" />}
            </group>
          );
        })}
      </group>
    </group>
  );
};

// Viatura policial
export const Viatura = ({posicao = [0, 0, 0] as V3, rotY = 0}) => {
  const frame = useCurrentFrame();
  const pisca = Math.floor(frame / 6) % 2 === 0;
  return (
    <group position={posicao} rotation={[0, rotY, 0]}>
      <B tam={[3, 0.7, 1.4]} pos={[0, 0.55, 0]} cor="#f2f2f2" />
      <B tam={[1.6, 0.55, 1.3]} pos={[-0.2, 1.15, 0]} cor="#1d2433" metal={0.5} />
      <B tam={[3.02, 0.2, 1.42]} pos={[0, 0.55, 0]} cor="#1f3b8a" />
      {[
        [1, 0.62],
        [-1, 0.62],
        [1, -0.62],
        [-1, -0.62],
      ].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.25, z]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.25, 0.25, 0.2, 12]} />
          <meshStandardMaterial color="#111" />
        </mesh>
      ))}
      <B tam={[0.35, 0.15, 0.35]} pos={[-0.2, 1.5, 0.3]} cor="#ff2a2a" emi={pisca ? 4 : 0.3} />
      <B tam={[0.35, 0.15, 0.35]} pos={[-0.2, 1.5, -0.3]} cor="#2a6bff" emi={pisca ? 0.3 : 4} />
      <pointLight position={[-0.2, 1.8, 0]} color={pisca ? '#ff2a2a' : '#2a6bff'} intensity={18} distance={9} />
    </group>
  );
};

// Casa (prisão em São Paulo)
export const Casa = ({posicao = [0, 0, 0] as V3}) => (
  <group position={posicao}>
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[40, 40]} />
      <meshStandardMaterial color="#2a2d33" />
    </mesh>
    <B tam={[7, 3.2, 4]} pos={[0, 1.6, -3]} cor="#d9d4c7" />
    <B tam={[7.6, 0.3, 4.6]} pos={[0, 3.35, -3]} cor="#5a5f68" />
    <B tam={[1.3, 2.2, 0.1]} pos={[0, 1.1, -0.95]} cor="#3a2a1a" />
    {[-2.4, 2.4].map((x) => (
      <B key={x} tam={[1.2, 1, 0.05]} pos={[x, 1.9, -0.97]} cor="#ffd27a" emi={1} />
    ))}
    <B tam={[16, 1.6, 0.3]} pos={[0, 0.8, 2]} cor="#9a9488" />
    <B tam={[3, 1.6, 0.32]} pos={[0, 0.8, 2]} cor="#3a3f46" />
  </group>
);

// Congresso Nacional (estilizado): duas torres e as duas cúpulas
export const Congresso = () => (
  <group>
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[80, 80]} />
      <meshStandardMaterial color="#7fb069" />
    </mesh>
    <B tam={[16, 0.8, 6]} pos={[0, 0.4, 0]} cor="#e8e4da" />
    <B tam={[1.4, 9, 2.4]} pos={[-0.85, 5, -1]} cor="#e2ddd0" />
    <B tam={[1.4, 9, 2.4]} pos={[0.85, 5, -1]} cor="#e2ddd0" />
    <B tam={[3.1, 0.5, 2.4]} pos={[0, 8, -1]} cor="#e2ddd0" />
    {/* cúpula para cima (Senado) */}
    <mesh position={[-4.5, 0.8, 0.5]}>
      <sphereGeometry args={[1.7, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
      <meshStandardMaterial color="#f2efe6" />
    </mesh>
    {/* cúpula para baixo (Câmara) */}
    <mesh position={[4.5, 2.2, 0.5]} rotation={[Math.PI, 0, 0]}>
      <sphereGeometry args={[2.4, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
      <meshStandardMaterial color="#f2efe6" />
    </mesh>
    <mesh position={[0, 0.02, 9]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[18, 6]} />
      <meshStandardMaterial color="#4a90c2" metalness={0.3} roughness={0.2} />
    </mesh>
  </group>
);

// Prédio institucional genérico (MP-PB, TJPB)
export const Predio = ({cor = '#d8d2c4', faixa = '#1f3b8a', colunas = true}) => (
  <group>
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[60, 60]} />
      <meshStandardMaterial color="#8a8a80" />
    </mesh>
    <B tam={[12, 6, 4]} pos={[0, 3, -3]} cor={cor} />
    <B tam={[12.4, 0.5, 4.4]} pos={[0, 6.2, -3]} cor={faixa} />
    {colunas &&
      [-4.5, -2.7, -0.9, 0.9, 2.7, 4.5].map((x) => <B key={x} tam={[0.5, 5, 0.5]} pos={[x, 2.5, -0.7]} cor="#f2efe6" />)}
    <B tam={[12.6, 0.4, 2.6]} pos={[0, 0.2, 0]} cor="#bdb6a6" />
    <B tam={[1.6, 2.6, 0.1]} pos={[0, 1.3, -0.95]} cor="#2a2a2a" />
    {/* mastros com bandeiras */}
    {[-7.5, 7.5].map((x, i) => (
      <group key={x} position={[x, 0, 1]}>
        <B tam={[0.1, 6, 0.1]} pos={[0, 3, 0]} cor="#cfcfcf" metal={0.7} />
        <B tam={[1.4, 0.9, 0.03]} pos={[0.75, 5.4, 0]} cor={i ? '#009c3b' : '#ffffff'} />
        {i === 1 && (
          <mesh position={[0.75, 5.4, 0.02]} rotation={[0, 0, Math.PI / 4]}>
            <boxGeometry args={[0.5, 0.5, 0.02]} />
            <meshStandardMaterial color="#ffdf00" />
          </mesh>
        )}
      </group>
    ))}
  </group>
);

// Mapa simples do Brasil com rota São Paulo -> João Pessoa
export const MapaBrasil = ({progresso = 0}) => {
  const frame = useCurrentFrame();
  const pulso = 1 + Math.sin(frame * 0.2) * 0.15;
  const sp: V3 = [-0.5, 0.35, 2.6];
  const jp: V3 = [3.2, 0.35, -1.6];
  const blocos: [number, number, number, number][] = [
    [0, -1, 6, 3],
    [-1, 1.5, 5, 3],
    [1.5, -2.5, 3, 2],
    [-0.5, 3.5, 2.5, 2],
    [2.6, -1.4, 1.4, 1.4],
  ];
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial color="#0e3a5a" />
      </mesh>
      {blocos.map(([x, z, w, d], i) => (
        <B key={i} tam={[w, 0.3, d]} pos={[x, 0.15, z]} cor="#3f8f4a" />
      ))}
      <mesh position={sp} scale={pulso}>
        <cylinderGeometry args={[0.22, 0.22, 0.1, 16]} />
        <meshStandardMaterial color="#ff3b30" emissive="#ff3b30" emissiveIntensity={2} />
      </mesh>
      <mesh position={jp} scale={pulso}>
        <cylinderGeometry args={[0.22, 0.22, 0.1, 16]} />
        <meshStandardMaterial color="#ffd23f" emissive="#ffd23f" emissiveIntensity={2} />
      </mesh>
      {Array.from({length: 20}, (_, i) => {
        const t = i / 19;
        if (t > progresso) return null;
        return (
          <mesh key={i} position={[sp[0] + (jp[0] - sp[0]) * t, 0.5 + Math.sin(t * Math.PI) * 1.2, sp[2] + (jp[2] - sp[2]) * t]} scale={0.1}>
            <boxGeometry args={[1, 1, 1]} />
            <meshBasicMaterial color="#ffd23f" />
          </mesh>
        );
      })}
    </group>
  );
};
