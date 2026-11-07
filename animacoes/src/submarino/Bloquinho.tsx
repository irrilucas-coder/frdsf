import {createContext, useContext} from 'react';
import {BackSide} from 'three';
import {useCurrentFrame} from 'remotion';

// Quando ligado (Palco com cinema), as peças dos personagens ganham contorno preto estilo desenho.
export const ContornoCtx = createContext(false);

export type Pose = 'parado' | 'andar' | 'remar' | 'manivela' | 'acenar' | 'comemorar' | 'apontar' | 'susto';
export type Chapeu = 'nenhum' | 'cartola' | 'coco' | 'coroa' | 'tricornio' | 'cabelo';
export type Expressao = 'feliz' | 'assustado' | 'cansado' | 'serio' | 'bravo';

type Props = {
  posicao?: [number, number, number];
  rotacaoY?: number;
  escala?: number;
  pele?: string;
  camisa?: string;
  calca?: string;
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
  alvoMaoE?: [number, number, number];
  alvoMaoD?: [number, number, number];
};

const Caixa = ({
  tam,
  pos = [0, 0, 0],
  cor,
  sombra = true,
  emissivo,
}: {
  tam: [number, number, number];
  pos?: [number, number, number];
  cor: string;
  sombra?: boolean;
  emissivo?: number;
}) => {
  const contorno = useContext(ContornoCtx);
  const borda = 0.045;
  return (
  <>
  {contorno && sombra && (
    <mesh position={pos} scale={[(tam[0] + borda) / tam[0], (tam[1] + borda) / tam[1], (tam[2] + borda) / tam[2]]}>
      <boxGeometry args={tam} />
      <meshBasicMaterial color="#141414" side={BackSide} />
    </mesh>
  )}
  <mesh position={pos} castShadow={sombra}>
    <boxGeometry args={tam} />
    <meshStandardMaterial
      color={cor}
      roughness={0.7}
      emissive={emissivo ? cor : '#000000'}
      emissiveIntensity={emissivo ?? 0}
    />
  </mesh>
  </>
  );
};

