interface NoteAPI {
  id: string;
  title: string;
  content: string;
  tag: string;
  createdAt: number;
  updatedAt: number;
  favorited: boolean;
  pinned: boolean;
}

interface SearchResult {
  id: string;
  title: string;
  snippet: string;
}

interface ElectronAPI {
  openExternal: (url: string) => Promise<void>;
  on: (channel: string, callback: (...args: unknown[]) => void) => void;
  removeListener: (channel: string, callback: (...args: unknown[]) => void) => void;
  notes: {
    list: () => Promise<NoteAPI[]>;
    get: (id: string) => Promise<NoteAPI | null>;
    create: (data: { id: string; title: string; content: string; tag: string; createdAt: number }) => Promise<NoteAPI>;
    update: (id: string, data: Record<string, unknown>) => Promise<void>;
    delete: (id: string) => Promise<void>;
    permanentlyDelete: (id: string) => Promise<void>;
    restore: (id: string) => Promise<void>;
    trash: () => Promise<NoteAPI[]>;
    emptyTrash: () => Promise<void>;
    deleteByTag: (tag: string) => Promise<void>;
    toggleFavorite: (id: string) => Promise<void>;
    togglePin: (id: string) => Promise<void>;
    search: (query: string) => Promise<SearchResult[]>;
    recentSearches: () => Promise<string[]>;
    clearRecentSearches: () => Promise<void>;
  };
  categories: {
    list: () => Promise<{ name: string; createdAt: number }[]>;
    create: (name: string, createdAt: number) => Promise<void>;
    delete: (name: string) => Promise<void>;
  };
  exportNotes: () => Promise<void>;
  exportMarkdown: () => Promise<void>;
  importNotes: () => Promise<void>;
  backupDb: () => Promise<string>;
  saveImage: (dataUrl: string) => Promise<string>;
  getImagePath: (name: string) => Promise<string>;
  getVersion: () => Promise<string>;
  getChangelog: () => Promise<string>;
  cleanExpiredTrash: () => Promise<number>;

  prefs: {
    get: (key: string) => Promise<string | null>;
    set: (key: string, value: string) => Promise<void>;
  };
}

interface Window {
  electronAPI: ElectronAPI;
}
