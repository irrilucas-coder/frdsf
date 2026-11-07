import {Easing, interpolate, useCurrentFrame} from 'remotion';
import {camNoTempo, type Plano, type V3} from '../submarino/camera';
import {Palco} from '../submarino/Palco';
import {Bloquinho} from '../submarino/Bloquinho';
import {B} from '../freio/Modelos';
import {Banco, Bola, Camisa, Celular, Coletiva, Cristiano, CristianoJovem, Documento, Estadio, Sala, Tecnico, Trofeu, Vestiario} from './Modelos';
import {FPS, duracaoCena, quandoDiz, type CenaId} from './roteiro';

const lerp = (s: number, a: number, b: number, de: number, para: number, easing = Easing.inOut(Easing.quad)) =>
  interpolate(s, [a, b], [de, para], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing});
const useSeg = () => useCurrentFrame() / FPS;
const R = quandoDiz;
const D = duracaoCena;
const cam = (id: CenaId, planos: Plano[], s: number) => camNoTempo(planos, s, D(id));

// Confete caindo
const Confete = ({s, n = 70, area = 8, cores = ['#c8102e', '#0b6b3a', '#ffd23f', '#ffffff']}: {s: number; n?: number; area?: number; cores?: string[]}) => (
  <>
    {Array.from({length: n}, (_, i) => {
      const x = ((i * 73) % 100) / 100 - 0.5;
      const z = ((i * 37) % 100) / 100 - 0.5;
      const y = 7 - ((s * (1.2 + (i % 5) * 0.2) + i * 0.37) % 7.5);
      return (
        <mesh key={i} position={[x * area, y, z * area * 0.6]} rotation={[s * 3 + i, s * 2 + i * 0.5, 0]}>
          <planeGeometry args={[0.12, 0.08]} />
          <meshStandardMaterial color={cores[i % cores.length]} side={2} emissive={cores[i % cores.length]} emissiveIntensity={0.3} />
        </mesh>
      );
    })}
  </>
);

// ===== 0. GANCHO: estádio lotado, ele de costas com a 7 =====
export const CenaGancho = () => {
  const s = useSeg();
  const tNome = R('gancho', 'L0', 'Cristiano');
  const c = cam('gancho', [
    {de: 0, pos: [[0.4, 1.4, -7], [0.2, 1.7, -3.4]], olha: [[0, 1.5, 0], [0, 1.4, 0]], fov: 42},
    {de: tNome, pos: [[1.4, 1.9, 3.6], [0.7, 1.85, 2.7]], olha: [[0, 1.9, 0], [0, 1.95, 0]], fov: 38},
  ], s);
  return (
    <Palco cinema clima="noite" pos={c.pos} olha={c.olha} fov={c.fov} sombras={false}>
      <Estadio />
      <Cristiano expressao={s > tNome ? 'triste' : 'serio'} rotacaoY={0} />
    </Palco>
  );
};

// ===== 1. O ANÚNCIO: vídeo gravado em casa =====
export const CenaAnuncio = () => {
  const s = useSeg();
  const tFrase = R('anuncio', 'L1', 'Portugal');
  const c = cam('anuncio', [
    {de: 0, pos: [[-2.4, 2.0, 4.0], [-1.7, 1.95, 3.3]], olha: [[0.1, 1.7, 0], [0.1, 1.75, 0]], fov: 40},
    {de: tFrase - 0.1, pos: [[-1.0, 2.0, 2.2], [-0.8, 2.0, 1.85]], olha: [[0, 1.95, 0], [0, 1.95, 0]], fov: 36},
  ], s);
  return (
    <Palco cinema clima="interior" pos={c.pos} olha={c.olha} fov={c.fov} sombras={false}>
      <Sala />
      <group position={[0, 0, 0]}>
        <Cristiano kit="treino" numero={undefined} falando={s > 0.3} expressao={s > tFrase ? 'emocionado' : 'serio'} alvoMaoD={[0.62, 1.68, 0.72]} />
        <Celular pos={[0.62, 1.7, 0.76]} rot={[0, Math.PI + 0.75, 0]} />
      </group>
      <pointLight position={[0.3, 2.2, 1.6]} intensity={6} color="#cfe8ff" />
      <pointLight position={[-2, 3, 2]} intensity={10} color="#ffd9a8" />
    </Palco>
  );
};

