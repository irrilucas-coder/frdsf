// One shared walk cycle drives hips, knees, feet, shoulders and elbows.
//
// No foot sliding: a planted foot has a fixed WORLD x for its whole stance,
// and the camera maps world -> screen with the same rounding for the floor,
// the props and the feet, so a planted foot moves exactly with the floor.
// The body pose advances in sprite steps (every SPRITE_HOLD frames) while the
// hip glides continuously; knees are solved with 2-bone IK so the legs flex to
// keep the planted foot where it is.

export const FPS = 60;
export const DURATION = 300; // 5 s
export const CANVAS_W = 180;
export const CANVAS_H = 320;
export const FLOOR_Y = 246; // y of the shoe soles

export const SPRITE_HOLD = 5; // pose updates at 12 fps, like a sprite sheet
export const CYCLE = 40; // frames per full cycle (two steps)
export const SPEED = 0.6; // canvas px per frame
export const START_X = 60; // world x of the hip at frame 0
export const STEP_LEN = (SPEED * CYCLE) / 2; // foot travel during one stance

export const THIGH = 14;
export const SHIN = 14;
export const UPPER_ARM = 10;
export const FOREARM = 9;
const ANKLE_UP = 3; // ankle height above the sole
const HIP_HEIGHT = 26 + ANKLE_UP;

export type Vec = { x: number; y: number };
export type Leg = { hip: Vec; knee: Vec; ankle: Vec; lift: number };
export type Arm = { shoulder: Vec; elbow: Vec; wrist: Vec };
export type Pose = {
  hip: Vec;
  bob: number;
  phase: number;
  steps: number;
  nearLeg: Leg;
  farLeg: Leg;
  nearArm: Arm; // carries the paper stack
  farArm: Arm; // swings freely
};

export const spriteTime = (frame: number) => Math.floor(frame / SPRITE_HOLD) * SPRITE_HOLD;
export const hipWorldX = (frame: number) => START_X + SPEED * frame;

/** Foot world x and lift for a leg whose cycle is offset by `offset` (0 or 0.5). */
function foot(ts: number, offset: number) {
  const u = ts / CYCLE + offset;
  const n = Math.floor(u);
  const p = u - n;
  // Planted when p = 0, half a stride ahead of the hip.
  const plant = START_X + SPEED * (n - offset) * CYCLE + STEP_LEN / 2;
  if (p < 0.5) return { x: plant, lift: 0 };
  const s = (p - 0.5) / 0.5;
  const e = s * s * (3 - 2 * s);
  return { x: plant + SPEED * CYCLE * e, lift: Math.round(4 * Math.sin(Math.PI * s)) };
}

/** Two-bone IK; the joint bends towards +x (forward) when `forward` is true. */
function ik(a: Vec, b: Vec, l1: number, l2: number, forward: boolean): Vec {
  const dx = b.x - a.x, dy = b.y - a.y;
  const d = Math.min(Math.hypot(dx, dy), l1 + l2 - 0.001);
  const base = Math.atan2(dy, dx);
  const ang = Math.acos(Math.max(-1, Math.min(1, (l1 * l1 + d * d - l2 * l2) / (2 * l1 * d))));
  const k1 = { x: a.x + l1 * Math.cos(base - ang), y: a.y + l1 * Math.sin(base - ang) };
  const k2 = { x: a.x + l1 * Math.cos(base + ang), y: a.y + l1 * Math.sin(base + ang) };
  return (k1.x > k2.x) === forward ? k1 : k2;
}

/** Point at `len` from `o` along an angle measured from straight down (+ = forward). */
const limb = (o: Vec, deg: number, len: number): Vec => ({
  x: o.x + len * Math.sin((deg * Math.PI) / 180),
  y: o.y + len * Math.cos((deg * Math.PI) / 180),
});

export function poseAt(frame: number): Pose {
  const ts = spriteTime(frame);
  const phase = (ts / CYCLE) % 1;
  const bob = Math.floor((Math.cos(phase * 4 * Math.PI) + 1) / 2 + 0.25); // 1px down at each contact
  const hip = { x: hipWorldX(frame), y: FLOOR_Y - HIP_HEIGHT + bob };

  const leg = (offset: number): Leg => {
    const f = foot(ts, offset);
    const ankle = { x: f.x, y: FLOOR_Y - ANKLE_UP - f.lift };
    return { hip, knee: ik(hip, ankle, THIGH, SHIN, true), ankle, lift: f.lift };
  };

  const shoulder = { x: hip.x + 1, y: hip.y - 18 };
  const w = Math.cos(phase * 2 * Math.PI);
  // Far arm swings opposite to the far leg; elbow bends more on the forward swing.
  const farUpper = 24 * w;
  const farElbow = limb(shoulder, farUpper, UPPER_ARM);
  const farArm = { shoulder, elbow: farElbow, wrist: limb(farElbow, farUpper + 14 + 16 * Math.max(0, w), FOREARM) };
  // Near arm carries the papers: small shoulder swing, elbow keeps the forearm level.
  const nearUpper = -4 * w;
  const nearElbow = limb(shoulder, nearUpper, UPPER_ARM);
  const nearArm = { shoulder, elbow: nearElbow, wrist: limb(nearElbow, 90 + Math.round(2 * w), FOREARM) };

  return {
    hip, bob, phase,
    steps: Math.floor(ts / (CYCLE / 2)),
    nearLeg: leg(0), farLeg: leg(0.5),
    nearArm, farArm,
  };
}

/** Camera: a smooth exponential follow of the hip (closed form, deterministic). */
const LAG = 20;
export const cameraX = (frame: number) =>
  START_X - 62 + SPEED * frame - SPEED * LAG * (1 - Math.exp(-frame / LAG));
