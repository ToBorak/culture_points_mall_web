import { motion } from 'framer-motion';

export interface RadarChart2DProps {
  data: { code: string; name: string; score: number; max: number; color: string }[];
  size?: number;
}

export function RadarChart2D({ data, size = 320 }: RadarChart2DProps) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.4;
  const n = data.length;
  const points = data.map((d, i) => {
    const angle = -Math.PI / 2 + (i / n) * Math.PI * 2;
    const ratio = Math.min(d.score / d.max, 1);
    return {
      x: cx + Math.cos(angle) * r * ratio,
      y: cy + Math.sin(angle) * r * ratio,
      ax: cx + Math.cos(angle) * r,
      ay: cy + Math.sin(angle) * r,
      color: d.color,
      name: d.name,
    };
  });
  const path = `${points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x},${p.y}`).join(' ')} Z`;

  return (
    <svg width={size} height={size} role="img" aria-label="文化维度雷达图">
      {[0.25, 0.5, 0.75, 1].map((ratio) => (
        <polygon
          key={ratio}
          points={points.map((p) => `${cx + (p.ax - cx) * ratio},${cy + (p.ay - cy) * ratio}`).join(' ')}
          fill="none"
          stroke="rgba(0,0,0,0.1)"
          strokeWidth={2}
        />
      ))}
      {points.map((p) => (
        <line key={p.name} x1={cx} y1={cy} x2={p.ax} y2={p.ay} stroke="rgba(0,0,0,0.2)" />
      ))}
      <motion.path
        d={path}
        fill="rgba(255,217,61,0.35)"
        stroke="#ffd93d"
        strokeWidth={3}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      />
      {points.map((p) => (
        <g key={`${p.name}-l`}>
          <circle cx={p.x} cy={p.y} r={5} fill={p.color} stroke="#1a1a1a" strokeWidth={2} />
          <text x={p.ax} y={p.ay} fontSize={12} textAnchor="middle" dominantBaseline="middle" fontFamily="ZCOOL KuaiLe">
            {p.name}
          </text>
        </g>
      ))}
    </svg>
  );
}
