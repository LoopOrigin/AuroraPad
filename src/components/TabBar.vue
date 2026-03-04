<template>
  <div class="tabs-row">
    <div
      v-for="tab in tabsStore.tabs"
      :key="tab.id"
      class="tab"
      :class="{ active: tabsStore.activeTabId === tab.id }"
      @click="tabsStore.setActive(tab.id)"
    >
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
import { useTabsStore } from '../stores/tabs'

const tabsStore = useTabsStore()

function closeTab(id) {
  const tab = tabsStore.getTab(id)
  if (tab?.isDirty && !confirm(`"${tab.name}" has unsaved changes. Close anyway?`)) return
  tabsStore.closeTab(id)
}
</script>
