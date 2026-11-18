import { C } from "./palette";
import { Painter, seeded } from "./painter";
import {
  CANVAS_H, CANVAS_W, DURATION, FLOOR_Y, FPS, SPRITE_HOLD,
  cameraX, poseAt, spriteTime, type Arm, type Leg, type Vec,
} from "./walk";

export const SLIP_FRAME = Math.round(2.7 * FPS); // 162
const WALL_TOP = 54;
const BASEBOARD_Y = 232;
const STACK = 6; // sheets carried at the start

// ------------------------------------------------------------------ background
function drawWall(p: Painter, cam: number) {
  p.rect(0, WALL_TOP, CANVAS_W, BASEBOARD_Y - WALL_TOP, C.wall);
  // ceiling strip with lights (world-anchored so it scrolls)
  p.rect(0, WALL_TOP, CANVAS_W, 6, C.mist);
  p.rect(0, WALL_TOP + 6, CANVAS_W, 1, C.steel);
  for (let wx = Math.floor(cam / 60) * 60; wx < cam + CANVAS_W + 60; wx += 60) {
    const sx = Math.round(wx - cam);
    p.rect(sx + 10, WALL_TOP + 1, 22, 3, C.white);
    p.rect(sx + 12, WALL_TOP + 4, 18, 1, C.gold);
  }
  // seeded wall speckle, tiled every 64 world px
  const rnd = seeded(7);
  const specks = Array.from({ length: 14 }, () => [Math.floor(rnd() * 64), WALL_TOP + 10 + Math.floor(rnd() * 120)]);
  for (let tile = Math.floor(cam / 64) * 64; tile < cam + CANVAS_W; tile += 64)
    for (const [x, y] of specks) p.px(Math.round(tile + x - cam), y, C.wallShade);
  // wainscot + baseboard
  p.rect(0, 196, CANVAS_W, BASEBOARD_Y - 196, C.wainscot);
  p.rect(0, 196, CANVAS_W, 2, C.woodLight);
  for (let wx = Math.floor(cam / 24) * 24; wx < cam + CANVAS_W + 24; wx += 24)
    p.rect(Math.round(wx - cam), 200, 1, BASEBOARD_Y - 202, C.wainscotDark);
  p.rect(0, BASEBOARD_Y - 3, CANVAS_W, 3, C.wainscotDark);
}

function drawFloor(p: Painter, cam: number) {
  p.rect(0, BASEBOARD_Y, CANVAS_W, CANVAS_H - BASEBOARD_Y, C.floorA);
  const rows = [BASEBOARD_Y, 238, 246, 256, 268, 282];
  rows.forEach((y, i) => {
    const h = (rows[i + 1] ?? CANVAS_H) - y;
    const size = 12 + i * 4; // tiles get bigger towards the viewer
    for (let wx = Math.floor(cam / size) * size; wx < cam + CANVAS_W + size; wx += size) {
      const sx = Math.round(wx - cam);
      if ((Math.round(wx / size) + i) % 2 === 0) p.rect(sx, y, size, h, C.floorB);
      p.rect(sx, y, 1, h, C.floorLine);
    }
    p.rect(0, y, CANVAS_W, 1, C.floorLine);
  });
}

function desk(p: Painter, sx: number, frame: number, seed: number) {
  const top = 202;
  // chair back peeking behind
  p.rect(sx + 24, 188, 12, 14, C.slate);
  p.rect(sx + 25, 189, 10, 2, C.steel);
  // desk
  p.rect(sx, top, 44, 4, C.wood);
  p.rect(sx, top, 44, 1, C.woodLight);
  p.rect(sx + 2, top + 4, 3, BASEBOARD_Y - top - 2, C.woodDark);
  p.rect(sx + 39, top + 4, 3, BASEBOARD_Y - top - 2, C.woodDark);
  p.rect(sx + 30, top + 4, 12, 14, C.woodDark);
  p.rect(sx + 32, top + 9, 8, 1, C.gold);
  // monitor
  p.rect(sx + 6, top - 18, 18, 13, C.ink);
  const glow = (spriteTime(frame) / SPRITE_HOLD + seed) % 6 < 3;
  p.rect(sx + 7, top - 17, 16, 11, glow ? C.screen : C.screenDark);
  for (let i = 0; i < 4; i++) p.rect(sx + 9, top - 15 + i * 2, 6 + ((i * 5 + seed) % 7), 1, C.screenDark);
  p.rect(sx + 13, top - 5, 4, 3, C.slate);
  p.rect(sx + 10, top - 2, 10, 2, C.slate);
  // keyboard + mug
  p.rect(sx + 5, top - 1, 14, 1, C.mist);
  p.rect(sx + 26, top - 5, 4, 5, C.white);
  p.px(sx + 30, top - 4, C.white);
  p.px(sx + 27, top - 4, C.red);
}

