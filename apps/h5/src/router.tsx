import { Navigate, Route, Routes } from 'react-router-dom';
import { HomePage } from './pages/home/HomePage';
import { PassportPage } from './pages/passport/PassportPage';

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/passport" element={<PassportPage />} />
      <Route path="/leaderboard" element={<div>leaderboard · 占位 · Phase 2 实现</div>} />
      <Route path="/activities" element={<div>activities · 占位 · Phase 3 实现</div>} />
      <Route path="/signin" element={<div>signin · 占位 · Phase 4 实现</div>} />
      <Route path="/mall" element={<div>mall · 占位 · Phase 4 实现</div>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
