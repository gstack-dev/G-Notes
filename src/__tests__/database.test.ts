import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import path from 'path';
import os from 'os';
import fs from 'fs';

let tmpDir: string;

vi.mock('electron', () => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'gnotes-test-'));
  return {
    app: {
      getPath: vi.fn(() => tmpDir),
      getName: () => 'G-Notes',
    },
  };
});

let dbModule: typeof import('../database');

beforeEach(async () => {
  vi.resetModules();
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'gnotes-test-'));
  fs.mkdirSync(tmpDir, { recursive: true });
  dbModule = await import('../database');
});

afterEach(() => {
  dbModule.closeDb();
  if (tmpDir && fs.existsSync(tmpDir)) fs.rmSync(tmpDir, { recursive: true });
});

const sampleNote: {
  id: string; title: string; content: string; tag: string;
  created_at: number; updated_at: number; deleted_at: null;
} = {
  id: 'note-1',
  title: 'Test Note',
  content: JSON.stringify({ blocks: [] }),
  tag: 'General',
  created_at: Date.now(),
  updated_at: Date.now(),
  deleted_at: null,
};

describe('Database - Notes CRUD', () => {
  it('creates and retrieves a note', () => {
    dbModule.createNote(sampleNote);
    const note = dbModule.getNote('note-1') as NonNullable<typeof sampleNote>;
    expect(note).toBeDefined();
    expect(note.title).toBe('Test Note');
    expect(note.tag).toBe('General');
  });

  it('returns empty array when no notes exist', () => {
    const notes = dbModule.getNotes();
    expect(notes).toEqual([]);
  });

  it('lists only non-deleted notes', () => {
    dbModule.createNote(sampleNote);
    dbModule.createNote({ ...sampleNote, id: 'note-2', title: 'Deleted Note' });
    dbModule.softDeleteNote('note-2');
    const notes = dbModule.getNotes();
    expect(notes).toHaveLength(1);
    expect(notes[0].id).toBe('note-1');
  });

  it('updates a note title', () => {
    dbModule.createNote(sampleNote);
    dbModule.updateNote('note-1', { title: 'Updated Title' });
    const note = dbModule.getNote('note-1') as NonNullable<typeof sampleNote>;
    expect(note.title).toBe('Updated Title');
  });

  it('soft deletes and restores a note', () => {
    dbModule.createNote(sampleNote);
    dbModule.softDeleteNote('note-1');
    expect((dbModule.getNote('note-1') as NonNullable<typeof sampleNote>).deleted_at).toBeGreaterThan(0);
    dbModule.restoreNote('note-1');
    expect((dbModule.getNote('note-1') as NonNullable<typeof sampleNote>).deleted_at).toBeNull();
  });

  it('permanently deletes a note', () => {
    dbModule.createNote(sampleNote);
    dbModule.permanentlyDeleteNote('note-1');
    expect(dbModule.getNote('note-1')).toBeUndefined();
  });

  it('retrieves trashed notes', () => {
    dbModule.createNote(sampleNote);
    dbModule.softDeleteNote('note-1');
    const trashed = dbModule.getTrashedNotes();
    expect(trashed).toHaveLength(1);
    expect(trashed[0].id).toBe('note-1');
  });

  it('toggles favorited and pinned', () => {
    dbModule.createNote(sampleNote);
    dbModule.updateNote('note-1', { favorited: 1 });
    expect((dbModule.getNote('note-1') as NonNullable<typeof sampleNote>).favorited).toBe(1);
    dbModule.updateNote('note-1', { pinned: 1 });
    expect((dbModule.getNote('note-1') as NonNullable<typeof sampleNote>).pinned).toBe(1);
  });

  it('deletes notes by tag', () => {
    dbModule.createNote(sampleNote);
    dbModule.createNote({ ...sampleNote, id: 'note-2', tag: 'Work' });
    dbModule.deleteNotesByTag('Work');
    const notes = dbModule.getNotes();
    expect(notes).toHaveLength(1);
    expect(notes[0].tag).toBe('General');
  });

  it('cleans expired trash', () => {
    dbModule.createNote(sampleNote);
    dbModule.softDeleteNote('note-1');
    dbModule.getDb().prepare("UPDATE notes SET deleted_at = ? WHERE id = ?").run(1, 'note-1');
    const cleaned = dbModule.cleanExpiredTrash();
    expect(cleaned).toBe(1);
  });
});

describe('Database - Categories', () => {
  it('creates and lists categories', () => {
    dbModule.createCategory('Work', Date.now());
    dbModule.createCategory('Personal', Date.now());
    const cats = dbModule.getCategories();
    expect(cats).toHaveLength(2);
    expect(cats[0].name).toBe('Work');
    expect(cats[1].name).toBe('Personal');
  });

  it('does not duplicate categories', () => {
    dbModule.createCategory('Work', Date.now());
    dbModule.createCategory('Work', Date.now());
    expect(dbModule.getCategories()).toHaveLength(1);
  });

  it('deletes a category', () => {
    dbModule.createCategory('Work', Date.now());
    dbModule.deleteCategory('Work');
    expect(dbModule.getCategories()).toHaveLength(0);
  });
});

describe('Database - Prefs', () => {
  it('sets and gets a preference', () => {
    dbModule.setPref('theme', 'dark');
    expect(dbModule.getPref('theme')).toBe('dark');
  });

  it('returns null for missing key', () => {
    expect(dbModule.getPref('nonexistent')).toBeNull();
  });

  it('replaces existing value', () => {
    dbModule.setPref('theme', 'light');
    dbModule.setPref('theme', 'dark');
    expect(dbModule.getPref('theme')).toBe('dark');
  });
});

describe('Database - Recent Searches', () => {
  it('starts empty', () => {
    expect(dbModule.getRecentSearches()).toEqual([]);
  });

  it('adds and retrieves recent searches', () => {
    dbModule.addRecentSearch('design');
    dbModule.addRecentSearch('react');
    const searches = dbModule.getRecentSearches();
    expect(searches).toHaveLength(2);
    expect(searches[0]).toBe('react');
  });

  it('deduplicates searches', () => {
    dbModule.addRecentSearch('design');
    dbModule.addRecentSearch('design');
    expect(dbModule.getRecentSearches()).toHaveLength(1);
  });

  it('clears recent searches', () => {
    dbModule.addRecentSearch('design');
    dbModule.clearRecentSearches();
    expect(dbModule.getRecentSearches()).toEqual([]);
  });

  it('respects limit', () => {
    for (let i = 0; i < 20; i++) dbModule.addRecentSearch(`search-${i}`);
    expect(dbModule.getRecentSearches(5)).toHaveLength(5);
  });
});

describe('Database - Images', () => {
  it('creates and returns images directory', () => {
    const dir = dbModule.getImagesDir();
    expect(fs.existsSync(dir)).toBe(true);
    expect(dir).toContain('images');
  });
});
