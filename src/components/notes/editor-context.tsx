import React, { createContext, useContext, useRef } from "react";
import type EditorJS from "@editorjs/editorjs";

interface EditorContextValue {
  editorRef: React.MutableRefObject<EditorJS | null>;
}

const EditorContext = createContext<EditorContextValue | null>(null);

export function EditorProvider({ children }: { children: React.ReactNode }) {
  const editorRef = useRef<EditorJS | null>(null);

  return (
    <EditorContext.Provider value={{ editorRef }}>
      {children}
    </EditorContext.Provider>
  );
}

export function useEditor(): EditorContextValue {
  const ctx = useContext(EditorContext);
  if (!ctx) throw new Error("useEditor must be used within EditorProvider");
  return ctx;
}
