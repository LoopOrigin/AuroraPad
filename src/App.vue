<template>
  <div class="app-layout" :class="{ 'is-mac': isMacPlatform, 'terminal-open': showTerminal }">
    <header class="app-menu-bar" :class="{ 'is-mac-header': isMacPlatform }">
      <MenuBar
        v-if="!isMacPlatform"
        :menus="menuBarMenus"
        :primary-menu-ids="topMenuPrimaryIds"
        @new="menuNew"
        @open="menuOpenFile"
        @close-tab="menuCloseTab"
        @action="onMenuBarAction"
      />
      <span v-else class="mac-title">AuroraPad</span>
    </header>
    <Toolbar
      v-if="settingsStore.toolbarVisible"
      :can-save="!!(tabsStore.activeTab?.isDirty)"
      :has-editor="!!tabsStore.activeTab"
      :can-save-all="tabsStore.hasDirty"
      :word-wrap="settingsStore.wordWrap"
      @new="menuNew"
      @open="menuOpenFile"
      @save="menuSave"
      @save-all="handleMenu('menu:save-all')"
      @cut="handleMenu('menu:cut')"
      @copy="handleMenu('menu:copy')"
      @paste="handleMenu('menu:paste')"
      @find="handleMenu('menu:find')"
      @replace="handleMenu('menu:replace')"
      @undo="handleMenu('menu:undo')"
      @redo="handleMenu('menu:redo')"
      @toggle-word-wrap="settingsStore.setWordWrap(!settingsStore.wordWrap)"
      @go-to-line="handleMenu('menu:go-to-line')"
      @zoom-in="handleMenu('menu:zoom-in')"
      @zoom-out="handleMenu('menu:zoom-out')"
      @preferences="openPreferences"
    />
    <div class="app-body">
    <aside class="sidebar" :class="{ collapsed: !settingsStore.sidebarVisible }">
      <FileTree
        @open-file="openFileByPath"
        @move-entry="moveRemoteEntry"
      />
      <div class="sidebar-section-title">
        <span>Recent</span>
        <button v-if="settingsStore.recentFiles.length" type="button" @click="clearRecent">Clear</button>
      </div>
      <ul class="recent-files-list">
        <li
          v-for="path in settingsStore.recentFiles.slice(0, 10)"
          :key="path"
          :title="path"
          @click="openFileByPath(path)"
        >
          {{ path.split(/[/\\]/).pop() }}
        </li>
        <li v-if="!settingsStore.recentFiles.length" class="recent-files-empty">
          Recently opened files will appear here.
        </li>
      </ul>
    </aside>
    <div class="editor-area">
      <TabBar />
      <div class="editor-container" :class="{ 'editor-container-split': splitViewEnabled }">
        <template v-if="tabsStore.activeTab">
          <div class="editor-pane primary-pane">
            <div
              :data-tab-id="primaryTab?.id"
              class="monaco-editor-wrapper"
            >
              <MonacoEditor
                ref="monacoEditorRef"
                :model-value="primaryTab?.content || ''"
                :language="primaryTab?.language || 'plaintext'"
                :theme="monacoTheme"
                :word-wrap="settingsStore.wordWrap"
                :line-numbers="settingsStore.lineNumbers"
                :font-size="settingsStore.fontSize"
                :render-whitespace="settingsStore.showWhitespace ? 'all' : 'none'"
                :highlight-current-line="settingsStore.highlightCurrentLine"
                :bookmarks="primaryTab?.bookmarks || []"
                :show-minimap="settingsStore.showMinimap"
                @update:model-value="val => onEditorContentChange('primary', val)"
                @cursor-change="pos => onCursorChange('primary', pos)"
              />
            </div>
          </div>
          <div v-if="splitViewEnabled" class="editor-pane secondary-pane">
            <div
              :data-tab-id="(secondaryTab || primaryTab)?.id + '-secondary'"
              class="monaco-editor-wrapper"
            >
              <MonacoEditor
                ref="monacoEditorSecondaryRef"
                :model-value="(secondaryTab || primaryTab)?.content || ''"
                :language="(secondaryTab || primaryTab)?.language || 'plaintext'"
                :theme="monacoTheme"
                :word-wrap="settingsStore.wordWrap"
                :line-numbers="settingsStore.lineNumbers"
                :font-size="settingsStore.fontSize"
                :render-whitespace="settingsStore.showWhitespace ? 'all' : 'none'"
                :highlight-current-line="settingsStore.highlightCurrentLine"
                :bookmarks="(secondaryTab || primaryTab)?.bookmarks || []"
                :show-minimap="settingsStore.showMinimap"
                @update:model-value="val => onEditorContentChange('secondary', val)"
              />
            </div>
          </div>
        </template>
        <div v-else class="empty-state">
          <div class="empty-state-badge">AuroraPad</div>
          <h2>No file open</h2>
          <p>Open a file, load a folder, or start a scratch note.</p>
          <div class="empty-state-platform">
            <span>{{ platformInfo.revealInFolderLabel }}</span>
            <span>{{ platformInfo.terminalAppLabel }}</span>
            <span>{{ platformInfo.platform }}</span>
          </div>
          <div class="empty-state-actions">
            <button type="button" @click="menuOpenFile">Open File</button>
            <button type="button" @click="menuOpenFolder">Open Folder</button>
            <button type="button" class="secondary" @click="menuNew">New File</button>
          </div>
          <div class="empty-state-tips">
            <span><kbd>{{ isMacPlatform ? 'Cmd' : 'Ctrl' }}+P</kbd> Command Palette</span>
            <span><kbd>{{ isMacPlatform ? 'Cmd' : 'Ctrl' }}+Shift+F</kbd> Find in Files</span>
          </div>
        </div>
      </div>
      <StatusBar
        v-if="settingsStore.statusBarVisible"
        @go-to-line="handleMenu('menu:go-to-line')"
      />
      <TerminalDock
        v-if="showTerminal"
        ref="terminalDockRef"
        :platform-info="platformInfo"
        @close="showTerminal = false"
      />
    </div>
    </div>
    <v-dialog v-model="showPluginManager" max-width="760">
      <v-card class="aurora-dialog">
        <v-toolbar color="transparent" density="comfortable">
          <v-toolbar-title>Plugins</v-toolbar-title>
          <v-spacer />
          <v-btn icon="mdi-close" variant="text" @click="showPluginManager = false" />
        </v-toolbar>
        <v-card-text class="dialog-body">
          <div class="dialog-intro">
            AuroraPad uses built-in skills plus user JavaScript plugins. Drop `.js` plugins into the plugins folder to extend the app.
          </div>
          <v-list class="dialog-list" bg-color="transparent">
            <v-list-item
              v-for="p in pluginsStore.plugins"
              :key="p.id"
              class="dialog-list-item"
            >
              <template #prepend>
                <v-avatar color="primary" variant="tonal" size="34">
                  <v-icon icon="mdi-puzzle-outline" />
                </v-avatar>
              </template>
              <v-list-item-title>
                {{ p.name }} <span class="plugin-version">{{ p.version || '' }}</span>
              </v-list-item-title>
              <v-list-item-subtitle>
                {{ p.description || 'Built-in AuroraPad skill' }}
              </v-list-item-subtitle>
              <template #append>
                <v-chip size="small" variant="tonal" color="secondary">
                  {{ (p.menuItems || []).length }} actions
                </v-chip>
              </template>
            </v-list-item>
          </v-list>
        </v-card-text>
        <v-card-actions class="dialog-actions">
          <v-btn color="secondary" variant="tonal" prepend-icon="mdi-folder-open-outline" @click="openPluginsFolder">
            Open Plugins Folder
          </v-btn>
          <v-spacer />
          <v-btn color="primary" @click="showPluginManager = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="showRemoteManager" max-width="1020">
      <v-card class="aurora-dialog remote-manager-dialog">
        <v-toolbar color="transparent" density="comfortable">
          <v-toolbar-title>
            Remote Servers
            <div class="remote-dialog-subtitle">Manage SSH/SFTP/FTP profiles and connect quickly.</div>
          </v-toolbar-title>
          <v-spacer />
          <v-chip size="small" variant="tonal" :color="keychainAvailable ? 'success' : 'warning'">
            {{ keychainAvailable ? 'Keychain Ready' : 'Keychain Unavailable' }}
          </v-chip>
          <v-btn
            variant="flat"
            size="small"
            class="remote-dialog-close-btn"
            title="Close"
            @click="showRemoteManager = false"
          >
            <span class="remote-close-mark" aria-hidden="true">×</span>
          </v-btn>
        </v-toolbar>
        <v-card-text class="dialog-body">
          <v-row dense class="remote-manager-grid">
            <v-col cols="12" md="5">
              <div class="settings-group remote-manager-panel remote-manager-profiles">
                <div class="settings-group-title">Saved Profiles</div>
                <v-list class="dialog-list remote-profile-list" bg-color="transparent">
                  <v-list-item
                    v-for="profile in remoteProfiles"
                    :key="profile.id"
                    class="dialog-list-item remote-profile-item"
                    :class="{ active: remoteForm.id === profile.id }"
                    @click="editRemoteProfile(profile)"
                  >
                    <template #prepend>
                      <v-avatar size="28" variant="tonal" class="remote-profile-avatar">
                        <v-icon :icon="profile.protocol === 'sftp' ? 'mdi-ssh' : (profile.protocol === 'ftps' ? 'mdi-lock' : 'mdi-lan-connect')" size="15" />
                      </v-avatar>
                    </template>
                    <v-list-item-title>{{ profile.name }}</v-list-item-title>
                    <v-list-item-subtitle>{{ profile.protocol.toUpperCase() }} • {{ profile.username }}@{{ profile.host }}:{{ profile.port }}</v-list-item-subtitle>
                    <template #append>
                      <div class="remote-profile-actions">
                        <v-btn size="x-small" variant="tonal" color="primary" @click.stop="connectRemoteProfile(profile)">Connect</v-btn>
                        <v-btn size="x-small" variant="text" @click.stop="editRemoteProfile(profile)">Edit</v-btn>
                        <v-btn size="x-small" variant="text" color="error" @click.stop="requestDeleteRemoteProfile(profile)">Remove</v-btn>
                      </div>
                    </template>
                  </v-list-item>
                </v-list>
                <div v-if="!remoteProfiles.length" class="dialog-intro remote-empty-state">
                  <v-icon icon="mdi-server-network-off" size="18" />
                  <span>No profiles yet. Create one on the right.</span>
                </div>
              </div>
            </v-col>
            <v-col cols="12" md="7">
              <div class="settings-group remote-manager-panel remote-manager-editor">
                <div class="settings-group-title">Profile Editor</div>
                <div class="remote-form-fields">
                <v-text-field v-model="remoteForm.name" label="Profile Name" placeholder="Production Server" />
                <v-row dense class="remote-form-row">
                  <v-col cols="12" sm="6">
                    <v-select
                      v-model="remoteForm.protocol"
                      :items="remoteProtocolOptions"
                      label="Protocol"
                    />
                  </v-col>
                  <v-col cols="12" sm="6">
                    <v-select
                      v-model="remoteForm.authType"
                      :items="remoteAuthOptions"
                      label="Auth Type"
                      :disabled="remoteForm.protocol !== 'sftp'"
                    />
                  </v-col>
                </v-row>
                <v-row dense class="remote-form-row">
                  <v-col cols="12" sm="8"><v-text-field v-model="remoteForm.host" label="Host" placeholder="example.com" /></v-col>
                  <v-col cols="12" sm="4"><v-text-field v-model="remoteForm.port" type="number" label="Port" /></v-col>
                </v-row>
                <v-text-field v-model="remoteForm.username" label="Username" />
                <v-text-field v-model="remoteForm.remoteRoot" label="Default Remote Root" placeholder="/" />
                <v-text-field
                  v-if="remoteForm.protocol === 'sftp' && remoteForm.authType === 'privateKey'"
                  v-model="remoteForm.privateKeyPath"
                  label="Private Key Path"
                  placeholder="~/.ssh/id_rsa"
                />
                <v-text-field
                  v-if="remoteForm.authType === 'password' || remoteForm.protocol !== 'sftp'"
                  v-model="remoteForm.secretPassword"
                  type="password"
                  label="Password (optional unless connecting)"
                />
                <v-text-field
                  v-if="remoteForm.protocol === 'sftp' && remoteForm.authType === 'privateKey'"
                  v-model="remoteForm.secretPassphrase"
                  type="password"
                  label="Key Passphrase (optional)"
                />
                <v-switch
                  :model-value="remoteForm.saveSecret"
                  :disabled="!keychainAvailable"
                  label="Save secret to OS keychain"
                  @update:model-value="remoteForm.saveSecret = !!$event"
                />
                </div>
              </div>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions class="dialog-actions remote-manager-actions">
          <div class="remote-actions-left">
            <v-btn variant="tonal" class="remote-action-btn" @click="resetRemoteForm">New Profile</v-btn>
          </div>
          <div class="remote-actions-right">
            <v-btn variant="tonal" class="remote-action-btn" @click="showRemoteManager = false">Close</v-btn>
            <v-btn color="secondary" variant="tonal" class="remote-action-btn" @click="loadRemoteProfiles">Refresh</v-btn>
            <v-btn color="primary" variant="flat" class="remote-action-btn remote-action-btn-primary" @click="saveRemoteProfile">Save Profile</v-btn>
          </div>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="showDeleteRemoteProfileDialog" max-width="520">
      <v-card class="aurora-dialog remote-delete-dialog">
        <v-toolbar color="transparent" density="comfortable">
          <v-toolbar-title>Remove Profile</v-toolbar-title>
          <v-spacer />
          <v-btn variant="flat" size="small" class="remote-dialog-close-btn" @click="cancelDeleteRemoteProfile">
            <span class="remote-close-mark" aria-hidden="true">×</span>
          </v-btn>
        </v-toolbar>
        <v-card-text class="dialog-body">
          <div class="remote-delete-callout">
            <v-icon icon="mdi-alert-circle-outline" color="error" size="22" />
            <div>
              <div class="remote-delete-title">Delete this server profile?</div>
              <div class="remote-delete-text">
                <strong>{{ pendingDeleteRemoteProfile?.name || 'Selected profile' }}</strong> will be removed from AuroraPad.
                Saved keychain secret will also be deleted.
              </div>
            </div>
          </div>
        </v-card-text>
        <v-card-actions class="dialog-actions remote-delete-actions">
          <div class="remote-actions-right">
            <v-btn variant="tonal" class="remote-action-btn" @click="cancelDeleteRemoteProfile">Cancel</v-btn>
            <v-btn color="error" variant="flat" class="remote-action-btn" @click="confirmDeleteRemoteProfile">Remove</v-btn>
          </div>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="showPreferences" max-width="860">
      <v-card class="aurora-dialog">
        <v-toolbar color="transparent" density="comfortable">
          <v-toolbar-title>Preferences</v-toolbar-title>
          <v-spacer />
          <v-btn icon="mdi-close" variant="text" @click="showPreferences = false" />
        </v-toolbar>
        <v-card-text class="dialog-body">
          <v-row dense>
            <v-col cols="12" md="5">
              <div class="settings-group">
                <div class="settings-group-title">Appearance</div>
                <v-select
                  :model-value="settingsStore.theme"
                  :items="themeOptions"
                  label="Theme"
                  @update:model-value="settingsStore.setTheme"
                />
                <v-switch
                  :model-value="settingsStore.toolbarVisible"
                  label="Show Toolbar"
                  @update:model-value="settingsStore.setToolbarVisible"
                />
                <v-switch
                  :model-value="settingsStore.statusBarVisible"
                  label="Show Status Bar"
                  @update:model-value="settingsStore.setStatusBarVisible"
                />
                <v-text-field
                  :model-value="settingsStore.fontSize"
                  type="number"
                  min="8"
                  max="32"
                  label="Editor Font Size"
                  @update:model-value="settingsStore.setFontSize(Number($event) || 14)"
                />
              </div>
            </v-col>
            <v-col cols="12" md="7">
              <div class="settings-group">
                <div class="settings-group-title">Editor Behavior</div>
                <v-switch
                  :model-value="settingsStore.autoSave"
                  label="Auto Save Saved Files"
                  @update:model-value="settingsStore.setAutoSave"
                />
                <v-switch
                  :model-value="settingsStore.wordWrap"
                  label="Word Wrap"
                  @update:model-value="settingsStore.setWordWrap"
                />
                <v-switch
                  :model-value="settingsStore.lineNumbers"
                  label="Line Numbers"
                  @update:model-value="settingsStore.setLineNumbers"
                />
                <v-switch
                  :model-value="settingsStore.showWhitespace"
                  label="Show Whitespace and Tabs"
                  @update:model-value="settingsStore.setShowWhitespace"
                />
                <v-switch
                  :model-value="settingsStore.highlightCurrentLine"
                  label="Highlight Current Line"
                  @update:model-value="settingsStore.setHighlightCurrentLine"
                />
                <v-switch
                  :model-value="settingsStore.showMinimap"
                  label="Show Minimap"
                  @update:model-value="settingsStore.setShowMinimap"
                />
              </div>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions class="dialog-actions">
          <v-spacer />
          <v-btn color="primary" @click="showPreferences = false">Done</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <CommandPalette
      v-if="showCommandPalette"
      :recent-only="commandPaletteRecentOnly"
      @close="closeCommandPalette"
      @open-file="openFileByPath"
      @open-file-dialog="menuOpenFile"
      @new="menuNew"
      @run-command="runCommandPrompt"
      @toggle-terminal="handleMenu('menu:toggle-terminal')"
      @toggle-sidebar="handleMenu('menu:toggle-sidebar')"
      @preferences="openPreferences"
      @sort-tabs-name="tabsStore.sortTabsByName()"
      @sort-tabs-path="tabsStore.sortTabsByPath()"
      @sort-tabs-type="tabsStore.sortTabsByType()"
      @connect-server="openRemoteManager"
    />
    <FindInFiles
      :visible="showFindInFiles"
      :default-root="fileTreeStore.openFolderPath || ''"
      @close="showFindInFiles = false"
      @open-result="openFindInFilesResult"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useTabsStore } from './stores/tabs'
