import { ComicButton, Panel } from '@cpm/ui';
import axios from 'axios';
import { useState } from 'react';
import { useAuth } from '../store/auth';

export function AdminLoginPage() {
  const [userId, setUserId] = useState('1');
  const [err, setErr] = useState<string | null>(null);
  const { setSession } = useAuth();

  const submit = async () => {
    try {
      const { data } = await axios.post<{ token: string; userId: number; tenantId: number; name: string }>(
        '/auth/dev/login',
        { userId: Number(userId) },
      );
      setSession(data.token, data.userId, data.tenantId, data.name);
      window.location.href = '/';
    } catch (e) {
      const err = e as { response?: { data?: { error?: string } } };
      setErr(err?.response?.data?.error ?? String(e));
    }
  };

  return (
    <main className="min-h-screen bg-paper p-10 font-kuaile">
      <Panel shadow="yellow" style={{ maxWidth: 420, margin: '40px auto' }}>
        <h1 className="text-3xl font-qingke mb-4">HR 管理后台 · 开发登录</h1>
        <label className="block mb-3">
          User ID
          <input
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            className="block w-full mt-1 p-2 border-3 border-ink rounded-md"
          />
        </label>
        {err && <div className="text-cRed mb-2">{err}</div>}
        <ComicButton onClick={submit}>登录</ComicButton>
      </Panel>
    </main>
  );
}
