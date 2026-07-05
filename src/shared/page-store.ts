import { create } from "zustand";

export type Page = "dashboard" | "notes" | "categories" | "favorites";

interface PageState {
  activePage: Page;
  setActivePage: (page: Page) => void;
  categoryFilter: string | null;
  setCategoryFilter: (tag: string | null) => void;
}

export const usePageStore = create<PageState>()((set) => ({
  activePage: "dashboard",
  setActivePage: (page) => set({ activePage: page }),
  categoryFilter: null,
  setCategoryFilter: (tag) => set({ categoryFilter: tag }),
}));
