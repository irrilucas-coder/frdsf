import {Easing, interpolate, useCurrentFrame} from 'remotion';
import type {V3} from '../submarino/camera';
import {Palco} from '../submarino/Palco';
import {Seta3D} from '../edicao/Seta3D';
import {Campo, LuzDia} from '../personagem/Cenario';
import {Ambulancia, Carro, Celular, Certo, Chave, Comprimido, Coracao, Hospital, Maca, Mulher, Pai, Primo, Relogio, RuaNoite, Sala, Socorrista, Tio, Voce, XVermelho} from './Modelos';
import {FPS, duracaoCena, quandoDiz, type CenaId} from './roteiro';

const lerp = (s: number, a: number, b: number, de: number, para: number, easing = Easing.inOut(Easing.quad)) =>
  interpolate(s, [a, b], [de, para], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing});
const lerp3 = (s: number, a: number, b: number, de: V3, para: V3, easing = Easing.inOut(Easing.quad)): V3 => [lerp(s, a, b, de[0], para[0], easing), lerp(s, a, b, de[1], para[1], easing), lerp(s, a, b, de[2], para[2], easing)];
const useSeg = () => useCurrentFrame() / FPS;
const R = quandoDiz;
const D = duracaoCena;
const pop = (s: number, t: number) => lerp(s, t, t + 0.25, 0, 1, Easing.out(Easing.back(2.2)));
// compressões: ~1,72 por segundo (103 por minuto, ritmo de Stayin' Alive)
const compressao = (s: number) => Math.max(0, Math.sin(s * Math.PI * 2 * 1.72)) ** 1.5;

// Sofá: assento ~0.75 de altura; sentado de frente para a TV (TV fica em -z)
const SENTA_Y = 0.15;
const OX = -3.2; // área livre da sala (perto da janela) para a massagem cardíaca
const PEITO: V3 = [0.02, 1.12, 0.3];

const Studio = ({children, pos, olha, fov = 40}: {children: React.ReactNode; pos: V3; olha: V3; fov?: number}) => (
  <Palco cinema cartoon clima="estudio" pos={pos} olha={olha} fov={fov} sombras={false}>
    <hemisphereLight args={['#ffffff', '#ffb3d1', 0.9]} />
    <directionalLight position={[3, 6, 5]} intensity={1.5} />
    {children}
  </Palco>
);
const NaSala = ({children, pos, olha, fov = 52}: {children: React.ReactNode; pos: V3; olha: V3; fov?: number}) => (
  <Palco cinema cartoon clima="interior" pos={pos} olha={olha} fov={fov} sombras={false}>
    <Sala />
    {children}
  </Palco>
);

// Pai deitado de costas no chão (cabeça para -z)
const PaiDeitado = ({pos = [OX, 0, 0] as V3, peito = 0}: {pos?: V3; peito?: number}) => (
  <group position={[pos[0], pos[1] + 0.22 - peito * 0.05, pos[2]]} rotation={[-Math.PI / 2, 0, 0]}>
    <Pai expressao="cansado" sombraChao={false} olhar={[0, -1]} />
  </group>
);
// Socorrista ajoelhado ao lado direito do peito, fazendo compressões
const Massagem = ({Quem = Voce, s, pos = [OX, 0, 0] as V3, ativo = true}: {Quem?: typeof Voce; s: number; pos?: V3; ativo?: boolean}) => {
  const c = ativo ? compressao(s) : 0;
  return (
    <group position={[pos[0] + 0.48, pos[1] - 0.36 - c * 0.07, pos[2] - 1.12]} rotation={[0, -Math.PI / 2, 0]}>
      <Quem pose="ajoelhado" expressao="serio" alvoMaoE={[-0.05, 0.86 + c * 0.0, 0.48]} alvoMaoD={[0.05, 0.88, 0.48]} sombraChao={false} />
    </group>
  );
};
// Notas musicais flutuando (ritmo)
const Notas = ({s, pos}: {s: number; pos: V3}) => (
  <>
    {Array.from({length: 5}, (_, i) => {
      const k = (s * 0.6 + i / 5) % 1;
      return (
        <group key={i} position={[pos[0] + Math.sin(i * 2 + s) * 0.8, pos[1] + k * 2, pos[2]]} scale={(1 - k) * (1 + compressao(s) * 0.3)}>
          <mesh>
            <sphereGeometry args={[0.12, 10, 8]} />
            <meshStandardMaterial color={['#ff4f8b', '#ffd23f', '#3df2ff', '#8a4dff', '#1fcf5a'][i]} emissive={['#ff4f8b', '#ffd23f', '#3df2ff', '#8a4dff', '#1fcf5a'][i]} emissiveIntensity={0.6} />
          </mesh>
          <mesh position={[0.1, 0.25, 0]}>
            <boxGeometry args={[0.03, 0.5, 0.03]} />
            <meshStandardMaterial color="#222" />
          </mesh>
        </group>
      );
    })}
  </>
);

