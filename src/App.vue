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
      <div class="editor-container">
        <template v-if="tabsStore.activeTab">
          <div
            :data-tab-id="tabsStore.activeTab.id"
            class="monaco-editor-wrapper"
          >
            <MonacoEditor
              ref="monacoEditorRef"
              v-model="tabsStore.activeTab.content"
              :language="tabsStore.activeTab.language"
              :theme="monacoTheme"
              :word-wrap="settingsStore.wordWrap"
              :line-numbers="settingsStore.lineNumbers"
              :font-size="settingsStore.fontSize"
              @update:model-value="onEditorContentChange"
              @cursor-change="onCursorChange"
            />
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
      <div class="plugin-manager">
        <h2>Preferences</h2>
        <div class="plugin-manager-list">
          <div class="plugin-manager-item">
            <span>Theme</span>
            <select v-model="settingsStore.theme">
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>
          <div class="plugin-manager-item">
            <span>Word Wrap</span>
            <input type="checkbox" :checked="settingsStore.wordWrap" @change="settingsStore.setWordWrap($event.target.checked)" />
          </div>
          <div class="plugin-manager-item">
            <span>Line Numbers</span>
            <input type="checkbox" :checked="settingsStore.lineNumbers" @change="settingsStore.setLineNumbers($event.target.checked)" />
          </div>
          <div class="plugin-manager-item">
            <span>Editor Font Size</span>
            <input type="number" min="8" max="32" :value="settingsStore.fontSize" @input="settingsStore.setFontSize(Number($event.target.value) || 14)" />
          </div>
        </div>
        <div style="padding: 8px 16px; display: flex; justify-content: flex-end; gap: 8px;">
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
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useTabsStore } from './stores/tabs'
import { useSettingsStore } from './stores/settings'
import { usePluginsStore } from './stores/plugins'
import { createPluginApi } from './plugins/pluginApi'
import TabBar from './components/TabBar.vue'
import MonacoEditor from './components/MonacoEditor.vue'
import FileTree from './components/FileTree.vue'
import CommandPalette from './components/CommandPalette.vue'
import StatusBar from './components/StatusBar.vue'
import Toolbar from './components/Toolbar.vue'
import MenuBar from './components/MenuBar.vue'

const tabsStore = useTabsStore()
const settingsStore = useSettingsStore()
const pluginsStore = usePluginsStore()
const monacoEditorRef = ref(null)
const showCommandPalette = ref(false)
const showPluginManager = ref(false)

const monacoTheme = computed(() => (settingsStore.theme === 'dark' ? 'vs-dark' : 'vs'))
const showPreferences = ref(false)

// Notepad++ menu order: File, Edit, Search, View, Encoding, Language, Settings, Plugins, Window, Help
const menuBarMenus = computed(() => [
  {
    id: 'file',
    label: 'File',
    items: [
      { label: 'New', shortcut: 'Ctrl+N', action: 'menu:new', icon: 'toolbar-icon icon-new-file' },
      { type: 'separator' },
      { label: 'Open...', shortcut: 'Ctrl+O', action: 'menu:open-file', icon: 'toolbar-icon icon-open-file' },
      { label: 'Open Folder...', shortcut: 'Ctrl+Shift+O', action: 'menu:open-folder' },
      { type: 'separator' },
      { label: 'Save', shortcut: 'Ctrl+S', action: 'menu:save', enabled: !!tabsStore.activeTab, icon: 'toolbar-icon icon-save' },
      { label: 'Save All', shortcut: 'Ctrl+Shift+S', action: 'menu:save-all', enabled: !!tabsStore.activeTab, icon: 'toolbar-icon icon-save-all' },
      { label: 'Save As...', shortcut: 'F12', action: 'menu:save-as', enabled: !!tabsStore.activeTab },
      { type: 'separator' },
      { label: 'Close Tab', shortcut: 'Ctrl+W', action: 'menu:close-tab', enabled: !!tabsStore.activeTab },
      { type: 'separator' },
      { label: 'Exit', shortcut: 'Alt+F4', action: 'menu:exit' },
    ],
  },
  {
    id: 'edit',
    label: 'Edit',
    items: [
      { label: 'Undo', shortcut: 'Ctrl+Z', action: 'menu:undo', icon: 'toolbar-icon icon-undo' },
      { label: 'Redo', shortcut: 'Ctrl+Y', action: 'menu:redo', icon: 'toolbar-icon icon-redo' },
      { type: 'separator' },
      { label: 'Cut', shortcut: 'Ctrl+X', action: 'menu:cut', icon: 'toolbar-icon icon-cut' },
      { label: 'Copy', shortcut: 'Ctrl+C', action: 'menu:copy', icon: 'toolbar-icon icon-copy' },
      { label: 'Paste', shortcut: 'Ctrl+V', action: 'menu:paste', icon: 'toolbar-icon icon-paste' },
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
      { label: 'Find', shortcut: 'Ctrl+F', action: 'menu:find', icon: 'toolbar-icon icon-find' },
      { label: 'Replace', shortcut: 'Ctrl+H', action: 'menu:replace', icon: 'toolbar-icon icon-replace' },
      { label: 'Go to Line...', shortcut: 'Ctrl+G', action: 'menu:go-to-line', icon: 'toolbar-icon icon-go-to-line' },
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
      { label: 'Run...', enabled: false },
      { label: 'Run Last Command', enabled: false },
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
          handleMenu('menu:find')
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
    const { useFileTreeStore } = await import('./stores/fileTree')
    const fileTreeStore = useFileTreeStore()
    if (fileTreeStore.openFolderPath === root) {
      fileTreeStore.loadTree(root)
    }
  })
}

function setupMenuListeners() {
  if (!window.electronAPI?.onMenu) return
  const channels = [
    'menu:new', 'menu:open-file', 'menu:open-folder', 'menu:save', 'menu:save-all', 'menu:save-as',
    'menu:close-tab', 'menu:undo', 'menu:redo', 'menu:cut', 'menu:copy', 'menu:paste',
    'menu:find', 'menu:replace', 'menu:go-to-line', 'menu:word-wrap', 'menu:line-numbers',
    'menu:zoom-in', 'menu:zoom-out', 'menu:zoom-reset', 'menu:toggle-sidebar', 'menu:theme',
    'menu:command-palette', 'menu:plugin-manager',
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
    alert('Notepad Clone\nA Notepad++-style editor\nElectron + Vue 3 + Monaco')
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
    case 'menu:close-tab':
      if (tabsStore.activeTab) {
        const id = tabsStore.activeTabId
        if (tabsStore.getTab(id)?.isDirty && !confirm('Unsaved changes. Close anyway?')) return
        tabsStore.closeTab(id)
      }
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
    case 'menu:go-to-line':
      monacoEditorRef.value?.getEditor()?.trigger('keyboard', 'editor.action.gotoLine')
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
    case 'menu:find-next':
      monacoEditorRef.value?.getEditor()?.trigger('keyboard', 'editor.action.nextMatchFindAction')
      break
    case 'menu:find-prev':
      monacoEditorRef.value?.getEditor()?.trigger('keyboard', 'editor.action.previousMatchFindAction')
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
    default:
      break
  }
}

function onEditorContentChange(value) {
  if (tabsStore.activeTab) {
    tabsStore.setContent(tabsStore.activeTabId, value)
  }
}

function onCursorChange(pos) {
  if (tabsStore.activeTab) {
    tabsStore.updateTab(tabsStore.activeTabId, { cursorPosition: { line: pos.line, column: pos.column } })
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
    const fileTreeStore = (await import('./stores/fileTree')).useFileTreeStore()
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
</script>
