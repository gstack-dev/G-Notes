import Database from "better-sqlite3";
import { app } from "electron";
import path from "path";
import fs from "fs";

const TRASH_DAYS = 30;

export interface NoteRow {
  id: string;
  title: string;
  content: string;
  tag: string;
  created_at: number;
  updated_at: number;
  favorited: number;
  pinned: number;
  deleted_at: number | null;
}

export interface CategoryRow {
  name: string;
  created_at: number;
}

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (db) return db;
  const dbDir = app.getPath("userData");
  if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });
  const dbPath = path.join(dbDir, "g-notes.db");
  db = new Database(dbPath);
  db.pragma("journal_mode = WAL");
  initializeSchema();
  return db;
}

function initializeSchema(): void {
  if (!db) return;
  db.exec(`
    CREATE TABLE IF NOT EXISTS notes (
      id         TEXT PRIMARY KEY,
      title      TEXT NOT NULL DEFAULT 'Untitled',
      content    TEXT NOT NULL DEFAULT '{}',
      tag        TEXT NOT NULL DEFAULT 'General',
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      favorited  INTEGER NOT NULL DEFAULT 0,
      pinned     INTEGER NOT NULL DEFAULT 0,
      deleted_at INTEGER
    );

    CREATE TABLE IF NOT EXISTS categories (
      name       TEXT PRIMARY KEY,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS prefs (
      key   TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);
}

export function closeDb(): void {
  if (db) {
    db.close();
    db = null;
  }
}

export function getNotes(): NoteRow[] {
  return (getDb().prepare("SELECT * FROM notes WHERE deleted_at IS NULL ORDER BY pinned DESC, updated_at DESC").all() as NoteRow[]);
}

export function getAllNotes(): NoteRow[] {
  return (getDb().prepare("SELECT * FROM notes ORDER BY updated_at DESC").all() as NoteRow[]);
}

export function getNote(id: string): NoteRow | undefined {
  return getDb().prepare("SELECT * FROM notes WHERE id = ?").get(id) as NoteRow | undefined;
}

export function createNote(note: Omit<NoteRow, "favorited" | "pinned">): void {
  getDb().prepare(
    "INSERT INTO notes (id, title, content, tag, created_at, updated_at, favorited, pinned, deleted_at) VALUES (?, ?, ?, ?, ?, ?, 0, 0, NULL)"
  ).run(note.id, note.title, note.content, note.tag, note.created_at, note.updated_at);
}

export function updateNote(id: string, data: Partial<Pick<NoteRow, "title" | "content" | "tag" | "favorited" | "pinned">> & { deleted_at?: number | null }): void {
  const fields: string[] = [];
  const values: (string | number | boolean | null)[] = [];
  if (data.title !== undefined) { fields.push("title = ?"); values.push(data.title); }
  if (data.content !== undefined) { fields.push("content = ?"); values.push(data.content); }
  if (data.tag !== undefined) { fields.push("tag = ?"); values.push(data.tag); }
  if (data.favorited !== undefined) { fields.push("favorited = ?"); values.push(data.favorited); }
  if (data.pinned !== undefined) { fields.push("pinned = ?"); values.push(data.pinned); }
  if (data.deleted_at !== undefined) { fields.push("deleted_at = ?"); values.push(data.deleted_at); }
  if (fields.length === 0) return;
  fields.push("updated_at = ?");
  values.push(Date.now());
  values.push(id);
  getDb().prepare(`UPDATE notes SET ${fields.join(", ")} WHERE id = ?`).run(...values);
}

export function softDeleteNote(id: string): void {
  getDb().prepare("UPDATE notes SET deleted_at = ?, updated_at = ? WHERE id = ?").run(Date.now(), Date.now(), id);
}

export function restoreNote(id: string): void {
  getDb().prepare("UPDATE notes SET deleted_at = NULL, updated_at = ? WHERE id = ?").run(Date.now(), id);
}

export function permanentlyDeleteNote(id: string): void {
  getDb().prepare("DELETE FROM notes WHERE id = ?").run(id);
}

export function getTrashedNotes(): NoteRow[] {
  return (getDb().prepare("SELECT * FROM notes WHERE deleted_at IS NOT NULL ORDER BY deleted_at DESC").all() as NoteRow[]);
}

export function cleanExpiredTrash(): number {
  const cutoff = Date.now() - TRASH_DAYS * 24 * 60 * 60 * 1000;
  const result = getDb().prepare("DELETE FROM notes WHERE deleted_at IS NOT NULL AND deleted_at < ?").run(cutoff);
  return result.changes;
}

export function deleteNotesByTag(tag: string): void {
  getDb().prepare("UPDATE notes SET deleted_at = ?, updated_at = ? WHERE tag = ? AND deleted_at IS NULL").run(Date.now(), Date.now(), tag);
}

export function getImagesDir(): string {
  const imgDir = path.join(app.getPath("userData"), "images");
  if (!fs.existsSync(imgDir)) fs.mkdirSync(imgDir, { recursive: true });
  return imgDir;
}

export function getRecentSearches(limit = 10): string[] {
  const raw = getPref("recent_searches");
  if (!raw) return [];
  try {
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr.slice(0, limit) : [];
  } catch { return []; }
}

export function addRecentSearch(query: string): void {
  const searches = getRecentSearches(50);
  const filtered = searches.filter((s) => s !== query);
  filtered.unshift(query);
  setPref("recent_searches", JSON.stringify(filtered.slice(0, 50)));
}

export function clearRecentSearches(): void {
  setPref("recent_searches", JSON.stringify([]));
}

export function getCategories(): CategoryRow[] {
  return getDb().prepare("SELECT * FROM categories ORDER BY created_at ASC").all() as CategoryRow[];
}

export function createCategory(name: string, createdAt: number): void {
  getDb().prepare("INSERT OR IGNORE INTO categories (name, created_at) VALUES (?, ?)").run(name, createdAt);
}

export function deleteCategory(name: string): void {
  getDb().prepare("DELETE FROM categories WHERE name = ?").run(name);
}

export function getPref(key: string): string | null {
  const row = getDb().prepare("SELECT value FROM prefs WHERE key = ?").get(key) as { value: string } | undefined;
  return row?.value ?? null;
}

export function setPref(key: string, value: string): void {
  getDb().prepare("INSERT OR REPLACE INTO prefs (key, value) VALUES (?, ?)").run(key, value);
}
