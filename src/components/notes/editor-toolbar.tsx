import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Bold,
  Italic,
  Underline,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  Code,
  Link2,
  ArrowLeftToLine,
  ArrowRightToLine,
} from "lucide-react";
import { useEditor } from "./editor-context";

function normalizeUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return trimmed;
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://") || trimmed.startsWith("mailto:") || trimmed.startsWith("#")) {
    return trimmed;
  }
  return "https://" + trimmed;
}

type ToolEntry =
  | { type: "btn"; id: string; icon: React.ElementType; title: string; action: () => void }
  | { type: "sep" }
  | { type: "select"; id: string; options: { value: string; label: string }[]; onChange: (v: string) => void; defaultVal: string };

export function EditorToolbar() {
  const { editorRef } = useEditor();
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const linkInputRef = useRef<HTMLInputElement>(null);
  const savedRangeRef = useRef<Range | null>(null);

  useEffect(() => {
    if (linkOpen) {
      linkInputRef.current?.focus();
    } else {
      savedRangeRef.current = null;
    }
  }, [linkOpen]);

  const exec = useCallback((cmd: string, value?: string) => {
    document.execCommand(cmd, false, value);
  }, []);

  const restoreRange = useCallback(() => {
    const sel = window.getSelection();
    if (sel && savedRangeRef.current) {
      sel.removeAllRanges();
      sel.addRange(savedRangeRef.current);
    }
  }, []);

  const changeBlock = useCallback(async (tool: string, data?: Record<string, unknown>) => {
    const editor = editorRef.current;
    if (!editor) return;
    const idx = editor.blocks.getCurrentBlockIndex();

    let mergedData: Record<string, unknown> | undefined = data;
    if (tool === "list") {
      mergedData = {
        ...mergedData,
        items: [{ content: "", meta: {}, items: [] }],
      };
    }

    if (idx === -1) {
      editor.blocks.insert(tool, mergedData, undefined, undefined, true);
      return;
    }

    const currentBlock = editor.blocks.getBlockByIndex(idx);
    const currentText = currentBlock?.holder?.textContent || "";

    if (tool === "header" && data) {
      mergedData = { ...data, text: currentText || "" };
    }

    editor.blocks.delete(idx);
    editor.blocks.insert(tool, mergedData, undefined, idx, true);
  }, [editorRef]);

  const handleLinkSubmit = useCallback(() => {
    restoreRange();
    const sel = window.getSelection();
    const url = normalizeUrl(linkUrl);
    if (url && sel && !sel.isCollapsed) {
      const text = sel.toString();
      document.execCommand("insertHTML", false, `<a href="${url}">${text}</a>`);
    }
    setLinkOpen(false);
    setLinkUrl("");
  }, [linkUrl, restoreRange]);

  const handleLinkCancel = useCallback(() => {
    setLinkOpen(false);
    setLinkUrl("");
  }, []);

  const handleFontSize = useCallback(async (v: string) => {
    const editor = editorRef.current;
    if (!editor) return;
    const idx = editor.blocks.getCurrentBlockIndex();
    if (idx === -1) return;
    const block = editor.blocks.getBlockByIndex(idx);
    if (!block) return;

    await editor.blocks.update(block.id, { fontSize: v });
    const updated = editor.blocks.getBlockByIndex(idx);
    if (updated) {
      (updated.holder as HTMLElement).style.fontSize = v;
    }
  }, [editorRef]);

  const handleDirection = useCallback(async (dir: string) => {
    const editor = editorRef.current;
    if (!editor) return;
    const idx = editor.blocks.getCurrentBlockIndex();
    if (idx === -1) return;
    const block = editor.blocks.getBlockByIndex(idx);
    if (!block) return;

    await editor.blocks.update(block.id, { direction: dir });
    const updated = editor.blocks.getBlockByIndex(idx);
    if (updated) {
      (updated.holder as HTMLElement).style.direction = dir;
    }
  }, [editorRef]);

  const tools: ToolEntry[] = [
    { type: "btn", id: "bold", icon: Bold, title: "Bold", action: () => exec("bold") },
    { type: "btn", id: "italic", icon: Italic, title: "Italic", action: () => exec("italic") },
    { type: "btn", id: "underline", icon: Underline, title: "Underline", action: () => exec("underline") },
    { type: "sep" },
    { type: "btn", id: "h1", icon: Heading1, title: "Heading 1", action: () => changeBlock("header", { level: 1 }) },
    { type: "btn", id: "h2", icon: Heading2, title: "Heading 2", action: () => changeBlock("header", { level: 2 }) },
    { type: "sep" },
    { type: "btn", id: "ul", icon: List, title: "Bulleted List", action: () => changeBlock("list", { style: "unordered" }) },
    { type: "btn", id: "ol", icon: ListOrdered, title: "Numbered List", action: () => changeBlock("list", { style: "ordered" }) },
    { type: "sep" },
    { type: "btn", id: "code", icon: Code, title: "Code Block", action: () => changeBlock("code") },
    { type: "btn", id: "link", icon: Link2, title: "Insert Link", action: () => {
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0) savedRangeRef.current = sel.getRangeAt(0);
      setLinkOpen(true);
    }},
    { type: "sep" },
    {
      type: "select", id: "font-size", defaultVal: "",
      options: [
        { value: "12px", label: "Small" },
        { value: "16px", label: "Normal" },
        { value: "24px", label: "Large" },
      ],
      onChange: handleFontSize,
    },
    { type: "sep" },
    { type: "btn", id: "ltr", icon: ArrowLeftToLine, title: "Left to Right", action: () => handleDirection("ltr") },
    { type: "btn", id: "rtl", icon: ArrowRightToLine, title: "Right to Left", action: () => handleDirection("rtl") },
  ];

  return (
    <>
      <div className="px-5 py-2 border-b border-border flex items-center gap-1 shrink-0 bg-surface-container-low/50">
        {tools.map((tool, i) => {
          if (tool.type === "sep") {
            return <div key={`sep-${i}`} className="w-px h-5 bg-outline-variant/50 mx-1.5" />;
          }
          if (tool.type === "select") {
            return (
              <select
                key={tool.id}
                defaultValue={tool.defaultVal}
                onChange={(e) => tool.onChange(e.target.value)}
                className="bg-transparent text-on-surface-variant text-xs font-semibold tracking-wide uppercase outline-none cursor-pointer px-1 py-1 rounded hover:bg-surface-container-high mx-1"
              >
                <option value="" disabled>Size</option>
                {tool.options.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            );
          }
          const Icon = tool.icon;
          return (
            <button
              key={tool.id}
              title={tool.title}
              onClick={tool.action}
              className="p-1.5 rounded hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-colors"
            >
              <Icon className="h-[18px] w-[18px]" />
            </button>
          );
        })}
      </div>
      {linkOpen && (
        <div className="px-5 py-2 border-b border-border flex items-center gap-2 bg-surface-container-high">
          <span className="text-xs font-semibold tracking-wide uppercase text-on-surface-variant">URL:</span>
          <input
            ref={linkInputRef}
            type="url"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleLinkSubmit();
              if (e.key === "Escape") handleLinkCancel();
            }}
            placeholder="https://..."
            className="flex-1 bg-surface-container border border-outline-variant/50 rounded px-2 py-1 text-sm text-on-surface outline-none focus:border-primary"
          />
          <button
            onClick={handleLinkSubmit}
            className="text-xs font-semibold tracking-wide uppercase bg-primary text-primary-foreground px-3 py-1 rounded hover:bg-primary/90 transition-colors"
          >
            OK
          </button>
          <button
            onClick={handleLinkCancel}
            className="text-xs font-semibold tracking-wide uppercase text-on-surface-variant hover:text-on-surface transition-colors"
          >
            Cancel
          </button>
        </div>
      )}
    </>
  );
}
