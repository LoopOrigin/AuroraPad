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
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>
      <button type="button" class="sftp-session-add" title="New SSH connection" @click="$emit('new-session')">
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
          <button type="button" class="sftp-toolbar-btn" title="New folder on remote" @click="doNewFolder('remote')">
            <i class="fa-solid fa-folder-plus"></i>
          </button>
          <button
            v-if="activeSession.protocol === 'sftp'"
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
          <div class="sftp-bookmark-item" @click="navigateLocal('/')">
            <i class="fa-solid fa-hard-drive" style="font-size:10px"></i> /
          </div>
          <div v-if="homeDir" class="sftp-bookmark-item" @click="navigateLocal(homeDir)">
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
          <button type="button" class="sftp-new-session-btn" @click="$emit('new-session')">
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
                <button type="button" class="sftp-nav-btn" title="Go back" @click="localGoBack"><i class="fa-solid fa-arrow-left"></i></button>
                <button type="button" class="sftp-nav-btn" title="Go up" @click="localGoUp"><i class="fa-solid fa-arrow-up"></i></button>
                <input v-if="localPathEdit" ref="localPathInput" v-model="localPathDraft" class="sftp-path-input"
                  @keydown.enter="commitLocalPath" @keydown.escape="localPathEdit = false" @blur="commitLocalPath" />
                <span v-else class="sftp-path-text" :title="localPath" @click="startLocalPathEdit">{{ localPath }}</span>
              </div>
            </div>
            <div class="sftp-col-headers">
              <span class="col-name">Name</span>
              <span class="col-size">Size</span>
              <span class="col-date">Modified</span>
            </div>
            <div class="sftp-file-list" @contextmenu.prevent="onLocalContextBlank">
              <div
                v-for="entry in localEntries"
                :key="entry.name"
                class="sftp-file-row"
                :class="{ selected: selectedLocal === entry.name, directory: entry.isDirectory }"
                :title="entry.name"
                @click="selectedLocal = entry.name"
                @dblclick="entry.isDirectory ? navigateLocal(entry.path) : emitOpenEditor(entry.path, 'local')"
                @contextmenu.prevent.stop="onLocalContext($event, entry)"
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
              <template v-if="localLoading"><i class="fa-solid fa-circle-notch fa-spin" style="font-size:10px;margin-right:5px"></i> Loading…</template>
              <template v-else>{{ localEntries.length }} items<span v-if="selectedLocal"> · {{ selectedLocal }}</span></template>
            </div>
          </div>

          <!-- Remote Pane -->
          <div class="sftp-pane">
            <div class="sftp-pane-header">
              <span class="sftp-pane-label">REMOTE</span>
              <div class="sftp-path-bar">
                <button type="button" class="sftp-nav-btn" title="Go back" @click="remoteGoBack"><i class="fa-solid fa-arrow-left"></i></button>
                <button type="button" class="sftp-nav-btn" title="Go up" @click="remoteGoUp"><i class="fa-solid fa-arrow-up"></i></button>
                <input v-if="remotePathEdit" ref="remotePathInput" v-model="remotePathDraft" class="sftp-path-input"
                  @keydown.enter="commitRemotePath" @keydown.escape="remotePathEdit = false" @blur="commitRemotePath" />
                <span v-else class="sftp-path-text" :title="remotePath" @click="startRemotePathEdit">{{ remotePath }}</span>
              </div>
            </div>
            <div class="sftp-col-headers">
              <span class="col-name">Name</span>
              <span class="col-size">Size</span>
              <span class="col-perms">Perms</span>
            </div>
            <div class="sftp-file-list" @contextmenu.prevent="onRemoteContextBlank">
              <div
                v-for="entry in remoteEntries"
                :key="entry.name"
                class="sftp-file-row"
                :class="{ selected: selectedRemote === entry.name, directory: entry.isDirectory }"
                :title="entry.name"
                @click="selectedRemote = entry.name"
                @dblclick="entry.isDirectory ? navigateRemote(entry.path) : emitOpenEditor(entry.path, 'remote')"
                @contextmenu.prevent.stop="onRemoteContext($event, entry)"
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
              <template v-if="remoteLoading"><i class="fa-solid fa-circle-notch fa-spin" style="font-size:10px;margin-right:5px"></i> Loading…</template>
              <template v-else>{{ remoteEntries.length }} items<span v-if="selectedRemote"> · {{ selectedRemote }}</span></template>
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom Panel (Log / Transfers / Port Forwarding) -->
      <div class="sftp-bottom">
        <div class="sftp-bottom-tabs">
          <button v-for="tab in bottomTabs" :key="tab.id" type="button"
            class="sftp-bottom-tab" :class="{ active: bottomTab === tab.id }"
            @click="bottomTab = tab.id">
            {{ tab.label }}
            <span v-if="tab.badge" class="sftp-tab-badge">{{ tab.badge }}</span>
          </button>
          <button type="button" class="sftp-log-clear" title="Clear log" @click="clearLog">
            <i class="fa-solid fa-eraser"></i>
          </button>
        </div>
        <div class="sftp-bottom-content">
          <template v-if="bottomTab === 'log'">
            <div class="activity-log">
              <div v-for="(entry, i) in sessionLog" :key="i" class="log-entry" :class="`log-${entry.type}`">
                <span class="log-ts">{{ entry.ts }}</span>
                <span class="log-icon">
                  <i v-if="entry.type === 'success'" class="fa-solid fa-check"></i>
                  <i v-else-if="entry.type === 'error'" class="fa-solid fa-xmark"></i>
                  <i v-else-if="entry.type === 'transfer'" class="fa-solid fa-arrows-left-right"></i>
                  <i v-else class="fa-solid fa-circle-info"></i>
                </span>
                <span class="log-msg">{{ entry.msg }}</span>
              </div>
              <div v-if="!sessionLog.length" class="sftp-bottom-empty">No activity yet</div>
            </div>
          </template>
          <template v-else-if="bottomTab === 'transfers'">
            <div v-if="!transfers.length" class="sftp-bottom-empty">No active transfers</div>
            <div v-for="t in transfers" :key="t.id" class="transfer-row">
              <span class="transfer-name">{{ t.name }}</span>
              <div class="transfer-progress-bar"><div class="transfer-progress-fill" :style="{ width: t.progress + '%' }"></div></div>
              <span class="transfer-percent">{{ t.progress }}%</span>
            </div>
          </template>
          <template v-else-if="bottomTab === 'ports'">
            <div class="port-forwarding-toolbar">
              <button type="button" class="sftp-action-btn" @click="addPortForward">
                <i class="fa-solid fa-plus"></i> Add Tunnel
              </button>
            </div>
            <div v-if="!portForwards.length" class="sftp-bottom-empty">No active tunnels</div>
            <div v-for="pf in portForwards" :key="pf.id" class="port-row">
              <span class="port-local">127.0.0.1:{{ pf.localPort }}</span>
              <span class="port-arrow">→</span>
              <span class="port-remote">{{ pf.remoteHost }}:{{ pf.remotePort }}</span>
              <span class="port-label">{{ pf.label || 'tunnel' }}</span>
              <button type="button" class="port-stop-btn" @click="stopPortForward(pf.id)">
                <i class="fa-solid fa-trash-can"></i>
              </button>
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
          <template v-for="item in contextMenu.items" :key="item.label || item.type">
            <li v-if="item.type === 'separator'" class="sep"></li>
            <li v-else @click="runContextAction(item)">
              <i v-if="item.icon" :class="item.icon" class="ctx-icon"></i>{{ item.label }}
            </li>
          </template>
        </ul>
      </Teleport>

      <!-- Inline Prompt Dialog -->
      <Teleport to="body">
        <div v-if="promptDialog.visible" class="sftp-prompt-backdrop">
          <div class="sftp-prompt-box">
            <div class="sftp-prompt-title">{{ promptDialog.title }}</div>
            <label class="sftp-prompt-label">{{ promptDialog.label }}</label>
            <input
              ref="promptInput"
              v-model="promptDialog.value"
              type="text"
              class="sftp-prompt-input"
              :placeholder="promptDialog.placeholder"
              @keydown.enter="confirmPrompt"
              @keydown.escape="cancelPrompt"
            />
            <div class="sftp-prompt-actions">
              <button type="button" class="sftp-prompt-cancel" @click="cancelPrompt">Cancel</button>
              <button type="button" class="sftp-prompt-ok" @click="confirmPrompt">OK</button>
            </div>
          </div>
        </div>
      </Teleport>

      <!-- Confirm Dialog -->
      <Teleport to="body">
        <div v-if="confirmDialog.visible" class="sftp-prompt-backdrop">
          <div class="sftp-prompt-box">
            <div class="sftp-prompt-title">{{ confirmDialog.title }}</div>
            <p class="sftp-confirm-msg">{{ confirmDialog.message }}</p>
            <div class="sftp-prompt-actions">
              <button type="button" class="sftp-prompt-cancel" @click="cancelConfirm">Cancel</button>
              <button type="button" class="sftp-prompt-ok sftp-prompt-danger" @click="okConfirm">Delete</button>
            </div>
          </div>
        </div>
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
const bottomTab = ref('log')
const localPathEdit = ref(false)
const remotePathEdit = ref(false)
const localPathInput = ref(null)
const remotePathInput = ref(null)
const localPathDraft = ref('')
const remotePathDraft = ref('')
const promptInput = ref(null)

