import { Canvas, useFrame } from '@react-three/fiber';
import { useEffect, useRef, useState } from 'react';
import type { Mesh } from 'three';
import { MeshTransmissionMaterial } from '@react-three/drei';

export interface BlindboxWheelProps {
  segments: { label: string; color: string }[];
  spinning: boolean;
  resultIndex: number | null;
  onSpinEnd?: () => void;
  size?: number;
}

export function BlindboxWheel({ segments, spinning, resultIndex, onSpinEnd, size = 360 }: BlindboxWheelProps) {
  return (
    <div style={{ width: size, height: size }}>
      <Canvas camera={{ position: [0, 1.6, 3.5], fov: 50 }}>
        <ambientLight intensity={1} />
        <directionalLight position={[3, 5, 2]} intensity={0.8} />
        <WheelMesh segments={segments} spinning={spinning} resultIndex={resultIndex} onEnd={onSpinEnd} />
      </Canvas>
    </div>
  );
}

function WheelMesh({
  segments, spinning, resultIndex, onEnd,
}: {
  segments: BlindboxWheelProps['segments'];
  spinning: boolean;
  resultIndex: number | null;
  onEnd?: () => void;
}) {
  const ref = useRef<Mesh>(null);
  const velocityRef = useRef(0);
  const targetRef = useRef<number | null>(null);
  const doneRef = useRef(false);
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    if (spinning && resultIndex != null) {
      const segAngle = (2 * Math.PI) / segments.length;
      const desired = -segAngle * resultIndex - segAngle / 2;
      const extras = 4 + Math.random() * 2;
      targetRef.current = desired - extras * 2 * Math.PI;
      velocityRef.current = 12;
      doneRef.current = false;
      forceUpdate((n) => n + 1);
    }
  }, [spinning, resultIndex, segments.length]);

  useFrame((_, dt) => {
    if (!ref.current) return;
    if (targetRef.current == null) return;
    if (doneRef.current) return;
    const remaining = targetRef.current - ref.current.rotation.y;
    if (Math.abs(remaining) < 0.01) {
      ref.current.rotation.y = targetRef.current;
      doneRef.current = true;
      onEnd?.();
      return;
    }
    const step = remaining * Math.min(dt * 4, 0.2);
    if (step < 0) {
      ref.current.rotation.y += step;
    }
    if (Math.abs(step) < 0.02 && velocityRef.current > 0.5) {
      velocityRef.current *= 0.96;
    }
  });

  const segAngle = (2 * Math.PI) / segments.length;
  return (
    <group>
      <mesh ref={ref}>
        {segments.map((s, i) => (
          <mesh key={s.label + String(i)} rotation={[0, segAngle * i, 0]} position={[0, 0, 0]}>
            <coneGeometry args={[0.95, 0.6, 6, 1, false, 0, segAngle * 0.95]} />
            <MeshTransmissionMaterial color={s.color} thickness={0.5} roughness={0.1} />
          </mesh>
        ))}
      </mesh>
      <mesh position={[0, 0.7, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.2, 0.4, 8]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
    </group>
  );
}
