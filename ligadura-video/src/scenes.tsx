import * as THREE from "three";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { BrickWall, Brick, Floor, backOut, clamp01, easeInOut, easeOut, geo, lerp, plastic } from "./three/core";
import { DOCTOR, Figure, PATIENT, STAND, isBlinking, walkPose, walkSpeed, type FigurePose } from "./three/Figure";
import { Layered } from "./three/Layered";
import {
  Bench, Calendar, Chair, CrossPoster, DeskClock, Donut, Door, ExamTable, FruitBowl, Gauge, Glass,
  PAL, Plant, RedX, Scalpel, Shield, Sparkles, Syringe, WindowBox,
} from "./three/props";
import TL from "./timeline.json";

type V3 = [number, number, number];
const useT = () => { const f = useCurrentFrame(); const { fps } = useVideoConfig(); return f / fps; };
const sceneFrom = (id: string) => TL.scenes.find((s) => s.id === id)!.from;
const ev = (k: keyof typeof TL.events, scene: string) => TL.events[k] - sceneFrom(scene);
const pop = (t: number, at: number, dur = 0.35) => Math.max(0.001, backOut((t - at) / dur));

// ------------------------------------------------------------------ shared sets
const ClinicWall: React.FC<{ color?: string; span?: [number, number] }> = ({ color = PAL.peach, span = [-6, 6] }) => {
  const items: React.ReactNode[] = [];
  for (let x = span[0]; x <= span[1]; x += 4) {
    items.push(<WindowBox key={`w${x}`} position={[x, 1.9, -2.15]} />);
    items.push(<CrossPoster key={`p${x}`} position={[x + 1.5, 1.7, -2.17]} />);
    items.push(<Door key={`d${x}`} position={[x + 2.7, 0, -2.16]} color={PAL.mintDeep} />);
  }
  return (
    <>
      <BrickWall color={color} z={-2.2} width={60} />
      <mesh position={[0, 0.06, -2.18]} geometry={geo("baseboard", () => new THREE.BoxGeometry(60, 0.12, 0.05))} material={plastic(PAL.mintDeep)} />
      {items}
    </>
  );
};

// ------------------------------------------------------------------ 1. hook
export const SceneHook: React.FC = () => {
  const t = useT();
  const xT = TL.events.scalpelX;
  const k = easeInOut(t / 5.3);
  const cam = { pos: [lerp(1.9, 1.3, k), lerp(1.0, 0.85, k), lerp(3.6, 2.8, k)] as V3, look: [0.25, 0.75, 0] as V3, fov: 36 };
  const sweatY = 1.42 - ((t * 0.5) % 0.25);
  const shake = Math.sin(t * 9) * 0.06;
  const scalpelIn = easeOut((t - (xT - 0.45)) / 0.45);
  const second = TL.labels[2].t;
  const xPulse = t > second ? 1 + 0.15 * Math.exp(-(t - second) * 6) : 1;
  return (
    <Layered
      cam={cam}
      bg={<ClinicWall color={PAL.peach} />}
      fg={<>
        <Floor />
        <Donut position={[0, 0, 0]} />
        <Figure outfit={PATIENT} position={[0, 0.2, 0]} rotationY={0.35}
          pose={{ ...STAND, sit: true, headYaw: shake, armL: 0.5, armR: 0.5, blink: isBlinking(t) }} mood="worried" />
        <mesh geometry={geo("drop", () => new THREE.SphereGeometry(0.035, 16, 12))} material={plastic(PAL.sky)}
          position={[0.28, sweatY - 0.4 + 0.2, 0.18]} scale={[1, 1.4, 1]} />
        {t > xT - 0.45 && (
          <group position={[lerp(2.6, 0.95, scalpelIn), 0.95, 0.45]} rotation={[0.2, -0.4, lerp(2, -0.35, scalpelIn)]} scale={0.7}>
            <Scalpel position={[-0.4, 0, 0]} />
          </group>
        )}
        {t > xT && <RedX position={[1.0, 0.95, 0.6]} rotation={[0, -0.35, 0]} scale={pop(t, xT, 0.3) * 0.75 * xPulse} />}
      </>}
    />
  );
};

