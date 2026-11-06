import {Easing, interpolate, useCurrentFrame} from 'remotion';
import {
  AguaBaixo,
  AguaCima,
  ArvoreBloco,
  Bolhas,
  CasasLondres,
  Fundo,
  Gelo,
  Noite,
  Pier,
  RaiosDeLuz,
} from './Ambiente';
import {Bloquinho} from './Bloquinho';
import {camNoTempo, type Plano, type V3} from './camera';
import {Barril, BarcoDrebbel, Hunley, Nautilus, NavioVapor, NavioVela, SubHolland, Turtle} from './Modelos';
import {Palco, type Clima} from './Palco';
import {FPS, duracaoCena, fimFala, inicioFala, quandoDiz} from './roteiro';

const lerp = (s: number, a: number, b: number, de: number, para: number, easing = Easing.inOut(Easing.quad)) =>
  interpolate(s, [a, b], [de, para], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing});

const useSeg = () => useCurrentFrame() / FPS;

// Clima muda sozinho quando a câmera passa para baixo da água
const climaAgua = (pos: V3, cima: Clima, baixo: Clima): Clima => (pos[1] < 0 ? baixo : cima);

// Peixinhos de bloco
const Peixes = ({qtd = 6, y = -2, semente = 0}) => {
  const frame = useCurrentFrame();
  return (
    <>
      {Array.from({length: qtd}, (_, i) => {
        const x = ((frame * 0.03 * (1 + (i % 3) * 0.3) + i * 4 + semente) % 24) - 12;
        return (
          <group key={i} position={[x, y + Math.sin(frame * 0.05 + i) * 0.4 + (i % 3) * 0.8, -3 - (i % 4) * 1.5]}>
            <mesh>
              <boxGeometry args={[0.45, 0.25, 0.12]} />
              <meshStandardMaterial color={['#ff9f1c', '#ffd23f', '#ff6b6b'][i % 3]} />
            </mesh>
            <mesh position={[-0.3, 0, 0]} rotation={[0, 0, Math.PI / 4]}>
              <boxGeometry args={[0.18, 0.18, 0.05]} />
              <meshStandardMaterial color={['#ff9f1c', '#ffd23f', '#ff6b6b'][i % 3]} />
            </mesh>
          </group>
        );
      })}
    </>
  );
};

// Explosão de blocos
const Explosao = ({posicao, inicio, s, escala = 1}: {posicao: V3; inicio: number; s: number; escala?: number}) => {
  const t = s - inicio;
  if (t < 0 || t > 1.6) return null;
  const k = lerp(t, 0, 0.6, 0.2, 2.6, Easing.out(Easing.cubic)) * escala;
  const op = lerp(t, 0.3, 1.6, 1, 0);
  return (
    <group position={posicao}>
      <mesh scale={k}>
        <icosahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color="#ffb03b" emissive="#ff6a00" emissiveIntensity={3} transparent opacity={op} flatShading />
      </mesh>
      <mesh scale={k * 0.6}>
        <icosahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color="#fff2b0" emissive="#ffe08a" emissiveIntensity={4} transparent opacity={op} />
      </mesh>
      {Array.from({length: 10}, (_, i) => {
        const a = (i / 10) * Math.PI * 2;
        const d = k * 1.3;
        return (
          <mesh key={i} position={[Math.cos(a) * d, Math.sin(a * 1.7) * d * 0.6, Math.sin(a) * d]} scale={0.25 * escala}>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color="#3a2a1a" transparent opacity={op} />
          </mesh>
        );
      })}
      <pointLight color="#ff9a3b" intensity={op * 60} distance={25} />
    </group>
  );
};

