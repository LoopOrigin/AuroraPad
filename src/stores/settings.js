import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { useStorage } from '@vueuse/core'

export const useSettingsStore = defineStore('settings', () => {
  const theme = useStorage('notepad-theme', 'light') // 'light' | 'dark'
  const wordWrap = ref(false)
  const lineNumbers = ref(true)
  const sidebarVisible = ref(true)
  const fontSize = ref(14)
  const recentFiles = ref([])

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

  return {
    theme,
    wordWrap,
    lineNumbers,
    sidebarVisible,
    fontSize,
    recentFiles,
    setTheme,
    setWordWrap,
    setLineNumbers,
    setSidebarVisible,
    setFontSize,
    loadRecentFilesFromMain,
    clearRecentFiles,
  }
})
