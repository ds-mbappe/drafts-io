import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

interface LanguageState {
  language: string | null;
  setLanguage: (code: string) => void;
  hydrate: () => Promise<void>;
}

const STORAGE_KEY = 'app_language';

export const useLanguageStore = create<LanguageState>((set) => ({
  language: null,

  setLanguage: (code) => {
    set({ language: code });
    SecureStore.setItemAsync(STORAGE_KEY, code).catch(() => {});
  },

  hydrate: async () => {
    const stored = await SecureStore.getItemAsync(STORAGE_KEY);
    if (stored) set({ language: stored });
  },
}));
