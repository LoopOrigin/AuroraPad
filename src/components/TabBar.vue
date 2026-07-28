<template>
  <div class="tabs-row" @click.self="contextMenu.visible = false">
    <div
      v-for="tab in tabsStore.tabs"
      :key="tab.id"
      class="tab"
      :class="{ active: tabsStore.activeTabId === tab.id }"
      draggable="true"
      @click="tabsStore.setActive(tab.id)"
      @mousedown.middle.prevent.stop="closeTab(tab.id)"
      @contextmenu.prevent="openContextMenu(tab, $event)"
      @dragstart="onDragStart(tab.id)"
      @dragover.prevent
      @drop="onDrop(tab.id)"
    >
      <span class="tab-icon" :class="['file-badge', tabBadgeClass(tab.name)]" aria-hidden="true">{{ tabBadgeText(tab.name) }}</span>
      <span v-if="tab.isDirty" class="dirty-dot" title="Unsaved changes">M</span>
      <span class="tab-label" :title="tab.path || tab.name">{{ tab.name }}</span>
      <button
        type="button"
        class="close-btn"
        aria-label="Close tab"
        title="Close tab (Ctrl+W)"
        @click.stop="closeTab(tab.id)"
      >
        <i class="fa-solid fa-xmark" style="font-size:9px"></i>
      </button>
    </div>

    <!-- Tab context menu -->
    <Teleport to="body">
      <div
        v-if="contextMenu.visible"
        class="tab-context-backdrop"
        @click="contextMenu.visible = false"
        @contextmenu.prevent="contextMenu.visible = false"
      />
      <ul
        v-if="contextMenu.visible"
        class="tab-context-menu"
        :style="{ left: contextMenu.x + 'px', top: contextMenu.y + 'px' }"
        role="menu"
      >
        <li role="menuitem" @click="ctxClose">Close</li>
        <li
          role="menuitem"
          :class="{ disabled: tabsStore.tabs.length <= 1 }"
          @click="ctxCloseOthers"
        >
          Close Others
        </li>
        <li role="separator" class="tab-ctx-sep" />
        <li
          v-if="contextMenu.tab?.path"
          role="menuitem"
          @click="ctxCopyPath"
        >
          Copy Path
        </li>
        <li
          v-if="contextMenu.tab?.path && !isRemoteTab(contextMenu.tab)"
          role="menuitem"
          @click="ctxReveal"
        >
          Reveal in File Manager
        </li>
      </ul>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useTabsStore } from '../stores/tabs'

const tabsStore = useTabsStore()
const dragTabId = ref(null)

const contextMenu = reactive({ visible: false, x: 0, y: 0, tab: null })

function isRemoteTab(tab) {
  return !!(tab?.connectionId || tab?.isRemote)
}

function openContextMenu(tab, event) {
  tabsStore.setActive(tab.id)
  const vw = window.innerWidth
  const vh = window.innerHeight
  const menuW = 180
  const menuH = 130
  contextMenu.x = Math.min(event.clientX, vw - menuW - 8)
  contextMenu.y = Math.min(event.clientY, vh - menuH - 8)
  contextMenu.tab = tab
  contextMenu.visible = true
}

function closeTab(id) {
  const tab = tabsStore.getTab(id)
  if (tab?.isDirty && !confirm(`"${tab.name}" has unsaved changes. Close anyway?`)) return
  tabsStore.closeTab(id)
}

function ctxClose() {
  contextMenu.visible = false
  if (contextMenu.tab) closeTab(contextMenu.tab.id)
}

function ctxCloseOthers() {
  contextMenu.visible = false
  if (!contextMenu.tab) return
  const id = contextMenu.tab.id
  const dirtyOthers = tabsStore.tabs.filter(t => t.id !== id && t.isDirty)
  if (dirtyOthers.length && !confirm(`${dirtyOthers.length} unsaved tab(s) will be closed. Continue?`)) return
  tabsStore.closeOthers(id)
}

function ctxCopyPath() {
  contextMenu.visible = false
  const path = contextMenu.tab?.path
  if (path) navigator.clipboard.writeText(path).catch(() => {})
}

function ctxReveal() {
  contextMenu.visible = false
  const path = contextMenu.tab?.path
  if (path) window.electronAPI?.revealInFolder?.(path)
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

function tabBadgeText(name = '') {
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
  if (lower.endsWith('.md')) return 'MD'
  if (lower.endsWith('.py')) return 'PY'
  if (lower.endsWith('.go')) return 'GO'
  if (lower.endsWith('.rs')) return 'RS'
  const ext = lower.split('.').pop()
  return ext && ext.length <= 4 ? ext.toUpperCase() : '···'
}

function tabBadgeClass(name = '') {
  const lower = name.toLowerCase()
  if (lower.endsWith('.ts') || lower.endsWith('.tsx')) return 'file-badge-ts'
  if (lower.endsWith('.js') || lower.endsWith('.jsx')) return 'file-badge-js'
  if (lower.endsWith('.vue')) return 'file-badge-vue'
  if (lower.endsWith('.html') || lower.endsWith('.htm')) return 'file-badge-html'
  if (lower.endsWith('.css') || lower.endsWith('.scss') || lower.endsWith('.less')) return 'file-badge-css'
  if (lower.endsWith('.json') || lower.endsWith('.yml') || lower.endsWith('.yaml')) return 'file-badge-json'
  if (lower.endsWith('.md')) return 'file-badge-md'
  if (lower.endsWith('.py')) return 'file-badge-py'
  if (lower.endsWith('.go')) return 'file-badge-go'
  if (lower.endsWith('.rs')) return 'file-badge-rs'
  return ''
}
</script>

<style scoped>
.tab-context-backdrop {
  position: fixed;
  inset: 0;
  z-index: 9998;
}

.tab-context-menu {
  position: fixed;
  z-index: 9999;
  min-width: 170px;
  padding: 4px 0;
  margin: 0;
  list-style: none;
  background: var(--aurora-surface, #1e2736);
  border: 1px solid var(--aurora-border, rgba(255,255,255,0.1));
  border-radius: 6px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.45);
  font-size: 13px;
  color: var(--aurora-text, #e0e6f0);
}

.tab-context-menu li[role='menuitem'] {
  padding: 6px 16px;
  cursor: pointer;
  white-space: nowrap;
  border-radius: 3px;
}

.tab-context-menu li[role='menuitem']:hover {
  background: var(--aurora-hover, rgba(255,255,255,0.08));
}

.tab-context-menu li[role='menuitem'].disabled {
  opacity: 0.38;
  pointer-events: none;
}

.tab-ctx-sep {
  height: 1px;
  margin: 4px 8px;
  background: var(--aurora-border, rgba(255,255,255,0.1));
}
</style>