import { useSettingsStore } from './stores/settings'
import { usePluginsStore } from './stores/plugins'
import { useFileTreeStore } from './stores/fileTree'
import { createPluginApi } from './plugins/pluginApi'
import TabBar from './components/TabBar.vue'
import MonacoEditor from './components/MonacoEditor.vue'
import FileTree from './components/FileTree.vue'
import CommandPalette from './components/CommandPalette.vue'
import StatusBar from './components/StatusBar.vue'
import Toolbar from './components/Toolbar.vue'
import MenuBar from './components/MenuBar.vue'
import FindInFiles from './components/FindInFiles.vue'
import TerminalDock from './components/TerminalDock.vue'

const tabsStore = useTabsStore()
const settingsStore = useSettingsStore()
const pluginsStore = usePluginsStore()
const fileTreeStore = useFileTreeStore()
const monacoEditorRef = ref(null)
const monacoEditorSecondaryRef = ref(null)
const showCommandPalette = ref(false)
const commandPaletteRecentOnly = ref(false)
const showPluginManager = ref(false)
const showRemoteManager = ref(false)
const showDeleteRemoteProfileDialog = ref(false)
const showFindInFiles = ref(false)
const showTerminal = ref(false)
const terminalDockRef = ref(null)
const splitViewEnabled = ref(false)
const secondaryTabId = ref(null)
const lastRunCommand = ref('')
const platformInfo = ref(createFallbackPlatformInfo())
const keychainAvailable = ref(false)
const remoteProfiles = ref([])
const remoteProtocolOptions = [
  { title: 'SFTP (SSH)', value: 'sftp' },
  { title: 'FTP', value: 'ftp' },
  { title: 'FTPS', value: 'ftps' },
]
const remoteAuthOptions = [
  { title: 'Password', value: 'password' },
  { title: 'Private Key', value: 'privateKey' },
]
const remoteForm = ref(createRemoteProfileForm())
const pendingDeleteRemoteProfile = ref(null)
let autoSaveInterval = null

const primaryTab = computed(() => tabsStore.activeTab)
const secondaryTab = computed(() => {
  if (!secondaryTabId.value) return null
  return tabsStore.tabs.find(t => t.id === secondaryTabId.value) || null
})

const monacoTheme = computed(() => {
  switch (settingsStore.theme) {
    case 'dark':
      return 'vs-dark'
    case 'monokai':
      return 'aurora-monokai'
    case 'solarized-dark':
      return 'aurora-solarized-dark'
    default:
      return 'vs'
  }
})
const showPreferences = ref(false)
const themeOptions = [
  { title: 'Aurora Light', value: 'light' },
  { title: 'Aurora Dark', value: 'dark' },
  { title: 'Monokai Dark', value: 'monokai' },
  { title: 'Solarized Dark', value: 'solarized-dark' },
]

const isMacPlatform = computed(() => platformInfo.value.isMac)

function createRemoteProfileForm() {
  return {
    id: '',
    name: '',
    protocol: 'sftp',
    authType: 'password',
    host: '',
    port: 22,
    username: '',
    remoteRoot: '/',
    privateKeyPath: '',
    saveSecret: true,
    secretPassword: '',
    secretPassphrase: '',
  }
}

function createFallbackPlatformInfo() {
  const ua = navigator.userAgent.toLowerCase()
  const isWindows = ua.includes('win')
  const isMac = ua.includes('mac')
  const isLinux = !isWindows && !isMac

  return {
    platform: isWindows ? 'win32' : isMac ? 'darwin' : 'linux',
    isWindows,
    isMac,
    isLinux,
    revealInFolderLabel: isMac ? 'Finder' : isWindows ? 'Explorer' : 'File Manager',
    terminalAppLabel: isWindows ? 'Command Prompt' : 'Terminal',
    defaultShellProfile: 'default',
    terminalProfiles: [
      { id: 'default', label: isWindows ? 'Command Prompt' : 'Shell', available: true, accent: 'default' },
      ...(isWindows
        ? [
            { id: 'powershell', label: 'PowerShell', available: true, accent: 'powershell' },
            { id: 'bash', label: 'Git Bash', available: true, accent: 'bash' },
            { id: 'wsl', label: 'WSL', available: true, accent: 'wsl' },
          ]
        : []),
    ],
  }
}

const availableTerminalProfiles = computed(() =>
  (platformInfo.value.terminalProfiles || []).filter(profile => profile.available)
)

function isTerminalProfileAvailable(profileId) {
  return availableTerminalProfiles.value.some(profile => profile.id === profileId)
}

function openTerminalSession(shell = platformInfo.value.defaultShellProfile || 'default', cwd = '') {
  const nextShell = String(shell).startsWith('ssh:')
    ? shell
    : (isTerminalProfileAvailable(shell)
    ? shell
    : (platformInfo.value.defaultShellProfile || 'default'))
  showTerminal.value = true
  setTimeout(() => {
    terminalDockRef.value?.newSession?.(nextShell, cwd, {
      title: String(shell).startsWith('ssh:') ? 'SSH Session' : undefined,
    })
  }, 100)
}

