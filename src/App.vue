<template>
  <div class="app-layout">
    <header class="app-menu-bar">
      <MenuBar
        :menus="menuBarMenus"
        @new="menuNew"
        @open="menuOpenFile"
        @close-tab="menuCloseTab"
        @action="onMenuBarAction"
      />
    </header>
    <div class="app-body">
    <aside class="sidebar" :class="{ collapsed: !settingsStore.sidebarVisible }">
      <FileTree @open-file="openFileByPath" />
      <div class="sidebar-section-title">
        <span>Recent</span>
        <button v-if="settingsStore.recentFiles.length" type="button" @click="clearRecent">Clear</button>
      </div>
      <ul class="recent-files-list">
        <li
          v-for="path in settingsStore.recentFiles.slice(0, 10)"
          :key="path"
          :title="path"
          @click="openFileByPath(path)"
        >
          {{ path.split(/[/\\]/).pop() }}
        </li>
      </ul>
    </aside>
    <div class="editor-area">
      <Toolbar
        :can-save="!!(tabsStore.activeTab?.isDirty)"
        :has-editor="!!tabsStore.activeTab"
        :can-save-all="tabsStore.hasDirty"
        @new="menuNew"
        @open="menuOpenFile"
        @save="menuSave"
        @save-all="handleMenu('menu:save-all')"
        @cut="handleMenu('menu:cut')"
        @copy="handleMenu('menu:copy')"
        @paste="handleMenu('menu:paste')"
        @find="handleMenu('menu:find')"
        @replace="handleMenu('menu:replace')"
        @undo="handleMenu('menu:undo')"
        @redo="handleMenu('menu:redo')"
        @toggle-word-wrap="settingsStore.setWordWrap(!settingsStore.wordWrap)"
        @go-to-line="handleMenu('menu:go-to-line')"
        @zoom-in="handleMenu('menu:zoom-in')"
        @zoom-out="handleMenu('menu:zoom-out')"
        @preferences="openPreferences"
      />
      <TabBar />
      <div class="editor-container" :class="{ 'editor-container-split': splitViewEnabled }">
        <template v-if="tabsStore.activeTab">
          <div class="editor-pane primary-pane">
            <div
              :data-tab-id="primaryTab?.id"
              class="monaco-editor-wrapper"
            >
              <MonacoEditor
                ref="monacoEditorRef"
                :model-value="primaryTab?.content || ''"
                :language="primaryTab?.language || 'plaintext'"
                :theme="monacoTheme"
                :word-wrap="settingsStore.wordWrap"
                :line-numbers="settingsStore.lineNumbers"
                :font-size="settingsStore.fontSize"
                :render-whitespace="settingsStore.showWhitespace ? 'all' : 'none'"
                :highlight-current-line="settingsStore.highlightCurrentLine"
                :bookmarks="primaryTab?.bookmarks || []"
                :show-minimap="settingsStore.showMinimap"
                @update:model-value="val => onEditorContentChange('primary', val)"
                @cursor-change="pos => onCursorChange('primary', pos)"
              />
            </div>
          </div>
          <div v-if="splitViewEnabled" class="editor-pane secondary-pane">
            <div
              :data-tab-id="(secondaryTab || primaryTab)?.id + '-secondary'"
              class="monaco-editor-wrapper"
            >
              <MonacoEditor
                ref="monacoEditorSecondaryRef"
                :model-value="(secondaryTab || primaryTab)?.content || ''"
                :language="(secondaryTab || primaryTab)?.language || 'plaintext'"
                :theme="monacoTheme"
                :word-wrap="settingsStore.wordWrap"
                :line-numbers="settingsStore.lineNumbers"
                :font-size="settingsStore.fontSize"
                :render-whitespace="settingsStore.showWhitespace ? 'all' : 'none'"
                :highlight-current-line="settingsStore.highlightCurrentLine"
                :bookmarks="(secondaryTab || primaryTab)?.bookmarks || []"
                :show-minimap="settingsStore.showMinimap"
                @update:model-value="val => onEditorContentChange('secondary', val)"
              />
            </div>
          </div>
        </template>
        <div v-else class="empty-state">
          <p>No file open</p>
          <p>Open a file or folder to get started.</p>
          <button type="button" @click="menuOpenFile">Open File</button>
          <button type="button" @click="menuNew">New File</button>
        </div>
      </div>
      <StatusBar @go-to-line="handleMenu('menu:go-to-line')" />
      <TerminalDock
        v-if="showTerminal"
        ref="terminalDockRef"
        @close="showTerminal = false"
      />
    </div>
    </div>
    <div v-if="showPluginManager" class="plugin-manager-overlay" @click.self="showPluginManager = false">
      <div class="plugin-manager">
        <h2>Plugins</h2>
        <div class="plugin-manager-list">
          <div v-for="p in pluginsStore.plugins" :key="p.id" class="plugin-manager-item">
            <span><strong>{{ p.name }}</strong> {{ p.version || '' }}</span>
          </div>
        </div>
        <div class="plugin-manager-footer">
          Notepad++-style plugins. Add .js files to the plugins folder. Each file must export: <code>module.exports = { id, name, menuItems: [{ id, label, run(api) }] }</code>
        </div>
        <div style="padding: 8px 16px; display: flex; gap: 8px;">
          <button type="button" @click="openPluginsFolder">Open Plugins Folder</button>
          <button type="button" @click="showPluginManager = false">Close</button>
        </div>
      </div>
    </div>
    <div v-if="showPreferences" class="plugin-manager-overlay" @click.self="showPreferences = false">
      <div class="plugin-manager preferences-panel">
        <h2>Preferences</h2>
        <div class="plugin-manager-list preferences-body">
          <div class="preferences-section">
            <div class="preferences-section-title">Appearance</div>
            <div class="plugin-manager-item">
              <div class="preferences-item-main">
                <span class="preferences-label">Theme</span>
                <span class="preferences-hint">Choose a Notepad++-style color scheme.</span>
              </div>
              <select v-model="settingsStore.theme">
                <option value="light">Aurora Light</option>
                <option value="dark">Aurora Dark</option>
                <option value="monokai">Monokai Dark</option>
                <option value="solarized-dark">Solarized Dark</option>
              </select>
            </div>
          </div>
          <div class="preferences-section">
            <div class="preferences-section-title">Editor</div>
            <div class="plugin-manager-item">
              <div class="preferences-item-main">
                <span class="preferences-label">Word Wrap</span>
                <span class="preferences-hint">Wrap long lines instead of scrolling horizontally.</span>
              </div>
              <input
                type="checkbox"
                :checked="settingsStore.wordWrap"
                @change="settingsStore.setWordWrap($event.target.checked)"
              />
            </div>
            <div class="plugin-manager-item">
              <div class="preferences-item-main">
                <span class="preferences-label">Line Numbers</span>
                <span class="preferences-hint">Show line numbers in the editor gutter.</span>
              </div>
              <input
                type="checkbox"
                :checked="settingsStore.lineNumbers"
                @change="settingsStore.setLineNumbers($event.target.checked)"
              />
            </div>
            <div class="plugin-manager-item">
              <div class="preferences-item-main">
                <span class="preferences-label">Editor Font Size</span>
                <span class="preferences-hint">Adjust the main editor font size.</span>
              </div>
              <input
                type="number"
                min="8"
                max="32"
                :value="settingsStore.fontSize"
                @input="settingsStore.setFontSize(Number($event.target.value) || 14)"
              />
            </div>
            <div class="plugin-manager-item">
              <div class="preferences-item-main">
                <span class="preferences-label">Show Whitespace & Tabs</span>
                <span class="preferences-hint">Draw visible markers for spaces and tab characters.</span>
              </div>
              <input
                type="checkbox"
                :checked="settingsStore.showWhitespace"
                @change="settingsStore.setShowWhitespace($event.target.checked)"
              />
            </div>
            <div class="plugin-manager-item">
              <div class="preferences-item-main">
                <span class="preferences-label">Highlight Current Line</span>
                <span class="preferences-hint">Shade the line with the text cursor (caret).</span>
              </div>
              <input
                type="checkbox"
                :checked="settingsStore.highlightCurrentLine"
                @change="settingsStore.setHighlightCurrentLine($event.target.checked)"
              />
            </div>
          </div>
        </div>
        <div class="preferences-footer">
          <button type="button" @click="showPreferences = false">Close</button>
        </div>
      </div>
    </div>
    <CommandPalette
      v-if="showCommandPalette"
      @close="closeCommandPalette"
      @open-file="openFileByPath"
      @open-file-dialog="menuOpenFile"
      @new="menuNew"
      @run-command="runCommandPrompt"
    />
    <FindInFiles
      :visible="showFindInFiles"
      :default-root="fileTreeStore.openFolderPath || ''"
      @close="showFindInFiles = false"
      @open-result="openFindInFilesResult"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useTabsStore } from './stores/tabs'
