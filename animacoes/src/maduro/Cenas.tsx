import {Easing, interpolate, useCurrentFrame} from 'remotion';
import {AguaCima, Noite} from '../submarino/Ambiente';
import {camNoTempo, type Plano, type V3} from '../submarino/camera';
import {Palco} from '../submarino/Palco';
import {
  Agente,
  Caca,
  Caracas,
  Cilia,
  Complexo,
  Delcy,
  Helicoptero,
  Juiz,
  Lancha,
  Maduro,
  MaduroPreso,
  Mapa,
  NavioAnfibio,
  PortaAvioes,
  Soldado,
  Trump,
  Tribunal,
} from './Modelos';
import {FPS, duracaoCena, quandoDiz} from './roteiro';

const lerp = (s: number, a: number, b: number, de: number, para: number, easing = Easing.inOut(Easing.quad)) =>
  interpolate(s, [a, b], [de, para], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing});
const useSeg = () => useCurrentFrame() / FPS;

const Explosao = ({posicao, inicio, s, escala = 1}: {posicao: V3; inicio: number; s: number; escala?: number}) => {
  const t = s - inicio;
  if (t < 0 || t > 2.2) return null;
  const k = lerp(t, 0, 0.5, 0.2, 2.4, Easing.out(Easing.cubic)) * escala;
  const op = lerp(t, 0.3, 2.2, 1, 0);
  return (
    <group position={posicao}>
      <mesh scale={k}>
        <icosahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color="#ffb03b" emissive="#ff6a00" emissiveIntensity={3} transparent opacity={op} flatShading />
      </mesh>
      <mesh scale={[k * 0.9, k * 2.2, k * 0.9]} position={[0, k * 1.4, 0]}>
        <icosahedronGeometry args={[0.8, 0]} />
        <meshStandardMaterial color="#3a3a3a" transparent opacity={op * 0.7} flatShading />
      </mesh>
      <pointLight color="#ff9a3b" intensity={op * 80} distance={30} />
    </group>
  );
};

// Holofote varrendo o céu
const Holofote = ({posicao, fase = 0}: {posicao: V3; fase?: number}) => {
  const frame = useCurrentFrame();
  return (
    <mesh position={posicao} rotation={[0, 0, Math.sin(frame * 0.03 + fase) * 0.5]}>
      <coneGeometry args={[1.2, 14, 12, 1, true]} />
      <meshBasicMaterial color="#cfe6ff" transparent opacity={0.07} depthWrite={false} />
    </mesh>
  );
};

// ===== 0. GANCHO: Caracas de madrugada, helicópteros chegando =====
export const CenaGancho = () => {
  const s = useSeg();
  const fim = duracaoCena('gancho');
  const t2 = quandoDiz('gancho', 'L0', 'Em');
  const planos: Plano[] = [
    {de: 0, pos: [[0, 6, 22], [0, 4.5, 16]], olha: [[0, 3, -4], [0, 2.5, -4]], fov: 50},
    {de: t2, pos: [[-6, 2, 9], [4, 2.5, 8]], olha: [[0, 4, -2], [2, 4.5, -2]], fov: 48},
  ];
  const cam = camNoTempo(planos, s, fim);
  return (
    <Palco clima="noite" pos={cam.pos} olha={cam.olha} fov={cam.fov}>
      <Noite />
      <Caracas z={-6} />
      <Holofote posicao={[-6, 7, -6]} />
      <Holofote posicao={[7, 7, -7]} fase={2} />
      {[0, 1, 2].map((i) => (
        <Helicoptero key={i} posicao={[lerp(s, 0, fim, -18 + i * 3, 10 + i * 2, Easing.linear), 6 + i * 1.2, -2 - i * 2]} escala={0.6} inclina={-0.12} />
      ))}
      <Explosao posicao={[6, 1, -9]} inicio={t2 + 0.5} s={s} escala={1.4} />
      <Explosao posicao={[-8, 1, -11]} inicio={t2 + 2.2} s={s} />
    </Palco>
  );
};

