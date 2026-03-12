<template>
  <div v-if="tabsStore.activeTab" class="status-bar">
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

const tabsStore = useTabsStore()
const settingsStore = useSettingsStore()
const emit = defineEmits(['go-to-line'])

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
  const order = ['light', 'dark', 'monokai', 'solarized-dark']
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
.eol-select,
.encoding-select {
  margin: 0;
  min-width: 0;
}
</style>
