import {useMemo} from 'react';
import {CanvasTexture, CatmullRomCurve3, SRGBColorSpace, TubeGeometry, Vector3} from 'three';
import {useCurrentFrame} from 'remotion';
import {FONTE} from '../submarino/Overlay';
import {Boneco} from '../personagem/Boneco';

type V3 = [number, number, number];
type BP = React.ComponentProps<typeof Boneco>;
const M = ({cor, emi = 0, op = 1, metal = 0, rug = 0.75}: {cor: string; emi?: number; op?: number; metal?: number; rug?: number}) => (
  <meshStandardMaterial color={cor} flatShading roughness={rug} metalness={metal} emissive={emi ? cor : '#000'} emissiveIntensity={emi} transparent={op < 1} opacity={op} depthWrite={op >= 1} />
);
const Caixa = ({t, p, c, r, emi, op}: {t: V3; p: V3; c: string; r?: V3; emi?: number; op?: number}) => (
  <mesh position={p} rotation={r}>
    <boxGeometry args={t} />
    <M cor={c} emi={emi} op={op} />
  </mesh>
);

// ---------- Personagens ----------
export const Voce = (p: BP) => <Boneco camisa="#e8553e" bermuda="#2f5fa8" chapeu="bone" corChapeu="#ffcc33" cabelo="curto" corCabelo="#4a2e1a" {...p} />;
export const Pai = (p: BP) => <Boneco tronco="gordinho" camisa="#ffd23f" manga="#1fa34a" bermuda="#1d4e9e" cabelo="curto" corCabelo="#bdbdbd" bigode pele="#e0a878" {...p} />;
export const Tio = (p: BP) => <Boneco tronco="magro" camisa="#8e44ad" bermuda="#3a3f4a" cabelo="franja" corCabelo="#2a1d14" oculos pele="#f0c49a" {...p} />;
export const Primo = (p: BP) => <Boneco tronco="forte" camisa="#2a9d8f" bermuda="#264653" cabelo="careca" barba corCabelo="#141414" pele="#8a5a3c" {...p} />;
export const Mulher = (p: BP) => <Boneco camisa="#ff6fa5" vestido bermuda="#ff6fa5" cabelo="coque" corCabelo="#5a3a1f" pele="#f2c8a8" {...p} />;
export const Socorrista = (p: BP) => <Boneco camisa="#e63946" manga="#e63946" bermuda="#1d3557" pernas="#1d3557" sapato="#111" cabelo="curto" corCabelo="#141414" {...p} />;

// ---------- Textura com texto/desenho ----------
const useCanvas = (desenha: (g: CanvasRenderingContext2D, w: number, h: number) => void, w: number, h: number, chave: string) =>
  useMemo(() => {
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    desenha(c.getContext('2d')!, w, h);
    const tx = new CanvasTexture(c);
    tx.colorSpace = SRGBColorSpace;
    return tx;
  }, [chave]);

