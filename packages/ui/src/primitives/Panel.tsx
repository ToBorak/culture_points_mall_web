import type { CSSProperties, ReactNode } from 'react';

export type PanelShadow = 'ink' | 'red' | 'blue' | 'yellow' | 'green' | 'pink' | 'purple' | 'teal' | 'orange';

export interface PanelProps {
  className?: string;
  shadow?: PanelShadow;
  children?: ReactNode;
  style?: CSSProperties;
}

const shadowVar: Record<PanelShadow, string> = {
  ink: 'var(--cpm-shadow-panel)',
  red: 'var(--cpm-shadow-panel-red)',
  blue: 'var(--cpm-shadow-panel-blue)',
  yellow: 'var(--cpm-shadow-panel-yellow)',
  green: '6px 6px 0 var(--cpm-green)',
  pink: '6px 6px 0 var(--cpm-pink)',
  purple: '6px 6px 0 var(--cpm-purple)',
  teal: '6px 6px 0 var(--cpm-teal)',
  orange: '6px 6px 0 var(--cpm-orange)',
};

export function Panel({ className, shadow = 'ink', children, style }: PanelProps) {
  const css: CSSProperties = {
    background: 'var(--cpm-paper)',
    border: '3px solid var(--cpm-ink)',
    borderRadius: 'var(--cpm-radius-panel)',
    boxShadow: shadowVar[shadow],
    padding: '18px 22px',
    position: 'relative',
    ...style,
  };
  return (
    <div className={className} style={css}>
      {children}
    </div>
  );
}
