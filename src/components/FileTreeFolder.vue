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
        <span :class="['file-badge', entry.isDirectory ? 'file-badge-dir' : fileBadgeClass(entry.name)]" aria-hidden="true">
          {{ entry.isDirectory ? (isExpanded(entry.path) ? '▾' : '▸') : fileBadgeText(entry.name) }}
        </span>
        <span class="file-tree-label" :title="entry.name">{{ entry.name }}</span>
        <span
          v-if="!entry.isDirectory && gitStatusChar(entry.path)"
          :class="['git-status-badge', `git-status-${gitStatusChar(entry.path)}`]"
        >{{ gitStatusChar(entry.path) }}</span>
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

function gitStatusChar(path) {
  const status = fileTreeStore.gitStatus
  if (!status) return ''
  return status[path] || ''
}

function isActiveFile(path) {
  return tabsStore.activeTab?.path === path
}

function fileBadgeText(name = '') {
  const lower = name.toLowerCase()
  if (lower.endsWith('.tsx')) return 'TSX'
  if (lower.endsWith('.jsx')) return 'JSX'
  if (lower.endsWith('.ts')) return 'TS'
  if (lower.endsWith('.js')) return 'JS'
  if (lower.endsWith('.vue')) return 'VUE'
  if (lower.endsWith('.html') || lower.endsWith('.htm')) return 'HTM'
  if (lower.endsWith('.scss')) return 'SCSS'
  if (lower.endsWith('.css') || lower.endsWith('.less')) return 'CSS'
  if (lower.endsWith('.json')) return 'JSON'
  if (lower.endsWith('.yml') || lower.endsWith('.yaml')) return 'YML'
  if (lower.endsWith('.toml')) return 'TOML'
  if (lower.endsWith('.md')) return 'MD'
  if (lower.endsWith('.py')) return 'PY'
  if (lower.endsWith('.rb')) return 'RB'
  if (lower.endsWith('.go')) return 'GO'
  if (lower.endsWith('.rs')) return 'RS'
  const ext = lower.split('.').pop()
  return ext && ext.length <= 4 ? ext.toUpperCase() : '···'
}

function fileBadgeClass(name = '') {
  const lower = name.toLowerCase()
  if (lower.endsWith('.ts') || lower.endsWith('.tsx')) return 'file-badge-ts'
  if (lower.endsWith('.js') || lower.endsWith('.jsx')) return 'file-badge-js'
  if (lower.endsWith('.vue')) return 'file-badge-vue'
  if (lower.endsWith('.html') || lower.endsWith('.htm')) return 'file-badge-html'
  if (lower.endsWith('.css') || lower.endsWith('.scss') || lower.endsWith('.less')) return 'file-badge-css'
  if (lower.endsWith('.json') || lower.endsWith('.yml') || lower.endsWith('.yaml') || lower.endsWith('.toml')) return 'file-badge-json'
  if (lower.endsWith('.md')) return 'file-badge-md'
  if (lower.endsWith('.py')) return 'file-badge-py'
  if (lower.endsWith('.rb')) return 'file-badge-rb'
  if (lower.endsWith('.go')) return 'file-badge-go'
  if (lower.endsWith('.rs')) return 'file-badge-rs'
  return ''
}
</script>

<style scoped>
.file-tree-children {
  padding-left: 8px;
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

.git-status-badge {
  margin-left: auto;
  font-size: 9px;
  font-weight: 700;
  padding: 0 3px;
  border-radius: 2px;
  line-height: 14px;
  letter-spacing: 0;
  flex-shrink: 0;
}

.git-status-M { color: #ffcb6b; }
.git-status-A { color: #c3e88d; }
.git-status-D { color: #f87171; }
.git-status-\? { color: var(--npp-text-dim, #6b7a99); }
</style>
