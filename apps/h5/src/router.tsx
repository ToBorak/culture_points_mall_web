import { Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from './layout/AppShell';
import { ActivitiesPage } from './pages/activities/ActivitiesPage';
import { DNAReportPage } from './pages/dna/DNAReportPage';
import { LeaderboardPage } from './pages/leaderboard/LeaderboardPage';
import { BlindboxDrawPage } from './pages/mall/BlindboxDrawPage';
import { MallPage } from './pages/mall/MallPage';
import { MePage } from './pages/me/MePage';
import { SigninPage } from './pages/signin/SigninPage';

export function AppRouter() {
  return (
    <Routes>
      {/* 4 个核心 Tab 套响应式外壳（移动底部 Tab / 桌面侧边栏） */}
      <Route element={<AppShell />}>
        <Route path="/" element={<Navigate to="/leaderboard" replace />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
        <Route path="/activities" element={<ActivitiesPage />} />
        <Route path="/mall" element={<MallPage />} />
        <Route path="/mall/blindbox/:id" element={<BlindboxDrawPage />} />
        <Route path="/me" element={<MePage />} />
      </Route>
      {/* 全屏路由（不带外壳） */}
      <Route path="/dna" element={<DNAReportPage />} />
      <Route path="/signin" element={<SigninPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
