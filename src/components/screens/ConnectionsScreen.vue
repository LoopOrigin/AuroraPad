<template>
  <div class="connections-screen">
    <div class="connections-header">
      <div class="connections-header-left">
        <h1 class="connections-title">SSH Connections</h1>
        <p class="connections-subtitle">Manage and connect to remote servers</p>
      </div>
      <div class="connections-header-right">
        <input
          v-model="filterText"
          type="text"
          class="connections-filter"
          placeholder="Filter servers..."
        />
        <button type="button" class="connections-new-btn" @click="$emit('new-connection')">
          + New Connection
        </button>
      </div>
    </div>

    <div v-if="notif?.msg" class="connections-notif" :class="`connections-notif-${notif.type}`">
      <i :class="notif.type === 'error' ? 'fa-solid fa-circle-xmark' : notif.type === 'success' ? 'fa-solid fa-circle-check' : 'fa-solid fa-circle-info'"></i>
      <span>{{ notif.msg }}</span>
      <button type="button" class="connections-notif-dismiss" @click="$emit('dismiss-notif')">
        <i class="fa-solid fa-xmark"></i>
      </button>
    </div>
    <div v-else-if="connectingId" class="connections-connecting-bar">
      <i class="fa-solid fa-circle-notch fa-spin"></i>
      Connecting to server…
    </div>
    <div v-else-if="loading" class="connections-loading">Loading profiles…</div>

    <div v-else-if="!filteredGroups.length" class="connections-empty">
      <div class="connections-empty-icon">⬡</div>
      <div class="connections-empty-title">No servers yet</div>
      <div class="connections-empty-sub">Click <strong>+ New Connection</strong> to add your first server.</div>
    </div>

    <div v-else class="connections-groups">
      <div v-for="group in filteredGroups" :key="group.name" class="connections-group">
        <div class="connections-group-header">
          <span class="connections-group-name">{{ group.name }}</span>
          <span class="connections-group-line"></span>
          <span class="connections-group-count">{{ group.profiles.length }} server{{ group.profiles.length !== 1 ? 's' : '' }}</span>
        </div>
        <div class="connections-card-grid">
          <div
            v-for="profile in group.profiles"
            :key="profile.id"
            class="connection-card"
            :class="cardClass(profile)"
          >
            <div class="card-header">
              <span class="card-status-dot" :class="statusDotClass(profile)"></span>
              <span class="card-name">{{ profile.name }}</span>
              <span class="card-badge" :class="badgeClass(profile)">{{ statusLabel(profile) }}</span>
            </div>
            <div class="card-host">{{ profile.host }}:{{ profile.port }}</div>
            <div class="card-user">{{ profile.username }} · {{ profile.protocol.toUpperCase() }}</div>
            <div v-if="profile.tags?.length" class="card-tags">
              <span v-for="tag in profile.tags" :key="tag" class="card-tag">{{ tag }}</span>
            </div>
            <div class="card-actions">
              <button
                v-if="isConnected(profile)"
                type="button"
                class="card-disconnect-btn"
                title="Disconnect this session"
                @click="$emit('disconnect', profile)"
              >
                <i class="fa-solid fa-plug-circle-xmark"></i>
                Disconnect
              </button>
              <button
                v-else
                type="button"
                class="card-connect-btn"
                :class="{ 'card-connecting': connectingId === profile.id }"
                :disabled="!!connectingId"
                title="Connect to this server"
                @click="$emit('connect', profile)"
              >
                <i :class="connectingId === profile.id ? 'fa-solid fa-circle-notch fa-spin' : 'fa-solid fa-plug'"></i>
                {{ connectingId === profile.id ? 'Connecting…' : 'Connect' }}
              </button>
              <button type="button" class="card-edit-btn" title="Edit connection profile" :disabled="!!connectingId" @click="$emit('edit', profile)">
                <i class="fa-solid fa-pen"></i>
              </button>
              <button type="button" class="card-delete-btn" title="Delete this profile" :disabled="!!connectingId" @click="$emit('delete', profile)">
                <i class="fa-solid fa-trash-can"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const props = defineProps({
  profiles: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  activeConnectionId: { type: String, default: '' },
  connectingId: { type: String, default: '' },
  notif: { type: Object, default: () => ({ type: '', msg: '' }) },
})

