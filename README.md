# AuroraPad

AuroraPad is a desktop-first code and text editor built with Electron, Vue 3, Monaco, and Vuetify. It combines the speed and familiarity of a classic multi-document desktop editor with modern remote server editing, integrated terminals, plugin-driven workflows, and release-ready packaging for macOS, Windows, and Linux.

It is designed for developers, operators, and power users who want a practical local-and-remote workflow without moving into a heavy browser IDE.

## Why AuroraPad

AuroraPad is built around a simple idea: local editing should stay fast, remote editing should feel native, and desktop tools should work like desktop tools.

What that means in practice:

- open a local folder and work like a familiar desktop editor
- connect to an SFTP, FTP, or FTPS server and edit files directly in Monaco
- launch an SSH terminal for SFTP connections without leaving the app
- keep using command palette, menus, tabs, sessions, and terminal workflows in one place
- customize the app with built-in tools and trusted local plugins

## At A Glance

- Monaco-powered editor with split view, bookmarks, encoding controls, line operations, and desktop-style tabs
- Local workspace flow with file tree, recent files, live refresh, command palette, and find in files
- Remote workspace support for SFTP, FTP, and FTPS with profile management, remote browse/open/save/move, and SSH terminal launch for SFTP sessions
- Integrated terminal dock with multiple sessions and platform-aware shell support
- Built-in plugin and skill system for text transforms, developer tools, and local power-user extensions
- Session restore for local and remote workflows
- Security-focused desktop architecture with Electron hardening, OS keychain-backed remote secrets, metadata-only remote profile export, and CI security scanning
- CI-managed semantic versioning and desktop release automation
- Nuxt-based website in the same repository

## Who It Is For

- developers who want a fast desktop editor with Monaco instead of a browser-first IDE
- operators who need to jump between local files, remote servers, and shell sessions quickly
- teams building a desktop editor product with Electron, Monaco, and packaged releases
- contributors who want a single repo for desktop app, website, and release automation

## Feature Overview

### Editing

- Multi-tab editing with dirty state, restoreable sessions, and active-tab awareness
- Monaco editor features including:
  - minimap
  - line numbers
  - wrapping
  - whitespace visibility
  - language inference
  - large language grammar coverage
- Split view editing for working in two tabs side by side
- Per-file encoding support:
  - `utf8`
  - `utf16le`
  - `utf16be`
  - `latin1`
  - `windows-1252`
- Line-ending controls and desktop-style text operations
- Bookmarks and bookmark clearing
- Search and replace inside the active editor
- Line utilities such as move, duplicate, join, sort, trim, case conversion, and comment toggling
- Save, Save As, Save a Copy, reload from disk, and close-flow protections for dirty tabs

### Local Workspace

- Open files and folders directly from the desktop shell
- Sidebar file tree with directory navigation and live updates
- Recent files list in the UI and menu system
- Session restore on relaunch
- Find in files across the local workspace
- Command palette for fast action access
- Context-aware local terminal launching from the active file or workspace directory

### Remote Workspace

AuroraPad includes a dedicated remote workspace flow for server editing.

Supported protocols:

- `SFTP (SSH)`
- `FTP`
- `FTPS`

Remote capabilities in the current app:

- Remote profile manager for creating, editing, deleting, importing, and exporting connection profiles
- Per-profile connection settings:
  - protocol
  - host
  - port
  - username
  - auth type
  - default remote root
  - private key path for SFTP key auth
- OS keychain-backed secret storage using `keytar`
- Connection testing before saving or connecting
- Remote file tree browsing and directory navigation
- Remote file open in Monaco
- Remote text save directly back to server
- Remote conflict-aware save flow using remote version metadata
- Remote move and rename support
- Remote folder creation
- Remote session restore with reconnect prompt
- Import/export of remote profile metadata for migration between machines

Remote workflow notes:

- Remote profile exports do not include passwords, passphrases, tokens, or private keys
- If keychain support is unavailable, AuroraPad does not fall back to plaintext secret storage
- Remote find in files is intentionally out of scope in the current version
- SSH terminal is available for SFTP-based connections only

### Integrated Terminal

- Docked terminal panel powered by `xterm` and `node-pty`
- Multiple terminal sessions in one workspace
- Platform-aware shell options
- Remote SSH terminal launch from the Remote menu for SFTP sessions
- Desktop-style terminal navigation for next and previous sessions

Platform behavior:

- Windows: Command Prompt, PowerShell, Git Bash, and WSL when available
- macOS and Linux: default shell with integrated session management

### Remote SSH Terminal

