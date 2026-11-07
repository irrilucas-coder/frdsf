import type React from 'react';
import {Easing, interpolate, useCurrentFrame} from 'remotion';
import {Bloquinho} from '../submarino/Bloquinho';
import {Palco} from '../submarino/Palco';
import {ALTURA_ANDAR, estadoEm} from './estado';
import {FPS, duracaoCena, quandoDiz, type CenaId} from './roteiro';

type V3 = [number, number, number];
const lerp = (s: number, a: number, b: number, de: number, para: number, easing = Easing.inOut(Easing.quad)) =>
  interpolate(s, [a, b], [de, para], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing});
const useSeg = () => useCurrentFrame() / FPS;

const B = ({tam, pos = [0, 0, 0], rot = [0, 0, 0], cor, emi = 0, metal = 0.1}: {tam: V3; pos?: V3; rot?: V3; cor: string; emi?: number; metal?: number}) => (
  <mesh position={pos} rotation={rot} castShadow receiveShadow>
    <boxGeometry args={tam} />
    <meshStandardMaterial color={cor} roughness={0.6} metalness={metal} emissive={emi ? cor : '#000'} emissiveIntensity={emi} />
  </mesh>
);

const Voce = (p: {posicao?: V3; rotacaoY?: number; alvoMaoE?: V3; alvoMaoD?: V3; pose?: 'parado' | 'andar' | 'manivela' | 'acenar' | 'comemorar' | 'apontar' | 'susto'; expressao?: 'feliz' | 'assustado' | 'cansado' | 'serio'; suor?: boolean; escala?: number; velocidade?: number}) => (
  <Bloquinho {...p} pele="#e8b48a" camisa="#ffcc00" calca="#1f5fa8" chapeu="cabelo" corChapeu="#2a1d14" />
);

// ---------- Poço do elevador (prédio em corte) ----------
type OpcoesPoco = {
  andar: number;
  corda?: 'corda' | 'cabos' | 'nenhuma';
  cabosRompidos?: number;
  cordaRompida?: boolean;
  contrapeso?: boolean;
  garras?: number; // 0 recolhidas, 1 travadas
  faiscas?: boolean;
  molas?: number; // 0 = sem molas, >0 = compressão
  portas?: number; // 0 fechadas, 1 abertas
  comPortas?: boolean;
  contrapesoC?: number; // posição do contrapeso: y = C - y da cabine
  passageiro?: React.ReactNode;
};

const Andares = ({andar}: {andar: number}) => {
  const base = Math.floor(andar);
  return (
    <>
      {Array.from({length: 11}, (_, k) => {
        const n = base - 5 + k;
        if (n < 0) return null;
        const y = n * ALTURA_ANDAR;
        const cor = n % 2 ? '#d9d4c7' : '#cfc9ba';
        return (
          <group key={n} position={[0, y, 0]}>
            {/* laje */}
            <B tam={[10, 0.3, 6]} pos={[-6.6, -0.15, 0]} cor="#8a857a" />
            <B tam={[10, 0.3, 6]} pos={[8, -0.15, 0]} cor="#8a857a" />
            {/* soleira da porta do andar (fica atrás da cabine, no fundo do poço) */}
            <B tam={[4.6, 0.12, 0.3]} pos={[0.7, 0, -1.75]} cor="#6b6b6b" metal={0.5} />
            {/* parede de fundo do poço com faixa do andar */}
            <B tam={[5, ALTURA_ANDAR, 0.2]} pos={[1, ALTURA_ANDAR / 2, -1.6]} cor={cor} />
            <B tam={[5, 0.25, 0.22]} pos={[1, 0.4, -1.58]} cor={n % 5 === 0 ? '#e10600' : '#7a8594'} />
            {/* corredores com porta e luz */}
            <B tam={[0.9, 2.1, 0.1]} pos={[-3.5, 1.05, -2.9]} cor="#5a3a24" />
            <B tam={[0.9, 2.1, 0.1]} pos={[5.5, 1.05, -2.9]} cor="#5a3a24" />
            <B tam={[10, ALTURA_ANDAR, 0.2]} pos={[-6.6, ALTURA_ANDAR / 2, -3]} cor="#e8e2d2" />
            <B tam={[10, ALTURA_ANDAR, 0.2]} pos={[8, ALTURA_ANDAR / 2, -3]} cor="#e8e2d2" />
          </group>
        );
      })}
    </>
  );
};

