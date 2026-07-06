import { test, expect, type Page } from '@playwright/test';
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

async function findAppWindow(electronApp: electron.ElectronApplication): Promise<Page> {
  const existing = electronApp.windows();
  for (const w of existing) {
    const title = await w.title().catch(() => '');
    if (title.includes('G-Notes')) return w;
  }
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('Timed out waiting for G-Notes window')), 15000);
    const handler = async (w: Page) => {
      const title = await w.title().catch(() => '');
      if (title.includes('G-Notes')) {
        clearTimeout(timeout);
        resolve(w);
      }
    };
    electronApp.on('window', handler);
    for (const w of electronApp.windows()) {
      w.title().then(title => {
        if (title.includes('G-Notes')) {
          clearTimeout(timeout);
          resolve(w);
        }
      }).catch(() => {});
    }
  });
}

test.describe('App', () => {
  test('launches and shows the main window', async () => {
    test.setTimeout(60_000);

    const appDir = findAppDir();
    const electronBin = path.join(__dirname, '..', 'node_modules', 'electron', 'dist', 'electron');
    const appAsar = path.join(appDir, 'resources', 'app.asar');

    const app = await electron.launch({
      executablePath: electronBin,
      args: [appAsar, '--no-sandbox', '--disable-gpu'],
    });
    const window = await findAppWindow(app);
    await window.waitForLoadState('load');
    await expect(window).toHaveTitle(/G-Notes/, { timeout: 15000 });
    await expect(window.locator('body')).toBeVisible();

    await app.close();
  });

  test('renders without console errors', async () => {
    test.setTimeout(60_000);

    const appDir = findAppDir();
    const electronBin = path.join(__dirname, '..', 'node_modules', 'electron', 'dist', 'electron');
    const appAsar = path.join(appDir, 'resources', 'app.asar');

    const app = await electron.launch({
      executablePath: electronBin,
      args: [appAsar, '--no-sandbox', '--disable-gpu'],
    });
    const window = await findAppWindow(app);

    const errors: string[] = [];
    window.on('pageerror', (error) => errors.push(error.message));

    await window.waitForLoadState('load');
    await expect(window.locator('#root, .app, body')).toBeVisible();

    expect(errors).toEqual([]);
    await app.close();
  });
});
