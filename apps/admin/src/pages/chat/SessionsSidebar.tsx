import axios from 'axios';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface Sess {
  ID: number;
  Title: string;
  CreatedAt: string;
}

interface Props {
  onPick: (id: number) => void;
  activeId?: number | null;
}

export function SessionsSidebar({ onPick, activeId }: Props) {
  const [rows, setRows] = useState<Sess[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('cpm_admin_jwt');
    axios
      .get<{ items: Sess[] | null }>('/admin/agent/sessions', { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => setRows(r.data.items ?? []))
      .catch(() => {});
  }, []);

  return (
    <aside
      style={{
        width: 220,
        flexShrink: 0,
        background: 'var(--cpm-bg-0)',
        borderRight: '1px solid var(--cpm-card-border)',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
    >
      {/* 顶部新建按钮 */}
      <div style={{ padding: '14px 12px 10px' }}>
        <motion.button
          type="button"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.96 }}
          transition={{ type: 'spring', stiffness: 350, damping: 22 }}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            width: '100%',
            padding: '9px 12px',
            borderRadius: 11,
            border: '1.5px dashed var(--cpm-card-border-strong)',
            background: 'transparent',
            color: 'var(--cpm-brand-violet)',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: 'var(--cpm-font-sans)',
          }}
        >
          <span style={{ fontSize: 16 }}>+</span>
          <span>新会话</span>
        </motion.button>
      </div>

      <div
        style={{
          padding: '0 12px 8px',
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: '0.12em',
          color: 'var(--cpm-text-muted)',
          textTransform: 'uppercase',
        }}
      >
        历史会话
      </div>

      {/* 会话列表 */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 8px 12px' }}>
        {rows.length === 0 && (
          <div style={{ padding: '12px 8px', fontSize: 12, color: 'var(--cpm-text-muted)' }}>暂无会话记录</div>
        )}
        <motion.ul
          initial="hidden"
          animate="visible"
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.03 } } }}
          style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 2 }}
        >
          {rows.map((s) => {
            const isActive = s.ID === activeId;
            return (
              <motion.li key={s.ID} variants={{ hidden: { opacity: 0, x: -6 }, visible: { opacity: 1, x: 0 } }}>
                <button
                  type="button"
                  onClick={() => onPick(s.ID)}
                  style={{
                    display: 'block',
                    width: '100%',
                    textAlign: 'left',
                    padding: '9px 10px',
                    borderRadius: 10,
                    border: 'none',
                    background: isActive ? 'var(--cpm-brand-violet-bg)' : 'transparent',
                    color: isActive ? 'var(--cpm-brand-violet)' : 'var(--cpm-text-secondary)',
                    cursor: 'pointer',
                    fontFamily: 'var(--cpm-font-sans)',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) (e.currentTarget as HTMLElement).style.background = 'rgba(15,23,42,0.04)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) (e.currentTarget as HTMLElement).style.background = 'transparent';
                  }}
                >
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: isActive ? 600 : 500,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {s.Title || '未命名会话'}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--cpm-text-muted)', marginTop: 2 }}>
                    {(s.CreatedAt ?? '').slice(0, 10)}
                  </div>
                </button>
              </motion.li>
            );
          })}
        </motion.ul>
      </div>
    </aside>
  );
}
