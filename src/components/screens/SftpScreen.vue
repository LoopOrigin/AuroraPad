<template>
  <div class="sftp-screen">

    <!-- ── Session tab bar ──────────────────────────────── -->
    <div class="sftp-sessions-bar">
      <div
        v-for="session in sessions"
        :key="session.connectionId"
        class="sftp-session-tab"
        :class="{ active: activeSessionId === session.connectionId }"
        :title="session.username + '@' + session.host"
        @click="switchSession(session.connectionId)"
      >
        <i class="fa-solid fa-server" style="font-size:11px;margin-right:5px"></i>
        <span class="sftp-tab-label">{{ session.name || session.host }}</span>
        <button
          type="button"
          class="sftp-tab-close"
          title="Disconnect and close session"
          @click.stop="$emit('disconnect-session', session)"
        >
          <i class="fa-solid fa-trash-can"></i>
        </button>
      </div>
      <button
        type="button"
        class="sftp-session-add"
        title="New SSH connection"
        @click="$emit('new-session')"
      >
        <i class="fa-solid fa-plus"></i>
      </button>
    </div>

    <!-- ── No sessions ────────────────────────────────────── -->
    <div v-if="!sessions.length" class="sftp-empty">
      <i class="fa-solid fa-plug" style="font-size:36px;color:var(--npp-text-dim)"></i>
      <p>No active sessions</p>
      <button type="button" class="sftp-connect-btn" @click="$emit('new-session')">
        <i class="fa-solid fa-plus"></i> Connect to Server
      </button>
    </div>

    <!-- ── Active session content ─────────────────────────── -->
    <template v-else-if="activeSession">

      <!-- Protocol + Connection Bar -->
      <div class="sftp-topbar">
        <div class="protocol-tabs">
          <button v-for="p in protocols" :key="p" type="button"
            class="protocol-tab" :class="{ active: activeProtocol === p }"
            :title="p + ' protocol'"
            @click="activeProtocol = p">{{ p }}</button>
        </div>
        <div class="sftp-connection-info">
          <span class="sftp-connected-chip">
            <span class="sftp-dot"></span>
            {{ activeSession.username }}@{{ activeSession.host }}
          </span>
        </div>
        <div class="sftp-toolbar">
          <button type="button" class="sftp-toolbar-btn" title="Refresh both panes" @click="refreshBoth">
            <i class="fa-solid fa-rotate"></i>
          </button>
          <button type="button" class="sftp-toolbar-btn" title="New remote folder" @click="newFolder">
            <i class="fa-solid fa-folder-plus"></i>
          </button>
          <button
            v-if="activeSession && activeSession.protocol === 'sftp'"
            type="button"
            class="sftp-toolbar-btn sftp-toolbar-btn-ssh"
            title="Open SSH terminal for this connection"
            @click="$emit('open-ssh-terminal', activeSession)"
          >
            <i class="fa-solid fa-terminal"></i>
          </button>
          <button type="button" class="sftp-toolbar-btn sftp-toolbar-btn-danger" title="Disconnect this session" @click="$emit('disconnect-session', activeSession)">
            <i class="fa-solid fa-plug-circle-xmark"></i>
          </button>
        </div>
      </div>

      <!-- Main Content -->
      <div class="sftp-main">
        <!-- Bookmarks Sidebar -->
        <div class="sftp-bookmarks">
          <div class="sftp-section-label">BOOKMARKS</div>
          <div
            v-for="bm in bookmarks"
            :key="bm.path"
            class="sftp-bookmark-item"
            :title="bm.path"
            @click="navigateRemote(bm.path)"
          >
            <i class="fa-solid fa-bookmark" style="font-size:10px"></i> {{ bm.label }}
          </div>
          <div v-if="!bookmarks.length" class="sftp-bookmark-empty">No bookmarks</div>

          <div class="sftp-section-label">LOCAL DRIVES</div>
          <div class="sftp-bookmark-item" title="Root /" @click="navigateLocal('/')">
            <i class="fa-solid fa-hard-drive" style="font-size:10px"></i> /
          </div>
          <div v-if="homeDir" class="sftp-bookmark-item" title="Home directory" @click="navigateLocal(homeDir)">
            <i class="fa-solid fa-house" style="font-size:10px"></i> Home
          </div>

          <div class="sftp-section-label">SESSIONS</div>
          <div
            v-for="s in sessions"
            :key="s.connectionId"
            class="sftp-bookmark-item"
            :class="{ active: s.connectionId === activeSessionId }"
            :title="s.username + '@' + s.host"
            @click="switchSession(s.connectionId)"
          >
            <i class="fa-solid fa-server" style="font-size:10px"></i>
            {{ s.name || s.host }}
          </div>
          <button type="button" class="sftp-new-session-btn" title="Add new connection" @click="$emit('new-session')">
            <i class="fa-solid fa-plus"></i> New session
          </button>
        </div>

        <!-- Dual Panes -->
        <div class="sftp-panes">
          <!-- Local Pane -->
          <div class="sftp-pane">
            <div class="sftp-pane-header">
              <span class="sftp-pane-label">LOCAL</span>
              <div class="sftp-path-bar">
                <button type="button" class="sftp-nav-btn" title="Go back" @click="localGoBack">
                  <i class="fa-solid fa-arrow-left"></i>
                </button>
                <button type="button" class="sftp-nav-btn" title="Go up one level" @click="localGoUp">
                  <i class="fa-solid fa-arrow-up"></i>
                </button>
                <input
                  v-if="localPathEdit"
                  ref="localPathInput"
                  v-model="localPathDraft"
                  class="sftp-path-input"
                  @keydown.enter="commitLocalPath"
                  @keydown.escape="localPathEdit = false"
                  @blur="commitLocalPath"
                />
                <span v-else class="sftp-path-text" :title="localPath" @click="startLocalPathEdit">{{ localPath }}</span>
              </div>
            </div>
            <div class="sftp-col-headers">
              <span class="col-name">Name</span>
              <span class="col-size">Size</span>
              <span class="col-date">Modified</span>
            </div>
            <div class="sftp-file-list" @contextmenu.prevent="onLocalContext">
              <div
                v-for="entry in localEntries"
                :key="entry.name"
                class="sftp-file-row"
                :class="{ selected: selectedLocal === entry.name, directory: entry.isDirectory }"
                :title="entry.name"
                @click="selectedLocal = entry.name"
                @dblclick="entry.isDirectory ? navigateLocal(entry.path) : null"
              >
                <span class="file-row-name">
                  <i :class="entry.isDirectory ? 'fa-solid fa-folder' : 'fa-regular fa-file'" class="file-row-icon"></i>
                  {{ entry.name }}
                </span>
                <span class="file-row-size">{{ entry.isDirectory ? '' : formatSize(entry.size) }}</span>
                <span class="file-row-date">{{ formatDate(entry.modified) }}</span>
              </div>
              <div v-if="!localLoading && !localEntries.length && !localError" class="sftp-pane-empty">Empty directory</div>
            </div>
            <div v-if="localError" class="sftp-pane-error">
              <i class="fa-solid fa-triangle-exclamation"></i> {{ localError }}
              <button type="button" class="sftp-error-dismiss" @click="localError = ''"><i class="fa-solid fa-xmark"></i></button>
            </div>
            <div v-else class="sftp-pane-status">
              <template v-if="localLoading">
                <i class="fa-solid fa-circle-notch fa-spin" style="font-size:10px;margin-right:5px"></i> Loading…
              </template>
              <template v-else>{{ localEntries.length }} items</template>
            </div>
          </div>

          <!-- Remote Pane -->
          <div class="sftp-pane">
            <div class="sftp-pane-header">
              <span class="sftp-pane-label">REMOTE</span>
              <div class="sftp-path-bar">
                <button type="button" class="sftp-nav-btn" title="Go back" @click="remoteGoBack">
                  <i class="fa-solid fa-arrow-left"></i>
                </button>
                <button type="button" class="sftp-nav-btn" title="Go up one level" @click="remoteGoUp">
                  <i class="fa-solid fa-arrow-up"></i>
                </button>
                <input
                  v-if="remotePathEdit"
                  ref="remotePathInput"
                  v-model="remotePathDraft"
                  class="sftp-path-input"
                  @keydown.enter="commitRemotePath"
                  @keydown.escape="remotePathEdit = false"
                  @blur="commitRemotePath"
                />
                <span v-else class="sftp-path-text" :title="remotePath" @click="startRemotePathEdit">{{ remotePath }}</span>
              </div>
            </div>
            <div class="sftp-col-headers">
              <span class="col-name">Name</span>
              <span class="col-size">Size</span>
              <span class="col-perms">Perms</span>
            </div>
            <div class="sftp-file-list" @contextmenu.prevent="onRemoteContext">
              <div
                v-for="entry in remoteEntries"
                :key="entry.name"
                class="sftp-file-row"
                :class="{ selected: selectedRemote === entry.name, directory: entry.isDirectory }"
                :title="entry.name"
                @click="selectedRemote = entry.name"
                @dblclick="entry.isDirectory ? navigateRemote(entry.path) : null"
              >
                <span class="file-row-name">
                  <i :class="entry.isDirectory ? 'fa-solid fa-folder' : 'fa-regular fa-file'" class="file-row-icon"></i>
                  {{ entry.name }}
                </span>
                <span class="file-row-size">{{ entry.isDirectory ? '' : formatSize(entry.size) }}</span>
                <span class="file-row-perms">{{ entry.permissions || '' }}</span>
              </div>
              <div v-if="!remoteLoading && !remoteEntries.length && !remoteError" class="sftp-pane-empty">Empty directory</div>
            </div>
            <div v-if="remoteError" class="sftp-pane-error">
              <i class="fa-solid fa-triangle-exclamation"></i> {{ remoteError }}
              <button type="button" class="sftp-error-dismiss" @click="remoteError = ''"><i class="fa-solid fa-xmark"></i></button>
            </div>
            <div v-else class="sftp-pane-status">
              <template v-if="remoteLoading">
                <i class="fa-solid fa-circle-notch fa-spin" style="font-size:10px;margin-right:5px"></i> Loading…
              </template>
              <template v-else>{{ remoteEntries.length }} items</template>
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom Panel -->
      <div class="sftp-bottom">
        <div class="sftp-bottom-tabs">
          <button v-for="tab in bottomTabs" :key="tab.id" type="button"
            class="sftp-bottom-tab" :class="{ active: bottomTab === tab.id }"
            @click="bottomTab = tab.id">
            {{ tab.label }}
            <span v-if="tab.badge" class="sftp-tab-badge">{{ tab.badge }}</span>
          </button>
        </div>
        <div class="sftp-bottom-content">
          <template v-if="bottomTab === 'transfers'">
            <div v-if="!transfers.length" class="sftp-bottom-empty">No active transfers</div>
            <div v-for="t in transfers" :key="t.id" class="transfer-row">
              <span class="transfer-name">{{ t.name }}</span>
              <div class="transfer-progress-bar"><div class="transfer-progress-fill" :style="{ width: t.progress + '%' }"></div></div>
              <span class="transfer-percent">{{ t.progress }}%</span>
            </div>
          </template>
          <template v-else-if="bottomTab === 'ports'">
            <div class="port-forwarding-toolbar">
              <button type="button" class="sftp-action-btn" title="Add port forward tunnel" @click="addPortForward">
                <i class="fa-solid fa-plus"></i> Add Tunnel
              </button>
            </div>
            <div v-if="!portForwards.length" class="sftp-bottom-empty">No active tunnels</div>
            <div v-for="pf in portForwards" :key="pf.id" class="port-row">
              <span class="port-local">127.0.0.1:{{ pf.localPort }}</span>
              <span class="port-arrow">→</span>
              <span class="port-remote">{{ pf.remoteHost }}:{{ pf.remotePort }}</span>
              <span class="port-label">{{ pf.label || 'tunnel' }}</span>
              <button type="button" class="port-stop-btn" title="Stop this tunnel" @click="stopPortForward(pf.id)">
                <i class="fa-solid fa-trash-can"></i>
              </button>
            </div>
          </template>
          <template v-else-if="bottomTab === 'log'">
            <div class="session-log">
              <div v-for="(line, i) in sessionLog" :key="i" class="log-line">{{ line }}</div>
              <div v-if="!sessionLog.length" class="sftp-bottom-empty">No session log entries</div>
            </div>
          </template>
        </div>
      </div>

      <!-- Context Menu -->
      <Teleport to="body">
        <div v-if="contextMenu.visible" class="sftp-context-backdrop"
          @click="contextMenu.visible = false" @contextmenu.prevent="contextMenu.visible = false" />
        <ul v-if="contextMenu.visible" class="sftp-context-menu"
          :style="{ left: contextMenu.x + 'px', top: contextMenu.y + 'px' }">
          <li v-for="item in contextMenu.items" :key="item.label"
            :class="{ sep: item.type === 'separator' }"
            @click="item.type !== 'separator' && runContextAction(item)">
            <template v-if="item.type !== 'separator'">{{ item.label }}</template>
          </li>
        </ul>
      </Teleport>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, reactive, watch, onMounted, nextTick } from 'vue'

