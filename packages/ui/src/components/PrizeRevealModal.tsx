import { AnimatePresence, motion } from 'framer-motion';
import { Gem, Gift, Sparkles, Star, Trophy } from 'lucide-react';
import { useEffect, useMemo } from 'react';

export type RarityTier = 'common' | 'rare' | 'epic' | 'legendary' | 'miss';

export interface PrizeRevealModalProps {
  open: boolean;
  win: boolean;
  prizeName: string;
  prizeImage?: string;
  amount: number;
  /** 当前奖品权重 / 总权重，用于自动判定稀有度 */
  rarityPct?: number;
  onClose: () => void;
  onAgain?: () => void;
  /** 顶部小标题覆盖（默认中奖 CONGRATULATIONS / 未中奖 BETTER LUCK NEXT TIME）。兑换成功可传「兑换成功」 */
  topLabel?: string;
  /** 是否显示稀有度胶囊（盲盒用；积分兑换传 false） */
  showTier?: boolean;
  /** 关闭按钮文案（默认「收下」） */
  closeLabel?: string;
}

const rarityTheme: Record<
  RarityTier,
  {
    label: string;
    primary: string;
    ring: string;
    glow: string;
    bgFrom: string;
    bgTo: string;
    text: string;
  }
> = {
  legendary: {
    label: '传说级',
    primary: '#fbbf24',
    ring: 'linear-gradient(135deg, #fde047, #f59e0b, #b45309)',
    glow: 'rgba(245,158,11,0.55)',
    bgFrom: '#fff7ed',
    bgTo: '#fef3c7',
    text: '#92400e',
  },
  epic: {
    label: '史诗级',
    primary: '#a855f7',
    ring: 'linear-gradient(135deg, #c084fc, #a855f7, #6d28d9)',
    glow: 'rgba(168,85,247,0.5)',
    bgFrom: '#faf5ff',
    bgTo: '#ede9fe',
    text: '#6d28d9',
  },
  rare: {
    label: '稀有',
    primary: '#0ea5e9',
    ring: 'linear-gradient(135deg, #67e8f9, #0ea5e9, #0369a1)',
    glow: 'rgba(14,165,233,0.45)',
    bgFrom: '#ecfeff',
    bgTo: '#dbeafe',
    text: '#0c4a6e',
  },
  common: {
    label: '普通',
    primary: '#10b981',
    ring: 'linear-gradient(135deg, #6ee7b7, #10b981, #047857)',
    glow: 'rgba(16,185,129,0.42)',
    bgFrom: '#f0fdf4',
    bgTo: '#dcfce7',
    text: '#065f46',
  },
  miss: {
    label: '鼓励',
    primary: '#64748b',
    ring: 'linear-gradient(135deg, #cbd5e1, #94a3b8, #64748b)',
    glow: 'rgba(100,116,139,0.3)',
    bgFrom: '#f8fafc',
    bgTo: '#e2e8f0',
    text: '#334155',
  },
};

function tierOf(win: boolean, pct: number): RarityTier {
  if (!win) return 'miss';
  if (pct < 5) return 'legendary';
  if (pct < 15) return 'epic';
  if (pct < 35) return 'rare';
  return 'common';
}

function TierIcon({ tier, size = 20 }: { tier: RarityTier; size?: number }) {
  if (tier === 'legendary') return <Trophy size={size} aria-hidden />;
  if (tier === 'epic') return <Gem size={size} aria-hidden />;
  if (tier === 'rare') return <Sparkles size={size} aria-hidden />;
  if (tier === 'common') return <Gift size={size} aria-hidden />;
  return <Star size={size} aria-hidden />;
}