const Mola = ({posicao, compressao}: {posicao: V3; compressao: number}) => {
  const altura = 1.4 * (1 - compressao * 0.55);
  return (
    <group position={posicao}>
      {Array.from({length: 7}, (_, i) => (
        <mesh key={i} position={[0, (i / 6) * altura, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.3, 0.06, 8, 20]} />
          <meshStandardMaterial color="#c9c9c9" metalness={0.8} roughness={0.3} />
        </mesh>
      ))}
    </group>
  );
};

const Faiscas = ({posicao}: {posicao: V3}) => {
  const frame = useCurrentFrame();
  return (
    <group position={posicao}>
      {Array.from({length: 10}, (_, i) => {
        const t = ((frame + i * 3) % 12) / 12;
        const a = i * 0.9;
        return (
          <mesh key={i} position={[Math.cos(a) * t * 0.8, t * 0.6 - t * t, Math.sin(a) * t * 0.4]} scale={0.06 * (1 - t)}>
            <boxGeometry args={[1, 1, 1]} />
            <meshBasicMaterial color="#ffd23f" />
          </mesh>
        );
      })}
      <pointLight color="#ffb347" intensity={15} distance={4} />
    </group>
  );
};

export const Poco = ({andar, corda = 'corda', cabosRompidos = 0, cordaRompida = false, contrapeso = false, garras = 0, faiscas = false, molas = 0, portas = 0, comPortas = false, contrapesoC = 30, passageiro}: OpcoesPoco) => {
  const yc = andar * ALTURA_ANDAR;
  const topo = yc + 25;
  const xCabos = corda === 'cabos' ? [-0.5, -0.3, -0.1, 0.1, 0.3, 0.5] : [0];
  return (
    <group>
      <Andares andar={andar} />
      {/* trilhos guia */}
      {[-1.34, 1.34].map((x) => (
        <group key={x}>
          <B tam={[0.08, 80, 0.22]} pos={[x, yc, -0.2]} cor="#5d6670" metal={0.7} />
          <B tam={[0.16, 80, 0.06]} pos={[x + (x > 0 ? 0.06 : -0.06), yc, -0.32]} cor="#4a525b" metal={0.7} />
        </group>
      ))}
      {/* fosso e molas */}
      {molas > 0 && andar < 4 && (
        <group>
          <B tam={[3, 0.3, 3]} pos={[0, -2.1, -0.2]} cor="#5a564c" />
          <Mola posicao={[-0.6, -1.95, -0.2]} compressao={molas} />
          <Mola posicao={[0.6, -1.95, -0.2]} compressao={molas} />
        </group>
      )}
      {/* cabine */}
      <group position={[0, yc, 0]}>
        <B tam={[2.4, 0.15, 2.4]} pos={[0, 0.08, -0.2]} cor="#3a3f46" metal={0.4} />
        <B tam={[2.4, 0.15, 2.4]} pos={[0, 2.62, -0.2]} cor="#3a3f46" metal={0.4} />
        <B tam={[0.1, 2.6, 2.4]} pos={[-1.15, 1.35, -0.2]} cor="#b8c0c8" metal={0.5} />
        <B tam={[0.1, 2.6, 2.4]} pos={[1.15, 1.35, -0.2]} cor="#b8c0c8" metal={0.5} />
        <B tam={[2.4, 2.6, 0.1]} pos={[0, 1.35, -1.35]} cor="#aab3bb" metal={0.5} />
        {/* corrimão no fundo */}
        <B tam={[2.0, 0.06, 0.06]} pos={[0, 0.95, -1.22]} cor="#d9d9d9" metal={0.9} />
        {/* painel de botões na lateral direita */}
        <B tam={[0.04, 0.9, 0.35]} pos={[1.08, 1.3, 0.55]} cor="#3a3f46" metal={0.6} />
        {Array.from({length: 8}, (_, i) => (
          <mesh key={i} position={[1.055, 1.0 + Math.floor(i / 2) * 0.17, 0.47 + (i % 2) * 0.16]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.04, 0.04, 0.02, 12]} />
            <meshStandardMaterial color="#ffcc66" emissive="#ffb347" emissiveIntensity={i === 7 ? 1.5 : 0.3} />
          </mesh>
        ))}
        {/* display do andar */}
        <B tam={[0.5, 0.18, 0.04]} pos={[0, 2.35, -1.28]} cor="#111" />
        <B tam={[0.3, 0.1, 0.02]} pos={[0, 2.35, -1.25]} cor="#ff3b30" emi={1.2} />
        {/* luminária no teto */}
        <B tam={[1.2, 0.04, 0.6]} pos={[0, 2.53, -0.2]} cor="#fff6e0" emi={0.8} />
        {/* portas de correr */}
        {comPortas && (
          <>
            <B tam={[1.15, 2.4, 0.06]} pos={[-0.58 - portas * 1.0, 1.32, 1.0]} cor="#8a939c" metal={0.7} />
            <B tam={[1.15, 2.4, 0.06]} pos={[0.58 + portas * 1.0, 1.32, 1.0]} cor="#8a939c" metal={0.7} />
          </>
        )}
        <pointLight position={[0, 2.2, 0.6]} intensity={6} distance={5} color="#fff6e0" />
        {passageiro}
        {/* garras do freio de segurança */}
        {[-1, 1].map((l) => (
          <group key={l} position={[l * (1.22 + garras * 0.06), 0.3, -0.2]}>
            <mesh rotation={[0, 0, l > 0 ? -0.4 : 0.4]} scale={[1, 1, 1]}>
              <boxGeometry args={[0.18, 0.5, 0.35]} />
              <meshStandardMaterial color={garras > 0.5 ? '#e10600' : '#c9a227'} metalness={0.7} emissive={garras > 0.5 ? '#e10600' : '#000'} emissiveIntensity={garras > 0.5 ? 0.6 : 0} />
            </mesh>
          </group>
        ))}
        {faiscas && (
          <>
            <Faiscas posicao={[-1.34, 0.3, -0.2]} />
            <Faiscas posicao={[1.34, 0.3, -0.2]} />
          </>
        )}
      </group>
      {/* corda ou cabos de aço */}
      {corda !== 'nenhuma' &&
        xCabos.map((x, i) => {
          const rompido = (corda === 'corda' && cordaRompida) || (corda === 'cabos' && i < cabosRompidos);
          if (rompido) {
            return (
              <group key={i}>
                <mesh position={[x, yc + 2.7 + 0.8, -0.2]} rotation={[0, 0, 0.5]}>
                  <cylinderGeometry args={[0.04, 0.04, 1.6, 6]} />
                  <meshStandardMaterial color={corda === 'corda' ? '#a0703c' : '#9aa0a8'} />
                </mesh>
              </group>
            );
          }
          return (
            <mesh key={i} position={[x, (yc + 2.7 + topo) / 2, -0.2]}>
              <cylinderGeometry args={[corda === 'corda' ? 0.06 : 0.035, corda === 'corda' ? 0.06 : 0.035, topo - yc - 2.7, 6]} />
              <meshStandardMaterial color={corda === 'corda' ? '#a0703c' : '#9aa0a8'} metalness={corda === 'corda' ? 0 : 0.8} />
            </mesh>
          );
        })}
      {/* contrapeso: desce quando a cabine sobe */}
      {contrapeso && (
        <group position={[2.2, contrapesoC - yc, -0.6]}>
          <B tam={[0.9, 2.2, 0.9]} cor="#4a4f57" metal={0.5} />
          <B tam={[0.95, 0.15, 0.95]} pos={[0, 0.6, 0]} cor="#ffcc00" />
          <B tam={[0.95, 0.15, 0.95]} pos={[0, -0.6, 0]} cor="#ffcc00" />
          <mesh position={[0, 12, 0]}>
            <cylinderGeometry args={[0.05, 0.05, 22, 6]} />
            <meshStandardMaterial color="#9aa0a8" />
          </mesh>
        </group>
      )}
    </group>
  );
};

