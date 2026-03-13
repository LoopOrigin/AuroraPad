<template>
  <div class="menu-bar">
    <div class="menu-bar-left">
      <div
        v-for="menu in menus"
        :key="menu.id"
        ref="menuRefs"
        class="menu-bar-item"
        :class="{ open: openMenuId === menu.id }"
        @click.stop="toggleMenu(menu.id)"
      >
        {{ menu.label }}
      </div>
    </div>
    <div class="menu-bar-right">
      <button type="button" class="menu-bar-icon" title="Minimize" @click="windowMinimize">
        <i class="fa-solid fa-minus window-control-inner"></i>
      </button>
      <button type="button" class="menu-bar-icon" title="Maximize" @click="windowMaximize">
        <i class="fa-regular fa-square window-control-inner"></i>
      </button>
      <button type="button" class="menu-bar-icon close-btn" title="Close" @click="windowClose">
        <i class="fa-solid fa-xmark window-control-inner"></i>
      </button>
    </div>
    <Teleport to="body">
      <div
        v-if="openMenuId"
        class="menu-bar-overlay"
        @click="closeMenu"
      />
      <div
        v-if="openMenuId && menuStyle"
        class="menu-bar-dropdown"
        :style="menuStyle"
        @click.stop
      >
        <template v-for="(item, idx) in currentMenuItems" :key="idx">
          <div
            v-if="item.type === 'separator'"
            class="menu-dropdown-sep"
          />
          <button
            v-else
            type="button"
            class="menu-dropdown-item"
            :class="{ disabled: item.enabled === false }"
            :disabled="item.enabled === false"
            @click="runItem(item)"
          >
            <span class="menu-dropdown-left">
              <span
                v-if="item.icon"
                class="menu-dropdown-icon"
                :class="item.icon"
              />
              <span class="menu-dropdown-label">{{ item.label }}</span>
            </span>
            <span
              v-if="item.shortcut"
              class="menu-dropdown-shortcut"
            >
              {{ item.shortcut }}
            </span>
          </button>
        </template>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  menus: { type: Array, required: true },
})

const emit = defineEmits(['new', 'open', 'close-tab', 'action'])

const openMenuId = ref(null)
const menuStyle = ref(null)
const menuRefs = ref([])

const currentMenuItems = computed(() => {
  if (!openMenuId.value) return []
  const menu = props.menus.find(m => m.id === openMenuId.value)
  return menu?.items ?? []
})

function toggleMenu(id) {
  if (openMenuId.value === id) {
    closeMenu()
    return
  }
  openMenuId.value = id
  positionDropdown()
}

function positionDropdown() {
  if (!openMenuId.value || !menuRefs.value.length) return
  const menu = props.menus.find(m => m.id === openMenuId.value)
  const idx = props.menus.indexOf(menu)
  const el = Array.isArray(menuRefs.value) ? menuRefs.value[idx] : menuRefs.value
  if (!el) return
  const rect = el.getBoundingClientRect()
  menuStyle.value = {
    position: 'fixed',
    left: `${rect.left}px`,
    top: `${rect.bottom}px`,
    minWidth: `${Math.max(rect.width, 200)}px`,
  }
}

function closeMenu() {
  openMenuId.value = null
  menuStyle.value = null
}

function runItem(item) {
  if (item.action) emit('action', item.action, item)
  closeMenu()
}

function windowMinimize() {
  window.electronAPI?.minimizeWindow()
}

function windowMaximize() {
  window.electronAPI?.maximizeWindow()
}

function windowClose() {
  window.electronAPI?.closeWindow()
}

function onKeydown(e) {
  if (e.key === 'Escape') closeMenu()
}

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
})
</script>

<style scoped>
.menu-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 30px;
  padding: 0;
  background: var(--npp-menubar-bg, #f0f0f0);
  border-bottom: 1px solid var(--npp-toolbar-border);
  font-size: 13px;
  flex-shrink: 0;
  -webkit-app-region: drag;
}

.menu-bar-left {
  display: flex;
  align-items: center;
  gap: 0;
  height: 100%;
  padding-left: 4px;
  -webkit-app-region: no-drag;
}

.menu-bar-item {
  display: flex;
  align-items: center;
  height: 100%;
  padding: 0 10px;
  cursor: default;
  user-select: none;
  color: var(--npp-text);
}

.menu-bar-item:hover,
.menu-bar-item.open {
  background: var(--npp-menubar-hover, #cce8ff);
}

.menu-bar-right {
  display: flex;
  align-items: center;
  gap: 0;
  height: 100%;
  -webkit-app-region: no-drag;
}

.menu-bar-icon {
  width: 46px;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--npp-text);
  border: none;
  background: transparent;
  transition: background 0.1s;
}

.window-control-inner {
  font-size: 10px;
}

.menu-bar-icon:hover {
  background: var(--npp-menubar-hover, rgba(0, 0, 0, 0.1));
}

.menu-bar-icon.close-btn:hover {
  background: #e81123;
  color: white;
}

.menu-bar-overlay {
  position: fixed;
  inset: 0;
  z-index: 999;
}

.menu-bar-dropdown {
  position: fixed;
  z-index: 1000;
  padding: 4px 0;
  background: var(--npp-tab-active-bg);
  border: 1px solid var(--npp-tab-border);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  font-size: 13px;
}

.menu-dropdown-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 4px 24px 4px 8px;
  text-align: left;
  cursor: pointer;
  color: var(--npp-text);
  background: transparent;
  border: none;
  font: inherit;
}

.menu-dropdown-left {
  display: flex;
  align-items: center;
  gap: 6px;
}

.menu-dropdown-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.menu-dropdown-label {
  flex: 1;
}

.menu-dropdown-item:hover:not(.disabled) {
  background: var(--npp-menubar-hover, #cce8ff);
}

.menu-dropdown-item.disabled {
  opacity: 0.5;
  cursor: default;
}

.menu-dropdown-shortcut {
  margin-left: 24px;
  font-size: 12px;
  color: var(--npp-text-dim);
}

.menu-dropdown-sep {
  height: 1px;
  margin: 4px 8px;
  background: var(--npp-toolbar-border);
}
</style>