const props = defineProps({
  sessions: { type: Array, default: () => [] },
})

const emit = defineEmits(['disconnect-session', 'new-session', 'open-in-editor', 'open-ssh-terminal'])

const protocols = ['SFTP', 'FTP', 'FTPS', 'SCP']
const activeProtocol = ref('SFTP')
const activeSessionId = ref('')
const homeDir = ref('')
const bottomTab = ref('transfers')
const contextMenu = ref({ visible: false, x: 0, y: 0, pane: 'local', items: [] })
const localPathEdit = ref(false)
const remotePathEdit = ref(false)
const localPathInput = ref(null)
const remotePathInput = ref(null)
const localPathDraft = ref('')
const remotePathDraft = ref('')

// Per-session state: keyed by connectionId
const sessionStates = reactive({})

function getOrInitState(connectionId) {
  if (!sessionStates[connectionId]) {
    sessionStates[connectionId] = {
      localPath: homeDir.value || '/',
      remotePath: '/',
      localEntries: [],
      remoteEntries: [],
      localLoading: false,
      remoteLoading: false,
      localError: '',
      remoteError: '',
      selectedLocal: '',
      selectedRemote: '',
      localHistory: [],
      remoteHistory: [],
      transfers: [],
      portForwards: [],
      sessionLog: [],
    }
  }
  return sessionStates[connectionId]
}

