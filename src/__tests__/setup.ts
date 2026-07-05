import { vi, beforeAll } from 'vitest';

beforeAll(() => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (globalThis as any).window = {
    electronAPI: {
      openExternal: vi.fn(),
      on: vi.fn(),
      removeListener: vi.fn(),
      notes: {
        list: vi.fn().mockResolvedValue([]),
        get: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
        permanentlyDelete: vi.fn(),
        restore: vi.fn(),
        trash: vi.fn(),
        emptyTrash: vi.fn(),
        deleteByTag: vi.fn(),
        toggleFavorite: vi.fn(),
        togglePin: vi.fn(),
        search: vi.fn(),
        recentSearches: vi.fn(),
        clearRecentSearches: vi.fn(),
      },
      categories: {
        list: vi.fn().mockResolvedValue([]),
        create: vi.fn(),
        delete: vi.fn(),
      },
      exportNotes: vi.fn(),
      exportMarkdown: vi.fn(),
      importNotes: vi.fn(),
      backupDb: vi.fn(),
      saveImage: vi.fn(),
      getImagePath: vi.fn(),
      getVersion: vi.fn(),
      openFeedback: vi.fn(),
      cleanExpiredTrash: vi.fn(),
      prefs: {
        get: vi.fn(),
        set: vi.fn(),
      },
    },
  };
});
