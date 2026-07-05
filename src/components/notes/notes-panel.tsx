import React, { useMemo } from "react";
import { Search, ArrowDown, X } from "lucide-react";
import { NoteCard } from "./note-card";
import { useNotesStore, formatRelativeTime, getTextExcerpt } from "@/shared/zust-store";
import { usePageStore } from "@/shared/page-store";

export function NotesPanel() {
  const notes = useNotesStore((s) => s.notes);
  const activeNoteId = useNotesStore((s) => s.activeNoteId);
  const setActiveNote = useNotesStore((s) => s.setActiveNote);
  const categoryFilter = usePageStore((s) => s.categoryFilter);
  const setCategoryFilter = usePageStore((s) => s.setCategoryFilter);
  const [searchQuery, setSearchQuery] = React.useState("");

  const filteredNotes = useMemo(
    () => {
      let result = categoryFilter
        ? notes.filter((n) => n.tag === categoryFilter)
        : notes;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        result = result.filter((n) => {
          if (n.title.toLowerCase().includes(q)) return true;
          if (n.tag.toLowerCase().includes(q)) return true;
          const excerpt = getTextExcerpt(n.content, 9999).toLowerCase();
          if (excerpt.includes(q)) return true;
          return false;
        });
      }
      return result;
    },
    [notes, categoryFilter, searchQuery]
  );

  return (
    <div className="w-[320px] shrink-0 flex flex-col border-r border-border bg-surface-container-low">
      <div className="p-4 border-b border-border/50 space-y-3">
        {categoryFilter && (
          <div className="flex items-center gap-2 px-2 py-1.5 bg-primary/10 border border-primary/20 rounded-md">
            <span className="text-xs font-semibold tracking-wide uppercase text-primary flex-1 truncate">
              Category: {categoryFilter}
            </span>
            <button
              onClick={() => setCategoryFilter(null)}
              className="text-primary/70 hover:text-primary transition-colors shrink-0"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-variant" />
          <input
            type="text"
            data-search-input
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-surface-container-high border border-outline-variant/50 rounded-lg py-2 pl-10 pr-3 text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all placeholder:text-on-surface-variant"
          />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold tracking-wide uppercase text-on-surface-variant">
            {filteredNotes.length} {categoryFilter ? `notes (${categoryFilter})` : "Notes"}
          </span>
          <button className="flex items-center gap-1 text-xs font-semibold tracking-wide uppercase text-on-surface-variant hover:text-on-surface transition-colors">
            Date
            <ArrowDown className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-0.5">
        {filteredNotes.length === 0 && (
          <div className="p-4 text-center text-xs text-on-surface-variant/60">
            {searchQuery
              ? "No notes match your search."
              : categoryFilter
                ? "No notes in this category."
                : "No notes yet."}
          </div>
        )}
        {filteredNotes.map((note) => (
          <NoteCard
            key={note.id}
            title={note.title}
            excerpt={getTextExcerpt(note.content)}
            tag={note.tag}
            timestamp={formatRelativeTime(note.updatedAt)}
            active={note.id === activeNoteId}
            onClick={() => setActiveNote(note.id)}
          />
        ))}
      </div>
    </div>
  );
}