// ===== 1. CONTEXTO: cartaz de procurado =====
export const CenaContexto = () => {
  const s = useSeg();
  const fim = duracaoCena('contexto');
  const tAgosto = quandoDiz('contexto', 'L1', 'agosto');
  const planos: Plano[] = [
    {de: 0, pos: [[0, 1.9, 6], [0, 1.9, 4.6]], olha: [[0, 1.6, 0], [0, 1.6, 0]], fov: 45},
    {de: tAgosto, pos: [[2.5, 1.6, 4.5], [1.2, 1.7, 3.6]], olha: [[0, 1.3, 0], [0, 1.4, 0]], fov: 45},
  ];
  const cam = camNoTempo(planos, s, fim);
  return (
    <Palco clima="interior" pos={cam.pos} olha={cam.olha} fov={cam.fov} sombras={false}>
      {/* parede com cartaz */}
      <mesh position={[0, 2, -1]}>
        <boxGeometry args={[12, 8, 0.2]} />
        <meshStandardMaterial color="#3a3226" />
      </mesh>
      <mesh position={[0, 1.7, -0.85]}>
        <boxGeometry args={[2.6, 3.4, 0.05]} />
        <meshStandardMaterial color="#e9dcc0" />
      </mesh>
      <mesh position={[0, 3.05, -0.82]}>
        <boxGeometry args={[2.2, 0.35, 0.02]} />
        <meshStandardMaterial color="#8b1a1a" />
      </mesh>
      <group position={[0, -0.3, -0.7]} scale={0.95}>
        <Maduro expressao="serio" />
      </group>
      <spotLight position={[0, 5, 3]} angle={0.5} penumbra={0.6} intensity={60} color="#ffe0b0" target-position={[0, 1.5, -1]} />
      <pointLight position={[1.5, 2.5, 2]} intensity={6} color="#ffb070" />
    </Palco>
  );
};

// ===== 2. PORTA-AVIÕES no Caribe =====
export const CenaPortaAvioes = () => {
  const s = useSeg();
  const fim = duracaoCena('portaavioes');
  const tBarcos = quandoDiz('portaavioes', 'L2', 'Barcos');
  const planos: Plano[] = [
    {de: 0, pos: [[-22, 7, 18], [-12, 5, 16]], olha: [[0, 1, 0], [2, 1, 0]], fov: 45},
    {de: tBarcos, pos: [[17, 2.2, 8], [19, 2.2, 7.5]], olha: [[22, 0.4, 1], [24, 0.4, 1]], fov: 42},
  ];
  const cam = camNoTempo(planos, s, fim);
  return (
    <Palco clima="dia" pos={cam.pos} olha={cam.olha} fov={cam.fov}>
      <AguaCima cor="#2a7fb5" />
      <PortaAvioes posicao={[lerp(s, 0, fim, -3, 2, Easing.linear), 0, 0]} />
      <Caca posicao={[lerp(s, 0, tBarcos, -12, 14), 6, -2]} escala={0.9} />
      <Caca posicao={[lerp(s, 0.5, tBarcos + 0.5, -14, 12), 7, 1]} escala={0.9} />
      <Lancha posicao={[lerp(s, tBarcos, fim, 20, 25, Easing.linear), 0.1, 1]} />
      <Explosao posicao={[24.5, 0.3, 1]} inicio={tBarcos + 1.6} s={s} escala={0.7} />
    </Palco>
  );
};

// ===== 3. CIA monitorando + Trump dá sinal verde =====
export const CenaCia = () => {
  const s = useSeg();
  const fim = duracaoCena('cia');
  const tTrump = quandoDiz('cia', 'L3', 'Pouco');
  const planos: Plano[] = [
    {de: 0, pos: [[0, 11, 9], [0, 9, 6]], olha: [[0.5, 0, 2.5], [0.5, 0, 3]], fov: 48},
    {de: tTrump, pos: [[0, 2.1, 5], [0, 2.0, 4.2]], olha: [[0, 1.5, 0], [0, 1.6, 0]], fov: 45},
  ];
  const cam = camNoTempo(planos, s, fim);
  if (cam.plano === 0) {
    return (
      <Palco clima="espaco" pos={cam.pos} olha={cam.olha} fov={cam.fov} sombras={false}>
        <Mapa destaque="venezuela" />
        <pointLight position={[0, 6, 4]} intensity={30} color="#9fd0ff" />
      </Palco>
    );
  }
  return (
    <Palco clima="interior" pos={cam.pos} olha={cam.olha} fov={cam.fov} sombras={false}>
      <mesh position={[0, 3, -2]}>
        <boxGeometry args={[12, 8, 0.2]} />
        <meshStandardMaterial color="#e8dcc0" />
      </mesh>
      {/* mesa */}
      <mesh position={[0, 0.5, 0.9]}>
        <boxGeometry args={[3.2, 1, 1.3]} />
        <meshStandardMaterial color="#5a3820" />
      </mesh>
      {/* bandeiras */}
      {[-1.8, 1.8].map((x, i) => (
        <group key={x} position={[x, 0, -1.4]}>
          <mesh position={[0, 1.5, 0]}>
            <boxGeometry args={[0.06, 3, 0.06]} />
            <meshStandardMaterial color="#c9a227" />
          </mesh>
          <mesh position={[0.45, 2.4, 0]}>
            <boxGeometry args={[0.9, 0.7, 0.04]} />
            <meshStandardMaterial color={i ? '#1c2a6a' : '#b22234'} />
          </mesh>
        </group>
      ))}
      <Trump posicao={[0, 0, 0]} pose={s > tTrump + 0.8 ? 'apontar' : 'parado'} expressao="serio" />
      <Agente posicao={[-1.8, 0, 0.6]} rotacaoY={0.6} fase={2} />
      <pointLight position={[0, 3, 3]} intensity={12} color="#ffe6c0" />
    </Palco>
  );
};

