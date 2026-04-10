<template>
  <div class="menu-bar">
    <div class="menu-bar-left">
      <div
        v-for="menu in primaryMenus"
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
      <button
        v-if="secondaryMenus.length"
        ref="overflowMenuRef"
        type="button"
        class="menu-bar-icon menu-bar-overflow"
        :class="{ open: openMenuId === OVERFLOW_MENU_ID }"
        title="More Menus"
        @click.stop="toggleMenu(OVERFLOW_MENU_ID)"
      >
        <span class="menu-overflow-glyph" aria-hidden="true">⋯</span>
      </button>
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
          <div
            v-else-if="item.type === 'header'"
            class="menu-dropdown-section-title"
          >
            {{ item.label }}
          </div>
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

const OVERFLOW_MENU_ID = '__overflow__'

const props = defineProps({
  menus: { type: Array, required: true },
  primaryMenuIds: {
    type: Array,
    default: () => ['file', 'remote', 'edit', 'search', 'view', 'terminal'],
  },
})

const emit = defineEmits(['new', 'open', 'close-tab', 'action'])

const openMenuId = ref(null)
const menuStyle = ref(null)
const menuRefs = ref([])
const overflowMenuRef = ref(null)

const primaryMenus = computed(() => {
  const preferred = new Set(props.primaryMenuIds || [])
  return (props.menus || []).filter(menu => preferred.has(menu.id))
})

const secondaryMenus = computed(() => {
  const preferred = new Set(props.primaryMenuIds || [])
  return (props.menus || []).filter(menu => !preferred.has(menu.id))
})

const currentMenuItems = computed(() => {
  if (!openMenuId.value) return []
  if (openMenuId.value === OVERFLOW_MENU_ID) {
    const merged = []
    secondaryMenus.value.forEach((menu, idx) => {
      merged.push({ type: 'header', label: menu.label })
      ;(menu.items || []).forEach(item => merged.push(item))
      if (idx < secondaryMenus.value.length - 1) merged.push({ type: 'separator' })
    })
    return merged
  }
  const menu = primaryMenus.value.find(m => m.id === openMenuId.value) || props.menus.find(m => m.id === openMenuId.value)
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
  if (!openMenuId.value) return
  let el = null
  if (openMenuId.value === OVERFLOW_MENU_ID) {
    el = overflowMenuRef.value
  } else {
    const menu = primaryMenus.value.find(m => m.id === openMenuId.value)
    const idx = primaryMenus.value.indexOf(menu)
    el = Array.isArray(menuRefs.value) ? menuRefs.value[idx] : menuRefs.value
  }
  if (!el) return
  const rect = el.getBoundingClientRect()
  menuStyle.value = {
    position: 'fixed',
    left: openMenuId.value === OVERFLOW_MENU_ID ? `${Math.max(8, rect.right - 320)}px` : `${rect.left}px`,
    top: `${rect.bottom}px`,
    minWidth: `${Math.max(rect.width, openMenuId.value === OVERFLOW_MENU_ID ? 280 : 200)}px`,
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
  height: 34px;
  padding: 0 0 0 6px;
  background: transparent;
  font-size: 13px;
  flex-shrink: 0;
  -webkit-app-region: drag;
}

.menu-bar-left {
  display: flex;
  align-items: center;
  gap: 2px;
  height: 100%;
  -webkit-app-region: no-drag;
}

.menu-bar-item {
  display: flex;
  align-items: center;
  height: 28px;
  padding: 0 10px;
  border-radius: 10px;
  cursor: default;
  user-select: none;
  color: var(--npp-text);
  font-weight: 500;
  transition: background 0.14s ease, color 0.14s ease;
}

.menu-bar-item:hover,
.menu-bar-item.open {
  background: color-mix(in srgb, var(--npp-menubar-hover) 92%, transparent);
}

.menu-bar-right {
  display: flex;
  align-items: center;
  gap: 0;
  height: 100%;
  -webkit-app-region: no-drag;
}

.menu-bar-icon {
  width: 42px;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--npp-text);
  border: none;
  background: transparent;
  transition: background 0.14s ease, color 0.14s ease;
}

.window-control-inner {
  font-size: 10px;
}

.menu-bar-icon:hover {
  background: var(--npp-menubar-hover, rgba(0, 0, 0, 0.1));
}

.menu-bar-overflow {
  width: 36px;
}

.menu-bar-overflow.open {
  background: var(--npp-menubar-hover, rgba(0, 0, 0, 0.1));
}

.menu-overflow-glyph {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  font-size: 18px;
  font-weight: 700;
  line-height: 1;
  transform: translateY(-1px);
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
  padding: 8px;
  background: color-mix(in srgb, var(--npp-tab-active-bg) 96%, transparent);
  border: 1px solid color-mix(in srgb, var(--npp-tab-border) 78%, transparent);
  border-radius: 18px;
  box-shadow: var(--npp-shadow-md);
  backdrop-filter: blur(18px) saturate(125%);
  font-size: 13px;
}

.menu-dropdown-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 8px 16px 8px 10px;
  text-align: left;
  cursor: pointer;
  color: var(--npp-text);
  background: transparent;
  border: none;
  font: inherit;
  border-radius: 12px;
  transition: background 0.14s ease, color 0.14s ease;
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
  background: color-mix(in srgb, var(--npp-menubar-hover) 92%, transparent);
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
  margin: 6px 6px;
  background: color-mix(in srgb, var(--npp-toolbar-border) 88%, transparent);
}

.menu-dropdown-section-title {
  padding: 8px 10px 6px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--npp-text-dim);
}
</style>