import { useSettingsStore } from './stores/settings'
import { usePluginsStore } from './stores/plugins'
import { useFileTreeStore } from './stores/fileTree'
import { createPluginApi } from './plugins/pluginApi'
import TabBar from './components/TabBar.vue'
import MonacoEditor from './components/MonacoEditor.vue'
import FileTree from './components/FileTree.vue'
import CommandPalette from './components/CommandPalette.vue'
import StatusBar from './components/StatusBar.vue'
import Toolbar from './components/Toolbar.vue'
import MenuBar from './components/MenuBar.vue'
import FindInFiles from './components/FindInFiles.vue'
import TerminalDock from './components/TerminalDock.vue'

const tabsStore = useTabsStore()
const settingsStore = useSettingsStore()
const pluginsStore = usePluginsStore()
const fileTreeStore = useFileTreeStore()
const monacoEditorRef = ref(null)
const monacoEditorSecondaryRef = ref(null)
const showCommandPalette = ref(false)
const showPluginManager = ref(false)
const showFindInFiles = ref(false)
const showTerminal = ref(false)
const terminalDockRef = ref(null)
const splitViewEnabled = ref(false)
const secondaryTabId = ref(null)
const lastRunCommand = ref('')

const primaryTab = computed(() => tabsStore.activeTab)
const secondaryTab = computed(() => {
  if (!secondaryTabId.value) return null
  return tabsStore.tabs.find(t => t.id === secondaryTabId.value) || null
})

const monacoTheme = computed(() => {
  switch (settingsStore.theme) {
    case 'dark':
      return 'vs-dark'
    case 'monokai':
      return 'aurora-monokai'
    case 'solarized-dark':
      return 'aurora-solarized-dark'
    default:
      return 'vs'
  }
})
const showPreferences = ref(false)

