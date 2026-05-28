import { create } from 'zustand';
import { api } from '@/src/lib/api';

interface NotificationState {
  unreadCount: number;
  fetch: () => Promise<void>;
  decrement: (by?: number) => void;
  reset: () => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  unreadCount: 0,

  fetch: async () => {
    try {
      const { data } = await api.get('/notifications/unread-count');
      set({ unreadCount: data.count ?? 0 });
    } catch {
      // silently ignore
    }
  },

  decrement: (by = 1) => {
    set({ unreadCount: Math.max(0, get().unreadCount - by) });
  },

  reset: () => set({ unreadCount: 0 }),
}));
