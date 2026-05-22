import { motion, useSpring, useTransform } from 'framer-motion';
import { useEffect } from 'react';

export interface StatTileProps {
  label: string;
  value: number;
  suffix?: string;
  icon: string;
  tint?: string;
  bg?: string;
  /** optional small delta indicator */
  delta?: number;
}

export function StatTile({
  label,
  value,
  suffix,
  icon,
  tint = 'var(--cpm-brand-violet)',
  bg = 'var(--cpm-brand-violet-bg)',
  delta,
}: StatTileProps) {
  const spring = useSpring(0, { stiffness: 60, damping: 18 });
  const display = useTransform(spring, (v) => Math.round(v).toLocaleString());

  // biome-ignore lint/correctness/useExhaustiveDependencies: spring.set is stable
  useEffect(() => {
    spring.set(value);
  }, [value]);

  return (
    <motion.div
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 350, damping: 22 }}
      style={{
        background: '#fff',
        border: '1px solid var(--cpm-card-border)',
        borderRadius: 18,
        padding: '20px 20px 18px',
        boxShadow: 'var(--cpm-shadow-soft)',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: '0.12em',
            color: 'var(--cpm-text-tertiary)',
            textTransform: 'uppercase',
          }}
        >
          {label}
        </span>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 11,
            background: bg,
            color: tint,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 18,
          }}
        >
          {icon}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
        <motion.span
          style={{
            fontSize: 34,
            fontWeight: 700,
            color: 'var(--cpm-text-primary)',
            letterSpacing: '-0.02em',
            fontFeatureSettings: '"tnum"',
            lineHeight: 1,
          }}
        >
          {display}
        </motion.span>
        {suffix && (
          <span style={{ fontSize: 14, color: 'var(--cpm-text-tertiary)', fontWeight: 500 }}>
            {suffix}
          </span>
        )}
      </div>
      {delta !== undefined && (
        <span
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: delta >= 0 ? 'var(--cpm-success)' : 'var(--cpm-danger)',
          }}
        >
          {delta >= 0 ? '↑' : '↓'} {Math.abs(delta).toLocaleString()}
        </span>
      )}
    </motion.div>
  );
}