// Setas azuis (física)
const Seta = ({posicao, para = 'cima', escala = 1}: {posicao: V3; para?: 'cima' | 'baixo'; escala?: number}) => (
  <group position={posicao} rotation={[0, 0, para === 'cima' ? 0 : Math.PI]} scale={escala}>
    <mesh position={[0, 0.35, 0]}>
      <coneGeometry args={[0.25, 0.4, 4]} />
      <meshStandardMaterial color="#3fa9f5" emissive="#3fa9f5" emissiveIntensity={0.8} />
    </mesh>
    <mesh>
      <boxGeometry args={[0.12, 0.5, 0.12]} />
      <meshStandardMaterial color="#3fa9f5" emissive="#3fa9f5" emissiveIntensity={0.8} />
    </mesh>
  </group>
);

// Câmera padrão: acompanha a cabine
const camCabine = (andar: number, s: number, dist = 9, lado = 1.5): {pos: V3; olha: V3} => {
  const y = andar * ALTURA_ANDAR;
  return {pos: [lado + Math.sin(s * 0.3) * 0.4, y + 1.7, dist], olha: [0.2, y + 1.3, 0]};
};

const usaEstado = (id: CenaId) => {
  const s = useSeg();
  return {s, e: estadoEm(id, s)};
};

// ===== 0. GANCHO: cabine despencando =====
export const CenaGancho = () => {
  const {s, e} = usaEstado('gancho');
  const c = camCabine(e.andar, s, 7, 2.2);
  const treme = Math.sin(s * 50) * 0.06;
  return (
    <Palco cinema clima="interior" pos={[c.pos[0] + treme, c.pos[1], c.pos[2]]} olha={c.olha} fov={52} sombras={false}>
      <Poco andar={e.andar} cordaRompida passageiro={<Voce posicao={[0, 0.15, -0.3]} pose="susto" expressao="assustado" escala={0.85} />} />
      <pointLight position={[3, e.andar * ALTURA_ANDAR + 4, 4]} intensity={20} color="#ff6b5a" />
    </Palco>
  );
};