const activeSession = computed(() => props.sessions.find(s => s.connectionId === activeSessionId.value) || null)

// Aliases into the active session's state
const localPath = computed({ get: () => st.value?.localPath || '/', set: v => { if (st.value) st.value.localPath = v } })
const remotePath = computed({ get: () => st.value?.remotePath || '/', set: v => { if (st.value) st.value.remotePath = v } })
const localEntries = computed({ get: () => st.value?.localEntries || [], set: v => { if (st.value) st.value.localEntries = v } })
const remoteEntries = computed({ get: () => st.value?.remoteEntries || [], set: v => { if (st.value) st.value.remoteEntries = v } })
const localLoading = computed({ get: () => st.value?.localLoading || false, set: v => { if (st.value) st.value.localLoading = v } })
const remoteLoading = computed({ get: () => st.value?.remoteLoading || false, set: v => { if (st.value) st.value.remoteLoading = v } })
const localError = computed({ get: () => st.value?.localError || '', set: v => { if (st.value) st.value.localError = v } })
const remoteError = computed({ get: () => st.value?.remoteError || '', set: v => { if (st.value) st.value.remoteError = v } })
const selectedLocal = computed({ get: () => st.value?.selectedLocal || '', set: v => { if (st.value) st.value.selectedLocal = v } })
const selectedRemote = computed({ get: () => st.value?.selectedRemote || '', set: v => { if (st.value) st.value.selectedRemote = v } })
const transfers = computed(() => st.value?.transfers || [])
const portForwards = computed(() => st.value?.portForwards || [])
const sessionLog = computed(() => st.value?.sessionLog || [])