function isRemoteTab(tab) {
  return !!tab?.remote?.connectionId
}

function makeRemoteUri(connectionId, remotePath) {
  const safePath = String(remotePath || '/').startsWith('/') ? remotePath : `/${remotePath || ''}`
  return `remote://${connectionId}${safePath}`
}

function parseRemoteUri(uri) {
  if (!String(uri || '').startsWith('remote://')) return null
  const raw = uri.replace('remote://', '')
  const slashIndex = raw.indexOf('/')
  if (slashIndex === -1) return null
  return {
    connectionId: raw.slice(0, slashIndex),
    remotePath: raw.slice(slashIndex) || '/',
  }
}

async function loadRemoteProfiles() {
  if (!window.electronAPI?.remoteListProfiles) return
  const result = await window.electronAPI.remoteListProfiles()
  if (result?.error) {
    alert(`Failed to load remote profiles: ${result.error}`)
    return
  }
  keychainAvailable.value = !!result?.keychainAvailable
  remoteProfiles.value = Array.isArray(result?.profiles) ? result.profiles : []
}

function resetRemoteForm() {
  remoteForm.value = createRemoteProfileForm()
}

function editRemoteProfile(profile) {
  remoteForm.value = {
    id: profile.id,
    name: profile.name || '',
    protocol: profile.protocol || 'sftp',
    authType: profile.authType || 'password',
    host: profile.host || '',
    port: profile.port || (profile.protocol === 'sftp' ? 22 : 21),
    username: profile.username || '',
    remoteRoot: profile.remoteRoot || '/',
    privateKeyPath: profile.privateKeyPath || '',
    saveSecret: keychainAvailable.value,
    secretPassword: '',
    secretPassphrase: '',
  }
}

async function saveRemoteProfile() {
  if (!window.electronAPI?.remoteSaveProfile) return
  const f = remoteForm.value
  if (!f.host || !f.username) {
    alert('Host and username are required.')
    return
  }

  const payload = {
    id: f.id || undefined,
    name: f.name || `${f.username}@${f.host}`,
    protocol: f.protocol,
    authType: f.protocol === 'sftp' ? f.authType : 'password',
    host: f.host.trim(),
    port: Number(f.port) || (f.protocol === 'sftp' ? 22 : 21),
    username: f.username.trim(),
    remoteRoot: f.remoteRoot || '/',
    privateKeyPath: f.privateKeyPath || '',
    saveSecret: !!f.saveSecret && keychainAvailable.value,
    clearSavedSecret: !f.saveSecret || !keychainAvailable.value,
    secret: {
      password: f.secretPassword || '',
      passphrase: f.secretPassphrase || '',
    },
  }

  const result = await window.electronAPI.remoteSaveProfile(payload)
  if (result?.error) {
    alert(`Failed to save profile: ${result.error}`)
    return
  }
  await loadRemoteProfiles()
  editRemoteProfile(result.profile)
}

function requestDeleteRemoteProfile(profile) {
  pendingDeleteRemoteProfile.value = profile
  showDeleteRemoteProfileDialog.value = true
}

function cancelDeleteRemoteProfile() {
  showDeleteRemoteProfileDialog.value = false
  pendingDeleteRemoteProfile.value = null
}

async function confirmDeleteRemoteProfile() {
  const profile = pendingDeleteRemoteProfile.value
  if (!profile || !window.electronAPI?.remoteDeleteProfile) return
  const result = await window.electronAPI.remoteDeleteProfile(profile.id)
  if (result?.error) {
    alert(`Failed to delete profile: ${result.error}`)
    return
  }
  cancelDeleteRemoteProfile()
  await loadRemoteProfiles()
  if (remoteForm.value.id === profile.id) resetRemoteForm()
}

async function connectRemoteProfile(profile) {
  if (!window.electronAPI?.remoteConnect) return
  let result = await window.electronAPI.remoteConnect(profile.id, {})
  if (result?.code === 'SECRET_REQUIRED') {
    const promptLabel = result.secretType === 'passphrase' ? 'passphrase' : 'password'
    const secretValue = prompt(`Enter ${promptLabel} for ${profile.name}:`, '')
    if (!secretValue) return
    const secretInput = result.secretType === 'passphrase'
      ? { passphrase: secretValue }
      : { password: secretValue, passphrase: secretValue }
    result = await window.electronAPI.remoteConnect(profile.id, secretInput)
  }
  if (result?.error) {
    alert(`Failed to connect: ${result.error}`)
    return
  }

  fileTreeStore.setRemoteWorkspace(result.connection)
  settingsStore.setSidebarVisible(true)
  showRemoteManager.value = false
}

async function disconnectRemoteWorkspace() {
  const connectionId = fileTreeStore.remoteConnection?.connectionId
  if (!connectionId) return
  if (window.electronAPI?.remoteDisconnect) {
    await window.electronAPI.remoteDisconnect(connectionId)
  }
  const remoteTabs = tabsStore.tabs.filter(tab => isRemoteTab(tab))
  remoteTabs.forEach(tab => tabsStore.closeTab(tab.id))
  fileTreeStore.clearRemoteWorkspace()
}

async function openRemoteManager(presetProtocol = '') {
  if (!window.electronAPI?.remoteListProfiles) {
    alert('Remote connections are only available in the AuroraPad desktop app.')
    return
  }
  showRemoteManager.value = true
  await loadRemoteProfiles()
  if (presetProtocol) {
    resetRemoteForm()
    remoteForm.value.protocol = presetProtocol
    remoteForm.value.port = presetProtocol === 'sftp' ? 22 : 21
    remoteForm.value.authType = presetProtocol === 'sftp' ? 'password' : 'password'
    remoteForm.value.saveSecret = keychainAvailable.value
    return
  }
  if (!remoteForm.value.id && remoteProfiles.value.length) {
    editRemoteProfile(remoteProfiles.value[0])
  }
}

async function openRemoteSshTerminal() {
  const connectionId = fileTreeStore.remoteConnection?.connectionId
  if (!connectionId) {
    alert('Connect to an SFTP server first, then open SSH terminal from Remote menu.')
    return
  }
  if (fileTreeStore.remoteConnection?.protocol !== 'sftp') {
    alert('SSH terminal is only available for SFTP/SSH connections.')
    return
  }
  if (!window.electronAPI?.remoteOpenSshTerminal) return
  const cwd = fileTreeStore.openFolderPath || '/'
  const result = await window.electronAPI.remoteOpenSshTerminal(connectionId, cwd)
  if (result?.error) {
    alert(`Unable to open SSH terminal: ${result.error}`)
    return
  }
  showTerminal.value = true
  setTimeout(() => {
    terminalDockRef.value?.newSession?.(result.shell, result.cwd || cwd, { title: result.title || 'SSH Session' })
  }, 100)
}

async function moveRemoteEntry(payload) {
  const connectionId = fileTreeStore.remoteConnection?.connectionId
  if (!connectionId || !window.electronAPI?.remoteMovePath) return
  const result = await window.electronAPI.remoteMovePath(connectionId, payload.fromPath, payload.toPath)
  if (result?.error) {
    alert(`Move failed: ${result.error}`)
    return
  }
  if (fileTreeStore.openFolderPath) {
    await fileTreeStore.loadTree(fileTreeStore.openFolderPath)
  }
}

// Notepad++ menu order: File, Edit, Search, View, Encoding, Language, Settings, Plugins, Window, Help
const topMenuPrimaryIds = ['file', 'remote', 'edit', 'search', 'terminal']

