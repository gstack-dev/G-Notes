import { create } from "zustand";

export type ThemeMode = "dark" | "light" | "system";

interface ThemeState {
  mode: ThemeMode;
  resolved: "dark" | "light";
  init: () => Promise<void>;
  setMode: (mode: ThemeMode) => void;
  apply: (mode: ThemeMode) => void;
}

function resolve(mode: ThemeMode): "dark" | "light" {
  if (mode === "system") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  return mode;
}

function applyTheme(resolved: "dark" | "light") {
  document.documentElement.classList.toggle("dark", resolved === "dark");
  document.documentElement.classList.toggle("light", resolved === "light");
}

export const useThemeStore = create<ThemeState>()((set, get) => ({
  mode: "dark",
  resolved: "dark",

  init: async () => {
    const raw = await window.electronAPI.prefs.get("theme");
    const mode: ThemeMode = (raw as ThemeMode) || "dark";
    const r = resolve(mode);
    set({ mode, resolved: r });
    applyTheme(r);

    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
      if (get().mode === "system") {
        const r = resolve("system");
        set({ resolved: r });
        applyTheme(r);
      }
    });
  },

  setMode: (mode) => {
    const r = resolve(mode);
    set({ mode, resolved: r });
    applyTheme(r);
    window.electronAPI.prefs.set("theme", mode);
  },

  apply: (mode) => {
    const r = resolve(mode);
    applyTheme(r);
  },
}));
