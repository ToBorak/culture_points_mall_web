import axios from 'axios';
import { useEffect, useMemo, useState } from 'react';

// UserDeptTree：部门 + 员工 的树状多选器（value = 选中的 ding_user_id 列表）。
// 部门可折叠、部门级全选（含半选态）、未绑钉钉的成员置灰不可选、顶部全选/清空与已选计数。

interface U {
  id: number;
  dingUserId: string;
  name: string;
  deptName?: string;
}
interface Group {
  dept: string;
  members: U[];
  bindable: string[]; // 该部门可邀约（已绑钉钉）的 ding id
}

export function UserDeptTree({ value, onChange }: { value: string[]; onChange: (ids: string[]) => void }) {
  const [users, setUsers] = useState<U[]>([]);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const sel = useMemo(() => new Set(value), [value]);

  useEffect(() => {
    axios
      .get<{ items: U[] | null }>('/admin/users', {
        headers: { Authorization: `Bearer ${localStorage.getItem('cpm_admin_jwt')}` },
      })
      .then((r) => setUsers(r.data.items ?? []))
      .catch(() => setUsers([]));
  }, []);

  const groups = useMemo<Group[]>(() => {
    const map = new Map<string, U[]>();
    for (const u of users) {
      const d = u.deptName?.trim() || '未分组';
      if (!map.has(d)) map.set(d, []);
      map.get(d)?.push(u);
    }
    return [...map.entries()].map(([dept, members]) => ({
      dept,
      members,
      bindable: members.filter((m) => m.dingUserId).map((m) => m.dingUserId),
    }));
  }, [users]);

  const allBindable = useMemo(() => groups.flatMap((g) => g.bindable), [groups]);

  const toggleUser = (ding: string) => {
    if (!ding) return;
    onChange(sel.has(ding) ? value.filter((x) => x !== ding) : [...value, ding]);
  };
  const toggleDept = (g: Group) => {
    const allOn = g.bindable.length > 0 && g.bindable.every((d) => sel.has(d));
    if (allOn) onChange(value.filter((x) => !g.bindable.includes(x)));
    else onChange([...new Set([...value, ...g.bindable])]);
  };
  const toggleExpand = (dept: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(dept)) next.delete(dept);
      else next.add(dept);
      return next;
    });

  return (
    <div
      style={{
        border: '1px solid var(--cpm-card-border)',
        borderRadius: 12,
        overflow: 'hidden',
        fontFamily: 'var(--cpm-font-sans)',
      }}
    >
      {/* 工具条 */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '8px 12px',
          background: 'rgba(124,58,237,0.04)',
          borderBottom: '1px solid var(--cpm-card-border)',
        }}
      >
        <span style={{ fontSize: 12.5, color: 'var(--cpm-text-secondary)' }}>
          已选 <b style={{ color: 'var(--cpm-brand-violet)' }}>{value.length}</b> 人
        </span>
        <div style={{ flex: 1 }} />
        <button type="button" onClick={() => onChange([...new Set(allBindable)])} style={linkBtn}>
          全选
        </button>
        <span style={{ color: 'var(--cpm-card-border-strong)' }}>·</span>
        <button type="button" onClick={() => onChange([])} style={linkBtn}>
          清空
        </button>
      </div>

      <div style={{ maxHeight: 300, overflowY: 'auto' }}>
        {groups.length === 0 && (
          <div style={{ padding: 16, textAlign: 'center', fontSize: 12.5, color: 'var(--cpm-text-muted)' }}>
            暂无成员
          </div>
        )}
        {groups.map((g) => {
          const selN = g.bindable.filter((d) => sel.has(d)).length;
          const allOn = g.bindable.length > 0 && selN === g.bindable.length;
          const some = selN > 0 && !allOn;
          const open = expanded.has(g.dept);
          return (
            <div key={g.dept} style={{ borderBottom: '1px solid var(--cpm-card-border)' }}>
              {/* 部门头：复选框（部门全选/半选）+ 可点击展开的按钮 */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '9px 12px',
                  background: open ? 'rgba(124,58,237,0.03)' : '#fff',
                }}
              >
                <input
                  type="checkbox"
                  aria-label={`全选 ${g.dept}`}
                  checked={allOn}
                  ref={(el) => {
                    if (el) el.indeterminate = some;
                  }}
                  onChange={() => toggleDept(g)}
                />
                <button
                  type="button"
                  onClick={() => toggleExpand(g.dept)}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontFamily: 'var(--cpm-font-sans)',
                  }}
                >
                  <span
                    style={{
                      fontSize: 11,
                      color: 'var(--cpm-text-tertiary)',
                      transition: 'transform 0.18s',
                      transform: open ? 'rotate(90deg)' : 'none',
                      width: 12,
                    }}
                  >
                    ▶
                  </span>
                  <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--cpm-text-primary)' }}>📁 {g.dept}</span>
                  <div style={{ flex: 1 }} />
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: selN > 0 ? 'var(--cpm-brand-violet)' : 'var(--cpm-text-muted)',
                      background: selN > 0 ? 'rgba(124,58,237,0.1)' : 'rgba(15,23,42,0.05)',
                      borderRadius: 999,
                      padding: '1px 8px',
                    }}
                  >
                    {selN}/{g.members.length}
                  </span>
                </button>
              </div>

              {/* 成员（展开时）*/}
              {open && (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                    gap: '2px 12px',
                    padding: '4px 12px 10px 30px',
                  }}
                >
                  {g.members.map((m) => {
                    const bound = !!m.dingUserId;
                    return (
                      <label
                        key={m.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          fontSize: 12.5,
                          padding: '3px 0',
                          cursor: bound ? 'pointer' : 'not-allowed',
                          color: bound ? 'var(--cpm-text-secondary)' : 'var(--cpm-text-muted)',
                        }}
                      >
                        <input
                          type="checkbox"
                          disabled={!bound}
                          checked={bound && sel.has(m.dingUserId)}
                          onChange={() => toggleUser(m.dingUserId)}
                        />
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {m.name}
                          {!bound && <span style={{ fontSize: 11 }}>（未绑钉钉）</span>}
                        </span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const linkBtn: React.CSSProperties = {
  background: 'none',
  border: 'none',
  color: 'var(--cpm-brand-violet)',
  fontSize: 12,
  fontWeight: 600,
  cursor: 'pointer',
  padding: 0,
  fontFamily: 'var(--cpm-font-sans)',
};