// ---------- Sala com o jogo na TV ----------
export const Sala = ({lampada = true}: {lampada?: boolean}) => {
  const frame = useCurrentFrame();
  const campo = useCanvas(
    (g, w, h) => {
      g.fillStyle = '#2e9e44';
      g.fillRect(0, 0, w, h);
      for (let i = 0; i < 8; i++) {
        g.fillStyle = i % 2 ? '#34ab4b' : '#2e9e44';
        g.fillRect((i * w) / 8, 0, w / 8, h);
      }
      g.strokeStyle = '#fff';
      g.lineWidth = 4;
      g.strokeRect(10, 10, w - 20, h - 20);
      g.beginPath();
      g.moveTo(w / 2, 10);
      g.lineTo(w / 2, h - 10);
      g.stroke();
      g.beginPath();
      g.arc(w / 2, h / 2, 40, 0, Math.PI * 2);
      g.stroke();
      g.fillStyle = '#ffd23f';
      for (let i = 0; i < 6; i++) g.fillRect(80 + i * 60, 60 + (i % 3) * 50, 10, 10);
      g.fillStyle = '#e63946';
      for (let i = 0; i < 6; i++) g.fillRect(110 + i * 55, 90 + (i % 2) * 60, 10, 10);
    },
    512,
    256,
    'campo',
  );
  return (
    <group>
      {/* piso de madeira */}
      {Array.from({length: 12}, (_, i) => (
        <Caixa key={i} t={[14, 0.05, 0.98]} p={[0, -0.025, -6 + i]} c={i % 2 ? '#c98a4b' : '#b97a3e'} />
      ))}
      {/* paredes */}
      <Caixa t={[14, 5, 0.2]} p={[0, 2.5, -4.2]} c="#7ec8e3" />
      <Caixa t={[0.2, 5, 10]} p={[-6, 2.5, 0]} c="#ffd28a" />
      <Caixa t={[14, 0.3, 0.25]} p={[0, 0.15, -4.05]} c="#ffffff" />
      {/* quadro e janela com noite */}
      <Caixa t={[1.6, 1.1, 0.06]} p={[-3.3, 3, -4.08]} c="#ffffff" />
      <Caixa t={[1.4, 0.9, 0.04]} p={[-3.3, 3, -4.04]} c="#ff9e7a" />
      <Caixa t={[0.06, 1.6, 2.2]} p={[-5.88, 2.8, -1.4]} c="#ffffff" />
      <mesh position={[-5.86, 2.8, -1.4]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[2, 1.4]} />
        <meshBasicMaterial color="#1b2a5a" />
      </mesh>
      {/* rack e TV */}
      <Caixa t={[3.6, 0.6, 0.7]} p={[0, 0.3, -3.6]} c="#5a3d26" />
      <Caixa t={[3.0, 1.75, 0.12]} p={[0, 1.6, -3.75]} c="#111111" />
      <mesh position={[0, 1.6, -3.68]}>
        <planeGeometry args={[2.8, 1.55]} />
        <meshBasicMaterial map={campo} toneMapped={false} />
      </mesh>
      {/* bola correndo na TV */}
      <mesh position={[-1.2 + ((frame * 0.02) % 2.4), 1.55 + Math.sin(frame * 0.2) * 0.25, -3.66]}>
        <circleGeometry args={[0.05, 10]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      {/* tapete */}
      <mesh position={[0, 0.01, 0.2]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[2.4, 24]} />
        <M cor="#e76f51" />
      </mesh>
      {/* sofá */}
      <group position={[0, 0, 1.6]}>
        <Caixa t={[3.6, 0.5, 1.1]} p={[0, 0.25, 0]} c="#3d5a80" />
        <Caixa t={[3.6, 0.25, 1.0]} p={[0, 0.62, 0.05]} c="#4f6d9a" />
        <Caixa t={[3.6, 1.0, 0.3]} p={[0, 0.85, 0.5]} c="#3d5a80" />
        {[-1.95, 1.95].map((x) => (
          <Caixa key={x} t={[0.35, 0.85, 1.1]} p={[x, 0.45, 0]} c="#334e70" />
        ))}
        <Caixa t={[0.6, 0.45, 0.2]} p={[-1.2, 0.95, 0.3]} c="#ffd23f" r={[0.2, 0, 0.2]} />
      </group>
      {/* mesinha com petiscos */}
      <group position={[0, 0, -0.6]}>
        <Caixa t={[1.4, 0.08, 0.8]} p={[0, 0.45, 0]} c="#8b5a2b" />
        {[[-0.6, -0.3], [0.6, -0.3], [-0.6, 0.3], [0.6, 0.3]].map(([x, z], i) => (
          <Caixa key={i} t={[0.06, 0.45, 0.06]} p={[x, 0.22, z]} c="#6b4423" />
        ))}
        <mesh position={[-0.3, 0.56, 0]}>
          <cylinderGeometry args={[0.2, 0.14, 0.14, 10]} />
          <M cor="#e63946" />
        </mesh>
        {Array.from({length: 9}, (_, i) => (
          <mesh key={i} position={[-0.3 + Math.cos(i) * 0.1, 0.65, Math.sin(i * 2) * 0.1]}>
            <icosahedronGeometry args={[0.045, 0]} />
            <M cor="#fff3c4" />
          </mesh>
        ))}
        {[0.25, 0.45].map((x, i) => (
          <mesh key={x} position={[x, 0.58, i * 0.12]}>
            <cylinderGeometry args={[0.05, 0.05, 0.18, 10]} />
            <M cor={i ? '#2a9d8f' : '#e63946'} metal={0.4} />
          </mesh>
        ))}
      </group>
      {/* abajur */}
      <group position={[2.6, 0, 1.6]}>
        <Caixa t={[0.5, 0.6, 0.5]} p={[0, 0.3, 0]} c="#6b4423" />
        <mesh position={[0, 1.0, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 0.8, 6]} />
          <M cor="#333" />
        </mesh>
        <mesh position={[0, 1.5, 0]}>
          <cylinderGeometry args={[0.2, 0.35, 0.4, 10, 1, true]} />
          <meshStandardMaterial color="#fff1c4" emissive="#ffd88a" emissiveIntensity={lampada ? 1.2 : 0.2} side={2} />
        </mesh>
        {lampada && <pointLight position={[0, 1.4, 0]} intensity={6} color="#ffd88a" distance={6} />}
      </group>
      {/* planta */}
      <group position={[-4.6, 0, -3.2]}>
        <mesh position={[0, 0.3, 0]}>
          <cylinderGeometry args={[0.3, 0.22, 0.6, 8]} />
          <M cor="#f4a261" />
        </mesh>
        {[0, 1, 2, 3].map((i) => (
          <mesh key={i} position={[Math.cos(i * 1.6) * 0.2, 0.9 + i * 0.12, Math.sin(i * 1.6) * 0.2]} scale={[0.6, 1.2, 0.6]}>
            <icosahedronGeometry args={[0.3, 0]} />
            <M cor="#2e9e44" />
          </mesh>
        ))}
      </group>
      <hemisphereLight args={['#ffffff', '#8a6a4a', 0.9]} />
      <directionalLight position={[3, 8, 6]} intensity={1.4} color="#fff3dc" />
    </group>
  );
};

// ---------- Coração com artérias e coágulo ----------
const curvaArt = new CatmullRomCurve3([new Vector3(-0.1, 0.95, 0.55), new Vector3(0.25, 0.6, 0.78), new Vector3(0.45, 0.1, 0.8), new Vector3(0.4, -0.45, 0.62), new Vector3(0.15, -0.85, 0.35)]);
const curvaArt2 = new CatmullRomCurve3([new Vector3(-0.1, 0.95, 0.55), new Vector3(-0.45, 0.55, 0.72), new Vector3(-0.62, 0.05, 0.62), new Vector3(-0.5, -0.5, 0.42)]);
export const Coracao = ({entupido = 0, morte = 0, bate = true}: {entupido?: number; morte?: number; bate?: boolean}) => {
  const frame = useCurrentFrame();
  const g1 = useMemo(() => new TubeGeometry(curvaArt, 40, 0.07, 8, false), []);
  const g2 = useMemo(() => new TubeGeometry(curvaArt2, 40, 0.07, 8, false), []);
  const pulso = bate ? 1 + Math.max(0, Math.sin(frame * 0.35)) ** 6 * 0.06 : 1;
  const coagulo = curvaArt.getPoint(0.45);
  // gotas de sangue correndo pela artéria (param 0→1); depois do coágulo elas param
  const gotas = Array.from({length: 8}, (_, i) => {
    let u = ((frame * 0.012 + i / 8) % 1);
    if (entupido > 0.5 && u > 0.42) u = 0.42 - (i % 3) * 0.03;
    const p = curvaArt.getPoint(u);
    return [p.x, p.y, p.z + 0.02] as V3;
  });
  const corMusculo = '#d6283c';
  return (
    <group scale={pulso}>
      {/* lobos e ponta */}
      <mesh position={[-0.32, 0.35, 0]} scale={[1, 1.05, 0.9]}>
        <icosahedronGeometry args={[0.75, 2]} />
        <M cor={corMusculo} />
      </mesh>
      <mesh position={[0.32, 0.3, 0]} scale={[1, 1.05, 0.9]}>
        <icosahedronGeometry args={[0.72, 2]} />
        <M cor="#c91f33" />
      </mesh>
      <mesh position={[0.05, -0.45, 0.02]} rotation={[0, 0, Math.PI + 0.2]} scale={[1, 1, 0.85]}>
        <coneGeometry args={[0.85, 1.3, 14]} />
        <M cor={corMusculo} />
      </mesh>
      {/* aorta e veias no topo */}
      <mesh position={[-0.15, 1.2, -0.1]} rotation={[0, 0, 0.25]}>
        <cylinderGeometry args={[0.24, 0.26, 0.8, 12]} />
        <M cor="#e05a6a" />
      </mesh>
      <mesh position={[0.35, 1.15, -0.15]} rotation={[0, 0, -0.3]}>
        <cylinderGeometry args={[0.18, 0.2, 0.6, 12]} />
        <M cor="#4f6dd8" />
      </mesh>
      {/* área do músculo morrendo (escurece) */}
      <mesh position={[0.32, -0.55, 0.42]} scale={[0.9, 0.8, 0.5]}>
        <icosahedronGeometry args={[0.55, 1]} />
        <M cor="#4a1a22" op={Math.min(1, morte) * 0.85} />
      </mesh>
      {/* artérias coronárias */}
      <mesh geometry={g1}>
        <M cor="#ff7a59" emi={0.15} />
      </mesh>
      <mesh geometry={g2}>
        <M cor="#ff7a59" emi={0.15} />
      </mesh>
      {gotas.map((p, i) => (
        <mesh key={i} position={p}>
          <sphereGeometry args={[0.04, 6, 5]} />
          <meshStandardMaterial color="#ff2d2d" emissive="#ff2d2d" emissiveIntensity={0.6} />
        </mesh>
      ))}
      {/* coágulo */}
      {entupido > 0 && (
        <mesh position={[coagulo.x, coagulo.y, coagulo.z + 0.02]} scale={0.2 + entupido * 0.9}>
          <dodecahedronGeometry args={[0.11, 0]} />
          <M cor="#3a0a10" />
        </mesh>
      )}
    </group>
  );
};

// ---------- X vermelho 3D (NÃO!) ----------
export const XVermelho = ({pos, k = 1, escala = 1}: {pos: V3; k?: number; escala?: number}) =>
  k <= 0.01 ? null : (
    <group position={pos} scale={escala * k}>
      {[1, -1].map((l) => (
        <mesh key={l} rotation={[0, 0, l * Math.PI / 4]}>
          <boxGeometry args={[1.6, 0.32, 0.2]} />
          <meshStandardMaterial color="#ff1f1f" emissive="#ff1f1f" emissiveIntensity={0.6} />
        </mesh>
      ))}
    </group>
  );
export const Certo = ({pos, k = 1, escala = 1}: {pos: V3; k?: number; escala?: number}) =>
  k <= 0.01 ? null : (
    <group position={pos} scale={escala * k}>
      <mesh position={[-0.35, -0.15, 0]} rotation={[0, 0, Math.PI / 4]}>
        <boxGeometry args={[0.7, 0.3, 0.2]} />
        <meshStandardMaterial color="#1fcf5a" emissive="#1fcf5a" emissiveIntensity={0.6} />
      </mesh>
      <mesh position={[0.2, 0.1, 0]} rotation={[0, 0, -Math.PI / 3.2]}>
        <boxGeometry args={[1.3, 0.3, 0.2]} />
        <meshStandardMaterial color="#1fcf5a" emissive="#1fcf5a" emissiveIntensity={0.6} />
      </mesh>
    </group>
  );

// ---------- Relógio ----------
export const Relogio = ({pos, escala = 1, velocidade = 1}: {pos: V3; escala?: number; velocidade?: number}) => {
  const frame = useCurrentFrame();
  return (
    <group position={pos} scale={escala}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[1, 1, 0.2, 32]} />
        <M cor="#ffffff" />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -0.02]}>
        <cylinderGeometry args={[1.12, 1.12, 0.18, 32]} />
        <M cor="#e63946" />
      </mesh>
      {Array.from({length: 12}, (_, i) => (
        <Caixa key={i} t={[0.06, 0.18, 0.05]} p={[Math.sin((i / 12) * Math.PI * 2) * 0.82, Math.cos((i / 12) * Math.PI * 2) * 0.82, 0.12]} r={[0, 0, -(i / 12) * Math.PI * 2]} c="#222" />
      ))}
      <group rotation={[0, 0, -frame * 0.1 * velocidade]} position={[0, 0, 0.14]}>
        <Caixa t={[0.05, 0.75, 0.03]} p={[0, 0.33, 0]} c="#e63946" />
      </group>
      <group rotation={[0, 0, -frame * 0.008 * velocidade]} position={[0, 0, 0.13]}>
        <Caixa t={[0.08, 0.5, 0.03]} p={[0, 0.22, 0]} c="#222" />
      </group>
    </group>
  );
};