// ===== 0. Vendo o jogo... ele leva a mão ao peito =====
export const CenaJogo = () => {
  const s = useSeg();
  const tRep = R('jogo', 'L0', 'repente');
  if (s < tRep) {
    return (
      <NaSala pos={lerp3(s, 0, tRep, [0.3, 1.9, -1.6], [0.2, 1.8, -0.9])} olha={[0, 1.4, 1.6]}>
        <Pai posicao={[0.55, SENTA_Y, 1.55]} rotacaoY={Math.PI} pose="sentado" expressao="rindo" />
        <Voce posicao={[-0.6, SENTA_Y, 1.55]} rotacaoY={Math.PI} pose="sentado" expressao="feliz" />
      </NaSala>
    );
  }
  const k = s - tRep;
  return (
    <NaSala pos={lerp3(k, 0, 1.5, [1.3, 2.0, -1.6], [1.0, 1.95, -1.1])} olha={[0.2, 1.45, 1.6]}>
      <Pai posicao={[0.55, SENTA_Y, 1.55]} rotacaoY={Math.PI} pose="sentado" expressao="assustado" suor alvoMaoD={PEITO} emote="gota" estica={-Math.sin(Math.min(1, k / 0.3) * Math.PI) * 0.2} />
      <Voce posicao={[-0.6, SENTA_Y, 1.55]} rotacaoY={Math.PI - 0.6} pose="sentado" expressao="surpreso" emote="exclamacao" emoteK={pop(k, 0.2)} />
    </NaSala>
  );
};

// ===== 1. Infarto: o coágulo entope a artéria =====
export const CenaInfarto = () => {
  const s = useSeg();
  const tCo = R('infarto', 'L1', 'coágulo');
  return (
    <Studio pos={lerp3(s, 0, D('infarto'), [0.6, 0.4, 4.6], [0.9, -0.1, 3.0])} olha={[0.2, 0.1, 0.4]}>
      <Coracao entupido={lerp(s, tCo, tCo + 1.0, 0, 1)} />
    </Studio>
  );
};

// ===== 2. Sem oxigênio o músculo morre; cada minuto conta =====
export const CenaMinuto = () => {
  const s = useSeg();
  const tMin = R('minuto', 'L2', 'minuto');
  return (
    <Studio pos={lerp3(s, 0, D('minuto'), [1.4, 0.2, 4.8], [0.6, -0.2, 3.6])} olha={[0.4, -0.2, 0.3]}>
      <Coracao entupido={1} morte={lerp(s, 0.3, tMin, 0, 1)} />
      <Relogio pos={[-1.6, 1.1, 0.3]} escala={lerp(s, tMin - 0.6, tMin, 0, 0.55, Easing.out(Easing.back(2)))} velocidade={6} />
    </Studio>
  );
};

// ===== 3. "Tosse bem forte" — NÃO! =====
export const CenaTosse = () => {
  const s = useSeg();
  const tNao = R('tosse', 'L3', 'Não');
  const tosse = Math.max(0, Math.sin(s * 9)) * (s > 0.8 ? 1 : 0);
  return (
    <NaSala pos={lerp3(s, 0, D('tosse'), [-0.6, 2.0, -2.4], [-0.4, 1.95, -1.9])} olha={[-0.2, 1.4, 1.2]}>
      <Pai posicao={[0.55, SENTA_Y, 1.55]} rotacaoY={Math.PI} pose="sentado" expressao="assustado" suor alvoMaoE={[-0.02, 1.7, 0.35]} cabecaGiro={[tosse * 0.25, 0, 0]} />
      <Tio posicao={[-1.2, 0, 0.8]} rotacaoY={Math.PI * 0.75} pose={s < tNao ? 'apontar' : 'susto'} expressao={s < tNao ? 'confiante' : 'surpreso'} falando={s < tNao} />
      <XVermelho pos={[0.55, 2.75, 1.55]} k={pop(s, tNao)} escala={0.55} />
    </NaSala>
  );
};

