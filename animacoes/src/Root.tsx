import {Composition, Still} from 'remotion';
import {Perfil} from './perfil/Perfil';
import {CapaCanal} from './capa/CapaCanal';
import {TestePersonagens} from './teste/TestePersonagens';
import {TesteBoneco} from './teste/TesteBoneco';
import {TesteCinema} from './teste/TesteCinema';
import {ElevadorVideo} from './elevador/Elevador';
import {FreioVideo} from './freio/Freio';
import {FilaVideo} from './fila/Fila';
import {FreioMxVideo} from './freio-mx/FreioMx';
import {FPS as FPS_FREIO_MX, TOTAL_FRAMES as FRAMES_FREIO_MX} from './freio-mx/roteiro';
import {FilaMxVideo} from './fila-mx/FilaMx';
import {FPS as FPS_FILA_MX, TOTAL_FRAMES as FRAMES_FILA_MX} from './fila-mx/roteiro';
import {FPS as FPS_FILA, TOTAL_FRAMES as FRAMES_FILA} from './fila/roteiro';
import {FPS as FPS_CR7, TOTAL_FRAMES as FRAMES_CR7} from './cr7/roteiro';
import {CR7Doc} from './cr7/CR7';
import {FPS as FPS_CHI, TOTAL_FRAMES as FRAMES_CHI} from './chiclete/roteiro';
import {ChicleteVideo} from './chiclete/Chiclete';
import {FPS as FPS_AR1, TOTAL_FRAMES as FRAMES_AR1} from './arena1/roteiro';
import {Arena1Video} from './arena1/Arena1';
import {FPS as FPS_INF, TOTAL_FRAMES as FRAMES_INF} from './infarto/roteiro';
import {InfartoVideo} from './infarto/Infarto';
import {FPS_LOOP, FRAMES_LOOP, LoopCubos} from './loop/Loop';
import {FPS_PRO, FRAMES_PRO, LoopCubosPro} from './loop/LoopPro';
import {FPS as FPS_FREIO, TOTAL_FRAMES as FRAMES_FREIO} from './freio/roteiro';
import {FPS as FPS_ELEV, TOTAL_FRAMES as FRAMES_ELEV} from './elevador/roteiro';
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
      <Composition id="FreioMX" component={FreioMxVideo} durationInFrames={FRAMES_FREIO_MX} fps={FPS_FREIO_MX} width={1080} height={1920} />
      <Composition id="LoopCubosPro" component={LoopCubosPro} durationInFrames={FRAMES_PRO} fps={FPS_PRO} width={1080} height={1920} />
      <Composition id="LoopCubos" component={LoopCubos} durationInFrames={FRAMES_LOOP} fps={FPS_LOOP} width={1080} height={1920} />
      <Composition id="Infarto" component={InfartoVideo} durationInFrames={FRAMES_INF} fps={FPS_INF} width={1080} height={1920} />
      <Composition id="Arena1" component={Arena1Video} durationInFrames={FRAMES_AR1} fps={FPS_AR1} width={1080} height={1920} />
      <Composition id="Chiclete" component={ChicleteVideo} durationInFrames={FRAMES_CHI} fps={FPS_CHI} width={1080} height={1920} />
      <Composition id="CR7" component={CR7Doc} durationInFrames={FRAMES_CR7} fps={FPS_CR7} width={1080} height={1920} />
      <Composition id="FilaMX" component={FilaMxVideo} durationInFrames={FRAMES_FILA_MX} fps={FPS_FILA_MX} width={1080} height={1920} />
      <Composition id="Fila" component={FilaVideo} durationInFrames={FRAMES_FILA} fps={FPS_FILA} width={1080} height={1920} />
      <Composition id="Freio" component={FreioVideo} durationInFrames={FRAMES_FREIO} fps={FPS_FREIO} width={1080} height={1920} />
      <Composition id="Elevador" component={ElevadorVideo} durationInFrames={FRAMES_ELEV} fps={FPS_ELEV} width={1080} height={1920} />
      <Still id="TesteCinema" component={TesteCinema} width={1080} height={1920} defaultProps={{cinema: true}} />
      <Still id="TesteNormal" component={TesteCinema} width={1080} height={1920} defaultProps={{cinema: false}} />
      <Still id="TesteBoneco" component={TesteBoneco} width={1920} height={1080} />
      <Still id="TestePersonagens" component={TestePersonagens} width={1920} height={1080} />
      <Still id="CapaCanal" component={CapaCanal} width={2560} height={1440} />
      <Still id="PerfilVermelho" component={Perfil} width={1080} height={1080} defaultProps={{fundo1: '#ff5a4f', fundo2: '#7a0f0a', camisa: '#1c2a4a', cabelo: '#2a1d14', boné: '#ffcc00'}} />
      <Still id="PerfilAzul" component={Perfil} width={1080} height={1080} defaultProps={{fundo1: '#4cc9f0', fundo2: '#0b2a6b', camisa: '#e10600', cabelo: '#2a1d14', boné: '#ffcc00'}} />
      <Still id="PerfilAmarelo" component={Perfil} width={1080} height={1080} defaultProps={{fundo1: '#ffe14d', fundo2: '#e07b00', camisa: '#1c2a4a', cabelo: '#2a1d14', boné: '#e10600'}} />
    </>
  );
};