// ------------------------------------------------------------------ 2. doctor walks in
export const SceneDoctor: React.FC = () => {
  const t = useT();
  const cycle = 0.78;
  const x = -2.6 + walkSpeed(cycle) * t;
  const chip = TL.labels[4].t - sceneFrom("doctor");
  const look = clamp01((t - chip) / 0.4) * (1 - clamp01((t - chip - 2.6) / 0.4));
  const pose: FigurePose = { ...walkPose(t, cycle), headYaw: -0.85 * look, blink: isBlinking(t, 2) };
  const cam = { pos: [x + 1.7, 0.75, 2.9] as V3, look: [x + 0.35, 0.95, 0] as V3, fov: 38 };
  const props: React.ReactNode[] = [];
  for (let i = -1; i < 6; i++) {
    const px = i * 3.2;
    props.push(<Bench key={`b${i}`} position={[px, 0, -1.5]} />);
    props.push(<Plant key={`p${i}`} position={[px + 1.6, 0, -1.55]} />);
  }
  return (
    <Layered cam={cam} bg={<ClinicWall color={PAL.mint} span={[-6, 20]} />}
      fg={<>
        <Floor />
        {props}
        <Figure outfit={DOCTOR} position={[x, 0, 0]} rotationY={Math.PI / 2} pose={pose} mood={look > 0.5 ? "happy" : "smile"} />
      </>}
    />
  );
};

