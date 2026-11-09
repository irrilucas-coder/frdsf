import {Bloquinho} from '../submarino/Bloquinho';
import {Palco} from '../submarino/Palco';

// Vitrine das variações de personagem (só para conferir o visual)
export const TestePersonagens = ({pos = [0, 1.7, 12.5], olha = [0, 1.1, 0], fov = 40}: {pos?: [number, number, number]; olha?: [number, number, number]; fov?: number}) => (
  <Palco clima="interior" pos={pos} olha={olha} fov={fov} sombras={false} cinema>
    <mesh position={[0, 2, -1.5]}>
      <boxGeometry args={[30, 8, 0.1]} />
      <meshStandardMaterial color="#3a4a6a" />
    </mesh>
    <mesh rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[20, 20]} />
      <meshStandardMaterial color="#8a857a" />
    </mesh>
    <Bloquinho posicao={[-5.6, 0, 0]} olhos="grandes" cabeca="redonda" cabelo="liso" corCabelo="#3a2414" camisa="#e63946" expressao="surpreso" pose="susto" emote="exclamacao" />
    <Bloquinho posicao={[-4.0, 0, 0]} olhos="grandes" corpo="gordinho" cabeca="larga" cabelo="nenhum" barba="curta" corBarba="#6b4a2b" camisa="#f4a261" expressao="rindo" />
    <Bloquinho posicao={[-2.4, 0, 0]} olhos="grandes" corpo="magro" cabeca="oval" cabelo="lateral" corCabelo="#1a1a1a" camisa="#457b9d" expressao="pensativo" pose="pensar" emote="interrogacao" />
    <Bloquinho posicao={[-0.8, 0, 0]} olhos="grandes" corpo="forte" cabeca="quadrada" cabelo="moicano" corCabelo="#2a1d14" camisa="#264653" expressao="furioso" pose="maosNaCintura" />
    <Bloquinho posicao={[0.8, 0, 0]} olhos="grandes" cabeca="redonda" cabelo="rabo" corCabelo="#7a3b12" camisa="#8ab17d" expressao="nojo" pose="segurar" />
    <Bloquinho posicao={[2.4, 0, 0]} olhos="grandes" corpo="forte" cabeca="oval" cabelo="topete" corCabelo="#2b1d14" camisa="#6a4c93" expressao="confiante" pose="bracosCruzados" emote="brilho" />
    <Bloquinho posicao={[4.0, 0, 0]} olhos="grandes" cabeca="quadrada" cabelo="black" corCabelo="#141414" pele="#7a4b2e" camisa="#2a9d8f" expressao="cansado" pose="facepalm" emote="gota" />
    <Bloquinho posicao={[5.6, 0, 0]} olhos="grandes" corpo="magro" cabeca="redonda" cabelo="comprido" corCabelo="#d9a441" camisa="#ff5a9f" expressao="feliz" pose="dancar" emote="coracao" fase={3} />
  </Palco>
);
