import { AuthGate } from './auth/AuthGate';
import { AppRouter } from './router';

export function App() {
  return (
    <AuthGate>
      <AppRouter />
    </AuthGate>
  );
}
