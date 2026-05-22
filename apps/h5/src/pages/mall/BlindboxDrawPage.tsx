import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import Lottie from 'lottie-react';
import { BlindboxWheel } from '@cpm/ui';
import { motion, AnimatePresence } from 'framer-motion';
import goldDust from './goldDust.json';

interface DrawResp {
  win: boolean;
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

const segColors = ['#a78bfa', '#f9a8d4', '#67e8f9', '#fde68a'];

export function BlindboxDrawPage() {
  const { id } = useParams();
  const boxId = Number(id);
  const navigate = useNavigate();
  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<DrawResp | null>(null);
  const [resultIdx, setResultIdx] = useState<number | null>(null);
  const [showReveal, setShowReveal] = useState(false);
  const [showPrizePool, setShowPrizePool] = useState(false);
  const drawBtnRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setPrizes([
      { id: 1, prizeName: '未中奖', prizeImage: '', weight: 60 },
      { id: 2, prizeName: '咖啡券', prizeImage: '', weight: 25 },
      { id: 3, prizeName: '帆布袋', prizeImage: '', weight: 10 },
      { id: 4, prizeName: 'T 恤', prizeImage: '', weight: 5 },
    ]);
  }, [boxId]);

  const segments = prizes.map((p, i) => ({
    label: p.prizeName,
    color: segColors[i % segColors.length],
  }));

  const totalWeight = prizes.reduce((s, p) => s + p.weight, 0);

  const draw = async () => {
    if (spinning) return;
    setShowReveal(false);
    setSpinning(true);
    try {
      const token = localStorage.getItem('cpm_jwt');
      const { data } = await axios.post<DrawResp>(
        '/api/v1/mall/blindbox/draw',
        { boxId },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const idx = prizes.findIndex((p) => p.prizeName === data.prizeName);
      setResultIdx(idx >= 0 ? idx : 0);
      setResult(data);
    } catch (_e) {
      setSpinning(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--cpm-bg-0)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Lottie 全屏金粉（中奖时） */}
      {result?.win && (
        <Lottie
          animationData={goldDust}
          loop={false}
          style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 100 }}
        />
      )}

      {/* Mesh 光斑 */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          left: '-20%',
          top: '-10%',
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(167,139,250,0.3), transparent 65%)',
          filter: 'blur(60px)',
          pointerEvents: 'none',
        }}
      />
      <div
        aria-hidden
        style={{
          position: 'absolute',
          right: '-15%',
          bottom: '5%',
          width: 360,
          height: 360,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(253,164,175,0.28), transparent 65%)',
          filter: 'blur(60px)',
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
        {/* 顶部状态栏 */}
        <div
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 20,
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

        {/* Hero 卡（盲盒信息 + 奖品池折叠） */}
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
            padding: '18px 18px 14px',
            marginBottom: 20,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <div>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: '0.12em',
                  color: 'var(--cpm-text-tertiary)',
                  marginBottom: 4,
                }}
              >
                BLIND BOX
              </div>
              <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--cpm-text-primary)' }}>
                文化盲盒 · #{boxId}
              </div>
            </div>
            <span
              style={{
                padding: '5px 12px',
                borderRadius: 999,
                background: 'var(--cpm-brand-violet-bg)',
                color: 'var(--cpm-brand-violet)',
                fontSize: 13,
                fontWeight: 700,
                fontFeatureSettings: '"tnum"',
              }}
            >
              1 次起
            </span>
          </div>

          {/* 奖品池折叠面板 */}
          <motion.button
            onClick={() => setShowPrizePool((v) => !v)}
            whileTap={{ scale: 0.97 }}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 0',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              borderTop: '1px solid var(--cpm-card-border)',
              fontSize: 13,
              fontWeight: 500,
              color: 'var(--cpm-text-secondary)',
            }}
          >
            <span>查看奖品概率</span>
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
                transition={{ duration: 0.22 }}
                style={{ overflow: 'hidden' }}
              >
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, paddingTop: 10 }}>
                  {prizes.map((p, i) => (
                    <span
                      key={p.id}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 5,
                        padding: '4px 10px',
                        borderRadius: 999,
                        background: `${segColors[i % segColors.length]}25`,
                        fontSize: 12,
                        fontWeight: 600,
                        color: 'var(--cpm-text-primary)',
                      }}
                    >
                      <span
                        style={{
                          width: 7,
                          height: 7,
                          borderRadius: '50%',
                          background: segColors[i % segColors.length],
                        }}
                      />
                      {p.prizeName}
                      <span style={{ color: 'var(--cpm-text-tertiary)', fontWeight: 500 }}>
                        {Math.round((p.weight / totalWeight) * 100)}%
                      </span>
                    </span>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.section>

        {/* 3D 转盘 · 白卡包裹 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          style={{
            background: '#fff',
            borderRadius: 28,
            border: '1px solid var(--cpm-card-border)',
            boxShadow: spinning
              ? 'var(--cpm-shadow-glow-violet)'
              : 'var(--cpm-shadow-soft)',
            padding: 16,
            position: 'relative',
            transition: 'box-shadow 0.4s ease',
            marginBottom: 24,
          }}
        >
          {/* 装饰 ring */}
          <div
            aria-hidden
            style={{
              position: 'absolute',
              inset: -1,
              borderRadius: 28,
              background: spinning
                ? 'linear-gradient(135deg,rgba(124,58,237,0.12),rgba(8,145,178,0.08))'
                : 'transparent',
              pointerEvents: 'none',
              transition: 'background 0.4s ease',
            }}
          />
          {segments.length > 0 ? (
            <BlindboxWheel
              segments={segments}
              spinning={spinning}
              resultIndex={resultIdx}
              onSpinEnd={() => {
                setSpinning(false);
                setShowReveal(true);
              }}
              size={300}
            />
          ) : (
            <div
              style={{
                width: 300,
                height: 300,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--cpm-text-muted)',
                fontSize: 14,
              }}
            >
              加载中...
            </div>
          )}
        </motion.div>

        {/* 抽奖大按钮 */}
        <div ref={drawBtnRef} style={{ width: '100%' }}>
          <motion.button
            onClick={draw}
            disabled={spinning}
            whileHover={spinning ? undefined : { scale: 1.02 }}
            whileTap={spinning ? undefined : { scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 350, damping: 22 }}
            style={{
              width: '100%',
              padding: '16px 0',
              borderRadius: 18,
              fontSize: 17,
              fontWeight: 700,
              fontFamily: 'var(--cpm-font-sans)',
              letterSpacing: '0.04em',
              border: 'none',
              background: spinning
                ? 'linear-gradient(135deg, #a78bfa 0%, #67e8f9 100%)'
                : 'linear-gradient(135deg, var(--cpm-brand-violet) 0%, var(--cpm-brand-cyan) 100%)',
              color: '#fff',
              cursor: spinning ? 'not-allowed' : 'pointer',
              boxShadow: spinning
                ? '0 12px 32px -8px rgba(167,139,250,0.55)'
                : 'var(--cpm-shadow-glow-violet)',
              transition: 'background 0.3s ease, box-shadow 0.3s ease',
              opacity: spinning ? 0.85 : 1,
            }}
          >
            {spinning ? '旋转中...' : '开始抽奖 ◈'}
          </motion.button>
        </div>

        {/* 中奖/未中奖 揭示弹层 */}
        <AnimatePresence>
          {showReveal && result && (
            <motion.div
              initial={{ opacity: 0, scale: 0.88, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 10 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20 }}
              style={{
                position: 'fixed',
                inset: 0,
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'center',
                zIndex: 200,
                padding: '0 16px 32px',
              }}
            >
              {/* 背景蒙版 */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowReveal(false)}
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'rgba(15,23,42,0.35)',
                  backdropFilter: 'blur(4px)',
                  WebkitBackdropFilter: 'blur(4px)',
                }}
              />
              <div style={{ position: 'relative', width: '100%', maxWidth: 428 }}>
                {result.win ? (
                  /* 中奖卡 */
                  <div
                    style={{
                      borderRadius: 28,
                      padding: '28px 24px 24px',
                      background: 'linear-gradient(135deg, #fefce8 0%, #fef3c7 40%, #ede9fe 100%)',
                      border: '1px solid rgba(255,255,255,0.8)',
                      boxShadow: '0 24px 64px -16px rgba(245,158,11,0.35)',
                      textAlign: 'center',
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      aria-hidden
                      style={{
                        position: 'absolute',
                        inset: 0,
                        background:
                          'radial-gradient(circle at 50% 30%, rgba(253,230,138,0.6), transparent 60%)',
                        pointerEvents: 'none',
                      }}
                    />
                    <div style={{ position: 'relative' }}>
                      <motion.div
                        initial={{ scale: 0.5, rotate: -10 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: 'spring', stiffness: 280, damping: 16 }}
                        style={{ fontSize: 56, marginBottom: 8, lineHeight: 1 }}
                      >
                        🎉
                      </motion.div>
                      <div
                        style={{
                          fontSize: 28,
                          fontWeight: 800,
                          color: '#92400e',
                          letterSpacing: '-0.02em',
                          marginBottom: 6,
                        }}
                      >
                        WIN!
                      </div>
                      <div
                        style={{
                          fontSize: 20,
                          fontWeight: 700,
                          color: 'var(--cpm-text-primary)',
                          marginBottom: 8,
                        }}
                      >
                        {result.prizeName}
                      </div>
                      <div
                        style={{
                          fontSize: 13,
                          color: 'var(--cpm-text-secondary)',
                          marginBottom: 20,
                        }}
                      >
                        已扣除 {result.amount} 积分
                      </div>
                      <motion.button
                        onClick={() => setShowReveal(false)}
                        whileTap={{ scale: 0.95 }}
                        style={{
                          width: '100%',
                          padding: '13px 0',
                          borderRadius: 14,
                          fontSize: 14,
                          fontWeight: 700,
                          fontFamily: 'var(--cpm-font-sans)',
                          border: 'none',
                          background: 'linear-gradient(135deg,#f59e0b,#d97706)',
                          color: '#fff',
                          cursor: 'pointer',
                          boxShadow: 'var(--cpm-shadow-glow-amber)',
                        }}
                      >
                        太棒了！
                      </motion.button>
                    </div>
                  </div>
                ) : (
                  /* 未中奖卡 */
                  <div
                    style={{
                      borderRadius: 28,
                      padding: '28px 24px 24px',
                      background: 'linear-gradient(135deg, #f8fafc 0%, #f0f9ff 100%)',
                      border: '1px solid rgba(255,255,255,0.8)',
                      boxShadow: 'var(--cpm-shadow-soft)',
                      textAlign: 'center',
                    }}
                  >
                    <motion.div
                      initial={{ scale: 0.6 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 260, damping: 18 }}
                      style={{ fontSize: 52, marginBottom: 10, lineHeight: 1 }}
                    >
                      😊
                    </motion.div>
                    <div
                      style={{
                        fontSize: 22,
                        fontWeight: 700,
                        color: 'var(--cpm-text-primary)',
                        marginBottom: 8,
                        letterSpacing: '-0.01em',
                      }}
                    >
                      差一点！
                    </div>
                    <div
                      style={{
                        fontSize: 14,
                        color: 'var(--cpm-text-secondary)',
                        lineHeight: 1.6,
                        marginBottom: 20,
                      }}
                    >
                      本次未中奖，<strong>不扣分</strong>
                      <br />
                      下次运气会更好的 ✨
                    </div>
                    <div style={{ display: 'flex', gap: 10 }}>
                      <motion.button
                        onClick={() => { setShowReveal(false); draw(); }}
                        whileTap={{ scale: 0.95 }}
                        style={{
                          flex: 1,
                          padding: '12px 0',
                          borderRadius: 14,
                          fontSize: 14,
                          fontWeight: 700,
                          fontFamily: 'var(--cpm-font-sans)',
                          border: 'none',
                          background: 'linear-gradient(135deg,var(--cpm-brand-violet),var(--cpm-brand-cyan))',
                          color: '#fff',
                          cursor: 'pointer',
                          boxShadow: 'var(--cpm-shadow-glow-violet)',
                        }}
                      >
                        再来一次
                      </motion.button>
                      <motion.button
                        onClick={() => setShowReveal(false)}
                        whileTap={{ scale: 0.95 }}
                        style={{
                          padding: '12px 18px',
                          borderRadius: 14,
                          fontSize: 14,
                          fontWeight: 600,
                          fontFamily: 'var(--cpm-font-sans)',
                          border: '1px solid var(--cpm-card-border)',
                          background: '#fff',
                          color: 'var(--cpm-text-secondary)',
                          cursor: 'pointer',
                          boxShadow: 'var(--cpm-shadow-soft)',
                        }}
                      >
                        返回
                      </motion.button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
