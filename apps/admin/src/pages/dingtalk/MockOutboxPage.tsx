import { PageHeader } from '@cpm/ui';
import axios from 'axios';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface Outbox {
  id: number;
  api: string;
  target: string;
  payload: Record<string, unknown>;
  createdAt: string;
}

const apiTitle: Record<string, string> = {
  create_calendar: '创建钉钉日程',
  send_work_notice: '推送工作通知',
  send_interactive_card: '发送互动卡片',
  bot_broadcast: '群机器人播报',
  start_oa_process: 'OA 审批',
};

const apiColor: Record<string, string> = {
  create_calendar: '#f97316',
  send_work_notice: '#7c3aed',
  send_interactive_card: '#0ea5e9',
  bot_broadcast: '#10b981',
  start_oa_process: '#ec4899',
};

const apiBg: Record<string, string> = {
  create_calendar: 'rgba(249,115,22,0.1)',
  send_work_notice: 'rgba(124,58,237,0.1)',
  send_interactive_card: 'rgba(14,165,233,0.1)',
  bot_broadcast: 'rgba(16,185,129,0.1)',
  start_oa_process: 'rgba(236,72,153,0.1)',
};

const apiFilters = [
  { key: 'all', label: '全部' },
  { key: 'send_work_notice', label: '工作通知' },
  { key: 'send_interactive_card', label: '互动卡片' },
  { key: 'bot_broadcast', label: '群播报' },
  { key: 'create_calendar', label: '日程' },
  { key: 'start_oa_process', label: 'OA' },
];

function LiveBadge() {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: '0.08em',
        padding: '3px 10px',
        borderRadius: 999,
        background: 'rgba(16,185,129,0.12)',
        color: 'var(--cpm-success)',
      }}
    >
      <motion.span
        animate={{ scale: [1, 1.5, 1], opacity: [1, 0.4, 1] }}
        transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
        style={{
          display: 'inline-block',
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: 'var(--cpm-success)',
        }}
      />
      实时
    </span>
  );
}

