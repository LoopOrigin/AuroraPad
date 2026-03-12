# AuroraPad

AuroraPad is a **modern, Notepad++-style editor** built with **Electron 29**, **Vue 3**, **Vite**, and the **Monaco Editor** (VS Code’s editing engine). It mirrors much of Notepad++’s workflow (menus, toolbar, tab bar, status bar, plugins) while adding modern features like a command palette and an integrated terminal.

---

## Key features

- **Familiar Notepad++-style chrome**
  - Top menus (File / Edit / Search / View / Encoding / Language / Settings / Plugins / Window / Help)
  - Toolbar for **New / Open / Save / Cut / Copy / Paste / Find / Replace / Undo / Redo / Zoom**
  - Document **tab bar** with dirty dots, middle‑click close, and drag‑to‑reorder
  - Multi‑segment **status bar**: Language · document length · Ln/Col (double‑click → Go To Line) · EOL (CRLF/LF/CR) · Encoding · Theme · Font size

- **Editing & language support**
  - Monaco Editor with **syntax highlighting and IntelliSense** for dozens of languages
  - Automatic language detection from file extension and content (JS/TS, Vue/Svelte/Astro, HTML/CSS, JSON/JSONC, YAML/TOML/INI/XML, Python, Ruby, Go, Rust, Java, Kotlin, C/C++, C#, PHP, Elixir, Haskell, Scala, Swift, Dart, Lua, Clojure, SQL, shell scripts, PowerShell, Razor, Dockerfile, Markdown, and more)
  - Word wrap, line numbers, current line highlight, minimap, bookmarks, multi‑cursor, line operations (duplicate, move, sort, trim), case conversion, comment/uncomment, and EOL conversion tools

- **Files, sessions & sidebar**
  - **Multi‑tab** editing with dirty indicators and close‑multiple tab actions (Close All, Close Others, Close Unchanged)
  - **File tree sidebar** for opening a folder and browsing files, with chokidar‑based **live watching** and active‑file highlight
  - **Recent files** list in the sidebar and File menu (persisted via `electron-store`)
  - **Session restore**: last session’s tabs, cursors, bookmarks, encoding/EOL, and open folder are restored on restart

- **Search**
  - Monaco **Find / Replace** in the current file (regex, case, whole word)
  - **Find in Files** panel backed by a file‑system search (path masks, regex, case sensitivity), with clickable results

- **Encoding & language**
  - Per‑tab **encoding** (UTF‑8, UTF‑16, Latin1, Windows‑1252, etc.) with basic auto‑detection on open
  - Per‑tab **EOL** and conversion commands (CRLF / LF / CR)
  - **Language menu** to override automatic detection when needed

- **Themes & preferences**
  - Multiple themes: **Aurora Light**, **Aurora Dark**, **Monokai**, **Solarized Dark**
  - Theme switching via Settings and by clicking the **status‑bar theme segment**
  - Editor **font size** and visibility of whitespace, current line, etc. configurable via the Preferences panel and status bar

- **Command Palette**
  - `Ctrl/Cmd+P` opens a VS Code‑style **command palette** for:
    - New file, Open file/folder
    - Opening recent files
    - Running commands (integrated Run… helper)

- **Plugins**
  - **Built‑in plugins**: examples like Insert Date/Time, Sort Lines, Remove Empty Lines exposed under the Plugins menu
  - **User plugins (JS‑based, Notepad++‑style)**
    - Place `.js` files in the app’s **Plugins Folder** (Plugins → Plugin Manager → Open Plugins Folder)
    - Each file exports:
      ```js
      module.exports = {
        id: 'my-plugin',
        name: 'My Plugin',
        version: '1.0.0',
        menuItems: [
          { id: 'action1', label: 'Do Something', run(api) { api.replaceSelection('...') } }
        ]
      }
      ```
    - Plugin API:
      - `api.getContent()`
      - `api.setContent(text)`
      - `api.getSelection()` → `{ text, range }`
      - `api.replaceSelection(text)`
      - `api.getEditor()` → underlying Monaco instance
    - Restart AuroraPad after adding/changing plugins.
  - Note: **Native Notepad++ DLL plugins are not supported**; AuroraPad provides a JS‑driven plugin model instead.

- **Integrated terminal (multi‑shell, multi‑tab)**
  - Bottom **terminal dock** with multiple tabs (Terminal 1, PowerShell, Git Bash, WSL, etc.)
  - Real interactive terminal powered by **`node-pty` + `xterm`**:
    - Default shell (cmd on Windows, `$SHELL` on Unix)
    - **PowerShell**
    - **Git Bash** (common Git for Windows path)
    - **WSL** (`wsl.exe`) when available
  - Per‑dock **profile selector** to choose the default shell for the “+” new‑terminal button
  - Keyboard navigation via the Terminal menu (next/previous terminal)

---

## Tech stack

- **Electron 29** — main process, menus, dialogs, fs access, terminal PTY, plugin folder
- **Vue 3 + Vite** — renderer UI
- **Monaco Editor** — core editor (syntax, IntelliSense, find/replace)
- **Pinia** — stores for tabs, settings, plugins, file tree
- **electron-store** — durable session + recent files
- **chokidar** — live file tree watching
- **iconv-lite**, **jschardet** — encoding detection & conversion
- **node-pty**, **xterm** — integrated terminal

---

## Scripts

```bash
npm install

# Dev: Vite + Electron with live reload
npm run electron:dev

# Production build and run
npm run build
npm run start

# Create packaged app (Electron Builder)
npm run electron:build
```

---

## Project structure

```text
├── electron/
│   ├── main/index.js       # BrowserWindow, menus, IPC, plugins, terminal PTY, session store
│   └── preload/index.js    # Safe bridge: electronAPI.* exposed to renderer
├── src/
│   ├── App.vue             # Main layout, menus, keyboard shortcuts, session logic
│   ├── main.js             # Vue bootstrap, Monaco setup, global styles
│   ├── stores/             # tabs, settings, fileTree, plugins
│   ├── components/
│   │   ├── MenuBar.vue
│   │   ├── Toolbar.vue
│   │   ├── TabBar.vue
│   │   ├── StatusBar.vue
│   │   ├── FileTree.vue / FileTreeFolder.vue
│   │   ├── MonacoEditor.vue
│   │   ├── CommandPalette.vue
│   │   ├── FindInFiles.vue
│   │   ├── TerminalDock.vue
│   │   └── TerminalPanel.vue
│   ├── plugins/            # Built‑in plugins + pluginApi.js
│   └── styles/main.css     # AuroraPad / Notepad++‑style theme
├── plugins/
│   └── example-user-plugin.js   # Sample user plugin
├── LICENSE
└── package.json
```

---

## Usage overview

- **File** — New, Open File/Folder, Save / Save As / Save Copy As / Save All, Close Tab(s), Reload from Disk, recent files
- **Edit** — Undo/Redo, Cut/Copy/Paste, Duplicate/Delete/Move/Join lines, comments, case conversion, bookmarks, whitespace/EOL tools, sort lines
- **Search** — Find / Replace / Find Next / Previous, Go to Line, **Find in Files…**, Command Palette
- **View** — Word Wrap, Line Numbers, Zoom, Toggle Sidebar, theme toggle, minimap, folding, split view, integrated terminal
- **Encoding & Language** — Encoding selection, EOL conversion, language override
- **Settings** — Preferences (appearance & editor behavior)
- **Plugins** — Plugin Manager and user‑defined plugin actions
- **Terminal** — Toggle panel, create **Default / PowerShell / Git Bash / WSL** terminals, cycle between terminals

---

## License

AuroraPad is licensed under the **AuroraPad Non‑Commercial License**:

- You may **view, use, and modify** the source code for **personal and non‑commercial** purposes.
- You may redistribute non‑commercial copies as long as you:
  - keep the license text and copyright;
  - and provide clear **attribution** to AuroraPad (for example “Built with AuroraPad” in an About dialog, README, or footer).
- **Commercial use is not allowed** under this license; a separate commercial license is required.

See `LICENSE` for the full terms.
