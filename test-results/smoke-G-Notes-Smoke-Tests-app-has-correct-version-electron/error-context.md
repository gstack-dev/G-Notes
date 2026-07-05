# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: smoke.spec.ts >> G-Notes Smoke Tests >> app has correct version
- Location: e2e/smoke.spec.ts:23:7

# Error details

```
Error: electron.launch: Failed to launch: Error: spawn /media/shnwnw/Workspace/projects/work/G-Notes/node_modules/electron/dist/electron ENOENT
Call log:
  - <launching> /media/shnwnw/Workspace/projects/work/G-Notes/node_modules/electron/dist/electron --no-sandbox --inspect=0 --remote-debugging-port=0 /media/shnwnw/Workspace/projects/work/G-Notes/out/g-notes-linux-x64/g-notes
  - [pid=N/A] starting temporary directories cleanup
  - [pid=N/A] finished temporary directories cleanup

```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | import { _electron as electron } from 'playwright';
  3  | import path from 'path';
  4  | 
  5  | const ELECTRON_PATH = path.join(__dirname, '..', 'node_modules', 'electron', 'dist', 'electron');
  6  | const APP_PATH = path.join(__dirname, '..', 'out', 'g-notes-linux-x64', 'g-notes');
  7  | 
  8  | test.describe('G-Notes Smoke Tests', () => {
  9  |   test('app launches and shows main window', async () => {
  10 |     const electronApp = await electron.launch({
  11 |       args: [APP_PATH],
  12 |       executablePath: ELECTRON_PATH,
  13 |     });
  14 | 
  15 |     const window = await electronApp.firstWindow();
  16 |     await window.waitForLoadState('domcontentloaded');
  17 | 
  18 |     const title = await window.title();
  19 |     expect(title).toContain('G-Notes');
  20 |     await electronApp.close();
  21 |   });
  22 | 
  23 |   test('app has correct version', async () => {
> 24 |     const electronApp = await electron.launch({
     |                         ^ Error: electron.launch: Failed to launch: Error: spawn /media/shnwnw/Workspace/projects/work/G-Notes/node_modules/electron/dist/electron ENOENT
  25 |       args: [APP_PATH],
  26 |       executablePath: ELECTRON_PATH,
  27 |     });
  28 | 
  29 |     const version = await electronApp.evaluate(({ app }) => app.getVersion());
  30 |     expect(version).toBe('1.0.0');
  31 |     await electronApp.close();
  32 |   });
  33 | });
  34 | 
```