// ------------------------------------------------------------------ 3. band diagram (non-graphic toy model)
const WALL_Z = -0.3;
const TissueModel: React.FC<{ t: number }> = ({ t }) => {
  const slide = ev("bandSlide", "band"), snap = ev("bandSnap", "band"), stop = ev("flowStop", "band");
  const shrink0 = ev("shrinkStart", "band"), detach = ev("detach", "band");
  // band: rides in on the applicator, slides to the base, then snaps tight
  const s1 = easeInOut((t - (slide - 1.0)) / 1.0);
  const s2 = easeInOut((t - slide) / (snap - slide));
  const bandZ = lerp(1.6, 0.85, s1) + (-0.95) * s2;
  const snapK = backOut((t - snap) / 0.25);
  const bandR = t < snap ? 0.48 : lerp(0.48, 0.235, snapK);
  // tissue: pulsing red while blood flows, then dims and shrinks
  const flow = 1 - clamp01((t - stop) / 0.8);
  const pulse = 1 + 0.035 * Math.sin(t * 7) * flow;
  const shrink = 1 - 0.55 * easeInOut((t - shrink0) / (detach - shrink0 - 0.15));
  const dimStep = Math.round((1 - flow) * 6) / 6;
  const domeColor = new THREE.Color(PAL.pinkDeep).lerp(new THREE.Color("#c48aa0"), dimStep).getHexString();
  // detach: falls off and bounces on the table
  const d = t - detach;
  const fall = d > 0 ? Math.min(1.12, 0.5 * 9.8 * d * d * 0.35) : 0;
  const bounce = d > 0.75 ? Math.abs(Math.sin((d - 0.75) * 9)) * 0.12 * Math.exp(-(d - 0.75) * 4) : 0;
  const curve = geo("vessel", () => new THREE.CatmullRomCurve3([
    new THREE.Vector3(-1.5, 0.6, WALL_Z + 0.06), new THREE.Vector3(-0.8, 0.75, WALL_Z + 0.08),
    new THREE.Vector3(-0.3, 1.05, WALL_Z + 0.1), new THREE.Vector3(0, 1.25, WALL_Z + 0.12),
  ]) as unknown as THREE.BufferGeometry) as unknown as THREE.CatmullRomCurve3;
  const tube = geo("vesselTube", () => new THREE.TubeGeometry(curve, 48, 0.06, 12, false));
  const bricks: React.ReactNode[] = [];
  for (let r = 0; r < 8; r++) for (let c = -3; c <= 3; c++) {
    const off = r % 2 ? 0.2 : 0;
    bricks.push(<Brick key={`${r}-${c}`} w={2} d={1} h={1} color={(r + c) % 3 === 0 ? PAL.pink : "#ff9cbf"}
      position={[c * 0.4 + off, 0.42 + r * 0.24, WALL_Z - 0.1]} studs={r === 7} />);
  }
  return (
    <group>
      {/* table */}
      <mesh geometry={geo("tableTop", () => new THREE.BoxGeometry(4.4, 0.16, 2.2))} material={plastic(PAL.cream)} position={[0, 0.22, 0.2]} receiveShadow castShadow />
      {bricks}
      <mesh geometry={tube} material={plastic(flow > 0.3 ? "#ff3355" : "#b98a96", { transparent: 0.85 })} castShadow />
      {Array.from({ length: 9 }, (_, i) => {
        const u = ((Math.min(t, stop) * 0.45 + i / 9) % 1);
        const p = curve.getPointAt(u);
        return <mesh key={i} geometry={geo("cell", () => new THREE.SphereGeometry(0.045, 12, 8))}
          material={plastic("#ff1f3d", { emissive: "#ff1f3d" })} position={[p.x, p.y, p.z + 0.02]} scale={Math.max(0.001, flow)} />;
      })}
      {/* dome + band move together once it detaches */}
      <group position={[0, 1.25 - fall + bounce, d > 0 ? Math.min(0.6, d * 0.8) : 0]} rotation={[d > 0 ? Math.min(1.6, d * 2.2) : 0, 0, d > 0 ? -d * 0.8 : 0]}>
        <group scale={shrink * pulse}>
          <mesh geometry={geo("neck", () => new THREE.CylinderGeometry(0.2, 0.24, 0.4, 32))} material={plastic(`#${domeColor}`)} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -0.08]} />
          <mesh geometry={geo("dome", () => new THREE.SphereGeometry(0.42, 48, 32))} material={plastic(`#${domeColor}`)} position={[0, 0, 0.3]} castShadow />
        </group>
        {t > slide - 1.0 && (
          <mesh geometry={(() => { const r = Math.round(bandR * (d > 0 ? shrink : 1) * 100) / 100; return geo(`band-${r}`, () => new THREE.TorusGeometry(r, 0.055, 20, 64)); })()}
            material={plastic(PAL.green)} position={[0, 0, d > 0 ? -0.05 : bandZ]} castShadow />
        )}
      </group>
      {/* applicator tube comes in with the band and leaves after placing it */}
      {t > slide - 1.2 && t < snap + 1.2 && (
        <mesh geometry={geo("applicator", () => new THREE.CylinderGeometry(0.5, 0.5, 1.6, 40, 1, true))}
          material={plastic("#dfe7ef", { transparent: 0.55 })} rotation={[Math.PI / 2, 0, 0]}
          position={[0, 1.25, lerp(2.6, 1.55, s1) + clamp01((t - snap) / 1.0) * 1.5]} />
      )}
      <Sparkles t={d - 0.05} origin={[0, 1.25, 0]} />
    </group>
  );
};

export const SceneBand: React.FC = () => {
  const t = useT();
  const k = easeInOut(t / 11.9);
  const cam = { pos: [lerp(2.7, 2.3, k), lerp(1.6, 1.45, k), lerp(1.5, 2.0, k)] as V3, look: [0, 1.1, 0] as V3, fov: 36 };
  return (
    <Layered cam={cam} sky="#d9fff1"
      bg={<><BrickWall color={PAL.mint} z={-2.6} /><WindowBox position={[-1.6, 2.3, -2.55]} /><Plant position={[2.0, 0, -2.2]} scale={1.3} /></>}
      fg={<><Floor /><TissueModel t={t} /></>}
    />
  );
};

