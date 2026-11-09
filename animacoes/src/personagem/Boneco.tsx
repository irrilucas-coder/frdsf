import {useMemo} from 'react';
import {useCurrentFrame} from 'remotion';
import {angulosDaPose, EmoteIcone, misturaCor, NumeroCamisa, type Angulos, type Emote, type Expressao, type Pose} from '../submarino/Bloquinho';

// Personagem low-poly (cabeça grande facetada, membros finos, ombros bufantes, sem contorno).
// Altura ~2 unidades com os pés em y=0. Usa as mesmas poses, expressões e ícones do Bloquinho.
type V3 = [number, number, number];
export type CabeloBoneco = 'tigela' | 'curto' | 'careca' | 'coque' | 'rabo' | 'cacheado' | 'franja' | 'comprido';
export type ChapeuBoneco = 'nenhum' | 'capacete' | 'bone' | 'gorro';
export type Tronco = 'normal' | 'gordinho' | 'magro' | 'forte';

type Props = {
  posicao?: V3;
  rotacaoY?: number;
  escala?: number;
  pele?: string;
  camisa?: string;
  manga?: string;
  bermuda?: string;
  pernas?: string; // cor das pernas abaixo da bermuda (pele, meia, calça)
  sapato?: string;
  cabelo?: CabeloBoneco;
  corCabelo?: string;
  chapeu?: ChapeuBoneco;
  corChapeu?: string;
  tronco?: Tronco;
  vestido?: boolean; // saia/vestido no lugar da bermuda
  barba?: boolean;
  bigode?: boolean;
  oculos?: boolean;
  pose?: Pose;
  poseDe?: Pose;
  mistura?: number;
  expressao?: Expressao;
  falando?: boolean;
  olhar?: [number, number];
  emote?: Emote;
  emoteK?: number;
  estica?: number;
  cabecaGiro?: V3;
  velocidade?: number;
  fase?: number;
  alvoMaoE?: V3;
  alvoMaoD?: V3;
  suor?: boolean;
  sombraChao?: boolean; // sombra suave no chão (desligue quando o boneco não estiver em pé no chão)
  numero?: string; // número no peito e nas costas (macacão de competição)
  viseira?: string; // viseira colorida sobre os olhos
  microfone?: boolean; // microfone na mão direita (use com alvoMaoD perto da boca)
};

// Material facetado (low-poly)
const M = ({cor, emi = 0, rug = 0.75}: {cor: string; emi?: number; rug?: number}) => (
  <meshStandardMaterial color={cor} flatShading roughness={rug} emissive={emi ? cor : '#000'} emissiveIntensity={emi} />
);
const Esfera = ({r, pos, esc, cor, seg = 7, emi}: {r: number; pos?: V3; esc?: V3; cor: string; seg?: number; emi?: number}) => (
  <mesh position={pos} scale={esc} castShadow>
    <sphereGeometry args={[r, seg + 2, seg]} />
    <M cor={cor} emi={emi} />
  </mesh>
);
const Cil = ({rt, rb, h, pos, cor, lados = 7, rot}: {rt: number; rb: number; h: number; pos?: V3; cor: string; lados?: number; rot?: V3}) => (
  <mesh position={pos} rotation={rot} castShadow>
    <cylinderGeometry args={[rt, rb, h, lados]} />
    <M cor={cor} />
  </mesh>
);

const TRONCOS: Record<Tronco, {rt: number; rb: number; ombro: number; barriga: number; braco: number}> = {
  normal: {rt: 0.27, rb: 0.23, ombro: 0.33, barriga: 0, braco: 0.055},
  magro: {rt: 0.22, rb: 0.19, ombro: 0.28, barriga: 0, braco: 0.045},
  forte: {rt: 0.34, rb: 0.24, ombro: 0.41, barriga: 0, braco: 0.075},
  gordinho: {rt: 0.29, rb: 0.33, ombro: 0.36, barriga: 0.3, braco: 0.06},
};

