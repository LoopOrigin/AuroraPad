# AuroraPad

AuroraPad is a modern desktop editor built with Electron, Vue, Monaco, and Vuetify. It is designed for fast file work, project-wide search, command-driven workflows, and desktop-native editing across macOS, Windows, and Linux.

It takes the familiarity of tools like Notepad++ and combines it with a more current UI, an integrated terminal dock, built-in workflow skills, project search, session restore, CI-managed desktop releases, and a Nuxt-based product website that lives in the same repository.

## Highlights

- Monaco-powered editing with broad language support, bookmarks, split view, minimap, wrapping, whitespace controls, and line operations
- Desktop-style workspace flow with file tree, recent files, session restore, command palette, and find-in-files
- Built-in skills for developer tools, text transformations, and selection helpers
- Integrated terminal dock with multiple sessions and platform-aware shell support
- Preferences for theme, toolbar, status bar, autosave, font size, line numbers, whitespace, minimap, and sidebar visibility
- Semantic versioning and release automation through GitHub Actions
- Included Nuxt marketing website inside `website/`, built alongside the app

## Product Areas

### Editor

- Multi-tab editing with dirty state, restoreable sessions, and active-file awareness
- Search, replace, bookmarks, line move/duplicate/join, sort lines, trim whitespace, and EOL conversion
- Per-file encoding and line-ending controls
- Multiple themes including Aurora Light, Aurora Dark, Monokai, and Solarized Dark

### Workspace

- Folder-based browsing with live file watching
- Recent files in both UI and menu flows
- Find in files across the workspace
- Command palette for common actions and navigation

### Terminal

- Integrated terminal dock with multiple sessions
- Platform-aware shell availability
- Windows support for Command Prompt, PowerShell, Git Bash, and WSL when available
- Context-aware terminal launch from the active file’s directory

### Skills & Plugins

Built-in skills currently include:

- `developer-tools`
  - JSON formatting and minification
  - URL and Base64 encode/decode helpers
  - document hashing actions
- `text-tools`
  - title case
  - slugify
  - text statistics
- `selection-tools`
  - quick wrap helpers
  - reverse lines

AuroraPad also supports user JavaScript plugins loaded from the plugins folder.

## Tech Stack

- Electron
- Vue 3
- Vite
- Nuxt 4
- Monaco Editor
- Vuetify
- Pinia
- electron-store
- chokidar
- node-pty
- xterm

## Development

```bash
npm install

# Desktop renderer dev
npm run dev

# Desktop app dev
npm run electron:dev

# Desktop production build
npm run build

# Nuxt website
npm run site:dev
npm run site:build
npm run site:preview
```

## Packaging

```bash
npm run electron:build:mac
npm run electron:build:win
npm run electron:build:linux
```

Build artifacts are written to `release/`.

## Website

The promotional site is now a Nuxt app that lives in:

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

The website is statically generated with Nuxt into `website/.output/public/`.

For Vercel:

- build command: `npm run site:build`
- output directory: `website/.output/public`
- config file: [vercel.json](/Users/muhammadali/Desktop/LoopOrigin/Projects/AuroraPad/vercel.json)

## Release Management

AuroraPad uses CI-managed semantic versioning starting from `0.1.0`.

- `feat:` commits trigger a minor bump
- `BREAKING CHANGE:` or conventional commits with `!` trigger a major bump
- all other release commits default to patch

The release workflow:

- resolves the next semantic version
- creates and pushes the corresponding git tag
- builds macOS, Windows, and Linux artifacts
- publishes a GitHub Release with uploaded binaries
- writes the released version back to `package.json` and `package-lock.json` only after a successful release

Relevant files:

- [.github/workflows/build.yml](/Users/muhammadali/Desktop/LoopOrigin/Projects/AuroraPad/.github/workflows/build.yml)
- [.github/workflows/release.yml](/Users/muhammadali/Desktop/LoopOrigin/Projects/AuroraPad/.github/workflows/release.yml)
- [.github/release.yml](/Users/muhammadali/Desktop/LoopOrigin/Projects/AuroraPad/.github/release.yml)
- [docs/RELEASE_MANAGEMENT.md](/Users/muhammadali/Desktop/LoopOrigin/Projects/AuroraPad/docs/RELEASE_MANAGEMENT.md)

## Repository Links

- Repository: [github.com/ali111887/AuroraPad](https://github.com/ali111887/AuroraPad)
- Releases: [github.com/ali111887/AuroraPad/releases](https://github.com/ali111887/AuroraPad/releases)

## License

AuroraPad is governed by the repository license in [LICENSE](/Users/muhammadali/Desktop/LoopOrigin/Projects/AuroraPad/LICENSE). Review that file directly for the authoritative terms.
