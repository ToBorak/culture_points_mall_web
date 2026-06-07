import type { CSSProperties } from 'react';

export interface DimensionTagProps {
  code: string;
  name: string;
  active?: boolean;
  size?: 'sm' | 'md';
  onClick?: () => void;
}

const sizeMap = {
  sm: { px: 10, py: 4, fs: 12, dot: 6 },
  md: { px: 14, py: 6, fs: 13, dot: 8 },
};

export function DimensionTag({ code, name, active = false, size = 'md', onClick }: DimensionTagProps) {
  const sz = sizeMap[size];
  const color = `var(--cpm-dim-${code}, var(--cpm-brand-violet))`;

  const style: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: `${sz.py}px ${sz.px}px`,
    fontSize: sz.fs,
    fontWeight: 500,
    fontFamily: 'var(--cpm-font-sans)',
    borderRadius: 999,
    border: '1px solid',
    borderColor: active ? color : 'var(--cpm-glass-border)',
    background: active ? `color-mix(in oklab, ${color} 18%, transparent)` : 'var(--cpm-glass-bg)',
    color: active ? color : 'var(--cpm-text-secondary)',
    cursor: onClick ? 'pointer' : 'default',
    transition: 'all 0.2s ease',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
  };

  const content = (
    <>
      <span
        style={{
          width: sz.dot,
          height: sz.dot,
          borderRadius: '50%',
          background: color,
          boxShadow: `0 0 ${sz.dot * 2}px ${color}`,
        }}
      />
      {name}
    </>
  );

  if (onClick) {
    return (
      <button type="button" style={{ ...style, font: 'inherit' }} onClick={onClick}>
        {content}
      </button>
    );
  }

  return <span style={style}>{content}</span>;
}
