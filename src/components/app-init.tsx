import { useEffect } from "react";
import { useNotesStore } from "@/shared/zust-store";
import { useCategoriesStore } from "@/shared/categories-store";

export function AppInit(): null {
  const initialized = useNotesStore((s) => s.initialized);
  const setInitialized = useNotesStore((s) => s.setInitialized);
  const setOnboardingNeeded = useNotesStore((s) => s.setOnboardingNeeded);
  const catsInitialized = useCategoriesStore((s) => s.initialized);
  const setCatsInitialized = useCategoriesStore((s) => s.setInitialized);

  useEffect(() => {
    if (!window.electronAPI) return;

    if (!initialized) {
      window.electronAPI.notes.list().then((notes) => {
        setInitialized(notes, null);

        window.electronAPI.prefs.get("onboarding_done").then((done) => {
          if (!done && notes.length === 0) {
            setOnboardingNeeded(true);
          }
        });
      });
    }

    if (!catsInitialized) {
      window.electronAPI.categories.list().then((cats) => {
        setCatsInitialized(cats);
      });
    }
  }, []);

  return null;
}
