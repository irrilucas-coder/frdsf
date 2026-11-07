import {Easing, interpolate, useCurrentFrame} from 'remotion';
import {Noite} from '../submarino/Ambiente';
import {camNoTempo, type Plano} from '../submarino/camera';
import {Palco} from '../submarino/Palco';
import {Tribunal} from '../maduro/Modelos';
import {
  Casa,
  Congresso,
  Deputado,
  Estudio,
  Feed,
  Felca,
  Hytalo,
  Israel,
  Juiz,
  MapaBrasil,
  Policial,
  Predio,
  Promotor,
  Seguranca,
  Viatura,
} from './Modelos';
import {FPS, duracaoCena, quandoDiz} from './roteiro';

const lerp = (s: number, a: number, b: number, de: number, para: number, easing = Easing.inOut(Easing.quad)) =>
  interpolate(s, [a, b], [de, para], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing});
const useSeg = () => useCurrentFrame() / FPS;

// ===== 0. GANCHO: quarto escuro, o vídeo brilhando =====
export const CenaGancho = () => {
  const s = useSeg();
  const fim = duracaoCena('gancho');
  const cam = camNoTempo([{de: 0, pos: [[0, 1.8, 7], [0, 1.7, 4.8]], olha: [[0, 1.5, 0], [0, 1.5, 0]], fov: 45}], s, fim);
  return (
    <Palco clima="interior" pos={cam.pos} olha={cam.olha} fov={cam.fov} sombras={false}>
      <Estudio />
      <Felca posicao={[0, 0, 0]} expressao="serio" falando={s > 0.6} />
    </Palco>
  );
};

// ===== 1. O VÍDEO =====
export const CenaVideo = () => {
  const s = useSeg();
  const fim = duracaoCena('video');
  const tFelca = quandoDiz('video', 'L1', 'Felca');
  const planos: Plano[] = [
    {de: 0, pos: [[2.6, 2, 5], [1.6, 1.9, 4]], olha: [[0, 1.6, 0], [0, 1.6, 0]], fov: 42},
    {de: tFelca, pos: [[-2.5, 2.4, 6], [-1.2, 2.2, 5]], olha: [[0, 1.5, 0], [0, 1.5, 0]], fov: 45},
  ];
  const cam = camNoTempo(planos, s, fim);
  return (
    <Palco clima="interior" pos={cam.pos} olha={cam.olha} fov={cam.fov} sombras={false}>
      <Estudio />
      <Felca expressao="serio" falando pose={s > tFelca + 1.5 ? 'apontar' : 'parado'} />
    </Palco>
  );
};

// ===== 2. ALGORITMO e o nome citado =====
export const CenaAlgoritmo = () => {
  const s = useSeg();
  const fim = duracaoCena('algoritmo');
  const tDeles = quandoDiz('algoritmo', 'L2', 'deles');
  const planos: Plano[] = [
    {de: 0, pos: [[0, 1.5, 6], [0, 1.4, 4.5]], olha: [[0, 1.2, 0], [0, 1.2, 0]], fov: 45},
    {de: tDeles, pos: [[0, 2.1, 5.6], [0, 2.0, 4.4]], olha: [[0, 1.5, 0], [0, 1.6, 0]], fov: 42},
  ];
  const cam = camNoTempo(planos, s, fim);
  if (cam.plano === 0) {
    return (
      <Palco clima="espaco" pos={cam.pos} olha={cam.olha} fov={cam.fov} sombras={false}>
        {[-2.2, 0, 2.2].map((x, i) => (
          <Feed key={x} posicao={[x, 1.2, -i * 0.3]} rotY={(1 - i) * 0.25} rolagem={s * (1.5 + i * 0.4)} />
        ))}
        {/* setas do algoritmo */}
        {[0, 1, 2, 3, 4].map((i) => (
          <mesh key={i} position={[-3 + ((s * 2 + i * 1.3) % 6.5), 2.9, 0.5]} rotation={[0, 0, -Math.PI / 2]}>
            <coneGeometry args={[0.15, 0.35, 4]} />
            <meshStandardMaterial color="#ff4d6d" emissive="#ff4d6d" emissiveIntensity={1.5} />
          </mesh>
        ))}
        <pointLight position={[0, 3, 4]} intensity={30} color="#c9b6ff" />
      </Palco>
    );
  }
  return (
    <Palco clima="interior" pos={cam.pos} olha={cam.olha} fov={cam.fov} sombras={false}>
      <mesh position={[0, 2, -1.5]}>
        <boxGeometry args={[10, 6, 0.1]} />
        <meshStandardMaterial color="#20232c" />
      </mesh>
      <Hytalo expressao="serio" />
      <spotLight position={[0, 5, 3]} angle={0.45} penumbra={0.5} intensity={70} color="#ffffff" target-position={[0, 1.5, 0]} />
    </Palco>
  );
};

