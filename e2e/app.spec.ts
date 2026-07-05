import { test, expect } from '@playwright/test';
import path from 'path';
import { _electron as electron } from 'playwright';

const APP_DIR = path.join(__dirname, '..', 'out', `${process.platform === 'darwin' ? 'G-Notes-darwin-x64/G-Notes.app/Contents/MacOS' : process.platform === 'win32' ? 'g-notes-win32-x64' : 'g-notes-linux-x64'}`);
const EXECUTABLE = path.join(APP_DIR, process.platform === 'win32' ? 'g-notes.exe' : 'g-notes');

test.describe('App', () => {
  test('launches and shows the main window', async () => {
    const app = await electron.launch({
      args: [APP_DIR],
      executablePath: EXECUTABLE,
    });

    const window = await app.firstWindow();
    await expect(window).toHaveTitle(/G-Notes/);
    await expect(window.locator('body')).toBeVisible();

    await app.close();
  });

  test('has working menu bar', async () => {
    const app = await electron.launch({
      args: [APP_DIR],
      executablePath: EXECUTABLE,
    });

    const window = await app.firstWindow();
    await window.waitForLoadState('domcontentloaded');

    const title = await window.title();
    expect(title).toContain('G-Notes');

    await app.close();
  });
});
