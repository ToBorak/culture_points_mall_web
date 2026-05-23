import type { CSSProperties, ReactNode } from 'react';

export interface AuroraBgProps {
  children?: ReactNode;
  className?: string;
  /** 'page' 全屏 / 'section' 区块 */
  variant?: 'page' | 'section';
}

/**
 * 浅色 mesh-gradient 背景（暖白 + 淡彩光斑），适配 Bento 图标网格风格。
 */
export function AuroraBg({ children, className = '', variant = 'page' }: AuroraBgProps) {
  const base: CSSProperties = {
    position: 'relative',
    minHeight: variant === 'page' ? '100vh' : 'auto',
    background: 'var(--cpm-bg-0)',
    color: 'var(--cpm-text-primary)',
    overflow: 'hidden',
    isolation: 'isolate',
  };

  const orbStyle = (
    color: string,
    size: number,
    x: string,
    y: string,
    delay: number,
  ): CSSProperties => ({
    position: 'absolute',
    width: size,
    height: size,
    left: x,
    top: y,
    background: `radial-gradient(circle, ${color} 0%, transparent 65%)`,
    filter: 'blur(80px)',
    borderRadius: '50%',
    animation: `cpm-aurora-drift ${22 + delay * 4}s ease-in-out infinite`,
    animationDelay: `${delay}s`,
    pointerEvents: 'none',
    zIndex: 0,
  });

  return (
    <div className={className} style={base}>
      <div style={orbStyle('var(--cpm-mesh-1)', 460, '-15%', '-5%', 0)} />
      <div style={orbStyle('var(--cpm-mesh-3)', 380, '65%', '5%', 2)} />
      <div style={orbStyle('var(--cpm-mesh-2)', 360, '-5%', '55%', 4)} />
      <div style={orbStyle('var(--cpm-mesh-4)', 340, '70%', '60%', 6)} />
      <div style={{ position: 'relative', zIndex: 1 }}>{children}</div>
    </div>
  );
}
