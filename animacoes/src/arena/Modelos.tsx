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
export const VERDE = '#2fb88a'; // macacão dos jogadores (verde-menta suave)
export const ROSA_PLAT = '#ff7eb9';
export const AMARELO_PLAT = '#ffd23f';
export const AZUL_PLAT = '#3550ff';

// ---------- Personagens ----------
// Jogador: macacão verde-menta numerado (contrasta com o cenário colorido)
export const Jogador = ({numero, ...p}: BP & {numero: string}) => (
  <Boneco camisa={VERDE} manga={VERDE} bermuda={VERDE} pernas={VERDE} sapato="#f7f7f7" numero={numero} {...p} />
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
        const corBase = azul ? AZUL_PLAT : p.id % 2 ? ROSA_PLAT : AMARELO_PLAT;
        const corTopo = azul ? '#7d8cff' : p.id % 2 ? '#ffc2de' : '#fff0a8';
        return (
          <group key={p.id} position={[p.x, 0.18 - a * 1.2 + Math.sin(frame * 0.08 + p.id) * 0.02, p.z]} rotation={[Math.sin(frame * 0.5) * 0.12 * b + a * 0.4, 0, Math.cos(frame * 0.45) * 0.1 * b - a * 0.3]}>
            <mesh>
              <cylinderGeometry args={[0.9, 0.85, 0.3, 6]} />
              <M cor={corBase} emi={azul ? 0.25 + brilhoAzul * (0.6 + Math.sin(frame * 0.4) * 0.3) : 0.15} />
            </mesh>
            <mesh position={[0, 0.16, 0]}>
              <cylinderGeometry args={[0.78, 0.78, 0.02, 6]} />
              <M cor={corTopo} />
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
      {[[0, 5.3, 16.6, 0.5], [0, -5.3, 16.6, 0.5], [8.05, 0, 0.5, 11.1], [-8.05, 0, 0.5, 11.1]].map(([x, z, w, d], i) => (
        <mesh key={i} position={[x, -0.2, z]}>
          <boxGeometry args={[w, 0.7, d]} />
          <M cor="#e9eef5" />
        </mesh>
      ))}
      <mesh position={[0, -0.6, 0]}>
        <boxGeometry args={[15.6, 0.1, 10.1]} />
        <M cor="#0c5f8a" />
      </mesh>
      <mesh position={[0, 0.06, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[15.6, 10.2, 16, 12]} />
        <meshStandardMaterial color="#19c3d6" emissive="#0aa3c2" emissiveIntensity={0.55} transparent opacity={0.92} flatShading roughness={0.15} metalness={0.1} />
      </mesh>
      {/* reflexos ondulando */}
      {Array.from({length: 18}, (_, i) => (
        <mesh key={i} position={[((i * 53) % 150) / 10 - 7.5, 0.075, ((i * 37) % 100) / 10 - 5]} rotation={[-Math.PI / 2, 0, 0]} scale={1 + Math.sin(frame * 0.07 + i) * 0.3}>
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

// ---------- O galpão da arena (colorido, estilo game show) ----------
const PAREDES = ['#7ec8ff', '#ff9ecf', '#ffd966', '#b79cff', '#ff9e7a', '#8fe3ff', '#ffb3d9', '#ffe28a'];
export const Galpao = ({telao = ['R$ 1.000.000', 'ARENA DO MILHÃO'], mostrarTelao = true, piscina = true}: {telao?: string[]; mostrarTelao?: boolean; piscina?: boolean}) => {
  const frame = useCurrentFrame();
  return (
    <group>
      {/* piso em ladrilhos pastel */}
      {Array.from({length: 22}, (_, i) =>
        Array.from({length: 22}, (_, j) => {
          const x = -22 + i * 2 + 1;
          const z = -22 + j * 2 + 1;
          if (piscina && Math.abs(x) < 8.6 && Math.abs(z) < 5.9) return null; // piscina
          return (
            <mesh key={`${i}-${j}`} position={[x, -0.6, z]}>
              <boxGeometry args={[1.96, 0.1, 1.96]} />
              <M cor={['#ffd1e8', '#fff1b8', '#e3d4ff', '#cdeeff'][(i + j * 3) % 4]} />
            </mesh>
          );
        }),
      )}
      {/* paredes pintadas com formas geométricas */}
      {Array.from({length: 8}, (_, i) => {
        const a = (i / 8) * Math.PI * 2;
        const cor = PAREDES[i];
        return (
          <group key={i} position={[Math.sin(a) * 22, 6, Math.cos(a) * 22]} rotation={[0, a + Math.PI, 0]}>
            <mesh>
              <boxGeometry args={[18.5, 14, 0.4]} />
              <M cor={cor} />
            </mesh>
            {/* círculos, triângulos e faixas em cor contrastante */}
            <mesh position={[-5, 1.5, 0.25]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[1.8, 1.8, 0.1, 20]} />
              <M cor="#ffffff" emi={0.1} />
            </mesh>
            <mesh position={[4.5, 2, 0.25]} rotation={[Math.PI / 2, 0, 0.3]}>
              <cylinderGeometry args={[2.2, 2.2, 0.1, 3]} />
              <M cor={PAREDES[(i + 3) % 8]} emi={0.1} />
            </mesh>
            <mesh position={[0, -4.5, 0.25]}>
              <boxGeometry args={[18.5, 1.2, 0.1]} />
              <M cor={PAREDES[(i + 5) % 8]} />
            </mesh>
            {/* lâmpadas tipo camarim */}
            {Array.from({length: 9}, (_, k) => (
              <mesh key={k} position={[-8 + k * 2, 5.8, 0.3]}>
                <sphereGeometry args={[0.18, 8, 6]} />
                <meshStandardMaterial color="#fff6d0" emissive="#ffe08a" emissiveIntensity={(frame + k * 5 + i * 3) % 30 < 15 ? 2 : 0.6} />
              </mesh>
            ))}
          </group>
        );
      })}
      {/* bandeirinhas cruzando a arena */}
      {[-6, 0, 6].map((z, f) => (
        <group key={f}>
          {Array.from({length: 16}, (_, k) => {
            const x = -15 + k * 2;
            const y = 9 - Math.cos((k / 15 - 0.5) * Math.PI) * 1.2;
            return (
              <mesh key={k} position={[x, y, z]} rotation={[0, 0, Math.PI]}>
                <coneGeometry args={[0.45, 0.9, 3]} />
                <meshStandardMaterial color={PAREDES[(k + f) % 8]} flatShading emissive={PAREDES[(k + f) % 8]} emissiveIntensity={0.25} side={2} />
              </mesh>
            );
          })}
        </group>
      ))}
      {/* balões nos cantos */}
      {[[-10, -7], [10, -7], [-10, 7], [10, 7]].map(([x, z], i) => (
        <group key={i} position={[x, 0, z]}>
          {[0, 1, 2].map((k) => (
            <group key={k} position={[(k - 1) * 0.6, 2.2 + k * 0.3 + Math.sin(frame * 0.06 + k + i) * 0.1, (k % 2) * 0.4]}>
              <mesh>
                <sphereGeometry args={[0.45, 10, 8]} />
                <meshStandardMaterial color={['#ff4f8b', '#ffd23f', '#4fa8ff'][(k + i) % 3]} roughness={0.25} emissive={['#ff4f8b', '#ffd23f', '#4fa8ff'][(k + i) % 3]} emissiveIntensity={0.15} />
              </mesh>
              <mesh position={[0, -1.1, 0]}>
                <cylinderGeometry args={[0.01, 0.01, 1.6, 4]} />
                <meshBasicMaterial color="#ffffff" />
              </mesh>
            </group>
          ))}
        </group>
      ))}
      {/* telão */}
      {mostrarTelao && (
        <Telao pos={[0, 7.5, -14]} largura={10} linhas={[{t: telao[0], cor: '#ffd23f', tam: 150}, {t: telao[1], cor: '#ffffff', tam: 70}]} />
      )}
      {/* cones de luz coloridos */}
      {[[-6, -4, '#ff9ecf'], [6, -4, '#7ec8ff'], [-6, 4, '#ffd966'], [6, 4, '#b79cff'], [0, 0, '#ffffff']].map(([x, z, c], i) => (
        <mesh key={i} position={[x as number, 7, z as number]}>
          <coneGeometry args={[2.2, 14, 20, 1, true]} />
          <meshBasicMaterial color={c as string} transparent opacity={0.07} side={2} depthWrite={false} />
        </mesh>
      ))}
      <hemisphereLight args={['#ffffff', '#ffd6ec', 1.25]} />
      <directionalLight position={[4, 12, 6]} intensity={1.8} color="#fff6e6" />
      <directionalLight position={[-6, 6, -6]} intensity={0.8} color="#cfe6ff" />
    </group>
  );
};

// Multidão (jogadores ao fundo): cada um com rosto, corpo, cabelo, pele e acessórios diferentes
const PELES = ['#f6d0b0', '#f0c49a', '#e8b48a', '#c98d64', '#a86b45', '#8a5a3c', '#6b4128'];
const CABELOS = ['#141414', '#2a1d14', '#4a2e1a', '#7a3b12', '#a0522d', '#d9a441', '#d9d9d9'];
const rndI = (i: number, k: number) => {
  const x = Math.sin(i * 127.1 + k * 311.7) * 43758.5453;
  return x - Math.floor(x);
};
const PessoaMultidao = ({i, pos}: {i: number; pos: V3}) => {
  const frame = useCurrentFrame();
  const pele = PELES[Math.floor(rndI(i, 1) * PELES.length)];
  const corCab = CABELOS[Math.floor(rndI(i, 2) * CABELOS.length)];
  const tipoCab = Math.floor(rndI(i, 3) * 6); // 0 careca, 1 curto, 2 tigela, 3 coque, 4 cacheado, 5 comprido
  const largura = 0.75 + rndI(i, 4) * 0.6; // magro → gordinho
  const altura = 0.85 + rndI(i, 5) * 0.3;
  const oculos = rndI(i, 6) > 0.8;
  const barba = rndI(i, 7) > 0.78;
  const expr = Math.floor(rndI(i, 8) * 4); // 0 sério, 1 sorriso, 2 boca aberta (surpreso), 3 preocupado
  const bob = Math.abs(Math.sin(frame * 0.1 + i)) * 0.04;
  const pisca = (frame + i * 13) % 100 < 3;
  const R = 0.28;
  return (
    <group position={[pos[0], pos[1] + bob, pos[2]]} rotation={[0, (rndI(i, 9) - 0.5) * 0.9, 0]} scale={[1, altura, 1]}>
      {[-0.1, 0.1].map((lx) => (
        <group key={lx}>
          <mesh position={[lx * largura, 0.35, 0]}>
            <cylinderGeometry args={[0.06, 0.055, 0.6, 6]} />
            <M cor={VERDE} />
          </mesh>
          <mesh position={[lx * largura, 0.05, 0.04]} scale={[0.8, 0.45, 1.3]}>
            <sphereGeometry args={[0.09, 6, 5]} />
            <M cor="#f7f7f7" />
          </mesh>
        </group>
      ))}
      <mesh position={[0, 0.95, 0]} scale={[largura, 1, largura]}>
        <cylinderGeometry args={[0.23, 0.21 + (largura - 0.75) * 0.1, 0.6, 7]} />
        <M cor={VERDE} />
      </mesh>
      {/* placa do número */}
      <mesh position={[0, 1.0, 0.2 * largura + 0.02]}>
        <boxGeometry args={[0.16, 0.12, 0.01]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      {[-1, 1].map((l) => (
        <group key={l} position={[l * 0.27 * largura, 1.2, 0]} rotation={[Math.sin(frame * 0.12 + i + l) * 0.25, 0, l * 0.12]}>
          <mesh>
            <sphereGeometry args={[0.11, 6, 5]} />
            <M cor={VERDE} />
          </mesh>
          <mesh position={[0, -0.28, 0]}>
            <cylinderGeometry args={[0.045, 0.04, 0.5, 6]} />
            <M cor={pele} />
          </mesh>
          <mesh position={[0, -0.56, 0]}>
            <sphereGeometry args={[0.06, 5, 4]} />
            <M cor={pele} />
          </mesh>
        </group>
      ))}
      {/* cabeça com rosto */}
      <group position={[0, 1.55, 0]} scale={[1, 1 / altura, 1]}>
        <mesh>
          <icosahedronGeometry args={[R, 1]} />
          <M cor={pele} />
        </mesh>
        {[-1, 1].map((l) => (
          <group key={l}>
            <mesh position={[l * 0.09, 0.03, R * 0.9]} scale={[0.04, pisca ? 0.008 : expr === 2 ? 0.07 : 0.055, 0.02]}>
              <sphereGeometry args={[1, 8, 6]} />
              <meshStandardMaterial color="#141414" />
            </mesh>
            {!pisca && (
              <mesh position={[l * 0.09 + 0.012, 0.05, R * 0.95]}>
                <sphereGeometry args={[0.011, 5, 4]} />
                <meshBasicMaterial color="#ffffff" />
              </mesh>
            )}
            <mesh position={[l * 0.09, 0.12, R * 0.86]} rotation={[0, 0, expr === 3 ? -l * 0.35 : 0]}>
              <boxGeometry args={[0.07, 0.016, 0.02]} />
              <meshStandardMaterial color={corCab === '#d9d9d9' ? '#8a8a8a' : corCab} />
            </mesh>
            {oculos && (
              <mesh position={[l * 0.09, 0.03, R * 0.98]}>
                <torusGeometry args={[0.05, 0.009, 5, 12]} />
                <meshStandardMaterial color="#222" />
              </mesh>
            )}
          </group>
        ))}
        {/* boca */}
        {expr === 1 ? (
          <mesh position={[0, -0.07, R * 0.9]} rotation={[0, 0, Math.PI]}>
            <torusGeometry args={[0.045, 0.01, 5, 10, Math.PI]} />
            <meshStandardMaterial color="#5a1f1f" />
          </mesh>
        ) : expr === 2 ? (
          <mesh position={[0, -0.09, R * 0.9]} scale={[0.035, 0.045, 0.02]}>
            <sphereGeometry args={[1, 8, 6]} />
            <meshStandardMaterial color="#4a1515" />
          </mesh>
        ) : (
          <mesh position={[0, -0.09, R * 0.9]}>
            <boxGeometry args={[0.07, 0.013, 0.02]} />
            <meshStandardMaterial color="#5a1f1f" />
          </mesh>
        )}
        {barba && (
          <mesh position={[0, -0.14, 0.08]} scale={[1, 0.55, 0.85]}>
            <icosahedronGeometry args={[R * 0.78, 1]} />
            <M cor={corCab} />
          </mesh>
        )}
        {/* cabelo */}
        {tipoCab === 1 && (
          <mesh position={[0, 0.1, -0.03]} scale={[1.06, 0.62, 1.06]}>
            <icosahedronGeometry args={[R, 1]} />
            <M cor={corCab} />
          </mesh>
        )}
        {tipoCab === 2 && (
          <mesh position={[0, 0.07, -0.02]} scale={[1.1, 0.8, 1.1]}>
            <sphereGeometry args={[R, 9, 6, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
            <M cor={corCab} />
          </mesh>
        )}
        {tipoCab === 3 && (
          <>
            <mesh position={[0, 0.08, -0.03]} scale={[1.05, 0.6, 1.05]}>
              <icosahedronGeometry args={[R, 1]} />
              <M cor={corCab} />
            </mesh>
            <mesh position={[0, R + 0.06, -0.06]}>
              <icosahedronGeometry args={[0.11, 0]} />
              <M cor={corCab} />
            </mesh>
          </>
        )}
        {tipoCab === 4 &&
          Array.from({length: 7}, (_, k) => {
            const a2 = (k / 7) * Math.PI * 2;
            return (
              <mesh key={k} position={[Math.cos(a2) * R * 0.75, R * 0.55, Math.sin(a2) * R * 0.65 - 0.05]}>
                <icosahedronGeometry args={[0.11, 0]} />
                <M cor={corCab} />
              </mesh>
            );
          })}
        {tipoCab === 5 && (
          <>
            <mesh position={[0, 0.09, -0.03]} scale={[1.07, 0.62, 1.07]}>
              <icosahedronGeometry args={[R, 1]} />
              <M cor={corCab} />
            </mesh>
            <mesh position={[0, -0.12, -0.12]}>
              <cylinderGeometry args={[R * 0.95, R * 1.0, 0.45, 8]} />
              <M cor={corCab} />
            </mesh>
          </>
        )}
      </group>
    </group>
  );
};

export const Multidao = ({n = 70, centro = [0, 0, 8] as V3, largura = 14, prof = 4}: {n?: number; centro?: V3; largura?: number; prof?: number}) => (
  <group position={centro}>
    {Array.from({length: n}, (_, i) => (
      <PessoaMultidao key={i} i={i} pos={[(rndI(i, 10) - 0.5) * largura, 0, (rndI(i, 11) - 0.5) * prof]} />
    ))}
  </group>
);

// ---------- Robô juiz gigante (vigia a arena; olhos ficam vermelhos ao eliminar) ----------
export const Robo = ({pos = [0, -0.55, -11] as V3, escala = 1, giro, alerta = 0}: {pos?: V3; escala?: number; giro?: number; alerta?: number}) => {
  const frame = useCurrentFrame();
  const yaw = giro ?? Math.sin(frame * 0.035) * 0.6;
  const corOlho = alerta > 0.5 ? '#ff2d2d' : '#3df2ff';
  const pisca = alerta > 0.5 ? (Math.floor(frame / 4) % 2 ? 3 : 1) : 1.6;
  return (
    <group position={pos} scale={escala}>
      {/* base e pernas */}
      <mesh position={[0, 0.6, 0]}>
        <cylinderGeometry args={[2.2, 2.6, 1.2, 8]} />
        <M cor="#e9ecf5" metal={0.3} />
      </mesh>
      {[-1, 1].map((l) => (
        <mesh key={l} position={[l * 0.9, 2.2, 0]}>
          <cylinderGeometry args={[0.45, 0.55, 2.2, 8]} />
          <M cor="#c7ccdb" metal={0.4} />
        </mesh>
      ))}
      {/* corpo */}
      <mesh position={[0, 4.6, 0]}>
        <boxGeometry args={[3.6, 3.0, 2.2]} />
        <M cor="#f4f5fa" metal={0.2} />
      </mesh>
      <mesh position={[0, 4.6, 1.12]}>
        <boxGeometry args={[2.4, 1.6, 0.05]} />
        <M cor="#1b2236" />
      </mesh>
      {/* luzes do peito */}
      {[-0.7, 0, 0.7].map((x, i) => (
        <mesh key={i} position={[x, 4.6, 1.16]}>
          <sphereGeometry args={[0.2, 10, 8]} />
          <meshStandardMaterial color={['#ff4f8b', '#ffd23f', '#3df2ff'][i]} emissive={['#ff4f8b', '#ffd23f', '#3df2ff'][i]} emissiveIntensity={(frame + i * 10) % 30 < 15 ? 2 : 0.5} />
        </mesh>
      ))}
      {/* braços */}
      {[-1, 1].map((l) => (
        <group key={l} position={[l * 2.1, 5.6, 0]} rotation={[0, 0, l * (0.25 + Math.sin(frame * 0.05) * 0.05)]}>
          <mesh position={[0, -1.2, 0]}>
            <cylinderGeometry args={[0.38, 0.42, 2.4, 8]} />
            <M cor="#c7ccdb" metal={0.4} />
          </mesh>
          <mesh position={[0, -2.6, 0]}>
            <sphereGeometry args={[0.6, 10, 8]} />
            <M cor="#ffd23f" />
          </mesh>
        </group>
      ))}
      {/* cabeça que gira vigiando */}
      <group position={[0, 6.6, 0]} rotation={[0, yaw, 0]}>
        <mesh position={[0, 1.1, 0]}>
          <boxGeometry args={[3.0, 2.2, 2.4]} />
          <M cor="#ffffff" metal={0.2} />
        </mesh>
        <mesh position={[0, 1.1, 1.21]}>
          <boxGeometry args={[2.5, 1.2, 0.05]} />
          <M cor="#0d1222" />
        </mesh>
        {[-0.6, 0.6].map((x) => (
          <mesh key={x} position={[x, 1.15, 1.26]}>
            <boxGeometry args={[0.6, 0.45, 0.05]} />
            <meshStandardMaterial color={corOlho} emissive={corOlho} emissiveIntensity={pisca} toneMapped={false} />
          </mesh>
        ))}
        {/* antena */}
        <mesh position={[0, 2.6, 0]}>
          <cylinderGeometry args={[0.06, 0.06, 0.8, 6]} />
          <M cor="#9aa0b4" />
        </mesh>
        <mesh position={[0, 3.05, 0]}>
          <sphereGeometry args={[0.22, 10, 8]} />
          <meshStandardMaterial color={corOlho} emissive={corOlho} emissiveIntensity={pisca} toneMapped={false} />
        </mesh>
        {/* orelhas */}
        {[-1, 1].map((l) => (
          <mesh key={l} position={[l * 1.6, 1.1, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.45, 0.45, 0.3, 10]} />
            <M cor="#ff4f8b" />
          </mesh>
        ))}
      </group>
      <pointLight position={[0, 7.8, 3]} intensity={alerta > 0.5 ? 40 : 15} color={corOlho} distance={20} />
    </group>
  );
};
