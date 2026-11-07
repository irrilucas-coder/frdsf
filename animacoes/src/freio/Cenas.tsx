import {Easing, interpolate, useCurrentFrame} from 'remotion';
import {Bloquinho} from '../submarino/Bloquinho';
import {Palco} from '../submarino/Palco';
import {B, Carrinho, Carro, Cil, Disco, Estrada, Fogo, Motorista, Seta, Tambor} from './Modelos';
import {FPS, duracaoCena, quandoDiz, type CenaId} from './roteiro';

type V3 = [number, number, number];
const lerp = (s: number, a: number, b: number, de: number, para: number, easing = Easing.inOut(Easing.quad)) =>
  interpolate(s, [a, b], [de, para], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing});
const useSeg = () => useCurrentFrame() / FPS;
const D = duracaoCena;
const R = quandoDiz;

// ---------- Estado do painel (velocidade km/h e temperatura do freio °C) ----------
type Pts = [number, number][];
const PAINEL: Partial<Record<CenaId, () => {vel: Pts; temp: Pts}>> = {
  gancho: () => ({vel: [[0, 100]], temp: [[0, 40]]}),
  pe: () => ({vel: [[0, 100], [D('pe'), 92]], temp: [[0, 40], [D('pe'), 300]]}),
  sapata: () => ({vel: [[0, 30], [D('sapata'), 5]], temp: [[0, 40], [D('sapata'), 120]]}),
  fogo: () => ({vel: [[0, 25], [D('fogo'), 45]], temp: [[0, 150], [R('fogo', 'L3', 'fogo'), 420], [D('fogo'), 450]]}),
  tambor: () => ({vel: [[0, 80], [D('tambor'), 20]], temp: [[0, 60], [D('tambor'), 180]]}),
  perde: () => ({vel: [[0, 90], [D('perde'), 70]], temp: [[0, 300], [D('perde'), 600]]}),
  disco: () => ({vel: [[0, 100], [D('disco'), 0]], temp: [[0, 120], [R('disco', 'L6', 'vento'), 260], [D('disco'), 150]]}),
  quatropes: () => ({vel: [[0, 0]], temp: [[0, 60]]}),
  fluido: () => ({vel: [[0, 80], [D('fluido'), 0]], temp: [[0, 60], [D('fluido'), 120]]}),
  trava: () => ({vel: [[0, 80], [D('trava'), 40]], temp: [[0, 80], [D('trava'), 140]]}),
  abs: () => ({vel: [[0, 80], [D('abs'), 0]], temp: [[0, 80], [D('abs'), 130]]}),
  final: () => ({vel: [[0, 30], [D('final') * 0.4, 0]], temp: [[0, 90], [D('final'), 60]]}),
};
const curva = (pts: Pts, s: number) =>
  pts.length === 1 ? pts[0][1] : interpolate(s, pts.map((p) => p[0]), pts.map((p) => p[1]), {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
export const painelEm = (id: CenaId, s: number) => {
  const p = PAINEL[id]?.();
  if (!p) return null;
  return {vel: curva(p.vel, s), temp: curva(p.temp, s)};
};

// distância percorrida (para as faixas e árvores correrem) a partir da velocidade
const desloc = (s: number, vel: number) => (s * vel) / 3.6;

// ===== 0. GANCHO: carro voando na estrada =====
export const CenaGancho = () => {
  const s = useSeg();
  return (
    <Palco cinema clima="dia" pos={[4 - s * 0.5, 1.6, 6.5]} olha={[0, 0.9, 0]} fov={48}>
      <Estrada deslocamento={desloc(s, 100) * 0.35} />
      <Carro giro={s * 25} motorista={<Motorista />} />
    </Palco>
  );
};

// ===== 1. PÉ NO CHÃO: carro de lado, perna saindo pela porta e raspando no asfalto =====
export const CenaPe = () => {
  const s = useSeg();
  const frame = useCurrentFrame();
  const sola = lerp(s, 0, D('pe'), 1, 0.2);
  return (
    <Palco cinema clima="dia" pos={[1.4, 2.4, 7.2]} olha={[0.3, 0.2, 0.6]} fov={42}>
      <Estrada deslocamento={desloc(s, 92) * 0.35} />
      <Carro giro={s * 22} motorista={<Motorista expressao="assustado" pose="susto" />} />
      {/* perna (calça) saindo por baixo da porta, inclinada até o chão */}
      <group position={[0.2, 0.62, 0.9]} rotation={[0.9, 0, 0.25]}>
        <B tam={[0.2, 0.62, 0.2]} pos={[0, -0.31, 0]} cor="#1f5fa8" />
      </group>
      {/* tênis raspando: a sola vai sumindo */}
      <group position={[0.36, 0.05 + 0.05 * sola, 1.34]}>
        <B tam={[0.36, 0.1 * sola + 0.04, 0.2]} pos={[0, 0.05, 0]} cor="#f2f2f2" />
        <B tam={[0.36, 0.03, 0.2]} pos={[0, -0.01, 0]} cor="#c0392b" emi={0.8} />
      </group>
      {Array.from({length: 14}, (_, i) => {
        const t = ((frame + i * 2) % 10) / 10;
        return (
          <mesh key={i} position={[0.2 - t * 1.2, 0.04 + t * 0.25 - t * t * 0.25, 1.34 + Math.sin(i) * 0.15]} scale={0.03 * (1 - t)}>
            <boxGeometry args={[1, 1, 1]} />
            <meshBasicMaterial color="#ffd23f" />
          </mesh>
        );
      })}
      <Fogo posicao={[0.3, 0.02, 1.34]} intensidade={0.35} />
    </Palco>
  );
};

// ===== 2. FREIO DE SAPATA: carrinho de madeira =====
export const CenaSapata = () => {
  const s = useSeg();
  const tPuxa = R('sapata', 'L2', 'alavanca');
  const alav = lerp(s, tPuxa - 0.2, tPuxa + 0.4, 0, 1);
  const p = painelEm('sapata', s)!;
  return (
    <Palco cinema clima="dia" pos={[1.5, 1.8, 5.5]} olha={[-0.3, 0.8, 0.4]} fov={45}>
      <Estrada deslocamento={desloc(s, p.vel) * 0.5} />
      <Carrinho giro={s * p.vel * 0.12} alavanca={alav} sapata={alav} motorista={<Bloquinho escala={0.6} rotacaoY={Math.PI / 2} camisa="#ffcc00" calca="#1f5fa8" chapeu="cabelo" corChapeu="#2a1d14" pose="apontar" expressao="feliz" />} />
      {alav > 0.5 && <Seta posicao={[-0.15, 0.45, 1]} rot={Math.PI / 2} escala={0.8} cor="#ff9f1c" />}
    </Palco>
  );
};

// ===== 3. PEGA FOGO NA DESCIDA =====
export const CenaFogo = () => {
  const s = useSeg();
  const tFogo = R('fogo', 'L3', 'fogo');
  const p = painelEm('fogo', s)!;
  return (
    <Palco cinema clima="dia" pos={[2, 2.2, 6]} olha={[-0.3, 0.7, 0.4]} fov={45}>
      <group rotation={[0, 0, -0.18]}>
        <Estrada deslocamento={desloc(s, p.vel) * 0.5} />
        <Carrinho giro={s * p.vel * 0.12} alavanca={1} sapata={1} quente={lerp(s, 0, tFogo, 0, 1)} motorista={<Bloquinho escala={0.6} rotacaoY={Math.PI / 2} camisa="#ffcc00" calca="#1f5fa8" chapeu="cabelo" corChapeu="#2a1d14" pose={s > tFogo ? 'susto' : 'parado'} expressao={s > tFogo ? 'assustado' : 'serio'} />} />
        {s > tFogo - 0.3 && <Fogo posicao={[-0.28, 0.65, 0.72]} intensidade={lerp(s, tFogo - 0.3, tFogo + 0.5, 0.3, 1.2)} />}
      </group>
    </Palco>
  );
};

// ===== 4. FREIO A TAMBOR em corte =====
export const CenaTambor = () => {
  const s = useSeg();
  const tEmpurra = R('tambor', 'L4', 'empurra');
  const abre = lerp(s, tEmpurra, tEmpurra + 0.5, 0, 1);
  return (
    <Palco cinema clima="estudio" pos={[3.6, 0.6, 1.2]} olha={[0, 0, 0]} fov={45} sombras={false}>
      <Tambor giro={s * lerp(s, tEmpurra, tEmpurra + 2, 6, 0.5)} abertura={abre} />
      {abre > 0.3 && (
        <>
          <Seta posicao={[0.3, 0.2, 0]} escala={0.7} cor="#ff9f1c" />
          <Seta posicao={[0.3, -0.2, 0]} rot={Math.PI} escala={0.7} cor="#ff9f1c" />
        </>
      )}
    </Palco>
  );
};

// ===== 5. PERDE A FORÇA: tambor vermelho de quente + carro passando do ponto =====
export const CenaPerde = () => {
  const s = useSeg();
  const tForca = R('perde', 'L5', 'força');
  if (s < tForca - 1) {
    return (
      <Palco cinema clima="estudio" pos={[3.6, 0.6, 1.2]} olha={[0, 0, 0]} fov={45} sombras={false}>
        <Tambor giro={s * 4} abertura={1} calor={lerp(s, 0, tForca - 1, 0.3, 1.4)} />
        <Fogo posicao={[0, 1.2, 0]} intensidade={0.35} />
      </Palco>
    );
  }
  const x = lerp(s, tForca - 1, D('perde'), -6, 6, Easing.linear);
  return (
    <Palco cinema clima="dia" pos={[0, 2.5, 9]} olha={[0, 0.6, 0]} fov={48}>
      <Estrada />
      {/* faixa de pedestre: o carro passa por cima sem conseguir parar */}
      {Array.from({length: 6}, (_, i) => (
        <B key={i} tam={[0.5, 0.14, 0.6]} pos={[1.5, -0.02, -1.8 + i * 0.75]} cor="#f2f2f2" />
      ))}
      <Carro posicao={[x, 0, 0.6]} giro={s * 18} motorista={<Motorista expressao="assustado" pose="susto" />} />
    </Palco>
  );
};

// ===== 6. FREIO A DISCO com vento esfriando =====
export const CenaDisco = () => {
  const s = useSeg();
  const tAperta = R('disco', 'L6', 'apertam');
  const tVento = R('disco', 'L6', 'vento');
  const aperto = lerp(s, tAperta - 0.2, tAperta + 0.3, 0, 1);
  const calor = lerp(s, tAperta, tVento, 0, 0.8) * lerp(s, tVento, tVento + 1.5, 1, 0.1);
  const frame = useCurrentFrame();
  return (
    <Palco cinema clima="estudio" pos={[3.4, 1.1, 2.2]} olha={[0, 0.2, 0]} fov={45} sombras={false}>
      <Disco giro={s * lerp(s, tAperta, tAperta + 2.5, 7, 0.3)} aperto={aperto} calor={calor} />
      {s > tVento - 0.3 &&
        [0, 1, 2, 3, 4].map((i) => (
          <Seta key={i} posicao={[1 - ((frame * 0.04 + i * 0.25) % 1) * 0.3, -0.9 + i * 0.45, 1.6 - ((frame * 0.04 + i * 0.25) % 1) * 1.5]} rot={-Math.PI / 2} escala={0.6} />
        ))}
    </Palco>
  );
};

// ===== 7. QUATRO PÉS (piada) =====
export const CenaQuatropes = () => {
  const s = useSeg();
  return (
    <Palco cinema clima="interior" pos={[0, 1.5, 3.6]} olha={[0, 0.7, 0]} fov={45} sombras={false}>
      <B tam={[4, 0.1, 3]} pos={[0, 0, 0]} cor="#2b2b30" />
      {/* quatro pedais lado a lado */}
      {[-0.9, -0.3, 0.3, 0.9].map((x, i) => (
        <group key={x} position={[x, 0.18, 0.4]}>
          <B tam={[0.3, 0.06, 0.45]} rot={[-0.4, 0, 0]} cor="#555" metal={0.6} />
          <B tam={[0.28, 0.2, 0.42]} pos={[0, 0.12 + Math.sin(s * 6 + i) * 0.03, -0.02]} cor="#f2f2f2" />
        </group>
      ))}
      <Bloquinho posicao={[0, 0.25, -0.8]} pose="susto" expressao="assustado" camisa="#ffcc00" calca="#1f5fa8" chapeu="cabelo" corChapeu="#2a1d14" escala={0.8} />
    </Palco>
  );
};

// ===== 8. FLUIDO DE FREIO: canos se enchendo até as quatro rodas =====
export const CenaFluido = () => {
  const s = useSeg();
  const tPisa = R('fluido', 'L8', 'pisa');
  const enche = lerp(s, tPisa, tPisa + 1.8, 0, 1);
  const cano = (de: V3, ate: V3, k: number) => {
    const meio: V3 = [(de[0] + ate[0]) / 2, (de[1] + ate[1]) / 2, (de[2] + ate[2]) / 2];
    const dx = ate[0] - de[0];
    const dz = ate[2] - de[2];
    const comp = Math.hypot(dx, dz);
    const ang = Math.atan2(dz, dx);
    return (
      <group key={`${ate[0]}${ate[2]}`}>
        <mesh position={meio} rotation={[0, -ang, Math.PI / 2]}>
          <cylinderGeometry args={[0.035, 0.035, comp, 8]} />
          <meshStandardMaterial color="#9aa0a8" transparent opacity={0.5} />
        </mesh>
        {k > 0 && (
          <mesh position={[de[0] + (dx * k) / 2, meio[1], de[2] + (dz * k) / 2]} rotation={[0, -ang, Math.PI / 2]}>
            <cylinderGeometry args={[0.045, 0.045, comp * k, 8]} />
            <meshStandardMaterial color="#ffb703" emissive="#ff9f1c" emissiveIntensity={1.2} />
          </mesh>
        )}
      </group>
    );
  };
  const pedal: V3 = [0.9, 0.55, 0.35];
  const rodas: V3[] = [
    [1.15, 0.42, 0.85],
    [1.15, 0.42, -0.85],
    [-1.15, 0.42, 0.85],
    [-1.15, 0.42, -0.85],
  ];
  return (
    <Palco cinema clima="estudio" pos={[3.5, 4.2, 4.5]} olha={[0, 0.4, 0]} fov={45} sombras={false}>
      <Carro raiox giro={0} motorista={<Motorista expressao="feliz" />} />
      {rodas.map((r) => cano(pedal, r, enche))}
      <B tam={[0.25, 0.25, 0.25]} pos={pedal} cor="#e10600" metal={0.4} />
      {enche > 0.95 &&
        rodas.map((r, i) => (
          <mesh key={i} position={[r[0], r[1], r[2] + (r[2] > 0 ? 0.25 : -0.25)]}>
            <sphereGeometry args={[0.1, 12, 12]} />
            <meshStandardMaterial color="#3ddc84" emissive="#3ddc84" emissiveIntensity={2} />
          </mesh>
        ))}
    </Palco>
  );
};

// Gato atravessando
const Gato = ({x}: {x: number}) => (
  <group position={[2.5, 0, x]} rotation={[0, 0, 0]}>
    <B tam={[0.5, 0.25, 0.22]} pos={[0, 0.25, 0]} cor="#ff9f1c" />
    <B tam={[0.22, 0.22, 0.22]} pos={[0, 0.42, 0.2]} cor="#ff9f1c" />
    <B tam={[0.06, 0.08, 0.04]} pos={[-0.06, 0.56, 0.24]} cor="#ff9f1c" />
    <B tam={[0.06, 0.08, 0.04]} pos={[0.06, 0.56, 0.24]} cor="#ff9f1c" />
    <B tam={[0.05, 0.3, 0.05]} pos={[0, 0.4, -0.22]} rot={[0.6, 0, 0]} cor="#ff9f1c" />
  </group>
);

// ===== 9. RODA TRAVA: o carro desliza e roda =====
export const CenaTrava = () => {
  const s = useSeg();
  const tTrava = R('trava', 'L9', 'trava');
  const gira = lerp(s, tTrava + 0.3, D('trava'), 0, 2.2, Easing.out(Easing.cubic));
  const x = lerp(s, 0, D('trava'), -5, 2.2, Easing.out(Easing.quad));
  return (
    <Palco cinema clima="dia" pos={[0, 6, 9]} olha={[0, 0, 0]} fov={48}>
      <Estrada />
      <Gato x={lerp(s, 0, D('trava'), -2.5, 2.5)} />
      {/* marcas de pneu */}
      {s > tTrava && <B tam={[Math.max(0.01, x + 2.5), 0.13, 0.25]} pos={[(x - 2.5) / 2 - 0.5, -0.02, 0.85]} cor="#111" op={0.7} />}
      <group position={[x, 0, 0]} rotation={[0, gira, 0]}>
        <Carro travada={s > tTrava} giro={s * 18} motorista={<Motorista expressao="assustado" pose="susto" />} />
      </group>
    </Palco>
  );
};

// ===== 10. ABS: solta e aperta, o carro desvia reto =====
export const CenaAbs = () => {
  const s = useSeg();
  const tSolta = R('abs', 'L10', 'solta');
  const frame = useCurrentFrame();
  const pulsando = s > tSolta - 0.3;
  const travada = pulsando && Math.floor(frame / 3) % 2 === 0;
  const x = lerp(s, 0, D('abs'), -5, 1.5, Easing.out(Easing.quad));
  const desvio = lerp(s, tSolta, tSolta + 1.5, 0, -1.2) * lerp(s, tSolta + 1.5, D('abs'), 1, 0.6);
  if (s < R('abs', 'L10', 'travar') - 0.2) {
    // close no sensor da roda
    return (
      <Palco cinema clima="estudio" pos={[3, 0.8, 1.8]} olha={[0, 0.2, 0]} fov={45} sombras={false}>
        <Disco giro={s * 6} aperto={0.6} />
        <B tam={[0.2, 0.2, 0.35]} pos={[0, -0.95, 0.75]} cor="#1f5fa8" metal={0.5} />
        <B tam={[0.08, 0.08, 0.08]} pos={[0, -0.95, 0.97]} cor="#3ddc84" emi={Math.floor(frame / 5) % 2 ? 2 : 0.2} />
        <Cil r={0.9} l={0.04} pos={[0, 0, 0]} cor="#222" lados={40} />
      </Palco>
    );
  }
  return (
    <Palco cinema clima="dia" pos={[0, 6, 9]} olha={[0, 0, 0]} fov={48}>
      <Estrada />
      <Gato x={lerp(s, 0, D('abs'), -2.5, 2.5)} />
      <group position={[x, 0, desvio]} rotation={[0, desvio * 0.15, 0]}>
        <Carro travada={travada} giro={s * 14} motorista={<Motorista expressao="serio" />} />
      </group>
      <B tam={[0.2, 0.2, 0.2]} pos={[x + 1.15, 1.5, desvio + 0.85]} cor="#3ddc84" emi={travada ? 2 : 0.3} />
    </Palco>
  );
};

// ===== 11. FINAL: para certinho na faixa =====
export const CenaFinal = () => {
  const s = useSeg();
  const frame = useCurrentFrame();
  const x = lerp(s, 0, D('final') * 0.4, -4, 0, Easing.out(Easing.cubic));
  return (
    <Palco cinema clima="dia" pos={[3, 2.2, 7.5]} olha={[0.5, 0.8, 0]} fov={48}>
      <Estrada />
      <B tam={[0.4, 0.14, 4.6]} pos={[2.3, -0.02, 0]} cor="#f2f2f2" />
      <Carro posicao={[x, 0, 0.6]} giro={x * 2} motorista={<Motorista expressao="feliz" pose={s > D('final') * 0.4 ? 'comemorar' : 'parado'} />} />
      {s > D('final') * 0.35 &&
        Array.from({length: 36}, (_, i) => {
          const t = (frame * 0.02 + i * 0.137) % 1;
          return (
            <mesh key={i} position={[((i * 1.7) % 6) - 2, 4 - t * 4, ((i * 0.7) % 3) - 1]} rotation={[frame * 0.1 + i, frame * 0.07, 0]} scale={0.12}>
              <boxGeometry args={[1, 1, 0.2]} />
              <meshBasicMaterial color={['#e63946', '#ffcc00', '#2a9d8f', '#3fa9f5', '#ff5a9f'][i % 5]} />
            </mesh>
          );
        })}
    </Palco>
  );
};
