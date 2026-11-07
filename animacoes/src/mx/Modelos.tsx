import {useMemo} from 'react';
import {useCurrentFrame} from 'remotion';
import {Bloquinho, type Expressao, type Pose} from '../submarino/Bloquinho';
import {aleatorio} from '../tempo';

type V3 = [number, number, number];

const B = ({tam, pos = [0, 0, 0], rot = [0, 0, 0], cor, emi = 0, metal = 0.1, op = 1}: {tam: V3; pos?: V3; rot?: V3; cor: string; emi?: number; metal?: number; op?: number}) => (
  <mesh position={pos} rotation={rot} castShadow receiveShadow>
    <boxGeometry args={tam} />
    <meshStandardMaterial color={cor} roughness={0.6} metalness={metal} emissive={emi ? cor : '#000'} emissiveIntensity={emi} transparent={op < 1} opacity={op} />
  </mesh>
);

type P = {posicao?: V3; rotacaoY?: number; pose?: Pose; expressao?: Expressao; escala?: number; fase?: number; falando?: boolean};

// ---------- Personagens (estilizados, sem imitar aparência real) ----------
export const JuezMx = (p: P) => <Bloquinho {...p} pele="#c98b5e" camisa="#1d2433" calca="#1d2433" chapeu="cabelo" corChapeu="#1b1b1b" gravata="#6b1f2a" />;
export const JuezToga = (p: P) => <Bloquinho {...p} pele="#c98b5e" camisa="#111" calca="#111" chapeu="cabelo" corChapeu="#1b1b1b" capa="#111" />;
export const Canadiense = (p: P) => <Bloquinho {...p} pele="#f0c8a0" camisa="#7a7f87" calca="#2b2f36" chapeu="cabelo" corChapeu="#8a5a2b" />;
export const Snowboarder = (p: P) => <Bloquinho {...p} pele="#f0c8a0" camisa="#d72638" calca="#1f2a44" capacete="#f2f2f2" />;
export const PoliciaCol = (p: P) => <Bloquinho {...p} pele="#c98b5e" camisa="#3d5a2a" calca="#2f3826" colete="#c9a227" chapeu="coco" corChapeu="#2f3826" expressao="serio" />;
export const AgenteFbi = (p: P) => <Bloquinho {...p} pele="#e0b08a" camisa="#1a1a1a" calca="#1a1a1a" colete="#1f3b8a" chapeu="cabelo" corChapeu="#3a2a1a" expressao="serio" />;
export const Funcionaria = (p: P) => <Bloquinho {...p} pele="#d9a27a" camisa="#c2185b" calca="#1d1d2b" chapeu="cabelo" corChapeu="#2a1a10" />;
export const Auditor = (p: P) => <Bloquinho {...p} pele="#e0b896" camisa="#2a3a5a" calca="#2a3a5a" chapeu="cabelo" corChapeu="#555" gravata="#c9a227" expressao="serio" />;
export const Legislador = (p: P) => (
  <Bloquinho {...p} pele={(p.fase ?? 0) % 2 ? '#c98b5e' : '#e0b08a'} camisa="#2a2f3a" calca="#2a2f3a" chapeu="cabelo" corChapeu={(p.fase ?? 0) % 3 ? '#444' : '#1b1b1b'} gravata={['#8a1f2a', '#1f5fa8', '#2e7d32', '#c2185b'][(p.fase ?? 0) % 4]} />
);

