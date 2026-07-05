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
