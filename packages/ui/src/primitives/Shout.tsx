import type { CSSProperties, ReactNode } from 'react';

export type ShoutTone = 'yellow' | 'red' | 'blue' | 'pink' | 'green' | 'teal';

export interface ShoutProps {
  children: ReactNode;
  tone?: ShoutTone;
  rotation?: number;
  className?: string;
}

const toneMap: Record<ShoutTone, { bg: string; fg: string }> = {
  yellow: { bg: 'var(--cpm-yellow)', fg: 'var(--cpm-ink)' },
  red: { bg: 'var(--cpm-red)', fg: 'var(--cpm-paper)' },
  blue: { bg: 'var(--cpm-blue)', fg: 'var(--cpm-paper)' },
  pink: { bg: 'var(--cpm-pink)', fg: 'var(--cpm-paper)' },
  green: { bg: 'var(--cpm-green)', fg: 'var(--cpm-ink)' },
  teal: { bg: 'var(--cpm-teal)', fg: 'var(--cpm-paper)' },
};

export function Shout({ children, tone = 'yellow', rotation = -3, className }: ShoutProps) {
  const { bg, fg } = toneMap[tone];
  const style: CSSProperties = {
    display: 'inline-block',
    fontFamily: '"Bangers", "Permanent Marker", cursive',
    fontSize: 26,
    background: bg,
    color: fg,
    border: '3px solid var(--cpm-ink)',
    padding: '6px 16px',
    borderRadius: 8,
    transform: `rotate(${rotation}deg)`,
    boxShadow: '3px 3px 0 var(--cpm-ink)',
    letterSpacing: 1,
  };
  return (
    <span className={className} style={style}>
      {children}
    </span>
  );
}
