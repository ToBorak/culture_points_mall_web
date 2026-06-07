import { motion, useSpring, useTransform } from 'framer-motion';
import { type ReactNode, useEffect } from 'react';
import { GlassCard } from '../primitives/GlassCard';
import type { GlassTone } from '../primitives/GlassCard';

export interface StatCardProps {
  label: string;
  value: number;
  suffix?: string;
  icon?: ReactNode;
  tone?: GlassTone;
  hint?: string;
}

export function StatCard({ label, value, suffix, icon, tone = 'violet', hint }: StatCardProps) {
  const spring = useSpring(0, { stiffness: 60, damping: 18 });
  const display = useTransform(spring, (v) => Math.round(v).toLocaleString());

  // biome-ignore lint/correctness/useExhaustiveDependencies: spring.set is stable
  useEffect(() => {
    spring.set(value);
  }, [value]);

  return (
    <GlassCard tone={tone} hoverable padding="lg">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 8,
          }}
        >
          <span
            style={{
              fontSize: 13,
              color: 'var(--cpm-text-secondary)',
              fontWeight: 500,
              letterSpacing: '0.02em',
              textTransform: 'uppercase',
            }}
          >
            {label}
          </span>
          {icon && (
            <span
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: 'var(--cpm-glass-bg)',
                border: '1px solid var(--cpm-glass-border)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--cpm-brand-violet-light)',
              }}
            >
              {icon}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
          <motion.span
            style={{
              fontSize: 42,
              fontWeight: 700,
              letterSpacing: 'var(--cpm-tracking-tight)',
              fontFeatureSettings: '"tnum"',
              background: 'linear-gradient(135deg, #fff 30%, rgba(255,255,255,0.6) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              lineHeight: 1,
            }}
          >
            {display}
          </motion.span>
          {suffix && <span style={{ fontSize: 16, color: 'var(--cpm-text-tertiary)', fontWeight: 500 }}>{suffix}</span>}
        </div>
        {hint && <span style={{ fontSize: 12, color: 'var(--cpm-text-tertiary)' }}>{hint}</span>}
      </div>
    </GlassCard>
  );
}