const st = computed(() => activeSessionId.value ? sessionStates[activeSessionId.value] || null : null)

const bookmarks = computed(() => {
  if (!activeSession.value) return []
  return [{ label: activeSession.value.remoteRoot || '/', path: activeSession.value.remoteRoot || '/' }]
})

const bottomTabs = computed(() => [
  { id: 'transfers', label: 'Transfer Queue', badge: transfers.value.length || null },
  { id: 'ports', label: 'Port Forwarding', badge: portForwards.value.length || null },
  { id: 'log', label: 'Session Log' },
])

onMounted(async () => {
  if (window.electronAPI?.getPlatformInfo) {
    const info = await window.electronAPI.getPlatformInfo()
    homeDir.value = info?.homeDir || '/'
  }
  if (props.sessions.length) {
    switchSession(props.sessions[0].connectionId)
  }
})

// Auto-select first session when sessions change
watch(() => props.sessions, (newSessions) => {
  if (!newSessions.length) {
    activeSessionId.value = ''
    return
  }
  // If active session was removed, switch to first
  if (!newSessions.find(s => s.connectionId === activeSessionId.value)) {
    switchSession(newSessions[0].connectionId)
    return
  }
  // If a new session was added, switch to it
  const newOne = newSessions.find(s => !sessionStates[s.connectionId])
  if (newOne) switchSession(newOne.connectionId)
}, { deep: true })

function switchSession(connectionId) {
  if (activeSessionId.value === connectionId) return
  activeSessionId.value = connectionId
  const state = getOrInitState(connectionId)
  // Load data if not yet loaded
  if (!state.localEntries.length && !state.localLoading) {
    navigateLocal(homeDir.value || '/')
  }
  const session = props.sessions.find(s => s.connectionId === connectionId)
  if (session && !state.remoteEntries.length && !state.remoteLoading) {
    navigateRemote(session.remoteRoot || '/')
    loadPortForwards()
  }
}

async function navigateLocal(path) {
  if (!path || !activeSessionId.value) return
  const state = getOrInitState(activeSessionId.value)
  const prevPath = state.localPath
  if (prevPath !== path) state.localHistory.push(prevPath)
  state.localPath = path
  state.localLoading = true
  state.localError = ''
  try {
    const entries = await window.electronAPI?.readDir(path)
    if (Array.isArray(entries)) {
      state.localEntries = entries
    } else {
      state.localEntries = []
      state.localError = entries?.error || `Cannot read directory: ${path}`
      state.localPath = prevPath
      if (state.localHistory.length) state.localHistory.pop()
    }
  } catch (e) {
    state.localEntries = []
    state.localError = e?.message || `Cannot read directory: ${path}`
    state.localPath = prevPath
    if (state.localHistory.length) state.localHistory.pop()
  }
  state.localLoading = false
}

async function navigateRemote(path) {
  if (!path || !activeSession.value) return
  const state = getOrInitState(activeSessionId.value)
  const prevPath = state.remotePath
  if (prevPath !== path) state.remoteHistory.push(prevPath)
  state.remotePath = path
  state.remoteLoading = true
  state.remoteError = ''
  try {
    const entries = await window.electronAPI?.remoteReadDir(activeSession.value.connectionId, path)
    if (Array.isArray(entries)) {
      state.remoteEntries = entries
    } else {
      state.remoteEntries = []
      state.remoteError = entries?.error || `Cannot read directory: ${path}`
      state.remotePath = prevPath
      if (state.remoteHistory.length) state.remoteHistory.pop()
    }
  } catch (e) {
    state.remoteEntries = []
    state.remoteError = e?.message || `Cannot read directory: ${path}`
    state.remotePath = prevPath
    if (state.remoteHistory.length) state.remoteHistory.pop()
  }
  state.remoteLoading = false
}

