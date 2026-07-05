# G-Notes — Production & Post-Production Plans

## Pre-Production Checklist

### Code Quality
- [x] **TypeScript compilation** — Builds clean (`npm run make` succeeds)
- [x] **ESLint** — 0 errors (75 warnings — `no-explicit-any`, `no-unused-vars`, `import/no-named-as-default-member`). `--max-warnings 0` enforced in CI.
- [x] **Runtime testing** — Vitest (v4.1.9), **53 tests across 5 files** (stores, utils, database). Playwright E2E configured.

### Build & Packaging
- [x] **`npm run make`** — Produces `.deb` and `.rpm` for Linux
- [x] **Electron Forge config** — Makers configured for Win/macOS/Linux
- [x] **Fuses enabled** — Security hardening active
- [x] **Packaged app launches** — Confirmed working on Linux x64

### CI/CD
- [x] **GitHub Actions release workflow** — Lint (`--max-warnings 0`) and test gates added before build. Pre-release channel support (`v*beta*` / `v*rc*` tags marked as prerelease).
- [x] **GitHub publisher** — Draft releases configured with conditional prerelease flag
- [x] **First git commit** — `eb910f2 first commit`, pushed to `origin/main`
- [x] **GitHub repository** — `gstack-dev/G-Notes` exists (verified)

### Documentation
- [x] **Screenshots** — 8 screenshots in `screenshots/` (dashboard, editor, categories, settings, export, notes, favorites, search)
- [x] **README.md** — Feature list, build instructions, keyboard shortcuts, privacy info, 8 screenshots, badges fixed to `gstack-dev`
- [x] **PRIVACY.md** — Comprehensive privacy policy (updated to 2026)
- [x] **LICENSE** — MIT (updated to 2026)
- [x] **DESIGN.md** — Design system specification
- [x] **CONTRIBUTING.md** — Contribution guidelines
- [x] **CHANGELOG.md** — Keep a Changelog format with v1.0.0 entries
- [x] **SECURITY.md** — Vulnerability reporting policy
- [x] **CODE_OF_CONDUCT.md** — Contributor Covenant v2.1
- [x] **Issue templates** — Bug report + feature request

### Dependencies
- [x] **npm audit** — 34 vulns (25 high, 9 moderate) in build-time dev deps (tar, uuid via sockjs/webpack-dev-server). `--force` breaks Forge. Accepted for v1.0.
- [x] **`@types/node` pinned** — v20 in devDependencies, resolves TS 4.5.4 compatibility
- [x] **`.bin` files** — Fixed with `npm rebuild`
- [x] **Electron 43** — Verified compatible with Node 22+

### Platform Testing
- [x] **Linux** — Tested (confirmed working)
- [ ] **macOS** — Must test on macOS before release (no access, documented limitation)
- [ ] **Windows** — Must test on Windows before release (Squirrel installer)
- [ ] **Auto-update** — Test from a tagged release

#### Windows Testing Steps

Run on your Windows machine:

```bash
# 1. Clone and build
git clone https://github.com/gstack-dev/G-Notes.git
cd g-notes
npm install
npm run make    # produces out/make/squirrel.windows/*.exe

# 2. Run the installer
# Navigate to out/make/squirrel.windows/ and run the .exe

# 3. Verify
# - App launches from Start Menu
# - Can create, edit, delete notes
# - Categories, favorites, search work
# - Settings dialog opens
# - Export/import works
# - App closes cleanly (no zombie processes)
```

#### Auto-Update Test Procedure

```bash
# 1. Tag a release candidate
git tag -a v1.0.0-rc.1 -m "v1.0.0-rc.1"
git push origin v1.0.0-rc.1

# 2. Wait for CI to build and create draft release
# Go to https://github.com/gstack-dev/G-Notes/releases

# 3. Publish the draft release (mark as pre-release)

# 4. On a test machine running an older build:
# - Wait for auto-update check (runs every hour)
# - Or restart the app to trigger check
# - Verify update notification appears
# - Verify update downloads and installs
```

### Repository
- [x] **package.json URLs** — Updated to match actual remote (`gstack-dev/G-Notes`)
- [x] **forge.config.ts URLs** — Updated publisher and maker homepage URLs
- [x] **README.md, CONTRIBUTING.md, PLANS.md** — All URLs updated

### Legal & Metadata
- [x] `package.json` author/email/license/repository filled
- [x] Copyright year updated to 2026 (LICENSE, README, PRIVACY)
- [x] App icons present in `icons/` directory
- [x] `screen.png` — Used as app icon in forge config

---

## Production Plan

### Phase 1: Pre-Release Polish (Estimated: 1-2 days)

1. ~~**Fix ESLint**~~ ✅ Done — 0 errors (added `eslint-import-resolver-typescript`, fixed 15 `no-empty`/`no-var-requires`/`no-empty-interface`/`no-inferrable-types` errors, fixed `setCatsInitialized` → `setInitialized` selector)

2. ~~**Fix TypeScript issues**~~ ✅ Done — Fixed 3 `deleted_at` errors, fixed `@types/node` incompatibility by pinning v20

3. ~~**Generate screenshots**~~ ✅ Done — 8 screenshots captured: dashboard, editor, categories, settings, export, notes, favorites, search

4. ~~**Update README**~~ ✅ Done — Screenshots integrated, copyright year updated, table restructured

5. ~~**Fix CI/CD**~~ ✅ Done — `node-version: 22` (was 18, Electron 43 requires Node 22+)

