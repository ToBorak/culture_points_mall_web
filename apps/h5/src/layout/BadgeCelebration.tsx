import { checkNewBadges, usePassport } from '@cpm/api-client';
import type { Badge } from '@cpm/types';
import { BadgeMedal } from '@cpm/ui';
import { useQueryClient } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

const RARITY_LABEL: Record<string, string> = {
  common: '普通',
  rare: '稀有',
  epic: '史诗',
  legendary: '传说',
};

// 全局勋章达成庆祝弹层：在 App 加载时 + 每当积分变化时结算「新解锁」勋章，逐个弹出庆祝。
// 后端只返回首次达成的勋章，故无需客户端去重；多枚排队，点击/4 秒后切下一枚。
export function BadgeCelebration() {
  const totalScore = usePassport().data?.totalScore;
  const qc = useQueryClient();
  const [queue, setQueue] = useState<Badge[]>([]);
  const checking = useRef(false);

  useEffect(() => {
    if (checking.current) return;
    checking.current = true;
    let alive = true;
    checkNewBadges()
      .then((items) => {
        if (alive && items.length > 0) {
          setQueue((q) => [...q, ...items]);
          qc.invalidateQueries({ queryKey: ['me', 'badges'] }); // 让勋章墙同步刷新
        }
      })
      .catch(() => {})
      .finally(() => {
        checking.current = false;
      });
    return () => {
      alive = false;
    };
  }, [totalScore, qc]);

  const current = queue[0];

  useEffect(() => {
    if (!current) return;
    const t = setTimeout(() => setQueue((q) => q.slice(1)), 4000);
    return () => clearTimeout(t);
  }, [current]);

  const dismiss = () => setQueue((q) => q.slice(1));

  return (
    <AnimatePresence>
      {current && (
        <motion.div
          key={current.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={dismiss}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            display: 'grid',
            placeItems: 'center',
            padding: 24,
            background: 'rgba(15,16,30,0.55)',
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
            fontFamily: 'var(--cpm-font-sans)',
          }}
        >
          <motion.div
            initial={{ scale: 0.7, y: 24, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.85, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 22 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              width: 300,
              maxWidth: '100%',
              background: 'var(--cpm-surface)',
              borderRadius: 28,
              padding: '30px 26px 24px',
              textAlign: 'center',
              boxShadow: 'var(--cpm-elev-candy)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div
              aria-hidden
              style={{
                position: 'absolute',
                inset: 0,
                background: 'var(--cpm-grad-brand)',
                opacity: 0.1,
                pointerEvents: 'none',
              }}
            />
            <div style={{ position: 'relative' }}>
              <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: '0.22em', color: 'var(--cpm-primary-strong)' }}>
                成就解锁
              </div>
              <motion.div
                initial={{ scale: 0.4, rotate: -12 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 260, damping: 14, delay: 0.08 }}
                style={{ display: 'grid', placeItems: 'center', margin: '16px 0 10px' }}
              >
                <BadgeMedal emblem={current.iconUrl} rarity={current.rarity} size={112} />
              </motion.div>
              <div style={{ fontSize: 13, color: 'var(--cpm-ink-2)' }}>恭喜获得</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--cpm-ink-1)', margin: '2px 0 8px' }}>
                {current.name}
              </div>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  padding: '3px 10px',
                  borderRadius: 999,
                  background: 'var(--cpm-primary-soft)',
                  color: 'var(--cpm-primary-strong)',
                }}
              >
                {RARITY_LABEL[current.rarity] ?? current.rarity}
              </span>
              {current.description && (
                <div style={{ fontSize: 12.5, color: 'var(--cpm-ink-2)', marginTop: 12, lineHeight: 1.6 }}>
                  {current.description}
                </div>
              )}
              <div style={{ fontSize: 11, color: 'var(--cpm-ink-2)', marginTop: 16, opacity: 0.7 }}>
                {queue.length > 1 ? `还有 ${queue.length - 1} 枚 · 点击继续` : '点击关闭'}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