function windowSunset(p: Painter, sx: number, cam: number) {
  const x = sx, y = 78, w = 48, h = 72;
  p.rect(x - 3, y - 3, w + 6, h + 6, C.woodDark);
  const bands = [C.skyTop, C.skyMid, C.skyLow, C.skyHorizon];
  bands.forEach((c, i) => p.rect(x, y + (i * h) / 5, w, h / 5 + 1, c));
  p.rect(x, y + (4 * h) / 5, w, h / 5, C.skyHorizon);
  // sun sitting on the horizon (inside window, slight parallax)
  const ctx = p.ctx;
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  const par = Math.round(cam * 0.35);
  p.disc(x + 30 - Math.round(par * 0.2), y + 52, 9, C.sun);
  // distant skyline
  const rnd = seeded(21);
  let bx = -40;
  while (bx < 140) {
    const bw = 6 + Math.floor(rnd() * 8), bh = 10 + Math.floor(rnd() * 22);
    const px = x + bx + par - 20;
    p.rect(px, y + h - bh, bw, bh, C.city);
    for (let wy = y + h - bh + 2; wy < y + h - 2; wy += 4)
      for (let wx = px + 1; wx < px + bw - 1; wx += 3) if (rnd() > 0.55) p.px(wx, wy, C.cityLight);
    bx += bw + 1;
  }
  ctx.restore();
  // mullions + sill
  p.rect(x + w / 2 - 1, y, 2, h, C.woodDark);
  p.rect(x, y + h / 2 - 1, w, 2, C.woodDark);
  p.rect(x - 5, y + h + 2, w + 10, 3, C.woodLight);
}

function plant(p: Painter, sx: number, frame: number) {
  const sway = Math.round(Math.sin(spriteTime(frame) / 30));
  p.rect(sx, 214, 14, 18, C.pot);
  p.rect(sx, 214, 14, 3, C.potDark);
  p.rect(sx + 2, 229, 10, 3, C.potDark);
  const leaves: [number, number, string][] = [
    [6, 200, C.greenDark], [2, 204, C.green], [10, 203, C.green], [0, 209, C.greenDark],
    [12, 208, C.greenDark], [5, 195, C.greenLight], [8, 190, C.green], [3, 186, C.greenDark], [9, 182, C.greenLight],
  ];
  for (const [lx, ly, c] of leaves) p.rect(sx + lx + (ly < 196 ? sway : 0), ly, 5, 6, c);
  p.rect(sx + 7, 190, 1, 24, C.greenDark);
}

function whiteboard(p: Painter, sx: number) {
  const x = sx, y = 98, w = 54, h = 40;
  p.rect(x - 2, y - 2, w + 4, h + 4, C.steel);
  p.rect(x, y, w, h, C.white);
  const bars = [[8, C.red], [14, C.gold], [20, C.green], [28, C.screen]] as const;
  bars.forEach(([bh, c], i) => p.rect(x + 6 + i * 9, y + h - 6 - bh, 6, bh, c));
  p.rect(x + 4, y + h - 6, 40, 1, C.ink);
  p.rect(x + 4, y + 5, 1, h - 10, C.ink);
  p.line(x + 8, y + 22, x + 46, y + 6, C.navy);
  p.line(x + 46, y + 6, x + 42, y + 6, C.navy);
  p.line(x + 46, y + 6, x + 46, y + 10, C.navy);
  p.rect(x + 8, y + h + 2, 38, 2, C.slate);
  p.rect(x + 12, y + h + 1, 5, 1, C.red);
  p.rect(x + 20, y + h + 1, 5, 1, C.navy);
}

