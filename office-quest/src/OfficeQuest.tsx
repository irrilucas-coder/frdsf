import { useLayoutEffect, useRef } from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { drawScene } from "./pixel/scene";
import { CANVAS_H, CANVAS_W } from "./pixel/walk";

// The scene is painted on a tiny 180x320 canvas and scaled 6x with
// nearest-neighbour sampling, so every art pixel is a crisp 6x6 block.
export const OfficeQuest: React.FC = () => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);

  useLayoutEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (ctx) drawScene(ctx, frame);
  }, [frame]);

  return (
    <AbsoluteFill style={{ backgroundColor: "#0d0b14" }}>
      <canvas
        ref={ref}
        width={CANVAS_W}
        height={CANVAS_H}
        style={{ width: 1080, height: 1920, imageRendering: "pixelated" }}
      />
    </AbsoluteFill>
  );
};
