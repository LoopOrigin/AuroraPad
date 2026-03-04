# Notepad Clone

A **Notepad++-style** editor built with **Electron 29**, **Vue 3**, **Vite**, and **Monaco Editor** (VS Code’s engine). The UI mirrors Notepad++: toolbar, document tabs, multi-segment status bar (language, length, line/col, EOL, encoding), and a **Plugins** menu with built-in and user plugins.

## Features

### Must-have (v1)

- **Notepad++-like UI** — Toolbar (New, Open, Save, Cut/Copy/Paste, Find/Replace), document tab bar, status bar with Language | Length | Ln/Col (double-click → Go to line) | EOL (CRLF/LF/CR) | Encoding
- **Multi-tab editing** — Open multiple files; unsaved indicator (dot) on tabs
- **Syntax highlighting** — Monaco Editor, 80+ languages
- **File tree sidebar** — Open a folder and browse files
- **Line numbers** and **word wrap** — View menu
- **Find & Replace** — Monaco find (regex, case, whole word)
- **Multiple encodings** — UTF-8, UTF-16, Latin1, etc. (status bar + applied on save)
- **EOL** — CRLF / LF / CR in status bar; applied on save
- **Recent files** — Sidebar list + electron-store
- **Dark / Light theme** — View menu
- **Command Palette** — `Ctrl/Cmd+P`
- **Plugins** — Notepad++-style plugin system (see below)

### Plugins

- **Built-in:** Insert Date/Time, Sort Lines (asc/desc), Remove Empty Lines (Plugins menu).
- **User plugins:** Place `.js` files in the **Plugins Folder** (Plugins → Plugin Manager → Open Plugins Folder). Each file must export:
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
  **API:** `api.getContent()`, `api.setContent(text)`, `api.getSelection()` → `{ text, range }`, `api.replaceSelection(text)`, `api.getEditor()` (Monaco instance). Restart the app after adding or changing plugins.
- **Notepad++ plugins:** Native N++ plugins (DLLs) cannot run in this app. This clone provides a **JS-based, N++-style** plugin system (menu items, editor API) instead.

## Tech stack

- **Electron 29** — Main process (menus, fs, dialogs, plugin folder, shell)
- **Vue 3 + Vite** — Renderer
- **Monaco Editor** — Editing, find/replace, syntax
- **Pinia** — Tabs, settings, file tree, plugins
- **electron-store**, **chokidar**, **iconv-lite**, **file-type**

## Scripts

```bash
npm install
npm run electron:dev   # Dev with Electron
npm run build && npm run start   # Production
npm run electron:build # Packaged app
```

## Project structure

```
├── electron/main/index.js   # Menus, IPC, plugin folder, EOL on save
├── electron/preload/index.js
├── src/
│   ├── App.vue
│   ├── stores/              # tabs, settings, fileTree, plugins
│   ├── components/         # Toolbar, TabBar, StatusBar, FileTree, MonacoEditor, CommandPalette
│   ├── plugins/            # Built-in plugins + pluginApi.js
│   └── styles/main.css     # N++-style theme (toolbar, tabs, status bar)
├── plugins/
│   └── example-user-plugin.js   # Sample user plugin (copy to app Plugins Folder)
└── package.json
```

## Usage

- **Toolbar** — New, Open, Save, Cut/Copy/Paste, Find, Replace
- **File** — New, Open File/Folder, Save/Save As, Close Tab, Exit
- **Edit** — Undo/Redo, Cut/Copy/Paste, Find, Replace, Go to Line
- **View** — Word Wrap, Line Numbers, Zoom, Toggle Sidebar, Dark Theme
- **Plugins** — Plugin Manager (list plugins, open plugins folder), then one menu item per plugin action
- **Status bar** — Language, line count/length, Ln/Col (double-click = Go to line), EOL, Encoding

## License

MIT
