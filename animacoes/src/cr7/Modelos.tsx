import {useMemo} from 'react';
import {Color, InstancedMesh, Object3D} from 'three';
import {useCurrentFrame} from 'remotion';
import {Bloquinho} from '../submarino/Bloquinho';
import {B} from '../freio/Modelos';

type V3 = [number, number, number];
type BP = React.ComponentProps<typeof Bloquinho>;

// ---------- Personagens ----------
const POR = {camisa: '#c8102e', manga: '#c8102e', calca: '#0b6b3a', meia: '#c8102e', sapato: '#f2f2f2', corNumero: '#ffd23f'};
// Cristiano: corpo atlético, rosto oval, topete escuro
export const Cristiano = (p: BP & {kit?: 'portugal' | 'clube' | 'treino'}) => {
  const kit =
    p.kit === 'clube'
      ? {camisa: '#ffd400', manga: '#ffd400', calca: '#1b3fa0', meia: '#ffd400', sapato: '#1b3fa0', corNumero: '#1b3fa0'}
      : p.kit === 'treino'
        ? {camisa: '#1d1d24', manga: '#1d1d24', calca: '#1d1d24', meia: undefined, sapato: '#f2f2f2', corNumero: '#c8102e'}
        : POR;
  return <Bloquinho corpo="forte" cabeca="oval" cabelo="topete" corCabelo="#16110d" pele="#d6a07a" olhos="grandes" numero="7" {...kit} {...p} />;
};
// Cristiano garoto (2003): mais magro, cabelo com franja
export const CristianoJovem = (p: BP) => (
  <Bloquinho corpo="magro" cabeca="oval" cabelo="lateral" corCabelo="#5a3a1f" pele="#d6a07a" olhos="grandes" numero="17" escala={0.94} {...POR} {...p} />
);
// Técnico: cabelo comprido grisalho, agasalho escuro
export const Tecnico = (p: BP) => (
  <Bloquinho corpo="padrao" cabeca="larga" cabelo="comprido" corCabelo="#d8d2c4" pele="#e8b48a" camisa="#14213d" manga="#14213d" calca="#14213d" sapato="#111" olhos="grandes" {...p} />
);

// ---------- Bola ----------
export const Bola = ({pos, giro = 0, r = 0.17}: {pos: V3; giro?: number; r?: number}) => (
  <group position={pos} rotation={[giro, giro * 0.6, 0]}>
    <mesh castShadow>
      <icosahedronGeometry args={[r, 1]} />
      <meshStandardMaterial color="#f5f5f5" flatShading roughness={0.5} />
    </mesh>
    {[[0, 1, 0], [0.9, -0.3, 0.3], [-0.6, -0.4, 0.7], [-0.3, 0.2, -0.95], [0.5, 0.3, -0.8]].map((d, i) => (
      <mesh key={i} position={[d[0] * r * 0.93, d[1] * r * 0.93, d[2] * r * 0.93]}>
        <sphereGeometry args={[r * 0.3, 5, 4]} />
        <meshStandardMaterial color="#141414" flatShading />
      </mesh>
    ))}
  </group>
);

// ---------- Troféu dourado ----------
export const Trofeu = ({pos = [0, 0, 0] as V3, escala = 1}: {pos?: V3; escala?: number}) => (
  <group position={pos} scale={escala}>
    <mesh position={[0, 0.08, 0]}>
      <cylinderGeometry args={[0.16, 0.2, 0.16, 20]} />
      <meshStandardMaterial color="#2b2b2b" roughness={0.4} />
    </mesh>
    <mesh position={[0, 0.3, 0]}>
      <cylinderGeometry args={[0.05, 0.1, 0.3, 16]} />
      <meshStandardMaterial color="#ffcc33" metalness={0.9} roughness={0.25} emissive="#ffb000" emissiveIntensity={0.25} />
    </mesh>
    <mesh position={[0, 0.6, 0]}>
      <cylinderGeometry args={[0.22, 0.08, 0.36, 20, 1, true]} />
      <meshStandardMaterial color="#ffcc33" metalness={0.9} roughness={0.25} emissive="#ffb000" emissiveIntensity={0.25} side={2} />
    </mesh>
    {[-1, 1].map((l) => (
      <mesh key={l} position={[l * 0.24, 0.6, 0]} rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[0.08, 0.022, 8, 16, Math.PI]} />
        <meshStandardMaterial color="#ffcc33" metalness={0.9} roughness={0.25} emissive="#ffb000" emissiveIntensity={0.25} />
      </mesh>
    ))}
  </group>
);