const contextMenu = ref({ visible: false, x: 0, y: 0, pane: 'local', entry: null, items: [] })

const promptDialog = reactive({
  visible: false, title: '', label: '', value: '', placeholder: '', resolve: null,
})
const confirmDialog = reactive({
  visible: false, title: '', message: '', resolve: null,
})

// Per-session state keyed by connectionId
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
const st = computed(() => activeSessionId.value ? sessionStates[activeSessionId.value] || null : null)

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

const bookmarks = computed(() => {
  if (!activeSession.value) return []
  return [{ label: activeSession.value.remoteRoot || '/', path: activeSession.value.remoteRoot || '/' }]
})

const bottomTabs = computed(() => [
  { id: 'log', label: 'Log', badge: null },
  { id: 'transfers', label: 'Transfers', badge: transfers.value.filter(t => t.progress < 100).length || null },
  { id: 'ports', label: 'Port Fwd', badge: portForwards.value.length || null },
])

onMounted(async () => {
  if (window.electronAPI?.getPlatformInfo) {
    const info = await window.electronAPI.getPlatformInfo()
    homeDir.value = info?.homeDir || '/'
  }
  if (props.sessions.length) switchSession(props.sessions[0].connectionId)
})

watch(() => props.sessions, (newSessions) => {
  if (!newSessions.length) { activeSessionId.value = ''; return }
  if (!newSessions.find(s => s.connectionId === activeSessionId.value)) {
    switchSession(newSessions[0].connectionId); return
  }
  const newOne = newSessions.find(s => !sessionStates[s.connectionId])
  if (newOne) switchSession(newOne.connectionId)
}, { deep: true })

function switchSession(connectionId) {
  if (activeSessionId.value === connectionId) return
  activeSessionId.value = connectionId
  const state = getOrInitState(connectionId)
  if (!state.localEntries.length && !state.localLoading) navigateLocal(homeDir.value || '/')
  const session = props.sessions.find(s => s.connectionId === connectionId)
  if (session && !state.remoteEntries.length && !state.remoteLoading) {
    navigateRemote(session.remoteRoot || '/')
    loadPortForwards()
  }
}

