import {Easing, interpolate, useCurrentFrame} from 'remotion';
import {Noite} from '../submarino/Ambiente';
import {camNoTempo, type Plano} from '../submarino/camera';
import {Palco} from '../submarino/Palco';
import {Tribunal} from '../maduro/Modelos';
import {Viatura} from '../felca/Modelos';
import {
  AgenteFbi,
  Avion,
  Canadiense,
  CelularEspia,
  Fajos,
  JuezMx,
  JuezToga,
  Maleta,
  MapaAmericas,
  Montana,
  PoliciaCol,
  Reclusorio,
  Snowboarder,
  Tabla,
  Terminal,
} from '../mx/Modelos';
import {FPS, duracaoCena, quandoDiz} from './roteiro';

const lerp = (s: number, a: number, b: number, de: number, para: number, easing = Easing.inOut(Easing.quad)) =>
  interpolate(s, [a, b], [de, para], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing});
const useSeg = () => useCurrentFrame() / FPS;

// Notas caindo do céu
const ChuvaDinero = ({s, n = 26}: {s: number; n?: number}) => (
  <>
    {Array.from({length: n}, (_, i) => {
      const y = 6 - ((s * (1.6 + (i % 5) * 0.25) + i * 0.37) % 7);
      return (
        <mesh key={i} position={[((i * 1.37) % 6) - 3, y, ((i * 0.73) % 2) - 1.7]} rotation={[s * 2 + i, s * 1.3 + i, 0]}>
          <boxGeometry args={[0.5, 0.02, 0.25]} />
          <meshStandardMaterial color="#6fa85a" side={2} />
        </mesh>
      );
    })}
  </>
);

// 0. GANCHO: juiz no meio da chuva de dinheiro, câmera entra rápido
export const CenaGancho = () => {
  const s = useSeg();
  const fim = duracaoCena('gancho');
  const t2 = quandoDiz('gancho', 'L0', 'atraparon');
  const planos: Plano[] = [
    {de: 0, pos: [[0, 2.2, 5.5], [0, 2, 3.4]], olha: [[0, 1.7, 0], [0, 1.8, 0]], fov: 45},
    {de: t2 - 0.3, pos: [[-9, 4, 14], [-6, 3, 11]], olha: [[0, 1.5, -1], [0, 1.5, -1]], fov: 45},
  ];
  const cam = camNoTempo(planos, s, fim);
  if (cam.plano === 0) {
    return (
      <Palco clima="interior" pos={cam.pos} olha={cam.olha} fov={cam.fov} sombras={false}>
        <mesh position={[0, 2, -1.6]}>
          <boxGeometry args={[10, 6, 0.1]} />
          <meshStandardMaterial color="#1a1f2b" />
        </mesh>
        <JuezToga expressao="serio" />
        <Maleta posicao={[0, 1.15, 0.8]} aberta={lerp(s, 0.2, 0.8, 0, 1)} />
        <ChuvaDinero s={s} />
        <spotLight position={[0, 5, 3]} angle={0.5} penumbra={0.5} intensity={80} color="#fff2d6" target-position={[0, 1.4, 0]} />
        <pointLight position={[1.5, 2, 2]} intensity={10} color="#6fa85a" />
      </Palco>
    );
  }
  return (
    <Palco clima="noite" pos={cam.pos} olha={cam.olha} fov={cam.fov}>
      <Noite />
      <Terminal />
      <Avion posicao={[3, 1.2, 1]} rotY={Math.PI} escala={0.9} />
      <Viatura posicao={[-2.5, 0, 3]} rotY={0.4} />
      <PoliciaCol posicao={[-0.5, 0, 2]} pose="apontar" rotacaoY={0.6} />
      <JuezMx posicao={[0.8, 0, 2.2]} rotacaoY={-0.6} pose="susto" expressao="assustado" />
    </Palco>
  );
};