// ---------- Camisa 7 no cabide / pendurada ----------
export const Camisa = ({pos = [0, 0, 0] as V3, rot = 0, cor = '#c8102e', corNumero = '#ffd23f', costas = true, brilho = 0}: {pos?: V3; rot?: number; cor?: string; corNumero?: string; costas?: boolean; brilho?: number}) => (
  <group position={pos} rotation={[0, rot, 0]}>
    {/* cabide */}
    <mesh position={[0, 0.62, 0]} rotation={[0, 0, Math.PI / 2]}>
      <cylinderGeometry args={[0.012, 0.012, 0.7, 6]} />
      <meshStandardMaterial color="#8a6a4a" />
    </mesh>
    <mesh position={[0, 0.72, 0]}>
      <torusGeometry args={[0.05, 0.01, 6, 12, Math.PI * 1.4]} />
      <meshStandardMaterial color="#aaa" metalness={0.8} />
    </mesh>
    <B tam={[0.66, 0.9, 0.08]} pos={[0, 0.17, 0]} cor={cor} emi={brilho} />
    {[-1, 1].map((l) => (
      <B key={l} tam={[0.26, 0.3, 0.08]} pos={[l * 0.4, 0.45, 0]} rot={[0, 0, l * -0.6]} cor={cor} emi={brilho} />
    ))}
    <B tam={[0.66, 0.06, 0.085]} pos={[0, -0.25, 0]} cor="#0b6b3a" />
    {/* número 7 grande nas costas */}
    <group position={[0, 0.17, costas ? -0.045 : 0.045]} rotation={[0, costas ? Math.PI : 0, 0]} scale={1.3}>
      <B tam={[0.24, 0.06, 0.01]} pos={[0, 0.16, 0]} cor={corNumero} emi={0.3} />
      <B tam={[0.065, 0.34, 0.01]} pos={[0.04, -0.02, 0]} rot={[0, 0, -0.35]} cor={corNumero} emi={0.3} />
    </group>
  </group>
);

// ---------- Estádio à noite ----------
const Torcida = ({n = 1400, cores, semente = 1}: {n?: number; cores: string[]; semente?: number}) => {
  const frame = useCurrentFrame();
  const dados = useMemo(() => {
    let s = semente * 9301 + 49297;
    const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
    const lista: {p: V3; c: string; f: number}[] = [];
    for (let i = 0; i < n; i++) {
      const lado = Math.floor(rnd() * 4);
      const fila = Math.floor(rnd() * 14);
      const ao = (rnd() - 0.5) * (lado < 2 ? 64 : 42);
      const dist = (lado < 2 ? 22 : 33) + fila * 1.0;
      const y = 0.9 + fila * 0.75;
      const p: V3 = lado === 0 ? [ao, y, -dist] : lado === 1 ? [ao, y, dist] : lado === 2 ? [-dist, y, ao] : [dist, y, ao];
      lista.push({p, c: cores[Math.floor(rnd() * cores.length)], f: rnd() * 10});
    }
    return lista;
  }, [n, cores, semente]);
  const ref = (m: InstancedMesh | null) => {
    if (!m) return;
    const o = new Object3D();
    const cor = new Color();
    dados.forEach((d, i) => {
      o.position.set(d.p[0], d.p[1] + Math.max(0, Math.sin(frame * 0.35 + d.f)) * 0.18, d.p[2]);
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
      m.setColorAt(i, cor.set(d.c));
    });
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  };
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, dados.length]}>
      <boxGeometry args={[0.55, 0.9, 0.45]} />
      <meshStandardMaterial roughness={0.8} />
    </instancedMesh>
  );
};

