import * as THREE from "three";
import { Brick, geo, metal, plastic, roundedBox } from "./core";

type V3 = [number, number, number];
type P = { position?: V3; rotation?: V3; scale?: number };

export const PAL = {
  peach: "#ffab85", peachDeep: "#ff7a52", mint: "#5ee6bf", mintDeep: "#14c79a",
  cream: "#fff3df", sky: "#7fd0ff", coral: "#ff4d5e", red: "#ff2d3d", green: "#22d65c",
  yellow: "#ffcc00", blue: "#2f7bff", wood: "#e8984f", woodDark: "#b8682e", grey: "#b8c4d2",
  pink: "#ff7aa8", pinkDeep: "#f2386e", flesh: "#ff8f8f", purple: "#8a5cff",
};

const sphere = (r: number, w = 28) => geo(`s-${r}-${w}`, () => new THREE.SphereGeometry(r, w, Math.round(w * 0.6)));
const cyl = (r1: number, r2: number, h: number, seg = 32) => geo(`c-${r1}-${r2}-${h}-${seg}`, () => new THREE.CylinderGeometry(r1, r2, h, seg));
const torus = (r: number, t: number, arc = Math.PI * 2) => geo(`t-${r}-${t}-${arc}`, () => new THREE.TorusGeometry(r, t, 20, 64, arc));

export const Donut: React.FC<P> = (p) => (
  <group {...p}>
    <mesh geometry={torus(0.36, 0.17)} material={plastic(PAL.coral, { rough: 0.45 })} rotation={[Math.PI / 2, 0, 0]} position={[0, 0.17, 0]} castShadow receiveShadow />
  </group>
);

export const Scalpel: React.FC<P> = (p) => (
  <group {...p}>
    <mesh geometry={roundedBox(0.9, 0.12, 0.08, 0.04)} material={plastic(PAL.blue)} castShadow />
    <mesh geometry={roundedBox(0.2, 0.06, 0.02, 0.01)} material={metal()} position={[0.52, 0.02, 0]} castShadow />
    <mesh geometry={geo("blade", () => {
      const s = new THREE.Shape(); s.moveTo(0, 0); s.lineTo(0.42, 0.02); s.quadraticCurveTo(0.3, 0.2, 0, 0.16); s.lineTo(0, 0);
      return new THREE.ExtrudeGeometry(s, { depth: 0.012, bevelEnabled: true, bevelSize: 0.004, bevelThickness: 0.004, bevelSegments: 2 });
    })} material={metal("#e8eef4")} position={[0.6, -0.04, -0.006]} castShadow />
  </group>
);

/** Big glossy red "X" built from two rounded bars. */
export const RedX: React.FC<P & { color?: string }> = ({ color = PAL.red, ...p }) => (
  <group {...p}>
    <mesh geometry={roundedBox(1.3, 0.24, 0.18, 0.09)} material={plastic(color, { emissive: color })} rotation={[0, 0, Math.PI / 4]} castShadow />
    <mesh geometry={roundedBox(1.3, 0.24, 0.18, 0.09)} material={plastic(color, { emissive: color })} rotation={[0, 0, -Math.PI / 4]} castShadow />
  </group>
);

export const Check: React.FC<P & { color?: string }> = ({ color = PAL.green, ...p }) => (
  <group {...p}>
    <mesh geometry={roundedBox(0.5, 0.2, 0.16, 0.08)} material={plastic(color, { emissive: color })} position={[-0.2, -0.1, 0]} rotation={[0, 0, -Math.PI / 4]} castShadow />
    <mesh geometry={roundedBox(0.95, 0.2, 0.16, 0.08)} material={plastic(color, { emissive: color })} position={[0.17, 0.1, 0]} rotation={[0, 0, Math.PI / 3.6]} castShadow />
  </group>
);

export const Plant: React.FC<P> = (p) => (
  <group {...p}>
    <Brick w={3} d={3} h={2} color={PAL.peachDeep} position={[0, 0.24, 0]} />
    {([[0, 0.85, 0, 0.28], [0.18, 0.7, 0.1, 0.2], [-0.17, 0.72, -0.05, 0.22], [0.05, 1.08, -0.05, 0.2], [-0.08, 0.98, 0.12, 0.17]] as const).map(([x, y, z, r], i) => (
      <mesh key={i} geometry={sphere(r)} material={plastic(i % 2 ? PAL.green : "#2fa85a", { rough: 0.4 })} position={[x, y, z]} castShadow />
    ))}
  </group>
);