// 1. AEROPORTO EL DORADO: detenção
export const CenaAeropuerto = () => {
  const s = useSeg();
  const fim = duracaoCena('aeropuerto');
  const tFbi = quandoDiz('aeropuerto', 'L1', 'FBI');
  const tJuez = quandoDiz('aeropuerto', 'L1', 'juez');
  const planos: Plano[] = [
    {de: 0, pos: [[-16, 7, 20], [-10, 5, 16]], olha: [[0, 2, -4], [0, 2, -4]], fov: 45},
    {de: tFbi - 0.4, pos: [[5, 2.4, 8], [3.5, 2.2, 6.5]], olha: [[0, 1.3, 1], [0, 1.3, 1]], fov: 45},
    {de: tJuez - 0.2, pos: [[0.8, 2.1, 4.2], [0.6, 2.0, 3.4]], olha: [[0, 1.7, 0.8], [0, 1.75, 0.8]], fov: 40},
  ];
  const cam = camNoTempo(planos, s, fim);
  return (
    <Palco clima="dia" pos={cam.pos} olha={cam.olha} fov={cam.fov}>
      <Terminal />
      <Avion posicao={[lerp(s, 0, fim, -6, 4, Easing.linear), 1.2, 6]} rotY={0} escala={1} />
      <Avion posicao={[8, 1.2, -1]} rotY={Math.PI} escala={0.9} faixa="#c8102e" />
      <PoliciaCol posicao={[-1, 0, 1.2]} rotacaoY={0.7} pose={cam.plano >= 1 ? 'apontar' : 'parado'} />
      <AgenteFbi posicao={[1.3, 0, 1.4]} rotacaoY={-0.7} pose={cam.plano >= 1 ? 'apontar' : 'parado'} fase={2} />
      <JuezMx posicao={[0, 0, 0.6]} expressao={cam.plano === 2 ? 'assustado' : 'serio'} pose={cam.plano === 2 ? 'susto' : 'parado'} />
      <Maleta posicao={[0.6, 0, 1.2]} />
    </Palco>
  );
};

// 2. QUEM É: juiz no Reclusorio Sur
export const CenaJuez = () => {
  const s = useSeg();
  const fim = duracaoCena('juez');
  const tRec = quandoDiz('juez', 'L2', 'Reclusorio');
  const planos: Plano[] = [
    {de: 0, pos: [[0, 2.1, 4.4], [0, 2, 3.6]], olha: [[0, 1.75, 0], [0, 1.8, 0]], fov: 40},
    {de: tRec - 0.3, pos: [[-10, 5, 14], [-6, 4, 12]], olha: [[0, 2, -3], [0, 2, -3]], fov: 45},
  ];
  const cam = camNoTempo(planos, s, fim);
  if (cam.plano === 0) {
    return (
      <Palco clima="interior" pos={cam.pos} olha={cam.olha} fov={cam.fov} sombras={false}>
        <mesh position={[0, 2, -1.5]}>
          <boxGeometry args={[10, 6, 0.1]} />
          <meshStandardMaterial color="#34312c" />
        </mesh>
        <JuezToga expressao="serio" />
        <spotLight position={[0, 5, 3]} angle={0.5} penumbra={0.6} intensity={60} target-position={[0, 1.6, 0]} />
      </Palco>
    );
  }
  return (
    <Palco clima="dia" pos={cam.pos} olha={cam.olha} fov={cam.fov}>
      <Reclusorio />
    </Palco>
  );
};

// 3. VOLTA NO TEMPO: febrero 2025 (tribunal mexicano)
export const CenaFebrero = () => {
  const s = useSeg();
  const fim = duracaoCena('febrero');
  const cam = camNoTempo([{de: 0, pos: [[0, 4.5, 12], [0, 3.5, 9]], olha: [[0, 2, -2], [0, 2, -2]], fov: 48}], s, fim);
  return (
    <Palco clima="interior" pos={cam.pos} olha={cam.olha} fov={cam.fov} sombras={false}>
      <Tribunal bandeira="mexico" />
      <JuezToga posicao={[0, 1.1, -3.6]} expressao="serio" />
      <pointLight position={[0, 6, 3]} intensity={30} color="#fff2dc" />
    </Palco>
  );
};

