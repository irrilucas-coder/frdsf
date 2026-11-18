import { ThreeCanvas } from "@remotion/three";
import { AbsoluteFill } from "remotion";
import { Cam, Studio } from "./core";

type V3 = [number, number, number];

/**
 * Two synchronized 3D layers with the same camera:
 *  - background (walls, windows, far props) rendered blurred -> shallow depth of field
 *  - foreground (floor, character, near props) rendered sharp on a transparent canvas
 */
export const Layered: React.FC<{
  cam: { pos: V3; look: V3; fov?: number };
  bg: React.ReactNode;
  fg: React.ReactNode;
  sky?: string;
  blur?: number;
  shadowSize?: number;
  dist?: number;
}> = ({ cam: cam0, bg, fg, sky = "#ffe3d3", blur = 7, shadowSize, dist = 1.7 }) => {
  // vertical frames are narrow: push the camera back along its view direction
  const cam = { ...cam0, pos: cam0.pos.map((v, i) => cam0.look[i] + (v - cam0.look[i]) * dist) as V3 };
  return (
  <AbsoluteFill style={{ background: sky }}>
    <AbsoluteFill style={{ filter: `blur(${blur}px)`, transform: "scale(1.03)" }}>
      <ThreeCanvas width={1080} height={1920} shadows gl={{ antialias: true }}>
        <color attach="background" args={[sky]} />
        <Studio shadowSize={shadowSize} />
        <Cam {...cam} />
        {bg}
      </ThreeCanvas>
    </AbsoluteFill>
    <AbsoluteFill>
      <ThreeCanvas width={1080} height={1920} shadows gl={{ antialias: true, alpha: true }}>
        <Studio shadowSize={shadowSize} />
        <Cam {...cam} />
        {fg}
      </ThreeCanvas>
    </AbsoluteFill>
  </AbsoluteFill>
  );
};
