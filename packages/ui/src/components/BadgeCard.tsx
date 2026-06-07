import type { Badge } from '@cpm/types';
import { useState } from 'react';
import { createPortal } from 'react-dom';
import { BadgeMedal } from './BadgeMedal.tsx';

const RARITY_LABEL: Record<string, { label: string; color: string; bg: string }> = {
  common: { label: '普通', color: '#64748b', bg: 'rgba(100,116,139,0.12)' },
  rare: { label: '稀有', color: '#0891b2', bg: 'rgba(34,182,214,0.16)' },
  epic: { label: '史诗', color: '#6a5cff', bg: 'rgba(106,92,255,0.14)' },
  legendary: { label: '传奇', color: '#c8860a', bg: 'rgba(245,166,35,0.18)' },
};

// 兜底：后端未返回 description 时，按 emblem 代码（badge.iconUrl）在前端给出获取条件文案。
// 与后端 seed 的 description 一致；后端返回 description 时优先用后端的。
const EMBLEM_CONDITION: Record<string, string> = {
  sprout: '完成第一次活动签到',
  calendar_check: '完成 5 次活动签到',
  flame: '完成 10 次活动签到',
  flag: '赚到第一笔积分',
  coin_stack: '累计赚取满 5 分',
  pagoda: '累计赚取满 10 分',
  burst: '累计赚取满 20 分',
  ingot: '累计赚取满 50 分',
  cleaver: '累计消费满 5 分',
  gift: '累计消费满 10 分',
  bag: '累计消费满 20 分',
  coins_toss: '累计消费满 50 分',
};

export interface BadgeCardProps {
  badge: Badge;
}

export function BadgeCard({ badge }: BadgeCardProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 6,
          padding: '12px 6px',
          minWidth: 0,
          width: '100%',
          borderRadius: 16,
          cursor: 'pointer',
          font: 'inherit',
          background: badge.earned ? 'var(--cpm-surface)' : 'var(--cpm-sunken)',
          border: badge.earned ? '1px solid var(--cpm-border-subtle)' : '1px solid transparent',
          boxShadow: badge.earned ? 'var(--cpm-elev-soft)' : 'none',
        }}
      >
        <BadgeMedal emblem={badge.iconUrl} rarity={badge.rarity} size={52} earned={badge.earned} />
        <span
          style={{
            fontFamily: 'var(--cpm-font-sans)',
            fontSize: 12,
            fontWeight: 700,
            color: 'var(--cpm-ink-1)',
            textAlign: 'center',
            lineHeight: 1.25,
            overflowWrap: 'anywhere',
          }}
        >
          {badge.name}
        </span>
      </button>

      {open && createPortal(<BadgeDetailModal badge={badge} onClose={() => setOpen(false)} />, document.body)}
    </>
  );
}

function BadgeDetailModal({ badge, onClose }: { badge: Badge; onClose: () => void }) {
  const rc = RARITY_LABEL[badge.rarity] ?? RARITY_LABEL.common;
  const condition = badge.description || EMBLEM_CONDITION[badge.iconUrl] || '—';
  const target = badge.progressTarget ?? 0;
  const current = badge.progressCurrent ?? 0;
  const unit = badge.progressUnit || '分';
  const remain = !badge.earned && target > 0 ? Math.max(0, target - current) : 0;
  const pct = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        background: 'rgba(15,23,42,0.55)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
    >
      <button
        type="button"
        aria-label="关闭"
        onClick={onClose}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          padding: 0,
          border: 'none',
          background: 'transparent',
          cursor: 'default',
        }}
      />
      <dialog
        open
        aria-label={`勋章 ${badge.name}`}
        style={{
          position: 'relative',
          zIndex: 1,
          width: '100%',
          maxWidth: 300,
          margin: 0,
          border: 'none',
          borderRadius: 20,
          background: 'var(--cpm-surface, #ffffff)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          padding: '24px 22px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 10,
          textAlign: 'center',
        }}
      >
        <BadgeMedal emblem={badge.iconUrl} rarity={badge.rarity} size={88} earned={badge.earned} />
        <div
          style={{
            fontFamily: 'var(--cpm-font-sans)',
            fontSize: 19,
            fontWeight: 800,
            color: 'var(--cpm-ink-1, #1f2733)',
          }}
        >
          {badge.name}
        </div>
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            padding: '3px 10px',
            borderRadius: 999,
            background: rc.bg,
            color: rc.color,
          }}
        >
          {rc.label}
        </span>
        <div style={{ fontSize: 13, color: 'var(--cpm-ink-2, #64748b)', lineHeight: 1.5 }}>
          <div style={{ fontSize: 11, color: 'var(--cpm-ink-3, #94a3b8)', marginBottom: 2 }}>获取条件</div>
          {condition}
        </div>
        {target > 0 && (
          <div style={{ width: '100%' }}>
            <div style={{ height: 6, borderRadius: 999, background: 'var(--cpm-sunken, #eef1f5)', overflow: 'hidden' }}>
              <div style={{ width: `${pct}%`, height: '100%', borderRadius: 999, background: rc.color }} />
            </div>
            <div style={{ fontSize: 11, color: 'var(--cpm-ink-3, #94a3b8)', marginTop: 4 }}>
              累计 {current} / {target} {unit}
            </div>
          </div>
        )}
        <div
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: badge.earned ? '#16a34a' : remain > 0 ? rc.color : 'var(--cpm-ink-3, #94a3b8)',
          }}
        >
          {badge.earned ? '✓ 已获得' : remain > 0 ? `还差 ${remain} ${unit}解锁` : '尚未获得'}
        </div>
        <button
          type="button"
          onClick={onClose}
          style={{
            marginTop: 4,
            padding: '9px 30px',
            borderRadius: 999,
            border: 'none',
            cursor: 'pointer',
            fontSize: 13,
            fontWeight: 700,
            color: '#ffffff',
            background: 'var(--cpm-accent, #6a5cff)',
          }}
        >
          知道了
        </button>
      </dialog>
    </div>
  );
}
