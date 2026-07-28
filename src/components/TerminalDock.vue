<template>
  <div class="terminal-dock">
    <div class="terminal-toolbar">
      <span class="terminal-toolbar-label">TERMINAL</span>
      <span v-if="activeSession" class="terminal-toolbar-session">
        {{ activeSession.title }}
        <span v-if="activeSession.cwd" class="terminal-cwd">{{ compactPath(activeSession.cwd) }}</span>
      </span>
      <span class="terminal-platform">{{ platformPill }}</span>
      <div class="terminal-toolbar-actions">
        <button type="button" class="terminal-action-btn" title="Clear active terminal" @click="clearActiveSession">
          <i class="fa-solid fa-eraser"></i>
        </button>
        <select
          v-model="profileShell"
          class="terminal-profile-select"
          title="Default shell profile for new terminals"
        >
          <option v-for="profile in availableProfiles" :key="profile.id" :value="profile.id">
            {{ profile.label }}
          </option>
        </select>
        <button
          type="button"
          class="terminal-action-btn terminal-action-btn-primary"
          :title="`New ${profileLabel(profileShell)} terminal`"
          @click="newSession(profileShell)"
        >
          <i class="fa-solid fa-plus"></i>
        </button>
        <button type="button" class="terminal-action-btn" title="Hide terminal" @click="$emit('close')">
          <i class="fa-solid fa-chevron-down"></i>
        </button>
      </div>
    </div>
    <div class="terminal-tabs">
      <div
        v-for="session in sessions"
        :key="session.id"
        class="terminal-tab"
        :class="{ active: session.id === activeSessionId }"
        @click="setActive(session.id)"
      >
        <span class="terminal-status-dot" :class="`is-${session.status || 'starting'}`"></span>
        <span class="terminal-tab-title">{{ session.title }}</span>
        <span class="terminal-shell-label" :data-accent="session.accent || 'default'">
          {{ labelForShell(session.shell) }}
        </span>
        <button
          v-if="sessions.length > 1"
          type="button"
          class="terminal-tab-close"
          @click.stop="closeSession(session.id)"
        >
          ✕
        </button>
      </div>
    </div>
    <div class="terminal-dock-body">
      <TerminalPanel
        v-for="session in sessions"
        :key="session.id"
        :ref="panel => setPanelRef(session.id, panel)"
        v-show="session.id === activeSessionId"
        :show-header="false"
        :shell="session.shell"
        :cwd="session.cwd || ''"
        :title="session.title"
        :active="session.id === activeSessionId"
        @status-change="status => updateSessionStatus(session.id, status)"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import TerminalPanel from './TerminalPanel.vue'

const props = defineProps({
  platformInfo: {
    type: Object,
    default: () => ({
      platform: 'unknown',
      defaultShellProfile: 'default',
      terminalProfiles: [{ id: 'default', label: 'Default', available: true, accent: 'default' }],
    }),
  },
})

const emit = defineEmits(['close'])

const panelRefs = new Map()
const sessions = ref([])
const activeSessionId = ref('')
const profileShell = ref('default')
let nextCounter = 1

const availableProfiles = computed(() => {
  const profiles = Array.isArray(props.platformInfo?.terminalProfiles)
    ? props.platformInfo.terminalProfiles.filter(profile => profile.available)
    : []
  return profiles.length ? profiles : [{ id: 'default', label: 'Default', available: true, accent: 'default' }]
})

const activeSession = computed(() =>
  sessions.value.find(session => session.id === activeSessionId.value) || null
)

const platformPill = computed(() => {
  const platform = props.platformInfo?.platform || 'unknown'
  if (platform === 'darwin') return 'macOS'
  if (platform === 'win32') return 'Windows'
  if (platform === 'linux') return 'Linux'
  return platform
})

watch(availableProfiles, (profiles) => {
  const nextDefault = props.platformInfo?.defaultShellProfile || profiles[0]?.id || 'default'
  if (!profiles.some(profile => profile.id === profileShell.value)) {
    profileShell.value = profiles.some(profile => profile.id === nextDefault) ? nextDefault : profiles[0].id
  }

  if (!sessions.value.length) {
    newSession(profileShell.value)
  }
}, { immediate: true })

function isSshShell(shell) {
  return String(shell || '').startsWith('ssh:')
}

function profileForShell(shell) {
  if (isSshShell(shell)) {
    return { id: shell, label: 'SSH', accent: 'ssh' }
  }
  return availableProfiles.value.find(profile => profile.id === shell)
    || availableProfiles.value.find(profile => profile.id === 'default')
    || { id: 'default', label: 'Default', accent: 'default' }
}

function setPanelRef(id, panel) {
  if (panel) panelRefs.set(id, panel)
  else panelRefs.delete(id)
}

function setActive(id) {
  if (sessions.value.some(session => session.id === id)) {
    activeSessionId.value = id
  }
}

function compactPath(cwd) {
  if (!cwd) return ''
  const parts = cwd.split(/[/\\]/).filter(Boolean)
  return parts.length > 3 ? `…/${parts.slice(-3).join('/')}` : cwd
}

function makeSessionTitle(shell, cwd) {
  if (isSshShell(shell)) {
    const tail = cwd ? cwd.split(/[/\\]/).filter(Boolean).pop() : ''
    return tail ? `SSH • ${tail}` : 'SSH Session'
  }
  const profile = profileForShell(shell)
  const label = profile.label
  const leaf = cwd ? cwd.split(/[/\\]/).filter(Boolean).pop() : ''
  const counter = nextCounter++
  return leaf ? `${label} • ${leaf}` : `${label} ${counter}`
}

