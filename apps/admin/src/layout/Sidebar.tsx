import { NavLink } from 'react-router-dom';

const items = [
  { to: '/', label: '首页', n: 'HOME' },
  { to: '/chat', label: 'HR-Agent', n: 'AI' },
  { to: '/values', label: '价值观维度', n: 'VAL' },
  { to: '/activities', label: '活动管理', n: 'ACT' },
  { to: '/mall', label: '商城/盲盒', n: 'MAL' },
  { to: '/insights', label: '数据洞察', n: 'BI' },
  { to: '/dingtalk/mock-outbox', label: '钉钉推送', n: 'DD' },
];

export function Sidebar() {
  return (
    <aside className="w-56 border-r-3 border-ink bg-paper p-4 font-kuaile">
      <h2 className="font-qingke text-2xl mb-6">CPM 后台</h2>
      <nav className="space-y-2">
        {items.map((it) => (
          <NavLink
            key={it.to}
            to={it.to}
            className={({ isActive }) =>
              `block p-2 rounded-lg border-2 border-ink ${isActive ? 'bg-cYellow' : 'bg-paper hover:bg-cYellow/40'}`
            }
            end={it.to === '/'}
          >
            <span className="font-bangers text-cRed mr-2">{it.n}</span>
            {it.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
