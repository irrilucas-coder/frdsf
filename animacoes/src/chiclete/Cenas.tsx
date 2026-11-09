import {Easing, interpolate, useCurrentFrame} from 'remotion';
import type {V3} from '../submarino/camera';
import {Palco} from '../submarino/Palco';
import {Boneco} from '../personagem/Boneco';
import {Campo, LuzDia} from '../personagem/Cenario';
import {Seta3D} from '../edicao/Seta3D';
import {Bolha, CorpoCorte, Cozinha, curvaTunel, EstomagoDentro, Estouro, Goma, MesaChicletes, posNoCorpo, Tunel} from './Modelos';
import {FPS, duracaoCena, quandoDiz, type CenaId} from './roteiro';

const lerp = (s: number, a: number, b: number, de: number, para: number, easing = Easing.inOut(Easing.quad)) =>
  interpolate(s, [a, b], [de, para], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing});
const lerp3 = (s: number, a: number, b: number, de: V3, para: V3, easing = Easing.inOut(Easing.quad)): V3 => [lerp(s, a, b, de[0], para[0], easing), lerp(s, a, b, de[1], para[1], easing), lerp(s, a, b, de[2], para[2], easing)];
const useSeg = () => useCurrentFrame() / FPS;
const R = quandoDiz;
const D = duracaoCena;

// Protagonista ("você"): camisa vermelha e boné amarelo (mesmo visual da foto do canal)
const Voce = (p: React.ComponentProps<typeof Boneco>) => <Boneco camisa="#e8553e" bermuda="#2f5fa8" chapeu="bone" corChapeu="#ffcc33" cabelo="curto" corCabelo="#4a2e1a" sapato="#2b2b33" {...p} />;
const Vovo = (p: React.ComponentProps<typeof Boneco>) => <Boneco vestido camisa="#8e6cc4" bermuda="#8e6cc4" cabelo="coque" corCabelo="#d9d9d9" oculos pele="#f2c8a8" tronco="gordinho" {...p} />;
const Crianca = (p: React.ComponentProps<typeof Boneco>) => <Boneco escala={0.72} camisa="#4cc9f0" bermuda="#ffb703" cabelo="tigela" corCabelo="#2a1d14" {...p} />;

// Chiclete com carinha (personagem)
const GomaComCara = ({pos, s, r = 0.32, expressao = 'feliz'}: {pos: V3; s: number; r?: number; expressao?: 'feliz' | 'confiante'}) => (
  <group position={pos} rotation={[0, Math.sin(s * 2) * 0.3, Math.sin(s * 3) * 0.1]}>
    <Goma pos={[0, 0, 0]} r={r} brilho={0.2} />
    {[-1, 1].map((l) => (
      <mesh key={l} position={[l * r * 0.32, r * 0.2, r * 0.93]} scale={[0.045, expressao === 'confiante' && l > 0 ? 0.035 : 0.07, 0.03]}>
        <sphereGeometry args={[1, 8, 6]} />
        <meshStandardMaterial color="#141414" />
      </mesh>
    ))}
    <mesh position={[0, -r * 0.2, r * 0.9]} rotation={[0, 0, Math.PI]}>
      <torusGeometry args={[r * 0.25, r * 0.05, 6, 12, Math.PI]} />
      <meshStandardMaterial color="#7a1f4a" />
    </mesh>
  </group>
);