// ---------- Chave e carro ----------
export const Chave = ({pos, rot = [0, 0, 0] as V3}: {pos: V3; rot?: V3}) => (
  <group position={pos} rotation={rot}>
    <Caixa t={[0.1, 0.16, 0.04]} p={[0, 0, 0]} c="#222" />
    <Caixa t={[0.03, 0.18, 0.015]} p={[0, -0.16, 0]} c="#c0c0c0" />
  </group>
);
export const Carro = ({pos = [0, 0, 0] as V3, rot = 0, cor = '#2f80ed'}: {pos?: V3; rot?: number; cor?: string}) => (
  <group position={pos} rotation={[0, rot, 0]}>
    <Caixa t={[1.9, 0.6, 4.0]} p={[0, 0.55, 0]} c={cor} />
    <Caixa t={[1.7, 0.6, 2.0]} p={[0, 1.15, -0.2]} c={cor} />
    <Caixa t={[1.72, 0.45, 1.9]} p={[0, 1.15, -0.2]} c="#bfe4ff" op={0.8} />
    {[[-0.95, 1.3], [0.95, 1.3], [-0.95, -1.3], [0.95, -1.3]].map(([x, z], i) => (
      <mesh key={i} position={[x, 0.32, z]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.32, 0.32, 0.25, 12]} />
        <M cor="#222" />
      </mesh>
    ))}
    {[-0.6, 0.6].map((x) => (
      <Caixa key={x} t={[0.35, 0.15, 0.05]} p={[x, 0.65, 2.01]} c="#fff6c4" emi={1} />
    ))}
  </group>
);

