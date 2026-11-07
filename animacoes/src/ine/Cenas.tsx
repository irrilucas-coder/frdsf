import {Easing, interpolate, useCurrentFrame} from 'remotion';
import {camNoTempo, type Plano} from '../submarino/camera';
import {Palco} from '../submarino/Palco';
import {Predio} from '../felca/Modelos';
import {Auditor, Candado, EdificioINE, Funcionaria, Legislador, SanLazaro, TarjetaCongelada, Urna} from '../mx/Modelos';
import {FPS, duracaoCena, quandoDiz} from './roteiro';

const lerp = (s: number, a: number, b: number, de: number, para: number, easing = Easing.inOut(Easing.quad)) =>
  interpolate(s, [a, b], [de, para], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing});
const useSeg = () => useCurrentFrame() / FPS;

// Grade de cartões congelando um a um
const Tarjetas = ({s, inicio, n = 12, ritmo = 0.12}: {s: number; inicio: number; n?: number; ritmo?: number}) => (
  <>
    {Array.from({length: n}, (_, i) => (
      <TarjetaCongelada
        key={i}
        posicao={[((i % 3) - 1) * 1.8, 3.9 - Math.floor(i / 3) * 1.3, -Math.floor(i / 3) * 0.15]}
        gelo={lerp(s, inicio + i * ritmo, inicio + i * ritmo + 0.4, 0, 1, Easing.out(Easing.back(1.5)))}
      />
    ))}
  </>
);

// 0. GANCHO: cartões congelando já no primeiro quadro
export const CenaGancho = () => {
  const s = useSeg();
  const fim = duracaoCena('gancho');
  const tExp = quandoDiz('gancho', 'L0', 'expresidenta');
  const planos: Plano[] = [
    {de: 0, pos: [[0, 1.95, 10], [0, 1.95, 8.6]], olha: [[0, 1.95, 0], [0, 1.95, 0]], fov: 48},
    {de: tExp - 0.5, pos: [[0, 1.8, 6.2], [0, 1.7, 5.2]], olha: [[0, 1.4, 0], [0, 1.4, 0]], fov: 42},
  ];
  const cam = camNoTempo(planos, s, fim);
  if (cam.plano === 0) {
    return (
      <Palco clima="artico" pos={cam.pos} olha={cam.olha} fov={cam.fov} sombras={false}>
        <Tarjetas s={s} inicio={0} n={12} ritmo={0.15} />
        <pointLight position={[0, 4, 4]} intensity={30} color="#cfefff" />
      </Palco>
    );
  }
  return (
    <Palco clima="artico" pos={cam.pos} olha={cam.olha} fov={cam.fov} sombras={false}>
      <TarjetaCongelada posicao={[0, 1.9, 0]} gelo={lerp(s, tExp - 0.4, tExp + 0.4, 0, 1)} />
      <Candado posicao={[0, 0.6, 0.4]} fechado={lerp(s, tExp, tExp + 0.4, 0, 1)} />
      <pointLight position={[0, 3, 3]} intensity={25} color="#cfefff" />
    </Palco>
  );
};

// 1. UIF: lista de bloqueados
export const CenaUif = () => {
  const s = useSeg();
  const fim = duracaoCena('uif');
  const cam = camNoTempo([{de: 0, pos: [[-6, 4, 14], [-2, 3.5, 11]], olha: [[0, 3, -2], [0, 3, -2]], fov: 45}], s, fim);
  return (
    <Palco clima="dia" pos={cam.pos} olha={cam.olha} fov={cam.fov}>
      <Predio faixa="#5a2a6a" />
    </Palco>
  );
};

// 2. INE: o árbitro das eleições
export const CenaIne = () => {
  const s = useSeg();
  const fim = duracaoCena('ine');
  const cam = camNoTempo([{de: 0, pos: [[8, 4, 15], [3, 3.5, 12]], olha: [[0, 3.5, -2], [0, 3.5, -2]], fov: 45}], s, fim);
  return (
    <Palco clima="dia" pos={cam.pos} olha={cam.olha} fov={cam.fov}>
      <EdificioINE />
      <Urna posicao={[3.5, 0, 2]} escala={0.9} />
    </Palco>
  );
};

