import type { CSSProperties } from 'react';

export interface AvatarProps {
  name: string;
  avatarUrl?: string;
  size?: number;
  ringColor?: string;
  style?: CSSProperties;
}

export function Avatar({ name, avatarUrl, size = 40, ringColor, style }: AvatarProps) {
  const base: CSSProperties = {
    width: size,
    height: size,
    borderRadius: '50%',
    flexShrink: 0,
    boxShadow: `inset 0 0 0 2px ${ringColor ?? 'rgba(255,255,255,0.5)'}`,
    ...style,
  };
  if (avatarUrl) {
    return <img src={avatarUrl} alt={name} style={{ ...base, objectFit: 'cover' }} />;
  }
  return (
    <div
      style={{
        ...base,
        display: 'grid',
        placeItems: 'center',
        background: 'var(--cpm-grad-brand)',
        color: 'var(--cpm-on-primary)',
        fontFamily: 'var(--cpm-font-sans)',
        fontWeight: 700,
        fontSize: Math.round(size * 0.42),
      }}
    >
      {name.charAt(0)}
    </div>
  );
}