export const Boneco = ({
  posicao = [0, 0, 0],
  rotacaoY = 0,
  escala = 1,
  pele = '#f0c49a',
  camisa = '#e8553e',
  manga,
  bermuda = '#2f5fa8',
  pernas,
  sapato = '#3a3f4a',
  cabelo = 'tigela',
  corCabelo = '#3a2618',
  chapeu = 'nenhum',
  corChapeu = '#ffcc33',
  tronco = 'normal',
  vestido = false,
  barba = false,
  bigode = false,
  oculos = false,
  pose = 'parado',
  poseDe,
  mistura = 1,
  expressao = 'feliz',
  falando = false,
  olhar,
  emote,
  emoteK = 1,
  estica = 0,
  cabecaGiro,
  velocidade = 1,
  fase = 0,
  alvoMaoE,
  alvoMaoD,
  suor = false,
  sombraChao = true,
  numero,
  viseira,
  microfone = false,
}: Props) => {
  const frame = useCurrentFrame();
  const t = (frame + fase * 17) * velocidade;
  const T = TRONCOS[tronco];
  const corPerna = pernas ?? pele;

  // ---- poses (mesma biblioteca do Bloquinho) ----
  const A0 = angulosDaPose(poseDe ?? pose, t);
  const A1 = angulosDaPose(pose, t);
  const m0 = poseDe ? Math.max(0, Math.min(1, mistura)) : 1;
  const mm = m0 * m0 * (3 - 2 * m0);
  const L = (k: keyof Angulos) => A0[k] + (A1[k] - A0[k]) * mm;
  const ang = {
    bE: L('bE'), bD: L('bD'), bEz: L('bEz'), bDz: L('bDz'), bEy: L('bEy'), bDy: L('bDy'), cE: L('cE'), cD: L('cD'),
  };
  const ombroY = 1.38;
  const mira = (ombroX: number, alvo: V3) => {
    const dx = alvo[0] - ombroX;
    const dy = alvo[1] - ombroY;
    const dz = alvo[2];
    const n = Math.hypot(dx, dy, dz) || 1;
    return {rx: Math.atan2(-dz / n, -dy / n), rz: Math.asin(Math.max(-1, Math.min(1, dx / n)))};
  };
  if (alvoMaoE) {
    const r = mira(-T.ombro, alvoMaoE);
    ang.bE = r.rx; ang.bEz = r.rz; ang.bEy = 0; ang.cE = 0;
  }
  if (alvoMaoD) {
    const r = mira(T.ombro, alvoMaoD);
    ang.bD = r.rx; ang.bDz = r.rz; ang.bDy = 0; ang.cD = 0;
  }
  const pE = L('pE'), pD = L('pD'), pEz = L('pEz'), pDz = L('pDz'), jE = L('jE'), jD = L('jD');
  const pulo = L('pulo'), inclina = L('inclina'), qY = L('qY'), cabPose = L('cab');
  const respira = Math.sin(t * 0.08) * 0.012;

  // ---- rosto ----
  const ex = expressao;
  const R = 0.4; // raio da cabeça
  const falaAberta = falando && Math.floor(t / 3) % 3 !== 0;
  const piscando = ex !== 'surpreso' && (frame + fase * 31 + 45) % 95 < 3;
  const passo = Math.floor((frame + fase * 23) / 45);
  const ol = olhar ?? (ex === 'pensativo' ? [0.5, 0.7] : [Math.sin(passo * 12.9898) * 0.5, Math.sin(passo * 78.233) * 0.25]);
  const corRosto = ex === 'furioso' ? misturaCor(pele, '#ff3b30', 0.35) : ex === 'nojo' ? misturaCor(pele, '#8bc34a', 0.25) : pele;
  const tremor = ex === 'furioso' ? Math.sin(frame * 2.3) * 0.01 : 0;
  const riso = ex === 'rindo' ? Math.abs(Math.sin(t * 0.7)) : 0;
  const giro: V3 = [
    (cabecaGiro?.[0] ?? 0) + cabPose + (falando ? Math.sin(t * 0.35) * 0.05 : 0) - riso * 0.12,
    cabecaGiro?.[1] ?? 0,
    (cabecaGiro?.[2] ?? 0) + (ex === 'pensativo' ? 0.16 : ex === 'confiante' ? -0.08 : 0),
  ];
  const olhoAlt = piscando ? 0.012 : ex === 'surpreso' || ex === 'assustado' ? 0.105 : ex === 'cansado' ? 0.045 : ex === 'rindo' ? 0.02 : 0.085;
  const sobAng = ex === 'furioso' ? 0.55 : ex === 'bravo' || ex === 'serio' ? 0.32 : ex === 'triste' || ex === 'emocionado' ? -0.35 : ex === 'confiante' ? 0.15 : 0;
  const sobY = ex === 'surpreso' || ex === 'assustado' ? 0.2 : ex === 'furioso' ? 0.12 : 0.155;
  const zf = R * 0.9;

  // boca: sorriso (arco), aberta (oval escura), reta, triste (arco invertido)
  const boca = useMemo(() => {
    if (ex === 'rindo' || ex === 'surpreso' || ex === 'assustado' || falaAberta) return 'aberta';
    if (ex === 'triste' || ex === 'emocionado' || ex === 'nojo') return 'triste';
    if (ex === 'serio' || ex === 'bravo' || ex === 'cansado' || ex === 'pensativo') return 'reta';
    if (ex === 'furioso') return 'dentes';
    return 'sorriso';
  }, [ex, falaAberta]);
  const bocaAbAlt = ex === 'rindo' ? 0.07 + riso * 0.02 : ex === 'surpreso' ? 0.075 : ex === 'assustado' ? 0.06 : 0.045;
  const bocaAbLarg = ex === 'rindo' ? 0.12 : ex === 'surpreso' ? 0.05 : 0.07;

  const esY = 1 + estica * 0.22;
  const esXZ = 1 - estica * 0.12;

  const Braco = ({lado}: {lado: 1 | -1}) => {
    const e = lado < 0;
    return (
      <group position={[lado * T.ombro, ombroY, 0]} rotation={[e ? ang.bE : ang.bD, 0, e ? ang.bEz : ang.bDz]}>
        <group rotation={[0, e ? ang.bEy : ang.bDy, 0]}>
          {/* manga bufante */}
          <Esfera r={0.11 + T.braco * 0.6} pos={[0, -0.04, 0]} esc={[1, 1.05, 1]} cor={manga ?? camisa} seg={6} />
          <Cil rt={T.braco} rb={T.braco * 0.9} h={0.32} pos={[0, -0.19, 0]} cor={pele} />
          <group position={[0, -0.34, 0]} rotation={[e ? ang.cE : ang.cD, 0, 0]}>
            <Esfera r={T.braco * 1.02} cor={pele} seg={5} />
            <Cil rt={T.braco * 0.9} rb={T.braco * 0.8} h={0.28} pos={[0, -0.14, 0]} cor={pele} />
            <Esfera r={0.075} pos={[0, -0.31, 0.01]} esc={[0.85, 1.1, 0.75]} cor={pele} seg={5} />
            {microfone && !e && (
              <group position={[0, -0.36, 0.04]}>
                <Cil rt={0.022} rb={0.028} h={0.2} pos={[0, -0.06, 0]} cor="#1a1a1a" />
                <Esfera r={0.055} pos={[0, -0.18, 0]} cor="#9aa0a8" seg={6} />
              </group>
            )}
          </group>
        </group>
      </group>
    );
  };
  const Perna = ({lado}: {lado: 1 | -1}) => {
    const e = lado < 0;
    return (
      <group position={[lado * 0.12, 0.72, 0]} rotation={[e ? pE : pD, 0, e ? pEz : pDz]}>
        {!vestido && <Cil rt={0.135} rb={0.125} h={0.24} pos={[0, -0.09, 0]} cor={bermuda} lados={7} />}
        <Cil rt={0.062} rb={0.056} h={0.2} pos={[0, -0.26, 0]} cor={vestido ? pele : corPerna} />
        <group position={[0, -0.36, 0]} rotation={[e ? jE : jD, 0, 0]}>
          <Esfera r={0.058} cor={corPerna} seg={5} />
          <Cil rt={0.056} rb={0.05} h={0.28} pos={[0, -0.14, 0]} cor={corPerna} />
          {/* sapato arredondado */}
          <Esfera r={0.1} pos={[0, -0.31, 0.05]} esc={[0.85, 0.5, 1.45]} cor={sapato} seg={6} />
        </group>
      </group>
    );
  };

  return (
    <group position={[posicao[0], posicao[1] + pulo, posicao[2]]} rotation={[0, rotacaoY, 0]} scale={[escala * esXZ, escala * esY, escala * esXZ]}>
      {sombraChao && (
        <mesh position={[0, 0.012 - pulo, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={1 - Math.min(0.5, pulo)}>
          <circleGeometry args={[0.42, 20]} />
          <meshBasicMaterial color="#000000" transparent opacity={0.22} depthWrite={false} />
        </mesh>
      )}
      <group rotation={[inclina, qY, 0]}>
        <Perna lado={-1} />
        <Perna lado={1} />
        {/* quadril / saia */}
        {vestido ? (
          <Cil rt={T.rb * 0.95} rb={0.36} h={0.42} pos={[0, 0.66, 0]} cor={bermuda} lados={8} />
        ) : (
          <Cil rt={T.rb} rb={0.24} h={0.16} pos={[0, 0.78, 0]} cor={bermuda} lados={8} />
        )}
        {/* tronco afunilado */}
        <group position={[0, 1.1 + respira, 0]}>
          <Cil rt={T.rt} rb={T.rb} h={0.58} cor={camisa} lados={8} />
          {T.barriga > 0 && <Esfera r={T.barriga} pos={[0, -0.08, 0.08]} esc={[1, 0.85, 0.9]} cor={camisa} seg={7} />}
          <Esfera r={T.rt} pos={[0, 0.27, 0]} esc={[1.05, 0.38, 0.85]} cor={camisa} seg={7} />
          {numero && (
            <>
              {/* placa branca com número, frente e costas */}
              <mesh position={[0, 0.06, (T.rt + T.rb) / 2 + 0.005]}>
                <boxGeometry args={[0.26, 0.2, 0.01]} />
                <meshStandardMaterial color="#ffffff" />
              </mesh>
              <NumeroCamisa texto={numero} cor="#111111" pos={[0, 0.06, (T.rt + T.rb) / 2 + 0.014]} rot={0} tam={0.13} />
              <mesh position={[0, 0.06, -(T.rt + T.rb) / 2 - 0.005]}>
                <boxGeometry args={[0.34, 0.28, 0.01]} />
                <meshStandardMaterial color="#ffffff" />
              </mesh>
              <NumeroCamisa texto={numero} cor="#111111" pos={[0, 0.06, -(T.rt + T.rb) / 2 - 0.014]} rot={Math.PI} tam={0.19} />
            </>
          )}
        </group>
        <Braco lado={-1} />
        <Braco lado={1} />
        <Cil rt={0.06} rb={0.07} h={0.14} pos={[0, 1.46 + respira, 0]} cor={pele} />
        {/* ---- cabeça ---- */}
        <group position={[tremor, 1.5 + respira, 0]} rotation={giro}>
          <group position={[0, R * 0.92, 0]}>
            <Esfera r={R} esc={[1, 1.02, 0.95]} cor={corRosto} seg={8} />
            {/* orelhas */}
            {[-1, 1].map((l) => (
              <Esfera key={l} r={0.075} pos={[l * R * 0.97, -0.02, 0]} esc={[0.5, 1, 0.8]} cor={corRosto} seg={5} />
            ))}
            {/* olhos pretos ovais com brilho */}
            {[-1, 1].map((l) => (
              <group key={l} position={[l * 0.13 + ol[0] * 0.018, 0.04 + ol[1] * 0.015, zf]}>
                <mesh scale={[0.055, olhoAlt, 0.03]}>
                  <sphereGeometry args={[1, 10, 8]} />
                  <meshStandardMaterial color="#141414" roughness={0.3} />
                </mesh>
                {!piscando && ex !== 'rindo' && (
                  <mesh position={[0.018, olhoAlt * 0.35, 0.028]}>
                    <sphereGeometry args={[0.016, 6, 5]} />
                    <meshBasicMaterial color="#ffffff" />
                  </mesh>
                )}
              </group>
            ))}
            {/* sobrancelhas */}
            {[-1, 1].map((l) => (
              <mesh key={l} position={[l * 0.13, sobY + (ex === 'pensativo' && l > 0 ? 0.04 : 0) + riso * 0.02, zf - 0.005]} rotation={[-0.25, 0, l * sobAng]}>
                <boxGeometry args={[0.1, ex === 'furioso' ? 0.035 : 0.022, 0.03]} />
                <meshStandardMaterial color={corCabelo} />
              </mesh>
            ))}
            {/* nariz */}
            <Esfera r={0.045} pos={[0, -0.04, R * 0.97]} esc={[1, 0.9, 0.8]} cor={misturaCor(corRosto, '#c87a5a', 0.15)} seg={5} />
            {/* bochechas */}
            {(ex === 'feliz' || ex === 'rindo' || ex === 'confiante' || ex === 'emocionado') &&
              [-1, 1].map((l) => (
                <mesh key={l} position={[l * 0.22, -0.06, R * 0.84]} rotation={[0, l * 0.5, 0]}>
                  <circleGeometry args={[0.05, 10]} />
                  <meshBasicMaterial color="#ff8f8f" transparent opacity={0.7} />
                </mesh>
              ))}
            {/* boca */}
            <group position={[ex === 'pensativo' ? 0.04 : 0, -0.14, R * 0.9]}>
              {boca === 'sorriso' && (
                <mesh rotation={[0, 0, Math.PI]} position={[0, 0.04, 0]}>
                  <torusGeometry args={[0.065, 0.014, 6, 14, Math.PI]} />
                  <meshStandardMaterial color="#5a1f1f" />
                </mesh>
              )}
              {boca === 'triste' && (
                <mesh position={[0, -0.03, 0]}>
                  <torusGeometry args={[0.055, 0.013, 6, 14, Math.PI]} />
                  <meshStandardMaterial color="#5a1f1f" />
                </mesh>
              )}
              {boca === 'reta' && (
                <mesh>
                  <boxGeometry args={[0.09, 0.018, 0.02]} />
                  <meshStandardMaterial color="#5a1f1f" />
                </mesh>
              )}
              {boca === 'aberta' && (
                <>
                  <mesh scale={[bocaAbLarg, bocaAbAlt, 0.03]}>
                    <sphereGeometry args={[1, 12, 8]} />
                    <meshStandardMaterial color="#4a1515" />
                  </mesh>
                  {ex === 'rindo' && (
                    <mesh position={[0, -bocaAbAlt * 0.45, 0.012]} scale={[bocaAbLarg * 0.6, bocaAbAlt * 0.4, 0.025]}>
                      <sphereGeometry args={[1, 10, 6]} />
                      <meshStandardMaterial color="#e86a7a" />
                    </mesh>
                  )}
                </>
              )}
              {boca === 'dentes' && (
                <>
                  <mesh scale={[0.1, 0.045, 0.03]}>
                    <sphereGeometry args={[1, 12, 8]} />
                    <meshStandardMaterial color="#4a1515" />
                  </mesh>
                  <mesh position={[0, 0, 0.02]}>
                    <boxGeometry args={[0.15, 0.03, 0.01]} />
                    <meshStandardMaterial color="#ffffff" />
                  </mesh>
                </>
              )}
            </group>
            {bigode && <Esfera r={0.06} pos={[0, -0.09, R * 0.95]} esc={[1.6, 0.45, 0.6]} cor={corCabelo} seg={5} />}
            {barba && <Esfera r={R * 0.75} pos={[0, -0.2, 0.12]} esc={[1.05, 0.55, 0.85]} cor={corCabelo} seg={7} />}
            {oculos &&
              [-1, 1].map((l) => (
                <mesh key={l} position={[l * 0.13, 0.04, zf + 0.04]}>
                  <torusGeometry args={[0.075, 0.012, 6, 16]} />
                  <meshStandardMaterial color="#222" />
                </mesh>
              ))}
            {suor && <Esfera r={0.04} pos={[R * 0.8, 0.15 - ((frame % 20) / 20) * 0.3, 0.2]} esc={[0.7, 1.1, 0.7]} cor="#8fd3ff" seg={6} />}
            {ex === 'emocionado' &&
              [-1, 1].map((l, i) => <Esfera key={l} r={0.03} pos={[l * 0.13, -0.04 - (((frame + i * 13) % 26) / 26) * 0.25, zf + 0.02]} esc={[0.7, 1.1, 0.7]} cor="#8fd3ff" seg={6} />)}
            <CabeloLowPoly estilo={cabelo} cor={corCabelo} R={R} />
            {viseira && (
              <mesh position={[0, 0.05, 0.05]} rotation={[-0.05, 0, 0]}>
                <cylinderGeometry args={[R * 1.02, R * 1.02, 0.14, 16, 1, true, -1.2, 2.4]} />
                <meshStandardMaterial color={viseira} transparent opacity={0.85} emissive={viseira} emissiveIntensity={0.35} side={2} roughness={0.2} metalness={0.3} />
              </mesh>
            )}
            {chapeu !== 'nenhum' && <ChapeuLowPoly tipo={chapeu} cor={corChapeu} R={R} />}
            {(emote || ex === 'furioso') && <EmoteIcone tipo={emote ?? 'raiva'} k={emoteK} y={R + 0.35} frame={frame} />}
          </group>
        </group>
      </group>
    </group>
  );
};

// Calota de esfera (cabelo / chapéu)
const Calota = ({r, ang = 0.55, pos, rot, esc, cor, seg = 9}: {r: number; ang?: number; pos?: V3; rot?: V3; esc?: V3; cor: string; seg?: number}) => (
  <mesh position={pos} rotation={rot} scale={esc} castShadow>
    <sphereGeometry args={[r, seg, Math.max(4, Math.round(seg * 0.6)), 0, Math.PI * 2, 0, Math.PI * ang]} />
    <meshStandardMaterial color={cor} flatShading roughness={0.8} side={2} />
  </mesh>
);

const CabeloLowPoly = ({estilo, cor, R}: {estilo: CabeloBoneco; cor: string; R: number}) => {
  if (estilo === 'careca') return null;
  if (estilo === 'tigela')
    return (
      <>
        <Calota r={R * 1.06} ang={0.46} pos={[0, 0.04, -0.03]} rot={[-0.32, 0, 0]} cor={cor} />
        <Esfera r={R * 0.5} pos={[0, R * 0.68, R * 0.5]} esc={[1.3, 0.3, 0.5]} cor={cor} seg={6} />
      </>
    );
  if (estilo === 'curto') return <Calota r={R * 1.04} ang={0.4} pos={[0, 0.03, -0.02]} rot={[-0.3, 0, 0]} cor={cor} />;
  if (estilo === 'franja')
    return (
      <>
        <Calota r={R * 1.06} ang={0.5} pos={[0, 0.02, -0.02]} rot={[-0.2, 0, 0]} cor={cor} />
        <Esfera r={R * 0.45} pos={[-R * 0.25, R * 0.5, R * 0.62]} esc={[1.4, 0.4, 0.45]} cor={cor} seg={6} />
      </>
    );
  if (estilo === 'coque')
    return (
      <>
        <Calota r={R * 1.05} ang={0.5} pos={[0, 0.02, -0.02]} rot={[-0.15, 0, 0]} cor={cor} />
        <Esfera r={R * 0.38} pos={[0, R * 1.05, -R * 0.15]} cor={cor} seg={7} />
      </>
    );
  if (estilo === 'rabo')
    return (
      <>
        <Calota r={R * 1.05} ang={0.52} pos={[0, 0.02, -0.02]} rot={[-0.15, 0, 0]} cor={cor} />
        <Esfera r={R * 0.3} pos={[0, -R * 0.1, -R * 1.1]} esc={[0.8, 1.6, 0.8]} cor={cor} seg={6} />
      </>
    );
  if (estilo === 'cacheado')
    return (
      <>
        {Array.from({length: 11}, (_, i) => {
          const a = (i / 11) * Math.PI * 2;
          return <Esfera key={i} r={R * 0.34} pos={[Math.cos(a) * R * 0.78, R * 0.55 + Math.sin(i * 1.7) * 0.04, Math.sin(a) * R * 0.7 - 0.05]} cor={cor} seg={5} />;
        })}
        <Esfera r={R * 0.8} pos={[0, R * 0.62, -0.05]} esc={[1, 0.6, 1]} cor={cor} seg={6} />
      </>
    );
  if (estilo === 'comprido')
    return (
      <>
        <Calota r={R * 1.07} ang={0.55} pos={[0, 0.02, -0.02]} rot={[-0.15, 0, 0]} cor={cor} />
        <Cil rt={R * 0.95} rb={R * 1.05} h={R * 1.4} pos={[0, -R * 0.45, -R * 0.3]} cor={cor} lados={9} />
      </>
    );
  return null;
};

const ChapeuLowPoly = ({tipo, cor, R}: {tipo: ChapeuBoneco; cor: string; R: number}) => {
  if (tipo === 'capacete')
    return (
      <>
        <Calota r={R * 1.12} ang={0.5} pos={[0, 0.06, 0]} cor={cor} />
        <Cil rt={R * 1.2} rb={R * 1.25} h={0.04} pos={[0, 0.1, 0.03]} cor={cor} lados={12} />
      </>
    );
  if (tipo === 'bone')
    return (
      <>
        <Calota r={R * 1.03} ang={0.36} pos={[0, 0.1, -0.02]} cor={cor} />
        <mesh position={[0, R * 0.55, R * 0.82]} rotation={[0.2, 0, 0]}>
          <boxGeometry args={[R * 1.1, 0.035, R * 0.7]} />
          <meshStandardMaterial color={cor} flatShading />
        </mesh>
      </>
    );
  if (tipo === 'gorro')
    return (
      <>
        <Calota r={R * 1.1} ang={0.48} pos={[0, 0.05, 0]} cor={cor} />
        <Esfera r={R * 0.22} pos={[0, R * 1.18, 0]} cor="#ffffff" seg={6} />
      </>
    );
  return null;
};
