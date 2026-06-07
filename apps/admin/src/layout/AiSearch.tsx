import axios from 'axios';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// AiSearch 顶部「AI 智能搜索」：输入自然语言 → 后端 LLM 识别意图 → 返回最匹配的后台功能按钮，
// 点击直接跳到对应功能（覆盖全部一级菜单与核心能力：商品/统计/积分/活动/会话/日程…）。

interface Hit {
  label: string;
  route: string;
  icon: string;
  sessionId?: number; // 命中具体历史会话时带上，点击跳 /chat 并加载该会话
}

export function AiSearch() {
  const [q, setQ] = useState('');
  const [hits, setHits] = useState<Hit[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const boxRef = useRef<HTMLDivElement>(null);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  useEffect(() => {
    window.clearTimeout(timer.current);
    const query = q.trim();
    if (!query) {
      setHits([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    timer.current = window.setTimeout(async () => {
      try {
        const token = localStorage.getItem('cpm_admin_jwt');
        const r = await axios.get<{ items: Hit[] | null }>(`/admin/agent/search?q=${encodeURIComponent(query)}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setHits(r.data.items ?? []);
        setOpen(true);
      } catch {
        setHits([]);
      }
      setLoading(false);
    }, 400);
    return () => window.clearTimeout(timer.current);
  }, [q]);

  const go = (hit: Hit) => {
    setOpen(false);
    setQ('');
    setHits([]);
    if (hit.sessionId) navigate(`/chat?session=${hit.sessionId}`);
    else navigate(hit.route);
  };

  return (
    <div ref={boxRef} style={{ position: 'relative', flex: 1, maxWidth: 360 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '7px 14px',
          borderRadius: 10,
          border: `1px solid ${open ? 'var(--cpm-brand-violet)' : 'var(--cpm-card-border)'}`,
          background: 'rgba(15,23,42,0.03)',
        }}
      >
        <span style={{ fontSize: 14, opacity: 0.7 }}>✨</span>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => {
            if (hits.length) setOpen(true);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && hits[0]) go(hits[0]);
            if (e.key === 'Escape') setOpen(false);
          }}
          placeholder="AI 智能搜索：描述你想做什么…"
          style={{
            flex: 1,
            border: 'none',
            outline: 'none',
            background: 'transparent',
            fontSize: 13,
            color: 'var(--cpm-text-primary)',
            fontFamily: 'var(--cpm-font-sans)',
          }}
        />
        {loading && <span style={{ fontSize: 11, color: 'var(--cpm-text-muted)', flexShrink: 0 }}>识别中…</span>}
      </div>
      {open && q.trim() !== '' && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            right: 0,
            background: '#fff',
            border: '1px solid var(--cpm-card-border)',
            borderRadius: 12,
            boxShadow: 'var(--cpm-shadow-soft)',
            overflow: 'hidden',
            zIndex: 50,
          }}
        >
          {hits.length === 0 && !loading && (
            <div style={{ padding: '12px 14px', fontSize: 12.5, color: 'var(--cpm-text-muted)' }}>没有匹配的功能</div>
          )}
          {hits.map((hit, i) => (
            <button
              key={hit.sessionId ? `s${hit.sessionId}` : hit.route}
              type="button"
              onClick={() => go(hit)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                width: '100%',
                textAlign: 'left',
                padding: '10px 14px',
                border: 'none',
                borderTop: i === 0 ? 'none' : '1px solid var(--cpm-card-border)',
                background: 'transparent',
                cursor: 'pointer',
                fontFamily: 'var(--cpm-font-sans)',
                fontSize: 13.5,
                color: 'var(--cpm-text-primary)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(124,58,237,0.06)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              <span style={{ fontSize: 16 }}>{hit.icon}</span>
              <span style={{ flex: 1 }}>{hit.label}</span>
              <span style={{ fontSize: 11, color: 'var(--cpm-brand-violet)' }}>前往 ›</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