// ===== 3. ADOLESCENTE (nunca mostrada): feeds borrados =====
export const CenaAdolescente = () => {
  const s = useSeg();
  const fim = duracaoCena('adolescente');
  const cam = camNoTempo([{de: 0, pos: [[-1.5, 1.4, 5], [1.5, 1.4, 4.6]], olha: [[0, 1.2, 0], [0, 1.2, 0]], fov: 45}], s, fim);
  return (
    <Palco clima="espaco" pos={cam.pos} olha={cam.olha} fov={cam.fov} sombras={false}>
      {[-3, -1, 1, 3].map((x, i) => (
        <Feed key={x} posicao={[x, 1.2, -1 - (i % 2) * 0.6]} rotY={-x * 0.08} rolagem={s * 0.6 + i} />
      ))}
      <pointLight position={[0, 3, 4]} intensity={20} color="#9fb4ff" />
    </Palco>
  );
};

// ===== 4. VIRAL e conta desativada =====
export const CenaViral = () => {
  const s = useSeg();
  const fim = duracaoCena('viral');
  const cam = camNoTempo([{de: 0, pos: [[0, 1.6, 6], [0, 1.6, 5]], olha: [[0, 1.3, 0], [0, 1.3, 0]], fov: 45}], s, fim);
  return (
    <Palco clima="espaco" pos={cam.pos} olha={cam.olha} fov={cam.fov} sombras={false}>
      <Noite />
      {Array.from({length: 14}, (_, i) => (
        <Feed key={i} posicao={[-6 + (i % 7) * 2, 0.2 + Math.floor(i / 7) * 2.8, -4 - (i % 3)]} rotY={0.1 * ((i % 3) - 1)} rolagem={s * 2 + i} borrado={false} />
      ))}
      <pointLight position={[0, 3, 4]} intensity={20} color="#ffb3c7" />
    </Palco>
  );
};

// ===== 5. MINISTÉRIO PÚBLICO =====
export const CenaMp = () => {
  const s = useSeg();
  const fim = duracaoCena('mp');
  const tPediu = quandoDiz('mp', 'L5', 'pediu');
  const planos: Plano[] = [
    {de: 0, pos: [[-6, 4, 14], [-2, 3.5, 12]], olha: [[0, 3, -2], [0, 3, -2]], fov: 45},
    {de: tPediu, pos: [[0.8, 1.9, 4], [0.6, 1.85, 3.4]], olha: [[0, 1.5, 0], [0, 1.6, 0]], fov: 42},
  ];
  const cam = camNoTempo(planos, s, fim);
  if (cam.plano === 0) {
    return (
      <Palco clima="dia" pos={cam.pos} olha={cam.olha} fov={cam.fov}>
        <Predio faixa="#7a1f1f" />
      </Palco>
    );
  }
  return (
    <Palco clima="interior" pos={cam.pos} olha={cam.olha} fov={cam.fov} sombras={false}>
      <mesh position={[0, 2, -1.5]}>
        <boxGeometry args={[10, 6, 0.1]} />
        <meshStandardMaterial color="#6b5a45" />
      </mesh>
      <mesh position={[0, 0.5, 0.8]}>
        <boxGeometry args={[2.4, 1, 1.1]} />
        <meshStandardMaterial color="#4a3020" />
      </mesh>
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[-0.6 + i * 0.5, 1.03 + i * 0.01, 0.9]} rotation={[0, 0.1 * i, 0]}>
          <boxGeometry args={[0.45, 0.02, 0.6]} />
          <meshStandardMaterial color="#f4f1e8" />
        </mesh>
      ))}
      <Promotor pose={s > tPediu + 0.5 ? 'apontar' : 'parado'} />
      <pointLight position={[0, 3, 3]} intensity={14} color="#ffe6c0" />
    </Palco>
  );
};

