import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

const encodings = [
  'utf8', 'utf16le', 'utf16be', 'latin1', 'ascii',
  'utf-8', 'utf-16', 'utf-16le', 'utf-16be', 'iso-8859-1', 'windows-1252'
]

function generateId() {
  return 'tab-' + Math.random().toString(36).slice(2, 11)
}

function languageFromPath(path) {
  if (!path) return 'plaintext'
  const ext = path.split('.').pop()?.toLowerCase()
  const map = {
    js: 'javascript', ts: 'typescript', jsx: 'javascript', tsx: 'typescript',
    vue: 'vue', html: 'html', htm: 'html', css: 'css', scss: 'scss', less: 'less',
    json: 'json', md: 'markdown', py: 'python', rb: 'ruby', go: 'go', rs: 'rust',
    java: 'java', kt: 'kotlin', c: 'c', cpp: 'cpp', h: 'c', hpp: 'cpp',
    sql: 'sql', sh: 'shell', bash: 'shell', yaml: 'yaml', yml: 'yaml', xml: 'xml',
  }
  return map[ext] || 'plaintext'
}

export const useTabsStore = defineStore('tabs', () => {
  const tabs = ref([])
  const activeTabId = ref(null)

  const activeTab = computed(() => tabs.value.find(t => t.id === activeTabId.value))
  const hasDirty = computed(() => tabs.value.some(t => t.isDirty))

  function addTab(options = {}) {
    const id = options.id || generateId()
    const path = options.path || null
    const name = path ? path.split(/[/\\]/).pop() : (options.name || 'Untitled')
    const tab = {
      id,
      path,
      name,
      content: options.content ?? '',
      language: options.language ?? languageFromPath(path),
      isDirty: options.isDirty ?? (options.content !== undefined),
      encoding: options.encoding ?? 'utf8',
      eol: options.eol ?? 'crlf', // 'crlf' | 'lf' | 'cr'
      cursorPosition: options.cursorPosition ?? { line: 1, column: 1 },
      modelRef: null,
    }
    const existing = tabs.value.find(t => t.path && t.path === path)
    if (existing) {
      setActive(existing.id)
      return existing.id
    }
    tabs.value.push(tab)
    setActive(id)
    return id
  }

  function closeTab(id) {
    const idx = tabs.value.findIndex(t => t.id === id)
    if (idx === -1) return
    const wasActive = activeTabId.value === id
    tabs.value.splice(idx, 1)
    if (wasActive && tabs.value.length) {
      const next = tabs.value[Math.min(idx, tabs.value.length - 1)]
      setActive(next.id)
    } else {
      activeTabId.value = tabs.value.length ? tabs.value[0].id : null
    }
  }

  function setActive(id) {
    if (tabs.value.some(t => t.id === id)) activeTabId.value = id
  }

  function updateTab(id, updates) {
    const tab = tabs.value.find(t => t.id === id)
    if (tab) Object.assign(tab, updates)
  }

  function setContent(id, content) {
    const tab = tabs.value.find(t => t.id === id)
    if (tab) {
      tab.content = content
      tab.isDirty = true
    }
  }

  function setDirty(id, dirty) {
    const tab = tabs.value.find(t => t.id === id)
    if (tab) tab.isDirty = dirty
  }

  function getTab(id) {
    return tabs.value.find(t => t.id === id)
  }

  return {
    tabs,
    activeTabId,
    activeTab,
    hasDirty,
    addTab,
    closeTab,
    setActive,
    updateTab,
    setContent,
    setDirty,
    getTab,
    encodings,
    languageFromPath,
  }
})
