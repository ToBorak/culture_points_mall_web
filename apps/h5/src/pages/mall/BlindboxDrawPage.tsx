import { BlindboxBox3D, PrizeRevealModal, useBreakpoint } from '@cpm/ui';
import axios from 'axios';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, Coins, Gift, Loader2, Sparkles } from 'lucide-react';
import { type CSSProperties, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';

interface DrawResp {
  win: boolean;
  prizeId?: number;
  prizeName: string;
  prizeImage?: string;
  amount: number;
}

interface Prize {
  id: number;
  prizeName: string;
  prizeImage: string;
  weight: number;
}

interface Item {
  ID: number;
  Name: string;
  Cost: number;
  ImageURL: string;
  ChargeOnMiss?: boolean;
}

function rarityOf(
  weight: number,
  total: number,
): {
  tier: 'legendary' | 'epic' | 'rare' | 'common';
  label: string;
  color: string;
} {
  const pct = (weight / Math.max(total, 1)) * 100;
  if (pct < 5) return { tier: 'legendary', label: '传说', color: '#d97706' };
  if (pct < 15) return { tier: 'epic', label: '史诗', color: '#7c3aed' };
  if (pct < 35) return { tier: 'rare', label: '稀有', color: '#0891b2' };
  return { tier: 'common', label: '普通', color: '#10b981' };
}

const tintByCost = {
  standard: '#6a5cff',
  premium: '#22d3ee',
};

const pageStyle: CSSProperties = {
  minHeight: '100%',
  position: 'relative',
  overflow: 'hidden',
  background: 'linear-gradient(180deg, var(--cpm-app-bg) 0%, var(--cpm-bg-0) 100%)',
  fontFamily: 'var(--cpm-font-sans)',
};

function contentStyle(isDesktop: boolean): CSSProperties {
  return {
    width: '100%',
    maxWidth: isDesktop ? 1080 : 560,
    boxSizing: 'border-box',
    margin: '0 auto',
    padding: isDesktop ? '22px 28px 34px' : '14px 16px 22px',
    position: 'relative',
    zIndex: 1,
  };
}

function drawGridStyle(isDesktop: boolean): CSSProperties {
  return {
    display: 'grid',
    gridTemplateColumns: isDesktop ? 'minmax(320px, 0.85fr) minmax(420px, 1.15fr)' : '1fr',
    alignItems: isDesktop ? 'start' : 'stretch',
    gap: isDesktop ? 18 : 14,
  };
}

function cardStyle(isDesktop: boolean): CSSProperties {
  return {
    width: '100%',
    boxSizing: 'border-box',
    background: 'rgba(255,255,255,0.94)',
    borderRadius: isDesktop ? 24 : 22,
    border: '1px solid var(--cpm-border-subtle)',
    boxShadow: 'var(--cpm-elev-soft)',
  };
}

export function BlindboxDrawPage() {
  const { id } = useParams();
  const boxId = Number(id);
  const { isDesktop, width } = useBreakpoint();

  const [box, setBox] = useState<Item | null>(null);
  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [loading, setLoading] = useState(true);
  const [boxState, setBoxState] = useState<'idle' | 'spinning' | 'opening'>('idle');
  const [result, setResult] = useState<DrawResp | null>(null);
  const [showReveal, setShowReveal] = useState(false);
  const [showPrizePool, setShowPrizePool] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('cpm_jwt');
    const h = { Authorization: `Bearer ${token}` };
    Promise.all([
      axios.get<{ items: Item[] }>('/api/v1/mall/items', { headers: h }),
      axios.get<{ items: Prize[] }>(`/api/v1/mall/blindbox/${boxId}/prizes`, { headers: h }),
    ])
      .then(([itResp, prResp]) => {
        const found = itResp.data.items?.find((i) => i.ID === boxId) ?? null;
        setBox(found);
        setPrizes(prResp.data.items ?? []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [boxId]);

  const totalWeight = prizes.reduce((s, p) => s + p.weight, 0);
  const tint = useMemo(() => {
    if (!box) return tintByCost.standard;
    return box.Cost >= 10 ? tintByCost.premium : tintByCost.standard;
  }, [box]);

  const winPct = useMemo(() => {
    if (!result || !result.win || prizes.length === 0) return 50;
    const p = prizes.find((x) => x.prizeName === result.prizeName);
    if (!p) return 50;
    return (p.weight / Math.max(totalWeight, 1)) * 100;
  }, [result, prizes, totalWeight]);

  const boxSize = isDesktop ? 300 : Math.max(220, Math.min(270, width - 92));
  const disabled = loading || !box || boxState !== 'idle';

  const draw = async (force = false) => {
    if ((!force && disabled) || loading || !box) return;
    setErr(null);
    setResult(null);
    setBoxState('spinning');
    try {
      const token = localStorage.getItem('cpm_jwt');
      const { data } = await axios.post<DrawResp>(
        '/api/v1/mall/blindbox/draw',
        { boxId },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      await new Promise((r) => setTimeout(r, 1600));
      setResult(data);
      setBoxState('opening');
    } catch (e) {
      const er = e as { response?: { data?: { error?: string } } };
      setErr(er?.response?.data?.error ?? String(e));
      setBoxState('idle');
    }
  };

  const onBoxAnimationDone = () => {
    setShowReveal(true);
  };

  const closeReveal = () => {
    setShowReveal(false);
    setBoxState('idle');
  };

  const drawAgain = () => {
    setShowReveal(false);
    setBoxState('idle');
    setTimeout(() => draw(true), 350);
  };

  return (
    <div style={pageStyle}>
      <main data-testid="blindbox-draw-content" style={contentStyle(isDesktop)}>
        <div style={drawGridStyle(isDesktop)}>
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            style={{ ...cardStyle(isDesktop), padding: isDesktop ? '20px 22px' : '16px 18px' }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: 14,
                flexWrap: 'wrap',
              }}
            >
              <div style={{ minWidth: 0, flex: 1 }}>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '5px 9px',
                    borderRadius: 999,
                    background: `${tint}18`,
                    color: tint,
                    fontSize: 12,
                    fontWeight: 800,
                  }}
                >
                  <Sparkles size={14} aria-hidden />
                  盲盒抽奖
                </div>
                <h1
                  style={{
                    margin: '12px 0 0',
                    fontSize: isDesktop ? 24 : 22,
                    lineHeight: 1.2,
                    fontWeight: 800,
                    color: 'var(--cpm-ink-1)',
                  }}
                >
                  {box?.Name ?? `文化盲盒 · #${boxId}`}
                </h1>
                <p
                  style={{
                    margin: '8px 0 0',
                    fontSize: 13,
                    lineHeight: 1.55,
                    color: 'var(--cpm-ink-2)',
                  }}
                >
                  {box?.ChargeOnMiss
                    ? `每次抽奖消耗 ${box?.Cost ?? ''} 分，可能抽中好物，也可能谢谢参与（未中奖也扣分）。`
                    : `中奖才扣 ${box?.Cost ?? ''} 分，未中奖自动退回冻结分。`}
                </p>
              </div>
              {box && (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 5,
                    padding: '8px 12px',
                    borderRadius: 999,
                    background: 'var(--cpm-gold-soft)',
                    color: 'var(--cpm-gold-ink)',
                    fontFamily: 'var(--cpm-font-num)',
                    fontSize: 16,
                    fontWeight: 800,
                    flexShrink: 0,
                  }}
                >
                  <Coins size={15} style={{ color: 'var(--cpm-gold)' }} aria-hidden />
                  {box.Cost} 分 / 次
                </span>
              )}
            </div>

            <motion.button
              type="button"
              onClick={() => setShowPrizePool((v) => !v)}
              whileTap={{ scale: 0.98 }}
              style={{
                width: '100%',
                minHeight: 48,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
                padding: '13px 0 0',
                marginTop: 14,
                background: 'transparent',
                border: 'none',
                borderTop: '1px solid var(--cpm-border-subtle)',
                cursor: 'pointer',
                fontSize: 14,
                fontWeight: 800,
                color: 'var(--cpm-ink-2)',
                fontFamily: 'var(--cpm-font-sans)',
              }}
            >
              <span>查看奖品池 · {prizes.length} 种</span>
              <motion.span
                animate={{ rotate: showPrizePool ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                style={{ display: 'inline-flex', color: 'var(--cpm-ink-2)' }}
              >
                <ChevronDown size={18} aria-hidden />
              </motion.span>
            </motion.button>

            <AnimatePresence initial={false}>
              {showPrizePool && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.22 }}
                  style={{ overflow: 'hidden' }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingTop: 10 }}>
                    {prizes.map((p) => {
                      const r = rarityOf(p.weight, totalWeight);
                      const pct = (p.weight / Math.max(totalWeight, 1)) * 100;
                      return (
                        <motion.div
                          key={p.id}
                          initial={{ opacity: 0, x: -6 }}
                          animate={{ opacity: 1, x: 0 }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10,
                            padding: '9px 10px',
                            borderRadius: 14,
                            background: `${r.color}10`,
                            border: `1px solid ${r.color}24`,
                          }}
                        >
                          {p.prizeImage ? (
                            <img
                              src={p.prizeImage}
                              alt={p.prizeName}
                              style={{
                                width: 38,
                                height: 38,
                                borderRadius: 10,
                                objectFit: 'cover',
                                background: '#fff',
                                flexShrink: 0,
                              }}
                            />
                          ) : (
                            <div
                              style={{
                                width: 38,
                                height: 38,
                                borderRadius: 10,
                                background: `${r.color}18`,
                                display: 'grid',
                                placeItems: 'center',
                                flexShrink: 0,
                                color: r.color,
                              }}
                            >
                              <Gift size={19} aria-hidden />
                            </div>
                          )}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 6,
                                marginBottom: 5,
                              }}
                            >
                              <span
                                style={{
                                  fontSize: 13,
                                  fontWeight: 800,
                                  color: 'var(--cpm-ink-1)',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                {p.prizeName}
                              </span>
                              <span
                                style={{
                                  fontSize: 10,
                                  fontWeight: 800,
                                  padding: '2px 6px',
                                  borderRadius: 999,
                                  background: r.color,
                                  color: '#fff',
                                  flexShrink: 0,
                                }}
                              >
                                {r.label}
                              </span>
                            </div>
                            <div
                              style={{
                                position: 'relative',
                                height: 5,
                                background: 'rgba(15,23,42,0.06)',
                                borderRadius: 999,
                                overflow: 'hidden',
                              }}
                            >
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${pct}%` }}
                                transition={{ duration: 0.45, delay: 0.08 }}
                                style={{
                                  position: 'absolute',
                                  inset: 0,
                                  background: r.color,
                                  borderRadius: 999,
                                }}
                              />
                            </div>
                          </div>
                          <span
                            style={{
                              fontSize: 13,
                              fontWeight: 800,
                              color: r.color,
                              fontFamily: 'var(--cpm-font-num)',
                              flexShrink: 0,
                            }}
                          >
                            {pct < 1 ? pct.toFixed(1) : Math.round(pct)}%
                          </span>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.38, delay: 0.05 }}
            style={{
              ...cardStyle(isDesktop),
              padding: isDesktop ? '20px 20px 18px' : '16px 14px 14px',
              boxShadow:
                boxState === 'spinning' ? `0 26px 54px -20px ${tint}66, var(--cpm-elev-soft)` : 'var(--cpm-elev-soft)',
              transition: 'box-shadow 300ms ease',
            }}
          >
            <div
              style={{
                minHeight: isDesktop ? 318 : 250,
                display: 'grid',
                placeItems: 'center',
                position: 'relative',
                overflow: 'hidden',
                borderRadius: isDesktop ? 22 : 20,
                background: 'linear-gradient(180deg, #fff 0%, rgba(245,246,251,0.72) 100%)',
                border: '1px solid var(--cpm-border-subtle)',
              }}
            >
              {boxState === 'spinning' && (
                <motion.div
                  aria-hidden
                  animate={{ scale: [0.92, 1.04, 0.96], opacity: [0.35, 0.72, 0.38] }}
                  transition={{ duration: 1.6, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }}
                  style={{
                    position: 'absolute',
                    width: isDesktop ? 250 : 210,
                    height: isDesktop ? 250 : 210,
                    borderRadius: '50%',
                    border: `1px solid ${tint}55`,
                    boxShadow: `0 0 34px ${tint}26, inset 0 0 28px ${tint}18`,
                    pointerEvents: 'none',
                  }}
                />
              )}

              {loading ? (
                <div
                  style={{
                    minHeight: boxSize,
                    display: 'grid',
                    placeItems: 'center',
                    color: 'var(--cpm-ink-2)',
                    fontSize: 13,
                  }}
                >
                  加载盲盒中…
                </div>
              ) : (
                <BlindboxBox3D state={boxState} tint={tint} size={boxSize} onAnimationDone={onBoxAnimationDone} />
              )}
            </div>

            <div
              style={{
                minHeight: 34,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 7,
                textAlign: 'center',
                fontSize: 12,
                fontWeight: 800,
                color: 'var(--cpm-ink-2)',
                marginTop: 10,
              }}
            >
              {boxState === 'spinning' && (
                <>
                  <Loader2 size={15} aria-hidden />
                  抽奖中
                </>
              )}
              {boxState === 'opening' && (
                <>
                  <Sparkles size={15} aria-hidden />
                  开盒中
                </>
              )}
              {boxState === 'idle' && (
                <>
                  <Gift size={15} aria-hidden />
                  点击按钮开启盲盒
                </>
              )}
            </div>

            <motion.button
              type="button"
              onClick={() => draw()}
              disabled={disabled}
              whileHover={!disabled ? { y: -1 } : undefined}
              whileTap={!disabled ? { scale: 0.98 } : undefined}
              transition={{ type: 'spring', stiffness: 350, damping: 22 }}
              style={{
                width: '100%',
                minHeight: 54,
                padding: '14px 18px',
                borderRadius: 18,
                border: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 9,
                fontSize: isDesktop ? 17 : 16,
                fontWeight: 800,
                fontFamily: 'var(--cpm-font-sans)',
                background: disabled
                  ? 'linear-gradient(135deg, rgba(106,92,255,0.62), rgba(34,211,238,0.62))'
                  : `linear-gradient(135deg, ${tint} 0%, var(--cpm-brand-cyan) 100%)`,
                color: '#fff',
                cursor: disabled ? 'not-allowed' : 'pointer',
                boxShadow: disabled ? `0 8px 20px -8px ${tint}55` : `0 16px 36px -12px ${tint}80`,
                opacity: disabled ? 0.86 : 1,
                transition: 'background 200ms ease, box-shadow 200ms ease, opacity 200ms ease',
              }}
            >
              {boxState === 'spinning' && (
                <>
                  <Loader2 size={18} aria-hidden />
                  抽奖中…
                </>
              )}
              {boxState === 'opening' && (
                <>
                  <Sparkles size={18} aria-hidden />
                  开盒中…
                </>
              )}
              {boxState === 'idle' && (
                <>
                  <Sparkles size={18} aria-hidden />
                  开启盲盒 · {box?.Cost ?? ''} 分
                </>
              )}
            </motion.button>

            {err && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  marginTop: 12,
                  padding: '10px 14px',
                  borderRadius: 14,
                  background: 'rgba(239,68,68,0.08)',
                  border: '1px solid rgba(239,68,68,0.2)',
                  color: 'var(--cpm-danger)',
                  fontSize: 13,
                  fontWeight: 700,
                  textAlign: 'center',
                }}
              >
                {err}
              </motion.div>
            )}
          </motion.section>
        </div>
      </main>

      <PrizeRevealModal
        open={showReveal}
        win={result?.win ?? false}
        prizeName={result?.prizeName ?? ''}
        prizeImage={result?.prizeImage}
        amount={result?.amount ?? 0}
        rarityPct={winPct}
        onClose={closeReveal}
        onAgain={drawAgain}
      />
    </div>
  );
}
