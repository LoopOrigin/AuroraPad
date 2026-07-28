# AuroraPad – Notepad++ Feature Checklist

Track what’s done vs pending. Update this file as features are implemented.

---

## File & Session (File menu + tab bar)

| Status | Feature | Notes |
|--------|---------|--------|
| ✅ | New, Open File, Open Folder | File > New / Open… / Open Folder… |
| ✅ | Save, Save All, Save As | |
| ✅ | Close Tab, Exit | File > Close / Exit |
| ✅ | Recent files list (sidebar) | Basic recent list; N++ also has File > Recent Files |
| ✅ | **Session restore** | Reopen last session: tabs, cursor positions, open folder |
| ✅ | Close All, Close All BUT This, Close All Unchanged | Menu: File > Close All / Close All Unchanged |
| ✅ | Save a Copy As… | File > Save a Copy As… |
| ✅ | Reload from disk | File > Reload from Disk, with dirty-check warning |
| 🔲 | Print, Print Preview | File > Print / Print Now |
| ✅ | Open in Default Viewer / Containing Folder | File > Open in Default Viewer, open in Explorer/Finder/cmd |
| 🔲 | Open / Move in New Instance | File > Open in New Instance / Move to New Instance |

---

## Edit

| Status | Feature | Notes |
|--------|---------|--------|
| ✅ | Undo, Redo | |
| ✅ | Cut, Copy, Paste | |
| ✅ | Duplicate Line, Delete Line | |
| ✅ | Move Line Up/Down, Join Lines | |
| ✅ | Toggle Comment | |
| ✅ | Lowercase / UPPERCASE | Basic case conversion |
| ✅ | **Indent / Unindent** | Tab / Shift+Tab — Monaco built-in |
| ✅ | **Trim trailing spaces** | Whitespace Tools plugin |
| ✅ | **EOL conversion menu** | Edit > EOL Conversion (CRLF / LF / CR) |
| 🔲 | Column (block) selection | Alt+drag, Alt+Shift+arrows |
| ✅ | **Bookmarks** | Toggle (Ctrl+F2), Next (F2), Previous (Shift+F2), Clear all |
| ✅ | Multi-cursor / multi-edit | insertCursorAbove/Below, addSelectionToNextFindMatch |
| ✅ | Sort lines (asc/desc) | Sort Lines plugin |
| ✅ | Remove blank lines | Remove Empty Lines plugin |
| 🔲 | TAB / space conversion | Edit > Blank Operations (TAB to Space, Space to TAB) |
| 🔲 | Comment / Uncomment block, stream comment | Separate from line comment |

---

## Search

| Status | Feature | Notes |
|--------|---------|--------|
| ✅ | Find, Replace | Monaco built-in |
| ✅ | Find Next / Previous (F3, Shift+F3) | |
| ✅ | Go to Line | Search > Go to… |
| ✅ | Basic bookmarks | Included in Edit section |
| ✅ | **Find in Files** | Search in folder, file masks, replace in files — Ctrl+Shift+F |
| 🔲 | Mark / highlight all occurrences | Search > Mark |
| 🔲 | Incremental search | Search > Incremental Search |
| 🔲 | Find in current / all open docs | Search > Find in Current Document / All Opened Documents |
| 🔲 | Go to matching brace, find style, smart highlight | Search > Other search commands |
| ✅ | Command palette quick search | AuroraPad Command Palette (Ctrl+P) for files/commands |

---

## View & Layout

| Status | Feature | Notes |
|--------|---------|--------|
| ✅ | Word wrap, Line numbers | |
| ✅ | Zoom In/Out, Reset zoom | |
| ✅ | Toggle sidebar | |
| ✅ | Theme (Light/Dark) | |
| ✅ | **Split view** | View > Split View; edit two files side-by-side |
| ✅ | **Minimap / document map toggle** | View > Show Minimap |
| ✅ | Show whitespace / EOL | View > Show Whitespace |
| 🔲 | Fold / unfold, collapse / expand all | View > Folding |
| 🔲 | Full screen, Always on top | View > Always on Top, etc. |
| ✅ | Toggle toolbar, status bar | View menu toggles for toolbar and status bar |

---

## Encoding & Language

| Status | Feature | Notes |
|--------|---------|--------|
| ✅ | Encoding menu (UTF-8, UTF-16, etc.) | Per-tab encoding |
| ✅ | Language menu | Syntax highlighting per tab |
| ✅ | Auto language from path/content | .vue → HTML, shebang, etc. |
| 🔲 | **Encoding detection** | Detect and convert on open |
| 🔲 | Encode in / Convert to | Notepad++ style Encode/Convert commands |
| 🔲 | **Line ending conversion** | Convert entire file CRLF/LF/CR |
| 🔲 | User Defined Languages (UDL) | Configure and apply custom lexers |