export const Chair: React.FC<P & { color?: string }> = ({ color = PAL.mintDeep, ...p }) => (
  <group {...p}>
    <Brick w={3} d={3} h={0.5} color={color} position={[0, 0.5, 0]} />
    <Brick w={3} d={1} h={2.5} color={color} position={[0, 0.86, -0.2]} studs={false} />
    {[[-0.22, -0.22], [0.22, -0.22], [-0.22, 0.22], [0.22, 0.22]].map(([x, z], i) => (
      <mesh key={i} geometry={cyl(0.03, 0.03, 0.45)} material={metal()} position={[x, 0.22, z]} castShadow />
    ))}
  </group>
);

export const Door: React.FC<P & { color?: string }> = ({ color = PAL.mintDeep, ...p }) => (
  <group {...p}>
    <mesh geometry={roundedBox(1.0, 2.1, 0.08, 0.03)} material={plastic(color)} position={[0, 1.05, 0]} />
    <mesh geometry={roundedBox(0.8, 0.9, 0.04, 0.02)} material={plastic("#ffffff", { transparent: 0.35 })} position={[0, 1.45, 0.05]} />
    <mesh geometry={sphere(0.05)} material={metal("#ffd27a")} position={[0.38, 1.0, 0.08]} />
  </group>
);

export const WindowBox: React.FC<P & { w?: number; h?: number }> = ({ w = 1.4, h = 1.2, ...p }) => (
  <group {...p}>
    <mesh geometry={roundedBox(w + 0.14, h + 0.14, 0.08, 0.03)} material={plastic("#ffffff")} />
    <mesh geometry={roundedBox(w, h, 0.04)} material={plastic(PAL.sky, { emissive: "#bfe6ff" })} position={[0, 0, 0.03]} />
    <mesh geometry={sphere(0.18)} material={plastic("#fff2a8", { emissive: "#ffe58a" })} position={[w * 0.25, h * 0.2, 0.06]} scale={[1, 1, 0.2]} />
    <mesh geometry={roundedBox(0.05, h, 0.06)} material={plastic("#ffffff")} position={[0, 0, 0.05]} />
    <mesh geometry={roundedBox(w, 0.05, 0.06)} material={plastic("#ffffff")} position={[0, 0, 0.05]} />
  </group>
);

export const CrossPoster: React.FC<P> = (p) => (
  <group {...p}>
    <mesh geometry={roundedBox(0.8, 1.0, 0.04, 0.02)} material={plastic("#ffffff")} />
    <mesh geometry={roundedBox(0.16, 0.5, 0.04, 0.02)} material={plastic(PAL.red)} position={[0, 0.08, 0.03]} />
    <mesh geometry={roundedBox(0.5, 0.16, 0.04, 0.02)} material={plastic(PAL.red)} position={[0, 0.08, 0.03]} />
    <mesh geometry={roundedBox(0.5, 0.05, 0.03, 0.01)} material={plastic(PAL.mintDeep)} position={[0, -0.33, 0.03]} />
  </group>
);

export const Bench: React.FC<P> = (p) => (
  <group {...p}>
    <Brick w={8} d={2} h={0.5} color={PAL.peachDeep} position={[0, 0.45, 0]} />
    <Brick w={1} d={2} h={1.5} color={PAL.grey} position={[-0.6, 0.18, 0]} studs={false} />
    <Brick w={1} d={2} h={1.5} color={PAL.grey} position={[0.6, 0.18, 0]} studs={false} />
  </group>
);

export const ExamTable: React.FC<P> = (p) => (
  <group {...p}>
    <Brick w={10} d={4} h={2.5} color={PAL.mintDeep} position={[0, 0.3, 0]} studs={false} />
    <mesh geometry={roundedBox(2.0, 0.16, 0.8, 0.07)} material={plastic(PAL.cream, { rough: 0.5 })} position={[0, 0.7, 0]} castShadow receiveShadow />
    <mesh geometry={roundedBox(0.5, 0.14, 0.6, 0.06)} material={plastic("#ffffff", { rough: 0.5 })} position={[-0.75, 0.85, 0]} castShadow />
  </group>
);