// ── Navigation ──────────────────────────────────────────

async function navigateLocal(path) {
  if (!path || !activeSessionId.value) return
  const state = getOrInitState(activeSessionId.value)
  const prev = state.localPath
  if (prev !== path) state.localHistory.push(prev)
  state.localPath = path
  state.localLoading = true
  state.localError = ''
  try {
    const entries = await window.electronAPI?.readDir(path)
    if (Array.isArray(entries)) {
      state.localEntries = entries
    } else {
      state.localEntries = []
      state.localError = entries?.error || `Cannot read: ${path}`
      state.localPath = prev
      if (state.localHistory.length) state.localHistory.pop()
    }
  } catch (e) {
    state.localEntries = []
    state.localError = e?.message || `Cannot read: ${path}`
    state.localPath = prev
    if (state.localHistory.length) state.localHistory.pop()
  }
  state.localLoading = false
}

async function navigateRemote(path) {
  if (!path || !activeSession.value) return
  const state = getOrInitState(activeSessionId.value)
  const prev = state.remotePath
  if (prev !== path) state.remoteHistory.push(prev)
  state.remotePath = path
  state.remoteLoading = true
  state.remoteError = ''
  try {
    const entries = await window.electronAPI?.remoteReadDir(activeSession.value.connectionId, path)
    if (Array.isArray(entries)) {
      state.remoteEntries = entries
    } else {
      state.remoteEntries = []
      state.remoteError = entries?.error || `Cannot read: ${path}`
      state.remotePath = prev
      if (state.remoteHistory.length) state.remoteHistory.pop()
    }
  } catch (e) {
    state.remoteEntries = []
    state.remoteError = e?.message || `Cannot read: ${path}`
    state.remotePath = prev
    if (state.remoteHistory.length) state.remoteHistory.pop()
  }
  state.remoteLoading = false
}

function localGoBack() {
  const state = sessionStates[activeSessionId.value]
  const prev = state?.localHistory.pop()
  if (prev) navigateLocal(prev)
}
function localGoUp() {
  const parts = (localPath.value || '/').split('/').filter(Boolean)
  parts.pop()
  navigateLocal('/' + parts.join('/') || '/')
}
function remoteGoBack() {
  const state = sessionStates[activeSessionId.value]
  const prev = state?.remoteHistory.pop()
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
  nextTick(() => localPathInput.value?.select())
}
function commitLocalPath() {
  localPathEdit.value = false
  const p = localPathDraft.value.trim()
  if (p && p !== localPath.value) navigateLocal(p)
}
function startRemotePathEdit() {
  remotePathDraft.value = remotePath.value
  remotePathEdit.value = true
  nextTick(() => remotePathInput.value?.select())
}
function commitRemotePath() {
  remotePathEdit.value = false
  const p = remotePathDraft.value.trim()
  if (p && p !== remotePath.value) navigateRemote(p)
}

// ── Inline dialogs ──────────────────────────────────────

function openPrompt(title, label, defaultValue = '', placeholder = '') {
  return new Promise((resolve) => {
    promptDialog.visible = true
    promptDialog.title = title
    promptDialog.label = label
    promptDialog.value = defaultValue
    promptDialog.placeholder = placeholder
    promptDialog.resolve = resolve
    nextTick(() => promptInput.value?.focus())
  })
}
function confirmPrompt() {
  const v = promptDialog.value
  promptDialog.visible = false
  promptDialog.resolve?.(v || null)
  promptDialog.resolve = null
}
function cancelPrompt() {
  promptDialog.visible = false
  promptDialog.resolve?.(null)
  promptDialog.resolve = null
}

function openConfirm(title, message) {
  return new Promise((resolve) => {
    confirmDialog.visible = true
    confirmDialog.title = title
    confirmDialog.message = message
    confirmDialog.resolve = resolve
  })
}
function okConfirm() {
  confirmDialog.visible = false
  confirmDialog.resolve?.(true)
  confirmDialog.resolve = null
}
function cancelConfirm() {
  confirmDialog.visible = false
  confirmDialog.resolve?.(false)
  confirmDialog.resolve = null
}

// ── Context menu ────────────────────────────────────────

function onLocalContext(e, entry) {
  const items = []
  if (entry) {
    if (!entry.isDirectory) {
      items.push({ label: 'Upload to Remote', icon: 'fa-solid fa-upload ctx-icon-accent', action: 'upload', entry })
      items.push({ label: 'Open in Editor', icon: 'fa-solid fa-pen-to-square', action: 'open-editor-local', entry })
    }
    items.push({ label: 'Rename', icon: 'fa-solid fa-pencil', action: 'rename-local', entry })
    items.push({ label: 'Delete', icon: 'fa-solid fa-trash-can ctx-icon-danger', action: 'delete-local', entry })
    items.push({ type: 'separator' })
  }
  items.push({ label: 'New Folder', icon: 'fa-solid fa-folder-plus', action: 'new-folder-local' })
  items.push({ label: 'New File', icon: 'fa-solid fa-file-circle-plus', action: 'new-file-local' })
  showContext(e, 'local', entry, items)
}

function onLocalContextBlank(e) {
  showContext(e, 'local', null, [
    { label: 'New Folder', icon: 'fa-solid fa-folder-plus', action: 'new-folder-local' },
    { label: 'New File', icon: 'fa-solid fa-file-circle-plus', action: 'new-file-local' },
    { type: 'separator' },
    { label: 'Refresh', icon: 'fa-solid fa-rotate', action: 'refresh-local' },
  ])
}

