import { Composition } from "remotion";
import { OfficeQuest } from "./OfficeQuest";
import { DURATION, FPS } from "./pixel/walk";

export const RemotionRoot: React.FC = () => (
  <Composition
    id="OfficeQuest"
    component={OfficeQuest}
    durationInFrames={DURATION}
    fps={FPS}
    width={1080}
    height={1920}
  />
);