// ===== 0. GANCHO: bola de chiclete estoura, ele engole sem querer =====
export const CenaGancho = () => {
  const s = useSeg();
  const tPop = R('gancho', 'L0', 'engolir') - 0.15;
  const tGulp = R('gancho', 'L0', 'chiclete');
  const tSete = R('gancho', 'L0', 'sete');
  if (s < tSete) {
    const close = s < tGulp;
    const rBolha = close ? lerp(s, 0.1, tPop, 0.02, 0.34, Easing.in(Easing.quad)) : 0;
    const cam: {pos: V3; olha: V3} = close
      ? {pos: lerp3(s, 0, tPop, [0.5, 1.9, 2.4], [0.25, 1.85, 1.75]), olha: [0, 1.8, 0]}
      : {pos: lerp3(s, tGulp, tSete, [1.6, 1.7, 3.6], [1.2, 1.6, 3.0]), olha: [0, 1.35, 0]};
    const gole = lerp(s, tGulp, tGulp + 0.25, 1, 0) * Math.sin(Math.min(1, (s - tGulp) / 0.25) * Math.PI);
    return (
      <Palco cinema clima="dia" pos={cam.pos} olha={cam.olha} fov={close ? 38 : 42} sombras={false}>
        <LuzDia />
        <Cozinha />
        <Voce
          falando={s < tPop}
          expressao={s < tPop ? 'feliz' : 'surpreso'}
          emote={s > tGulp ? 'exclamacao' : undefined}
          emoteK={lerp(s, tGulp, tGulp + 0.2, 0, 1, Easing.out(Easing.back(2)))}
          estica={s > tPop && s < tPop + 0.3 ? Math.sin(((s - tPop) / 0.3) * Math.PI) * 0.6 : gole * -0.4}
          alvoMaoD={s > tGulp ? [0.12, 1.15, 0.38] : undefined}
          pose="parado"
          olhar={s > tPop ? [0, 0] : undefined}
          suor={s > tGulp}
        />
        <Bolha pos={[0, 1.72, 0.38 + rBolha * 0.9]} r={s < tPop ? rBolha : 0} />
        <Estouro centro={[0, 1.75, 0.7]} s={s - tPop} />
      </Palco>
    );
  }
  // raio-x: o chiclete "grudado" no estômago
  const k = s - tSete;
  return (
    <Palco cinema clima="estudio" pos={[0.3, 0.9, lerp(k, 0, 1.2, 7.5, 5.8)]} olha={[0, 0.5, 0]} fov={42} sombras={false}>
      <LuzDia />
      <CorpoCorte />
      <GomaComCara pos={posNoCorpo(0.42)} s={s} r={0.2} />
    </Palco>
  );
};

// ===== 1. O MITO: a vó avisando a criança =====
export const CenaMito = () => {
  const s = useSeg();
  const tMas = R('mito', 'L1', 'Mas');
  if (s < tMas) {
    return (
      <Palco cinema clima="dia" pos={lerp3(s, 0, tMas, [2.6, 1.5, 4.2], [2.1, 1.45, 3.6])} olha={[0, 1.15, 0]} fov={40} sombras={false}>
        <LuzDia />
        <Cozinha />
        <Vovo posicao={[-0.7, 0, 0]} rotacaoY={0.8} pose="apontar" expressao="serio" falando />
        <Crianca posicao={[0.75, 0, 0.3]} rotacaoY={-0.8} expressao="assustado" emote="gota" />
      </Palco>
    );
  }
  // ele pensa... e a câmera mergulha na barriga
  const k = s - tMas;
  const fim = D('mito') - tMas;
  return (
    <Palco cinema clima="dia" pos={lerp3(k, fim * 0.45, fim, [0.4, 1.7, 3.0], [0.05, 1.1, 0.7], Easing.in(Easing.cubic))} olha={lerp3(k, fim * 0.45, fim, [0, 1.6, 0], [0, 1.05, 0])} fov={40} sombras={false}>
      <LuzDia />
      <Cozinha />
      <Voce pose="pensar" expressao="pensativo" emote="interrogacao" emoteK={lerp(k, 0, 0.25, 0, 1, Easing.out(Easing.back(2)))} />
    </Palco>
  );
};

// ===== 2. ESÔFAGO: o chiclete desce =====
export const CenaEsofago = () => {
  const s = useSeg();
  const tEst = R('esofago', 'L2', 'estômago');
  const u = lerp(s, 0, tEst + 0.2, 0, 0.33, Easing.in(Easing.quad));
  const g = posNoCorpo(u);
  return (
    <Palco cinema clima="estudio" pos={[g[0] + 1.7, g[1] + 0.5, 3.4]} olha={[g[0], g[1] - 0.2, g[2]]} fov={42} sombras={false}>
      <LuzDia />
      <CorpoCorte />
      <GomaComCara pos={g} s={s} r={0.15} />
      <Seta3D de={[g[0] + 0.45, g[1] + 0.3, g[2]]} para={[g[0] + 0.45, g[1] - 0.4, g[2]]} cor="#43a047" espessura={0.05} k={lerp(s, 0.1, 0.4, 0, 1)} />
    </Palco>
  );
};