// Notepad++ menu order: File, Edit, Search, View, Encoding, Language, Settings, Plugins, Window, Help
const menuBarMenus = computed(() => [
  {
    id: 'file',
    label: 'File',
    items: [
      { label: 'New', shortcut: 'Ctrl+N', action: 'menu:new', icon: 'fa-solid fa-file' },
      { type: 'separator' },
      { label: 'Open...', shortcut: 'Ctrl+O', action: 'menu:open-file', icon: 'fa-solid fa-folder-open' },
      { label: 'Open Folder...', shortcut: 'Ctrl+Shift+O', action: 'menu:open-folder' },
      { type: 'separator' },
      { label: 'Save', shortcut: 'Ctrl+S', action: 'menu:save', enabled: !!tabsStore.activeTab, icon: 'fa-solid fa-floppy-disk' },
      { label: 'Save All', shortcut: 'Ctrl+Shift+S', action: 'menu:save-all', enabled: !!tabsStore.activeTab, icon: 'fa-solid fa-layer-group' },
      { label: 'Save As...', shortcut: 'F12', action: 'menu:save-as', enabled: !!tabsStore.activeTab },
      { label: 'Save a Copy As...', action: 'menu:save-copy-as', enabled: !!tabsStore.activeTab },
      { label: 'Rename...', action: 'menu:rename', enabled: !!tabsStore.activeTab },
      { type: 'separator' },
      { label: 'Close Tab', shortcut: 'Ctrl+W', action: 'menu:close-tab', enabled: !!tabsStore.activeTab },
      { label: 'Close All', action: 'menu:close-all', enabled: tabsStore.tabs.length > 0 },
      { label: 'Close All But Active', action: 'menu:close-others', enabled: tabsStore.tabs.length > 1 },
      { label: 'Close All Unchanged', action: 'menu:close-all-unchanged', enabled: tabsStore.tabs.some(t => !t.isDirty) },
      { type: 'separator' },
      { label: 'Reload from Disk', action: 'menu:reload-from-disk', enabled: !!tabsStore.activeTab?.path },
      { type: 'separator' },
      { label: 'Open Containing Folder in Explorer', action: 'menu:open-containing-folder:explorer', enabled: !!tabsStore.activeTab?.path },
      { label: 'Open Containing Folder in Command Prompt', action: 'menu:open-containing-folder:cmd', enabled: !!tabsStore.activeTab?.path },
      { label: 'Open Containing Folder as Workspace', action: 'menu:open-containing-folder:faw', enabled: !!tabsStore.activeTab?.path },
      { label: 'Open in Default Viewer', action: 'menu:open-in-default-viewer', enabled: !!tabsStore.activeTab?.path },
      { type: 'separator' },
      { label: 'Open Recent...', action: 'menu:open-recent-dialog', enabled: settingsStore.recentFiles.length > 0 },
      { label: 'Exit', shortcut: 'Alt+F4', action: 'menu:exit' },
    ],
  },
  {
    id: 'edit',
    label: 'Edit',
    items: [
      { label: 'Undo', shortcut: 'Ctrl+Z', action: 'menu:undo', icon: 'fa-solid fa-rotate-left' },
      { label: 'Redo', shortcut: 'Ctrl+Y', action: 'menu:redo', icon: 'fa-solid fa-rotate-right' },
      { type: 'separator' },
      { label: 'Cut', shortcut: 'Ctrl+X', action: 'menu:cut', icon: 'fa-solid fa-scissors' },
      { label: 'Copy', shortcut: 'Ctrl+C', action: 'menu:copy', icon: 'fa-solid fa-copy' },
      { label: 'Paste', shortcut: 'Ctrl+V', action: 'menu:paste', icon: 'fa-solid fa-clipboard' },
      { type: 'separator' },
      { label: 'Duplicate Line', shortcut: 'Ctrl+D', action: 'menu:duplicate-line' },
      { label: 'Delete Line', shortcut: 'Ctrl+L', action: 'menu:delete-line' },
      { label: 'Move Line Up', shortcut: 'Ctrl+Shift+Up', action: 'menu:move-line-up' },
      { label: 'Move Line Down', shortcut: 'Ctrl+Shift+Down', action: 'menu:move-line-down' },
      { label: 'Join Lines', shortcut: 'Ctrl+J', action: 'menu:join-lines' },
      { type: 'separator' },
      { label: 'Toggle Comment', shortcut: 'Ctrl+Q', action: 'menu:toggle-comment' },
      { type: 'separator' },
      { label: 'Lowercase', shortcut: 'Ctrl+U', action: 'menu:lowercase' },
      { label: 'UPPERCASE', shortcut: 'Ctrl+Shift+U', action: 'menu:uppercase' },
      { type: 'separator' },
      { label: 'Find', shortcut: 'Ctrl+F', action: 'menu:find', icon: 'fa-solid fa-magnifying-glass' },
      { label: 'Replace', shortcut: 'Ctrl+H', action: 'menu:replace', icon: 'fa-solid fa-magnifying-glass-arrow-right' },
      { label: 'Go to Line...', shortcut: 'Ctrl+G', action: 'menu:go-to-line', icon: 'fa-solid fa-arrow-down-1-9' },
      { type: 'separator' },
      { label: 'Toggle Bookmark', shortcut: 'Ctrl+F2', action: 'menu:toggle-bookmark' },
      { label: 'Next Bookmark', shortcut: 'F2', action: 'menu:next-bookmark' },
      { label: 'Previous Bookmark', shortcut: 'Shift+F2', action: 'menu:prev-bookmark' },
      { label: 'Clear All Bookmarks', action: 'menu:clear-bookmarks' },
      { type: 'separator' },
      { label: 'EOL Conversion', enabled: false },
      { label: 'Windows (CRLF)', action: 'menu:eol-crlf' },
      { label: 'Unix (LF)', action: 'menu:eol-lf' },
      { label: 'Old Mac (CR)', action: 'menu:eol-cr' },
      { type: 'separator' },
      { label: 'Sort Lines Ascending', action: 'menu:sort-lines-asc' },
      { label: 'Sort Lines Descending', action: 'menu:sort-lines-desc' },
      { label: 'Trim Trailing Whitespace', action: 'menu:trim-trailing-whitespace' },
      { type: 'separator' },
      { label: 'Add Cursor Above', action: 'menu:cursor-add-above' },
      { label: 'Add Cursor Below', action: 'menu:cursor-add-below' },
      { label: 'Select Next Match', action: 'menu:select-next-match' },
    ],
  },
  {
    id: 'search',
    label: 'Search',
    items: [
      { label: 'Find', shortcut: 'Ctrl+F', action: 'menu:find' },
      { label: 'Replace', shortcut: 'Ctrl+H', action: 'menu:replace' },
      { label: 'Find Next', shortcut: 'F3', action: 'menu:find-next' },
      { label: 'Find Previous', shortcut: 'Shift+F3', action: 'menu:find-prev' },
      { label: 'Go to Line...', shortcut: 'Ctrl+G', action: 'menu:go-to-line' },
      { type: 'separator' },
      { label: 'Find in Files…', shortcut: 'Ctrl+Shift+F', action: 'menu:find-in-files' },
      { type: 'separator' },
      { label: 'Command Palette', shortcut: 'Ctrl+P', action: 'menu:command-palette' },
    ],
  },
  {
    id: 'view',
    label: 'View',
    items: [
      { label: 'Word Wrap', action: 'menu:word-wrap-toggle' },
      { label: 'Line Numbers', action: 'menu:line-numbers-toggle' },
      { type: 'separator' },
      { label: 'Zoom In', shortcut: 'Ctrl++', action: 'menu:zoom-in' },
      { label: 'Zoom Out', shortcut: 'Ctrl+-', action: 'menu:zoom-out' },
      { label: 'Reset Zoom', shortcut: 'Ctrl+0', action: 'menu:zoom-reset' },
      { type: 'separator' },
      { label: 'Toggle Sidebar', shortcut: 'Ctrl+B', action: 'menu:toggle-sidebar' },
      { label: 'Dark Theme', action: 'menu:theme-toggle' },
      { type: 'separator' },
      { label: 'Toggle Minimap', action: 'menu:toggle-minimap' },
      { label: 'Toggle Split View', action: 'menu:toggle-split-view' },
      { type: 'separator' },
      { label: 'Fold All', action: 'menu:fold-all' },
      { label: 'Unfold All', action: 'menu:unfold-all' },
      { type: 'separator' },
      { label: 'Toggle Integrated Terminal', action: 'menu:toggle-terminal' },
    ],
  },
  {
    id: 'encoding',
    label: 'Encoding',
    items: [
      { label: 'UTF-8', action: 'menu:encoding:utf8' },
      { label: 'UTF-16 LE', action: 'menu:encoding:utf16le' },
      { label: 'UTF-16 BE', action: 'menu:encoding:utf16be' },
      { label: 'Latin1', action: 'menu:encoding:latin1' },
      { label: 'Windows-1252', action: 'menu:encoding:windows-1252' },
    ],
  },
  {
    id: 'language',
    label: 'Language',
    items: [
      { label: 'Normal', action: 'menu:language:plaintext' },
      { label: 'JavaScript', action: 'menu:language:javascript' },
      { label: 'TypeScript', action: 'menu:language:typescript' },
      { label: 'HTML', action: 'menu:language:html' },
      { label: 'CSS', action: 'menu:language:css' },
      { label: 'JSON', action: 'menu:language:json' },
      { label: 'Markdown', action: 'menu:language:markdown' },
      { label: 'Python', action: 'menu:language:python' },
      { label: 'XML', action: 'menu:language:xml' },
      { type: 'separator' },
      { label: 'C', action: 'menu:language:c' },
      { label: 'C++', action: 'menu:language:cpp' },
      { label: 'C#', action: 'menu:language:csharp' },
      { label: 'Java', action: 'menu:language:java' },
      { label: 'PHP', action: 'menu:language:php' },
      { label: 'Ruby', action: 'menu:language:ruby' },
      { label: 'Go', action: 'menu:language:go' },
      { label: 'Rust', action: 'menu:language:rust' },
      { label: 'SQL', action: 'menu:language:sql' },
      { label: 'Shell Script', action: 'menu:language:shell' },
      { label: 'YAML', action: 'menu:language:yaml' },
    ],
  },
  {
    id: 'settings',
    label: 'Settings',
    items: [
      { label: 'Preferences...', action: 'menu:preferences' },
    ],
  },
  {
    id: 'macro',
    label: 'Macro',
    items: [
      { label: 'Start Recording', enabled: false },
      { label: 'Stop Recording', enabled: false },
      { label: 'Playback', enabled: false },
      { type: 'separator' },
      { label: 'Save Current Recorded Macro', enabled: false },
      { label: 'Run a Macro Multiple Times', enabled: false },
    ],
  },
  {
    id: 'run',
    label: 'Run',
    items: [
      { label: 'Run...', action: 'menu:run-command' },
      { label: 'Run Last Command', action: 'menu:run-last-command', enabled: false },
    ],
  },
  {
    id: 'terminal',
    label: 'Terminal',
    items: [
      { label: 'Toggle Terminal Panel', action: 'menu:toggle-terminal' },
      { label: 'New Default Terminal', action: 'menu:terminal-new-default' },
      { label: 'New PowerShell Terminal', action: 'menu:terminal-new-powershell' },
      { label: 'New Git Bash Terminal', action: 'menu:terminal-new-gitbash' },
      { label: 'New WSL Terminal', action: 'menu:terminal-new-wsl' },
      { label: 'Next Terminal', action: 'menu:terminal-next' },
      { label: 'Previous Terminal', action: 'menu:terminal-prev' },
    ],
  },
  {
    id: 'tools',
    label: 'Tools',
    items: [
      { label: 'MD5 of Document', action: 'menu:hash-md5' },
      { label: 'SHA-1 of Document', action: 'menu:hash-sha1' },
      { label: 'SHA-256 of Document', action: 'menu:hash-sha256' },
    ],
  },
  {
    id: 'plugins',
    label: 'Plugins',
    items: [
      { label: 'Plugin Manager', action: 'menu:plugin-manager' },
      ...(pluginsStore.plugins.length
        ? [
            { type: 'separator' },
            ...pluginsStore.plugins.flatMap(p => (p.menuItems || []).map(m => ({
              label: m.label,
              action: 'menu:plugin-run',
              pluginId: p.id,
              actionId: m.id,
            }))),
          ]
        : []),
    ],
  },
  {
    id: 'window',
    label: 'Window',
    items: [
      { label: 'Close Tab', shortcut: 'Ctrl+W', action: 'menu:close-tab', enabled: !!tabsStore.activeTab },
      { type: 'separator' },
      { label: 'Move to Other View', action: 'menu:move-to-other-view', enabled: !!tabsStore.activeTab && splitViewEnabled.value },
      { label: 'Clone to Other View', action: 'menu:clone-to-other-view', enabled: !!tabsStore.activeTab && splitViewEnabled.value },
    ],
  },
  {
    id: 'help',
    label: 'Help',
    items: [
      { label: 'About', action: 'menu:about' },
    ],
  },
])

