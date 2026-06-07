import { useActivity, useEnroll, useUnenroll } from '@cpm/api-client';
import { Button, DimensionTag, useBreakpoint } from '@cpm/ui';
import { AnimatePresence, motion } from 'framer-motion';
import {
  CalendarDays,
  CalendarPlus,
  CheckCircle2,
  ChevronRight,
  Coins,
  MapPin,
  QrCode,
  Ticket,
  Users,
} from 'lucide-react';
import { type ReactNode, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { isInDingTalk } from '../../auth/dingtalkLogin';
import { ScannerOverlay } from './ScannerOverlay';
import {
  countdownText,
  downloadIcs,
  fmtTimeRange,
  hasBarcodeDetector,
  mapLink,
  parseSigninTarget,
  phaseOf,
  scanViaDingTalk,
  STATUS_META,
} from './lib';

export function ActivityDetailPage() {
  const { id } = useParams();
  const activityId = Number(id);
  const navigate = useNavigate();
  const { isDesktop } = useBreakpoint();

  const { data: a, isLoading, isError } = useActivity(activityId);
  const enroll = useEnroll();
  const unenroll = useUnenroll();

  const [scanOpen, setScanOpen] = useState(false);
  const [manualOpen, setManualOpen] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [msg, setMsg] = useState<{ text: string; tone: 'ok' | 'err' } | null>(null);

  const goSignin = (act: number, code: string) => navigate(`/signin?a=${act}&c=${code}`);

  const handleScan = async () => {
    setMsg(null);
    const ddText = await scanViaDingTalk();
    if (ddText) {
      const t = parseSigninTarget(ddText);
      if (t) return goSignin(t.a, t.c);
      setMsg({ text: '未识别到有效的签到二维码', tone: 'err' });
      return;
    }
    if (isInDingTalk()) {
      setManualOpen(true);
      return;
    }
    if (hasBarcodeDetector()) {
      setScanOpen(true);
      return;
    }
    setManualOpen(true);
  };

  const onScanResult = (text: string) => {
    setScanOpen(false);
    const t = parseSigninTarget(text);
    if (t) return goSignin(t.a, t.c);
    setMsg({ text: '未识别到有效的签到二维码，请重试', tone: 'err' });
  };

  const submitManual = () => {
    const code = manualCode.trim();
    if (!code) return;
    setManualOpen(false);
    setManualCode('');
    goSignin(activityId, code);
  };

  const doEnroll = () => {
    setMsg(null);
    enroll.mutate(activityId, {
      onSuccess: () => setMsg({ text: '报名成功，记得到现场扫码签到', tone: 'ok' }),
      onError: (e: unknown) => setMsg({ text: errText(e, '报名失败，请重试'), tone: 'err' }),
    });
  };
  const doUnenroll = () => {
    setMsg(null);
    unenroll.mutate(activityId, {
      onError: (e: unknown) => setMsg({ text: errText(e, '取消失败，请重试'), tone: 'err' }),
    });
  };

  if (isLoading) {
    return <Centered>加载中…</Centered>;
  }
  if (isError || !a) {
    return (
      <Centered>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
          <span>活动不存在或已下线</span>
          <Button tone="secondary" size="sm" onClick={() => navigate('/activities')}>
            返回活动列表
          </Button>
        </div>
      </Centered>
    );
  }

  const status = STATUS_META[a.Status] ?? STATUS_META.published;
  const phase = phaseOf(a);
  const ended = phase === 'ended';
  const countdown = phase === 'upcoming' ? countdownText(a.StartAt) : null;
  const hasCap = a.Capacity != null && a.Capacity > 0;
  const cap = a.Capacity ?? 0;
  const full = hasCap && !a.mine.enrolled && a.enrolledCount >= cap;
  const pct = hasCap ? Math.min(100, Math.round((a.enrolledCount / cap) * 100)) : 0;
  const dimColor = a.dimensionCode ? `var(--cpm-dim-${a.dimensionCode}, var(--cpm-primary))` : 'var(--cpm-primary)';
  const busy = enroll.isPending || unenroll.isPending;

  return (
    <div style={{ height: '100%', overflowY: 'auto', overscrollBehavior: 'contain' }}>
      <div
        style={{
          maxWidth: isDesktop ? 760 : '100%',
          margin: '0 auto',
          minHeight: '100%',
          display: 'flex',
          flexDirection: 'column',
          fontFamily: 'var(--cpm-font-sans)',
        }}
      >
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 14, padding: isDesktop ? '20px 24px 24px' : '16px 16px 20px' }}>
          {/* 英雄区 */}
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              position: 'relative',
              overflow: 'hidden',
              borderRadius: 'var(--cpm-r-xl)',
              border: '1px solid var(--cpm-border-subtle)',
              background: `linear-gradient(160deg, color-mix(in oklab, ${dimColor} 14%, var(--cpm-surface)) 0%, var(--cpm-surface) 62%)`,
              boxShadow: 'var(--cpm-shadow-soft)',
              padding: 20,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              {a.dimensionCode && <DimensionTag code={a.dimensionCode} name={a.dimensionName || '活动'} size="sm" />}
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
                {phase === 'live' ? '进行中' : status.label}
              </span>
            </div>
            <h1 style={{ fontSize: isDesktop ? 28 : 23, fontWeight: 800, color: 'var(--cpm-ink-1)', lineHeight: 1.3, margin: 0, letterSpacing: '-0.01em' }}>
              {a.Title}
            </h1>
            {countdown && (
              <div style={{ marginTop: 12, display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 700, color: 'var(--cpm-primary)' }}>
                <CalendarDays size={16} /> {countdown}
              </div>
            )}
          </motion.section>

          {/* 已签到横幅 */}
          {a.mine.checkedIn && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '14px 16px',
                borderRadius: 'var(--cpm-r-lg)',
                background: 'linear-gradient(135deg,#f0fdf4,#ecfdf5)',
                border: '1px solid rgba(16,185,129,0.2)',
                color: '#065f46',
              }}
            >
              <CheckCircle2 size={22} style={{ color: 'var(--cpm-up)' }} />
              <div>
                <div style={{ fontWeight: 800, fontSize: 15 }}>你已完成签到</div>
                <div style={{ fontSize: 13, opacity: 0.85 }}>积分已入账，感谢参与本次活动</div>
              </div>
            </div>
          )}

          {/* 信息卡 */}
          <section
            style={{
              borderRadius: 'var(--cpm-r-lg)',
              border: '1px solid var(--cpm-border-subtle)',
              background: 'var(--cpm-surface)',
              boxShadow: 'var(--cpm-shadow-soft)',
              overflow: 'hidden',
            }}
          >
            <InfoRow icon={<CalendarDays size={18} />} label="活动时间" value={fmtTimeRange(a.StartAt, a.EndAt)} />
            {a.LocationLat != null && a.LocationLng != null && (
              <InfoRow
                icon={<MapPin size={18} />}
                label="活动地点"
                value={a.RadiusM ? `线下定位签到 · 范围 ${a.RadiusM}m` : '线下定位签到'}
                action={
                  <a
                    href={mapLink(a.LocationLat, a.LocationLng, a.Title)}
                    target="_blank"
                    rel="noreferrer"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 2, color: 'var(--cpm-primary)', fontWeight: 700, fontSize: 13, textDecoration: 'none' }}
                  >
                    导航 <ChevronRight size={15} />
                  </a>
                }
              />
            )}
            <InfoRow
              icon={<Coins size={18} />}
              label="签到奖励"
              value={
                <span style={{ fontFamily: 'var(--cpm-font-num)', fontWeight: 800, color: 'var(--cpm-gold-ink)' }}>
                  +{a.PointsReward || 10} 积分
                </span>
              }
            />
            <InfoRow
              icon={<Users size={18} />}
              label="报名情况"
              value={hasCap ? `${a.enrolledCount} / ${cap} 人` : `${a.enrolledCount} 人已报名`}
              last
            >
              {hasCap && (
                <div style={{ marginTop: 8, height: 6, borderRadius: 3, background: 'var(--cpm-sunken)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct}%`, borderRadius: 3, background: pct >= 100 ? 'var(--cpm-down)' : 'var(--cpm-grad-brand)' }} />
                </div>
              )}
            </InfoRow>
          </section>

          {/* 加入日历 */}
          {a.StartAt && (
            <button
              type="button"
              onClick={() => downloadIcs(a)}
              style={{
                display: 'inline-flex',
                alignSelf: 'flex-start',
                alignItems: 'center',
                gap: 6,
                padding: '8px 12px',
                borderRadius: 12,
                border: '1px dashed var(--cpm-border-subtle)',
                background: 'transparent',
                color: 'var(--cpm-ink-2)',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                touchAction: 'manipulation',
              }}
            >
              <CalendarPlus size={16} /> 加入日历
            </button>
          )}

          {/* 操作反馈 */}
          <AnimatePresence>
            {msg && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  padding: '10px 14px',
                  borderRadius: 12,
                  color: msg.tone === 'ok' ? '#065f46' : '#991b1b',
                  background: msg.tone === 'ok' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                }}
              >
                {msg.text}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 底部操作栏（吸底） */}
        <div
          style={{
            position: 'sticky',
            bottom: 0,
            display: 'flex',
            gap: 10,
            padding: '12px 16px max(12px, env(safe-area-inset-bottom))',
            background: 'color-mix(in oklab, var(--cpm-surface) 88%, transparent)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            borderTop: '1px solid var(--cpm-border-subtle)',
          }}
        >
          {ended ? (
            <Button tone="secondary" size="lg" disabled style={{ flex: 1 }}>
              活动已结束
            </Button>
          ) : (
            <>
              {a.mine.enrolled ? (
                <Button
                  tone="secondary"
                  size="lg"
                  onClick={doUnenroll}
                  disabled={busy || a.mine.checkedIn}
                  style={{ flex: 1 }}
                  icon={<Ticket size={18} />}
                >
                  {a.mine.checkedIn ? '已报名' : unenroll.isPending ? '取消中…' : '取消报名'}
                </Button>
              ) : (
                <Button
                  tone="secondary"
                  size="lg"
                  onClick={doEnroll}
                  disabled={busy || full}
                  style={{ flex: 1 }}
                  icon={<Ticket size={18} />}
                >
                  {full ? '名额已满' : enroll.isPending ? '报名中…' : '报名参加'}
                </Button>
              )}
              <Button tone="primary" size="lg" onClick={handleScan} style={{ flex: 1.2 }} icon={<QrCode size={18} />}>
                扫一扫签到
              </Button>
            </>
          )}
        </div>
      </div>

      {/* 摄像头扫码浮层 */}
      <AnimatePresence>{scanOpen && <ScannerOverlay onResult={onScanResult} onClose={() => setScanOpen(false)} />}</AnimatePresence>

      {/* 手动输入签到码 */}
      <AnimatePresence>
        {manualOpen && (
          <ManualSheet
            code={manualCode}
            onChange={setManualCode}
            onSubmit={submitManual}
            onClose={() => {
              setManualOpen(false);
              setManualCode('');
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function errText(e: unknown, fallback: string): string {
  const err = e as { response?: { data?: { error?: string } } };
  return err?.response?.data?.error ?? fallback;
}

function Centered({ children }: { children: ReactNode }) {
  return (
    <div style={{ height: '100%', display: 'grid', placeItems: 'center', color: 'var(--cpm-ink-2)', fontFamily: 'var(--cpm-font-sans)', fontSize: 15, padding: 24 }}>
      {children}
    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
  action,
  children,
  last,
}: {
  icon: ReactNode;
  label: string;
  value: ReactNode;
  action?: ReactNode;
  children?: ReactNode;
  last?: boolean;
}) {
  return (
    <div style={{ padding: '14px 16px', borderBottom: last ? 'none' : '1px solid var(--cpm-border-subtle)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ display: 'inline-flex', color: 'var(--cpm-ink-2)' }}>{icon}</span>
        <span style={{ fontSize: 13, color: 'var(--cpm-ink-2)', width: 64, flexShrink: 0 }}>{label}</span>
        <span style={{ flex: 1, minWidth: 0, fontSize: 14, color: 'var(--cpm-ink-1)', fontWeight: 600 }}>{value}</span>
        {action}
      </div>
      {children}
    </div>
  );
}

function ManualSheet({
  code,
  onChange,
  onSubmit,
  onClose,
}: {
  code: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, zIndex: 120, background: 'rgba(15,23,42,0.45)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
    >
      <motion.div
        initial={{ y: 40 }}
        animate={{ y: 0 }}
        exit={{ y: 40 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 460,
          background: 'var(--cpm-surface)',
          borderRadius: '22px 22px 0 0',
          padding: '22px 20px max(22px, env(safe-area-inset-bottom))',
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
          fontFamily: 'var(--cpm-font-sans)',
        }}
      >
        <div>
          <div style={{ fontSize: 17, fontWeight: 800, color: 'var(--cpm-ink-1)' }}>输入签到码</div>
          <div style={{ fontSize: 13, color: 'var(--cpm-ink-2)', marginTop: 4 }}>请输入活动现场签到大屏二维码下方的 6 位签到码</div>
        </div>
        <input
          value={code}
          onChange={(e) => onChange(e.target.value)}
          // biome-ignore lint/a11y/noAutofocus: 输入码弹层聚焦提升效率
          autoFocus
          inputMode="text"
          autoCapitalize="characters"
          placeholder="例如 8FK2QD"
          onKeyDown={(e) => {
            if (e.key === 'Enter') onSubmit();
          }}
          style={{
            width: '100%',
            boxSizing: 'border-box',
            padding: '14px 16px',
            borderRadius: 14,
            border: '1px solid var(--cpm-border-subtle)',
            background: 'var(--cpm-sunken)',
            fontSize: 18,
            letterSpacing: '0.22em',
            textAlign: 'center',
            fontFamily: 'var(--cpm-font-num)',
            color: 'var(--cpm-ink-1)',
            outline: 'none',
            textTransform: 'uppercase',
          }}
        />
        <div style={{ display: 'flex', gap: 10 }}>
          <Button tone="secondary" size="lg" onClick={onClose} style={{ flex: 1 }}>
            取消
          </Button>
          <Button tone="primary" size="lg" onClick={onSubmit} disabled={!code.trim()} style={{ flex: 1 }}>
            去签到
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}
