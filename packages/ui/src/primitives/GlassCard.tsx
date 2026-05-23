import { motion } from 'framer-motion';
import type { CSSProperties, ReactNode } from 'react';

export type GlassTone = 'default' | 'violet' | 'cyan' | 'rose' | 'amber' | 'emerald';

export interface GlassCardProps {
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
  tone?: GlassTone;
  hoverable?: boolean;
  onClick?: () => void;
  padding?: 'sm' | 'md' | 'lg';
}

const glowMap: Record<GlassTone, string> = {
  default: 'transparent',
  violet: 'var(--cpm-shadow-glow-violet)',
  cyan: 'var(--cpm-shadow-glow-cyan)',
  rose: 'var(--cpm-shadow-glow-rose)',
  amber: 'var(--cpm-shadow-glow-amber)',
  emerald: '0 0 40px rgba(52, 211, 153, 0.35)',
};

const accentMap: Record<GlassTone, string> = {
  default: 'transparent',
  violet: 'var(--cpm-brand-violet)',
  cyan: 'var(--cpm-brand-cyan)',
  rose: 'var(--cpm-brand-rose)',
  amber: 'var(--cpm-brand-amber)',
  emerald: 'var(--cpm-success)',
};

const padMap = { sm: '16px', md: '24px', lg: '32px' };

export function GlassCard({
  children,
  className = '',
  style,
  tone = 'default',
  hoverable = false,
  onClick,
  padding = 'md',
}: GlassCardProps) {
  const css: CSSProperties = {
    position: 'relative',
    background: 'var(--cpm-glass-bg)',
    backdropFilter: 'var(--cpm-blur-glass)',
    WebkitBackdropFilter: 'var(--cpm-blur-glass)',
    border: '1px solid var(--cpm-glass-border)',
    borderRadius: 'var(--cpm-radius-lg)',
    padding: padMap[padding],
    color: 'var(--cpm-text-primary)',
    boxShadow: 'var(--cpm-shadow-glass)',
    cursor: onClick ? 'pointer' : 'default',
    overflow: 'hidden',
    ...style,
  };

  return (
    <motion.div
      className={className}
      style={css}
      onClick={onClick}
      whileHover={
        hoverable
          ? {
              y: -2,
              transition: { type: 'spring', stiffness: 300, damping: 24 },
            }
          : undefined
      }
    >
      {/* 顶部高光描边 */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 1,
          background:
            'linear-gradient(90deg, transparent, var(--cpm-glass-shine) 30%, var(--cpm-glass-shine) 70%, transparent)',
          pointerEvents: 'none',
        }}
      />
      {/* tone 强调色发光（hover 时亮起） */}
      {tone !== 'default' && (
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: -1,
            borderRadius: 'inherit',
            padding: 1,
            background: `linear-gradient(135deg, ${accentMap[tone]} 0%, transparent 50%)`,
            opacity: hoverable ? 0.6 : 0.3,
            mask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
            maskComposite: 'exclude',
            WebkitMask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
            WebkitMaskComposite: 'xor',
            pointerEvents: 'none',
          }}
        />
      )}
      {hoverable && tone !== 'default' && (
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: 'inherit',
            boxShadow: glowMap[tone],
            opacity: 0,
            transition: 'opacity 0.4s ease',
            pointerEvents: 'none',
          }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.opacity = '0.6')}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.opacity = '0')}
        />
      )}
      <div style={{ position: 'relative' }}>{children}</div>
    </motion.div>
  );
}
