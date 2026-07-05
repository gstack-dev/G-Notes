import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';
import { _electron as electron } from 'playwright';

function findAppDir(): string {
  const outDir = path.join(__dirname, '..', 'out');
  const entries = fs.readdirSync(outDir, { withFileTypes: true });
  const appDir = entries.find((e) => e.isDirectory() && e.name !== 'make');
  if (!appDir) throw new Error('No app directory found in out/. Run npm run package first.');
  return path.join(outDir, appDir.name);
}

test.describe('App', () => {
  test('launches and shows the main window', async () => {
    const appDir = findAppDir();
    const executable = path.join(appDir, process.platform === 'win32' ? 'g-notes.exe' : 'g-notes');

    const app = await electron.launch({ executablePath: executable, args: [] });
    const window = await app.firstWindow();

    await expect(window).toHaveTitle(/G-Notes/);
    await expect(window.locator('body')).toBeVisible();

    await app.close();
  });

  test('renders without console errors', async () => {
    const appDir = findAppDir();
    const executable = path.join(appDir, process.platform === 'win32' ? 'g-notes.exe' : 'g-notes');

    const app = await electron.launch({ executablePath: executable, args: [] });
    const window = await app.firstWindow();

    const errors: string[] = [];
    window.on('pageerror', (error) => errors.push(error.message));

    await window.waitForLoadState('domcontentloaded');
    await expect(window.locator('#root, .app, body')).toBeVisible();

    expect(errors).toEqual([]);
    await app.close();
  });
});