onMounted(() => {
  settingsStore.loadRecentFilesFromMain()
  setupMenuListeners()
  setupFolderWatcher()
  setupPlugins()
  setupKeyboardShortcuts()
  restoreSession()
  setupSessionPersistence()
})

function setupKeyboardShortcuts() {
  const keydown = (e) => {
    const target = e.target
    if (
      target &&
      (target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable ||
        target.closest?.('.monaco-editor'))
    ) {
      // Let focused text inputs/editors handle typing and shortcuts
      return
    }

    // Save As via F12 (matches menu hint)
    if (e.key === 'F12') {
      e.preventDefault()
      menuSaveAs()
      return
    }

    // Line move shortcuts (Ctrl+Shift+Up/Down)
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
      e.preventDefault()
      const action = e.key === 'ArrowUp' ? 'menu:move-line-up' : 'menu:move-line-down'
      handleMenu(action)
      return
    }

    // Find next / previous (F3 / Shift+F3)
    if (e.key === 'F3') {
      e.preventDefault()
      handleMenu(e.shiftKey ? 'menu:find-prev' : 'menu:find-next')
      return
    }

    // Bookmark shortcuts (F2, Shift+F2, Ctrl+F2) - handle even when focus in editor
    if (e.key === 'F2') {
      e.preventDefault()
      handleMenu(e.ctrlKey ? 'menu:toggle-bookmark' : (e.shiftKey ? 'menu:prev-bookmark' : 'menu:next-bookmark'))
      return
    }
    if (e.ctrlKey && e.key === 'F2') {
      e.preventDefault()
      handleMenu('menu:toggle-bookmark')
      return
    }

    if (e.ctrlKey || e.metaKey) {
      switch (e.key?.toLowerCase()) {
        case 'n':
          e.preventDefault()
          menuNew()
          break
        case 'o':
          e.preventDefault()
          if (!e.shiftKey) menuOpenFile()
          else menuOpenFolder()
          break
        case 's':
          e.preventDefault()
          if (e.shiftKey) menuSaveAll()
          else menuSave()
          break
        case 'w':
          e.preventDefault()
          menuCloseTab()
          break
        case 'z':
          e.preventDefault()
          handleMenu('menu:undo')
          break
        case 'y':
          e.preventDefault()
          handleMenu('menu:redo')
          break
        case 'x':
          e.preventDefault()
          handleMenu('menu:cut')
          break
        case 'c':
          e.preventDefault()
          handleMenu('menu:copy')
          break
        case 'v':
          e.preventDefault()
          handleMenu('menu:paste')
          break
        case 'd':
          e.preventDefault()
          handleMenu('menu:duplicate-line')
          break
        case 'l':
          e.preventDefault()
          handleMenu('menu:delete-line')
          break
        case 'j':
          e.preventDefault()
          handleMenu('menu:join-lines')
          break
        case 'u':
          e.preventDefault()
          handleMenu(e.shiftKey ? 'menu:uppercase' : 'menu:lowercase')
          break
        case 'q':
          e.preventDefault()
          handleMenu('menu:toggle-comment')
          break
        case 'f':
          e.preventDefault()
          if (e.shiftKey) handleMenu('menu:find-in-files')
          else handleMenu('menu:find')
          break
        case 'h':
          e.preventDefault()
          handleMenu('menu:replace')
          break
        case 'g':
          e.preventDefault()
          handleMenu('menu:go-to-line')
          break
        case 'p':
          e.preventDefault()
          showCommandPalette.value = true
          break
        case 'tab':
          // Ctrl+Tab: cycle to next tab
          e.preventDefault()
          cycleTab(1)
          break
        case 'b':
          e.preventDefault()
          settingsStore.setSidebarVisible(!settingsStore.sidebarVisible)
          break
        default:
          break
      }
    }
  }
  window.addEventListener('keydown', keydown)
  onBeforeUnmount(() => window.removeEventListener('keydown', keydown))
}

function cycleTab(direction) {
  const list = tabsStore.tabs
  if (!list.length) return
  const currentIndex = list.findIndex(t => t.id === tabsStore.activeTabId)
  const nextIndex = (currentIndex + direction + list.length) % list.length
  const next = list[nextIndex]
  if (next) tabsStore.setActive(next.id)
}

