import {Bloquinho} from '../submarino/Bloquinho';
import {Palco} from '../submarino/Palco';

// Comparação rápida do modo cinema (usado só para testar o visual)
export const TesteCinema = ({cinema}: {cinema: boolean}) => (
  <Palco clima="interior" pos={[1.5, 2, 5]} olha={[0, 1.4, 0]} fov={45} sombras={false} cinema={cinema}>
    <mesh position={[0, 2, -1.5]}>
      <boxGeometry args={[10, 6, 0.1]} />
      <meshStandardMaterial color="#3a4a6a" />
    </mesh>
    <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[20, 20]} />
      <meshStandardMaterial color="#8a857a" />
    </mesh>
    <Bloquinho pose="acenar" expressao="feliz" camisa="#ffcc00" calca="#1f5fa8" chapeu="cabelo" corChapeu="#2a1d14" fase={1} />
    <mesh position={[1.4, 1.2, 0.5]}>
      <sphereGeometry args={[0.15, 16, 16]} />
      <meshStandardMaterial color="#ffd23f" emissive="#ffb703" emissiveIntensity={4} />
    </mesh>
  </Palco>
);
