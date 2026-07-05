import { ipcMain, shell, dialog, BrowserWindow, app } from "electron";
import fs from "fs";
import path from "path";
import {
  getNotes,
  getNote,
  createNote,
  updateNote,
  softDeleteNote,
  restoreNote,
  permanentlyDeleteNote,
  getTrashedNotes,
  cleanExpiredTrash,
  deleteNotesByTag,
  getCategories,
  createCategory,
  deleteCategory,
  getPref,
  setPref,
  getDb,
  getImagesDir,
  getRecentSearches,
  addRecentSearch,
  clearRecentSearches,
  NoteRow,
} from "./database";
import { fullTextSearch } from "./database-migrations";

export function registerIpcHandlers(): void {
  ipcMain.handle("notes:list", () => {
    const rows = getNotes();
    return rows.map(normalizeNote);
  });

  ipcMain.handle("notes:get", (_, id: string) => {
    const row = getNote(id);
    return row ? normalizeNote(row) : null;
  });

  ipcMain.handle("notes:create", (_, data: { id: string; title: string; content: string; tag: string; createdAt: number }) => {
    createNote({
      id: data.id,
      title: data.title,
      content: data.content,
      tag: data.tag,
      created_at: data.createdAt,
      updated_at: data.createdAt,
      deleted_at: null,
    });
    return { ...data, favorited: false, pinned: false, updatedAt: data.createdAt };
  });

  ipcMain.handle("notes:update", (_, id: string, data: Record<string, unknown>) => {
    const dbData: Record<string, unknown> = {};
    if (data.title !== undefined) dbData.title = data.title;
    if (data.content !== undefined) dbData.content = data.content;
    if (data.tag !== undefined) dbData.tag = data.tag;
    if (data.favorited !== undefined) dbData.favorited = data.favorited ? 1 : 0;
    if (data.pinned !== undefined) dbData.pinned = data.pinned ? 1 : 0;
    updateNote(id, dbData);
  });

  ipcMain.handle("notes:delete", (_, id: string) => softDeleteNote(id));

  ipcMain.handle("notes:permanently-delete", (_, id: string) => permanentlyDeleteNote(id));

  ipcMain.handle("notes:restore", (_, id: string) => restoreNote(id));

  ipcMain.handle("notes:trash", () => {
    const rows = getTrashedNotes();
    return rows.map(normalizeNote);
  });

  ipcMain.handle("notes:empty-trash", () => {
    const rows = getTrashedNotes();
    for (const r of rows) permanentlyDeleteNote(r.id);
  });

  ipcMain.handle("notes:delete-by-tag", (_, tag: string) => deleteNotesByTag(tag));

  ipcMain.handle("notes:toggle-favorite", (_, id: string) => {
    const note = getNote(id);
    if (note) updateNote(id, { favorited: note.favorited ? 0 : 1 });
  });

  ipcMain.handle("notes:toggle-pin", (_, id: string) => {
    const note = getNote(id);
    if (note) updateNote(id, { pinned: note.pinned ? 0 : 1 });
  });

  ipcMain.handle("notes:search", (_, query: string) => {
    addRecentSearch(query);
    return fullTextSearch(query);
  });

  ipcMain.handle("notes:recent-searches", () => getRecentSearches());

  ipcMain.handle("notes:clear-recent-searches", () => clearRecentSearches());

  ipcMain.handle("categories:list", () => {
    return getCategories().map((r) => ({ name: r.name, createdAt: r.created_at }));
  });

  ipcMain.handle("categories:create", (_, name: string, createdAt: number) => createCategory(name, createdAt));

  ipcMain.handle("categories:delete", (_, name: string) => deleteCategory(name));

  ipcMain.handle("shell:open-external", (_, url: string) => shell.openExternal(url));

  ipcMain.handle("prefs:get", (_, key: string) => getPref(key));

  ipcMain.handle("prefs:set", (_, key: string, value: string) => { setPref(key, value); });

  ipcMain.handle("app:export-notes", async () => {
    const win = BrowserWindow.getFocusedWindow();
    if (!win) return;
    const result = await dialog.showSaveDialog(win, {
      title: "Export Notes",
      defaultPath: `g-notes-export-${Date.now()}.json`,
      filters: [{ name: "JSON", extensions: ["json"] }],
    });
    if (result.canceled || !result.filePath) throw new Error("Canceled");
    const notes = getNotes().map(normalizeNote);
    const categories = getCategories().map((r) => ({ name: r.name, createdAt: r.created_at }));
    const data = JSON.stringify({ version: 1, exportedAt: Date.now(), notes, categories }, null, 2);
    fs.writeFileSync(result.filePath, data, "utf-8");
  });

  ipcMain.handle("app:export-markdown", async () => {
    const win = BrowserWindow.getFocusedWindow();
    if (!win) return;
    const result = await dialog.showSaveDialog(win, {
      title: "Export Notes as Markdown",
      defaultPath: `g-notes-export-${Date.now()}.md`,
      filters: [{ name: "Markdown", extensions: ["md"] }],
    });
    if (result.canceled || !result.filePath) throw new Error("Canceled");
    const TurndownService = require("turndown"); // eslint-disable-line @typescript-eslint/no-var-requires
    const turndown = new TurndownService();
    const notes = getNotes().map(normalizeNote);
    const lines: string[] = [];
    for (const n of notes) {
      lines.push(`# ${n.title}\n`);
      lines.push(`> Tag: ${n.tag} | Updated: ${new Date(n.updatedAt).toISOString()}\n`);
      try {
        const parsed = JSON.parse(n.content);
        if (parsed?.blocks) {
          for (const block of parsed.blocks) {
            if (block.data?.text) {
              const html = block.data.text;
              const md = turndown.turndown(html);
              lines.push(md);
            }
            if (block.data?.items) {
              for (const item of block.data.items) {
                if (item.content) {
                  const md = turndown.turndown(item.content);
                  lines.push(block.data.style === "ordered" ? `1. ${md}` : `- ${md}`);
                }
              }
            }
          }
        }
      } catch (err) { console.error("Failed to export block:", err); }
      lines.push("\n---\n");
    }
    fs.writeFileSync(result.filePath, lines.join("\n"), "utf-8");
  });

  ipcMain.handle("app:import-notes", async () => {
    const win = BrowserWindow.getFocusedWindow();
    if (!win) return;
    const result = await dialog.showOpenDialog(win, {
      title: "Import Notes",
      filters: [{ name: "JSON", extensions: ["json"] }],
      properties: ["openFile"],
    });
    if (result.canceled || !result.filePaths?.[0]) throw new Error("Canceled");
    const raw = fs.readFileSync(result.filePaths[0], "utf-8");
    const data = JSON.parse(raw);
    if (data.notes) {
      for (const n of data.notes) {
        try { createNote({ id: n.id, title: n.title || "Untitled", content: n.content || "{}", tag: n.tag || "General", created_at: n.createdAt || Date.now(), updated_at: n.updatedAt || Date.now(), deleted_at: null }); } catch (err) { console.error("Failed to import note:", err); }
      }
    }
    if (data.categories) {
      for (const c of data.categories) {
        try { createCategory(c.name, c.createdAt || Date.now()); } catch (err) { console.error("Failed to import category:", err); }
      }
    }
  });

  ipcMain.handle("app:backup-db", async () => {
    const backupDir = path.join(app.getPath("userData"), "backups");
    if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const backupPath = path.join(backupDir, `g-notes-backup-${timestamp}.db`);
    const db = getDb();
    db.exec(`VACUUM INTO '${backupPath.replace(/'/g, "''")}'`);
    return backupPath;
  });

  ipcMain.handle("app:save-image", async (_, dataUrl: string) => {
    const matches = dataUrl.match(/^data:image\/(png|jpeg|jpg|gif|webp);base64,(.+)$/);
    if (!matches) throw new Error("Invalid image data");
    const ext = matches[1] === "jpeg" ? "jpg" : matches[1];
    const buffer = Buffer.from(matches[2], "base64");
    const name = `img-${Date.now()}.${ext}`;
    const imgPath = path.join(getImagesDir(), name);
    fs.writeFileSync(imgPath, buffer);
    return name;
  });

  ipcMain.handle("app:get-image-path", (_, name: string) => {
    const imgPath = path.join(getImagesDir(), name);
    if (!fs.existsSync(imgPath)) throw new Error("Image not found");
    return imgPath;
  });

  ipcMain.handle("app:get-version", () => app.getVersion());

  ipcMain.handle("app:open-feedback", () => {
    shell.openExternal("https://github.com/gstack-dev/G-Notes/issues/new?template=bug-report.yml");
  });

  ipcMain.handle("app:clean-expired-trash", () => {
    return cleanExpiredTrash();
  });
}

function normalizeNote(row: NoteRow) {
  return {
    id: row.id,
    title: row.title,
    content: row.content,
    tag: row.tag,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    favorited: row.favorited === 1,
    pinned: row.pinned === 1,
  };
}
