import { app, BrowserWindow, Menu, MenuItemConstructorOptions } from 'electron';
import { getDb, createNote, createCategory, closeDb, setPref, getPref } from './database';
import { registerIpcHandlers } from './ipc-handlers';
import { runMigrations } from './database-migrations';

declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

if (require('electron-squirrel-startup')) {
  app.quit();
}

async function migrateFromLocalStorage(mainWindow: BrowserWindow): Promise<void> {
  const db = getDb();
  const count = db.prepare("SELECT COUNT(*) as c FROM notes").get() as { c: number };
  if (count.c > 0) return;

  try {
    const notesJson = await mainWindow.webContents.executeJavaScript(
      `(() => { try { return localStorage.getItem('g-notes-storage'); } catch { return null; } })()`,
      true
    );
    if (notesJson) {
      const parsed = JSON.parse(notesJson);
      const notes = parsed?.state?.notes || [];
      for (const note of notes) {
        createNote({
          id: note.id,
          title: note.title || 'Untitled',
          content: note.content || '{}',
          tag: note.tag || 'General',
          created_at: note.createdAt || Date.now(),
          updated_at: note.updatedAt || Date.now(),
          deleted_at: null,
        });
        if (note.favorited) db.prepare("UPDATE notes SET favorited = 1 WHERE id = ?").run(note.id);
        if (note.pinned) db.prepare("UPDATE notes SET pinned = 1 WHERE id = ?").run(note.id);
      }
    }

    const catsJson = await mainWindow.webContents.executeJavaScript(
      `(() => { try { return localStorage.getItem('g-notes-categories'); } catch { return null; } })()`,
      true
    );
    if (catsJson) {
      const parsed = JSON.parse(catsJson);
      const cats = parsed?.state?.categories || [];
      for (const cat of cats) createCategory(cat.name, cat.createdAt || Date.now());
    }

    if (notesJson || catsJson) {
      await mainWindow.webContents.executeJavaScript(
        `localStorage.removeItem('g-notes-storage'); localStorage.removeItem('g-notes-categories');`,
        true
      );
    }
  } catch (err) { console.error("Failed to migrate from localStorage:", err); }
}

function buildMenu(): void {
  const isMac = process.platform === 'darwin';

  const template: MenuItemConstructorOptions[] = [
    ...(isMac ? [{
      label: app.name,
      submenu: [
        { role: 'about' as const, label: 'About G-Notes' },
        { type: 'separator' as const },
        { role: 'hide' as const },
        { role: 'hideOthers' as const },
        { role: 'unhide' as const },
        { type: 'separator' as const },
        { role: 'quit' as const },
      ],
    }] : []),
    {
      label: 'File',
      submenu: [
        {
          label: 'New Note',
          accelerator: 'CmdOrCtrl+N',
          click: () => BrowserWindow.getFocusedWindow()?.webContents.send('menu:new-note'),
        },
        { type: 'separator' },
        {
          label: 'Export as JSON...',
          click: () => BrowserWindow.getFocusedWindow()?.webContents.send('menu:export-notes'),
        },
        {
          label: 'Export as Markdown...',
          click: () => BrowserWindow.getFocusedWindow()?.webContents.send('menu:export-markdown'),
        },
        {
          label: 'Import Notes...',
          click: () => BrowserWindow.getFocusedWindow()?.webContents.send('menu:import-notes'),
        },
        { type: 'separator' },
        {
          label: 'Trash',
          accelerator: 'CmdOrCtrl+Shift+T',
          click: () => BrowserWindow.getFocusedWindow()?.webContents.send('menu:navigate', 'trash'),
        },
        { type: 'separator' },
        {
          label: 'Settings',
          accelerator: 'CmdOrCtrl+,',
          click: () => BrowserWindow.getFocusedWindow()?.webContents.send('menu:settings'),
        },
        ...(!isMac ? [{ type: 'separator' as const }, { role: 'quit' as const }] : []),
      ],
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectAll' },
      ],
    },
    {
      label: 'View',
      submenu: [
        {
          label: 'Dashboard',
          accelerator: 'CmdOrCtrl+1',
          click: () => BrowserWindow.getFocusedWindow()?.webContents.send('menu:navigate', 'dashboard'),
        },
        {
          label: 'Notes',
          accelerator: 'CmdOrCtrl+2',
          click: () => BrowserWindow.getFocusedWindow()?.webContents.send('menu:navigate', 'notes'),
        },
        {
          label: 'Favorites',
          accelerator: 'CmdOrCtrl+3',
          click: () => BrowserWindow.getFocusedWindow()?.webContents.send('menu:navigate', 'favorites'),
        },
        {
          label: 'Categories',
          accelerator: 'CmdOrCtrl+4',
          click: () => BrowserWindow.getFocusedWindow()?.webContents.send('menu:navigate', 'categories'),
        },
        { type: 'separator' },
        {
          label: 'Search',
          accelerator: 'CmdOrCtrl+Shift+F',
          click: () => BrowserWindow.getFocusedWindow()?.webContents.send('menu:search'),
        },
        { type: 'separator' },
        { role: 'reload' },
      ],
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'About G-Notes',
          click: () => BrowserWindow.getFocusedWindow()?.webContents.send('menu:about'),
        },
        { type: 'separator' },
        {
          label: 'Send Feedback',
          click: () => BrowserWindow.getFocusedWindow()?.webContents.send('menu:feedback'),
        },
        {
          label: 'What\'s New',
          click: () => BrowserWindow.getFocusedWindow()?.webContents.send('menu:changelog'),
        },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

const createWindow = (): void => {
  getDb();
  runMigrations();
  registerIpcHandlers();
  buildMenu();

  const mainWindow = new BrowserWindow({
    height: 800,
    width: 1200,
    minHeight: 500,
    minWidth: 800,
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  mainWindow.webContents.on('did-finish-load', () => {
    migrateFromLocalStorage(mainWindow);
  });
};

app.on('ready', () => {
  createWindow();

  if (app.isPackaged) {
    try {
      const { autoUpdater } = require('electron-updater'); // eslint-disable-line @typescript-eslint/no-var-requires
      autoUpdater.checkForUpdatesAndNotify().catch(() => {/* ignore */});
      setInterval(() => {
        autoUpdater.checkForUpdatesAndNotify().catch(() => {/* ignore */});
      }, 3600000);

      autoUpdater.on('update-downloaded', () => {
        const version = app.getVersion();
        const lastSeen = getPref('last_version');
        if (lastSeen !== version) {
          setPref('last_version', version);
        }
      });
    } catch (err) { console.error("Auto-updater error:", err); }
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

app.on('before-quit', () => {
  closeDb();
});
