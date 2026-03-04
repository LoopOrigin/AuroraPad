<template>
  <div class="file-tree-children">
    <template v-for="entry in entries" :key="entry.path">
      <div
        class="file-tree-item"
        :class="{ folder: entry.isDirectory }"
        @click="entry.isDirectory ? toggle(entry) : openFile(entry.path)"
      >
        <span class="icon">{{ entry.isDirectory ? (isExpanded(entry.path) ? '▼' : '▶') : '📄' }}</span>
        <span>{{ entry.name }}</span>
      </div>
      <FileTreeFolder
        v-if="entry.isDirectory && isExpanded(entry.path) && childrenMap.get(entry.path)"
        :entries="childrenMap.get(entry.path)"
        :root="entry.path"
        @open-file="$emit('open-file', $event)"
      />
    </template>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useFileTreeStore } from '../stores/fileTree'
import FileTreeFolder from './FileTreeFolder.vue'

const props = defineProps({
  entries: { type: Array, default: () => [] },
  root: { type: String, default: '' },
})

const emit = defineEmits(['open-file'])

const fileTreeStore = useFileTreeStore()
const childrenMap = ref(new Map())

function isExpanded(path) {
  return fileTreeStore.isExpanded(path)
}

async function toggle(entry) {
  fileTreeStore.toggleExpand(entry.path)
  if (!childrenMap.value.has(entry.path)) {
    const children = await fileTreeStore.loadChildren(entry.path)
    const next = new Map(childrenMap.value)
    next.set(entry.path, children)
    childrenMap.value = next
  }
}

function openFile(path) {
  emit('open-file', path)
}
</script>

<style scoped>
.file-tree-children {
  padding-left: 12px;
}
</style>
