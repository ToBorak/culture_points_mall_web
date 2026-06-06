import axios from 'axios';
import { useEffect, useState } from 'react';
import { PageHeader, Button, EmptyState } from '@cpm/ui';

const token = () => localStorage.getItem('cpm_admin_jwt');
const headers = () => ({ Authorization: `Bearer ${token()}` });

interface UserItem { id: number; dingUserId: string; name: string }
interface RobotItem { id: string; name: string }
interface ScheduleItem { id: number; title: string; status: string; resultNote: string; createdAt: string }

export function SchedulePage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [robots, setRobots] = useState<RobotItem[]>([]);
  const [list, setList] = useState<ScheduleItem[]>([]);
  const [title, setTitle] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [location, setLocation] = useState('');
  const [detail, setDetail] = useState('');
  const [attendees, setAttendees] = useState<string[]>([]);
  const [groups, setGroups] = useState<string[]>([]);
  const [pushCalendar, setPushCalendar] = useState(true);
  const [pushGroup, setPushGroup] = useState(true);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const loadList = async () => {
    const { data } = await axios.get<{ items: ScheduleItem[] | null }>('/admin/schedules', { headers: headers() });
    setList(data.items ?? []);
  };
  useEffect(() => {
    (async () => {
      const [u, r] = await Promise.all([
        axios.get<{ items: UserItem[] | null }>('/admin/users', { headers: headers() }),
        axios.get<{ items: RobotItem[] | null }>('/admin/dingtalk/robots', { headers: headers() }),
      ]);
      setUsers(u.data.items ?? []);
      setRobots(r.data.items ?? []);
      await loadList();
    })().catch((e) => setMsg(String(e?.response?.data?.error ?? e)));
  }, []);

  const toggle = (arr: string[], v: string, set: (x: string[]) => void) =>
    set(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

  const submit = async () => {
    setBusy(true);
    setMsg(null);
    try {
      const body = {
        title,
        startAt: new Date(start).toISOString(),
        endAt: new Date(end).toISOString(),
        location,
        detail,
        attendeeUserIds: attendees,
        groupIds: groups,
        pushCalendar,
        pushGroup,
      };
      const { data } = await axios.post<{ status: string; resultNote: string }>('/admin/schedules', body, { headers: headers() });
      setMsg(`发布成功（${data.status}）：${data.resultNote}`);
      setTitle('');
      await loadList();
    } catch (e) {
      const err = e as { response?: { data?: { error?: string } } };
      setMsg(`失败：${err?.response?.data?.error ?? String(e)}`);
    } finally {
      setBusy(false);
    }
  };

  const inputStyle = { width: '100%', padding: '9px 12px', borderRadius: 10, border: '1.5px solid var(--cpm-card-border-strong)', background: 'var(--cpm-bg-0)', fontSize: 14, marginBottom: 12, boxSizing: 'border-box' as const };

  return (
    <div style={{ padding: 24 }}>
      <PageHeader title="日程发布" />
      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 420px', background: '#fff', borderRadius: 16, border: '1px solid var(--cpm-card-border)', padding: 20 }}>
          <input style={inputStyle} placeholder="标题" value={title} onChange={(e) => setTitle(e.target.value)} />
          <label style={{ fontSize: 12, color: 'var(--cpm-text-tertiary)' }}>开始</label>
          <input style={inputStyle} type="datetime-local" value={start} onChange={(e) => setStart(e.target.value)} />
          <label style={{ fontSize: 12, color: 'var(--cpm-text-tertiary)' }}>结束</label>
          <input style={inputStyle} type="datetime-local" value={end} onChange={(e) => setEnd(e.target.value)} />
          <input style={inputStyle} placeholder="地点" value={location} onChange={(e) => setLocation(e.target.value)} />
          <textarea style={{ ...inputStyle, minHeight: 60 }} placeholder="详情" value={detail} onChange={(e) => setDetail(e.target.value)} />

          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>参与员工</div>
            {users.map((u) => (
              <label key={u.id} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginRight: 12, fontSize: 13 }}>
                <input type="checkbox" checked={attendees.includes(u.dingUserId)} onChange={() => toggle(attendees, u.dingUserId, setAttendees)} />
                {u.name}
              </label>
            ))}
          </div>
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>推送群</div>
            {robots.map((r) => (
              <label key={r.id} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginRight: 12, fontSize: 13 }}>
                <input type="checkbox" checked={groups.includes(r.id)} onChange={() => toggle(groups, r.id, setGroups)} />
                {r.name}
              </label>
            ))}
          </div>
          <div style={{ marginBottom: 14, fontSize: 13 }}>
            <label style={{ marginRight: 16 }}>
              <input type="checkbox" checked={pushCalendar} onChange={(e) => setPushCalendar(e.target.checked)} /> 建钉钉日历
            </label>
            <label>
              <input type="checkbox" checked={pushGroup} onChange={(e) => setPushGroup(e.target.checked)} /> 推送到群
            </label>
          </div>
          <Button tone="primary" size="md" onClick={submit} disabled={busy}>{busy ? '发布中...' : '发布'}</Button>
          {msg && <div style={{ marginTop: 12, fontSize: 13, color: 'var(--cpm-text-secondary)', wordBreak: 'break-all' }}>{msg}</div>}
        </div>

        <div style={{ flex: '1 1 420px' }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 10 }}>已发布</div>
          {list.length === 0 ? (
            <EmptyState icon="📅" title="暂无日程" description="左侧填表单发布第一条" />
          ) : (
            list.map((s) => (
              <div key={s.id} style={{ background: '#fff', borderRadius: 12, border: '1px solid var(--cpm-card-border)', padding: 14, marginBottom: 10 }}>
                <div style={{ fontWeight: 600 }}>{s.title}</div>
                <div style={{ fontSize: 12, color: 'var(--cpm-text-tertiary)', marginTop: 4 }}>状态：{s.status} · {s.resultNote}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
