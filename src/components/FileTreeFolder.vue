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
        @dblclick="entry.isDirectory && remoteMode ? enterDirectory(entry.path) : null"
        @contextmenu.prevent="onContextMenu(entry)"
      >
        <span class="icon">
          <i
            v-if="entry.isDirectory"
            class="fa-solid"
            :class="isExpanded(entry.path) ? 'fa-folder-open' : 'fa-folder'"
            aria-hidden="true"
          ></i>
          <i
            v-else
            :class="fileIcon(entry.name)"
            aria-hidden="true"
          ></i>
        </span>
        <span class="file-tree-label" :title="entry.name">{{ entry.name }}</span>
        <button
          v-if="entry.isDirectory && remoteMode"
          type="button"
          class="file-tree-enter-btn"
          title="Set as current directory"
          @click.stop="enterDirectory(entry.path)"
        >
          ↪
        </button>
      </div>
      <FileTreeFolder
        v-if="entry.isDirectory && isExpanded(entry.path) && childrenMap.get(entry.path)"
        :entries="childrenMap.get(entry.path)"
        :root="entry.path"
        :remote-mode="remoteMode"
        @open-file="$emit('open-file', $event)"
        @enter-directory="$emit('enter-directory', $event)"
        @move-entry="$emit('move-entry', $event)"
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
  remoteMode: { type: Boolean, default: false },
})

const emit = defineEmits(['open-file', 'enter-directory', 'move-entry'])

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

function enterDirectory(path) {
  emit('enter-directory', path)
}

function onContextMenu(entry) {
  if (!props.remoteMode) return
  const destination = window.prompt('Move/Rename target path', entry.path)
  if (!destination || destination === entry.path) return
  emit('move-entry', { fromPath: entry.path, toPath: destination })
}

function isActiveFile(path) {
  return tabsStore.activeTab?.path === path
}

function fileIcon(name = '') {
  const lower = name.toLowerCase()
  if (lower.endsWith('.js') || lower.endsWith('.ts') || lower.endsWith('.jsx') || lower.endsWith('.tsx')) return 'fa-brands fa-js'
  if (lower.endsWith('.vue')) return 'fa-brands fa-vuejs'
  if (lower.endsWith('.html') || lower.endsWith('.htm')) return 'fa-brands fa-html5'
  if (lower.endsWith('.css') || lower.endsWith('.scss') || lower.endsWith('.less')) return 'fa-brands fa-css3-alt'
  if (lower.endsWith('.json') || lower.endsWith('.yml') || lower.endsWith('.yaml') || lower.endsWith('.toml')) return 'fa-solid fa-brackets-curly'
  if (lower.endsWith('.md')) return 'fa-solid fa-book'
  if (lower.endsWith('.py')) return 'fa-brands fa-python'
  if (lower.endsWith('.rb')) return 'fa-regular fa-gem'
  if (lower.endsWith('.go')) return 'fa-solid fa-droplet'
  if (lower.endsWith('.rs')) return 'fa-solid fa-gear'
  return 'fa-regular fa-file-lines'
}
</script>

<style scoped>
.file-tree-children {
  padding-left: 12px;
}

.file-tree-enter-btn {
  margin-left: auto;
  border: 0;
  background: transparent;
  color: var(--npp-text-dim);
  cursor: pointer;
  font-size: 12px;
}

.file-tree-enter-btn:hover {
  color: var(--npp-accent);
}
</style>