// =============== 0. GANCHO ===============
export const CenaGancho = () => {
  const s = useSeg();
  const fim = duracaoCena('gancho');
  const corte = quandoDiz('gancho', 'L0', 'de');
  const planos: Plano[] = [
    {de: 0, pos: [[2.5, 0.8, 4.5], [1.8, -0.6, 3.6]], olha: [[0, 0.3, 0], [0, -0.8, 0]], fov: 45},
    {de: corte, pos: [[0, 1.8, 3.3], [0, 1.85, 2.8]], olha: [[0, 1.6, 0], [0, 1.7, 0]], fov: 45},
  ];
  const cam = camNoTempo(planos, s, fim);
  const alarme = Math.floor(s * 4) % 2 === 0;
  if (cam.plano === 0) {
    return (
      <Palco clima="submerso" pos={cam.pos} olha={cam.olha} fov={cam.fov}>
        <Barril posicao={[0, lerp(s, 0, corte, 0.6, -1.2), 0]} rot={Math.sin(s * 2) * 0.08} />
        <Bolhas origem={[0, -1.5, 0.6]} qtd={40} espalha={1.5} altura={5} />
        <RaiosDeLuz y={3} />
        <AguaBaixo y={3.5} />
        <Fundo y={-6} />
        <pointLight position={[0, 0.3, 1.5]} color="#ff3030" intensity={alarme ? 12 : 2} distance={6} />
      </Palco>
    );
  }
  return (
    <Palco clima="interior" pos={cam.pos} olha={cam.olha} fov={cam.fov} sombras={false}>
      <mesh>
        <cylinderGeometry args={[1.6, 1.6, 5, 14, 1, true]} />
        <meshStandardMaterial color="#6b4423" side={1} roughness={1} flatShading />
      </mesh>
      <Bloquinho pose="susto" expressao="assustado" suor camisa="#e63946" chapeu="cabelo" corChapeu="#3b2a1a" />
      <pointLight position={[0.8, 2.6, 1]} color="#ff2a2a" intensity={alarme ? 25 : 4} distance={6} />
      <pointLight position={[-0.5, 2, 1.5]} color="#9fd8ff" intensity={3} distance={5} />
      {/* gotas caindo */}
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[-0.8 + i * 0.7, 3 - ((s * 2 + i * 0.37) % 1) * 3, 0.6]} scale={[0.04, 0.08, 0.04]}>
          <sphereGeometry args={[1, 6, 6]} />
          <meshStandardMaterial color="#8fd3ff" transparent opacity={0.9} />
        </mesh>
      ))}
    </Palco>
  );
};

