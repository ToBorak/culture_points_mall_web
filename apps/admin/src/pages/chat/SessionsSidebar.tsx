import axios from 'axios';
import { useEffect, useState } from 'react';

interface Sess {
  id: number;
  title: string;
  createdAt: string;
}

export function SessionsSidebar({ onPick }: { onPick: (id: number) => void }) {
  const [rows, setRows] = useState<Sess[]>([]);
  useEffect(() => {
    const token = localStorage.getItem('cpm_admin_jwt');
    axios
      .get<{ items: Sess[] }>('/admin/agent/sessions', { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => setRows(r.data.items))
      .catch(() => {});
  }, []);
  return (
    <aside className="w-56 border-r-3 border-ink p-2 overflow-auto">
      <h3 className="font-qingke text-lg mb-2">历史会话</h3>
      <ul className="space-y-1">
        {rows.map((s) => (
          <li key={s.id}>
            <button
              type="button"
              onClick={() => onPick(s.id)}
              className="block w-full text-left p-2 border-2 border-ink rounded"
            >
              <div className="text-xs">{s.createdAt.slice(0, 10)}</div>
              <div className="font-kuaile">{s.title || '未命名'}</div>
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}
