import React from "react";
import { FileText } from "lucide-react";
import { useNotesStore } from "@/shared/zust-store";
import { NotesPanel } from "@/components/notes/notes-panel";
import { EditorHeader } from "@/components/notes/editor-header";
import { EditorToolbar } from "@/components/notes/editor-toolbar";
import { RichEditor } from "@/components/notes/rich-editor";
import { EditorProvider } from "@/components/notes/editor-context";

export function NotesPage() {
  const activeNoteId = useNotesStore((s) => s.activeNoteId);

  return (
    <div className="flex-1 flex h-full overflow-hidden">
      <NotesPanel />
      <div className="flex-1 flex flex-col bg-background">
        <EditorHeader />
        {activeNoteId ? (
          <EditorProvider>
            <EditorToolbar />
            <RichEditor />
          </EditorProvider>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
            <div className="w-16 h-16 rounded-2xl bg-surface-container-high border border-outline-variant/30 flex items-center justify-center mb-4">
              <FileText className="h-8 w-8 text-outline-variant/60" />
            </div>
            <h3 className="text-lg font-heading font-semibold text-on-surface mb-1">
              Select a Note
            </h3>
            <p className="text-sm text-on-surface-variant max-w-xs">
              Choose a note from the sidebar to start editing, or create a new one.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
