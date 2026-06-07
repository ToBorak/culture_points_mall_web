import type { CSSProperties } from 'react';

export interface DimChipProps {
  code: string;
  name: string;
  active?: boolean;
  onClick?: () => void;
}

export function DimChip({ code, name, active = false, onClick }: DimChipProps) {
  const color = `var(--cpm-dim-${code}, var(--cpm-ink))`;
  const style: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '6px 14px',
    border: `3px solid ${active ? color : 'var(--cpm-ink)'}`,
    background: active ? color : 'var(--cpm-paper)',
    color: active ? 'var(--cpm-paper)' : 'var(--cpm-ink)',
    fontFamily: '"ZCOOL KuaiLe", sans-serif',
    borderRadius: 999,
    cursor: onClick ? 'pointer' : 'default',
    boxShadow: active ? '3px 3px 0 var(--cpm-ink)' : 'none',
    transition: 'all .15s ease',
  };
  if (onClick) {
    return (
      <button type="button" style={{ ...style, font: 'inherit' }} onClick={onClick}>
        {name}
      </button>
    );
  }

  return <span style={style}>{name}</span>;
}