// ---------- Aeroporto ----------
export const Avion = ({posicao = [0, 0, 0] as V3, rotY = 0, escala = 1, cor = '#f2f2f2', faixa = '#1f3b8a'}) => (
  <group position={posicao} rotation={[0, rotY, 0]} scale={escala}>
    <B tam={[8, 1.1, 1.1]} cor={cor} />
    <mesh position={[4.3, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
      <coneGeometry args={[0.55, 1, 12]} />
      <meshStandardMaterial color={cor} />
    </mesh>
    <B tam={[8.02, 0.18, 1.12]} pos={[0, -0.1, 0]} cor={faixa} />
    <B tam={[1.8, 0.12, 7]} pos={[0, -0.25, 0]} cor="#d8d8d8" />
    <B tam={[1, 1.6, 0.12]} pos={[-3.6, 1.2, 0]} cor={faixa} />
    <B tam={[0.9, 0.1, 2.6]} pos={[-3.6, 0.3, 0]} cor="#d8d8d8" />
    {[-2, 2].map((z) => (
      <mesh key={z} position={[0.3, -0.6, z]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.35, 0.35, 1.2, 12]} />
        <meshStandardMaterial color="#9aa0a8" metalness={0.6} />
      </mesh>
    ))}
    {Array.from({length: 12}, (_, i) => (
      <B key={i} tam={[0.18, 0.2, 0.02]} pos={[-2.6 + i * 0.45, 0.2, 0.56]} cor="#1a2433" />
    ))}
  </group>
);

export const Terminal = () => (
  <group>
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[80, 80]} />
      <meshStandardMaterial color="#3a3d44" />
    </mesh>
    {/* Pista com faixas */}
    {Array.from({length: 10}, (_, i) => (
      <B key={i} tam={[1.6, 0.02, 0.2]} pos={[-14 + i * 3.2, 0.01, 5]} cor="#f2f2f2" />
    ))}
    {/* Prédio do terminal com vidros */}
    <B tam={[24, 5, 5]} pos={[0, 2.5, -8]} cor="#bfc6ce" />
    <B tam={[23.6, 3, 0.1]} pos={[0, 2.6, -5.45]} cor="#7fb3d5" emi={0.15} metal={0.6} />
    <B tam={[25, 0.5, 6]} pos={[0, 5.2, -8]} cor="#8a939c" />
    {/* Torre de controle */}
    <B tam={[1.4, 10, 1.4]} pos={[10, 5, -12]} cor="#cfd5db" />
    <B tam={[3, 1.6, 3]} pos={[10, 10.6, -12]} cor="#5d7a90" emi={0.2} />
    {/* Placa do aeroporto */}
    <B tam={[7, 1.1, 0.2]} pos={[-5, 6.2, -5.3]} cor="#1f3b8a" />
  </group>
);

// ---------- Dinheiro ----------
export const Fajos = ({posicao = [0, 0, 0] as V3, qtd = 20, escala = 1, mostrar = 1}) => {
  const itens = useMemo(() => {
    const r = aleatorio(9);
    return Array.from({length: qtd}, (_, i) => ({x: (i % 5) * 0.62 - 1.24, z: Math.floor(i / 5) % 2 * 0.36, y: Math.floor(i / 10) * 0.22, rot: (r() - 0.5) * 0.15}));
  }, [qtd]);
  return (
    <group position={posicao} scale={escala}>
      {itens.map((it, i) =>
        i / qtd < mostrar ? (
          <group key={i} position={[it.x, it.y + 0.1, it.z]} rotation={[0, it.rot, 0]}>
            <B tam={[0.58, 0.2, 0.32]} cor="#6fa85a" />
            <B tam={[0.12, 0.205, 0.325]} cor="#f2f2f2" />
          </group>
        ) : null,
      )}
    </group>
  );
};

export const Maleta = ({posicao = [0, 0, 0] as V3, aberta = 0}) => (
  <group position={posicao}>
    <B tam={[1.6, 0.25, 1]} pos={[0, 0.12, 0]} cor="#1a1a1a" metal={0.4} />
    <group position={[0, 0.25, -0.5]} rotation={[-aberta * 1.6, 0, 0]}>
      <B tam={[1.6, 0.2, 1]} pos={[0, 0.1, 0.5]} cor="#1a1a1a" metal={0.4} />
    </group>
    <Fajos posicao={[0.08, 0.15, -0.18]} qtd={10} escala={0.48} />
  </group>
);

// ---------- Reclusorio (prisão) ----------
export const Reclusorio = () => (
  <group>
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[60, 60]} />
      <meshStandardMaterial color="#6f6a5e" />
    </mesh>
    <B tam={[16, 4.5, 6]} pos={[0, 2.25, -5]} cor="#b8b0a0" />
    {Array.from({length: 8}, (_, i) => (
      <group key={i} position={[-6.3 + i * 1.8, 2.6, -1.98]}>
        <B tam={[0.9, 1, 0.05]} cor="#2a2a2a" />
        {[-0.3, 0, 0.3].map((x) => (
          <B key={x} tam={[0.06, 1, 0.08]} pos={[x, 0, 0.03]} cor="#888" metal={0.7} />
        ))}
      </group>
    ))}
    {/* Muro e torres */}
    <B tam={[22, 3, 0.5]} pos={[0, 1.5, 2.5]} cor="#9a9384" />
    {[-11, 11].map((x) => (
      <group key={x} position={[x, 0, 2.5]}>
        <B tam={[1.4, 6, 1.4]} pos={[0, 3, 0]} cor="#8a8374" />
        <B tam={[2, 0.8, 2]} pos={[0, 6.4, 0]} cor="#5a564c" />
      </group>
    ))}
    <B tam={[3, 2.6, 0.55]} pos={[0, 1.3, 2.5]} cor="#3a3f46" metal={0.5} />
  </group>
);