// ===== 3. ESTÔMAGO: ácido dissolve a comida, mas não o chiclete =====
export const CenaEstomago = () => {
  const s = useSeg();
  const tPao = R('estomago', 'L3', 'pão');
  const tCarne = R('estomago', 'L3', 'carne');
  const tFruta = R('estomago', 'L3', 'fruta');
  const tMas = R('estomago', 'L3', 'mas');
  const enc: [number, number, number] = [lerp(s, tPao, tPao + 1.4, 0, 1), lerp(s, tCarne, tCarne + 1.4, 0, 1), lerp(s, tFruta, tFruta + 1.4, 0, 1)];
  const gomaPos: V3 = [0.3, -1.68 + Math.abs(Math.sin(s * 3)) * 0.12, 1.2];
  const close = s >= tMas;
  return (
    <Palco
      cinema
      clima="interior"
      pos={close ? lerp3(s, tMas, D('estomago'), [1.0, -1.25, 2.6], [0.7, -1.35, 2.2]) : lerp3(s, 0, tMas, [0, 0.6, 4.2], [0, 0.1, 3.4])}
      olha={close ? gomaPos : [0, -1.6, -0.6]}
      fov={close ? 40 : 46}
      sombras={false}
    >
      <EstomagoDentro s={s} encolhe={enc} />
      <GomaComCara pos={gomaPos} s={s} r={0.3} expressao={close ? 'confiante' : 'feliz'} />
    </Palco>
  );
};

// ===== 4. O ESTÔMAGO ESPREME e o chiclete vai pro intestino =====
export const CenaEmpurra = () => {
  const s = useSeg();
  const tEsp = R('empurra', 'L4', 'espreme');
  const tInt = R('empurra', 'L4', 'intestino');
  if (s < tInt) {
    const aperto = lerp(s, tEsp - 0.1, tEsp + 0.3, 0, 1);
    const u = lerp(s, tEsp, tInt + 0.2, 0.42, 0.53);
    const k = lerp(s, tEsp - 0.1, tEsp + 0.3, 0, 1, Easing.out(Easing.back(1.5)));
    return (
      <Palco cinema clima="estudio" pos={[0.6, 0.5, 4.4]} olha={[-0.2, 0.2, 0]} fov={42} sombras={false}>
        <LuzDia />
        <CorpoCorte aperto={aperto} />
        <GomaComCara pos={posNoCorpo(u)} s={s} r={0.17} />
        <Seta3D de={[-1.9, 0.6, 0.4]} para={[-1.25, 0.5, 0.4]} cor="#e53935" k={k} />
        <Seta3D de={[1.2, 0.8, 0.4]} para={[0.55, 0.6, 0.4]} cor="#e53935" k={k} />
        <Seta3D de={[-0.2, -0.1, 0.9]} para={[0.1, -0.7, 0.9]} cor="#43a047" k={lerp(s, tEsp + 0.4, tEsp + 0.8, 0, 1)} />
      </Palco>
    );
  }
  // voo dentro do intestino
  const u = 0.02 + (s - tInt) * 0.055;
  const p = curvaTunel.getPoint(u);
  const a = curvaTunel.getPoint(u + 0.025);
  const g = curvaTunel.getPoint(u + 0.018);
  return (
    <Palco cinema clima="interior" pos={[p.x, p.y + 0.3, p.z]} olha={[a.x, a.y, a.z]} fov={55} sombras={false}>
      <Tunel />
      <GomaComCara pos={[g.x, g.y - 0.35, g.z]} s={s} r={0.35} />
      {[0.03, 0.045, 0.06].map((d, i) => {
        const q = curvaTunel.getPoint(u + d);
        return (
          <mesh key={i} position={[q.x + (i - 1) * 0.6, q.y - 0.6, q.z]}>
            <dodecahedronGeometry args={[0.18, 0]} />
            <meshStandardMaterial color={['#c8a46a', '#8d6e63', '#a5d66b'][i]} flatShading />
          </mesh>
        );
      })}
      <pointLight position={[p.x, p.y + 0.5, p.z - 1]} intensity={30} color="#ffe0e0" />
    </Palco>
  );
};