function onRemoteContext(e, entry) {
  const items = []
  if (entry) {
    if (!entry.isDirectory) {
      items.push({ label: 'Download to Local', icon: 'fa-solid fa-download ctx-icon-accent', action: 'download', entry })
      items.push({ label: 'Open in Editor', icon: 'fa-solid fa-pen-to-square', action: 'open-editor-remote', entry })
    }
    items.push({ label: 'Rename', icon: 'fa-solid fa-pencil', action: 'rename-remote', entry })
    if (!entry.isDirectory) {
      items.push({ label: 'Permissions', icon: 'fa-solid fa-lock', action: 'permissions', entry })
    }
    items.push({ label: 'Delete', icon: 'fa-solid fa-trash-can ctx-icon-danger', action: 'delete-remote', entry })
    items.push({ type: 'separator' })
  }
  items.push({ label: 'New Folder', icon: 'fa-solid fa-folder-plus', action: 'new-folder-remote' })
  items.push({ label: 'New File', icon: 'fa-solid fa-file-circle-plus', action: 'new-file-remote' })
  if (selectedLocal.value && !entry) {
    items.push({ type: 'separator' })
    items.push({ label: `Upload "${selectedLocal.value}"`, icon: 'fa-solid fa-upload ctx-icon-accent', action: 'upload-selected' })
  }
  showContext(e, 'remote', entry, items)
}

function onRemoteContextBlank(e) {
  const items = [
    { label: 'New Folder', icon: 'fa-solid fa-folder-plus', action: 'new-folder-remote' },
    { label: 'New File', icon: 'fa-solid fa-file-circle-plus', action: 'new-file-remote' },
    { type: 'separator' },
    { label: 'Refresh', icon: 'fa-solid fa-rotate', action: 'refresh-remote' },
  ]
  if (selectedLocal.value) {
    items.push({ type: 'separator' })
    items.push({ label: `Upload "${selectedLocal.value}"`, icon: 'fa-solid fa-upload ctx-icon-accent', action: 'upload-selected' })
  }
  showContext(e, 'remote', null, items)
}

function showContext(e, pane, entry, items) {
  const x = Math.min(e.clientX, window.innerWidth - 200)
  const y = Math.min(e.clientY, window.innerHeight - items.length * 30 - 20)
  contextMenu.value = { visible: true, x, y, pane, entry, items }
}

