<template>
  <Teleport to="body">
    <div v-if="modelValue" class="new-conn-backdrop" @click.self="$emit('update:modelValue', false)">
      <div class="new-conn-modal" role="dialog" aria-modal="true" @keydown.escape="$emit('update:modelValue', false)">
        <!-- Header -->
        <div class="new-conn-header">
          <div class="new-conn-icon">⬡</div>
          <div>
            <div class="new-conn-title">{{ editId ? 'Edit Connection' : 'New SSH Connection' }}</div>
            <div class="new-conn-subtitle">Configure server connection details</div>
          </div>
          <button type="button" class="new-conn-close" @click="$emit('update:modelValue', false)">✕</button>
        </div>

        <!-- Body -->
        <div class="new-conn-body">
          <div class="conn-field-group">
            <div class="conn-field">
              <label class="conn-label">Connection Name</label>
              <input v-model="form.name" type="text" class="conn-input" placeholder="Production Server" />
            </div>
          </div>

          <div class="conn-field-row">
            <div class="conn-field conn-field-grow">
              <label class="conn-label">Host / IP</label>
              <input v-model="form.host" type="text" class="conn-input" placeholder="example.com" />
            </div>
            <div class="conn-field conn-field-port">
              <label class="conn-label">Port</label>
              <input v-model.number="form.port" type="number" class="conn-input" placeholder="22" />
            </div>
          </div>

          <div class="conn-field">
            <label class="conn-label">Username</label>
            <input v-model="form.username" type="text" class="conn-input" placeholder="ubuntu" />
          </div>

          <div class="conn-field">
            <label class="conn-label">Protocol</label>
            <div class="segmented-control">
              <button v-for="p in protocols" :key="p.value" type="button"
                class="seg-btn" :class="{ active: form.protocol === p.value }"
                @click="form.protocol = p.value; adjustPort(p.value)">
                {{ p.label }}
              </button>
            </div>
          </div>

          <div v-if="form.protocol === 'sftp'" class="conn-field">
            <label class="conn-label">Authentication</label>
            <div class="segmented-control">
              <button type="button" class="seg-btn" :class="{ active: form.authType === 'password' }"
                @click="form.authType = 'password'">Password</button>
              <button type="button" class="seg-btn" :class="{ active: form.authType === 'privateKey' }"
                @click="form.authType = 'privateKey'">SSH Key</button>
            </div>
          </div>

          <div v-if="form.authType === 'password' || form.protocol !== 'sftp'" class="conn-field">
            <label class="conn-label">Password</label>
            <input v-model="form.secretPassword" type="password" class="conn-input" placeholder="Optional — enter to save" />
          </div>

          <div v-if="form.protocol === 'sftp' && form.authType === 'privateKey'" class="conn-field">
            <label class="conn-label">Private Key Path</label>
            <input v-model="form.privateKeyPath" type="text" class="conn-input" placeholder="~/.ssh/id_rsa" />
          </div>

          <div v-if="form.protocol === 'sftp' && form.authType === 'privateKey'" class="conn-field">
            <label class="conn-label">Passphrase</label>
            <input v-model="form.secretPassphrase" type="password" class="conn-input" placeholder="Optional" />
          </div>

          <div class="conn-field">
            <label class="conn-label">Remote Root</label>
            <input v-model="form.remoteRoot" type="text" class="conn-input" placeholder="/" />
          </div>

          <div class="conn-field">
            <label class="conn-label">Tags</label>
            <div class="tags-input-area">
              <span v-for="tag in form.tags" :key="tag" class="tag-chip">
                {{ tag }}
                <button type="button" class="tag-remove" @click="removeTag(tag)">×</button>
              </span>
              <input
                v-model="tagInput"
                type="text"
                class="tag-text-input"
                placeholder="Add tag…"
                @keydown.enter.prevent="addTag"
                @keydown.comma.prevent="addTag"
              />
            </div>
          </div>

          <div class="conn-field-row conn-save-secret">
            <label class="conn-label conn-inline-label">Save secret to OS keychain</label>
            <button type="button" class="toggle-btn" :class="{ on: form.saveSecret }"
              @click="form.saveSecret = !form.saveSecret">
              <span class="toggle-thumb"></span>
            </button>
          </div>

          <!-- Inline password prompt overlay (replaces window.prompt) -->
          <div v-if="showPasswordPrompt" class="conn-password-overlay">
            <div class="conn-password-prompt">
              <label class="conn-label">{{ passwordPromptLabel }}</label>
              <input
                ref="pwPromptRef"
                v-model="pendingSecret"
                type="password"
                class="conn-input"
                @keydown.enter="resolvePasswordPrompt"
              />
              <div class="conn-password-actions">
                <button type="button" class="conn-cancel-btn" @click="cancelPasswordPrompt">Cancel</button>
                <button type="button" class="conn-save-btn" @click="resolvePasswordPrompt">OK</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="new-conn-footer">
          <button type="button" class="conn-test-btn" :disabled="testing || saving" @click="testConnection">
            {{ testing ? 'Testing…' : 'Test Connection' }}
          </button>
          <div class="conn-footer-right">
            <button type="button" class="conn-cancel-btn" @click="$emit('update:modelValue', false)">Cancel</button>
            <button type="button" class="conn-save-only-btn" :disabled="saving" @click="saveOnly">
              <i v-if="saving" class="fa-solid fa-circle-notch fa-spin"></i>
              {{ saving ? 'Saving…' : 'Save' }}
            </button>
            <button type="button" class="conn-save-btn" :disabled="saving || testing" @click="saveAndConnect">
              <i class="fa-solid fa-plug"></i> Save & Connect
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  editProfile: { type: Object, default: null },
  keychainAvailable: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue', 'saved', 'connected'])