// ---------- Ambulância ----------
export const Ambulancia = ({pos = [0, 0, 0] as V3, rot = 0, portas = 0}: {pos?: V3; rot?: number; portas?: number}) => {
  const frame = useCurrentFrame();
  const pisca = Math.floor(frame / 5) % 2;
  return (
    <group position={pos} rotation={[0, rot, 0]}>
      <Caixa t={[2.2, 2.2, 4.4]} p={[0, 1.45, -0.6]} c="#f7f7f7" />
      <Caixa t={[2.1, 1.3, 1.6]} p={[0, 1.0, 2.3]} c="#f7f7f7" />
      <Caixa t={[2.0, 0.6, 0.05]} p={[0, 1.4, 3.11]} c="#bfe4ff" />
      {/* faixas vermelhas */}
      {[-1.11, 1.11].map((x) => (
        <Caixa key={x} t={[0.02, 0.3, 6]} p={[x, 0.95, 0.2]} c="#e63946" />
      ))}
      {/* símbolo: estrela da vida simplificada (azul) */}
      {[-1.12, 1.12].map((x) => (
        <group key={x} position={[x, 1.75, -0.6]} rotation={[0, x > 0 ? Math.PI / 2 : -Math.PI / 2, 0]}>
          {[0, 1, 2].map((k) => (
            <Caixa key={k} t={[0.22, 0.75, 0.02]} p={[0, 0, 0]} r={[0, 0, (k * Math.PI) / 3]} c="#1d4ed8" />
          ))}
        </group>
      ))}
      {/* sirene */}
      <Caixa t={[0.45, 0.22, 0.4]} p={[-0.45, 2.66, 0.9]} c={pisca ? '#ff1f1f' : '#7a0a0a'} emi={pisca ? 2.5 : 0.3} />
      <Caixa t={[0.45, 0.22, 0.4]} p={[0.45, 2.66, 0.9]} c={pisca ? '#2a1a8a' : '#3d6bff'} emi={pisca ? 0.3 : 2.5} />
      {pisca ? <pointLight position={[-0.5, 3, 1]} intensity={20} color="#ff1f1f" distance={10} /> : <pointLight position={[0.5, 3, 1]} intensity={20} color="#3d6bff" distance={10} />}
      {/* rodas */}
      {[[-1.1, 2.2], [1.1, 2.2], [-1.1, -1.8], [1.1, -1.8]].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.38, z]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.38, 0.38, 0.28, 12]} />
          <M cor="#222" />
        </mesh>
      ))}
      {/* portas de trás abrindo */}
      {[-1, 1].map((l) => (
        <group key={l} position={[l * 1.1, 1.45, -2.8]} rotation={[0, l * portas * 1.6, 0]}>
          <Caixa t={[1.1, 2.1, 0.08]} p={[-l * 0.55, 0, 0]} c="#f2f2f2" />
        </group>
      ))}
    </group>
  );
};

