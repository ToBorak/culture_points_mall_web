import { Canvas, useFrame } from '@react-three/fiber';
import { MeshReflectorMaterial, OrbitControls } from '@react-three/drei';
import { useMemo, useRef } from 'react';
import type { Group, Mesh, Points } from 'three';
import { Color } from 'three';

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

/**
 * 文化护照价值观雷达 - 水晶塔风格
 * - 6 个维度均匀分布在圆形舞台上
 * - 每个维度对应一座六棱晶塔 + 尖顶（高度 = 该维度分数的归一化值）
 * - 物理材质金属高光 + 自发光环境光，配上反射地板，整体氛围像新品发布会
 * - 顶部 HTML 浮标显示具体分数与维度名
 */
export function RadarChart3D({ data, size = 320 }: RadarChart3DProps) {
  const maxInData = useMemo(
    () => Math.max(1, ...data.map((d) => d.score)),
    [data],
  );

  return (
    <div style={{ width: size, height: size, position: 'relative' }}>
      {/* 背景柔光 mesh (画布外的纯 CSS) */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(circle at 50% 60%, rgba(124,58,237,0.16) 0%, rgba(8,145,178,0.10) 35%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 0,
          borderRadius: 18,
        }}
      />
      <Canvas
        dpr={[1, 2]}
        camera={{ position: [0, 2.4, 5.2], fov: 36 }}
        style={{ position: 'relative', zIndex: 1 }}
      >
        {/* 三点光照：主光 + 补光 + 背光（轮廓光） */}
        <ambientLight intensity={0.45} />
        <directionalLight position={[5, 8, 4]} intensity={2.4} color="#ffffff" castShadow />
        <directionalLight position={[-4, 3, -4]} intensity={0.9} color="#a78bfa" />
        <directionalLight position={[0, 6, -6]} intensity={1.4} color="#06b6d4" />
        <pointLight position={[0, 3.5, 0]} intensity={0.7} color="#fff" distance={8} />

        {/* 反射地板 */}
        <Floor />

        {/* 6 座水晶塔 */}
        {data.map((d, i) => (
          <CrystalTower key={d.code} dim={d} idx={i} total={data.length} maxScore={maxInData} />
        ))}

        {/* 漂浮粒子尘 */}
        <ParticleDust count={80} />

        {/* 慢转 */}
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          enableRotate={false}
          autoRotate
          autoRotateSpeed={0.5}
          target={[0, 0.8, 0]}
        />
      </Canvas>
    </div>
  );
}

function Floor() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.001, 0]} receiveShadow>
      <circleGeometry args={[2.6, 64]} />
      <MeshReflectorMaterial
        blur={[400, 100]}
        resolution={512}
        mixBlur={1.2}
        mixStrength={1.6}
        mirror={0.6}
        roughness={0.6}
        depthScale={0.5}
        minDepthThreshold={0.4}
        maxDepthThreshold={1.4}
        color="#fafbff"
        metalness={0.3}
      />
    </mesh>
  );
}

