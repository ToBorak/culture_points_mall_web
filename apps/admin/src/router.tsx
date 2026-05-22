import type { ReactNode } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AdminLoginPage } from './auth/AdminLoginPage';
import { AdminLayout } from './layout/AdminLayout';
import { AdminHomePage } from './pages/home/AdminHomePage';
import { ValuesPage } from './pages/values/ValuesPage';
import { ChatPage } from './pages/chat/ChatPage';
import { MockOutboxPage } from './pages/dingtalk/MockOutboxPage';

const wrap = (el: ReactNode) => <AdminLayout>{el}</AdminLayout>;

export function AdminRouter() {
  return (
    <Routes>
      <Route path="/login" element={<AdminLoginPage />} />
      <Route path="/" element={wrap(<AdminHomePage />)} />
      <Route path="/chat" element={wrap(<ChatPage />)} />
      <Route path="/values" element={wrap(<ValuesPage />)} />
      <Route path="/activities" element={wrap(<div>activities · Phase 3 实现</div>)} />
      <Route path="/mall" element={wrap(<div>mall · Phase 4 实现</div>)} />
      <Route path="/insights" element={wrap(<div>insights · 占位</div>)} />
      <Route path="/dingtalk/mock-outbox" element={wrap(<MockOutboxPage />)} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