const menuBarMenus = computed(() => [
  {
    id: 'file',
    label: 'File',
    items: [
      { label: 'New', shortcut: isMacPlatform ? 'Cmd+N' : 'Ctrl+N', action: 'menu:new', icon: 'fa-solid fa-file' },
      { type: 'separator' },
      { label: 'Open...', shortcut: isMacPlatform ? 'Cmd+O' : 'Ctrl+O', action: 'menu:open-file', icon: 'fa-solid fa-folder-open' },
      { label: 'Open Folder...', shortcut: isMacPlatform ? 'Cmd+Shift+O' : 'Ctrl+Shift+O', action: 'menu:open-folder' },
      { type: 'separator' },
      { label: 'Save', shortcut: isMacPlatform ? 'Cmd+S' : 'Ctrl+S', action: 'menu:save', enabled: !!tabsStore.activeTab, icon: 'fa-solid fa-floppy-disk' },
      { label: 'Save All', shortcut: isMacPlatform ? 'Cmd+Shift+S' : 'Ctrl+Shift+S', action: 'menu:save-all', enabled: !!tabsStore.activeTab, icon: 'fa-solid fa-layer-group' },
      { label: 'Save As...', shortcut: 'F12', action: 'menu:save-as', enabled: !!tabsStore.activeTab },
      { label: 'Save a Copy As...', action: 'menu:save-copy-as', enabled: !!tabsStore.activeTab },
      { label: 'Rename...', action: 'menu:rename', enabled: !!tabsStore.activeTab },
      { type: 'separator' },
      { label: 'Close Tab', shortcut: isMacPlatform ? 'Cmd+W' : 'Ctrl+W', action: 'menu:close-tab', enabled: !!tabsStore.activeTab },
      { label: 'Close All', action: 'menu:close-all', enabled: tabsStore.tabs.length > 0 },
      { label: 'Close All But Active', action: 'menu:close-others', enabled: tabsStore.tabs.length > 1 },
      { label: 'Close All Unchanged', action: 'menu:close-all-unchanged', enabled: tabsStore.tabs.some(t => !t.isDirty) },
      { type: 'separator' },
      { label: 'Reload from Disk', action: 'menu:reload-from-disk', enabled: !!tabsStore.activeTab?.path },
      { type: 'separator' },
      { label: `Open Containing Folder in ${platformInfo.value.revealInFolderLabel}`, action: 'menu:open-containing-folder:explorer', enabled: !!tabsStore.activeTab?.path && !isRemoteTab(tabsStore.activeTab) },
      { label: `Open Containing Folder in ${platformInfo.value.terminalAppLabel}`, action: 'menu:open-containing-folder:cmd', enabled: !!tabsStore.activeTab?.path && !isRemoteTab(tabsStore.activeTab) },
      { label: 'Open Containing Folder as Workspace', action: 'menu:open-containing-folder:faw', enabled: !!tabsStore.activeTab?.path && !isRemoteTab(tabsStore.activeTab) },
      { label: 'Open in Default Viewer', action: 'menu:open-in-default-viewer', enabled: !!tabsStore.activeTab?.path && !isRemoteTab(tabsStore.activeTab) },
      { type: 'separator' },
      { label: 'Open Recent...', action: 'menu:open-recent-dialog', enabled: settingsStore.recentFiles.length > 0 },
      { label: 'Exit', shortcut: isMacPlatform ? 'Cmd+Q' : 'Alt+F4', action: 'menu:exit' },
    ],
  },
  {
    id: 'remote',
    label: 'Remote',
    items: [
      { label: 'Remote Manager...', action: 'menu:remote-manager' },
      { label: 'Connect Server...', action: 'menu:connect-server' },
      { label: 'Disconnect Server', action: 'menu:disconnect-server', enabled: fileTreeStore.workspaceMode === 'remote' },
      { label: 'Open SSH Terminal', action: 'menu:open-ssh-terminal', enabled: fileTreeStore.workspaceMode === 'remote' && fileTreeStore.remoteConnection?.protocol === 'sftp' },
      { type: 'separator' },
      { label: 'New SFTP Profile', action: 'menu:remote-new-sftp' },
      { label: 'New FTP Profile', action: 'menu:remote-new-ftp' },
      { label: 'New FTPS Profile', action: 'menu:remote-new-ftps' },
    ],
  },
  {
    id: 'edit',
    label: 'Edit',
    items: [
      { label: 'Undo', shortcut: isMacPlatform ? 'Cmd+Z' : 'Ctrl+Z', action: 'menu:undo', icon: 'fa-solid fa-rotate-left' },
      { label: 'Redo', shortcut: isMacPlatform ? 'Cmd+Y' : 'Ctrl+Y', action: 'menu:redo', icon: 'fa-solid fa-rotate-right' },
      { type: 'separator' },
      { label: 'Cut', shortcut: isMacPlatform ? 'Cmd+X' : 'Ctrl+X', action: 'menu:cut', icon: 'fa-solid fa-scissors' },
      { label: 'Copy', shortcut: isMacPlatform ? 'Cmd+C' : 'Ctrl+C', action: 'menu:copy', icon: 'fa-solid fa-copy' },
      { label: 'Paste', shortcut: isMacPlatform ? 'Cmd+V' : 'Ctrl+V', action: 'menu:paste', icon: 'fa-solid fa-clipboard' },
      { type: 'separator' },
      { label: 'Duplicate Line', shortcut: isMacPlatform ? 'Cmd+D' : 'Ctrl+D', action: 'menu:duplicate-line' },
      { label: 'Delete Line', shortcut: isMacPlatform ? 'Cmd+L' : 'Ctrl+L', action: 'menu:delete-line' },
      { label: 'Move Line Up', shortcut: isMacPlatform ? 'Cmd+Shift+Up' : 'Ctrl+Shift+Up', action: 'menu:move-line-up' },
      { label: 'Move Line Down', shortcut: isMacPlatform ? 'Cmd+Shift+Down' : 'Ctrl+Shift+Down', action: 'menu:move-line-down' },
      { label: 'Join Lines', shortcut: isMacPlatform ? 'Cmd+J' : 'Ctrl+J', action: 'menu:join-lines' },
      { type: 'separator' },
      { label: 'Toggle Comment', shortcut: isMacPlatform ? 'Cmd+Q' : 'Ctrl+Q', action: 'menu:toggle-comment' },
      { type: 'separator' },
      { label: 'Lowercase', shortcut: isMacPlatform ? 'Cmd+U' : 'Ctrl+U', action: 'menu:lowercase' },
      { label: 'UPPERCASE', shortcut: isMacPlatform ? 'Cmd+Shift+U' : 'Ctrl+Shift+U', action: 'menu:uppercase' },
      { type: 'separator' },
      { label: 'Find', shortcut: isMacPlatform ? 'Cmd+F' : 'Ctrl+F', action: 'menu:find', icon: 'fa-solid fa-magnifying-glass' },
      { label: 'Replace', shortcut: isMacPlatform ? 'Cmd+H' : 'Ctrl+H', action: 'menu:replace', icon: 'fa-solid fa-magnifying-glass-arrow-right' },
      { label: 'Go to Line...', shortcut: isMacPlatform ? 'Cmd+G' : 'Ctrl+G', action: 'menu:go-to-line', icon: 'fa-solid fa-arrow-down-1-9' },
      { type: 'separator' },
      { label: 'Toggle Bookmark', shortcut: isMacPlatform ? 'Cmd+F2' : 'Ctrl+F2', action: 'menu:toggle-bookmark' },
      { label: 'Next Bookmark', shortcut: 'F2', action: 'menu:next-bookmark' },
      { label: 'Previous Bookmark', shortcut: 'Shift+F2', action: 'menu:prev-bookmark' },
      { label: 'Clear All Bookmarks', action: 'menu:clear-bookmarks' },
      { type: 'separator' },
      { label: 'EOL Conversion', enabled: false },
      { label: 'Windows (CRLF)', action: 'menu:eol-crlf' },
      { label: 'Unix (LF)', action: 'menu:eol-lf' },
      { label: 'Old Mac (CR)', action: 'menu:eol-cr' },
      { type: 'separator' },
      { label: 'Sort Lines Ascending', action: 'menu:sort-lines-asc' },
      { label: 'Sort Lines Descending', action: 'menu:sort-lines-desc' },
      { label: 'Trim Trailing Whitespace', action: 'menu:trim-trailing-whitespace' },
      { type: 'separator' },
      { label: 'Add Cursor Above', action: 'menu:cursor-add-above' },
      { label: 'Add Cursor Below', action: 'menu:cursor-add-below' },
      { label: 'Select Next Match', action: 'menu:select-next-match' },
    ],
  },
  {
    id: 'search',
    label: 'Search',
    items: [
      { label: 'Find', shortcut: isMacPlatform ? 'Cmd+F' : 'Ctrl+F', action: 'menu:find' },
      { label: 'Replace', shortcut: isMacPlatform ? 'Cmd+H' : 'Ctrl+H', action: 'menu:replace' },
      { label: 'Find Next', shortcut: 'F3', action: 'menu:find-next' },
      { label: 'Find Previous', shortcut: 'Shift+F3', action: 'menu:find-prev' },
      { label: 'Go to Line...', shortcut: isMacPlatform ? 'Cmd+G' : 'Ctrl+G', action: 'menu:go-to-line' },
      { type: 'separator' },
      { label: 'Find in Files…', shortcut: isMacPlatform ? 'Cmd+Shift+F' : 'Ctrl+Shift+F', action: 'menu:find-in-files', enabled: fileTreeStore.workspaceMode !== 'remote' },
      { type: 'separator' },
      { label: 'Command Palette', shortcut: isMacPlatform ? 'Cmd+P' : 'Ctrl+P', action: 'menu:command-palette' },
    ],
  },
  {
    id: 'view',
    label: 'View',
    items: [
      { label: 'Word Wrap', action: 'menu:word-wrap-toggle' },
      { label: 'Line Numbers', action: 'menu:line-numbers-toggle' },
      { type: 'separator' },
      { label: 'Zoom In', shortcut: isMacPlatform ? 'Cmd+Plus' : 'Ctrl++', action: 'menu:zoom-in' },
      { label: 'Zoom Out', shortcut: isMacPlatform ? 'Cmd+-' : 'Ctrl+-', action: 'menu:zoom-out' },
      { label: 'Reset Zoom', shortcut: isMacPlatform ? 'Cmd+0' : 'Ctrl+0', action: 'menu:zoom-reset' },
      { type: 'separator' },
      { label: 'Toggle Sidebar', shortcut: isMacPlatform ? 'Cmd+B' : 'Ctrl+B', action: 'menu:toggle-sidebar' },
      { label: 'Toggle Toolbar', action: 'menu:toggle-toolbar' },
      { label: 'Toggle Status Bar', action: 'menu:toggle-status-bar' },
      { label: 'Dark Theme', action: 'menu:theme-toggle' },
      { type: 'separator' },
      { label: 'Toggle Minimap', action: 'menu:toggle-minimap' },
      { label: 'Toggle Split View', action: 'menu:toggle-split-view' },
      { type: 'separator' },
      { label: 'Fold All', action: 'menu:fold-all' },
      { label: 'Unfold All', action: 'menu:unfold-all' },
      { type: 'separator' },
      { label: 'Toggle Integrated Terminal', action: 'menu:toggle-terminal' },
    ],
  },
  {
    id: 'encoding',
    label: 'Encoding',
    items: [
      { label: 'UTF-8', action: 'menu:encoding:utf8' },
      { label: 'UTF-16 LE', action: 'menu:encoding:utf16le' },
      { label: 'UTF-16 BE', action: 'menu:encoding:utf16be' },
      { label: 'Latin1', action: 'menu:encoding:latin1' },
      { label: 'Windows-1252', action: 'menu:encoding:windows-1252' },
    ],
  },
  {
    id: 'language',
    label: 'Language',
    items: [
      { label: 'Normal', action: 'menu:language:plaintext' },
      { label: 'JavaScript', action: 'menu:language:javascript' },
      { label: 'TypeScript', action: 'menu:language:typescript' },
      { label: 'HTML', action: 'menu:language:html' },
      { label: 'CSS', action: 'menu:language:css' },
      { label: 'JSON', action: 'menu:language:json' },
      { label: 'Markdown', action: 'menu:language:markdown' },
      { label: 'Python', action: 'menu:language:python' },
      { label: 'XML', action: 'menu:language:xml' },
      { type: 'separator' },
      { label: 'C', action: 'menu:language:c' },
      { label: 'C++', action: 'menu:language:cpp' },
      { label: 'C#', action: 'menu:language:csharp' },
      { label: 'Java', action: 'menu:language:java' },
      { label: 'PHP', action: 'menu:language:php' },
      { label: 'Ruby', action: 'menu:language:ruby' },
      { label: 'Go', action: 'menu:language:go' },
      { label: 'Rust', action: 'menu:language:rust' },
      { label: 'SQL', action: 'menu:language:sql' },
      { label: 'Shell Script', action: 'menu:language:shell' },
      { label: 'YAML', action: 'menu:language:yaml' },
    ],
  },
  {
    id: 'settings',
    label: 'Settings',
    items: [
      { label: 'Preferences...', action: 'menu:preferences' },
    ],
  },
  {
    id: 'macro',
    label: 'Macro',
    items: [
      { label: 'Start Recording', enabled: false },
      { label: 'Stop Recording', enabled: false },
      { label: 'Playback', enabled: false },
      { type: 'separator' },
      { label: 'Save Current Recorded Macro', enabled: false },
      { label: 'Run a Macro Multiple Times', enabled: false },
    ],
  },
  {
    id: 'run',
    label: 'Run',
    items: [
      { label: 'Run...', action: 'menu:run-command' },
      { label: 'Run Last Command', action: 'menu:run-last-command', enabled: !!lastRunCommand.value },
    ],
  },
  {
    id: 'terminal',
    label: 'Terminal',
    items: [
      { label: 'Toggle Terminal Panel', action: 'menu:toggle-terminal' },
      { label: 'New Default Terminal', action: 'menu:terminal-new-default' },
      ...(isTerminalProfileAvailable('powershell') ? [{ label: 'New PowerShell Terminal', action: 'menu:terminal-new-powershell' }] : []),
      ...(isTerminalProfileAvailable('bash') ? [{ label: 'New Git Bash Terminal', action: 'menu:terminal-new-gitbash' }] : []),
      ...(isTerminalProfileAvailable('wsl') ? [{ label: 'New WSL Terminal', action: 'menu:terminal-new-wsl' }] : []),
      { label: 'Next Terminal', action: 'menu:terminal-next' },
      { label: 'Previous Terminal', action: 'menu:terminal-prev' },
    ],
  },
  {
    id: 'tools',
    label: 'Tools',
    items: [
      { label: 'MD5 of Document', action: 'menu:hash-md5' },
      { label: 'SHA-1 of Document', action: 'menu:hash-sha1' },
      { label: 'SHA-256 of Document', action: 'menu:hash-sha256' },
    ],
  },
  {
    id: 'plugins',
    label: 'Plugins',
    items: [
      { label: 'Plugin Manager', action: 'menu:plugin-manager' },
      ...(pluginsStore.plugins.length
        ? [
            { type: 'separator' },
            ...pluginsStore.plugins.flatMap(p => (p.menuItems || []).map(m => ({
              label: m.label,
              action: 'menu:plugin-run',
              pluginId: p.id,
              actionId: m.id,
            }))),
          ]
        : []),
    ],
  },
  {
    id: 'window',
    label: 'Window',
    items: [
      { label: 'Close Tab', shortcut: 'Ctrl+W', action: 'menu:close-tab', enabled: !!tabsStore.activeTab },
      { type: 'separator' },
      { label: 'Sort Tabs by Name', action: 'menu:sort-tabs-name', enabled: tabsStore.tabs.length > 1 },
      { label: 'Sort Tabs by Path', action: 'menu:sort-tabs-path', enabled: tabsStore.tabs.length > 1 },
      { label: 'Sort Tabs by Type', action: 'menu:sort-tabs-type', enabled: tabsStore.tabs.length > 1 },
      { type: 'separator' },
      { label: 'Move to Other View', action: 'menu:move-to-other-view', enabled: !!tabsStore.activeTab && splitViewEnabled.value },
      { label: 'Clone to Other View', action: 'menu:clone-to-other-view', enabled: !!tabsStore.activeTab && splitViewEnabled.value },
    ],
  },
  {
    id: 'help',
    label: 'Help',
    items: [
      { label: 'About', action: 'menu:about' },
    ],
  },
])

