import { C } from "./palette";

// 3x5 bitmap font, one string per row ("#" = pixel on).
const GLYPHS: Record<string, string[]> = {
  A: ["###", "#.#", "###", "#.#", "#.#"],
  C: ["###", "#..", "#..", "#..", "###"],
  E: ["###", "#..", "##.", "#..", "###"],
  F: ["###", "#..", "##.", "#..", "#.."],
  G: ["###", "#..", "#.#", "#.#", "###"],
  I: ["###", ".#.", ".#.", ".#.", "###"],
  K: ["#.#", "#.#", "##.", "#.#", "#.#"],
  O: ["###", "#.#", "#.#", "#.#", "###"],
  P: ["###", "#.#", "###", "#..", "#.."],
  Q: ["###", "#.#", "#.#", "###", "..#"],
  S: ["###", "#..", "###", "..#", "###"],
  T: ["###", ".#.", ".#.", ".#.", ".#."],
  U: ["#.#", "#.#", "#.#", "#.#", "###"],
  X: ["#.#", "#.#", ".#.", "#.#", "#.#"],
  "0": ["###", "#.#", "#.#", "#.#", "###"],
  "1": [".#.", "##.", ".#.", ".#.", "###"],
  "2": ["###", "..#", "###", "#..", "###"],
  "3": ["###", "..#", "###", "..#", "###"],
  "4": ["#.#", "#.#", "###", "..#", "..#"],
  "5": ["###", "#..", "###", "..#", "###"],
  "6": ["###", "#..", "###", "#.#", "###"],
  "7": ["###", "..#", "..#", "..#", "..#"],
  "8": ["###", "#.#", "###", "#.#", "###"],
  "9": ["###", "#.#", "###", "..#", "###"],
  "/": ["..#", "..#", ".#.", "#..", "#.."],
  "!": [".#.", ".#.", ".#.", "...", ".#."],
  "-": ["...", "...", "###", "...", "..."],
  " ": ["...", "...", "...", "...", "..."],
};

const HEART = [".##.##.", "#######", "#######", ".#####.", "..###..", "...#..."];

export class Painter {
  constructor(public readonly ctx: CanvasRenderingContext2D) {}

  rect(x: number, y: number, w: number, h: number, c: string) {
    if (w <= 0 || h <= 0) return;
    this.ctx.fillStyle = c;
    this.ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
  }

  px(x: number, y: number, c: string) {
    this.rect(x, y, 1, 1, c);
  }

  /** Bresenham line with a square brush of size `thick`. */
  line(x0: number, y0: number, x1: number, y1: number, c: string, thick = 1) {
    let ax = Math.round(x0), ay = Math.round(y0);
    const bx = Math.round(x1), by = Math.round(y1);
    const dx = Math.abs(bx - ax), dy = -Math.abs(by - ay);
    const sx = ax < bx ? 1 : -1, sy = ay < by ? 1 : -1;
    let err = dx + dy;
    const off = Math.floor((thick - 1) / 2);
    for (;;) {
      this.rect(ax - off, ay - off, thick, thick, c);
      if (ax === bx && ay === by) break;
      const e2 = 2 * err;
      if (e2 >= dy) { err += dy; ax += sx; }
      if (e2 <= dx) { err += dx; ay += sy; }
    }
  }

  /** Filled pixel circle. */
  disc(cx: number, cy: number, r: number, c: string) {
    for (let y = -r; y <= r; y++) {
      const w = Math.floor(Math.sqrt(r * r - y * y) + 0.35);
      this.rect(cx - w, cy + y, w * 2 + 1, 1, c);
    }
  }

  textWidth(s: string, scale = 1) {
    return s.length * 4 * scale - scale;
  }

  text(s: string, x: number, y: number, c: string, scale = 1, shadow?: string) {
    if (shadow) this.text(s, x + scale, y + scale, shadow, scale);
    let cx = Math.round(x);
    for (const ch of s) {
      const g = GLYPHS[ch] ?? GLYPHS[" "];
      g.forEach((row, ry) =>
        [...row].forEach((v, rx) => {
          if (v === "#") this.rect(cx + rx * scale, y + ry * scale, scale, scale, c);
        }),
      );
      cx += 4 * scale;
    }
  }

  heart(x: number, y: number, full: boolean) {
    HEART.forEach((row, ry) =>
      [...row].forEach((v, rx) => {
        if (v !== "#") return;
        const edge = ry === 0 || rx === 0 || rx === 6 || HEART[ry - 1]?.[rx] !== "#" ||
          HEART[ry + 1]?.[rx] !== "#" || row[rx - 1] !== "#" || row[rx + 1] !== "#";
        const c = full ? (edge ? C.redDark : ry === 1 && rx === 1 ? C.white : C.red) : edge ? C.slate : C.ink;
        this.px(x + rx, y + ry, c);
      }),
    );
  }
}

/** Seeded PRNG (mulberry32) so every "random" detail is identical on every render. */
export function seeded(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
