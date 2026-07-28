<template>
  <div class="git-panel">
    <!-- Header -->
    <div class="git-panel-header">
      <span class="git-header-title">SOURCE CONTROL</span>
      <span v-if="changeCount" class="git-change-badge">{{ changeCount }}</span>
      <button type="button" class="git-icon-btn" title="Refresh" :disabled="loading" @click="refresh">
        <i class="fa-solid fa-rotate" :class="{ 'fa-spin': loading }"></i>
      </button>
    </div>

    <!-- Error bar -->
    <div v-if="errorMsg" class="git-error-bar">
      <i class="fa-solid fa-triangle-exclamation"></i>
      {{ errorMsg }}
      <button type="button" class="git-error-dismiss" @click="errorMsg = ''"><i class="fa-solid fa-xmark"></i></button>
    </div>

    <div v-if="!fileTreeStore.openFolderPath" class="git-no-folder">
      <p>Open a folder to use source control.</p>
      <button type="button" class="git-open-folder-btn" @click="$emit('open-folder')">
        <i class="fa-solid fa-folder-open"></i> Open Folder
      </button>
    </div>

    <div v-else-if="!isLocal" class="git-no-folder">
      <p>Source control is not available for remote workspaces.</p>
    </div>

    <div v-else class="git-panel-body">
      <!-- Branch row with switcher -->
      <div class="git-branch-row">
        <svg class="git-branch-icon" viewBox="0 0 16 16" width="13" height="13" fill="currentColor">
          <path d="M11.75 2.5a.75.75 0 1 0 1.5 0 .75.75 0 0 0-1.5 0zm.75 3c-.98 0-1.81.626-2.12 1.5H7.93A2.5 2.5 0 0 0 5.5 9.25v1.5a.75.75 0 0 0 1.5 0v-1.5a1 1 0 0 1 1-1h2.37c.31.874 1.14 1.5 2.12 1.5a2.25 2.25 0 0 0 0-4.5zM2.75 5.5a.75.75 0 1 0 1.5 0 .75.75 0 0 0-1.5 0zm.75 2.25a2.25 2.25 0 1 1 0-4.5 2.25 2.25 0 0 1 0 4.5z"/>
        </svg>
        <button type="button" class="git-branch-btn" title="Switch branch" @click="toggleBranchPicker">
          {{ fileTreeStore.gitBranch || 'main' }}
          <i class="fa-solid fa-chevron-down" style="font-size:9px;margin-left:4px"></i>
        </button>
      </div>

      <!-- Branch picker dropdown -->
      <div v-if="showBranchPicker" class="git-branch-picker">
        <div class="git-branch-picker-header">
          <span>Switch Branch</span>
          <button type="button" class="git-icon-btn" @click="showBranchPicker = false"><i class="fa-solid fa-xmark"></i></button>
        </div>
        <div v-if="branchesLoading" class="git-branch-loading">Loading…</div>
        <template v-else>
          <button
            v-for="b in branches"
            :key="b.name"
            type="button"
            class="git-branch-item"
            :class="{ current: b.current }"
            @click="checkoutBranch(b.name)"
          >
            <i v-if="b.current" class="fa-solid fa-check" style="font-size:10px;width:12px"></i>
            <span v-else style="width:12px;display:inline-block"></span>
            {{ b.name }}
          </button>
        </template>
      </div>

      <!-- Sync actions (push/pull) -->
      <div class="git-sync-row">
        <button type="button" class="git-sync-btn" title="Pull from remote" :disabled="syncing" @click="pull">
          <i class="fa-solid fa-arrow-down"></i> Pull
        </button>
        <button type="button" class="git-sync-btn" title="Push to remote" :disabled="syncing" @click="push">
          <i class="fa-solid fa-arrow-up"></i> Push
        </button>
        <button type="button" class="git-sync-btn git-sync-btn-accent" title="Pull then push" :disabled="syncing" @click="sync">
          <i class="fa-solid fa-arrows-rotate" :class="{ 'fa-spin': syncing }"></i> Sync
        </button>
      </div>

      <!-- Commit area -->
      <div class="git-commit-area">
        <textarea
          v-model="commitMessage"
          class="git-commit-input"
          placeholder="Commit message (⌘Enter to commit)"
          rows="3"
          @keydown.meta.enter.prevent="commit"
          @keydown.ctrl.enter.prevent="commit"
        ></textarea>
        <div class="git-commit-actions">
          <button type="button" class="git-commit-btn" :disabled="!commitMessage.trim() || !hasStagedChanges || committing" @click="commit">
            <i v-if="committing" class="fa-solid fa-circle-notch fa-spin"></i>
            <span v-else>Commit</span>
          </button>
          <button type="button" class="git-stage-all-btn" title="Stage all changes" @click="stageAll">
            <i class="fa-solid fa-plus"></i> Stage All
          </button>
        </div>
      </div>

      <!-- Staged Changes -->
      <div class="git-section">
        <button type="button" class="git-section-header" @click="stagedOpen = !stagedOpen">
          <span class="git-section-chevron">{{ stagedOpen ? '▾' : '▸' }}</span>
          <span class="git-section-title">Staged</span>
          <span class="git-section-count">{{ staged.length }}</span>
        </button>
        <template v-if="stagedOpen">
          <div v-for="f in staged" :key="f.path" class="git-file-row" @click="openFile(f.path)">
            <span class="git-file-status" :class="statusClass(f.status)">{{ f.status }}</span>
            <span class="git-file-name" :title="f.path">{{ shortName(f.path) }}</span>
            <div class="git-file-actions">
              <button type="button" class="git-file-btn" title="Unstage" @click.stop="unstage(f.path)">
                <i class="fa-solid fa-minus"></i>
              </button>
            </div>
          </div>
          <div v-if="!staged.length" class="git-empty-section">No staged changes</div>
        </template>
      </div>

      <!-- Unstaged Changes -->
      <div class="git-section">
        <button type="button" class="git-section-header" @click="changesOpen = !changesOpen">
          <span class="git-section-chevron">{{ changesOpen ? '▾' : '▸' }}</span>
          <span class="git-section-title">Changes</span>
          <span class="git-section-count">{{ unstaged.length }}</span>
        </button>
        <template v-if="changesOpen">
          <div v-for="f in unstaged" :key="f.path" class="git-file-row" @click="openFile(f.path)">
            <span class="git-file-status" :class="statusClass(f.status)">{{ f.status }}</span>
            <span class="git-file-name" :title="f.path">{{ shortName(f.path) }}</span>
            <div class="git-file-actions">
              <button type="button" class="git-file-btn" title="Stage file" @click.stop="stage(f.path)">
                <i class="fa-solid fa-plus"></i>
              </button>
              <button type="button" class="git-file-btn git-file-btn-danger" title="Discard changes" @click.stop="discardFile(f.path)">
                <i class="fa-solid fa-trash-can"></i>
              </button>
            </div>
          </div>
          <div v-if="!unstaged.length" class="git-empty-section">No changes</div>
        </template>
      </div>

      <!-- Commit History -->
      <div class="git-section">
        <button type="button" class="git-section-header" @click="historyOpen = !historyOpen">
          <span class="git-section-chevron">{{ historyOpen ? '▾' : '▸' }}</span>
          <span class="git-section-title">History</span>
          <span class="git-section-count">{{ commits.length }}</span>
        </button>
        <template v-if="historyOpen">
          <div v-for="c in commits" :key="c.fullHash" class="git-commit-row">
            <span class="git-commit-hash">{{ c.hash }}</span>
            <span class="git-commit-msg" :title="c.message">{{ c.message }}</span>
            <span class="git-commit-time">{{ c.time }}</span>
          </div>
          <div v-if="!commits.length" class="git-empty-section">No commits yet</div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useFileTreeStore } from '../../stores/fileTree'