// ===== 6. PRISÃO em São Paulo + transferência =====
export const CenaPrisao = () => {
  const s = useSeg();
  const fim = duracaoCena('prisao');
  const tLevados = quandoDiz('prisao', 'L6', 'levados');
  const planos: Plano[] = [
    {de: 0, pos: [[8, 4, 13], [5, 3, 10]], olha: [[0, 1, -1], [0, 1, -1]], fov: 48},
    {de: tLevados, pos: [[0, 11, 7], [0, 12, 4]], olha: [[1.2, 0, 0.5], [1.2, 0, 0]], fov: 50},
  ];
  const cam = camNoTempo(planos, s, fim);
  if (cam.plano === 1) {
    return (
      <Palco clima="espaco" pos={cam.pos} olha={cam.olha} fov={cam.fov} sombras={false}>
        <MapaBrasil progresso={lerp(s, tLevados, fim, 0, 1)} />
        <pointLight position={[0, 8, 4]} intensity={30} color="#9fd0ff" />
      </Palco>
    );
  }
  const anda = lerp(s, 0.6, tLevados, 0, 3, Easing.linear);
  return (
    <Palco clima="noite" pos={cam.pos} olha={cam.olha} fov={cam.fov}>
      <Noite />
      <Casa />
      <Viatura posicao={[4.5, 0, 3.6]} rotY={0.3} />
      <Viatura posicao={[-4.5, 0, 4]} rotY={-0.2} />
      <Policial posicao={[-0.9 + anda * 0.3, 0, 1 + anda]} pose="andar" fase={1} />
      <Hytalo posicao={[-0.3 + anda * 0.3, 0, 0.8 + anda]} pose="andar" expressao="serio" />
      <Israel posicao={[0.5 + anda * 0.3, 0, 0.6 + anda]} pose="andar" expressao="serio" />
      <Policial posicao={[1.2 + anda * 0.3, 0, 1 + anda]} pose="andar" fase={3} />
      <pointLight position={[0, 4, 4]} intensity={14} color="#ffffff" />
    </Palco>
  );
};

// ===== 7. CONGRESSO: ECA Digital =====
export const CenaCongresso = () => {
  const s = useSeg();
  const fim = duracaoCena('congresso');
  const tLei = quandoDiz('congresso', 'L7', 'proíbe');
  const planos: Plano[] = [
    {de: 0, pos: [[-14, 6, 26], [-6, 5, 22]], olha: [[0, 4, 0], [0, 4, 0]], fov: 45},
    {de: tLei - 0.8, pos: [[0, 3, 9], [0, 2.8, 7.5]], olha: [[0, 1.6, 0], [0, 1.6, 0]], fov: 48},
  ];
  const cam = camNoTempo(planos, s, fim);
  if (cam.plano === 0) {
    return (
      <Palco clima="dia" pos={cam.pos} olha={cam.olha} fov={cam.fov}>
        <Congresso />
      </Palco>
    );
  }
  return (
    <Palco clima="interior" pos={cam.pos} olha={cam.olha} fov={cam.fov} sombras={false}>
      <mesh position={[0, 3, -4]}>
        <boxGeometry args={[16, 8, 0.2]} />
        <meshStandardMaterial color="#2b4a7a" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial color="#2e6b3a" />
      </mesh>
      {Array.from({length: 10}, (_, i) => (
        <Deputado key={i} posicao={[-4 + (i % 5) * 2, 0, -1 + Math.floor(i / 5) * 2]} rotacaoY={Math.PI * 0.05} fase={i} pose={s > tLei ? 'comemorar' : 'parado'} escala={0.85} />
      ))}
      <pointLight position={[0, 5, 4]} intensity={30} color="#fff6e0" />
    </Palco>
  );
};

