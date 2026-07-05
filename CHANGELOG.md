# Changelog

All notable changes to G-Notes are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] — 2026-07-05

### Added
- Rich text editor powered by EditorJS (headings, bold, italic, underline, lists, checklists, quotes, code blocks, markers)
- Full-text search across all notes using SQLite FTS5
- Category tagging and filtering
- Favorites and pinning system
- Export/import notes as JSON
- Auto-backup to SQLite snapshots
- Auto-update via GitHub Releases
- Keyboard shortcuts for all major actions
- Dark/light theme support
- Onboarding flow for first-time users
- Comprehensive app menu with keyboard shortcut hints

### Changed
- Migrated from localStorage to SQLite for data persistence

### Fixed
- N/A — initial release

### Security
- Electron fuses enabled (RunAsNode disabled, cookie encryption, ASAR integrity)
- No telemetry, analytics, or network requests at startup
- All data stored locally with no external dependencies

## [Pre-release] — 2026-07-06

### Fixed
- TypeScript build: added missing `favorited`/`pinned` fields to test type definitions
- Windows build: configured native module rebuild to skip N-API modules (onlyModules: [])
- Windows Squirrel installer: converted app icon from PNG to ICO format, added macOS ICNS icon
- CI: added multi-platform build workflow with lint, test, package, make, and e2e stages
- CI: added automated release workflow triggered on version tags
- Lint: resolved 69 warnings (unused imports, explicit any types, non-null assertions)
- Error handling: added React ErrorBoundary component, logged silent catch handlers
- Auto-backup: implemented periodic SQLite snapshot backups every 30 minutes

### Changed
- Upgraded TypeScript 4.5.5 → 5.7.3, @typescript-eslint 5.x → 7.x
- Updated forge.config.ts icon config to extensionless path for cross-platform support
- Added icon regeneration script (npm run generate-icons)
- Updated README to fix broken icon paths and commented out missing screenshots