// ===== 5. DE DOIS A CINCO DIAS: sai do corpo =====
export const CenaDias = () => {
  const s = useSeg();
  const tSai = R('dias', 'L5', 'sai');
  const feliz = s >= tSai;
  return (
    <Palco cinema clima="dia" pos={feliz ? [0.9, 1.6, 4.4] : lerp3(s, 0, tSai, [2.5, 2.4, 7.5], [2.0, 2.0, 6.5])} olha={[0, 1.2, 0]} fov={40} sombras={false}>
      <LuzDia />
      <Campo semente={5} />
      <Voce pose={feliz ? 'pular' : 'andar'} expressao={feliz ? 'rindo' : 'feliz'} emote={feliz ? 'brilho' : undefined} rotacaoY={feliz ? 0 : 0.6} posicao={feliz ? [0, 0, 0] : [-2 + s * 0.6, 0, 0]} />
    </Palco>
  );
};

// ===== 6. O PERIGO: muitos de uma vez =====
export const CenaPerigo = () => {
  const s = useSeg();
  const tInt = R('perigo', 'L6', 'intestino');
  if (s < tInt) {
    const mao = Math.floor(s * 1.6) % 2 === 0;
    return (
      <Palco cinema clima="dia" pos={lerp3(s, 0, tInt, [1.8, 1.4, 3.6], [1.2, 1.25, 2.8])} olha={[0, 0.95, 0]} fov={40} sombras={false}>
        <LuzDia />
        <Cozinha />
        <group position={[0, 0, -0.9]}>
          <MesaChicletes sobrando={lerp(s, 0, tInt, 1, 0.35)} />
        </group>
        <Crianca posicao={[0, 0, 0]} rotacaoY={0} expressao="feliz" falando alvoMaoD={mao ? [0.06, 1.72, 0.45] : [0.2, 0.95, -0.6]} />
      </Palco>
    );
  }
  const k = s - tInt;
  const bolo: V3 = posNoCorpo(0.86);
  return (
    <Palco cinema clima="estudio" pos={[0.5, lerp(k, 0, 1.5, -0.4, -1.0), lerp(k, 0, 1.5, 4.8, 3.6)]} olha={[bolo[0], bolo[1], 0]} fov={42} sombras={false}>
      <LuzDia />
      <CorpoCorte entupido={1} />
      {Array.from({length: 14}, (_, i) => (
        <Goma key={i} pos={[bolo[0] + Math.sin(i * 2.1) * 0.16, bolo[1] + Math.cos(i * 1.3) * 0.12, bolo[2] + Math.sin(i) * 0.08]} r={0.09} giro={i} />
      ))}
      <pointLight position={[bolo[0], bolo[1], 1.5]} intensity={Math.floor(s * 5) % 2 ? 25 : 6} color="#ff1744" />
    </Palco>
  );
};

// ===== 7. FINAL: é mito! =====
export const CenaFinal = () => {
  const s = useSeg();
  const tJa = R('final', 'L7', 'Já');
  const parte2 = s >= tJa;
  return (
    <Palco cinema clima="dia" pos={parte2 ? [0.4, 1.5, 6.2] : lerp3(s, 0, tJa, [1.0, 1.7, 3.6], [0.7, 1.7, 3.0])} olha={parte2 ? [0, 1.0, 0] : [0, 1.5, 0]} fov={40} sombras={false}>
      <LuzDia />
      <Campo semente={8} />
      <Voce pose={parte2 ? 'acenar' : 'bracosCruzados'} expressao={parte2 ? 'feliz' : 'confiante'} emote={parte2 ? undefined : 'brilho'} falando={parte2} />
    </Palco>
  );
};
