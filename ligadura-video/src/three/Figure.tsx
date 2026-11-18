import * as THREE from "three";
import { geo, mat, metal, plastic, roundedBox } from "./core";

// Toy figure (generic block-toy proportions, ~1.6 units tall), built facing +z.
// Legs swing from the hip, arms from the shoulder, claw hands, cylinder head.

export type Outfit = {
  shirt: string; legs: string; hair: string; hairStyle: "short" | "side" | "bun";
  tie?: string; coat?: boolean; stethoscope?: boolean; glasses?: boolean;
};
export const DOCTOR: Outfit = { shirt: "#2fd3b0", legs: "#14a88a", hair: "#6b4a3a", hairStyle: "side", coat: true, stethoscope: true, glasses: true };
export const PATIENT: Outfit = { shirt: "#f7f5f0", legs: "#3554c9", hair: "#8a4a1c", hairStyle: "short", tie: "#ff2d3d" };

export type Mood = "smile" | "worried" | "wow" | "happy";
export type FigurePose = {
  legL: number; legR: number; // hip swing (rad, + = forward)
  armL: number; armR: number; // shoulder swing (rad, + = forward/up)
  armSpreadL?: number; armSpreadR?: number; // sideways raise (rad)
  headYaw?: number; headTilt?: number;
  sit?: boolean; bob?: number; blink?: boolean;
};
export const STAND: FigurePose = { legL: 0, legR: 0, armL: 0.08, armR: 0.08 };

const SKIN = "#ffcf1f";
const INK = "#1d1a26";

// torso: trapezoid (wider at the hips), slightly bevelled
const torsoGeo = () => geo("torso", () => {
  const g = new THREE.BoxGeometry(0.62, 0.5, 0.31, 2, 2, 2);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const y = p.getY(i);
    const k = 1 - ((y + 0.25) / 0.5) * 0.24; // top is 76% as wide
    p.setX(i, p.getX(i) * k);
  }
  g.computeVertexNormals();
  return g;
});

// head: cylinder with rounded rims (lathe profile)
const headGeo = () => geo("head", () => {
  const pts: THREE.Vector2[] = [];
  const r = 0.19, h = 0.3, f = 0.045;
  pts.push(new THREE.Vector2(0, -h / 2));
  for (let i = 0; i <= 6; i++) { const a = -Math.PI / 2 + (i / 6) * (Math.PI / 2); pts.push(new THREE.Vector2(r - f + f * Math.cos(a), -h / 2 + f + f * Math.sin(a))); }
  for (let i = 0; i <= 6; i++) { const a = (i / 6) * (Math.PI / 2); pts.push(new THREE.Vector2(r - f + f * Math.cos(a), h / 2 - f + f * Math.sin(a))); }
  pts.push(new THREE.Vector2(0, h / 2));
  return new THREE.LatheGeometry(pts, 48);
});

const sphere = (r: number) => geo(`sph-${r}`, () => new THREE.SphereGeometry(r, 24, 16));
const torusArc = (r: number, t: number, arc: number) => geo(`ta-${r}-${t}-${arc}`, () => new THREE.TorusGeometry(r, t, 10, 32, arc));
const cyl = (r: number, h: number) => geo(`cy-${r}-${h}`, () => new THREE.CylinderGeometry(r, r, h, 24));
const capsule = (r: number, l: number) => geo(`cap-${r}-${l}`, () => new THREE.CapsuleGeometry(r, l, 8, 16));
const ink = () => mat("ink", () => new THREE.MeshPhysicalMaterial({ color: INK, roughness: 0.3, clearcoat: 1 }));

const Face: React.FC<{ mood: Mood; blink?: boolean }> = ({ mood, blink }) => {
  const z = 0.188;
  const eyeY = 0.035, eyeX = 0.065;
  const eyeScale: [number, number, number] = blink ? [1, 0.18, 0.5] : mood === "wow" ? [1.15, 1.3, 0.5] : [1, 1, 0.5];
  const worried = mood === "worried";
  return (
    <group>
      {[-1, 1].map((s) => (
        <group key={s}>
          <mesh geometry={sphere(0.024)} material={ink()} position={[s * eyeX, eyeY, z]} scale={eyeScale} />
          {!blink && <mesh geometry={sphere(0.007)} material={plastic("#ffffff")} position={[s * eyeX + 0.008, eyeY + 0.01, z + 0.012]} />}
          {/* eyebrows: tilt up in the middle when worried */}
          <mesh geometry={roundedBox(0.05, 0.011, 0.01, 0.004)} material={ink()}
            position={[s * eyeX, eyeY + (mood === "wow" ? 0.07 : 0.055), z - 0.004]}
            rotation={[0, 0, worried ? s * -0.45 : mood === "happy" ? s * 0.15 : 0]} />
        </group>
      ))}
      {mood === "wow" ? (
        <mesh geometry={sphere(0.028)} material={ink()} position={[0, -0.055, z - 0.005]} scale={[1, 1.2, 0.4]} />
      ) : (
        <mesh geometry={torusArc(mood === "happy" ? 0.06 : 0.05, 0.012, Math.PI * 0.8)} material={ink()}
          position={[0, worried ? -0.09 : -0.045, z + 0.004]}
          rotation={[0, 0, worried ? Math.PI * 0.1 : Math.PI * 1.1]} />
      )}
      {mood === "happy" && <mesh geometry={sphere(0.05)} material={plastic("#ff9c8a", { transparent: 0.6 })} position={[0.12, -0.03, 0.15]} scale={[1, 0.6, 0.3]} />}
      {mood === "happy" && <mesh geometry={sphere(0.05)} material={plastic("#ff9c8a", { transparent: 0.6 })} position={[-0.12, -0.03, 0.15]} scale={[1, 0.6, 0.3]} />}
    </group>
  );
};