function newSession(shell = profileShell.value, cwd = '', options = {}) {
  const safeShell = isSshShell(shell) ? shell : profileForShell(shell).id
  const id = `term-${Date.now()}-${nextCounter}`
  sessions.value.push({
    id,
    title: options.title || makeSessionTitle(safeShell, cwd),
    shell: safeShell,
    cwd,
    accent: profileForShell(safeShell).accent,
    status: 'starting',
  })
  activeSessionId.value = id
}

function closeSession(id) {
  if (sessions.value.length === 1) {
    emit('close')
    return
  }

  const index = sessions.value.findIndex(session => session.id === id)
  if (index === -1) return

  const wasActive = activeSessionId.value === id
  sessions.value.splice(index, 1)
  panelRefs.delete(id)

  if (wasActive && sessions.value.length) {
    activeSessionId.value = sessions.value[Math.min(index, sessions.value.length - 1)].id
  }
}

function nextSession() {
  if (!sessions.value.length) return
  const index = sessions.value.findIndex(session => session.id === activeSessionId.value)
  activeSessionId.value = sessions.value[(index + 1) % sessions.value.length].id
}

function prevSession() {
  if (!sessions.value.length) return
  const index = sessions.value.findIndex(session => session.id === activeSessionId.value)
  activeSessionId.value = sessions.value[(index - 1 + sessions.value.length) % sessions.value.length].id
}

function updateSessionStatus(id, status) {
  const session = sessions.value.find(item => item.id === id)
  if (session) {
    session.status = status
  }
}

function clearActiveSession() {
  if (!activeSessionId.value) return
  panelRefs.get(activeSessionId.value)?.clearTerminal?.()
}

function profileLabel(shell) {
  return profileForShell(shell).label
}

function labelForShell(shell) {
  if (isSshShell(shell)) return 'SSH'
  return profileForShell(shell).label
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
  height: 260px;
  border-top: 1px solid var(--npp-tab-border);
  background:
    linear-gradient(180deg, color-mix(in srgb, var(--npp-toolbar-bg) 88%, var(--npp-bg)) 0%, var(--npp-bg) 100%);
}

.terminal-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 10px;
  border-bottom: 1px solid color-mix(in srgb, var(--npp-tab-border) 76%, transparent);
  flex-shrink: 0;
  min-height: 0;
}

.terminal-toolbar-label {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: var(--npp-text-dim);
  flex-shrink: 0;
}

.terminal-toolbar-session {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: var(--npp-text, #cdd6f4);
  overflow: hidden;
  min-width: 0;
}

.terminal-cwd {
  font-size: 11px;
  color: var(--npp-text-dim);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.terminal-platform {
  font-size: 10px;
  padding: 1px 6px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--npp-accent) 14%, transparent);
  color: var(--npp-accent);
  flex-shrink: 0;
}

.terminal-toolbar-actions {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

.terminal-action-btn {
  height: 24px;
  min-width: 24px;
  border-radius: 6px;
  border: 1px solid color-mix(in srgb, var(--npp-tab-border) 86%, transparent);
  background: color-mix(in srgb, var(--npp-toolbar-bg) 70%, transparent);
  color: var(--npp-text);
  padding: 0 8px;
  font: inherit;
  font-size: 11px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.terminal-profile-select {
  height: 24px;
  border-radius: 6px;
  border: 1px solid color-mix(in srgb, var(--npp-tab-border) 86%, transparent);
  background: color-mix(in srgb, var(--npp-toolbar-bg) 70%, transparent);
  color: var(--npp-text);
  padding: 0 6px;
  font: inherit;
  font-size: 11px;
  cursor: pointer;
}

.terminal-action-btn:hover,
.terminal-profile-select:hover {
  background: var(--npp-toolbar-hover);
}

.terminal-action-btn-primary {
  background: color-mix(in srgb, var(--npp-accent) 16%, var(--npp-toolbar-bg));
  color: var(--npp-accent);
}

.terminal-tabs {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  overflow-x: auto;
  border-bottom: 1px solid color-mix(in srgb, var(--npp-tab-border) 72%, transparent);
}

.terminal-tab {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  padding: 8px 10px;
  border-radius: 12px;
  border: 1px solid transparent;
  background: color-mix(in srgb, var(--npp-tab-bg) 76%, transparent);
  cursor: pointer;
}

.terminal-tab.active {
  background: color-mix(in srgb, var(--npp-accent) 12%, var(--npp-tab-active-bg));
  border-color: color-mix(in srgb, var(--npp-accent) 26%, transparent);
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.08);
}

.terminal-status-dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  flex-shrink: 0;
  background: #f3c969;
}

.terminal-status-dot.is-ready {
  background: #47c27d;
}

.terminal-status-dot.is-error,
.terminal-status-dot.is-exited {
  background: #f07167;
}

.terminal-tab-title {
  max-width: 220px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.terminal-shell-label {
  padding: 2px 7px;
  border-radius: 999px;
  font-size: 10px;
  background: color-mix(in srgb, var(--npp-toolbar-hover) 82%, transparent);
  color: var(--npp-text-dim);
}

.terminal-shell-label[data-accent='powershell'] {
  color: #3178c6;
}

.terminal-shell-label[data-accent='bash'] {
  color: #2f855a;
}

.terminal-shell-label[data-accent='wsl'] {
  color: #805ad5;
}

.terminal-tab-close {
  border: none;
  background: transparent;
  cursor: pointer;
  color: var(--npp-text-dim);
}

.terminal-dock-body {
  flex: 1;
  min-height: 0;
  display: flex;
}

@media (max-width: 600px) {
  .terminal-toolbar-session { display: none; }
}
</style>