function clock(p: Painter, sx: number, frame: number) {
  const cx = sx, cy = 92;
  p.disc(cx, cy, 10, C.ink);
  p.disc(cx, cy, 8, C.white);
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    p.px(Math.round(cx + 7 * Math.sin(a)), Math.round(cy - 7 * Math.cos(a)), i % 3 === 0 ? C.ink : C.steel);
  }
  const t = spriteTime(frame);
  const m = (t / DURATION) * Math.PI * 2 * 1.5, hh = m / 12 + 1.2;
  p.line(cx, cy, cx + 3 * Math.sin(hh), cy - 3 * Math.cos(hh), C.ink);
  p.line(cx, cy, cx + 6 * Math.sin(m), cy - 6 * Math.cos(m), C.red);
  p.px(cx, cy, C.ink);
}

function cooler(p: Painter, sx: number, frame: number) {
  p.rect(sx, 196, 16, 36, C.mist);
  p.rect(sx, 196, 16, 2, C.white);
  p.rect(sx + 2, 204, 12, 10, C.steel);
  p.rect(sx + 5, 206, 2, 3, C.red);
  p.rect(sx + 9, 206, 2, 3, C.water);
  p.rect(sx + 3, 170, 10, 26, C.water);
  p.rect(sx + 5, 168, 6, 3, C.water);
  p.rect(sx + 4, 172, 2, 20, C.waterLight);
  const t = spriteTime(frame) / SPRITE_HOLD;
  for (let i = 0; i < 3; i++) {
    const by = 194 - ((t * 2 + i * 8) % 24);
    p.px(sx + 7 + (i % 2) * 2, by, C.white);
  }
}

// World layout (x in world px). Everything is placed once, nothing is random.
const PROPS: { x: number; draw: (p: Painter, sx: number, cam: number, f: number) => void }[] = [
  { x: -6, draw: (p, sx, _c, f) => desk(p, sx, f, 1) },
  { x: 48, draw: (p, sx, c) => windowSunset(p, sx, c) },
  { x: 108, draw: (p, sx, _c, f) => plant(p, sx, f) },
  { x: 128, draw: (p, sx, _c, f) => desk(p, sx, f, 3) },
  { x: 186, draw: (p, sx) => whiteboard(p, sx) },
  { x: 262, draw: (p, sx, _c, f) => clock(p, sx, f) },
  { x: 250, draw: (p, sx, _c, f) => desk(p, sx, f, 5) },
  { x: 306, draw: (p, sx, _c, f) => cooler(p, sx, f) },
  { x: 330, draw: (p, sx, _c, f) => plant(p, sx, f) },
];

// ------------------------------------------------------------------ character
const toScreen = (v: Vec, cam: number) => ({ x: Math.round(v.x - cam), y: Math.round(v.y) });

function drawLeg(p: Painter, leg: Leg, cam: number, far: boolean) {
  const h = toScreen(leg.hip, cam), k = toScreen(leg.knee, cam), a = toScreen(leg.ankle, cam);
  const cloth = far ? C.trousersShade : C.trousers;
  p.line(h.x, h.y, k.x, k.y, cloth, 4);
  p.line(k.x, k.y, a.x, a.y, cloth, 4);
  // shoe: heel under the ankle, toe forward; toe lifts a pixel while swinging
  const sy = a.y + 1;
  p.rect(a.x - 2, sy, 7, 2, far ? C.black : C.shoe);
  p.rect(a.x + 3, sy - (leg.lift > 0 ? 1 : 0), 2, 1, far ? C.black : C.shoe);
  if (!far) p.px(a.x + 3, sy, C.shoeShine);
}

function drawArm(p: Painter, arm: Arm, cam: number, far: boolean) {
  const s = toScreen(arm.shoulder, cam), e = toScreen(arm.elbow, cam), w = toScreen(arm.wrist, cam);
  p.line(s.x, s.y, e.x, e.y, far ? C.shirtShade : C.shirt, 3);
  p.line(e.x, e.y, w.x, w.y, far ? C.shirtShade : C.shirt, 3);
  p.rect(w.x - 1, w.y - 1, 3, 3, far ? C.skinShade : C.skin);
}