// ===== 2. ESTREIA 2003: garoto correndo em campo =====
export const CenaEstreia = () => {
  const s = useSeg();
  const x = -5 + s * 2.6;
  const c: {pos: V3; olha: V3} = {pos: [x + 1.2, 1.5, 4.6 - s * 0.2], olha: [x + 0.4, 1.3, 0]};
  return (
    <Palco cinema clima="dia" pos={c.pos} olha={c.olha} fov={42} sombras={false}>
      <Estadio cores={['#c8102e', '#0b6b3a', '#ffd23f', '#f2f2f2']} />
      <CristianoJovem posicao={[x, 0, 0]} rotacaoY={Math.PI / 2} pose="correr" expressao="feliz" velocidade={1.2} />
      <Bola pos={[x + 0.7, 0.17, 0.15]} giro={s * 12} />
      <directionalLight position={[5, 10, 6]} intensity={1.2} />
    </Palco>
  );
};

// ===== 3. TÍTULOS: levantando a taça =====
export const CenaTitulos = () => {
  const s = useSeg();
  const tLigas = R('titulos', 'L3', 'Ligas');
  const pulo = Math.abs(Math.sin(s * 4)) * 0.22;
  const c = cam('titulos', [
    {de: 0, pos: [[0, 1.0, 5.5], [0, 1.3, 4.2]], olha: [[0, 2.3, 0], [0, 2.4, 0]], fov: 44},
    {de: tLigas, pos: [[3.5, 2.2, 5.5], [2.6, 2.0, 4.6]], olha: [[0, 1.8, 0], [0, 1.9, 0]], fov: 44},
  ], s);
  return (
    <Palco cinema clima="noite" pos={c.pos} olha={c.olha} fov={c.fov} sombras={false}>
      <Estadio />
      <group position={[0, pulo, 0]}>
        <Cristiano expressao="feliz" alvoMaoE={[-0.34, 2.6, 0.16]} alvoMaoD={[0.34, 2.6, 0.16]} />
        <Trofeu pos={[0, 2.32, 0.13]} escala={1.6} />
      </group>
      {s > tLigas - 0.3 && (
        <>
          <Bloquinho posicao={[-1.6, 0, -0.6]} corpo="magro" cabeca="redonda" cabelo="black" corCabelo="#141414" pele="#8a5a3c" camisa="#c8102e" manga="#c8102e" calca="#0b6b3a" meia="#c8102e" sapato="#f2f2f2" pose="comemorar" fase={2} olhos="grandes" />
          <Bloquinho posicao={[1.7, 0, -0.5]} corpo="padrao" cabeca="larga" cabelo="moicano" corCabelo="#3a2a1a" barba="curta" pele="#e8b48a" camisa="#c8102e" manga="#c8102e" calca="#0b6b3a" meia="#c8102e" sapato="#f2f2f2" pose="comemorar" fase={5} />
        </>
      )}
      <Confete s={s} />
      <pointLight position={[0, 5, 3]} intensity={30} color="#fff2d0" />
    </Palco>
  );
};