// =============== 1. DREBBEL (1620) ===============
export const CenaDrebbel = () => {
  const s = useSeg();
  const fim = duracaoCena('drebbel');
  const tCobriu = quandoDiz('drebbel', 'L1', 'cobriu');
  const tMergulhou = quandoDiz('drebbel', 'L1', 'mergulhou');
  const tL2 = inicioFala('drebbel', 'L2') - 0.15;
  const afunda = lerp(s, tMergulhou + 0.2, tMergulhou + 1.8, 0, 1);
  const yBarco = -afunda * 2.6;
  const planos: Plano[] = [
    {de: 0, pos: [[-1, 5, 16], [1.5, 3.5, 12]], olha: [[0, 2, -4], [0, 1.5, -3]]},
    {de: tCobriu, pos: [[3.8, 2.4, 5.5], [2.6, 1.8, 4.6]], olha: [[0.3, 0.6, 0], [0.2, 0.7, 0]], fov: 45},
    {de: tMergulhou, pos: [[4.5, 1.2, 6.5], [3.5, -2.6, 6]], olha: [[0, 0.2, 0], [0, -2.4, 0]], fov: 48},
    {de: tL2, pos: [[1.2, 2.2, 5.6], [1.4, 2.0, 4.6]], olha: [[0.8, 1.2, 0], [1.2, 1.4, 0]], fov: 48},
  ];
  const cam = camNoTempo(planos, s, fim);

  if (cam.plano === 3) {
    // Dentro do barco: remadores e Drebbel gritando
    return (
      <Palco clima="interior" pos={cam.pos} olha={cam.olha} fov={cam.fov} sombras={false}>
        <mesh position={[0, -0.05, 0]}>
          <boxGeometry args={[8, 0.1, 5]} />
          <meshStandardMaterial color="#5a3a1f" />
        </mesh>
        <mesh position={[0, 2.2, -1.4]}>
          <boxGeometry args={[8, 4.5, 0.1]} />
          <meshStandardMaterial color="#3d2614" />
        </mesh>
        {[
          [-1.4, -0.4],
          [-0.5, -0.4],
          [0.5, -0.4],
          [1.4, -0.4],
        ].map(([x, z], i) => (
          <Bloquinho
            key={i}
            posicao={[x, 0, z]}
            escala={0.85}
            pose="remar"
            fase={i * 0.3}
            camisa={['#8d5524', '#6b8e23', '#4a6fa5', '#a0522d'][i]}
            expressao="cansado"
            suor={i % 2 === 0}
            chapeu="cabelo"
            corChapeu={['#2b1d0e', '#6b4423', '#111', '#c28e4a'][i]}
          />
        ))}
        <Bloquinho
          posicao={[2.1, 0, 0.4]}
          rotacaoY={-0.55}
          pose="apontar"
          falando={s >= tL2 + 0.15}
          expressao="bravo"
          camisa="#7a3b2a"
          chapeu="tricornio"
          corChapeu="#2a1a10"
        />
        <pointLight position={[0.5, 3, 2.5]} color="#ffb85c" intensity={9} distance={9} />
        <mesh position={[1.8, 1.6, -1.3]}>
          <boxGeometry args={[0.15, 0.3, 0.15]} />
          <meshStandardMaterial color="#fff6d6" emissive="#ffb347" emissiveIntensity={3} />
        </mesh>
      </Palco>
    );
  }

  const clima = climaAgua(cam.pos, 'dia', 'submerso');
  return (
    <Palco clima={clima} pos={cam.pos} olha={cam.olha} fov={cam.fov}>
      <AguaCima cor="#3c7fa8" />
      <AguaBaixo y={-0.01} />
      <CasasLondres z={-10} />
      <Fundo y={-7} cor="#4a5a3a" />
      {[-12, -8, 9, 13].map((x) => (
        <ArvoreBloco key={x} posicao={[x, 0.6, -8.4]} />
      ))}
      <BarcoDrebbel posicao={[lerp(s, 0, fim, -1, 1), yBarco - 0.1, 0]} />
      {s < tMergulhou + 0.4 && (
        <Bloquinho
          posicao={[lerp(s, 0, fim, -1, 1) + 0.6, 0.85 - afunda * 2, 0]}
          escala={0.55}
          pose="acenar"
          rotacaoY={0.5}
          camisa="#7a3b2a"
          chapeu="tricornio"
          corChapeu="#2a1a10"
        />
      )}
      {/* O rei assistindo da margem */}
      <Bloquinho posicao={[-3, 0.6, -8]} escala={0.9} capa="#b3122e" camisa="#6a1b9a" chapeu="coroa" pose={s > tMergulhou ? 'susto' : 'parado'} expressao={s > tMergulhou ? 'assustado' : 'feliz'} />
      <Bloquinho posicao={[-1.8, 0.6, -8.2]} escala={0.8} camisa="#2e7d32" chapeu="cartola" pose="parado" fase={2} />
      {afunda > 0 && afunda < 1 && <Bolhas origem={[0, yBarco, 0]} qtd={30} espalha={3} altura={3} semente={4} />}
      {cam.pos[1] < 0 && <RaiosDeLuz y={0} />}
    </Palco>
  );
};

// =============== 2. FUNCIONOU ===============
export const CenaFuncionou = () => {
  const s = useSeg();
  const fim = duracaoCena('funcionou');
  const planos: Plano[] = [
    {de: 0, pos: [[-4, -1.4, 6], [3, -1.8, 5.5]], olha: [[-1, -2.4, 0], [1.5, -2.4, 0]], fov: 50},
  ];
  const cam = camNoTempo(planos, s, fim);
  return (
    <Palco clima="submerso" pos={cam.pos} olha={cam.olha} fov={cam.fov}>
      <BarcoDrebbel posicao={[lerp(s, 0, fim, -2.5, 2.5, Easing.linear), -2.5, 0]} />
      <AguaBaixo y={0} />
      <RaiosDeLuz y={0} />
      <Fundo y={-6} cor="#3e5040" />
      <Peixes y={-3} qtd={7} />
      <Bolhas origem={[0, -3, 0]} qtd={25} espalha={6} altura={4} semente={9} />
    </Palco>
  );
};