onMounted(async () => {
  if (window.electronAPI?.getPlatformInfo) {
    try {
      const result = await window.electronAPI.getPlatformInfo()
      if (result?.platform) {
        platformInfo.value = {
          ...createFallbackPlatformInfo(),
          ...result,
        }
      }
    } catch {}
  }
  settingsStore.loadRecentFilesFromMain()
  loadRemoteProfiles()
  setupMenuListeners()
  setupFolderWatcher()
  setupPlugins()
  setupKeyboardShortcuts()
  restoreSession()
  setupSessionPersistence()
  setupAutoSave()
})

function setupKeyboardShortcuts() {
  const isMac = platformInfo.value.isMac
  const keydown = (e) => {
    // Zoom shortcuts (CmdOrCtrl + Plus/Minus/0) - handle early as they are global
    if ((e.ctrlKey || e.metaKey) && (e.key === '=' || e.key === '+' || e.key === '-' || e.key === '0')) {
      e.preventDefault()
      if (e.key === '=' || e.key === '+') handleMenu('menu:zoom-in')
      else if (e.key === '-') handleMenu('menu:zoom-out')
      else if (e.key === '0') handleMenu('menu:zoom-reset')
      return
    }

    const target = e.target
    if (
      target &&
      (target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable ||
        target.closest?.('.monaco-editor'))
    ) {
      // Let focused text inputs/editors handle typing and shortcuts
      return
    }

    // Command/Ctrl modifier
    const mod = isMac ? e.metaKey : e.ctrlKey

    // Save As via F12 (matches menu hint)
    if (e.key === 'F12') {
      e.preventDefault()
      menuSaveAs()
      return
    }

    // Line move shortcuts (Ctrl+Shift+Up/Down or Alt+Shift+Up/Down on some systems, 
    // but the app uses Ctrl+Shift+Up/Down as standard. On Mac we'll keep it as Cmd+Shift or Ctrl+Shift)
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
      e.preventDefault()
      const action = e.key === 'ArrowUp' ? 'menu:move-line-up' : 'menu:move-line-down'
      handleMenu(action)
      return
    }

    // Find next / previous (F3 / Shift+F3)
    if (e.key === 'F3') {
      e.preventDefault()
      handleMenu(e.shiftKey ? 'menu:find-prev' : 'menu:find-next')
      return
    }

    // Bookmark shortcuts (F2, Shift+F2, Ctrl+F2) - handle even when focus in editor
    if (e.key === 'F2') {
      e.preventDefault()
      handleMenu(mod ? 'menu:toggle-bookmark' : (e.shiftKey ? 'menu:prev-bookmark' : 'menu:next-bookmark'))
      return
    }

    if (mod) {
      switch (e.key?.toLowerCase()) {
        case 'n':
          e.preventDefault()
          menuNew()
          break
        case 'o':
          e.preventDefault()
          if (!e.shiftKey) menuOpenFile()
          else menuOpenFolder()
          break
        case 's':
          e.preventDefault()
          if (e.shiftKey) menuSaveAll()
          else menuSave()
          break
        case 'w':
          e.preventDefault()
          menuCloseTab()
          break
        case 'z':
          e.preventDefault()
          handleMenu('menu:undo')
          break
        case 'y':
          e.preventDefault()
          handleMenu('menu:redo')
          break
        case 'x':
          e.preventDefault()
          handleMenu('menu:cut')
          break
        case 'c':
          e.preventDefault()
          handleMenu('menu:copy')
          break
        case 'v':
          e.preventDefault()
          handleMenu('menu:paste')
          break
        case 'd':
          e.preventDefault()
          handleMenu('menu:duplicate-line')
          break
        case 'l':
          e.preventDefault()
          handleMenu('menu:delete-line')
          break
        case 'j':
          e.preventDefault()
          handleMenu('menu:join-lines')
          break
        case 'u':
          e.preventDefault()
          handleMenu(e.shiftKey ? 'menu:uppercase' : 'menu:lowercase')
          break
        case 'q':
          e.preventDefault()
          handleMenu('menu:toggle-comment')
          break
        case 'f':
          e.preventDefault()
          if (e.shiftKey) handleMenu('menu:find-in-files')
          else handleMenu('menu:find')
          break
        case 'h':
          e.preventDefault()
          handleMenu('menu:replace')
          break
        case 'g':
          e.preventDefault()
          handleMenu('menu:go-to-line')
          break
        case 'p':
          e.preventDefault()
          showCommandPalette.value = true
          break
        case 'tab':
          // Ctrl+Tab / Ctrl+Shift+Tab: cycle through tabs like desktop editors
          e.preventDefault()
          cycleTab(e.shiftKey ? -1 : 1)
          break
        case 'b':
          e.preventDefault()
          settingsStore.setSidebarVisible(!settingsStore.sidebarVisible)
          break
        default:
          break
      }
    }
  }
  window.addEventListener('keydown', keydown)
  onBeforeUnmount(() => window.removeEventListener('keydown', keydown))
}

function cycleTab(direction) {
  const list = tabsStore.tabs
  if (!list.length) return
  const currentIndex = list.findIndex(t => t.id === tabsStore.activeTabId)
  const nextIndex = (currentIndex + direction + list.length) % list.length
  const next = list[nextIndex]
  if (next) tabsStore.setActive(next.id)
}

async function setupPlugins() {
  pluginsStore.loadBuiltInPlugins()
  await pluginsStore.loadUserPlugins()
  if (window.electronAPI?.sendPluginMenuStructure) {
    window.electronAPI.sendPluginMenuStructure(pluginsStore.getMenuStructureForMain())
  }
  if (window.electronAPI?.onMenuPluginRun) {
    window.electronAPI.onMenuPluginRun((payload) => {
      const api = createPluginApi(
        () => monacoEditorRef.value,
        () => tabsStore.activeTab,
        (id, text) => tabsStore.setContent(id, text)
      )
      pluginsStore.runAction(payload.pluginId, payload.actionId, api)
    })
  }
}

function setupFolderWatcher() {
  if (!window.electronAPI?.onFolderChanged) return
  window.electronAPI.onFolderChanged(async ({ root }) => {
    if (fileTreeStore.openFolderPath === root) {
      fileTreeStore.loadTree(root)
    }
  })
}

const SESSION_MAX_TABS = 30
let sessionSaveTimeout = null

async function restoreSession() {
  if (!window.electronAPI?.getSession) return
  const session = await window.electronAPI.getSession()
  if (!session?.tabs?.length) return

  if (session.workspaceMode === 'remote' && session.remoteConnection?.profileId) {
    const shouldReconnect = confirm('Reconnect to the previous remote server session?')
    if (shouldReconnect && window.electronAPI?.remoteConnect) {
      let connected = await window.electronAPI.remoteConnect(session.remoteConnection.profileId, {})
      if (connected?.code === 'SECRET_REQUIRED') {
        const secretValue = prompt('Enter password/passphrase to reconnect remote session:', '')
        if (secretValue) {
          connected = await window.electronAPI.remoteConnect(session.remoteConnection.profileId, {
            password: secretValue,
            passphrase: secretValue,
          })
        }
      }
      if (!connected?.error) {
        fileTreeStore.setRemoteWorkspace(connected.connection)
      }
    }
  } else if (session.openFolderPath) {
    fileTreeStore.setLocalWorkspace(session.openFolderPath)
    await window.electronAPI.watchFolder(session.openFolderPath).catch(() => {})
  }

  const tabs = session.tabs.slice(0, SESSION_MAX_TABS)
  let activeId = null

  for (let i = 0; i < tabs.length; i++) {
    const t = tabs[i]
    const opts = {
      encoding: t.encoding || 'utf8',
      eol: t.eol || 'crlf',
      language: t.language || 'plaintext',
      cursorPosition: t.cursorPosition || { line: 1, column: 1 },
      bookmarks: t.bookmarks || [],
      isDirty: false,
    }
    if (t.remote?.path && window.electronAPI?.remoteReadFile) {
      const connectionId = fileTreeStore.remoteConnection?.connectionId
      if (!connectionId) continue
      const result = await window.electronAPI.remoteReadFile(connectionId, t.remote.path, opts.encoding)
      if (result.error) continue
      opts.path = makeRemoteUri(connectionId, t.remote.path)
      opts.remote = {
        ...t.remote,
        connectionId,
        version: result.version || t.remote.version || null,
      }
      opts.content = result.content
      opts.encoding = result.encoding || opts.encoding
    } else if (t.path) {
      const result = await window.electronAPI.readFile(t.path, opts.encoding)
      if (result.error) continue
      opts.path = t.path
      opts.content = result.content
      opts.encoding = result.encoding || opts.encoding
    } else {
      opts.content = t.content ?? ''
      opts.name = t.name || 'Untitled'
      opts.isDirty = !!t.content
    }
    const id = tabsStore.addTab(opts)
    if (i === (session.activeIndex ?? 0)) activeId = id
  }

  if (activeId) tabsStore.setActive(activeId)

  const activeTab = tabsStore.activeTab
  if (activeTab?.cursorPosition) {
    setTimeout(() => {
      const ed = monacoEditorRef.value?.getEditor()
      if (ed && activeTab.cursorPosition) {
        ed.setPosition({
          lineNumber: activeTab.cursorPosition.line,
          column: activeTab.cursorPosition.column,
        })
      }
    }, 150)
  }
}

function saveSession() {
  if (!window.electronAPI?.setSession) return
  const tabs = tabsStore.tabs.slice(0, SESSION_MAX_TABS).map(t => ({
    path: t.path ?? null,
    remote: t.remote ? {
      profileId: t.remote.profileId || fileTreeStore.remoteConnection?.profileId || null,
      connectionId: t.remote.connectionId || null,
      path: t.remote.path || null,
      version: t.remote.version || null,
    } : null,
    name: t.name ?? null,
    content: t.path ? undefined : (t.content ?? ''),
    cursorPosition: {
      line: t.cursorPosition?.line ?? 1,
      column: t.cursorPosition?.column ?? 1,
    },
    bookmarks: Array.isArray(t.bookmarks) ? [...t.bookmarks] : [],
    encoding: t.encoding || 'utf8',
    eol: t.eol || 'crlf',
    language: t.language || 'plaintext',
  }))
  const activeIndex = Math.max(0, tabsStore.tabs.findIndex(t => t.id === tabsStore.activeTabId))
  window.electronAPI.setSession({
    tabs,
    activeIndex,
    workspaceMode: fileTreeStore.workspaceMode,
    remoteConnection: fileTreeStore.remoteConnection
      ? {
          profileId: fileTreeStore.remoteConnection.profileId,
          rootPath: fileTreeStore.remoteConnection.rootPath,
        }
      : null,
    openFolderPath: fileTreeStore.openFolderPath || null,
  })
}

