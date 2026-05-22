import { useCallback, useState } from 'react';
import type { ChatTurn, Step } from './types';

export function useAgentChat() {
  const [turns, setTurns] = useState<ChatTurn[]>([]);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);

  const send = useCallback(
    async (text: string) => {
      const turn: ChatTurn = {
        id: `${Date.now()}-${Math.random()}`,
        sessionId,
        userText: text,
        steps: [],
        done: false,
      };
      setTurns((prev) => [...prev, turn]);
      setBusy(true);

      const token = localStorage.getItem('cpm_admin_jwt');
      const resp = await fetch('/admin/agent/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ sessionId, text }),
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
            setTurns((prev) => {
              const next = [...prev];
              const last = next[next.length - 1];
              if (last) {
                last.steps = [...last.steps, step];
                if (step.kind === 'done' || step.kind === 'error') last.done = true;
              }
              return next;
            });
          }
        }
      }
      setBusy(false);
    },
    [sessionId],
  );

  return { turns, busy, send };
}