// ===== 4. ATAQUE: aeronaves e explosões =====
export const CenaAtaque = () => {
  const s = useSeg();
  const fim = duracaoCena('ataque');
  const tExpl = quandoDiz('ataque', 'L4', 'Explosões');
  const planos: Plano[] = [
    {de: 0, pos: [[-6, 9, 10], [-2, 8, 8]], olha: [[4, 7, -6], [8, 6, -6]], fov: 55},
    {de: tExpl - 0.2, pos: [[0, 5, 18], [0, 4, 15]], olha: [[0, 2, -6], [0, 2, -6]], fov: 50},
  ];
  const cam = camNoTempo(planos, s, fim);
  return (
    <Palco clima="noite" pos={cam.pos} olha={cam.olha} fov={cam.fov}>
      <Noite />
      <Caracas z={-8} luzes={cam.plano === 0 ? 1 : 0.6} />
      {Array.from({length: 7}, (_, i) => (
        <Caca key={i} posicao={[lerp(s, i * 0.35, fim, -3 + (i % 3) * 2, 26 + (i % 3) * 2, Easing.linear), 6.5 + (i % 4) * 0.7, -3 - i * 1.2]} escala={0.8} />
      ))}
      {[0, 1].map((i) => (
        <Helicoptero key={i} posicao={[lerp(s, 0, fim, -12 + i * 4, 6 + i * 4, Easing.linear), 4.5 + i, 1 - i * 2]} escala={0.55} inclina={-0.15} />
      ))}
      <Explosao posicao={[-6, 1, -10]} inicio={tExpl} s={s} escala={1.5} />
      <Explosao posicao={[4, 1, -12]} inicio={tExpl + 0.7} s={s} escala={1.8} />
      <Explosao posicao={[11, 1, -9]} inicio={tExpl + 1.4} s={s} escala={1.3} />
      <Holofote posicao={[-3, 7, -8]} />
    </Palco>
  );
};

// ===== 5. CAPTURA =====
export const CenaCaptura = () => {
  const s = useSeg();
  const fim = duracaoCena('captura');
  const tCap = quandoDiz('captura', 'L5', 'capturaram');
  const planos: Plano[] = [
    {de: 0, pos: [[10, 7, 14], [7, 5, 11]], olha: [[2, 1, -1], [2, 1, -1]], fov: 48},
    {de: tCap - 0.3, pos: [[3.5, 2.2, 6], [3, 2, 5]], olha: [[1.5, 1.3, 0], [2.5, 1.3, 0]], fov: 45},
  ];
  const cam = camNoTempo(planos, s, fim);
  const pousou = lerp(s, 0, 2, 6, 0.9);
  const anda = lerp(s, tCap, fim, 0, 2.4, Easing.linear);
  return (
    <Palco clima="noite" pos={cam.pos} olha={cam.olha} fov={cam.fov}>
      <Noite />
      <Complexo />
      <Helicoptero posicao={[4.5, pousou, 1.5]} rotY={Math.PI / 2} escala={0.8} />
      {cam.plano === 0 &&
        [0, 1, 2, 3].map((i) => (
          <Soldado key={i} posicao={[lerp(s, 1.5, 4, 4 - i * 0.6, 0.5 - i * 0.7), 0, lerp(s, 1.5, 4, 2, -0.2)]} rotacaoY={Math.PI} pose="andar" fase={i} escala={0.8} />
        ))}
      {cam.plano === 1 && (
        <>
          <Soldado posicao={[0.2 + anda, 0, 0.6]} rotacaoY={Math.PI / 2} pose="andar" fase={1} />
          <MaduroPreso posicao={[0.9 + anda, 0, 0]} rotacaoY={Math.PI / 2} pose="andar" expressao="serio" />
          <Soldado posicao={[1.8 + anda, 0, -0.5]} rotacaoY={Math.PI / 2} pose="andar" fase={3} />
          <Cilia posicao={[-0.4 + anda, 0, -0.5]} rotacaoY={Math.PI / 2} pose="andar" expressao="serio" escala={0.92} />
          <Soldado posicao={[-1.2 + anda, 0, 0.2]} rotacaoY={Math.PI / 2} pose="andar" fase={5} />
        </>
      )}
      <pointLight position={[4.5, 3, 3]} intensity={18} color="#ffffff" />
      <pointLight position={[0, 2.5, 2]} intensity={10} color="#9fc4ff" />
    </Palco>
  );
};

