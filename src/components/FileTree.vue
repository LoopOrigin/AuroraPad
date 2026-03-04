<template>
  <div class="file-tree">
    <div v-if="!fileTreeStore.openFolderPath" class="sidebar-section-title">
      <span>Explorer</span>
      <button type="button" @click="openFolder">Open Folder</button>
    </div>
    <template v-else>
      <div class="sidebar-section-title">
        <span>{{ folderName }}</span>
        <button type="button" @click="openFolder">Change</button>
      </div>
      <FileTreeFolder :entries="fileTreeStore.tree" :root="fileTreeStore.openFolderPath" @open-file="openFile" />
    </template>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useFileTreeStore } from '../stores/fileTree'
import FileTreeFolder from './FileTreeFolder.vue'

const fileTreeStore = useFileTreeStore()

const folderName = computed(() => {
  const p = fileTreeStore.openFolderPath
  if (!p) return ''
  const parts = p.split(/[/\\]/)
  return parts[parts.length - 1] || p
})

async function openFolder() {
  if (!window.electronAPI) return
  const path = await window.electronAPI.openFolderDialog()
  if (path) {
    fileTreeStore.setOpenFolder(path)
    if (window.electronAPI.watchFolder) {
      await window.electronAPI.watchFolder(path)
    }
  }
}

function openFile(path) {
  emit('open-file', path)
}

const emit = defineEmits(['open-file'])
</script>

<style scoped>
.file-tree {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}
</style>
