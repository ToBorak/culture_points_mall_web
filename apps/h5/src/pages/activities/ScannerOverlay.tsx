import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { type BarcodeDetectorLike, getBarcodeDetectorCtor } from './lib';

interface ScannerOverlayProps {
  onResult: (text: string) => void;
  onClose: () => void;
}

/** 浏览器内摄像头扫码浮层（基于 BarcodeDetector）。钉钉环境优先走原生扫一扫。 */
export function ScannerOverlay({ onResult, onClose }: ScannerOverlayProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const onResultRef = useRef(onResult);
  onResultRef.current = onResult;
  const [error, setError] = useState<string | null>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: 摄像头仅在挂载时开启一次，回调用 ref 透传
  useEffect(() => {
    let stream: MediaStream | null = null;
    let raf = 0;
    let done = false;

    const Ctor = getBarcodeDetectorCtor();
    if (!Ctor) {
      setError('当前浏览器不支持扫码，请使用钉钉扫一扫或手动输入签到码');
      return;
    }
    const detector: BarcodeDetectorLike = new Ctor({ formats: ['qr_code'] });

    const tick = async () => {
      const video = videoRef.current;
      if (!video || done) return;
      try {
        const codes = await detector.detect(video);
        const hit = codes.find((c) => c.rawValue);
        if (hit) {
          done = true;
          onResultRef.current(hit.rawValue);
          return;
        }
      } catch {
        // 单帧解码失败忽略，继续下一帧
      }
      raf = requestAnimationFrame(tick);
    };

    navigator.mediaDevices
      ?.getUserMedia({ video: { facingMode: 'environment' } })
      .then((s) => {
        stream = s;
        const video = videoRef.current;
        if (!video) return undefined;
        video.srcObject = s;
        video.setAttribute('playsinline', 'true');
        video.muted = true;
        return video.play();
      })
      .then(() => {
        raf = requestAnimationFrame(tick);
      })
      .catch(() => setError('无法访问摄像头，请在系统设置中允许相机权限'));

    return () => {
      done = true;
      cancelAnimationFrame(raf);
      for (const t of stream?.getTracks() ?? []) t.stop();
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 120,
        background: '#000',
        display: 'flex',
        flexDirection: 'column',
        height: '100dvh',
      }}
    >
      {/* biome-ignore lint/a11y/useMediaCaption: 实时摄像头预览无字幕轨 */}
      <video
        ref={videoRef}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
      />

      {/* 暗角 + 取景框 */}
      <div aria-hidden style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)' }} />
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: 248,
          height: 248,
          transform: 'translate(-50%, -54%)',
          borderRadius: 24,
          boxShadow: '0 0 0 9999px rgba(0,0,0,0.45)',
          border: '2px solid rgba(255,255,255,0.85)',
        }}
      />
      {/* 扫描线 */}
      {!error && (
        <motion.div
          aria-hidden
          initial={{ top: 0 }}
          animate={{ top: ['6%', '94%', '6%'] }}
          transition={{ duration: 2.6, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }}
          style={{
            position: 'absolute',
            left: 'calc(50% - 124px)',
            width: 248,
            height: 2,
            transform: 'translateY(-50%)',
            background: 'linear-gradient(90deg, transparent, var(--cpm-accent), transparent)',
            boxShadow: '0 0 12px var(--cpm-accent)',
          }}
        />
      )}

      {/* 顶栏 */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 'max(16px, env(safe-area-inset-top)) 16px 16px',
        }}
      >
        <span style={{ color: '#fff', fontSize: 16, fontWeight: 700, fontFamily: 'var(--cpm-font-sans)' }}>
          扫一扫签到
        </span>
        <button
          type="button"
          onClick={onClose}
          aria-label="关闭扫码"
          style={{
            width: 44,
            height: 44,
            borderRadius: 999,
            border: 'none',
            background: 'rgba(255,255,255,0.16)',
            color: '#fff',
            display: 'grid',
            placeItems: 'center',
            cursor: 'pointer',
            touchAction: 'manipulation',
          }}
        >
          <X size={22} />
        </button>
      </div>

      {/* 底部说明 / 错误 */}
      <div style={{ marginTop: 'auto', position: 'relative', zIndex: 1, padding: '0 24px max(28px, env(safe-area-inset-bottom))' }}>
        <AnimatePresence mode="wait">
          {error ? (
            <motion.div
              key="err"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                background: 'rgba(255,255,255,0.96)',
                borderRadius: 18,
                padding: '18px 18px 16px',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
              }}
            >
              <span style={{ fontSize: 14, color: 'var(--cpm-ink-1)', lineHeight: 1.6 }}>{error}</span>
              <button
                type="button"
                onClick={onClose}
                style={{
                  alignSelf: 'center',
                  padding: '10px 28px',
                  borderRadius: 12,
                  border: 'none',
                  background: 'var(--cpm-grad-brand)',
                  color: '#fff',
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: 'pointer',
                  touchAction: 'manipulation',
                }}
              >
                我知道了
              </button>
            </motion.div>
          ) : (
            <motion.p
              key="hint"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{ textAlign: 'center', color: 'rgba(255,255,255,0.86)', fontSize: 14, lineHeight: 1.6 }}
            >
              将取景框对准活动现场的签到二维码
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