export function PrizeRevealModal({
  open,
  win,
  prizeName,
  prizeImage,
  amount,
  rarityPct = 50,
  onClose,
  onAgain,
  topLabel,
  showTier = true,
  closeLabel = '收下',
}: PrizeRevealModalProps) {
  const tier = useMemo(() => tierOf(win, rarityPct), [win, rarityPct]);
  const t = rarityTheme[tier];

  // Confetti particles
  const confetti = useMemo(
    () =>
      Array.from({ length: 50 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        delay: Math.random() * 0.6,
        rotation: Math.random() * 360,
        size: 6 + Math.random() * 10,
        color: ['#fbbf24', '#f97316', '#ec4899', '#a855f7', '#06b6d4', '#10b981'][i % 6],
      })),
    [],
  );

  // Lock scroll while open
  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 200,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            fontFamily: 'var(--cpm-font-sans)',
          }}
        >
          {/* 蒙版 */}
          <motion.div
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'absolute',
              inset: 0,
              background: 'radial-gradient(ellipse at center, rgba(15,23,42,0.55) 0%, rgba(15,23,42,0.78) 100%)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
            }}
          />

          {/* Confetti（仅中奖播一次） */}
          {win && (
            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
              {confetti.map((c) => (
                <motion.span
                  key={c.id}
                  initial={{ y: -30, x: `${c.x}vw`, opacity: 0, rotate: 0 }}
                  animate={{
                    y: '110vh',
                    opacity: [0, 1, 1, 0.4, 0],
                    rotate: c.rotation + 720,
                  }}
                  transition={{
                    duration: 3.5 + Math.random() * 1.2,
                    delay: c.delay,
                    ease: [0.22, 0.6, 0.6, 1],
                  }}
                  style={{
                    position: 'absolute',
                    top: 0,
                    width: c.size,
                    height: c.size * 0.6,
                    background: c.color,
                    borderRadius: 2,
                    boxShadow: `0 0 12px ${c.color}80`,
                  }}
                />
              ))}
            </div>
          )}

          {/* 主卡片 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.72, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 10 }}
            transition={{ type: 'spring', stiffness: 240, damping: 19 }}
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: 360,
              borderRadius: 32,
              padding: '32px 24px 26px',
              background: `linear-gradient(160deg, ${t.bgFrom} 0%, ${t.bgTo} 100%)`,
              border: '1px solid rgba(255,255,255,0.7)',
              boxShadow: `0 30px 80px -20px ${t.glow}, 0 0 0 1px rgba(255,255,255,0.4) inset`,
              overflow: 'hidden',
              textAlign: 'center',
            }}
          >
            {/* 顶部彩色 glow ring */}
            <div
              aria-hidden
              style={{
                position: 'absolute',
                top: -120,
                left: '50%',
                transform: 'translateX(-50%)',
                width: 360,
                height: 360,
                borderRadius: '50%',
                background: `radial-gradient(circle, ${t.primary}45 0%, transparent 60%)`,
                pointerEvents: 'none',
                filter: 'blur(20px)',
              }}
            />

            {/* 稀有度顶部胶囊（盲盒用；积分兑换隐藏） */}
            {showTier && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                style={{
                  position: 'relative',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '5px 14px',
                  borderRadius: 999,
                  background: t.ring,
                  color: '#fff',
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: 0,
                  marginBottom: 16,
                  boxShadow: `0 6px 16px -4px ${t.glow}`,
                }}
              >
                <TierIcon tier={tier} size={13} />
                <span>{t.label.toUpperCase()}</span>
              </motion.div>
            )}

            {/* 奖品图片 + 旋转光环 */}
            <div
              style={{
                position: 'relative',
                width: 144,
                height: 144,
                margin: '0 auto 18px',
              }}
            >
              {/* 旋转 conic gradient halo */}
              {win && (
                <motion.div
                  aria-hidden
                  animate={{ rotate: 360 }}
                  transition={{ duration: 6, repeat: Number.POSITIVE_INFINITY, ease: 'linear' }}
                  style={{
                    position: 'absolute',
                    inset: -16,
                    borderRadius: '50%',
                    background: `conic-gradient(from 0deg, ${t.primary} 0%, transparent 30%, ${t.primary} 60%, transparent 90%, ${t.primary} 100%)`,
                    filter: 'blur(10px)',
                    opacity: 0.55,
                  }}
                />
              )}
              {/* 内核圆盘 */}
              <motion.div
                initial={{ scale: 0.3, rotate: -25 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 220, damping: 14, delay: 0.25 }}
                style={{
                  position: 'relative',
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, #fff 0%, ${t.bgTo} 100%)`,
                  border: '3px solid #fff',
                  boxShadow: `0 18px 40px -10px ${t.glow}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                }}
              >
                {prizeImage ? (
                  <img
                    src={prizeImage}
                    alt={prizeName}
                    style={{
                      width: '85%',
                      height: '85%',
                      objectFit: 'contain',
                      filter: win ? 'none' : 'grayscale(0.4) brightness(0.95)',
                    }}
                  />
                ) : (
                  <span style={{ color: t.primary, display: 'grid', placeItems: 'center' }}>
                    <TierIcon tier={tier} size={64} />
                  </span>
                )}
              </motion.div>
            </div>

            {/* 标题 - WIN/MISS */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              style={{
                fontSize: 13,
                fontWeight: 600,
                letterSpacing: 0,
                color: t.text,
                opacity: 0.6,
                marginBottom: 4,
              }}
            >
              {topLabel ?? (win ? 'CONGRATULATIONS' : 'BETTER LUCK NEXT TIME')}
            </motion.div>

            {/* 奖品名 */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              style={{
                fontSize: 24,
                fontWeight: 800,
                letterSpacing: 0,
                color: 'var(--cpm-text-primary)',
                marginBottom: 8,
                lineHeight: 1.25,
              }}
            >
              {prizeName}
            </motion.div>

            {/* 副信息 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.55 }}
              style={{
                fontSize: 13,
                color: 'var(--cpm-text-secondary)',
                marginBottom: 22,
                lineHeight: 1.6,
              }}
            >
              {win ? (
                <>
                  已扣除 <strong style={{ color: t.text }}>{amount}</strong> 积分
                </>
              ) : amount > 0 ? (
                <>
                  本次未中奖，已扣除 <strong style={{ color: t.text }}>{amount}</strong> 积分，鼓励再接再厉
                </>
              ) : (
                <>
                  本次未中奖，<strong style={{ color: 'var(--cpm-success)' }}>不扣分</strong>，鼓励再接再厉
                </>
              )}
            </motion.div>

            {/* 按钮组 */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65 }}
              style={{ display: 'flex', gap: 10 }}
            >
              {onAgain && (
                <motion.button
                  onClick={onAgain}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.96 }}
                  style={{
                    flex: 1,
                    padding: '13px 0',
                    borderRadius: 14,
                    fontSize: 14,
                    fontWeight: 700,
                    fontFamily: 'var(--cpm-font-sans)',
                    border: 'none',
                    background: t.ring,
                    color: '#fff',
                    cursor: 'pointer',
                    boxShadow: `0 10px 24px -6px ${t.glow}`,
                  }}
                >
                  再抽一次
                </motion.button>
              )}
              <motion.button
                onClick={onClose}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.96 }}
                style={{
                  flex: onAgain ? 0.7 : 1,
                  padding: '13px 16px',
                  borderRadius: 14,
                  fontSize: 14,
                  fontWeight: 600,
                  fontFamily: 'var(--cpm-font-sans)',
                  border: '1px solid rgba(15,23,42,0.08)',
                  background: 'rgba(255,255,255,0.7)',
                  color: 'var(--cpm-text-secondary)',
                  cursor: 'pointer',
                  backdropFilter: 'blur(4px)',
                }}
              >
                {closeLabel}
              </motion.button>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
