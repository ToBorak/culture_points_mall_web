export interface TrendIndicatorProps {
  value: number;
}

export function TrendIndicator({ value }: TrendIndicatorProps) {
  const v = Number.isFinite(value) ? value : 0;
  const color = v > 0 ? 'var(--cpm-up)' : v < 0 ? 'var(--cpm-down)' : 'var(--cpm-ink-2)';
  const label = v > 0 ? `▲ ${v}` : v < 0 ? `▼ ${Math.abs(v)}` : '—';
  return <span style={{ fontFamily: 'var(--cpm-font-num)', fontWeight: 700, fontSize: 12, color }}>{label}</span>;
}