// =============== 3. TURTLE (1776) ===============
export const CenaTurtle = () => {
  const s = useSeg();
  const fim = duracaoCena('turtle');
  const tDavid = quandoDiz('turtle', 'L4', 'David');
  const tSub = quandoDiz('turtle', 'L4', 'submarino');
  const tL5 = inicioFala('turtle', 'L5') - 0.1;
  const tL6 = inicioFala('turtle', 'L6') - 0.1;
  const tBroca = quandoDiz('turtle', 'L6', 'broca');
  const tFimL6 = fimFala('turtle', 'L6');
  const planos: Plano[] = [
    {de: 0, pos: [[-3, 3.5, 13], [-1, 2.6, 10]], olha: [[2, 1.5, -4], [1, 1.2, -3]]},
    {de: tDavid, pos: [[-2.4, 1.6, 4.6], [0.6, 1.4, 5.4]], olha: [[-0.8, 0.4, 1], [-0.8, 0.5, 1]], fov: 45},
    {de: tSub, pos: [[0, 1.6, 3.4], [0, 1.5, 2.9]], olha: [[0, 1.0, 0], [0, 1.1, 0]], fov: 48},
    {de: tL5, pos: [[0, 1.9, 1.9], [0, 1.95, 1.5]], olha: [[0, 1.85, 0], [0, 1.9, 0]], fov: 40},
    {de: tL6, pos: [[-3, -3.2, 5], [-0.5, -2.6, 4]], olha: [[1, -0.8, -1], [1.5, -0.6, -1]], fov: 52},
    {de: tBroca, pos: [[2.5, -2, 3], [2.2, -1.9, 2.6]], olha: [[1.2, -0.9, -0.6], [1.2, -0.9, -0.6]], fov: 45},
  ];
  const cam = camNoTempo(planos, s, fim);

  if (cam.plano === 2 || cam.plano === 3) {
    // Dentro do Turtle: Ezra pedalando e girando manivelas
    const cansado = cam.plano === 3;
    return (
      <Palco clima="interior" pos={cam.pos} olha={cam.olha} fov={cam.fov} sombras={false}>
        <mesh>
          <sphereGeometry args={[2.4, 14, 12]} />
          <meshStandardMaterial color="#5a381c" side={1} roughness={1} flatShading />
        </mesh>
        <Bloquinho
          pose="manivela"
          velocidade={cansado ? 2.2 : 1}
          expressao={cansado ? 'cansado' : 'feliz'}
          falando={cansado && s >= tL5 + 0.1}
          suor={cansado}
          camisa="#3b6e3b"
          calca="#d8cfb8"
          chapeu="tricornio"
          corChapeu="#1e1e1e"
        />
        {/* Manivela girando na frente dele */}
        <group position={[0, 1.15, 0.75]} rotation={[0, 0, s * (cansado ? 14 : 6)]}>
          <mesh>
            <boxGeometry args={[0.5, 0.06, 0.06]} />
            <meshStandardMaterial color="#c9a227" metalness={0.8} />
          </mesh>
          <mesh position={[0.25, 0, 0.08]}>
            <boxGeometry args={[0.06, 0.06, 0.18]} />
            <meshStandardMaterial color="#c9a227" metalness={0.8} />
          </mesh>
        </group>
        <pointLight position={[0, 2.7, 0.6]} color="#ffd27a" intensity={14} distance={6} />
      </Palco>
    );
  }

  const submerso = cam.pos[1] < 0;
  const tremor = s > tBroca + 0.2 && s < tFimL6 ? Math.sin(s * 60) * 0.04 : 0;
  // Turtle: na superfície nos planos 0–1; embaixo do navio nos planos 4–5
  const turtlePos: V3 =
    cam.plano <= 1
      ? [-0.8, -0.3 + Math.sin(s * 2) * 0.05, 1]
      : [lerp(s, tL6, tBroca, -1, 1.2), lerp(s, tL6, tBroca, -2.6, -2.05) + tremor, -0.6];
  const bombaSolta = s > tFimL6 + 0.1;
  return (
    <Palco clima={submerso ? 'submersoEscuro' : 'noite'} pos={cam.pos} olha={cam.olha} fov={cam.fov}>
      {!submerso && <Noite />}
      <AguaCima cor="#0e2a4a" />
      <AguaBaixo y={-0.01} cor="#3a6f9a" />
      <NavioVela posicao={cam.plano <= 1 ? [6, 0.3, -9] : [1.5, -0.1, -1.2]} escala={cam.plano <= 1 ? 1 : 0.9} rotY={cam.plano <= 1 ? -0.3 : 0} />
      {cam.plano <= 1 && <pointLight position={[-0.3, 2.2, 2.6]} color="#ffd27a" intensity={10} distance={6} />}
      <Turtle posicao={turtlePos} escala={cam.plano <= 1 ? 1 : 0.7} rotY={cam.plano <= 1 ? s * 0.3 : 0.4} />
      {/* Bomba (barril) presa ao Turtle, depois solta e vai embora */}
      {cam.plano >= 4 && (
        <mesh position={bombaSolta ? [turtlePos[0] - 1 - (s - tFimL6) * 3, turtlePos[1] - 0.3, -0.6] : [turtlePos[0] - 0.9, turtlePos[1] - 0.2, -0.6]}>
          <cylinderGeometry args={[0.25, 0.25, 0.5, 10]} />
          <meshStandardMaterial color="#3b2a1a" />
        </mesh>
      )}
      {submerso && <Bolhas origem={[turtlePos[0], turtlePos[1], -0.6]} qtd={20} espalha={1} altura={2.5} />}
      {/* Faíscas da broca */}
      {cam.plano === 5 &&
        s > tBroca + 0.2 &&
        s < tFimL6 &&
        [0, 1, 2, 3, 4].map((i) => (
          <mesh key={i} position={[1.2 + Math.sin(s * 40 + i) * 0.25, -1.0 + Math.abs(Math.cos(s * 33 + i)) * 0.25, -0.5]} scale={0.05}>
            <boxGeometry args={[1, 1, 1]} />
            <meshBasicMaterial color="#fff2a0" />
          </mesh>
        ))}
      <Explosao posicao={[-6, -2.5, -4]} inicio={tFimL6 + 0.4} s={s} escala={1.2} />
      <Fundo y={-7} cor="#1d2a2a" />
    </Palco>
  );
};