async function runContextAction(item) {
  contextMenu.value.visible = false
  const cid = activeSession.value?.connectionId
  const entry = item.entry || null

  switch (item.action) {

    // ── Upload local file → remote ──────────────────────
    case 'upload': {
      if (!entry || entry.isDirectory) { addLog('error', 'Select a file to upload'); return }
      const src = entry.path
      const dest = joinPath(remotePath.value, entry.name)
      addLog('transfer', `Uploading ${entry.name} → ${remotePath.value}`)
      const r = await window.electronAPI?.remoteUploadFile?.(cid, src, dest)
      if (r?.error) addLog('error', `Upload failed: ${r.error}`)
      else { addLog('success', `Uploaded ${entry.name} (${formatSize(r.size)})`); navigateRemote(remotePath.value) }
      break
    }

    // ── Upload currently selected local file ─────────────
    case 'upload-selected': {
      const name = selectedLocal.value
      if (!name) { addLog('error', 'No local file selected'); return }
      const srcEntry = localEntries.value.find(e => e.name === name)
      if (!srcEntry || srcEntry.isDirectory) { addLog('error', 'Select a file (not folder) to upload'); return }
      const dest = joinPath(remotePath.value, name)
      addLog('transfer', `Uploading ${name} → ${remotePath.value}`)
      const r = await window.electronAPI?.remoteUploadFile?.(cid, srcEntry.path, dest)
      if (r?.error) addLog('error', `Upload failed: ${r.error}`)
      else { addLog('success', `Uploaded ${name} (${formatSize(r.size)})`); navigateRemote(remotePath.value) }
      break
    }

    // ── Download remote file → local ────────────────────
    case 'download': {
      if (!entry || entry.isDirectory) { addLog('error', 'Select a file to download'); return }
      const src = entry.path
      const dest = joinPath(localPath.value, entry.name)
      addLog('transfer', `Downloading ${entry.name} → ${localPath.value}`)
      const r = await window.electronAPI?.remoteDownloadFile?.(cid, src, dest)
      if (r?.error) addLog('error', `Download failed: ${r.error}`)
      else { addLog('success', `Downloaded ${entry.name} (${formatSize(r.size)})`); navigateLocal(localPath.value) }
      break
    }

    // ── New folder (local) ──────────────────────────────
    case 'new-folder-local': {
      const name = await openPrompt('New Local Folder', 'Folder name:', '', 'my-folder')
      if (!name) return
      const path = joinPath(localPath.value, name)
      addLog('info', `Creating local folder: ${path}`)
      const r = await window.electronAPI?.fsMkdir?.(path)
      if (r?.error) addLog('error', `Failed: ${r.error}`)
      else { addLog('success', `Created folder: ${name}`); navigateLocal(localPath.value) }
      break
    }

    // ── New file (local) ────────────────────────────────
    case 'new-file-local': {
      const name = await openPrompt('New Local File', 'File name:', '', 'untitled.txt')
      if (!name) return
      const path = joinPath(localPath.value, name)
      addLog('info', `Creating local file: ${path}`)
      const r = await window.electronAPI?.writeFile?.(path, '')
      if (r?.error) addLog('error', `Failed: ${r.error}`)
      else { addLog('success', `Created file: ${name}`); navigateLocal(localPath.value) }
      break
    }

    // ── New folder (remote) ─────────────────────────────
    case 'new-folder-remote':
      await doNewFolder('remote')
      break

    // ── New file (remote) ───────────────────────────────
    case 'new-file-remote': {
      const name = await openPrompt('New Remote File', 'File name:', '', 'untitled.txt')
      if (!name) return
      const path = joinPath(remotePath.value, name)
      addLog('info', `Creating remote file: ${path}`)
      const r = await window.electronAPI?.remoteWriteFile?.(cid, path, '')
      if (r?.error) addLog('error', `Failed: ${r.error}`)
      else { addLog('success', `Created remote file: ${name}`); navigateRemote(remotePath.value) }
      break
    }

    // ── Rename (local) ──────────────────────────────────
    case 'rename-local': {
      if (!entry) return
      const newName = await openPrompt('Rename', 'New name:', entry.name, entry.name)
      if (!newName || newName === entry.name) return
      const from = entry.path
      const to = joinPath(localPath.value, newName)
      addLog('info', `Renaming ${entry.name} → ${newName}`)
      const r = await window.electronAPI?.renameFile?.(from, to)
      if (r?.error) addLog('error', `Rename failed: ${r.error}`)
      else { addLog('success', `Renamed to ${newName}`); navigateLocal(localPath.value) }
      break
    }

    // ── Rename (remote) ─────────────────────────────────
    case 'rename-remote': {
      if (!entry) return
      const newName = await openPrompt('Rename', 'New name:', entry.name, entry.name)
      if (!newName || newName === entry.name) return
      const from = entry.path
      const to = joinPath(remotePath.value, newName)
      addLog('info', `Renaming remote ${entry.name} → ${newName}`)
      const r = await window.electronAPI?.remoteMovePath?.(cid, from, to)
      if (r?.error) addLog('error', `Rename failed: ${r.error}`)
      else { addLog('success', `Renamed to ${newName}`); navigateRemote(remotePath.value) }
      break
    }

    // ── Delete (local) ──────────────────────────────────
    case 'delete-local': {
      if (!entry) return
      const ok = await openConfirm('Delete', `Delete "${entry.name}" from local? This cannot be undone.`)
      if (!ok) return
      addLog('info', `Deleting local: ${entry.name}`)
      const r = await window.electronAPI?.deleteFile?.(entry.path)
      if (r?.error) addLog('error', `Delete failed: ${r.error}`)
      else { addLog('success', `Deleted ${entry.name}`); navigateLocal(localPath.value) }
      break
    }

    // ── Delete (remote) ─────────────────────────────────
    case 'delete-remote': {
      if (!entry) return
      const ok = await openConfirm('Delete Remote', `Delete "${entry.name}" on server? This cannot be undone.`)
      if (!ok) return
      addLog('info', `Deleting remote: ${entry.name}`)
      const r = await window.electronAPI?.remoteDeleteFile?.(cid, entry.path)
      if (r?.error) addLog('error', `Delete failed: ${r.error}`)
      else { addLog('success', `Deleted ${entry.name}`); navigateRemote(remotePath.value) }
      break
    }

    // ── Permissions (chmod) ─────────────────────────────
    case 'permissions': {
      if (!entry) return
      const currentPerms = (entry.permissions || '644').replace(/[^0-9]/g, '').slice(-3)
      const mode = await openPrompt('Set Permissions', 'Octal mode (e.g. 755):', currentPerms, '755')
      if (!mode) return
      if (!/^[0-7]{3,4}$/.test(mode)) { addLog('error', 'Invalid mode. Use 3-4 octal digits (e.g. 755)'); return }
      addLog('info', `chmod ${mode} ${entry.name}`)
      const r = await window.electronAPI?.remoteChmod?.(cid, entry.path, mode)
      if (r?.error) addLog('error', `chmod failed: ${r.error}`)
      else { addLog('success', `Permissions set to ${mode} for ${entry.name}`); navigateRemote(remotePath.value) }
      break
    }

    // ── Open in Editor ──────────────────────────────────
    case 'open-editor-local':
      if (entry && !entry.isDirectory) emitOpenEditor(entry.path, 'local')
      break
    case 'open-editor-remote':
      if (entry && !entry.isDirectory) emitOpenEditor(entry.path, 'remote')
      break

    // ── Refresh ─────────────────────────────────────────
    case 'refresh-local': navigateLocal(localPath.value); break
    case 'refresh-remote': navigateRemote(remotePath.value); break
  }
}

function emitOpenEditor(path, pane) {
  if (pane === 'remote' && activeSession.value) {
    emit('open-in-editor', `remote://${activeSession.value.connectionId}${path}`)
  } else {
    emit('open-in-editor', path)
  }
}

async function doNewFolder(pane) {
  const name = await openPrompt(`New ${pane === 'remote' ? 'Remote' : 'Local'} Folder`, 'Folder name:', '', 'new-folder')
  if (!name) return
  if (pane === 'remote') {
    const path = joinPath(remotePath.value, name)
    addLog('info', `Creating remote folder: ${path}`)
    const r = await window.electronAPI?.remoteMkdir?.(activeSession.value?.connectionId, path)
    if (r?.error) addLog('error', `Failed: ${r.error}`)
    else { addLog('success', `Created folder: ${name}`); navigateRemote(remotePath.value) }
  } else {
    const path = joinPath(localPath.value, name)
    addLog('info', `Creating local folder: ${path}`)
    const r = await window.electronAPI?.fsMkdir?.(path)
    if (r?.error) addLog('error', `Failed: ${r.error}`)
    else { addLog('success', `Created folder: ${name}`); navigateLocal(localPath.value) }
  }
}

// ── Port forwarding ─────────────────────────────────────

async function loadPortForwards() {
  if (!activeSession.value || !window.electronAPI?.remoteListPortForwards) return
  const state = getOrInitState(activeSessionId.value)
  const result = await window.electronAPI.remoteListPortForwards(activeSession.value.connectionId)
  if (Array.isArray(result)) state.portForwards = result
}

