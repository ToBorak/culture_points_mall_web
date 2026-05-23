import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { BlindboxBox3D, PrizeRevealModal } from '@cpm/ui';

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
}

// 根据权重百分比映射稀有度
function rarityOf(weight: number, total: number): {
  tier: 'legendary' | 'epic' | 'rare' | 'common';
  label: string;
  color: string;
} {
  const pct = (weight / Math.max(total, 1)) * 100;
  if (pct < 5) return { tier: 'legendary', label: '传说', color: '#fbbf24' };
  if (pct < 15) return { tier: 'epic', label: '史诗', color: '#a855f7' };
  if (pct < 35) return { tier: 'rare', label: '稀有', color: '#0ea5e9' };
  return { tier: 'common', label: '普通', color: '#10b981' };
}

const tintByCost: Record<string, string> = {
  // 不同盲盒主题色（按 cost 区间）
  low: '#a78bfa',
  mid: '#f9a8d4',
  high: '#fbbf24',
};

export function BlindboxDrawPage() {
  const { id } = useParams();
  const boxId = Number(id);
  const navigate = useNavigate();

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
    if (!box) return tintByCost.low;
    if (box.Cost >= 200) return tintByCost.high;
    if (box.Cost >= 80) return tintByCost.mid;
    return tintByCost.low;
  }, [box]);

  const winPct = useMemo(() => {
    if (!result || !result.win || prizes.length === 0) return 50;
    const p = prizes.find((x) => x.prizeName === result.prizeName);
    if (!p) return 50;
    return (p.weight / Math.max(totalWeight, 1)) * 100;
  }, [result, prizes, totalWeight]);

  const draw = async () => {
    if (boxState !== 'idle') return;
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
      // 至少转 1.6s 让动画过瘾
      await new Promise((r) => setTimeout(r, 1600));
      setResult(data);
      setBoxState('opening'); // 触发减速 + 开盒
    } catch (e) {
      const er = e as { response?: { data?: { error?: string } } };
      setErr(er?.response?.data?.error ?? String(e));
      setBoxState('idle');
    }
  };

  // 当 box 动画完成（onAnimationDone 由 BlindboxBox3D 回调），显示奖品
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
    // 留一点点过渡时间避免 modal 退场动画与新一轮抽奖冲突
    setTimeout(() => draw(), 350);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--cpm-bg-0)',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: 'var(--cpm-font-sans)',
      }}
    >
      {/* 主题色 mesh 光斑 */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          left: '-15%',
          top: '-10%',
          width: 480,
          height: 480,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${tint}40, transparent 65%)`,
          filter: 'blur(80px)',
          pointerEvents: 'none',
          transition: 'background 0.6s ease',
        }}
      />
      <div
        aria-hidden
        style={{
          position: 'absolute',
          right: '-15%',
          bottom: '5%',
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(253,164,175,0.32), transparent 65%)',
          filter: 'blur(80px)',
          pointerEvents: 'none',
        }}
      />

      <main
        style={{
          position: 'relative',
          zIndex: 1,
          maxWidth: 460,
          margin: '0 auto',
          padding: '20px 16px 60px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {/* 顶部导航 */}
        <div
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 18,
          }}
        >
          <motion.button
            onClick={() => navigate(-1)}
            whileTap={{ scale: 0.88 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 12px',
              borderRadius: 10,
              background: '#fff',
              border: '1px solid var(--cpm-card-border)',
              boxShadow: 'var(--cpm-shadow-soft)',
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 500,
              color: 'var(--cpm-text-primary)',
            }}
          >
            ← 返回
          </motion.button>
          <span
            style={{
              fontSize: 15,
              fontWeight: 600,
              color: 'var(--cpm-text-primary)',
              letterSpacing: '-0.01em',
            }}
          >
            盲盒抽奖
          </span>
          <div style={{ width: 60 }} />
        </div>

        {/* 盲盒信息卡 */}
        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          style={{
            width: '100%',
            background: '#fff',
            borderRadius: 22,
            border: '1px solid var(--cpm-card-border)',
            boxShadow: 'var(--cpm-shadow-pop)',
            padding: '16px 18px 14px',
            marginBottom: 18,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: showPrizePool ? 12 : 4,
            }}
          >
            <div style={{ minWidth: 0, flex: 1 }}>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  letterSpacing: '0.18em',
                  color: tint,
                  marginBottom: 4,
                }}
              >
                BLIND BOX
              </div>
              <div
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  color: 'var(--cpm-text-primary)',
                  letterSpacing: '-0.01em',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {box?.Name ?? `文化盲盒 · #${boxId}`}
              </div>
            </div>
            {box && (
              <span
                style={{
                  padding: '5px 12px',
                  borderRadius: 999,
                  background: `${tint}22`,
                  color: tint,
                  fontSize: 13,
                  fontWeight: 700,
                  fontFeatureSettings: '"tnum"',
                  flexShrink: 0,
                }}
              >
                {box.Cost} 分 / 次
              </span>
            )}
          </div>

          {/* 折叠 - 奖品概率 */}
          <motion.button
            onClick={() => setShowPrizePool((v) => !v)}
            whileTap={{ scale: 0.97 }}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 0 6px',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              borderTop: '1px solid var(--cpm-card-border)',
              marginTop: 8,
              fontSize: 13,
              fontWeight: 600,
              color: 'var(--cpm-text-secondary)',
            }}
          >
            <span>查看奖品池 · {prizes.length} 种</span>
            <motion.span
              animate={{ rotate: showPrizePool ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              style={{ display: 'inline-block', fontSize: 12 }}
            >
              ▾
            </motion.span>
          </motion.button>

          <AnimatePresence>
            {showPrizePool && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                style={{ overflow: 'hidden' }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingTop: 6 }}>
                  {prizes.map((p) => {
                    const r = rarityOf(p.weight, totalWeight);
                    const pct = (p.weight / Math.max(totalWeight, 1)) * 100;
                    return (
                      <motion.div
                        key={p.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 12,
                          padding: '8px 10px',
                          borderRadius: 12,
                          background: `${r.color}10`,
                          border: `1px solid ${r.color}25`,
                        }}
                      >
                        {p.prizeImage ? (
                          <img
                            src={p.prizeImage}
                            alt={p.prizeName}
                            style={{
                              width: 36,
                              height: 36,
                              borderRadius: 9,
                              objectFit: 'cover',
                              background: '#fff',
                              flexShrink: 0,
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              width: 36,
                              height: 36,
                              borderRadius: 9,
                              background: `${r.color}25`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: 18,
                              flexShrink: 0,
                            }}
                          >
                            🎁
                          </div>
                        )}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 6,
                              marginBottom: 4,
                            }}
                          >
                            <span
                              style={{
                                fontSize: 13.5,
                                fontWeight: 600,
                                color: 'var(--cpm-text-primary)',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {p.prizeName}
                            </span>
                            <span
                              style={{
                                fontSize: 9,
                                fontWeight: 700,
                                letterSpacing: '0.08em',
                                padding: '1px 6px',
                                borderRadius: 4,
                                background: r.color,
                                color: '#fff',
                                flexShrink: 0,
                              }}
                            >
                              {r.label}
                            </span>
                          </div>
                          {/* 概率条 */}
                          <div
                            style={{
                              position: 'relative',
                              height: 4,
                              background: 'rgba(15,23,42,0.05)',
                              borderRadius: 2,
                              overflow: 'hidden',
                            }}
                          >
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${pct}%` }}
                              transition={{ duration: 0.6, delay: 0.1 }}
                              style={{
                                position: 'absolute',
                                inset: 0,
                                background: r.color,
                                borderRadius: 2,
                              }}
                            />
                          </div>
                        </div>
                        <span
                          style={{
                            fontSize: 13,
                            fontWeight: 700,
                            color: r.color,
                            fontFeatureSettings: '"tnum"',
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

        {/* 3D 盒子展示卡 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          style={{
            width: '100%',
            background: 'linear-gradient(180deg, #fff 0%, rgba(255,255,255,0.85) 100%)',
            borderRadius: 28,
            border: '1px solid var(--cpm-card-border)',
            boxShadow:
              boxState === 'spinning'
                ? `0 30px 60px -16px ${tint}55, var(--cpm-shadow-soft)`
                : 'var(--cpm-shadow-soft)',
            padding: '18px 16px 12px',
            marginBottom: 22,
            position: 'relative',
            overflow: 'hidden',
            transition: 'box-shadow 0.6s ease',
          }}
        >
          {/* 旋转底盘装饰 */}
          {boxState === 'spinning' && (
            <motion.div
              aria-hidden
              animate={{ rotate: 360 }}
              transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
              style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                width: 220,
                height: 220,
                marginLeft: -110,
                marginTop: -110,
                borderRadius: '50%',
                background: `conic-gradient(from 0deg, transparent, ${tint}60, transparent 40%, ${tint}60, transparent 80%)`,
                filter: 'blur(8px)',
                opacity: 0.7,
                pointerEvents: 'none',
              }}
            />
          )}

          {loading ? (
            <div
              style={{
                width: '100%',
                height: 280,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--cpm-text-muted)',
                fontSize: 13,
              }}
            >
              加载盲盒中…
            </div>
          ) : (
            <div style={{ display: 'flex', justifyContent: 'center', position: 'relative' }}>
              <BlindboxBox3D
                state={boxState}
                tint={tint}
                size={280}
                onAnimationDone={onBoxAnimationDone}
              />
            </div>
          )}

          {/* 状态标签 */}
          <div
            style={{
              textAlign: 'center',
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: '0.15em',
              color: 'var(--cpm-text-tertiary)',
              marginTop: 2,
            }}
          >
            {boxState === 'spinning' && '✦ SPINNING…'}
            {boxState === 'opening' && '◆ OPENING…'}
            {boxState === 'idle' && '◐ TAP TO REVEAL'}
          </div>
        </motion.div>

        {/* 抽奖大按钮 */}
        <motion.button
          onClick={draw}
          disabled={boxState !== 'idle'}
          whileHover={boxState === 'idle' ? { scale: 1.02 } : undefined}
          whileTap={boxState === 'idle' ? { scale: 0.97 } : undefined}
          transition={{ type: 'spring', stiffness: 350, damping: 22 }}
          style={{
            width: '100%',
            padding: '17px 0',
            borderRadius: 18,
            fontSize: 17,
            fontWeight: 700,
            fontFamily: 'var(--cpm-font-sans)',
            letterSpacing: '0.05em',
            border: 'none',
            background:
              boxState !== 'idle'
                ? `linear-gradient(135deg, ${tint}aa 0%, ${tint}88 100%)`
                : `linear-gradient(135deg, ${tint} 0%, var(--cpm-brand-cyan) 100%)`,
            color: '#fff',
            cursor: boxState !== 'idle' ? 'not-allowed' : 'pointer',
            boxShadow: boxState === 'idle'
              ? `0 16px 40px -10px ${tint}80`
              : `0 8px 22px -6px ${tint}55`,
            transition: 'background 0.3s ease, box-shadow 0.3s ease',
            opacity: boxState !== 'idle' ? 0.92 : 1,
          }}
        >
          {boxState === 'spinning' && '抽奖中…'}
          {boxState === 'opening' && '开盒中…'}
          {boxState === 'idle' && `✦ 开启盲盒 · ${box?.Cost ?? ''} 分`}
        </motion.button>

        {err && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              width: '100%',
              marginTop: 14,
              padding: '10px 14px',
              borderRadius: 12,
              background: 'rgba(239,68,68,0.08)',
              border: '1px solid rgba(239,68,68,0.2)',
              color: 'var(--cpm-danger)',
              fontSize: 13,
              fontWeight: 500,
              textAlign: 'center',
            }}
          >
            {err}
          </motion.div>
        )}
      </main>

      {/* 中奖弹窗 */}
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
