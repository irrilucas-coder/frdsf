import {Easing, interpolate, useCurrentFrame} from 'remotion';
import type {V3} from '../submarino/camera';
import {Palco} from '../submarino/Palco';
import {Seta3D} from '../edicao/Seta3D';
import {rampa} from '../edicao/Edicao';
import {Apresentador, CuboPremio, Galpao, Jogador, Multidao, Piscina, PLATAFORMAS, Plataformas, posPlat, Respingo} from '../arena/Modelos';
import {FPS, duracaoCena, quandoDiz, type CenaId} from './roteiro';

const lerp = (s: number, a: number, b: number, de: number, para: number, easing = Easing.inOut(Easing.quad)) =>
  interpolate(s, [a, b], [de, para], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing});
const lerp3 = (s: number, a: number, b: number, de: V3, para: V3, easing = Easing.inOut(Easing.quad)): V3 => [lerp(s, a, b, de[0], para[0], easing), lerp(s, a, b, de[1], para[1], easing), lerp(s, a, b, de[2], para[2], easing)];
const useSeg = () => useCurrentFrame() / FPS;
const R = quandoDiz;
const D = duracaoCena;

// Os 3 jogadores em destaque
const J14 = (p: Partial<React.ComponentProps<typeof Jogador>>) => <Jogador numero="14" tronco="forte" cabelo="curto" corCabelo="#1a1a1a" pele="#c98d64" barba {...p} />;
const J82 = (p: Partial<React.ComponentProps<typeof Jogador>>) => <Jogador numero="82" tronco="gordinho" cabelo="careca" bigode corCabelo="#5a3a1f" pele="#f0c49a" {...p} />;
const J37 = (p: Partial<React.ComponentProps<typeof Jogador>>) => <Jogador numero="37" tronco="magro" cabelo="coque" corCabelo="#2a1d14" oculos pele="#e8b48a" {...p} />;
// Figurantes variados
const EXTRAS: {n: string; plat: number; cabelo: React.ComponentProps<typeof Jogador>['cabelo']; pele: string; tronco: React.ComponentProps<typeof Jogador>['tronco']; cor: string}[] = [
  {n: '5', plat: 1, cabelo: 'tigela', pele: '#f0c49a', tronco: 'normal', cor: '#2a1d14'},
  {n: '23', plat: 5, cabelo: 'cacheado', pele: '#6b4128', tronco: 'normal', cor: '#141414'},
  {n: '41', plat: 8, cabelo: 'rabo', pele: '#f6d0b0', tronco: 'magro', cor: '#d9a441'},
  {n: '56', plat: 12, cabelo: 'curto', pele: '#8a5a3c', tronco: 'forte', cor: '#141414'},
  {n: '63', plat: 19, cabelo: 'franja', pele: '#e8b48a', tronco: 'normal', cor: '#7a3b12'},
  {n: '70', plat: 22, cabelo: 'comprido', pele: '#c98d64', tronco: 'magro', cor: '#2a1d14'},
  {n: '77', plat: 26, cabelo: 'careca', pele: '#f0c49a', tronco: 'gordinho', cor: '#5a4a3a'},
  {n: '88', plat: 29, cabelo: 'tigela', pele: '#6b4128', tronco: 'normal', cor: '#141414'},
  {n: '91', plat: 33, cabelo: 'coque', pele: '#f2c8a8', tronco: 'normal', cor: '#a0522d'},
  {n: '96', plat: 10, cabelo: 'curto', pele: '#e0a878', tronco: 'normal', cor: '#3a2618'},
  {n: '12', plat: 13, cabelo: 'cacheado', pele: '#8a5a3c', tronco: 'magro', cor: '#141414'},
  {n: '48', plat: 20, cabelo: 'franja', pele: '#f0c49a', tronco: 'normal', cor: '#d9a441'},
];
const Extras = ({filtro, pose = 'parado', expressao = 'serio', queda}: {filtro?: (plat: number) => boolean; pose?: React.ComponentProps<typeof Jogador>['pose']; expressao?: React.ComponentProps<typeof Jogador>['expressao']; queda?: (plat: number) => number}) => (
  <>
    {EXTRAS.filter((e) => !filtro || filtro(e.plat)).map((e, i) => {
      const q = queda ? queda(e.plat) : 0;
      if (q >= 1) return null;
      const p = posPlat(e.plat);
      return (
        <Jogador
          key={e.n}
          numero={e.n}
          posicao={[p[0], p[1] - q * 1.6, p[2]]}
          rotacaoY={((i * 47) % 10) / 10 - 0.5}
          cabelo={e.cabelo}
          pele={e.pele}
          tronco={e.tronco}
          corCabelo={e.cor}
          pose={q > 0 ? 'susto' : pose}
          expressao={q > 0 ? 'assustado' : expressao}
          fase={i}
          sombraChao={q === 0}
        />
      );
    })}
  </>
);

