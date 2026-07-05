import React, { useState, useRef, useEffect } from "react";
import { useNotesStore, formatRelativeTime } from "@/shared/zust-store";
import { Trash2, Save, Check, Star, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";

export function EditorHeader() {
  const notes = useNotesStore((s) => s.notes);
  const activeNoteId = useNotesStore((s) => s.activeNoteId);
  const updateNote = useNotesStore((s) => s.updateNote);
  const deleteNote = useNotesStore((s) => s.deleteNote);
  const toggleFavorite = useNotesStore((s) => s.toggleFavorite);
  const setActiveNote = useNotesStore((s) => s.setActiveNote);
  const note = notes.find((n) => n.id === activeNoteId);
  const [saved, setSaved] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState("");
  const renameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (renaming && renameInputRef.current) {
      renameInputRef.current.focus();
      renameInputRef.current.select();
    }
  }, [renaming]);

  if (!note) {
    return (
      <header className="flex items-center justify-between px-6 py-3 h-[60px] border-b border-border shrink-0">
        <p className="text-sm text-on-surface-variant">Select a note</p>
      </header>
    );
  }

  function handleSave() {
    updateNote(note.id, { title: note.title, content: note.content, tag: note.tag });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function handleDelete() {
    deleteNote(note.id);
    setActiveNote(null);
  }

  function startRename() {
    setRenameValue(note.title);
    setRenaming(true);
  }

  function commitRename() {
    const trimmed = renameValue.trim();
    if (trimmed && trimmed !== note.title) {
      updateNote(note.id, { title: trimmed });
    }
    setRenaming(false);
  }

  function handleRenameKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") commitRename();
    if (e.key === "Escape") setRenaming(false);
  }

  return (
    <header className="flex items-center justify-between px-6 py-3 h-[60px] border-b border-border shrink-0">
      <div className="flex items-center gap-3 min-w-0">
        {renaming ? (
          <input
            ref={renameInputRef}
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            onBlur={commitRename}
            onKeyDown={handleRenameKeyDown}
            className="text-base font-heading font-semibold bg-surface-container border border-outline-variant rounded px-2 py-0.5 text-on-surface outline-none focus:border-primary min-w-[200px]"
          />
        ) : (
          <div className="flex items-center gap-2 min-w-0">
            <h2
              className="text-base font-heading font-semibold text-on-surface truncate cursor-pointer hover:text-primary transition-colors"
              onDoubleClick={startRename}
              title="Double-click to rename"
            >
              {note.title}
            </h2>
            <button
              onClick={startRename}
              className="shrink-0 p-1 rounded text-on-surface-variant/50 hover:text-on-surface transition-colors"
              title="Rename"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
            <span className="shrink-0 px-2 py-0.5 rounded-full bg-surface-container-high border border-outline-variant/30 text-[11px] font-semibold tracking-wide uppercase text-on-surface-variant">
              {note.tag}
            </span>
          </div>
        )}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={() => toggleFavorite(note.id)}
          className={cn(
            "w-8 h-8 flex items-center justify-center rounded-lg border transition-colors",
            note.favorited
              ? "text-primary border-primary/30 bg-primary/10"
              : "text-on-surface-variant border-outline-variant/50 bg-surface-container-high hover:text-primary hover:border-primary/30"
          )}
          title={note.favorited ? "Unfavorite" : "Favorite"}
        >
          <Star className={cn("h-4 w-4", note.favorited && "fill-current")} />
        </button>
        <span className="text-xs text-on-surface-variant hidden sm:block">
          {formatRelativeTime(note.updatedAt)}
        </span>
        <button
          onClick={handleDelete}
          className="flex items-center gap-1.5 bg-surface-container-high text-on-surface-variant hover:text-destructive border border-outline-variant/50 hover:border-destructive/50 px-3 py-1.5 rounded text-xs font-semibold tracking-wide uppercase transition-colors"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Delete
        </button>
        <button
          onClick={handleSave}
          className="flex items-center gap-1.5 bg-primary text-primary-foreground px-4 py-1.5 rounded text-xs font-semibold tracking-wide uppercase hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 active:scale-95"
        >
          {saved ? (
            <Check className="h-3.5 w-3.5" />
          ) : (
            <Save className="h-3.5 w-3.5" />
          )}
          {saved ? "Saved" : "Save Changes"}
        </button>
      </div>
    </header>
  );
}
