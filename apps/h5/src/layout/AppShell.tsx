import { BottomTabBar, PointsPill, SideNav, type TabItem, useBreakpoint } from '@cpm/ui';
import { Gift, Sparkles, Target, Trophy, User } from 'lucide-react';
import { useMemo } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

interface ShellTab extends TabItem {
  path: string;
}

const TABS: ShellTab[] = [
  { key: 'leaderboard', label: '排行榜', icon: <Trophy size={22} />, path: '/leaderboard' },
  { key: 'activities', label: '活动', icon: <Target size={22} />, path: '/activities' },
  { key: 'mall', label: '商城', icon: <Gift size={22} />, path: '/mall' },
  { key: 'me', label: '我的', icon: <User size={22} />, path: '/me' },
];

// TODO(计划 5)：积分余额改为来自接口（usePassport），当前为占位值。
const PLACEHOLDER_POINTS = 1540;

export function AppShell() {
  const { isDesktop } = useBreakpoint();
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

  if (isDesktop) {
    return (
      <div style={{ display: 'flex', height: '100dvh', background: 'var(--cpm-app-bg)' }}>
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
                <b style={{ color: 'var(--cpm-ink-1)' }}>文化积分</b>
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
            <div style={{ flex: 1 }} />
            <PointsPill value={PLACEHOLDER_POINTS} />
          </header>
          <div style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
            <Outlet />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh', background: 'var(--cpm-app-bg)' }}>
      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
        <Outlet />
      </div>
      <BottomTabBar items={TABS} activeKey={activeKey} onSelect={go} />
    </div>
  );
}
