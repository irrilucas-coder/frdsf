import {createContext, useContext} from 'react';
import {BackSide, BufferGeometry, BoxGeometry} from 'three';
import {RoundedBoxGeometry} from 'three-stdlib';
import {useCurrentFrame} from 'remotion';

// Quando ligado (Palco com cinema), as peças dos personagens ganham contorno preto estilo desenho.
export const ContornoCtx = createContext(false);

export type Pose =
  | 'parado' | 'andar' | 'remar' | 'manivela' | 'acenar' | 'comemorar' | 'apontar' | 'susto'
  | 'siu' | 'chutar' | 'bracosCruzados' | 'correr' | 'sentado'
  | 'pensar' | 'maosNaCintura' | 'facepalm' | 'dancar' | 'encolher' | 'segurar' | 'mastigar' | 'pular' | 'ajoelhado';
export type Chapeu = 'nenhum' | 'cartola' | 'coco' | 'coroa' | 'tricornio' | 'cabelo';
export type Expressao =
  | 'feliz' | 'assustado' | 'cansado' | 'serio' | 'bravo' | 'triste' | 'emocionado'
  | 'surpreso' | 'rindo' | 'pensativo' | 'furioso' | 'nojo' | 'confiante';
export type Emote = 'exclamacao' | 'interrogacao' | 'raiva' | 'gota' | 'brilho' | 'ideia' | 'coracao' | 'zzz';
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
  // ---- atuação ----
  poseDe?: Pose; // pose anterior: com "mistura" (0→1) o corpo passa suavemente de poseDe para pose
  mistura?: number;
  olhar?: [number, number]; // para onde as pupilas olham (-1..1, -1..1). Sem isso, o olhar passeia sozinho
  emote?: Emote; // ícone 3D flutuando sobre a cabeça
  emoteK?: number; // escala do ícone (0..1) para animar a entrada
  estica?: number; // squash & stretch (-1 achata, +1 estica)
  cabecaGiro?: V3; // [aceno, virar, inclinar] em radianos
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
  poseDe,
  mistura = 1,
  olhar,
  emote,
  emoteK = 1,
  estica = 0,
  cabecaGiro,
}: Props) => {
  const frame = useCurrentFrame();
  const t = (frame + fase * 17) * velocidade;
  const C = CORPOS[corpo];
  const H = CABECAS[cabeca];
  // "chapeu=cabelo" antigo vira cabelo liso na cor do chapéu
  const estiloCabelo: Cabelo = cabelo ?? (chapeu === 'cabelo' ? 'liso' : 'nenhum');
  const corCab = corCabelo ?? (chapeu === 'cabelo' ? corChapeu : '#2a1d14');
  const corBar = corBarba ?? corCab;

  // Ângulos de cada pose (ombro, cotovelo, quadril, joelho), com mistura suave entre duas poses
  const A0 = angulosDaPose(poseDe ?? pose, t);
  const A1 = angulosDaPose(pose, t);
  const m = poseDe ? Math.max(0, Math.min(1, mistura)) : 1;
  const mm = m * m * (3 - 2 * m);
  const L = (k: keyof Angulos) => A0[k] + (A1[k] - A0[k]) * mm;
  let bracoE = L('bE');
  let bracoD = L('bD');
  let bracoEz = L('bEz');
  let bracoDz = L('bDz');
  const torE = L('bEy');
  const torD = L('bDy');
  let cotE = L('cE');
  let cotD = L('cD');
  const pernaE = L('pE');
  const pernaD = L('pD');
  const pernaEz = L('pEz');
  const pernaDz = L('pDz');
  const joeE = L('jE');
  const joeD = L('jD');
  const pulo = L('pulo');
  const inclina = L('inclina');
  const quadrilY = L('qY');
  const cabPose = L('cab');
  // Braço apontando para um alvo (cinemática simples de 1 junta).
  const mira = (ombroX: number, alvo: V3) => {
    const dx = alvo[0] - ombroX;
    const dy = alvo[1] - 1.55;
    const dz = alvo[2];
    const n = Math.hypot(dx, dy, dz) || 1;
    return {rx: Math.atan2(-dz / n, -dy / n), rz: Math.asin(Math.max(-1, Math.min(1, dx / n)))};
  };
  if (alvoMaoE) {
    const r = mira(-C.ombro, alvoMaoE);
    bracoE = r.rx;
    bracoEz = r.rz;
    cotE = 0;
  }
  if (alvoMaoD) {
    const r = mira(C.ombro, alvoMaoD);
    bracoD = r.rx;
    bracoDz = r.rz;
    cotD = 0;
  }
  const respira = Math.sin(t * 0.08) * 0.015;

  // Rosto
  const ex_ = expressao;
  const ciclo3 = Math.floor(t / 3) % 3 !== 0;
  const bocaAberta = (falando && ciclo3) || ex_ === 'rindo' || ex_ === 'surpreso';
  const alturaBoca = ex_ === 'rindo' ? 0.13 + Math.abs(Math.sin(t * 0.7)) * 0.03 : ex_ === 'surpreso' ? 0.13 : falando && ciclo3 ? 0.1 : ex_ === 'assustado' ? 0.08 : ex_ === 'furioso' ? 0.07 : 0.035;
  const larguraBoca = ex_ === 'rindo' ? 0.24 : ex_ === 'surpreso' ? 0.1 : ex_ === 'assustado' ? 0.12 : ex_ === 'pensativo' ? 0.1 : ex_ === 'furioso' ? 0.24 : bocaAberta ? 0.16 : ex_ === 'triste' ? 0.14 : 0.2;
  const bocaX = ex_ === 'pensativo' ? 0.05 : ex_ === 'confiante' ? 0.03 : 0;
  const olhoAlt = ex_ === 'cansado' ? 0.035 : ex_ === 'assustado' || ex_ === 'surpreso' ? 0.11 : ex_ === 'rindo' ? 0.025 : 0.085;
  const piscando = ex_ !== 'surpreso' && (frame + fase * 31 + 45) % 90 < 3;
  const zf = H.d / 2 + 0.006; // frente do rosto
  const ex = H.w * 0.21; // afastamento dos olhos
  const zBoca = zf + (barba === 'cheia' ? 0.04 : 0);
  const sobAng =
    ex_ === 'furioso' ? 0.5 : ex_ === 'bravo' || ex_ === 'serio' ? 0.3 : ex_ === 'triste' || ex_ === 'emocionado' ? -0.3 : ex_ === 'confiante' ? 0.15 : 0;
  const sobY = ex_ === 'assustado' || ex_ === 'surpreso' ? 0.22 : ex_ === 'furioso' ? 0.13 : 0.16;
  // olhar: se não for dado, passeia sozinho (pequenas mudanças a cada ~1,5 s)
  const passo = Math.floor((frame + fase * 23) / 45);
  const olharAuto: [number, number] = [Math.sin(passo * 12.9898) * 0.6, Math.sin(passo * 78.233) * 0.3];
  const ol = olhar ?? (ex_ === 'pensativo' ? [0.5, 0.7] : olharAuto);
  // pele avermelha de raiva, esverdeia de nojo
  const corRosto = ex_ === 'furioso' ? misturaCor(pele, '#ff3b30', 0.35) : ex_ === 'nojo' ? misturaCor(pele, '#8bc34a', 0.25) : pele;
  const tremor = ex_ === 'furioso' ? Math.sin(frame * 2.3) * 0.012 : 0;
  const riso = ex_ === 'rindo' ? Math.abs(Math.sin(t * 0.7)) * 0.04 : 0;
  const giroCab: V3 = [
    (cabecaGiro?.[0] ?? 0) + cabPose + (falando ? Math.sin(t * 0.35) * 0.05 : 0) + (ex_ === 'rindo' ? -0.15 - riso : 0),
    cabecaGiro?.[1] ?? 0,
    (cabecaGiro?.[2] ?? 0) + (ex_ === 'pensativo' ? 0.18 : ex_ === 'confiante' ? -0.08 : 0),
  ];
  const esY = 1 + estica * 0.22;
  const esXZ = 1 - estica * 0.12;

  const Braco = ({lado}: {lado: 1 | -1}) => (
    <group position={[lado * C.ombro, 1.55, 0]} rotation={[lado < 0 ? bracoE : bracoD, 0, lado < 0 ? bracoEz : bracoDz]}>
      <group rotation={[0, alvoMaoE && lado < 0 ? 0 : alvoMaoD && lado > 0 ? 0 : lado < 0 ? torE : torD, 0]}>
      <Caixa tam={[C.bw, 0.4, C.bd]} pos={[0, -0.17, 0]} cor={manga ?? camisa} />
      <group position={[0, -0.36, 0]} rotation={[lado < 0 ? cotE : cotD, 0, 0]}>
        <Caixa tam={[C.bw * 0.94, 0.42, C.bd * 0.94]} pos={[0, -0.11, 0]} cor={manga ? pele : camisa} />
        <Caixa tam={[C.bw * 0.92, 0.16, C.bd * 0.92]} pos={[0, -0.38, 0]} cor={pele} />
      </group>
      </group>
    </group>
  );
  const Perna = ({lado}: {lado: 1 | -1}) => (
    <group position={[lado * C.quadril, 0.8, 0]} rotation={[lado < 0 ? pernaE : pernaD, 0, lado < 0 ? pernaEz : pernaDz]}>
      <Caixa tam={[C.pw, 0.38, C.pd]} pos={[0, -0.18, 0]} cor={calca} />
      <group position={[0, -0.36, 0]} rotation={[lado < 0 ? joeE : joeD, 0, 0]}>
        <Caixa tam={[C.pw * (meia ? 0.9 : 0.97), 0.34, C.pd * (meia ? 0.9 : 0.97)]} pos={[0, -0.16, 0]} cor={meia ?? calca} />
        <Caixa tam={[C.pw + 0.04, 0.13, C.pd + 0.12]} pos={[0, -0.375, 0.05]} cor={sapato} />
      </group>
    </group>
  );

  return (
    <ArredCtx.Provider value={arredondado}>
      <group position={[posicao[0], posicao[1] + pulo, posicao[2]]} rotation={[0, rotacaoY, 0]} scale={[escala * esXZ, escala * esY, escala * esXZ]}>
        <group rotation={[inclina, quadrilY, 0]}>
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
          <group position={[tremor, 1.6 + respira, 0]} rotation={giroCab}>
          <group position={[0, H.h / 2, 0]}>
            <Caixa tam={[H.w, H.h, H.d]} cor={corRosto} raio={arredondado ? H.r : 0} />
            {/* Olhos */}
            {[-ex, ex].map((x) =>
              olhos === 'grandes' ? (
                <group key={x} position={[x, 0.05, zf]}>
                  <Caixa
                    tam={[ex_ === 'surpreso' ? 0.15 : 0.13, piscando ? 0.02 : ex_ === 'cansado' ? 0.07 : ex_ === 'rindo' ? 0.035 : ex_ === 'surpreso' ? 0.18 : ex_ === 'nojo' && x > 0 ? 0.06 : 0.15, 0.015]}
                    cor="#ffffff"
                    emissivo={0.35}
                    sombra={false}
                  />
                  {!piscando && ex_ !== 'rindo' && (
                    <Caixa
                      tam={[ex_ === 'surpreso' ? 0.05 : 0.06, ex_ === 'cansado' ? 0.045 : ex_ === 'surpreso' ? 0.06 : 0.075, 0.02]}
                      pos={[ol[0] * 0.028, ol[1] * 0.035 - 0.01, 0.006]}
                      cor="#1a1a1a"
                      sombra={false}
                    />
                  )}
                  {!piscando && ex_ !== 'rindo' && <Caixa tam={[0.02, 0.02, 0.01]} pos={[ol[0] * 0.028 + 0.015, ol[1] * 0.035 + 0.015, 0.018]} cor="#ffffff" emissivo={1} sombra={false} />}
                </group>
              ) : (
                <Caixa key={x} tam={[0.08, piscando ? 0.015 : olhoAlt, 0.02]} pos={[x + ol[0] * 0.015, 0.06 + ol[1] * 0.012, zf]} cor="#1a1a1a" sombra={false} />
              ),
            )}
            {/* Sobrancelhas */}
            {[-ex, ex].map((x) => (
              <Caixa key={x} tam={[0.13, ex_ === 'furioso' ? 0.045 : 0.03, 0.02]} pos={[x, sobY + (ex_ === 'pensativo' && x > 0 ? 0.05 : 0) + riso, zf + 0.002]} rot={[0, 0, x > 0 ? sobAng : -sobAng]} cor={corCabelo ?? corCab} sombra={false} />
            ))}
            {nariz && <Caixa tam={[0.08, 0.1, 0.06]} pos={[0, -0.02, zf + 0.02]} cor={corRosto} raio={arredondado ? 0.025 : 0} sombra={false} />}
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
            <Caixa tam={[larguraBoca, alturaBoca, 0.02]} pos={[bocaX, -0.13 - (ex_ === 'rindo' ? 0.03 : 0), zBoca]} cor="#3a1a1a" sombra={false} />
            {ex_ === 'rindo' && (
              <>
                <Caixa tam={[larguraBoca * 0.86, 0.03, 0.022]} pos={[0, -0.13 + alturaBoca / 2 - 0.035, zBoca + 0.002]} cor="#ffffff" sombra={false} />
                <Caixa tam={[larguraBoca * 0.5, 0.04, 0.022]} pos={[0, -0.13 - alturaBoca / 2 - 0.01, zBoca + 0.002]} cor="#e05a6a" sombra={false} />
              </>
            )}
            {ex_ === 'furioso' && <Caixa tam={[larguraBoca * 0.9, 0.035, 0.024]} pos={[0, -0.13, zBoca + 0.002]} cor="#ffffff" sombra={false} />}
            {ex_ === 'nojo' && <Caixa tam={[0.07, 0.07, 0.022]} pos={[0.04, -0.17, zBoca + 0.002]} cor="#e05a6a" sombra={false} />}
            {ex_ === 'confiante' && <Caixa tam={[0.05, 0.04, 0.02]} pos={[0.13, -0.105, zBoca]} cor="#3a1a1a" sombra={false} />}
            {/* bochechas coradas */}
            {(ex_ === 'feliz' || ex_ === 'rindo' || ex_ === 'confiante') && olhos === 'grandes' &&
              [-1, 1].map((l) => <Caixa key={l} tam={[0.09, 0.05, 0.01]} pos={[l * (ex + 0.03), -0.06, zf - 0.002]} cor="#ff8a8a" sombra={false} />)}
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
            {(emote || ex_ === 'furioso') && <EmoteIcone tipo={emote ?? 'raiva'} k={emoteK} y={H.h / 2 + 0.42} frame={frame} />}
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
      </group>
    </ArredCtx.Provider>
  );
};