---

## Settings, Tools, Macro & Run

| Status | Feature | Notes |
|--------|---------|--------|
| ✅ | Preferences dialog | Settings > Preferences — word wrap, line numbers, font size, theme, autosave, minimap |
| 🔲 | Style Configurator | Per-token color overrides |
| 🔲 | Shortcut Mapper | Change shortcuts via GUI |
| 🔲 | Import / Export config | Settings > Import / Export |
| ✅ | **Tools: hash generation** | Tools > Hash (MD5 / SHA-1 / SHA-256 / SHA-512) |
| 🔲 | **Macro: Start / Stop / Playback** | Record and replay actions |
| 🔲 | Save & run named macros | Macro > Save Current Recorded Macro… |
| ✅ | **Run** | Run > Run / Run Last — execute current file or custom command |
| ✅ | Run last command | Run > Run Last |

---

## Plugins & Customization

| Status | Feature | Notes |
|--------|---------|--------|
| ✅ | Plugin Manager UI | List plugins, open folder |
| ✅ | Plugins menu (Notepad++ style) | |
| 🔲 | Plugins Admin / plugin discovery | Install/remove plugins from online list |
| 🔲 | Per-plugin config panels | Plugins add dialogs and settings |
| 🔲 | Toolbar customization | Show/hide buttons; custom icon sets |
| 🔲 | Keymap editor UI | Change shortcuts via GUI |
| 🔲 | Theme gallery and switching | Install/switch editor & syntax themes |

---

## Window & Quality of Life

| Status | Feature | Notes |
|--------|---------|--------|
| 🔲 | Document switcher (Ctrl+Tab MRU) | Window > Document List / MRU-style switching |
| ✅ | Sort tabs by name / path / type | Window > Sort Tabs and Command Palette |
| 🔲 | Move/clone to other view | Window > Move/Clone Current Document |
| 🔲 | Pin / color tabs | Tab bar context features |
| ✅ | **Autosave / backup** | View > Preferences > Auto-Save |
| ✅ | **File change detection** | Auto-reload clean tabs; prompt for dirty tabs |
| ✅ | **Session restore** | (see File & Session) |
| 🔲 | System tray integration | Minimize/close to tray, Find in Files from tray |

---

## UI & UX polish

High-level visual and behavior improvements beyond core features.

| Status | Feature | Notes |
|--------|---------|--------|
| 🔲 | Match Notepad++ toolbar density & spacing | Icon sizes, padding, hover states |
| 🔲 | Consistent light/dark theming | Ensure all panels and menus respect theme |
| 🔲 | Improved empty states | Clear guidance when no folder/file is open |
| 🔲 | Keyboard accessibility review | All major actions reachable via shortcuts |
| ✅ | Context menus on tabs | Right-click: Close, Close Others, Copy Path, Reveal in File Manager |
| 🔲 | Smooth icon set and app branding | Finalize toolbar, menu, app, and tray icons |
| 🔲 | High-DPI / scaling checks | Crisp UI on 125–200% scaling |

---

## Modern editor extras (Atom / VS Code inspired)

These are not in classic Notepad++, but are common in editors like Atom, VS Code, Zed, etc.

| Status | Feature | Notes |
|--------|---------|--------|
| ✅ | Integrated terminal | TerminalDock: multi-session xterm.js + node-pty, SSH terminal for remote |
| 🔲 | Built-in Git view | Source control panel: status, commits, diffs, staging |
| 🔲 | Go to Definition / Peek Definition | Jump to symbol definition, inline peek panel |
| 🔲 | Go to Symbol in File / Workspace | Quick symbol search (functions, classes, etc.) |
| 🔲 | Rename Symbol / Refactor helpers | Safe renames and simple refactors |
| 🔲 | Snippet system | Language / user snippets with tabstops and variables |
| 🔲 | Emmet-style expansions | HTML/CSS Emmet expansions in supported languages |
| 🔲 | Tasks / build integration | Run tasks like build/test from within the editor |
| 🔲 | Debugging adapters | Integrated debugger UI (breakpoints, stepping, watch) |
| 🔲 | Workspace & user settings JSON | Per-project settings similar to VS Code’s settings.json |

---

## Legend

- ✅ Done  
- 🔲 Pending  

*Last updated: 2026-07-20 — corrected many 🔲 items already implemented; added tab context menus, file change detection, and extensionless Find in Files.*