// ---------- Montanha com neve (snowboard) ----------
export const Montana = () => (
  <group>
    <mesh rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[80, 80]} />
      <meshStandardMaterial color="#e8f2fa" />
    </mesh>
    <mesh position={[0, 6, -18]} rotation={[0, Math.PI / 4, 0]}>
      <coneGeometry args={[12, 16, 4]} />
      <meshStandardMaterial color="#d7e6f2" flatShading />
    </mesh>
    <mesh position={[-14, 4, -20]} rotation={[0, Math.PI / 4, 0]}>
      <coneGeometry args={[9, 12, 4]} />
      <meshStandardMaterial color="#c9dbea" flatShading />
    </mesh>
    {[-8, -5, 6, 9, 12].map((x, i) => (
      <group key={x} position={[x, 0, -4 - i]}>
        <mesh position={[0, 1.2, 0]}>
          <coneGeometry args={[0.9, 2.4, 5]} />
          <meshStandardMaterial color="#2f6b3e" flatShading />
        </mesh>
      </group>
    ))}
  </group>
);

export const Tabla = ({posicao = [0, 0, 0] as V3, rotY = 0}) => <B tam={[1.7, 0.08, 0.45]} pos={posicao} rot={[0, rotY, 0]} cor="#ffcc00" />;

// ---------- Celular com "espião" (Pegasus) ----------
export const CelularEspia = ({posicao = [0, 0, 0] as V3}) => {
  const frame = useCurrentFrame();
  return (
    <group position={posicao}>
      <B tam={[1.3, 2.5, 0.12]} cor="#111" />
      <B tam={[1.15, 2.3, 0.02]} pos={[0, 0, 0.07]} cor="#0f2a1a" emi={0.4} />
      {Array.from({length: 8}, (_, i) => (
        <B key={i} tam={[0.9 - (i % 3) * 0.2, 0.08, 0.02]} pos={[-0.05, 0.9 - i * 0.24, 0.085]} cor="#3ddc84" emi={(frame + i * 5) % 40 < 20 ? 1.5 : 0.5} />
      ))}
    </group>
  );
};

// ---------- INE: prédio, cédulas, urna ----------
export const EdificioINE = () => (
  <group>
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[60, 60]} />
      <meshStandardMaterial color="#9a958c" />
    </mesh>
    <B tam={[14, 7, 5]} pos={[0, 3.5, -4]} cor="#e6e2da" />
    {Array.from({length: 6}, (_, r) =>
      Array.from({length: 9}, (_, c) => <B key={`${r}${c}`} tam={[1.1, 0.7, 0.05]} pos={[-5.6 + c * 1.4, 1.2 + r * 1, -1.47]} cor="#5d7a90" emi={0.1} metal={0.5} />),
    )}
    {/* faixa magenta (cor institucional) e letreiro */}
    <B tam={[14.2, 0.6, 5.2]} pos={[0, 7.2, -4]} cor="#c2185b" />
    <B tam={[4.5, 1.2, 0.2]} pos={[0, 8.3, -1.6]} cor="#c2185b" />
    <B tam={[3.5, 0.6, 0.22]} pos={[0, 8.3, -1.5]} cor="#ffffff" emi={0.3} />
    {[-7.5, 7.5].map((x) => (
      <group key={x} position={[x, 0, 1]}>
        <B tam={[0.1, 6, 0.1]} pos={[0, 3, 0]} cor="#cfcfcf" metal={0.7} />
        <B tam={[0.46, 0.9, 0.03]} pos={[0.28, 5.4, 0]} cor="#006847" />
        <B tam={[0.46, 0.9, 0.03]} pos={[0.74, 5.4, 0]} cor="#f2f2f2" />
        <B tam={[0.46, 0.9, 0.03]} pos={[1.2, 5.4, 0]} cor="#ce1126" />
      </group>
    ))}
  </group>
);

export const Urna = ({posicao = [0, 0, 0] as V3, escala = 1}) => {
  const frame = useCurrentFrame();
  const cai = (frame % 40) / 40;
  return (
    <group position={posicao} scale={escala}>
      <B tam={[1.4, 1.4, 1.4]} pos={[0, 0.7, 0]} cor="#f2f2f2" op={0.85} />
      <B tam={[1.42, 0.3, 1.42]} pos={[0, 1.25, 0]} cor="#c2185b" />
      <B tam={[0.6, 0.05, 0.08]} pos={[0, 1.41, 0]} cor="#222" />
      <B tam={[0.5, 0.02, 0.35]} pos={[0, 2.4 - cai * 1, 0]} rot={[Math.PI / 2, 0, 0]} cor="#fff6d6" />
    </group>
  );
};

