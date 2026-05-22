import { useEffect, useState } from 'react';
import axios from 'axios';
import { Panel, Shout } from '@cpm/ui';
import { motion } from 'framer-motion';

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

export function MockOutboxPage() {
  const [rows, setRows] = useState<Outbox[]>([]);
  useEffect(() => {
    const token = localStorage.getItem('cpm_admin_jwt');
    const refresh = () => axios.get<{ items: Outbox[] }>(
      '/admin/dingtalk/mock-outbox',
      { headers: { Authorization: `Bearer ${token}` } },
    ).then((r) => setRows(r.data.items)).catch(() => {});
    refresh();
    const es = new EventSource('/admin/dingtalk/mock-outbox/stream');
    es.onmessage = () => refresh();
    return () => es.close();
  }, []);

  return (
    <div>
      <Shout tone="green">钉钉模拟推送 · 演示用</Shout>
      <p className="my-3 font-kuaile text-ink/70">
        以下条目展示「如果接真钉钉，系统会发什么」，便于 demo 时可视化讲解。
      </p>
      <div className="space-y-3">
        {rows.map((r, i) => (
          <motion.div key={r.id} initial={{ x: 40, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: Math.min(i, 10) * 0.02 }}>
            <Panel shadow="green">
              <div className="flex items-center justify-between">
                <span className="font-kuaile">{apiTitle[r.api] ?? r.api}</span>
                <span className="text-xs text-ink/50">{r.createdAt.slice(0, 19)}</span>
              </div>
              <div className="text-sm mt-2">→ 目标：<span className="font-mono">{r.target || '（无）'}</span></div>
              <pre className="text-xs bg-paper border border-ink rounded p-2 mt-2 overflow-auto">{JSON.stringify(r.payload, null, 2)}</pre>
            </Panel>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
