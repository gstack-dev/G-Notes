import React, { useMemo } from "react";
import { useNotesStore, formatRelativeTime, getTextExcerpt } from "@/shared/zust-store";
import { usePageStore } from "@/shared/page-store";
import {
  Star,
  MapPin,
  Folder,
  Code,
  Users,
  Briefcase,
  FlaskConical,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";

const TAG_ICONS: Record<string, React.ElementType> = {
  Code,
  Meeting: Users,
  Work: Briefcase,
  Personal: User,
  Research: FlaskConical,
};

function FavoritesEmpty() {
  return (
    <div className="col-span-full flex flex-col items-center justify-center h-64 text-center mt-8 border-2 border-dashed border-outline-variant/30 rounded-xl">
      <Star className="h-12 w-12 text-outline-variant/60 mb-4" />
      <h3 className="text-lg font-heading font-semibold text-on-surface mb-1">
        No Favorites Yet
      </h3>
      <p className="text-sm text-on-surface-variant max-w-sm">
        Star your most important notes to keep them easily accessible here.
      </p>
    </div>
  );
}

export function FavoritesPage() {
  const notes = useNotesStore((s) => s.notes);
  const toggleFavorite = useNotesStore((s) => s.toggleFavorite);
  const togglePin = useNotesStore((s) => s.togglePin);
  const setActivePage = usePageStore((s) => s.setActivePage);
  const setActiveNote = useNotesStore((s) => s.setActiveNote);

  const favorites = useMemo(
    () =>
      [...notes]
        .filter((n) => n.favorited)
        .sort((a, b) => {
          if (a.pinned && !b.pinned) return -1;
          if (!a.pinned && b.pinned) return 1;
          return b.updatedAt - a.updatedAt;
        }),
    [notes]
  );

  function handleNoteClick(id: string) {
    setActiveNote(id);
    setActivePage("notes");
  }

  function handleStarClick(e: React.MouseEvent, id: string) {
    e.stopPropagation();
    toggleFavorite(id);
  }

  function handlePinClick(e: React.MouseEvent, id: string) {
    e.stopPropagation();
    togglePin(id);
  }

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="flex items-end justify-between mb-6">
        <div>
          <h2 className="text-3xl font-heading font-bold text-on-surface tracking-tight">
            Favorites
          </h2>
          <p className="text-sm text-on-surface-variant mt-1">
            Your most important and frequently accessed notes.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {favorites.length === 0 ? (
          <FavoritesEmpty />
        ) : (
          favorites.map((note) => {
            const isPinned = note.pinned;
            const TagIcon = TAG_ICONS[note.tag] || Folder;
            return (
              <div
                key={note.id}
                onClick={() => handleNoteClick(note.id)}
                className={cn(
                  "group bg-surface-container border border-outline-variant/50 rounded-xl p-5 flex flex-col relative cursor-pointer hover:border-primary/20 hover:bg-surface-container-high transition-all overflow-hidden",
                  isPinned && "md:col-span-2"
                )}
              >
                <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <button
                    onClick={(e) => handlePinClick(e, note.id)}
                    className={cn(
                      "w-8 h-8 rounded-lg bg-surface border border-outline-variant/50 flex items-center justify-center transition-colors",
                      isPinned
                        ? "text-primary hover:bg-primary hover:text-on-primary"
                        : "text-on-surface-variant hover:text-primary"
                    )}
                    title={isPinned ? "Unpin" : "Pin to top"}
                  >
                    <MapPin className={cn("h-[18px] w-[18px]", isPinned && "fill-current")} />
                  </button>
                  <button
                    onClick={(e) => handleStarClick(e, note.id)}
                    className={cn(
                      "w-8 h-8 rounded-lg bg-surface border border-outline-variant/50 flex items-center justify-center transition-colors",
                      "text-primary hover:bg-primary hover:text-on-primary"
                    )}
                    title="Unfavorite"
                  >
                    <Star className="h-[18px] w-[18px] fill-current" />
                  </button>
                </div>

                <div className="flex items-center gap-2 mb-2.5 text-on-surface-variant">
                  <TagIcon className="h-4 w-4 text-primary" />
                  <span className="text-[11px] font-semibold tracking-wide uppercase">{note.tag}</span>
                  <span className="w-1 h-1 rounded-full bg-outline-variant/60" />
                  <span className="text-[11px]">{formatRelativeTime(note.updatedAt)}</span>
                  {isPinned && (
                    <>
                      <span className="w-1 h-1 rounded-full bg-outline-variant/60" />
                      <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide uppercase border border-primary/20">
                        PINNED
                      </span>
                    </>
                  )}
                </div>

                <h3 className="text-base font-heading font-semibold text-on-surface mb-2 pr-12 leading-snug">
                  {note.title}
                </h3>

                <p className="text-sm text-on-surface-variant leading-relaxed line-clamp-3 flex-1 mb-3">
                  {getTextExcerpt(note.content) || "No content"}
                </p>

                <div className="flex items-center gap-1.5 mt-auto">
                  <span className="bg-surface-container-high text-on-surface-variant px-2 py-1 rounded text-[11px] font-medium border border-outline-variant/30">
                    #{note.tag.toLowerCase().replace(/\s+/g, "-")}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
