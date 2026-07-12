import { useEffect } from "react";
import { usePageStore, type Page } from "@/shared/page-store";

export function useMenuHandlers(setDialog: (key: string, open: boolean) => void) {
  useEffect(() => {
    const api = window.electronAPI;
    if (!api) return;

    const handlers: Record<string, (...args: unknown[]) => void> = {
      "menu:new-note": () => setDialog("newNote", true),
      "menu:export-notes": () => setDialog("exportImport", true),
      "menu:import-notes": () => setDialog("exportImport", true),
      "menu:settings": () => setDialog("settings", true),
      "menu:about": () => setDialog("about", true),
      "menu:search": () => {
        usePageStore.getState().setActivePage("notes");
        setTimeout(() => {
          const searchInput = document.querySelector<HTMLInputElement>('[data-search-input]');
          searchInput?.focus();
        });
      },
      "menu:changelog": () => setDialog("changelog", true),
      "menu:navigate": (page: string) => {
        usePageStore.getState().setActivePage(page as Page);
      },
    };

    for (const [channel, handler] of Object.entries(handlers)) {
      api.on(channel, handler);
    }

    return () => {
      for (const [channel, handler] of Object.entries(handlers)) {
        api.removeListener(channel, handler);
      }
    };
  }, []);
}