// 4. RYAN WEDDING e ANDREW CLARK
export const CenaWedding = () => {
  const s = useSeg();
  const fim = duracaoCena('wedding');
  const tWedding = quandoDiz('wedding', 'L4', 'Wedding');
  const planos: Plano[] = [
    {de: 0, pos: [[0, 2, 4.6], [0, 1.95, 3.8]], olha: [[0, 1.6, 0], [0, 1.7, 0]], fov: 42},
    {de: tWedding - 0.2, pos: [[-6, 3, 8], [4, 2, 7]], olha: [[lerp(s, tWedding, fim, -3, 4), 1, 0], [4, 0.8, 0]], fov: 48},
  ];
  const cam = camNoTempo(planos, s, fim);
  if (cam.plano === 0) {
    return (
      <Palco clima="interior" pos={cam.pos} olha={cam.olha} fov={cam.fov} sombras={false}>
        <mesh position={[0, 2, -1.5]}>
          <boxGeometry args={[10, 6, 0.1]} />
          <meshStandardMaterial color="#2a2d33" />
        </mesh>
        {/* placa de identificação de preso */}
        <mesh position={[0, 0.95, 0.35]}>
          <boxGeometry args={[0.9, 0.35, 0.05]} />
          <meshStandardMaterial color="#111" />
        </mesh>
        {[1.2, 1.6, 2.0, 2.4].map((y) => (
          <mesh key={y} position={[0, y, -1.42]}>
            <boxGeometry args={[3, 0.02, 0.02]} />
            <meshStandardMaterial color="#888" />
          </mesh>
        ))}
        <Canadiense expressao="serio" />
        <pointLight position={[0, 3, 3]} intensity={14} />
      </Palco>
    );
  }
  const x = lerp(s, tWedding, fim, -4, 5, Easing.linear);
  return (
    <Palco clima="dia" pos={cam.pos} olha={cam.olha} fov={cam.fov}>
      <Montana />
      <group position={[x, 0.6 - (x + 4) * 0.08, 0]} rotation={[0, 0, -0.08]}>
        <Snowboarder rotacaoY={Math.PI / 2} pose="comemorar" escala={0.9} />
        <Tabla posicao={[0, 0.02, 0]} rotY={0} />
      </group>
      {/* aros olímpicos estilizados */}
      {[-1.2, 0, 1.2, -0.6, 0.6].map((xx, i) => (
        <mesh key={i} position={[xx, i < 3 ? 4.4 : 3.9, -6]}>
          <torusGeometry args={[0.5, 0.08, 8, 24]} />
          <meshStandardMaterial color={['#0081c8', '#000000', '#ee334e', '#fcb131', '#00a651'][i]} />
        </mesh>
      ))}
    </Palco>
  );
};

// 5. FIANZA: o dinheiro chega no mesmo dia
export const CenaFianza = () => {
  const s = useSeg();
  const fim = duracaoCena('fianza');
  const tDia = quandoDiz('fianza', 'L5', 'mismo');
  const planos: Plano[] = [
    {de: 0, pos: [[0, 4.5, 11], [0, 3.6, 8.5]], olha: [[0, 2, -2], [0, 2, -2]], fov: 48},
    {de: tDia - 0.3, pos: [[0, 2.4, 3.2], [0, 2.2, 2.6]], olha: [[0, 0.8, 0], [0, 0.8, 0]], fov: 45},
  ];
  const cam = camNoTempo(planos, s, fim);
  if (cam.plano === 0) {
    return (
      <Palco clima="interior" pos={cam.pos} olha={cam.olha} fov={cam.fov} sombras={false}>
        <Tribunal bandeira="mexico" />
        <JuezToga posicao={[0, 1.1, -3.6]} pose="apontar" expressao="serio" />
        <Canadiense posicao={[lerp(s, 1, tDia, 0.5, 3), 0, 2.2]} rotacaoY={Math.PI / 2} pose="andar" expressao="feliz" />
        <pointLight position={[0, 6, 3]} intensity={30} color="#fff2dc" />
      </Palco>
    );
  }
  return (
    <Palco clima="interior" pos={cam.pos} olha={cam.olha} fov={cam.fov} sombras={false}>
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[6, 0.1, 4]} />
        <meshStandardMaterial color="#3a2a1e" />
      </mesh>
      <Fajos posicao={[0, 0.05, -0.2]} qtd={30} mostrar={lerp(s, tDia - 0.3, tDia + 2, 0.1, 1)} />
      <spotLight position={[0, 4, 2]} angle={0.6} penumbra={0.5} intensity={70} target-position={[0, 0, 0]} />
    </Palco>
  );
};