// ===== 0. GANCHO: 100 jogadores, 1 milhão, o apresentador =====
export const CenaGancho = () => {
  const s = useSeg();
  const tMilhao = R('gancho', 'L0', 'milhão');
  const tSo = R('gancho', 'L0', 'Só');
  if (s < tMilhao) {
    return (
      <Palco cinema clima="espaco" pos={lerp3(s, 0, tMilhao, [-9, 9, 20], [-4, 6, 15])} olha={[0, 0.5, 6]} fov={45} sombras={false}>
        <Galpao />
        <Piscina />
        <Plataformas />
        <Multidao n={80} centro={[0, -0.55, 9]} largura={15} prof={4} />
        <J14 posicao={[-2, -0.55, 6.5]} expressao="confiante" />
        <J37 posicao={[0.2, -0.55, 6.7]} expressao="pensativo" />
        <J82 posicao={[2.2, -0.55, 6.5]} expressao="assustado" suor />
      </Palco>
    );
  }
  if (s < tSo) {
    return (
      <Palco cinema clima="espaco" pos={lerp3(s, tMilhao, tSo, [3.2, 2.6, 4.2], [2.2, 2.3, 3.2])} olha={[0, 1.5, -6]} fov={40} sombras={false}>
        <Galpao piscina={false} />
        <CuboPremio pos={[0, -0.55, -6]} escala={1.3} />
      </Palco>
    );
  }
  return (
    <Palco cinema clima="espaco" pos={lerp3(s, tSo, D('gancho'), [0.4, 1.9, 3.2], [0.2, 1.9, 2.5])} olha={[0, 1.65, 0]} fov={40} sombras={false}>
      <Galpao />
      <group position={[0, 0, 4]}>
        <Apresentador pose="apontar" expressao="confiante" falando posicao={[0, 0, -4]} />
      </group>
    </Palco>
  );
};

// ===== 1. A PROVA: plataformas, quem cair está fora =====
export const CenaProva = () => {
  const s = useSeg();
  const tAgua = R('prova', 'L1', 'água');
  const queda = lerp(s, tAgua - 0.2, tAgua + 0.35, 0, 1, Easing.in(Easing.quad));
  const pQ = posPlat(16);
  return (
    <Palco cinema clima="espaco" pos={lerp3(s, 0, tAgua, [-7.5, 2.2, 8.5], [-5, 5, 10])} olha={lerp3(s, 0, tAgua, [-5, 1.6, 4], [0, 0, 0])} fov={45} sombras={false}>
      <Galpao />
      <Piscina />
      <Plataformas afunda={{16: lerp(s, tAgua - 0.6, tAgua, 0, 1)}} />
      <Apresentador posicao={[-5.5, -0.55, 5.2]} rotacaoY={0.5} pose="apontar" expressao="feliz" falando={s < tAgua} />
      <Extras filtro={(p) => p !== 16} />
      {queda < 1 && <Jogador numero="3" posicao={[pQ[0], pQ[1] - queda * 1.7, pQ[2]]} pose="susto" expressao="assustado" cabelo="franja" corCabelo="#7a3b12" sombraChao={false} />}
      <Respingo pos={[pQ[0], 0, pQ[2]]} s={(s - tAgua - 0.15) / 0.8} />
    </Palco>
  );
};