// ===== 4. "Deixa que eu levo" — também não! =====
export const CenaChave = () => {
  const s = useSeg();
  const tNao = R('chave', 'L4', 'Também');
  return (
    <NaSala pos={lerp3(s, 0, D('chave'), [2.4, 2.1, -1.8], [2.0, 2.0, -1.3])} olha={[0.7, 1.4, 1.2]}>
      <Primo posicao={[1.0, 0, 1.0]} rotacaoY={Math.PI + 0.4} expressao={s < tNao ? 'confiante' : 'surpreso'} alvoMaoD={[0.35, 2.05, 0.3]} falando={s < tNao} />
      <group position={[1.0, 0, 1.0]} rotation={[0, Math.PI + 0.4, 0]}>
        <Chave pos={[0.36, 2.15, 0.32]} rot={[0, 0, Math.sin(s * 10) * 0.4]} />
      </group>
      <Pai posicao={[0.0, SENTA_Y, 1.55]} rotacaoY={Math.PI} pose="sentado" expressao="cansado" suor alvoMaoD={PEITO} />
      <XVermelho pos={[1.0, 2.9, 1.0]} k={pop(s, tNao)} escala={0.55} />
    </NaSala>
  );
};

// ===== 5. No caminho ninguém ajuda; a ambulância vem preparada =====
export const CenaCaminho = () => {
  const s = useSeg();
  const tAmb = R('caminho', 'L5', 'ambulância');
  if (s < tAmb) {
    const x = -8 + s * 4;
    return (
      <Palco cinema cartoon clima="noite" pos={[x + 4.5, 3.2, 10]} olha={[x, 0.9, 0]} fov={42} sombras={false}>
        <RuaNoite />
        <Carro pos={[x, 0, 1.6]} rot={Math.PI / 2} />
        <XVermelho pos={[x, 3.2, 1.6]} k={pop(s, R('caminho', 'L5', 'ninguém'))} escala={0.9} />
      </Palco>
    );
  }
  const k = s - tAmb;
  return (
    <Palco cinema cartoon clima="noite" pos={lerp3(k, 0, 2, [7.5, 3.2, 8.5], [6.5, 2.8, 7.5])} olha={[0, 1.3, -0.5]} fov={42} sombras={false}>
      <RuaNoite />
      <Ambulancia pos={[0, 0, 1.2]} rot={Math.PI / 2} portas={lerp(k, 0.3, 1.0, 0, 1)} />
      <Certo pos={[0.5, 3.6, 1.2]} k={pop(k, 0.6)} escala={0.9} />
    </Palco>
  );
};

// ===== 6. Ligar para o SAMU, 192 =====
export const CenaLigar = () => {
  const s = useSeg();
  const t192 = R('ligar', 'L6', '192');
  const disc = lerp(s, t192 - 0.3, t192 + 0.6, 0, 1, Easing.linear);
  return (
    <NaSala pos={[-1.9, 1.85, -0.9]} olha={[-0.5, 1.55, 1.0]}>
      <Voce posicao={[-0.6, 0, 1.0]} rotacaoY={Math.PI} expressao="serio" alvoMaoD={[0.1, 1.55, 0.5]} />
      <group position={[-0.6, 0, 1.0]} rotation={[0, Math.PI, 0]}>
        <Celular pos={[0.12, 1.6, 0.58]} rot={[-0.15, 0, 0]} escala={0.65} discando={disc} />
      </group>
      <Certo pos={[-0.15, 2.2, 1.0]} k={pop(s, t192 + 0.8)} escala={0.35} />
    </NaSala>
  );
};