// ===== 1. ESCADA infinita =====
export const CenaEscada = () => {
  const s = useSeg();
  const fim = duracaoCena('escada');
  const sobe = lerp(s, 0, fim, 0, 3.2, Easing.linear);
  return (
    <Palco cinema clima="dia" pos={[5.5, 2.6 + sobe * 0.6, 7]} olha={[0, 1.6 + sobe * 0.6, 0]} fov={50}>
      {Array.from({length: 60}, (_, i) => (
        <B key={i} tam={[2, 0.3, 0.6]} pos={[0, i * 0.3, -i * 0.6]} cor={i % 10 === 0 ? '#e10600' : '#c9c2b0'} />
      ))}
      <Voce posicao={[0, sobe * 0.3 + 0.15, -sobe * 0.6]} rotacaoY={Math.PI} pose="andar" expressao="cansado" suor velocidade={0.7} />
      {[-1.05, 1.05].map((x) => (
        <mesh key={x} position={[x, 9 + 0.9, -18]} rotation={[Math.atan2(0.3, 0.6), 0, 0]}>
          <boxGeometry args={[0.08, 0.08, 40.3]} />
          <meshStandardMaterial color="#7a5a3a" />
        </mesh>
      ))}
      <mesh position={[0, 20, -30]}>
        <boxGeometry args={[2.4, 0.4, 0.6]} />
        <meshStandardMaterial color="#e10600" emissive="#e10600" emissiveIntensity={0.6} />
      </mesh>
    </Palco>
  );
};

// ===== 2. MANIVELA: guincho dentro da cabine, mãos na manopla =====
const Guincho = ({angulo}: {angulo: number}) => {
  // eixo em coordenadas da cabine; o boneco (escala 0.85 em [0, 0.15, -0.2]) alcança a manopla
  const C: V3 = [0, 1.13, 0.31];
  const r = 0.153;
  const hy = C[1] + r * Math.sin(angulo);
  const hz = C[2] + r * Math.cos(angulo);
  return (
    <group>
      {/* suportes presos no piso da cabine */}
      {[-0.42, 0.42].map((x) => (
        <B key={x} tam={[0.06, C[1] - 0.15, 0.08]} pos={[x, (C[1] + 0.15) / 2, C[2]]} cor="#5a3a24" />
      ))}
      {/* eixo e tambor com a corda enrolada */}
      <mesh position={C} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.03, 0.03, 0.9, 10]} />
        <meshStandardMaterial color="#8a8a8a" metalness={0.8} />
      </mesh>
      <mesh position={C} rotation={[angulo, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.1, 0.1, 0.4, 16]} />
        <meshStandardMaterial color="#a0703c" />
      </mesh>
      {/* corda saindo do tambor e subindo pelo furo do teto */}
      <mesh position={[0, (C[1] + 2.7) / 2, C[2] - 0.1]}>
        <cylinderGeometry args={[0.025, 0.025, 2.7 - C[1], 6]} />
        <meshStandardMaterial color="#a0703c" />
      </mesh>
      {/* braços da manivela (dos dois lados) e manopla onde ficam as mãos */}
      {[-0.46, 0.46].map((x) => (
        <mesh key={x} position={[x, (C[1] + hy) / 2, (C[2] + hz) / 2]} rotation={[Math.PI / 2 - angulo, 0, 0]}>
          <boxGeometry args={[0.04, r, 0.04]} />
          <meshStandardMaterial color="#c9a227" metalness={0.8} />
        </mesh>
      ))}
      <mesh position={[0, hy, hz]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.025, 0.025, 0.92, 10]} />
        <meshStandardMaterial color="#c9a227" metalness={0.8} />
      </mesh>
    </group>
  );
};