const emit = defineEmits(['open-file', 'open-folder'])
const fileTreeStore = useFileTreeStore()

const commitMessage = ref('')
const stagedOpen = ref(true)
const changesOpen = ref(true)
const historyOpen = ref(false)
const showBranchPicker = ref(false)
const staged = ref([])
const unstaged = ref([])
const commits = ref([])
const branches = ref([])
const loading = ref(false)
const syncing = ref(false)
const committing = ref(false)
const branchesLoading = ref(false)
const errorMsg = ref('')

const isLocal = computed(() => fileTreeStore.workspaceMode === 'local')
const folderOpen = computed(() => !!fileTreeStore.openFolderPath && isLocal.value)
const changeCount = computed(() => staged.value.length + unstaged.value.length)
const hasStagedChanges = computed(() => staged.value.length > 0)

onMounted(() => {
  if (folderOpen.value) refresh()
  if (window.electronAPI?.onFolderChanged) {
    window.electronAPI.onFolderChanged(refresh)
  }
})

onUnmounted(() => {
  if (window.electronAPI?.offFolderChanged) {
    window.electronAPI.offFolderChanged(refresh)
  }
})

watch(() => fileTreeStore.openFolderPath, (newPath) => {
  if (newPath && isLocal.value) refresh()
}, { immediate: true })

