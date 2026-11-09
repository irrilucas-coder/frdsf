import {useMemo} from 'react';
import {BackSide, CatmullRomCurve3, TubeGeometry, Vector3} from 'three';
import {useCurrentFrame} from 'remotion';

type V3 = [number, number, number];
const M = ({cor, emi = 0, op = 1, lado}: {cor: string; emi?: number; op?: number; lado?: number}) => (
  <meshStandardMaterial color={cor} flatShading roughness={0.75} emissive={emi ? cor : '#000'} emissiveIntensity={emi} transparent={op < 1} opacity={op} depthWrite={op >= 1} side={lado as never} />
);
const ROSA = '#ff7eb6';

// ---------- Chiclete (bolinha rosa facetada) ----------
export const Goma = ({pos, r = 0.16, giro = 0, esc = [1, 1, 1] as V3, brilho = 0.15}: {pos: V3; r?: number; giro?: number; esc?: V3; brilho?: number}) => (
  <mesh position={pos} rotation={[giro, giro * 0.7, 0]} scale={esc} castShadow>
    <icosahedronGeometry args={[r, 1]} />
    <M cor={ROSA} emi={brilho} />
  </mesh>
);

// Bola de chiclete (bolha) translúcida
export const Bolha = ({pos, r}: {pos: V3; r: number}) =>
  r <= 0.01 ? null : (
    <mesh position={pos}>
      <icosahedronGeometry args={[r, 2]} />
      <meshStandardMaterial color="#ff9ccc" flatShading transparent opacity={0.8} roughness={0.2} emissive="#ff7eb6" emissiveIntensity={0.15} />
    </mesh>
  );

// Pedacinhos voando (estouro)
export const Estouro = ({centro, s, cor = ROSA, n = 14}: {centro: V3; s: number; cor?: string; n?: number}) => {
  if (s < 0 || s > 0.8) return null;
  return (
    <>
      {Array.from({length: n}, (_, i) => {
        const a = (i / n) * Math.PI * 2;
        const b = ((i * 37) % 10) / 10 - 0.5;
        const d = s * 2.2;
        return (
          <mesh key={i} position={[centro[0] + Math.cos(a) * d * 0.6, centro[1] + Math.sin(a) * d * 0.5 + b * d * 0.4 - s * s * 1.5, centro[2] + Math.abs(b) * d * 0.6]} scale={1 - s}>
            <tetrahedronGeometry args={[0.06, 0]} />
            <M cor={cor} emi={0.2} />
          </mesh>
        );
      })}
    </>
  );
};

