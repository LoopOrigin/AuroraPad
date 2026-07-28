<template>
  <div class="search-panel">
    <div class="search-panel-header">SEARCH</div>

    <div class="search-inputs">
      <div class="search-input-wrap">
        <input
          ref="searchInputRef"
          v-model="query"
          type="text"
          class="search-input"
          placeholder="Search files..."
          @keydown.enter="runSearch"
        />
        <button v-if="query" type="button" class="search-clear" @click="clear">✕</button>
      </div>
      <input
        v-model="includePattern"
        type="text"
        class="search-input search-input-small"
        placeholder="Files to include (e.g. *.ts)"
      />
    </div>

    <div class="search-status">
      <span v-if="searching" class="search-searching">Searching…</span>
      <span v-else-if="results.length" class="search-count">{{ totalMatches }} results in {{ results.length }} files</span>
      <span v-else-if="searched && !results.length" class="search-no-results">No results found</span>
    </div>

    <div v-if="results.length" class="search-results">
      <div v-for="file in results" :key="file.path" class="search-file-group">
        <div class="search-file-header" @click="file.collapsed = !file.collapsed">
          <span class="search-file-chevron">{{ file.collapsed ? '▸' : '▾' }}</span>
          <span class="search-file-name">{{ file.name }}</span>
          <span class="search-file-count">{{ file.matches.length }}</span>
        </div>
        <template v-if="!file.collapsed">
          <div
            v-for="match in file.matches"
            :key="match.line"
            class="search-match-row"
            @click="$emit('open-result', { path: file.path, line: match.line, col: match.col })"
          >
            <span class="match-line">{{ match.line }}</span>
            <span class="match-text" v-html="highlightMatch(match.text, match.start, match.end)"></span>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

defineEmits(['open-result'])

const searchInputRef = ref(null)
const query = ref('')
const includePattern = ref('')
const results = ref([])
const searching = ref(false)
const searched = ref(false)

const totalMatches = computed(() => results.value.reduce((sum, f) => sum + f.matches.length, 0))

async function runSearch() {
  if (!query.value.trim()) return
  if (!window.electronAPI?.findInFiles) return
  searching.value = true
  searched.value = true
  results.value = []
  try {
    const root = window.__aurorapadRoot || ''
    const raw = await window.electronAPI.findInFiles({
      root,
      pattern: query.value,
      include: includePattern.value || '',
    })
    results.value = (raw || []).map(f => ({ ...f, collapsed: false }))
  } catch {}
  searching.value = false
}

function clear() {
  query.value = ''
  results.value = []
  searched.value = false
  searchInputRef.value?.focus()
}

function highlightMatch(text, start, end) {
  if (start == null || end == null) return escapeHtml(text)
  return (
    escapeHtml(text.slice(0, start)) +
    `<mark class="search-highlight">${escapeHtml(text.slice(start, end))}</mark>` +
    escapeHtml(text.slice(end))
  )
}

function escapeHtml(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
}
</script>

<style scoped>
.search-panel {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  height: 100%;
}

.search-panel-header {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--npp-text-dim, #6b7a99);
  padding: 10px 12px 6px;
  flex-shrink: 0;
}

.search-inputs {
  padding: 4px 8px 8px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex-shrink: 0;
}

.search-input-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.search-input {
  width: 100%;
  background: rgba(255,255,255,0.05);
  border: 1px solid var(--npp-border, #1c2233);
  border-radius: 5px;
  color: var(--npp-text, #cdd6f4);
  font-size: 12px;
  padding: 6px 28px 6px 8px;
  outline: none;
}
.search-input:focus { border-color: var(--npp-accent, #29d4f0); }
.search-input-small { padding: 5px 8px; }

.search-clear {
  position: absolute;
  right: 6px;
  background: transparent;
  border: none;
  color: var(--npp-text-dim, #6b7a99);
  font-size: 11px;
  cursor: pointer;
  padding: 2px 4px;
  border-radius: 3px;
}
.search-clear:hover { color: var(--npp-text, #cdd6f4); }

.search-status {
  padding: 2px 12px 6px;
  font-size: 11px;
  flex-shrink: 0;
}
.search-searching { color: var(--npp-text-dim, #6b7a99); }
.search-count { color: var(--npp-text-dim, #6b7a99); }
.search-no-results { color: var(--npp-text-dim, #6b7a99); }

.search-results {
  flex: 1;
  overflow-y: auto;
}

.search-file-group { margin-bottom: 2px; }

.search-file-header {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 5px 8px;
  cursor: pointer;
  font-size: 12px;
  color: var(--npp-text, #cdd6f4);
  font-weight: 500;
}
.search-file-header:hover { background: rgba(255,255,255,0.04); }
.search-file-chevron { font-size: 9px; color: var(--npp-text-dim, #6b7a99); }
.search-file-name { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.search-file-count {
  font-size: 10px;
  background: rgba(41,212,240,0.12);
  color: var(--npp-accent, #29d4f0);
  padding: 1px 5px;
  border-radius: 8px;
  font-weight: 700;
}

.search-match-row {
  display: flex;
  align-items: baseline;
  gap: 8px;
  padding: 2px 8px 2px 22px;
  cursor: pointer;
  font-size: 11px;
  font-family: monospace;
}
.search-match-row:hover { background: rgba(255,255,255,0.05); }

.match-line {
  color: var(--npp-text-dim, #6b7a99);
  min-width: 28px;
  text-align: right;
  flex-shrink: 0;
}

.match-text {
  color: var(--npp-text, #cdd6f4);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>

<style>
.search-highlight {
  background: rgba(41, 212, 240, 0.25);
  color: var(--npp-accent, #29d4f0);
  border-radius: 2px;
}
</style>