export const CenaManivela = () => {
  const {s, e} = usaEstado('manivela');
  const tDesiste = quandoDiz('manivela', 'L2', 'braço');
  const cansado = s > tDesiste - 0.6;
  // gira enquanto sobe e para quando o braço desiste
  const angulo = (cansado ? tDesiste - 0.6 : s) * 5;
  // posição da manopla nas coordenadas do boneco (inverso de [0,0.15,-0.2] + 0.85·p)
  const hy = (1.13 + 0.153 * Math.sin(angulo) - 0.15) / 0.85;
  const hz = (0.31 + 0.153 * Math.cos(angulo) + 0.2) / 0.85;
  const c = camCabine(e.andar, s, 5.8, 2.6);
  return (
    <Palco cinema clima="interior" pos={c.pos} olha={c.olha} fov={46} sombras={false}>
      <Poco
        andar={e.andar}
        passageiro={
          <>
            <Voce
              posicao={[0, 0.15, -0.2]}
              pose="parado"
              alvoMaoE={[-0.26, hy, hz]}
              alvoMaoD={[0.26, hy, hz]}
              expressao={cansado ? 'cansado' : 'feliz'}
              suor={cansado}
              escala={0.85}
            />
            <Guincho angulo={angulo} />
          </>
        }
      />
    </Palco>
  );
};

// ===== 3. CONTRAPESO =====
export const CenaContrapeso = () => {
  const {s, e} = usaEstado('contrapeso');
  const y = e.andar * ALTURA_ANDAR;
  return (
    <Palco cinema clima="interior" pos={[3, y + 1.8, 12]} olha={[1, y + 1.2, 0]} fov={52} sombras={false}>
      <Poco andar={e.andar} contrapeso contrapesoC={2 * 5.5 * 3 + 1} passageiro={<Voce posicao={[0, 0.15, -0.2]} pose="parado" expressao="feliz" escala={0.85} />} />
      <Seta posicao={[-1.9, y + 1.5, 0.5]} para="cima" escala={1.4} />
      <Seta posicao={[3.4, y + 0.5, 0.5]} para="baixo" escala={1.4} />
    </Palco>
  );
};