// Maca
export const Maca = ({pos, rot = 0}: {pos: V3; rot?: number}) => (
  <group position={pos} rotation={[0, rot, 0]}>
    <Caixa t={[0.8, 0.12, 2.1]} p={[0, 0.8, 0]} c="#f7f7f7" />
    <Caixa t={[0.82, 0.06, 2.12]} p={[0, 0.72, 0]} c="#e63946" />
    {[[-0.35, -0.9], [0.35, -0.9], [-0.35, 0.9], [0.35, 0.9]].map(([x, z], i) => (
      <group key={i}>
        <Caixa t={[0.05, 0.7, 0.05]} p={[x, 0.37, z]} c="#9aa0a8" />
        <mesh position={[x, 0.06, z]}>
          <sphereGeometry args={[0.07, 8, 6]} />
          <M cor="#222" />
        </mesh>
      </group>
    ))}
  </group>
);

// ---------- Celular com o 192 na tela ----------
export const Celular = ({pos, rot = [0, 0, 0] as V3, escala = 1, discando = 0}: {pos: V3; rot?: V3; escala?: number; discando?: number}) => {
  const n = Math.min(3, Math.floor(discando * 4));
  const tx = useCanvas(
    (g, w, h) => {
      g.fillStyle = '#0f172a';
      g.fillRect(0, 0, w, h);
      g.fillStyle = '#ffffff';
      g.textAlign = 'center';
      g.font = `150px ${FONTE}`;
      g.fillText('192'.slice(0, n), w / 2, 260);
      g.font = `40px ${FONTE}`;
      g.fillStyle = '#94a3b8';
      g.fillText(n >= 3 ? 'CHAMANDO...' : '', w / 2, 340);
      for (let i = 0; i < 9; i++) {
        g.fillStyle = '#1e293b';
        g.beginPath();
        g.arc(110 + (i % 3) * 145, 470 + Math.floor(i / 3) * 140, 55, 0, Math.PI * 2);
        g.fill();
        g.fillStyle = '#e2e8f0';
        g.font = `60px ${FONTE}`;
        g.fillText(String(i + 1), 110 + (i % 3) * 145, 492 + Math.floor(i / 3) * 140);
      }
      g.fillStyle = '#22c55e';
      g.beginPath();
      g.arc(w / 2, 920, 65, 0, Math.PI * 2);
      g.fill();
    },
    512,
    1024,
    `cel${n}`,
  );
  return (
    <group position={pos} rotation={rot} scale={escala}>
      <Caixa t={[0.5, 1.0, 0.06]} p={[0, 0, 0]} c="#111" />
      <mesh position={[0, 0, 0.032]}>
        <planeGeometry args={[0.46, 0.92]} />
        <meshBasicMaterial map={tx} toneMapped={false} />
      </mesh>
    </group>
  );
};

