import {useMemo} from 'react';
import {CanvasTexture, SRGBColorSpace} from 'three';
import {useCurrentFrame} from 'remotion';
import {FONTE} from '../submarino/Overlay';
import {Boneco} from '../personagem/Boneco';

type V3 = [number, number, number];
type BP = React.ComponentProps<typeof Boneco>;
const M = ({cor, emi = 0, op = 1, metal = 0, rug = 0.7}: {cor: string; emi?: number; op?: number; metal?: number; rug?: number}) => (
  <meshStandardMaterial color={cor} flatShading roughness={rug} metalness={metal} emissive={emi ? cor : '#000'} emissiveIntensity={emi} transparent={op < 1} opacity={op} depthWrite={op >= 1} />
);

export const LARANJA = '#ff7a1a';
export const AZUL_PLAT = '#2f80ff';

// ---------- Personagens ----------
// Jogador: macacão laranja numerado
export const Jogador = ({numero, ...p}: BP & {numero: string}) => (
  <Boneco camisa={LARANJA} manga={LARANJA} bermuda={LARANJA} pernas={LARANJA} sapato="#f2f2f2" numero={numero} {...p} />
);
// Apresentador: terno preto, viseira amarela e microfone
export const Apresentador = (p: BP) => (
  <Boneco camisa="#16161c" manga="#16161c" bermuda="#16161c" pernas="#16161c" sapato="#0d0d0d" cabelo="curto" corCabelo="#141414" viseira="#ffd23f" microfone tronco="forte" pele="#c98d64" {...p} />
);

// ---------- Textura com texto (telão, placas) ----------
const useTexturaTexto = (linhas: {t: string; cor: string; tam: number}[], fundo: string, w = 1024, h = 512) =>
  useMemo(() => {
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    const g = c.getContext('2d')!;
    g.fillStyle = fundo;
    g.fillRect(0, 0, w, h);
    const total = linhas.reduce((a, l) => a + l.tam * 1.1, 0);
    let y = (h - total) / 2;
    for (const l of linhas) {
      g.font = `${l.tam}px ${FONTE}`;
      g.fillStyle = l.cor;
      g.textAlign = 'center';
      g.textBaseline = 'top';
      g.fillText(l.t, w / 2, y);
      y += l.tam * 1.1;
    }
    const tx = new CanvasTexture(c);
    tx.colorSpace = SRGBColorSpace;
    return tx;
  }, [JSON.stringify(linhas), fundo, w, h]);

export const Telao = ({pos, rot = 0, largura = 8, linhas}: {pos: V3; rot?: number; largura?: number; linhas: {t: string; cor: string; tam: number}[]}) => {
  const tx = useTexturaTexto(linhas, '#0a0f2a');
  return (
    <group position={pos} rotation={[0, rot, 0]}>
      <mesh>
        <boxGeometry args={[largura + 0.4, largura / 2 + 0.4, 0.3]} />
        <M cor="#111" metal={0.5} />
      </mesh>
      <mesh position={[0, 0, 0.16]}>
        <planeGeometry args={[largura, largura / 2]} />
        <meshBasicMaterial map={tx} toneMapped={false} />
      </mesh>
    </group>
  );
};

// ---------- Cubo de vidro com o prêmio ----------
export const CuboPremio = ({pos = [0, 0, 0] as V3, escala = 1}: {pos?: V3; escala?: number}) => {
  const frame = useCurrentFrame();
  const notas = useMemo(() => {
    const l: {p: V3; r: number}[] = [];
    for (let i = 0; i < 70; i++) l.push({p: [((i % 5) - 2) * 0.32, 0.12 + Math.floor(i / 25) * 0.16 + (i % 3) * 0.02, ((Math.floor(i / 5) % 5) - 2) * 0.32], r: (i * 0.7) % 0.4});
    return l;
  }, []);
  return (
    <group position={pos} scale={escala}>
      {/* pedestal */}
      <mesh position={[0, 0.4, 0]}>
        <cylinderGeometry args={[1.3, 1.5, 0.8, 8]} />
        <M cor="#1c2233" metal={0.4} />
      </mesh>
      <mesh position={[0, 0.82, 0]}>
        <cylinderGeometry args={[1.32, 1.32, 0.05, 8]} />
        <M cor="#ffd23f" emi={0.8} />
      </mesh>
      <group position={[0, 0.85, 0]} rotation={[0, frame * 0.004, 0]}>
        {notas.map((n, i) => (
          <mesh key={i} position={n.p} rotation={[0, n.r, 0]}>
            <boxGeometry args={[0.3, 0.12, 0.16]} />
            <M cor={i % 4 === 0 ? '#e6c25a' : '#6fbf73'} />
          </mesh>
        ))}
        {/* vidro */}
        <mesh position={[0, 0.85, 0]}>
          <boxGeometry args={[1.8, 1.7, 1.8]} />
          <meshStandardMaterial color="#cfefff" transparent opacity={0.16} roughness={0.05} metalness={0.2} depthWrite={false} />
        </mesh>
        {/* arestas metálicas */}
        {[[-0.9, -0.9], [0.9, -0.9], [-0.9, 0.9], [0.9, 0.9]].map(([x, z], i) => (
          <mesh key={i} position={[x, 0.85, z]}>
            <boxGeometry args={[0.06, 1.72, 0.06]} />
            <M cor="#ffd23f" metal={0.8} rug={0.3} emi={0.3} />
          </mesh>
        ))}
        {[0, 1.7].map((y) =>
          [0, 1].map((k) => (
            <mesh key={`${y}${k}`} position={[0, y, 0]} rotation={[0, (k * Math.PI) / 2, 0]}>
              <boxGeometry args={[1.86, 0.06, 0.06]} />
              <M cor="#ffd23f" metal={0.8} rug={0.3} emi={0.3} />
            </mesh>
          )),
        )}
      </group>
      <pointLight position={[0, 2.2, 1.2]} intensity={12} color="#fff1c2" />
    </group>
  );
};

