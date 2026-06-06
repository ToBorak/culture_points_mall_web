export interface SegItem<T extends string> {
  key: T;
  label: string;
}

export interface SegmentedControlProps<T extends string> {
  items: SegItem<T>[];
  value: T;
  onChange: (key: T) => void;
}

export function SegmentedControl<T extends string>({ items, value, onChange }: SegmentedControlProps<T>) {
  return (
    <div
      style={{
        display: 'flex',
        gap: 4,
        padding: 4,
        borderRadius: 'var(--cpm-r-pill)',
        background: 'var(--cpm-sunken)',
      }}
    >
      {items.map((it) => {
        const on = it.key === value;
        return (
          <button
            key={it.key}
            type="button"
            aria-pressed={on}
            onClick={() => onChange(it.key)}
            style={{
              flex: 1,
              minHeight: 36,
              padding: '8px 4px',
              border: 'none',
              borderRadius: 'var(--cpm-r-pill)',
              cursor: 'pointer',
              fontFamily: 'var(--cpm-font-sans)',
              fontSize: 13,
              fontWeight: on ? 700 : 600,
              background: on ? 'var(--cpm-primary)' : 'transparent',
              color: on ? 'var(--cpm-on-primary)' : 'var(--cpm-ink-2)',
              boxShadow: on ? '0 6px 14px -4px rgba(106,92,255,0.6)' : 'none',
              transition: 'background 200ms ease, color 200ms ease',
            }}
          >
            {it.label}
          </button>
        );
      })}
    </div>
  );
}