async function addPortForward() {
  const local = await openPrompt('Add Port Tunnel', 'Local port (e.g. 8080):', '', '8080')
  if (!local) return
  const remote = await openPrompt('Add Port Tunnel', 'Remote host:port (e.g. localhost:3306):', '', 'localhost:3306')
  if (!remote) return
  const [remoteHost, remotePort] = remote.split(':')
  if (!remoteHost || !remotePort) { addLog('error', 'Invalid host:port format'); return }
  const r = await window.electronAPI?.remoteStartPortForward?.(
    activeSession.value.connectionId,
    { localPort: Number(local), remoteHost, remotePort: Number(remotePort) }
  )
  if (r?.error) addLog('error', `Port forward failed: ${r.error}`)
  else { addLog('success', `Tunnel: 127.0.0.1:${local} → ${remote}`); await loadPortForwards() }
}

async function stopPortForward(id) {
  if (!activeSession.value) return
  await window.electronAPI?.remoteStopPortForward?.(activeSession.value.connectionId, id)
  addLog('info', `Stopped tunnel ${id}`)
  await loadPortForwards()
}

// ── Activity log ────────────────────────────────────────

function addLog(type, msg) {
  const state = sessionStates[activeSessionId.value]
  if (!state) return
  const ts = new Date().toLocaleTimeString()
  state.sessionLog.unshift({ type, msg, ts })
  if (state.sessionLog.length > 300) state.sessionLog.pop()
  // Auto-show log tab for transfer/error
  if (type === 'transfer' || type === 'error') bottomTab.value = 'log'
}

function clearLog() {
  const state = sessionStates[activeSessionId.value]
  if (state) state.sessionLog = []
}

// ── Helpers ─────────────────────────────────────────────

function joinPath(dir, name) {
  return dir.replace(/\/$/, '') + '/' + name
}

