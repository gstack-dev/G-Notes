import { test, expect } from '@playwright/test';
import { _electron as electron } from 'playwright';
import path from 'path';

const ELECTRON_PATH = path.join(__dirname, '..', 'node_modules', 'electron', 'dist', 'electron');
const APP_PATH = path.join(__dirname, '..', 'out', 'g-notes-linux-x64', 'g-notes');

test.describe('G-Notes Smoke Tests', () => {
  test('app launches and shows main window', async () => {
    const electronApp = await electron.launch({
      args: [APP_PATH],
      executablePath: ELECTRON_PATH,
    });

    const window = await electronApp.firstWindow();
    await window.waitForLoadState('domcontentloaded');

    const title = await window.title();
    expect(title).toContain('G-Notes');
    await electronApp.close();
  });

  test('app has correct version', async () => {
    const electronApp = await electron.launch({
      args: [APP_PATH],
      executablePath: ELECTRON_PATH,
    });

    const version = await electronApp.evaluate(({ app }) => app.getVersion());
    expect(version).toBe('1.0.0');
    await electronApp.close();
  });
});
