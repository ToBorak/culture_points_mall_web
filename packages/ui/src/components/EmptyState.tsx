import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

export interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon = '◈', title, description, action }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 24px',
        background: '#fff',
        border: '1px solid var(--cpm-card-border)',
        borderRadius: 20,
        boxShadow: 'var(--cpm-shadow-soft)',
        textAlign: 'center',
        gap: 12,
      }}
    >
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: 18,
          background: 'var(--cpm-brand-violet-bg)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 28,
          marginBottom: 4,
        }}
      >
        {icon}
      </div>
      <div
        style={{
          fontSize: 17,
          fontWeight: 600,
          color: 'var(--cpm-text-primary)',
          letterSpacing: '-0.01em',
        }}
      >
        {title}
      </div>
      {description && (
        <div style={{ fontSize: 13, color: 'var(--cpm-text-tertiary)', lineHeight: 1.6, maxWidth: 320 }}>
          {description}
        </div>
      )}
      {action && <div style={{ marginTop: 8 }}>{action}</div>}
    </motion.div>
  );
}
