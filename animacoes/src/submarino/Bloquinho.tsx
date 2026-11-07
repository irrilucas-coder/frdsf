import {createContext, useContext} from 'react';
import {BackSide, BufferGeometry, BoxGeometry} from 'three';
import {RoundedBoxGeometry} from 'three-stdlib';
import {useCurrentFrame} from 'remotion';

// Quando ligado (Palco com cinema), as peças dos personagens ganham contorno preto estilo desenho.
export const ContornoCtx = createContext(false);

export type Pose =
  | 'parado' | 'andar' | 'remar' | 'manivela' | 'acenar' | 'comemorar' | 'apontar' | 'susto'
  | 'siu' | 'chutar' | 'bracosCruzados' | 'correr' | 'sentado';
export type Chapeu = 'nenhum' | 'cartola' | 'coco' | 'coroa' | 'tricornio' | 'cabelo';
export type Expressao = 'feliz' | 'assustado' | 'cansado' | 'serio' | 'bravo' | 'triste' | 'emocionado';
// Variações de formato (para os personagens não ficarem todos iguais)
export type Corpo = 'padrao' | 'magro' | 'forte' | 'gordinho';
export type Cabeca = 'quadrada' | 'redonda' | 'oval' | 'larga';
export type Cabelo = 'nenhum' | 'liso' | 'topete' | 'black' | 'lateral' | 'moicano' | 'comprido' | 'rabo';
export type Barba = 'nenhuma' | 'curta' | 'cavanhaque' | 'cheia';

type V3 = [number, number, number];
type Props = {
  posicao?: V3;
  rotacaoY?: number;
  escala?: number;
  pele?: string;
  camisa?: string;
  calca?: string;
  sapato?: string;
  chapeu?: Chapeu;
  corChapeu?: string;
  capa?: string;
  bigode?: boolean;
  faixa?: string[]; // faixa presidencial (cores de cima pra baixo)
  gravata?: string;
  colete?: string; // colete/uniforme por cima da camisa
  capacete?: string;
  pose?: Pose;
  expressao?: Expressao;
  falando?: boolean;
  suor?: boolean;
  velocidade?: number; // multiplica a velocidade da pose
  fase?: number; // desencontra personagens iguais
  // Se definidos, os braços apontam para esses pontos (coordenadas locais do boneco): mãos segurando objetos
  alvoMaoE?: V3;
  alvoMaoD?: V3;
  // ---- formato ----
  corpo?: Corpo;
  cabeca?: Cabeca;
  cabelo?: Cabelo; // estilo de cabelo (independe do chapéu)
  corCabelo?: string;
  barba?: Barba;
  corBarba?: string;
  olhos?: 'pontos' | 'grandes';
  nariz?: boolean;
  arredondado?: boolean; // cantos arredondados (visual mais moderno)
  numero?: string; // número nas costas/frente da camisa
  corNumero?: string;
  manga?: string; // cor diferente na manga (detalhe de uniforme)
  meia?: string; // meião (canela com outra cor: uniforme de futebol)
};

// Geometrias em cache (arredondar cada peça a cada quadro custaria caro)
const CACHE = new Map<string, BufferGeometry>();
const geo = (w: number, h: number, d: number, r: number) => {
  const k = `${w.toFixed(3)}|${h.toFixed(3)}|${d.toFixed(3)}|${r.toFixed(3)}`;
  let g = CACHE.get(k);
  if (!g) {
    g = r > 0 ? new RoundedBoxGeometry(w, h, d, 3, Math.min(r, Math.min(w, h, d) / 2 - 0.001)) : new BoxGeometry(w, h, d);
    CACHE.set(k, g);
  }
  return g;
};

const ArredCtx = createContext(true);

