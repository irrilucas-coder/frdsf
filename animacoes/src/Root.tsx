import {Composition} from 'remotion';
import {BipEAEstrela} from './BipEAEstrela';
import {Submarino} from './submarino/Submarino';
import {FPS, TOTAL_FRAMES} from './submarino/roteiro';
import {MaduroDoc} from './maduro/Maduro';
import {FelcaDoc} from './felca/Felca';
import {JuezDoc} from './juez/Juez';
import {IneDoc} from './ine/Ine';
import {FPS as FPS_INE, TOTAL_FRAMES as FRAMES_INE} from './ine/roteiro';
import {FPS as FPS_JUEZ, TOTAL_FRAMES as FRAMES_JUEZ} from './juez/roteiro';
import {FPS as FPS_FELCA, TOTAL_FRAMES as FRAMES_FELCA} from './felca/roteiro';
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
      <Composition
        id="CasoFelca"
        component={FelcaDoc}
        durationInFrames={FRAMES_FELCA}
        fps={FPS_FELCA}
        width={1080}
        height={1920}
      />
      <Composition
        id="JuezSoborno"
        component={JuezDoc}
        durationInFrames={FRAMES_JUEZ}
        fps={FPS_JUEZ}
        width={1080}
        height={1920}
      />
      <Composition
        id="IneCuentas"
        component={IneDoc}
        durationInFrames={FRAMES_INE}
        fps={FPS_INE}
        width={1080}
        height={1920}
      />
    </>
  );
};
