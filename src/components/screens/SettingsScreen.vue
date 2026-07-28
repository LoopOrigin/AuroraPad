<template>
  <div class="settings-screen">
    <nav class="settings-nav">
      <div class="settings-nav-title">Settings</div>
      <button
        v-for="item in navItems"
        :key="item.id"
        type="button"
        class="settings-nav-item"
        :class="{ active: activeSection === item.id, dim: item.dim }"
        @click="activeSection = item.id"
      >
        <span class="nav-icon">{{ item.icon }}</span>
        {{ item.label }}
      </button>
    </nav>

    <div class="settings-content">

      <!-- EDITOR -->
      <template v-if="activeSection === 'editor'">
        <h2 class="settings-section-title">Editor</h2>

        <div class="setting-row">
          <div class="setting-info">
            <label class="setting-label">Font Size</label>
            <span class="setting-desc">Editor font size in pixels</span>
          </div>
          <div class="setting-control">
            <input
              type="range" min="10" max="24" step="1"
              :value="settingsStore.fontSize"
              class="setting-slider"
              @input="settingsStore.setFontSize(Number($event.target.value))"
            />
            <span class="setting-value">{{ settingsStore.fontSize }}px</span>
          </div>
        </div>

        <div class="setting-row">
          <div class="setting-info">
            <label class="setting-label">Tab Size</label>
            <span class="setting-desc">Number of spaces per tab</span>
          </div>
          <div class="setting-control">
            <div class="pill-group">
              <button v-for="n in [2, 4, 8]" :key="n" type="button"
                class="pill" :class="{ active: settingsStore.tabSize === n }"
                @click="settingsStore.setTabSize(n)">{{ n }}</button>
            </div>
          </div>
        </div>

        <div class="setting-row">
          <div class="setting-info">
            <label class="setting-label">Word Wrap</label>
            <span class="setting-desc">Wrap long lines in the editor</span>
          </div>
          <div class="setting-control">
            <button type="button" class="toggle-btn" :class="{ on: settingsStore.wordWrap }"
              @click="settingsStore.setWordWrap(!settingsStore.wordWrap)">
              <span class="toggle-thumb"></span>
            </button>
          </div>
        </div>

        <div class="setting-row">
          <div class="setting-info">
            <label class="setting-label">Auto Save</label>
            <span class="setting-desc">Automatically save files on change</span>
          </div>
          <div class="setting-control">
            <button type="button" class="toggle-btn" :class="{ on: settingsStore.autoSave }"
              @click="settingsStore.setAutoSave(!settingsStore.autoSave)">
              <span class="toggle-thumb"></span>
            </button>
          </div>
        </div>

        <div class="setting-row">
          <div class="setting-info">
            <label class="setting-label">Format on Save</label>
            <span class="setting-desc">Auto-format document when saving</span>
          </div>
          <div class="setting-control">
            <button type="button" class="toggle-btn" :class="{ on: settingsStore.formatOnSave }"
              @click="settingsStore.setFormatOnSave(!settingsStore.formatOnSave)">
              <span class="toggle-thumb"></span>
            </button>
          </div>
        </div>

        <div class="setting-row">
          <div class="setting-info">
            <label class="setting-label">Bracket Pair Colorization</label>
            <span class="setting-desc">Color matching brackets differently</span>
          </div>
          <div class="setting-control">
            <button type="button" class="toggle-btn" :class="{ on: settingsStore.bracketPairColorization }"
              @click="settingsStore.setBracketPairColorization(!settingsStore.bracketPairColorization)">
              <span class="toggle-thumb"></span>
            </button>
          </div>
        </div>

        <div class="setting-row">
          <div class="setting-info">
            <label class="setting-label">Minimap</label>
            <span class="setting-desc">Show code minimap on the right</span>
          </div>
          <div class="setting-control">
            <button type="button" class="toggle-btn" :class="{ on: settingsStore.showMinimap }"
              @click="settingsStore.setShowMinimap(!settingsStore.showMinimap)">
              <span class="toggle-thumb"></span>
            </button>
          </div>
        </div>

        <div class="setting-row">
          <div class="setting-info">
            <label class="setting-label">Line Numbers</label>
            <span class="setting-desc">Show line numbers in the gutter</span>
          </div>
          <div class="setting-control">
            <button type="button" class="toggle-btn" :class="{ on: settingsStore.lineNumbers }"
              @click="settingsStore.setLineNumbers(!settingsStore.lineNumbers)">
              <span class="toggle-thumb"></span>
            </button>
          </div>
        </div>
      </template>

      <!-- APPEARANCE -->
      <template v-else-if="activeSection === 'appearance'">
        <h2 class="settings-section-title">Appearance</h2>

        <div class="setting-row">
          <div class="setting-info">
            <label class="setting-label">Color Theme</label>
            <span class="setting-desc">Editor color scheme</span>
          </div>
          <div class="setting-control">
            <div class="pill-group pill-group-wrap">
              <button v-for="t in themes" :key="t.value" type="button"
                class="pill pill-theme" :class="{ active: settingsStore.theme === t.value }"
                @click="settingsStore.setTheme(t.value)">
                <span class="theme-swatch" :style="{ background: t.color }"></span>
                {{ t.title }}
              </button>
            </div>
          </div>
        </div>

        <div class="setting-row">
          <div class="setting-info">
            <label class="setting-label">UI Density</label>
            <span class="setting-desc">Compact or spacious layout</span>
          </div>
          <div class="setting-control">
            <div class="pill-group">
              <button v-for="d in ['compact', 'comfortable', 'spacious']" :key="d" type="button"
                class="pill" :class="{ active: settingsStore.uiDensity === d }"
                @click="settingsStore.setUiDensity(d)">
                {{ d.charAt(0).toUpperCase() + d.slice(1) }}
              </button>
            </div>
          </div>
        </div>

        <div class="setting-row">
          <div class="setting-info">
            <label class="setting-label">Show Status Bar</label>
            <span class="setting-desc">Show the bottom status bar</span>
          </div>
          <div class="setting-control">
            <button type="button" class="toggle-btn" :class="{ on: settingsStore.statusBarVisible }"
              @click="settingsStore.setStatusBarVisible(!settingsStore.statusBarVisible)">
              <span class="toggle-thumb"></span>
            </button>
          </div>
        </div>

        <div class="setting-row">
          <div class="setting-info">
            <label class="setting-label">Activity Bar Labels</label>
            <span class="setting-desc">Show text labels in the activity bar</span>
          </div>
          <div class="setting-control">
            <button type="button" class="toggle-btn" :class="{ on: settingsStore.showActivityBarLabels }"
              @click="settingsStore.setShowActivityBarLabels(!settingsStore.showActivityBarLabels)">
              <span class="toggle-thumb"></span>
            </button>
          </div>
        </div>

        <div class="setting-row">
          <div class="setting-info">
            <label class="setting-label">Toolbar</label>
            <span class="setting-desc">Show the toolbar below the menu bar</span>
          </div>
          <div class="setting-control">
            <button type="button" class="toggle-btn" :class="{ on: settingsStore.toolbarVisible }"
              @click="settingsStore.setToolbarVisible(!settingsStore.toolbarVisible)">
              <span class="toggle-thumb"></span>
            </button>
          </div>
        </div>
      </template>

      <!-- TERMINAL -->
      <template v-else-if="activeSection === 'terminal'">
        <h2 class="settings-section-title">Terminal</h2>

        <div class="setting-row">
          <div class="setting-info">
            <label class="setting-label">Default Shell</label>
            <span class="setting-desc">Shell profile to use for new terminals</span>
          </div>
          <div class="setting-control">
            <select class="setting-select" :value="settingsStore.defaultShell"
              @change="settingsStore.setDefaultShell($event.target.value)">
              <option value="default">System Default</option>
              <option value="bash">Bash</option>
              <option value="zsh">Zsh</option>
              <option value="powershell">PowerShell</option>
              <option value="fish">Fish</option>
            </select>
          </div>
        </div>

        <div class="setting-row">
          <div class="setting-info">
            <label class="setting-label">Scrollback Buffer</label>
            <span class="setting-desc">Keep terminal history on scroll</span>
          </div>
          <div class="setting-control">
            <button type="button" class="toggle-btn" :class="{ on: settingsStore.scrollbackBuffer }"
              @click="settingsStore.setScrollbackBuffer(!settingsStore.scrollbackBuffer)">
              <span class="toggle-thumb"></span>
            </button>
          </div>
        </div>
      </template>

      <!-- CONNECTIONS -->
      <template v-else-if="activeSection === 'connections'">
        <h2 class="settings-section-title">Connections</h2>
        <p class="settings-desc-text">SSH key configuration and connection defaults. Manage your SSH profiles in the <button type="button" class="link-btn" @click="$emit('go-connections')">SSH Connections</button> screen.</p>

        <div class="setting-row">
          <div class="setting-info">
            <label class="setting-label">SSH Keys</label>
            <span class="setting-desc">Keys configured for authentication</span>
          </div>
        </div>
        <div class="ssh-keys-table">
          <div class="ssh-keys-empty">No SSH keys configured. Add a key to use key-based authentication.</div>
        </div>
        <button type="button" class="settings-action-btn">+ Add SSH Key</button>
      </template>

      <!-- KEYBINDINGS -->
      <template v-else-if="activeSection === 'keybindings'">
        <h2 class="settings-section-title">Keybindings</h2>
        <div class="keybindings-table">
          <div class="keybindings-header">
            <span>Command</span>
            <span>Keybinding</span>
          </div>
          <div v-for="kb in keybindings" :key="kb.command" class="keybindings-row">
            <span class="kb-command">{{ kb.command }}</span>
            <kbd class="kb-key">{{ kb.key }}</kbd>
          </div>
        </div>
      </template>

    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useSettingsStore } from '../../stores/settings'