export function MockOutboxPage() {
  const [rows, setRows] = useState<Outbox[]>([]);
  const [filter, setFilter] = useState('all');
  const [openPayloads, setOpenPayloads] = useState<Set<number>>(new Set());

  useEffect(() => {
    const token = localStorage.getItem('cpm_admin_jwt');
    const refresh = () =>
      axios
        .get<{ items: Outbox[] }>('/admin/dingtalk/mock-outbox', { headers: { Authorization: `Bearer ${token}` } })
        .then((r) => setRows(r.data.items))
        .catch(() => {});
    refresh();
    const es = new EventSource('/admin/dingtalk/mock-outbox/stream');
    es.onmessage = () => refresh();
    return () => es.close();
  }, []);

  const togglePayload = (id: number) => {
    setOpenPayloads((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const filtered = filter === 'all' ? rows : rows.filter((r) => r.api === filter);

  return (
    <div>
      <PageHeader title="钉钉推送" badge={<LiveBadge />} />

      {/* Filter chips */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 20 }}>
        {apiFilters.map((f) => (
          <motion.button
            key={f.key}
            type="button"
            onClick={() => setFilter(f.key)}
            whileTap={{ scale: 0.94 }}
            style={{
              padding: '6px 14px',
              borderRadius: 999,
              border: '1px solid',
              borderColor: filter === f.key ? (apiColor[f.key] ?? 'var(--cpm-brand-violet)') : 'var(--cpm-card-border)',
              background: filter === f.key ? (apiBg[f.key] ?? 'var(--cpm-brand-violet-bg)') : 'transparent',
              color: filter === f.key ? (apiColor[f.key] ?? 'var(--cpm-brand-violet)') : 'var(--cpm-text-tertiary)',
              fontSize: 12,
              fontWeight: filter === f.key ? 600 : 500,
              cursor: 'pointer',
              fontFamily: 'var(--cpm-font-sans)',
              transition: 'all 0.15s',
            }}
          >
            {f.label}
          </motion.button>
        ))}
      </div>

      {/* 时间线 */}
      <div style={{ position: 'relative', paddingLeft: 32 }}>
        {/* 中线 */}
        <div
          style={{
            position: 'absolute',
            left: 9,
            top: 4,
            bottom: 0,
            width: 2,
            background: 'linear-gradient(180deg, var(--cpm-brand-violet-bg) 0%, transparent 100%)',
            borderRadius: 1,
          }}
        />

        <AnimatePresence>
          {filtered.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{
                padding: '40px 0',
                fontSize: 13,
                color: 'var(--cpm-text-muted)',
                textAlign: 'center',
              }}
            >
              暂无推送记录
            </motion.div>
          )}

          {filtered.map((r, i) => {
            const color = apiColor[r.api] ?? '#7c3aed';
            const bg = apiBg[r.api] ?? 'rgba(124,58,237,0.1)';
            const isOpen = openPayloads.has(r.id);

            return (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ delay: Math.min(i, 12) * 0.03, duration: 0.35 }}
                style={{
                  position: 'relative',
                  marginBottom: 16,
                }}
              >
                {/* 时间线点 */}
                <div
                  style={{
                    position: 'absolute',
                    left: -27,
                    top: 14,
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    background: color,
                    boxShadow: `0 0 0 3px ${bg}`,
                  }}
                />

                {/* 推送卡 */}
                <motion.div
                  whileHover={{ y: -2 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 24 }}
                  style={{
                    background: '#fff',
                    border: '1px solid var(--cpm-card-border)',
                    borderRadius: 16,
                    padding: '16px 18px',
                    boxShadow: 'var(--cpm-shadow-soft)',
                    overflow: 'hidden',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    {/* API 类型 chip */}
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        padding: '3px 9px',
                        borderRadius: 999,
                        background: bg,
                        color,
                        letterSpacing: '0.04em',
                        flexShrink: 0,
                      }}
                    >
                      {apiTitle[r.api] ?? r.api}
                    </span>
                    <div style={{ flex: 1 }} />
                    <span style={{ fontSize: 11, color: 'var(--cpm-text-muted)', fontFeatureSettings: '"tnum"' }}>
                      {r.createdAt.slice(0, 19).replace('T', ' ')}
                    </span>
                  </div>

                  {/* Target */}
                  <div style={{ fontSize: 12, color: 'var(--cpm-text-tertiary)', marginBottom: 10 }}>
                    → 目标：
                    <span
                      style={{
                        fontFamily: 'monospace',
                        color: 'var(--cpm-text-secondary)',
                        fontWeight: 500,
                      }}
                    >
                      {r.target || '（无）'}
                    </span>
                  </div>

                  {/* Payload 折叠 */}
                  <div>
                    <button
                      type="button"
                      onClick={() => togglePayload(r.id)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        padding: '4px 8px',
                        borderRadius: 7,
                        border: '1px solid var(--cpm-card-border)',
                        background: 'var(--cpm-bg-0)',
                        color: 'var(--cpm-text-tertiary)',
                        fontSize: 11,
                        fontWeight: 500,
                        cursor: 'pointer',
                        fontFamily: 'var(--cpm-font-sans)',
                        marginBottom: isOpen ? 8 : 0,
                      }}
                    >
                      <span
                        style={{
                          display: 'inline-block',
                          transition: 'transform 0.2s',
                          transform: isOpen ? 'rotate(90deg)' : 'none',
                        }}
                      >
                        ›
                      </span>
                      {isOpen ? '收起 JSON' : '查看 JSON'}
                    </button>

                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25 }}
                          style={{ overflow: 'hidden' }}
                        >
                          <pre
                            style={{
                              margin: 0,
                              padding: '10px 12px',
                              borderRadius: 10,
                              background: 'var(--cpm-bg-0)',
                              border: '1px solid var(--cpm-card-border)',
                              fontSize: 11,
                              color: 'var(--cpm-text-secondary)',
                              fontFamily: 'monospace',
                              overflowX: 'auto',
                              lineHeight: 1.6,
                            }}
                          >
                            {JSON.stringify(r.payload, null, 2)}
                          </pre>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