// ---------- Cozinha low-poly ----------
export const Cozinha = () => (
  <group>
    {/* piso xadrez */}
    {Array.from({length: 14}, (_, i) =>
      Array.from({length: 10}, (_, j) => (
        <mesh key={`${i}-${j}`} position={[-7 + i + 0.5, -0.02, -6 + j + 0.5]} receiveShadow>
          <boxGeometry args={[1, 0.04, 1]} />
          <M cor={(i + j) % 2 ? '#f2efe6' : '#7fb3d5'} />
        </mesh>
      )),
    )}
    {/* paredes */}
    <mesh position={[0, 2.5, -4.5]}>
      <boxGeometry args={[14, 5, 0.2]} />
      <M cor="#fde9b8" />
    </mesh>
    {/* azulejos atrás da bancada */}
    {Array.from({length: 12}, (_, i) =>
      Array.from({length: 3}, (_, j) => (
        <mesh key={`a${i}${j}`} position={[-3 + i * 0.5 + 0.25, 1.15 + j * 0.5, -4.38]}>
          <boxGeometry args={[0.47, 0.47, 0.03]} />
          <M cor={(i + j) % 2 ? '#ffffff' : '#d8eef7'} />
        </mesh>
      )),
    )}
    {/* bancada com gavetas */}
    <mesh position={[0, 0.5, -3.9]} castShadow>
      <boxGeometry args={[6, 1, 1]} />
      <M cor="#6aa84f" />
    </mesh>
    <mesh position={[0, 1.03, -3.9]}>
      <boxGeometry args={[6.1, 0.08, 1.1]} />
      <M cor="#eeeeee" />
    </mesh>
    {[-2.2, -0.75, 0.75, 2.2].map((x) => (
      <group key={x}>
        <mesh position={[x, 0.5, -3.39]}>
          <boxGeometry args={[1.3, 0.8, 0.02]} />
          <M cor="#7cbf5e" />
        </mesh>
        <mesh position={[x, 0.75, -3.36]}>
          <boxGeometry args={[0.4, 0.06, 0.05]} />
          <M cor="#d9d9d9" />
        </mesh>
      </group>
    ))}
    {/* geladeira */}
    <mesh position={[4.2, 1.3, -3.8]} castShadow>
      <boxGeometry args={[1.3, 2.6, 1.1]} />
      <M cor="#e9eef2" />
    </mesh>
    <mesh position={[3.65, 1.6, -3.22]}>
      <boxGeometry args={[0.06, 0.6, 0.06]} />
      <M cor="#9aa0a8" />
    </mesh>
    {/* janela com céu */}
    <mesh position={[-1, 3.1, -4.38]}>
      <boxGeometry args={[2.4, 1.6, 0.05]} />
      <meshBasicMaterial color="#8fd3ff" />
    </mesh>
    <mesh position={[-1, 3.1, -4.35]}>
      <boxGeometry args={[0.08, 1.6, 0.05]} />
      <M cor="#ffffff" />
    </mesh>
    {/* vaso de planta e frutas na bancada */}
    <mesh position={[-2.5, 1.25, -3.9]}>
      <cylinderGeometry args={[0.18, 0.14, 0.35, 7]} />
      <M cor="#d9784a" />
    </mesh>
    <mesh position={[-2.5, 1.6, -3.9]}>
      <icosahedronGeometry args={[0.3, 0]} />
      <M cor="#4caf50" />
    </mesh>
    {[[1.6, '#e53935'], [1.85, '#ffb300'], [1.72, '#7cb342']].map(([x, c], i) => (
      <mesh key={i} position={[x as number, 1.15, -3.75 + i * 0.12]}>
        <icosahedronGeometry args={[0.1, 0]} />
        <M cor={c as string} />
      </mesh>
    ))}
  </group>
);

// Mesa com pilha de chicletes (cena do perigo)
export const MesaChicletes = ({n = 30, sobrando = 1}: {n?: number; sobrando?: number}) => (
  <group>
    <mesh position={[0, 0.7, 0]} castShadow>
      <boxGeometry args={[2.2, 0.1, 1.2]} />
      <M cor="#c98a4b" />
    </mesh>
    {[[-1, -0.5], [1, -0.5], [-1, 0.5], [1, 0.5]].map(([x, z], i) => (
      <mesh key={i} position={[x, 0.33, z]}>
        <cylinderGeometry args={[0.05, 0.05, 0.65, 6]} />
        <M cor="#a06a36" />
      </mesh>
    ))}
    {Array.from({length: Math.round(n * sobrando)}, (_, i) => (
      <mesh key={i} position={[((i * 37) % 13) / 13 - 0.5, 0.8 + Math.floor(i / 9) * 0.07, ((i * 53) % 7) / 7 - 0.5]} rotation={[i, i * 2, 0]}>
        <boxGeometry args={[0.16, 0.05, 0.08]} />
        <M cor={['#ff7eb6', '#7ee0ff', '#b4f07e', '#ffd166'][i % 4]} emi={0.1} />
      </mesh>
    ))}
  </group>
);

// ---------- Corpo em corte (raio-x) com esôfago, estômago e intestinos ----------
const curvaEsofago = new CatmullRomCurve3([new Vector3(0, 3.2, 0.25), new Vector3(0.02, 2.4, 0.2), new Vector3(-0.05, 1.6, 0.25), new Vector3(-0.2, 1.05, 0.35)]);
const pontosIntestino: Vector3[] = [];
for (let i = 0; i <= 26; i++) {
  const y = -0.15 - i * 0.075;
  const x = Math.sin(i * 1.15) * 0.55;
  const z = 0.25 + Math.cos(i * 0.9) * 0.12;
  pontosIntestino.push(new Vector3(x, y, z));
}
const curvaIntestino = new CatmullRomCurve3(pontosIntestino);
const curvaGrosso = new CatmullRomCurve3([new Vector3(-0.85, -2.3, 0.2), new Vector3(-0.95, -1.2, 0.2), new Vector3(-0.85, -0.05, 0.2), new Vector3(0, 0.1, 0.25), new Vector3(0.85, -0.05, 0.2), new Vector3(0.95, -1.2, 0.2), new Vector3(0.6, -2.3, 0.2), new Vector3(0, -2.6, 0.2)]);

