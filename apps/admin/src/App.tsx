import { AdminAuthGate } from './auth/AdminAuthGate';
import { AdminRouter } from './router';

export function App() {
  return (
    <AdminAuthGate>
      <AdminRouter />
    </AdminAuthGate>
  );
}