watch(isLocal, (local) => {
  if (local && fileTreeStore.openFolderPath) refresh()
})

async function refresh() {
  if (!fileTreeStore.openFolderPath || !window.electronAPI?.gitGetStatus) return
  loading.value = true
  errorMsg.value = ''
  try {
    const [statusResult, logResult] = await Promise.all([
      window.electronAPI.gitGetStatus(fileTreeStore.openFolderPath),
      window.electronAPI.gitLog?.(fileTreeStore.openFolderPath, 10),
    ])
    if (statusResult?.error) {
      errorMsg.value = statusResult.error
    } else {
      fileTreeStore.gitBranch = statusResult.branch || ''
      staged.value = statusResult.staged || []
      unstaged.value = statusResult.unstaged || []
      const map = {}
      for (const f of staged.value) map[f.path] = f.status
      for (const f of unstaged.value) { if (!map[f.path]) map[f.path] = f.status }
      fileTreeStore.gitStatus = map
    }
    if (logResult && !logResult.error) {
      commits.value = logResult.commits || []
    }
  } finally {
    loading.value = false
  }
}

async function stageAll() {
  if (!window.electronAPI?.gitStageAll) return
  const result = await window.electronAPI.gitStageAll(fileTreeStore.openFolderPath)
  if (result?.error) errorMsg.value = result.error
  else refresh()
}

async function stage(filePath) {
  if (!window.electronAPI?.gitStageFile) return
  const result = await window.electronAPI.gitStageFile(fileTreeStore.openFolderPath, filePath)
  if (result?.error) errorMsg.value = result.error
  else refresh()
}

async function unstage(filePath) {
  if (!window.electronAPI?.gitUnstageFile) return
  const result = await window.electronAPI.gitUnstageFile(fileTreeStore.openFolderPath, filePath)
  if (result?.error) errorMsg.value = result.error
  else refresh()
}

async function discardFile(filePath) {
  if (!confirm(`Discard changes to "${shortName(filePath)}"? This cannot be undone.`)) return
  if (!window.electronAPI?.gitDiscardFile) return
  const result = await window.electronAPI.gitDiscardFile(fileTreeStore.openFolderPath, filePath)
  if (result?.error) errorMsg.value = result.error
  else refresh()
}

async function commit() {
  const msg = commitMessage.value.trim()
  if (!msg || !hasStagedChanges.value || !window.electronAPI?.gitCommit) return
  committing.value = true
  const result = await window.electronAPI.gitCommit(fileTreeStore.openFolderPath, msg)
  committing.value = false
  if (result?.error) errorMsg.value = result.error
  else { commitMessage.value = ''; refresh() }
}

async function pull() {
  if (!window.electronAPI?.gitPull) return
  syncing.value = true
  const result = await window.electronAPI.gitPull(fileTreeStore.openFolderPath)
  syncing.value = false
  if (result?.error) errorMsg.value = result.error
  else refresh()
}

async function push() {
  if (!window.electronAPI?.gitPush) return
  syncing.value = true
  const result = await window.electronAPI.gitPush(fileTreeStore.openFolderPath)
  syncing.value = false
  if (result?.error) errorMsg.value = result.error
}

async function sync() {
  if (!window.electronAPI?.gitPull || !window.electronAPI?.gitPush) return
  syncing.value = true
  const pullResult = await window.electronAPI.gitPull(fileTreeStore.openFolderPath)
  if (pullResult?.error) { errorMsg.value = pullResult.error; syncing.value = false; return }
  const pushResult = await window.electronAPI.gitPush(fileTreeStore.openFolderPath)
  syncing.value = false
  if (pushResult?.error) errorMsg.value = pushResult.error
  else refresh()
}

async function toggleBranchPicker() {
  showBranchPicker.value = !showBranchPicker.value
  if (showBranchPicker.value && !branches.value.length) {
    branchesLoading.value = true
    const result = await window.electronAPI?.gitBranches?.(fileTreeStore.openFolderPath)
    branchesLoading.value = false
    if (result && !result.error) branches.value = result.branches || []
    else errorMsg.value = result?.error || 'Failed to load branches'
  }
}