// Cartão bancário que congela (gelo aparece)
export const TarjetaCongelada = ({posicao = [0, 0, 0] as V3, gelo = 0, rotY = 0}) => (
  <group position={posicao} rotation={[0, rotY, 0]}>
    <B tam={[1.7, 1.08, 0.06]} cor="#1f3b8a" metal={0.4} />
    <B tam={[0.32, 0.24, 0.02]} pos={[-0.5, 0.15, 0.04]} cor="#c9a227" metal={0.8} />
    <B tam={[1.2, 0.08, 0.02]} pos={[0, -0.3, 0.04]} cor="#cfd8ff" />
    {gelo > 0 && (
      <mesh scale={[0.95 * gelo + 0.05, 0.62 * gelo + 0.05, 0.25]}>
        <icosahedronGeometry args={[1, 1]} />
        <meshStandardMaterial color="#bfe9ff" transparent opacity={0.55} roughness={0.05} metalness={0.1} flatShading />
      </mesh>
    )}
  </group>
);

// Cadeado gigante
export const Candado = ({posicao = [0, 0, 0] as V3, fechado = 1}) => (
  <group position={posicao}>
    <B tam={[1.6, 1.3, 0.6]} cor="#c9a227" metal={0.8} />
    <mesh position={[0, 0.65 + (1 - fechado) * 0.4, 0]}>
      <torusGeometry args={[0.5, 0.12, 8, 24, Math.PI]} />
      <meshStandardMaterial color="#b0b0b0" metalness={0.9} roughness={0.2} />
    </mesh>
    <B tam={[0.2, 0.4, 0.62]} pos={[0, -0.1, 0]} cor="#3a2a1a" />
  </group>
);

// Cámara de Diputados (San Lázaro) estilizada
export const SanLazaro = () => (
  <group>
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[80, 80]} />
      <meshStandardMaterial color="#8c8a80" />
    </mesh>
    <B tam={[18, 4, 6]} pos={[0, 2, -5]} cor="#d8cdb8" />
    <B tam={[6, 5.5, 6.4]} pos={[0, 2.75, -5]} cor="#c7b89c" />
    {Array.from({length: 7}, (_, i) => <B key={i} tam={[0.6, 4.5, 0.6]} pos={[-2.4 + i * 0.8, 2.25, -1.6]} cor="#efe6d2" />)}
    <B tam={[6.6, 0.6, 1]} pos={[0, 4.8, -1.6]} cor="#a89a7c" />
    <B tam={[0.1, 7, 0.1]} pos={[0, 3.5, 2]} cor="#cfcfcf" metal={0.7} />
    <B tam={[0.7, 1.3, 0.03]} pos={[0.4, 6.3, 2]} cor="#006847" />
    <B tam={[0.7, 1.3, 0.03]} pos={[1.1, 6.3, 2]} cor="#f2f2f2" />
    <B tam={[0.7, 1.3, 0.03]} pos={[1.8, 6.3, 2]} cor="#ce1126" />
  </group>
);

// Mapa: México, Colombia e EUA
export const MapaAmericas = ({rota = 0, alvo = 'colombia' as 'colombia' | 'eua'}) => {
  const frame = useCurrentFrame();
  const pulso = 1 + Math.sin(frame * 0.2) * 0.15;
  const cdmx: V3 = [-1.5, 0.35, 0.5];
  const bogota: V3 = [2.2, 0.35, 4.6];
  const eua: V3 = [0.5, 0.35, -4.5];
  const destino = alvo === 'colombia' ? bogota : eua;
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial color="#0e3a5a" />
      </mesh>
      <B tam={[9, 0.3, 4.5]} pos={[0, 0.15, -5]} cor="#4a7a3a" />
      <B tam={[4.5, 0.32, 2.6]} pos={[-1.6, 0.16, 0.3]} cor="#2e8b57" emi={0.1} />
      <B tam={[1.4, 0.3, 2]} pos={[0.6, 0.15, 2.3]} cor="#4a7a3a" />
      <B tam={[3.2, 0.32, 2.6]} pos={[2.4, 0.16, 4.8]} cor="#d4a017" emi={0.1} />
      {[cdmx, destino].map((p, i) => (
        <mesh key={i} position={p} scale={pulso}>
          <cylinderGeometry args={[0.22, 0.22, 0.1, 16]} />
          <meshStandardMaterial color={i ? '#ff3b30' : '#ffd23f'} emissive={i ? '#ff3b30' : '#ffd23f'} emissiveIntensity={2} />
        </mesh>
      ))}
      {Array.from({length: 20}, (_, i) => {
        const t = i / 19;
        if (t > rota) return null;
        return (
          <mesh key={i} position={[cdmx[0] + (destino[0] - cdmx[0]) * t, 0.5 + Math.sin(t * Math.PI) * 1.2, cdmx[2] + (destino[2] - cdmx[2]) * t]} scale={0.1}>
            <boxGeometry args={[1, 1, 1]} />
            <meshBasicMaterial color="#ffd23f" />
          </mesh>
        );
      })}
    </group>
  );
};