const protocols = [
  { label: 'SFTP', value: 'sftp' },
  { label: 'FTP', value: 'ftp' },
  { label: 'FTPS', value: 'ftps' },
]

function defaultForm() {
  return {
    id: '',
    name: '',
    host: '',
    port: 22,
    username: '',
    protocol: 'sftp',
    authType: 'password',
    privateKeyPath: '',
    remoteRoot: '/',
    saveSecret: true,
    secretPassword: '',
    secretPassphrase: '',
    tags: [],
  }
}

const form = ref(defaultForm())
const tagInput = ref('')
const testing = ref(false)
const saving = ref(false)
const editId = ref('')

// Inline password prompt
const showPasswordPrompt = ref(false)
const passwordPromptLabel = ref('')
const pendingSecret = ref('')
const pwPromptRef = ref(null)
let passwordPromptResolve = null

watch(() => props.editProfile, (profile) => {
  if (profile) {
    form.value = {
      id: profile.id || '',
      name: profile.name || '',
      host: profile.host || '',
      port: profile.port || 22,
      username: profile.username || '',
      protocol: profile.protocol || 'sftp',
      authType: profile.authType || 'password',
      privateKeyPath: profile.privateKeyPath || '',
      remoteRoot: profile.remoteRoot || '/',
      saveSecret: props.keychainAvailable,
      secretPassword: '',
      secretPassphrase: '',
      tags: profile.tags || [],
    }
    editId.value = profile.id || ''
  } else {
    form.value = defaultForm()
    form.value.saveSecret = props.keychainAvailable
    editId.value = ''
  }
}, { immediate: true })

function adjustPort(protocol) {
  if (protocol === 'sftp') form.value.port = 22
  else if (protocol === 'ftp' || protocol === 'ftps') form.value.port = 21
}

function addTag() {
  const t = tagInput.value.replace(/,/g, '').trim()
  if (t && !form.value.tags.includes(t)) form.value.tags.push(t)
  tagInput.value = ''
}

function removeTag(tag) {
  form.value.tags = form.value.tags.filter(t => t !== tag)
}

function buildPayload() {
  const f = form.value
  return {
    id: f.id || undefined,
    name: f.name || `${f.username}@${f.host}`,
    protocol: f.protocol,
    authType: f.protocol === 'sftp' ? f.authType : 'password',
    host: f.host.trim(),
    port: Number(f.port) || (f.protocol === 'sftp' ? 22 : 21),
    username: f.username.trim(),
    remoteRoot: f.remoteRoot || '/',
    privateKeyPath: f.privateKeyPath || '',
    saveSecret: !!f.saveSecret && props.keychainAvailable,
    clearSavedSecret: !f.saveSecret || !props.keychainAvailable,
    tags: f.tags || [],
    secret: { password: f.secretPassword || '', passphrase: f.secretPassphrase || '' },
  }
}

function promptForSecret(label) {
  return new Promise((resolve) => {
    passwordPromptLabel.value = label
    pendingSecret.value = ''
    showPasswordPrompt.value = true
    passwordPromptResolve = resolve
    nextTick(() => pwPromptRef.value?.focus())
  })
}

function resolvePasswordPrompt() {
  showPasswordPrompt.value = false
  if (passwordPromptResolve) passwordPromptResolve(pendingSecret.value)
  passwordPromptResolve = null
}

function cancelPasswordPrompt() {
  showPasswordPrompt.value = false
  if (passwordPromptResolve) passwordPromptResolve(null)
  passwordPromptResolve = null
}

