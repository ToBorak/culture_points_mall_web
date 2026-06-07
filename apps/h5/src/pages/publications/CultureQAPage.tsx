import { useCultureQA } from '@cpm/api-client';
import { PageHeader } from '@cpm/ui';
import { Send } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';

export function CultureQAPage() {
  const ask = useCultureQA();
  const [q, setQ] = useState('');
  const [history, setHistory] = useState<{ q: string; a: string }[]>([]);
  const [err, setErr] = useState<string | null>(null);

  const onAsk = () => {
    const question = q.trim();
    if (!question) return;
    setErr(null);
    ask.mutate(question, {
      onSuccess: (r) => {
        setHistory((h) => [...h, { q: question, a: r.answer }]);
        setQ('');
      },
      onError: (e: unknown) => {
        const axiosErr = e as { response?: { status?: number } };
        setErr(axiosErr?.response?.status === 503 ? 'AI 暂未开启' : '请求失败');
      },
    });
  };

  return (
    <div style={shellStyle}>
      <PageHeader title="AI 文化官" subtitle="问问企业文化与价值观" />

      <div style={{ minHeight: 120 }}>
        {history.map((item, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: chat history is append-only, index is stable
          <div key={i} style={{ marginBottom: 14 }}>
            <div style={{ textAlign: 'right', marginBottom: 6 }}>
              <span style={bubbleUser}>{item.q}</span>
            </div>
            <div>
              <span style={bubbleAI}>{item.a}</span>
            </div>
          </div>
        ))}
        {ask.isPending && (
          <div
            style={{
              fontSize: 12,
              color: 'var(--cpm-ink-2)',
              fontFamily: 'var(--cpm-font-sans)',
              padding: '4px 0',
            }}
          >
            思考中…
          </div>
        )}
        {err && <div style={{ color: '#ef4444', fontSize: 12, fontFamily: 'var(--cpm-font-sans)' }}>{err}</div>}
      </div>

      {/* 固定输入栏 */}
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '10px 12px 14px',
          background: 'var(--cpm-surface)',
          borderTop: '1px solid var(--cpm-border-subtle)',
          display: 'flex',
          gap: 8,
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        }}
      >
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              onAsk();
            }
          }}
          placeholder="例如：敢于创新指什么？"
          style={inputStyle}
        />
        <button type="button" onClick={onAsk} disabled={ask.isPending} aria-label="发送" style={sendBtnStyle}>
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}

const shellStyle: React.CSSProperties = {
  width: '100%',
  maxWidth: 640,
  margin: '0 auto',
  boxSizing: 'border-box',
  padding: '12px 16px 90px',
  fontFamily: 'var(--cpm-font-sans)',
};

const bubbleUser: React.CSSProperties = {
  display: 'inline-block',
  maxWidth: '80%',
  padding: '8px 12px',
  borderRadius: 14,
  background: 'var(--cpm-primary)',
  color: 'var(--cpm-on-primary)',
  fontSize: 13,
  textAlign: 'left',
  fontFamily: 'var(--cpm-font-sans)',
  lineHeight: 1.55,
};

const bubbleAI: React.CSSProperties = {
  display: 'inline-block',
  maxWidth: '85%',
  padding: '10px 12px',
  borderRadius: 14,
  background: 'var(--cpm-surface)',
  border: '1px solid var(--cpm-border-subtle)',
  color: 'var(--cpm-ink-1)',
  fontSize: 13,
  whiteSpace: 'pre-wrap',
  fontFamily: 'var(--cpm-font-sans)',
  lineHeight: 1.65,
  boxShadow: 'var(--cpm-elev-soft)',
};

const inputStyle: React.CSSProperties = {
  flex: 1,
  padding: '10px 14px',
  borderRadius: 20,
  border: '1px solid var(--cpm-border-subtle)',
  background: 'var(--cpm-app-bg)',
  color: 'var(--cpm-ink-1)',
  fontSize: 14,
  fontFamily: 'var(--cpm-font-sans)',
  outline: 'none',
};

const sendBtnStyle: React.CSSProperties = {
  width: 44,
  height: 44,
  borderRadius: '50%',
  border: 'none',
  background: 'var(--cpm-primary)',
  color: 'var(--cpm-on-primary)',
  display: 'grid',
  placeItems: 'center',
  cursor: 'pointer',
  boxShadow: 'var(--cpm-elev-candy)',
  flexShrink: 0,
};
