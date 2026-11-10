import {Audio} from '@remotion/media';
import React from 'react';
import {AbsoluteFill, Easing, Sequence, interpolate, useCurrentFrame} from 'remotion';
import {Palco} from '../submarino/Palco';
import {sfx, type CategoriaSfx, VOLUME_SFX} from '../sfx';

// "Cubos Comilões": loop infinito de 8 s. O último quadro é igual ao primeiro.
export const FPS_LOOP = 30;
export const DUR_LOOP = 8;
export const FRAMES_LOOP = FPS_LOOP * DUR_LOOP;

type V3 = [number, number, number];
const AZUL = '#3d8bff';
const ROSA = '#ff4f9a';
const ease = Easing.inOut(Easing.cubic);
const L = (t: number, a: number, b: number, de: number, para: number, e = ease) =>
  interpolate(t, [a, b], [de, para], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: e});

// Cubo com cara: a parte de cima abre como uma tampa (boca)
const Cubo = ({pos, esc = [1, 1, 1], rot = [0, 0, 0], cor, boca = 0, olhar = 0, piscando = false}: {pos: V3; esc?: V3; rot?: V3; cor: string; boca?: number; olhar?: number; piscando?: boolean}) => {
  const tampa = boca * 0.95;
  const escuro = '#3a0a22';
  return (
    <group position={pos} rotation={rot} scale={esc}>
      {/* metade de baixo */}
      <mesh position={[0, 0.25, 0]}>
        <boxGeometry args={[1, 0.5, 1]} />
        <meshStandardMaterial color={cor} roughness={0.35} />
      </mesh>
      {/* interior da boca (aparece quando abre) */}
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[0.86, 0.04, 0.86]} />
        <meshStandardMaterial color={escuro} />
      </mesh>
      <mesh position={[0, 0.53, 0.05]}>
        <boxGeometry args={[0.5, 0.05, 0.5]} />
        <meshStandardMaterial color="#ff6b8a" />
      </mesh>
      {/* presinhas de baixo */}
      {[-0.25, 0.25].map((x) => (
        <mesh key={x} position={[x, 0.52, 0.47]} rotation={[0, 0, Math.PI]}>
          <coneGeometry args={[0.05, 0.1, 4]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
      ))}
      {/* tampa (metade de cima) com olhos, gira pela dobradiça de trás */}
      <group position={[0, 0.5, -0.5]} rotation={[-tampa, 0, 0]}>
        <group position={[0, 0, 0.5]}>
          <mesh position={[0, 0.25, 0]}>
            <boxGeometry args={[1, 0.5, 1]} />
            <meshStandardMaterial color={cor} roughness={0.35} />
          </mesh>
          <mesh position={[0, 0.0, 0]}>
            <boxGeometry args={[0.86, 0.02, 0.86]} />
            <meshStandardMaterial color={escuro} />
          </mesh>
          {[-0.22, 0.22].map((x) => (
            <group key={x} position={[x, 0.28, 0.5]}>
              <mesh scale={[1, piscando ? 0.12 : 1, 0.5]}>
                <sphereGeometry args={[0.15, 16, 12]} />
                <meshStandardMaterial color="#ffffff" roughness={0.2} />
              </mesh>
              {!piscando && (
                <mesh position={[olhar * 0.05, -0.01, 0.07]}>
                  <sphereGeometry args={[0.075, 12, 10]} />
                  <meshStandardMaterial color="#141414" roughness={0.2} />
                </mesh>
              )}
              {!piscando && (
                <mesh position={[olhar * 0.05 + 0.025, 0.03, 0.13]}>
                  <sphereGeometry args={[0.022, 8, 6]} />
                  <meshBasicMaterial color="#ffffff" />
                </mesh>
              )}
            </group>
          ))}
          {/* bochechas */}
          {[-0.36, 0.36].map((x) => (
            <mesh key={x} position={[x, 0.1, 0.505]}>
              <circleGeometry args={[0.07, 14]} />
              <meshBasicMaterial color="#ffb3cf" transparent opacity={0.8} />
            </mesh>
          ))}
          {/* presinhas de cima */}
          {[-0.25, 0.25].map((x) => (
            <mesh key={x} position={[x, -0.03, 0.47]}>
              <coneGeometry args={[0.05, 0.1, 4]} />
              <meshStandardMaterial color="#ffffff" />
            </mesh>
          ))}
        </group>
      </group>
    </group>
  );
};