defineEmits(['new-connection', 'connect', 'disconnect', 'edit', 'delete', 'dismiss-notif'])

const filterText = ref('')

const filteredProfiles = computed(() => {
  const q = filterText.value.toLowerCase().trim()
  if (!q) return props.profiles
  return props.profiles.filter(p =>
    p.name?.toLowerCase().includes(q) ||
    p.host?.toLowerCase().includes(q) ||
    p.username?.toLowerCase().includes(q) ||
    p.tags?.some(t => t.toLowerCase().includes(q))
  )
})

const filteredGroups = computed(() => {
  const groups = {}
  for (const p of filteredProfiles.value) {
    // Group by tags first; fall back to group field, then 'Servers'
    const keys = p.tags?.length ? p.tags : [p.group || 'Servers']
    for (const key of keys) {
      if (!groups[key]) groups[key] = []
      // Avoid duplicate if profile has same tag twice
      if (!groups[key].find(x => x.id === p.id)) groups[key].push(p)
    }
  }
  const order = ['Production', 'Staging', 'Development', 'Servers']
  return Object.entries(groups)
    .sort(([a], [b]) => {
      const ai = order.indexOf(a)
      const bi = order.indexOf(b)
      if (ai === -1 && bi === -1) return a.localeCompare(b)
      if (ai === -1) return 1
      if (bi === -1) return -1
      return ai - bi
    })
    .map(([name, profiles]) => ({ name, profiles }))
})

function isConnected(profile) {
  return !!(props.activeConnectionId && profile.id === props.activeConnectionId)
}

function cardClass(profile) {
  if (isConnected(profile)) return 'card-connected'
  return ''
}

function statusDotClass(profile) {
  if (isConnected(profile)) return 'dot-connected'
  return 'dot-offline'
}

function badgeClass(profile) {
  if (isConnected(profile)) return 'badge-connected'
  return 'badge-offline'
}

function statusLabel(profile) {
  if (isConnected(profile)) return 'Connected'
  return 'Offline'
}
</script>

