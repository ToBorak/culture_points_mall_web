import { useState, useRef, useEffect } from 'react';
import { Panel, ComicButton } from '@cpm/ui';
import { useAgentChat } from './useAgentChat';
import { StepBubble } from './StepBubble';

export function ChatPage() {
  const { turns, busy, send } = useAgentChat();
  const [text, setText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 1e6, behavior: 'smooth' });
  }, [turns]);

  const submit = () => {
    if (!text.trim() || busy) return;
    void send(text.trim());
    setText('');
  };

  return (
    <div className="flex flex-col h-full">
      <div ref={scrollRef} className="flex-1 overflow-auto min-h-0 px-4 py-2 space-y-4">
        {turns.map((t, i) => (
          <div key={i}>
            <div className="text-right mb-2">
              <Panel shadow="pink" style={{ display: 'inline-block', maxWidth: '70%' }}>
                <div className="font-kuaile">{t.userText}</div>
              </Panel>
            </div>
            {t.steps.map((s, j) => <StepBubble key={j} step={s} />)}
          </div>
        ))}
      </div>
      <div className="border-t-3 border-ink p-3 flex gap-2">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) submit(); }}
          placeholder="对 HR-Agent 说点什么...（Cmd/Ctrl+Enter 发送）"
          className="flex-1 border-3 border-ink rounded p-2 font-kuaile"
          rows={2}
        />
        <ComicButton onClick={submit} tone="red">{busy ? '思考中…' : '发送'}</ComicButton>
      </div>
    </div>
  );
}
