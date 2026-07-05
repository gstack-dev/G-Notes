import React, { useMemo } from "react";
import { useNotesStore } from "@/shared/zust-store";
import { useCategoriesStore } from "@/shared/categories-store";
import { usePageStore } from "@/shared/page-store";
import {
  Code,
  User,
  Users,
  Briefcase,
  FlaskConical,
  Folder,
  Plus,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CategoryMeta {
  icon: React.ElementType;
  accent: {
    text: string;
    border: string;
    bg: string;
  };
}

const TAG_META: Record<string, CategoryMeta> = {
  Code: {
    icon: Code,
    accent: { text: "text-primary", border: "border-primary/50", bg: "bg-primary" },
  },
  Work: {
    icon: Briefcase,
    accent: { text: "text-primary", border: "border-primary/50", bg: "bg-primary" },
  },
  Meeting: {
    icon: Users,
    accent: { text: "text-secondary-foreground", border: "border-secondary-foreground/50", bg: "bg-secondary-foreground" },
  },
  Personal: {
    icon: User,
    accent: { text: "text-on-surface", border: "border-on-surface/50", bg: "bg-on-surface" },
  },
  Research: {
    icon: FlaskConical,
    accent: { text: "text-[#bcc7de]", border: "border-[#bcc7de]/50", bg: "bg-[#bcc7de]" },
  },
};

const FALLBACK: CategoryMeta = {
  icon: Folder,
  accent: { text: "text-outline", border: "border-outline/50", bg: "bg-outline" },
};

function getMeta(tag: string): CategoryMeta {
  return TAG_META[tag] || FALLBACK;
}

interface CategoriesPageProps {
  onNewCategoryClick?: () => void;
}

export function CategoriesPage({ onNewCategoryClick }: CategoriesPageProps) {
  const notes = useNotesStore((s) => s.notes);
  const storeCategories = useCategoriesStore((s) => s.categories);
  const removeCategory = useCategoriesStore((s) => s.removeCategory);
  const deleteNotesByTag = useNotesStore((s) => s.deleteNotesByTag);
  const setActivePage = usePageStore((s) => s.setActivePage);
  const setCategoryFilter = usePageStore((s) => s.setCategoryFilter);

  const categories = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const note of notes) {
      counts[note.tag] = (counts[note.tag] || 0) + 1;
    }
    const allNames = [
      ...new Set([
        ...storeCategories.map((c) => c.name),
        ...Object.keys(counts),
      ]),
    ];
    return allNames
      .map((tag) => ({
        tag,
        count: counts[tag] || 0,
        meta: getMeta(tag),
      }))
      .sort((a, b) => b.count - a.count);
  }, [notes, storeCategories]);

  return (
    <div className="flex-1 overflow-y-auto p-6 pb-12">
      <div className="flex items-end justify-between mb-8">
        <div>
          <h2 className="text-3xl font-heading font-bold text-on-surface tracking-tight">
            Categories
          </h2>
          <p className="text-sm text-on-surface-variant mt-1">
            Organize and manage your knowledge base.
          </p>
        </div>
        <button
          onClick={onNewCategoryClick}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-xs font-semibold tracking-wide uppercase hover:bg-primary/90 transition-all shadow-[0_4px_10px_-2px_rgba(77,142,255,0.3)] shrink-0"
        >
          <Plus className="h-[18px] w-[18px]" />
          Create New Category
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
        {categories.length === 0 && (
          <div className="col-span-full flex items-center justify-center h-32 text-sm text-on-surface-variant/60">
            No categories yet. Create a category or add a note to get started.
          </div>
        )}
        {categories.map(({ tag, count, meta }) => (
          <div
            key={tag}
            onClick={() => {
              setCategoryFilter(tag);
              setActivePage("notes");
            }}
            className="group relative bg-surface-container-high border border-outline-variant rounded-xl p-4 hover:bg-surface-bright transition-all duration-300 overflow-hidden cursor-pointer flex flex-col justify-between h-32"
          >
            <div className="absolute -right-6 -top-6 opacity-5 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none">
              <meta.icon className={cn("w-[120px] h-[120px]", meta.accent.text)} strokeWidth={1} />
            </div>
            <div className="flex justify-between items-start z-10">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const noteCount = notes.filter((n) => n.tag === tag).length;
                  const msg = noteCount > 0
                    ? `Delete "${tag}" and its ${noteCount} note${noteCount === 1 ? "" : "s"}? This cannot be undone.`
                    : `Delete category "${tag}"?`;
                  if (window.confirm(msg)) {
                    if (noteCount > 0) deleteNotesByTag(tag);
                    removeCategory(tag);
                  }
                }}
                className="absolute top-2 right-2 p-1.5 rounded-md bg-surface/80 opacity-0 group-hover:opacity-100 hover:bg-destructive/20 text-on-surface-variant hover:text-destructive transition-all"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
              <div
                className={cn(
                  "w-10 h-10 rounded-lg bg-surface flex items-center justify-center border border-outline-variant group-hover:border-primary/50 transition-colors"
                )}
              >
                <meta.icon className={cn("h-5 w-5", meta.accent.text)} />
              </div>
              <span className="text-xs font-semibold tracking-wide uppercase text-on-surface-variant bg-surface px-2 py-1 rounded-full border border-outline-variant">
                {count} {count === 1 ? "Note" : "Notes"}
              </span>
            </div>
            <div className="z-10 mt-auto">
              <h3 className="text-lg font-heading font-semibold text-on-surface transition-colors">
                {tag}
              </h3>
            </div>
          </div>
        ))}
      </div>


    </div>
  );
}