6. ~~**Set up testing**~~ ✅ Done — Vitest v4.1.9 configured, 53 tests in 5 files (page-store, zust-store, categories-store, utils, database). Database CRUD, categories, prefs, and recent searches fully tested (22 tests).

7. **Dependency audit**
   - 32 vulns (26 high) remain in dev deps (sockjs, uuid, tar). `npm audit fix --force` breaks `@electron-forge/plugin-webpack`. Acceptable for v1.0 but should be reviewed.

### Phase 1b: Pre-Production Gaps (Added)

8. ~~**Capture search.png**~~ ✅ Done — Added `screenshots/search.png` captured with search query "design"
9. ~~**Fix README badges**~~ ✅ Done — `shnwnw` → `gstack-dev` in all badge URLs
10. ~~**CI lint+test gates**~~ ✅ Done — `npm run lint -- --max-warnings 0` and `npm run test` run on ubuntu before build
11. ~~**Pre-release channel**~~ ✅ Done — Tags containing `beta` or `rc` marked as prerelease
12. ~~**CHANGELOG.md**~~ ✅ Done — Keep a Changelog format, v1.0.0 entries
13. ~~**SECURITY.md**~~ ✅ Done — Vulnerability reporting policy
14. ~~**CODE_OF_CONDUCT.md**~~ ✅ Done — Contributor Covenant v2.1
15. ~~**Database tests**~~ ✅ Done — 22 tests covering notes CRUD, categories, prefs, recent searches, images
16. ~~**Silent catch blocks**~~ ✅ Done — Added `console.error` logging in auto-updater, localStorage migration, export/import handlers
17. ~~**Playwright E2E setup**~~ ✅ Done — `playwright.config.ts` + smoke tests in `e2e/`

### Phase 2: Release (Estimated: 1 day)

7. **Git initialization & first commit**
   ```bash
   git add -A
   git commit -m "Initial release v1.0.0"
   git remote add origin https://github.com/gstack-dev/G-Notes.git
   git push -u origin master
   ```

8. **Tag and release**
   ```bash
   git tag -a v1.0.0 -m "v1.0.0"
   git push origin v1.0.0
   ```
   - GitHub Actions will build all platforms and create a draft release

9. **Publish release**
   - Go to GitHub Releases
   - Review auto-generated release notes
   - Add screenshots/GIFs to release body
   - Publish (un-draft)

### Phase 3: Distribution (Estimated: 1 day)

10. **Homebrew tap**
    - Create `gstack-dev/homebrew-tap` repository
    - Add formula for G-Notes (points to GitHub release artifacts)
    - Test `brew install gstack-dev/tap/g-notes`

11. **Snap/Flatpak (optional)**
    - Consider publishing to Snap Store or Flathub for Linux users

---

## Post-Production Plan

### Week 1: Monitoring & Feedback

- [ ] **Monitor GitHub Issues** — Respond to bug reports and feature requests
- [ ] **Check auto-update telemetry** — Verify update notifications work in released version
- [ ] **Gather feedback** — Post on Reddit r/electronjs, Hacker News, product hunt
- [ ] **Hotfix readiness** — Be prepared to push v1.0.1 for critical bugs

### Week 2-4: Roadmap Items

- [ ] **Feature parity with localStorage migration** — Confirm migration path works for old users
- [ ] **Image attachment improvements** — Drag-drop, resize, gallery view
- [ ] **Markdown import** — Allow importing `.md` files (currently JSON-only)
- [ ] **Note templates** — Pre-defined note layouts

### Month 2+: v1.1.0 Planning

Potential features for next release:
- **Folders/notebooks** — Hierarchical organization beyond flat tags
- **Tags UI** — Multi-tag support per note
- **Collaboration** — P2P sync (via LAN or encrypted relay)
- **WYSIWYG improvements** — Table blocks, callouts, embeds
- **Mobile companion** — Read-only mobile app or web interface

### Ongoing Maintenance

- **Monthly dependency updates** — Run `npm audit` and update
- **Quarterly releases** — Minor features + bug fixes
- **Yearly major releases** — Breaking changes (if any)
- **Community management** — Review PRs, triage issues, update docs

### Metrics to Track

| Metric | How to Measure |
|--------|---------------|
| GitHub stars | Repository insights |
| Downloads per release | GitHub release download counts |
| Issues opened/closed | GitHub issue tracker |
| PRs merged | GitHub pulse |
| Auto-update success rate | Optional: Sentry or custom telemetry (opt-in) |

---

## Screenshot Generation

> Run the following on a machine with a display (not headless SSH):

```bash
bash scripts/take-screenshots.sh
```

This script will:
1. Launch G-Notes
2. Navigate to each view using keyboard shortcuts
3. Capture screenshots into `screenshots/`
4. Close the app

### Required Screenshots (for README)

| File | View | Keyboard Shortcut |
|------|------|------------------|
| `dashboard.png` | Dashboard | `Ctrl+1` |
| `editor.png` | Note editor | `Ctrl+N` then click editor |
| `search.png` | Search panel | `Ctrl+Shift+F`, type query |
| `categories.png` | Categories page | `Ctrl+4` |
| `export.png` | Export dialog | File > Export as JSON |
| `settings.png` | Settings dialog | `Ctrl+,` |
| `favorites.png` | Favorites page | `Ctrl+3` |
| `notes.png` | Notes page | `Ctrl+2` |
