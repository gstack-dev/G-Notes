import { create } from "zustand";

export interface TrashedNote {
  id: string;
  title: string;
  tag: string;
  deletedAt: number;
}

interface TrashState {
  notes: TrashedNote[];
  loading: boolean;
  load: () => Promise<void>;
  restore: (id: string) => Promise<void>;
  permanentlyDelete: (id: string) => Promise<void>;
  emptyTrash: () => Promise<void>;
}

export const useTrashStore = create<TrashState>()((set, get) => ({
  notes: [],
  loading: false,

  load: async () => {
    set({ loading: true });
    const rows = await window.electronAPI.notes.trash();
    set({
      notes: rows.map((r) => ({ id: r.id, title: r.title, tag: r.tag, deletedAt: r.updatedAt })),
      loading: false,
    });
  },

  restore: async (id) => {
    await window.electronAPI.notes.restore(id);
    set({ notes: get().notes.filter((n) => n.id !== id) });
  },

  permanentlyDelete: async (id) => {
    await window.electronAPI.notes.permanentlyDelete(id);
    set({ notes: get().notes.filter((n) => n.id !== id) });
  },

  emptyTrash: async () => {
    await window.electronAPI.notes.emptyTrash();
    set({ notes: [] });
  },
}));