// ---------------- Poses ----------------
export type Angulos = {
  bE: number; bD: number; bEz: number; bDz: number; bEy: number; bDy: number; cE: number; cD: number;
  pE: number; pD: number; pEz: number; pDz: number; jE: number; jD: number;
  pulo: number; inclina: number; qY: number; cab: number;
};
export const angulosDaPose = (pose: Pose, t: number): Angulos => {
  const a: Angulos = {bE: 0, bD: 0, bEz: 0.08, bDz: -0.08, bEy: 0, bDy: 0, cE: -0.12, cD: -0.12, pE: 0, pD: 0, pEz: 0, pDz: 0, jE: 0, jD: 0, pulo: 0, inclina: 0, qY: 0, cab: 0};
  if (pose === 'andar' || pose === 'correr') {
    const k = pose === 'correr' ? 0.5 : 0.3;
    const amp = pose === 'correr' ? 1.1 : 0.7;
    const s = Math.sin(t * k);
    a.bE = s * amp;
    a.bD = -s * amp;
    a.cE = a.cD = pose === 'correr' ? -1.3 : -0.35;
    a.pE = -s * amp * 0.85;
    a.pD = s * amp * 0.85;
    // joelho dobra quando a perna vai para trás
    a.jE = Math.max(0, s) * (pose === 'correr' ? 1.3 : 0.6);
    a.jD = Math.max(0, -s) * (pose === 'correr' ? 1.3 : 0.6);
    a.pulo = Math.abs(Math.cos(t * k)) * (pose === 'correr' ? 0.14 : 0.05);
    if (pose === 'correr') a.inclina = 0.15;
  } else if (pose === 'remar') {
    const s = Math.sin(t * 0.18);
    a.bE = a.bD = -1.2 + s * 0.6;
    a.cE = a.cD = -0.4 - s * 0.3;
    a.inclina = s * 0.18;
  } else if (pose === 'manivela') {
    const g = t * 0.45;
    a.bE = -1.3 + Math.sin(g) * 0.45;
    a.bD = -1.3 + Math.sin(g + Math.PI) * 0.45;
    a.cE = a.cD = 0;
    a.pE = Math.sin(g) * 0.5 - 0.4;
    a.pD = Math.sin(g + Math.PI) * 0.5 - 0.4;
    a.jE = 0.5 + Math.sin(g) * 0.3;
    a.jD = 0.5 - Math.sin(g) * 0.3;
  } else if (pose === 'acenar') {
    a.bD = Math.PI * 0.85;
    a.bDz = -0.3;
    a.cD = -0.5 + Math.sin(t * 0.45) * 0.45;
  } else if (pose === 'comemorar') {
    a.bE = a.bD = Math.PI * 0.95;
    a.bEz = 0.35 + Math.sin(t * 0.5) * 0.15;
    a.bDz = -0.35 - Math.sin(t * 0.5) * 0.15;
    a.cE = a.cD = -0.2;
    a.pulo = Math.abs(Math.sin(t * 0.25)) * 0.35;
    a.jE = a.jD = a.pulo > 0.05 ? 0 : 0.4;
  } else if (pose === 'pular') {
    const f = Math.abs(Math.sin(t * 0.2));
    a.pulo = f * 0.6;
    a.bE = a.bD = Math.PI * 0.8 * f;
    a.bEz = 0.3;
    a.bDz = -0.3;
    a.jE = a.jD = (1 - f) * 0.8;
    a.pE = a.pD = -(1 - f) * 0.4;
  } else if (pose === 'apontar') {
    a.bD = -Math.PI / 2;
    a.cD = 0;
    a.bE = Math.sin(t * 0.1) * 0.08;
  } else if (pose === 'susto') {
    a.bE = a.bD = Math.PI * 0.7;
    a.bEz = 0.7;
    a.bDz = -0.7;
    a.cE = a.cD = -0.6;
    a.pulo = Math.abs(Math.sin(t * 0.9)) * 0.05;
    a.inclina = -0.12;
  } else if (pose === 'siu') {
    a.bE = a.bD = 0.35;
    a.bEz = -0.75;
    a.bDz = 0.75;
    a.cE = a.cD = 0;
    a.pEz = -0.22;
    a.pDz = 0.22;
    a.inclina = -0.12;
  } else if (pose === 'chutar') {
    const ciclo = (t % 40) / 40;
    const k = ciclo < 0.35 ? -ciclo / 0.35 : ciclo < 0.55 ? -1 + ((ciclo - 0.35) / 0.2) * 2.4 : 1.4 - ((ciclo - 0.55) / 0.45) * 1.4;
    a.pD = -k * 0.9;
    a.jD = k < 0 ? -k * 1.2 : 0;
    a.bE = k * 0.5;
    a.bEz = 0.5;
    a.bD = -k * 0.3;
    a.inclina = -k * 0.08;
  } else if (pose === 'sentado') {
    a.pE = a.pD = -Math.PI / 2;
    a.jE = a.jD = 1.1;
    a.bE = a.bD = -0.6;
    a.cE = a.cD = -0.5;
  } else if (pose === 'bracosCruzados') {
    a.bE = a.bD = -0.5;
    a.bEz = a.bDz = 0;
    a.bEy = 1.0;
    a.bDy = -1.0;
    a.cE = -1.45;
    a.cD = -1.7;
  } else if (pose === 'pensar') {
    // mão direita no queixo, braço esquerdo apoiando o cotovelo
    a.bD = -0.45;
    a.bDz = 0;
    a.bDy = -1.15;
    a.cD = -2.5;
    a.bE = -0.45;
    a.bEz = 0;
    a.bEy = 1.15;
    a.cE = -1.5;
    a.cab = 0.08;
  } else if (pose === 'maosNaCintura') {
    a.bEz = -0.7;
    a.bDz = 0.7;
    a.bEy = Math.PI / 2;
    a.bDy = -Math.PI / 2;
    a.cE = a.cD = -1.6;
    a.pEz = -0.1;
    a.pDz = 0.1;
  } else if (pose === 'facepalm') {
    a.bD = -0.9;
    a.bDz = 0;
    a.bDy = -0.9;
    a.cD = -2.45;
    a.cab = 0.3;
    a.inclina = 0.08;
  } else if (pose === 'dancar') {
    const s = Math.sin(t * 0.35);
    a.bE = Math.PI * 0.55 + s * 0.6;
    a.bD = Math.PI * 0.55 - s * 0.6;
    a.bEz = 0.4;
    a.bDz = -0.4;
    a.cE = a.cD = -0.9;
    a.qY = s * 0.35;
    a.pulo = Math.abs(Math.cos(t * 0.35)) * 0.12;
    a.jE = Math.max(0, s) * 0.5;
    a.jD = Math.max(0, -s) * 0.5;
  } else if (pose === 'encolher') {
    a.bEz = -0.3;
    a.bDz = 0.3;
    a.bEy = -0.7;
    a.bDy = 0.7;
    a.cE = a.cD = -1.4;
    a.cab = -0.05;
  } else if (pose === 'segurar') {
    a.bE = a.bD = -0.4;
    a.bEz = a.bDz = 0;
    a.bEy = 0.3;
    a.bDy = -0.3;
    a.cE = a.cD = -1.2;
  } else if (pose === 'ajoelhado') {
    // de joelhos (coloque posicao y ≈ -0.36 no Boneco), tronco inclinado para a frente
    a.pE = a.pD = -0.1;
    a.jE = a.jD = 1.65;
    a.inclina = 0.3;
    a.bE = a.bD = -0.9;
    a.cE = a.cD = 0;
  } else if (pose === 'mastigar') {
    a.cab = Math.sin(t * 0.6) * 0.04;
  }
  return a;
};