// ===== 4. MOTOR =====
export const CenaMotor = () => {
  const {s, e} = usaEstado('motor');
  const tBotao = quandoDiz('motor', 'L4', 'botão');
  if (s < tBotao - 0.4) {
    // casa de máquinas no topo: motor, freio, polia de tração e cabos descendo para cabine e contrapeso
    return (
      <Palco cinema clima="interior" pos={[4.2, 3.4, 7.5]} olha={[0.2, 1.4, 0]} fov={45} sombras={false}>
        <B tam={[12, 0.3, 8]} pos={[0, 0, 0]} cor="#6b6b6b" />
        <B tam={[12, 5, 0.2]} pos={[0, 2.5, -3]} cor="#8a8a80" />
        {/* base da máquina */}
        <B tam={[3.6, 0.4, 1.4]} pos={[0, 0.35, 0]} cor="#3a3f46" metal={0.5} />
        {/* motor */}
        <mesh position={[-1.1, 1.05, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.5, 0.5, 1.2, 20]} />
          <meshStandardMaterial color="#1f5fa8" metalness={0.5} roughness={0.4} />
        </mesh>
        {/* freio da máquina (tambor + sapatas) */}
        <mesh position={[-0.25, 1.05, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.38, 0.38, 0.3, 20]} />
          <meshStandardMaterial color="#9aa0a8" metalness={0.8} />
        </mesh>
        <B tam={[0.16, 0.5, 0.2]} pos={[-0.25, 1.05, 0.48]} cor="#e10600" />
        {/* polia de tração com sulcos */}
        <group position={[0.75, 1.1, 0]} rotation={[0, 0, s * 3]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.6, 0.6, 0.5, 24]} />
            <meshStandardMaterial color="#8a8a8a" metalness={0.8} roughness={0.3} />
          </mesh>
          {[-0.15, 0, 0.15].map((z) => (
            <mesh key={z} position={[0, 0, z]}>
              <torusGeometry args={[0.6, 0.025, 6, 24]} />
              <meshStandardMaterial color="#555" metalness={0.8} />
            </mesh>
          ))}
          <B tam={[1.1, 0.08, 0.52]} cor="#6b6b6b" metal={0.7} />
        </group>
        {/* cabos descendo pelos furos do piso: frente = cabine, trás = contrapeso */}
        {[-0.12, 0, 0.12].map((z) => (
          <group key={z}>
            <mesh position={[1.35, -0.2, z]}>
              <cylinderGeometry args={[0.02, 0.02, 2.6, 6]} />
              <meshStandardMaterial color="#c0c4c8" metalness={0.9} />
            </mesh>
            <mesh position={[0.15, -0.2, z]}>
              <cylinderGeometry args={[0.02, 0.02, 2.6, 6]} />
              <meshStandardMaterial color="#c0c4c8" metalness={0.9} />
            </mesh>
          </group>
        ))}
        {/* quadro de comando */}
        <B tam={[1, 1.8, 0.5]} pos={[3.2, 0.95, -2.5]} cor="#d9d4c7" />
        <B tam={[0.16, 0.16, 0.04]} pos={[3.0, 1.5, -2.24]} cor="#3ddc84" emi={1.5} />
        <B tam={[0.16, 0.16, 0.04]} pos={[3.3, 1.5, -2.24]} cor="#ffcc00" emi={1.2} />
        <pointLight position={[0, 3.5, 2.5]} intensity={10} />
      </Palco>
    );
  }
  const c = camCabine(e.andar, s, 6.5, 1);
  return (
    <Palco cinema clima="interior" pos={c.pos} olha={c.olha} fov={48} sombras={false}>
      <Poco andar={e.andar} passageiro={<Voce posicao={[0, 0.15, -0.2]} pose="apontar" expressao="feliz" escala={0.85} />} />
      <Seta posicao={[-1.9, e.andar * ALTURA_ANDAR + 1.4, 0.6]} para="cima" escala={1.6} />
    </Palco>
  );
};

// ===== 5. CORDA ARREBENTA =====
export const CenaArrebenta = () => {
  const {s, e} = usaEstado('arrebenta');
  const tRompe = quandoDiz('arrebenta', 'L5', 'arrebenta');
  const rompeu = s > tRompe;
  const c = camCabine(e.andar, s, rompeu ? 6 : 7, rompeu ? 2.3 : 1.3);
  const treme = rompeu && e.vel > 2 ? Math.sin(s * 55) * 0.07 : 0;
  return (
    <Palco cinema clima="interior" pos={[c.pos[0] + treme, c.pos[1], c.pos[2]]} olha={c.olha} fov={50} sombras={false}>
      <Poco andar={e.andar} cordaRompida={rompeu} passageiro={<Voce posicao={[0, 0.15, -0.2]} pose={rompeu ? 'susto' : 'parado'} expressao={rompeu ? 'assustado' : 'feliz'} escala={0.85} />} />
      {rompeu && <pointLight position={[2, e.andar * ALTURA_ANDAR + 3, 3]} intensity={18} color="#ff4d3a" />}
    </Palco>
  );
};

// ===== 6. CABOS DE AÇO =====
export const CenaCabos = () => {
  const {s, e} = usaEstado('cabos');
  const tRompe = quandoDiz('cabos', 'L6', 'rompe');
  const y = e.andar * ALTURA_ANDAR;
  return (
    <Palco cinema clima="interior" pos={[1.2, y + 2.3, 7.5]} olha={[0, y + 1.9, 0]} fov={52} sombras={false}>
      <Poco andar={e.andar} corda="cabos" cabosRompidos={s > tRompe ? 1 : 0} passageiro={<Voce posicao={[0, 0.15, -0.2]} pose={s > tRompe + 1 ? 'comemorar' : 'parado'} expressao="feliz" escala={0.85} />} />
    </Palco>
  );
};

