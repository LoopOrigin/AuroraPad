<template>
  <div class="file-tree-children">
    <template v-for="entry in entries" :key="entry.path">
      <div
        class="file-tree-item"
        :class="{
          folder: entry.isDirectory,
          active: !entry.isDirectory && isActiveFile(entry.path),
        }"
        @click="entry.isDirectory ? toggle(entry) : openFile(entry.path)"
      >
        <span class="icon">
          {{ entry.isDirectory ? (isExpanded(entry.path) ? '▼' : '▶') : fileIcon(entry.name) }}
        </span>
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
import { ref } from 'vue'
import { useFileTreeStore } from '../stores/fileTree'
import { useTabsStore } from '../stores/tabs'
import FileTreeFolder from './FileTreeFolder.vue'

const props = defineProps({
  entries: { type: Array, default: () => [] },
  root: { type: String, default: '' },
})

const emit = defineEmits(['open-file'])

const fileTreeStore = useFileTreeStore()
const tabsStore = useTabsStore()
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

function isActiveFile(path) {
  return tabsStore.activeTab?.path === path
}

function fileIcon(name = '') {
  const lower = name.toLowerCase()
  if (lower.endsWith('.js') || lower.endsWith('.ts')) return '🟨'
  if (lower.endsWith('.vue')) return '🟢'
  if (lower.endsWith('.html') || lower.endsWith('.htm')) return '🟠'
  if (lower.endsWith('.css') || lower.endsWith('.scss') || lower.endsWith('.less')) return '🟦'
  if (lower.endsWith('.json')) return '🟤'
  if (lower.endsWith('.md')) return '📘'
  if (lower.endsWith('.py')) return '🐍'
  if (lower.endsWith('.rb')) return '♦️'
  if (lower.endsWith('.go')) return '💧'
  if (lower.endsWith('.rs')) return '🦀'
  return '📄'
}
</script>

<style scoped>
.file-tree-children {
  padding-left: 12px;
}
</style>
