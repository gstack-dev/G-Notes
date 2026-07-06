import React, { useMemo } from "react";
import { PenSquare, PlusCircle, Sparkles, Clock } from "lucide-react";
import { useNotesStore, formatRelativeTime, getTextExcerpt } from "@/shared/zust-store";
import { usePageStore } from "@/shared/page-store";

interface DashboardProps {
  onNewNoteClick?: () => void;
}

function SkeletonCard() {
  return (
    <div className="bg-surface-container border border-outline-variant/50 rounded-xl p-5 h-[132px] flex flex-col relative overflow-hidden">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-8 h-8 rounded-lg bg-surface-container-high animate-pulse" />
        <div className="h-3 w-24 bg-surface-container-high rounded animate-pulse" />
      </div>
      <div className="space-y-2 flex-1">
        <div className="h-2.5 w-full bg-surface-container-high rounded animate-pulse" />
        <div className="h-2.5 w-3/4 bg-surface-container-high rounded animate-pulse" />
      </div>
      <div className="flex items-center justify-between mt-3">
        <div className="h-2 w-16 bg-surface-container-high rounded animate-pulse" />
        <div className="h-2 w-12 bg-surface-container-high rounded animate-pulse" />
      </div>
    </div>
  );
}

export function Dashboard({ onNewNoteClick }: DashboardProps) {
  const notes = useNotesStore((s) => s.notes);
  const setActivePage = usePageStore((s) => s.setActivePage);
  const setActiveNote = useNotesStore((s) => s.setActiveNote);

  const recentNotes = useMemo(
    () =>
      [...notes]
        .sort((a, b) => b.updatedAt - a.updatedAt)
        .slice(0, 3),
    [notes]
  );

  function handleNoteClick(id: string) {
    setActiveNote(id);
    setActivePage("notes");
  }

  return (
    <div className="flex-1 flex flex-col items-center p-6 lg:p-12 relative">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top_right,var(--tw-gradient-stops))] from-primary/5 via-background to-background" />

      <div className="w-full max-w-4xl z-10 pt-4 lg:pt-8">
        <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-16 mb-14">
          <div className="flex-1 text-center lg:text-left">
            <div className="inline-flex items-center gap-1.5 bg-primary/10 border border-primary/20 rounded-full px-3 py-1 mb-4">
              <Sparkles className="h-3 w-3 text-primary" />
              <span className="text-[11px] font-semibold tracking-wide uppercase text-primary">
                {notes.length === 0 ? "Welcome Aboard" : `${notes.length} notes and counting`}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold text-on-surface mb-4 tracking-tight leading-[1.1]">
              {notes.length === 0 ? (
                "Welcome to\nG-Notes Desktop"
              ) : (
                "Good to see you"
              )}
            </h1>

            <p className="text-sm sm:text-base text-on-surface-variant max-w-md mx-auto lg:mx-0 mb-6 leading-relaxed">
              {notes.length === 0
                ? "Your focused environment for high-performance knowledge management. Start capturing ideas without distractions."
                : `You have notes across your workspace. Pick up where you left off.`}
            </p>

            <button
              onClick={onNewNoteClick}
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary/90 transition-all shadow-[0_8px_24px_-4px_rgba(59,130,246,0.35)] hover:shadow-[0_12px_32px_-4px_rgba(59,130,246,0.5)] hover:scale-[1.02] active:scale-[0.98]"
            >
              <PenSquare className="h-4 w-4" />
              {notes.length === 0 ? "Create Your First Note" : "New Note"}
            </button>
          </div>

          <div className="shrink-0 relative">
            <div className="absolute inset-0 bg-primary/5 rounded-[32px] blur-3xl mix-blend-screen" />
            <svg
              width="240"
              height="200"
              viewBox="0 0 240 200"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="relative"
            >
              <rect x="30" y="50" width="180" height="120" rx="12" className="fill-surface-container-high stroke-outline-variant" stroke="currentColor" strokeWidth="1.5" />
              <rect x="42" y="62" width="156" height="8" rx="2" className="fill-primary/20" />
              <rect x="42" y="78" width="96" height="4" rx="2" className="fill-outline-variant/50" />
              <rect x="42" y="90" width="120" height="4" rx="2" className="fill-outline-variant/50" />
              <rect x="42" y="102" width="80" height="4" rx="2" className="fill-outline-variant/50" />
              <rect x="30" y="144" width="180" height="26" rx="12" className="fill-primary/8" />
              <circle cx="60" cy="157" r="4" className="fill-primary/30" />
              <circle cx="76" cy="157" r="4" className="fill-primary/30" />
              <circle cx="92" cy="157" r="4" className="fill-primary/30" />
            </svg>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-5">
          <Clock className="h-4 w-4 text-on-surface-variant" />
          <h2 className="text-sm font-heading font-semibold text-on-surface-variant tracking-wide">
            Recent Activity
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {notes.length === 0 ? (
            <>
              <SkeletonCard />
              <SkeletonCard />
              <div
                onClick={onNewNoteClick}
                className="border-2 border-dashed border-outline-variant/40 rounded-xl p-5 h-[132px] flex flex-col items-center justify-center text-center cursor-pointer hover:border-primary/40 hover:bg-primary/2 transition-all group"
              >
                <PlusCircle className="h-7 w-7 text-outline-variant mb-2 group-hover:text-primary/60 transition-colors" />
                <span className="text-xs font-semibold tracking-wide uppercase text-outline-variant group-hover:text-primary/60 transition-colors">
                  Quick Add
                </span>
              </div>
            </>
          ) : (
            <>
              {recentNotes.map((note) => (
                <div
                  key={note.id}
                  onClick={() => handleNoteClick(note.id)}
                  className="bg-surface-container border border-outline-variant/50 rounded-xl p-5 h-[132px] flex flex-col relative overflow-hidden cursor-pointer hover:bg-surface-container-high hover:border-primary/20 transition-all group"
                >
                  <h3 className="text-sm font-heading font-semibold text-on-surface truncate mb-2 group-hover:text-primary transition-colors">
                    {note.title}
                  </h3>
                  <p className="text-xs text-on-surface-variant leading-relaxed line-clamp-2 flex-1">
                    {getTextExcerpt(note.content) || "No content"}
                  </p>
                  <div className="flex items-center justify-between mt-auto">
                    <span className="text-[10px] font-semibold tracking-wide uppercase text-primary/70 bg-primary/8 px-2 py-0.5 rounded-full">
                      {note.tag}
                    </span>
                    <span className="text-[10px] text-on-surface-variant/50">
                      {formatRelativeTime(note.updatedAt)}
                    </span>
                  </div>
                </div>
              ))}
              <div
                onClick={onNewNoteClick}
                className="border-2 border-dashed border-outline-variant/40 rounded-xl p-5 h-[132px] flex flex-col items-center justify-center text-center cursor-pointer hover:border-primary/40 hover:bg-primary/2 transition-all group"
              >
                <PlusCircle className="h-7 w-7 text-outline-variant mb-2 group-hover:text-primary/60 transition-colors" />
                <span className="text-xs font-semibold tracking-wide uppercase text-outline-variant group-hover:text-primary/60 transition-colors">
                  Quick Add
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
