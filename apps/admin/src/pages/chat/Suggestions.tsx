import axios from 'axios';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

// Suggestions 根据该 HR 的历史高频操作（后端按 tool 使用次数统计）渲染个性化快捷按钮，
// 点击即把对应指令发给 agent（如"批量加分"→弹积分批量卡）。空会话时展示。

interface Chip {
  label: string;
  send: string;
  icon: string;
}

export function Suggestions({ onPick }: { onPick: (send: string) => void }) {
  const [chips, setChips] = useState<Chip[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('cpm_admin_jwt');
    axios
      .get<{ items: Chip[] | null }>('/admin/agent/suggestions', { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => setChips(r.data.items ?? []))
      .catch(() => {});
  }, []);

  if (chips.length === 0) return null;

  return (
    <div style={{ marginTop: 20 }}>
      <div style={{ fontSize: 12, color: 'var(--cpm-text-muted)', marginBottom: 10, letterSpacing: '0.04em' }}>
        ✨ 为你推荐（基于你的常用操作）
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
        {chips.map((ch) => (
          <motion.button
            key={ch.label}
            type="button"
            onClick={() => onPick(ch.send)}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 350, damping: 22 }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 7,
              padding: '9px 16px',
              borderRadius: 12,
              border: '1.5px solid rgba(124,58,237,0.25)',
              background: 'rgba(124,58,237,0.06)',
              color: 'var(--cpm-brand-violet)',
              fontSize: 13.5,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'var(--cpm-font-sans)',
            }}
          >
            <span style={{ fontSize: 16 }}>{ch.icon}</span>
            {ch.label}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
