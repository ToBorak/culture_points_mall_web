import { Avatar, levelOf } from '@cpm/ui';
import { Sparkles } from 'lucide-react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

function Stat({ n, label }: { n: number; label: string }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontFamily: 'var(--cpm-font-num)', fontSize: 22, fontWeight: 800 }}>{n}</div>
      <div style={{ fontSize: 11, opacity: 0.85 }}>{label}</div>
    </div>
  );
}

export function MeHero({
  name,
  total,
  badgeCount,
  dimCount,
  loading,
}: {
  name: string;
  total: number;
  badgeCount: number;
  dimCount: number;
  loading: boolean;
}) {
  const lv = levelOf(total);
  return (
    <div
      style={{
        background: 'var(--cpm-grad-brand)',
        borderRadius: 24,
        padding: 22,
        color: 'var(--cpm-on-primary)',
        boxShadow: 'var(--cpm-elev-candy)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <Avatar name={name} size={56} ringColor="rgba(255,255,255,0.6)" />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontFamily: 'var(--cpm-font-sans)', fontSize: 17, fontWeight: 800 }}>{name}</span>
            <span
              style={{
                fontSize: 11,
                padding: '2px 9px',
                borderRadius: 999,
                background: 'rgba(255,255,255,0.22)',
                fontWeight: 700,
              }}
            >
              {lv.tier} · {lv.name}
            </span>
          </div>
          <div style={{ fontSize: 12, opacity: 0.85, marginTop: 3 }}>文化价值观成长档案</div>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-end', marginTop: 18 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, opacity: 0.85, letterSpacing: '0.12em', fontWeight: 700 }}>总文化分</div>
          <div style={{ fontFamily: 'var(--cpm-font-num)', fontSize: 42, fontWeight: 800, lineHeight: 1.05 }}>
            {loading ? '···' : total.toLocaleString('en-US')}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 18 }}>
          <Stat n={badgeCount} label="徽章" />
          <Stat n={dimCount} label="维度" />
        </div>
      </div>
    </div>
  );
}

export function DnaEntry() {
  const navigate = useNavigate();
  return (
    <button
      type="button"
      onClick={() => navigate('/dna')}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        width: '100%',
        padding: '14px 16px',
        borderRadius: 18,
        border: 'none',
        cursor: 'pointer',
        textAlign: 'left',
        background: 'var(--cpm-primary-soft)',
        boxShadow: 'var(--cpm-elev-soft)',
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 12,
          background: 'var(--cpm-grad-brand)',
          display: 'grid',
          placeItems: 'center',
        }}
      >
        <Sparkles size={20} style={{ color: '#fff' }} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: 'var(--cpm-font-sans)', fontWeight: 700, fontSize: 14, color: 'var(--cpm-ink-1)' }}>
          文化 DNA 年度报告
        </div>
        <div style={{ fontFamily: 'var(--cpm-font-sans)', fontSize: 11, color: 'var(--cpm-ink-2)' }}>
          看看你的专属文化画像 →
        </div>
      </div>
    </button>
  );
}

export function MeEmpty({ text }: { text: string }) {
  return (
    <div
      style={{ textAlign: 'center', padding: '48px 0', color: 'var(--cpm-ink-2)', fontFamily: 'var(--cpm-font-sans)' }}
    >
      {text}
    </div>
  );
}

export function MePanel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div
      style={{
        background: 'var(--cpm-surface)',
        borderRadius: 20,
        padding: '20px 22px',
        boxShadow: 'var(--cpm-elev-soft)',
        border: '1px solid var(--cpm-border-subtle)',
      }}
    >
      <div
        style={{
          fontFamily: 'var(--cpm-font-sans)',
          fontWeight: 800,
          fontSize: 15,
          color: 'var(--cpm-ink-1)',
          marginBottom: 14,
        }}
      >
        {title}
      </div>
      {children}
    </div>
  );
}

export const loadMoreStyle = {
  alignSelf: 'center',
  marginTop: 4,
  padding: '8px 20px',
  borderRadius: 999,
  border: '1px solid var(--cpm-border-subtle)',
  background: 'var(--cpm-surface)',
  color: 'var(--cpm-ink-2)',
  cursor: 'pointer',
  fontFamily: 'var(--cpm-font-sans)',
  fontSize: 13,
  fontWeight: 600,
} as const;