// 6. RECAPTURA e extradição
export const CenaRecaptura = () => {
  const s = useSeg();
  const fim = duracaoCena('recaptura');
  const tExt = quandoDiz('recaptura', 'L6', 'extraditado');
  const planos: Plano[] = [
    {de: 0, pos: [[6, 3, 9], [4, 2.6, 7.5]], olha: [[0, 1.2, 0], [0, 1.2, 0]], fov: 45},
    {de: tExt - 0.4, pos: [[0, 11, 7], [0, 12, 4]], olha: [[0, 0, 0], [0, 0, -0.5]], fov: 50},
  ];
  const cam = camNoTempo(planos, s, fim);
  if (cam.plano === 1) {
    return (
      <Palco clima="espaco" pos={cam.pos} olha={cam.olha} fov={cam.fov} sombras={false}>
        <MapaAmericas alvo="eua" rota={lerp(s, tExt - 0.2, fim, 0, 1)} />
        <pointLight position={[0, 8, 4]} intensity={30} color="#9fd0ff" />
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
      <Viatura posicao={[3, 0, -1]} rotY={-0.3} />
      <AgenteFbi posicao={[-0.8, 0, 0.4]} rotacaoY={0.4} pose="apontar" />
      <Canadiense posicao={[0.4, 0, 0]} rotacaoY={-0.3} pose="susto" expressao="assustado" />
      <pointLight position={[0, 4, 3]} intensity={14} />
    </Palco>
  );
};

// 7. CARGOS: nove cargos, até 15 anos cada
export const CenaCargos = () => {
  const s = useSeg();
  const fim = duracaoCena('cargos');
  const cam = camNoTempo([{de: 0, pos: [[0, 2.1, 4.6], [0, 2, 3.6]], olha: [[0, 1.6, 0], [0, 1.7, 0]], fov: 42}], s, fim);
  return (
    <Palco clima="interior" pos={cam.pos} olha={cam.olha} fov={cam.fov} sombras={false}>
      <mesh position={[0, 2, -1.5]}>
        <boxGeometry args={[10, 6, 0.1]} />
        <meshStandardMaterial color="#20232c" />
      </mesh>
      {[-1.2, -0.6, 0, 0.6, 1.2].map((x) => (
        <mesh key={x} position={[x, 2, 0.6]}>
          <boxGeometry args={[0.06, 4, 0.06]} />
          <meshStandardMaterial color="#9aa0a8" metalness={0.8} />
        </mesh>
      ))}
      <JuezMx expressao="serio" />
      <pointLight position={[0, 3.5, 2.5]} intensity={12} />
    </Palco>
  );
};

// 8. PEGASUS
export const CenaPegasus = () => {
  const s = useSeg();
  const fim = duracaoCena('pegasus');
  const cam = camNoTempo([{de: 0, pos: [[0, 1.4, 5], [0, 1.4, 3.8]], olha: [[0, 1.3, 0], [0, 1.3, 0]], fov: 42}], s, fim);
  return (
    <Palco clima="espaco" pos={cam.pos} olha={cam.olha} fov={cam.fov} sombras={false}>
      <CelularEspia posicao={[0, 1.3, 0]} />
      {[-2.2, 2.2].map((x, i) => (
        <group key={x} position={[x, 1.2, -1]} rotation={[0, (i ? -1 : 1) * 0.4, 0]}>
          <CelularEspia />
        </group>
      ))}
      <pointLight position={[0, 3, 3]} intensity={18} color="#3ddc84" />
    </Palco>
  );
};

// 9. AGORA: detido em Colômbia, extradição sem data
export const CenaAhora = () => {
  const s = useSeg();
  const fim = duracaoCena('ahora');
  const tCortes = quandoDiz('ahora', 'L9', 'cargos');
  const planos: Plano[] = [
    {de: 0, pos: [[0, 10, 7], [0, 11, 4.5]], olha: [[0.5, 0, 2], [0.5, 0, 2]], fov: 50},
    {de: tCortes - 0.3, pos: [[0, 4, 11], [0, 3.5, 9]], olha: [[0, 2, -2], [0, 2, -2]], fov: 48},
  ];
  const cam = camNoTempo(planos, s, fim);
  if (cam.plano === 0) {
    return (
      <Palco clima="espaco" pos={cam.pos} olha={cam.olha} fov={cam.fov} sombras={false}>
        <MapaAmericas alvo="colombia" rota={0} />
        <pointLight position={[0, 8, 4]} intensity={30} color="#9fd0ff" />
      </Palco>
    );
  }
  return (
    <Palco clima="interior" pos={cam.pos} olha={cam.olha} fov={cam.fov} sombras={false}>
      <Tribunal bandeira="eua" />
      <pointLight position={[0, 6, 3]} intensity={30} color="#fff2dc" />
    </Palco>
  );
};

// 10. FINAL
export const CenaFinal = () => {
  const s = useSeg();
  const fim = duracaoCena('final');
  const cam = camNoTempo([{de: 0, pos: [[0, 2.2, 4.5], [0, 2.3, 6]], olha: [[0, 1.6, 0], [0, 1.6, 0]], fov: 45}], s, fim);
  return (
    <Palco clima="interior" pos={cam.pos} olha={cam.olha} fov={cam.fov} sombras={false}>
      <mesh position={[0, 2, -1.5]}>
        <boxGeometry args={[10, 6, 0.1]} />
        <meshStandardMaterial color="#1a1f2b" />
      </mesh>
      <JuezMx expressao="serio" />
      <ChuvaDinero s={s} n={14} />
      <pointLight position={[0, 3.5, 2.5]} intensity={12} />
    </Palco>
  );
};
