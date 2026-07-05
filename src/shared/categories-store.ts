import { create } from "zustand";

export interface CategoryDef {
  name: string;
  createdAt: number;
}

interface CategoriesState {
  categories: CategoryDef[];
  initialized: boolean;
  setInitialized: (categories: CategoryDef[]) => void;
  addCategory: (name: string) => void;
  removeCategory: (name: string) => void;
}

export const useCategoriesStore = create<CategoriesState>()((set) => ({
  categories: [],
  initialized: false,

  setInitialized: (categories) => set({ categories, initialized: true }),

  addCategory: (name) =>
    set((state) => {
      if (state.categories.some((c) => c.name === name)) return state;
      const now = Date.now();
      window.electronAPI.categories.create(name, now);
      return { categories: [...state.categories, { name, createdAt: now }] };
    }),

  removeCategory: (name) => {
    set((state) => ({
      categories: state.categories.filter((c) => c.name !== name),
    }));
    window.electronAPI.categories.delete(name);
  },
}));
