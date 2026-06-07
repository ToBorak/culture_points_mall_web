import type { ActivityRow, HonorRow, LotteryRow, SectionView, StarWinnerRow, ValueRow } from '@cpm/types';
import { Avatar } from '@cpm/ui';
import type React from 'react';

// 每个栏目类型的视觉配置（emoji + 主题色），用于栏目头的标识。
const META: Record<string, { emoji: string; color: string }> = {
  star: { emoji: '🌟', color: '#f59e0b' },
  values: { emoji: '💎', color: '#7c3aed' },
  honors: { emoji: '🏅', color: '#0ea5e9' },
  lottery: { emoji: '🎁', color: '#ec4899' },
  activity: { emoji: '📸', color: '#10b981' },
  innovation: { emoji: '💡', color: '#f97316' },
  custom: { emoji: '💌', color: '#6366f1' },
  editorial: { emoji: '📝', color: '#6366f1' },
};

// 星标得主头像按名次用不同渐变（金/紫/蓝），营造领奖台感。
const STAR_RINGS = [
  'linear-gradient(135deg,#fcd34d,#f59e0b)',
  'linear-gradient(135deg,#c4b5fd,#7c3aed)',
  'linear-gradient(135deg,#93c5fd,#4f7cff)',
];

const HONOR_LIMIT = 5;

export function PubSection({ view }: { view: SectionView }) {
  const { section, snapshot, articles } = view;
  const meta = META[section.type] ?? { emoji: '•', color: '#7c3aed' };
  const body = renderBody(section.type, snapshot);
  // 没有任何内容的栏目（既无快照体也无文章）不渲染，避免空标题。
  if (!body && (!articles || articles.length === 0)) return null;

  return (
    <section style={wrap}>
      <header style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <span style={{ width: 4, height: 18, borderRadius: 4, background: meta.color }} />
        <span style={{ fontSize: 17 }}>{meta.emoji}</span>
        <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--cpm-ink-1)', margin: 0 }}>{section.title}</h3>
      </header>
      {section.aiCopy && <p style={aiCopyStyle}>{section.aiCopy}</p>}
      {body}
      {articles?.map((a) => (
        <article key={a.id} style={articleCard}>
          <div style={{ fontWeight: 700, marginBottom: 6, color: 'var(--cpm-ink-1)', fontSize: 14 }}>{a.title}</div>
          <div style={articleBody}>{a.contentHtml}</div>
        </article>
      ))}
    </section>
  );
}

function renderBody(type: string, data: unknown): React.ReactNode {
  if (data == null) return null;
  switch (type) {
    case 'star':
      return <StarBody rows={data as StarWinnerRow[]} />;
    case 'values':
      return <ValuesBody rows={data as ValueRow[]} />;
    case 'honors':
      return <HonorsBody rows={(data as HonorRow[]).slice(0, HONOR_LIMIT)} />;
    case 'lottery':
      return <LotteryBody rows={data as LotteryRow[]} />;
    case 'activity':
      return <ActivityBody rows={data as ActivityRow[]} />;
    // leaderboard 等不在文化刊展示
    default:
      return null;
  }
}

function StarBody({ rows }: { rows: StarWinnerRow[] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {rows.map((r, i) => (
        <div key={`${r.userId}-${r.dimension}`} style={starCard}>
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <div style={{ padding: 3, borderRadius: '50%', background: STAR_RINGS[i] ?? STAR_RINGS[2] }}>
              <Avatar name={r.name} avatarUrl={r.avatarUrl} size={46} />
            </div>
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontWeight: 800, fontSize: 15, color: 'var(--cpm-ink-1)' }}>{r.name}</span>
              <span style={dimChip}>{r.dimension}</span>
            </div>
            {r.citation && <div style={citation}>{r.citation}</div>}
          </div>
        </div>
      ))}
    </div>
  );
}