// ===== 7. Sentado, calmo, afrouxe a roupa =====
export const CenaSentado = () => {
  const s = useSeg();
  const tAfr = R('sentado', 'L7', 'afrouxe');
  return (
    <NaSala pos={lerp3(s, 0, D('sentado'), [-0.8, 2.1, -2.0], [-0.6, 2.0, -1.6])} olha={[0.2, 1.3, 1.4]}>
      <Pai posicao={[0.55, SENTA_Y, 1.55]} rotacaoY={Math.PI} pose="sentado" expressao="cansado" olhar={[0, -0.3]} />
      <Voce posicao={[-0.25, 0, 1.0]} rotacaoY={Math.PI * 0.75} expressao="serio" alvoMaoE={s > tAfr ? [0.55, 1.5, 0.55] : undefined} alvoMaoD={s > tAfr ? [0.75, 1.5, 0.45] : undefined} pose={s > tAfr ? 'parado' : 'segurar'} falando={s < tAfr} />
    </NaSala>
  );
};

// ===== 8. AAS se o SAMU orientar =====
export const CenaAas = () => {
  const s = useSeg();
  const tComp = R('aas', 'L8', 'comprimido');
  const tIsso = R('aas', 'L8', 'Isso');
  if (s < tComp) {
    return (
      <NaSala pos={lerp3(s, 0, tComp, [0.6, 1.4, 0.4], [0.5, 1.2, 0.9])} olha={[0.0, 0.6, -0.6]}>
        <Celular pos={[0.0, 0.53, -0.6]} rot={[-Math.PI / 2, 0, 0.3]} escala={0.8} discando={1} />
        <Socorrista posicao={[2.4, 0, -2.6]} rotacaoY={-0.6} escala={0.001} />
      </NaSala>
    );
  }
  if (s < tIsso) {
    return (
      <Studio pos={[0, 1.3, 1.0]} olha={[0, 0, 0]} fov={36}>
        {/* palma da mão com o comprimido */}
        <mesh scale={[1.1, 0.25, 1.3]}>
          <sphereGeometry args={[0.45, 12, 8]} />
          <meshStandardMaterial color="#e0a878" flatShading />
        </mesh>
        <Comprimido pos={[0, 0.16, 0.05]} escala={1.6} />
      </Studio>
    );
  }
  return (
    <Studio pos={[0.8, -0.1, 3.0]} olha={[0.3, 0.1, 0.4]}>
      <Coracao entupido={1} morte={0.4} />
      <Certo pos={[1.3, 1.2, 0.6]} k={pop(s, tIsso + 0.4)} escala={0.5} />
    </Studio>
  );
};

// ===== 9. Desmaiou e não respira: deitar no chão =====
export const CenaDesmaio = () => {
  const s = useSeg();
  const tDeite = R('desmaio', 'L9', 'deite');
  if (s < tDeite) {
    const cai = lerp(s, 0.3, 1.0, 0, 1);
    return (
      <NaSala pos={lerp3(s, 0, tDeite, [0.9, 1.7, 0.2], [0.8, 1.6, 0.6])} olha={[0.4, 1.2, 1.5]}>
        <Pai posicao={[0.55, SENTA_Y, 1.55]} rotacaoY={Math.PI} pose="sentado" expressao="cansado" cabecaGiro={[cai * 0.5, 0, cai * 0.4]} />
        <Voce posicao={[-0.6, 0, 1.0]} rotacaoY={Math.PI * 0.7} expressao="assustado" pose="susto" emote="exclamacao" />
      </NaSala>
    );
  }
  return (
    <NaSala pos={[OX - 2.6, 1.7, 0.7]} olha={[OX + 0.25, 0.6, -1.1]}>
      <PaiDeitado />
      <Voce posicao={[OX + 0.9, 0, -0.6]} rotacaoY={-Math.PI / 2} expressao="serio" pose="ajoelhado" alvoMaoE={[0, 0.7, 0.5]} alvoMaoD={[0, 0.7, 0.5]} />
    </NaSala>
  );
};

