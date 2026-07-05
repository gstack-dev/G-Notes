# Contributing to G-Notes

Thanks for your interest in contributing!

## Issues

- Search existing issues before opening a new one.
- Use the provided templates (bug report / feature request).
- For bugs, include your OS and G-Notes version.

## Pull Requests

1. Fork the repo and create a branch from `main`.
2. Run `npm install` and `npm run make` to verify the build.
3. Keep changes focused — one feature/fix per PR.
4. Update `README.md` if your change adds a user-facing feature.
5. Open a PR against `main` with a clear description.

## Code Style

- TypeScript with strict mode.
- React functional components with hooks.
- Tailwind CSS v4 for styling.
- EditorJS for rich text — keep plugins minimal and local.
- SQLite via `better-sqlite3` in the main process only.
- IPC for all renderer→main communication.

## Development Setup

```bash
git clone https://github.com/gstack-dev/G-Notes.git
cd g-notes
npm install
npm start        # dev mode with hot reload
npm run make     # production build
```

## Architecture

```
src/
  index.ts            Main process — app menu, DB init, auto-updater
  preload.ts          Context bridge — exposes IPC to renderer
  database.ts         SQLite initialization + CRUD
  database-migrations.ts  Versioned schema migrations + FTS5
  ipc-handlers.ts     IPC handler registration
  renderer.ts         Renderer entry point
  app.tsx             React root
  components/         React components
    layout/           AppShell, Sidebar, MainContent
    notes/            Editor, toolbar, note cards, search
    pages/            Dashboard, Notes, Favorites, Categories
    dialogs/          About, Settings, Export/Import
  shared/             Zustand stores
  @types/             TypeScript declarations
```

## License

By contributing, you agree that your contributions will be licensed under the MIT license.
