import type { CSSProperties } from 'react';

export interface StampProps {
  text: string;
  color?: 'red' | 'blue' | 'green';
  rotation?: number;
  className?: string;
}

const colorMap = {
  red: 'var(--cpm-red)',
  blue: 'var(--cpm-blue)',
  green: 'var(--cpm-green)',
};

export function Stamp({ text, color = 'red', rotation = -12, className }: StampProps) {
  const c = colorMap[color];
  const style: CSSProperties = {
    fontFamily: 'var(--cpm-font-bangers, "Bangers", cursive)',
    border: `4px double ${c}`,
    color: c,
    padding: '6px 14px',
    fontSize: 22,
    transform: `rotate(${rotation}deg)`,
    letterSpacing: 2,
    opacity: 0.85,
    borderRadius: 6,
    display: 'inline-block',
  };
  return (
    <span className={className} style={style}>
      {text}
    </span>
  );
}