// ===== 10. Posição das mãos: centro do peito, dedos entrelaçados =====
export const CenaMaos = () => {
  const s = useSeg();
  const frame = useCurrentFrame();
  const anel = 1 + Math.sin(frame * 0.3) * 0.1;
  return (
    <NaSala pos={[OX - 1.3, 2.6, -0.3]} olha={[OX + 0.05, 0.45, -1.12]}>
      <PaiDeitado />
      <Massagem s={s} ativo={false} />
      {/* alvo no centro do peito */}
      <mesh position={[OX, 0.5, -1.12]} rotation={[-Math.PI / 2, 0, 0]} scale={anel}>
        <ringGeometry args={[0.13, 0.18, 24]} />
        <meshBasicMaterial color="#ffd23f" transparent opacity={lerp(s, 0.2, 0.6, 0, 0.9)} />
      </mesh>
    </NaSala>
  );
};

// ===== 11. Braços esticados, afundar 5 cm e deixar voltar =====
export const CenaAfundar = () => {
  const s = useSeg();
  const c = compressao(s);
  return (
    <NaSala pos={lerp3(s, 0, D('afundar'), [OX - 2.4, 1.2, -1.1], [OX - 2.1, 1.2, -1.1])} olha={[OX + 0.2, 0.75, -1.12]}>
      <PaiDeitado peito={c} />
      <Massagem s={s} />
      <Seta3D de={[OX - 0.05, 1.55, -1.12]} para={[OX - 0.05, 1.05, -1.12]} cor="#ff3b30" espessura={0.05} k={lerp(s, 0.4, 0.8, 0, 1) * (0.6 + c * 0.4)} />
      <Seta3D de={[OX - 0.4, 0.55, -1.12]} para={[OX - 0.4, 0.95, -1.12]} cor="#1fcf5a" espessura={0.04} k={lerp(s, 4.0, 4.4, 0, 1) * (1 - c)} />
    </NaSala>
  );
};

// ===== 12. No ritmo de Stayin' Alive (~2 por segundo) =====
export const CenaRitmo = () => {
  const s = useSeg();
  return (
    <NaSala pos={lerp3(s, 0, D('ritmo'), [OX - 2.8, 1.9, 0.9], [OX - 2.4, 1.8, 0.6])} olha={[OX + 0.25, 0.6, -1.1]}>
      <PaiDeitado peito={compressao(s)} />
      <Massagem s={s} />
      <Notas s={s} pos={[OX + 0.6, 1.4, -1.6]} />
    </NaSala>
  );
};

// ===== 13. Não parar; revezar a cada 2 minutos =====
export const CenaRevezar = () => {
  const s = useSeg();
  const tRev = R('revezar', 'L13', 'revezar');
  const troca = s > tRev + 0.3;
  return (
    <NaSala pos={[OX - 2.6, 1.7, 0.7]} olha={[OX + 0.25, 0.6, -1.1]}>
      <PaiDeitado peito={compressao(s)} />
      <Massagem s={s} Quem={troca ? Tio : Voce} />
      {troca ? (
        <Voce posicao={[OX + 1.4, 0, -0.4]} rotacaoY={-Math.PI / 2 - 0.4} expressao="cansado" suor />
      ) : (
        <Tio posicao={[OX + 1.4, 0, -0.4]} rotacaoY={-Math.PI / 2 - 0.4} expressao="serio" />
      )}
      <Relogio pos={[OX - 0.9, 1.8, -1.6]} escala={lerp(s, tRev - 0.8, tRev - 0.4, 0, 0.4, Easing.out(Easing.back(2)))} velocidade={8} />
    </NaSala>
  );
};