For SFTP connections, AuroraPad can launch an SSH terminal tied to the active connection.

- Opened from the top Remote menu
- Uses the selected connection host, user, port, and optional private key path
- Opens in the current remote directory when available
- Reuses the terminal dock instead of spawning a disconnected shell workflow

### Plugins And Skills

AuroraPad supports both built-in plugins and user-installed local JavaScript plugins.

Built-in plugin areas currently include:

- `developer-tools`
  - JSON formatting and minification
  - URL encode and decode
  - Base64 encode and decode
  - hashing helpers
- `text-tools`
  - title case
  - slugify
  - text statistics
- `selection-tools`
  - selection wrappers
  - reverse lines
- additional bundled editor helpers such as whitespace and line utilities

Plugin model:

- User plugins are loaded from the local plugins folder
- Plugin menu items can appear in the app menu and in the in-app plugin manager
- Plugins are treated as trusted local code, not sandboxed third-party extensions

### Menus, Palette, And Desktop Workflow

- Top desktop menu bar with editor, remote, terminal, plugin, settings, and help actions
- Secondary menu cluster for less important actions in the in-app UI
- Command palette for quick action access
- Platform-aware file manager and terminal actions
- Status bar controls for encoding and editor state
- Toolbar toggles and preferences for common UI visibility controls

### Preferences And Appearance

AuroraPad includes user-configurable preferences for:

- theme
- toolbar visibility
- status bar visibility
- sidebar visibility
- autosave
- font size
- line numbers
- whitespace rendering
- minimap

Included themes:

- Aurora Light
- Aurora Dark
- Monokai
- Solarized Dark

## Security Model

AuroraPad is a desktop application, so it intentionally supports powerful local workflows. The current trust model is practical and explicit.

Included security work:

- Hardened Electron configuration and safer preload boundaries
- OS keychain storage for remote secrets
- Remote profile exports are metadata only
- CI secret scanning and security scan hooks
- Security event logging for sensitive desktop actions
- Safer release automation and dependency upgrades

Important trust boundaries:

- User-installed plugins are trusted local code
- Local command execution and integrated terminals are desktop-power features, not sandboxed browser features
- Remote secrets are never exported in profile migration files

Security references:

- [docs/SECURITY_BASELINE.md](/Users/muhammadali/Desktop/LoopOrigin/Projects/AuroraPad/docs/SECURITY_BASELINE.md)
- [docs/PROJECT_AUDIT_TODO.md](/Users/muhammadali/Desktop/LoopOrigin/Projects/AuroraPad/docs/PROJECT_AUDIT_TODO.md)

## Tech Stack

Desktop app:

- Electron
- Vue 3
- Vite
- Vuetify
- Monaco Editor
- Pinia
- electron-store
- chokidar
- node-pty
- xterm
- ssh2-sftp-client
- basic-ftp
- keytar

Website:

- Nuxt 4

## Project Structure

Key paths in the repository:

- [src/App.vue](/Users/muhammadali/Desktop/LoopOrigin/Projects/AuroraPad/src/App.vue): main renderer application and workflow orchestration
- [src/components](/Users/muhammadali/Desktop/LoopOrigin/Projects/AuroraPad/src/components): editor, tree, terminal, toolbar, menu, and dialog UI
- [src/stores](/Users/muhammadali/Desktop/LoopOrigin/Projects/AuroraPad/src/stores): application state stores
- [src/plugins](/Users/muhammadali/Desktop/LoopOrigin/Projects/AuroraPad/src/plugins): built-in plugins and plugin API
- [electron/main/index.js](/Users/muhammadali/Desktop/LoopOrigin/Projects/AuroraPad/electron/main/index.js): Electron main process, menu wiring, IPC, terminal, security, and shell integrations
- [electron/main/remote-manager.js](/Users/muhammadali/Desktop/LoopOrigin/Projects/AuroraPad/electron/main/remote-manager.js): remote connection manager for SFTP, FTP, FTPS, and SSH launch resolution
- [electron/preload/index.js](/Users/muhammadali/Desktop/LoopOrigin/Projects/AuroraPad/electron/preload/index.js): renderer-safe desktop API bridge
- [website/](/Users/muhammadali/Desktop/LoopOrigin/Projects/AuroraPad/website): product website
- [scripts/](/Users/muhammadali/Desktop/LoopOrigin/Projects/AuroraPad/scripts): build, release, and maintenance scripts
- [docs/](/Users/muhammadali/Desktop/LoopOrigin/Projects/AuroraPad/docs): security, release, and product planning documents

