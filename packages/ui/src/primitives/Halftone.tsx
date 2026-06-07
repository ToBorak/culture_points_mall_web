import type { CSSProperties, ReactNode } from 'react';

export interface HalftoneProps {
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
  intensity?: 'light' | 'normal' | 'heavy';
}

const intensityMap = {
  light: 'rgba(0,0,0,0.04)',
  normal: 'rgba(0,0,0,0.08)',
  heavy: 'rgba(0,0,0,0.16)',
};

export function Halftone({ className, style, children, intensity = 'normal' }: HalftoneProps) {
  const color = intensityMap[intensity];
  const bg: CSSProperties = {
    position: 'relative',
    backgroundImage: `radial-gradient(circle at 20% 30%, ${color} 1px, transparent 1.6px), radial-gradient(circle at 70% 70%, ${color} 1px, transparent 1.6px)`,
    backgroundSize: '18px 18px, 26px 26px',
    ...style,
  };
  return (
    <div className={className} style={bg}>
      {children}
    </div>
  );
}
