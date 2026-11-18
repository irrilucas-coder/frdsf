import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Hud } from "./Hud";
import { SceneBand, SceneClinic, SceneDoctor, SceneFinal, SceneHook, ScenePrevent, SceneRelief } from "./scenes";
import TL from "./timeline.json";

const SCENES: Record<string, React.FC> = {
  hook: SceneHook, doctor: SceneDoctor, band: SceneBand, clinic: SceneClinic,
  relief: SceneRelief, prevent: ScenePrevent, final: SceneFinal,
};

/** Punchy entrance for every cut: quick zoom settle + motion blur + white flash. */
const CutIn: React.FC<{ children: React.ReactNode; first: boolean }> = ({ children, first }) => {
  const f = useCurrentFrame();
  const k = first ? 1 : Math.min(1, f / 9);
  const e = 1 - Math.pow(1 - k, 3);
  return (
    <AbsoluteFill style={{ transform: `scale(${1.14 - 0.14 * e})`, filter: k < 1 ? `blur(${(1 - e) * 14}px)` : undefined }}>
      {children}
      {!first && f < 4 && <AbsoluteFill style={{ background: "#fff", opacity: 0.55 * (1 - f / 4) }} />}
    </AbsoluteFill>
  );
};

export const Ligadura: React.FC = () => {
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill style={{ background: "#ffe3d3" }}>
      {TL.scenes.map((s, i) => {
        const C = SCENES[s.id];
        return (
          <Sequence key={s.id} from={Math.round(s.from * fps)} durationInFrames={Math.round((s.to - s.from) * fps)}>
            <CutIn first={i === 0}><C /></CutIn>
          </Sequence>
        );
      })}
      <Hud />
      <Sequence from={Math.round(TL.narrationOffset * fps)}>
        <Audio src={staticFile("narracion.mp3")} />
      </Sequence>
      <Audio src={staticFile("sfx.wav")} volume={0.55} />
    </AbsoluteFill>
  );
};