// =============== 4. HUNLEY (1864) ===============
export const CenaHunley = () => {
  const s = useSeg();
  const fim = duracaoCena('hunley');
  const tPrimeiro = quandoDiz('hunley', 'L7', 'primeiro');
  const tImpacto = quandoDiz('hunley', 'L7', 'guerra');
  const tMas = quandoDiz('hunley', 'L7', 'mas');
  const planos: Plano[] = [
    {de: 0, pos: [[-4.5, -1.8, 7.5], [-2.5, -2.2, 7]], olha: [[-4.2, -2.6, 0], [-2, -2.6, 0]], fov: 50},
    {de: tPrimeiro, pos: [[2, -4.5, 9], [3, -4, 8]], olha: [[3, -1, 0], [4, -0.8, 0]], fov: 55},
    {de: tMas, pos: [[5, -3, 6], [4, -6, 5]], olha: [[3, -3, 0], [3, -7, 0]], fov: 50},
  ];
  const cam = camNoTempo(planos, s, fim);
  const avanca = lerp(s, 0, tImpacto, -5.5, -2.6, Easing.linear);
  const afundaSub = lerp(s, tMas, fim, 0, 1, Easing.in(Easing.quad));
  const afundaNavio = lerp(s, tImpacto + 0.3, tImpacto + 4, 0, 1);
  return (
    <Palco clima="submersoEscuro" pos={cam.pos} olha={cam.olha} fov={cam.fov}>
      <AguaBaixo y={0} cor="#2a4a6a" />
      <NavioVapor posicao={[5.5, -afundaNavio * 2.5, -1]} inclina={afundaNavio * 0.35} />
      <Hunley posicao={[avanca, -2.6 - afundaSub * 5, 0]} inclina={-afundaSub * 0.5} />
      <pointLight position={[avanca + 1, -1 - afundaSub * 5, 3]} color="#9fd0ff" intensity={20 * (1 - afundaSub * 0.7)} distance={12} />
      <Explosao posicao={[4.2, -0.9, -0.6]} inicio={tImpacto} s={s} escala={1.4} />
      <Bolhas origem={[avanca, -2.6 - afundaSub * 5, 0]} qtd={18} espalha={4} altura={3} semente={3} />
      <Fundo y={-10} cor="#121a1a" />
    </Palco>
  );
};

