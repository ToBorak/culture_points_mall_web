import { AnimatePresence, motion } from 'framer-motion';
import { type CSSProperties, useState } from 'react';
import type { Step } from './types';

interface Props {
  step: Step;
}

function CollapseBtn({
  open,
  onToggle,
  label,
}: {
  open: boolean;
  onToggle: () => void;
  label?: string;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: '3px 8px',
        borderRadius: 6,
        border: '1px solid rgba(15,23,42,0.1)',
        background: 'rgba(15,23,42,0.04)',
        color: 'var(--cpm-text-tertiary)',
        fontSize: 11,
        fontWeight: 500,
        cursor: 'pointer',
        fontFamily: 'var(--cpm-font-sans)',
      }}
    >
      <span
        style={{ transition: 'transform 0.2s', display: 'inline-block', transform: open ? 'rotate(90deg)' : 'none' }}
      >
        ›
      </span>
      {label ?? (open ? '折叠' : '展开')}
    </button>
  );
}

const codeStyle: CSSProperties = {
  padding: '1px 6px',
  borderRadius: 4,
  background: 'rgba(255,255,255,0.7)',
  border: '1px solid rgba(217,119,6,0.18)',
  fontFamily: 'monospace',
  fontSize: 11.5,
  color: '#9a3412',
};