// Posição do chiclete no trajeto: u 0→0.3 esôfago, 0.3→0.5 estômago, 0.5→1 intestino
export const posNoCorpo = (u: number): V3 => {
  if (u < 0.3) {
    const p = curvaEsofago.getPoint(u / 0.3);
    return [p.x, p.y, p.z];
  }
  if (u < 0.5) {
    const k = (u - 0.3) / 0.2;
    // gira dentro do estômago
    return [-0.35 + Math.sin(k * 5) * 0.25, 0.55 - k * 0.45 + Math.cos(k * 5) * 0.1, 0.35];
  }
  const p = curvaIntestino.getPoint(Math.min(1, (u - 0.5) / 0.5));
  return [p.x, p.y, p.z + 0.02];
};

export const CorpoCorte = ({aperto = 0, entupido = 0, pele = '#f0c49a'}: {aperto?: number; entupido?: number; pele?: string}) => {
  const frame = useCurrentFrame();
  const geos = useMemo(
    () => ({
      esofago: new TubeGeometry(curvaEsofago, 30, 0.12, 8, false),
      intestino: new TubeGeometry(curvaIntestino, 120, 0.13, 7, false),
      grosso: new TubeGeometry(curvaGrosso, 60, 0.2, 8, false),
    }),
    [],
  );
  const pulsa = 1 - aperto * (0.12 + Math.sin(frame * 0.6) * 0.06);
  const alerta = entupido > 0 && Math.floor(frame / 6) % 2 === 0;
  return (
    <group>
      {/* silhueta translúcida */}
      <mesh position={[0, 0.3, 0]} scale={[1.35, 3.1, 0.9]}>
        <sphereGeometry args={[1, 14, 10]} />
        <M cor={pele} op={0.22} />
      </mesh>
      <mesh position={[0, 4.0, 0]}>
        <sphereGeometry args={[1.05, 12, 9]} />
        <M cor={pele} op={0.22} />
      </mesh>
      <mesh geometry={geos.esofago}>
        <M cor="#e57373" op={0.75} />
      </mesh>
      {/* estômago (aperta quando empurra) */}
      <mesh position={[-0.35, 0.45, 0.3]} rotation={[0, 0, 0.5]} scale={[0.95 * pulsa, 0.62 * pulsa, 0.55 * pulsa]}>
        <sphereGeometry args={[1, 12, 9]} />
        <M cor="#ef5350" op={0.55} emi={0.05} />
      </mesh>
      <mesh geometry={geos.intestino}>
        <M cor={alerta ? '#ff1744' : '#f48fb1'} op={0.7} emi={alerta ? 0.6 : 0.05} />
      </mesh>
      <mesh geometry={geos.grosso}>
        <M cor="#d4877a" op={0.55} />
      </mesh>
    </group>
  );
};