async function checkoutBranch(name) {
  if (name === fileTreeStore.gitBranch) { showBranchPicker.value = false; return }
  const result = await window.electronAPI?.gitCheckout?.(fileTreeStore.openFolderPath, name)
  showBranchPicker.value = false
  branches.value = []
  if (result?.error) errorMsg.value = result.error
  else refresh()
}

function openFile(filePath) {
  const root = fileTreeStore.openFolderPath
  if (root) emit('open-file', root + '/' + filePath)
}

function shortName(filePath) {
  return filePath.split('/').pop() || filePath
}

function statusClass(status) {
  const s = (status || '').toLowerCase()
  if (s === 'm') return 'status-m'
  if (s === 'a') return 'status-a'
  if (s === 'd') return 'status-d'
  if (s === '?') return 'status-u'
  return ''
}
</script>

<style scoped>
.git-panel {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  height: 100%;
}

.git-panel-header {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 10px 10px 6px;
  flex-shrink: 0;
}

.git-header-title {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--npp-text-dim, #6b7a99);
  flex: 1;
}

.git-change-badge {
  font-size: 10px;
  font-weight: 700;
  background: var(--npp-accent, #29d4f0);
  color: #090b0f;
  padding: 1px 5px;
  border-radius: 8px;
}

.git-icon-btn {
  background: transparent; border: none; color: var(--npp-text-dim, #6b7a99);
  font-size: 12px; padding: 3px 5px; border-radius: 3px; cursor: pointer;
}
.git-icon-btn:hover { color: var(--npp-text, #cdd6f4); background: rgba(255,255,255,0.07); }
.git-icon-btn:disabled { opacity: 0.4; pointer-events: none; }

.git-error-bar {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  background: rgba(248,113,113,0.12);
  color: #f87171;
  font-size: 11px;
  flex-shrink: 0;
  border-bottom: 1px solid rgba(248,113,113,0.2);
}

.git-error-dismiss {
  margin-left: auto; background: transparent; border: none;
  color: #f87171; cursor: pointer; font-size: 11px; padding: 0 2px;
}

.git-no-folder {
  padding: 16px 12px;
  font-size: 12px;
  color: var(--npp-text-dim, #6b7a99);
  line-height: 1.5;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.git-no-folder p { margin: 0; }

.git-open-folder-btn {
  align-self: flex-start;
  background: var(--npp-accent, #29d4f0);
  color: #090b0f;
  border: none;
  border-radius: 5px;
  font-size: 12px;
  font-weight: 600;
  padding: 5px 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
}
.git-open-folder-btn:hover { filter: brightness(1.1); }

.git-panel-body {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.git-branch-row {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px 4px;
  flex-shrink: 0;
}

.git-branch-icon { flex-shrink: 0; color: var(--npp-text-dim, #6b7a99); }

.git-branch-btn {
  background: transparent; border: none; color: var(--npp-text, #cdd6f4);
  font-size: 12px; cursor: pointer; padding: 2px 4px; border-radius: 3px;
  display: flex; align-items: center; gap: 2px;
}
.git-branch-btn:hover { background: rgba(255,255,255,0.07); }

.git-branch-picker {
  margin: 0 8px 6px;
  background: var(--npp-sidebar, #111520);
  border: 1px solid var(--npp-border, #1c2233);
  border-radius: 6px;
  overflow: hidden;
  flex-shrink: 0;
}

.git-branch-picker-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 6px 10px;
  font-size: 11px; font-weight: 600;
  color: var(--npp-text-dim, #6b7a99);
  border-bottom: 1px solid var(--npp-border, #1c2233);
}

.git-branch-loading { padding: 8px 10px; font-size: 12px; color: var(--npp-text-dim, #6b7a99); }

.git-branch-item {
  display: flex; align-items: center; gap: 6px;
  width: 100%; padding: 5px 10px;
  background: transparent; border: none;
  font-size: 12px; color: var(--npp-text, #cdd6f4);
  cursor: pointer; text-align: left;
}
.git-branch-item:hover { background: rgba(255,255,255,0.05); }
.git-branch-item.current { color: var(--npp-accent, #29d4f0); }

.git-sync-row {
  display: flex;
  gap: 5px;
  padding: 4px 8px 4px;
  flex-shrink: 0;
}

.git-sync-btn {
  flex: 1;
  background: rgba(255,255,255,0.06);
  border: 1px solid var(--npp-border, #1c2233);
  border-radius: 5px;
  color: var(--npp-text, #cdd6f4);
  font-size: 11px; font-weight: 500;
  padding: 4px 6px; cursor: pointer;
  display: flex; align-items: center; justify-content: center; gap: 4px;
}
.git-sync-btn:hover { background: rgba(255,255,255,0.1); }
.git-sync-btn:disabled { opacity: 0.4; pointer-events: none; }

.git-sync-btn-accent {
  background: rgba(41,212,240,0.1);
  border-color: rgba(41,212,240,0.25);
  color: var(--npp-accent, #29d4f0);
}
.git-sync-btn-accent:hover { background: rgba(41,212,240,0.18); }

.git-commit-area {
  padding: 4px 8px 6px;
  flex-shrink: 0;
}

.git-commit-input {
  width: 100%;
  background: rgba(255,255,255,0.05);
  border: 1px solid var(--npp-border, #1c2233);
  border-radius: 5px;
  color: var(--npp-text, #cdd6f4);
  font-size: 12px;
  padding: 6px 8px;
  resize: none;
  outline: none;
  box-sizing: border-box;
  font-family: inherit;
}
.git-commit-input:focus { border-color: var(--npp-accent, #29d4f0); }

.git-commit-actions {
  display: flex;
  gap: 5px;
  margin-top: 5px;
}

.git-commit-btn {
  flex: 1;
  background: var(--npp-accent, #29d4f0);
  color: #090b0f;
  border: none;
  border-radius: 5px;
  font-size: 12px;
  font-weight: 600;
  padding: 5px 10px;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
}
.git-commit-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.git-commit-btn:not(:disabled):hover { filter: brightness(1.1); }

.git-stage-all-btn {
  background: rgba(255,255,255,0.06);
  border: 1px solid var(--npp-border, #1c2233);
  border-radius: 5px;
  color: var(--npp-text, #cdd6f4);
  font-size: 11px;
  padding: 5px 8px;
  cursor: pointer;
  display: flex; align-items: center; gap: 4px; white-space: nowrap;
}
.git-stage-all-btn:hover { background: rgba(255,255,255,0.1); }

.git-section { flex-shrink: 0; }

.git-section-header {
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
  padding: 5px 8px;
  background: transparent;
  border: none;
  cursor: pointer;
  text-align: left;
}
.git-section-header:hover { background: rgba(255,255,255,0.04); }

.git-section-chevron { font-size: 9px; color: var(--npp-text-dim, #6b7a99); }
.git-section-title { font-size: 11px; font-weight: 600; color: var(--npp-text, #cdd6f4); flex: 1; }
.git-section-count { font-size: 10px; color: var(--npp-text-dim, #6b7a99); min-width: 14px; text-align: right; }

.git-file-row {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 3px 6px 3px 20px;
  cursor: pointer;
  font-size: 12px;
}
.git-file-row:hover { background: rgba(255,255,255,0.05); }

.git-file-status {
  font-size: 10px;
  font-weight: 700;
  width: 14px;
  text-align: center;
  border-radius: 3px;
  flex-shrink: 0;
}
.status-m { color: #ffcb6b; }
.status-a { color: #c3e88d; }
.status-d { color: #f87171; }
.status-u { color: var(--npp-text-dim, #6b7a99); }

.git-file-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--npp-text, #cdd6f4);
}

.git-file-actions {
  display: flex;
  gap: 2px;
  opacity: 0;
  transition: opacity 0.1s;
}
.git-file-row:hover .git-file-actions { opacity: 1; }

.git-file-btn {
  background: transparent; border: none;
  font-size: 12px; padding: 1px 4px; cursor: pointer; border-radius: 3px;
  color: var(--npp-text-dim, #6b7a99);
}
.git-file-btn:hover { color: #c3e88d; background: rgba(195,232,141,0.1); }
.git-file-btn-danger:hover { color: #f87171; background: rgba(248,113,113,0.1); }

.git-empty-section {
  padding: 4px 8px 4px 22px;
  font-size: 11px;
  color: var(--npp-text-dim, #6b7a99);
}

.git-commit-row {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px 4px 22px;
  font-size: 11px;
}
.git-commit-row:hover { background: rgba(255,255,255,0.04); }

.git-commit-hash {
  font-family: monospace;
  font-size: 10px;
  color: var(--npp-accent, #29d4f0);
  flex-shrink: 0;
  width: 46px;
}

.git-commit-msg {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--npp-text, #cdd6f4);
}

.git-commit-time {
  font-size: 10px;
  color: var(--npp-text-dim, #6b7a99);
  flex-shrink: 0;
  white-space: nowrap;
}
</style>
