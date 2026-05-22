import { useMyTransactions } from '@cpm/api-client';
import { motion } from 'framer-motion';

const colorByDim: Record<string, string> = {
  customer_first: '#ff9f43',
  team_collab: '#4facfe',
  innovation: '#ff7eb3',
  integrity: '#6dd5a3',
  craftsmanship: '#a55eea',
  growth: '#ffd93d',
};

export function PassportTransactions() {
  const q = useMyTransactions(20);
  const items = (q.data?.pages ?? []).flatMap((p) => p.items);
  return (
    <div className="space-y-2 p-2">
      {items.map((t, i) => (
        <motion.div
          key={t.id}
          initial={{ x: 80, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: Math.min(i, 10) * 0.04 }}
          className="flex items-center gap-3 border-3 border-ink rounded-xl bg-paper p-3 shadow-[4px_4px_0_var(--cpm-ink)]"
        >
          <span
            className="inline-block w-3 h-12 rounded"
            style={{ background: colorByDim[t.dimensionCode] ?? '#1a1a1a' }}
          />
          <div className="flex-1">
            <div className="font-kuaile text-base">{t.reason || '加分'}</div>
            <div className="text-xs text-ink/60">{t.createdAt}</div>
          </div>
          <div
            className="font-bangers text-2xl"
            style={{ color: t.amount > 0 ? 'var(--cpm-green)' : 'var(--cpm-red)' }}
          >
            {t.amount > 0 ? `+${t.amount}` : t.amount}
          </div>
        </motion.div>
      ))}
      {items.length === 0 && <div className="text-center text-ink/50 py-10 font-kuaile">还没有积分流水</div>}
    </div>
  );
}
