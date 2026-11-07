import {Bloquinho} from '../submarino/Bloquinho';
import {Palco} from '../submarino/Palco';

// Vitrine das variações de personagem (só para conferir o visual)
export const TestePersonagens = ({pos = [0, 1.6, 9.5], olha = [0, 1.1, 0], fov = 40}: {pos?: [number, number, number]; olha?: [number, number, number]; fov?: number}) => (
  <Palco clima="interior" pos={pos} olha={olha} fov={fov} sombras={false} cinema>
    <mesh position={[0, 2, -1.5]}>
      <boxGeometry args={[16, 6, 0.1]} />
      <meshStandardMaterial color="#3a4a6a" />
    </mesh>
    <mesh rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[20, 20]} />
      <meshStandardMaterial color="#8a857a" />
    </mesh>
    {/* jogador: forte, topete, camisa 7 */}
    <Bloquinho posicao={[-2.6, 0, 0]} corpo="forte" cabeca="oval" cabelo="topete" corCabelo="#1a1410" pele="#d9a27a" camisa="#c8102e" manga="#c8102e" calca="#0b6b3a" numero="7" olhos="grandes" pose="siu" expressao="feliz" />
    {/* técnico: gordinho, careca com barba grisalha */}
    <Bloquinho posicao={[-0.9, 0, 0.3]} corpo="gordinho" cabeca="larga" cabelo="nenhum" barba="curta" corBarba="#bdbdbd" corCabelo="#9e9e9e" pele="#e8b48a" camisa="#1c2a4a" pose="bracosCruzados" expressao="serio" />
    {/* jovem magra com rabo de cavalo */}
    <Bloquinho posicao={[0.7, 0, 0.2]} corpo="magro" cabeca="redonda" cabelo="rabo" corCabelo="#7a3b12" pele="#f2c9a5" camisa="#ff5a9f" olhos="grandes" pose="acenar" />
    {/* homem com black e cavanhaque */}
    <Bloquinho posicao={[2.2, 0, 0]} cabeca="quadrada" cabelo="black" corCabelo="#1a1a1a" barba="cavanhaque" pele="#7a4b2e" camisa="#2a9d8f" pose="parado" expressao="emocionado" />
    {/* senhor de bigode, cabelo lateral */}
    <Bloquinho posicao={[3.6, 0, -0.2]} corpo="magro" cabeca="oval" cabelo="lateral" corCabelo="#d9d9d9" bigode pele="#f5c99b" camisa="#6a4c93" escala={0.95} expressao="triste" />
  </Palco>
);
