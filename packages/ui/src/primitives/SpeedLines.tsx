import type { CSSProperties } from 'react';

export interface SpeedLinesProps {
  className?: string;
  angle?: number;
  opacity?: number;
}

export function SpeedLines({ className, angle = 75, opacity = 0.05 }: SpeedLinesProps) {
  const style: CSSProperties = {
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
    backgroundImage: `repeating-linear-gradient(${angle}deg, transparent, transparent 14px, rgba(0,0,0,${opacity}) 14px, rgba(0,0,0,${opacity}) 16px)`,
  };
  return <div className={className} style={style} aria-hidden />;
}
