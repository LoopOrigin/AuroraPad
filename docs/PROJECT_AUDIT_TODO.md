# AuroraPad Audit TODO

This file captures the most important follow-up issues found while reviewing the current AuroraPad codebase on April 6, 2026.

## Addressed In This Pass

- Added first-party built-in plugin skills for developer transforms and text utilities.
- Added a dedicated marketing website under `website/` and configured Vite to build it alongside the Electron renderer.
- Hardened Find/Replace in Files against invalid regular expressions.
- Improved session persistence coverage for unsaved tab content and metadata changes.
- Made `Run...` commands execute from the active file directory or open workspace when available.
- Changed Find in Files default file mask from `*.*` to `*` so extensionless files (Dockerfile, .env, Makefile, etc.) are included by default.
- Added right-click context menu to the tab bar: Close, Close Others (with dirty-check confirm), Copy Path, Reveal in File Manager.
- Implemented file change detection: chokidar now watches individual open files; clean tabs auto-reload silently; dirty tabs show a dismissible reload notification. Self-saves are suppressed to avoid false positives.

## Open Issues

- [x] ~~Persist editor preferences beyond theme.~~ All preferences (word wrap, line numbers, sidebar visibility, font size, whitespace, current-line highlight, minimap) are already stored via `useStorage` in `src/stores/settings.js` and persist across launches.

- [x] ~~Support extensionless files in Find/Replace in Files defaults.~~ Default mask changed from `*.*` to `*` in both `src/components/FindInFiles.vue` and both IPC handlers in `electron/main/index.js`.

- [ ] Expose platform-specific terminal entries more carefully.
  File: `electron/main/index.js`
  File: `src/App.vue`
  PowerShell, Git Bash, and WSL entries are always present in the top-level menus even on macOS and Linux, where they either degrade to the default shell or do nothing distinctive.

- [ ] Improve “Open Containing Folder” behavior for file selection.
  File: `src/App.vue`
  The Explorer/Finder action currently opens the directory path through the default viewer rather than revealing and selecting the active file directly.

- [ ] Add automated quality checks.
  File: `package.json`
  The project has no lint, type-check, or test script, which makes regressions harder to catch as the editor surface grows.

- [ ] Review session restore expectations for dirty file-backed tabs.
  File: `src/App.vue`
  Session restore reopens saved file paths from disk, but modified file-backed tabs are not restored with their unsaved content. That may surprise users who expect crash-style recovery.

## Suggested Next Steps

- [ ] Add a lightweight linting pass for Vue and JavaScript files.
- [ ] Decide whether AuroraPad should offer crash recovery for unsaved file-backed tabs.
- [ ] Add one or two product screenshots to the website once the app chrome is visually finalized.
- [ ] Consider a simple release page or download CTA once packaging artifacts are ready.
