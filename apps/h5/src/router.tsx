import { Navigate, Route, Routes } from 'react-router-dom';
import { HomePage } from './pages/home/HomePage';
import { LeaderboardPage } from './pages/leaderboard/LeaderboardPage';
import { PassportPage } from './pages/passport/PassportPage';
import { SigninPage } from './pages/signin/SigninPage';
import { MallPage } from './pages/mall/MallPage';
import { BlindboxDrawPage } from './pages/mall/BlindboxDrawPage';
import { DNAReportPage } from './pages/dna/DNAReportPage';

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/passport" element={<PassportPage />} />
      <Route path="/leaderboard" element={<LeaderboardPage />} />
      <Route path="/activities" element={<div>activities · 占位 · Phase 3 实现</div>} />
      <Route path="/signin" element={<SigninPage />} />
      <Route path="/mall" element={<MallPage />} />
      <Route path="/mall/blindbox/:id" element={<BlindboxDrawPage />} />
      <Route path="/dna" element={<DNAReportPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
