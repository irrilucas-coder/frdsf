import {Config} from '@remotion/cli/config';

Config.setVideoImageFormat('jpeg');
// WebGL por software: funciona em qualquer máquina, inclusive sem placa de vídeo
Config.setChromiumOpenGlRenderer('swangle');