async function setupPlugins() {
  pluginsStore.loadBuiltInPlugins()
  await pluginsStore.loadUserPlugins()
  if (window.electronAPI?.sendPluginMenuStructure) {
    window.electronAPI.sendPluginMenuStructure(pluginsStore.getMenuStructureForMain())
  }
  if (window.electronAPI?.onMenuPluginRun) {
    window.electronAPI.onMenuPluginRun((payload) => {
      const api = createPluginApi(
        () => monacoEditorRef.value,
        () => tabsStore.activeTab,
        (id, text) => tabsStore.setContent(id, text)
      )
      pluginsStore.runAction(payload.pluginId, payload.actionId, api)
    })
  }
}

function setupFolderWatcher() {
  if (!window.electronAPI?.onFolderChanged) return
  window.electronAPI.onFolderChanged(async ({ root }) => {
    if (fileTreeStore.openFolderPath === root) {
      fileTreeStore.loadTree(root)
    }
  })
}

const SESSION_MAX_TABS = 30
let sessionSaveTimeout = null

async function restoreSession() {
  if (!window.electronAPI?.getSession) return
  const session = await window.electronAPI.getSession()
  if (!session?.tabs?.length) return

  if (session.openFolderPath) {
    fileTreeStore.setOpenFolder(session.openFolderPath)
    await window.electronAPI.watchFolder(session.openFolderPath).catch(() => {})
  }

  const tabs = session.tabs.slice(0, SESSION_MAX_TABS)
  let activeId = null

  for (let i = 0; i < tabs.length; i++) {
    const t = tabs[i]
    const opts = {
      encoding: t.encoding || 'utf8',
      eol: t.eol || 'crlf',
      language: t.language || 'plaintext',
      cursorPosition: t.cursorPosition || { line: 1, column: 1 },
      bookmarks: t.bookmarks || [],
      isDirty: false,
    }
    if (t.path) {
      const result = await window.electronAPI.readFile(t.path, opts.encoding)
      if (result.error) continue
      opts.path = t.path
      opts.content = result.content
      opts.encoding = result.encoding || opts.encoding
    } else {
      opts.content = t.content ?? ''
      opts.name = t.name || 'Untitled'
      opts.isDirty = !!t.content
    }
    const id = tabsStore.addTab(opts)
    if (i === (session.activeIndex ?? 0)) activeId = id
  }

  if (activeId) tabsStore.setActive(activeId)

  const activeTab = tabsStore.activeTab
  if (activeTab?.cursorPosition) {
    setTimeout(() => {
      const ed = monacoEditorRef.value?.getEditor()
      if (ed && activeTab.cursorPosition) {
        ed.setPosition({
          lineNumber: activeTab.cursorPosition.line,
          column: activeTab.cursorPosition.column,
        })
      }
    }, 150)
  }
}

function saveSession() {
  if (!window.electronAPI?.setSession) return
  const tabs = tabsStore.tabs.slice(0, SESSION_MAX_TABS).map(t => ({
    path: t.path ?? null,
    name: t.name ?? null,
    content: t.path ? undefined : (t.content ?? ''),
    cursorPosition: {
      line: t.cursorPosition?.line ?? 1,
      column: t.cursorPosition?.column ?? 1,
    },
    bookmarks: Array.isArray(t.bookmarks) ? [...t.bookmarks] : [],
    encoding: t.encoding || 'utf8',
    eol: t.eol || 'crlf',
    language: t.language || 'plaintext',
  }))
  const activeIndex = Math.max(0, tabsStore.tabs.findIndex(t => t.id === tabsStore.activeTabId))
  window.electronAPI.setSession({
    tabs,
    activeIndex,
    openFolderPath: fileTreeStore.openFolderPath || null,
  })
}

function setupSessionPersistence() {
  if (!window.electronAPI?.setSession) return

  function scheduleSave() {
    if (sessionSaveTimeout) clearTimeout(sessionSaveTimeout)
    sessionSaveTimeout = setTimeout(saveSession, 500)
  }

  watch(() => [tabsStore.tabs.length, tabsStore.activeTabId], scheduleSave)
  watch(() => fileTreeStore.openFolderPath, scheduleSave)
  watch(() => tabsStore.tabs.map(t => ({ id: t.id, path: t.path, cursorPosition: t.cursorPosition })), scheduleSave, { deep: true })
  window.addEventListener('beforeunload', () => saveSession())
}

function setupMenuListeners() {
  if (!window.electronAPI?.onMenu) return
  const channels = [
    'menu:new', 'menu:open-file', 'menu:open-folder', 'menu:save', 'menu:save-all', 'menu:save-as',
    'menu:close-tab', 'menu:close-all', 'menu:close-others',
    'menu:undo', 'menu:redo', 'menu:cut', 'menu:copy', 'menu:paste',
    'menu:find', 'menu:replace', 'menu:go-to-line', 'menu:word-wrap', 'menu:line-numbers',
    'menu:zoom-in', 'menu:zoom-out', 'menu:zoom-reset', 'menu:toggle-sidebar', 'menu:theme',
    'menu:command-palette', 'menu:plugin-manager', 'menu:preferences', 'menu:about', 'menu:find-in-files',
    'menu:save-copy-as', 'menu:rename', 'menu:reload-from-disk',
    'menu:open-containing-folder:explorer', 'menu:open-containing-folder:cmd', 'menu:open-containing-folder:faw',
    'menu:open-in-default-viewer', 'menu:open-all-recent', 'menu:restore-recent', 'menu:clear-recent',
    'menu:toggle-terminal',
    'menu:terminal-new-default', 'menu:terminal-new-powershell', 'menu:terminal-new-gitbash', 'menu:terminal-new-wsl',
    'menu:terminal-next', 'menu:terminal-prev',
  ]
  channels.forEach(channel => {
    window.electronAPI.onMenu(channel, (...args) => handleMenu(channel, ...args))
  })
}

