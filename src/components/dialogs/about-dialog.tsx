import React, { useEffect, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";

export function AboutDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [version, setVersion] = useState("");

  useEffect(() => {
    if (open) {
      window.electronAPI?.getVersion().then(setVersion);
    }
  }, [open]);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 z-40" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[90vw] max-w-sm rounded-xl bg-surface text-on-surface shadow-2xl border border-outline-variant p-6">
          <div className="flex items-center justify-between mb-4">
            <Dialog.Title className="text-lg font-heading font-semibold">About G-Notes</Dialog.Title>
            <Dialog.Close className="p-1 rounded text-on-surface-variant hover:text-on-surface transition-colors">
              <X className="h-4 w-4" />
            </Dialog.Close>
          </div>
          <div className="space-y-3 text-sm">
            <p>
              <span className="font-semibold">Version</span> {version || "..."}
            </p>
            <p className="text-on-surface-variant leading-relaxed">
              A private, offline-first notes app powered by SQLite and EditorJS. All your data stays on your machine.
            </p>
            <div className="pt-2 border-t border-outline-variant/50">
              <p className="text-xs text-on-surface-variant">
                Built with Electron, React, TypeScript, and sql.js.
              </p>
              <p className="text-xs text-on-surface-variant mt-1">
                MIT License &copy; {new Date().getFullYear()} shnwnw
              </p>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
