import type { ButtonHTMLAttributes, ReactNode } from 'react';

export interface ComicButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  tone?: 'yellow' | 'red' | 'blue' | 'green' | 'pink' | 'purple';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
}

const toneMap = {
  yellow: { bg: 'var(--cpm-yellow)', fg: 'var(--cpm-ink)' },
  red: { bg: 'var(--cpm-red)', fg: 'var(--cpm-paper)' },
  blue: { bg: 'var(--cpm-blue)', fg: 'var(--cpm-paper)' },
  green: { bg: 'var(--cpm-green)', fg: 'var(--cpm-ink)' },
  pink: { bg: 'var(--cpm-pink)', fg: 'var(--cpm-paper)' },
  purple: { bg: 'var(--cpm-purple)', fg: 'var(--cpm-paper)' },
};

const sizeMap = {
  sm: { padding: '6px 14px', fontSize: 14 },
  md: { padding: '10px 22px', fontSize: 17 },
  lg: { padding: '14px 30px', fontSize: 22 },
};

export function ComicButton({ tone = 'yellow', size = 'md', style, children, ...rest }: ComicButtonProps) {
  const t = toneMap[tone];
  const s = sizeMap[size];
  return (
    <button
      {...rest}
      style={{
        background: t.bg,
        color: t.fg,
        border: '3px solid var(--cpm-ink)',
        borderRadius: 'var(--cpm-radius-button)',
        fontFamily: '"ZCOOL KuaiLe", "PingFang SC", sans-serif',
        fontWeight: 600,
        boxShadow: 'var(--cpm-shadow-button)',
        cursor: 'pointer',
        transition: 'transform .12s ease, box-shadow .12s ease',
        ...s,
        ...style,
      }}
      onMouseDown={(e) => {
        (e.currentTarget as HTMLElement).style.transform = 'translate(2px, 2px)';
        (e.currentTarget as HTMLElement).style.boxShadow = '1px 1px 0 var(--cpm-ink)';
      }}
      onMouseUp={(e) => {
        (e.currentTarget as HTMLElement).style.transform = '';
        (e.currentTarget as HTMLElement).style.boxShadow = 'var(--cpm-shadow-button)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.transform = '';
        (e.currentTarget as HTMLElement).style.boxShadow = 'var(--cpm-shadow-button)';
      }}
    >
      {children}
    </button>
  );
}