function onMenuBarAction(action, item) {
  if (action === 'menu:plugin-run' && item.pluginId != null && item.actionId != null) {
    const api = createPluginApi(
      () => monacoEditorRef.value,
      () => tabsStore.activeTab,
      (id, text) => tabsStore.setContent(id, text)
    )
    pluginsStore.runAction(item.pluginId, item.actionId, api)
    return
  }
  if (action.startsWith('menu:encoding:')) {
    const enc = action.replace('menu:encoding:', '')
    if (tabsStore.activeTab) tabsStore.updateTab(tabsStore.activeTabId, { encoding: enc })
    return
  }
  if (action.startsWith('menu:language:')) {
    const lang = action.replace('menu:language:', '')
    if (tabsStore.activeTab) tabsStore.updateTab(tabsStore.activeTabId, { language: lang })
    return
  }
  if (action === 'menu:word-wrap-toggle') {
    settingsStore.setWordWrap(!settingsStore.wordWrap)
    return
  }
  if (action === 'menu:line-numbers-toggle') {
    settingsStore.setLineNumbers(!settingsStore.lineNumbers)
    return
  }
  if (action === 'menu:toggle-minimap') {
    settingsStore.setShowMinimap(!settingsStore.showMinimap)
    return
  }
  if (action === 'menu:toggle-split-view') {
    splitViewEnabled.value = !splitViewEnabled.value
    return
  }
  if (action === 'menu:fold-all') {
    monacoEditorRef.value?.getEditor()?.trigger('keyboard', 'editor.foldAll')
    monacoEditorSecondaryRef.value?.getEditor()?.trigger('keyboard', 'editor.foldAll')
    return
  }
  if (action === 'menu:unfold-all') {
    monacoEditorRef.value?.getEditor()?.trigger('keyboard', 'editor.unfoldAll')
    monacoEditorSecondaryRef.value?.getEditor()?.trigger('keyboard', 'editor.unfoldAll')
    return
  }
  if (action === 'menu:toggle-terminal') {
    showTerminal.value = !showTerminal.value
    return
  }
  if (action === 'menu:terminal-new-default') {
    if (!showTerminal.value) showTerminal.value = true
    terminalDockRef.value?.newSession?.('default')
    return
  }
  if (action === 'menu:terminal-new-powershell') {
    if (!showTerminal.value) showTerminal.value = true
    terminalDockRef.value?.newSession?.('powershell')
    return
  }
  if (action === 'menu:terminal-new-gitbash') {
    if (!showTerminal.value) showTerminal.value = true
    terminalDockRef.value?.newSession?.('bash')
    return
  }
  if (action === 'menu:terminal-new-wsl') {
    if (!showTerminal.value) showTerminal.value = true
    terminalDockRef.value?.newSession?.('wsl')
    return
  }
  if (action === 'menu:terminal-next') {
    terminalDockRef.value?.nextSession?.()
    return
  }
  if (action === 'menu:terminal-prev') {
    terminalDockRef.value?.prevSession?.()
    return
  }
  if (action === 'menu:move-to-other-view') {
    if (tabsStore.activeTabId && splitViewEnabled.value) {
      secondaryTabId.value = tabsStore.activeTabId
    }
    return
  }
  if (action === 'menu:clone-to-other-view') {
    if (tabsStore.activeTabId && splitViewEnabled.value) {
      secondaryTabId.value = tabsStore.activeTabId
    }
    return
  }
  if (action === 'menu:hash-md5' || action === 'menu:hash-sha1' || action === 'menu:hash-sha256') {
    runHashTool(action)
    return
  }
  if (action === 'menu:run-command') {
    runCommandPrompt()
    return
  }
  if (action === 'menu:run-last-command') {
    runLastCommand()
    return
  }
  if (action === 'menu:theme-toggle') {
    const next = settingsStore.theme === 'dark' ? 'light' : 'dark'
    settingsStore.setTheme(next)
    return
  }
  if (action === 'menu:preferences') {
    showPreferences.value = true
    return
  }
  if (action === 'menu:exit') {
    if (window.electronAPI?.quit) window.electronAPI.quit()
    return
  }
  if (action === 'menu:about') {
    alert('AuroraPad\nA modern, Notepad++-style editor for Windows.\n\nBuilt with Electron, Vue 3, and the Monaco editor.\n\nHighlights:\n• Multi-tab editing with bookmarks\n• Plugin system inspired by Notepad++\n• Status bar with encoding and EOL controls\n• Command palette and rich keyboard shortcuts')
    return
  }
  handleMenu(action)
}

function menuCloseTab() {
  if (tabsStore.activeTab) {
    const id = tabsStore.activeTabId
    if (tabsStore.getTab(id)?.isDirty && !confirm('Unsaved changes. Close anyway?')) return
    tabsStore.closeTab(id)
  }
}

function menuCloseAll() {
  if (!tabsStore.tabs.length) return
  if (tabsStore.hasDirty && !confirm('There are unsaved changes. Close all tabs anyway?')) return
  tabsStore.closeAll()
}

function menuCloseOthers() {
  const id = tabsStore.activeTabId
  if (!id) return
  if (tabsStore.hasDirty && !confirm('There are unsaved changes in other tabs. Close them anyway?')) return
  tabsStore.closeOthers(id)
}

function menuCloseAllUnchanged() {
  if (!tabsStore.tabs.length) return
  if (!tabsStore.tabs.some(t => !t.isDirty)) return
  if (!confirm('Close all tabs that have no unsaved changes?')) return
  tabsStore.closeAllUnchanged()
}

