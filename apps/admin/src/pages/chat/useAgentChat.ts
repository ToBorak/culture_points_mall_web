import { useCallback, useState } from 'react';
import type { PublishPayload } from './ActivityScheduleForm';
import type { BatchFormSpec } from './BatchCard';
import type { MallBatchItem, MallBatchSpec } from './MallBatchTable';
import type { SlotField, SlotFormSpec } from './SlotForm';
import type { UndoDescriptor } from './StepBubble';
import type { ChatTurn, Step } from './types';

export function useAgentChat() {
  const [turns, setTurns] = useState<ChatTurn[]>([]);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  // 侧栏刷新计数：新建会话/结束会话时 +1，触发历史会话列表重新拉取
  const [sessionsVersion, setSessionsVersion] = useState(0);
  const [formOpen, setFormOpen] = useState(false);
  const [formPrefill, setFormPrefill] = useState<Record<string, unknown>>({});
  // 对话式收集信息（ask_user / open_*_form）发来的 slot_form 信号
  const [slotForm, setSlotForm] = useState<SlotFormSpec | null>(null);
  // 商品批量表格（open_mall_batch）发来的 mall_batch 信号
  const [batch, setBatch] = useState<MallBatchSpec | null>(null);
  // 通用批量卡（open_points_batch / open_activity_batch）发来的 batch_form 信号
  const [batchForm, setBatchForm] = useState<BatchFormSpec | null>(null);

  const openForm = useCallback((prefill?: Record<string, unknown>) => {
    setFormPrefill(prefill ?? {});
    setFormOpen(true);
  }, []);
  const closeForm = useCallback(() => setFormOpen(false), []);
  const closeSlotForm = useCallback(() => setSlotForm(null), []);
  const closeBatch = useCallback(() => setBatch(null), []);
  const closeBatchForm = useCallback(() => setBatchForm(null), []);

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
            setSessionId((prev) => {
              // 新会话刚被创建（之前没有 id）→ 刷新侧栏让它出现
              if (!prev && obj.sessionId) setSessionsVersion((v) => v + 1);
              return obj.sessionId;
            });
          } else if (event === 'step') {
            const step = JSON.parse(data) as Step;
            // 一轮结束后刷新侧栏：拾取异步生成好的 AI 标题/摘要
            if (step.kind === 'done') setSessionsVersion((v) => v + 1);
            // agent 通过 open_activity_form 工具发出"渲染日程表单"的信号
            const out = step.output as
              | {
                  form?: string;
                  prefill?: Record<string, unknown>;
                  title?: string;
                  intent?: string;
                  source?: string;
                  fields?: SlotField[];
                  items?: MallBatchItem[];
                }
              | undefined;
            if (step.kind === 'tool_result' && out?.form === 'activity_schedule') {
              setFormPrefill(out.prefill ?? {});
              setFormOpen(true);
            }
            // ask_user / open_points_form / open_mall_item_form / open_award_badge_form / open_schedule_form 的统一信号
            if (step.kind === 'tool_result' && out?.form === 'slot_form') {
              setSlotForm({
                title: out.title ?? '请补充以下信息',
                intent: out.intent,
                source: out.source,
                fields: out.fields ?? [],
                prefill: out.prefill ?? {},
              });
            }
            // open_mall_batch 的商品批量表格信号
            if (step.kind === 'tool_result' && out?.form === 'mall_batch') {
              setBatch({ title: out.title ?? '批量管理商品', items: out.items ?? [] });
            }
            // open_points_batch / open_activity_batch 的通用批量卡信号
            if (step.kind === 'tool_result' && out?.form === 'batch_form') {
              setBatchForm(step.output as unknown as BatchFormSpec);
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

  // 用户在 SlotForm 里填好/选好后，把结构化文本作为新一轮消息发回 agent，由 LLM 据此执行真正的操作
  const submitSlot = useCallback(
    (text: string) => {
      setSlotForm(null);
      return send(text);
    },
    [send],
  );

  // 商品批量表格提交：拼成回填文本发回 agent，由 LLM 调 batch_update_mall
  const submitBatch = useCallback(
    (text: string) => {
      setBatch(null);
      return send(text);
    },
    [send],
  );

  // 通用批量卡（积分/活动）提交
  const submitBatchForm = useCallback(
    (text: string) => {
      setBatchForm(null);
      return send(text);
    },
    [send],
  );

  // 加载某历史会话：把存的对话气泡读回来，下次点进来就能接着聊
  const loadSession = useCallback(async (id: number) => {
    const token = localStorage.getItem('cpm_admin_jwt');
    try {
      const resp = await fetch(`/admin/agent/sessions/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      if (!resp.ok) return;
      const data = (await resp.json()) as { turns?: Array<{ userText: string; steps: Step[]; done: boolean }> };
      const mapped: ChatTurn[] = (data.turns ?? []).map((t, i) => ({
        id: `${id}-${i}`,
        sessionId: id,
        userText: t.userText,
        steps: t.steps ?? [],
        done: true,
      }));
      setTurns(mapped);
      setSessionId(id);
    } catch {
      // 忽略加载失败
    }
  }, []);

  // 新会话：清空当前对话、回到未开始状态
  const newSession = useCallback(() => {
    setTurns([]);
    setSessionId(null);
  }, []);

  // 结束会话：立即清空回到新会话（不等摘要生成，避免"点了没反应"）；摘要在后台异步生成，
  // 完成后再刷新一次侧栏让其作为预览出现。
  const endSession = useCallback(() => {
    const sid = sessionId;
    setTurns([]);
    setSessionId(null);
    setSessionsVersion((v) => v + 1);
    if (sid) {
      const token = localStorage.getItem('cpm_admin_jwt');
      fetch(`/admin/agent/sessions/${sid}/end`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(() => setSessionsVersion((v) => v + 1))
        .catch(() => {});
    }
  }, [sessionId]);

  // 回撤：把上一步修改类操作的 _undo 描述回传到确定性回撤端点，结果作为新一轮渲染
  const undo = useCallback(
    (u: UndoDescriptor) =>
      runStream(
        '/admin/agent/undo',
        { action: u.action, params: u.params, label: u.label },
        `↩️ 回撤：${u.label ?? '上一步操作'}`,
      ),
    [runStream],
  );

  return {
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
  };
}