// Personagem de bloquinhos: pernas, tronco, braços e cabeça quadrada.
// Altura total ~2 unidades, com os pés em y=0.
export const Bloquinho = ({
  posicao = [0, 0, 0],
  rotacaoY = 0,
  escala = 1,
  pele = '#f5c99b',
  camisa = '#2f6fdb',
  calca = '#2b2b3a',
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
}: Props) => {
  const frame = useCurrentFrame();
  const t = (frame + fase * 17) * velocidade;

  // Ângulos (radianos) de braço/perna em torno do ombro/quadril, eixo X = para frente/trás
  let bracoE = 0;
  let bracoD = 0;
  let bracoEz = 0.08;
  let bracoDz = -0.08;
  let pernaE = 0;
  let pernaD = 0;
  let pulo = 0;
  let inclina = 0;

  if (pose === 'andar') {
    const s = Math.sin(t * 0.3);
    bracoE = s * 0.7;
    bracoD = -s * 0.7;
    pernaE = -s * 0.6;
    pernaD = s * 0.6;
    pulo = Math.abs(Math.cos(t * 0.3)) * 0.06;
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
  }
  // Leve respiração
  // Braço apontando para um alvo (cinemática simples de 1 junta). Ombro em (±0.53, 1.55, 0).
  const mira = (ombroX: number, alvo: [number, number, number]) => {
    const dx = alvo[0] - ombroX;
    const dy = alvo[1] - 1.55;
    const dz = alvo[2];
    const n = Math.hypot(dx, dy, dz) || 1;
    const x = dx / n;
    const y = dy / n;
    const z = dz / n;
    return {rx: Math.atan2(-z, -y), rz: Math.asin(Math.max(-1, Math.min(1, x)))};
  };
  if (alvoMaoE) {
    const m = mira(-0.53, alvoMaoE);
    bracoE = m.rx;
    bracoEz = m.rz;
  }
  if (alvoMaoD) {
    const m = mira(0.53, alvoMaoD);
    bracoD = m.rx;
    bracoDz = m.rz;
  }
  const respira = Math.sin(t * 0.08) * 0.015;

  // Boca: abre e fecha enquanto fala
  const bocaAberta = falando && Math.floor(t / 3) % 3 !== 0;
  const alturaBoca = bocaAberta ? 0.1 : expressao === 'assustado' ? 0.08 : 0.035;
  const larguraBoca = expressao === 'assustado' ? 0.12 : bocaAberta ? 0.16 : 0.2;
  const olhoAlt = expressao === 'cansado' ? 0.035 : expressao === 'assustado' ? 0.11 : 0.085;
  const piscando = (frame + fase * 31) % 90 < 3;

  return (
    <group position={[posicao[0], posicao[1] + pulo, posicao[2]]} rotation={[0, rotacaoY, 0]} scale={escala}>
      <group rotation={[inclina, 0, 0]}>
        {/* Pernas (giram no quadril) */}
        <group position={[-0.18, 0.8, 0]} rotation={[pernaE, 0, 0]}>
          <Caixa tam={[0.34, 0.8, 0.38]} pos={[0, -0.4, 0]} cor={calca} />
        </group>
        <group position={[0.18, 0.8, 0]} rotation={[pernaD, 0, 0]}>
          <Caixa tam={[0.34, 0.8, 0.38]} pos={[0, -0.4, 0]} cor={calca} />
        </group>
        {/* Tronco */}
        <Caixa tam={[0.72, 0.8, 0.4]} pos={[0, 1.2 + respira, 0]} cor={camisa} />
        {capa && <Caixa tam={[0.78, 1.15, 0.05]} pos={[0, 1.02, -0.24]} cor={capa} />}
        {colete && <Caixa tam={[0.76, 0.6, 0.44]} pos={[0, 1.25 + respira, 0]} cor={colete} />}
        {gravata && (
          <>
            <Caixa tam={[0.2, 0.8, 0.02]} pos={[0, 1.2 + respira, 0.205]} cor="#f2f2f2" sombra={false} />
            <Caixa tam={[0.09, 0.58, 0.03]} pos={[0, 1.28 + respira, 0.215]} cor={gravata} sombra={false} />
          </>
        )}
        {faixa && (
          <group position={[0, 1.2 + respira, 0]} rotation={[0, 0, -0.75]}>
            {faixa.map((cor, i) => (
              <Caixa key={i} tam={[0.09, 1.08, 0.44]} pos={[(i - (faixa.length - 1) / 2) * 0.09, 0, 0]} cor={cor} sombra={false} />
            ))}
          </group>
        )}
        {/* Braços (giram no ombro) */}
        <group position={[-0.53, 1.55, 0]} rotation={[bracoE, 0, bracoEz]}>
          <Caixa tam={[0.32, 0.78, 0.36]} pos={[0, -0.36, 0]} cor={camisa} />
          <Caixa tam={[0.3, 0.16, 0.34]} pos={[0, -0.72, 0]} cor={pele} />
        </group>
        <group position={[0.53, 1.55, 0]} rotation={[bracoD, 0, bracoDz]}>
          <Caixa tam={[0.32, 0.78, 0.36]} pos={[0, -0.36, 0]} cor={camisa} />
          <Caixa tam={[0.3, 0.16, 0.34]} pos={[0, -0.72, 0]} cor={pele} />
        </group>
        {/* Cabeça */}
        <group position={[0, 1.88 + respira, 0]}>
          <Caixa tam={[0.56, 0.56, 0.56]} cor={pele} />
          {/* Olhos */}
          {[-0.12, 0.12].map((x) => (
            <Caixa
              key={x}
              tam={[0.08, piscando ? 0.015 : olhoAlt, 0.02]}
              pos={[x, 0.06, 0.285]}
              cor="#1a1a1a"
              sombra={false}
            />
          ))}
          {/* Sobrancelhas bravas/sérias */}
          {(expressao === 'bravo' || expressao === 'serio') &&
            [-0.12, 0.12].map((x) => (
              <mesh key={x} position={[x, 0.16, 0.286]} rotation={[0, 0, x > 0 ? 0.3 : -0.3]}>
                <boxGeometry args={[0.13, 0.025, 0.02]} />
                <meshStandardMaterial color="#1a1a1a" />
              </mesh>
            ))}
          {/* Boca */}
          <Caixa tam={[larguraBoca, alturaBoca, 0.02]} pos={[0, -0.12, 0.285]} cor="#3a1a1a" sombra={false} />
          {expressao === 'feliz' && !bocaAberta && (
            <>
              <Caixa tam={[0.04, 0.04, 0.02]} pos={[-0.11, -0.095, 0.285]} cor="#3a1a1a" sombra={false} />
              <Caixa tam={[0.04, 0.04, 0.02]} pos={[0.11, -0.095, 0.285]} cor="#3a1a1a" sombra={false} />
            </>
          )}
          {bigode && <Caixa tam={[0.26, 0.05, 0.03]} pos={[0, -0.05, 0.29]} cor="#4a2e1a" sombra={false} />}
          {suor && (
            <mesh position={[0.3, 0.12 - ((frame % 20) / 20) * 0.35, 0.15]} scale={[0.6, 1, 0.6]}>
              <sphereGeometry args={[0.05, 8, 8]} />
              <meshStandardMaterial color="#8fd3ff" transparent opacity={0.85} />
            </mesh>
          )}
          {/* Chapéus */}
          {chapeu === 'cabelo' && <Caixa tam={[0.6, 0.14, 0.6]} pos={[0, 0.32, -0.02]} cor={corChapeu} />}
          {capacete && (
            <>
              <Caixa tam={[0.66, 0.24, 0.66]} pos={[0, 0.34, 0]} cor={capacete} />
              <Caixa tam={[0.4, 0.1, 0.06]} pos={[0, 0.3, 0.32]} cor="#1a1a1a" sombra={false} />
            </>
          )}
          {chapeu === 'cartola' && (
            <>
              <Caixa tam={[0.72, 0.05, 0.72]} pos={[0, 0.3, 0]} cor={corChapeu} />
              <Caixa tam={[0.46, 0.5, 0.46]} pos={[0, 0.56, 0]} cor={corChapeu} />
            </>
          )}
          {chapeu === 'coco' && (
            <>
              <Caixa tam={[0.7, 0.05, 0.7]} pos={[0, 0.3, 0]} cor={corChapeu} />
              <mesh position={[0, 0.38, 0]} castShadow>
                <sphereGeometry args={[0.26, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
                <meshStandardMaterial color={corChapeu} />
              </mesh>
            </>
          )}
          {chapeu === 'tricornio' && (
            <>
              <mesh position={[0, 0.34, 0]} rotation={[0, Math.PI / 6, 0]} castShadow>
                <cylinderGeometry args={[0.48, 0.48, 0.1, 3]} />
                <meshStandardMaterial color={corChapeu} />
              </mesh>
              <Caixa tam={[0.4, 0.16, 0.4]} pos={[0, 0.42, 0]} cor={corChapeu} />
            </>
          )}
          {chapeu === 'coroa' && (
            <group position={[0, 0.34, 0]}>
              <Caixa tam={[0.6, 0.12, 0.6]} cor="#ffcc33" emissivo={0.2} />
              {[
                [-0.24, -0.24],
                [0.24, -0.24],
                [-0.24, 0.24],
                [0.24, 0.24],
              ].map(([x, z]) => (
                <Caixa key={`${x}${z}`} tam={[0.1, 0.14, 0.1]} pos={[x, 0.12, z]} cor="#ffcc33" emissivo={0.2} />
              ))}
              <Caixa tam={[0.08, 0.08, 0.02]} pos={[0, 0, 0.305]} cor="#e0245e" emissivo={0.5} />
            </group>
          )}
        </group>
      </group>
    </group>
  );
};