function formatSize(bytes) {
  if (!bytes && bytes !== 0) return ''
  if (bytes === 0) return '0 B'
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

/* ── Session tabs ─────────────────────── */
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
}
.sftp-session-tab:hover { color: var(--npp-text, #cdd6f4); background: rgba(255,255,255,0.04); }
.sftp-session-tab.active { color: var(--npp-accent, #29d4f0); border-bottom-color: var(--npp-accent, #29d4f0); background: rgba(41,212,240,0.06); }
.sftp-tab-label { max-width: 120px; overflow: hidden; text-overflow: ellipsis; }
.sftp-tab-close {
  background: transparent; border: none; padding: 2px 4px;
  color: var(--npp-text-dim, #6b7a99); cursor: pointer; border-radius: 3px;
  font-size: 10px; opacity: 0; display: flex; align-items: center;
}
.sftp-session-tab:hover .sftp-tab-close { opacity: 1; }
.sftp-tab-close:hover { color: #f87171; background: rgba(248,113,113,0.12); }
.sftp-session-add {
  background: transparent; border: none; padding: 0 12px;
  color: var(--npp-text-dim, #6b7a99); cursor: pointer; font-size: 13px;
  height: 100%; display: flex; align-items: center;
}
.sftp-session-add:hover { color: var(--npp-accent, #29d4f0); }

/* ── Empty state ──────────────────────── */
.sftp-empty {
  flex: 1; display: flex; flex-direction: column; align-items: center;
  justify-content: center; gap: 16px; color: var(--npp-text-dim, #6b7a99); font-size: 14px;
}
.sftp-connect-btn {
  background: var(--npp-accent, #29d4f0); color: #090b0f;
  border: none; border-radius: 6px; font-size: 13px; font-weight: 600;
  padding: 8px 20px; cursor: pointer; display: flex; align-items: center; gap: 7px;
}
.sftp-connect-btn:hover { filter: brightness(1.1); }

/* ── Top bar ──────────────────────────── */
.sftp-topbar {
  display: flex; align-items: center; gap: 12px;
  padding: 0 16px; height: 38px;
  background: var(--npp-activitybar, #0c0f17);
  border-bottom: 1px solid var(--npp-border, #1c2233);
  flex-shrink: 0;
}
.protocol-tabs { display: flex; }
.protocol-tab {
  background: transparent; border: none;
  color: var(--npp-text-dim, #6b7a99); font-size: 12px; font-weight: 600;
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

/* ── Main layout ──────────────────────── */
.sftp-main { flex: 1; display: flex; overflow: hidden; min-height: 0; }
.sftp-bookmarks {
  width: 158px; flex-shrink: 0;
  background: var(--npp-sidebar-bg, #111520);
  border-right: 1px solid var(--npp-border, #1c2233);
  overflow-y: auto; padding: 8px 0;
}
.sftp-section-label {
  font-size: 9px; font-weight: 700; letter-spacing: 0.1em;
  color: var(--npp-text-dim, #6b7a99); padding: 8px 10px 4px; text-transform: uppercase;
}
.sftp-bookmark-item {
  padding: 5px 10px; font-size: 12px; color: var(--npp-text-dim, #6b7a99);
  cursor: pointer; border-radius: 4px; margin: 0 4px;
  display: flex; align-items: center; gap: 6px;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
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

/* ── Dual panes ───────────────────────── */
.sftp-panes { flex: 1; display: flex; overflow: hidden; min-width: 0; }
.sftp-pane {
  flex: 1; display: flex; flex-direction: column;
  border-right: 1px solid var(--npp-border, #1c2233);
  overflow: hidden; min-width: 0;
}
.sftp-pane:last-child { border-right: none; }
.sftp-pane-header {
  display: flex; align-items: center; gap: 8px;
  padding: 0 8px; height: 34px;
  background: rgba(255,255,255,0.025);
  border-bottom: 1px solid var(--npp-border, #1c2233);
  flex-shrink: 0;
}
.sftp-pane-label {
  font-size: 10px; font-weight: 700; letter-spacing: 0.08em;
  color: var(--npp-text-dim, #6b7a99); flex-shrink: 0;
}
.sftp-path-bar { display: flex; align-items: center; gap: 4px; flex: 1; min-width: 0; }
.sftp-nav-btn {
  background: transparent; border: none; color: var(--npp-text-dim, #6b7a99);
  font-size: 11px; width: 22px; height: 22px; border-radius: 3px; cursor: pointer;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.sftp-nav-btn:hover { background: rgba(255,255,255,0.07); color: var(--npp-text, #cdd6f4); }
.sftp-path-text {
  font-size: 11px; color: var(--npp-text, #cdd6f4);
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  flex: 1; cursor: text; border-radius: 3px; padding: 1px 3px;
}
.sftp-path-text:hover { background: rgba(255,255,255,0.06); }
.sftp-path-input {
  flex: 1; background: rgba(255,255,255,0.08);
  border: 1px solid var(--npp-accent, #29d4f0);
  border-radius: 3px; color: var(--npp-text, #cdd6f4);
  font-size: 11px; padding: 1px 5px; outline: none; font-family: monospace; min-width: 0;
}
.sftp-col-headers {
  display: flex; align-items: center; padding: 0 8px; height: 24px;
  background: rgba(255,255,255,0.03);
  border-bottom: 1px solid var(--npp-border, #1c2233);
  flex-shrink: 0; font-size: 10px; font-weight: 600; color: var(--npp-text-dim, #6b7a99);
}
.col-name { flex: 1; }
.col-size { width: 64px; text-align: right; }
.col-date, .col-perms { width: 80px; text-align: right; }
.sftp-file-list { flex: 1; overflow-y: auto; padding: 2px 0; }
.sftp-file-row {
  display: flex; align-items: center; padding: 0 8px; height: 24px;
  cursor: pointer; font-size: 12px; border-radius: 3px; margin: 0 2px;
}
.sftp-file-row:hover { background: rgba(255,255,255,0.05); }
.sftp-file-row.selected { background: rgba(41,212,240,0.1); }
.sftp-file-row.directory { color: var(--npp-accent, #29d4f0); }
.file-row-name { flex: 1; display: flex; align-items: center; gap: 6px; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
.file-row-icon { font-size: 11px; flex-shrink: 0; }
.file-row-size { width: 64px; text-align: right; color: var(--npp-text-dim, #6b7a99); }
.file-row-date, .file-row-perms { width: 80px; text-align: right; color: var(--npp-text-dim, #6b7a99); }
.sftp-pane-empty { padding: 20px; font-size: 12px; color: var(--npp-text-dim, #6b7a99); }
.sftp-pane-error {
  display: flex; align-items: center; gap: 6px; padding: 5px 8px;
  background: rgba(248,113,113,0.1); color: #f87171;
  font-size: 11px; flex-shrink: 0; border-top: 1px solid rgba(248,113,113,0.2);
}
.sftp-error-dismiss {
  margin-left: auto; background: transparent; border: none;
  color: #f87171; cursor: pointer; font-size: 11px; padding: 0 2px;
}
.sftp-pane-status {
  height: 22px; padding: 0 8px; font-size: 10px; color: var(--npp-text-dim, #6b7a99);
  display: flex; align-items: center;
  border-top: 1px solid var(--npp-border, #1c2233);
  background: rgba(255,255,255,0.02); flex-shrink: 0;
}

/* ── Bottom panel ─────────────────────── */
.sftp-bottom {
  height: 190px; flex-shrink: 0; display: flex; flex-direction: column;
  border-top: 1px solid var(--npp-border, #1c2233);
  background: var(--npp-activitybar, #0c0f17);
}
.sftp-bottom-tabs {
  display: flex; align-items: center; flex-wrap: nowrap; overflow-x: auto;
  border-bottom: 1px solid var(--npp-border, #1c2233);
  flex-shrink: 0; height: 30px;
}
.sftp-bottom-tab {
  background: transparent; border: none; border-bottom: 2px solid transparent;
  color: var(--npp-text-dim, #6b7a99); font-size: 11px; font-weight: 600;
  padding: 0 12px; height: 30px; cursor: pointer; display: flex; align-items: center;
  gap: 5px; white-space: nowrap; flex-shrink: 0;
}
.sftp-bottom-tab.active { color: var(--npp-accent, #29d4f0); border-bottom-color: var(--npp-accent, #29d4f0); }
.sftp-log-clear {
  margin-left: auto; background: transparent; border: none;
  color: var(--npp-text-dim, #6b7a99); cursor: pointer; font-size: 11px;
  padding: 0 10px; height: 30px; display: flex; align-items: center;
}
.sftp-log-clear:hover { color: var(--npp-text, #cdd6f4); }
.sftp-tab-badge {
  background: var(--npp-accent, #29d4f0); color: #090b0f;
  font-size: 9px; font-weight: 700; padding: 1px 4px; border-radius: 6px;
}
.sftp-bottom-content { flex: 1; overflow-y: auto; }
.sftp-bottom-empty { font-size: 11px; color: var(--npp-text-dim, #6b7a99); padding: 8px 10px; }

/* ── Activity log ─────────────────────── */
.activity-log { font-family: monospace; font-size: 11px; padding: 2px 0; }
.log-entry {
  display: flex; align-items: center; gap: 6px;
  padding: 2px 8px; line-height: 1.5;
}
.log-entry:hover { background: rgba(255,255,255,0.03); }
.log-ts { color: var(--npp-text-dim, #6b7a99); flex-shrink: 0; font-size: 10px; }
.log-icon { flex-shrink: 0; width: 12px; text-align: center; }
.log-msg { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.log-info .log-icon, .log-info .log-msg { color: var(--npp-text-dim, #6b7a99); }
.log-success .log-icon { color: #4ade80; }
.log-success .log-msg { color: var(--npp-text, #cdd6f4); }
.log-error .log-icon { color: #f87171; }
.log-error .log-msg { color: #f87171; }
.log-transfer .log-icon { color: #ffcb6b; }
.log-transfer .log-msg { color: var(--npp-text, #cdd6f4); }

/* ── Transfers / ports ────────────────── */
.sftp-action-btn {
  background: rgba(255,255,255,0.07); border: 1px solid var(--npp-border, #1c2233);
  border-radius: 4px; color: var(--npp-text, #cdd6f4); font-size: 11px;
  padding: 4px 10px; cursor: pointer; display: flex; align-items: center; gap: 5px;
  margin: 6px 8px 4px;
}
.sftp-action-btn:hover { background: rgba(255,255,255,0.12); }
.transfer-row { display: flex; align-items: center; gap: 8px; padding: 4px 8px; font-size: 11px; }
.transfer-name { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.transfer-progress-bar { width: 80px; height: 4px; background: rgba(255,255,255,0.1); border-radius: 2px; }
.transfer-progress-fill { height: 100%; background: var(--npp-accent, #29d4f0); border-radius: 2px; }
.transfer-percent { width: 32px; text-align: right; color: var(--npp-text-dim, #6b7a99); }
.port-row { display: flex; align-items: center; gap: 8px; padding: 4px 8px; font-size: 11px; border-radius: 3px; }
.port-row:hover { background: rgba(255,255,255,0.04); }
.port-local, .port-remote { color: var(--npp-accent, #29d4f0); font-family: monospace; }
.port-arrow { color: var(--npp-text-dim, #6b7a99); }
.port-label { flex: 1; color: var(--npp-text-dim, #6b7a99); }
.port-stop-btn {
  background: transparent; border: none; color: var(--npp-text-dim, #6b7a99);
  cursor: pointer; padding: 2px 6px; border-radius: 3px; font-size: 11px;
}
.port-stop-btn:hover { color: #f87171; background: rgba(248,113,113,0.1); }

/* ── Context menu ─────────────────────── */
.sftp-context-backdrop { position: fixed; inset: 0; z-index: 9998; }
.sftp-context-menu {
  position: fixed; z-index: 9999;
  background: var(--npp-sidebar-bg, #111520);
  border: 1px solid var(--npp-border, #1c2233);
  border-radius: 6px; padding: 4px 0; min-width: 180px;
  list-style: none; margin: 0;
  box-shadow: 0 8px 24px rgba(0,0,0,0.5);
}
.sftp-context-menu li {
  padding: 6px 14px; font-size: 12px; cursor: pointer;
  color: var(--npp-text, #cdd6f4);
  display: flex; align-items: center; gap: 8px;
}
.sftp-context-menu li:hover { background: rgba(255,255,255,0.07); }
.sftp-context-menu li.sep { height: 1px; background: var(--npp-border, #1c2233); padding: 0; margin: 4px 0; cursor: default; }
.ctx-icon { width: 12px; text-align: center; font-size: 11px; flex-shrink: 0; color: var(--npp-text-dim, #6b7a99); }
.ctx-icon-accent { color: var(--npp-accent, #29d4f0) !important; }
.ctx-icon-danger { color: #f87171 !important; }

/* ── Prompt / Confirm dialogs ─────────── */
.sftp-prompt-backdrop {
  position: fixed; inset: 0; z-index: 10100;
  background: rgba(0,0,0,0.5);
  display: flex; align-items: center; justify-content: center;
}
.sftp-prompt-box {
  background: var(--npp-sidebar, #111520);
  border: 1px solid var(--npp-border, #1c2233);
  border-radius: 8px;
  padding: 20px; width: 360px;
  box-shadow: 0 16px 40px rgba(0,0,0,0.6);
  display: flex; flex-direction: column; gap: 10px;
}
.sftp-prompt-title {
  font-size: 13px; font-weight: 600; color: var(--npp-text, #cdd6f4);
}
.sftp-prompt-label {
  font-size: 11px; color: var(--npp-text-dim, #6b7a99);
}
.sftp-prompt-input {
  background: rgba(255,255,255,0.05);
  border: 1px solid var(--npp-border, #1c2233);
  border-radius: 6px; color: var(--npp-text, #cdd6f4);
  font-size: 13px; padding: 7px 10px; outline: none;
  font-family: monospace;
}
.sftp-prompt-input:focus { border-color: var(--npp-accent, #29d4f0); }
.sftp-confirm-msg { margin: 0; font-size: 12px; color: var(--npp-text-dim, #6b7a99); line-height: 1.5; }
.sftp-prompt-actions { display: flex; gap: 8px; justify-content: flex-end; margin-top: 4px; }
.sftp-prompt-cancel {
  background: transparent; border: 1px solid var(--npp-border, #1c2233);
  border-radius: 6px; color: var(--npp-text, #cdd6f4); font-size: 12px;
  padding: 6px 14px; cursor: pointer;
}
.sftp-prompt-cancel:hover { background: rgba(255,255,255,0.07); }
.sftp-prompt-ok {
  background: var(--npp-accent, #29d4f0); color: #090b0f;
  border: none; border-radius: 6px; font-size: 12px; font-weight: 600;
  padding: 6px 14px; cursor: pointer;
}
.sftp-prompt-ok:hover { filter: brightness(1.1); }
.sftp-prompt-danger { background: #f87171; }
.sftp-prompt-danger:hover { background: #ef4444; filter: none; }
</style>
