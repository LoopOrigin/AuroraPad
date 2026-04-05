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
      <i class="tab-icon" :class="iconForTab(tab.name)" aria-hidden="true"></i>
      <span v-if="tab.isDirty" class="dirty-dot" title="Unsaved changes"></span>
      <span class="tab-label" :title="tab.path || tab.name">{{ tab.name }}</span>
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