defineEmits(['go-connections'])

const settingsStore = useSettingsStore()
const activeSection = ref('editor')

const navItems = [
  { id: 'editor', label: 'Editor', icon: '✏️' },
  { id: 'appearance', label: 'Appearance', icon: '🎨' },
  { id: 'terminal', label: 'Terminal', icon: '⬛' },
  { id: 'connections', label: 'Connections', icon: '🔗' },
  { id: 'keybindings', label: 'Keybindings', icon: '⌨️' },
]

const themes = [
  { title: 'Light', value: 'light', color: '#f5f5f5' },
  { title: 'Dark', value: 'dark', color: '#1e1e1e' },
  { title: 'Ocean', value: 'material-ocean', color: '#090b0f' },
  { title: 'Monokai', value: 'monokai', color: '#272822' },
  { title: 'Solarized', value: 'solarized-dark', color: '#002b36' },
]

const keybindings = [
  { command: 'New File', key: 'Ctrl+N' },
  { command: 'Open File', key: 'Ctrl+O' },
  { command: 'Save', key: 'Ctrl+S' },
  { command: 'Save All', key: 'Ctrl+Shift+S' },
  { command: 'Close Tab', key: 'Ctrl+W' },
  { command: 'Command Palette', key: 'Ctrl+P' },
  { command: 'Find', key: 'Ctrl+F' },
  { command: 'Replace', key: 'Ctrl+H' },
  { command: 'Find in Files', key: 'Ctrl+Shift+F' },
  { command: 'Toggle Sidebar', key: 'Ctrl+B' },
  { command: 'Toggle Terminal', key: 'Ctrl+`' },
  { command: 'Undo', key: 'Ctrl+Z' },
  { command: 'Redo', key: 'Ctrl+Y' },
  { command: 'Go to Line', key: 'Ctrl+G' },
  { command: 'Toggle Comment', key: 'Ctrl+Q' },
]
</script>

