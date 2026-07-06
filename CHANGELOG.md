# Changelog

## v1.0.0

### About

G-Notes is a private, offline-first notes app powered by SQLite and EditorJS. 100% local. No account. No telemetry.

### What's New

#### Rich Text Editing
- Headings, bold, italic, underline, strikethrough
- Ordered/unordered lists, checklists
- Quotes, inline code, code blocks
- Marker/highlight tool
- Simple image embedding
- Undo/redo

#### Organization
- **Categories** — Tag and filter notes by custom categories
- **Favorites & Pins** — Star important notes and pin them to the top of the list
- **Trash** — Soft-delete with restore capability

#### Search
- **Full-text search** via SQLite FTS5 — instant, incremental, with highlighted results

#### Import / Export
- **JSON export** — Full note database as a portable JSON file
- **Markdown export** — Individual notes as Markdown
- **JSON import** — Restore notes from a previously exported file

#### Data Safety
- **Auto-backup** — Periodic SQLite snapshots saved to `~/.config/g-notes/backups/`
- **Offline-first** — Zero network calls; everything runs entirely on your machine
- **Migration system** — Schema migrations run automatically on startup

#### Auto-Update
- Seamless updates delivered via GitHub Releases (powered by `electron-updater`)
- Checks for updates hourly when running a packaged build

#### Keyboard Shortcuts
| Shortcut | Action |
|---|---|
| `Cmd/Ctrl + N` | New note |
| `Cmd/Ctrl + ,` | Settings |
| `Cmd/Ctrl + 1–4` | Navigate Dashboard / Notes / Favorites / Categories |
| `Cmd/Ctrl + Shift + F` | Search |
| `Cmd/Ctrl + Shift + T` | Trash |

### Packaging & Distribution

- **Cross-platform** — Produces `.deb` / `.rpm` (Linux), `.zip` (macOS), and NSIS installer (Windows)
- **Electron Fuses** — Hardened security: `RunAsNode` disabled, cookie encryption enabled, ASAR integrity validation, app loading restricted to ASAR
- **Self-contained** — Bundles SQLite WASM and all dependencies in the ASAR

### Technical Improvements

- **Electron 43** — Latest Electron release with modern Chromium
- **sql.js WASM** — SQLite compiled to WebAssembly, patched for webpack 5 compatibility (`scripts/sqljs-patch-loader.js`)
- **Webpack 5** — Custom `FixDirnamePlugin` to handle `__dirname` in renderer processes
- **TypeScript** — Strict mode with `@typescript-eslint` v8
- **Error resilience** — `initDb()` failure no longer prevents window creation; the app handles database errors gracefully
- **Unit tests** — Vitest test suite for database operations, Zustand stores, and utilities (~442 lines of tests)
- **E2E tests** — Playwright-based end-to-end tests verifying launch, window title, version, and console errors
- **CI/CD** — GitHub Actions workflows for lint, unit test, package, make, and e2e test on every push to main; automated release pipeline triggered by version tags

### Bug Fixes

- Fixed `module.exports` error in sql.js when bundled with webpack 5
- Fixed `__dirname is not defined` in preload and renderer processes
- Fixed `no such column: deleted_at` — added migration v3 for trash support
- Fixed SVG `rx` attribute syntax error in dashboard icon
- Fixed `@typescript-eslint` compatibility with TypeScript 5.7
- Fixed `require()` style lint violations across all source files
- Fixed Playwright e2e tests failing with Forge-packaged binaries (use raw Electron + ASAR path)
- Fixed DevTools window racing with app window in e2e tests
