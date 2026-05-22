import { create } from 'zustand';

interface AuthState {
  token: string | null;
  userId: number | null;
  tenantId: number | null;
  name: string | null;
  setSession: (t: string, uid: number, tid: number, name: string) => void;
  clear: () => void;
}

export const useAuth = create<AuthState>((set) => ({
  token: localStorage.getItem('cpm_jwt'),
  userId: Number(localStorage.getItem('cpm_uid') ?? '') || null,
  tenantId: Number(localStorage.getItem('cpm_tid') ?? '') || null,
  name: localStorage.getItem('cpm_name'),
  setSession(t, uid, tid, name) {
    localStorage.setItem('cpm_jwt', t);
    localStorage.setItem('cpm_uid', String(uid));
    localStorage.setItem('cpm_tid', String(tid));
    localStorage.setItem('cpm_name', name);
    set({ token: t, userId: uid, tenantId: tid, name });
  },
  clear() {
    localStorage.removeItem('cpm_jwt');
    localStorage.removeItem('cpm_uid');
    localStorage.removeItem('cpm_tid');
    localStorage.removeItem('cpm_name');
    set({ token: null, userId: null, tenantId: null, name: null });
  },
}));
