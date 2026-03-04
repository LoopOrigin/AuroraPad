import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export const useFileTreeStore = defineStore('fileTree', () => {
  const openFolderPath = ref(null)
  const tree = ref([]) // { name, path, isDirectory, children? }
  const expandedPaths = ref(new Set())

  async function loadTree(path) {
    if (!path || !window.electronAPI) return
    try {
      const entries = await window.electronAPI.readDir(path)
      if (entries.error) {
        tree.value = []
        return
      }
      tree.value = entries
    } catch {
      tree.value = []
    }
  }

  async function loadChildren(parentPath) {
    if (!window.electronAPI) return []
    const entries = await window.electronAPI.readDir(parentPath)
    if (entries.error) return []
    return entries
  }

  function toggleExpand(path) {
    const set = new Set(expandedPaths.value)
    if (set.has(path)) set.delete(path)
    else set.add(path)
    expandedPaths.value = set
  }

  function isExpanded(path) {
    return expandedPaths.value.has(path)
  }

  function setOpenFolder(path) {
    openFolderPath.value = path
    if (path) loadTree(path)
  }

  function clearOpenFolder() {
    openFolderPath.value = null
    tree.value = []
    expandedPaths.value = new Set()
  }

  return {
    openFolderPath,
    tree,
    expandedPaths,
    loadTree,
    loadChildren,
    toggleExpand,
    isExpanded,
    setOpenFolder,
    clearOpenFolder,
  }
})
