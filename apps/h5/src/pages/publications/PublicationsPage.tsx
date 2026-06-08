import { useCurrentPublication } from '@cpm/api-client';
import type { PublishedView, SectionView } from '@cpm/types';
import { EmptyState, useBreakpoint } from '@cpm/ui';
import { MessageCircle, PencilLine, Sparkles } from 'lucide-react';
import type React from 'react';
import { useNavigate } from 'react-router-dom';
import { PubSection } from './SectionRenderer';

// 文化刊固定栏目顺序（前端写死，不依赖后台配置）；leaderboard / activity / custom(领导寄语) / editorial 不展示。
const SECTION_ORDER = ['star', 'values', 'honors', 'lottery', 'innovation'];

export function PublicationsPage() {
  const nav = useNavigate();
  const { isDesktop } = useBreakpoint();
  const q = useCurrentPublication();

  if (q.isLoading) {
    return <div style={{ padding: 24, color: 'var(--cpm-ink-2)', fontSize: 14 }}>加载中…</div>;
  }

  const view = q.data as PublishedView | undefined;
  if (!view || !('publication' in view) || !view.publication) {
    return <EmptyState icon="📖" title="本期文化刊还没发布" description="敬请期待下一期内容" />;
  }

  const { publication, sections } = view;
  const byType = new Map<string, SectionView>();
  for (const s of sections) if (!byType.has(s.section.type)) byType.set(s.section.type, s);
  const ordered = SECTION_ORDER.map((t) => byType.get(t)).filter((s): s is SectionView => !!s);

  const goNominate = () => nav('/publications/nominate');
  const goPortrait = () => nav('/dna');
  const goQA = () => nav('/publications/qa');
  const goMine = () => nav('/publications/mine');

  return (
    <div style={isDesktop ? shellDesktop : shell}>
      {/* 渐变封面 */}
      <div style={cover}>
        <div style={coverGlow} />
        <div style={{ position: 'relative' }}>
          <div style={{ fontSize: 11, letterSpacing: 2, color: 'rgba(255,255,255,.8)', fontWeight: 600 }}>
            {publication.periodCode} · 季度刊
          </div>
          <div style={{ ...coverTitle, fontSize: isDesktop ? 30 : 26 }}>{publication.title}</div>
          {publication.introText && <p style={coverIntro}>{publication.introText}</p>}
          <span style={{ position: 'absolute', right: 0, top: -6, fontSize: 26 }}>✨</span>
        </div>
      </div>

      {/* 操作区：桌面端一行四个；移动端 CTA 独占 + 两个 AI 入口 */}
      {isDesktop ? (
        <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
          <button type="button" onClick={goNominate} style={{ ...ctaStyle, flex: 1.6, width: 'auto' }}>
            <PencilLine size={18} />
            提报本季文化星标
          </button>
          <button type="button" onClick={goPortrait} style={pillStyle}>
            <Sparkles size={16} />
            我的文化画像
          </button>
          <button type="button" onClick={goQA} style={pillStyle}>
            <MessageCircle size={16} />
            AI 文化官
          </button>
          <button type="button" onClick={goMine} style={pillStyle}>
            我的提报
          </button>
        </div>
      ) : (
        <>
          <button type="button" onClick={goNominate} style={ctaStyle}>
            <PencilLine size={18} />
            提报本季文化星标
          </button>
          <div style={{ display: 'flex', gap: 10, margin: '10px 0 22px' }}>
            <button type="button" onClick={goPortrait} style={pillStyle}>
              <Sparkles size={16} />
              我的文化画像
            </button>
            <button type="button" onClick={goQA} style={pillStyle}>
              <MessageCircle size={16} />
              AI 文化官
            </button>
          </div>
        </>
      )}

      {/* 栏目：桌面端双列瀑布(按奇偶分列，避免网格空洞与卡片截断)；移动端单列 */}
      {isDesktop ? (
        <div style={{ display: 'flex', gap: 28, alignItems: 'flex-start' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            {ordered
              .filter((_, i) => i % 2 === 0)
              .map((s) => (
                <PubSection key={s.section.id} view={s} />
              ))}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            {ordered
              .filter((_, i) => i % 2 === 1)
              .map((s) => (
                <PubSection key={s.section.id} view={s} />
              ))}
          </div>
        </div>
      ) : (
        ordered.map((s) => <PubSection key={s.section.id} view={s} />)
      )}

      {/* 移动端：底部「我的提报」（桌面端已在顶部操作区） */}
      {!isDesktop && (
        <button type="button" onClick={goMine} style={{ ...pillStyle, width: '100%', marginTop: 6 }}>
          我的提报 ›
        </button>
      )}
    </div>
  );
}

const shell: React.CSSProperties = {
  width: '100%',
  maxWidth: 640,
  margin: '0 auto',
  boxSizing: 'border-box',
  padding: '12px 16px 90px',
  fontFamily: 'var(--cpm-font-sans)',
};

// 桌面端：更宽容器 + 更舒展留白（移动端 shell 不受影响）。
const shellDesktop: React.CSSProperties = {
  ...shell,
  maxWidth: 1040,
  padding: '24px 32px 56px',
};

const cover: React.CSSProperties = {
  position: 'relative',
  overflow: 'hidden',
  borderRadius: 20,
  padding: '22px 20px 20px',
  background: 'linear-gradient(135deg,#7c3aed 0%,#5b6cf0 55%,#4f7cff 100%)',
  boxShadow: '0 14px 34px rgba(124,58,237,.32)',
  marginBottom: 16,
};

const coverGlow: React.CSSProperties = {
  position: 'absolute',
  right: -40,
  top: -50,
  width: 180,
  height: 180,
  borderRadius: '50%',
  background: 'radial-gradient(circle, rgba(255,255,255,.28), transparent 70%)',
};

const coverTitle: React.CSSProperties = {
  fontWeight: 900,
  lineHeight: 1.2,
  margin: '6px 0',
  background: 'linear-gradient(90deg,#fff,#ffe9a8)',
  WebkitBackgroundClip: 'text',
  backgroundClip: 'text',
  color: 'transparent',
};

const coverIntro: React.CSSProperties = {
  fontSize: 12.5,
  color: 'rgba(255,255,255,.92)',
  lineHeight: 1.7,
  margin: '8px 0 0',
  maxWidth: 720,
};

const ctaStyle: React.CSSProperties = {
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
  padding: 14,
  borderRadius: 14,
  border: 'none',
  color: '#fff',
  fontWeight: 700,
  fontSize: 14,
  background: 'linear-gradient(135deg,#a855f7,#4f7cff)',
  cursor: 'pointer',
  fontFamily: 'var(--cpm-font-sans)',
  boxShadow: 'var(--cpm-elev-candy)',
};

const pillStyle: React.CSSProperties = {
  flex: 1,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 6,
  padding: 11,
  borderRadius: 12,
  border: '1px solid var(--cpm-border-subtle)',
  background: 'var(--cpm-surface)',
  color: 'var(--cpm-ink-1)',
  fontSize: 12,
  fontWeight: 600,
  cursor: 'pointer',
  fontFamily: 'var(--cpm-font-sans)',
};
