import type { Activity, ActivityStatus } from '@cpm/types';
import dd from 'dingtalk-jsapi';
import { isInDingTalk } from '../../auth/dingtalkLogin';

// ---- 状态展示（与 admin 端状态色保持一致） ----

export interface StatusMeta {
  label: string;
  color: string;
  bg: string;
}

export const STATUS_META: Record<ActivityStatus, StatusMeta> = {
  draft: { label: '草稿', color: '#d97706', bg: 'rgba(217,119,6,0.12)' },
  published: { label: '报名中', color: '#0891b2', bg: 'rgba(8,145,178,0.12)' },
  running: { label: '进行中', color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
  closed: { label: '已结束', color: '#94a3b8', bg: 'rgba(148,163,184,0.14)' },
};

export type Phase = 'upcoming' | 'live' | 'ended';

/** 结合状态与起止时间推导活动当前阶段。 */
export function phaseOf(a: Activity, now = Date.now()): Phase {
  if (a.Status === 'closed') return 'ended';
  const start = a.StartAt ? new Date(a.StartAt).getTime() : Number.NaN;
  const end = a.EndAt ? new Date(a.EndAt).getTime() : Number.NaN;
  if (!Number.isNaN(end) && now > end) return 'ended';
  if (a.Status === 'running') return 'live';
  if (!Number.isNaN(start) && now >= start && (Number.isNaN(end) || now <= end)) return 'live';
  return 'upcoming';
}

// ---- 时间格式化 ----

const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);

export function fmtTimeRange(start: string | null, end: string | null): string {
  if (!start) return '时间待定';
  const s = new Date(start);
  if (Number.isNaN(s.getTime())) return '时间待定';
  const base = `${s.getMonth() + 1}月${s.getDate()}日 ${pad(s.getHours())}:${pad(s.getMinutes())}`;
  if (!end) return base;
  const e = new Date(end);
  if (Number.isNaN(e.getTime())) return base;
  const sameDay = s.getFullYear() === e.getFullYear() && s.getMonth() === e.getMonth() && s.getDate() === e.getDate();
  const endStr = sameDay
    ? `${pad(e.getHours())}:${pad(e.getMinutes())}`
    : `${e.getMonth() + 1}月${e.getDate()}日 ${pad(e.getHours())}:${pad(e.getMinutes())}`;
  return `${base} – ${endStr}`;
}

/** 距开始倒计时文案；已开始或无时间返回 null。 */
export function countdownText(start: string | null, now = Date.now()): string | null {
  if (!start) return null;
  const t = new Date(start).getTime();
  if (Number.isNaN(t)) return null;
  const diff = t - now;
  if (diff <= 0) return null;
  const days = Math.floor(diff / 86_400_000);
  const hours = Math.floor((diff % 86_400_000) / 3_600_000);
  const mins = Math.floor((diff % 3_600_000) / 60_000);
  if (days > 0) return `${days} 天 ${hours} 小时后开始`;
  if (hours > 0) return `${hours} 小时 ${mins} 分钟后开始`;
  return `${Math.max(mins, 1)} 分钟后开始`;
}

// ---- 日历 ----

function toIcsDate(iso: string | null): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return `${d.toISOString().replace(/[-:]/g, '').split('.')[0]}Z`;
}

const icsEscape = (s: string) => s.replace(/([,;\\])/g, '\\$1').replace(/\n/g, '\\n');

/** 生成并下载 .ics 日历文件（非钉钉环境的「加入日历」兜底）。 */
export function downloadIcs(a: Activity): void {
  const dtStart = toIcsDate(a.StartAt);
  const dtEnd = toIcsDate(a.EndAt) ?? dtStart;
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//culture-points-mall//activities//CN',
    'BEGIN:VEVENT',
    `UID:activity-${a.ID}@cpm`,
    dtStart ? `DTSTART:${dtStart}` : '',
    dtEnd ? `DTEND:${dtEnd}` : '',
    `SUMMARY:${icsEscape(a.Title)}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].filter(Boolean);
  const blob = new Blob([lines.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${a.Title || 'activity'}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// ---- 扫码签到 ----

/** 从扫得的文本里解析签到目标（兼容完整 URL 与裸查询串）。 */
export function parseSigninTarget(text: string): { a: number; c: string } | null {
  if (!text) return null;
  try {
    const url = new URL(text, window.location.origin);
    const a = Number(url.searchParams.get('a'));
    const c = url.searchParams.get('c') ?? '';
    if (a > 0 && c) return { a, c };
  } catch {
    // 非合法 URL，退化为正则匹配 a=…&c=…
  }
  const m = text.match(/a=(\d+)[\s\S]*?c=([^&\s]+)/);
  if (m) return { a: Number(m[1]), c: m[2] };
  return null;
}

interface DetectedBarcode {
  rawValue: string;
}
export interface BarcodeDetectorLike {
  detect(source: CanvasImageSource): Promise<DetectedBarcode[]>;
}
interface BarcodeDetectorCtor {
  new (opts?: { formats?: string[] }): BarcodeDetectorLike;
}

export function getBarcodeDetectorCtor(): BarcodeDetectorCtor | null {
  const w = window as unknown as { BarcodeDetector?: BarcodeDetectorCtor };
  return w.BarcodeDetector ?? null;
}

export function hasBarcodeDetector(): boolean {
  return getBarcodeDetectorCtor() !== null;
}

/** 钉钉内调用原生扫一扫，返回扫得的文本；不可用或失败返回 null。 */
export async function scanViaDingTalk(): Promise<string | null> {
  if (!isInDingTalk()) return null;
  try {
    const scan = (
      dd as unknown as {
        biz?: { util?: { scan?: (o: { type: string }) => Promise<{ text?: string }> } };
      }
    ).biz?.util?.scan;
    if (!scan) return null;
    const res = await scan({ type: 'qrCode' });
    return res?.text ?? null;
  } catch {
    return null;
  }
}
