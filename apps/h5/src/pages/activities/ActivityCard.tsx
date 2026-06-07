import type { Activity } from '@cpm/types';
import { DimensionTag } from '@cpm/ui';
import { motion } from 'framer-motion';
import { CalendarDays, CheckCircle2, Coins, MapPin, Ticket, Users } from 'lucide-react';
import type { ReactNode } from 'react';
import { countdownText, fmtTimeRange, phaseOf, STATUS_META } from './lib';

interface ActivityCardProps {
  activity: Activity;
  onClick: () => void;
}

export function ActivityCard({ activity: a, onClick }: ActivityCardProps) {
  const status = STATUS_META[a.Status] ?? STATUS_META.published;
  const phase = phaseOf(a);
  const countdown = phase === 'upcoming' ? countdownText(a.StartAt) : null;
  const hasCap = a.Capacity != null && a.Capacity > 0;
  const pct = hasCap ? Math.min(100, Math.round((a.enrolledCount / (a.Capacity as number)) * 100)) : 0;

  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.985 }}
      transition={{ type: 'spring', stiffness: 320, damping: 24 }}
      style={{
        textAlign: 'left',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        padding: 16,
        borderRadius: 'var(--cpm-r-lg)',
        background: 'var(--cpm-surface)',
        border: '1px solid var(--cpm-border-subtle)',
        boxShadow: 'var(--cpm-shadow-soft)',
        cursor: 'pointer',
        touchAction: 'manipulation',
        fontFamily: 'var(--cpm-font-sans)',
      }}
    >
      {/* 头部：维度标签 + 状态 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        {a.dimensionCode ? (
          <DimensionTag code={a.dimensionCode} name={a.dimensionName || '活动'} size="sm" />
        ) : (
          <span />
        )}
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5,
            fontSize: 12,
            fontWeight: 700,
            color: status.color,
            background: status.bg,
            borderRadius: 999,
            padding: '4px 10px',
          }}
        >
          {phase === 'live' && (
            <motion.span
              aria-hidden
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.4, repeat: Number.POSITIVE_INFINITY }}
              style={{ width: 6, height: 6, borderRadius: '50%', background: status.color }}
            />
          )}
          {status.label}
        </span>
      </div>

      {/* 标题 */}
      <div
        style={{
          fontSize: 17,
          fontWeight: 800,
          color: 'var(--cpm-ink-1)',
          lineHeight: 1.35,
          letterSpacing: '-0.01em',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}
      >
        {a.Title}
      </div>

      {/* 元信息 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <Meta icon={<CalendarDays size={15} />} text={countdown ?? fmtTimeRange(a.StartAt, a.EndAt)} accent={!!countdown} />
        {a.LocationLat != null && a.LocationLng != null && (
          <Meta icon={<MapPin size={15} />} text={a.RadiusM ? `线下活动 · 签到范围 ${a.RadiusM}m` : '线下活动'} />
        )}
      </div>

      {/* 名额进度 */}
      {hasCap && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--cpm-ink-2)' }}>
              <Users size={14} /> 已报名 {a.enrolledCount}/{a.Capacity}
            </span>
            <span style={{ fontSize: 12, color: pct >= 100 ? 'var(--cpm-down)' : 'var(--cpm-ink-2)', fontWeight: 600 }}>
              {pct >= 100 ? '名额已满' : `剩 ${(a.Capacity as number) - a.enrolledCount} 席`}
            </span>
          </div>
          <div style={{ height: 5, borderRadius: 3, background: 'var(--cpm-sunken)', overflow: 'hidden' }}>
            <div
              style={{
                height: '100%',
                width: `${pct}%`,
                borderRadius: 3,
                background: pct >= 100 ? 'var(--cpm-down)' : 'var(--cpm-grad-brand)',
              }}
            />
          </div>
        </div>
      )}

      {/* 底部：积分 + 我的状态 */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
          paddingTop: 10,
          borderTop: '1px solid var(--cpm-border-subtle)',
        }}
      >
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5,
            fontSize: 13,
            fontWeight: 800,
            color: 'var(--cpm-gold-ink)',
            fontFamily: 'var(--cpm-font-num)',
          }}
        >
          <Coins size={16} style={{ color: 'var(--cpm-gold)' }} />
          签到 +{a.PointsReward || 10}
        </span>
        {!hasCap && (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--cpm-ink-2)' }}>
            <Users size={14} /> {a.enrolledCount} 人已报名
          </span>
        )}
        {a.mine.checkedIn ? (
          <MineChip color="var(--cpm-up)" bg="rgba(34,197,94,0.12)" icon={<CheckCircle2 size={14} />} label="已签到" />
        ) : a.mine.enrolled ? (
          <MineChip color="var(--cpm-primary)" bg="var(--cpm-primary-soft)" icon={<Ticket size={14} />} label="已报名" />
        ) : null}
      </div>
    </motion.button>
  );
}

function Meta({ icon, text, accent }: { icon: ReactNode; text: string; accent?: boolean }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 7,
        fontSize: 13,
        color: accent ? 'var(--cpm-primary)' : 'var(--cpm-ink-2)',
        fontWeight: accent ? 700 : 500,
      }}
    >
      <span style={{ display: 'inline-flex', color: accent ? 'var(--cpm-primary)' : 'var(--cpm-ink-2)' }}>{icon}</span>
      {text}
    </span>
  );
}

function MineChip({ color, bg, icon, label }: { color: string; bg: string; icon: ReactNode; label: string }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        fontSize: 12,
        fontWeight: 700,
        color,
        background: bg,
        borderRadius: 999,
        padding: '4px 9px',
      }}
    >
      {icon}
      {label}
    </span>
  );
}
