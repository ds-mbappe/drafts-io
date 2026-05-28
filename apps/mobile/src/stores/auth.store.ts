import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

export interface AuthUser {
  id: string;
  email: string;
  username: string;
  firstname: string | null;
  lastname: string | null;
  avatar: string | null;
  isVerified: boolean;
  language: string | null;
}

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isHydrated: boolean;

  setSession: (user: AuthUser, accessToken: string, refreshToken: string) => Promise<void>;
  clearSession: () => Promise<void>;
  hydrate: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isHydrated: false,

  setSession: async (user, accessToken, refreshToken) => {
    await SecureStore.setItemAsync('access_token', accessToken);
    await SecureStore.setItemAsync('refresh_token', refreshToken);
    await SecureStore.setItemAsync('auth_user', JSON.stringify(user));
    set({ user, accessToken, refreshToken });
  },

  clearSession: async () => {
    await SecureStore.deleteItemAsync('access_token');
    await SecureStore.deleteItemAsync('refresh_token');
    await SecureStore.deleteItemAsync('auth_user');
    set({ user: null, accessToken: null, refreshToken: null });
  },

  hydrate: async () => {
    try {
      const [accessToken, refreshToken, userJson] = await Promise.all([
        SecureStore.getItemAsync('access_token'),
        SecureStore.getItemAsync('refresh_token'),
        SecureStore.getItemAsync('auth_user'),
      ]);

      const user: AuthUser | null = userJson ? JSON.parse(userJson) : null;
      set({ user, accessToken, refreshToken });
    } catch {
      set({ user: null, accessToken: null, refreshToken: null });
    } finally {
      set({ isHydrated: true });
    }
  },
}));