// Comprimido (AAS)
export const Comprimido = ({pos, escala = 1}: {pos: V3; escala?: number}) => (
  <group position={pos} scale={escala}>
    <mesh rotation={[Math.PI / 2, 0, 0]}>
      <cylinderGeometry args={[0.12, 0.12, 0.05, 20]} />
      <meshStandardMaterial color="#ffffff" roughness={0.5} emissive="#ffffff" emissiveIntensity={0.15} />
    </mesh>
    <Caixa t={[0.18, 0.012, 0.012]} p={[0, 0, 0.027]} c="#cbd5e1" />
  </group>
);

// Rua à noite (cena do carro)
export const RuaNoite = () => (
  <group>
    <Caixa t={[40, 0.05, 8]} p={[0, -0.02, 0]} c="#3a3f4a" />
    {Array.from({length: 10}, (_, i) => (
      <Caixa key={i} t={[1.6, 0.06, 0.15]} p={[-18 + i * 4, 0.01, 0]} c="#ffd23f" />
    ))}
    <Caixa t={[40, 0.2, 2]} p={[0, 0.1, -5]} c="#9aa0a8" />
    {Array.from({length: 6}, (_, i) => (
      <group key={i} position={[-15 + i * 6, 0, -5.5]}>
        <Caixa t={[3.5, 3 + (i % 3), 3]} p={[0, (3 + (i % 3)) / 2, -1.5]} c={['#ff9e7a', '#7ec8ff', '#ffd966', '#b79cff'][i % 4]} />
        <Caixa t={[0.8, 0.8, 0.05]} p={[-0.8, 2, 0.02]} c="#fff1a8" emi={1.2} />
        <Caixa t={[0.8, 0.8, 0.05]} p={[0.8, 2, 0.02]} c="#fff1a8" emi={1.2} />
      </group>
    ))}
    {[-10, 0, 10].map((x) => (
      <group key={x} position={[x, 0, -4]}>
        <Caixa t={[0.12, 4, 0.12]} p={[0, 2, 0]} c="#555" />
        <Caixa t={[0.6, 0.15, 0.3]} p={[0.25, 4, 0]} c="#fff6c4" emi={2} />
        <pointLight position={[0.25, 3.8, 0]} intensity={12} color="#ffe2a8" distance={8} />
      </group>
    ))}
    <hemisphereLight args={['#8fb3ff', '#2a2a3a', 0.8]} />
    <directionalLight position={[4, 8, 6]} intensity={0.8} color="#bcd0ff" />
  </group>
);

