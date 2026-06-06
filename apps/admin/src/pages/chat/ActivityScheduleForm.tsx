import { Button } from '@cpm/ui';
import axios from 'axios';
import { motion } from 'framer-motion';
import { type CSSProperties, useEffect, useMemo, useState } from 'react';

interface Dimension {
  id: number;
  code: string;
  name: string;
}
interface Room {
  roomId: string;
  roomName: string;
  capacity: number;
  location: string;
}
interface UserItem {
  id: number;
  dingUserId: string;
  name: string;
}
interface Robot {
  id: string;
  name: string;
}

export interface PublishPayload {
  title: string;
  dimensionCode: string;
  startAt: string;
  endAt: string;
  pointsReward: number;
  location: string;
  roomIds: string[];
  attendeeAll: boolean;
  attendeeUserIds: string[];
  pushGroup: boolean;
  groupIds: string[];
}

interface Props {
  prefill?: Record<string, unknown>;
  onSubmit: (payload: PublishPayload) => void;
  onCancel: () => void;
}

function toLocalInput(iso?: unknown): string {
  if (typeof iso !== 'string' || !iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const labelStyle: CSSProperties = {
  fontSize: 12,
  fontWeight: 600,
  color: 'var(--cpm-text-secondary)',
  marginBottom: 5,
  display: 'block',
};
const inputStyle: CSSProperties = {
  width: '100%',
  padding: '8px 10px',
  borderRadius: 9,
  border: '1.5px solid var(--cpm-card-border-strong)',
  background: 'var(--cpm-bg-0)',
  fontSize: 13,
  color: 'var(--cpm-text-primary)',
  outline: 'none',
  boxSizing: 'border-box',
  fontFamily: 'var(--cpm-font-sans)',
};

export function ActivityScheduleForm({ prefill, onSubmit, onCancel }: Props) {
  const [dims, setDims] = useState<Dimension[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [users, setUsers] = useState<UserItem[]>([]);
  const [robots, setRobots] = useState<Robot[]>([]);
  const [roomsErr, setRoomsErr] = useState<string>('');

  const [title, setTitle] = useState(String(prefill?.title ?? ''));
  const [dimensionCode, setDimensionCode] = useState(String(prefill?.dimension_code ?? ''));
  const [startAt, setStartAt] = useState(toLocalInput(prefill?.start_at));
  const [endAt, setEndAt] = useState(toLocalInput(prefill?.end_at));
  const [pointsReward, setPointsReward] = useState(Number(prefill?.points_reward ?? 0));
  const [roomId, setRoomId] = useState('');
  const [attendeeAll, setAttendeeAll] = useState(true);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [pushGroup, setPushGroup] = useState(false);
  const [groupIds, setGroupIds] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const headers = { Authorization: `Bearer ${localStorage.getItem('cpm_admin_jwt')}` };
    axios
      .get<{ items: Dimension[] }>('/admin/values/dimensions', { headers })
      .then((r) => {
        setDims(r.data.items ?? []);
        // 默认选中第一个维度（用函数式更新，避免在依赖里引用 dimensionCode）
        setDimensionCode((cur) => cur || r.data.items?.[0]?.code || '');
      })
      .catch(() => {});
    axios
      .get<{ items: Room[] }>('/admin/dingtalk/meeting-rooms', { headers })
      .then((r) => setRooms(r.data.items ?? []))
      .catch((e) => setRoomsErr(e?.response?.data?.error ?? '会议室加载失败'));
    axios
      .get<{ items: UserItem[] }>('/admin/users', { headers })
      .then((r) => setUsers(r.data.items ?? []))
      .catch(() => {});
    axios
      .get<{ items: Robot[] }>('/admin/dingtalk/robots', { headers })
      .then((r) => setRobots(r.data.items ?? []))
      .catch(() => {});
  }, []);

  const canSubmit = useMemo(
    () => Boolean(title.trim() && dimensionCode && startAt && endAt) && !submitting,
    [title, dimensionCode, startAt, endAt, submitting],
  );

  const submit = () => {
    if (!canSubmit) return;
    setSubmitting(true);
    const room = rooms.find((r) => r.roomId === roomId);
    onSubmit({
      title: title.trim(),
      dimensionCode,
      startAt: new Date(startAt).toISOString(),
      endAt: new Date(endAt).toISOString(),
      pointsReward: Number(pointsReward) || 0,
      location: room?.roomName ?? '',
      roomIds: roomId ? [roomId] : [],
      attendeeAll,
      attendeeUserIds: attendeeAll ? [] : selectedUserIds,
      pushGroup,
      groupIds: pushGroup ? groupIds : [],
    });
  };

  const toggle = (list: string[], v: string) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 280, damping: 24 }}
      style={{
        alignSelf: 'flex-start',
        width: '100%',
        maxWidth: 460,
        borderRadius: 16,
        borderTopLeftRadius: 4,
        border: '1.5px solid rgba(109,40,217,0.25)',
        background: '#fff',
        boxShadow: 'var(--cpm-shadow-soft)',
        overflow: 'hidden',
        fontFamily: 'var(--cpm-font-sans)',
      }}
    >
      <div
        style={{
          padding: '11px 16px',
          background: 'rgba(124,58,237,0.05)',
          borderBottom: '1px solid var(--cpm-card-border)',
          fontSize: 13,
          fontWeight: 700,
          color: 'var(--cpm-brand-violet)',
        }}
      >
        📅 发布活动 · 日程
      </div>

      <div
        style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 13, maxHeight: '46vh', overflowY: 'auto' }}
      >
        <div>
          <div style={labelStyle}>活动标题</div>
          <input
            style={inputStyle}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="如：团队协作分享会"
          />
        </div>

        <div>
          <div style={labelStyle}>价值观维度</div>
          <select style={inputStyle} value={dimensionCode} onChange={(e) => setDimensionCode(e.target.value)}>
            <option value="">请选择维度</option>
            {dims.map((d) => (
              <option key={d.code} value={d.code}>
                {d.name}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <div style={{ flex: 1 }}>
            <div style={labelStyle}>开始时间</div>
            <input
              type="datetime-local"
              style={inputStyle}
              value={startAt}
              onChange={(e) => setStartAt(e.target.value)}
            />
          </div>
          <div style={{ flex: 1 }}>
            <div style={labelStyle}>结束时间</div>
            <input type="datetime-local" style={inputStyle} value={endAt} onChange={(e) => setEndAt(e.target.value)} />
          </div>
        </div>

        <div>
          <div style={labelStyle}>会议室（可选）</div>
          <select
            style={inputStyle}
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            disabled={rooms.length === 0}
          >
            <option value="">不预定会议室</option>
            {rooms.map((r) => (
              <option key={r.roomId} value={r.roomId}>
                {r.roomName}
                {r.capacity ? `（${r.capacity}人）` : ''}
                {r.location ? ` · ${r.location}` : ''}
              </option>
            ))}
          </select>
          {rooms.length === 0 && (
            <div style={{ fontSize: 11, color: 'var(--cpm-text-muted)', marginTop: 4 }}>
              {roomsErr || '暂无可选会议室：在钉钉后台把会议室「可预订范围」配给当前账号后即可选择。'}
            </div>
          )}
        </div>

        <div>
          <div style={labelStyle}>参与人员</div>
          <div style={{ display: 'flex', gap: 14, marginBottom: selectedUserIds && !attendeeAll ? 8 : 0 }}>
            <label style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer' }}>
              <input type="radio" checked={attendeeAll} onChange={() => setAttendeeAll(true)} /> 全员（默认）
            </label>
            <label style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer' }}>
              <input type="radio" checked={!attendeeAll} onChange={() => setAttendeeAll(false)} /> 指定人员
            </label>
          </div>
          {!attendeeAll && (
            <div
              style={{
                maxHeight: 132,
                overflowY: 'auto',
                border: '1px solid var(--cpm-card-border)',
                borderRadius: 9,
                padding: 8,
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
              }}
            >
              {users.length === 0 && <span style={{ fontSize: 12, color: 'var(--cpm-text-muted)' }}>暂无成员</span>}
              {users.map((u) => (
                <label
                  key={u.id}
                  style={{ fontSize: 12.5, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}
                >
                  <input
                    type="checkbox"
                    checked={selectedUserIds.includes(u.dingUserId)}
                    disabled={!u.dingUserId}
                    onChange={() => setSelectedUserIds((p) => toggle(p, u.dingUserId))}
                  />
                  {u.name}
                  {!u.dingUserId && <span style={{ color: 'var(--cpm-text-muted)' }}>（未绑定钉钉）</span>}
                </label>
              ))}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <div style={{ width: 120 }}>
            <div style={labelStyle}>奖励积分</div>
            <input
              type="number"
              style={inputStyle}
              value={pointsReward}
              onChange={(e) => setPointsReward(Number(e.target.value))}
            />
          </div>
          <div style={{ flex: 1 }}>
            <div style={labelStyle}>钉钉群推送（可选）</div>
            <label
              style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', height: 36 }}
            >
              <input
                type="checkbox"
                checked={pushGroup}
                onChange={(e) => {
                  setPushGroup(e.target.checked);
                  if (e.target.checked && groupIds.length === 0) setGroupIds(robots.map((r) => r.id));
                }}
              />
              {pushGroup ? `推送到 ${groupIds.length} 个群` : '同时推送到钉钉群'}
            </label>
          </div>
        </div>
      </div>

      {/* 常驻页脚：按钮永远可见，不会被字段挤出可视区 */}
      <div
        style={{
          display: 'flex',
          gap: 10,
          alignItems: 'center',
          justifyContent: 'flex-end',
          padding: '10px 16px',
          borderTop: '1px solid var(--cpm-card-border)',
          background: 'rgba(124,58,237,0.03)',
        }}
      >
        {!canSubmit && !submitting && (
          <span style={{ flex: 1, fontSize: 11, color: 'var(--cpm-text-muted)' }}>
            填好标题、维度、起止时间后即可发布
          </span>
        )}
        <Button tone="ghost" size="sm" onClick={onCancel} disabled={submitting}>
          取消
        </Button>
        <Button tone="primary" size="sm" onClick={submit} disabled={!canSubmit}>
          {submitting ? '发布中…' : '发布活动'}
        </Button>
      </div>
    </motion.div>
  );
}
