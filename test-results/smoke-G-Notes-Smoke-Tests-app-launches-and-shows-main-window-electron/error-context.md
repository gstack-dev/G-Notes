# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: smoke.spec.ts >> G-Notes Smoke Tests >> app launches and shows main window
- Location: e2e/smoke.spec.ts:14:7

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: electronApplication.firstWindow: Target page, context or browser has been closed
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | import { _electron as electron } from 'playwright';
  3  | import path from 'path';
  4  | 
  5  | test.describe('G-Notes Smoke Tests', () => {
  6  |   let electronApp: Awaited<ReturnType<typeof electron.launch>>;
  7  | 
  8  |   test.afterEach(async () => {
  9  |     if (electronApp) {
  10 |       await electronApp.close();
  11 |     }
  12 |   });
  13 | 
  14 |   test('app launches and shows main window', async () => {
  15 |     electronApp = await electron.launch({
  16 |       args: [path.join(__dirname, '..', 'out', 'g-notes-linux-x64', 'g-notes')],
  17 |       executablePath: path.join(__dirname, '..', 'node_modules', '.bin', 'electron'),
  18 |     });
  19 | 
> 20 |     const window = await electronApp.firstWindow();
     |                                      ^ Error: electronApplication.firstWindow: Target page, context or browser has been closed
  21 |     await window.waitForLoadState('domcontentloaded');
  22 | 
  23 |     const title = await window.title();
  24 |     expect(title).toContain('G-Notes');
  25 |   });
  26 | 
  27 |   test('app has the correct version in package.json', async () => {
  28 |     electronApp = await electron.launch({
  29 |       args: [path.join(__dirname, '..', 'out', 'g-notes-linux-x64', 'g-notes')],
  30 |       executablePath: path.join(__dirname, '..', 'node_modules', '.bin', 'electron'),
  31 |     });
  32 | 
  33 |     const window = await electronApp.firstWindow();
  34 |     const app = await electronApp.evaluate(({ app }) => app.getVersion());
  35 |     expect(app).toBe('1.0.0');
  36 |   });
  37 | });
  38 | 
```