/** Paper stack resting on the near forearm. Returns the world position of the top sheet. */
function drawStack(p: Painter, arm: Arm, cam: number, frame: number, sheets: number) {
  const e = toScreen(arm.elbow, cam), w = toScreen(arm.wrist, cam);
  const baseX = Math.round((e.x + w.x) / 2) - 5, baseY = Math.min(e.y, w.y) - 2;
  for (let i = 0; i < sheets; i++) {
    let dx = (i % 2 === 0 ? 0 : 1);
    // top sheet wobbles just before it slips
    if (i === sheets - 1 && frame >= SLIP_FRAME - 18 && frame < SLIP_FRAME)
      dx += Math.floor(spriteTime(frame) / SPRITE_HOLD) % 2 === 0 ? 1 : -1;
    p.rect(baseX + dx, baseY - i, 12, 1, i % 2 === 0 ? C.paper : C.paperShade);
  }
  p.rect(baseX, baseY - sheets + 1, 1, sheets, C.paperShade);
  // thumb over the stack edge
  p.px(w.x, w.y - 2, C.skin);
  return { x: baseX + cam, y: baseY - sheets + 1 };
}

function drawCharacter(p: Painter, frame: number, cam: number) {
  const pose = poseAt(frame);
  const hip = toScreen(pose.hip, cam);
  // shadow
  p.rect(hip.x - 8, FLOOR_Y, 18, 2, C.floorLine);

  drawArm(p, pose.farArm, cam, true);
  drawLeg(p, pose.farLeg, cam, true);

  // torso
  const top = hip.y - 21;
  p.rect(hip.x - 4, top, 10, 21, C.shirt);
  p.rect(hip.x - 4, top, 2, 21, C.shirtShade);
  p.rect(hip.x - 4, hip.y - 2, 10, 2, C.ink); // belt
  p.px(hip.x + 3, hip.y - 2, C.gold); // buckle
  // collar + tie at the front of the chest
  p.rect(hip.x + 2, top, 4, 2, C.white);
  p.rect(hip.x + 4, top + 2, 2, 9, C.tie);
  p.rect(hip.x + 4, top + 11, 2, 2, C.tieShade);
  p.px(hip.x + 6, top + 4, C.tie);

  drawLeg(p, pose.nearLeg, cam, false);

  // head
  const hx = hip.x - 3, hy = top - 12;
  p.rect(hip.x - 1, top - 2, 4, 2, C.skinShade); // neck
  p.rect(hx, hy, 10, 10, C.skin);
  p.rect(hx + 10, hy + 4, 1, 2, C.skin); // nose
  p.rect(hx - 1, hy - 1, 11, 4, C.hair);
  p.rect(hx - 1, hy + 3, 4, 4, C.hair);
  p.rect(hx - 1, hy - 1, 11, 1, C.hairDark);
  p.rect(hx + 3, hy + 5, 2, 2, C.skinShade); // ear
  p.px(hx + 8, hy + 4, C.ink); // eye
  p.px(hx + 7, hy + 3, C.hairDark); // brow
  const oops = frame >= SLIP_FRAME && frame < SLIP_FRAME + 40;
  p.rect(hx + 7, hy + 7, oops ? 2 : 3, oops ? 2 : 1, oops ? C.ink : C.skinShade); // mouth

  const sheets = frame >= SLIP_FRAME ? STACK - 1 : STACK;
  drawArm(p, pose.nearArm, cam, false);
  return drawStack(p, pose.nearArm, cam, frame, sheets);
}

// ------------------------------------------------------------------ the slipping sheet
let slipOrigin: Vec | null = null;

function sheetAt(frame: number) {
  // origin: top of the stack at the slip frame (recomputed deterministically)
  if (!slipOrigin) {
    const cam = cameraX(SLIP_FRAME);
    const pose = poseAt(SLIP_FRAME);
    const e = toScreen(pose.nearArm.elbow, cam), w = toScreen(pose.nearArm.wrist, cam);
    slipOrigin = { x: Math.round((e.x + w.x) / 2) - 5 + cam, y: Math.min(e.y, w.y) - 2 - STACK + 1 };
  }
  const t = spriteTime(frame - SLIP_FRAME); // flutter in sprite steps too
  const x = slipOrigin.x + 2 - 0.22 * t + 5 * Math.sin(t * 0.09);
  // pops up off the stack, then drifts back and slowly sinks with a flutter
  const y = slipOrigin.y - 26 * (1 - Math.exp(-t / 14)) + 0.12 * t + 2 * Math.sin(t * 0.18);
  return { x, y, state: Math.floor(t / 10) % 4 };
}