// Pedestal listrado de doce, com portinha no topo; e a "prateleira" baixa do lado
const Pedestal = ({porta}: {porta: number}) => (
  <group>
    {Array.from({length: 8}, (_, i) => (
      <mesh key={i} position={[0, -0.25 - i * 0.5, 0]}>
        <boxGeometry args={[1.25, 0.5, 1.25]} />
        <meshStandardMaterial color={i % 2 ? '#ffffff' : '#ffc400'} roughness={0.5} />
      </mesh>
    ))}
    {/* portinha (abre para o cubo rosa surgir) */}
    {[-1, 1].map((l) => (
      <group key={l} position={[l * 0.55, 0.005, 0]} rotation={[0, 0, l * porta * 1.4]}>
        <mesh position={[-l * 0.275, 0, 0]}>
          <boxGeometry args={[0.55, 0.02, 1.1]} />
          <meshStandardMaterial color="#8a4dff" />
        </mesh>
      </group>
    ))}
    {/* prateleira do lado */}
    <group position={[1.15, -0.85, 0.2]}>
      <mesh position={[0, -0.25, 0]}>
        <boxGeometry args={[1.1, 0.5, 1.6]} />
        <meshStandardMaterial color="#2fbf9a" roughness={0.5} />
      </mesh>
      {Array.from({length: 6}, (_, i) => (
        <mesh key={i} position={[0, -0.75 - i * 0.5, 0]}>
          <boxGeometry args={[1.1, 0.5, 1.6]} />
          <meshStandardMaterial color={i % 2 ? '#2fbf9a' : '#25a383'} roughness={0.5} />
        </mesh>
      ))}
    </group>
  </group>
);

// posições-chave
const TOPO: V3 = [0, 1.0, 0]; // cubo de cima (em cima do rosa)
const MEIO: V3 = [0, 0, 0]; // cubo de baixo, em cima do pedestal
const MINI: V3 = [1.15, -0.85, 0.35]; // cubinho na prateleira
const MINI_ESC = 0.45;

