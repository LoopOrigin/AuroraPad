import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useFileTreeStore = defineStore('fileTree', () => {
  const workspaceMode = ref('local') // 'local' | 'remote'
  const openFolderPath = ref(null)
  const remoteConnection = ref(null) // { connectionId, profileId, rootPath, ... }
  const tree = ref([]) // { name, path, isDirectory, children? }
  const expandedPaths = ref(new Set())

  async function loadTree(path) {
    if (!path || !window.electronAPI) return
    try {
      if (workspaceMode.value === 'remote' && !remoteConnection.value?.connectionId) {
        tree.value = []
        return { error: 'Remote connection is unavailable' }
      }
      const entries = workspaceMode.value === 'remote' && remoteConnection.value?.connectionId
        ? await window.electronAPI.remoteReadDir(remoteConnection.value.connectionId, path)
        : await window.electronAPI.readDir(path)
      if (entries.error) {
        tree.value = []
        return { error: entries.error, code: entries.code || null }
      }
      tree.value = entries
      return { ok: true, entries }
    } catch {
      tree.value = []
      return { error: 'Failed to load directory' }
    }
  }

  async function loadChildren(parentPath) {
    if (!window.electronAPI) return []
    if (workspaceMode.value === 'remote' && !remoteConnection.value?.connectionId) return []
    const entries = workspaceMode.value === 'remote' && remoteConnection.value?.connectionId
      ? await window.electronAPI.remoteReadDir(remoteConnection.value.connectionId, parentPath)
      : await window.electronAPI.readDir(parentPath)
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

  function setLocalWorkspace(path) {
    workspaceMode.value = 'local'
    remoteConnection.value = null
    setOpenFolder(path)
  }

  function setRemoteWorkspace(connection) {
    workspaceMode.value = 'remote'
    remoteConnection.value = connection
    const rootPath = connection?.rootPath || '/'
    setOpenFolder(rootPath)
  }

  function clearRemoteWorkspace() {
    workspaceMode.value = 'local'
    remoteConnection.value = null
    clearOpenFolder()
  }

  function clearOpenFolder() {
    openFolderPath.value = null
    tree.value = []
    expandedPaths.value = new Set()
  }

  return {
    workspaceMode,
    openFolderPath,
    remoteConnection,
    tree,
    expandedPaths,
    loadTree,
    loadChildren,
    toggleExpand,
    isExpanded,
    setOpenFolder,
    setLocalWorkspace,
    setRemoteWorkspace,
    clearRemoteWorkspace,
    clearOpenFolder,
  }
})