function setupSessionPersistence() {
  if (!window.electronAPI?.setSession) return

  function scheduleSave() {
    if (sessionSaveTimeout) clearTimeout(sessionSaveTimeout)
    sessionSaveTimeout = setTimeout(saveSession, 500)
  }

  watch(() => [tabsStore.tabs.length, tabsStore.activeTabId], scheduleSave)
  watch(() => [fileTreeStore.openFolderPath, fileTreeStore.workspaceMode, fileTreeStore.remoteConnection?.connectionId], ([val]) => {
    // Automatically show the sidebar when a folder is opened
    if (val) {
      settingsStore.setSidebarVisible(true)
    }
    scheduleSave()
  })
  watch(() => tabsStore.tabs.map(t => ({
    id: t.id,
    path: t.path,
    remote: t.remote,
    name: t.name,
    content: t.path ? null : t.content,
    cursorPosition: t.cursorPosition,
    bookmarks: t.bookmarks,
    encoding: t.encoding,
    eol: t.eol,
    language: t.language,
    isDirty: t.isDirty,
  })), scheduleSave, { deep: true })
  window.addEventListener('beforeunload', () => saveSession())
}

function setupAutoSave() {
  if (autoSaveInterval) clearInterval(autoSaveInterval)
  autoSaveInterval = window.setInterval(async () => {
    if (!settingsStore.autoSave) return
    const dirtySavedTabs = tabsStore.tabs.filter(tab => tab.isDirty && tab.path)
    for (const tab of dirtySavedTabs) {
      const content = applyEol(tab.content, tab.eol || 'crlf')
      const result = isRemoteTab(tab)
        ? await window.electronAPI?.remoteWriteFile?.(
          tab.remote.connectionId,
          tab.remote.path,
          content,
          tab.encoding,
          tab.remote.version || null
        )
        : await window.electronAPI?.writeFile?.(tab.path, content, tab.encoding)
      if (!result?.error) {
        tabsStore.setDirty(tab.id, false)
        if (isRemoteTab(tab) && result.version) {
          tabsStore.updateTab(tab.id, {
            remote: {
              ...tab.remote,
              version: result.version,
            },
          })
        }
      }
    }
  }, 15000)

  onBeforeUnmount(() => {
    if (autoSaveInterval) {
      clearInterval(autoSaveInterval)
      autoSaveInterval = null
    }
  })
}

function getCommandWorkingDirectory() {
  if (fileTreeStore.workspaceMode === 'remote') {
    return undefined
  }
  if (tabsStore.activeTab?.path) {
    return tabsStore.activeTab.path.replace(/[\\/][^\\/]+$/, '')
  }
  if (fileTreeStore.openFolderPath) {
    return fileTreeStore.openFolderPath
  }
  return undefined
}

function setupMenuListeners() {
  if (!window.electronAPI?.onMenu) return
  
  // Dynamically register all actions from the menu structure
  const allActions = new Set()
  menuBarMenus.value.forEach(menu => {
    menu.items.forEach(item => {
      if (item.action) allActions.add(item.action)
      if (item.submenu) {
        item.submenu.forEach(sub => {
          if (sub.action) allActions.add(sub.action)
        })
      }
    })
  })

  // Add explicit IPC-only channels and variants
  const explicit = [
    'menu:new', 'menu:open-file', 'menu:open-folder', 'menu:connect-server', 'menu:disconnect-server', 'menu:open-ssh-terminal', 'menu:remote-manager', 'menu:remote-new-sftp', 'menu:remote-new-ftp', 'menu:remote-new-ftps', 'menu:save', 'menu:save-all', 'menu:save-as',
    'menu:close-tab', 'menu:close-all', 'menu:close-others', 'menu:close-all-unchanged',
    'menu:undo', 'menu:redo', 'menu:cut', 'menu:copy', 'menu:paste',
    'menu:find', 'menu:replace', 'menu:find-next', 'menu:find-prev', 'menu:go-to-line',
    'menu:word-wrap', 'menu:line-numbers', 'menu:toggle-sidebar', 'menu:toggle-toolbar', 'menu:toggle-status-bar', 'menu:theme',
    'menu:command-palette', 'menu:plugin-manager', 'menu:preferences', 'menu:about', 'menu:find-in-files',
    'menu:save-copy-as', 'menu:rename', 'menu:reload-from-disk',
    'menu:open-containing-folder:explorer', 'menu:open-containing-folder:cmd', 'menu:open-containing-folder:faw',
    'menu:open-in-default-viewer', 'menu:open-all-recent', 'menu:restore-recent', 'menu:clear-recent',
    'menu:toggle-terminal', 'menu:plugin-run',
    'menu:terminal-new-default', 'menu:terminal-new-powershell', 'menu:terminal-new-gitbash', 'menu:terminal-new-wsl',
    'menu:terminal-next', 'menu:terminal-prev',
    'menu:hash-md5', 'menu:hash-sha1', 'menu:hash-sha256',
    'menu:duplicate-line', 'menu:delete-line', 'menu:move-line-up', 'menu:move-line-down', 'menu:join-lines',
    'menu:toggle-comment', 'menu:lowercase', 'menu:uppercase', 'menu:toggle-minimap', 'menu:toggle-split-view',
    'menu:fold-all', 'menu:unfold-all', 'menu:move-to-other-view', 'menu:clone-to-other-view',
    'menu:sort-tabs-name', 'menu:sort-tabs-path', 'menu:sort-tabs-type',
    'menu:encoding:utf8', 'menu:encoding:utf16le', 'menu:encoding:utf16be', 'menu:encoding:latin1', 'menu:encoding:windows-1252',
    'menu:language:plaintext', 'menu:language:javascript', 'menu:language:typescript', 'menu:language:html', 'menu:language:css',
    'menu:language:json', 'menu:language:markdown', 'menu:language:python', 'menu:language:xml', 'menu:language:c',
    'menu:language:cpp', 'menu:language:csharp', 'menu:language:java', 'menu:language:php', 'menu:language:ruby',
    'menu:language:go', 'menu:language:rust', 'menu:language:sql', 'menu:language:shell', 'menu:language:yaml'
  ]
  explicit.forEach(a => allActions.add(a))
  
  allActions.forEach(channel => {
    window.electronAPI.onMenu(channel, (...args) => handleMenu(channel, ...args))
  })
}

function onMenuBarAction(action, item) {
  if (action === 'menu:plugin-run' && item?.pluginId != null && item?.actionId != null) {
    const api = createPluginApi(
      () => monacoEditorRef.value,
      () => tabsStore.activeTab,
      (id, text) => tabsStore.setContent(id, text)
    )
    pluginsStore.runAction(item.pluginId, item.actionId, api)
    return true
  }
  if (action.startsWith('menu:encoding:')) {
    const enc = action.replace('menu:encoding:', '')
    if (tabsStore.activeTab) tabsStore.updateTab(tabsStore.activeTabId, { encoding: enc })
    return true
  }
  if (action.startsWith('menu:language:')) {
    const lang = action.replace('menu:language:', '')
    if (tabsStore.activeTab) tabsStore.updateTab(tabsStore.activeTabId, { language: lang })
    return true
  }
  if (action === 'menu:word-wrap-toggle') {
    settingsStore.setWordWrap(!settingsStore.wordWrap)
    return true
  }
  if (action === 'menu:line-numbers-toggle') {
    settingsStore.setLineNumbers(!settingsStore.lineNumbers)
    return true
  }
  if (action === 'menu:toggle-minimap') {
    settingsStore.setShowMinimap(!settingsStore.showMinimap)
    return true
  }
  if (action === 'menu:toggle-toolbar') {
    settingsStore.setToolbarVisible(!settingsStore.toolbarVisible)
    return true
  }
  if (action === 'menu:toggle-status-bar') {
    settingsStore.setStatusBarVisible(!settingsStore.statusBarVisible)
    return true
  }
  if (action === 'menu:toggle-split-view') {
    splitViewEnabled.value = !splitViewEnabled.value
    return true
  }
  if (action === 'menu:fold-all') {
    monacoEditorRef.value?.getEditor()?.trigger('keyboard', 'editor.foldAll')
    monacoEditorSecondaryRef.value?.getEditor()?.trigger('keyboard', 'editor.foldAll')
    return true
  }
  if (action === 'menu:unfold-all') {
    monacoEditorRef.value?.getEditor()?.trigger('keyboard', 'editor.unfoldAll')
    monacoEditorSecondaryRef.value?.getEditor()?.trigger('keyboard', 'editor.unfoldAll')
    return true
  }
  if (action === 'menu:toggle-terminal') {
    showTerminal.value = !showTerminal.value
    return true
  }
  if (action === 'menu:terminal-new-default') {
    openTerminalSession('default')
    return true
  }
  if (action === 'menu:terminal-new-powershell') {
    openTerminalSession('powershell')
    return true
  }
  if (action === 'menu:terminal-new-gitbash') {
    openTerminalSession('bash')
    return true
  }
  if (action === 'menu:terminal-new-wsl') {
    openTerminalSession('wsl')
    return true
  }
  if (action === 'menu:terminal-next') {
    terminalDockRef.value?.nextSession?.()
    return true
  }
  if (action === 'menu:terminal-prev') {
    terminalDockRef.value?.prevSession?.()
    return true
  }
  if (action === 'menu:move-to-other-view') {
    if (tabsStore.activeTabId && splitViewEnabled.value) {
      secondaryTabId.value = tabsStore.activeTabId
    }
    return true
  }
  if (action === 'menu:clone-to-other-view') {
    if (tabsStore.activeTabId && splitViewEnabled.value) {
      secondaryTabId.value = tabsStore.activeTabId
    }
    return true
  }
  if (action === 'menu:hash-md5' || action === 'menu:hash-sha1' || action === 'menu:hash-sha256') {
    runHashTool(action)
    return true
  }
  if (action === 'menu:sort-tabs-name') {
    tabsStore.sortTabsByName()
    return true
  }
  if (action === 'menu:sort-tabs-path') {
    tabsStore.sortTabsByPath()
    return true
  }
  if (action === 'menu:sort-tabs-type') {
    tabsStore.sortTabsByType()
    return true
  }
  if (action === 'menu:run-command') {
    runCommandPrompt()
    return true
  }
  if (action === 'menu:run-last-command') {
    runLastCommand()
    return true
  }
  if (action === 'menu:theme-toggle') {
    const next = settingsStore.theme === 'dark' ? 'light' : 'dark'
    settingsStore.setTheme(next)
    return true
  }
  if (action === 'menu:preferences') {
    showPreferences.value = true
    return true
  }
  if (action === 'menu:exit') {
    if (window.electronAPI?.quit) window.electronAPI.quit()
    return true
  }
  if (action === 'menu:about') {
    alert('AuroraPad\nA modern, Notepad++-style editor for Windows, Mac, and Linux.\n\nBuilt with Electron, Vue 3, and the Monaco editor.\n\nHighlights:\n• Multi-tab editing with bookmarks\n• Integrated terminal (cross-platform)\n• Plugin system inspired by Notepad++\n• Status bar with encoding and EOL controls\n• Command palette and rich keyboard shortcuts')
    return true
  }
  return false
}

