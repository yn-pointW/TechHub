import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types';
import { authApi, getToken } from '@/lib/api';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, phone: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (data: Partial<User>) => Promise<void>;
  restoreSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isAdmin: false,

      login: async (email, password) => {
        try {
          const { user } = await authApi.login(email, password);
          set({ user, isAuthenticated: true, isAdmin: user.role === 'admin' });
          return true;
        } catch {
          return false;
        }
      },

      register: async (name, email, phone, password) => {
        try {
          const { user } = await authApi.register(name, email, phone, password);
          set({ user, isAuthenticated: true, isAdmin: false });
          return true;
        } catch {
          return false;
        }
      },

      logout: () => {
        authApi.logout();
        set({ user: null, isAuthenticated: false, isAdmin: false });
      },

      updateUser: async (data) => {
        // Apply all fields locally immediately (covers addresses and other local-only fields)
        set(s => ({ user: s.user ? { ...s.user, ...data } : null }));
        // Sync name/phone to server only when those fields are being updated
        if (data.name !== undefined || data.phone !== undefined) {
          try {
            const current = get().user;
            const serverUpdated = await authApi.updateMe({
              name: data.name ?? current?.name ?? '',
              phone: data.phone ?? current?.phone ?? '',
            });
            // Merge server response but preserve local-only fields (e.g. addresses)
            set(s => ({ user: s.user ? { ...s.user, ...serverUpdated } : null }));
          } catch (e) {
            console.error('Failed to update user', e);
          }
        }
      },

      restoreSession: async () => {
        if (!getToken()) return;
        try {
          const user = await authApi.me();
          set({ user, isAuthenticated: true, isAdmin: user.role === 'admin' });
        } catch {
          authApi.logout();
          set({ user: null, isAuthenticated: false, isAdmin: false });
        }
      },
    }),
    { name: 'auth-storage', partialize: (s) => ({ user: s.user, isAuthenticated: s.isAuthenticated, isAdmin: s.isAdmin }) }
  )
);