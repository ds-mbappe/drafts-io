import { create } from 'zustand';

type NewDraftStore = {
  isOpen: boolean;
  open: () => void;
  close: () => void;
};

export const useNewDraftStore = create<NewDraftStore>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
}));
