import { useCallback, useState } from 'react';
import type { PublishPayload } from './ActivityScheduleForm';
import type { ChatTurn, Step } from './types';

export function useAgentChat() {
  const [turns, setTurns] = useState<ChatTurn[]>([]);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [formPrefill, setFormPrefill] = useState<Record<string, unknown>>({});

  const openForm = useCallback((prefill?: Record<string, unknown>) => {
    setFormPrefill(prefill ?? {});
    setFormOpen(true);
  }, []);
  const closeForm = useCallback(() => setFormOpen(false), []);

  // runStream 读取 SSE（/admin/agent/chat 与 /admin/activities/publish 同款协议），把 step 追加到新建的一轮。
  const runStream = useCallback(
    async (url: string, body: unknown, userText: string) => {
      const turn: ChatTurn = {
        id: `${Date.now()}-${Math.random()}`,
        sessionId,
        userText,
        steps: [],
        done: false,
      };
      setTurns((prev) => [...prev, turn]);
      setBusy(true);

      const token = localStorage.getItem('cpm_admin_jwt');
      const resp = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      if (!resp.ok || !resp.body) {
        setBusy(false);
        return;
      }
      const reader = resp.body.getReader();
      const dec = new TextDecoder();
      let buf = '';
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        buf += dec.decode(value, { stream: true });
        const events = buf.split('\n\n');
        buf = events.pop() ?? '';
        for (const raw of events) {
          const lines = raw.split('\n');
          let event = '';
          let data = '';
          for (const l of lines) {
            if (l.startsWith('event:')) event = l.slice(6).trim();
            if (l.startsWith('data:')) data = l.slice(5).trim();
          }
          if (!event || !data) continue;
          if (event === 'session') {
            const obj = JSON.parse(data) as { sessionId: number };
            setSessionId(obj.sessionId);
          } else if (event === 'step') {
            const step = JSON.parse(data) as Step;
            // agent 通过 open_activity_form 工具发出"渲染日程表单"的信号
            const out = step.output as { form?: string; prefill?: Record<string, unknown> } | undefined;
            if (step.kind === 'tool_result' && out?.form === 'activity_schedule') {
              setFormPrefill(out.prefill ?? {});
              setFormOpen(true);
            }
            setTurns((prev) => {
              if (prev.length === 0) return prev;
              const last = prev[prev.length - 1];
              const updated: ChatTurn = {
                ...last,
                steps: [...last.steps, step],
                done: step.kind === 'done' || step.kind === 'error' ? true : last.done,
              };
              return [...prev.slice(0, -1), updated];
            });
          }
        }
      }
      setBusy(false);
    },
    [sessionId],
  );

  const send = useCallback(
    (text: string) => runStream('/admin/agent/chat', { sessionId, text }, text),
    [runStream, sessionId],
  );

  const publishActivity = useCallback(
    (payload: PublishPayload) => {
      setFormOpen(false);
      return runStream('/admin/activities/publish', payload, `发布活动：${payload.title}`);
    },
    [runStream],
  );

  return { turns, busy, send, publishActivity, formOpen, formPrefill, openForm, closeForm };
}