<style scoped>
.connections-screen {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: var(--npp-bg, #090b0f);
  color: var(--npp-text, #cdd6f4);
}

.connections-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 32px 20px;
  border-bottom: 1px solid var(--npp-border, #1c2233);
  flex-shrink: 0;
}

.connections-header-left {}

.connections-title {
  margin: 0 0 4px;
  font-size: 18px;
  font-weight: 600;
  color: var(--npp-text, #cdd6f4);
  letter-spacing: -0.3px;
}

.connections-subtitle {
  margin: 0;
  font-size: 12px;
  color: var(--npp-text-dim, #6b7a99);
}

.connections-header-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.connections-filter {
  background: var(--npp-sidebar, #111520);
  border: 1px solid var(--npp-border, #1c2233);
  border-radius: 6px;
  color: var(--npp-text, #cdd6f4);
  font-size: 13px;
  padding: 6px 12px;
  width: 220px;
  outline: none;
}

.connections-filter:focus {
  border-color: var(--npp-accent, #29d4f0);
}

.connections-new-btn {
  background: var(--npp-accent, #29d4f0);
  color: #090b0f;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  padding: 6px 16px;
  cursor: pointer;
  white-space: nowrap;
}

.connections-new-btn:hover {
  filter: brightness(1.1);
}

.connections-notif {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 24px;
  font-size: 13px;
  flex-shrink: 0;
  border-bottom: 1px solid transparent;
}
.connections-notif-error {
  background: rgba(248, 113, 113, 0.1);
  border-bottom-color: rgba(248, 113, 113, 0.2);
  color: #f87171;
}
.connections-notif-success {
  background: rgba(74, 222, 128, 0.1);
  border-bottom-color: rgba(74, 222, 128, 0.2);
  color: #4ade80;
}
.connections-notif-info {
  background: rgba(41, 212, 240, 0.07);
  border-bottom-color: rgba(41, 212, 240, 0.15);
  color: var(--npp-accent, #29d4f0);
}
.connections-notif span { flex: 1; }
.connections-notif-dismiss {
  background: transparent;
  border: none;
  color: inherit;
  cursor: pointer;
  font-size: 12px;
  padding: 2px 4px;
  opacity: 0.7;
  border-radius: 3px;
}
.connections-notif-dismiss:hover { opacity: 1; }

.connections-connecting-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 32px;
  background: rgba(41,212,240,0.07);
  border-bottom: 1px solid rgba(41,212,240,0.15);
  color: var(--npp-accent, #29d4f0);
  font-size: 13px;
  flex-shrink: 0;
}

.connections-loading,
.connections-empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--npp-text-dim, #6b7a99);
  gap: 8px;
}

.connections-empty-icon { font-size: 48px; opacity: 0.3; }
.connections-empty-title { font-size: 16px; font-weight: 600; color: var(--npp-text, #cdd6f4); }
.connections-empty-sub { font-size: 13px; }

.connections-groups {
  flex: 1;
  overflow-y: auto;
  padding: 24px 32px;
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.connections-group-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
}

.connections-group-name {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--npp-text-dim, #6b7a99);
  white-space: nowrap;
}

.connections-group-line {
  flex: 1;
  height: 1px;
  background: var(--npp-border, #1c2233);
}

.connections-group-count {
  font-size: 11px;
  color: var(--npp-text-dim, #6b7a99);
  white-space: nowrap;
}

.connections-card-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.connection-card {
  width: 300px;
  background: var(--npp-sidebar, #111520);
  border: 1px solid var(--npp-border, #1c2233);
  border-radius: 8px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  transition: border-color 0.15s;
}

.connection-card:hover {
  border-color: var(--npp-border-hover, #29354d);
}

.connection-card.card-connected {
  border-left: 3px solid var(--npp-accent, #29d4f0);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.card-status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.dot-connected {
  background: #4ade80;
  box-shadow: 0 0 6px #4ade80;
}

.dot-offline {
  background: var(--npp-border, #1c2233);
}

.card-name {
  flex: 1;
  font-size: 13px;
  font-weight: 600;
  color: var(--npp-text, #cdd6f4);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card-badge {
  font-size: 10px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 4px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.badge-connected {
  background: rgba(74, 222, 128, 0.15);
  color: #4ade80;
}

.badge-offline {
  background: rgba(255,255,255,0.06);
  color: var(--npp-text-dim, #6b7a99);
}

.card-host {
  font-size: 12px;
  color: var(--npp-text-dim, #6b7a99);
  font-family: monospace;
}

.card-user {
  font-size: 12px;
  color: var(--npp-text-dim, #6b7a99);
}

.card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.card-tag {
  font-size: 10px;
  padding: 2px 6px;
  background: rgba(41, 212, 240, 0.1);
  color: var(--npp-accent, #29d4f0);
  border-radius: 4px;
}

.card-actions {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 4px;
}

.card-connect-btn {
  flex: 1;
  background: var(--npp-accent, #29d4f0);
  color: #090b0f;
  border: none;
  border-radius: 5px;
  font-size: 12px;
  font-weight: 600;
  padding: 5px 10px;
  cursor: pointer;
}

.card-connect-btn:hover:not(:disabled) { filter: brightness(1.1); }
.card-connect-btn:disabled { opacity: 0.6; cursor: not-allowed; }
.card-connect-btn.card-connecting { background: rgba(41,212,240,0.3); color: var(--npp-accent, #29d4f0); }

.card-disconnect-btn {
  flex: 1;
  background: rgba(248, 113, 113, 0.12);
  color: #f87171;
  border: 1px solid rgba(248, 113, 113, 0.25);
  border-radius: 5px;
  font-size: 12px;
  font-weight: 600;
  padding: 5px 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
}

.card-disconnect-btn:hover {
  background: rgba(248, 113, 113, 0.22);
  border-color: rgba(248, 113, 113, 0.4);
}

.card-edit-btn {
  background: rgba(255,255,255,0.07);
  color: var(--npp-text, #cdd6f4);
  border: 1px solid var(--npp-border, #1c2233);
  border-radius: 5px;
  font-size: 12px;
  padding: 5px 10px;
  cursor: pointer;
}

.card-edit-btn:hover { background: rgba(255,255,255,0.12); }

.card-delete-btn {
  background: transparent;
  color: var(--npp-text-dim, #6b7a99);
  border: none;
  font-size: 14px;
  padding: 5px 6px;
  cursor: pointer;
  border-radius: 4px;
}

.card-delete-btn:hover { color: #f87171; background: rgba(248,113,113,0.1); }
</style>