// ===== 6. IWO JIMA e rota até Nova York =====
export const CenaIwoJima = () => {
  const s = useSeg();
  const fim = duracaoCena('iwojima');
  const tNY = quandoDiz('iwojima', 'L6', 'Nova');
  const planos: Plano[] = [
    {de: 0, pos: [[-15, 5, 13], [-10, 4, 12]], olha: [[-1, 1.2, -1], [-1, 1.2, -1]], fov: 45},
    {de: tNY - 0.6, pos: [[0, 14, 6], [0, 15, 3]], olha: [[1, 0, -1.5], [1, 0, -2]], fov: 50},
  ];
  const cam = camNoTempo(planos, s, fim);
  if (cam.plano === 1) {
    return (
      <Palco clima="espaco" pos={cam.pos} olha={cam.olha} fov={cam.fov} sombras={false}>
        <Mapa destaque="rota" progresso={lerp(s, tNY - 0.4, fim, 0, 1)} />
        <pointLight position={[0, 8, 4]} intensity={30} color="#9fd0ff" />
      </Palco>
    );
  }
  return (
    <Palco clima="noite" pos={cam.pos} olha={cam.olha} fov={cam.fov}>
      <Noite />
      <AguaCima cor="#0e2a4a" />
      <NavioAnfibio posicao={[0, 0, -1]} />
      <Helicoptero posicao={[lerp(s, 0, 2.5, -14, -3), lerp(s, 0, 2.5, 6, 2.2), -1]} escala={0.7} />
      <pointLight position={[-3, 5, 4]} intensity={45} distance={25} color="#ffffff" />
      <pointLight position={[4, 5, 4]} intensity={30} distance={25} color="#cfe0ff" />
      <hemisphereLight args={['#7fa6d8', '#1a1a1a', 1.2]} />
    </Palco>
  );
};

// ===== 7. ANÚNCIO (o celular entra pelo Overlay) =====
export const CenaAnuncio = () => {
  const s = useSeg();
  const fim = duracaoCena('anuncio');
  const cam = camNoTempo([{de: 0, pos: [[-4, 3, 14], [4, 3, 13]], olha: [[0, 2, -4], [0, 2, -4]], fov: 50}], s, fim);
  return (
    <Palco clima="dia" pos={cam.pos} olha={cam.olha} fov={cam.fov}>
      <Caracas z={-6} luzes={0} />
    </Palco>
  );
};

// ===== 8. TRIBUNAL em Manhattan =====
export const CenaTribunal = () => {
  const s = useSeg();
  const fim = duracaoCena('tribunal');
  const tInocente = quandoDiz('tribunal', 'L8', 'inocente');
  const planos: Plano[] = [
    {de: 0, pos: [[0, 4, 11], [0, 3.5, 9]], olha: [[0, 2, -2], [0, 2, -2]], fov: 48},
    {de: tInocente - 0.4, pos: [[1.5, 2.2, 5.2], [1.2, 2.1, 4.6]], olha: [[0, 1.6, 1.8], [0, 1.6, 1.8]], fov: 42},
  ];
  const cam = camNoTempo(planos, s, fim);
  return (
    <Palco clima="interior" pos={cam.pos} olha={cam.olha} fov={cam.fov} sombras={false}>
      <Tribunal />
      <Juiz posicao={[0, 1.1, -3.6]} expressao="serio" />
      <MaduroPreso posicao={[0.5, 0, 2.2]} rotacaoY={Math.PI * 0.95} expressao="serio" pose={s > tInocente ? 'apontar' : 'parado'} />
      <Cilia posicao={[-1.1, 0, 2.3]} rotacaoY={Math.PI} expressao="serio" escala={0.92} />
      <Agente posicao={[1.8, 0, 2.4]} rotacaoY={Math.PI} fase={4} />
      <pointLight position={[0, 6, 3]} intensity={30} color="#fff2dc" />
    </Palco>
  );
};