// ------------------------------------------------------------------ 4. clinic: minutes, no anaesthesia
export const SceneClinic: React.FC = () => {
  const t = useT();
  const fast = TL.labels[12].t - sceneFrom("clinic");
  const anest = TL.labels[13].t - sceneFrom("clinic");
  const spin = t < fast ? t * 1.2 : fast * 1.2 + (t - fast) * 14;
  const k = easeInOut(t / 6.5);
  const cam = { pos: [lerp(-1.0, 0.6, k), 0.95, lerp(4.0, 3.6, k)] as V3, look: [0.2, 0.95, 0] as V3, fov: 38 };
  const wave = Math.sin(t * 6) * 0.4;
  return (
    <Layered cam={cam} bg={<ClinicWall color={PAL.peach} span={[-6, 6]} />}
      fg={<>
        <Floor />
        <ExamTable position={[-0.9, 0, -0.6]} />
        <Figure outfit={DOCTOR} position={[0.75, 0, 0.2]} rotationY={-0.35} mood="happy"
          pose={{ ...STAND, armR: 2.6, armSpreadR: 0.35 + wave * 0.3, blink: isBlinking(t, 1) }} />
        <Brick w={4} d={3} h={4} color={PAL.mintDeep} position={[1.9, 0.48, -0.9]} />
        <DeskClock spin={spin} position={[1.9, 1.62, -0.85]} scale={0.75} />
        {t > anest && (
          <group position={[-0.5, 1.35, 0.6]} scale={pop(t, anest) * 0.6} rotation={[0, 0.3, 0.2]}>
            <Syringe />
            <RedX scale={0.75} />
          </group>
        )}
        <Chair position={[-2.3, 0, -0.9]} rotation={[0, 0.5, 0]} />
      </>}
    />
  );
};

// ------------------------------------------------------------------ 5. relief: light pressure, back to routine
export const SceneRelief: React.FC = () => {
  const t = useT();
  const pres = TL.labels[14].t - sceneFrom("relief");
  const pain = TL.labels[15].t - sceneFrom("relief");
  const walk0 = ev("walkStart", "relief") - 0.2;
  if (t < walk0) {
    const needle = t < pres - 1.2 ? 0.55 + 0.08 * Math.sin(t * 9) : lerp(0.55, 0.14, easeOut((t - (pres - 1.2)) / 1.2)) + 0.015 * Math.sin(t * 12);
    const k = easeInOut(t / walk0);
    const cam = { pos: [lerp(0.6, 0.2, k), 1.2, lerp(4.2, 3.6, k)] as V3, look: [0.2, 1.05, 0] as V3, fov: 38 };
    return (
      <Layered cam={cam} bg={<ClinicWall color={PAL.mint} />}
        fg={<>
          <Floor />
          <Gauge value={needle} dimRed={t > pain ? 1 : 0} position={[0.55, 1.35, -0.2]} scale={0.85} />
          {t > pain && <RedX position={[1.05, 1.75, 0.05]} scale={pop(t, pain) * 0.3} />}
          <Figure outfit={PATIENT} position={[-0.75, 0, 0.3]} rotationY={0.45} mood={t > pres ? "happy" : "smile"}
            pose={{ ...STAND, blink: isBlinking(t, 3), armR: t > pres ? 2.4 : 0.1, armSpreadR: t > pres ? 0.4 : 0 }} />
        </>}
      />
    );
  }
  const tw = t - walk0;
  const cycle = 0.62;
  const x = -1.5 + walkSpeed(cycle) * tw;
  const cam = { pos: [x + 1.6, 0.7, 2.8] as V3, look: [x + 0.4, 0.95, 0] as V3, fov: 38 };
  const props: React.ReactNode[] = [];
  for (let i = -1; i < 4; i++) {
    props.push(<Plant key={`p${i}`} position={[i * 2.6, 0, -1.5]} />);
    props.push(<Chair key={`c${i}`} position={[i * 2.6 + 1.2, 0, -1.4]} color={PAL.peachDeep} />);
  }
  return (
    <Layered cam={cam} bg={<ClinicWall color={PAL.peach} span={[-6, 14]} />}
      fg={<>
        <Floor />
        {props}
        <Figure outfit={PATIENT} position={[x, 0, 0]} rotationY={Math.PI / 2} mood="happy"
          pose={{ ...walkPose(tw, cycle), headYaw: -0.5, blink: isBlinking(t, 4) }} />
      </>}
    />
  );
};

