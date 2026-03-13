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
const emit = defineEmits(['close', 'open-file', 'open-file-dialog', 'new', 'run-command'])

const settingsStore = useSettingsStore()
const fileTreeStore = useFileTreeStore()
const query = ref('')
const selectedIndex = ref(0)
const inputRef = ref(null)

const commands = [
  { id: 'new', label: 'New File', icon: '📄', action: 'new' },
  { id: 'open-file', label: 'Open File...', icon: '📂', action: 'open-file' },
  { id: 'open-folder', label: 'Open Folder...', icon: '📁', action: 'open-folder' },
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
            fileTreeStore.setOpenFolder(path)
            window.electronAPI.watchFolder(path)
          }
        })
      }
      break
    case 'run-command':
      emit('run-command')
      break
    default:
      break
  }
}
</script>
