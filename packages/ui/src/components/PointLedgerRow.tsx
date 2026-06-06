import type { PointTransaction } from '@cpm/types';

const DIM_COLOR: Record<string, string> = {
  customer_first: '#f97316',
  team_collab: '#0ea5e9',
  innovation: '#ec4899',
  integrity: '#10b981',
  craftsmanship: '#8b5cf6',
  growth: '#eab308',
};

export interface PointLedgerRowProps {
  tx: PointTransaction;
}

export function PointLedgerRow({ tx }: PointLedgerRowProps) {
  const positive = tx.amount > 0;
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '12px 14px',
        borderRadius: 16,
        background: 'var(--cpm-surface)',
        border: '1px solid var(--cpm-border-subtle)',
        boxShadow: 'var(--cpm-elev-soft)',
      }}
    >
      <div style={{ width: 4, height: 44, borderRadius: 2, background: DIM_COLOR[tx.dimensionCode] ?? 'var(--cpm-primary)', flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontFamily: 'var(--cpm-font-sans)',
            fontSize: 14,
            fontWeight: 500,
            color: 'var(--cpm-ink-1)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {tx.reason || '加分'}
        </div>
        <div style={{ fontFamily: 'var(--cpm-font-sans)', fontSize: 11, color: 'var(--cpm-ink-2)', marginTop: 2 }}>{tx.createdAt}</div>
      </div>
      <div
        style={{
          fontFamily: 'var(--cpm-font-num)',
          fontSize: 20,
          fontWeight: 800,
          color: positive ? 'var(--cpm-up)' : 'var(--cpm-down)',
        }}
      >
        {positive ? `+${tx.amount}` : tx.amount}
      </div>
    </div>
  );
}
