import type { ReactNode } from 'react';

export interface TabItem {
  key: string;
  label: string;
  icon: ReactNode;
}

export interface BottomTabBarProps {
  items: TabItem[];
  activeKey: string;
  onSelect: (key: string) => void;
}

export function BottomTabBar({ items, activeKey, onSelect }: BottomTabBarProps) {
  return (
    <nav
      style={{
        position: 'relative',
        zIndex: 20,
        flexShrink: 0,
        display: 'flex',
        background: 'var(--cpm-surface)',
        padding: '8px 10px max(22px, env(safe-area-inset-bottom))',
        borderTop: '1px solid var(--cpm-border-subtle)',
        boxShadow: '0 -4px 16px -8px rgba(25,26,44,0.12)',
      }}
    >
      {items.map((it) => {
        const on = it.key === activeKey;
        return (
          <button
            key={it.key}
            type="button"
            onClick={() => onSelect(it.key)}
            aria-current={on ? 'page' : undefined}
            style={{
              flex: 1,
              minHeight: 48,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              outline: 'none',
              // 去掉移动端 WebKit 点击时的灰色高亮闪烁
              WebkitTapHighlightColor: 'transparent',
              WebkitUserSelect: 'none',
              userSelect: 'none',
              touchAction: 'manipulation',
              fontFamily: 'var(--cpm-font-sans)',
              fontSize: 11,
              fontWeight: 600,
              color: on ? 'var(--cpm-primary)' : 'var(--cpm-ink-2)',
              transition: 'color 200ms ease',
            }}
          >
            <span
              aria-hidden
              style={{
                display: 'flex',
                transform: on ? 'translateY(-1px)' : 'none',
                transition: 'transform 200ms ease',
              }}
            >
              {it.icon}
            </span>
            {it.label}
          </button>
        );
      })}
    </nav>
  );
}