/** Desk clock whose hands spin with `spin` (radians of the minute hand). */
export const DeskClock: React.FC<P & { spin: number }> = ({ spin, ...p }) => (
  <group {...p}>
    <mesh geometry={cyl(0.5, 0.5, 0.16, 64)} material={plastic(PAL.coral)} rotation={[Math.PI / 2, 0, 0]} castShadow />
    <mesh geometry={cyl(0.43, 0.43, 0.02, 64)} material={plastic("#ffffff")} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.085]} />
    {Array.from({ length: 12 }, (_, i) => (
      <mesh key={i} geometry={roundedBox(0.03, 0.07, 0.02, 0.01)} material={plastic("#3b4a66")}
        position={[0.36 * Math.sin((i / 12) * Math.PI * 2), 0.36 * Math.cos((i / 12) * Math.PI * 2), 0.1]} rotation={[0, 0, -(i / 12) * Math.PI * 2]} />
    ))}
    <group position={[0, 0, 0.11]} rotation={[0, 0, -spin]}>
      <mesh geometry={roundedBox(0.035, 0.34, 0.02, 0.012)} material={plastic("#3b4a66")} position={[0, 0.15, 0]} />
    </group>
    <group position={[0, 0, 0.12]} rotation={[0, 0, -spin / 12 - 1]}>
      <mesh geometry={roundedBox(0.05, 0.22, 0.02, 0.015)} material={plastic(PAL.red)} position={[0, 0.09, 0]} />
    </group>
    <mesh geometry={sphere(0.04)} material={plastic(PAL.yellow)} position={[0, 0, 0.13]} />
    <Brick w={3} d={2} h={1} color={PAL.coral} position={[0, -0.58, 0]} studs={false} />
  </group>
);

export const Syringe: React.FC<P> = (p) => (
  <group {...p}>
    <mesh geometry={cyl(0.12, 0.12, 0.8)} material={plastic("#e9f6ff", { transparent: 0.55 })} rotation={[0, 0, Math.PI / 2]} castShadow />
    <mesh geometry={cyl(0.1, 0.1, 0.5)} material={plastic(PAL.sky, { transparent: 0.8 })} rotation={[0, 0, Math.PI / 2]} position={[0.1, 0, 0]} />
    <mesh geometry={cyl(0.03, 0.03, 0.5)} material={plastic("#ffffff")} rotation={[0, 0, Math.PI / 2]} position={[-0.6, 0, 0]} />
    <mesh geometry={cyl(0.16, 0.16, 0.04)} material={plastic(PAL.blue)} rotation={[0, 0, Math.PI / 2]} position={[-0.86, 0, 0]} />
    <mesh geometry={cyl(0.012, 0.012, 0.4)} material={metal()} rotation={[0, 0, Math.PI / 2]} position={[0.6, 0, 0]} />
  </group>
);

export const Glass: React.FC<P & { fill: number }> = ({ fill, ...p }) => (
  <group {...p}>
    <mesh geometry={cyl(0.24, 0.2, 0.7, 48)} material={plastic("#eaf7ff", { transparent: 0.3 })} position={[0, 0.35, 0]} castShadow />
    {fill > 0.01 && (
      <mesh geometry={cyl(0.215, 0.19, 1, 48)} material={plastic("#55b9ff", { transparent: 0.75 })}
        position={[0, 0.03 + (0.62 * fill) / 2, 0]} scale={[1, 0.62 * fill, 1]} />
    )}
  </group>
);

export const FruitBowl: React.FC<P & { pop: number[] }> = ({ pop, ...p }) => {
  const bowl = geo("bowl", () => new THREE.SphereGeometry(0.5, 48, 24, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2));
  const items: [V3, number, string][] = [
    [[-0.18, 0.12, 0.05], 0.17, PAL.red], [[0.17, 0.13, 0.02], 0.16, "#ff9f1c"], [[0, 0.18, -0.15], 0.15, PAL.green],
    [[0.02, 0.28, 0.12], 0.13, PAL.yellow],
  ];
  return (
    <group {...p}>
      <mesh geometry={bowl} material={plastic(PAL.peach, { rough: 0.35 })} position={[0, 0.5, 0]} castShadow receiveShadow
        // eslint-disable-next-line react/no-unknown-property
        material-side={THREE.DoubleSide} />
      {items.map(([pos, r, c], i) => (
        <mesh key={i} geometry={sphere(r)} material={plastic(c)} position={[pos[0], pos[1] + 0.32, pos[2]]} scale={Math.max(0.001, pop[i] ?? 1)} castShadow />
      ))}
      {/* broccoli: stem + clay florets */}
      <group position={[0.32, 0.55, 0.15]} scale={Math.max(0.001, pop[4] ?? 1)} rotation={[0, 0, -0.5]}>
        <mesh geometry={cyl(0.04, 0.05, 0.22)} material={plastic("#8bd17c", { rough: 0.6 })} />
        {[[0, 0.15, 0], [0.07, 0.12, 0.04], [-0.07, 0.12, -0.03], [0.02, 0.2, -0.05]].map((q, i) => (
          <mesh key={i} geometry={sphere(0.07)} material={plastic("#2f9e4f", { rough: 0.7 })} position={q as V3} />
        ))}
      </group>
    </group>
  );
};

