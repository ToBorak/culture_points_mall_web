import type { ReactNode } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AdminLoginPage } from './auth/AdminLoginPage';
import { AdminLayout } from './layout/AdminLayout';
import { ActivitiesPage } from './pages/activities/ActivitiesPage';
import { ActivityCodePage } from './pages/activities/ActivityCodePage';
import { ChatPage } from './pages/chat/ChatPage';
import { MockOutboxPage } from './pages/dingtalk/MockOutboxPage';
import { AdminHomePage } from './pages/home/AdminHomePage';
import { InsightsPage } from './pages/insights/InsightsPage';
import { LayoutEditorPage } from './pages/layout/LayoutEditorPage';
import { MallAdminPage } from './pages/mall/MallAdminPage';
import { SchedulePage } from './pages/schedules/SchedulePage';
import { ValuesPage } from './pages/values/ValuesPage';

const wrap = (el: ReactNode) => <AdminLayout>{el}</AdminLayout>;

export function AdminRouter() {
  return (
    <Routes>
      <Route path="/login" element={<AdminLoginPage />} />
      <Route path="/" element={wrap(<AdminHomePage />)} />
      <Route path="/chat" element={wrap(<ChatPage />)} />
      <Route path="/values" element={wrap(<ValuesPage />)} />
      <Route path="/activities" element={wrap(<ActivitiesPage />)} />
      <Route path="/activities/:id/code" element={wrap(<ActivityCodePage />)} />
      <Route path="/mall" element={wrap(<MallAdminPage />)} />
      <Route path="/layout" element={wrap(<LayoutEditorPage />)} />
      <Route path="/insights" element={wrap(<InsightsPage />)} />
      <Route path="/dingtalk/mock-outbox" element={wrap(<MockOutboxPage />)} />
      <Route path="/schedules" element={wrap(<SchedulePage />)} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