// 4-frame flutter sprite: o = outline, # = paper, + = shade, - = printed line
const SHEET_SPRITES: string[][] = [
  ["oooooooooooooo", "o#-----#-----o", "o++++++++++++o", "oooooooooooooo"],
  ["..........oooo", "......oooo##o.", "..oooo#--#+o..", "oo#--#+++oo...", "o++++oooo.....", "oooo.........."],
  ["...oooooo...", "..o#----#o..", ".o#------#o.", ".o+------+o.", "..o++++++o..", "...oooooo..."],
  ["oooo..........", "o##oooo.......", ".o+#--#oooo...", "..oo+++#--#oo.", "....oooo++++o.", "........oooooo"],
];

function drawSheet(p: Painter, frame: number, cam: number) {
  if (frame < SLIP_FRAME) return;
  const s = sheetAt(frame);
  const spr = SHEET_SPRITES[s.state];
  const x = Math.round(s.x - cam), y = Math.round(s.y) - spr.length + 2;
  const col: Record<string, string> = { o: C.ink, "#": C.paper, "+": C.paperShade, "-": C.steel };
  spr.forEach((row, ry) => [...row].forEach((ch, rx) => { if (col[ch]) p.px(x + rx, y + ry, col[ch]); }));
}

// ------------------------------------------------------------------ HUD, sign, crowd
function drawHud(p: Painter, frame: number) {
  p.rect(0, 0, CANVAS_W, 26, C.ink);
  p.rect(0, 25, CANVAS_W, 1, C.slate);
  p.rect(1, 1, CANVAS_W - 2, 1, C.navy);
  p.text("TASKS 3/10", 5, 5, C.white, 1, C.black);
  const steps = String(poseAt(frame).steps).padStart(3, "0");
  p.text("STEPS " + steps, 5, 15, C.gold, 1, C.black);
  // hearts: the third one blinks then empties after the slip
  const lost = frame >= SLIP_FRAME;
  const blink = lost && frame < SLIP_FRAME + 30 && Math.floor((frame - SLIP_FRAME) / 4) % 2 === 0;
  for (let i = 0; i < 3; i++) p.heart(150 + i * 9, 4, i < 2 || !lost || blink);
  // XP bar fills as he walks
  p.text("XP", 98, 15, C.screen, 1, C.black);
  const xp = Math.floor(14 + (spriteTime(frame) / DURATION) * 48);
  p.rect(108, 14, 66, 7, C.black);
  p.rect(109, 15, 64, 5, C.navy);
  p.rect(109, 15, xp, 5, C.gold);
  p.rect(109, 15, xp, 1, C.sun);
  // "-1" floats up from the lost heart
  if (lost && frame < SLIP_FRAME + 70) {
    const t = frame - SLIP_FRAME;
    const visible = t < 50 || Math.floor(t / 4) % 2 === 0;
    if (visible) p.text("-1", 154, 34 - Math.min(14, Math.floor(t / 3)), C.red, 2, C.black);
  }
}

function drawTitleSign(p: Painter, frame: number) {
  const w = 108, x = (CANVAS_W - w) / 2, y = 31;
  p.rect(x + 12, 26, 1, 5, C.steel);
  p.rect(x + w - 13, 26, 1, 5, C.steel);
  p.rect(x, y, w, 17, C.woodDark);
  p.rect(x + 1, y + 1, w - 2, 15, C.wood);
  p.rect(x + 1, y + 1, w - 2, 1, C.woodLight);
  const sparkle = Math.floor(spriteTime(frame) / (SPRITE_HOLD * 3)) % 12;
  p.text("OFFICE QUEST", x + (w - p.textWidth("OFFICE QUEST", 2)) / 2, y + 4, C.gold, 2, C.woodDark);
  p.px(x + 6 + sparkle * 8, y + 3, C.white);
}

