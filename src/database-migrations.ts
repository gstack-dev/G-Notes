import { getDb } from "./database";

const SCHEMA_VERSION_TABLE = "_schema_version";

function ensureVersionTable(): void {
  const db = getDb();
  db.exec(`
    CREATE TABLE IF NOT EXISTS ${SCHEMA_VERSION_TABLE} (
      version INTEGER PRIMARY KEY,
      applied_at INTEGER NOT NULL
    )
  `);
}

export function getSchemaVersion(): number {
  ensureVersionTable();
  const row = getDb().prepare(`SELECT MAX(version) as v FROM ${SCHEMA_VERSION_TABLE}`).get() as { v: number | null } | undefined;
  return row?.v ?? 0;
}

function applyMigration(version: number, sql: string, post?: () => void): void {
  const db = getDb();
  try {
    db.exec(sql);
  } catch (e) {
    if (e instanceof Error && e.message.includes('duplicate column name')) {
      // Column already exists (e.g. fresh DB created by initDb()), still record version
      db.prepare(`INSERT OR IGNORE INTO ${SCHEMA_VERSION_TABLE} (version, applied_at) VALUES (?, ?)`).run(version, Date.now());
      return;
    }
    throw e;
  }
  db.prepare(`INSERT OR IGNORE INTO ${SCHEMA_VERSION_TABLE} (version, applied_at) VALUES (?, ?)`).run(version, Date.now());
  if (post) post();
}

const MIGRATIONS: { version: number; description: string; sql: string; post?: () => void }[] = [
  {
    version: 1,
    description: "Initial schema",
    sql: `
      CREATE TABLE IF NOT EXISTS notes (
        id         TEXT PRIMARY KEY,
        title      TEXT NOT NULL DEFAULT 'Untitled',
        content    TEXT NOT NULL DEFAULT '{}',
        tag        TEXT NOT NULL DEFAULT 'General',
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        favorited  INTEGER NOT NULL DEFAULT 0,
        pinned     INTEGER NOT NULL DEFAULT 0
      );
      CREATE TABLE IF NOT EXISTS categories (
        name       TEXT PRIMARY KEY,
        created_at INTEGER NOT NULL
      );
    `,
  },
  {
    version: 2,
    description: "Add FTS5 full-text search index",
    sql: `
      CREATE VIRTUAL TABLE IF NOT EXISTS notes_fts USING fts5(
        title, content, tag,
        content='notes',
        content_rowid='rowid'
      );
      CREATE TRIGGER IF NOT EXISTS notes_ai AFTER INSERT ON notes BEGIN
        INSERT INTO notes_fts(rowid, title, content, tag) VALUES (new.rowid, new.title, new.content, new.tag);
      END;
      CREATE TRIGGER IF NOT EXISTS notes_ad AFTER DELETE ON notes BEGIN
        INSERT INTO notes_fts(notes_fts, rowid, title, content, tag) VALUES('delete', old.rowid, old.title, old.content, old.tag);
      END;
      CREATE TRIGGER IF NOT EXISTS notes_au AFTER UPDATE ON notes BEGIN
        INSERT INTO notes_fts(notes_fts, rowid, title, content, tag) VALUES('delete', old.rowid, old.title, old.content, old.tag);
        INSERT INTO notes_fts(rowid, title, content, tag) VALUES (new.rowid, new.title, new.content, new.tag);
      END;
    `,
    post: () => { getDb().exec("INSERT INTO notes_fts(notes_fts) VALUES('rebuild')"); },
  },
  {
    version: 3,
    description: "Add deleted_at column for soft delete",
    sql: `
      ALTER TABLE notes ADD COLUMN deleted_at INTEGER;
    `,
  },
];

export function runMigrations(): void {
  ensureVersionTable();
  const currentVersion = getSchemaVersion();
  for (const m of MIGRATIONS) {
    if (m.version > currentVersion) {
      applyMigration(m.version, m.sql, m.post);
    }
  }
}

export function fullTextSearch(query: string): { id: string; title: string; snippet: string }[] {
  if (!query.trim()) return [];
  const db = getDb();
  const rows = db.prepare(`
    SELECT n.id, n.title, snippet(notes_fts, 1, '<mark>', '</mark>', '...', 40) as snippet
    FROM notes_fts
    JOIN notes n ON n.rowid = notes_fts.rowid
    WHERE notes_fts MATCH ?
    ORDER BY rank
    LIMIT 50
  `).all(query) as { id: string; title: string; snippet: string }[];
  return rows;
}

export function rebuildFtsIndex(): void {
  getDb().exec("INSERT INTO notes_fts(notes_fts) VALUES('rebuild')");
}
