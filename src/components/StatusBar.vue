<template>
  <div v-if="tabsStore.activeTab || alwaysShow" class="status-bar">
    <!-- Left: SSH chip OR git branch -->
    <span
      v-if="fileTreeStore.workspaceMode === 'remote' && fileTreeStore.remoteConnection"
      class="status-bar-segment status-ssh-chip"
      title="Click to open SFTP"
      @click="$emit('go-sftp')"
    >
      <svg width="11" height="11" viewBox="0 0 16 16" fill="currentColor" style="flex-shrink:0">
        <path d="M4 3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V3zM1 8a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V8zm2 0v1h2V8H3zm4 0v1h2V8H7zm4 0v1h2V8h-2zM3 11v1h2v-1H3zm4 0v1h2v-1H7zm4 0v1h2v-1h-2z"/>
      </svg>
      {{ fileTreeStore.remoteConnection.host || fileTreeStore.remoteConnection.name }}
    </span>
    <span
      v-else-if="fileTreeStore.gitBranch"
      class="status-bar-segment status-git-branch"
      title="Git branch"
    >
      <svg width="11" height="11" viewBox="0 0 16 16" fill="currentColor" style="flex-shrink:0">
        <path d="M11.75 2.5a.75.75 0 1 0 1.5 0 .75.75 0 0 0-1.5 0zm.75 3c-.98 0-1.81.626-2.12 1.5H7.93A2.5 2.5 0 0 0 5.5 9.25v1.5a.75.75 0 0 0 1.5 0v-1.5a1 1 0 0 1 1-1h2.37c.31.874 1.14 1.5 2.12 1.5a2.25 2.25 0 0 0 0-4.5zM2.75 5.5a.75.75 0 1 0 1.5 0 .75.75 0 0 0-1.5 0zm.75 2.25a2.25 2.25 0 1 1 0-4.5 2.25 2.25 0 0 1 0 4.5z"/>
      </svg>
      {{ fileTreeStore.gitBranch }}
    </span>

    <!-- Per-file segments (only when a file is open) -->
    <template v-if="tabsStore.activeTab">
      <span class="status-bar-segment" title="Language">{{ languageLabel }}</span>
      <span class="status-bar-segment" title="Document length">Ln {{ lineCount }} : {{ docLength }} chars</span>
      <span
        class="status-bar-segment"
        title="Double-click to go to line"
        @dblclick="goToLine"
      >
        Ln {{ cursorLine }}, Col {{ cursorCol }}
      </span>
      <span class="status-bar-segment">
        <select v-model="currentEol" class="eol-select" title="Line ending" @change="onEolChange">
          <option value="crlf">CRLF</option>
          <option value="lf">LF</option>
          <option value="cr">CR</option>
        </select>
      </span>
      <span class="status-bar-segment">
        <select v-model="currentEncoding" class="encoding-select" title="Encoding" @change="onEncodingChange">
          <option v-for="enc in encodings" :key="enc" :value="enc">{{ enc }}</option>
        </select>
      </span>
    </template>

    <!-- Right: indentation -->
    <span class="status-bar-segment status-indent" title="Indentation">
      Spaces: {{ settingsStore.tabSize }}
    </span>
    <span
      class="status-bar-segment status-theme"
      title="Click to cycle theme"
      @click="cycleTheme"
    >
      Theme: {{ themeLabel }}
    </span>
    <span class="status-bar-segment status-font">
      <button type="button" class="status-btn" title="Decrease font size" @click="decreaseFont">−</button>
      <span>Font {{ fontSize }}</span>
      <button type="button" class="status-btn" title="Increase font size" @click="increaseFont">+</button>
    </span>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useTabsStore } from '../stores/tabs'
import { useSettingsStore } from '../stores/settings'
import { useFileTreeStore } from '../stores/fileTree'

const props = defineProps({
  activeScreen: { type: String, default: 'editor' },
})

const emit = defineEmits(['go-to-line', 'go-sftp'])

const tabsStore = useTabsStore()
const settingsStore = useSettingsStore()
const fileTreeStore = useFileTreeStore()

// Show status bar even when no tab is open (for git branch, ssh chip)
const alwaysShow = computed(() => !!fileTreeStore.gitBranch || fileTreeStore.workspaceMode === 'remote')

const encodings = ['utf8', 'utf16le', 'utf16be', 'latin1', 'windows-1252']

const languageLabel = computed(() => {
  const lang = tabsStore.activeTab?.language ?? 'plaintext'
  return lang === 'plaintext' ? 'Normal' : lang.charAt(0).toUpperCase() + lang.slice(1)
})

const lineCount = computed(() => {
  const c = tabsStore.activeTab?.content ?? ''
  return c ? c.split(/\r\n|\r|\n/).length : 1
})

const docLength = computed(() => (tabsStore.activeTab?.content ?? '').length)

const currentEncoding = computed({
  get: () => tabsStore.activeTab?.encoding ?? 'utf8',
  set: (v) => {
    if (tabsStore.activeTab) tabsStore.updateTab(tabsStore.activeTabId, { encoding: v })
  },
})

const currentEol = computed({
  get: () => tabsStore.activeTab?.eol ?? 'crlf',
  set: (v) => {
    if (tabsStore.activeTab) tabsStore.updateTab(tabsStore.activeTabId, { eol: v })
  },
})

const cursorLine = computed(() => tabsStore.activeTab?.cursorPosition?.line ?? 1)
const cursorCol = computed(() => tabsStore.activeTab?.cursorPosition?.column ?? 1)

const themeLabel = computed(() => {
  const t = settingsStore.theme
  if (t === 'dark') return 'Dark'
  if (t === 'aurora-dark') return 'Aurora Dark'
  if (t === 'material-ocean') return 'Ocean'
  if (t === 'monokai') return 'Monokai'
  if (t === 'solarized-dark') return 'Solarized'
  return 'Light'
})

const fontSize = computed(() => settingsStore.fontSize)

function onEncodingChange() {}
function onEolChange() {}

function goToLine() {
  emit('go-to-line')
}

function cycleTheme() {
  const order = ['light', 'dark', 'material-ocean', 'monokai', 'solarized-dark']
  const current = settingsStore.theme
  const idx = order.indexOf(current)
  const next = order[(idx + 1 + order.length) % order.length]
  settingsStore.setTheme(next)
}

function increaseFont() {
  settingsStore.setFontSize(settingsStore.fontSize + 1)
}

function decreaseFont() {
  settingsStore.setFontSize(settingsStore.fontSize - 1)
}
</script>

<style scoped>
.status-ssh-chip {
  background: rgba(41, 212, 240, 0.15) !important;
  color: var(--npp-accent, #29d4f0) !important;
  display: flex;
  align-items: center;
  gap: 5px;
  cursor: pointer;
}
.status-ssh-chip:hover {
  background: rgba(41, 212, 240, 0.25) !important;
}

.status-git-branch {
  display: flex;
  align-items: center;
  gap: 5px;
  color: var(--npp-text-dim, #6b7a99) !important;
}

.status-indent {
  color: var(--npp-text-dim, #6b7a99);
}

.eol-select,
.encoding-select {
  margin: 0;
  min-width: 0;
}
</style>
