<template>
  <div class="command-palette-overlay" @click.self="$emit('close')">
    <div class="command-palette">
      <input
        ref="inputRef"
        v-model="query"
        type="text"
        :placeholder="recentOnly ? 'Search recent files...' : 'Type a command or filename...'"
        autofocus
        @keydown.down="selectNext"
        @keydown.up="selectPrev"
        @keydown.enter="runSelected"
        @keydown.esc="$emit('close')"
      />
      <div class="command-palette-list">
        <div
          v-for="(item, i) in filteredItems"
          :key="item.id"
          class="command-palette-item"
          :class="{ selected: i === selectedIndex }"
          @click="runItem(item)"
        >
          <span class="icon">{{ item.icon }}</span>
          <span>{{ item.label }}</span>
          <span v-if="item.sublabel" class="sublabel">{{ item.sublabel }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useSettingsStore } from '../stores/settings'
import { useFileTreeStore } from '../stores/fileTree'

const props = defineProps({
  recentOnly: { type: Boolean, default: false },
})
const emit = defineEmits([
  'close',
  'open-file',
  'open-file-dialog',
  'new',
  'run-command',
  'toggle-terminal',
  'toggle-sidebar',
  'preferences',
  'sort-tabs-name',
  'sort-tabs-path',
  'sort-tabs-type',
  'connect-server',
])

const settingsStore = useSettingsStore()
const fileTreeStore = useFileTreeStore()
const query = ref('')
const selectedIndex = ref(0)
const inputRef = ref(null)

const commands = [
  { id: 'new', label: 'New File', icon: '📄', action: 'new' },
  { id: 'open-file', label: 'Open File...', icon: '📂', action: 'open-file' },
  { id: 'open-folder', label: 'Open Folder...', icon: '📁', action: 'open-folder' },
  { id: 'connect-server', label: 'Connect Server...', icon: '🌐', action: 'connect-server' },
  { id: 'toggle-sidebar', label: 'Toggle Sidebar', icon: '🧭', action: 'toggle-sidebar' },
  { id: 'toggle-terminal', label: 'Toggle Terminal', icon: '⌨️', action: 'toggle-terminal' },
  { id: 'sort-tabs-name', label: 'Sort Tabs by Name', icon: '🔤', action: 'sort-tabs-name' },
  { id: 'sort-tabs-path', label: 'Sort Tabs by Path', icon: '🗂️', action: 'sort-tabs-path' },
  { id: 'sort-tabs-type', label: 'Sort Tabs by Type', icon: '🧩', action: 'sort-tabs-type' },
  { id: 'preferences', label: 'Open Preferences', icon: '⚙️', action: 'preferences' },
  { id: 'run', label: 'Run Command...', icon: '▶️', action: 'run-command' },
]

const recentItems = computed(() =>
  (settingsStore.recentFiles || []).slice(0, 8).map((path, i) => ({
    id: 'recent-' + i,
    label: path.split(/[/\\]/).pop(),
    sublabel: path,
    path,
    action: 'open-file',
  }))
)

const allItems = computed(() => {
  if (props.recentOnly) return recentItems.value
  const list = [...commands]
  if (recentItems.value.length) {
    list.push({ id: 'sep', label: '— Recent —', separator: true })
    list.push(...recentItems.value)
  }
  return list
})

const filteredItems = computed(() => {
  const q = query.value.trim().toLowerCase()
  if (!q) return allItems.value.filter(i => !i.separator)
  return allItems.value.filter(i => {
    if (i.separator) return false
    return i.label.toLowerCase().includes(q) || (i.sublabel && i.sublabel.toLowerCase().includes(q))
  })
})

watch(filteredItems, () => { selectedIndex.value = 0 })
watch(query, () => { selectedIndex.value = 0 })

function selectNext() {
  selectedIndex.value = Math.min(selectedIndex.value + 1, filteredItems.value.length - 1)
}

function selectPrev() {
  selectedIndex.value = Math.max(selectedIndex.value - 1, 0)
}

function runSelected() {
  const item = filteredItems.value[selectedIndex.value]
  if (item) runItem(item)
}

function runItem(item) {
  if (item.separator) return
  emit('close')
  switch (item.action) {
    case 'new':
      emit('new')
      break
    case 'open-file':
      if (item.path) emit('open-file', item.path)
      else emit('open-file-dialog')
      break
    case 'open-folder':
      if (window.electronAPI) {
        window.electronAPI.openFolderDialog().then(path => {
          if (path) {
            if (fileTreeStore.workspaceMode === 'remote' && fileTreeStore.remoteConnection?.connectionId) {
              window.electronAPI.remoteDisconnect?.(fileTreeStore.remoteConnection.connectionId)
            }
            fileTreeStore.setLocalWorkspace(path)
            window.electronAPI.watchFolder(path)
          }
        })
      } else if (typeof window !== 'undefined') {
        alert('Folder Open is only available in the AuroraPad desktop app. Please run the Electron build.')
      }
      break
    case 'run-command':
      emit('run-command')
      break
    case 'connect-server':
      emit('connect-server')
      break
    case 'toggle-terminal':
      emit('toggle-terminal')
      break
    case 'toggle-sidebar':
      emit('toggle-sidebar')
      break
    case 'preferences':
      emit('preferences')
      break
    case 'sort-tabs-name':
      emit('sort-tabs-name')
      break
    case 'sort-tabs-path':
      emit('sort-tabs-path')
      break
    case 'sort-tabs-type':
      emit('sort-tabs-type')
      break
    default:
      break
  }
}
</script>