const Caixa = ({
  tam,
  pos = [0, 0, 0],
  rot,
  cor,
  sombra = true,
  emissivo,
  raio,
}: {
  tam: V3;
  pos?: V3;
  rot?: V3;
  cor: string;
  sombra?: boolean;
  emissivo?: number;
  raio?: number; // sobrescreve o arredondamento automático
}) => {
  const contorno = useContext(ContornoCtx);
  const arred = useContext(ArredCtx);
  const borda = 0.045;
  // detalhes pequenos (olhos, boca) ficam retos; peças do corpo arredondam
  const r = raio ?? (arred && sombra ? Math.min(...tam) * 0.22 : 0);
  const g = geo(tam[0], tam[1], tam[2], r);
  return (
    <group position={pos} rotation={rot}>
      {contorno && sombra && (
        <mesh geometry={g} scale={[(tam[0] + borda) / tam[0], (tam[1] + borda) / tam[1], (tam[2] + borda) / tam[2]]}>
          <meshBasicMaterial color="#141414" side={BackSide} />
        </mesh>
      )}
      <mesh geometry={g} castShadow={sombra}>
        <meshStandardMaterial color={cor} roughness={0.7} emissive={emissivo ? cor : '#000000'} emissiveIntensity={emissivo ?? 0} />
      </mesh>
    </group>
  );
};

// Medidas de cada tipo de corpo
const CORPOS: Record<Corpo, {tw: number; td: number; ombro: number; bw: number; bd: number; pw: number; pd: number; quadril: number}> = {
  padrao: {tw: 0.72, td: 0.4, ombro: 0.53, bw: 0.32, bd: 0.36, pw: 0.34, pd: 0.38, quadril: 0.18},
  magro: {tw: 0.58, td: 0.32, ombro: 0.44, bw: 0.25, bd: 0.28, pw: 0.27, pd: 0.3, quadril: 0.15},
  forte: {tw: 0.9, td: 0.48, ombro: 0.64, bw: 0.38, bd: 0.42, pw: 0.38, pd: 0.42, quadril: 0.2},
  gordinho: {tw: 0.88, td: 0.6, ombro: 0.6, bw: 0.34, bd: 0.38, pw: 0.38, pd: 0.42, quadril: 0.21},
};
const CABECAS: Record<Cabeca, {w: number; h: number; d: number; r: number}> = {
  quadrada: {w: 0.56, h: 0.56, d: 0.56, r: 0.07},
  redonda: {w: 0.58, h: 0.58, d: 0.58, r: 0.2},
  oval: {w: 0.5, h: 0.64, d: 0.54, r: 0.16},
  larga: {w: 0.66, h: 0.52, d: 0.58, r: 0.1},
};

