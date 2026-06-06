import { Coins } from 'lucide-react';
import type { CSSProperties } from 'react';
import { formatPoints } from '../lib/format.ts';

export interface PointsPillProps {
  value: number;
  style?: CSSProperties;
}

export function PointsPill({ value, style }: PointsPillProps) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        background: 'var(--cpm-gold-soft)',
        color: 'var(--cpm-gold-ink)',
        borderRadius: 'var(--cpm-r-pill)',
        padding: '6px 12px 6px 9px',
        fontFamily: 'var(--cpm-font-num)',
        fontWeight: 800,
        fontSize: 15,
        lineHeight: 1,
        ...style,
      }}
    >
      <Coins size={16} style={{ color: 'var(--cpm-gold)' }} aria-hidden />
      <span>{formatPoints(value)}</span>
    </span>
  );
}