## Quick Start

Requirements:

- Node.js 22 recommended
- npm
- desktop OS: macOS, Windows, or Linux

Install and run:

```bash
npm install
npm run electron:dev
```

Useful development commands:

```bash
# Renderer-only dev server
npm run dev

# Desktop app with Electron + Vite
npm run electron:dev

# Production renderer build
npm run build

# Security scan
npm run security:scan

# Audit installed packages
npm run security:audit
```

## Packaging

Build platform-specific desktop artifacts with:

```bash
npm run electron:build:mac
npm run electron:build:win
npm run electron:build:linux
```

Artifacts are written to `release/`.

Current package targets:

- macOS: `dmg`, `zip`
- Windows: `nsis`, `portable`
- Linux: `AppImage`, `tar.gz`

## Website

AuroraPad ships with a Nuxt-based website in the same repository.

Important website files:

- [website/nuxt.config.ts](/Users/muhammadali/Desktop/LoopOrigin/Projects/AuroraPad/website/nuxt.config.ts)
- [website/app.vue](/Users/muhammadali/Desktop/LoopOrigin/Projects/AuroraPad/website/app.vue)
- [website/pages/index.vue](/Users/muhammadali/Desktop/LoopOrigin/Projects/AuroraPad/website/pages/index.vue)
- [website/WebsiteApp.vue](/Users/muhammadali/Desktop/LoopOrigin/Projects/AuroraPad/website/WebsiteApp.vue)
- [website/pages/terms.vue](/Users/muhammadali/Desktop/LoopOrigin/Projects/AuroraPad/website/pages/terms.vue)
- [website/pages/privacy.vue](/Users/muhammadali/Desktop/LoopOrigin/Projects/AuroraPad/website/pages/privacy.vue)
- [website/pages/usage.vue](/Users/muhammadali/Desktop/LoopOrigin/Projects/AuroraPad/website/pages/usage.vue)
- [website/pages/license.vue](/Users/muhammadali/Desktop/LoopOrigin/Projects/AuroraPad/website/pages/license.vue)

Important routes:

- `/`
- `/terms`
- `/privacy`
- `/usage`
- `/license`

Website commands:

```bash
npm run site:dev
npm run site:build
npm run site:preview
```

The website is statically generated into `website/.output/public/`.

For Vercel:

- build command: `npm run site:build`
- output directory: `website/.output/public`
- config file: [vercel.json](/Users/muhammadali/Desktop/LoopOrigin/Projects/AuroraPad/vercel.json)

## Release Management

AuroraPad uses CI-managed semantic versioning.

Version rules:

- `feat:` commits trigger a minor bump
- `BREAKING CHANGE:` or conventional commits with `!` trigger a major bump
- all other release commits default to patch

Release workflow behavior:

- resolves the next semantic version from git history and tags
- builds macOS, Windows, and Linux artifacts
- publishes a tagged public release
- persists the released version back to `package.json` and `package-lock.json` only after a successful release

Relevant files:

- [.github/workflows/build.yml](/Users/muhammadali/Desktop/LoopOrigin/Projects/AuroraPad/.github/workflows/build.yml)
- [.github/workflows/release.yml](/Users/muhammadali/Desktop/LoopOrigin/Projects/AuroraPad/.github/workflows/release.yml)
- [.github/release.yml](/Users/muhammadali/Desktop/LoopOrigin/Projects/AuroraPad/.github/release.yml)
- [docs/RELEASE_MANAGEMENT.md](/Users/muhammadali/Desktop/LoopOrigin/Projects/AuroraPad/docs/RELEASE_MANAGEMENT.md)

## Current Scope Notes

Included today:

- local editing and workspace management
- integrated terminal sessions
- remote browsing and editing over SFTP, FTP, and FTPS
- SSH terminal launch for SFTP sessions
- profile import/export without secret export
- built-in plugins and local user plugins
- CI-based packaging and release automation

Not included today:

- remote find in files
- sandboxed third-party plugin runtime
- browser-first IDE deployment model

## Repository Links

- Repository: [github.com/ali111887/AuroraPad](https://github.com/ali111887/AuroraPad)
- Public releases repository: [github.com/ali111887/AuroraPad-Releases](https://github.com/ali111887/AuroraPad-Releases)
- Source repository releases: [github.com/ali111887/AuroraPad/releases](https://github.com/ali111887/AuroraPad/releases)

## License

AuroraPad is governed by the repository license in [LICENSE](/Users/muhammadali/Desktop/LoopOrigin/Projects/AuroraPad/LICENSE).
