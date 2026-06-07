import { Button } from '@cpm/ui';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ActivityScheduleForm } from './ActivityScheduleForm';
import { BatchCard } from './BatchCard';
import { MallBatchTable } from './MallBatchTable';
import { SessionsSidebar } from './SessionsSidebar';
import { SlotForm } from './SlotForm';
import { StepBubble } from './StepBubble';
import { Suggestions } from './Suggestions';
import { useAgentChat } from './useAgentChat';

export function ChatPage() {
  const {
    turns,
    busy,
    send,
    publishActivity,
    formOpen,
    formPrefill,
    openForm,
    closeForm,
    slotForm,
    closeSlotForm,
    submitSlot,
    batch,
    closeBatch,
    submitBatch,
    batchForm,
    closeBatchForm,
    submitBatchForm,
    undo,
    sessionId,
    sessionsVersion,
    loadSession,
    newSession,
    endSession,
  } = useAgentChat();
  const [text, setText] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 1e6, behavior: 'smooth' });
  });

  // 从「AI 智能搜索」点历史会话进来：/chat?session=<id> → 加载该会话并清掉参数
  useEffect(() => {
    const sid = searchParams.get('session');
    if (sid) {
      void loadSession(Number(sid));
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, loadSession, setSearchParams]);

  const submit = () => {
    if (!text.trim() || busy) return;
    void send(text.trim());
    setText('');
    textareaRef.current?.focus();
  };

  return (
    <div
      style={{
        display: 'flex',
        height: 'calc(100vh - 56px)',
        margin: -28,
        overflow: 'hidden',
      }}
    >
      {/* Sessions sidebar */}
      <SessionsSidebar
        onPick={(id) => {
          void loadSession(id);
        }}
        onNew={newSession}
        activeId={sessionId}
        reloadKey={sessionsVersion}
      />

      {/* 主聊天区 */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          background: 'var(--cpm-bg-0)',
        }}
      >
        {/* 粘性 header */}
        <div
          style={{
            height: 54,
            borderBottom: '1px solid var(--cpm-card-border)',
            background: 'rgba(255,255,255,0.9)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            display: 'flex',
            alignItems: 'center',
            padding: '0 20px',
            gap: 12,
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: 9,
              background: 'linear-gradient(135deg, var(--cpm-brand-violet), var(--cpm-brand-cyan))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 14,
              color: '#fff',
            }}
          >
            ⚡
          </div>
          <div>
            <div
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: 'var(--cpm-text-primary)',
                letterSpacing: '-0.01em',
              }}
            >
              HR-Agent
            </div>
            <div style={{ fontSize: 10, color: 'var(--cpm-text-muted)', letterSpacing: '0.08em' }}>
              {busy ? 'THINKING...' : 'READY'}
            </div>
          </div>
          <div style={{ flex: 1 }} />
          <motion.button
            type="button"
            onClick={() => openForm({})}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.94 }}
            transition={{ type: 'spring', stiffness: 350, damping: 22 }}
            style={{
              padding: '5px 12px',
              borderRadius: 8,
              border: '1px solid rgba(124,58,237,0.3)',
              background: 'rgba(124,58,237,0.08)',
              color: 'var(--cpm-brand-violet)',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'var(--cpm-font-sans)',
            }}
          >
            + 发布活动
          </motion.button>
          <motion.button
            type="button"
            onClick={() => {
              void endSession();
            }}
            disabled={turns.length === 0}
            whileHover={{ scale: turns.length === 0 ? 1 : 1.05 }}
            whileTap={{ scale: turns.length === 0 ? 1 : 0.94 }}
            transition={{ type: 'spring', stiffness: 350, damping: 22 }}
            title="结束当前会话并归档摘要，开启新会话"
            style={{
              padding: '5px 12px',
              borderRadius: 8,
              border: '1px solid var(--cpm-card-border-strong)',
              background: 'transparent',
              color: turns.length === 0 ? 'var(--cpm-text-muted)' : 'var(--cpm-text-tertiary)',
              fontSize: 12,
              fontWeight: 500,
              cursor: turns.length === 0 ? 'default' : 'pointer',
              fontFamily: 'var(--cpm-font-sans)',
            }}
          >
            结束会话
          </motion.button>
        </div>

        {/* 消息列表 */}
        <div
          ref={scrollRef}
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '20px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
          }}
        >
          {turns.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              style={{
                textAlign: 'center',
                padding: '60px 20px',
              }}
            >
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 18,
                  background: 'linear-gradient(135deg, var(--cpm-brand-violet) 0%, var(--cpm-brand-cyan) 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 28,
                  color: '#fff',
                  margin: '0 auto 16px',
                  boxShadow: 'var(--cpm-shadow-glow-violet)',
                }}
              >
                ⚡
              </div>
              <div
                style={{
                  fontSize: 17,
                  fontWeight: 600,
                  color: 'var(--cpm-text-primary)',
                  marginBottom: 8,
                  letterSpacing: '-0.01em',
                }}
              >
                HR-Agent 已就绪
              </div>
              <div style={{ fontSize: 13, color: 'var(--cpm-text-tertiary)', lineHeight: 1.6 }}>
                你可以说：「发布一场下周的坦诚沟通分享会，奖励 50 分」
              </div>
              <Suggestions
                onPick={(s) => {
                  void send(s);
                }}
              />
            </motion.div>
          )}

          <AnimatePresence>
            {turns.map((t) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{ display: 'flex', flexDirection: 'column', gap: 10 }}
              >
                {/* 用户消息 · 靠右 */}
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <motion.div
                    initial={{ opacity: 0, x: 12, scale: 0.95 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 24 }}
                    style={{
                      maxWidth: '70%',
                      padding: '11px 16px',
                      borderRadius: 16,
                      borderTopRightRadius: 4,
                      background: 'var(--cpm-brand-violet)',
                      color: '#fff',
                      fontSize: 14,
                      lineHeight: 1.6,
                      fontFamily: 'var(--cpm-font-sans)',
                      boxShadow: 'var(--cpm-shadow-glow-violet)',
                    }}
                  >
                    {t.userText}
                  </motion.div>
                </div>

                {/* 助手步骤 · 靠左 */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingLeft: 4 }}>
                  {t.steps.map((s, j) => (
                    // biome-ignore lint/suspicious/noArrayIndexKey: steps have no stable ID; order-stable within a turn
                    <StepBubble key={j} step={s} onUndo={undo} />
                  ))}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {busy && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{ display: 'flex', alignItems: 'center', gap: 10 }}
            >
              <div
                style={{
                  display: 'flex',
                  gap: 4,
                  padding: '10px 14px',
                  borderRadius: 14,
                  borderTopLeftRadius: 4,
                  background: '#fff',
                  border: '1px solid var(--cpm-card-border)',
                  boxShadow: 'var(--cpm-shadow-soft)',
                }}
              >
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    animate={{ y: [0, -4, 0] }}
                    transition={{ duration: 0.6, repeat: Number.POSITIVE_INFINITY, delay: i * 0.12 }}
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      background: 'var(--cpm-brand-violet)',
                      opacity: 0.6,
                    }}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* 发布活动日程表单：停靠在输入框正上方，常驻可见，不随消息区滚动 */}
        {formOpen && (
          <div style={{ padding: '12px 20px 0', flexShrink: 0, background: 'var(--cpm-bg-0)' }}>
            <ActivityScheduleForm
              prefill={formPrefill}
              onSubmit={(payload) => {
                void publishActivity(payload);
              }}
              onCancel={closeForm}
            />
          </div>
        )}

        {/* 对话式收集信息表单（ask_user / 积分·商品·徽章·日程卡片）：同样停靠输入框上方 */}
        {slotForm && (
          <div style={{ padding: '12px 20px 0', flexShrink: 0, background: 'var(--cpm-bg-0)' }}>
            <SlotForm
              spec={slotForm}
              onSubmit={(text) => {
                void submitSlot(text);
              }}
              onCancel={closeSlotForm}
            />
          </div>
        )}

        {/* 商品批量表格（open_mall_batch）：停靠输入框上方 */}
        {batch && (
          <div style={{ padding: '12px 20px 0', flexShrink: 0, background: 'var(--cpm-bg-0)' }}>
            <MallBatchTable
              spec={batch}
              onSubmit={(text) => {
                void submitBatch(text);
              }}
              onCancel={closeBatch}
            />
          </div>
        )}

        {/* 通用批量卡（积分/活动）：停靠输入框上方 */}
        {batchForm && (
          <div style={{ padding: '12px 20px 0', flexShrink: 0, background: 'var(--cpm-bg-0)' }}>
            <BatchCard
              spec={batchForm}
              onSubmit={(text) => {
                void submitBatchForm(text);
              }}
              onCancel={closeBatchForm}
            />
          </div>
        )}

        {/* 底部输入区 */}
        <div
          style={{
            borderTop: '1px solid var(--cpm-card-border)',
            padding: '14px 20px',
            background: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            display: 'flex',
            gap: 12,
            alignItems: 'flex-end',
            flexShrink: 0,
          }}
        >
          <div style={{ flex: 1, position: 'relative' }}>
            <textarea
              ref={textareaRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
                  e.preventDefault();
                  submit();
                }
              }}
              placeholder="对 HR-Agent 说点什么..."
              rows={2}
              style={{
                display: 'block',
                width: '100%',
                padding: '11px 14px',
                borderRadius: 14,
                border: '1.5px solid var(--cpm-card-border-strong)',
                background: 'var(--cpm-bg-0)',
                fontSize: 14,
                color: 'var(--cpm-text-primary)',
                resize: 'none',
                outline: 'none',
                fontFamily: 'var(--cpm-font-sans)',
                lineHeight: 1.6,
                boxSizing: 'border-box',
                transition: 'border-color 0.2s, box-shadow 0.2s',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'var(--cpm-brand-violet)';
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(124,58,237,0.1)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'var(--cpm-card-border-strong)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
            <div
              style={{
                position: 'absolute',
                bottom: 8,
                right: 12,
                fontSize: 10,
                color: 'var(--cpm-text-muted)',
                fontWeight: 500,
                letterSpacing: '0.05em',
                pointerEvents: 'none',
              }}
            >
              Enter 发送 · Shift+Enter 换行
            </div>
          </div>
          <Button tone="primary" size="md" onClick={submit} disabled={busy || !text.trim()} style={{ flexShrink: 0 }}>
            {busy ? '思考中…' : '发送'}
          </Button>
        </div>
      </div>
    </div>
  );
}