// 3. TADDEI (sem representar a pessoa): cadeira vazia e placa
export const CenaTaddei = () => {
  const s = useSeg();
  const fim = duracaoCena('taddei');
  const tRenuncio = quandoDiz('taddei', 'L3', 'renunció');
  const cam = camNoTempo([{de: 0, pos: [[0, 2.4, 6], [0, 2.2, 4.4]], olha: [[0, 1.2, 0], [0, 1.2, 0]], fov: 45}], s, fim);
  const sai = lerp(s, tRenuncio, fim, 0, 1);
  return (
    <Palco clima="interior" pos={cam.pos} olha={cam.olha} fov={cam.fov} sombras={false}>
      <mesh position={[0, 2.5, -2]}>
        <boxGeometry args={[12, 6, 0.2]} />
        <meshStandardMaterial color="#e6e2da" />
      </mesh>
      <mesh position={[0, 4.4, -1.85]}>
        <boxGeometry args={[3, 0.8, 0.1]} />
        <meshStandardMaterial color="#c2185b" />
      </mesh>
      {/* mesa de conselho */}
      <mesh position={[0, 0.5, 0.6]}>
        <boxGeometry args={[4, 1, 1.2]} />
        <meshStandardMaterial color="#5a3820" />
      </mesh>
      {/* cadeira presidencial que se afasta (renúncia) */}
      <group position={[0, 0, -0.4 - sai * 0.8]} rotation={[0, sai * 0.6, 0]}>
        <mesh position={[0, 0.7, 0]}>
          <boxGeometry args={[0.9, 0.15, 0.9]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
        <mesh position={[0, 1.4, -0.4]}>
          <boxGeometry args={[0.9, 1.4, 0.15]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
      </group>
      <mesh position={[0, 1.1, 1.15]}>
        <boxGeometry args={[1.4, 0.3, 0.08]} />
        <meshStandardMaterial color="#c9a227" metalness={0.7} />
      </mesh>
      <pointLight position={[0, 3.5, 3]} intensity={14} color="#fff2dc" />
    </Palco>
  );
};

// 4. OJO: sem confirmação oficial, medida preventiva
export const CenaOjo = () => {
  const s = useSeg();
  const fim = duracaoCena('ojo');
  const cam = camNoTempo([{de: 0, pos: [[0, 2, 5], [0, 2, 4.2]], olha: [[0, 1.6, 0], [0, 1.6, 0]], fov: 45}], s, fim);
  return (
    <Palco clima="espaco" pos={cam.pos} olha={cam.olha} fov={cam.fov} sombras={false}>
      <TarjetaCongelada posicao={[0, 1.8, 0]} gelo={0.6 + Math.sin(s * 3) * 0.05} rotY={Math.sin(s) * 0.3} />
      <pointLight position={[0, 3, 3]} intensity={20} color="#ffd27a" />
    </Palco>
  );
};

// 5. ORIGEM: jornalismo investigativo (documentos e contratos)
export const CenaOrigen = () => {
  const s = useSeg();
  const fim = duracaoCena('origen');
  const cam = camNoTempo([{de: 0, pos: [[0, 3.2, 3.2], [0.6, 2.8, 2.6]], olha: [[0, 1, 0], [0, 1, 0]], fov: 45}], s, fim);
  return (
    <Palco clima="interior" pos={cam.pos} olha={cam.olha} fov={cam.fov} sombras={false}>
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[4, 1, 2.4]} />
        <meshStandardMaterial color="#4a3020" />
      </mesh>
      {Array.from({length: 7}, (_, i) => (
        <mesh key={i} position={[-1.4 + (i % 4) * 0.9, 1.02 + Math.floor(i / 4) * 0.02, -0.4 + Math.floor(i / 4) * 0.8]} rotation={[0, (i - 3) * 0.08, 0]}>
          <boxGeometry args={[0.7, 0.01, 0.9]} />
          <meshStandardMaterial color={i === 3 ? '#fff6d6' : '#f2efe6'} />
        </mesh>
      ))}
      {/* lupa */}
      <group position={[lerp(s, 0, fim, -1, 1), 1.3, 0.1]} rotation={[-Math.PI / 2.3, 0, 0]}>
        <mesh>
          <torusGeometry args={[0.35, 0.05, 8, 24]} />
          <meshStandardMaterial color="#222" />
        </mesh>
        <mesh position={[0.5, -0.1, 0]} rotation={[0, 0, Math.PI / 2.5]}>
          <boxGeometry args={[0.08, 0.6, 0.08]} />
          <meshStandardMaterial color="#5a3820" />
        </mesh>
      </group>
      <pointLight position={[0, 3, 2]} intensity={18} color="#fff2dc" />
    </Palco>
  );
};

// 6. FGR: denúncia
export const CenaFgr = () => {
  const s = useSeg();
  const fim = duracaoCena('fgr');
  const cam = camNoTempo([{de: 0, pos: [[6, 4, 14], [2, 3.5, 11]], olha: [[0, 3, -2], [0, 3, -2]], fov: 45}], s, fim);
  return (
    <Palco clima="dia" pos={cam.pos} olha={cam.olha} fov={cam.fov}>
      <Predio faixa="#1f2a44" />
    </Palco>
  );
};

// 7. ASF: auditoria completa
export const CenaAsf = () => {
  const s = useSeg();
  const fim = duracaoCena('asf');
  const cam = camNoTempo([{de: 0, pos: [[0, 2.4, 6.5], [0, 2.2, 5]], olha: [[0, 1.4, 0], [0, 1.4, 0]], fov: 45}], s, fim);
  return (
    <Palco clima="interior" pos={cam.pos} olha={cam.olha} fov={cam.fov} sombras={false}>
      <mesh position={[0, 2.5, -2]}>
        <boxGeometry args={[12, 6, 0.2]} />
        <meshStandardMaterial color="#d8d2c4" />
      </mesh>
      {/* arquivos */}
      {[-3, -2, 2, 3].map((x) => (
        <mesh key={x} position={[x, 1.2, -1.4]}>
          <boxGeometry args={[0.9, 2.4, 0.8]} />
          <meshStandardMaterial color="#6b7684" metalness={0.4} />
        </mesh>
      ))}
      <Auditor posicao={[-0.8, 0, 0]} rotacaoY={0.3} pose="apontar" />
      <Auditor posicao={[0.8, 0, 0.2]} rotacaoY={-0.3} fase={3} />
      <pointLight position={[0, 3.5, 3]} intensity={14} />
    </Palco>
  );
};

// 8. PRESIDENTA INTERINA
export const CenaInterina = () => {
  const s = useSeg();
  const fim = duracaoCena('interina');
  const cam = camNoTempo([{de: 0, pos: [[0, 2.1, 5], [0, 2, 4]], olha: [[0, 1.6, 0], [0, 1.7, 0]], fov: 42}], s, fim);
  return (
    <Palco clima="interior" pos={cam.pos} olha={cam.olha} fov={cam.fov} sombras={false}>
      <mesh position={[0, 2.5, -2]}>
        <boxGeometry args={[12, 6, 0.2]} />
        <meshStandardMaterial color="#e6e2da" />
      </mesh>
      <mesh position={[0, 4.2, -1.85]}>
        <boxGeometry args={[3, 0.8, 0.1]} />
        <meshStandardMaterial color="#c2185b" />
      </mesh>
      <Funcionaria expressao="serio" />
      <pointLight position={[0, 3.5, 3]} intensity={14} color="#fff2dc" />
    </Palco>
  );
};

// 9. ELEIÇÃO 2027 e orçamento
export const CenaEleccion = () => {
  const s = useSeg();
  const fim = duracaoCena('eleccion');
  const tCongreso = quandoDiz('eleccion', 'L9', 'Congreso');
  const planos: Plano[] = [
    {de: 0, pos: [[0, 2.2, 5], [0, 2, 4]], olha: [[0, 1, 0], [0, 1, 0]], fov: 45},
    {de: tCongreso - 0.3, pos: [[-8, 5, 16], [-4, 4, 13]], olha: [[0, 3, -3], [0, 3, -3]], fov: 45},
  ];
  const cam = camNoTempo(planos, s, fim);
  if (cam.plano === 0) {
    return (
      <Palco clima="estudio" pos={cam.pos} olha={cam.olha} fov={cam.fov} sombras={false}>
        <Urna posicao={[0, 0, 0]} />
      </Palco>
    );
  }
  return (
    <Palco clima="dia" pos={cam.pos} olha={cam.olha} fov={cam.fov}>
      <SanLazaro />
      {[0, 1, 2, 3, 4].map((i) => (
        <Legislador key={i} posicao={[-3 + i * 1.5, 0, 1.5]} fase={i} escala={0.8} pose={i % 2 ? 'apontar' : 'parado'} />
      ))}
    </Palco>
  );
};

// 10. FINAL
export const CenaFinal = () => {
  const s = useSeg();
  const fim = duracaoCena('final');
  const cam = camNoTempo([{de: 0, pos: [[8, 4, 15], [10, 4.5, 18]], olha: [[0, 3.5, -2], [0, 3.5, -2]], fov: 45}], s, fim);
  return (
    <Palco clima="dia" pos={cam.pos} olha={cam.olha} fov={cam.fov}>
      <EdificioINE />
    </Palco>
  );
};