function ValuesBody({ rows }: { rows: ValueRow[] }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10 }}>
      {rows.map((r) => {
        const c = r.color || '#7c3aed';
        return (
          <div key={r.dimensionId} style={{ ...valueCard, borderLeft: `3px solid ${c}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 18 }}>{r.icon || '✦'}</span>
              <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--cpm-ink-1)' }}>{r.name}</span>
              {r.nominationCount > 0 && (
                <span style={{ ...countBadge, background: `${c}1a`, color: c }}>{r.nominationCount}</span>
              )}
            </div>
            {r.description && <div style={valueDesc}>{r.description}</div>}
          </div>
        );
      })}
    </div>
  );
}

const RARITY: Record<string, { label: string; color: string }> = {
  legendary: { label: '传奇', color: '#f59e0b' },
  epic: { label: '史诗', color: '#a855f7' },
  rare: { label: '稀有', color: '#0ea5e9' },
  common: { label: '普通', color: '#94a3b8' },
};

function HonorsBody({ rows }: { rows: HonorRow[] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {rows.map((r, i) => {
        const rar = RARITY[r.rarity] ?? { label: r.rarity, color: '#94a3b8' };
        return (
          // biome-ignore lint/suspicious/noArrayIndexKey: snapshot rows lack stable id
          <div key={i} style={honorRow}>
            <Avatar name={r.name} avatarUrl="" size={34} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--cpm-ink-1)' }}>{r.name}</div>
              <div style={{ fontSize: 11, color: 'var(--cpm-ink-2)' }}>解锁「{r.badge}」</div>
            </div>
            <span style={{ ...rarityPill, background: `${rar.color}1a`, color: rar.color }}>{rar.label}</span>
          </div>
        );
      })}
    </div>
  );
}

function LotteryBody({ rows }: { rows: LotteryRow[] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {rows.map((r, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: snapshot rows lack stable id
        <div key={i} style={lotteryRow}>
          <span style={{ fontSize: 20 }}>🎁</span>
          <span style={{ fontWeight: 600, fontSize: 13, color: 'var(--cpm-ink-1)' }}>{r.name}</span>
          <span style={{ flex: 1 }} />
          <span style={prizePill}>{r.prize || '好礼'}</span>
        </div>
      ))}
    </div>
  );
}

function ActivityBody({ rows }: { rows: ActivityRow[] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {rows.map((r) => (
        <div key={r.id} style={activityRow}>
          <span style={{ fontSize: 16 }}>📸</span>
          <span style={{ fontWeight: 600, fontSize: 13, color: 'var(--cpm-ink-1)', flex: 1, minWidth: 0 }}>
            {r.title}
          </span>
          {r.startAt && <span style={{ fontSize: 11, color: 'var(--cpm-ink-3, #9aa)' }}>{r.startAt}</span>}
        </div>
      ))}
    </div>
  );
}

// ── styles ──
const wrap: React.CSSProperties = { marginBottom: 22 };
const aiCopyStyle: React.CSSProperties = {
  fontSize: 12.5,
  color: 'var(--cpm-ink-2)',
  margin: '0 0 12px',
  lineHeight: 1.6,
};
const card: React.CSSProperties = {
  background: 'var(--cpm-surface)',
  border: '1px solid var(--cpm-border-subtle)',
  boxShadow: 'var(--cpm-elev-soft)',
};
const starCard: React.CSSProperties = {
  ...card,
  display: 'flex',
  gap: 12,
  alignItems: 'center',
  borderRadius: 16,
  padding: '12px 14px',
};
const dimChip: React.CSSProperties = {
  fontSize: 10,
  padding: '2px 8px',
  borderRadius: 20,
  background: 'rgba(124,58,237,.1)',
  color: '#7c3aed',
  fontWeight: 600,
  whiteSpace: 'nowrap',
};
const citation: React.CSSProperties = { fontSize: 12, color: 'var(--cpm-ink-2)', marginTop: 4, lineHeight: 1.5 };
const valueCard: React.CSSProperties = { ...card, borderRadius: 14, padding: '10px 12px' };
const countBadge: React.CSSProperties = {
  marginLeft: 'auto',
  fontSize: 10,
  padding: '1px 7px',
  borderRadius: 10,
  fontWeight: 700,
};
const valueDesc: React.CSSProperties = { fontSize: 11, color: 'var(--cpm-ink-2)', marginTop: 5, lineHeight: 1.5 };
const honorRow: React.CSSProperties = {
  ...card,
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  borderRadius: 12,
  padding: '8px 12px',
};
const rarityPill: React.CSSProperties = {
  fontSize: 10,
  padding: '2px 8px',
  borderRadius: 20,
  fontWeight: 700,
  flexShrink: 0,
};
const lotteryRow: React.CSSProperties = {
  ...card,
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  borderRadius: 12,
  padding: '8px 12px',
};
const prizePill: React.CSSProperties = {
  fontSize: 11,
  padding: '3px 10px',
  borderRadius: 20,
  background: 'rgba(245,158,11,.12)',
  color: '#d97706',
  fontWeight: 700,
  whiteSpace: 'nowrap',
};
const activityRow: React.CSSProperties = {
  ...card,
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  borderRadius: 12,
  padding: '8px 12px',
};
const articleCard: React.CSSProperties = { ...card, borderRadius: 14, padding: 14, marginTop: 8 };
const articleBody: React.CSSProperties = {
  fontSize: 13,
  color: 'var(--cpm-ink-2)',
  whiteSpace: 'pre-wrap',
  lineHeight: 1.75,
};