function handleMenu(channel, ...args) {
  switch (channel) {
    case 'menu:new':
      menuNew()
      break
    case 'menu:open-file':
      menuOpenFile()
      break
    case 'menu:open-folder':
      menuOpenFolder()
      break
    case 'menu:save':
      menuSave()
      break
    case 'menu:save-all':
      menuSaveAll()
      break
    case 'menu:save-as':
      menuSaveAs()
      break
    case 'menu:save-copy-as':
      menuSaveCopyAs()
      break
    case 'menu:close-tab':
      if (tabsStore.activeTab) {
        const id = tabsStore.activeTabId
        if (tabsStore.getTab(id)?.isDirty && !confirm('Unsaved changes. Close anyway?')) return
        tabsStore.closeTab(id)
      }
      break
    case 'menu:close-all':
      menuCloseAll()
      break
    case 'menu:close-others':
      menuCloseOthers()
      break
    case 'menu:close-all-unchanged':
      menuCloseAllUnchanged()
      break
    case 'menu:close-all-unchanged':
      menuCloseAllUnchanged()
      break
    case 'menu:undo':
      monacoEditorRef.value?.getEditor()?.trigger('keyboard', 'undo')
      break
    case 'menu:redo':
      monacoEditorRef.value?.getEditor()?.trigger('keyboard', 'redo')
      break
    case 'menu:cut':
      monacoEditorRef.value?.getEditor()?.trigger('keyboard', 'editor.action.clipboardCutAction')
      break
    case 'menu:copy':
      monacoEditorRef.value?.getEditor()?.trigger('keyboard', 'editor.action.clipboardCopyAction')
      break
    case 'menu:paste':
      monacoEditorRef.value?.getEditor()?.trigger('keyboard', 'editor.action.clipboardPasteAction')
      break
    case 'menu:find':
      setTimeout(() => monacoEditorRef.value?.getEditor()?.trigger('keyboard', 'actions.find'), 100)
      break
    case 'menu:replace':
      setTimeout(() => monacoEditorRef.value?.getEditor()?.trigger('keyboard', 'editor.action.startFindReplaceAction'), 100)
      break
    case 'menu:find-in-files':
      showFindInFiles.value = true
      break
    case 'menu:go-to-line':
      monacoEditorRef.value?.getEditor()?.trigger('keyboard', 'editor.action.gotoLine')
      break
    case 'menu:toggle-bookmark': {
      const id = tabsStore.activeTabId
      if (id && monacoEditorRef.value) {
        const line = monacoEditorRef.value.getCurrentLine()
        if (line != null) tabsStore.toggleBookmark(id, line)
      }
      break
    }
    case 'menu:next-bookmark': {
      const id = tabsStore.activeTabId
      if (!id) break
      const bm = tabsStore.getBookmarks(id)
      const line = monacoEditorRef.value?.getCurrentLine() ?? 1
      const next = bm.find(l => l > line) ?? bm[0]
      if (next != null) {
        monacoEditorRef.value?.setPosition({ lineNumber: next, column: 1 })
        monacoEditorRef.value?.getEditor()?.revealLine(next)
      }
      break
    }
    case 'menu:prev-bookmark': {
      const id = tabsStore.activeTabId
      if (!id) break
      const bm = tabsStore.getBookmarks(id)
      const line = monacoEditorRef.value?.getCurrentLine() ?? 1
      const prev = [...bm].reverse().find(l => l < line) ?? bm[bm.length - 1]
      if (prev != null) {
        monacoEditorRef.value?.setPosition({ lineNumber: prev, column: 1 })
        monacoEditorRef.value?.getEditor()?.revealLine(prev)
      }
      break
    }
    case 'menu:clear-bookmarks':
      if (tabsStore.activeTabId) tabsStore.clearBookmarks(tabsStore.activeTabId)
      break
    case 'menu:duplicate-line':
      monacoEditorRef.value?.getEditor()?.trigger('keyboard', 'editor.action.copyLinesDownAction')
      break
    case 'menu:delete-line':
      monacoEditorRef.value?.getEditor()?.trigger('keyboard', 'editor.action.deleteLines')
      break
    case 'menu:move-line-up':
      monacoEditorRef.value?.getEditor()?.trigger('keyboard', 'editor.action.moveLinesUpAction')
      break
    case 'menu:move-line-down':
      monacoEditorRef.value?.getEditor()?.trigger('keyboard', 'editor.action.moveLinesDownAction')
      break
    case 'menu:join-lines':
      monacoEditorRef.value?.getEditor()?.trigger('keyboard', 'editor.action.joinLines')
      break
    case 'menu:lowercase':
      monacoEditorRef.value?.getEditor()?.trigger('keyboard', 'editor.action.transformToLowercase')
      break
    case 'menu:uppercase':
      monacoEditorRef.value?.getEditor()?.trigger('keyboard', 'editor.action.transformToUppercase')
      break
    case 'menu:toggle-comment':
      monacoEditorRef.value?.getEditor()?.trigger('keyboard', 'editor.action.commentLine')
      break
    case 'menu:eol-crlf':
      convertEol('crlf')
      break
    case 'menu:eol-lf':
      convertEol('lf')
      break
    case 'menu:eol-cr':
      convertEol('cr')
      break
    case 'menu:find-next':
      monacoEditorRef.value?.getEditor()?.trigger('keyboard', 'editor.action.nextMatchFindAction')
      break
    case 'menu:find-prev':
      monacoEditorRef.value?.getEditor()?.trigger('keyboard', 'editor.action.previousMatchFindAction')
      break
    case 'menu:sort-lines-asc':
      monacoEditorRef.value?.getEditor()?.trigger('keyboard', 'editor.action.sortLinesAscending')
      break
    case 'menu:sort-lines-desc':
      monacoEditorRef.value?.getEditor()?.trigger('keyboard', 'editor.action.sortLinesDescending')
      break
    case 'menu:trim-trailing-whitespace':
      monacoEditorRef.value?.getEditor()?.getAction('editor.action.trimTrailingWhitespace')?.run()
      break
    case 'menu:cursor-add-above':
      monacoEditorRef.value?.getEditor()?.trigger('keyboard', 'editor.action.insertCursorAbove')
      break
    case 'menu:cursor-add-below':
      monacoEditorRef.value?.getEditor()?.trigger('keyboard', 'editor.action.insertCursorBelow')
      break
    case 'menu:select-next-match':
      monacoEditorRef.value?.getEditor()?.trigger('keyboard', 'editor.action.addSelectionToNextFindMatch')
      break
    case 'menu:word-wrap':
      settingsStore.setWordWrap(args[0])
      break
    case 'menu:line-numbers':
      settingsStore.setLineNumbers(args[0])
      break
    case 'menu:zoom-in':
      settingsStore.setFontSize(settingsStore.fontSize + 1)
      break
    case 'menu:zoom-out':
      settingsStore.setFontSize(settingsStore.fontSize - 1)
      break
    case 'menu:zoom-reset':
      settingsStore.setFontSize(14)
      break
    case 'menu:toggle-sidebar':
      settingsStore.setSidebarVisible(!settingsStore.sidebarVisible)
      break
    case 'menu:theme':
      settingsStore.setTheme(args[0] || 'light')
      break
    case 'menu:command-palette':
      showCommandPalette.value = true
      break
    case 'menu:plugin-manager':
      showPluginManager.value = true
      break
    case 'menu:preferences':
      showPreferences.value = true
      break
    case 'menu:reload-from-disk':
      reloadFromDisk()
      break
    case 'menu:open-containing-folder:explorer':
      openContainingFolder('explorer')
      break
    case 'menu:open-containing-folder:cmd':
      openContainingFolder('cmd')
      break
    case 'menu:open-containing-folder:faw':
      openContainingFolder('faw')
      break
    case 'menu:open-in-default-viewer':
      openInDefaultViewer()
      break
    case 'menu:open-all-recent':
      openAllRecent()
      break
    case 'menu:restore-recent':
      restoreRecent()
      break
    case 'menu:clear-recent':
      clearRecent()
      break
    default:
      break
  }
}

function onEditorContentChange(which, value) {
  if (!value) value = ''
  if (which === 'secondary' && secondaryTab.value) {
    tabsStore.setContent(secondaryTab.value.id, value)
    return
  }
  if (primaryTab.value) {
    tabsStore.setContent(primaryTab.value.id, value)
  }
}

function onCursorChange(which, pos) {
  const target = which === 'secondary' ? secondaryTab.value : primaryTab.value
  if (target && pos) {
    tabsStore.updateTab(target.id, { cursorPosition: { line: pos.line, column: pos.column } })
  }
}

async function menuNew() {
  tabsStore.addTab({ content: '', name: 'Untitled' })
}

async function menuOpenFile() {
  if (!window.electronAPI) return
  const paths = await window.electronAPI.openFileDialog()
  if (paths?.length) {
    for (const p of paths) await openFileByPath(p)
  }
}

async function menuOpenFolder() {
  if (!window.electronAPI) return
  const path = await window.electronAPI.openFolderDialog()
  if (path) {
    fileTreeStore.setOpenFolder(path)
    await window.electronAPI.watchFolder(path)
  }
}

async function openFileByPath(filePath) {
  if (!window.electronAPI) return
  const result = await window.electronAPI.readFile(filePath)
  if (result.error) {
    if (result.binary) alert('Binary files cannot be opened as text.')
    else alert('Failed to read file: ' + result.error)
    return
  }
  tabsStore.addTab({
    path: filePath,
    content: result.content,
    encoding: result.encoding || 'utf8',
    language: tabsStore.inferLanguage?.(filePath, result.content),
    isDirty: false,
  })
}

