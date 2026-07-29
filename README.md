# AuroraPad

AuroraPad is a desktop-first code and text editor built with Electron, Vue 3, Monaco, and Vuetify. It combines the speed and familiarity of a classic multi-document desktop editor with modern remote server editing, integrated terminals, plugin-driven workflows, and release-ready packaging for macOS, Windows, and Linux.

It is designed for developers, operators, and power users who want a practical local-and-remote workflow without moving into a heavy browser IDE.

---

## Table of Contents

- [Why AuroraPad](#why-aurorapad)
- [At A Glance](#at-a-glance)
- [Who It Is For](#who-it-is-for)
- [Feature Overview](#feature-overview)
  - [Editing](#editing)
  - [Language Support](#language-support)
  - [Local Workspace](#local-workspace)
  - [Remote Workspace](#remote-workspace)
  - [Integrated Terminal](#integrated-terminal)
  - [Remote SSH Terminal](#remote-ssh-terminal)
  - [Plugins And Skills](#plugins-and-skills)
  - [Menus, Palette, And Desktop Workflow](#menus-palette-and-desktop-workflow)
  - [Preferences And Appearance](#preferences-and-appearance)
- [Security Model](#security-model)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Quick Start](#quick-start)
- [Packaging](#packaging)
- [Website](#website)
  - [Deploying to Vercel](#deploying-to-vercel)
- [Release Management](#release-management)
- [CI Workflows](#ci-workflows)
- [Current Scope Notes](#current-scope-notes)
- [Repository Links](#repository-links)
- [License](#license)

---

## Why AuroraPad

AuroraPad is built around a simple idea: local editing should stay fast, remote editing should feel native, and desktop tools should work like desktop tools.

What that means in practice:

- open a local folder and work like a familiar desktop editor
- connect to an SFTP, FTP, or FTPS server and edit files directly in Monaco
- launch an SSH terminal for SFTP connections without leaving the app
- keep using command palette, menus, tabs, sessions, and terminal workflows in one place
- customize the app with built-in tools and trusted local plugins

---

## At A Glance

- Monaco-powered editor with split view, bookmarks, encoding controls, line operations, and desktop-style tabs
- Local workspace flow with file tree, recent files, live refresh, command palette, and find in files
- Remote workspace support for SFTP, FTP, and FTPS with profile management, remote browse/open/save/move, and SSH terminal launch for SFTP sessions
- Integrated terminal dock with multiple sessions and platform-aware shell support
- Built-in plugin and skill system for text transforms, developer tools, and local power-user extensions
- Session restore for local and remote workflows
- Security-focused desktop architecture with Electron hardening, OS keychain-backed remote secrets, metadata-only remote profile export, and CI security scanning
- CI-managed semantic versioning and desktop release automation
- Nuxt 4-based product website in the same repository

---

## Who It Is For

- Developers who want a fast desktop editor with Monaco instead of a browser-first IDE
- Operators who need to jump between local files, remote servers, and shell sessions quickly
- Teams building a desktop editor product with Electron, Monaco, and packaged releases
- Contributors who want a single repository for desktop app, website, and release automation

---

## Feature Overview

### Editing

AuroraPad is built around the Monaco editor — the same engine that powers VS Code — giving you a high-quality editing experience inside a desktop application.

**Tabs and sessions**

- Multi-tab editing with dirty state tracking (unsaved changes indicator)
- Close-flow protections to prevent accidental loss of unsaved content
- Session restore on relaunch: reopens the last set of tabs, cursor positions, and active folder
- Active-tab awareness so menus and actions operate on the correct document

**Monaco editor capabilities**

- Minimap overview panel
- Line numbers with configurable visibility
- Word wrap toggle
- Whitespace visibility rendering
- Syntax highlighting via automatic language inference from file extension and content
- Extensive language grammar coverage (see [Language Support](#language-support))

**Line operations**

- Move line or selection up and down
- Duplicate line or selection up and down
- Join lines
- Delete line
- Toggle line comment

**Case and text conversion**

- Lowercase
- UPPERCASE
- Title Case (via Text Tools plugin)
- Slugify — URL-safe lowercase slug (via Text Tools plugin)

**Bookmarks**

- Toggle bookmark on current line
- Jump to next bookmark
- Jump to previous bookmark
- Clear all bookmarks

**Find and replace**

- Find and replace inside the active editor (Monaco built-in)
- Find next / previous
- Go to line number

**Encoding**

- Per-file encoding selection:
  - `utf8`
  - `utf16le`
  - `utf16be`
  - `latin1`
  - `ascii`
  - `iso-8859-1`
  - `windows-1252`
- Encoding displayed and changeable in the status bar

**Save operations**

- Save
- Save All
- Save As
- Reload from disk
- Close with dirty-state confirmation

---

### Language Support

AuroraPad automatically infers the language for syntax highlighting from file extension. Supported languages include:

| Category | Languages |
|---|---|
| JavaScript / TypeScript | `.js` `.mjs` `.cjs` `.ts` `.jsx` `.tsx` |
| Web frameworks | `.vue` `.svelte` `.astro` |
| Web | `.html` `.htm` `.css` `.scss` `.less` |
| Data / config | `.json` `.jsonc` `.yaml` `.yml` `.xml` `.ini` `.toml` |
| Documentation | `.md` `.markdown` |
| Python | `.py` |
| Ruby | `.rb` `.rbw` `.rake` |
| Go | `.go` |
| Rust | `.rs` |
| Java / Kotlin | `.java` `.kt` |
| C / C++ | `.c` `.h` `.cpp` `.cxx` `.cc` `.hpp` `.hxx` |
| C# | `.cs` `.csx` |
| PHP | `.php` |
| Elixir | `.ex` `.exs` |
| Haskell | `.hs` |
| Scala | `.scala` |
| Swift | `.swift` |
| Dart | `.dart` |
| Lua | `.lua` |
| Clojure | `.clj` |
| SQL | `.sql` |
| Shell | `.sh` `.bash` `.zsh` `.ksh` |
| PowerShell | `.ps1` `.psm1` |

Plain text is the default fallback for unrecognized extensions.

---

### Local Workspace

- Open files and folders directly from the desktop shell
- Sidebar file tree with directory navigation powered by `chokidar` for live updates
- Folder entries sorted: directories before files, both alphabetically
- Recent files list in the UI and menu system
- Find in files across the local workspace ([FindInFiles.vue](src/components/FindInFiles.vue))
- Command palette for fast action access (`Ctrl+P`)
- Context-aware local terminal launching from the active file or workspace directory
- Session restore on relaunch with last open tabs and folder

---

### Remote Workspace

AuroraPad includes a dedicated remote workspace flow for server editing.

**Supported protocols**

- `SFTP` (SSH File Transfer Protocol)
- `FTP` (plain)
- `FTPS` (FTP over explicit or implicit TLS)

**Profile management**

- Create, edit, and delete remote connection profiles
- Per-profile connection settings:
  - Protocol (`SFTP`, `FTP`, `FTPS`)
  - Host and port
  - Username
  - Auth type: password or private key
  - Default remote root directory
  - Private key path for SFTP key-based auth
- Test connection before saving or connecting
- Import and export remote profile metadata between machines
- Profile exports never include passwords, passphrases, tokens, or private keys

**Secret storage**

- Passwords and passphrases stored in the OS keychain via `keytar`
- If keychain support is unavailable, AuroraPad does not fall back to plaintext storage

**Remote file operations**

- Remote file tree browsing and directory navigation
- Remote file open directly in Monaco
- Remote text save written back to the server
- Conflict-aware save using remote version metadata (size + modification time) to detect changes between open and save
- Remote file move and rename
- Remote folder creation
- Remote session restore with reconnect prompt on next launch

**Remote error handling**

AuroraPad normalizes common remote errors into actionable messages — for example, detecting TLS handshake failures, connection refused, and host unreachable and returning plain-English explanations with corrective hints.

**Limitations in current scope**

- Remote find in files is intentionally out of scope in this version
- SSH terminal is available for SFTP-based connections only (see [Remote SSH Terminal](#remote-ssh-terminal))

---

### Integrated Terminal

- Docked terminal panel at the bottom of the workspace powered by `xterm` and `node-pty`
- Multiple terminal sessions open at the same time
- Platform-aware shell options
- Desktop-style navigation between next and previous sessions

**Platform defaults**

| Platform | Available shells |
|---|---|
| Windows | Command Prompt, PowerShell, Git Bash, WSL (when available) |
| macOS | Default login shell |
| Linux | Default shell |

---

### Remote SSH Terminal

For SFTP connections, AuroraPad can launch an SSH terminal tied to the active connection.

- Opened from the top Remote menu
- Uses the selected connection host, user, port, and optional private key path
- Opens in the current remote directory when available
- Reuses the existing terminal dock rather than spawning a disconnected shell

---

### Plugins And Skills

AuroraPad ships a plugin system modeled after Notepad++'s plugin architecture. Plugins export a menu structure and actions that integrate into the Plugins menu and the in-app plugin manager.

**Plugin API**

Plugins receive a plugin API object (`api`) that exposes:

| Method | Description |
|---|---|
| `api.getContent()` | Get the full document text |
| `api.setContent(text)` | Replace the full document text |
| `api.getSelection()` | Get `{ text, range }` of current selection |
| `api.replaceSelection(text)` | Replace current selection with new text |
| `api.getEditor()` | Get the raw Monaco editor instance for advanced operations |

Actions that take selection or document input use a shared pattern: if there is an active selection, operate on the selection; otherwise operate on the whole document.

**Built-in plugins**

| Plugin | ID | Actions |
|---|---|---|
| Insert Date/Time | `insert-datetime` | Insert Date/Time, Insert Date, Insert Time |
| Sort Lines | `sort-lines` | Sort Lines Ascending, Sort Lines Descending |
| Remove Empty Lines | `remove-empty-lines` | Remove Empty Lines |
| Smart Edit | `smart-edit` | Duplicate Down, Duplicate Up, Move Up, Move Down, Toggle Line Comment |
| Whitespace Tools | `whitespace-tools` | Trim Trailing Whitespace, Trim Leading & Trailing Whitespace, Compress Multiple Blank Lines, Convert Tabs to Spaces (4), Convert Spaces to Tabs (4) |
| Developer Tools | `developer-tools` | JSON Pretty Print, JSON Minify, URL Encode, URL Decode, Base64 Encode, Base64 Decode |
| Text Tools | `text-tools` | Convert to Title Case, Slugify Selection / Document, Selection Statistics |
| Selection Tools | `selection-tools` | Wrap in Double Quotes, Wrap in Single Quotes, Wrap in Parentheses, Reverse Selected Lines |

**User plugins**

- User plugins are loaded from the local plugins folder on disk
- Plugin menu items appear in the Plugins menu and the in-app plugin manager
- User plugins are treated as trusted local code, not sandboxed third-party extensions
- Plugins follow the same export contract: `{ id, name, version, description, menuItems: [{ id, label, run(api) }] }`

---

### Menus, Palette, And Desktop Workflow

**Menu bar**

AuroraPad uses a top desktop menu bar organized by workflow area:

| Menu | Key actions |
|---|---|
| File | New, Open File, Open Folder, Save, Save All, Save As, Reload, Recent Files, Close, Exit |
| Edit | Undo, Redo, Cut, Copy, Paste, Find / Replace, Go to Line, Bookmarks |
| Remote | Connect, Disconnect, Remote file operations, SSH Terminal |
| Terminal | New terminal, Next/Previous session |
| Plugins | All built-in and user plugin actions |
| Settings | Theme, Preferences, Toolbar/Sidebar/Status bar toggles |
| Help | About, Documentation |

**Command palette**

- Open with `Ctrl+P`
- Fast search across files and commands

**Status bar**

- Current file encoding (clickable to change)
- Editor state indicators
- Line and column position

**Toolbar**

- Configurable visibility
- Common file and editing actions

---

### Preferences And Appearance

AuroraPad persists all preferences using `electron-store` so they survive across sessions.

**Configurable preferences**

| Setting | Options |
|---|---|
| Theme | Aurora Light, Aurora Dark, Monokai, Solarized Dark |
| Autosave | On / Off |
| Font size | Configurable |
| Line numbers | Show / Hide |
| Whitespace rendering | Show / Hide |
| Minimap | Show / Hide |
| Word wrap | On / Off |
| Toolbar visibility | Show / Hide |
| Status bar visibility | Show / Hide |
| Sidebar visibility | Show / Hide |

**Included themes**

- **Aurora Light** — clean light theme
- **Aurora Dark** — dark theme with Aurora color accents
- **Monokai** — classic dark developer theme
- **Solarized Dark** — Solarized base dark theme

---

## Security Model

AuroraPad is a desktop application that intentionally supports powerful local workflows. The trust model is practical and explicit.

**Included security work**

- Hardened Electron configuration with safer preload boundaries and context isolation
- OS keychain storage for all remote connection secrets via `keytar`
- Remote profile exports are metadata-only and never include credentials
- CI secret scanning and security scan hooks on every build
- Security event logging for sensitive desktop actions
- Safer release automation and automated dependency auditing

**Trust boundaries**

| Boundary | Behavior |
|---|---|
| User-installed plugins | Treated as trusted local code, not sandboxed |
| Local terminal execution | Desktop-power feature with full shell access |
| Remote secrets | Never exported, never stored in plaintext |
| Keychain unavailable | No fallback to plaintext — operation blocked |

**Security references**

- [docs/SECURITY_BASELINE.md](docs/SECURITY_BASELINE.md)
- [docs/PROJECT_AUDIT_TODO.md](docs/PROJECT_AUDIT_TODO.md)
- [security_best_practices_report.md](security_best_practices_report.md)

---

## Tech Stack

**Desktop application**

| Layer | Technology |
|---|---|
| Desktop runtime | Electron 41 |
| Frontend framework | Vue 3 |
| Build tool | Vite 8 |
| UI components | Vuetify 4 |
| State management | Pinia 3 |
| Editor engine | Monaco Editor 0.47 |
| Terminal UI | xterm 5 + @xterm/addon-fit |
| Terminal process | node-pty 1 |
| SFTP | ssh2-sftp-client 12 |
| FTP / FTPS | basic-ftp 5 |
| Secret storage | keytar 7 |
| File watching | chokidar 3 |
| Settings persistence | electron-store 8 |
| Encoding detection | jschardet 3 |
| Encoding conversion | iconv-lite 0.7 |
| File type detection | file-type 22 |
| Icons | @mdi/font 7, @fortawesome/fontawesome-free 7 |
| Utilities | @vueuse/core 14 |

**Website**

| Layer | Technology |
|---|---|
| Framework | Nuxt 4 |
| Deployment | Vercel (static generation) |

**CI / tooling**

| Tool | Purpose |
|---|---|
| electron-builder 26 | Desktop packaging |
| concurrently | Dev server orchestration |
| commander | CLI scripting |
| esbuild | Build optimization |
| npm audit | Dependency vulnerability scanning |

---

## Project Structure

```
AuroraPad/
├── electron/
│   ├── main/
│   │   ├── index.js              # Main process: menus, IPC, terminal, security
│   │   └── remote-manager.js     # SFTP, FTP, FTPS, and SSH connection manager
│   └── preload/
│       └── index.js              # Renderer-safe desktop API bridge
├── src/
│   ├── App.vue                   # Root renderer application and workflow orchestration
│   ├── components/
│   │   ├── CommandPalette.vue    # Command palette (Ctrl+P)
│   │   ├── FileTree.vue          # Sidebar file tree root
│   │   ├── FileTreeFolder.vue    # Recursive folder node
│   │   ├── FindInFiles.vue       # Find in files panel
│   │   ├── FindReplaceBar.vue    # Inline find/replace bar
│   │   ├── MenuBar.vue           # Top application menu bar
│   │   ├── MonacoEditor.vue      # Monaco editor wrapper
│   │   ├── StatusBar.vue         # Bottom status bar
│   │   ├── TabBar.vue            # Document tab bar
│   │   ├── TerminalDock.vue      # Terminal dock container
│   │   ├── TerminalPanel.vue     # Individual terminal session panel
│   │   └── Toolbar.vue           # Top toolbar
│   ├── stores/
│   │   ├── fileTree.js           # File tree state
│   │   ├── plugins.js            # Plugin registry state
│   │   ├── settings.js           # User preferences state
│   │   └── tabs.js               # Tab and document state
│   └── plugins/
│       ├── index.js              # Plugin registry and menu structure builder
│       ├── pluginApi.js          # Plugin API exposed to plugin actions
│       ├── developer-tools.js    # JSON, URL, Base64 tools
│       ├── text-tools.js         # Title case, slugify, statistics
│       ├── selection-tools.js    # Wrap and reverse line operations
│       ├── smart-edit.js         # Duplicate/move lines, toggle comment
│       ├── whitespace-tools.js   # Trim, compress, tab/space conversion
│       ├── sort-lines.js         # Ascending/descending line sort
│       ├── insert-datetime.js    # Date/time insertion
│       └── remove-empty-lines.js # Empty line removal
├── website/                      # Nuxt 4 product website
│   ├── nuxt.config.ts
│   ├── app.vue
│   └── pages/
│       ├── index.vue             # Homepage
│       ├── terms.vue             # Terms of service
│       ├── privacy.vue           # Privacy policy
│       ├── usage.vue             # Usage guide
│       └── license.vue           # License page
├── scripts/                      # Build, release, and maintenance scripts
│   ├── generate-icons.js         # App icon generation
│   ├── run-electron-builder.js   # Electron-builder wrapper
│   ├── security-scan.js          # Security scan runner
│   └── set-version.js            # Version management
├── docs/                         # Architecture and planning documents
│   ├── RELEASE_MANAGEMENT.md
│   ├── SECURITY_BASELINE.md
│   ├── PROJECT_AUDIT_TODO.md
│   └── COMPETITIVE_ROADMAP.md
├── assets/                       # Application icons and branding
├── build/                        # Electron build configuration (entitlements)
├── .github/
│   └── workflows/
│       ├── build.yml             # PR and branch build checks
│       ├── release.yml           # Semantic versioning release pipeline
│       └── security.yml          # Automated security scanning
├── vercel.json                   # Vercel deployment config for website
├── vite.config.mjs               # Vite renderer build config
└── package.json
```

---

## Quick Start

**Requirements**

- Node.js 22 (recommended)
- npm
- macOS, Windows, or Linux desktop OS

**Install and run**

```bash
npm install
npm run electron:dev
```

**Development commands**

```bash
# Renderer-only dev server (browser preview)
npm run dev

# Desktop app with Electron + Vite hot reload
npm run electron:dev

# Production renderer build only
npm run build

# Start Electron with existing build
npm run start

# Security scan
npm run security:scan

# Audit installed package dependencies
npm run security:audit

# Generate application icons
npm run assets:generate-icons

# Set a specific version number
npm run version:set
```

---

## Packaging

Build platform-specific desktop artifacts:

```bash
# macOS (dmg + zip, x64 + arm64)
npm run electron:build:mac

# Windows (NSIS installer + portable, x64)
npm run electron:build:win

# Linux (AppImage + tar.gz, x64)
npm run electron:build:linux
```

Artifacts are written to `release/`.

**Build targets**

| Platform | Formats | Architectures |
|---|---|---|
| macOS | `dmg`, `zip` | x64, arm64 |
| Windows | `nsis` (installer), `portable` | x64 |
| Linux | `AppImage`, `tar.gz` | x64 |

**macOS specifics**

- Hardened runtime enabled
- Notarization configured for Gatekeeper compatibility
- App category: `public.app-category.developer-tools`
- Entitlements: [build/entitlements.mac.plist](build/entitlements.mac.plist)

---

## Website

AuroraPad ships with a Nuxt 4 product website in the same repository.

**Website pages**

| Route | Page |
|---|---|
| `/` | Homepage |
| `/terms` | Terms of service |
| `/privacy` | Privacy policy |
| `/usage` | Usage guide |
| `/license` | License |

**Website commands**

```bash
# Start development server
npm run site:dev

# Generate static site
npm run site:build

# Preview generated site
npm run site:preview
```

The website is statically generated into `website/.output/public/`.

---

### Deploying to Vercel

The repository includes a [`vercel.json`](vercel.json) and [`.vercelignore`](.vercelignore) that handle all Vercel configuration automatically. No manual project settings are required after the initial import.

**Prerequisites**

- A [Vercel account](https://vercel.com)
- The Vercel CLI installed globally (optional — the dashboard import is sufficient for most cases):
  ```bash
  npm install -g vercel
  ```

**Option A — Vercel dashboard (recommended for first-time setup)**

1. Go to [vercel.com/new](https://vercel.com/new) and click **Add New → Project**.
2. Import the AuroraPad GitHub repository.
3. Vercel auto-detects `vercel.json`. Leave all framework and build settings at their defaults — the config file overrides everything.
4. Click **Deploy**. No environment variables are required.

After the first deploy, every push to `main` redeploys automatically. Pushes that only touch non-website files (Electron source, scripts, tests, etc.) are skipped via the `ignoreCommand`.

**Option B — Vercel CLI**

```bash
# First deploy (links the project to Vercel and deploys)
vercel

# Subsequent production deploys
vercel --prod
```

**What the configuration does**

| Setting | Value | Why |
|---|---|---|
| `framework` | `nuxtjs` | Tells Vercel to use the Nuxt preset |
| `installCommand` | `npm ci --ignore-scripts` | Skips `postinstall` which runs `electron-rebuild` — not needed on Vercel builders |
| `buildCommand` | `npm run site:build` | Runs `nuxi generate website` to produce a static site |
| `outputDirectory` | `website/.output/public` | Where Nuxt writes the static output |
| `ignoreCommand` | `git diff --quiet HEAD^ HEAD -- website/` | Cancels the deploy if no files inside `website/` changed |

**What `.vercelignore` excludes**

The `.vercelignore` file prevents Vercel from uploading the Electron app source and build artifacts, keeping the upload small and build fast:

```
electron/
src/
assets/
build/
scripts/
tests/
release/
dist/
```

**Previewing before deploy**

```bash
# Generate the static site locally
npm run site:build

# Serve the output and open in browser
npm run site:preview
```

**Troubleshooting**

| Problem | Fix |
|---|---|
| `electron-rebuild` fails on Vercel | Ensure `installCommand` is `npm ci --ignore-scripts` in `vercel.json` — this skips the `postinstall` script |
| Deploy skipped unexpectedly | The `ignoreCommand` cancelled it because no `website/` files changed. Force a deploy from the Vercel dashboard or run `vercel --prod` |
| Build output not found | Confirm `outputDirectory` is `website/.output/public` and that `nuxi generate website` completed without errors |
| Whole repo uploaded (slow builds) | Check that `.vercelignore` is committed and present at the repo root |

---

## Release Management

AuroraPad uses CI-managed semantic versioning via the release workflow.

**Version bump rules**

| Commit type | Version bump |
|---|---|
| `feat:` | Minor |
| `BREAKING CHANGE:` or `!` suffix | Major |
| All other release commits | Patch |

**Release workflow steps**

1. Resolves the next semantic version from git history and existing tags
2. Builds macOS, Windows, and Linux artifacts in parallel
3. Publishes a tagged public release to the releases repository
4. Persists the released version back to `package.json` and `package-lock.json` only after a successful release

**Relevant files**

- [.github/workflows/release.yml](.github/workflows/release.yml)
- [.github/workflows/build.yml](.github/workflows/build.yml)
- [.github/release.yml](.github/release.yml)
- [docs/RELEASE_MANAGEMENT.md](docs/RELEASE_MANAGEMENT.md)

---

## CI Workflows

| Workflow | File | Trigger | Purpose |
|---|---|---|---|
| Build Artifacts | [build.yml](.github/workflows/build.yml) | Push to non-main branches, pull requests, manual | Build desktop artifacts for Windows, macOS, and Linux to validate the build |
| Release | [release.yml](.github/workflows/release.yml) | Push to main | Resolve semantic version, build all platforms, publish release |
| Security | [security.yml](.github/workflows/security.yml) | Push, pull requests, scheduled | Run security scans and dependency audits |

All build jobs use Node.js 22.

---

## Current Scope Notes

**Included today**

- Local editing and workspace management
- Integrated terminal sessions (multiple)
- Remote browsing and editing over SFTP, FTP, and FTPS
- SSH terminal launch for SFTP sessions
- Remote profile import/export without secret export
- Eight built-in plugins with text, encoding, developer, and line operation actions
- User-installed local plugins via the plugin manager
- CI-based packaging and release automation for all three desktop platforms
- Nuxt 4 product website with Vercel static deployment

**Not included today**

- Remote find in files
- Sandboxed third-party plugin runtime
- Split view editing pane (Monaco editor split is in the roadmap)
- Macro recording and playback
- Built-in Git integration panel
- Plugins Admin / online plugin discovery

---

## Repository Links

- Repository: [github.com/LoopOrigin/AuroraPad](https://github.com/LoopOrigin/AuroraPad)
- Public releases: [github.com/LoopOrigin/AuroraPad-Releases](https://github.com/LoopOrigin/AuroraPad-Releases)
- Source releases: [github.com/LoopOrigin/AuroraPad/releases](https://github.com/LoopOrigin/AuroraPad/releases)

---

## License

AuroraPad is governed by the repository license in [LICENSE](LICENSE).
