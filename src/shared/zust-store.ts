import { create } from "zustand";

export interface Note {
  id: string;
  title: string;
  content: string;
  tag: string;
  createdAt: number;
  updatedAt: number;
  favorited?: boolean;
  pinned?: boolean;
}

interface NotesState {
  notes: Note[];
  activeNoteId: string | null;
  initialized: boolean;
  showOnboarding: boolean;
  setInitialized: (notes: Note[], activeNoteId: string | null) => void;
  setOnboardingNeeded: (needed: boolean) => void;
  dismissOnboarding: () => void;
  setActiveNote: (id: string | null) => void;
  addNote: (note: Omit<Note, "id" | "createdAt" | "updatedAt">) => string;
  updateNote: (id: string, data: Partial<Pick<Note, "title" | "content" | "tag">>) => void;
  deleteNote: (id: string) => void;
  deleteNotesByTag: (tag: string) => void;
  toggleFavorite: (id: string) => void;
  togglePin: (id: string) => void;
}

export const useNotesStore = create<NotesState>()((set) => ({
  notes: [],
  activeNoteId: null,
  initialized: false,
  showOnboarding: false,

  setInitialized: (notes, activeNoteId) => set({ notes, activeNoteId, initialized: true }),

  setOnboardingNeeded: (needed) => set({ showOnboarding: needed }),

  dismissOnboarding: () => {
    set({ showOnboarding: false });
    window.electronAPI.prefs.set("onboarding_done", "1");
  },

  setActiveNote: (id) => {
    set({ activeNoteId: id });
  },

  addNote: (note) => {
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
    const now = Date.now();
    const fullNote: Note = { ...note, id, createdAt: now, updatedAt: now };
    set((state) => ({ notes: [fullNote, ...state.notes] }));
    window.electronAPI.notes.create({
      id,
      title: note.title,
      content: note.content,
      tag: note.tag,
      createdAt: now,
    });
    return id;
  },

  updateNote: (id, data) => {
    set((state) => ({
      notes: state.notes.map((n) =>
        n.id === id ? { ...n, ...data, updatedAt: Date.now() } : n
      ),
    }));
    window.electronAPI.notes.update(id, data);
  },

  deleteNote: (id) => {
    set((state) => ({
      notes: state.notes.filter((n) => n.id !== id),
      activeNoteId: state.activeNoteId === id ? null : state.activeNoteId,
    }));
    window.electronAPI.notes.delete(id);
  },

  deleteNotesByTag: (tag) => {
    set((state) => ({
      notes: state.notes.filter((n) => n.tag !== tag),
      activeNoteId: state.notes.find((n) => n.id === state.activeNoteId && n.tag === tag)
        ? null
        : state.activeNoteId,
    }));
    window.electronAPI.notes.deleteByTag(tag);
  },

  toggleFavorite: (id) => {
    set((state) => ({
      notes: state.notes.map((n) =>
        n.id === id ? { ...n, favorited: !n.favorited, updatedAt: Date.now() } : n
      ),
    }));
    window.electronAPI.notes.toggleFavorite(id);
  },

  togglePin: (id) => {
    set((state) => ({
      notes: state.notes.map((n) =>
        n.id === id ? { ...n, pinned: !n.pinned, updatedAt: Date.now() } : n
      ),
    }));
    window.electronAPI.notes.togglePin(id);
  },
}));

export function getTextExcerpt(content: string, maxLen = 120): string {
  try {
    const parsed = JSON.parse(content);
    if (parsed && parsed.blocks && Array.isArray(parsed.blocks)) {
      const texts = parsed.blocks
        .map((b: { data?: { text?: string; items?: { content?: string }[] } }) => {
          if (b.data?.text) return b.data.text.replace(/<[^>]*>/g, "");
          if (b.data?.items) return b.data.items.map((i) => (i.content || "").replace(/<[^>]*>/g, "")).join(" ");
          return "";
        })
        .filter(Boolean);
      const plain = texts.join(" ");
      return plain.length > maxLen ? plain.slice(0, maxLen) + "..." : plain;
    }
  } catch {
    // not JSON, use as-is
  }
  return content.length > maxLen ? content.slice(0, maxLen) + "..." : content;
}

export function formatRelativeTime(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  return new Date(ts).toLocaleDateString();
}