// ===== 4. RECORDES: chute, gol e comemoração =====
export const CenaRecordes = () => {
  const s = useSeg();
  const tCento = R('recordes', 'L4', 'cento');
  const saida = 17 / FPS; // pé encosta na bola
  const chegada = saida + 0.55;
  const tb = lerp(s, saida, chegada, 0, 1, Easing.out(Easing.quad));
  const bola: V3 = s < saida ? [21.5, 0.17, 0.2] : [21.5 + tb * 10.8, 0.17 + Math.sin(tb * Math.PI) * 1.2 + tb * 0.9, 0.2 + tb * 1.6];
  // depois do gol: corre, pula girando e cai no "siu"
  const tPulo = 1.6;
  const giro = lerp(s, tPulo, tPulo + 0.55, 0, Math.PI);
  const altura = s > tPulo && s < tPulo + 0.55 ? Math.sin(((s - tPulo) / 0.55) * Math.PI) * 0.9 : 0;
  const pose = s < 1.0 ? 'chutar' : s < tPulo ? 'parado' : 'siu';
  const c = cam('recordes', [
    {de: 0, pos: [[16.6, 2.5, 2.6], [17.2, 2.4, 2.4]], olha: [[25, 1.0, 0.3], [27, 1.3, 0.6]], fov: 46},
    {de: 1.25, pos: [[17.6, 1.9, 1.8], [18.0, 1.9, 1.6]], olha: [[21.5, 1.5, 0.2], [21.5, 1.6, 0.2]], fov: 44},
    {de: tCento, pos: [[18.6, 1.5, 2.4], [19.2, 1.7, 1.8]], olha: [[21.5, 1.8, 0.2], [21.5, 1.85, 0.2]], fov: 42},
  ], s);
  return (
    <Palco cinema clima="noite" pos={c.pos} olha={c.olha} fov={c.fov} sombras={false}>
      <Estadio />
      <group position={[21.5, altura, 0.2]} rotation={[0, Math.PI / 2 + giro, 0]}>
        <Cristiano pose={pose} expressao={pose === 'siu' ? 'feliz' : 'serio'} />
      </group>
      <Bola pos={bola} giro={s * 15} />
      <pointLight position={[24, 5, 2]} intensity={25} color="#fff2d0" />
    </Palco>
  );
};

// ===== 5. COPA 2026: eliminação nos acréscimos =====
export const CenaCopa = () => {
  const s = useSeg();
  const c = cam('copa', [{de: 0, pos: [[1.6, 2.2, 5.0], [0.8, 2.0, 3.4]], olha: [[0, 1.8, 0], [0, 1.9, 0]], fov: 40}], s);
  return (
    <Palco cinema clima="noite" pos={c.pos} olha={c.olha} fov={c.fov} sombras={false}>
      <Estadio cores={['#c60b1e', '#ffc400', '#c60b1e', '#f2f2f2']} />
      <Cristiano expressao="triste" alvoMaoE={[-0.22, 2.25, 0.12]} alvoMaoD={[0.22, 2.25, 0.12]} />
      <pointLight position={[0, 4, 3]} intensity={18} color="#b8c8ff" />
    </Palco>
  );
};