function menuCloseTab() {
  if (tabsStore.activeTab) {
    const id = tabsStore.activeTabId
    if (tabsStore.getTab(id)?.isDirty && !confirm('Unsaved changes. Close anyway?')) return
    tabsStore.closeTab(id)
  }
}

function menuCloseAll() {
  if (!tabsStore.tabs.length) return
  if (tabsStore.hasDirty && !confirm('There are unsaved changes. Close all tabs anyway?')) return
  tabsStore.closeAll()
}

function menuCloseOthers() {
  const id = tabsStore.activeTabId
  if (!id) return
  if (tabsStore.hasDirty && !confirm('There are unsaved changes in other tabs. Close them anyway?')) return
  tabsStore.closeOthers(id)
}

function menuCloseAllUnchanged() {
  if (!tabsStore.tabs.length) return
  if (!tabsStore.tabs.some(t => !t.isDirty)) return
  if (!confirm('Close all tabs that have no unsaved changes?')) return
  tabsStore.closeAllUnchanged()
}

function handleMenu(channel, ...args) {
  // Try to let onMenuBarAction handle it first for unified logic
  if (onMenuBarAction(channel, args[0])) return

  switch (channel) {
    case 'menu:new':
      menuNew()
      break
    case 'menu:open-file':
      menuOpenFile()
      break
    case 'menu:open-folder':
      menuOpenFolder()
      break
    case 'menu:connect-server':
      openRemoteManager()
      break
    case 'menu:remote-manager':
      openRemoteManager()
      break
    case 'menu:remote-new-sftp':
      openRemoteManager('sftp')
      break
    case 'menu:remote-new-ftp':
      openRemoteManager('ftp')
      break
    case 'menu:remote-new-ftps':
      openRemoteManager('ftps')
      break
    case 'menu:disconnect-server':
      disconnectRemoteWorkspace()
      break
    case 'menu:open-ssh-terminal':
      openRemoteSshTerminal()
      break
    case 'menu:save':
      menuSave()
      break
    case 'menu:save-all':
      menuSaveAll()
      break
    case 'menu:save-as':
      menuSaveAs()
      break
    case 'menu:save-copy-as':
      menuSaveCopyAs()
      break
    case 'menu:close-tab':
      if (tabsStore.activeTab) {
        const id = tabsStore.activeTabId
        if (tabsStore.getTab(id)?.isDirty && !confirm('Unsaved changes. Close anyway?')) return
        tabsStore.closeTab(id)
      }
      break
    case 'menu:close-all':
      menuCloseAll()
      break
    case 'menu:close-others':
      menuCloseOthers()
      break
    case 'menu:close-all-unchanged':
      menuCloseAllUnchanged()
      break
    case 'menu:undo':
      monacoEditorRef.value?.getEditor()?.trigger('keyboard', 'undo')
      break
    case 'menu:redo':
      monacoEditorRef.value?.getEditor()?.trigger('keyboard', 'redo')
      break
    case 'menu:cut':
      monacoEditorRef.value?.getEditor()?.trigger('keyboard', 'editor.action.clipboardCutAction')
      break
    case 'menu:copy':
      monacoEditorRef.value?.getEditor()?.trigger('keyboard', 'editor.action.clipboardCopyAction')
      break
    case 'menu:paste':
      monacoEditorRef.value?.getEditor()?.trigger('keyboard', 'editor.action.clipboardPasteAction')
      break
    case 'menu:find':
      setTimeout(() => monacoEditorRef.value?.getEditor()?.trigger('keyboard', 'actions.find'), 100)
      break
    case 'menu:replace':
      setTimeout(() => monacoEditorRef.value?.getEditor()?.trigger('keyboard', 'editor.action.startFindReplaceAction'), 100)
      break
    case 'menu:find-in-files':
      if (fileTreeStore.workspaceMode === 'remote') {
        alert('Find in Files is currently available for local workspaces only.')
        break
      }
      showFindInFiles.value = true
      break
    case 'menu:open-recent-dialog':
      commandPaletteRecentOnly.value = true
      showCommandPalette.value = true
      break
    case 'menu:go-to-line':
      monacoEditorRef.value?.getEditor()?.trigger('keyboard', 'editor.action.gotoLine')
      break
    case 'menu:toggle-bookmark': {
      const id = tabsStore.activeTabId
      if (id && monacoEditorRef.value) {
        const line = monacoEditorRef.value.getCurrentLine()
        if (line != null) tabsStore.toggleBookmark(id, line)
      }
      break
    }
    case 'menu:next-bookmark': {
      const id = tabsStore.activeTabId
      if (!id) break
      const bm = tabsStore.getBookmarks(id)
      const line = monacoEditorRef.value?.getCurrentLine() ?? 1
      const next = bm.find(l => l > line) ?? bm[0]
      if (next != null) {
        monacoEditorRef.value?.setPosition({ lineNumber: next, column: 1 })
        monacoEditorRef.value?.getEditor()?.revealLine(next)
      }
      break
    }
    case 'menu:prev-bookmark': {
      const id = tabsStore.activeTabId
      if (!id) break
      const bm = tabsStore.getBookmarks(id)
      const line = monacoEditorRef.value?.getCurrentLine() ?? 1
      const prev = [...bm].reverse().find(l => l < line) ?? bm[bm.length - 1]
      if (prev != null) {
        monacoEditorRef.value?.setPosition({ lineNumber: prev, column: 1 })
        monacoEditorRef.value?.getEditor()?.revealLine(prev)
      }
      break
    }
    case 'menu:clear-bookmarks':
      if (tabsStore.activeTabId) tabsStore.clearBookmarks(tabsStore.activeTabId)
      break
    case 'menu:duplicate-line':
      monacoEditorRef.value?.getEditor()?.trigger('keyboard', 'editor.action.copyLinesDownAction')
      break
    case 'menu:delete-line':
      monacoEditorRef.value?.getEditor()?.trigger('keyboard', 'editor.action.deleteLines')
      break
    case 'menu:move-line-up':
      monacoEditorRef.value?.getEditor()?.trigger('keyboard', 'editor.action.moveLinesUpAction')
      break
    case 'menu:move-line-down':
      monacoEditorRef.value?.getEditor()?.trigger('keyboard', 'editor.action.moveLinesDownAction')
      break
    case 'menu:join-lines':
      monacoEditorRef.value?.getEditor()?.trigger('keyboard', 'editor.action.joinLines')
      break
    case 'menu:lowercase':
      monacoEditorRef.value?.getEditor()?.trigger('keyboard', 'editor.action.transformToLowercase')
      break
    case 'menu:uppercase':
      monacoEditorRef.value?.getEditor()?.trigger('keyboard', 'editor.action.transformToUppercase')
      break
    case 'menu:toggle-comment':
      monacoEditorRef.value?.getEditor()?.trigger('keyboard', 'editor.action.commentLine')
      break
    case 'menu:eol-crlf':
      convertEol('crlf')
      break
    case 'menu:eol-lf':
      convertEol('lf')
      break
    case 'menu:eol-cr':
      convertEol('cr')
      break
    case 'menu:find-next':
      monacoEditorRef.value?.getEditor()?.trigger('keyboard', 'editor.action.nextMatchFindAction')
      break
    case 'menu:find-prev':
      monacoEditorRef.value?.getEditor()?.trigger('keyboard', 'editor.action.previousMatchFindAction')
      break
    case 'menu:sort-lines-asc':
      monacoEditorRef.value?.getEditor()?.trigger('keyboard', 'editor.action.sortLinesAscending')
      break
    case 'menu:sort-lines-desc':
      monacoEditorRef.value?.getEditor()?.trigger('keyboard', 'editor.action.sortLinesDescending')
      break
    case 'menu:trim-trailing-whitespace':
      monacoEditorRef.value?.getEditor()?.getAction('editor.action.trimTrailingWhitespace')?.run()
      break
    case 'menu:cursor-add-above':
      monacoEditorRef.value?.getEditor()?.trigger('keyboard', 'editor.action.insertCursorAbove')
      break
    case 'menu:cursor-add-below':
      monacoEditorRef.value?.getEditor()?.trigger('keyboard', 'editor.action.insertCursorBelow')
      break
    case 'menu:select-next-match':
      monacoEditorRef.value?.getEditor()?.trigger('keyboard', 'editor.action.addSelectionToNextFindMatch')
      break
    case 'menu:word-wrap':
      settingsStore.setWordWrap(args[0])
      break
    case 'menu:line-numbers':
      settingsStore.setLineNumbers(args[0])
      break
    case 'menu:zoom-in':
      settingsStore.setFontSize(settingsStore.fontSize + 1)
      break
    case 'menu:zoom-out':
      settingsStore.setFontSize(settingsStore.fontSize - 1)
      break
    case 'menu:zoom-reset':
      settingsStore.setFontSize(14)
      break
    case 'menu:toggle-sidebar':
      settingsStore.setSidebarVisible(!settingsStore.sidebarVisible)
      break
    case 'menu:theme':
      settingsStore.setTheme(args[0] || 'light')
      break
    case 'menu:command-palette':
      commandPaletteRecentOnly.value = false
      showCommandPalette.value = true
      break
    case 'menu:plugin-manager':
      showPluginManager.value = true
      break
    case 'menu:preferences':
      showPreferences.value = true
      break
    case 'menu:reload-from-disk':
      reloadFromDisk()
      break
    case 'menu:open-containing-folder:explorer':
      openContainingFolder('explorer')
      break
    case 'menu:open-containing-folder:cmd':
      openContainingFolder('cmd')
      break
    case 'menu:open-containing-folder:faw':
      openContainingFolder('faw')
      break
    case 'menu:open-in-default-viewer':
      openInDefaultViewer()
      break
    case 'menu:open-all-recent':
      openAllRecent()
      break
    case 'menu:restore-recent':
      restoreRecent()
      break
    case 'menu:clear-recent':
      clearRecent()
      break
    default:
      break
  }
}

function onEditorContentChange(which, value) {
  if (!value) value = ''
  if (which === 'secondary' && secondaryTab.value) {
    tabsStore.setContent(secondaryTab.value.id, value)
    return
  }
  if (primaryTab.value) {
    tabsStore.setContent(primaryTab.value.id, value)
  }
}

function onCursorChange(which, pos) {
  const target = which === 'secondary' ? secondaryTab.value : primaryTab.value
  if (target && pos) {
    tabsStore.updateTab(target.id, { cursorPosition: { line: pos.line, column: pos.column } })
  }
}

async function menuNew() {
  tabsStore.addTab({ content: '', name: 'Untitled' })
}

async function menuOpenFile() {
  // Electron desktop flow
  if (window.electronAPI) {
    const paths = await window.electronAPI.openFileDialog()
    if (paths?.length) {
      for (const p of paths) await openFileByPath(p)
    }
    return
  }

  // Browser/dev fallback so Open File works when running Vite only
  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    const input = document.createElement('input')
    input.type = 'file'
    input.multiple = true
    input.style.display = 'none'
    input.addEventListener('change', () => {
      const files = Array.from(input.files || [])
      files.forEach(file => {
        const reader = new FileReader()
        reader.onload = () => {
          tabsStore.addTab({
            content: reader.result || '',
            name: file.name,
            isDirty: false,
          })
        }
        reader.readAsText(file)
      })
      document.body.removeChild(input)
    })
    document.body.appendChild(input)
    input.click()
  }
}

