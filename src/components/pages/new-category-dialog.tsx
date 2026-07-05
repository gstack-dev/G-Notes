import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useCategoriesStore } from "@/shared/categories-store";

interface NewCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NewCategoryDialog({ open, onOpenChange }: NewCategoryDialogProps) {
  const [name, setName] = useState("");
  const addCategory = useCategoriesStore((s) => s.addCategory);

  function handleCreate() {
    const trimmed = name.trim();
    if (!trimmed) return;
    addCategory(trimmed);
    setName("");
    onOpenChange(false);
  }

  function handleCancel() {
    setName("");
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>New Category</DialogTitle>
        </DialogHeader>

        <div className="py-2">
          <label className="text-xs font-semibold tracking-wide uppercase text-on-surface-variant block mb-2">
            Category Name
          </label>
          <Input
            placeholder="Enter category name..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleCreate();
            }}
            autoFocus
          />
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
            disabled={!name.trim()}
            className="px-4 py-2 text-xs font-semibold tracking-wide uppercase bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Create
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