// Flashes de celular piscando na arquibancada
const Flashes = () => {
  const frame = useCurrentFrame();
  const pts = useMemo(() => {
    const l: V3[] = [];
    for (let i = 0; i < 40; i++) {
      const a = (i * 137.5 * Math.PI) / 180;
      const r = 26 + (i % 7) * 1.6;
      l.push([Math.cos(a) * r * 1.2, 2 + (i % 9) * 1.1, Math.sin(a) * r]);
    }
    return l;
  }, []);
  return (
    <>
      {pts.map((p, i) =>
        (frame + i * 7) % 23 < 2 ? (
          <mesh key={i} position={p}>
            <sphereGeometry args={[0.22, 6, 6]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
        ) : null,
      )}
    </>
  );
};

export const Estadio = ({torcida = true, cores = ['#c8102e', '#0b6b3a', '#ffd23f', '#f2f2f2', '#c8102e']}: {torcida?: boolean; cores?: string[]}) => (
  <group>
    {/* gramado com faixas */}
    {Array.from({length: 12}, (_, i) => (
      <mesh key={i} position={[-33 + i * 6 + 3, -0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[6, 44]} />
        <meshStandardMaterial color={i % 2 ? '#2f8f3a' : '#36a043'} roughness={0.95} />
      </mesh>
    ))}
    {/* linhas */}
    <B tam={[0.12, 0.01, 40]} pos={[0, 0, 0]} cor="#f4f4f4" />
    {[-1, 1].map((l) => (
      <group key={l}>
        <B tam={[0.12, 0.01, 40]} pos={[l * 32, 0, 0]} cor="#f4f4f4" />
        <B tam={[0.12, 0.01, 18]} pos={[l * 26, 0, 0]} cor="#f4f4f4" />
        <B tam={[6, 0.01, 0.12]} pos={[l * 29, 0, 9]} cor="#f4f4f4" />
        <B tam={[6, 0.01, 0.12]} pos={[l * 29, 0, -9]} cor="#f4f4f4" />
        {/* gol */}
        <group position={[l * 32, 0, 0]}>
          {[-3.6, 3.6].map((z) => (
            <B key={z} tam={[0.15, 2.4, 0.15]} pos={[0, 1.2, z]} cor="#ffffff" />
          ))}
          <B tam={[0.15, 0.15, 7.35]} pos={[0, 2.4, 0]} cor="#ffffff" />
          <B tam={[1.6, 2.4, 7.3]} pos={[l * 0.85, 1.2, 0]} cor="#dddddd" op={0.18} />
        </group>
      </group>
    ))}
    {[0, 0.5, 1].map((k) => (
      <B key={k} tam={[64, 0.01, 0.12]} pos={[0, 0, k === 0 ? -20 : k === 1 ? 20 : 0]} cor="#f4f4f4" />
    ))}
    <mesh position={[0, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[4.5, 4.62, 48]} />
      <meshBasicMaterial color="#f4f4f4" />
    </mesh>
    {/* arquibancadas em degraus */}
    {[0, 1, 2, 3].map((lado) => (
      <group key={lado} rotation={[0, (lado * Math.PI) / 2, 0]}>
        {Array.from({length: 7}, (_, k) => (
          <B key={k} tam={[lado % 2 ? 46 : 70, 1.5, 2.1]} pos={[0, k * 1.5 + 0.2, -(lado % 2 ? 33 : 22.4) - k * 2]} cor={k % 2 ? '#3a3f4a' : '#323641'} />
        ))}
        <B tam={[lado % 2 ? 46 : 70, 2.2, 0.4]} pos={[0, 0.6, -(lado % 2 ? 32.2 : 21.6)]} cor="#0f1a2e" />
        {/* placas de publicidade iluminadas */}
        <B tam={[lado % 2 ? 40 : 60, 0.9, 0.2]} pos={[0, 0.45, -(lado % 2 ? 31.6 : 21)]} cor={lado % 2 ? '#1f6feb' : '#e10600'} emi={0.9} />
      </group>
    ))}
    {torcida && <Torcida cores={cores} />}
    {torcida && <Flashes />}
    {/* torres de refletores */}
    {[[-36, -26], [36, -26], [-36, 26], [36, 26]].map(([x, z], i) => (
      <group key={i} position={[x, 0, z]}>
        <B tam={[0.6, 24, 0.6]} pos={[0, 12, 0]} cor="#5a5f6a" />
        <B tam={[4.5, 2.4, 0.4]} pos={[0, 24.5, 0]} rot={[0, Math.atan2(-x, -z), 0]} cor="#fffbe8" emi={3} />
      </group>
    ))}
    <pointLight position={[0, 20, 0]} intensity={900} distance={80} color="#fff6e0" />
  </group>
);

// ---------- Banco de reservas ----------
export const Banco = ({pos = [0, 0, 0] as V3}: {pos?: V3}) => (
  <group position={pos}>
    <B tam={[5, 0.12, 0.9]} pos={[0, 0.55, 0]} cor="#c8102e" />
    <B tam={[5, 0.8, 0.12]} pos={[0, 0.95, -0.45]} cor="#c8102e" />
    {[-2.4, 2.4].map((x) => (
      <B key={x} tam={[0.1, 2.4, 1.4]} pos={[x, 1.2, 0.1]} cor="#cfd6e0" op={0.35} />
    ))}
    <B tam={[5, 0.1, 1.6]} pos={[0, 2.45, 0.15]} cor="#cfd6e0" op={0.45} />
    <B tam={[5.2, 2.4, 0.1]} pos={[0, 1.2, -0.6]} cor="#1c2533" />
  </group>
);

// ---------- Vestiário ----------
export const Vestiario = () => (
  <group>
    <B tam={[16, 0.1, 12]} pos={[0, -0.05, 0]} cor="#5b6372" />
    <B tam={[16, 5, 0.2]} pos={[0, 2.5, -3]} cor="#1e2a3e" />
    {Array.from({length: 9}, (_, i) => (
      <group key={i} position={[-6 + i * 1.5, 0, -2.6]}>
        <B tam={[1.35, 2.6, 0.7]} pos={[0, 1.6, 0]} cor="#2b3a55" />
        <B tam={[1.2, 2.3, 0.05]} pos={[0, 1.6, 0.36]} cor="#3a4b6b" />
        <B tam={[0.9, 0.18, 0.06]} pos={[0, 2.5, 0.39]} cor="#c8102e" emi={0.3} />
      </group>
    ))}
    <B tam={[12, 0.5, 0.9]} pos={[0, 0.25, -1.4]} cor="#8a6a4a" />
    <mesh position={[0, 4.6, 0]}>
      <boxGeometry args={[6, 0.08, 0.5]} />
      <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={2} />
    </mesh>
  </group>
);

// ---------- Sala de coletiva ----------
export const Coletiva = () => (
  <group>
    <B tam={[14, 0.1, 10]} pos={[0, -0.05, 0]} cor="#2a2f3a" />
    {/* painel de fundo xadrez */}
    {Array.from({length: 6}, (_, i) =>
      Array.from({length: 3}, (_, j) => (
        <B key={`${i}${j}`} tam={[1.6, 1.3, 0.1]} pos={[-4 + i * 1.6, 0.65 + j * 1.3, -1.6]} cor={(i + j) % 2 ? '#c8102e' : '#0b6b3a'} />
      )),
    )}
    {/* mesa com microfones */}
    <B tam={[4.2, 0.9, 1.1]} pos={[0, 0.45, 0.6]} cor="#111827" />
    <B tam={[4.3, 0.06, 1.2]} pos={[0, 0.92, 0.6]} cor="#c8102e" />
    {[-0.6, -0.2, 0.2, 0.6].map((x, i) => (
      <group key={i} position={[x, 0.95, 0.75]} rotation={[-0.4 + i * 0.05, (i - 1.5) * 0.25, 0]}>
        <B tam={[0.04, 0.4, 0.04]} pos={[0, 0.2, 0]} cor="#222" />
        <B tam={[0.11, 0.14, 0.11]} pos={[0, 0.42, 0]} cor={['#e10600', '#1f6feb', '#ffd23f', '#2ecc71'][i]} />
      </group>
    ))}
  </group>
);

// ---------- Mesa com documento e carimbo ----------
export const Documento = ({descida = 0}: {descida?: number}) => (
  <group>
    <B tam={[6, 0.2, 4]} pos={[0, 0.9, 0]} cor="#5a3d26" />
    <B tam={[1.6, 0.02, 2.1]} pos={[0, 1.01, 0]} cor="#f7f3ea" />
    {Array.from({length: 8}, (_, i) => (
      <B key={i} tam={[1.2 - (i % 3) * 0.2, 0.005, 0.05]} pos={[-0.1, 1.025, -0.8 + i * 0.18]} cor="#9aa0a8" />
    ))}
    {descida >= 0.98 && <B tam={[0.9, 0.006, 0.4]} pos={[0.1, 1.03, 0.55]} rot={[0, -0.15, 0]} cor="#c8102e" />}
    <group position={[0.1, 1.05 + (1 - descida) * 1.2, 0.55]}>
      <B tam={[0.9, 0.18, 0.45]} pos={[0, 0.09, 0]} cor="#7a1010" />
      <B tam={[0.16, 0.5, 0.16]} pos={[0, 0.43, 0]} cor="#3a2a1a" />
      <mesh position={[0, 0.72, 0]}>
        <sphereGeometry args={[0.16, 12, 10]} />
        <meshStandardMaterial color="#3a2a1a" />
      </mesh>
    </group>
  </group>
);

// ---------- Sala de casa (gravação do vídeo) ----------
export const Sala = () => (
  <group>
    <B tam={[14, 0.1, 10]} pos={[0, -0.05, 0]} cor="#8a6e55" />
    <B tam={[14, 6, 0.2]} pos={[0, 3, -2.5]} cor="#e8e0d4" />
    {/* estante com troféus */}
    <B tam={[3.2, 2.6, 0.6]} pos={[-2.6, 1.3, -2.1]} cor="#3b2a1d" />
    {[0.7, 1.5, 2.3].map((y) => (
      <B key={y} tam={[3.0, 0.06, 0.5]} pos={[-2.6, y, -2.0]} cor="#5a4130" />
    ))}
    {[[-3.6, 0.73], [-2.9, 0.73], [-2.2, 1.53], [-1.6, 1.53], [-3.3, 1.53], [-2.6, 2.33]].map(([x, y], i) => (
      <Trofeu key={i} pos={[x, y, -2.0]} escala={0.45} />
    ))}
    {/* quadro com camisa */}
    <B tam={[1.6, 1.9, 0.08]} pos={[2.4, 2.4, -2.38]} cor="#111" />
    <Camisa pos={[2.4, 2.2, -2.3]} costas={false} />
    <B tam={[3, 0.8, 1.2]} pos={[2.2, 0.4, -1.4]} cor="#2b2f3a" />
  </group>
);

// Celular na mão (gravando)
export const Celular = ({pos, rot = [0, 0, 0] as V3}: {pos: V3; rot?: V3}) => (
  <group position={pos} rotation={rot}>
    <B tam={[0.36, 0.7, 0.04]} cor="#111" />
    <B tam={[0.32, 0.64, 0.01]} pos={[0, 0, 0.022]} cor="#9fd3ff" emi={1.2} />
    <mesh position={[0.1, 0.27, -0.03]}>
      <sphereGeometry args={[0.035, 8, 8]} />
      <meshStandardMaterial color="#000" />
    </mesh>
  </group>
);
