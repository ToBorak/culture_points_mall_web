import { motion } from 'framer-motion';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../store/auth';

const items = [
  { to: '/', label: '首页', icon: '✦', end: true },
  { to: '/chat', label: 'HR-Agent', icon: '⚡', end: false },
  { to: '/activities', label: '活动管理', icon: '◐', end: false },
  { to: '/values', label: '价值观维度', icon: '✧', end: false },
  { to: '/mall', label: '商城/盲盒', icon: '◈', end: false },
  { to: '/insights', label: '数据洞察', icon: '⌬', end: false },
  { to: '/dingtalk/mock-outbox', label: '钉钉推送', icon: '⊕', end: false },
];

export function Sidebar() {
  const { name, clear } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    clear();
    navigate('/login');
  };

  return (
    <aside
      style={{
        width: 240,
        flexShrink: 0,
        background: '#fff',
        borderRight: '1px solid var(--cpm-card-border)',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}
    >
      {/* Logo 区 */}
      <div
        style={{
          padding: '20px 20px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          borderBottom: '1px solid var(--cpm-card-border)',
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 11,
            background: 'linear-gradient(135deg, var(--cpm-brand-violet) 0%, var(--cpm-brand-cyan) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 17,
            color: '#fff',
            fontWeight: 700,
            flexShrink: 0,
            boxShadow: 'var(--cpm-shadow-glow-violet)',
          }}
        >
          ✦
        </div>
        <div>
          <div
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: 'var(--cpm-text-primary)',
              letterSpacing: '-0.01em',
              fontFamily: 'var(--cpm-font-sans)',
            }}
          >
            CPM 后台
          </div>
          <div
            style={{
              fontSize: 11,
              color: 'var(--cpm-text-muted)',
              fontWeight: 500,
              letterSpacing: '0.08em',
            }}
          >
            HR-AGENT × MCP
          </div>
        </div>
      </div>

      {/* 菜单 */}
      <nav style={{ flex: 1, padding: '12px 10px', overflowY: 'auto' }}>
        <motion.ul
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.04 } },
          }}
          style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 2 }}
        >
          {items.map((it) => (
            <motion.li
              key={it.to}
              variants={{ hidden: { opacity: 0, x: -8 }, visible: { opacity: 1, x: 0 } }}
            >
              <NavLink
                to={it.to}
                end={it.end}
                style={{ textDecoration: 'none', display: 'block' }}
              >
                {({ isActive }) => (
                  <motion.div
                    whileHover={{ x: 2 }}
                    transition={{ type: 'spring', stiffness: 350, damping: 22 }}
                    style={{
                      position: 'relative',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '9px 12px',
                      borderRadius: 10,
                      background: isActive ? 'var(--cpm-brand-violet-bg)' : 'transparent',
                      color: isActive ? 'var(--cpm-brand-violet)' : 'var(--cpm-text-secondary)',
                      fontWeight: isActive ? 600 : 500,
                      fontSize: 14,
                      fontFamily: 'var(--cpm-font-sans)',
                      cursor: 'pointer',
                      overflow: 'hidden',
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) (e.currentTarget as HTMLElement).style.background = 'rgba(15,23,42,0.04)';
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) (e.currentTarget as HTMLElement).style.background = 'transparent';
                    }}
                  >
                    {/* 左侧 active indicator */}
                    {isActive && (
                      <div
                        style={{
                          position: 'absolute',
                          left: 0,
                          top: '20%',
                          bottom: '20%',
                          width: 3,
                          borderRadius: 999,
                          background: 'var(--cpm-brand-violet)',
                        }}
                      />
                    )}
                    <span
                      style={{
                        width: 28,
                        textAlign: 'center',
                        fontSize: 17,
                        flexShrink: 0,
                      }}
                    >
                      {it.icon}
                    </span>
                    <span style={{ flex: 1 }}>{it.label}</span>
                    {isActive && (
                      <span style={{ fontSize: 11, opacity: 0.6 }}>›</span>
                    )}
                  </motion.div>
                )}
              </NavLink>
            </motion.li>
          ))}
        </motion.ul>
      </nav>

      {/* 底部用户区 */}
      <div
        style={{
          padding: '12px 14px',
          borderTop: '1px solid var(--cpm-card-border)',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 10,
            background: 'linear-gradient(135deg, #c4b5fd, #fda4af)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 14,
            fontWeight: 700,
            color: '#fff',
            flexShrink: 0,
          }}
        >
          {(name ?? '?').charAt(0).toUpperCase()}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: 'var(--cpm-text-primary)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {name ?? '管理员'}
          </div>
          <div style={{ fontSize: 11, color: 'var(--cpm-text-muted)' }}>Admin</div>
        </div>
        <motion.button
          type="button"
          onClick={handleLogout}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.94 }}
          transition={{ type: 'spring', stiffness: 350, damping: 22 }}
          style={{
            padding: '5px 10px',
            borderRadius: 8,
            border: '1px solid var(--cpm-card-border-strong)',
            background: 'transparent',
            color: 'var(--cpm-text-tertiary)',
            fontSize: 12,
            fontWeight: 500,
            cursor: 'pointer',
            flexShrink: 0,
            fontFamily: 'var(--cpm-font-sans)',
          }}
        >
          退出
        </motion.button>
      </div>
    </aside>
  );
}