// ===== 2. A REGRA: a cada 10 s uma plataforma afunda =====
export const CenaRegra = () => {
  const s = useSeg();
  const tAf = R('regra', 'L2', 'afunda');
  const af = lerp(s, tAf - 0.1, tAf + 0.5, 0, 1, Easing.in(Easing.quad));
  const queda = (plat: number) => (plat === 19 ? lerp(s, tAf, tAf + 0.5, 0, 1, Easing.in(Easing.quad)) : 0);
  return (
    <Palco cinema clima="espaco" pos={lerp3(s, 0, D('regra'), [0.5, 15, 7], [0.2, 13, 5.5])} olha={[0, 0, 0]} fov={45} sombras={false}>
      <Galpao />
      <Piscina />
      <Plataformas afunda={{16: 1, 19: af}} />
      <Extras queda={queda} filtro={(p) => p !== 16} />
      <Respingo pos={[posPlat(19)[0], 0, posPlat(19)[2]]} s={(s - tAf - 0.4) / 0.8} />
    </Palco>
  );
};

// ===== 3. O 14 PULA PARA O CENTRO =====
export const CenaCatorze = () => {
  const s = useSeg();
  const tPula = R('catorze', 'L3', 'pula');
  const de = posPlat(14);
  const para = posPlat(17);
  const k = lerp(s, tPula, tPula + 0.7, 0, 1, Easing.inOut(Easing.cubic));
  const salto = Math.sin(k * Math.PI) * 1.3;
  const pos: V3 = [de[0] + (para[0] - de[0]) * k, de[1] + salto, de[2] + (para[2] - de[2]) * k];
  const voando = k > 0 && k < 1;
  return (
    <Palco cinema clima="espaco" pos={[pos[0] + 1.2, 2.6, pos[2] + 6.0]} olha={[pos[0], pos[1] + 1.0, pos[2]]} fov={42} sombras={false}>
      <Galpao />
      <Piscina />
      <Plataformas afunda={{16: 1, 19: 1}} />
      <Extras filtro={(p) => p !== 16 && p !== 19 && p !== 17} />
      <J14
        posicao={pos}
        rotacaoY={Math.atan2(para[0] - de[0], para[2] - de[2]) * (k < 1 ? 1 : 0)}
        pose={voando ? 'pular' : s < tPula ? 'maosNaCintura' : 'siu'}
        expressao="confiante"
        estica={voando ? Math.sin(k * Math.PI) * 0.4 : 0}
        emote={k >= 1 ? 'brilho' : undefined}
        sombraChao={!voando}
      />
    </Palco>
  );
};

// ===== 4. O 82 NA PLATAFORMA QUE BALANÇA =====
export const CenaAzarado = () => {
  const s = useSeg();
  const tBal = R('azarado', 'L4', 'balança');
  const p = posPlat(23);
  const bal = lerp(s, 0.3, tBal, 0.4, 1);
  const frame = useCurrentFrame();
  return (
    <Palco cinema clima="espaco" pos={lerp3(s, 0, D('azarado'), [p[0] - 2.0, 2.4, p[2] + 4.8], [p[0] - 1.3, 2.2, p[2] + 3.9])} olha={[p[0], 1.4, p[2]]} fov={42} sombras={false}>
      <Galpao />
      <Piscina />
      <Plataformas afunda={{16: 1, 19: 1}} balanca={{23: bal}} />
      <group position={p} rotation={[Math.sin(frame * 0.5) * 0.12 * bal, 0, Math.cos(frame * 0.45) * 0.1 * bal]}>
        <J82 posicao={[0, 0.02, 0]} pose="susto" expressao="assustado" suor emote="gota" />
      </group>
    </Palco>
  );
};