const Hair: React.FC<{ o: Outfit }> = ({ o }) => {
  const m = plastic(o.hair, { rough: 0.35 });
  const cap = geo(`haircap`, () => new THREE.SphereGeometry(0.212, 40, 20, 0, Math.PI * 2, 0, Math.PI * 0.52));
  const back = geo(`hairback`, () => new THREE.CylinderGeometry(0.205, 0.205, 0.2, 40, 1, true, Math.PI * 0.5, Math.PI));
  return (
    <group position={[0, 0.1, 0]}>
      <mesh geometry={cap} material={m} scale={[1, 0.62, 1]} castShadow />
      <mesh geometry={back} material={mat(`hb-${o.hair}`, () => { const x = (m as THREE.MeshPhysicalMaterial).clone(); x.side = THREE.DoubleSide; return x; })} position={[0, -0.08, 0]} castShadow />
      {o.hairStyle === "side" && <mesh geometry={sphere(0.09)} material={m} position={[0.1, 0.07, 0.12]} scale={[1.4, 0.55, 0.8]} castShadow />}
      {o.hairStyle === "short" && <mesh geometry={sphere(0.08)} material={m} position={[-0.06, 0.08, 0.14]} scale={[1.6, 0.5, 0.7]} castShadow />}
      {o.hairStyle === "bun" && <mesh geometry={sphere(0.08)} material={m} position={[0, 0.12, -0.12]} castShadow />}
    </group>
  );
};

/** Arm group pivoting at the shoulder; side = -1 (left) / +1 (right). */
const Arm: React.FC<{ side: number; swing: number; spread: number; color: string; coat?: boolean }> = ({ side, swing, spread, color, coat }) => {
  const sleeve = plastic(coat ? "#fbfbf8" : color);
  return (
    <group position={[side * 0.27, 1.06, 0]} rotation={[-swing, 0, side * (0.12 + spread)]}>
      <mesh geometry={capsule(0.072, 0.2)} material={sleeve} position={[side * 0.03, -0.14, 0.02]} rotation={[0.25, 0, side * 0.12]} castShadow />
      <mesh geometry={cyl(0.04, 0.05)} material={plastic(SKIN)} position={[side * 0.045, -0.3, 0.07]} rotation={[0.6, 0, 0]} />
      {/* claw hand: open ring facing forward */}
      <mesh geometry={torusArc(0.055, 0.026, Math.PI * 1.55)} material={plastic(SKIN)}
        position={[side * 0.05, -0.36, 0.1]} rotation={[0.6, Math.PI / 2, Math.PI * 0.72]} castShadow />
    </group>
  );
};

const Leg: React.FC<{ side: number; swing: number; color: string; sit?: boolean }> = ({ side, swing, color, sit }) => {
  const m = plastic(color);
  return (
    <group position={[side * 0.155, 0.52, 0]} rotation={[sit ? -Math.PI / 2 : -swing, 0, 0]}>
      <mesh geometry={roundedBox(0.29, 0.4, 0.3, 0.03)} material={m} position={[0, -0.2, 0]} castShadow receiveShadow />
      <mesh geometry={roundedBox(0.29, 0.12, 0.38, 0.03)} material={m} position={[0, -0.46, 0.04]} castShadow receiveShadow />
    </group>
  );
};

