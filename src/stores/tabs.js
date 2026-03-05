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
    // Treat .vue files as HTML so Monaco uses its built-in HTML language support
    vue: 'html', html: 'html', htm: 'html', css: 'css', scss: 'scss', less: 'less',
    json: 'json', md: 'markdown', py: 'python', rb: 'ruby', go: 'go', rs: 'rust',
    java: 'java', kt: 'kotlin', c: 'c', cpp: 'cpp', h: 'c', hpp: 'cpp',
    cs: 'csharp', csx: 'csharp',
    php: 'php', rbw: 'ruby',
    sql: 'sql', sh: 'shell', bash: 'shell', ps1: 'powershell',
    yaml: 'yaml', yml: 'yaml', xml: 'xml',
  }
  return map[ext] || 'plaintext'
}

function inferLanguage(path, content) {
  // Prefer extension-based mapping first
  const byExt = languageFromPath(path)
  if (byExt !== 'plaintext') return byExt

  const text = (content || '').slice(0, 2000)
  const firstLine = text.split(/\r\n|\r|\n/)[0] || ''

  // Shebangs
  if (/^#!.*\bpython(?:3)?\b/.test(firstLine)) return 'python'
  if (/^#!.*\b(node|nodejs)\b/.test(firstLine)) return 'javascript'
  if (/^#!.*\b(bash|sh|zsh)\b/.test(firstLine)) return 'shell'

  // HTML
  if (/<html[\s>]/i.test(text) || /<!doctype html>/i.test(text)) return 'html'

  // JSON-ish (no ext but looks like JSON)
  if (/^\s*[{[]/.test(text) && /["']\w+["']\s*:/.test(text)) return 'json'

  // Markdown-ish
  if (/^#\s+\w+/m.test(text) || /^\s*[-*]\s+\w+/m.test(text)) return 'markdown'

  return byExt
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
      // Prefer caller-provided language, then our smarter inference helper
      language: options.language ?? inferLanguage(path, options.content),
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
    inferLanguage,
  }
})