const Cena = ({t}: {t: number}) => {
  const frame = useCurrentFrame();
  const pisca = (frame + 40) % 80 < 3; // 240 é múltiplo de 80: a piscada não quebra a emenda
  // ---- 1. (0–1,8 s) Azul de cima abre a boca, pula e engole o cubinho rosa
  const abre1 = L(t, 0.15, 0.6, 0, 1) * L(t, 1.35, 1.55, 1, 0.15);
  const pulo1 = L(t, 0.55, 1.4, 0, 1, Easing.inOut(Easing.quad));
  const azulPos: V3 = [TOPO[0] + (MINI[0] - TOPO[0]) * pulo1, TOPO[1] + (MINI[1] - TOPO[1]) * pulo1 + Math.sin(pulo1 * Math.PI) * 0.9, TOPO[2] + (MINI[2] - TOPO[2]) * pulo1];
  const azulRot = Math.sin(pulo1 * Math.PI) * -0.5;
  const miniVisivel = t < 1.42;
  // azul vira placa achatada na prateleira
  const achata1 = L(t, 1.4, 1.75, 0, 1, Easing.out(Easing.back(2)));
  // ---- 2. (1,9–3,8 s) Rosa abre a boca e engole a placa azul
  const abre2 = L(t, 2.0, 2.45, 0, 1) * L(t, 3.15, 3.35, 1, 0.1);
  const pulo2 = L(t, 2.4, 3.2, 0, 1, Easing.inOut(Easing.quad));
  const rosaPos: V3 = [MEIO[0] + (MINI[0] - MEIO[0]) * pulo2, MEIO[1] + (MINI[1] - MEIO[1]) * pulo2 + Math.sin(pulo2 * Math.PI) * 1.1, MEIO[2] + (MINI[2] - MEIO[2]) * pulo2];
  const azulSome = t >= 3.2;
  const achata2 = L(t, 3.2, 3.55, 0, 1, Easing.out(Easing.back(2)));
  // ---- 3. (3,9–4,9 s) a placa rosa encolhe e vira o cubinho
  const encolhe = L(t, 3.9, 4.8, 0, 1, Easing.inOut(Easing.back(1.6)));
  // ---- 4. (4,9–6,2 s) portinha abre e um rosa surge do pedestal
  const porta = L(t, 4.9, 5.2, 0, 1) * L(t, 5.9, 6.1, 1, 0);
  const sobe = L(t, 5.1, 5.8, 0, 1, Easing.out(Easing.back(1.8)));
  // ---- 5. (6,2–8 s) um azul cai do alto e encaixa em cima (boing)
  const cai = L(t, 6.3, 6.95, 0, 1, Easing.in(Easing.quad));
  const quica = t > 6.95 ? Math.sin(Math.min(1, (t - 6.95) / 0.6) * Math.PI * 2) * Math.exp(-(t - 6.95) * 5) : 0;

  // ---- cubo rosa "placa → cubinho" (o mesmo objeto do passo 2 encolhendo)
  const rosaPlacaEsc: V3 = t < 3.9 ? [1 + achata2 * 0.35, 1 - achata2 * 0.62, 1 + achata2 * 0.35] : [1.35 - (1.35 - MINI_ESC) * encolhe, 0.38 + (MINI_ESC - 0.38) * encolhe, 1.35 - (1.35 - MINI_ESC) * encolhe];
  return (
    <>
      <Pedestal porta={porta} />
      {/* cubinho rosa original (engolido no passo 1) */}
      {miniVisivel && <Cubo pos={MINI} esc={[MINI_ESC, MINI_ESC, MINI_ESC]} cor={ROSA} olhar={-1} piscando={pisca} boca={L(t, 0.9, 1.3, 0, 0.6)} />}
      {/* azul de cima (passo 1) → placa (até ser engolido no passo 2) */}
      {!azulSome && t < 6.3 && (
        <Cubo
          pos={t < 1.4 ? azulPos : MINI}
          rot={[0, 0, t < 1.4 ? azulRot : 0]}
          esc={t < 1.4 ? [1, 1 + abre1 * 0.1, 1] : [1 + achata1 * 0.3, 1 - achata1 * 0.6, 1 + achata1 * 0.3]}
          cor={AZUL}
          boca={abre1}
          olhar={t < 1.4 ? L(t, 0.05, 0.4, 0, 1) : 0}
          piscando={pisca}
        />
      )}
      {/* rosa de baixo (passo 2) → placa → cubinho (passo 3, vira o cubinho do começo) */}
      {t < 6.3 || t >= 0 ? (
        <Cubo
          pos={t < 3.2 ? rosaPos : MINI}
          rot={[0, 0, t < 3.2 ? Math.sin(pulo2 * Math.PI) * -0.6 : 0]}
          esc={t < 3.2 ? [1, 1 + abre2 * 0.12, 1] : rosaPlacaEsc}
          cor={ROSA}
          boca={t < 3.2 ? abre2 : 0}
          olhar={t < 3.2 ? L(t, 1.6, 2.0, 0, 1) : -1}
          piscando={pisca}
        />
      ) : null}
      {/* novo rosa surgindo do pedestal (passo 4) — vira o "rosa de baixo" do começo */}
      {t >= 5.0 && <Cubo pos={[0, -1.0 + sobe * 1.0, 0]} esc={[1, 1 - quica * 0.12, 1]} cor={ROSA} olhar={0} piscando={pisca} />}
      {/* novo azul caindo (passo 5) — vira o "azul de cima" do começo */}
      {t >= 6.3 && <Cubo pos={[0, TOPO[1] + (1 - cai) * 6 - (t > 6.95 ? quica * 0.12 : 0), 0]} esc={[1 + quica * 0.12, 1 - quica * 0.15, 1 + quica * 0.12]} cor={AZUL} olhar={0} piscando={pisca} />}
      {/* no começo do ciclo (antes do passo 2), o rosa de baixo é o objeto do passo 2 */}
    </>
  );
};

const SONS: [CategoriaSfx, number, number, number][] = [
  ['whoosh', 0, 0.55, 0.5],
  ['pop', 0, 1.4, 0.9],
  ['impacto', 0, 1.45, 0.4],
  ['whoosh', 1, 2.4, 0.5],
  ['pop', 1, 3.2, 0.9],
  ['impacto', 1, 3.25, 0.4],
  ['subida', 0, 3.9, 0.35],
  ['mecanico', 0, 4.9, 0.4],
  ['pop', 2, 5.4, 0.8],
  ['whoosh', 2, 6.3, 0.5],
  ['pop', 3, 6.95, 1],
  ['tique', 0, 7.4, 0.4],
];

export const LoopCubos = () => {
  const frame = useCurrentFrame();
  const t = (frame / FPS_LOOP) % DUR_LOOP;
  return (
    <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 35%, #ff9ad5 0%, #8a4dff 70%, #4a1fb8 100%)'}}>
      <Palco cinema cartoon clima="estudio" pos={[-0.9, 1.5, 7.4]} olha={[0.6, 0.15, 0]} fov={42} sombras={false}>
        <hemisphereLight args={['#ffffff', '#8a4dff', 1.0]} />
        <directionalLight position={[-3, 6, 5]} intensity={1.8} />
        <directionalLight position={[4, 2, -3]} intensity={0.6} color="#ffd1f0" />
        <Cena t={t} />
      </Palco>
      {SONS.map(([c, n, em, v], i) => (
        <Sequence key={i} from={Math.round(em * FPS_LOOP)} layout="none">
          <Audio src={sfx(c, n)} volume={v * VOLUME_SFX} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
void React;