// ------------------------------------------------------------------ 6. prevention checklist
export const ScenePrevent: React.FC = () => {
  const t = useT();
  const c = TL.checklist.map((x) => x.t - sceneFrom("prevent"));
  const items = [-1.35, -0.3, 0.75, 1.8];
  let focus = items[0];
  for (let i = 1; i < 4; i++) focus = lerp(focus, items[i], easeInOut((t - (c[i] - 0.5)) / 0.6));
  const back = easeInOut((t - (c[3] + 1.6)) / 1.2); // pull back to see everything
  const cam = { pos: [lerp(focus + 0.9, 0.2, back), lerp(1.55, 1.9, back), lerp(2.6, 4.6, back)] as V3,
    look: [lerp(focus, 0.2, back), 1.0, 0] as V3, fov: 36 };
  const fruitPop = [0, 1, 2, 3, 4].map((i) => pop(t, c[0] + i * 0.1));
  const fill = easeInOut((t - c[1]) / 1.0);
  const checks = Math.min(9, Math.max(0, Math.floor((t - c[2]) / 0.14) + 1));
  return (
    <Layered cam={cam} sky="#fff0e6" bg={<><BrickWall color={PAL.peach} z={-2.4} /><WindowBox position={[0.2, 2.3, -2.35]} w={2.2} /></>}
      fg={<>
        <Floor />
        <mesh geometry={geo("ktable", () => new THREE.BoxGeometry(4.6, 0.14, 1.4))} material={plastic(PAL.wood)} position={[0.2, 0.62, 0]} receiveShadow castShadow />
        {[[-1.9, -0.5], [2.3, -0.5], [-1.9, 0.5], [2.3, 0.5]].map(([x, z], i) => (
          <Brick key={i} w={1} d={1} h={2.3} color={PAL.woodDark} position={[x, 0.27, z]} studs={false} />
        ))}
        <Figure outfit={PATIENT} position={[0.2, 0, -1.2]} mood="happy" pose={{ ...STAND, blink: isBlinking(t, 5) }} />
        <FruitBowl position={[items[0], 0.2, 0.1]} pop={fruitPop} scale={0.9} />
        <Glass position={[items[1], 0.69, 0.1]} fill={fill} />
        <Calendar position={[items[2], 1.2, 0.0]} rotation={[-0.1, -0.15, 0]} checks={t > c[2] ? checks : 0} scale={0.8} />
        {t > c[3] && <Shield position={[items[3], 1.25, 0.1]} rotation={[0, -0.3, 0]} scale={pop(t, c[3]) * 0.7} />}
        <Sparkles t={t - c[3]} origin={[items[3], 1.25, 0.3]} color={PAL.sky} />
      </>}
    />
  );
};

// ------------------------------------------------------------------ 7. final
export const SceneFinal: React.FC = () => {
  const t = useT();
  const cheer = TL.labels[20].t - sceneFrom("final");
  const k = easeInOut(t / 12);
  const cam = { pos: [lerp(0.9, 0.3, k), lerp(0.95, 1.05, k), lerp(4.2, 3.4, k)] as V3, look: [0, 0.95, 0] as V3, fov: 36 };
  const up = t > cheer ? Math.abs(Math.sin((t - cheer) * 5)) * 0.12 * Math.exp(-(t - cheer) * 0.6) : 0;
  return (
    <Layered cam={cam} bg={<ClinicWall color={PAL.mint} />}
      fg={<>
        <Floor />
        <Plant position={[-1.8, 0, -1.0]} scale={1.2} />
        <Plant position={[1.9, 0, -1.1]} scale={1.1} />
        <Figure outfit={DOCTOR} position={[-0.5, 0, 0]} rotationY={0.35} mood="happy"
          pose={{ ...STAND, armR: 0.9, blink: isBlinking(t, 6) }} />
        <Figure outfit={PATIENT} position={[0.55, up, 0.15]} rotationY={-0.3} mood={t > cheer ? "wow" : "happy"}
          pose={{ ...STAND, armL: t > cheer ? 2.9 : 0.1, armR: t > cheer ? 2.9 : 0.1, armSpreadL: t > cheer ? 0.3 : 0, armSpreadR: t > cheer ? 0.3 : 0, blink: isBlinking(t, 7) }} />
        <Sparkles t={t - cheer} origin={[0.55, 1.8, 0.2]} count={18} />
      </>}
    />
  );
};