export const misturaCor = (a: string, b: string, k: number) => {
  const pa = parseInt(a.slice(1), 16);
  const pb = parseInt(b.slice(1), 16);
  const c = (sh: number) => Math.round(((pa >> sh) & 255) * (1 - k) + ((pb >> sh) & 255) * k);
  return `#${((c(16) << 16) | (c(8) << 8) | c(0)).toString(16).padStart(6, '0')}`;
};

// ---------------- Ícones de emoção (3D) ----------------
const Mat = ({cor, emi = 0.5}: {cor: string; emi?: number}) => <meshStandardMaterial color={cor} emissive={cor} emissiveIntensity={emi} roughness={0.4} />;
export const EmoteIcone = ({tipo, k, y, frame}: {tipo: Emote; k: number; y: number; frame: number}) => {
  const bob = Math.sin(frame * 0.2) * 0.04;
  const esc = Math.max(0, k) * (1 + Math.sin(frame * 0.3) * 0.05);
  if (esc <= 0.001) return null;
  const pos: V3 = tipo === 'raiva' ? [0.28, y - 0.12 + bob, 0.1] : tipo === 'gota' ? [0.36, y - 0.25 + bob, 0.1] : [0.05, y + bob, 0];
  return (
    <group position={pos} scale={esc}>
      {tipo === 'exclamacao' && (
        <>
          <mesh position={[0, 0.12, 0]}><boxGeometry args={[0.09, 0.28, 0.09]} /><Mat cor="#ffd23f" /></mesh>
          <mesh position={[0, -0.1, 0]}><boxGeometry args={[0.09, 0.09, 0.09]} /><Mat cor="#ffd23f" /></mesh>
        </>
      )}
      {tipo === 'interrogacao' && (
        <>
          <mesh position={[0, 0.16, 0]} rotation={[0, 0, -0.3]}><torusGeometry args={[0.09, 0.035, 8, 16, Math.PI * 1.4]} /><Mat cor="#4cc9f0" /></mesh>
          <mesh position={[0, 0.0, 0]}><boxGeometry args={[0.07, 0.1, 0.07]} /><Mat cor="#4cc9f0" /></mesh>
          <mesh position={[0, -0.12, 0]}><boxGeometry args={[0.07, 0.07, 0.07]} /><Mat cor="#4cc9f0" /></mesh>
        </>
      )}
      {tipo === 'raiva' &&
        [0, 1, 2, 3].map((i) => (
          <mesh key={i} rotation={[0, 0, (i * Math.PI) / 2 + Math.PI / 4]} position={[Math.cos((i * Math.PI) / 2 + Math.PI / 4) * 0.06, Math.sin((i * Math.PI) / 2 + Math.PI / 4) * 0.06, 0]}>
            <boxGeometry args={[0.04, 0.09, 0.04]} />
            <Mat cor="#ff2d2d" emi={0.7} />
          </mesh>
        ))}
      {tipo === 'gota' && (
        <mesh scale={[0.8, 1.2, 0.8]} position={[0, -((frame % 30) / 30) * 0.15, 0]}>
          <sphereGeometry args={[0.07, 12, 10]} />
          <meshStandardMaterial color="#8fd3ff" transparent opacity={0.9} emissive="#8fd3ff" emissiveIntensity={0.3} />
        </mesh>
      )}
      {tipo === 'brilho' &&
        [[-0.15, 0.05, 1], [0.12, 0.15, 0.7], [0.1, -0.08, 0.55]].map(([x, yy, e], i) => (
          <group key={i} position={[x, yy, 0]} rotation={[0, 0, frame * 0.05 + i]} scale={e * (0.8 + Math.abs(Math.sin(frame * 0.25 + i)) * 0.4)}>
            <mesh><boxGeometry args={[0.04, 0.2, 0.02]} /><Mat cor="#fff6a8" emi={1.2} /></mesh>
            <mesh><boxGeometry args={[0.2, 0.04, 0.02]} /><Mat cor="#fff6a8" emi={1.2} /></mesh>
          </group>
        ))}
      {tipo === 'ideia' && (
        <>
          <mesh position={[0, 0.08, 0]}><sphereGeometry args={[0.13, 16, 12]} /><Mat cor="#ffe066" emi={1.4} /></mesh>
          <mesh position={[0, -0.09, 0]}><cylinderGeometry args={[0.06, 0.06, 0.08, 12]} /><Mat cor="#9aa0a8" emi={0.1} /></mesh>
        </>
      )}
      {tipo === 'coracao' && (
        <group rotation={[0, 0, Math.PI / 4]} scale={1 + Math.abs(Math.sin(frame * 0.3)) * 0.15}>
          <mesh><boxGeometry args={[0.16, 0.16, 0.08]} /><Mat cor="#ff4d6d" /></mesh>
          <mesh position={[-0.08, 0, 0]}><cylinderGeometry args={[0.08, 0.08, 0.08, 16]} /><Mat cor="#ff4d6d" /></mesh>
          <mesh position={[0, 0.08, 0]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.08, 0.08, 0.08, 16]} /><Mat cor="#ff4d6d" /></mesh>
        </group>
      )}
      {tipo === 'zzz' &&
        [0, 1, 2].map((i) => (
          <mesh key={i} position={[i * 0.1, i * 0.12 + ((frame * 0.01) % 0.1), 0]} scale={0.6 + i * 0.2}>
            <boxGeometry args={[0.12, 0.03, 0.02]} />
            <Mat cor="#cfe8ff" />
          </mesh>
        ))}
    </group>
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
export const NumeroCamisa = ({texto, cor, pos, rot, tam}: {texto: string; cor: string; pos: V3; rot: number; tam: number}) => {
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
