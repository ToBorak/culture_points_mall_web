import type { ReactNode } from 'react';
import type { TabItem } from './BottomTabBar.tsx';

export interface SideNavProps {
  items: TabItem[];
  activeKey: string;
  onSelect: (key: string) => void;
  brand?: ReactNode;
  footer?: ReactNode;
}

export function SideNav({ items, activeKey, onSelect, brand, footer }: SideNavProps) {
  return (
    <aside
      style={{
        width: 236,
        flex: 'none',
        background: 'var(--cpm-surface)',
        borderRight: '1px solid var(--cpm-border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        padding: '22px 16px',
      }}
    >
      {brand}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
        {items.map((it) => {
          const on = it.key === activeKey;
          return (
            <button
              key={it.key}
              type="button"
              onClick={() => onSelect(it.key)}
              aria-current={on ? 'page' : undefined}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                minHeight: 44,
                padding: '11px 14px',
                borderRadius: 14,
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
                fontFamily: 'var(--cpm-font-sans)',
                fontWeight: 600,
                fontSize: 14,
                background: on ? 'var(--cpm-primary)' : 'transparent',
                color: on ? 'var(--cpm-on-primary)' : 'var(--cpm-ink-2)',
                boxShadow: on ? 'var(--cpm-elev-candy)' : 'none',
                transition: 'background 200ms ease, color 200ms ease',
              }}
            >
              <span aria-hidden style={{ display: 'flex' }}>
                {it.icon}
              </span>
              {it.label}
            </button>
          );
        })}
      </nav>
      <div style={{ marginTop: 'auto' }}>{footer}</div>
    </aside>
  );
}