function CrystalTower({
  dim,
  idx,
  total,
  maxScore,
}: {
  dim: RadarDimension;
  idx: number;
  total: number;
  maxScore: number;
}) {
  const ref = useRef<Group>(null);
  const haloRef = useRef<Mesh>(null);
  const orbRef = useRef<Mesh>(null);
  const angle = (idx / total) * Math.PI * 2 - Math.PI / 2;
  const radius = 1.55;
  const x = Math.cos(angle) * radius;
  const z = Math.sin(angle) * radius;

  // 归一化：让最高分顶到 2.4，其它按比例
  const ratio = dim.score / Math.max(maxScore, 1);
  const targetHeight = 0.18 + Math.pow(ratio, 0.55) * 2.22;
  const tipHeight = 0.4;
  const fade = Math.min(1, ratio * 4);
  const isDominant = ratio > 0.6;

  const t0 = useRef<number>(idx * 0.7);
  useFrame((_, dt) => {
    if (!ref.current) return;
    t0.current += dt;
    ref.current.position.y = Math.sin(t0.current * 1.1) * 0.04;
    ref.current.rotation.y += dt * 0.35;
    if (orbRef.current && isDominant) {
      const pulse = 0.7 + Math.sin(t0.current * 2.5) * 0.3;
      (orbRef.current.material as { opacity?: number }).opacity = pulse;
    }
    if (haloRef.current && isDominant) {
      const s = 1 + Math.sin(t0.current * 1.6) * 0.08;
      haloRef.current.scale.set(s, s, s);
    }
  });

  const emColor = new Color(dim.color);
  const litColor = new Color(dim.color).lerp(new Color('#ffffff'), Math.max(0, 0.22 - fade * 0.18));

  return (
    <group position={[x, 0, z]}>
      <group ref={ref}>
        {/* 主塔身 */}
        <mesh position={[0, targetHeight / 2, 0]} castShadow>
          <cylinderGeometry args={[0.22, 0.28, targetHeight, 6, 1, false]} />
          <meshPhysicalMaterial
            color={litColor}
            metalness={0.5}
            roughness={0.1}
            clearcoat={1}
            clearcoatRoughness={0.04}
            emissive={emColor}
            emissiveIntensity={0.22 + fade * 0.55}
          />
        </mesh>
        {/* 塔尖 */}
        <mesh position={[0, targetHeight + tipHeight / 2, 0]} castShadow>
          <coneGeometry args={[0.22, tipHeight, 6, 1]} />
          <meshPhysicalMaterial
            color={litColor}
            metalness={0.65}
            roughness={0.06}
            clearcoat={1}
            clearcoatRoughness={0.02}
            emissive={emColor}
            emissiveIntensity={0.4 + fade * 0.9}
          />
        </mesh>
        {/* 顶点光球（主塔脉动） */}
        <mesh ref={orbRef} position={[0, targetHeight + tipHeight + 0.1, 0]}>
          <sphereGeometry args={[0.055, 24, 24]} />
          <meshBasicMaterial color={emColor} transparent opacity={1} />
        </mesh>
        {/* 主塔光晕球 */}
        {isDominant && (
          <mesh ref={haloRef} position={[0, targetHeight + tipHeight + 0.1, 0]}>
            <sphereGeometry args={[0.24, 24, 24]} />
            <meshBasicMaterial color={emColor} transparent opacity={0.22} depthWrite={false} />
          </mesh>
        )}
        {/* 主塔向上光柱 */}
        {isDominant && (
          <mesh position={[0, targetHeight + tipHeight + 0.7, 0]}>
            <cylinderGeometry args={[0.05, 0.2, 1.4, 12, 1, true]} />
            <meshBasicMaterial color={emColor} transparent opacity={0.18} depthWrite={false} side={2} />
          </mesh>
        )}
      </group>

      {/* 底座光环 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, 0]}>
        <ringGeometry args={[0.32, 0.5, 48]} />
        <meshBasicMaterial color={emColor} transparent opacity={0.42 + fade * 0.4} depthWrite={false} />
      </mesh>
      {/* 底座扩散光斑 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
        <circleGeometry args={[0.85, 48]} />
        <meshBasicMaterial color={emColor} transparent opacity={0.06 + fade * 0.22} depthWrite={false} />
      </mesh>
    </group>
  );
}

function ParticleDust({ count }: { count: number }) {
  const ref = useRef<Points>(null);
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 0.6 + Math.random() * 2.0;
      const theta = Math.random() * Math.PI * 2;
      const y = Math.random() * 3.4;
      arr[i * 3] = Math.cos(theta) * r;
      arr[i * 3 + 1] = y;
      arr[i * 3 + 2] = Math.sin(theta) * r;
    }
    return arr;
  }, [count]);

  useFrame((_, dt) => {
    if (!ref.current) return;
    ref.current.rotation.y += dt * 0.05;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#a78bfa"
        size={0.035}
        sizeAttenuation
        transparent
        opacity={0.6}
        depthWrite={false}
      />
    </points>
  );
}
