# Implementation Plan: Categories, Dashboard, Analytics

## 1. New: `src/shared/categories-store.ts`

Zustand persisted store for category definitions.

```typescript
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CategoryDef {
  name: string;
  createdAt: number;
}

interface CategoriesState {
  categories: CategoryDef[];
  addCategory: (name: string) => void;
  removeCategory: (name: string) => void;
}

const DEFAULT_CATEGORIES = ["Work", "Code", "Meeting", "Personal", "Research"];

export const useCategoriesStore = create<CategoriesState>()(
  persist<CategoriesState>(
    (set) => ({
      categories: DEFAULT_CATEGORIES.map((name) => ({
        name,
        createdAt: Date.now(),
      })),
      addCategory: (name) =>
        set((state) => {
          if (state.categories.some((c) => c.name === name)) return state;
          return {
            categories: [...state.categories, { name, createdAt: Date.now() }],
          };
        }),
      removeCategory: (name) =>
        set((state) => ({
          categories: state.categories.filter((c) => c.name !== name),
        })),
    }),
    { name: "g-notes-categories" }
  )
);
```

---

## 2. Modify: `src/shared/page-store.ts`

Add `categoryFilter` for navigating to a filtered notes view.

```typescript
export type Page = "dashboard" | "notes" | "categories" | "favorites" | "archived" | "settings";

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
```

---

## 3. Modify: `src/components/notes/new-note-dialog.tsx`

Replace hardcoded `TAGS` array with categories from `categories-store`.

**Changes:**
- Import `useCategoriesStore`
- Replace `const TAGS = [...]` with reading `categories` from the store (`.map(c => c.name)`)
- Also derive any additional tags from notes that aren't in the store (so existing notes with non-matching tags still appear)

```typescript
// In the component:
const storeCategories = useCategoriesStore((s) => s.categories);
const notesTags = useNotesStore((s) => [...new Set(s.notes.map((n) => n.tag))]);

const allTags = useMemo(() => {
  const names = storeCategories.map((c) => c.name);
  for (const t of notesTags) {
    if (!names.includes(t)) names.push(t);
  }
  return names;
}, [storeCategories, notesTags]);

// Use allTags in the Select options
```

---

## 4. Modify: `src/components/layout/sidebar.tsx`

Clear `categoryFilter` when clicking "All Notes".

**Changes:**
- Import `setCategoryFilter` from page store
- On the "All Notes" nav item click, call `setCategoryFilter(null)` before/with `setActivePage("notes")`

---

## 5. New: `src/components/pages/new-category-dialog.tsx`

Dialog for creating a new category name.

```typescript
interface NewCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
```

**Content:**
- Uses existing `Dialog`, `Input` components
- Title input with auto-focus
- Enter to submit, Escape to cancel
- On Create: `addCategory(trimmedName)` from categories-store, close dialog
- Duplicate names are silently ignored (store handles this)

---

## 6. Modify: `src/components/layout/app-shell.tsx`

Add NewCategoryDialog alongside NewNoteDialog.

**Changes:**
- Add `newCategoryOpen` state
- Add `<NewCategoryDialog open={newCategoryOpen} onOpenChange={setNewCategoryOpen} />`
- Pass `onNewCategoryClick` to MainContent → CategoriesPage

---

## 7. Modify: `src/components/layout/main-content.tsx`

Pass props down to page components.

**Changes:**
- Add `onNewNoteClick` and `onNewCategoryClick` to `MainContentProps`
- Pass `onNewNoteClick` as a prop to all page components: `<PageComponent onNewNoteClick={onNewNoteClick} />`
- Page components that don't use it will simply ignore the extra prop

---

## 8. Modify: `src/components/pages/categories.tsx`

Wire up category creation and click-to-filter.

**Changes:**
- Import `useCategoriesStore` and `usePageStore`'s `setCategoryFilter`
- Read categories from `categories-store` (names), then compute counts from notes
- Empty state: "No categories yet" when both store and notes are empty
- "Create New Category" button `onClick` → `onNewCategoryClick` if received, else no-op
- Category card `onClick` → `setCategoryFilter(tag)` + `setActivePage("notes")`

---

## 9. Modify: `src/components/pages/dashboard.tsx`

Show real recent notes instead of skeleton cards.

**Changes:**
- Accept optional `onNewNoteClick` prop
- Import `useNotesStore`, `formatRelativeTime`
- Compute `recentNotes` — notes sorted by `updatedAt` desc, top 3
- If `notes.length === 0`: show existing skeleton UI with "Create Your First Note" wired to `onNewNoteClick`
- If `notes.length > 0`: show 2-3 recent note cards + "Quick Add" card
- Each recent note shows: title, excerpt (truncated), tag badge, relative timestamp
- Clicking a recent note → `setActiveNote(note.id)` + `setActivePage("notes")`
- "Quick Add" card → `onNewNoteClick`

---

## 10. Modify: `src/components/notes/notes-panel.tsx`

Filter notes by `categoryFilter` from page store.

**Changes:**
- Import `usePageStore` `categoryFilter` and `setCategoryFilter`
- Compute `filteredNotes` — if `categoryFilter` is set, filter `notes` by `tag === categoryFilter`
- Show filter indicator bar when filtered:
  - Text: "Category: {tag}" with a × button to clear (setCategoryFilter(null))
  - Note count updates to show filtered count
- Display `filteredNotes` in the list instead of all notes
- When filter changes, auto-select the first filtered note if current activeNote isn't in the filtered set