// ===== 7. FREIO DE SEGURANÇA =====
export const CenaFreio = () => {
  const {s, e} = usaEstado('freio');
  const tMordem = quandoDiz('freio', 'L7', 'mordem');
  const tVel = quandoDiz('freio', 'L7', 'velocidade');
  const garras = lerp(s, tMordem - 0.2, tMordem + 0.2, 0, 1);
  const caindo = s > tVel - 1.5 && s < tMordem + 0.3;
  const c = camCabine(e.andar, s, 5.6, 2.4);
  return (
    <Palco cinema clima="interior" pos={[c.pos[0] + (caindo ? Math.sin(s * 50) * 0.05 : 0), c.pos[1] - 0.8, c.pos[2]]} olha={[c.olha[0], c.olha[1] - 0.6, c.olha[2]]} fov={50} sombras={false}>
      <Poco andar={e.andar} corda="nenhuma" garras={garras} faiscas={garras > 0.2 && s < tMordem + 1.6} passageiro={<Voce posicao={[0, 0.15, -0.2]} pose={garras > 0.9 ? 'comemorar' : 'susto'} expressao={garras > 0.9 ? 'feliz' : 'assustado'} escala={0.85} />} />
    </Palco>
  );
};

// ===== 8. MOLAS NO FOSSO =====
export const CenaMolas = () => {
  const {s, e} = usaEstado('molas');
  const fim = duracaoCena('molas');
  const comp = lerp(s, fim * 0.45, fim * 0.65, 0.05, 1, Easing.out(Easing.back(2)));
  return (
    <Palco cinema clima="interior" pos={[3.8, 2.2, 8]} olha={[0, 0.9, 0]} fov={52} sombras={false}>
      <Poco andar={Math.max(e.andar, 0) - comp * 0.2} corda="nenhuma" molas={comp} passageiro={<Voce posicao={[0, 0.15, -0.2]} pose="parado" expressao={comp > 0.9 ? 'feliz' : 'assustado'} escala={0.85} />} />
    </Palco>
  );
};

// ===== 9. O INVENTOR corta a própria corda =====
export const CenaInventor = () => {
  const s = useSeg();
  const fim = duracaoCena('inventor');
  const tCortar = quandoDiz('inventor', 'L9', 'cortar');
  const cortou = s > tCortar + 0.3;
  const cai = lerp(s, tCortar + 0.3, tCortar + 0.6, 0, 0.35, Easing.in(Easing.quad));
  const frame = useCurrentFrame();
  return (
    <Palco cinema clima="interior" pos={[lerp(s, 0, fim, -5, 3), 5, 15]} olha={[0, 5, 0]} fov={50}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial color="#8a6a45" />
      </mesh>
      <B tam={[30, 14, 0.3]} pos={[0, 7, -6]} cor="#d8c9a8" />
      {/* bandeirinhas da exposição */}
      {Array.from({length: 12}, (_, i) => (
        <mesh key={i} position={[-8 + i * 1.45, 10.5 - Math.sin((i / 11) * Math.PI) * 0.6, -5]} rotation={[0, 0, Math.PI]}>
          <coneGeometry args={[0.3, 0.55, 3]} />
          <meshStandardMaterial color={['#e63946', '#f1faee', '#457b9d', '#ffcc00'][i % 4]} />
        </mesh>
      ))}
      {/* torre alta com trilhos-guia, polia no topo e plataforma com grade (um elevador aberto) */}
      {[-1.8, 1.8].map((x) => (
        <B key={x} tam={[0.35, 12, 0.35]} pos={[x, 6, -1]} cor="#5a3a24" />
      ))}
      <B tam={[4, 0.35, 0.5]} pos={[0, 12, -1]} cor="#5a3a24" />
      <mesh position={[0, 12.5, -0.6]} rotation={[Math.PI / 2, 0, frame * 0.02]}>
        <cylinderGeometry args={[0.45, 0.45, 0.2, 16]} />
        <meshStandardMaterial color="#8a8a8a" metalness={0.7} />
      </mesh>
      <group position={[0, 5.5 - cai, -0.6]}>
        <B tam={[3.2, 0.25, 2.2]} cor="#8a5a2b" />
        {/* grade em volta da plataforma */}
        {[-1.5, 1.5].map((x) => (
          <B key={x} tam={[0.08, 1.1, 2.2]} pos={[x, 0.65, 0]} cor="#3a2a1a" />
        ))}
        <B tam={[3.2, 0.08, 0.08]} pos={[0, 1.2, 1.05]} cor="#3a2a1a" />
        {/* armação de cima onde a corda se prende */}
        {[-1.5, 1.5].map((x) => (
          <B key={x} tam={[0.1, 2.6, 0.1]} pos={[x, 1.4, -1]} cor="#3a2a1a" />
        ))}
        <B tam={[3.2, 0.12, 0.12]} pos={[0, 2.7, -1]} cor="#3a2a1a" />
        <Bloquinho posicao={[0.4, 0.12, 0.2]} chapeu="cartola" corChapeu="#1a1a1a" camisa="#2b2b3a" calca="#2b2b3a" bigode pose={cortou ? 'acenar' : 'apontar'} expressao="feliz" escala={0.7} />
        {cortou && (
          <>
            <Faiscas posicao={[-1.8, 0, -0.4]} />
            <Faiscas posicao={[1.8, 0, -0.4]} />
          </>
        )}
      </group>
      {/* corda: da armação da plataforma até a polia */}
      {!cortou ? (
        <mesh position={[0, (5.5 + 2.7 + 12.5) / 2, -1.6]}>
          <cylinderGeometry args={[0.05, 0.05, 12.5 - 8.2, 6]} />
          <meshStandardMaterial color="#a0703c" />
        </mesh>
      ) : (
        <mesh position={[0.3, 11.5, -1.6]} rotation={[0, 0, Math.sin(frame * 0.3) * 0.3]}>
          <cylinderGeometry args={[0.05, 0.05, 1.8, 6]} />
          <meshStandardMaterial color="#a0703c" />
        </mesh>
      )}
      {/* assistente com machado */}
      <Bloquinho posicao={[2.4, 0, 0.4]} rotacaoY={-0.6} camisa="#6b8e23" chapeu="coco" corChapeu="#3a2a1a" pose={s > tCortar - 0.3 ? 'apontar' : 'parado'} escala={0.9} />
      {/* plateia */}
      {Array.from({length: 9}, (_, i) => (
        <Bloquinho
          key={i}
          posicao={[-5 + (i % 5) * 2.4, 0, 3 + Math.floor(i / 5) * 1.6]}
          rotacaoY={Math.PI}
          camisa={['#e63946', '#457b9d', '#2a9d8f', '#f4a261', '#6a4c93'][i % 5]}
          chapeu={i % 3 ? 'coco' : 'cartola'}
          corChapeu="#2a2a2a"
          pose={cortou ? 'comemorar' : 'susto'}
          expressao={cortou ? 'feliz' : 'assustado'}
          fase={i}
          escala={0.85}
        />
      ))}
      <pointLight position={[0, 9, 6]} intensity={30} color="#fff2dc" />
    </Palco>
  );
};

