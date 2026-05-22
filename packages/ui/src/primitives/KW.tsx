import type { CSSProperties, ReactNode } from 'react';

export type KWTone = 'yellow' | 'pink' | 'blue';

export interface KWProps {
  children: ReactNode;
  tone?: KWTone;
}

const styleMap: Record<KWTone, CSSProperties> = {
  yellow: { background: 'linear-gradient(180deg, transparent 55%, var(--cpm-yellow) 55%)', padding: '0 3px', fontWeight: 'bold' },
  pink: { background: 'linear-gradient(180deg, transparent 55%, var(--cpm-pink) 55%)', padding: '0 3px', fontWeight: 'bold' },
  blue: { background: 'var(--cpm-blue)', color: 'var(--cpm-paper)', padding: '1px 6px', borderRadius: 4, fontWeight: 'bold' },
};

export function KW({ children, tone = 'yellow' }: KWProps) {
  return <span style={styleMap[tone]}>{children}</span>;
}
