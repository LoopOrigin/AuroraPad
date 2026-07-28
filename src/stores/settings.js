import { defineStore } from 'pinia'
import { watch } from 'vue'
import { useStorage } from '@vueuse/core'

export const useSettingsStore = defineStore('settings', () => {
  const theme = useStorage('notepad-theme', 'light')
  const wordWrap = useStorage('aurorapad-word-wrap', false)
  const lineNumbers = useStorage('aurorapad-line-numbers', true)
  const sidebarVisible = useStorage('aurorapad-sidebar-visible', false)
  const toolbarVisible = useStorage('aurorapad-toolbar-visible', true)
  const statusBarVisible = useStorage('aurorapad-statusbar-visible', true)
  const fontSize = useStorage('aurorapad-font-size', 14)
  const recentFiles = useStorage('aurorapad-recent-files-cache', [])
  const showWhitespace = useStorage('aurorapad-show-whitespace', false)
  const highlightCurrentLine = useStorage('aurorapad-highlight-current-line', true)
  const showMinimap = useStorage('aurorapad-show-minimap', false)
  const autoSave = useStorage('aurorapad-auto-save', false)
  const trustLocalPlugins = useStorage('aurorapad-trust-local-plugins', false)
  // Navigation
  const activeScreen = useStorage('aurorapad-active-screen', 'editor') // 'editor' | 'connections' | 'sftp' | 'settings'
  const activeSidePanel = useStorage('aurorapad-active-side-panel', 'explorer') // 'explorer' | 'search' | 'git'
  // Editor settings
  const tabSize = useStorage('aurorapad-tab-size', 2)
  const formatOnSave = useStorage('aurorapad-format-on-save', false)
  const bracketPairColorization = useStorage('aurorapad-bracket-pair-colorization', true)
  const defaultShell = useStorage('aurorapad-default-shell', 'default')
  const scrollbackBuffer = useStorage('aurorapad-scrollback-buffer', true)
  const uiDensity = useStorage('aurorapad-ui-density', 'compact') // 'compact' | 'comfortable' | 'spacious'
  const showActivityBarLabels = useStorage('aurorapad-activity-bar-labels', false)

  function setTheme(value) {
    theme.value = value
    document.documentElement.setAttribute('data-theme', value)
  }

  function setWordWrap(value) { wordWrap.value = value }
  function setLineNumbers(value) { lineNumbers.value = value }
  function setSidebarVisible(value) { sidebarVisible.value = value }
  function setToolbarVisible(value) { toolbarVisible.value = !!value }
  function setStatusBarVisible(value) { statusBarVisible.value = !!value }
  function setFontSize(value) { fontSize.value = Math.max(10, Math.min(24, value)) }
  function setShowWhitespace(value) { showWhitespace.value = !!value }
  function setHighlightCurrentLine(value) { highlightCurrentLine.value = !!value }
  function setShowMinimap(value) { showMinimap.value = !!value }
  function setAutoSave(value) { autoSave.value = !!value }
  function setTrustLocalPlugins(value) { trustLocalPlugins.value = !!value }
  function setActiveScreen(value) { activeScreen.value = value }
  function setActiveSidePanel(value) { activeSidePanel.value = value }
  function setTabSize(value) { tabSize.value = value }
  function setFormatOnSave(value) { formatOnSave.value = !!value }
  function setBracketPairColorization(value) { bracketPairColorization.value = !!value }
  function setDefaultShell(value) { defaultShell.value = value }
  function setScrollbackBuffer(value) { scrollbackBuffer.value = !!value }
  function setUiDensity(value) { uiDensity.value = value }
  function setShowActivityBarLabels(value) { showActivityBarLabels.value = !!value }

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

  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-theme', theme.value)
  }

  if (typeof document !== 'undefined') {
    watch(theme, (value) => {
      document.documentElement.setAttribute('data-theme', value)
    })
  }

  return {
    theme, wordWrap, lineNumbers, sidebarVisible, toolbarVisible, statusBarVisible,
    fontSize, recentFiles, showWhitespace, highlightCurrentLine, showMinimap, autoSave,
    trustLocalPlugins, activeScreen, activeSidePanel, tabSize, formatOnSave,
    bracketPairColorization, defaultShell, scrollbackBuffer, uiDensity, showActivityBarLabels,
    setTheme, setWordWrap, setLineNumbers, setSidebarVisible, setToolbarVisible,
    setStatusBarVisible, setFontSize, setShowWhitespace, setHighlightCurrentLine,
    setShowMinimap, setAutoSave, setTrustLocalPlugins, setActiveScreen, setActiveSidePanel,
    setTabSize, setFormatOnSave, setBracketPairColorization, setDefaultShell,
    setScrollbackBuffer, setUiDensity, setShowActivityBarLabels,
    loadRecentFilesFromMain, clearRecentFiles,
  }
})
