import {Composition} from 'remotion';
import {BipEAEstrela} from './BipEAEstrela';
import {Submarino} from './submarino/Submarino';
import {FPS, TOTAL_FRAMES} from './submarino/roteiro';
import {MaduroDoc} from './maduro/Maduro';
import {FPS as FPS_MADURO, TOTAL_FRAMES as FRAMES_MADURO} from './maduro/roteiro';

export const RemotionRoot = () => {
  return (
    <>
      <Composition
        id="BipEAEstrela"
        component={BipEAEstrela}
        durationInFrames={585}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="Submarino"
        component={Submarino}
        durationInFrames={TOTAL_FRAMES}
        fps={FPS}
        width={1080}
        height={1920}
      />
      <Composition
        id="CapturaMaduro"
        component={MaduroDoc}
        durationInFrames={FRAMES_MADURO}
        fps={FPS_MADURO}
        width={1080}
        height={1920}
      />
    </>
  );
};
