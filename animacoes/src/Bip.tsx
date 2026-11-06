import {Easing, useCurrentFrame} from 'remotion';
import {mix, prog} from './tempo';

// Bip: um robozinho redondo. Toda a animação vem do frame atual.
export const Bip = () => {
  const frame = useCurrentFrame();

  // --- Posição no chão (x) ---
  const pulaAteEstrela = prog(frame, 195, 240);
  const recua = prog(frame, 285, 315);
  const x = mix(mix(-1.1, 0.05, pulaAteEstrela), -0.85, recua);

  // --- Pulinhos ---
  const pulinho = (inicio: number, fim: number, vezes: number, altura: number) => {
    if (frame < inicio || frame > fim) return 0;
    const t = (frame - inicio) / (fim - inicio);
    return Math.abs(Math.sin(t * Math.PI * vezes)) * altura;
  };
  const alturaPulo =
    pulinho(195, 240, 3, 0.35) + // vai até a estrela
    pulinho(285, 315, 2, 0.2) + // recua
    pulinho(400, 470, 4, 0.55); // comemora

  // Amassa ao tocar o chão, estica no ar
  const noAr = alturaPulo > 0.02;
  const estica = noAr ? 1 + alturaPulo * 0.25 : 1 - Math.max(0, 0.06 - alturaPulo) * 1.5;

  // Respiração enquanto dorme
  const respira = frame < 60 ? Math.sin(frame * 0.12) * 0.025 : 0;

  // --- Para onde ele olha (rotação y) ---
  const olhaEstrela = prog(frame, 150, 175); // vira para a direita (estrela)
  const voltaFrente = prog(frame, 310, 330); // depois de plantar
  const olhaArvore = prog(frame, 335, 355); // fica de lado olhando a árvore crescer
  const olhaCamera = prog(frame, 395, 410);
  const rotY =
    mix(mix(mix(mix(0, Math.PI / 2, olhaEstrela), 0.15, voltaFrente), 0.9, olhaArvore), 0, olhaCamera);

  // Inclina para frente ao empurrar a estrela no chão
  const empurra = prog(frame, 245, 262) - prog(frame, 268, 282);
  const inclina = empurra * 0.5;

  // Olhos: fechados no começo, abrem com uma piscada
  const abre = prog(frame, 55, 70, Easing.out(Easing.back(2)));
  const piscadas = [100, 228, 372, 480];
  const piscando = piscadas.some((p) => frame >= p && frame < p + 5);
  const olhoY = piscando ? 0.12 : mix(0.12, 1, abre);

  // Antena acende quando acorda e pisca de alegria no final
  const brilhoAntena = mix(0.2, 2.2, abre) + (frame > 400 ? Math.sin(frame * 0.5) * 0.8 : 0);

  return (
    <group position={[x, alturaPulo, 0]} rotation={[0, rotY, 0]}>
      <group rotation={[inclina, 0, 0]} scale={[1 / Math.sqrt(estica), estica + respira, 1 / Math.sqrt(estica)]}>
        {/* Corpo */}
        <mesh position={[0, 0.45, 0]} castShadow>
          <sphereGeometry args={[0.45, 48, 48]} />
          <meshStandardMaterial color="#f4efe6" roughness={0.35} metalness={0.1} />
        </mesh>
        {/* Faixa da barriga */}
        <mesh position={[0, 0.36, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.43, 0.035, 16, 64]} />
          <meshStandardMaterial color="#ff8a5b" roughness={0.5} />
        </mesh>
        {/* Visor do rosto */}
        <mesh position={[0, 0.55, 0.3]} scale={[1, 0.75, 0.55]}>
          <sphereGeometry args={[0.27, 32, 32]} />
          <meshStandardMaterial color="#1d2340" roughness={0.15} metalness={0.4} />
        </mesh>
        {/* Olhos */}
        {[-0.1, 0.1].map((ox) => (
          <mesh key={ox} position={[ox, 0.57, 0.44]} scale={[1, olhoY, 0.6]}>
            <sphereGeometry args={[0.05, 16, 16]} />
            <meshStandardMaterial color="#7ff6ff" emissive="#7ff6ff" emissiveIntensity={1.6} />
          </mesh>
        ))}
        {/* Antena */}
        <mesh position={[0, 0.98, 0]}>
          <cylinderGeometry args={[0.015, 0.015, 0.22, 8]} />
          <meshStandardMaterial color="#9aa3b5" />
        </mesh>
        <mesh position={[0, 1.11, 0]}>
          <sphereGeometry args={[0.06, 16, 16]} />
          <meshStandardMaterial color="#ffd166" emissive="#ffb703" emissiveIntensity={brilhoAntena} />
        </mesh>
        {/* Pezinhos */}
        {[-0.18, 0.18].map((ox) => (
          <mesh key={ox} position={[ox, 0.05, 0.08]} scale={[1, 0.6, 1.3]} castShadow>
            <sphereGeometry args={[0.1, 16, 16]} />
            <meshStandardMaterial color="#ff8a5b" roughness={0.6} />
          </mesh>
        ))}
      </group>
    </group>
  );
};
