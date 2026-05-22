import { Canvas, useFrame } from '@react-three/fiber';
import { MeshTransmissionMaterial, OrbitControls } from '@react-three/drei';
import { useMemo, useRef } from 'react';
import type { Mesh } from 'three';

export interface RadarDimension {
  code: string;
  name: string;
  score: number;
  max: number;
  color: string;
}

export interface RadarChart3DProps {
  data: RadarDimension[];
  size?: number;
}

function Crystal({ dim, idx, total }: { dim: RadarDimension; idx: number; total: number }) {
  const ref = useRef<Mesh>(null);
  const angle = (idx / total) * Math.PI * 2;
  const radius = 1.3;
  const x = Math.cos(angle) * radius;
  const z = Math.sin(angle) * radius;
  const height = Math.max(0.4, Math.min(dim.score / dim.max, 1) * 2.2);

  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y += dt * 0.4;
  });

  return (
    <group position={[x, height / 2 - 1, z]}>
      <mesh ref={ref}>
        <cylinderGeometry args={[0.22, 0.28, height, 6]} />
        <MeshTransmissionMaterial color={dim.color} thickness={0.8} ior={1.4} roughness={0.05} transmission={0.95} />
      </mesh>
    </group>
  );
}

function Center({ total }: { total: number }) {
  const intensity = Math.min(total / 600, 1) * 1.5 + 0.4;
  return (
    <pointLight position={[0, 0.5, 0]} intensity={intensity} color="#ffd93d" distance={6} />
  );
}

export function RadarChart3D({ data, size = 320 }: RadarChart3DProps) {
  const totalScore = useMemo(() => data.reduce((s, d) => s + d.score, 0), [data]);
  return (
    <div style={{ width: size, height: size }}>
      <Canvas camera={{ position: [0, 1.8, 4], fov: 50 }}>
        <ambientLight intensity={0.7} />
        <Center total={totalScore} />
        {data.map((d, i) => (
          <Crystal key={d.code} dim={d} idx={i} total={data.length} />
        ))}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]}>
          <circleGeometry args={[2.0, 32]} />
          <meshStandardMaterial color="#fffef8" opacity={0.4} transparent />
        </mesh>
        <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.4} />
      </Canvas>
    </div>
  );
}