// ===== 8. CONDENAÇÃO =====
export const CenaCondenacao = () => {
  const s = useSeg();
  const fim = duracaoCena('condenacao');
  const tHytalo = quandoDiz('condenacao', 'L8', 'Hytalo');
  const planos: Plano[] = [
    {de: 0, pos: [[0, 4, 11], [0, 3.5, 9]], olha: [[0, 2, -2], [0, 2, -2]], fov: 48},
    {de: tHytalo, pos: [[0.4, 2.6, 3.4], [0.3, 2.6, 2.8]], olha: [[0, 2.6, -3.5], [0, 2.6, -3.5]], fov: 40},
  ];
  const cam = camNoTempo(planos, s, fim);
  return (
    <Palco clima="interior" pos={cam.pos} olha={cam.olha} fov={cam.fov} sombras={false}>
      <Tribunal bandeira="brasil" />
      <Juiz posicao={[0, 1.1, -3.6]} expressao="serio" falando={cam.plano === 1} />
      <Hytalo posicao={[0.6, 0, 2.2]} rotacaoY={Math.PI} expressao="serio" />
      <Israel posicao={[-0.8, 0, 2.3]} rotacaoY={Math.PI} expressao="serio" />
      <pointLight position={[0, 6, 3]} intensity={30} color="#fff2dc" />
    </Palco>
  );
};

// ===== 9. TJPB mantém a prisão =====
export const CenaTj = () => {
  const s = useSeg();
  const fim = duracaoCena('tj');
  const cam = camNoTempo([{de: 0, pos: [[6, 4, 15], [2, 3.5, 12]], olha: [[0, 3, -2], [0, 3, -2]], fov: 45}], s, fim);
  return (
    <Palco clima="dia" pos={cam.pos} olha={cam.olha} fov={cam.fov}>
      <Predio faixa="#1f3b8a" />
    </Palco>
  );
};

// ===== 10. FELCA com seguranças =====
export const CenaFelca = () => {
  const s = useSeg();
  const fim = duracaoCena('felca');
  const tMarco = quandoDiz('felca', 'L10', 'marco');
  const planos: Plano[] = [
    {de: 0, pos: [[6, 2.8, 10], [4, 2.6, 9]], olha: [[0, 1.2, -0.5], [0, 1.2, -0.5]], fov: 45},
    {de: tMarco - 1.2, pos: [[0, 2, 5.5], [0, 1.9, 4.4]], olha: [[0, 1.6, 0], [0, 1.6, 0]], fov: 42},
  ];
  const cam = camNoTempo(planos, s, fim);
  const anda = lerp(s, 0, fim, -1.5, 1.5, Easing.linear);
  if (cam.plano === 1) {
    return (
      <Palco clima="interior" pos={cam.pos} olha={cam.olha} fov={cam.fov} sombras={false}>
        <Estudio />
        <Felca expressao="feliz" />
      </Palco>
    );
  }
  return (
    <Palco clima="noite" pos={cam.pos} olha={cam.olha} fov={cam.fov}>
      <Noite />
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial color="#2a2d33" />
      </mesh>
      <mesh position={[0, 0.5, -3]}>
        <boxGeometry args={[4.4, 1.2, 2]} />
        <meshStandardMaterial color="#111" metalness={0.6} />
      </mesh>
      <mesh position={[0, 1.3, -3]}>
        <boxGeometry args={[2.6, 0.6, 1.9]} />
        <meshStandardMaterial color="#0d0d10" metalness={0.8} />
      </mesh>
      <Seguranca posicao={[anda - 0.9, 0, 0.3]} rotacaoY={Math.PI / 2} pose="andar" fase={1} />
      <Felca posicao={[anda, 0, 0]} rotacaoY={Math.PI / 2} pose="andar" expressao="serio" />
      <Seguranca posicao={[anda + 0.9, 0, -0.3]} rotacaoY={Math.PI / 2} pose="andar" fase={3} />
      <pointLight position={[0, 4, 3]} intensity={18} color="#ffffff" />
    </Palco>
  );
};

// ===== 11. FINAL: Disque 100 =====
export const CenaFinal = () => {
  const s = useSeg();
  const fim = duracaoCena('final');
  const cam = camNoTempo([{de: 0, pos: [[0, 2, 7], [0, 2.1, 8]], olha: [[0, 1.5, 0], [0, 1.5, 0]], fov: 45}], s, fim);
  return (
    <Palco clima="estudio" pos={cam.pos} olha={cam.olha} fov={cam.fov} sombras={false}>
      <Estudio />
    </Palco>
  );
};