// ===== 14. O SAMU chega, assume e leva ao hospital =====
export const CenaSamu = () => {
  const s = useSeg();
  const tAmb = R('samu', 'L14', 'ambulância');
  const tHosp = R('samu', 'L14', 'hospital');
  if (s < tAmb) {
    return (
      <NaSala pos={[OX - 2.6, 1.7, 0.7]} olha={[OX + 0.25, 0.6, -1.1]}>
        <PaiDeitado />
        <Massagem s={s} Quem={Socorrista} />
        <Socorrista posicao={[OX - 0.8, 0, -0.9]} rotacaoY={Math.PI / 2} pose="ajoelhado" expressao="serio" alvoMaoD={[0.3, 0.9, 0.4]} />
        <Voce posicao={[OX + 1.6, 0, 0.2]} rotacaoY={-Math.PI / 2 - 0.5} expressao="emocionado" />
      </NaSala>
    );
  }
  if (s < tHosp + 0.4) {
    return (
      <Palco cinema cartoon clima="noite" pos={[6.5, 3.0, 5.0]} olha={[0, 1.1, -1.8]} fov={42} sombras={false}>
        <RuaNoite />
        <Ambulancia pos={[0, 0, 0.8]} rot={Math.PI} portas={1} />
        <Maca pos={[0, 0, -3.4 + lerp(s, tAmb, tHosp, 0, 1.4)]} />
        <group position={[0, 1.0, -3.4 + lerp(s, tAmb, tHosp, 0, 1.4)]} rotation={[-Math.PI / 2, 0, 0]} scale={0.95}>
          <Pai expressao="cansado" sombraChao={false} />
        </group>
        <Socorrista posicao={[0.7, 0, -2.3 + lerp(s, tAmb, tHosp, 0, 1.4)]} rotacaoY={Math.PI} pose="segurar" />
        <Socorrista posicao={[-0.7, 0, -4.5 + lerp(s, tAmb, tHosp, 0, 1.4)]} rotacaoY={Math.PI} pose="segurar" />
      </Palco>
    );
  }
  const k = s - tHosp - 0.4;
  return (
    <Palco cinema cartoon clima="dia" pos={[5, 2.5, 9]} olha={[0, 2, -2]} fov={45} sombras={false}>
      <Hospital />
      <Ambulancia pos={[-4 + Math.min(1, k / 0.8) * 4, 0, 2.5]} rot={Math.PI / 2} />
    </Palco>
  );
};

// ===== 15. Nas mulheres: cansaço, enjoo, dor nas costas =====
export const CenaMulheres = () => {
  const s = useSeg();
  const tCan = R('mulheres', 'L15', 'cansaço');
  const tEnj = R('mulheres', 'L15', 'enjoo');
  const tCos = R('mulheres', 'L15', 'costas');
  const fase = s < tCan ? 0 : s < tEnj ? 1 : s < tCos ? 2 : 3;
  const cam: V3 = fase === 0 ? lerp3(s, 0, tCan, [0.4, 1.7, 4.2], [0.3, 1.75, 3.2]) : [0.25, 1.85, 2.3];
  return (
    <Palco cinema cartoon clima="dia" pos={cam} olha={[0, 1.55, 0]} fov={40} sombras={false}>
      <LuzDia />
      <Campo semente={4} />
      <Mulher
        expressao={fase === 0 ? 'serio' : fase === 1 ? 'cansado' : fase === 2 ? 'nojo' : 'triste'}
        emote={fase === 1 ? 'zzz' : fase === 2 ? 'gota' : fase === 0 ? 'interrogacao' : undefined}
        pose={fase === 0 ? 'pensar' : 'parado'}
        alvoMaoD={fase === 2 ? [0.05, 1.05, 0.35] : fase === 3 ? [0.25, 1.05, -0.35] : undefined}
        alvoMaoE={fase === 3 ? [-0.25, 1.05, -0.35] : undefined}
        rotacaoY={fase === 3 ? 0.9 : 0}
      />
    </Palco>
  );
};

// ===== 16. Cada minuto salva um pedaço do coração =====
export const CenaCada = () => {
  const s = useSeg();
  return (
    <Studio pos={lerp3(s, 0, D('cada'), [0, 0.3, 5], [0, 0.2, 3.6])} olha={[0, 0.1, 0]}>
      <Coracao />
      <Relogio pos={[1.7, 1.2, 0]} escala={0.5} velocidade={4} />
    </Studio>
  );
};

// ===== 17. Final: pai recuperado, curtida e seguir =====
export const CenaFim = () => {
  const s = useSeg();
  return (
    <Palco cinema cartoon clima="dia" pos={lerp3(s, 0, D('fim'), [0, 1.6, 5.2], [0, 1.55, 4.2])} olha={[0, 1.3, 0]} fov={40} sombras={false}>
      <LuzDia />
      <Campo semente={9} />
      <Pai posicao={[0.6, 0, 0]} rotacaoY={-0.2} pose="acenar" expressao="feliz" emote="coracao" />
      <Voce posicao={[-0.6, 0, 0]} rotacaoY={0.2} pose="acenar" expressao="rindo" fase={3} />
    </Palco>
  );
};