// ===== 6. A BRIGA: banco, discussão, saída =====
export const CenaBriga = () => {
  const s = useSeg();
  const tRonaldo = R('briga', 'L6', 'Ronaldo');
  const tSai = R('briga', 'L6', 'abandonou');
  if (s < tRonaldo) {
    const c = cam('briga', [{de: 0, pos: [[2.4, 1.6, 4.4], [1.6, 1.5, 3.6]], olha: [[0, 1.2, 0], [0, 1.25, 0]], fov: 42}], s);
    return (
      <Palco cinema clima="noite" pos={c.pos} olha={c.olha} fov={c.fov} sombras={false}>
        <group position={[0, 0, -16]}>
          <Estadio />
        </group>
        <Banco pos={[0, 0, -0.2]} />
        <Cristiano kit="treino" numero={undefined} pose="sentado" posicao={[0, -0.25, 0]} expressao="bravo" />
        <Bloquinho pose="sentado" posicao={[-1.3, -0.25, 0]} corpo="magro" cabelo="liso" corCabelo="#3a2414" camisa="#1d1d24" calca="#1d1d24" fase={3} expressao="serio" />
        <Bloquinho pose="sentado" posicao={[1.4, -0.25, 0]} cabeca="redonda" cabelo="nenhum" barba="cheia" corBarba="#2a1d14" pele="#c68a62" camisa="#1d1d24" calca="#1d1d24" fase={6} expressao="serio" />
        <pointLight position={[0, 2.2, 1.5]} intensity={8} color="#ffffff" />
      </Palco>
    );
  }
  if (s < tSai) {
    const c = cam('briga', [{de: tRonaldo, pos: [[0, 1.8, 4.6], [0, 1.85, 3.8]], olha: [[0, 1.7, 0], [0, 1.75, 0]], fov: 42}], s);
    return (
      <Palco cinema clima="interior" pos={c.pos} olha={c.olha} fov={c.fov} sombras={false}>
        <Vestiario />
        <Cristiano kit="treino" numero={undefined} posicao={[-0.85, 0, 0]} rotacaoY={0.6} pose="apontar" expressao="bravo" falando />
        <Tecnico posicao={[0.9, 0, 0]} rotacaoY={-0.6} pose="bracosCruzados" expressao="bravo" />
        <pointLight position={[0, 3, 2]} intensity={14} />
      </Palco>
    );
  }
  // sai andando com a mala, rumo à porta
  const z = -(s - tSai) * 1.3;
  const c = cam('briga', [{de: tSai, pos: [[0.6, 1.8, 3.4], [0.4, 1.8, 2.8]], olha: [[0, 1.4, -1.5], [0, 1.4, -2]], fov: 42}], s);
  return (
    <Palco cinema clima="interior" pos={c.pos} olha={c.olha} fov={c.fov} sombras={false}>
      <group rotation={[0, Math.PI, 0]} position={[0, 0, -5]}>
        <Vestiario />
      </group>
      {/* porta iluminada */}
      <B tam={[1.6, 2.8, 0.1]} pos={[0, 1.4, -4.8]} cor="#fff4d6" emi={2.5} />
      <group position={[0, 0, z]} rotation={[0, Math.PI, 0]}>
        <Cristiano kit="treino" numero={undefined} pose="andar" expressao="bravo" alvoMaoD={[0.75, 0.75, 0.05]} />
        <B tam={[0.75, 0.45, 0.35]} pos={[0.75, 0.55, 0.05]} cor="#c8102e" />
      </group>
      <Tecnico posicao={[1.8, 0, -0.5]} rotacaoY={Math.PI * 0.9} expressao="serio" />
      <pointLight position={[0, 3, 1]} intensity={12} />
    </Palco>
  );
};

// ===== 7. SUSPENSÃO: carimbo no documento =====
export const CenaSuspensao = () => {
  const s = useSeg();
  const tBate = R('suspensao', 'L7', 'suspendeu') + 0.25;
  const descida = lerp(s, tBate - 0.35, tBate, 0, 1, Easing.in(Easing.cubic));
  const c = cam('suspensao', [{de: 0, pos: [[0.2, 3.6, 2.2], [0.1, 3.0, 1.6]], olha: [[0, 1.0, 0.1], [0, 1.0, 0.2]], fov: 40}], s);
  return (
    <Palco cinema clima="interior" pos={c.pos} olha={c.olha} fov={c.fov} sombras={false}>
      <Documento descida={descida} />
      <pointLight position={[0, 3, 1]} intensity={14} color="#fff1d6" />
    </Palco>
  );
};

// ===== 8. O ADEUS: a camisa pendurada no vestiário =====
export const CenaAdeus = () => {
  const s = useSeg();
  const c = cam('adeus', [{de: 0, pos: [[-1.4, 1.9, 3.2], [-1.0, 1.95, 2.2]], olha: [[0.6, 1.8, -2.0], [0.7, 1.9, -2.1]], fov: 42}], s);
  return (
    <Palco cinema clima="interior" pos={c.pos} olha={c.olha} fov={c.fov} sombras={false}>
      <Vestiario />
      <Camisa pos={[0.75, 1.8, -2.15]} costas={false} />
      <Cristiano kit="treino" numero={undefined} posicao={[-0.4, 0, -0.9]} rotacaoY={Math.PI * 0.82} expressao="emocionado" alvoMaoD={[0.55, 1.7, 0.95]} />
      <pointLight position={[0.6, 3, -0.5]} intensity={10} color="#ffe6c0" />
    </Palco>
  );
};