// ===== 5. AFUNDA! E ELE SE SEGURA NA BEIRADA (câmera lenta) =====
export const CenaQuase = () => {
  const s0 = useSeg();
  const tCai = R('quase', 'L5', 'cai');
  const tMas = R('quase', 'L5', 'mas');
  // câmera lenta durante a queda
  const s = rampa(s0, [[tCai - 0.6, tMas, 0.45]]);
  const tA = R('quase', 'L5', 'afunda');
  const af = lerp(s, tA, tA + 0.6, 0, 1, Easing.in(Easing.quad));
  const p = posPlat(23);
  const beira = posPlat(24);
  const queda = lerp(s, tA + 0.2, tA + 0.8, 0, 1, Easing.in(Easing.quad));
  // pendurado na beirada da plataforma 24
  const pendurado = s >= tA + 0.8;
  const posJ: V3 = pendurado ? [beira[0] - 0.95, -1.0, beira[2]] : [p[0] + queda * 0.6, p[1] - queda * 1.2, p[2]];
  return (
    <Palco cinema clima="espaco" pos={lerp3(s0, 0, D('quase'), [p[0] + 0.4, 2.6, p[2] + 6.4], [p[0] + 0.7, 1.6, p[2] + 5.0])} olha={[p[0] + 0.45, 0.3, p[2]]} fov={44} sombras={false}>
      <Galpao />
      <Piscina />
      <Plataformas afunda={{16: 1, 19: 1, 23: af}} />
      <J82
        posicao={posJ}
        rotacaoY={pendurado ? Math.PI / 2 : 0}
        pose={pendurado ? 'parado' : 'susto'}
        alvoMaoE={pendurado ? [-0.25, 3.2, 0.6] : undefined}
        alvoMaoD={pendurado ? [0.25, 3.2, 0.6] : undefined}
        expressao={pendurado ? 'cansado' : 'assustado'}
        suor
        sombraChao={false}
      />
      <Respingo pos={[p[0], 0, p[2]]} s={(s - tA - 0.4) / 0.9} />
    </Palco>
  );
};

// ===== 6. A 37 PERCEBE: AS AZUIS NUNCA AFUNDAM =====
export const CenaDetalhe = () => {
  const s = useSeg();
  const tAzuis = R('detalhe', 'L6', 'plataformas');
  const p = posPlat(9);
  if (s < tAzuis) {
    return (
      <Palco cinema clima="espaco" pos={lerp3(s, 0, tAzuis, [p[0] + 1.4, 2.0, p[2] + 2.8], [p[0] + 0.8, 1.95, p[2] + 2.1])} olha={[p[0], 1.85, p[2]]} fov={40} sombras={false}>
        <Galpao />
        <Piscina />
        <Plataformas afunda={{16: 1, 19: 1, 23: 1}} />
        <J37 posicao={p} rotacaoY={0.4} pose="pensar" expressao="pensativo" emote="ideia" emoteK={lerp(s, 0.6, 0.9, 0, 1, Easing.out(Easing.back(2)))} />
      </Palco>
    );
  }
  const k = lerp(s, tAzuis, tAzuis + 0.4, 0, 1, Easing.out(Easing.back(1.5)));
  const azuis = PLATAFORMAS.filter((x) => x.cor === 'azul');
  return (
    <Palco cinema clima="espaco" pos={[0.2, 14, 5]} olha={[0, 0, 0]} fov={45} sombras={false}>
      <Galpao />
      <Piscina />
      <Plataformas afunda={{16: 1, 19: 1, 23: 1}} brilhoAzul={k} />
      {azuis.map((a) => (
        <Seta3D key={a.id} de={[a.x, 2.4, a.z]} para={[a.x, 0.9, a.z]} cor="#43e06a" espessura={0.1} k={k} />
      ))}
      <J37 posicao={p} pose="apontar" expressao="confiante" />
      <Extras filtro={(x) => ![16, 19, 23].includes(x)} />
    </Palco>
  );
};