function localGoBack() {
  const state = sessionStates[activeSessionId.value]
  if (!state) return
  const prev = state.localHistory.pop()
  if (prev) navigateLocal(prev)
}

function localGoUp() {
  const parts = (localPath.value || '/').split('/').filter(Boolean)
  parts.pop()
  navigateLocal('/' + parts.join('/') || '/')
}

function remoteGoBack() {
  const state = sessionStates[activeSessionId.value]
  if (!state) return
  const prev = state.remoteHistory.pop()
  if (prev) navigateRemote(prev)
}

function remoteGoUp() {
  const parts = (remotePath.value || '/').split('/').filter(Boolean)
  parts.pop()
  navigateRemote('/' + parts.join('/') || '/')
}

function refreshBoth() {
  navigateLocal(localPath.value)
  if (activeSession.value) navigateRemote(remotePath.value)
}

function startLocalPathEdit() {
  localPathDraft.value = localPath.value
  localPathEdit.value = true
  nextTick(() => { localPathInput.value?.select() })
}

function commitLocalPath() {
  localPathEdit.value = false
  const p = localPathDraft.value.trim()
  if (p && p !== localPath.value) navigateLocal(p)
}

function startRemotePathEdit() {
  remotePathDraft.value = remotePath.value
  remotePathEdit.value = true
  nextTick(() => { remotePathInput.value?.select() })
}

function commitRemotePath() {
  remotePathEdit.value = false
  const p = remotePathDraft.value.trim()
  if (p && p !== remotePath.value) navigateRemote(p)
}

async function loadPortForwards() {
  if (!activeSession.value || !window.electronAPI?.remoteListPortForwards) return
  const state = getOrInitState(activeSessionId.value)
  const result = await window.electronAPI.remoteListPortForwards(activeSession.value.connectionId)
  if (Array.isArray(result)) state.portForwards = result
}

async function addPortForward() {
  if (!activeSession.value) return
  const local = prompt('Local port (e.g. 8080):')
  if (!local) return
  const remote = prompt('Remote host:port (e.g. localhost:3306):')
  if (!remote) return
  const [remoteHost, remotePort] = remote.split(':')
  if (!remoteHost || !remotePort) return
  const result = await window.electronAPI?.remoteStartPortForward?.(
    activeSession.value.connectionId,
    { localPort: Number(local), remoteHost, remotePort: Number(remotePort) }
  )
  if (!result?.error) {
    addLog(`Port forward: 127.0.0.1:${local} → ${remote}`)
    await loadPortForwards()
  }
}

async function stopPortForward(id) {
  if (!activeSession.value) return
  await window.electronAPI?.remoteStopPortForward?.(activeSession.value.connectionId, id)
  await loadPortForwards()
}

async function newFolder() {
  if (!activeSession.value) return
  const name = prompt('Folder name:')
  if (!name) return
  const path = remotePath.value.replace(/\/$/, '') + '/' + name
  await window.electronAPI?.remoteMkdir?.(activeSession.value.connectionId, path)
  navigateRemote(remotePath.value)
}

function onLocalContext(e) {
  showContext(e, 'local', [
    { label: 'Upload to Remote', action: 'upload' },
    { label: 'New Folder', action: 'new-folder-local' },
    { type: 'separator' },
    { label: 'Open in Editor', action: 'open-editor-local' },
    { label: 'Rename', action: 'rename-local' },
    { label: 'Delete', action: 'delete-local' },
  ])
}

function onRemoteContext(e) {
  showContext(e, 'remote', [
    { label: 'Download', action: 'download' },
    { label: 'Upload', action: 'upload' },
    { label: 'New File', action: 'new-file-remote' },
    { label: 'New Folder', action: 'new-folder-remote' },
    { type: 'separator' },
    { label: 'Open in Editor', action: 'open-editor-remote' },
    { label: 'Rename', action: 'rename-remote' },
    { label: 'Permissions', action: 'permissions' },
    { label: 'Delete', action: 'delete-remote' },
  ])
}

function showContext(e, pane, items) {
  contextMenu.value = { visible: true, x: e.clientX, y: e.clientY, pane, items }
}

function runContextAction(item) {
  contextMenu.value.visible = false
  addLog(`Action: ${item.label}`)
}

function addLog(line) {
  const state = sessionStates[activeSessionId.value]
  if (!state) return
  const ts = new Date().toLocaleTimeString()
  state.sessionLog.unshift(`[${ts}] ${line}`)
  if (state.sessionLog.length > 200) state.sessionLog.pop()
}

