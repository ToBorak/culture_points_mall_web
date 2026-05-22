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
  token: localStorage.getItem('cpm_admin_jwt'),
  userId: Number(localStorage.getItem('cpm_admin_uid') ?? '') || null,
  tenantId: Number(localStorage.getItem('cpm_admin_tid') ?? '') || null,
  name: localStorage.getItem('cpm_admin_name'),
  setSession(t, uid, tid, name) {
    localStorage.setItem('cpm_admin_jwt', t);
    localStorage.setItem('cpm_admin_uid', String(uid));
    localStorage.setItem('cpm_admin_tid', String(tid));
    localStorage.setItem('cpm_admin_name', name);
    set({ token: t, userId: uid, tenantId: tid, name });
  },
  clear() {
    for (const k of ['cpm_admin_jwt', 'cpm_admin_uid', 'cpm_admin_tid', 'cpm_admin_name']) {
      localStorage.removeItem(k);
    }
    set({ token: null, userId: null, tenantId: null, name: null });
  },
}));
