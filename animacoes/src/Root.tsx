import {Composition} from 'remotion';
import {BipEAEstrela} from './BipEAEstrela';

export const RemotionRoot = () => {
  return (
    <Composition
      id="BipEAEstrela"
      component={BipEAEstrela}
      durationInFrames={540}
      fps={30}
      width={1080}
      height={1920}
    />
  );
};
