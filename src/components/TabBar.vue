<template>
  <div class="tabs-row">
    <div
      v-for="tab in tabsStore.tabs"
      :key="tab.id"
      class="tab"
      :class="{ active: tabsStore.activeTabId === tab.id }"
      draggable="true"
      @click="tabsStore.setActive(tab.id)"
      @mousedown.middle.prevent.stop="closeTab(tab.id)"
      @dragstart="onDragStart(tab.id)"
      @dragover.prevent
      @drop="onDrop(tab.id)"
    >
      <span class="tab-icon">{{ iconForTab(tab.name) }}</span>
      <span v-if="tab.isDirty" class="dirty-dot" title="Unsaved changes"></span>
      <span>{{ tab.name }}</span>
      <button
        type="button"
        class="close-btn"
        aria-label="Close tab"
        @click.stop="closeTab(tab.id)"
      >
        ✕
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useTabsStore } from '../stores/tabs'

const tabsStore = useTabsStore()
const dragTabId = ref(null)

function closeTab(id) {
  const tab = tabsStore.getTab(id)
  if (tab?.isDirty && !confirm(`"${tab.name}" has unsaved changes. Close anyway?`)) return
  tabsStore.closeTab(id)
}

function onDragStart(id) {
  dragTabId.value = id
}

function onDrop(targetId) {
  const sourceId = dragTabId.value
  dragTabId.value = null
  if (!sourceId || sourceId === targetId) return
  const tabs = tabsStore.tabs
  const from = tabs.findIndex(t => t.id === sourceId)
  const to = tabs.findIndex(t => t.id === targetId)
  if (from === -1 || to === -1) return
  const [moved] = tabs.splice(from, 1)
  tabs.splice(to, 0, moved)
}

function iconForTab(name = '') {
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