type Person = { x: number; row: number; skin: string; hair: string; shirt: string; phase: number };
const CROWD: Person[] = (() => {
  const rnd = seeded(42);
  const skins = [C.skin, C.skinShade, "#8a5a3c", "#f6c9a6"];
  const hairs = [C.hair, C.hairDark, C.black, C.goldDark, C.redDark];
  const shirts = [C.green, C.red, C.screen, C.gold, C.steel, C.skyMid, C.slate, C.pot];
  const people: Person[] = [];
  for (let row = 0; row < 2; row++)
    for (let i = 0; i < 9; i++) {
      people.push({
        x: i * 21 - 4 + (row ? 10 : 0) + Math.floor(rnd() * 4),
        row,
        skin: skins[Math.floor(rnd() * skins.length)],
        hair: hairs[Math.floor(rnd() * hairs.length)],
        shirt: shirts[Math.floor(rnd() * shirts.length)],
        phase: Math.floor(rnd() * 4),
      });
    }
  return people;
})();

function drawCrowd(p: Painter, frame: number) {
  const step = Math.floor(spriteTime(frame) / SPRITE_HOLD);
  const oops = frame >= SLIP_FRAME;
  const shock = oops && frame < SLIP_FRAME + 24;
  for (const m of CROWD) {
    const baseY = m.row === 0 ? 282 : 298;
    const hop = shock ? 0 : (step + m.phase) % 4 < 2 ? 0 : -2;
    const y = baseY + hop;
    const x = m.x;
    // body
    p.rect(x, y + 9, 14, CANVAS_H - y, m.shirt);
    p.rect(x, y + 9, 14, 1, C.white);
    // arms: cheering up for GO!, hands on head for OOPS
    if (oops) {
      p.rect(x - 2, y + 2, 3, 9, m.shirt);
      p.rect(x + 13, y + 2, 3, 9, m.shirt);
      p.rect(x, y, 3, 3, m.skin);
      p.rect(x + 11, y, 3, 3, m.skin);
    } else if ((step + m.phase) % 2 === 0) {
      p.rect(x - 2, y - 4, 3, 13, m.shirt);
      p.rect(x - 2, y - 6, 3, 3, m.skin);
    }
    // head
    p.rect(x + 3, y, 8, 9, m.skin);
    p.rect(x + 3, y - 1, 8, 3, m.hair);
    p.px(x + 5, y + 4, C.ink);
    p.px(x + 9, y + 4, C.ink);
    p.rect(x + 6, y + 7, oops ? 2 : 3, oops ? 2 : 1, C.ink);
  }
  // the sign held up on two sticks
  const shake = shock ? (Math.floor((frame - SLIP_FRAME) / 3) % 2 === 0 ? 2 : -2) : 0;
  const bob = shock ? 0 : step % 4 < 2 ? 0 : -1;
  const sx = 62 + shake, sy = 258 + bob, sw = 56, sh = 20;
  p.rect(sx + 10, sy + sh, 2, 26, C.woodDark);
  p.rect(sx + sw - 12, sy + sh, 2, 26, C.woodDark);
  p.rect(sx, sy, sw, sh, C.ink);
  p.rect(sx + 1, sy + 1, sw - 2, sh - 2, oops ? C.paper : C.white);
  const label = oops ? "OOPS" : "GO!";
  const col = oops ? C.red : C.green;
  p.text(label, sx + (sw - p.textWidth(label, 3)) / 2, sy + 3, col, 3, oops ? C.redDark : C.greenDark);
}

// ------------------------------------------------------------------ entry point
export function drawScene(ctx: CanvasRenderingContext2D, frame: number) {
  ctx.imageSmoothingEnabled = false;
  const p = new Painter(ctx);
  const cam = cameraX(frame);

  p.rect(0, 0, CANVAS_W, CANVAS_H, C.black);
  drawWall(p, cam);
  for (const prop of PROPS) {
    const sx = Math.round(prop.x - cam);
    if (sx > -70 && sx < CANVAS_W + 10) prop.draw(p, sx, cam, frame);
  }
  drawFloor(p, cam);
  drawSheet(p, frame, cam); // behind him once it falls back
  drawCharacter(p, frame, cam);
  drawCrowd(p, frame);
  drawHud(p, frame);
  drawTitleSign(p, frame);
}
