import React, { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNotesStore } from "@/shared/zust-store";
import { usePageStore } from "@/shared/page-store";
import { useCategoriesStore } from "@/shared/categories-store";

interface NewNoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NewNoteDialog({ open, onOpenChange }: NewNoteDialogProps) {
  const [title, setTitle] = useState("");
  const [tag, setTag] = useState("Work");
  const addNote = useNotesStore((s) => s.addNote);
  const setActiveNote = useNotesStore((s) => s.setActiveNote);
  const setActivePage = usePageStore((s) => s.setActivePage);
  const storeCategories = useCategoriesStore((s) => s.categories);
  const notes = useNotesStore((s) => s.notes);

  const allTags = useMemo(() => {
    const names = storeCategories.map((c) => c.name);
    const noteTags = [...new Set(notes.map((n) => n.tag))];
    for (const t of noteTags) {
      if (!names.includes(t)) names.push(t);
    }
    return names;
  }, [storeCategories, notes]);

  function handleCreate() {
    const trimmed = title.trim();
    if (!trimmed) return;

    const newId = addNote({
      title: trimmed,
      content: "",
      tag,
    });
    setActiveNote(newId);

    setTitle("");
    setTag("Work");
    onOpenChange(false);
    setActivePage("notes");
  }

  function handleCancel() {
    setTitle("");
    setTag("Work");
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>New Note</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <label className="text-xs font-semibold tracking-wide uppercase text-on-surface-variant">
              Title
            </label>
            <Input
              placeholder="Enter note title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreate();
              }}
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold tracking-wide uppercase text-on-surface-variant">
              Category
            </label>
            <Select value={tag} onValueChange={setTag}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {allTags.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <button
            onClick={handleCancel}
            className="px-4 py-2 text-xs font-semibold tracking-wide uppercase text-on-surface-variant hover:text-on-surface transition-colors rounded-md"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={!title.trim()}
            className="px-4 py-2 text-xs font-semibold tracking-wide uppercase bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Create
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
