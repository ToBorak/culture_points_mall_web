import { Canvas, useFrame } from '@react-three/fiber';
import { useEffect, useRef, useState } from 'react';
import type { Group, Mesh } from 'three';
import { MathUtils } from 'three';

export interface BlindboxBox3DProps {
  /** 'idle' 漂浮空闲；'spinning' 高速自转抽奖中；'opening' 减速 + 开盖；'closed' 完成 */
  state: 'idle' | 'spinning' | 'opening' | 'closed';
  /** 主色调，决定盒身渐变 */
  tint?: string;
  size?: number;
  onAnimationDone?: () => void;
}

/**
 * 3D 盲盒：飘浮立方体 + 高光物理材质 + 金色缎带 + 蝴蝶结
 * - idle: 慢漂浮 + 轻自转
 * - spinning: 高速 Y 轴自转 + 上下颤动
 * - opening: 减速到目标 + 盖子腾起 + 光柱
 */
export function BlindboxBox3D({ state, tint = '#a78bfa', size = 280, onAnimationDone }: BlindboxBox3DProps) {
  return (
    <div style={{ width: size, height: size }}>
      <Canvas dpr={[1, 2]} camera={{ position: [0, 0.7, 4.0], fov: 42 }}>
        <ambientLight intensity={0.85} />
        <directionalLight position={[3, 5, 2]} intensity={2.4} color="#fff" />
        <directionalLight position={[-3, -2, -3]} intensity={0.7} color={tint} />
        <pointLight position={[0, 2.5, 1.5]} intensity={1.4} color={tint} distance={6} />
        <Box state={state} tint={tint} onDone={onAnimationDone} />
      </Canvas>
    </div>
  );
}

function Box({
  state,
  tint,
  onDone,
}: {
  state: BlindboxBox3DProps['state'];
  tint: string;
  onDone?: () => void;
}) {
  const groupRef = useRef<Group>(null);
  const lidRef = useRef<Group>(null);
  const beamRef = useRef<Mesh>(null);
  const velocityRef = useRef(0);
  const [, force] = useState(0);
  const phase = useRef<'idle' | 'spin' | 'decelerate' | 'open'>('idle');
  const elapsedRef = useRef(0);
  const idleTRef = useRef(0);

  useEffect(() => {
    if (state === 'spinning') {
      velocityRef.current = 14;
      phase.current = 'spin';
      elapsedRef.current = 0;
      force((n) => n + 1);
    } else if (state === 'opening') {
      phase.current = 'decelerate';
      elapsedRef.current = 0;
      force((n) => n + 1);
    } else if (state === 'idle') {
      phase.current = 'idle';
      velocityRef.current = 0;
      // reset lid
      if (lidRef.current) {
        lidRef.current.position.y = 0.64;
        lidRef.current.rotation.z = 0;
        lidRef.current.scale.setScalar(1);
      }
      if (beamRef.current) {
        beamRef.current.scale.y = 0.001;
      }
    }
  }, [state]);

  useFrame((_, dt) => {
    if (!groupRef.current) return;
    elapsedRef.current += dt;

    if (phase.current === 'spin') {
      groupRef.current.rotation.y += velocityRef.current * dt;
      groupRef.current.position.y = Math.sin(elapsedRef.current * 16) * 0.07;
    } else if (phase.current === 'decelerate') {
      velocityRef.current = Math.max(0, velocityRef.current - dt * 12);
      groupRef.current.rotation.y += velocityRef.current * dt;
      groupRef.current.position.y = MathUtils.lerp(groupRef.current.position.y, 0, dt * 6);
      if (velocityRef.current < 0.3) {
        phase.current = 'open';
        elapsedRef.current = 0;
      }
    } else if (phase.current === 'open') {
      if (lidRef.current) {
        lidRef.current.position.y = MathUtils.lerp(lidRef.current.position.y, 1.6, dt * 3.5);
        lidRef.current.rotation.z = MathUtils.lerp(lidRef.current.rotation.z, 0.4, dt * 3);
        const s = MathUtils.lerp(lidRef.current.scale.x, 0.0, dt * 3.5);
        lidRef.current.scale.setScalar(s);
      }
      if (beamRef.current) {
        beamRef.current.scale.y = Math.min(2.4, elapsedRef.current * 2.2);
        const mat = beamRef.current.material as { opacity?: number; transparent?: boolean };
        if (mat) {
          mat.transparent = true;
          mat.opacity = Math.max(0, 0.9 - elapsedRef.current * 0.3);
        }
      }
      if (elapsedRef.current > 1.1 && onDone) {
        onDone();
        phase.current = 'idle';
      }
    } else {
      // idle: 漂浮 + 缓慢自转
      idleTRef.current += dt;
      groupRef.current.rotation.y += dt * 0.45;
      groupRef.current.rotation.x = Math.sin(idleTRef.current * 0.8) * 0.07;
      groupRef.current.position.y = Math.sin(idleTRef.current * 1.4) * 0.1;
    }
  });

  return (
    <group ref={groupRef}>
      {/* 光柱（中奖时升起） */}
      <mesh ref={beamRef} position={[0, 1.6, 0]} scale={[0.4, 0.001, 0.4]}>
        <cylinderGeometry args={[0.5, 0.25, 2.6, 16, 1, true]} />
        <meshBasicMaterial color={tint} transparent opacity={0} side={2} />
      </mesh>

      {/* 主盒身 */}
      <mesh>
        <boxGeometry args={[1.3, 1.3, 1.3]} />
        <meshPhysicalMaterial
          color={tint}
          metalness={0.4}
          roughness={0.15}
          clearcoat={1}
          clearcoatRoughness={0.05}
          emissive={tint}
          emissiveIntensity={0.22}
        />
      </mesh>

      {/* 金色缎带 - 横 */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[1.34, 0.17, 1.34]} />
        <meshStandardMaterial color="#fcd34d" metalness={0.8} roughness={0.22} />
      </mesh>
      {/* 金色缎带 - 竖（左右环绕） */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.17, 1.34, 1.34]} />
        <meshStandardMaterial color="#fcd34d" metalness={0.8} roughness={0.22} />
      </mesh>

      {/* 顶部盖子 */}
      <group ref={lidRef} position={[0, 0.64, 0]}>
        <mesh>
          <boxGeometry args={[1.4, 0.22, 1.4]} />
          <meshPhysicalMaterial
            color={tint}
            metalness={0.45}
            roughness={0.12}
            clearcoat={1}
            clearcoatRoughness={0.04}
            emissive={tint}
            emissiveIntensity={0.3}
          />
        </mesh>
        {/* 蝴蝶结：两个交叉环 */}
        <mesh position={[0, 0.17, 0]}>
          <torusGeometry args={[0.22, 0.08, 14, 28]} />
          <meshStandardMaterial color="#fcd34d" metalness={0.85} roughness={0.2} />
        </mesh>
        <mesh position={[0, 0.17, 0]} rotation={[0, Math.PI / 2, 0]}>
          <torusGeometry args={[0.22, 0.08, 14, 28]} />
          <meshStandardMaterial color="#fcd34d" metalness={0.85} roughness={0.2} />
        </mesh>
      </group>

      {/* 底部反光圆盘 */}
      <mesh position={[0, -0.7, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.8, 1.1, 32]} />
        <meshBasicMaterial color={tint} transparent opacity={0.25} />
      </mesh>
    </group>
  );
}
