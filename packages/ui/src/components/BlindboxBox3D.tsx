import { RoundedBox } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import { useEffect, useRef, useState } from 'react';
import type { Group, Mesh } from 'three';
import { MathUtils } from 'three';

const SPARK_PARTICLES = Array.from({ length: 10 }, (_, index) => ({ id: `spark-${index}`, index }));

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
      <Canvas dpr={[1, 2]} camera={{ position: [0, 0.76, 5.08], fov: 33 }}>
        <ambientLight intensity={0.78} />
        <directionalLight position={[3.2, 5.2, 2.4]} intensity={2.25} color="#fff" />
        <directionalLight position={[-3, 1.1, -3]} intensity={0.65} color={tint} />
        <pointLight position={[0, 2.3, 1.55]} intensity={1.35} color={tint} distance={5.8} />
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
  const phase = useRef<'idle' | 'spin' | 'decelerate' | 'open' | 'done'>('idle');
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
      velocityRef.current = Math.min(velocityRef.current || 5.4, 5.4);
      elapsedRef.current = 0;
      force((n) => n + 1);
    } else if (state === 'idle') {
      phase.current = 'idle';
      velocityRef.current = 0;
      // reset lid
      if (lidRef.current) {
        lidRef.current.position.x = 0;
        lidRef.current.position.y = 0.64;
        lidRef.current.position.z = 0;
        lidRef.current.rotation.x = 0;
        lidRef.current.rotation.y = 0;
        lidRef.current.rotation.z = 0;
        lidRef.current.scale.setScalar(1);
      }
      if (beamRef.current) {
        beamRef.current.scale.y = 0.001;
        const mat = beamRef.current.material as { opacity?: number };
        if (mat) mat.opacity = 0;
      }
      if (groupRef.current) {
        groupRef.current.scale.setScalar(1);
        groupRef.current.rotation.z = 0;
      }
    }
  }, [state]);

  useFrame((_, dt) => {
    if (!groupRef.current) return;
    elapsedRef.current += dt;

    if (phase.current === 'spin') {
      const ramp = Math.min(1, elapsedRef.current / 0.55);
      velocityRef.current = MathUtils.lerp(8, 17, ramp);
      groupRef.current.rotation.y += velocityRef.current * dt;
      groupRef.current.rotation.z = Math.sin(elapsedRef.current * 5.5) * 0.045;
      groupRef.current.position.y = Math.sin(elapsedRef.current * 11) * 0.055 + ramp * 0.09;
      groupRef.current.scale.setScalar(1 + Math.sin(elapsedRef.current * 9) * 0.022);
    } else if (phase.current === 'decelerate') {
      velocityRef.current = Math.max(0, velocityRef.current - dt * 22);
      groupRef.current.rotation.y += velocityRef.current * dt;
      groupRef.current.rotation.z = MathUtils.lerp(groupRef.current.rotation.z, 0, dt * 7);
      groupRef.current.position.y = MathUtils.lerp(groupRef.current.position.y, 0.02, dt * 7);
      groupRef.current.scale.setScalar(MathUtils.lerp(groupRef.current.scale.x, 1.02, dt * 6));
      if (velocityRef.current < 0.35 || elapsedRef.current > 0.34) {
        phase.current = 'open';
        elapsedRef.current = 0;
      }
    } else if (phase.current === 'open') {
      const t = Math.min(1, elapsedRef.current / 0.98);
      const ease = 1 - (1 - t) ** 3;
      const lift = ease * 0.42 + Math.sin(t * Math.PI) * 0.04;
      if (lidRef.current) {
        lidRef.current.position.x = MathUtils.lerp(lidRef.current.position.x, 0.24 * ease, dt * 8);
        lidRef.current.position.y = MathUtils.lerp(lidRef.current.position.y, 0.64 + lift, dt * 8);
        lidRef.current.position.z = MathUtils.lerp(lidRef.current.position.z, -0.62 * ease, dt * 8);
        lidRef.current.rotation.x = MathUtils.lerp(lidRef.current.rotation.x, -0.88 * ease, dt * 8);
        lidRef.current.rotation.y = MathUtils.lerp(lidRef.current.rotation.y, 0.12 * ease, dt * 7);
        lidRef.current.rotation.z = MathUtils.lerp(lidRef.current.rotation.z, 0.2 * ease, dt * 7);
        const s = MathUtils.lerp(lidRef.current.scale.x, 0.98, dt * 6);
        lidRef.current.scale.setScalar(s);
      }
      if (beamRef.current) {
        beamRef.current.scale.y = MathUtils.lerp(beamRef.current.scale.y, 0.82, dt * 7);
        const mat = beamRef.current.material as { opacity?: number; transparent?: boolean };
        if (mat) {
          mat.transparent = true;
          mat.opacity = 0.12 * (1 - t * 0.52);
        }
      }
      groupRef.current.position.y = MathUtils.lerp(groupRef.current.position.y, 0.02, dt * 5);
      groupRef.current.scale.setScalar(1.01 + Math.sin(t * Math.PI) * 0.018);
      if (elapsedRef.current > 1.04 && onDone) {
        onDone();
        phase.current = 'done';
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
      <mesh ref={beamRef} position={[0, 1.0, 0]} scale={[0.28, 0.001, 0.28]}>
        <cylinderGeometry args={[0.3, 0.16, 1.45, 28, 1, true]} />
        <meshBasicMaterial color={tint} transparent opacity={0} side={2} />
      </mesh>
      {SPARK_PARTICLES.map((particle) => (
        <SparkParticle key={particle.id} index={particle.index} active={state === 'opening'} tint={tint} />
      ))}

      <RoundedBox args={[1.28, 1.22, 1.28]} radius={0.075} smoothness={8}>
        <meshPhysicalMaterial
          color={tint}
          metalness={0.12}
          roughness={0.34}
          clearcoat={0.82}
          clearcoatRoughness={0.16}
          emissive={tint}
          emissiveIntensity={0.04}
        />
      </RoundedBox>

      <RoundedBox args={[1.34, 0.14, 1.34]} radius={0.025} smoothness={4} position={[0, -0.02, 0]}>
        <meshStandardMaterial
          color="#ffd76a"
          metalness={0.42}
          roughness={0.24}
          emissive="#5f3d00"
          emissiveIntensity={0.08}
        />
      </RoundedBox>
      <RoundedBox args={[0.14, 1.26, 1.34]} radius={0.025} smoothness={4} position={[0, -0.02, 0]}>
        <meshStandardMaterial
          color="#ffd76a"
          metalness={0.42}
          roughness={0.24}
          emissive="#5f3d00"
          emissiveIntensity={0.08}
        />
      </RoundedBox>

      <group ref={lidRef} position={[0, 0.64, 0]}>
        <RoundedBox args={[1.42, 0.2, 1.42]} radius={0.06} smoothness={8}>
          <meshPhysicalMaterial
            color={tint}
            metalness={0.14}
            roughness={0.3}
            clearcoat={0.82}
            clearcoatRoughness={0.16}
            emissive={tint}
            emissiveIntensity={0.06}
          />
        </RoundedBox>
        <mesh position={[0, 0.17, 0]}>
          <torusGeometry args={[0.22, 0.08, 14, 28]} />
          <meshStandardMaterial
            color="#ffd76a"
            metalness={0.44}
            roughness={0.22}
            emissive="#5f3d00"
            emissiveIntensity={0.08}
          />
        </mesh>
        <mesh position={[0, 0.17, 0]} rotation={[0, Math.PI / 2, 0]}>
          <torusGeometry args={[0.22, 0.08, 14, 28]} />
          <meshStandardMaterial
            color="#ffd76a"
            metalness={0.44}
            roughness={0.22}
            emissive="#5f3d00"
            emissiveIntensity={0.08}
          />
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

function SparkParticle({ index, active, tint }: { index: number; active: boolean; tint: string }) {
  const ref = useRef<Mesh>(null);
  const tRef = useRef(0);
  const angle = (index / 10) * Math.PI * 2;

  useFrame((_, dt) => {
    if (!ref.current) return;
    if (!active) {
      tRef.current = 0;
      ref.current.scale.setScalar(0.001);
      const mat = ref.current.material as { opacity?: number };
      if (mat) mat.opacity = 0;
      return;
    }
    tRef.current += dt;
    const t = Math.min(1, tRef.current / 1.05);
    const drift = 0.26 + t * (0.42 + (index % 3) * 0.08);
    ref.current.position.set(Math.cos(angle) * drift, 0.38 + t * (0.62 + (index % 2) * 0.18), Math.sin(angle) * drift);
    ref.current.scale.setScalar(Math.max(0.001, Math.sin(t * Math.PI) * 0.035));
    const mat = ref.current.material as { opacity?: number; transparent?: boolean };
    if (mat) {
      mat.transparent = true;
      mat.opacity = Math.max(0, 0.72 * (1 - t));
    }
  });

  return (
    <mesh ref={ref} position={[0, 0.4, 0]} scale={[0.001, 0.001, 0.001]}>
      <octahedronGeometry args={[1, 0]} />
      <meshBasicMaterial color={index % 2 === 0 ? '#ffffff' : tint} transparent opacity={0} />
    </mesh>
  );
}
