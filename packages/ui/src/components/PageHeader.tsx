import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  badge?: ReactNode;
  action?: ReactNode;
}

export function PageHeader({ title, subtitle, badge, action }: PageHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 24,
        gap: 12,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <h1
          style={{
            fontSize: 22,
            fontWeight: 700,
            color: 'var(--cpm-text-primary)',
            letterSpacing: '-0.02em',
            margin: 0,
            fontFamily: 'var(--cpm-font-sans)',
          }}
        >
          {title}
        </h1>
        {badge && (
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: '0.1em',
              padding: '3px 10px',
              borderRadius: 999,
              background: 'var(--cpm-brand-violet-bg)',
              color: 'var(--cpm-brand-violet)',
            }}
          >
            {badge}
          </span>
        )}
        {subtitle && (
          <span
            style={{
              fontSize: 13,
              color: 'var(--cpm-text-tertiary)',
              fontWeight: 400,
            }}
          >
            {subtitle}
          </span>
        )}
      </div>
      {action && <div style={{ flexShrink: 0 }}>{action}</div>}
    </motion.div>
  );
}