// =============== 5. HOLLAND (1900) ===============
export const CenaHolland = () => {
  const s = useSeg();
  const fim = duracaoCena('holland');
  const tHolland = quandoDiz('holland', 'L8', 'Holland');
  const tBaterias = quandoDiz('holland', 'L8', 'baterias');
  const tL9 = inicioFala('holland', 'L9') - 0.1;
  const mergulha = lerp(s, tBaterias, tBaterias + 1.5, 0, 1);
  const volta = lerp(s, tL9 + 0.4, tL9 + 1.4, 0, 1, Easing.out(Easing.back(1.6)));
  const planos: Plano[] = [
    {de: 0, pos: [[-7, 4, 12], [-4, 3, 10]], olha: [[0, 1.2, -3], [0, 1, -2]]},
    {de: tHolland, pos: [[-6, 1.4, 5], [-3, 1.2, 5.2]], olha: [[-1, 0.2, 0], [1, 0.2, 0]], fov: 45},
    {de: tBaterias, pos: [[4, 0.6, 6], [3, -3.2, 6]], olha: [[1, -0.3, 0], [1.5, -3, 0]], fov: 50},
    {de: tL9, pos: [[2.5, 2.4, 3.5], [2, 2.3, 2.8]], olha: [[-0.5, 1.6, -4], [-0.5, 1.7, -4]], fov: 48},
  ];
  const cam = camNoTempo(planos, s, fim);
  const xSub = cam.plano === 3 ? -2.6 : lerp(s, 0, tL9, -2, 3, Easing.linear);
  const ySub = cam.plano === 3 ? -2.5 + volta * 2.2 : -0.25 - mergulha * 3;
  return (
    <Palco clima={climaAgua(cam.pos, 'dia', 'submerso')} pos={cam.pos} olha={cam.olha} fov={cam.fov}>
      <AguaCima cor="#2f86c0" />
      <AguaBaixo y={-0.01} />
      <Pier posicao={[0, 0, -6]} />
      <SubHolland posicao={[xSub, ySub, cam.plano === 3 ? -1.8 : 0]} fumaca={mergulha < 0.2 && cam.plano < 3} />
      <Bloquinho
        posicao={[-0.5, 0.65, -5]}
        rotacaoY={cam.plano === 3 ? 0.3 : 0}
        pose={cam.plano === 3 ? (s > tL9 + 1.2 ? 'comemorar' : 'apontar') : 'parado'}
        falando={cam.plano === 3 && s >= tL9 + 0.1}
        camisa="#1f3a5f"
        chapeu="coco"
        corChapeu="#1a1a1a"
        bigode
      />
      <Bloquinho posicao={[2.5, 0.65, -5.6]} pose="acenar" camisa="#f1faee" chapeu="cabelo" corChapeu="#2b1d0e" fase={3} />
      <Bloquinho posicao={[-4.5, 0.65, -5.4]} pose="parado" camisa="#e63946" chapeu="cartola" fase={5} />
      {cam.plano === 3 && volta > 0 && volta < 1 && <Bolhas origem={[-2.6, -0.5, -1.8]} qtd={30} espalha={3} altura={1.5} />}
      {cam.pos[1] < 0 && <RaiosDeLuz y={0} />}
      <Fundo y={-7} />
    </Palco>
  );
};

// =============== 6. NAUTILUS (1954 / 1958) ===============
const Globo = ({s, inicio}: {s: number; inicio: number}) => {
  const giro = (s - inicio) * 0.25;
  const pontos = 26;
  const progresso = lerp(s, inicio + 0.5, inicio + 3.2, 0, 1);
  return (
    <group rotation={[0.55, giro, 0]}>
      <mesh>
        <icosahedronGeometry args={[3, 3]} />
        <meshStandardMaterial color="#1f6fb8" flatShading roughness={0.6} />
      </mesh>
      {/* Calota de gelo do Polo Norte */}
      <mesh position={[0, 2.7, 0]} rotation={[0, 0, 0]}>
        <cylinderGeometry args={[1.35, 1.6, 0.6, 12]} />
        <meshStandardMaterial color="#f2fbff" flatShading />
      </mesh>
      {/* Continentes em bloco */}
      {[
        [1.5, 1.5, 2],
        [-2, 1, 1.8],
        [2.4, -0.5, 1.2],
        [-1.2, -1.2, 2.4],
        [0.3, 0.6, -2.9],
      ].map(([x, y, z], i) => (
        <mesh key={i} position={[x, y, z]}>
          <boxGeometry args={[1.2, 0.9, 1.0]} />
          <meshStandardMaterial color="#4caf50" flatShading />
        </mesh>
      ))}
      {/* Rota passando pelo polo (do Pacífico ao Atlântico) */}
      {Array.from({length: pontos}, (_, i) => {
        const a = -1.1 + (i / (pontos - 1)) * 2.2;
        if (i / pontos > progresso) return null;
        return (
          <mesh key={i} position={[Math.sin(a) * 3.35, Math.cos(a) * 3.35, 0]} scale={0.09}>
            <boxGeometry args={[1, 1, 1]} />
            <meshBasicMaterial color="#ffd23f" />
          </mesh>
        );
      })}
    </group>
  );
};

