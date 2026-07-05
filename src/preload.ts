const { contextBridge, ipcRenderer } = require("electron"); // eslint-disable-line @typescript-eslint/no-var-requires

contextBridge.exposeInMainWorld("electronAPI", {
  openExternal: (url: string) => ipcRenderer.invoke("shell:open-external", url),

  on: (channel: string, callback: (...args: any[]) => void) => {
    const validChannels = ["menu:new-note", "menu:export-notes", "menu:import-notes", "menu:settings", "menu:about", "menu:search", "menu:navigate", "menu:trash", "menu:export-markdown"];
    if (validChannels.includes(channel)) {
      ipcRenderer.on(channel, (_event: any, ...args: any[]) => callback(...args));
    }
  },

  removeListener: (channel: string, callback: (...args: any[]) => void) => {
    ipcRenderer.removeListener(channel, callback);
  },

  notes: {
    list: () => ipcRenderer.invoke("notes:list"),
    get: (id: string) => ipcRenderer.invoke("notes:get", id),
    create: (data: { id: string; title: string; content: string; tag: string; createdAt: number }) =>
      ipcRenderer.invoke("notes:create", data),
    update: (id: string, data: Record<string, any>) =>
      ipcRenderer.invoke("notes:update", id, data),
    delete: (id: string) => ipcRenderer.invoke("notes:delete", id),
    permanentlyDelete: (id: string) => ipcRenderer.invoke("notes:permanently-delete", id),
    restore: (id: string) => ipcRenderer.invoke("notes:restore", id),
    trash: () => ipcRenderer.invoke("notes:trash"),
    emptyTrash: () => ipcRenderer.invoke("notes:empty-trash"),
    deleteByTag: (tag: string) => ipcRenderer.invoke("notes:delete-by-tag", tag),
    toggleFavorite: (id: string) => ipcRenderer.invoke("notes:toggle-favorite", id),
    togglePin: (id: string) => ipcRenderer.invoke("notes:toggle-pin", id),
    search: (query: string) => ipcRenderer.invoke("notes:search", query),
    recentSearches: () => ipcRenderer.invoke("notes:recent-searches"),
    clearRecentSearches: () => ipcRenderer.invoke("notes:clear-recent-searches"),
  },

  categories: {
    list: () => ipcRenderer.invoke("categories:list"),
    create: (name: string, createdAt: number) =>
      ipcRenderer.invoke("categories:create", name, createdAt),
    delete: (name: string) => ipcRenderer.invoke("categories:delete", name),
  },

  exportNotes: () => ipcRenderer.invoke("app:export-notes"),
  exportMarkdown: () => ipcRenderer.invoke("app:export-markdown"),
  importNotes: () => ipcRenderer.invoke("app:import-notes"),
  backupDb: () => ipcRenderer.invoke("app:backup-db"),
  saveImage: (dataUrl: string) => ipcRenderer.invoke("app:save-image", dataUrl),
  getImagePath: (name: string) => ipcRenderer.invoke("app:get-image-path", name),
  getVersion: () => ipcRenderer.invoke("app:get-version"),
  openFeedback: () => ipcRenderer.invoke("app:open-feedback"),
  cleanExpiredTrash: () => ipcRenderer.invoke("app:clean-expired-trash"),

  prefs: {
    get: (key: string) => ipcRenderer.invoke("prefs:get", key),
    set: (key: string, value: string) => ipcRenderer.invoke("prefs:set", key, value),
  },
});