// ===== 9. JORGE JESUS na coletiva =====
export const CenaJesus = () => {
  const s = useSeg();
  const c = cam('jesus', [{de: 0, pos: [[0.8, 1.6, 4.4], [0.4, 1.6, 3.4]], olha: [[0, 1.45, 0], [0, 1.5, 0]], fov: 40}], s);
  return (
    <Palco cinema clima="interior" pos={c.pos} olha={c.olha} fov={c.fov} sombras={false}>
      <Coletiva />
      <Tecnico pose="sentado" posicao={[0, -0.25, -0.15]} expressao="triste" falando={s > 0.2} />
      <pointLight position={[0, 3, 2.5]} intensity={14} />
      {/* flashes dos fotógrafos */}
      {Math.floor(s * 6) % 5 === 0 && <pointLight position={[-1.5, 1.5, 3]} intensity={30} color="#ffffff" />}
    </Palco>
  );
};

// ===== 10. CLUBE e a camisa 7 livre =====
export const CenaClube = () => {
  const s = useSeg();
  const tMas = R('clube', 'L10', 'Mas');
  if (s < tMas) {
    const c = cam('clube', [{de: 0, pos: [[2.0, 1.4, 4.6], [1.2, 1.6, 3.6]], olha: [[0, 1.6, 0], [0, 1.7, 0]], fov: 42}], s);
    return (
      <Palco cinema clima="dia" pos={c.pos} olha={c.olha} fov={c.fov} sombras={false}>
        <Estadio cores={['#ffd400', '#1b3fa0', '#ffd400', '#f2f2f2']} />
        <Cristiano kit="clube" pose="siu" expressao="feliz" />
        <directionalLight position={[-6, 6, 8]} intensity={1.6} color="#ffcf8a" />
      </Palco>
    );
  }
  return <CamisaLivre s={s - tMas} />;
};

// Camisa 7 girando sob um holofote
const CamisaLivre = ({s}: {s: number}) => {
  const c: {pos: V3; olha: V3} = {pos: [Math.sin(s * 0.25) * 1.2, 1.9, Math.max(2.9, 3.6 - s * 0.1)], olha: [0, 1.75, 0]};
  return (
    <Palco cinema clima="espaco" pos={c.pos} olha={c.olha} fov={40} sombras={false}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[2.2, 48]} />
        <meshStandardMaterial color="#20232b" />
      </mesh>
      <mesh position={[0, 0.25, 0]}>
        <cylinderGeometry args={[0.7, 0.8, 0.5, 32]} />
        <meshStandardMaterial color="#1a1a1f" metalness={0.4} roughness={0.4} />
      </mesh>
      <group position={[0, 1.1, 0]} rotation={[0, Math.PI + s * 0.6, 0]}>
        <Camisa pos={[0, 0.5, 0]} costas brilho={0.08} />
      </group>
      {/* cone de luz do holofote */}
      <mesh position={[0, 3.2, 0]}>
        <coneGeometry args={[1.4, 4.4, 32, 1, true]} />
        <meshBasicMaterial color="#fff6d8" transparent opacity={0.08} side={2} depthWrite={false} />
      </mesh>
      <spotLight position={[0, 6, 0.6]} angle={0.35} penumbra={0.6} intensity={120} color="#fff6d8" />
      <pointLight position={[0, 2, 2.5]} intensity={6} />
    </Palco>
  );
};

// ===== 11. FINAL: quem herda a 7? =====
export const CenaFinal = () => {
  const s = useSeg();
  return <CamisaLivre s={s + 3} />;
};
