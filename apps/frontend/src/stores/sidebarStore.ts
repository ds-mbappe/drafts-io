import { create } from 'zustand';

export type SidebarMode = 'hidden' | 'floating' | 'docked';

// Module-level timer so both the burger and the sidebar share the same reference.
let closeTimer: ReturnType<typeof setTimeout> | null = null;

type SidebarStore = {
  mode: SidebarMode;
  setMode: (mode: SidebarMode) => void;
  toggle: () => void;
  scheduleClose: () => void;
  cancelClose: () => void;
};

export const useSidebarStore = create<SidebarStore>((set, get) => ({
  mode: 'hidden',

  setMode: (mode) => set({ mode }),

  // Click always means dock/undock.
  toggle: () =>
    set((s) => ({
      mode: s.mode === 'docked' ? 'hidden' : 'docked',
    })),

  // Start a short timer to close the floating panel.
  // Cancelled if the cursor re-enters the sidebar or the burger.
  scheduleClose: () => {
    if (get().mode !== 'floating') return;
    closeTimer = setTimeout(() => set({ mode: 'hidden' }), 200);
  },

  cancelClose: () => {
    if (closeTimer) {
      clearTimeout(closeTimer);
      closeTimer = null;
    }
  },
}));
