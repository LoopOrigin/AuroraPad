import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { useStorage } from '@vueuse/core'

export const useSettingsStore = defineStore('settings', () => {
  const theme = useStorage('notepad-theme', 'light') // 'light' | 'dark' | 'monokai' | 'solarized-dark'
  const wordWrap = ref(false)
  const lineNumbers = ref(true)
  const sidebarVisible = ref(false)
  const fontSize = ref(14)
  const recentFiles = ref([])
  const showWhitespace = ref(false)
  const highlightCurrentLine = ref(true)
  const showMinimap = ref(false)

  function setTheme(value) {
    theme.value = value
    document.documentElement.setAttribute('data-theme', value)
  }

  function setWordWrap(value) {
    wordWrap.value = value
  }

  function setLineNumbers(value) {
    lineNumbers.value = value
  }

  function setSidebarVisible(value) {
    sidebarVisible.value = value
  }

  function setFontSize(value) {
    fontSize.value = Math.max(10, Math.min(24, value))
  }

  function setShowWhitespace(value) {
    showWhitespace.value = !!value
  }

  function setHighlightCurrentLine(value) {
    highlightCurrentLine.value = !!value
  }

  function setShowMinimap(value) {
    showMinimap.value = !!value
  }

  function loadRecentFilesFromMain() {
    if (typeof window !== 'undefined' && window.electronAPI) {
      window.electronAPI.getRecentFiles().then(files => {
        recentFiles.value = files || []
      })
    }
  }

  function clearRecentFiles() {
    recentFiles.value = []
    if (typeof window !== 'undefined' && window.electronAPI) {
      window.electronAPI.clearRecentFiles()
    }
  }

  // Apply theme on init
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-theme', theme.value)
  }

  // Keep <html data-theme="..."> in sync even when theme is changed via v-model
  if (typeof document !== 'undefined') {
    watch(theme, (value) => {
      document.documentElement.setAttribute('data-theme', value)
    })
  }

  return {
    theme,
    wordWrap,
    lineNumbers,
    sidebarVisible,
    fontSize,
    recentFiles,
    showWhitespace,
    highlightCurrentLine,
    showMinimap,
    setTheme,
    setWordWrap,
    setLineNumbers,
    setSidebarVisible,
    setFontSize,
    setShowWhitespace,
    setHighlightCurrentLine,
    setShowMinimap,
    loadRecentFilesFromMain,
    clearRecentFiles,
  }
})