// Fachada do hospital
export const Hospital = () => (
  <group>
    <Caixa t={[40, 0.05, 20]} p={[0, -0.02, 0]} c="#7cc95a" />
    <Caixa t={[12, 0.06, 6]} p={[0, 0.0, 2]} c="#9aa0a8" />
    <Caixa t={[10, 7, 4]} p={[0, 3.5, -4]} c="#f1f5f9" />
    {Array.from({length: 4}, (_, r) =>
      Array.from({length: 6}, (_, c) => <Caixa key={`${r}${c}`} t={[1, 0.8, 0.05]} p={[-3.75 + c * 1.5, 1.6 + r * 1.4, -1.98]} c="#7ec8ff" emi={0.3} />),
    )}
    {/* placa H */}
    <group position={[0, 6.2, -1.9]}>
      <Caixa t={[1.4, 1.4, 0.1]} p={[0, 0, 0]} c="#1d4ed8" />
      <Caixa t={[0.18, 0.9, 0.05]} p={[-0.3, 0, 0.07]} c="#ffffff" />
      <Caixa t={[0.18, 0.9, 0.05]} p={[0.3, 0, 0.07]} c="#ffffff" />
      <Caixa t={[0.6, 0.16, 0.05]} p={[0, 0, 0.07]} c="#ffffff" />
    </group>
    <Caixa t={[3, 2.4, 0.1]} p={[0, 1.2, -1.95]} c="#bfe4ff" op={0.8} />
    <hemisphereLight args={['#ffffff', '#6a8f4a', 1.0]} />
    <directionalLight position={[4, 10, 8]} intensity={1.5} color="#fff3dc" />
  </group>
);