async function menuSave() {
  const tab = tabsStore.activeTab
  if (!tab || !tab.isDirty) return
  let path = tab.path
  if (!path) {
    path = await window.electronAPI?.saveFileDialog(null, tab.name)
    if (!path) return
    tabsStore.updateTab(tab.id, {
      path,
      name: path.split(/[/\\]/).pop(),
      language: tabsStore.inferLanguage?.(path, tab.content),
    })
  }
  const content = applyEol(tab.content, tab.eol || 'crlf')
  const result = await window.electronAPI.writeFile(path, content, tab.encoding)
  if (result.error) {
    alert('Save failed: ' + result.error)
    return
  }
  tabsStore.setDirty(tab.id, false)
}

async function menuSaveAll() {
  const dirtyTabs = tabsStore.tabs.filter(t => t.isDirty)
  for (const tab of dirtyTabs) {
    let path = tab.path
    if (!path) {
      path = await window.electronAPI?.saveFileDialog(null, tab.name)
      if (!path) continue
      tabsStore.updateTab(tab.id, {
        path,
        name: path.split(/[/\\]/).pop(),
        language: tabsStore.inferLanguage?.(path, tab.content),
      })
    }
    const content = applyEol(tab.content, tab.eol || 'crlf')
    const result = await window.electronAPI.writeFile(path, content, tab.encoding)
    if (!result.error) {
      tabsStore.setDirty(tab.id, false)
    }
  }
}

function applyEol(text, eol) {
  const normalized = (text || '').replace(/\r\n|\r/g, '\n')
  if (eol === 'crlf') return normalized.replace(/\n/g, '\r\n')
  if (eol === 'cr') return normalized.replace(/\n/g, '\r')
  return normalized
}

function convertEol(eol) {
  const tab = tabsStore.activeTab
  if (!tab) return
  const converted = applyEol(tab.content, eol)
  tabsStore.updateTab(tab.id, { content: converted, eol })
  tabsStore.setDirty(tab.id, true)
}

async function openFindInFilesResult(result) {
  if (!result?.path) return
  await openFileByPath(result.path)
  const ed = monacoEditorRef.value?.getEditor()
  if (ed && result.line) {
    ed.setPosition({ lineNumber: result.line, column: result.column || 1 })
    ed.revealLineInCenter(result.line)
  }
  showFindInFiles.value = false
}

async function menuSaveAs() {
  const tab = tabsStore.activeTab
  if (!tab) return
  const path = await window.electronAPI?.saveFileDialog(tab.path, tab.name)
  if (!path) return
  const content = applyEol(tab.content, tab.eol || 'crlf')
  const result = await window.electronAPI.writeFile(path, content, tab.encoding)
  if (result.error) {
    alert('Save failed: ' + result.error)
    return
  }
  tabsStore.updateTab(tab.id, {
    path,
    name: path.split(/[/\\]/).pop(),
    language: tabsStore.inferLanguage?.(path, tab.content),
    isDirty: false,
  })
}

async function menuSaveCopyAs() {
  const tab = tabsStore.activeTab
  if (!tab) return
  const path = await window.electronAPI?.saveFileDialog(tab.path, tab.name)
  if (!path) return
  const content = applyEol(tab.content, tab.eol || 'crlf')
  const result = await window.electronAPI.writeFile(path, content, tab.encoding)
  if (result.error) {
    alert('Save failed: ' + result.error)
  }
}

async function reloadFromDisk() {
  const tab = tabsStore.activeTab
  if (!tab?.path) return
  if (tab.isDirty && !confirm('Reload from disk and lose unsaved changes?')) return
  const result = await window.electronAPI.readFile(tab.path, tab.encoding || 'utf8')
  if (result.error) {
    alert('Failed to reload file: ' + result.error)
    return
  }
  tabsStore.updateTab(tab.id, {
    content: result.content,
    encoding: result.encoding || tab.encoding,
    isDirty: false,
    bookmarks: [],
  })
}

async function openContainingFolder(kind) {
  const tab = tabsStore.activeTab
  if (!tab?.path) return
  const full = tab.path
  const dir = full.replace(/[\\/][^\\/]+$/, '')
  if (kind === 'faw') {
    fileTreeStore.setOpenFolder(dir)
    await window.electronAPI.watchFolder(dir)
    return
  }
  if (kind === 'explorer') {
    // showItemInFolder will highlight the file; this is close to Explorer behavior
    await window.electronAPI.openInDefaultViewer(dir)
    return
  }
  if (kind === 'cmd') {
    // For now, open the folder itself in default shell
    await window.electronAPI.openInDefaultViewer(dir)
  }
}

async function openInDefaultViewer() {
  const tab = tabsStore.activeTab
  if (!tab?.path) return
  const result = await window.electronAPI.openInDefaultViewer(tab.path)
  if (result?.error) {
    alert('Failed to open in default viewer: ' + result.error)
  }
}

async function openAllRecent() {
  const recent = settingsStore.recentFiles || []
  for (const p of recent) {
    await openFileByPath(p)
  }
}

async function restoreRecent() {
  const recent = settingsStore.recentFiles || []
  if (!recent.length) return
  await openFileByPath(recent[0])
}

function clearRecent() {
  settingsStore.clearRecentFiles()
}

function closeCommandPalette() {
  showCommandPalette.value = false
}

async function openPluginsFolder() {
  await window.electronAPI?.openPluginsFolder?.()
}

function openPreferences() {
  showPreferences.value = true
}

async function runHashTool(action) {
  const tab = tabsStore.activeTab
  if (!tab) return
  const text = tab.content || ''
  const algo = action === 'menu:hash-sha1' ? 'sha1' : action === 'menu:hash-sha256' ? 'sha256' : 'md5'
  const result = await window.electronAPI.getHash(algo, text)
  if (result?.error) {
    alert('Hash failed: ' + result.error)
    return
  }
  const label = algo.toUpperCase()
  alert(`${label} of current document:\n\n${result.value}`)
}

async function runCommandPrompt() {
  const cmd = prompt('Run command (will execute on your machine):', lastRunCommand.value || '')
  if (!cmd) return
  lastRunCommand.value = cmd
  const result = await window.electronAPI.runCommand(cmd)
  if (result?.error) {
    alert(`Command failed:\n${result.error}\n\nSTDOUT:\n${result.stdout || ''}\n\nSTDERR:\n${result.stderr || ''}`)
    return
  }
  alert(`Command completed.\n\nSTDOUT:\n${result.stdout || ''}\n\nSTDERR:\n${result.stderr || ''}`)
}

async function runLastCommand() {
  if (!lastRunCommand.value) {
    alert('No previous command to run.')
    return
  }
  const result = await window.electronAPI.runCommand(lastRunCommand.value)
  if (result?.error) {
    alert(`Command failed:\n${result.error}\n\nSTDOUT:\n${result.stdout || ''}\n\nSTDERR:\n${result.stderr || ''}`)
    return
  }
  alert(`Command completed.\n\nSTDOUT:\n${result.stdout || ''}\n\nSTDERR:\n${result.stderr || ''}`)
}
</script>
