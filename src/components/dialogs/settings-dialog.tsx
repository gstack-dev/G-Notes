import React, { useEffect, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";

export function SettingsDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
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
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[90vw] max-w-lg rounded-xl bg-surface text-on-surface shadow-2xl border border-outline-variant p-6 max-h-[80vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <Dialog.Title className="text-lg font-heading font-semibold">Settings</Dialog.Title>
            <Dialog.Close className="p-1 rounded text-on-surface-variant hover:text-on-surface transition-colors">
              <X className="h-4 w-4" />
            </Dialog.Close>
          </div>
          <div className="space-y-5 text-sm">
            <div>
              <h3 className="font-semibold mb-1">Appearance</h3>
              <p className="text-xs text-on-surface-variant mb-2">Theme preference (coming soon).</p>
              <select
                disabled
                className="w-full rounded-lg border border-outline-variant bg-surface-container-high px-3 py-2 text-sm text-on-surface outline-none focus:border-primary disabled:opacity-50"
              >
                <option value="dark">Dark</option>
                <option value="light">Light</option>
                <option value="system">System</option>
              </select>
            </div>
            <div>
              <h3 className="font-semibold mb-1">Database</h3>
              <p className="text-xs text-on-surface-variant">
                Your data is stored locally via SQLite and never leaves your machine.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-1">Version</h3>
              <p className="text-xs text-on-surface-variant">{version || "..."}</p>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
