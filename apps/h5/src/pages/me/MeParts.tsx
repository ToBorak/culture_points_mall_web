import { Avatar, levelOf } from '@cpm/ui';
import { LayoutDashboard, Sparkles } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../store/auth';

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
  avatarUrl,
  total,
  badgeCount,
  dimCount,
  loading,
}: {
  name: string;
  avatarUrl?: string;
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
        <Avatar name={name} avatarUrl={avatarUrl || undefined} size={56} ringColor="rgba(255,255,255,0.6)" />
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

// AdminEntry：「我的」页的后台入口。仅管理员（登录 JWT 的 roles 含 admin）可见，
// 点击时携带当前登录 token 跳到管理后台并自动登录。真正的鉴权在后端 RequireRole("admin")，
// 这里的显隐只是体验层。
const ADMIN_ORIGIN = 'http://localhost:5174'; // 本地开发地址；生产部署需改为后台域名

function rolesFromJwt(token: string | null): string[] {
  if (!token) return [];
  try {
    const seg = token.split('.')[1] ?? '';
    const b64 = seg.replace(/-/g, '+').replace(/_/g, '/');
    const pad = b64.length % 4 ? '='.repeat(4 - (b64.length % 4)) : '';
    const claims = JSON.parse(atob(b64 + pad)) as { roles?: string[] };
    return Array.isArray(claims.roles) ? claims.roles : [];
  } catch {
    return [];
  }
}

export function AdminEntry() {
  const token = useAuth((s) => s.token);
  const userId = useAuth((s) => s.userId);
  const tenantId = useAuth((s) => s.tenantId);
  const name = useAuth((s) => s.name);
  const [hover, setHover] = useState(false);

  // 普通员工的 token 不含 admin 角色 → 不渲染任何东西
  if (!rolesFromJwt(token).includes('admin')) return null;

  const goAdmin = () => {
    if (!token) return;
    const q = new URLSearchParams({
      handoff: token,
      uid: String(userId ?? ''),
      tid: String(tenantId ?? ''),
      name: name ?? '',
    });
    // token 放在 hash（不会发往服务器），admin 端接收后会立即从地址栏抹除
    window.open(`${ADMIN_ORIGIN}/#${q.toString()}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <button
      type="button"
      onClick={goAdmin}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      aria-label="前往管理后台"
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
        boxShadow: hover ? 'var(--cpm-elev-candy)' : 'var(--cpm-elev-soft)',
        transition: 'box-shadow 200ms ease',
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
          flexShrink: 0,
        }}
      >
        <LayoutDashboard size={20} style={{ color: '#fff' }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: 'var(--cpm-font-sans)', fontWeight: 700, fontSize: 14, color: 'var(--cpm-ink-1)' }}>
          前往后台
        </div>
        <div style={{ fontFamily: 'var(--cpm-font-sans)', fontSize: 11, color: 'var(--cpm-ink-2)' }}>
          管理后台 · 仅管理员可见 →
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