export const CenaNautilus = () => {
  const s = useSeg();
  const fim = duracaoCena('nautilus');
  const tPrimeiro = quandoDiz('nautilus', 'L10', 'primeiro');
  const t1958 = quandoDiz('nautilus', 'L10', '1958');
  const planos: Plano[] = [
    {de: 0, pos: [[-9, -2, 10], [-4, -2.5, 9]], olha: [[-2, -3, 0], [1, -3, 0]], fov: 55},
    {de: tPrimeiro, pos: [[-7, -4.6, 9], [-3, -4.3, 8]], olha: [[1, -2.8, 0], [2, -2.6, 0]], fov: 55},
    {de: t1958, pos: [[0, 1, 13], [0, 0.5, 10.5]], olha: [[0, 0.5, 0], [0, 0.6, 0]], fov: 45},
  ];
  const cam = camNoTempo(planos, s, fim);
  if (cam.plano === 2) {
    return (
      <Palco clima="espaco" pos={cam.pos} olha={cam.olha} fov={cam.fov} sombras={false}>
        <Noite />
        <Globo s={s} inicio={t1958} />
      </Palco>
    );
  }
  const x = lerp(s, 0, t1958, -6, 6, Easing.linear);
  return (
    <Palco clima="artico" pos={cam.pos} olha={cam.olha} fov={cam.fov}>
      {cam.plano === 1 && <Gelo y={-1.2} />}
      {cam.plano === 1 && <RaiosDeLuz y={-1} />}
      <AguaBaixo y={cam.plano === 1 ? -1.25 : 0} cor="#7fc9e6" />
      <Nautilus posicao={[x, cam.plano === 1 ? -3.4 : -3, 0]} escala={cam.plano === 1 ? 0.9 : 1} />
      <Bolhas origem={[x - 5, -3, 0]} qtd={20} espalha={2} altura={3} />
      <Fundo y={-12} cor="#0f2a2a" />
    </Palco>
  );
};

// =============== 7. FINAL: linha do tempo ===============
export const CenaFinal = () => {
  const s = useSeg();
  const fim = duracaoCena('final');
  const planos: Plano[] = [
    {de: 0, pos: [[-9, 3.2, 10], [6, 3.2, 10]], olha: [[-8, 0.8, 0], [7, 0.8, 0]], fov: 45},
    {de: fim * 0.62, pos: [[0, 4, 19], [0, 4.5, 21]], olha: [[0, 1, 0], [0, 1, 0]], fov: 50},
  ];
  const cam = camNoTempo(planos, s, fim);
  const pedestal = (x: number, cor: string) => (
    <mesh position={[x, -0.4, 0]} receiveShadow castShadow>
      <boxGeometry args={[3.2, 0.8, 3]} />
      <meshStandardMaterial color={cor} />
    </mesh>
  );
  return (
    <Palco clima="estudio" pos={cam.pos} olha={cam.olha} fov={cam.fov}>
      <mesh position={[0, -0.81, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[80, 40]} />
        <meshStandardMaterial color="#ffd7a8" />
      </mesh>
      {pedestal(-8, '#e63946')}
      {pedestal(-4, '#f4a261')}
      {pedestal(0, '#2a9d8f')}
      {pedestal(4, '#457b9d')}
      {pedestal(8, '#1d3557')}
      <group position={[-8, 0.5, 0]} scale={0.6} rotation={[0, s * 0.5, 0]}>
        <BarcoDrebbel remando={false} />
      </group>
      <Turtle posicao={[-4, 1.1, 0]} escala={0.8} rotY={s * 0.5} />
      <group position={[0, 0.8, 0]} scale={0.45} rotation={[0, s * 0.5, 0]}>
        <Hunley />
      </group>
      <group position={[4, 0.8, 0]} scale={0.6} rotation={[0, s * 0.5, 0]}>
        <SubHolland />
      </group>
      <group position={[8, 0.9, 0]} rotation={[0, s * 0.5, 0]}>
        <Nautilus escala={0.42} />
      </group>
    </Palco>
  );
};
