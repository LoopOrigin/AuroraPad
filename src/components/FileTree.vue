<template>
  <div class="file-tree">
    <div v-if="!fileTreeStore.openFolderPath" class="sidebar-section-title">
      <span>Explorer</span>
      <div class="sidebar-actions">
        <button type="button" @click="openFolder">Open Folder</button>
      </div>
    </div>
    <template v-else>
      <div class="sidebar-section-title">
        <div class="folder-title-wrap">
          <span>{{ folderName }}</span>
          <small v-if="isRemoteMode" class="remote-subtitle">{{ remoteLabel }}</small>
        </div>
        <div class="sidebar-actions">
          <button v-if="isRemoteMode" type="button" @click="goUpDirectory">Up</button>
          <button v-else type="button" @click="openFolder">Change</button>
        </div>
      </div>
      <FileTreeFolder
        :entries="fileTreeStore.tree"
        :root="fileTreeStore.openFolderPath"
        :remote-mode="isRemoteMode"
        @open-file="openFile"
        @enter-directory="enterDirectory"
        @move-entry="moveEntry"
      />
    </template>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useFileTreeStore } from '../stores/fileTree'
import FileTreeFolder from './FileTreeFolder.vue'

const fileTreeStore = useFileTreeStore()
const isRemoteMode = computed(() => fileTreeStore.workspaceMode === 'remote')

const folderName = computed(() => {
  const p = fileTreeStore.openFolderPath
  if (!p) return ''
  const parts = p.split(/[/\\]/)
  return parts[parts.length - 1] || p
})

const remoteLabel = computed(() => {
  const remote = fileTreeStore.remoteConnection
  if (!remote) return ''
  const host = remote.host || 'remote-host'
  const user = remote.username ? `${remote.username}@` : ''
  return `${user}${host}`
})

async function openFolder() {
  // Electron desktop flow
  if (window.electronAPI) {
    const path = await window.electronAPI.openFolderDialog()
    if (path) {
      fileTreeStore.setLocalWorkspace(path)
      if (window.electronAPI.watchFolder) {
        await window.electronAPI.watchFolder(path)
      }
    }
    return
  }

  // Browser/dev fallback
  if (typeof window !== 'undefined') {
    alert('Folder Open is only available in the AuroraPad desktop app. Please run the Electron build.')
  }
}

function openFile(path) {
  emit('open-file', path)
}

function enterDirectory(path) {
  fileTreeStore.setOpenFolder(path)
}

function moveEntry(payload) {
  emit('move-entry', payload)
}

function goUpDirectory() {
  if (!fileTreeStore.openFolderPath || !isRemoteMode.value) return
  const current = fileTreeStore.openFolderPath.replace(/\/+$/, '') || '/'
  if (current === '/') return
  const idx = current.lastIndexOf('/')
  const parent = idx <= 0 ? '/' : current.slice(0, idx)
  fileTreeStore.setOpenFolder(parent)
}

const emit = defineEmits(['open-file', 'move-entry'])
</script>

<style scoped>
.file-tree {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}

.sidebar-actions {
  display: inline-flex;
  gap: 6px;
}

.folder-title-wrap {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.remote-subtitle {
  color: var(--npp-text-dim);
  font-size: 11px;
}
</style>
