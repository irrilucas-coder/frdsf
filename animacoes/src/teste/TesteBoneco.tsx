import {Palco} from '../submarino/Palco';
import {Boneco} from '../personagem/Boneco';
import {Campo, LuzDia} from '../personagem/Cenario';

// Vitrine do personagem low-poly
export const TesteBoneco = ({pos = [0, 1.8, 8.5], olha = [0, 1.3, 0], fov = 40}: {pos?: [number, number, number]; olha?: [number, number, number]; fov?: number}) => (
  <Palco clima="dia" pos={pos} olha={olha} fov={fov} sombras={false} cinema>
    <LuzDia />
    <Campo />
    <Boneco posicao={[-3.6, 0, 0]} camisa="#e8553e" bermuda="#2f5fa8" chapeu="bone" corChapeu="#ffcc33" expressao="feliz" pose="acenar" />
    <Boneco posicao={[-2.2, 0, 0.3]} camisa="#ff8fb1" vestido bermuda="#ff8fb1" cabelo="coque" corCabelo="#5a3a1f" pele="#f6d0b0" expressao="surpreso" pose="susto" emote="exclamacao" />
    <Boneco posicao={[-0.75, 0, 0]} tronco="gordinho" camisa="#4cc9f0" bermuda="#3a3f4a" cabelo="careca" bigode corCabelo="#5a4a3a" pele="#e0a878" expressao="rindo" />
    <Boneco posicao={[0.75, 0, 0.2]} tronco="magro" camisa="#8ab17d" bermuda="#5a4a3a" cabelo="franja" corCabelo="#1a1a1a" oculos expressao="pensativo" pose="pensar" emote="interrogacao" />
    <Boneco posicao={[2.2, 0, 0]} tronco="forte" camisa="#264653" bermuda="#1d1d24" cabelo="curto" corCabelo="#2a1d14" barba pele="#8a5a3c" expressao="furioso" pose="maosNaCintura" />
    <Boneco posicao={[3.6, 0, 0.2]} camisa="#ffd23f" bermuda="#6a4c93" cabelo="cacheado" corCabelo="#2a1d14" pele="#6b4128" expressao="confiante" pose="bracosCruzados" emote="brilho" />
  </Palco>
);