// ===== 9. DELCY RODRÍGUEZ assume =====
export const CenaDelcy = () => {
  const s = useSeg();
  const fim = duracaoCena('delcy');
  const tVenezuela = quandoDiz('delcy', 'L9', 'Venezuela');
  const planos: Plano[] = [
    {de: 0, pos: [[0, 2, 4.2], [0, 2, 3.4]], olha: [[0, 1.8, 0], [0, 1.8, 0]], fov: 42},
    {de: tVenezuela - 0.3, pos: [[2.5, 2.4, 7], [1, 2.2, 6]], olha: [[0, 1.6, 0], [0, 1.7, 0]], fov: 45},
  ];
  const cam = camNoTempo(planos, s, fim);
  if (cam.plano === 0) {
    return (
      <Palco clima="interior" pos={cam.pos} olha={cam.olha} fov={cam.fov} sombras={false}>
        <mesh position={[0, 2, -1.5]}>
          <boxGeometry args={[8, 6, 0.1]} />
          <meshStandardMaterial color="#2a2d33" />
        </mesh>
        <MaduroPreso expressao="bravo" falando />
        <pointLight position={[0, 3.5, 2]} intensity={10} color="#ffffff" />
      </Palco>
    );
  }
  return (
    <Palco clima="dia" pos={cam.pos} olha={cam.olha} fov={cam.fov}>
      <mesh position={[0, 3, -3]}>
        <boxGeometry args={[14, 6, 0.4]} />
        <meshStandardMaterial color="#efe3c4" />
      </mesh>
      {[-4.5, -1.5, 1.5, 4.5].map((x) => (
        <mesh key={x} position={[x, 3, -2.6]}>
          <boxGeometry args={[0.6, 6, 0.6]} />
          <meshStandardMaterial color="#fff6e0" />
        </mesh>
      ))}
      {/* bandeira da Venezuela */}
      <group position={[-2.6, 0, -1.8]}>
        <mesh position={[0, 1.6, 0]}>
          <boxGeometry args={[0.06, 3.2, 0.06]} />
          <meshStandardMaterial color="#c9a227" />
        </mesh>
        {['#f4c300', '#0033a0', '#cf142b'].map((c, i) => (
          <mesh key={c} position={[0.55, 2.9 - i * 0.25, 0]}>
            <boxGeometry args={[1.1, 0.25, 0.03]} />
            <meshStandardMaterial color={c} />
          </mesh>
        ))}
      </group>
      <mesh position={[0, 0.5, 0.2]}>
        <boxGeometry args={[1.6, 1, 0.6]} />
        <meshStandardMaterial color="#5a3820" />
      </mesh>
      <Delcy posicao={[0, 0, -0.6]} pose={s > tVenezuela + 1 ? 'acenar' : 'parado'} expressao="serio" />
      <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial color="#8a2a2a" />
      </mesh>
    </Palco>
  );
};

// ===== 10. DEBATE: globo e reações =====
export const CenaDebate = () => {
  const s = useSeg();
  const fim = duracaoCena('debate');
  const cam = camNoTempo([{de: 0, pos: [[0, 1, 12], [0, 0.6, 9.5]], olha: [[0, 0.5, 0], [0, 0.5, 0]], fov: 45}], s, fim);
  return (
    <Palco clima="espaco" pos={cam.pos} olha={cam.olha} fov={cam.fov} sombras={false}>
      <Noite />
      <group rotation={[0.35, s * 0.2, 0]}>
        <mesh>
          <icosahedronGeometry args={[3, 3]} />
          <meshStandardMaterial color="#1f6fb8" flatShading />
        </mesh>
        {[
          [1.2, 2, 2.1],
          [-2.1, 1, 1.9],
          [2.3, -0.6, 1.5],
          [-1.1, -1.4, 2.4],
          [0.4, 0.4, -2.95],
          [-2.4, 0.6, -1.6],
        ].map(([x, y, z], i) => (
          <mesh key={i} position={[x, y, z]}>
            <boxGeometry args={[1.3, 1, 1.1]} />
            <meshStandardMaterial color="#4caf50" flatShading />
          </mesh>
        ))}
      </group>
      <pointLight position={[4, 4, 6]} intensity={40} />
    </Palco>
  );
};

// ===== 11. FINAL =====
export const CenaFinal = () => {
  const s = useSeg();
  const fim = duracaoCena('final');
  const cam = camNoTempo([{de: 0, pos: [[0, 3, 16], [0, 3.5, 19]], olha: [[0, 2, -4], [0, 2, -4]], fov: 50}], s, fim);
  return (
    <Palco clima="noite" pos={cam.pos} olha={cam.olha} fov={cam.fov}>
      <Noite />
      <Caracas z={-6} />
    </Palco>
  );
};