async function testConnection() {
  if (!window.electronAPI?.remoteTestConnection || testing.value) return
  const payload = buildPayload()
  if (!payload.host || !payload.username) { alert('Host and username are required.'); return }
  testing.value = true
  try {
    let result = await window.electronAPI.remoteTestConnection(payload)
    if (result?.code === 'SECRET_REQUIRED') {
      const label = result.secretType === 'passphrase' ? 'Key passphrase' : 'Password'
      const secret = await promptForSecret(`Enter ${label} for ${payload.name}:`)
      if (!secret) return
      const secretObj = result.secretType === 'passphrase'
        ? { ...payload.secret, passphrase: secret }
        : { ...payload.secret, password: secret, passphrase: secret }
      result = await window.electronAPI.remoteTestConnection({ ...payload, secret: secretObj })
    }
    if (result?.error) { alert(`Connection test failed: ${result.error}`); return }
    alert(`Connection successful!\n\nProtocol: ${(result.protocol || '').toUpperCase()}\nHost: ${result.username}@${result.host}:${result.port}\nRemote root: ${result.rootPath || '/'}`)
  } finally {
    testing.value = false
  }
}

async function saveOnly() {
  if (!window.electronAPI?.remoteSaveProfile) return
  const payload = buildPayload()
  if (!payload.host || !payload.username) { alert('Host and username are required.'); return }
  saving.value = true
  try {
    const saved = await window.electronAPI.remoteSaveProfile(payload)
    if (saved?.error) { alert(`Save failed: ${saved.error}`); return }
    emit('saved', saved.profile)
    emit('update:modelValue', false)
  } finally {
    saving.value = false
  }
}