<style scoped>
.settings-screen {
  flex: 1;
  display: flex;
  overflow: hidden;
  background: var(--npp-bg, #090b0f);
  color: var(--npp-text, #cdd6f4);
}

.settings-nav {
  width: 196px;
  flex-shrink: 0;
  border-right: 1px solid var(--npp-border, #1c2233);
  padding: 24px 0;
  overflow-y: auto;
}

.settings-nav-title {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--npp-text-dim, #6b7a99);
  padding: 0 16px 12px;
}

.settings-nav-item {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 8px 16px;
  background: transparent;
  border: none;
  color: var(--npp-text, #cdd6f4);
  font-size: 13px;
  cursor: pointer;
  text-align: left;
  border-radius: 0;
}

.settings-nav-item:hover { background: rgba(255,255,255,0.05); }
.settings-nav-item.active {
  background: rgba(41, 212, 240, 0.1);
  color: var(--npp-accent, #29d4f0);
}
.settings-nav-item.dim { opacity: 0.45; }

.nav-icon { font-size: 14px; }

.settings-content {
  flex: 1;
  max-width: 640px;
  overflow-y: auto;
  padding: 28px 36px;
}

.settings-section-title {
  margin: 0 0 24px;
  font-size: 16px;
  font-weight: 600;
  color: var(--npp-text, #cdd6f4);
}

.setting-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 0;
  border-bottom: 1px solid var(--npp-border, #1c2233);
  gap: 24px;
}

.setting-info { flex: 1; }
.setting-label {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: var(--npp-text, #cdd6f4);
  margin-bottom: 2px;
}
.setting-desc {
  display: block;
  font-size: 11px;
  color: var(--npp-text-dim, #6b7a99);
}
.settings-desc-text {
  font-size: 13px;
  color: var(--npp-text-dim, #6b7a99);
  margin: 0 0 20px;
  line-height: 1.5;
}
.link-btn {
  background: none; border: none; color: var(--npp-accent, #29d4f0);
  cursor: pointer; font-size: inherit; padding: 0; text-decoration: underline;
}

.setting-control { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }
.setting-slider { width: 100px; }
.setting-value { font-size: 12px; color: var(--npp-text-dim, #6b7a99); min-width: 32px; }

.setting-select {
  background: var(--npp-sidebar, #111520);
  border: 1px solid var(--npp-border, #1c2233);
  border-radius: 6px;
  color: var(--npp-text, #cdd6f4);
  font-size: 12px;
  padding: 5px 10px;
  outline: none;
}

.toggle-btn {
  width: 36px;
  height: 20px;
  border-radius: 10px;
  background: var(--npp-border, #1c2233);
  border: none;
  cursor: pointer;
  position: relative;
  transition: background 0.15s;
}
.toggle-btn.on { background: var(--npp-accent, #29d4f0); }
.toggle-thumb {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: white;
  transition: transform 0.15s;
}
.toggle-btn.on .toggle-thumb { transform: translateX(16px); }

.pill-group {
  display: flex;
  border: 1px solid var(--npp-border, #1c2233);
  border-radius: 6px;
  overflow: hidden;
}
.pill-group-wrap { flex-wrap: wrap; border: none; gap: 6px; }
.pill {
  background: transparent;
  border: none;
  color: var(--npp-text-dim, #6b7a99);
  font-size: 12px;
  padding: 5px 12px;
  cursor: pointer;
  border-right: 1px solid var(--npp-border, #1c2233);
}
.pill:last-child { border-right: none; }
.pill.active { background: rgba(41,212,240,0.12); color: var(--npp-accent, #29d4f0); }
.pill-theme {
  display: flex;
  align-items: center;
  gap: 6px;
  border: 1px solid var(--npp-border, #1c2233) !important;
  border-radius: 6px !important;
  padding: 5px 12px;
}
.theme-swatch { width: 12px; height: 12px; border-radius: 3px; border: 1px solid rgba(255,255,255,0.1); }

.ssh-keys-table { background: var(--npp-sidebar, #111520); border: 1px solid var(--npp-border, #1c2233); border-radius: 6px; padding: 12px; margin: 12px 0; }
.ssh-keys-empty { font-size: 12px; color: var(--npp-text-dim, #6b7a99); text-align: center; padding: 12px 0; }
.settings-action-btn {
  background: rgba(255,255,255,0.07); border: 1px solid var(--npp-border, #1c2233);
  border-radius: 6px; color: var(--npp-text, #cdd6f4); font-size: 12px;
  padding: 7px 14px; cursor: pointer;
}
.settings-action-btn:hover { background: rgba(255,255,255,0.12); }

.keybindings-table { border: 1px solid var(--npp-border, #1c2233); border-radius: 6px; overflow: hidden; }
.keybindings-header {
  display: grid;
  grid-template-columns: 1fr auto;
  padding: 8px 16px;
  background: var(--npp-sidebar, #111520);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--npp-text-dim, #6b7a99);
  border-bottom: 1px solid var(--npp-border, #1c2233);
}
.keybindings-row {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  padding: 8px 16px;
  border-bottom: 1px solid var(--npp-border, #1c2233);
  font-size: 13px;
}
.keybindings-row:last-child { border-bottom: none; }
.kb-command { color: var(--npp-text, #cdd6f4); }
.kb-key {
  font-size: 11px;
  padding: 2px 6px;
  background: rgba(255,255,255,0.06);
  border: 1px solid var(--npp-border, #1c2233);
  border-radius: 4px;
  color: var(--npp-text-dim, #6b7a99);
  font-family: monospace;
}
</style>