// ===== 10. PARABÉNS: andar 100 =====
export const CenaParabens = () => {
  const {s, e} = usaEstado('parabens');
  const fim = duracaoCena('parabens');
  const portas = lerp(s, fim * 0.72, fim * 0.85, 0, 1);
  const frame = useCurrentFrame();
  const c = camCabine(e.andar, s, 6, 0.8);
  const y = e.andar * ALTURA_ANDAR;
  return (
    <Palco cinema clima="interior" pos={c.pos} olha={c.olha} fov={48} sombras={false}>
      <Poco andar={e.andar} corda="cabos" comPortas portas={portas} passageiro={<Voce posicao={[0, 0.15, -0.2]} pose={portas > 0.5 ? 'comemorar' : 'parado'} expressao="feliz" escala={0.85} />} />
      {portas > 0.3 &&
        Array.from({length: 40}, (_, i) => {
          const t = ((frame * 0.02 + i * 0.137) % 1);
          return (
            <mesh key={i} position={[((i * 1.7) % 6) - 3, y + 5 - t * 5, 1.5 + ((i * 0.7) % 1.5)]} rotation={[frame * 0.1 + i, frame * 0.07, 0]} scale={0.12}>
              <boxGeometry args={[1, 1, 0.2]} />
              <meshBasicMaterial color={['#e63946', '#ffcc00', '#2a9d8f', '#3fa9f5', '#ff5a9f'][i % 5]} />
            </mesh>
          );
        })}
    </Palco>
  );
};

// ===== 11. MANDA PRA ELE =====
export const CenaManda = () => {
  const s = useSeg();
  return (
    <Palco cinema clima="estudio" pos={[0, 1.9, 5 + s * 0.2]} olha={[0, 1.4, 0]} fov={45} sombras={false}>
      <Voce pose="acenar" expressao="feliz" />
    </Palco>
  );
};
