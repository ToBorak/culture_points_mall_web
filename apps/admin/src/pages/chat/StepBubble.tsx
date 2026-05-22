import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
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
      <span style={{ transition: 'transform 0.2s', display: 'inline-block', transform: open ? 'rotate(90deg)' : 'none' }}>
        ›
      </span>
      {label ?? (open ? '折叠' : '展开')}
    </button>
  );
}

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
          <div style={{ padding: '0 14px 12px', fontSize: 12, color: 'var(--cpm-danger)', fontFamily: 'var(--cpm-font-sans)' }}>
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
        {step.error}
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