// ---------- Plataformas sobre a piscina ----------
export type Plataforma = {id: number; x: number; z: number; cor: 'laranja' | 'azul'};
export const PLATAFORMAS: Plataforma[] = (() => {
  const l: Plataforma[] = [];
  let id = 0;
  for (let r = -2; r <= 2; r++)
    for (let c = -3; c <= 3; c++) {
      const x = c * 1.95 + (r % 2 ? 0.975 : 0);
      const z = r * 1.7;
      const azul = [3, 9, 15, 17, 24, 27, 31].includes(id);
      l.push({id, x, z, cor: azul ? 'azul' : 'laranja'});
      id++;
    }
  return l;
})();
export const posPlat = (id: number, y = 0.35): V3 => {
  const p = PLATAFORMAS[id];
  return [p.x, y, p.z];
};
// afunda: 0 = em cima, 1 = submersa. balanca: inclinação oscilante. brilho: realça as azuis
export const Plataformas = ({afunda = {}, balanca = {}, brilhoAzul = 0}: {afunda?: Record<number, number>; balanca?: Record<number, number>; brilhoAzul?: number}) => {
  const frame = useCurrentFrame();
  return (
    <group>
      {PLATAFORMAS.map((p) => {
        const a = afunda[p.id] ?? 0;
        const b = balanca[p.id] ?? 0;
        if (a >= 1) return null;
        const azul = p.cor === 'azul';
        return (
          <group key={p.id} position={[p.x, 0.18 - a * 1.2 + Math.sin(frame * 0.08 + p.id) * 0.02, p.z]} rotation={[Math.sin(frame * 0.5) * 0.12 * b + a * 0.4, 0, Math.cos(frame * 0.45) * 0.1 * b - a * 0.3]}>
            <mesh>
              <cylinderGeometry args={[0.9, 0.85, 0.3, 6]} />
              <M cor={azul ? AZUL_PLAT : LARANJA} emi={azul ? 0.25 + brilhoAzul * (0.6 + Math.sin(frame * 0.4) * 0.3) : 0.15} />
            </mesh>
            <mesh position={[0, 0.16, 0]}>
              <cylinderGeometry args={[0.78, 0.78, 0.02, 6]} />
              <M cor={azul ? '#8fc0ff' : '#ffc08a'} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
};

// ---------- Piscina iluminada ----------
export const Piscina = () => {
  const frame = useCurrentFrame();
  return (
    <group>
      {/* borda */}
      <mesh position={[0, -0.25, 0]}>
        <boxGeometry args={[16.5, 0.6, 11]} />
        <M cor="#e9eef5" />
      </mesh>
      <mesh position={[0, -0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[15.6, 10.2, 16, 12]} />
        <meshStandardMaterial color="#19c3d6" emissive="#0aa3c2" emissiveIntensity={0.55} transparent opacity={0.92} flatShading roughness={0.15} metalness={0.1} />
      </mesh>
      {/* reflexos ondulando */}
      {Array.from({length: 18}, (_, i) => (
        <mesh key={i} position={[((i * 53) % 150) / 10 - 7.5, 0.0, ((i * 37) % 100) / 10 - 5]} rotation={[-Math.PI / 2, 0, 0]} scale={1 + Math.sin(frame * 0.07 + i) * 0.3}>
          <ringGeometry args={[0.2, 0.26, 12]} />
          <meshBasicMaterial color="#bff6ff" transparent opacity={0.35} />
        </mesh>
      ))}
    </group>
  );
};

// Respingo quando alguém cai
export const Respingo = ({pos, s}: {pos: V3; s: number}) => {
  if (s < 0 || s > 1) return null;
  return (
    <group position={pos}>
      {Array.from({length: 16}, (_, i) => {
        const a = (i / 16) * Math.PI * 2;
        const v = 1.6 + (i % 3) * 0.5;
        return (
          <mesh key={i} position={[Math.cos(a) * s * 1.1, v * s - 4.5 * s * s, Math.sin(a) * s * 1.1]} scale={1 - s * 0.7}>
            <icosahedronGeometry args={[0.08, 0]} />
            <meshStandardMaterial color="#d9fbff" emissive="#9ff0ff" emissiveIntensity={0.4} transparent opacity={0.9} />
          </mesh>
        );
      })}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]} scale={0.3 + s * 2}>
        <ringGeometry args={[0.4, 0.55, 20]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={(1 - s) * 0.8} />
      </mesh>
    </group>
  );
};

// ---------- O galpão da arena ----------
export const Galpao = ({telao = ['R$ 1.000.000', 'ARENA DO MILHÃO']}: {telao?: string[]}) => {
  const frame = useCurrentFrame();
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.55, 0]}>
        <circleGeometry args={[40, 24]} />
        <M cor="#1b2030" />
      </mesh>
      {/* faixas de LED no chão */}
      {[-9.5, 9.5].map((x) => (
        <mesh key={x} position={[x, -0.53, 0]}>
          <boxGeometry args={[0.15, 0.02, 14]} />
          <M cor={LARANJA} emi={2} />
        </mesh>
      ))}
      {/* paredes octogonais escuras com faixas de luz */}
      {Array.from({length: 8}, (_, i) => {
        const a = (i / 8) * Math.PI * 2;
        return (
          <group key={i} position={[Math.sin(a) * 22, 6, Math.cos(a) * 22]} rotation={[0, a + Math.PI, 0]}>
            <mesh>
              <boxGeometry args={[18.5, 14, 0.4]} />
              <M cor="#11162a" />
            </mesh>
            {[-3, 0, 3].map((y, k) => (
              <mesh key={k} position={[0, y, 0.25]}>
                <boxGeometry args={[17, 0.12, 0.05]} />
                <M cor={k === 1 ? LARANJA : '#2f80ff'} emi={1.6 + Math.sin(frame * 0.1 + i) * 0.4} />
              </mesh>
            ))}
          </group>
        );
      })}
      {/* telão */}
      <Telao pos={[0, 7.5, -14]} largura={10} linhas={[{t: telao[0], cor: '#ffd23f', tam: 150}, {t: telao[1], cor: '#ffffff', tam: 70}]} />
      {/* cones de luz do teto */}
      {[[-6, -4], [6, -4], [-6, 4], [6, 4], [0, 0]].map(([x, z], i) => (
        <mesh key={i} position={[x, 7, z]}>
          <coneGeometry args={[2.2, 14, 20, 1, true]} />
          <meshBasicMaterial color={i % 2 ? '#ffe6b0' : '#cfe3ff'} transparent opacity={0.05} side={2} depthWrite={false} />
        </mesh>
      ))}
      <hemisphereLight args={['#bcd4ff', '#2a2030', 0.9]} />
      <directionalLight position={[4, 12, 6]} intensity={1.6} color="#fff2dc" />
      <directionalLight position={[-6, 6, -6]} intensity={0.7} color="#7fb2ff" />
    </group>
  );
};

// Multidão simples (jogadores ao fundo, baratos de desenhar)
export const Multidao = ({n = 70, centro = [0, 0, 8] as V3, largura = 14, prof = 4}: {n?: number; centro?: V3; largura?: number; prof?: number}) => {
  const frame = useCurrentFrame();
  return (
    <group position={centro}>
      {Array.from({length: n}, (_, i) => {
        const x = (((i * 61) % 100) / 100 - 0.5) * largura;
        const z = (((i * 37) % 100) / 100 - 0.5) * prof;
        const pele = ['#f0c49a', '#c98d64', '#8a5a3c', '#e8b48a'][i % 4];
        const bob = Math.abs(Math.sin(frame * 0.1 + i)) * 0.04;
        return (
          <group key={i} position={[x, bob, z]}>
            <mesh position={[0, 0.75, 0]}>
              <cylinderGeometry args={[0.2, 0.18, 1.1, 6]} />
              <M cor={LARANJA} />
            </mesh>
            <mesh position={[0, 1.55, 0]}>
              <icosahedronGeometry args={[0.28, 0]} />
              <M cor={pele} />
            </mesh>
            <mesh position={[0, 1.72, -0.03]}>
              <icosahedronGeometry args={[0.24, 0]} />
              <M cor={['#2a1d14', '#141414', '#7a3b12', '#d9a441'][i % 4]} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
};
