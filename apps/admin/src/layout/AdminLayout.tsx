import type { ReactNode } from 'react';
import { AiSearch } from './AiSearch';
import { Sidebar } from './Sidebar';

const meshStyle: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  zIndex: 0,
  pointerEvents: 'none',
  background: 'var(--cpm-bg-0)',
  overflow: 'hidden',
};

export function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        background: 'var(--cpm-bg-0)',
        fontFamily: 'var(--cpm-font-sans)',
        position: 'relative',
      }}
    >
      {/* Mesh gradient 背景光斑（减弱版） */}
      <div style={meshStyle} aria-hidden>
        <div
          style={{
            position: 'absolute',
            width: 560,
            height: 560,
            right: '5%',
            top: '-10%',
            background: 'radial-gradient(circle, var(--cpm-mesh-1) 0%, transparent 65%)',
            filter: 'blur(80px)',
            borderRadius: '50%',
            opacity: 0.5,
          }}
        />
        <div
          style={{
            position: 'absolute',
            width: 420,
            height: 420,
            left: '10%',
            bottom: '5%',
            background: 'radial-gradient(circle, var(--cpm-mesh-2) 0%, transparent 65%)',
            filter: 'blur(80px)',
            borderRadius: '50%',
            opacity: 0.4,
          }}
        />
        <div
          style={{
            position: 'absolute',
            width: 360,
            height: 360,
            right: '25%',
            bottom: '15%',
            background: 'radial-gradient(circle, var(--cpm-mesh-3) 0%, transparent 65%)',
            filter: 'blur(80px)',
            borderRadius: '50%',
            opacity: 0.35,
          }}
        />
      </div>

      {/* Sidebar */}
      <Sidebar />

      {/* 主区 */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* 顶部 header bar */}
        <header
          style={{
            height: 56,
            borderBottom: '1px solid var(--cpm-card-border)',
            background: 'rgba(255,255,255,0.85)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            padding: '0 28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'sticky',
            top: 0,
            zIndex: 5,
            gap: 16,
          }}
        >
          {/* AI 智能搜索：自然语言 → 跳到最匹配的后台功能 */}
          <AiSearch />

          {/* 右侧操作区 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              type="button"
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                border: '1px solid var(--cpm-card-border)',
                background: 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: 16,
                color: 'var(--cpm-text-tertiary)',
              }}
            >
              🔔
            </button>
          </div>
        </header>

        {/* 主内容区 */}
        <main
          style={{
            flex: 1,
            padding: 28,
            overflowY: 'auto',
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