export function StepBubble({ step }: Props) {
  const [open, setOpen] = useState(false);

  if (step.kind === 'llm_text') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        style={{
          maxWidth: '75%',
          padding: '12px 16px',
          borderRadius: 16,
          borderTopLeftRadius: 4,
          background: '#fff',
          border: '1px solid var(--cpm-card-border)',
          boxShadow: 'var(--cpm-shadow-soft)',
          fontSize: 14,
          lineHeight: 1.65,
          color: 'var(--cpm-text-primary)',
          fontFamily: 'var(--cpm-font-sans)',
          whiteSpace: 'pre-wrap',
        }}
      >
        {step.text}
      </motion.div>
    );
  }

  if (step.kind === 'tool_use') {
    return (
      <motion.div
        initial={{ opacity: 0, x: -6 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        style={{
          maxWidth: '80%',
          borderRadius: 14,
          border: '1.5px solid rgba(109,40,217,0.25)',
          background: 'rgba(124,58,237,0.04)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 14px',
          }}
        >
          <span
            style={{
              width: 26,
              height: 26,
              borderRadius: 8,
              background: 'rgba(124,58,237,0.12)',
              color: 'var(--cpm-brand-violet)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 14,
              flexShrink: 0,
            }}
          >
            ⚡
          </span>
          <span
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: 'var(--cpm-brand-violet)',
              flex: 1,
              fontFamily: 'var(--cpm-font-sans)',
            }}
          >
            调用 {step.toolName}
          </span>
          <CollapseBtn open={open} onToggle={() => setOpen((p) => !p)} label="参数" />
        </div>
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              style={{ overflow: 'hidden' }}
            >
              <pre
                style={{
                  margin: 0,
                  padding: '0 14px 12px',
                  fontSize: 11,
                  color: 'var(--cpm-text-secondary)',
                  background: 'transparent',
                  fontFamily: 'monospace',
                  overflowX: 'auto',
                }}
              >
                {JSON.stringify(step.input, null, 2)}
              </pre>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  }

  if (step.kind === 'tool_result') {
    const isErr = Boolean(step.error);
    const borderColor = isErr ? 'rgba(239,68,68,0.3)' : 'rgba(16,185,129,0.3)';
    const bgColor = isErr ? 'rgba(239,68,68,0.04)' : 'rgba(16,185,129,0.04)';
    const iconBg = isErr ? 'rgba(239,68,68,0.12)' : 'rgba(16,185,129,0.12)';
    const iconColor = isErr ? 'var(--cpm-danger)' : 'var(--cpm-success)';
    const icon = isErr ? '✕' : '✓';

    return (
      <motion.div
        initial={{ opacity: 0, x: -6 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        style={{
          maxWidth: '80%',
          borderRadius: 14,
          border: `1.5px solid ${borderColor}`,
          background: bgColor,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 14px',
          }}
        >
          <span
            style={{
              width: 26,
              height: 26,
              borderRadius: 8,
              background: iconBg,
              color: iconColor,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 13,
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            {icon}
          </span>
          <span
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: iconColor,
              flex: 1,
              fontFamily: 'var(--cpm-font-sans)',
            }}
          >
            {isErr ? `${step.toolName} 出错` : `${step.toolName} 完成`}
          </span>
          {!isErr && <CollapseBtn open={open} onToggle={() => setOpen((p) => !p)} label="输出" />}
        </div>
        {isErr && (
          <div
            style={{
              padding: '0 14px 12px',
              fontSize: 12,
              color: 'var(--cpm-danger)',
              fontFamily: 'var(--cpm-font-sans)',
            }}
          >
            {step.error}
          </div>
        )}
        <AnimatePresence>
          {!isErr && open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              style={{ overflow: 'hidden' }}
            >
              <pre
                style={{
                  margin: 0,
                  padding: '0 14px 12px',
                  fontSize: 11,
                  color: 'var(--cpm-text-secondary)',
                  background: 'transparent',
                  fontFamily: 'monospace',
                  overflowX: 'auto',
                }}
              >
                {JSON.stringify(step.output, null, 2)}
              </pre>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  }

  if (step.kind === 'error') {
    const raw = step.error ?? '';
    const isAuthErr = /x-api-key|authentication_error|401|api[_-]?key/i.test(raw) || /未配置.*api/i.test(raw);
    if (isAuthErr) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          style={{
            maxWidth: '88%',
            borderRadius: 16,
            border: '1.5px solid rgba(217,119,6,0.25)',
            background: 'linear-gradient(135deg, rgba(254,243,199,0.6) 0%, rgba(254,215,170,0.4) 100%)',
            padding: '14px 18px',
            display: 'flex',
            gap: 12,
            alignItems: 'flex-start',
            fontFamily: 'var(--cpm-font-sans)',
          }}
        >
          <span
            style={{
              width: 32,
              height: 32,
              borderRadius: 10,
              background: '#fff',
              color: '#d97706',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 16,
              fontWeight: 700,
              flexShrink: 0,
              border: '1px solid rgba(217,119,6,0.2)',
            }}
          >
            ⚡
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#9a3412', marginBottom: 4 }}>LLM 尚未配置</div>
            <div style={{ fontSize: 12.5, color: '#7c2d12', lineHeight: 1.6 }}>
              HR-Agent 依赖大模型推理，需要在后端 <code style={codeStyle}>configs/config.yaml</code> 配置{' '}
              <code style={codeStyle}>llm.claude.api_key</code>，或导出环境变量{' '}
              <code style={codeStyle}>ANTHROPIC_API_KEY</code>{' '}
              后重启服务。除此之外的功能（活动、商城、签到、积分、徽章、排行榜、维度、钉钉推送）均已就绪。
            </div>
          </div>
        </motion.div>
      );
    }
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{
          maxWidth: '75%',
          padding: '10px 14px',
          borderRadius: 12,
          border: '1.5px solid rgba(239,68,68,0.25)',
          background: 'rgba(239,68,68,0.06)',
          fontSize: 13,
          color: 'var(--cpm-danger)',
          fontFamily: 'var(--cpm-font-sans)',
        }}
      >
        {raw}
      </motion.div>
    );
  }

  if (step.kind === 'done') {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '8px 0',
        }}
      >
        <div style={{ flex: 1, height: 1, background: 'var(--cpm-card-border)' }} />
        <span style={{ fontSize: 11, color: 'var(--cpm-text-muted)', fontWeight: 500 }}>本轮结束</span>
        <div style={{ flex: 1, height: 1, background: 'var(--cpm-card-border)' }} />
      </div>
    );
  }

  return null;
}
