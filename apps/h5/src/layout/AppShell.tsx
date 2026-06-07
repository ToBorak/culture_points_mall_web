import { usePassport } from '@cpm/api-client';
import { BottomTabBar, PointsPill, SideNav, type TabItem, useBreakpoint } from '@cpm/ui';
import { ArrowLeft, Gift, Sparkles, Target, Trophy, User } from 'lucide-react';
import { useMemo } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { BadgeCelebration } from './BadgeCelebration';

interface ShellTab extends TabItem {
  path: string;
}

const TABS: ShellTab[] = [
  { key: 'leaderboard', label: '排行榜', icon: <Trophy size={22} />, path: '/leaderboard' },
  { key: 'activities', label: '活动', icon: <Target size={22} />, path: '/activities' },
  { key: 'mall', label: '商城', icon: <Gift size={22} />, path: '/mall' },
  { key: 'me', label: '我的', icon: <User size={22} />, path: '/me' },
];

export function AppShell() {
  const { isDesktop } = useBreakpoint();
  const points = usePassport().data?.totalScore ?? 0;
  const location = useLocation();
  const navigate = useNavigate();

  const activeKey = useMemo(
    () => TABS.find((t) => location.pathname.startsWith(t.path))?.key ?? 'leaderboard',
    [location.pathname],
  );
  const go = (key: string) => {
    const tab = TABS.find((t) => t.key === key);
    if (tab) navigate(tab.path);
  };

  // 详情/子页（非 4 个 Tab 根路由）时，桌面端在顶栏显示返回；
  // 移动端一律不显示（钉钉应用顶部自带返回）。全局统一，无需各页自带返回按钮。
  const isRootTab = location.pathname === '/' || TABS.some((t) => t.path === location.pathname);
  const showBack = !isRootTab;

  if (isDesktop) {
    return (
      <div style={{ display: 'flex', height: '100%', background: 'var(--cpm-app-bg)' }}>
        <BadgeCelebration />
        <SideNav
          items={TABS}
          activeKey={activeKey}
          onSelect={go}
          brand={
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 8px 22px' }}>
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 12,
                  background: 'var(--cpm-grad-brand)',
                  display: 'grid',
                  placeItems: 'center',
                  boxShadow: 'var(--cpm-elev-candy)',
                }}
              >
                <Sparkles size={20} style={{ color: '#fff' }} />
              </div>
              <div style={{ fontFamily: 'var(--cpm-font-sans)' }}>
                <b style={{ color: 'var(--cpm-ink-1)' }}>文化官</b>
                <small style={{ display: 'block', color: 'var(--cpm-ink-2)', fontSize: 11 }}>员工成长中心</small>
              </div>
            </div>
          }
        />
        <main style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          <header
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              padding: '16px 28px',
              background: 'var(--cpm-surface)',
              borderBottom: '1px solid var(--cpm-border-subtle)',
            }}
          >
            {showBack && (
              <button
                type="button"
                onClick={() => navigate(-1)}
                aria-label="返回"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  minHeight: 38,
                  padding: '8px 14px 8px 10px',
                  borderRadius: 10,
                  border: '1px solid var(--cpm-border-subtle)',
                  background: 'var(--cpm-surface)',
                  color: 'var(--cpm-ink-1)',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: 'var(--cpm-font-sans)',
                }}
              >
                <ArrowLeft size={18} /> 返回
              </button>
            )}
            <div style={{ flex: 1 }} />
            <PointsPill value={points} />
          </header>
          <div style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
            <Outlet />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--cpm-app-bg)' }}>
      <BadgeCelebration />
      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
        <Outlet />
      </div>
      <BottomTabBar items={TABS} activeKey={activeKey} onSelect={go} />
    </div>
  );
}