async function saveAndConnect() {
  if (!window.electronAPI?.remoteSaveProfile) return
  const payload = buildPayload()
  if (!payload.host || !payload.username) { alert('Host and username are required.'); return }
  saving.value = true
  try {
    const saved = await window.electronAPI.remoteSaveProfile(payload)
    if (saved?.error) { alert(`Save failed: ${saved.error}`); return }

    emit('saved', saved.profile)

    if (!window.electronAPI?.remoteConnect) return
    let result = await window.electronAPI.remoteConnect(saved.profile.id, {})
    if (result?.code === 'SECRET_REQUIRED') {
      saving.value = false
      const label = result.secretType === 'passphrase' ? 'Key passphrase' : 'Password'
      const secret = await promptForSecret(`Enter ${label} for ${payload.name}:`)
      if (!secret) return
      saving.value = true
      const secretObj = result.secretType === 'passphrase'
        ? { passphrase: secret }
        : { password: secret, passphrase: secret }
      result = await window.electronAPI.remoteConnect(saved.profile.id, secretObj)
    }
    if (result?.error) { alert(`Connect failed: ${result.error}`); return }

    emit('connected', result)
    emit('update:modelValue', false)
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.new-conn-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.6);
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.1s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.new-conn-modal {
  width: 520px;
  max-height: 90vh;
  background: var(--npp-sidebar, #111520);
  border: 1px solid var(--npp-border, #1c2233);
  border-radius: 10px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.6);
  display: flex;
  flex-direction: column;
  animation: fadeInScale 0.15s ease-out;
  overflow: hidden;
}

@keyframes fadeInScale {
  from { opacity: 0; transform: scale(0.96); }
  to { opacity: 1; transform: scale(1); }
}

.new-conn-header {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 20px 20px 16px;
  border-bottom: 1px solid var(--npp-border, #1c2233);
  flex-shrink: 0;
}

.new-conn-icon {
  width: 36px;
  height: 36px;
  background: rgba(41,212,240,0.12);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: var(--npp-accent, #29d4f0);
  flex-shrink: 0;
}

.new-conn-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--npp-text, #cdd6f4);
  margin-bottom: 2px;
}

.new-conn-subtitle {
  font-size: 12px;
  color: var(--npp-text-dim, #6b7a99);
}

.new-conn-close {
  margin-left: auto;
  background: transparent;
  border: none;
  color: var(--npp-text-dim, #6b7a99);
  font-size: 16px;
  cursor: pointer;
  padding: 4px 6px;
  border-radius: 4px;
}
.new-conn-close:hover { background: rgba(255,255,255,0.08); color: var(--npp-text, #cdd6f4); }

.new-conn-body {
  padding: 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 14px;
  flex: 1;
  position: relative;
}

.conn-field { display: flex; flex-direction: column; gap: 5px; }
.conn-field-group { display: flex; flex-direction: column; gap: 14px; }
.conn-field-row { display: flex; gap: 12px; }
.conn-field-grow { flex: 1; }
.conn-field-port { width: 80px; flex-shrink: 0; }

.conn-label {
  font-size: 11px;
  font-weight: 600;
  color: var(--npp-text-dim, #6b7a99);
  letter-spacing: 0.04em;
}

.conn-input {
  background: rgba(255,255,255,0.05);
  border: 1px solid var(--npp-border, #1c2233);
  border-radius: 6px;
  color: var(--npp-text, #cdd6f4);
  font-size: 13px;
  padding: 7px 10px;
  outline: none;
  width: 100%;
  box-sizing: border-box;
}
.conn-input:focus { border-color: var(--npp-accent, #29d4f0); }

.segmented-control {
  display: flex;
  border: 1px solid var(--npp-border, #1c2233);
  border-radius: 6px;
  overflow: hidden;
}

.seg-btn {
  flex: 1;
  background: transparent;
  border: none;
  border-right: 1px solid var(--npp-border, #1c2233);
  color: var(--npp-text-dim, #6b7a99);
  font-size: 12px;
  font-weight: 500;
  padding: 6px 12px;
  cursor: pointer;
}
.seg-btn:last-child { border-right: none; }
.seg-btn.active { background: rgba(41,212,240,0.12); color: var(--npp-accent, #29d4f0); }

.tags-input-area {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  align-items: center;
  background: rgba(255,255,255,0.05);
  border: 1px solid var(--npp-border, #1c2233);
  border-radius: 6px;
  padding: 5px 8px;
  min-height: 36px;
}
.tags-input-area:focus-within { border-color: var(--npp-accent, #29d4f0); }

.tag-chip {
  display: flex;
  align-items: center;
  gap: 4px;
  background: rgba(41,212,240,0.1);
  color: var(--npp-accent, #29d4f0);
  font-size: 11px;
  padding: 2px 7px;
  border-radius: 4px;
}

.tag-remove {
  background: transparent; border: none; color: inherit; cursor: pointer;
  font-size: 13px; padding: 0; line-height: 1;
}

.tag-text-input {
  background: transparent; border: none; outline: none;
  color: var(--npp-text, #cdd6f4); font-size: 12px;
  min-width: 80px; flex: 1;
}

.conn-save-secret {
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
}

.conn-inline-label { margin: 0; }

.toggle-btn {
  width: 36px; height: 20px; border-radius: 10px;
  background: var(--npp-border, #1c2233); border: none; cursor: pointer;
  position: relative; transition: background 0.15s; flex-shrink: 0;
}
.toggle-btn.on { background: var(--npp-accent, #29d4f0); }
.toggle-thumb {
  position: absolute; top: 2px; left: 2px; width: 16px; height: 16px;
  border-radius: 50%; background: white; transition: transform 0.15s;
}
.toggle-btn.on .toggle-thumb { transform: translateX(16px); }

.conn-password-overlay {
  position: absolute;
  inset: 0;
  background: rgba(9, 11, 15, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0;
  z-index: 10;
}

.conn-password-prompt {
  background: var(--npp-sidebar, #111520);
  border: 1px solid var(--npp-border, #1c2233);
  border-radius: 8px;
  padding: 20px;
  width: 320px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.conn-password-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.new-conn-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  border-top: 1px solid var(--npp-border, #1c2233);
  flex-shrink: 0;
}

.conn-footer-right { display: flex; gap: 8px; }

.conn-test-btn {
  background: transparent;
  border: 1px solid var(--npp-border, #1c2233);
  border-radius: 6px;
  color: var(--npp-text, #cdd6f4);
  font-size: 12px;
  padding: 7px 14px;
  cursor: pointer;
}
.conn-test-btn:hover { background: rgba(255,255,255,0.07); }
.conn-test-btn:disabled { opacity: 0.5; cursor: not-allowed; }

.conn-cancel-btn {
  background: transparent;
  border: 1px solid var(--npp-border, #1c2233);
  border-radius: 6px;
  color: var(--npp-text, #cdd6f4);
  font-size: 12px;
  padding: 7px 14px;
  cursor: pointer;
}
.conn-cancel-btn:hover { background: rgba(255,255,255,0.07); }

.conn-save-only-btn {
  background: rgba(255,255,255,0.08);
  color: var(--npp-text, #cdd6f4);
  border: 1px solid var(--npp-border, #1c2233);
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  padding: 7px 16px;
  cursor: pointer;
  display: flex; align-items: center; gap: 6px;
}
.conn-save-only-btn:hover { background: rgba(255,255,255,0.13); }
.conn-save-only-btn:disabled { opacity: 0.5; pointer-events: none; }

.conn-save-btn {
  background: var(--npp-accent, #29d4f0);
  color: #090b0f;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  padding: 7px 16px;
  cursor: pointer;
  display: flex; align-items: center; gap: 6px;
}
.conn-save-btn:hover:not(:disabled) { filter: brightness(1.1); }
.conn-save-btn:disabled { opacity: 0.5; pointer-events: none; }
</style>
