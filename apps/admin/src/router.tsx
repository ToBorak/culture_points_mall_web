import { Navigate, Route, Routes } from 'react-router-dom';
import { AdminHomePage } from './pages/home/AdminHomePage';
import { AdminLoginPage } from './auth/AdminLoginPage';

export function AdminRouter() {
  return (
    <Routes>
      <Route path="/login" element={<AdminLoginPage />} />
      <Route path="/" element={<AdminHomePage />} />
      <Route path="/chat" element={<div>chat · Phase 3 实现</div>} />
      <Route path="/values" element={<div>values · 下个 Phase 实现</div>} />
      <Route path="/activities" element={<div>activities · Phase 3 实现</div>} />
      <Route path="/insights" element={<div>insights · 占位</div>} />
      <Route path="/mall" element={<div>mall · Phase 4 实现</div>} />
      <Route path="/dingtalk/mock-outbox" element={<div>钉钉模拟推送面板 · Phase 3 实现</div>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
