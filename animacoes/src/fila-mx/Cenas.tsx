import {Easing, interpolate, useCurrentFrame} from 'remotion';
import {Bloquinho} from '../submarino/Bloquinho';
import {Palco} from '../submarino/Palco';
import {B} from '../freio/Modelos';
import {FPS, duracaoCena, quandoDiz, type CenaId} from './roteiro';

type V3 = [number, number, number];
const lerp = (s: number, a: number, b: number, de: number, para: number, easing = Easing.inOut(Easing.quad)) =>
  interpolate(s, [a, b], [de, para], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing});
const useSeg = () => useCurrentFrame() / FPS;
const D = duracaoCena;
const R = quandoDiz;

// ---------- Painel: tempo na fila (s) e posição ----------
type Pts = [number, number][];
const PAINEL: Partial<Record<CenaId, () => {tempo: Pts; pos: Pts}>> = {
  gancho: () => ({tempo: [[0, 312], [D('gancho'), 318]], pos: [[0, 4]]}),
  azar: () => ({tempo: [[0, 318], [D('azar'), 322]], pos: [[0, 4]]}),
  tres: () => ({tempo: [[0, 30], [D('tres'), 60]], pos: [[0, 4]]}),
  chance: () => ({tempo: [[0, 60], [D('chance'), 100]], pos: [[0, 4], [D('chance'), 3]]}),
  imprevisto: () => ({tempo: [[0, 100], [D('imprevisto'), 190]], pos: [[0, 3]]}),
  trava: () => ({tempo: [[0, 190], [D('trava'), 290]], pos: [[0, 3]]}),
  cerebro: () => ({tempo: [[0, 290], [D('cerebro'), 330]], pos: [[0, 3], [D('cerebro'), 2]]}),
  unica: () => ({tempo: [[0, 20], [D('unica'), 60]], pos: [[0, 8], [D('unica'), 4]]}),
  justo: () => ({tempo: [[0, 60], [D('justo'), 110]], pos: [[0, 4], [D('justo'), 1]]}),
  dica: () => ({tempo: [[0, 110], [D('dica'), 120]], pos: [[0, 1]]}),
};
const curva = (pts: Pts, s: number) =>
  pts.length === 1 ? pts[0][1] : interpolate(s, pts.map((p) => p[0]), pts.map((p) => p[1]), {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
export const painelEm = (id: CenaId, s: number) => {
  const p = PAINEL[id]?.();
  if (!p) return null;
  return {tempo: curva(p.tempo, s), pos: Math.round(curva(p.pos, s))};
};

// ---------- Mercado ----------
const CORES = ['#e63946', '#457b9d', '#2a9d8f', '#f4a261', '#6a4c93', '#ff5a9f', '#8ab17d', '#264653'];

const Caixa = ({x, livre = false}: {x: number; livre?: boolean}) => {
  const frame = useCurrentFrame();
  return (
    <group position={[x, 0, -3]}>
      {/* balcão com esteira */}
      <B tam={[1.1, 0.95, 2.4]} pos={[0.6, 0.47, 0.6]} cor="#d8d2c4" />
      <B tam={[0.8, 0.03, 2.2]} pos={[0.6, 0.97, 0.6]} cor="#222" />
      {Array.from({length: 6}, (_, i) => (
        <B key={i} tam={[0.8, 0.035, 0.05]} pos={[0.6, 0.98, -0.4 + ((i * 0.4 + frame * 0.01) % 2.2)]} cor="#444" />
      ))}
      {/* caixa registradora e luz do número */}
      <B tam={[0.4, 0.3, 0.3]} pos={[0.6, 1.15, -0.4]} cor="#3a3f46" />
      <B tam={[0.12, 1.4, 0.12]} pos={[1.15, 1.1, -0.6]} cor="#888" />
      <B tam={[0.4, 0.3, 0.1]} pos={[1.15, 1.9, -0.6]} cor={livre ? '#3ddc84' : '#ffcc00'} emi={1.2} />
      {/* operador do caixa */}
      <Bloquinho posicao={[1.55, 0, -0.2]} rotacaoY={-Math.PI / 2} camisa="#c2185b" calca="#222" chapeu="coco" corChapeu="#c2185b" escala={0.75} fase={x} />
    </group>
  );
};

const Carrinho = ({posicao, cor = '#9aa0a8'}: {posicao: V3; cor?: string}) => (
  <group position={posicao}>
    <B tam={[0.5, 0.4, 0.7]} pos={[0, 0.65, 0]} cor={cor} metal={0.6} op={0.9} />
    <B tam={[0.45, 0.25, 0.6]} pos={[0, 0.82, 0]} cor="#ff9f1c" />
    <B tam={[0.05, 0.5, 0.05]} pos={[0, 0.3, 0.3]} cor="#666" />
    <B tam={[0.05, 0.5, 0.05]} pos={[0, 0.3, -0.3]} cor="#666" />
  </group>
);

// Uma fila de clientes andando: avanco em "lugares" (1 lugar = 1.1 unidades)
const Fila = ({x, n = 4, avanco = 0, comVoce = -1, parada = false, primeiroProblema = false}: {x: number; n?: number; avanco?: number; comVoce?: number; parada?: boolean; primeiroProblema?: boolean}) => {
  const frame = useCurrentFrame();
  return (
    <group position={[x, 0, 0]}>
      {Array.from({length: n}, (_, i) => {
        const lugar = i - avanco;
        if (lugar < -0.5) return null; // já foi atendido
        const z = -1.1 + Math.max(0, lugar) * 1.15;
        const voce = i === comVoce;
        const andando = !parada && Math.abs(avanco % 1) > 0.05 && Math.abs(avanco % 1) < 0.95;
        return (
          <group key={i} position={[0, 0, z]}>
            <Bloquinho
              rotacaoY={Math.PI}
              camisa={voce ? '#ffcc00' : CORES[(i * 3 + Math.round(x * 7)) % CORES.length]}
              calca={voce ? '#1f5fa8' : '#2b2b3a'}
              chapeu="cabelo"
              corChapeu={voce ? '#2a1d14' : ['#1a1a1a', '#8a5a2b', '#d9c38a', '#555'][(i + 1) % 4]}
              pose={primeiroProblema && Math.round(lugar) === 0 ? 'susto' : andando ? 'andar' : 'parado'}
              expressao={voce && parada ? 'cansado' : 'feliz'}
              escala={0.72}
              fase={i + x}
            />
            {!voce && i % 2 === 0 && <Carrinho posicao={[0, 0, -0.55]} cor={frame % 2 ? '#9aa0a8' : '#9aa0a8'} />}
          </group>
        );
      })}
    </group>
  );
};

const Piso = () => (
  <>
    <B tam={[30, 0.1, 30]} pos={[0, -0.05, 0]} cor="#e8e2d2" />
    {Array.from({length: 10}, (_, i) => (
      <B key={i} tam={[30, 0.11, 0.04]} pos={[0, -0.04, -6 + i * 1.5]} cor="#d5cfbe" />
    ))}
    {/* prateleiras ao fundo */}
    {[-6, -3, 0, 3, 6].map((x) => (
      <group key={x} position={[x, 0, -8]}>
        <B tam={[2.4, 2.4, 0.8]} pos={[0, 1.2, 0]} cor="#d0d4da" />
        {[0.5, 1.2, 1.9].map((y, k) => (
          <B key={y} tam={[2.2, 0.35, 0.5]} pos={[0, y, 0.2]} cor={CORES[(k + x + 10) % CORES.length]} />
        ))}
      </group>
    ))}
  </>
);

const Mercado = ({avancos, voce = 1, parada = -1, problema = -1}: {avancos: [number, number, number]; voce?: number; parada?: number; problema?: number}) => (
  <>
    <Piso />
    {[-3, 0, 3].map((x, i) => (
      <group key={x}>
        <Caixa x={x - 0.6} />
        <Fila x={x} n={6} avanco={avancos[i]} comVoce={i === voce ? 3 : -1} parada={i === parada} primeiroProblema={i === problema} />
      </group>
    ))}
  </>
);

// ===== 0. GANCHO: você parado, a fila do lado andando =====
export const CenaGancho = () => {
  const s = useSeg();
  return (
    <Palco cinema clima="interior" pos={[3.2, 3.6, 9.5]} olha={[0, 0.9, 1]} fov={46} sombras={false}>
      <Mercado avancos={[s * 0.8, 0, s * 0.7]} voce={1} parada={1} />
      <pointLight position={[0, 5, 4]} intensity={20} />
    </Palco>
  );
};

// ===== 1. NÃO É AZAR =====
export const CenaAzar = () => {
  const s = useSeg();
  return (
    <Palco cinema clima="interior" pos={[-2.6, 2.8, 7.4]} olha={[0.2, 1.1, 2.2]} fov={42} sombras={false}>
      <Mercado avancos={[0.8 + s * 0.5, 0, 0.7 + s * 0.4]} voce={1} parada={1} />
      <pointLight position={[0, 5, 4]} intensity={20} />
    </Palco>
  );
};

// ===== 2. TRÊS CAIXAS, vista de cima =====
export const CenaTres = () => {
  const s = useSeg();
  return (
    <Palco cinema clima="interior" pos={[0, 14, 10]} olha={[0, 0, 0]} fov={45} sombras={false}>
      <Mercado avancos={[s * 0.3, s * 0.3, s * 0.3]} voce={1} />
      <pointLight position={[0, 8, 3]} intensity={30} />
    </Palco>
  );
};

// ===== 3. UMA CHANCE EM TRÊS: as filas do lado andam mais =====
export const CenaChance = () => {
  const s = useSeg();
  const tDuas = R('chance', 'L3', 'Dos');
  const lado = lerp(s, tDuas, D('chance'), 0, 2.2);
  return (
    <Palco cinema clima="interior" pos={[0, 14, 10]} olha={[0, 0, 0]} fov={45} sombras={false}>
      <Mercado avancos={[1.2 + lado, 1.2 + s * 0.05, 1.2 + lado * 0.9]} voce={1} />
      {/* destaque de cor no chão de cada fila */}
      {[-3, 0, 3].map((x, i) => (
        <B key={x} tam={[1.1, 0.12, 6]} pos={[x, -0.02, 1.5]} cor={i === 1 ? '#ffcc00' : '#3ddc84'} op={0.35} />
      ))}
      <pointLight position={[0, 8, 3]} intensity={30} />
    </Palco>
  );
};

// ===== 4. IMPREVISTOS: senha, produto sem código, moedas =====
export const CenaImprevisto = () => {
  const s = useSeg();
  const frame = useCurrentFrame();
  const tCodigo = R('imprevisto', 'L4', 'código');
  const tMoeda = R('imprevisto', 'L4', 'monedas');
  return (
    <Palco cinema clima="interior" pos={[3.6, 2.3, 0.6]} olha={[-0.2, 1.0, -1.8]} fov={46} sombras={false}>
      <Piso />
      <Caixa x={-0.6} />
      <Fila x={0} n={6} avanco={0} comVoce={3} parada primeiroProblema />
      {/* produto sem código na esteira */}
      {s > tCodigo - 0.3 && (
        <group position={[0, 1.05, -2.6]}>
          <B tam={[0.35, 0.35, 0.35]} cor="#e63946" />
          <B tam={[0.36, 0.08, 0.2]} pos={[0, 0, 0.1]} cor="#f2f2f2" />
          <B tam={[0.4, 0.4, 0.02]} pos={[0, 0.35, 0]} cor="#ffcc00" emi={0.4} />
        </group>
      )}
      {/* moedas rolando no chão */}
      {s > tMoeda - 0.2 &&
        Array.from({length: 6}, (_, i) => {
          const t = Math.min(1, (s - tMoeda + 0.2) * 0.8 + i * 0.03);
          return (
            <mesh key={i} position={[0.3 + i * 0.25 * t, 0.06, -1 + t * (1 + i * 0.4)]} rotation={[frame * 0.3 + i, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.07, 0.07, 0.02, 14]} />
              <meshStandardMaterial color="#d4a017" metalness={0.9} roughness={0.2} />
            </mesh>
          );
        })}
      <pointLight position={[0, 4, 2]} intensity={16} />
    </Palco>
  );
};

// ===== 5. SUA FILA TRAVADA, AS OUTRAS ANDANDO =====
export const CenaTrava = () => {
  const s = useSeg();
  return (
    <Palco cinema clima="interior" pos={[0, 14, 10]} olha={[0, 0, 0]} fov={45} sombras={false}>
      <Mercado avancos={[2.5 + s * 0.6, 1.2, 2.3 + s * 0.6]} voce={1} parada={1} problema={1} />
      <B tam={[1.1, 0.12, 6]} pos={[0, -0.02, 1.5]} cor="#e10600" op={0.35} />
      <pointLight position={[0, 8, 3]} intensity={30} />
    </Palco>
  );
};

// ===== 6. O CÉREBRO: lembra só da fila parada =====
export const CenaCerebro = () => {
  const s = useSeg();
  const tPara = R('cerebro', 'L6', 'detiene');
  const grande = lerp(s, tPara, tPara + 0.6, 0.4, 1.3, Easing.out(Easing.back(2)));
  const pequeno = lerp(s, 0.5, 1.5, 0.2, 0.5);
  return (
    <Palco cinema clima="estudio" pos={[0, 1.9, 8.5]} olha={[0, 1.7, 0]} fov={45} sombras={false}>
      {/* cérebro de blocos */}
      <group position={[-1.2, 1.4, 0]}>
        {[
          [0, 0, 0, 1.2],
          [0.5, 0.25, 0.1, 0.9],
          [-0.5, 0.2, 0.1, 0.95],
          [0.1, 0.55, 0.1, 0.8],
          [0, -0.35, 0.2, 0.8],
        ].map(([x, y, z, k], i) => (
          <mesh key={i} position={[x, y, z]} scale={k}>
            <icosahedronGeometry args={[0.6, 1]} />
            <meshStandardMaterial color="#ff8fb1" roughness={0.5} flatShading />
          </mesh>
        ))}
      </group>
      {/* memória pequena: fila andando (verde) */}
      <group position={[1.4, 0.9, 0]} scale={pequeno}>
        <B tam={[1.6, 1, 0.1]} cor="#3ddc84" emi={0.3} />
        <B tam={[1.2, 0.15, 0.12]} pos={[0, 0, 0.02]} cor="#fff" />
      </group>
      {/* memória gigante: fila parada (vermelha) */}
      {s > tPara - 0.2 && (
        <group position={[1.4, 2.4, 0.2]} scale={grande}>
          <B tam={[2, 1.2, 0.1]} cor="#e10600" emi={0.3} />
          <B tam={[0.2, 0.8, 0.12]} pos={[-0.25, 0, 0.02]} cor="#fff" />
          <B tam={[0.2, 0.8, 0.12]} pos={[0.25, 0, 0.02]} cor="#fff" />
        </group>
      )}
    </Palco>
  );
};

// ===== 7. FILA ÚNICA em zigue-zague com fitas =====
const Pedestal = ({pos}: {pos: V3}) => (
  <group position={pos}>
    <B tam={[0.08, 0.9, 0.08]} pos={[0, 0.45, 0]} cor="#c9a227" metal={0.8} />
    <B tam={[0.3, 0.04, 0.3]} pos={[0, 0.02, 0]} cor="#555" metal={0.6} />
  </group>
);

const FilaUnica = ({avanco}: {avanco: number}) => {
  // caminho em zigue-zague: 4 corredores de 5 lugares
  const lugar = (k: number): V3 => {
    const linha = Math.floor(k / 5);
    const col = k % 5;
    const x = linha % 2 === 0 ? -2 + col * 1 : 2 - col * 1;
    return [x, 0, 2.2 - linha * 1.1];
  };
  return (
    <group>
      {/* pedestais e fitas entre os corredores */}
      {[-0.55, 0.55, 1.65].map((z, r) => (
        <group key={z}>
          {[-2.4, -1.2, 0, 1.2, 2.4].map((x) => (
            <Pedestal key={x} pos={[x, 0, 2.2 - r * 1.1 - 0.55]} />
          ))}
          <B tam={[4.8, 0.06, 0.02]} pos={[r % 2 === 0 ? 0.6 : -0.6, 0.85, 2.2 - r * 1.1 - 0.55]} cor="#1f5fa8" />
        </group>
      ))}
      {Array.from({length: 14}, (_, i) => {
        const k = i + Math.floor(avanco);
        const frac = avanco % 1;
        const a = lugar(Math.max(0, 19 - k));
        const b = lugar(Math.max(0, 19 - k - 1));
        const p: V3 = [a[0] + (b[0] - a[0]) * frac, 0, a[2] + (b[2] - a[2]) * frac];
        if (19 - k < 0) return null;
        const voce = i === 9;
        return (
          <Bloquinho
            key={i}
            posicao={p}
            rotacaoY={Math.PI}
            camisa={voce ? '#ffcc00' : CORES[i % CORES.length]}
            calca={voce ? '#1f5fa8' : '#2b2b3a'}
            chapeu="cabelo"
            corChapeu={voce ? '#2a1d14' : ['#1a1a1a', '#8a5a2b', '#d9c38a'][i % 3]}
            pose={frac > 0.05 && frac < 0.95 ? 'andar' : 'parado'}
            expressao="feliz"
            escala={0.62}
            fase={i}
          />
        );
      })}
    </group>
  );
};

export const CenaUnica = () => {
  const s = useSeg();
  const tLivre = R('unica', 'L7', 'libre');
  return (
    <Palco cinema clima="interior" pos={[0, 8, 9]} olha={[0, 0.5, -0.5]} fov={45} sombras={false}>
      <Piso />
      {[-3.2, -1.1, 1.1, 3.2].map((x, i) => (
        <Caixa key={x} x={x - 0.6} livre={s > tLivre - 0.3 && i === 1} />
      ))}
      <FilaUnica avanco={lerp(s, 0.5, D('unica'), 0, 3, Easing.linear)} />
      <group position={[0, 2.6, -1.4]}>
        <B tam={[2.4, 0.6, 0.1]} cor="#1f5fa8" />
        <B tam={[1.8, 0.25, 0.12]} pos={[0, 0, 0.02]} cor="#ffffff" emi={0.4} />
      </group>
      <pointLight position={[0, 8, 3]} intensity={30} />
    </Palco>
  );
};

// ===== 8. MAIS JUSTO: balança equilibrada =====
export const CenaJusto = () => {
  const s = useSeg();
  const equil = lerp(s, 0.3, 1.8, 0.35, 0, Easing.out(Easing.back(1.5)));
  return (
    <Palco cinema clima="estudio" pos={[0, 2.1, 8.5]} olha={[0, 1.7, 0]} fov={45} sombras={false}>
      <B tam={[0.15, 2.4, 0.15]} pos={[0, 1.2, 0]} cor="#c9a227" metal={0.8} />
      <B tam={[1, 0.1, 1]} pos={[0, 0.05, 0]} cor="#8a6a2a" metal={0.6} />
      <group position={[0, 2.4, 0]} rotation={[0, 0, equil]}>
        <B tam={[3.2, 0.1, 0.1]} cor="#c9a227" metal={0.8} />
        {[-1.5, 1.5].map((x) => (
          <group key={x} position={[x, -0.6, 0]} rotation={[0, 0, -equil]}>
            <B tam={[0.03, 0.6, 0.03]} pos={[0, 0.3, 0]} cor="#888" />
            <B tam={[0.9, 0.06, 0.9]} cor="#c9a227" metal={0.8} />
            <Bloquinho posicao={[0, 0.03, 0]} escala={0.38} camisa={x < 0 ? '#e63946' : '#457b9d'} chapeu="cabelo" corChapeu="#1a1a1a" pose="comemorar" expressao="feliz" />
          </group>
        ))}
      </group>
    </Palco>
  );
};

// ===== 9. FICA A DICA =====
export const CenaDica = () => {
  const s = useSeg();
  return (
    <Palco cinema clima="interior" pos={[0, 1.9, 4.5]} olha={[0, 1.3, 0]} fov={44} sombras={false}>
      <Piso />
      <Bloquinho camisa="#ffcc00" calca="#1f5fa8" chapeu="cabelo" corChapeu="#2a1d14" pose={s > 1.2 ? 'apontar' : 'acenar'} expressao="feliz" />
    </Palco>
  );
};

// ===== 10. MANDA PRA ELE: o apressado trocando de fila =====
export const CenaManda = () => {
  const s = useSeg();
  const pula = Math.floor(s / 0.9) % 3;
  const t = (s % 0.9) / 0.9;
  const xs = [-3, 0, 3];
  const x = xs[pula] + (xs[(pula + 1) % 3] - xs[pula]) * Math.min(1, t * 1.6);
  return (
    <Palco cinema clima="interior" pos={[0, 6, 9]} olha={[0, 0.5, 0]} fov={45} sombras={false}>
      <Mercado avancos={[1, 1, 1]} voce={-1} />
      <Bloquinho posicao={[x, Math.sin(Math.min(1, t * 1.6) * Math.PI) * 0.8, 2.6]} rotacaoY={Math.PI} camisa="#3ddc84" calca="#1a1a1a" chapeu="cabelo" corChapeu="#1a1a1a" pose="andar" expressao="assustado" escala={0.72} />
      <pointLight position={[0, 8, 3]} intensity={30} />
    </Palco>
  );
};