async function menuOpenFolder() {
  if (!window.electronAPI) return
  if (fileTreeStore.workspaceMode === 'remote') {
    await disconnectRemoteWorkspace()
  }
  const path = await window.electronAPI.openFolderDialog()
  if (path) {
    fileTreeStore.setLocalWorkspace(path)
    await window.electronAPI.watchFolder(path)
  }
}

async function openFileByPath(filePath) {
  if (!window.electronAPI) return
  const uri = parseRemoteUri(filePath)
  const activeConnectionId = fileTreeStore.remoteConnection?.connectionId
  const shouldOpenRemote = !!uri
    || (fileTreeStore.workspaceMode === 'remote' && !!activeConnectionId && String(filePath || '').startsWith('/'))

  if (shouldOpenRemote) {
    const connectionId = uri?.connectionId || activeConnectionId
    const remotePath = uri?.remotePath || filePath
    if (!connectionId || !window.electronAPI?.remoteReadFile) {
      alert('Remote connection is not available for this file.')
      return
    }
    const result = await window.electronAPI.remoteReadFile(connectionId, remotePath)
    if (result.error) {
      if (result.binary) alert('Binary files cannot be opened as text.')
      else alert('Failed to read remote file: ' + result.error)
      return
    }
    tabsStore.addTab({
      path: makeRemoteUri(connectionId, remotePath),
      remote: {
        connectionId,
        profileId: fileTreeStore.remoteConnection?.profileId || null,
        path: remotePath,
        version: result.version || null,
      },
      name: remotePath.split('/').pop() || remotePath,
      content: result.content,
      encoding: result.encoding || 'utf8',
      language: tabsStore.inferLanguage?.(remotePath, result.content),
      isDirty: false,
    })
    return
  }

  const result = await window.electronAPI.readFile(filePath)
  if (result.error) {
    if (result.binary) alert('Binary files cannot be opened as text.')
    else alert('Failed to read file: ' + result.error)
    return
  }
  tabsStore.addTab({
    path: filePath,
    content: result.content,
    encoding: result.encoding || 'utf8',
    language: tabsStore.inferLanguage?.(filePath, result.content),
    isDirty: false,
  })
}

async function saveLocalTab(tab, { saveAs = false, copyOnly = false } = {}) {
  let path = tab.path
  if (!path || saveAs || copyOnly) {
    path = await window.electronAPI?.saveFileDialog(path, tab.name)
    if (!path) return { skipped: true }
  }
  const content = applyEol(tab.content, tab.eol || 'crlf')
  const result = await window.electronAPI.writeFile(path, content, tab.encoding)
  if (result.error) return result
  if (!copyOnly) {
    tabsStore.updateTab(tab.id, {
      path,
      name: path.split(/[/\\]/).pop(),
      language: tabsStore.inferLanguage?.(path, tab.content),
      isDirty: false,
    })
  }
  return { ok: true }
}

async function saveRemoteTab(tab, { saveAs = false, copyOnly = false } = {}) {
  const connectionId = tab.remote?.connectionId
  if (!connectionId || !window.electronAPI?.remoteWriteFile) {
    return { error: 'Remote connection is unavailable' }
  }

  let remotePath = tab.remote?.path
  if (!remotePath || saveAs || copyOnly) {
    remotePath = prompt('Remote destination path:', remotePath || '/')
    if (!remotePath) return { skipped: true }
  }

  const content = applyEol(tab.content, tab.eol || 'crlf')
  const expectedVersion = saveAs || copyOnly ? null : (tab.remote?.version || null)
  const result = await window.electronAPI.remoteWriteFile(
    connectionId,
    remotePath,
    content,
    tab.encoding,
    expectedVersion
  )

  if (result.error && result.code === 'VERSION_CONFLICT') {
    const overwrite = confirm('Remote file changed on server. Overwrite it?')
    if (!overwrite) return { error: 'Save canceled due to conflict' }
    const forceResult = await window.electronAPI.remoteWriteFile(connectionId, remotePath, content, tab.encoding, null)
    if (forceResult.error) return forceResult
    if (!copyOnly) {
      tabsStore.updateTab(tab.id, {
        path: makeRemoteUri(connectionId, remotePath),
        name: remotePath.split('/').pop() || remotePath,
        language: tabsStore.inferLanguage?.(remotePath, tab.content),
        isDirty: false,
        remote: {
          ...tab.remote,
          path: remotePath,
          version: forceResult.version || null,
        },
      })
    }
    return { ok: true }
  }

  if (result.error) return result

  if (!copyOnly) {
    tabsStore.updateTab(tab.id, {
      path: makeRemoteUri(connectionId, remotePath),
      name: remotePath.split('/').pop() || remotePath,
      language: tabsStore.inferLanguage?.(remotePath, tab.content),
      isDirty: false,
      remote: {
        ...tab.remote,
        path: remotePath,
        version: result.version || null,
      },
    })
  }
  return { ok: true }
}

async function menuSave() {
  const tab = tabsStore.activeTab
  if (!tab || !tab.isDirty) return
  const result = isRemoteTab(tab)
    ? await saveRemoteTab(tab)
    : await saveLocalTab(tab)
  if (result.error) {
    alert('Save failed: ' + result.error)
    return
  }
}

async function menuSaveAll() {
  const dirtyTabs = tabsStore.tabs.filter(t => t.isDirty)
  for (const tab of dirtyTabs) {
    const result = isRemoteTab(tab)
      ? await saveRemoteTab(tab)
      : await saveLocalTab(tab)
    if (result?.error) {
      alert(`Save failed for ${tab.name}: ${result.error}`)
    }
  }
}

function applyEol(text, eol) {
  const normalized = (text || '').replace(/\r\n|\r/g, '\n')
  if (eol === 'crlf') return normalized.replace(/\n/g, '\r\n')
  if (eol === 'cr') return normalized.replace(/\n/g, '\r')
  return normalized
}

function convertEol(eol) {
  const tab = tabsStore.activeTab
  if (!tab) return
  const converted = applyEol(tab.content, eol)
  tabsStore.updateTab(tab.id, { content: converted, eol })
  tabsStore.setDirty(tab.id, true)
}

async function openFindInFilesResult(result) {
  if (!result?.path) return
  await openFileByPath(result.path)
  const ed = monacoEditorRef.value?.getEditor()
  if (ed && result.line) {
    ed.setPosition({ lineNumber: result.line, column: result.column || 1 })
    ed.revealLineInCenter(result.line)
  }
  showFindInFiles.value = false
}

async function menuSaveAs() {
  const tab = tabsStore.activeTab
  if (!tab) return
  const result = isRemoteTab(tab)
    ? await saveRemoteTab(tab, { saveAs: true })
    : await saveLocalTab(tab, { saveAs: true })
  if (result.error) {
    alert('Save failed: ' + result.error)
  }
}

async function menuSaveCopyAs() {
  const tab = tabsStore.activeTab
  if (!tab) return
  const result = isRemoteTab(tab)
    ? await saveRemoteTab(tab, { copyOnly: true })
    : await saveLocalTab(tab, { copyOnly: true })
  if (result.error) {
    alert('Save failed: ' + result.error)
  }
}

async function reloadFromDisk() {
  const tab = tabsStore.activeTab
  if (!tab?.path) return
  if (tab.isDirty && !confirm('Reload from disk and lose unsaved changes?')) return
  const result = isRemoteTab(tab)
    ? await window.electronAPI.remoteReadFile(tab.remote.connectionId, tab.remote.path, tab.encoding || 'utf8')
    : await window.electronAPI.readFile(tab.path, tab.encoding || 'utf8')
  if (result.error) {
    alert('Failed to reload file: ' + result.error)
    return
  }
  tabsStore.updateTab(tab.id, {
    content: result.content,
    encoding: result.encoding || tab.encoding,
    isDirty: false,
    bookmarks: [],
    remote: isRemoteTab(tab)
      ? {
          ...tab.remote,
          version: result.version || tab.remote.version,
        }
      : tab.remote,
  })
}

async function openContainingFolder(kind) {
  const tab = tabsStore.activeTab
  if (!tab?.path) return
  if (isRemoteTab(tab)) {
    alert('Open Containing Folder is only available for local files.')
    return
  }
  const full = tab.path
  const dir = full.replace(/[\\/][^\\/]+$/, '')
  if (kind === 'faw') {
    fileTreeStore.setLocalWorkspace(dir)
    await window.electronAPI.watchFolder(dir)
    return
  }
  if (kind === 'explorer') {
    const result = await window.electronAPI.revealInFolder?.(full)
    if (result?.error) {
      alert(`Failed to reveal in ${platformInfo.value.revealInFolderLabel}: ${result.error}`)
    }
    return
  }
  if (kind === 'cmd') {
    openTerminalSession(platformInfo.value.defaultShellProfile || 'default', dir)
  }
}

async function openInDefaultViewer() {
  const tab = tabsStore.activeTab
  if (!tab?.path) return
  if (isRemoteTab(tab)) {
    alert('Open in Default Viewer is only available for local files.')
    return
  }
  const result = await window.electronAPI.openInDefaultViewer(tab.path)
  if (result?.error) {
    alert('Failed to open in default viewer: ' + result.error)
  }
}

async function openAllRecent() {
  const recent = settingsStore.recentFiles || []
  for (const p of recent) {
    await openFileByPath(p)
  }
}

async function restoreRecent() {
  const recent = settingsStore.recentFiles || []
  if (!recent.length) return
  await openFileByPath(recent[0])
}

function clearRecent() {
  settingsStore.clearRecentFiles()
}

function closeCommandPalette() {
  showCommandPalette.value = false
  commandPaletteRecentOnly.value = false
}

async function openPluginsFolder() {
  await window.electronAPI?.openPluginsFolder?.()
}

function openPreferences() {
  showPreferences.value = true
}

async function runHashTool(action) {
  const tab = tabsStore.activeTab
  if (!tab) return
  const text = tab.content || ''
  const algo = action === 'menu:hash-sha1' ? 'sha1' : action === 'menu:hash-sha256' ? 'sha256' : 'md5'
  const result = await window.electronAPI.getHash(algo, text)
  if (result?.error) {
    alert('Hash failed: ' + result.error)
    return
  }
  const label = algo.toUpperCase()
  alert(`${label} of current document:\n\n${result.value}`)
}

async function runCommandPrompt() {
  if (fileTreeStore.workspaceMode === 'remote') {
    alert('Run Command is only available for local workspace context.')
    return
  }
  const cmd = prompt('Run command (will execute on your machine):', lastRunCommand.value || '')
  if (!cmd) return
  lastRunCommand.value = cmd
  const result = await window.electronAPI.runCommand(cmd, getCommandWorkingDirectory())
  if (result?.error) {
    alert(`Command failed:\n${result.error}\n\nSTDOUT:\n${result.stdout || ''}\n\nSTDERR:\n${result.stderr || ''}`)
    return
  }
  alert(`Command completed.\n\nSTDOUT:\n${result.stdout || ''}\n\nSTDERR:\n${result.stderr || ''}`)
}

async function runLastCommand() {
  if (fileTreeStore.workspaceMode === 'remote') {
    alert('Run Command is only available for local workspace context.')
    return
  }
  if (!lastRunCommand.value) {
    alert('No previous command to run.')
    return
  }
  const result = await window.electronAPI.runCommand(lastRunCommand.value, getCommandWorkingDirectory())
  if (result?.error) {
    alert(`Command failed:\n${result.error}\n\nSTDOUT:\n${result.stdout || ''}\n\nSTDERR:\n${result.stderr || ''}`)
    return
  }
  alert(`Command completed.\n\nSTDOUT:\n${result.stdout || ''}\n\nSTDERR:\n${result.stderr || ''}`)
}
</script>
