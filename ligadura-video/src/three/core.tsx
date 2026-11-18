import { useThree } from "@react-three/fiber";
import { useMemo } from "react";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

// ---------------------------------------------------------------- caches
// React re-renders every frame, so geometries/materials are created once and reused.
const geoCache = new Map<string, THREE.BufferGeometry>();
export function geo<T extends THREE.BufferGeometry>(key: string, make: () => T): T {
  let g = geoCache.get(key);
  if (!g) { g = make(); geoCache.set(key, g); }
  return g as T;
}
const matCache = new Map<string, THREE.Material>();
export function mat<T extends THREE.Material>(key: string, make: () => T): T {
  let m = matCache.get(key);
  if (!m) { m = make(); matCache.set(key, m); }
  return m as T;
}

/** Glossy toy-plastic material: clearcoat + low roughness, reflects the room environment. */
export const plastic = (color: string, opts: { rough?: number; transparent?: number; emissive?: string } = {}) =>
  mat(`pl-${color}-${opts.rough ?? 0.26}-${opts.transparent ?? 1}-${opts.emissive ?? ""}`, () =>
    new THREE.MeshPhysicalMaterial({
      color, roughness: opts.rough ?? 0.26, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.06,
      envMapIntensity: 1.1, transparent: (opts.transparent ?? 1) < 1, opacity: opts.transparent ?? 1,
      emissive: opts.emissive ?? "#000000", emissiveIntensity: opts.emissive ? 0.6 : 0,
    }));

export const metal = (color = "#cfd6de") =>
  mat(`mt-${color}`, () => new THREE.MeshPhysicalMaterial({ color, roughness: 0.18, metalness: 0.9, clearcoat: 1 }));

export const roundedBox = (w: number, h: number, d: number, r = 0.018) =>
  geo(`rb-${w.toFixed(3)}-${h.toFixed(3)}-${d.toFixed(3)}-${r}`, () =>
    new RoundedBoxGeometry(w, h, d, 3, Math.min(r, w / 2.2, h / 2.2, d / 2.2)));

// ---------------------------------------------------------------- environment + lights
/** Bright daylight studio: room-environment reflections, warm key with soft shadows, cool fill. */
export const Studio: React.FC<{ shadowSize?: number; key?: [number, number, number] }> = ({ shadowSize = 6, key = [4, 7, 5] }) => {
  const { gl, scene } = useThree();
  // set synchronously so the very first rendered frame already has reflections
  useMemo(() => {
    gl.toneMapping = THREE.NeutralToneMapping;
    gl.toneMappingExposure = 0.95;
    gl.shadowMap.type = THREE.PCFSoftShadowMap;
    const pm = new THREE.PMREMGenerator(gl);
    scene.environment = pm.fromScene(new RoomEnvironment(), 0.03).texture;
  }, [gl, scene]);
  return (
    <>
      <hemisphereLight args={["#fff6ee", "#a9b8cc", 0.55]} />
      <directionalLight
        position={key} intensity={2.4} color="#fff4e2" castShadow
        shadow-mapSize={[2048, 2048]} shadow-radius={6} shadow-bias={-0.0004}
        shadow-camera-left={-shadowSize} shadow-camera-right={shadowSize}
        shadow-camera-top={shadowSize} shadow-camera-bottom={-shadowSize}
        shadow-camera-near={0.5} shadow-camera-far={30}
      />
      <directionalLight position={[-5, 3, -4]} intensity={0.7} color="#cfe3ff" />
    </>
  );
};

/** Animated camera: mutates the default camera every frame (deterministic, no loop needed). */
export const Cam: React.FC<{ pos: [number, number, number]; look: [number, number, number]; fov?: number }> = ({ pos, look, fov = 32 }) => {
  const { camera } = useThree();
  const c = camera as THREE.PerspectiveCamera;
  c.position.set(...pos);
  if (c.fov !== fov) { c.fov = fov; c.updateProjectionMatrix(); }
  c.lookAt(...look);
  return null;
};

// ---------------------------------------------------------------- bricks
export const U = 0.2; // stud pitch
export const BH = 0.24; // brick height
const studGeo = () => geo("stud", () => new THREE.CylinderGeometry(0.06, 0.06, 0.045, 24));

