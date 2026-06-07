import { useCurrentPublication } from '@cpm/api-client';
import type { PublishedView } from '@cpm/types';
import { EmptyState, PageHeader } from '@cpm/ui';
import { MessageCircle, PencilLine, Sparkles } from 'lucide-react';
import type React from 'react';
import { useNavigate } from 'react-router-dom';
import { SectionRenderer } from './SectionRenderer';

export function PublicationsPage() {
  const nav = useNavigate();
  const q = useCurrentPublication();

  if (q.isLoading) {
    return (
      <div
        style={{
          padding: 24,
          fontFamily: 'var(--cpm-font-sans)',
          color: 'var(--cpm-ink-2)',
          fontSize: 14,
        }}
      >
        加载中…
      </div>
    );
  }

  const view = q.data as PublishedView | undefined;
  if (!view || !('publication' in view) || !view.publication) {
    return <EmptyState icon="📖" title="本期文化刊还没发布" description="敬请期待下一期内容" />;
  }

  const { publication, sections } = view;

  return (
    <div style={shellStyle}>
      <PageHeader title={publication.title} subtitle={publication.periodCode} />

      {publication.introText && (
        <p
          style={{
            fontSize: 13,
            color: 'var(--cpm-ink-2)',
            lineHeight: 1.7,
            margin: '8px 0 16px',
            fontFamily: 'var(--cpm-font-sans)',
          }}
        >
          {publication.introText}
        </p>
      )}

      {/* 提报 CTA */}
      <button type="button" onClick={() => nav('/publications/nominate')} style={ctaStyle}>
        <PencilLine size={18} />
        提报本季文化星标
      </button>

      {/* AI 双入口 */}
      <div style={{ display: 'flex', gap: 10, margin: '10px 0 18px' }}>
        <button type="button" onClick={() => nav('/dna')} style={pillStyle}>
          <Sparkles size={16} />
          我的文化画像
        </button>
        <button type="button" onClick={() => nav('/publications/qa')} style={pillStyle}>
          <MessageCircle size={16} />
          AI 文化官
        </button>
      </div>

      {/* 栏目列表 */}
      {sections.map((s) => (
        <SectionRenderer key={s.section.id} view={s} />
      ))}

      {/* 我的提报链接 */}
      <button
        type="button"
        onClick={() => nav('/publications/mine')}
        style={{ ...pillStyle, width: '100%', marginTop: 8, justifyContent: 'center' }}
      >
        我的提报 ›
      </button>
    </div>
  );
}

const shellStyle: React.CSSProperties = {
  width: '100%',
  maxWidth: 640,
  margin: '0 auto',
  boxSizing: 'border-box',
  padding: '12px 16px 80px',
  fontFamily: 'var(--cpm-font-sans)',
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
  padding: 10,
  borderRadius: 12,
  border: '1px solid var(--cpm-border-subtle)',
  background: 'var(--cpm-surface)',
  color: 'var(--cpm-ink-1)',
  fontSize: 12,
  fontWeight: 600,
  cursor: 'pointer',
  fontFamily: 'var(--cpm-font-sans)',
};