function formatSize(bytes) {
  if (!bytes) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  let i = 0, n = bytes
  while (n >= 1024 && i < units.length - 1) { n /= 1024; i++ }
  return n.toFixed(i ? 1 : 0) + ' ' + units[i]
}

function formatDate(ts) {
  if (!ts) return ''
  const d = new Date(ts * 1000 || ts)
  return d.toLocaleDateString()
}
</script>

<style scoped>
.sftp-screen {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: var(--npp-bg, #090b0f);
  color: var(--npp-text, #cdd6f4);
  min-width: 0;
}

/* ── Session tabs ───────────────────────────────── */
.sftp-sessions-bar {
  display: flex;
  align-items: stretch;
  background: var(--npp-activitybar, #0c0f17);
  border-bottom: 1px solid var(--npp-border, #1c2233);
  height: 34px;
  flex-shrink: 0;
  overflow-x: auto;
}

.sftp-session-tab {
  display: flex;
  align-items: center;
  padding: 0 10px;
  font-size: 12px;
  color: var(--npp-text-dim, #6b7a99);
  cursor: pointer;
  border-right: 1px solid var(--npp-border, #1c2233);
  border-bottom: 2px solid transparent;
  white-space: nowrap;
  gap: 4px;
  transition: color 0.1s;
}
.sftp-session-tab:hover { color: var(--npp-text, #cdd6f4); background: rgba(255,255,255,0.04); }
.sftp-session-tab.active {
  color: var(--npp-accent, #29d4f0);
  border-bottom-color: var(--npp-accent, #29d4f0);
  background: rgba(41,212,240,0.06);
}

.sftp-tab-label { max-width: 120px; overflow: hidden; text-overflow: ellipsis; }

.sftp-tab-close {
  background: transparent; border: none; padding: 2px 4px;
  color: var(--npp-text-dim, #6b7a99); cursor: pointer; border-radius: 3px;
  font-size: 10px; opacity: 0; transition: opacity 0.1s;
  display: flex; align-items: center;
}
.sftp-session-tab:hover .sftp-tab-close { opacity: 1; }
.sftp-tab-close:hover { color: #f87171; background: rgba(248,113,113,0.12); }

.sftp-session-add {
  background: transparent; border: none; padding: 0 12px;
  color: var(--npp-text-dim, #6b7a99); cursor: pointer; font-size: 13px;
  height: 100%; display: flex; align-items: center;
}
.sftp-session-add:hover { color: var(--npp-accent, #29d4f0); background: rgba(255,255,255,0.04); }

/* ── No sessions ──────────────────────────────── */
.sftp-empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  color: var(--npp-text-dim, #6b7a99);
  font-size: 14px;
}

.sftp-connect-btn {
  background: var(--npp-accent, #29d4f0);
  color: #090b0f;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  padding: 8px 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 7px;
}
.sftp-connect-btn:hover { filter: brightness(1.1); }

/* ── Top bar ──────────────────────────────────── */
.sftp-topbar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 16px;
  height: 38px;
  background: var(--npp-activitybar, #0c0f17);
  border-bottom: 1px solid var(--npp-border, #1c2233);
  flex-shrink: 0;
}

.protocol-tabs { display: flex; }
.protocol-tab {
  background: transparent; border: none;
  color: var(--npp-text-dim, #6b7a99);
  font-size: 12px; font-weight: 600;
  padding: 0 12px; height: 38px; cursor: pointer;
  border-bottom: 2px solid transparent;
}
.protocol-tab.active { color: var(--npp-accent, #29d4f0); border-bottom-color: var(--npp-accent, #29d4f0); }

.sftp-connection-info { flex: 1; font-size: 12px; }
.sftp-connected-chip { display: flex; align-items: center; gap: 6px; color: #4ade80; }
.sftp-dot { width: 7px; height: 7px; border-radius: 50%; background: #4ade80; box-shadow: 0 0 6px #4ade80; }

.sftp-toolbar { display: flex; gap: 4px; }
.sftp-toolbar-btn {
  background: transparent; border: none; color: var(--npp-text-dim, #6b7a99);
  font-size: 13px; width: 28px; height: 28px; border-radius: 4px; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
}
.sftp-toolbar-btn:hover { background: rgba(255,255,255,0.07); color: var(--npp-text, #cdd6f4); }
.sftp-toolbar-btn-ssh { color: var(--npp-accent, #29d4f0); }
.sftp-toolbar-btn-ssh:hover { background: rgba(41,212,240,0.1); color: var(--npp-accent, #29d4f0); }
.sftp-toolbar-btn-danger:hover { background: rgba(248,113,113,0.1); color: #f87171; }

/* ── Main panes ───────────────────────────────── */
.sftp-main {
  flex: 1;
  display: flex;
  overflow: hidden;
  min-height: 0;
}

.sftp-bookmarks {
  width: 158px;
  flex-shrink: 0;
  background: var(--npp-sidebar-bg, #111520);
  border-right: 1px solid var(--npp-border, #1c2233);
  overflow-y: auto;
  padding: 8px 0;
}

.sftp-section-label {
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: var(--npp-text-dim, #6b7a99);
  padding: 8px 10px 4px;
  text-transform: uppercase;
}

.sftp-bookmark-item {
  padding: 5px 10px;
  font-size: 12px;
  color: var(--npp-text-dim, #6b7a99);
  cursor: pointer;
  border-radius: 4px;
  margin: 0 4px;
  display: flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.sftp-bookmark-item:hover { background: rgba(255,255,255,0.06); color: var(--npp-text, #cdd6f4); }
.sftp-bookmark-item.active { color: var(--npp-accent, #29d4f0); background: rgba(41,212,240,0.07); }

.sftp-bookmark-empty { padding: 4px 10px; font-size: 11px; color: var(--npp-text-dim, #6b7a99); opacity: 0.6; }

.sftp-new-session-btn {
  background: transparent; border: 1px dashed var(--npp-border, #1c2233);
  border-radius: 4px; color: var(--npp-text-dim, #6b7a99); cursor: pointer;
  font-size: 11px; margin: 6px 8px 0; padding: 5px 8px;
  display: flex; align-items: center; gap: 5px; width: calc(100% - 16px);
}
.sftp-new-session-btn:hover { color: var(--npp-accent, #29d4f0); border-color: var(--npp-accent, #29d4f0); }

.sftp-panes {
  flex: 1;
  display: flex;
  overflow: hidden;
  min-width: 0;
}

.sftp-pane {
  flex: 1;
  display: flex;
  flex-direction: column;
  border-right: 1px solid var(--npp-border, #1c2233);
  overflow: hidden;
  min-width: 0;
}
.sftp-pane:last-child { border-right: none; }

.sftp-pane-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 8px;
  height: 34px;
  background: rgba(255,255,255,0.025);
  border-bottom: 1px solid var(--npp-border, #1c2233);
  flex-shrink: 0;
}

.sftp-pane-label {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: var(--npp-text-dim, #6b7a99);
  flex-shrink: 0;
}

.sftp-path-bar { display: flex; align-items: center; gap: 4px; flex: 1; min-width: 0; }
.sftp-nav-btn {
  background: transparent; border: none; color: var(--npp-text-dim, #6b7a99);
  font-size: 11px; width: 22px; height: 22px; border-radius: 3px; cursor: pointer;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.sftp-nav-btn:hover { background: rgba(255,255,255,0.07); color: var(--npp-text, #cdd6f4); }

.sftp-path-text {
  font-size: 11px;
  color: var(--npp-text, #cdd6f4);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
  cursor: text;
  border-radius: 3px;
  padding: 1px 3px;
}
.sftp-path-text:hover { background: rgba(255,255,255,0.06); }

.sftp-path-input {
  flex: 1;
  background: rgba(255,255,255,0.08);
  border: 1px solid var(--npp-accent, #29d4f0);
  border-radius: 3px;
  color: var(--npp-text, #cdd6f4);
  font-size: 11px;
  padding: 1px 5px;
  outline: none;
  font-family: monospace;
  min-width: 0;
}

.sftp-pane-error {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 5px 8px;
  background: rgba(248,113,113,0.1);
  color: #f87171;
  font-size: 11px;
  flex-shrink: 0;
  border-top: 1px solid rgba(248,113,113,0.2);
}
.sftp-error-dismiss {
  margin-left: auto; background: transparent; border: none;
  color: #f87171; cursor: pointer; font-size: 11px; padding: 0 2px;
}

.sftp-col-headers {
  display: flex;
  align-items: center;
  padding: 0 8px;
  height: 24px;
  background: rgba(255,255,255,0.03);
  border-bottom: 1px solid var(--npp-border, #1c2233);
  flex-shrink: 0;
  font-size: 10px;
  font-weight: 600;
  color: var(--npp-text-dim, #6b7a99);
}
.col-name { flex: 1; }
.col-size { width: 64px; text-align: right; }
.col-date, .col-perms { width: 80px; text-align: right; }

.sftp-file-list {
  flex: 1;
  overflow-y: auto;
  padding: 2px 0;
}

.sftp-file-row {
  display: flex;
  align-items: center;
  padding: 0 8px;
  height: 24px;
  cursor: pointer;
  font-size: 12px;
  border-radius: 3px;
  margin: 0 2px;
}
.sftp-file-row:hover { background: rgba(255,255,255,0.05); }
.sftp-file-row.selected { background: rgba(41,212,240,0.1); }
.sftp-file-row.directory { color: var(--npp-accent, #29d4f0); }

.file-row-name { flex: 1; display: flex; align-items: center; gap: 6px; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
.file-row-icon { font-size: 11px; flex-shrink: 0; }
.file-row-size { width: 64px; text-align: right; color: var(--npp-text-dim, #6b7a99); }
.file-row-date, .file-row-perms { width: 80px; text-align: right; color: var(--npp-text-dim, #6b7a99); }

.sftp-pane-loading, .sftp-pane-empty {
  padding: 20px;
  font-size: 12px;
  color: var(--npp-text-dim, #6b7a99);
  display: flex;
  align-items: center;
  gap: 8px;
}

.sftp-pane-status {
  height: 22px;
  padding: 0 8px;
  font-size: 10px;
  color: var(--npp-text-dim, #6b7a99);
  display: flex;
  align-items: center;
  border-top: 1px solid var(--npp-border, #1c2233);
  background: rgba(255,255,255,0.02);
  flex-shrink: 0;
}

/* ── Bottom panel ─────────────────────────────── */
.sftp-bottom {
  height: 178px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  border-top: 1px solid var(--npp-border, #1c2233);
  background: var(--npp-activitybar, #0c0f17);
}

.sftp-bottom-tabs {
  display: flex;
  border-bottom: 1px solid var(--npp-border, #1c2233);
  flex-shrink: 0;
}

.sftp-bottom-tab {
  background: transparent; border: none; border-bottom: 2px solid transparent;
  color: var(--npp-text-dim, #6b7a99); font-size: 11px; font-weight: 600;
  padding: 0 14px; height: 30px; cursor: pointer; display: flex; align-items: center; gap: 6px;
}
.sftp-bottom-tab.active { color: var(--npp-accent, #29d4f0); border-bottom-color: var(--npp-accent, #29d4f0); }

.sftp-tab-badge {
  background: var(--npp-accent, #29d4f0); color: #090b0f;
  font-size: 9px; font-weight: 700; padding: 1px 4px; border-radius: 6px;
}

.sftp-bottom-content { flex: 1; overflow-y: auto; padding: 6px; }
.sftp-bottom-empty { font-size: 11px; color: var(--npp-text-dim, #6b7a99); padding: 8px; }

.port-forwarding-toolbar { margin-bottom: 6px; }
.sftp-action-btn {
  background: rgba(255,255,255,0.07); border: 1px solid var(--npp-border, #1c2233);
  border-radius: 4px; color: var(--npp-text, #cdd6f4); font-size: 11px;
  padding: 4px 10px; cursor: pointer; display: flex; align-items: center; gap: 5px;
}
.sftp-action-btn:hover { background: rgba(255,255,255,0.12); }

.port-row {
  display: flex; align-items: center; gap: 8px; padding: 4px 4px;
  font-size: 11px; border-radius: 3px;
}
.port-row:hover { background: rgba(255,255,255,0.04); }
.port-local, .port-remote { color: var(--npp-accent, #29d4f0); font-family: monospace; }
.port-arrow { color: var(--npp-text-dim, #6b7a99); }
.port-label { flex: 1; color: var(--npp-text-dim, #6b7a99); }
.port-stop-btn {
  background: transparent; border: none; color: var(--npp-text-dim, #6b7a99);
  cursor: pointer; padding: 2px 6px; border-radius: 3px; font-size: 11px;
}
.port-stop-btn:hover { color: #f87171; background: rgba(248,113,113,0.1); }

.transfer-row {
  display: flex; align-items: center; gap: 8px; padding: 4px;
  font-size: 11px;
}
.transfer-name { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.transfer-progress-bar { width: 80px; height: 4px; background: rgba(255,255,255,0.1); border-radius: 2px; }
.transfer-progress-fill { height: 100%; background: var(--npp-accent, #29d4f0); border-radius: 2px; }
.transfer-percent { width: 32px; text-align: right; color: var(--npp-text-dim, #6b7a99); }

.session-log { font-family: monospace; font-size: 11px; }
.log-line { padding: 2px 4px; color: var(--npp-text-dim, #6b7a99); }
.log-line:hover { background: rgba(255,255,255,0.04); }

/* ── Context menu ─────────────────────────────── */
.sftp-context-backdrop {
  position: fixed; inset: 0; z-index: 9998;
}
.sftp-context-menu {
  position: fixed; z-index: 9999;
  background: var(--npp-sidebar-bg, #111520);
  border: 1px solid var(--npp-border, #1c2233);
  border-radius: 6px;
  padding: 4px 0;
  min-width: 160px;
  list-style: none;
  margin: 0;
  box-shadow: 0 8px 24px rgba(0,0,0,0.5);
}
.sftp-context-menu li {
  padding: 6px 14px;
  font-size: 12px;
  cursor: pointer;
  color: var(--npp-text, #cdd6f4);
}
.sftp-context-menu li:hover { background: rgba(255,255,255,0.07); }
.sftp-context-menu li.sep {
  height: 1px;
  background: var(--npp-border, #1c2233);
  padding: 0;
  margin: 4px 0;
  cursor: default;
}
</style>
