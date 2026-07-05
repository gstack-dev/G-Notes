import React, { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X, Download, Upload, Check, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export function ExportImportDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [exporting, setExporting] = useState(false);
  const [exported, setExported] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<"success" | "error" | null>(null);

  async function handleExport() {
    setExporting(true);
    setExported(false);
    try {
      await window.electronAPI.exportNotes();
      setExported(true);
    } catch {
      setExported(false);
    }
    setExporting(false);
  }

  async function handleImport() {
    setImporting(true);
    setImportResult(null);
    try {
      await window.electronAPI.importNotes();
      setImportResult("success");
    } catch {
      setImportResult("error");
    }
    setImporting(false);
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 z-40" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[90vw] max-w-md rounded-xl bg-surface text-on-surface shadow-2xl border border-outline-variant p-6">
          <div className="flex items-center justify-between mb-4">
            <Dialog.Title className="text-lg font-heading font-semibold">Export / Import</Dialog.Title>
            <Dialog.Close className="p-1 rounded text-on-surface-variant hover:text-on-surface transition-colors">
              <X className="h-4 w-4" />
            </Dialog.Close>
          </div>
          <div className="space-y-4 text-sm">
            <div className="rounded-lg border border-outline-variant/50 p-4 bg-surface-container-high">
              <h3 className="font-semibold mb-1 flex items-center gap-2">
                <Download className="h-4 w-4" /> Export Notes
              </h3>
              <p className="text-xs text-on-surface-variant mb-3">
                Export all notes as a JSON file. Your data stays yours.
              </p>
              <button
                onClick={handleExport}
                disabled={exporting}
                className={cn(
                  "flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold tracking-wide uppercase transition-all",
                  exported
                    ? "bg-emerald-600 text-white"
                    : "bg-primary text-primary-foreground hover:bg-primary/90"
                )}
              >
                {exported ? <Check className="h-3.5 w-3.5" /> : <Download className="h-3.5 w-3.5" />}
                {exporting ? "Exporting..." : exported ? "Exported" : "Export"}
              </button>
            </div>
            <div className="rounded-lg border border-outline-variant/50 p-4 bg-surface-container-high">
              <h3 className="font-semibold mb-1 flex items-center gap-2">
                <Upload className="h-4 w-4" /> Import Notes
              </h3>
              <p className="text-xs text-on-surface-variant mb-3">
                Import notes from a JSON file. Existing notes are not overwritten.
              </p>
              <button
                onClick={handleImport}
                disabled={importing}
                className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-xs font-semibold tracking-wide uppercase hover:bg-primary/90 transition-all"
              >
                <Upload className="h-3.5 w-3.5" />
                {importing ? "Importing..." : "Import"}
              </button>
              {importResult === "success" && (
                <p className="text-xs text-emerald-600 mt-2 flex items-center gap-1"><Check className="h-3 w-3" /> Notes imported successfully</p>
              )}
              {importResult === "error" && (
                <p className="text-xs text-destructive mt-2 flex items-center gap-1"><AlertCircle className="h-3 w-3" /> Import failed or was cancelled</p>
              )}
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
