import { test, expect, type Page } from '@playwright/test';
import { _electron as electron } from 'playwright';
import path from 'path';
import fs from 'fs';

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
  const deadline = Date.now() + 15000;
  while (Date.now() < deadline) {
    const windows = electronApp.windows();
    for (const w of windows) {
      const title = await w.title().catch(() => '');
      if (title.includes('G-Notes')) return w;
    }
    await new Promise(r => setTimeout(r, 200));
  }
  const titles = await Promise.all(electronApp.windows().map(w => w.title().catch(() => '<error>')));
  throw new Error(`Timed out waiting for G-Notes window. Existing windows: [${titles.join(', ')}]`);
}

test.describe('G-Notes Smoke Tests', () => {
  test('app launches and shows main window', async () => {
    const appDir = findAppDir();
    const appAsar = path.join(appDir, 'resources', 'app.asar');

    const electronApp = await electron.launch({
      args: [appAsar, '--no-sandbox', '--disable-gpu'],
    });

    const window = await findAppWindow(electronApp);
    await window.waitForLoadState('domcontentloaded');

    const title = await window.title();
    expect(title).toContain('G-Notes');
    await electronApp.close();
  });

  test('app has correct version', async () => {
    const appDir = findAppDir();
    const appAsar = path.join(appDir, 'resources', 'app.asar');

    const electronApp = await electron.launch({
      args: [appAsar, '--no-sandbox', '--disable-gpu'],
    });

    const version = await electronApp.evaluate(({ app }) => app.getVersion());
    expect(version).toBe('1.0.0');
    await electronApp.close();
  });
});
