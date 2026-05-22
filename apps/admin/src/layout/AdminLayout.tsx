import type { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { useAuth } from '../store/auth';

export function AdminLayout({ children }: { children: ReactNode }) {
  const { name, clear } = useAuth();
  return (
    <div className="flex min-h-screen bg-paper">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <header className="border-b-3 border-ink p-3 flex justify-between font-kuaile">
          <span>欢迎，{name}</span>
          <button onClick={clear} className="underline" type="button">退出</button>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
