import {useMemo} from 'react';
import {useCurrentFrame} from 'remotion';

// Cenário low-poly: cores chapadas, formas facetadas (combina com o Boneco)
type V3 = [number, number, number];
const M = ({cor, emi = 0}: {cor: string; emi?: number}) => <meshStandardMaterial color={cor} flatShading roughness={0.85} emissive={emi ? cor : '#000'} emissiveIntensity={emi} />;

export const Arvore = ({pos, escala = 1, tipo = 'redonda', cor = '#4caf50'}: {pos: V3; escala?: number; tipo?: 'redonda' | 'pinheiro'; cor?: string}) => {
  const frame = useCurrentFrame();
  const balanco = Math.sin(frame * 0.05 + pos[0]) * 0.03;
  return (
    <group position={pos} scale={escala} rotation={[0, 0, balanco]}>
      <mesh position={[0, 0.6, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.16, 1.2, 6]} />
        <M cor="#7a5232" />
      </mesh>
      {tipo === 'redonda' ? (
        <>
          <mesh position={[0, 1.65, 0]} castShadow>
            <icosahedronGeometry args={[0.75, 0]} />
            <M cor={cor} />
          </mesh>
          <mesh position={[0.35, 1.35, 0.2]} castShadow>
            <icosahedronGeometry args={[0.45, 0]} />
            <M cor={cor} />
          </mesh>
        </>
      ) : (
        [0, 1, 2].map((i) => (
          <mesh key={i} position={[0, 1.2 + i * 0.5, 0]} castShadow>
            <coneGeometry args={[0.75 - i * 0.18, 0.9, 7]} />
            <M cor={cor} />
          </mesh>
        ))
      )}
    </group>
  );
};

export const Arbusto = ({pos, escala = 1, cor = '#5cbf5c'}: {pos: V3; escala?: number; cor?: string}) => (
  <mesh position={pos} scale={escala} castShadow>
    <icosahedronGeometry args={[0.35, 0]} />
    <M cor={cor} />
  </mesh>
);

export const Flor = ({pos, cor = '#ff5a8a'}: {pos: V3; cor?: string}) => (
  <group position={pos}>
    <mesh position={[0, 0.12, 0]}>
      <cylinderGeometry args={[0.01, 0.01, 0.24, 4]} />
      <M cor="#3e8e41" />
    </mesh>
    <mesh position={[0, 0.25, 0]}>
      <icosahedronGeometry args={[0.05, 0]} />
      <M cor={cor} emi={0.2} />
    </mesh>
  </group>
);

export const Nuvem = ({pos, escala = 1}: {pos: V3; escala?: number}) => {
  const frame = useCurrentFrame();
  return (
    <group position={[pos[0] + frame * 0.004, pos[1], pos[2]]} scale={escala}>
      {[[0, 0, 0, 1], [0.9, -0.1, 0, 0.75], [-0.85, -0.15, 0, 0.7], [0.3, 0.35, 0, 0.7]].map(([x, y, z, r], i) => (
        <mesh key={i} position={[x, y, z]}>
          <icosahedronGeometry args={[r, 0]} />
          <meshStandardMaterial color="#ffffff" flatShading roughness={1} emissive="#ffffff" emissiveIntensity={0.15} />
        </mesh>
      ))}
    </group>
  );
};

// Gramado com colinas ao fundo, árvores, flores e nuvens (semente define a distribuição)
export const Campo = ({semente = 3, arvores = 18, raio = 30}: {semente?: number; arvores?: number; raio?: number}) => {
  const itens = useMemo(() => {
    let s = semente * 7919;
    const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
    const lista: {tipo: 'a' | 'p' | 'b' | 'f'; pos: V3; e: number; cor: string}[] = [];
    for (let i = 0; i < arvores; i++) {
      const a = rnd() * Math.PI * 2;
      const r = 7 + rnd() * raio;
      lista.push({tipo: rnd() > 0.4 ? 'a' : 'p', pos: [Math.cos(a) * r, 0, -Math.abs(Math.sin(a) * r) - 3], e: 0.8 + rnd() * 0.9, cor: ['#4caf50', '#43a047', '#66bb6a', '#2e7d32'][Math.floor(rnd() * 4)]});
    }
    for (let i = 0; i < 26; i++) lista.push({tipo: 'b', pos: [(rnd() - 0.5) * 30, 0.15, -2 - rnd() * 20], e: 0.6 + rnd() * 0.8, cor: '#5cbf5c'});
    for (let i = 0; i < 60; i++) lista.push({tipo: 'f', pos: [(rnd() - 0.5) * 20, 0, (rnd() - 0.6) * 14], e: 1, cor: ['#ff5a8a', '#ffd23f', '#ffffff', '#b388ff'][Math.floor(rnd() * 4)]});
    return lista;
  }, [semente, arvores, raio]);
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[90, 24]} />
        <M cor="#7cc95a" />
      </mesh>
      {/* colinas */}
      {[[-30, -55, 22, '#6dbb4f'], [10, -60, 26, '#79c45a'], [42, -52, 20, '#68b84a'], [-60, -40, 18, '#73c055']].map(([x, z, r, c], i) => (
        <mesh key={i} position={[x as number, -(r as number) * 0.55, z as number]} scale={[1.4, 1, 1]}>
          <icosahedronGeometry args={[r as number, 1]} />
          <M cor={c as string} />
        </mesh>
      ))}
      {itens.map((it, i) =>
        it.tipo === 'a' || it.tipo === 'p' ? (
          <Arvore key={i} pos={it.pos} escala={it.e} tipo={it.tipo === 'a' ? 'redonda' : 'pinheiro'} cor={it.cor} />
        ) : it.tipo === 'b' ? (
          <Arbusto key={i} pos={it.pos} escala={it.e} />
        ) : (
          <Flor key={i} pos={it.pos} cor={it.cor} />
        ),
      )}
      <Nuvem pos={[-8, 12, -30]} escala={2} />
      <Nuvem pos={[10, 14, -35]} escala={2.4} />
      <Nuvem pos={[25, 11, -28]} escala={1.6} />
    </group>
  );
};

// Luz de dia ensolarado (sol quente + céu frio + contraluz) para o visual low-poly
export const LuzDia = () => (
  <>
    <hemisphereLight args={['#dff1ff', '#6a8f4a', 1.1]} />
    <directionalLight position={[6, 10, 7]} intensity={2.2} color="#fff3dc" castShadow />
    <directionalLight position={[-5, 4, -6]} intensity={0.9} color="#bfe3ff" />
  </>
);