export const Calendar: React.FC<P & { checks: number }> = ({ checks, ...p }) => (
  <group {...p}>
    <mesh geometry={roundedBox(1.0, 1.0, 0.08, 0.04)} material={plastic("#ffffff")} castShadow />
    <mesh geometry={roundedBox(1.0, 0.2, 0.1, 0.04)} material={plastic(PAL.coral)} position={[0, 0.42, 0.01]} />
    {Array.from({ length: 9 }, (_, i) => {
      const x = ((i % 3) - 1) * 0.28, y = 0.14 - Math.floor(i / 3) * 0.24;
      const on = i < checks;
      return (
        <group key={i} position={[x, y, 0.06]}>
          <mesh geometry={roundedBox(0.2, 0.17, 0.02, 0.02)} material={plastic(on ? "#dff7e7" : "#eef1f4")} />
          {on && <Check position={[0, 0, 0.03]} scale={0.12} />}
        </group>
      );
    })}
  </group>
);

export const Shield: React.FC<P> = (p) => {
  const g = geo("shield", () => {
    const s = new THREE.Shape();
    s.moveTo(0, 0.6); s.quadraticCurveTo(0.35, 0.62, 0.5, 0.45); s.quadraticCurveTo(0.5, -0.2, 0, -0.62);
    s.quadraticCurveTo(-0.5, -0.2, -0.5, 0.45); s.quadraticCurveTo(-0.35, 0.62, 0, 0.6);
    return new THREE.ExtrudeGeometry(s, { depth: 0.12, bevelEnabled: true, bevelSize: 0.05, bevelThickness: 0.05, bevelSegments: 4 });
  });
  return (
    <group {...p}>
      <mesh geometry={g} material={plastic(PAL.blue)} castShadow />
      <Check position={[0, 0.02, 0.2]} scale={0.38} color="#ffffff" />
    </group>
  );
};

/** Gauge dial: green (pressure) -> yellow -> red (pain). value 0..1 sets the needle. */
export const Gauge: React.FC<P & { value: number; dimRed: number }> = ({ value, dimRed, ...p }) => {
  const seg = (a0: number, color: string, k: string) => (
    <mesh key={k} geometry={geo(`gseg-${a0}`, () => new THREE.RingGeometry(0.62, 1.0, 32, 1, a0, Math.PI / 3))}
      material={plastic(color, { emissive: color })} position={[0, 0, 0.06]} />
  );
  return (
    <group {...p}>
      <mesh geometry={geo("gaugeback", () => new THREE.CylinderGeometry(1.15, 1.15, 0.12, 64, 1, false, -Math.PI / 2, Math.PI))}
        material={plastic("#ffffff")} rotation={[Math.PI / 2, 0, 0]} castShadow />
      {seg(Math.PI * 2 / 3, PAL.green, "g")}
      {seg(Math.PI / 3, PAL.yellow, "y")}
      {seg(0, dimRed > 0.5 ? "#c9b3b3" : PAL.red, "r")}
      <group position={[0, 0, 0.12]} rotation={[0, 0, Math.PI / 2 - value * Math.PI]}>
        <mesh geometry={roundedBox(0.06, 0.95, 0.04, 0.02)} material={plastic("#3b4a66")} position={[0, 0.45, 0]} castShadow />
      </group>
      <mesh geometry={cyl(0.12, 0.12, 0.08)} material={plastic(PAL.yellow)} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.13]} />
      <Brick w={6} d={2} h={1} color={PAL.mintDeep} position={[0, -0.18, 0]} studs={false} />
    </group>
  );
};

export const Sparkles: React.FC<{ t: number; origin: V3; count?: number; color?: string }> = ({ t, origin, count = 14, color = PAL.yellow }) => {
  if (t < 0 || t > 1.2) return null;
  return (
    <group position={origin}>
      {Array.from({ length: count }, (_, i) => {
        const a = (i / count) * Math.PI * 2 + i * 0.37;
        const r = 0.2 + t * (0.9 + (i % 3) * 0.25);
        const s = Math.max(0.001, (1 - t / 1.2) * (0.06 + (i % 2) * 0.03));
        return <mesh key={i} geometry={sphere(1, 12)} material={plastic(i % 3 ? color : "#ffffff", { emissive: color })}
          position={[Math.cos(a) * r, Math.sin(a) * r + t * 0.3, (i % 4) * 0.05]} scale={s} />;
      })}
    </group>
  );
};
