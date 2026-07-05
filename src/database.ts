import { app } from "electron";
import path from "path";
import fs from "fs";
import initSqlJs, { Database as SqlJsDatabase, SqlJsStatic, SqlValue } from "sql.js";

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

let SQL: SqlJsStatic | null = null;
let db: SqlJsDatabase | null = null;
let dbPath: string = "";

export async function initDb(customPath?: string): Promise<void> {
  SQL = await initSqlJs();
  if (customPath) {
    dbPath = customPath;
  } else {
    dbPath = path.join(app.getPath("userData"), "g-notes.db");
  }
  const dbDir = path.dirname(dbPath);
  if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });
  if (fs.existsSync(dbPath)) {
    const buffer = fs.readFileSync(dbPath);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }
  db.run("PRAGMA journal_mode = MEMORY");
  db.run("PRAGMA busy_timeout = 5000");
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
  saveDb();
}

function saveDb(): void {
  if (!db || !dbPath) return;
  const data = db.export();
  fs.writeFileSync(dbPath, Buffer.from(data));
}

export function getDb(): DbWrapper {
  if (!db) throw new Error("Database not initialized. Call initDb() first.");
  return new DbWrapper(db);
}

export function closeDb(): void {
  if (db) {
    saveDb();
    db.close();
    db = null;
  }
}

class DbWrapper {
  private _db: SqlJsDatabase;

  constructor(_db: SqlJsDatabase) {
    this._db = _db;
  }

  prepare(sql: string): PreparedStatement {
    return new PreparedStatement(this._db, sql);
  }

  exec(sql: string): void {
    this._db.exec(sql);
    saveDb();
  }

  export(): Buffer {
    return Buffer.from(this._db.export());
  }
}

class PreparedStatement {
  private _db: SqlJsDatabase;
  private _sql: string;

  constructor(_db: SqlJsDatabase, sql: string) {
    this._db = _db;
    this._sql = sql;
  }

  all(...params: SqlValue[]): Record<string, SqlValue>[] {
    const stmt = this._db.prepare(this._sql);
    if (params.length > 0) stmt.bind(params);
    const rows: Record<string, SqlValue>[] = [];
    while (stmt.step()) {
      rows.push(stmt.getAsObject());
    }
    stmt.free();
    return rows;
  }

  get(...params: SqlValue[]): Record<string, SqlValue> | undefined {
    const stmt = this._db.prepare(this._sql);
    if (params.length > 0) stmt.bind(params);
    const row = stmt.step() ? stmt.getAsObject() : undefined;
    stmt.free();
    return row;
  }

  run(...params: SqlValue[]): { changes: number } {
    if (params.length > 0) {
      const stmt = this._db.prepare(this._sql);
      stmt.bind(params);
      stmt.run();
      stmt.free();
    } else {
      this._db.run(this._sql);
    }
    const changes = this._db.getRowsModified();
    saveDb();
    return { changes };
  }
}

export function getNotes(): NoteRow[] {
  return getDb().prepare("SELECT * FROM notes WHERE deleted_at IS NULL ORDER BY pinned DESC, updated_at DESC").all() as unknown as NoteRow[];
}

export function getAllNotes(): NoteRow[] {
  return getDb().prepare("SELECT * FROM notes ORDER BY updated_at DESC").all() as unknown as NoteRow[];
}

export function getNote(id: string): NoteRow | undefined {
  return getDb().prepare("SELECT * FROM notes WHERE id = ?").get(id) as unknown as NoteRow | undefined;
}

export function createNote(note: Omit<NoteRow, "favorited" | "pinned">): void {
  getDb().prepare(
    "INSERT INTO notes (id, title, content, tag, created_at, updated_at, favorited, pinned, deleted_at) VALUES (?, ?, ?, ?, ?, ?, 0, 0, NULL)"
  ).run(note.id, note.title, note.content, note.tag, note.created_at, note.updated_at);
}

export function updateNote(id: string, data: Partial<Pick<NoteRow, "title" | "content" | "tag" | "favorited" | "pinned">> & { deleted_at?: number | null }): void {
  const fields: string[] = [];
  const values: (string | number | null)[] = [];
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
  return getDb().prepare("SELECT * FROM notes WHERE deleted_at IS NOT NULL ORDER BY deleted_at DESC").all() as unknown as NoteRow[];
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
  return getDb().prepare("SELECT * FROM categories ORDER BY created_at ASC").all() as unknown as CategoryRow[];
}

export function createCategory(name: string, createdAt: number): void {
  getDb().prepare("INSERT OR IGNORE INTO categories (name, created_at) VALUES (?, ?)").run(name, createdAt);
}

export function deleteCategory(name: string): void {
  getDb().prepare("DELETE FROM categories WHERE name = ?").run(name);
}

export function getPref(key: string): string | null {
  const row = getDb().prepare("SELECT value FROM prefs WHERE key = ?").get(key) as unknown as { value: string } | undefined;
  return row?.value ?? null;
}

export function setPref(key: string, value: string): void {
  getDb().prepare("INSERT OR REPLACE INTO prefs (key, value) VALUES (?, ?)").run(key, value);
}