type V3 = [number, number, number];
/** A toy brick w x d studs, h brick-heights tall, with bevelled edges and studs on top. */
export const Brick: React.FC<{
  w: number; d: number; h?: number; color: string; position?: V3; rotation?: V3; studs?: boolean; scale?: number;
}> = ({ w, d, h = 1, color, position = [0, 0, 0], rotation = [0, 0, 0], studs = true, scale = 1 }) => {
  const W = w * U - 0.006, H = h * BH, D = d * U - 0.006;
  const m = plastic(color);
  const st: V3[] = [];
  if (studs) for (let i = 0; i < w; i++) for (let j = 0; j < d; j++)
    st.push([(i - (w - 1) / 2) * U, H / 2 + 0.022, (j - (d - 1) / 2) * U]);
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <mesh geometry={roundedBox(W, H, D)} material={m} castShadow receiveShadow />
      {st.map((p, k) => <mesh key={k} geometry={studGeo()} material={m} position={p} castShadow />)}
    </group>
  );
};

/** Glossy light-grey tiled floor (procedural canvas texture + clearcoat). */
export const Floor: React.FC<{ color?: string; size?: number; y?: number }> = ({ color = "#d9dde3", size = 60, y = 0 }) => {
  const m = mat(`floor-${color}`, () => {
    const cv = document.createElement("canvas"); cv.width = cv.height = 256;
    const g = cv.getContext("2d")!;
    g.fillStyle = color; g.fillRect(0, 0, 256, 256);
    g.fillStyle = "rgba(0,0,0,0.10)"; g.fillRect(0, 0, 256, 4); g.fillRect(0, 0, 4, 256);
    g.fillStyle = "rgba(255,255,255,0.35)"; g.fillRect(4, 4, 248, 2); g.fillRect(4, 4, 2, 248);
    const tex = new THREE.CanvasTexture(cv);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.repeat.set(size / 0.8, size / 0.8);
    tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
    return new THREE.MeshPhysicalMaterial({ map: tex, roughness: 0.22, clearcoat: 1, clearcoatRoughness: 0.05 });
  });
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, y, 0]} receiveShadow material={m}
      geometry={geo(`plane-${size}`, () => new THREE.PlaneGeometry(size, size))} />
  );
};

/** Back wall built from a brick-pattern texture (kept in the blurred background layer). */
export const BrickWall: React.FC<{ color: string; z?: number; width?: number; height?: number; x?: number }> = ({ color, z = -3, width = 40, height = 8, x = 0 }) => {
  const m = mat(`wall-${color}`, () => {
    const cv = document.createElement("canvas"); cv.width = 256; cv.height = 128;
    const g = cv.getContext("2d")!;
    g.fillStyle = color; g.fillRect(0, 0, 256, 128);
    g.fillStyle = "rgba(0,0,0,0.13)";
    for (let r = 0; r < 4; r++) {
      g.fillRect(0, r * 32, 256, 3);
      const off = r % 2 ? 64 : 0;
      for (let c = -1; c < 3; c++) g.fillRect(off + c * 128, r * 32, 3, 32);
    }
    g.fillStyle = "rgba(255,255,255,0.25)";
    for (let r = 0; r < 4; r++) g.fillRect(0, r * 32 + 3, 256, 2);
    const tex = new THREE.CanvasTexture(cv);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.repeat.set(width / 1.6, height / 0.8);
    tex.colorSpace = THREE.SRGBColorSpace;
    return new THREE.MeshPhysicalMaterial({ map: tex, roughness: 0.3, clearcoat: 0.8 });
  });
  return (
    <mesh position={[x, height / 2, z]} material={m} receiveShadow
      geometry={geo(`wallplane-${width}-${height}`, () => new THREE.PlaneGeometry(width, height))} />
  );
};

// ---------------------------------------------------------------- helpers
export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const easeOut = (x: number) => 1 - Math.pow(1 - clamp01(x), 3);
export const easeInOut = (x: number) => { const t = clamp01(x); return t * t * (3 - 2 * t); };
export const backOut = (x: number) => { const t = clamp01(x) - 1; return 1 + 2.7 * t * t * t + 1.7 * t * t; };
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const lerp3 = (a: V3, b: V3, t: number): V3 => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