// ===== 7. CONTAGEM: 3, 2, 1 — as laranjas afundam =====
export const CenaContagem = () => {
  const s = useSeg();
  const t3 = R('contagem', 'L7', 'Três');
  const tUm = R('contagem', 'L7', 'um');
  const laranjas = PLATAFORMAS.filter((x) => x.cor === 'laranja');
  const afunda: Record<number, number> = {16: 1, 19: 1, 23: 1};
  laranjas.forEach((x, i) => {
    if (afunda[x.id] === undefined) afunda[x.id] = lerp(s, t3 + (i % 9) * ((tUm - t3) / 9), t3 + (i % 9) * ((tUm - t3) / 9) + 0.6, 0, 1, Easing.in(Easing.quad));
  });
  const queda = (plat: number) => (PLATAFORMAS[plat].cor === 'laranja' ? Math.min(1, afunda[plat] * 1.1) : 0);
  return (
    <Palco cinema clima="espaco" pos={lerp3(s, 0, D('contagem'), [-10, 7, 12], [-7, 6, 10])} olha={[0, 0, 0]} fov={42} sombras={false}>
      <Galpao />
      <Piscina />
      <Plataformas afunda={afunda} />
      <Extras queda={queda} />
      <J14 posicao={posPlat(17)} expressao="confiante" pose="bracosCruzados" />
      <J37 posicao={posPlat(9)} expressao="serio" />
      <J82 posicao={[posPlat(24)[0] - 0.95, -1.0, posPlat(24)[2]]} rotacaoY={Math.PI / 2} alvoMaoE={[-0.25, 3.2, 0.6]} alvoMaoD={[0.25, 3.2, 0.6]} expressao="assustado" sombraChao={false} />
      {laranjas.slice(0, 9).map((x, i) => (
        <Respingo key={x.id} pos={[x.x, 0, x.z]} s={(s - t3 - i * ((tUm - t3) / 9) - 0.45) / 0.8} />
      ))}
    </Palco>
  );
};

// ===== 8. RESTAM 12 — e o prêmio esperando =====
export const CenaRestam = () => {
  const s = useSeg();
  const tMilhao = R('restam', 'L8', 'milhão');
  const afundaTudo: Record<number, number> = {};
  PLATAFORMAS.forEach((x) => {
    if (x.cor === 'laranja') afundaTudo[x.id] = 1;
  });
  if (s < tMilhao) {
    const azuis = PLATAFORMAS.filter((x) => x.cor === 'azul');
    return (
      <Palco cinema clima="espaco" pos={lerp3(s, 0, tMilhao, [0, 3.5, 11], [0, 3, 9])} olha={[0, 0.8, 0]} fov={45} sombras={false}>
        <Galpao />
        <Piscina />
        <Plataformas afunda={afundaTudo} brilhoAzul={0.4} />
        <J14 posicao={posPlat(17)} pose="comemorar" expressao="rindo" />
        <J37 posicao={posPlat(9)} pose="dancar" expressao="feliz" />
        <J82 posicao={posPlat(24)} pose="comemorar" expressao="emocionado" fase={2} />
        {azuis
          .filter((a) => ![17, 9, 24].includes(a.id))
          .map((a, i) => (
            <Jogador key={a.id} numero={['5', '41', '63', '91'][i % 4]} posicao={posPlat(a.id)} pose="comemorar" expressao="feliz" fase={i + 3} cabelo={(['tigela', 'rabo', 'franja', 'coque'] as const)[i % 4]} pele={['#f0c49a', '#f6d0b0', '#e8b48a', '#f2c8a8'][i % 4]} />
          ))}
      </Palco>
    );
  }
  return (
    <Palco cinema clima="espaco" pos={lerp3(s, tMilhao, D('restam'), [2.6, 2.4, 4.2], [1.6, 2.1, 3.2])} olha={[0, 1.7, -6]} fov={40} sombras={false}>
      <Galpao piscina={false} />
      <CuboPremio pos={[0, -0.55, -6]} escala={1.3} />
    </Palco>
  );
};

// ===== 9. FINAL: em quem você aposta? =====
export const CenaFinal = () => {
  const s = useSeg();
  return (
    <Palco cinema clima="espaco" pos={lerp3(s, 0, D('final'), [0, 1.6, 6.2], [0, 1.55, 5.2])} olha={[0, 1.3, 0]} fov={42} sombras={false}>
      <Galpao mostrarTelao={false} piscina={false} />
      <J14 posicao={[-1.5, -0.55, 0]} rotacaoY={0.25} pose="bracosCruzados" expressao="confiante" />
      <J37 posicao={[0, -0.55, 0.3]} pose="maosNaCintura" expressao="confiante" />
      <J82 posicao={[1.5, -0.55, 0]} rotacaoY={-0.25} pose="acenar" expressao="feliz" suor />
      <pointLight position={[0, 4, 3]} intensity={20} color="#fff1d6" />
    </Palco>
  );
};
