import { Composition } from "remotion";
import { Ligadura } from "./Ligadura";
import TL from "./timeline.json";

export const RemotionRoot: React.FC = () => (
  <Composition
    id="Ligadura"
    component={Ligadura}
    durationInFrames={Math.round(TL.duration * TL.fps)}
    fps={TL.fps}
    width={1080}
    height={1920}
  />
);
