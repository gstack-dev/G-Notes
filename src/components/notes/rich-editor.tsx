import React, { useRef } from "react";
import EditorJS from "@editorjs/editorjs";
import Header from "@editorjs/header";
import List from "@editorjs/list";

// @ts-expect-error -- no types available
import Marker from "@editorjs/marker";
// @ts-expect-error -- no types available
import Checklist from "@editorjs/checklist";
import Quote from "@editorjs/quote";
import CodeTool from "@editorjs/code";
import Underline from "@editorjs/underline";
import { useEditor } from "./editor-context";
import { useNotesStore } from "@/shared/zust-store";

function collectBlockStyles(editor: EditorJS): Record<string, any> {
  const styles: Record<string, any> = {};
  for (let i = 0; i < editor.blocks.getBlocksCount(); i++) {
    const block = editor.blocks.getBlockByIndex(i);
    if (!block || !block.holder) continue;
    const holder = block.holder as HTMLElement;
    const entry: Record<string, string> = {};
    const fs = holder.style.fontSize;
    if (fs) entry.fontSize = fs;
    const dir = holder.style.direction;
    if (dir) entry.direction = dir;
    if (Object.keys(entry).length > 0) styles[String(i)] = entry;
  }
  return styles;
}

function applyBlockStyles(editor: EditorJS, styles?: Record<string, any>): void {
  if (!styles) return;
  for (const idx of Object.keys(styles)) {
    const block = editor.blocks.getBlockByIndex(Number(idx));
    if (!block || !block.holder) continue;
    const holder = block.holder as HTMLElement;
    const s = styles[idx];
    if (s?.fontSize) holder.style.fontSize = s.fontSize;
    if (s?.direction) holder.style.direction = s.direction;
  }
}

function sanitizeItems(items: any[]): any[] {
  if (!Array.isArray(items)) return [];
  if (items.length === 0) return [];
  return items.map((item: any) =>
    item && typeof item === "object"
      ? {
          content: item.content || "",
          meta: item.meta || {},
          items: sanitizeItems(item.items),
        }
      : { content: String(item || ""), meta: {}, items: [] }
  );
}

function sanitizeBlocks(data: any): any {
  if (!data || !Array.isArray(data.blocks)) return data;
  return {
    ...data,
    blocks: data.blocks.map((b: any) => {
      if (b.type === "list") {
        return { ...b, data: { ...(b.data || {}), items: sanitizeItems(b.data?.items) } };
      }
      if (b.type === "checklist") {
        const items = b.data?.items;
        const safeItems = Array.isArray(items) && items.length > 0
          ? items.map((item: any) =>
              item && typeof item === "object"
                ? { text: item.text || "", checked: Boolean(item.checked) }
                : { text: String(item || ""), checked: false }
            )
          : [{ text: "" }];
        return { ...b, data: { ...(b.data || {}), items: safeItems } };
      }
      return b;
    }),
  };
}

export function RichEditor() {
  const { editorRef } = useEditor();
  const containerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const activeNoteId = useNotesStore((s) => s.activeNoteId);
  const hasChangesRef = useRef(false);

  React.useEffect(() => {
    if (!containerRef.current || !activeNoteId) return;
    const currentNoteId = activeNoteId;

    const state = useNotesStore.getState();
    const note = state.notes.find((n) => n.id === currentNoteId);
    let savedData: { blocks: any[]; time?: number; styles?: Record<string, any> } | undefined;
    const savedStyles: Record<string, any> = {};
    if (note?.content) {
      try {
        const parsed = JSON.parse(note.content);
        savedData = { blocks: parsed.blocks || [], time: parsed.time };
        if (parsed.styles) Object.assign(savedStyles, parsed.styles);
      } catch {
        savedData = {
          time: Date.now(),
          blocks: [{ type: "paragraph", data: { text: note.content } }],
        };
      }
    }

    savedData = sanitizeBlocks(savedData);

    const editor = new EditorJS({
      holder: containerRef.current,
      data: savedData as any,
      tools: {
        header: {
          class: Header,
          inlineToolbar: true,
        },
        list: {
          class: List,
          inlineToolbar: true,
        },
        marker: Marker,
        checklist: {
          class: Checklist,
          inlineToolbar: true,
        },
        quote: {
          class: Quote,
          inlineToolbar: true,
        },
        code: {
          class: CodeTool,
        },
        underline: Underline,
      },
      onChange: () => {
        hasChangesRef.current = true;
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
          editor.save().then((output) => {
            if (currentNoteId) {
              const styles = collectBlockStyles(editor);
              const data = styles && Object.keys(styles).length > 0
                ? { ...output, styles }
                : output;
              useNotesStore.getState().updateNote(currentNoteId, {
                content: JSON.stringify(data),
              });
            }
            hasChangesRef.current = false;
          }).catch(() => {/* ignore */});
        }, 800);
      },
      placeholder: "Start writing...",
    });

    editor.isReady.then(() => {
      editorRef.current = editor;
      applyBlockStyles(editor, savedStyles);

      const container = containerRef.current;
      if (container) {
        container.addEventListener("click", (e) => {
          const anchor = (e.target as HTMLElement).closest("a");
          if (!anchor) return;
          e.preventDefault();
          e.stopPropagation();
          const href = anchor.getAttribute("href");
          if (!href) return;
          let url = href;
          if (!href.startsWith("http://") && !href.startsWith("https://") && !href.startsWith("mailto:")) {
            url = "https://" + href;
          }
          const api = window.electronAPI;
          if (api?.openExternal) {
            api.openExternal(url);
          } else {
            window.open(url, "_blank");
          }
        }, true);
      }
    });

    intervalRef.current = setInterval(() => {
      if (!hasChangesRef.current) return;
      editor.save().then((output) => {
        if (currentNoteId) {
          const styles = collectBlockStyles(editor);
          const data = styles && Object.keys(styles).length > 0
            ? { ...output, styles }
            : output;
          useNotesStore.getState().updateNote(currentNoteId, {
            content: JSON.stringify(data),
          });
        }
        hasChangesRef.current = false;
      }).catch(() => {/* ignore */});
    }, 5000);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
      editor.save().then((output) => {
        if (currentNoteId) {
          const styles = collectBlockStyles(editor);
          const data = styles && Object.keys(styles).length > 0
            ? { ...output, styles }
            : output;
          useNotesStore.getState().updateNote(currentNoteId, {
            content: JSON.stringify(data),
          });
        }
      }).catch(() => {/* ignore */}).finally(() => {
        editor.destroy();
        editorRef.current = null;
      });
    };
  }, [activeNoteId]);

  return (
    <div className="flex-1 overflow-y-auto px-6 py-6 min-h-0">
      <div
        ref={containerRef}
        className="max-w-3xl mx-auto editorjs-container min-h-[300px]"
      />
    </div>
  );
}
