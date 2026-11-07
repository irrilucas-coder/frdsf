import {ThreeCanvas} from '@remotion/three';
import {useThree} from '@react-three/fiber';
import {AbsoluteFill} from 'remotion';
import {Bloquinho} from '../submarino/Bloquinho';
import {FONTE} from '../submarino/Overlay';

// Capa (banner) do canal: 2560×1440. Tudo que importa fica na área segura central (1546×423),
// que é o que aparece no celular. O resto é decoração que só aparece em TV/computador.
const SEGURA = {w: 1546, h: 423};
const CONTORNO = '0 8px 0 #000, 5px 0 #000, -5px 0 #000, 0 -5px #000, 4px 4px #000, -4px 4px #000, 4px -4px #000, -4px -4px #000';

const Camera = () => {
  const camera = useThree((s) => s.camera);
  camera.position.set(0.2, 1.6, 3.3);
  camera.lookAt(0.05, 1.25, 0);
  return null;
};

const Microfone = () => (
  <group position={[-0.5, 1.2, 0.42]} rotation={[0.35, 0, 0.45]}>
    <mesh>
      <cylinderGeometry args={[0.06, 0.05, 0.42, 12]} />
      <meshStandardMaterial color="#1a1a1a" metalness={0.5} roughness={0.4} />
    </mesh>
    <mesh position={[0, 0.27, 0]}>
      <sphereGeometry args={[0.12, 16, 16]} />
      <meshStandardMaterial color="#9aa0a8" metalness={0.8} roughness={0.25} />
    </mesh>
    <mesh position={[0, 0.06, 0]}>
      <boxGeometry args={[0.16, 0.12, 0.16]} />
      <meshStandardMaterial color="#e10600" />
    </mesh>
  </group>
);

const Apresentador = ({tam}: {tam: number}) => (
  <ThreeCanvas width={tam} height={tam} camera={{fov: 40}}>
    <Camera />
    <ambientLight intensity={1.1} />
    <hemisphereLight args={['#ffffff', '#555577', 1.1]} />
    <directionalLight position={[3, 5, 4]} intensity={2.2} />
    <pointLight position={[-2, 2.5, 2]} intensity={6} color="#4cc9f0" />
    <Bloquinho pose="acenar" expressao="feliz" fase={1} camisa="#e10600" calca="#22252b" pele="#e8b48a" chapeu="cabelo" corChapeu="#2a1d14" />
    <mesh position={[0, 2.25, 0]}>
      <boxGeometry args={[0.62, 0.16, 0.62]} />
      <meshStandardMaterial color="#ffcc00" />
    </mesh>
    <mesh position={[0, 2.2, 0.42]}>
      <boxGeometry args={[0.56, 0.05, 0.3]} />
      <meshStandardMaterial color="#ffcc00" />
    </mesh>
    <Microfone />
  </ThreeCanvas>
);

// Ícones dos temas, flutuando nas laterais (decoração fora da área segura)
const ICONES: [string, number, number, number, number][] = [
  ['🚗', 210, 380, 170, -12], ['🛗', 470, 980, 150, 10], ['⚓', 120, 820, 130, 8], ['❓', 380, 200, 120, -18],
  ['🛒', 2280, 360, 170, 12], ['🧠', 2080, 1000, 150, -10], ['🚀', 2420, 820, 140, 15], ['❓', 2150, 180, 120, 16],
  ['⚙️', 760, 1230, 110, 0], ['💡', 1800, 1240, 120, 0], ['🔬', 1250, 150, 110, 0],
];

export const CapaCanal = () => {
  const x0 = (2560 - SEGURA.w) / 2;
  const y0 = (1440 - SEGURA.h) / 2;
  return (
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 50%, #1d4fb8 0%, #0b2a6b 45%, #050f2e 100%)'}}>
      <AbsoluteFill style={{opacity: 0.07, background: 'repeating-conic-gradient(from 0deg at 50% 50%, #ffffff 0deg 6deg, transparent 6deg 18deg)'}} />
      {/* faixa amarela diagonal atrás do conteúdo */}
      <div style={{position: 'absolute', left: -200, right: -200, top: 560, height: 320, background: 'linear-gradient(90deg, rgba(255,204,0,0) 0%, rgba(255,204,0,0.22) 30%, rgba(255,204,0,0.22) 70%, rgba(255,204,0,0) 100%)', rotate: '-3deg'}} />
      {ICONES.map(([e, x, y, t, r], i) => (
        <div key={i} style={{position: 'absolute', left: x - t / 2, top: y - t / 2, fontSize: t, rotate: `${r}deg`, opacity: 0.85, filter: 'drop-shadow(0 10px 0 rgba(0,0,0,0.35))'}}>{e}</div>
      ))}
      {/* área segura */}
      <div style={{position: 'absolute', left: x0, top: y0, width: SEGURA.w, height: SEGURA.h, display: 'flex', alignItems: 'center'}}>
        <div style={{width: 520, height: 520, marginTop: 110, marginLeft: -10, flexShrink: 0}}>
          <Apresentador tam={520} />
        </div>
        <div style={{flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18, paddingRight: 40}}>
          <div style={{fontFamily: FONTE, fontSize: 150, lineHeight: 0.95, color: '#ffcc00', textShadow: CONTORNO, rotate: '-2deg'}}>CURIOSIDADES</div>
          <div style={{fontFamily: FONTE, fontSize: 84, lineHeight: 1, color: '#fff', textShadow: CONTORNO, rotate: '-2deg', whiteSpace: 'nowrap'}}>EXPLICADAS EM 1 MINUTO</div>
          <div style={{marginTop: 14, fontFamily: FONTE, fontSize: 52, color: '#fff', background: '#e10600', border: '6px solid #000', borderRadius: 60, padding: '6px 34px', boxShadow: '0 8px 0 rgba(0,0,0,0.45)', rotate: '1.5deg'}}>
            🎬 VÍDEO NOVO TODO DIA
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
