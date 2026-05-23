import { motion } from 'framer-motion';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

export type ButtonTone = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  tone?: ButtonTone;
  size?: ButtonSize;
  children: ReactNode;
  icon?: ReactNode;
}

const sizeMap: Record<ButtonSize, { px: number; py: number; fs: number; radius: number }> = {
  sm: { px: 14, py: 8, fs: 13, radius: 10 },
  md: { px: 20, py: 12, fs: 14, radius: 12 },
  lg: { px: 28, py: 16, fs: 16, radius: 14 },
};

export function Button({
  tone = 'primary',
  size = 'md',
  children,
  icon,
  style,
  disabled,
  ...rest
}: ButtonProps) {
  const sz = sizeMap[size];

  const styles: Record<ButtonTone, React.CSSProperties> = {
    primary: {
      background:
        'linear-gradient(135deg, var(--cpm-brand-violet) 0%, var(--cpm-brand-cyan) 100%)',
      color: '#fff',
      border: '1px solid rgba(255,255,255,0.18)',
      boxShadow: 'var(--cpm-shadow-glow-violet)',
    },
    secondary: {
      background: 'var(--cpm-glass-bg)',
      color: 'var(--cpm-text-primary)',
      border: '1px solid var(--cpm-glass-border-strong)',
      backdropFilter: 'var(--cpm-blur-glass)',
      WebkitBackdropFilter: 'var(--cpm-blur-glass)',
    },
    ghost: {
      background: 'transparent',
      color: 'var(--cpm-text-secondary)',
      border: '1px solid transparent',
    },
    danger: {
      background: 'var(--cpm-danger)',
      color: '#fff',
      border: '1px solid rgba(255,255,255,0.18)',
      boxShadow: 'var(--cpm-shadow-glow-rose)',
    },
  };

  return (
    <motion.button
      type="button"
      {...(rest as Record<string, unknown>)}
      disabled={disabled}
      whileHover={disabled ? undefined : { scale: 1.02 }}
      whileTap={disabled ? undefined : { scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 350, damping: 22 }}
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        padding: `${sz.py}px ${sz.px}px`,
        fontSize: sz.fs,
        fontWeight: 600,
        fontFamily: 'var(--cpm-font-sans)',
        letterSpacing: '0.01em',
        borderRadius: sz.radius,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'all 0.2s ease',
        ...styles[tone],
        ...style,
      }}
    >
      {icon && <span style={{ display: 'inline-flex' }}>{icon}</span>}
      <span>{children}</span>
    </motion.button>
  );
}