// ---------- Estômago por dentro ----------
export const EstomagoDentro = ({s, encolhe}: {s: number; encolhe: [number, number, number]}) => {
  const frame = useCurrentFrame();
  const bolhas = useMemo(() => Array.from({length: 40}, (_, i) => ({x: ((i * 73) % 100) / 10 - 5, z: ((i * 37) % 100) / 12 - 4, v: 0.4 + (i % 5) * 0.15, o: i * 0.37})), []);
  const comida = [
    {tipo: 'pao', pos: [-1.6, -1.65, -0.5] as V3, k: encolhe[0]},
    {tipo: 'carne', pos: [0.2, -1.7, -1.4] as V3, k: encolhe[1]},
    {tipo: 'fruta', pos: [1.7, -1.65, -0.4] as V3, k: encolhe[2]},
  ];
  return (
    <group>
      {/* parede do estômago */}
      <mesh>
        <sphereGeometry args={[6, 18, 14]} />
        <meshStandardMaterial color="#c94a5a" flatShading side={BackSide} roughness={0.6} />
      </mesh>
      {Array.from({length: 9}, (_, i) => (
        <mesh key={i} rotation={[Math.PI / 2 + Math.sin(i) * 0.3, i * 0.7, 0]} position={[0, 0, 0]}>
          <torusGeometry args={[5.75, 0.18, 6, 40]} />
          <meshStandardMaterial color="#b23b4c" flatShading />
        </mesh>
      ))}
      {/* lago de ácido */}
      <mesh position={[0, -2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[5.6, 30]} />
        <meshStandardMaterial color="#b7e34a" emissive="#9ccc2b" emissiveIntensity={0.55} transparent opacity={0.88} flatShading />
      </mesh>
      {bolhas.map((b, i) => {
        const y = -2 + (((s * b.v + b.o) % 1.6));
        return (
          <mesh key={i} position={[b.x * 0.8, y, b.z * 0.8]}>
            <icosahedronGeometry args={[0.06 + (i % 3) * 0.03, 0]} />
            <meshStandardMaterial color="#e6ff9a" emissive="#c6f05a" emissiveIntensity={0.6} transparent opacity={0.8} />
          </mesh>
        );
      })}
      {comida.map((c, i) => {
        const esc = Math.max(0, 1 - c.k);
        if (esc <= 0.02) return null;
        const bob = Math.sin(frame * 0.12 + i) * 0.05;
        return (
          <group key={i} position={[c.pos[0], c.pos[1] + bob, c.pos[2]]} scale={esc}>
            {c.tipo === 'pao' && (
              <>
                <mesh><boxGeometry args={[0.7, 0.45, 0.45]} /><M cor="#e9c27a" /></mesh>
                <mesh position={[0, 0.22, 0]} scale={[1, 0.35, 1]}><sphereGeometry args={[0.36, 8, 5]} /><M cor="#b8792f" /></mesh>
              </>
            )}
            {c.tipo === 'carne' && (
              <mesh scale={[1.2, 0.7, 0.9]}><dodecahedronGeometry args={[0.38, 0]} /><M cor="#a8443a" /></mesh>
            )}
            {c.tipo === 'fruta' && (
              <>
                <mesh><icosahedronGeometry args={[0.36, 1]} /><M cor="#e53935" /></mesh>
                <mesh position={[0, 0.4, 0]}><cylinderGeometry args={[0.03, 0.03, 0.15, 5]} /><M cor="#6d4c41" /></mesh>
                <mesh position={[0.1, 0.45, 0]} rotation={[0, 0, -0.8]} scale={[1, 0.4, 0.6]}><sphereGeometry args={[0.1, 6, 4]} /><M cor="#43a047" /></mesh>
              </>
            )}
            {/* efervescência em volta enquanto dissolve */}
            {c.k > 0.02 &&
              Array.from({length: 6}, (_, j) => (
                <mesh key={j} position={[Math.cos(j + frame * 0.2) * 0.5, 0.1 + ((frame * 0.03 + j * 0.2) % 0.8), Math.sin(j + frame * 0.2) * 0.4]}>
                  <icosahedronGeometry args={[0.05, 0]} />
                  <meshStandardMaterial color="#f4ffb0" emissive="#e6ff7a" emissiveIntensity={0.8} />
                </mesh>
              ))}
          </group>
        );
      })}
      <pointLight position={[0, 2.5, 2]} intensity={40} color="#ffd9d9" />
      <pointLight position={[0, -1.6, 0]} intensity={18} color="#c6f05a" />
    </group>
  );
};

// ---------- Túnel do intestino (voo da câmera) ----------
const pontosTunel: Vector3[] = [];
for (let i = 0; i <= 20; i++) pontosTunel.push(new Vector3(Math.sin(i * 0.7) * 3, Math.cos(i * 0.5) * 1.5, -i * 4));
export const curvaTunel = new CatmullRomCurve3(pontosTunel);
export const Tunel = () => {
  const geo = useMemo(() => new TubeGeometry(curvaTunel, 300, 1.6, 12, false), []);
  const aneis = useMemo(() => Array.from({length: 60}, (_, i) => {
    const u = i / 60;
    const p = curvaTunel.getPoint(u);
    const tg = curvaTunel.getTangent(u);
    return {p: [p.x, p.y, p.z] as V3, yaw: Math.atan2(tg.x, tg.z), pitch: -Math.asin(tg.y)};
  }), []);
  return (
    <group>
      <mesh geometry={geo}>
        <meshStandardMaterial color="#e88a9a" flatShading side={BackSide} roughness={0.5} />
      </mesh>
      {aneis.map((a, i) => (
        <group key={i} position={a.p} rotation={[a.pitch, a.yaw, 0, 'YXZ']}>
          <mesh>
            <torusGeometry args={[1.5, 0.14, 6, 24]} />
            <meshStandardMaterial color="#d46f82" flatShading />
          </mesh>
        </group>
      ))}
    </group>
  );
};
