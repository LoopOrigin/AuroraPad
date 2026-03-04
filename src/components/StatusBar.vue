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
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useTabsStore } from '../stores/tabs'

const tabsStore = useTabsStore()
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

function onEncodingChange() {}
function onEolChange() {}

function goToLine() {
  emit('go-to-line')
}
</script>

<style scoped>
.eol-select,
.encoding-select {
  margin: 0;
  min-width: 0;
}
</style>
