import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../store/auth';

export function AdminAuthGate({ children }: { children: ReactNode }) {
  const { token } = useAuth();
  const loc = useLocation();
  if (!token && loc.pathname !== '/login') {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}