// Personagem de bloquinhos: pernas, tronco, braços e cabeça.
// Altura total ~2 unidades, com os pés em y=0.
export const Bloquinho = ({
  posicao = [0, 0, 0],
  rotacaoY = 0,
  escala = 1,
  pele = '#f5c99b',
  camisa = '#2f6fdb',
  calca = '#2b2b3a',
  sapato = '#1b1b1f',
  chapeu = 'nenhum',
  corChapeu = '#222222',
  capa,
  bigode = false,
  faixa,
  gravata,
  colete,
  capacete,
  pose = 'parado',
  expressao = 'feliz',
  falando = false,
  suor = false,
  velocidade = 1,
  fase = 0,
  alvoMaoE,
  alvoMaoD,
  corpo = 'padrao',
  cabeca = 'quadrada',
  cabelo,
  corCabelo,
  barba = 'nenhuma',
  corBarba,
  olhos = 'pontos',
  nariz = true,
  arredondado = true,
  numero,
  corNumero = '#ffffff',
  manga,
  meia,
}: Props) => {
  const frame = useCurrentFrame();
  const t = (frame + fase * 17) * velocidade;
  const C = CORPOS[corpo];
  const H = CABECAS[cabeca];
  // "chapeu=cabelo" antigo vira cabelo liso na cor do chapéu
  const estiloCabelo: Cabelo = cabelo ?? (chapeu === 'cabelo' ? 'liso' : 'nenhum');
  const corCab = corCabelo ?? (chapeu === 'cabelo' ? corChapeu : '#2a1d14');
  const corBar = corBarba ?? corCab;

  // Ângulos (radianos) de braço/perna em torno do ombro/quadril, eixo X = para frente/trás
  let bracoE = 0;
  let bracoD = 0;
  let bracoEz = 0.08;
  let bracoDz = -0.08;
  let pernaE = 0;
  let pernaD = 0;
  let pernaEz = 0;
  let pernaDz = 0;
  let pulo = 0;
  let inclina = 0;

  if (pose === 'andar' || pose === 'correr') {
    const k = pose === 'correr' ? 0.5 : 0.3;
    const amp = pose === 'correr' ? 1.1 : 0.7;
    const s = Math.sin(t * k);
    bracoE = s * amp;
    bracoD = -s * amp;
    pernaE = -s * amp * 0.85;
    pernaD = s * amp * 0.85;
    pulo = Math.abs(Math.cos(t * k)) * (pose === 'correr' ? 0.14 : 0.06);
    if (pose === 'correr') inclina = 0.15;
  } else if (pose === 'remar') {
    const s = Math.sin(t * 0.18);
    bracoE = bracoD = -1.2 + s * 0.6;
    inclina = s * 0.18;
  } else if (pose === 'manivela') {
    const a = t * 0.45;
    bracoE = -1.3 + Math.sin(a) * 0.45;
    bracoD = -1.3 + Math.sin(a + Math.PI) * 0.45;
    pernaE = Math.sin(a) * 0.5 - 0.4;
    pernaD = Math.sin(a + Math.PI) * 0.5 - 0.4;
  } else if (pose === 'acenar') {
    bracoD = Math.PI * 0.9;
    bracoDz = -0.4 + Math.sin(t * 0.4) * 0.35;
  } else if (pose === 'comemorar') {
    bracoE = bracoD = Math.PI * 0.95;
    bracoEz = 0.35 + Math.sin(t * 0.5) * 0.15;
    bracoDz = -0.35 - Math.sin(t * 0.5) * 0.15;
    pulo = Math.abs(Math.sin(t * 0.25)) * 0.35;
  } else if (pose === 'apontar') {
    bracoD = -Math.PI / 2;
    bracoE = Math.sin(t * 0.1) * 0.08;
  } else if (pose === 'susto') {
    bracoE = bracoD = Math.PI * 0.75;
    bracoEz = 0.6;
    bracoDz = -0.6;
    pulo = Math.abs(Math.sin(t * 0.9)) * 0.05;
  } else if (pose === 'siu') {
    // comemoração de braços abertos para baixo, pernas afastadas, peito estufado
    bracoE = bracoD = 0.35;
    bracoEz = -0.75;
    bracoDz = 0.75;
    pernaEz = -0.22;
    pernaDz = 0.22;
    inclina = -0.12;
  } else if (pose === 'chutar') {
    // perna direita balança para frente (chute), braços equilibram
    const ciclo = (t % 40) / 40;
    const k = ciclo < 0.35 ? -ciclo / 0.35 : ciclo < 0.55 ? -1 + ((ciclo - 0.35) / 0.2) * 2.4 : 1.4 - ((ciclo - 0.55) / 0.45) * 1.4;
    pernaD = -k * 0.9;
    bracoE = k * 0.5;
    bracoEz = 0.5;
    bracoD = -k * 0.3;
    inclina = -k * 0.08;
  } else if (pose === 'sentado') {
    // coloque o boneco com posicao y ≈ -0.25 para o assento ficar a ~0.55 do chão
    pernaE = pernaD = -Math.PI / 2;
    bracoE = bracoD = -0.55;
  } else if (pose === 'bracosCruzados') {
    bracoE = bracoD = -1.45;
    bracoEz = 1.0;
    bracoDz = -1.0;
  }
  // Braço apontando para um alvo (cinemática simples de 1 junta).
  const mira = (ombroX: number, alvo: V3) => {
    const dx = alvo[0] - ombroX;
    const dy = alvo[1] - 1.55;
    const dz = alvo[2];
    const n = Math.hypot(dx, dy, dz) || 1;
    return {rx: Math.atan2(-dz / n, -dy / n), rz: Math.asin(Math.max(-1, Math.min(1, dx / n)))};
  };
  if (alvoMaoE) {
    const m = mira(-C.ombro, alvoMaoE);
    bracoE = m.rx;
    bracoEz = m.rz;
  }
  if (alvoMaoD) {
    const m = mira(C.ombro, alvoMaoD);
    bracoD = m.rx;
    bracoDz = m.rz;
  }
  const respira = Math.sin(t * 0.08) * 0.015;

  // Rosto
  const bocaAberta = falando && Math.floor(t / 3) % 3 !== 0;
  const alturaBoca = bocaAberta ? 0.1 : expressao === 'assustado' ? 0.08 : 0.035;
  const larguraBoca = expressao === 'assustado' ? 0.12 : bocaAberta ? 0.16 : expressao === 'triste' ? 0.14 : 0.2;
  const olhoAlt = expressao === 'cansado' ? 0.035 : expressao === 'assustado' ? 0.11 : 0.085;
  const piscando = (frame + fase * 31 + 45) % 90 < 3;
  const zf = H.d / 2 + 0.006; // frente do rosto
  const ex = H.w * 0.21; // afastamento dos olhos
  const zBoca = zf + (barba === 'cheia' ? 0.04 : 0);
  const sobAng = expressao === 'bravo' || expressao === 'serio' ? 0.3 : expressao === 'triste' || expressao === 'emocionado' ? -0.3 : 0;
  const sobY = expressao === 'assustado' ? 0.21 : 0.16;

  const Braco = ({lado}: {lado: 1 | -1}) => (
    <group position={[lado * C.ombro, 1.55, 0]} rotation={[lado < 0 ? bracoE : bracoD, 0, lado < 0 ? bracoEz : bracoDz]}>
      <Caixa tam={[C.bw, 0.4, C.bd]} pos={[0, -0.17, 0]} cor={manga ?? camisa} />
      <Caixa tam={[C.bw * 0.94, 0.42, C.bd * 0.94]} pos={[0, -0.47, 0]} cor={manga ? pele : camisa} />
      <Caixa tam={[C.bw * 0.92, 0.16, C.bd * 0.92]} pos={[0, -0.74, 0]} cor={pele} />
    </group>
  );
  const Perna = ({lado}: {lado: 1 | -1}) => (
    <group position={[lado * C.quadril, 0.8, 0]} rotation={[lado < 0 ? pernaE : pernaD, 0, lado < 0 ? pernaEz : pernaDz]}>
      {meia ? (
        <>
          <Caixa tam={[C.pw, 0.34, C.pd]} pos={[0, -0.17, 0]} cor={calca} />
          <Caixa tam={[C.pw * 0.9, 0.38, C.pd * 0.9]} pos={[0, -0.52, 0]} cor={meia} />
        </>
      ) : (
        <Caixa tam={[C.pw, 0.7, C.pd]} pos={[0, -0.36, 0]} cor={calca} />
      )}
      <Caixa tam={[C.pw + 0.04, 0.13, C.pd + 0.12]} pos={[0, -0.735, 0.05]} cor={sapato} />
    </group>
  );

  return (
    <ArredCtx.Provider value={arredondado}>
      <group position={[posicao[0], posicao[1] + pulo, posicao[2]]} rotation={[0, rotacaoY, 0]} scale={escala}>
        <group rotation={[inclina, 0, 0]}>
          <Perna lado={-1} />
          <Perna lado={1} />
          {/* Tronco */}
          {corpo === 'forte' ? (
            <>
              <Caixa tam={[C.tw, 0.46, C.td]} pos={[0, 1.37 + respira, 0]} cor={camisa} />
              <Caixa tam={[C.tw * 0.78, 0.42, C.td * 0.88]} pos={[0, 1.0 + respira, 0]} cor={camisa} />
            </>
          ) : (
            <Caixa tam={[C.tw, 0.8, C.td]} pos={[0, 1.2 + respira, 0]} cor={camisa} />
          )}
          {corpo === 'gordinho' && <Caixa tam={[C.tw * 0.82, 0.5, 0.2]} pos={[0, 1.08 + respira, C.td / 2]} cor={camisa} raio={0.09} />}
          {numero && (
            <>
              <NumeroCamisa texto={numero} cor={corNumero} pos={[0, 1.22 + respira, -C.td / 2 - 0.012]} rot={Math.PI} tam={0.36} />
              <NumeroCamisa texto={numero} cor={corNumero} pos={[0.16, 1.4 + respira, C.td / 2 + 0.012]} rot={0} tam={0.14} />
            </>
          )}
          {capa && <Caixa tam={[C.tw + 0.06, 1.15, 0.05]} pos={[0, 1.02, -C.td / 2 - 0.04]} cor={capa} />}
          {colete && <Caixa tam={[C.tw + 0.04, 0.6, C.td + 0.04]} pos={[0, 1.25 + respira, 0]} cor={colete} />}
          {gravata && (
            <>
              <Caixa tam={[0.2, 0.8, 0.02]} pos={[0, 1.2 + respira, C.td / 2 + 0.005]} cor="#f2f2f2" sombra={false} />
              <Caixa tam={[0.09, 0.58, 0.03]} pos={[0, 1.28 + respira, C.td / 2 + 0.015]} cor={gravata} sombra={false} />
            </>
          )}
          {faixa && (
            <group position={[0, 1.2 + respira, 0]} rotation={[0, 0, -0.75]}>
              {faixa.map((cor, i) => (
                <Caixa key={i} tam={[0.09, 1.08, C.td + 0.04]} pos={[(i - (faixa.length - 1) / 2) * 0.09, 0, 0]} cor={cor} sombra={false} />
              ))}
            </group>
          )}
          <Braco lado={-1} />
          <Braco lado={1} />
          {/* Pescoço + Cabeça */}
          <Caixa tam={[0.22, 0.12, 0.22]} pos={[0, 1.62 + respira, 0]} cor={pele} sombra={false} />
          <group position={[0, 1.6 + H.h / 2 + respira, 0]}>
            <Caixa tam={[H.w, H.h, H.d]} cor={pele} raio={arredondado ? H.r : 0} />
            {/* Olhos */}
            {[-ex, ex].map((x) =>
              olhos === 'grandes' ? (
                <group key={x} position={[x, 0.05, zf]}>
                  <Caixa tam={[0.13, piscando ? 0.02 : expressao === 'cansado' ? 0.07 : 0.15, 0.015]} cor="#ffffff" emissivo={0.35} sombra={false} />
                  {!piscando && <Caixa tam={[0.06, expressao === 'cansado' ? 0.045 : 0.075, 0.02]} pos={[0.008, -0.015, 0.006]} cor="#1a1a1a" sombra={false} />}
                </group>
              ) : (
                <Caixa key={x} tam={[0.08, piscando ? 0.015 : olhoAlt, 0.02]} pos={[x, 0.06, zf]} cor="#1a1a1a" sombra={false} />
              ),
            )}
            {/* Sobrancelhas */}
            {[-ex, ex].map((x) => (
              <Caixa key={x} tam={[0.13, 0.03, 0.02]} pos={[x, sobY, zf + 0.002]} rot={[0, 0, x > 0 ? sobAng : -sobAng]} cor={corCabelo ?? corCab} sombra={false} />
            ))}
            {nariz && <Caixa tam={[0.08, 0.1, 0.06]} pos={[0, -0.02, zf + 0.02]} cor={pele} raio={arredondado ? 0.025 : 0} sombra={false} />}
            {/* Barba (atrás da boca) */}
            {barba === 'curta' && (
              <>
                <Caixa tam={[H.w * 0.92, 0.12, H.d * 0.7]} pos={[0, -H.h / 2 + 0.02, 0.08]} cor={corBar} sombra={false} />
                {[-1, 1].map((l) => (
                  <Caixa key={l} tam={[0.05, H.h * 0.45, H.d * 0.5]} pos={[l * (H.w / 2 + 0.005), -H.h * 0.15, 0.04]} cor={corBar} sombra={false} />
                ))}
              </>
            )}
            {barba === 'cavanhaque' && <Caixa tam={[0.16, 0.12, 0.05]} pos={[0, -H.h * 0.36, zf]} cor={corBar} sombra={false} />}
            {barba === 'cheia' && <Caixa tam={[H.w + 0.03, H.h * 0.42, 0.08]} pos={[0, -H.h * 0.3, zf - 0.01]} cor={corBar} />}
            {/* Boca */}
            <Caixa tam={[larguraBoca, alturaBoca, 0.02]} pos={[0, -0.13, zBoca]} cor="#3a1a1a" sombra={false} />
            {expressao === 'feliz' && !bocaAberta && (
              <>
                <Caixa tam={[0.04, 0.04, 0.02]} pos={[-0.11, -0.105, zBoca]} cor="#3a1a1a" sombra={false} />
                <Caixa tam={[0.04, 0.04, 0.02]} pos={[0.11, -0.105, zBoca]} cor="#3a1a1a" sombra={false} />
              </>
            )}
            {(expressao === 'triste' || expressao === 'emocionado') && !bocaAberta && (
              <>
                <Caixa tam={[0.04, 0.04, 0.02]} pos={[-0.08, -0.155, zBoca]} cor="#3a1a1a" sombra={false} />
                <Caixa tam={[0.04, 0.04, 0.02]} pos={[0.08, -0.155, zBoca]} cor="#3a1a1a" sombra={false} />
              </>
            )}
            {bigode && <Caixa tam={[0.26, 0.05, 0.03]} pos={[0, -0.075, zBoca + 0.005]} cor={corBar === '#2a1d14' ? '#4a2e1a' : corBar} sombra={false} />}
            {suor && (
              <mesh position={[H.w / 2 + 0.02, 0.12 - ((frame % 20) / 20) * 0.35, 0.15]} scale={[0.6, 1, 0.6]}>
                <sphereGeometry args={[0.05, 8, 8]} />
                <meshStandardMaterial color="#8fd3ff" transparent opacity={0.85} />
              </mesh>
            )}
            {expressao === 'emocionado' &&
              [-ex, ex].map((x, i) => (
                <mesh key={x} position={[x, -0.02 - (((frame + i * 13) % 26) / 26) * 0.3, zf + 0.02]} scale={[0.6, 1, 0.6]}>
                  <sphereGeometry args={[0.04, 8, 8]} />
                  <meshStandardMaterial color="#8fd3ff" transparent opacity={0.9} emissive="#8fd3ff" emissiveIntensity={0.3} />
                </mesh>
              ))}
            {/* Cabelos */}
            <CabeloPecas estilo={estiloCabelo} cor={corCab} H={H} />
            {capacete && (
              <>
                <Caixa tam={[H.w + 0.1, 0.24, H.d + 0.1]} pos={[0, H.h / 2 + 0.06, 0]} cor={capacete} />
                <Caixa tam={[0.4, 0.1, 0.06]} pos={[0, H.h / 2 + 0.02, H.d / 2 + 0.04]} cor="#1a1a1a" sombra={false} />
              </>
            )}
            {chapeu === 'cartola' && (
              <>
                <Caixa tam={[0.72, 0.05, 0.72]} pos={[0, H.h / 2 + 0.02, 0]} cor={corChapeu} />
                <Caixa tam={[0.46, 0.5, 0.46]} pos={[0, H.h / 2 + 0.28, 0]} cor={corChapeu} />
              </>
            )}
            {chapeu === 'coco' && (
              <>
                <Caixa tam={[0.7, 0.05, 0.7]} pos={[0, H.h / 2 + 0.02, 0]} cor={corChapeu} />
                <mesh position={[0, H.h / 2 + 0.1, 0]} castShadow>
                  <sphereGeometry args={[0.26, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
                  <meshStandardMaterial color={corChapeu} />
                </mesh>
              </>
            )}
            {chapeu === 'tricornio' && (
              <>
                <mesh position={[0, H.h / 2 + 0.06, 0]} rotation={[0, Math.PI / 6, 0]} castShadow>
                  <cylinderGeometry args={[0.48, 0.48, 0.1, 3]} />
                  <meshStandardMaterial color={corChapeu} />
                </mesh>
                <Caixa tam={[0.4, 0.16, 0.4]} pos={[0, H.h / 2 + 0.14, 0]} cor={corChapeu} />
              </>
            )}
            {chapeu === 'coroa' && (
              <group position={[0, H.h / 2 + 0.06, 0]}>
                <Caixa tam={[0.6, 0.12, 0.6]} cor="#ffcc33" emissivo={0.2} />
                {[[-0.24, -0.24], [0.24, -0.24], [-0.24, 0.24], [0.24, 0.24]].map(([x, z]) => (
                  <Caixa key={`${x}${z}`} tam={[0.1, 0.14, 0.1]} pos={[x, 0.12, z]} cor="#ffcc33" emissivo={0.2} />
                ))}
                <Caixa tam={[0.08, 0.08, 0.02]} pos={[0, 0, 0.305]} cor="#e0245e" emissivo={0.5} sombra={false} />
              </group>
            )}
          </group>
        </group>
      </group>
    </ArredCtx.Provider>
  );
};

const CabeloPecas = ({estilo, cor, H}: {estilo: Cabelo; cor: string; H: {w: number; h: number; d: number}}) => {
  if (estilo === 'nenhum') return null;
  const topo = H.h / 2;
  // cabelo rente à cabeça e sem contorno grosso (não parece capacete)
  const base = <Caixa tam={[H.w + 0.025, 0.09, H.d + 0.025]} pos={[0, topo - 0.005, -0.005]} cor={cor} sombra={false} raio={0.035} />;
  const nuca = <Caixa tam={[H.w + 0.02, H.h * 0.42, 0.05]} pos={[0, topo - H.h * 0.22, -H.d / 2 - 0.005]} cor={cor} sombra={false} raio={0.02} />;
  const lados = [-1, 1].map((l) => (
    <Caixa key={l} tam={[0.03, H.h * 0.28, H.d * 0.55]} pos={[l * (H.w / 2 + 0.006), topo - H.h * 0.16, -0.08]} cor={cor} sombra={false} />
  ));
  if (estilo === 'liso') return <>{base}{nuca}{lados}</>;
  if (estilo === 'topete')
    return (
      <>
        {base}
        {nuca}
        {lados}
        <Caixa tam={[H.w * 0.66, 0.1, H.d * 0.4]} pos={[0, topo + 0.07, H.d * 0.2]} rot={[-0.35, 0, 0]} cor={cor} raio={0.04} />
      </>
    );
  if (estilo === 'black') return <Caixa tam={[H.w + 0.22, 0.36, H.d + 0.22]} pos={[0, topo + 0.07, -0.04]} cor={cor} raio={0.16} />;
  if (estilo === 'lateral')
    return (
      <>
        {base}
        {nuca}
        {lados}
        <Caixa tam={[H.w * 0.62, 0.09, 0.08]} pos={[-H.w * 0.16, topo - 0.03, H.d / 2]} rot={[0, 0, 0.18]} cor={cor} sombra={false} />
      </>
    );
  if (estilo === 'moicano') return <Caixa tam={[0.13, 0.24, H.d + 0.04]} pos={[0, topo + 0.1, -0.01]} cor={cor} />;
  if (estilo === 'comprido')
    return (
      <>
        {base}
        <Caixa tam={[H.w + 0.03, H.h * 0.85, 0.06]} pos={[0, topo - H.h * 0.42, -H.d / 2 - 0.01]} cor={cor} sombra={false} raio={0.02} />
        {[-1, 1].map((l) => (
          <Caixa key={l} tam={[0.04, H.h * 0.6, H.d * 0.6]} pos={[l * (H.w / 2 + 0.01), topo - H.h * 0.3, -0.1]} cor={cor} sombra={false} />
        ))}
      </>
    );
  if (estilo === 'rabo')
    return (
      <>
        {base}
        {nuca}
        {lados}
        <Caixa tam={[0.14, 0.4, 0.14]} pos={[0, topo - 0.2, -H.d / 2 - 0.12]} rot={[0.3, 0, 0]} cor={cor} />
      </>
    );
  return null;
};

// Número de camisa feito com bloquinhos (estilo display de 7 segmentos, legível de longe)
const SEG: Record<string, number[]> = {
  '0': [0, 1, 2, 4, 5, 6], '1': [2, 5], '2': [0, 2, 3, 4, 6], '3': [0, 2, 3, 5, 6], '4': [1, 2, 3, 5],
  '5': [0, 1, 3, 5, 6], '6': [0, 1, 3, 4, 5, 6], '7': [0, 2, 5], '8': [0, 1, 2, 3, 4, 5, 6], '9': [0, 1, 2, 3, 5, 6],
};
const NumeroCamisa = ({texto, cor, pos, rot, tam}: {texto: string; cor: string; pos: V3; rot: number; tam: number}) => {
  const w = tam * 0.55;
  const e = tam * 0.14;
  const seg = (i: number): [V3, V3] => {
    const h = tam / 2;
    switch (i) {
      case 0: return [[0, h, 0], [w, e, 0.01]];
      case 1: return [[-w / 2, h / 2, 0], [e, h, 0.01]];
      case 2: return [[w / 2, h / 2, 0], [e, h, 0.01]];
      case 3: return [[0, 0, 0], [w, e, 0.01]];
      case 4: return [[-w / 2, -h / 2, 0], [e, h, 0.01]];
      case 5: return [[w / 2, -h / 2, 0], [e, h, 0.01]];
      default: return [[0, -h, 0], [w, e, 0.01]];
    }
  };
  const chars = texto.split('');
  return (
    <group position={pos} rotation={[0, rot, 0]}>
      {chars.map((c, k) => (
        <group key={k} position={[(k - (chars.length - 1) / 2) * (w + e * 2.2), 0, 0]}>
          {(SEG[c] ?? []).map((i) => {
            const [p, s] = seg(i);
            return (
              <mesh key={i} position={p}>
                <boxGeometry args={s} />
                <meshStandardMaterial color={cor} roughness={0.6} />
              </mesh>
            );
          })}
        </group>
      ))}
    </group>
  );
};
