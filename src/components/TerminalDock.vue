<template>
  <div class="terminal-dock">
    <div class="terminal-tabs">
      <div
        v-for="session in sessions"
        :key="session.id"
        class="terminal-tab"
        :class="{ active: session.id === activeSessionId }"
        @click="setActive(session.id)"
      >
        <span>{{ session.title }}</span>
        <span class="terminal-shell-label">{{ labelForShell(session.shell) }}</span>
        <button
          v-if="sessions.length > 1"
          type="button"
          class="terminal-tab-close"
          @click.stop="closeSession(session.id)"
        >
          ✕
        </button>
      </div>
      <button
        type="button"
        class="terminal-tab-add"
        :title="`New ${labelForShell(profileShell)} terminal`"
        @click="newSession(profileShell)"
      >
        +
      </button>
      <select
        v-model="profileShell"
        class="terminal-profile-select"
        title="Default shell profile for new terminals"
      >
        <option value="default">Default</option>
        <option value="powershell">PowerShell</option>
        <option value="bash">Git Bash</option>
        <option value="wsl">WSL</option>
      </select>
      <button type="button" class="terminal-tab-hide" @click="$emit('close')">Hide</button>
    </div>
    <div class="terminal-dock-body">
      <TerminalPanel
        v-for="session in sessions"
        :key="session.id"
        v-show="session.id === activeSessionId"
        :show-header="false"
        :shell="session.shell"
        :title="session.title"
      />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import TerminalPanel from './TerminalPanel.vue'

const emit = defineEmits(['close'])

const sessions = ref([
  { id: 'term-1', title: 'Terminal 1', shell: 'default' },
])
const activeSessionId = ref('term-1')
const profileShell = ref('default')
let nextCounter = 2

function setActive(id) {
  if (sessions.value.some(s => s.id === id)) {
    activeSessionId.value = id
  }
}

function newSession(shell = 'default') {
  const id = `term-${nextCounter++}`
  const index = sessions.value.length + 1
  const title = shellTitle(shell, index)
  sessions.value.push({ id, title, shell })
  activeSessionId.value = id
}

function closeSession(id) {
  if (sessions.value.length === 1) {
    // If only one terminal, just hide via parent
    emit('close')
    return
  }
  const idx = sessions.value.findIndex(s => s.id === id)
  if (idx === -1) return
  const wasActive = activeSessionId.value === id
  sessions.value.splice(idx, 1)
  if (wasActive && sessions.value.length) {
    const next = sessions.value[Math.min(idx, sessions.value.length - 1)]
    activeSessionId.value = next.id
  }
}

function nextSession() {
  if (!sessions.value.length) return
  const idx = sessions.value.findIndex(s => s.id === activeSessionId.value)
  const next = sessions.value[(idx + 1) % sessions.value.length]
  activeSessionId.value = next.id
}

function prevSession() {
  if (!sessions.value.length) return
  const idx = sessions.value.findIndex(s => s.id === activeSessionId.value)
  const next = sessions.value[(idx - 1 + sessions.value.length) % sessions.value.length]
  activeSessionId.value = next.id
}

function shellTitle(shell, index) {
  switch (shell) {
    case 'powershell':
      return `PowerShell ${index}`
    case 'bash':
      return `Git Bash ${index}`
    case 'wsl':
      return `WSL ${index}`
    default:
      return `Terminal ${index}`
  }
}

function labelForShell(shell) {
  if (shell === 'powershell') return 'PS'
  if (shell === 'bash') return 'Git Bash'
  if (shell === 'wsl') return 'WSL'
  return 'Default'
}

defineExpose({
  newSession,
  closeSession,
  nextSession,
  prevSession,
})
</script>

<style scoped>
.terminal-dock {
  display: flex;
  flex-direction: column;
  height: 220px;
  border-top: 1px solid var(--npp-tab-border);
  background: var(--npp-bg);
}

.terminal-tabs {
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 2px 4px;
  border-bottom: 1px solid var(--npp-tab-border);
  font-size: 12px;
}

.terminal-tab {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: 2px 2px 0 0;
  background: var(--npp-tab-bg);
  cursor: pointer;
}

.terminal-tab.active {
  background: var(--npp-tab-active-bg);
  font-weight: 600;
}

.terminal-shell-label {
  font-size: 10px;
  opacity: 0.8;
}

.terminal-tab-close {
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 11px;
}

.terminal-tab-add,
.terminal-tab-hide {
  margin-left: 4px;
  padding: 2px 6px;
  font-size: 12px;
  border-radius: 2px;
  border: 1px solid transparent;
}

.terminal-tab-add:hover,
.terminal-tab-hide:hover {
  border-color: var(--npp-toolbar-border);
  background: var(--npp-toolbar-hover);
}

.terminal-profile-select {
  margin-left: 4px;
  font-size: 11px;
}

.terminal-dock-body {
  flex: 1;
  min-height: 0;
  display: flex;
}
</style>

