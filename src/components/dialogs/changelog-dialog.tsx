import React, { useEffect, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { marked } from "marked";

export function ChangelogDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [html, setHtml] = useState("");

  useEffect(() => {
    if (open) {
      window.electronAPI?.getChangelog?.().then((md: string) => {
        setHtml(marked.parse(md) as string);
      });
    }
  }, [open]);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 z-40" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[90vw] max-w-2xl max-h-[80vh] rounded-xl bg-surface text-on-surface shadow-2xl border border-outline-variant p-6 overflow-y-auto">
          <div className="flex items-center justify-between mb-4 sticky top-0 bg-surface pb-2">
            <Dialog.Title className="text-lg font-heading font-semibold">What's New</Dialog.Title>
            <Dialog.Close className="p-1 rounded text-on-surface-variant hover:text-on-surface transition-colors">
              <X className="h-4 w-4" />
            </Dialog.Close>
          </div>
          <div
            className="prose prose-sm prose-invert max-w-none text-sm leading-relaxed text-on-surface-variant [&_h1]:text-lg [&_h1]:font-heading [&_h1]:font-semibold [&_h1]:text-on-surface [&_h2]:text-base [&_h2]:font-heading [&_h2]:font-semibold [&_h2]:text-on-surface [&_h3]:text-sm [&_h3]:font-semibold [&_h3]:text-on-surface [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:mb-1 [&_code]:bg-surface-container-high [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-xs [&_pre]:bg-surface-container-high [&_pre]:p-3 [&_pre]:rounded-lg [&_pre]:overflow-x-auto [&_hr]:border-outline-variant/50 [&_a]:text-primary [&_a]:underline"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