export const Figure: React.FC<{
  outfit: Outfit; pose?: FigurePose; mood?: Mood;
  position?: [number, number, number]; rotationY?: number; scale?: number;
}> = ({ outfit: o, pose = STAND, mood = "smile", position = [0, 0, 0], rotationY = 0, scale = 1 }) => {
  const bob = pose.bob ?? 0;
  const sitDrop = pose.sit ? -0.4 : 0;
  return (
    <group position={position} rotation={[0, rotationY, 0]} scale={scale}>
      <group position={[0, bob + sitDrop, 0]}>
        <Leg side={-1} swing={pose.legL} color={o.legs} sit={pose.sit} />
        <Leg side={1} swing={pose.legR} color={o.legs} sit={pose.sit} />
        {/* hips */}
        <mesh geometry={roundedBox(0.62, 0.12, 0.3, 0.02)} material={plastic(o.legs)} position={[0, 0.58, 0]} castShadow />
        {/* torso */}
        <mesh geometry={torsoGeo()} material={plastic(o.coat ? "#fbfbf8" : o.shirt)} position={[0, 0.89, 0]} castShadow receiveShadow />
        {o.coat && (
          <>
            {/* scrub shirt V + coat lapels */}
            <mesh geometry={roundedBox(0.16, 0.2, 0.02, 0.008)} material={plastic(o.shirt)} position={[0, 1.02, 0.158]} />
            <mesh geometry={roundedBox(0.05, 0.42, 0.02, 0.008)} material={plastic("#e3e6ea")} position={[-0.11, 0.9, 0.162]} rotation={[0, 0, -0.08]} />
            <mesh geometry={roundedBox(0.05, 0.42, 0.02, 0.008)} material={plastic("#e3e6ea")} position={[0.11, 0.9, 0.162]} rotation={[0, 0, 0.08]} />
            <mesh geometry={roundedBox(0.09, 0.05, 0.02, 0.008)} material={plastic("#5b8def")} position={[0.17, 0.98, 0.16]} />
          </>
        )}
        {o.tie && (
          <>
            <mesh geometry={roundedBox(0.16, 0.05, 0.02, 0.01)} material={plastic("#ffffff")} position={[0, 1.12, 0.15]} />
            <mesh geometry={roundedBox(0.06, 0.28, 0.02, 0.01)} material={plastic(o.tie)} position={[0, 0.96, 0.158]} />
          </>
        )}
        {o.stethoscope && (
          <group position={[0, 1.08, 0.12]}>
            <mesh geometry={torusArc(0.13, 0.014, Math.PI)} material={plastic("#3b4a66")} rotation={[0.2, 0, Math.PI]} />
            <mesh geometry={cyl(0.035, 0.02)} material={metal()} position={[0.12, -0.2, 0.045]} rotation={[Math.PI / 2, 0, 0]} />
            <mesh geometry={capsule(0.012, 0.16)} material={plastic("#3b4a66")} position={[0.125, -0.1, 0.04]} />
          </group>
        )}
        <Arm side={-1} swing={pose.armL} spread={pose.armSpreadL ?? 0} color={o.shirt} coat={o.coat} />
        <Arm side={1} swing={pose.armR} spread={pose.armSpreadR ?? 0} color={o.shirt} coat={o.coat} />
        {/* neck + head */}
        <mesh geometry={cyl(0.085, 0.05)} material={plastic(SKIN)} position={[0, 1.16, 0]} />
        <group position={[0, 1.34, 0]} rotation={[pose.headTilt ?? 0, pose.headYaw ?? 0, 0]}>
          <mesh geometry={headGeo()} material={plastic(SKIN)} castShadow />
          <Face mood={mood} blink={pose.blink} />
          {o.glasses && (
            <group position={[0, 0.035, 0.19]}>
              {[-1, 1].map((s) => <mesh key={s} geometry={torusArc(0.038, 0.007, Math.PI * 2)} material={ink()} position={[s * 0.065, 0, 0]} />)}
              <mesh geometry={roundedBox(0.05, 0.008, 0.008, 0.003)} material={ink()} />
            </group>
          )}
          <Hair o={o} />
        </group>
      </group>
    </group>
  );
};

/** Shared walk cycle: legs swing from the hips, arms counter-swing. */
export const walkPose = (t: number, cycle = 0.62): FigurePose => {
  const ph = (t / cycle) * Math.PI * 2;
  const s = Math.sin(ph);
  return {
    legL: 0.55 * s, legR: -0.55 * s, armL: -0.5 * s, armR: 0.5 * s,
    bob: 0.02 * Math.abs(Math.cos(ph)), headTilt: 0.03 * Math.sin(ph * 2),
  };
};
/** Distance covered per cycle so the planted foot barely slides: 2 strides of 2*L*sin(amp). */
export const walkSpeed = (cycle = 0.62) => (2 * 2 * 0.52 * Math.sin(0.55)) / cycle;
export const WALK_SPEED = walkSpeed();

/** Natural blinking: deterministic schedule from a seed. */
export const isBlinking = (t: number, seed = 0) => {
  const period = 2.7 + (seed % 3) * 0.4;
  const ph = (t + seed * 0.77) % period;
  return ph > period - 0.12;
};
