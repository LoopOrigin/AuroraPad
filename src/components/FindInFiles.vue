<template>
  <div v-if="visible" class="plugin-manager-overlay" @click.self="close">
    <div class="plugin-manager preferences-panel find-in-files-panel">
      <h2>Find in Files</h2>
      <div class="plugin-manager-list preferences-body">
        <div class="preferences-section">
          <div class="plugin-manager-item">
            <div class="preferences-item-main">
              <span class="preferences-label">Find what</span>
            </div>
            <input
              ref="patternInputRef"
              v-model="pattern"
              type="text"
              placeholder="Text or regex to search for"
              @keydown.enter.prevent="search"
            />
          </div>
          <div class="plugin-manager-item">
            <div class="preferences-item-main">
              <span class="preferences-label">Replace with</span>
            </div>
            <input
              v-model="replaceWith"
              type="text"
              placeholder="Replacement text"
            />
          </div>
          <div class="plugin-manager-item">
            <div class="preferences-item-main">
              <span class="preferences-label">Filters</span>
              <span class="preferences-hint">Semicolon-separated masks, e.g. *.js;*.ts;*.vue</span>
            </div>
            <input
              v-model="mask"
              type="text"
              placeholder="*.*"
            />
          </div>
          <div class="plugin-manager-item">
            <div class="preferences-item-main">
              <span class="preferences-label">Directory</span>
              <span class="preferences-hint">Root folder to search</span>
            </div>
            <div class="find-in-files-dir">
              <input
                v-model="root"
                type="text"
                placeholder="Select folder…"
              />
              <button type="button" @click="browse">Browse…</button>
            </div>
          </div>
          <div class="plugin-manager-item">
            <label class="find-in-files-flag">
              <input v-model="matchCase" type="checkbox" />
              Match case
            </label>
            <label class="find-in-files-flag">
              <input v-model="useRegex" type="checkbox" />
              Regular expression
            </label>
          </div>
        </div>
        <div class="preferences-section">
          <div class="preferences-section-title">Results</div>
          <div class="find-in-files-results">
            <div v-if="isSearching" class="find-in-files-status">
              Searching…
            </div>
            <div v-else-if="!results.length" class="find-in-files-status">
              No results yet. Enter a search and press “Find All”.
            </div>
            <div
              v-else
              v-for="(r, idx) in results"
              :key="idx"
              class="find-in-files-result"
              :title="r.path"
              @click="open(r)"
            >
              <div class="find-in-files-result-main">
                <span class="find-in-files-result-file">
                  {{ fileName(r.path) }}
                </span>
                <span class="find-in-files-result-location">
                  ({{ r.line }} : {{ r.column }})
                </span>
              </div>
              <div class="find-in-files-result-path">
                {{ r.path }}
              </div>
              <div class="find-in-files-result-preview">
                {{ r.preview }}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="preferences-footer find-in-files-footer">
        <span class="find-in-files-count">
          {{ statusText }}
        </span>
        <div>
          <button type="button" @click="search" :disabled="!pattern || !root || isSearching">
            Find All
          </button>
          <button
            type="button"
            @click="replaceInFiles"
            :disabled="!pattern || !root || isSearching"
          >
            Replace in Files
          </button>
          <button type="button" @click="close">
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'

const props = defineProps({
  visible: { type: Boolean, default: false },
  defaultRoot: { type: String, default: '' },
})

const emit = defineEmits(['close', 'open-result'])

const pattern = ref('')
const root = ref('')
const mask = ref('*.*')
const matchCase = ref(false)
const useRegex = ref(false)
const results = ref([])
const isSearching = ref(false)
const patternInputRef = ref(null)
const replaceWith = ref('')
const statusText = ref('')

watch(
  () => props.visible,
  (v) => {
    if (v) {
      root.value = root.value || props.defaultRoot || ''
      setTimeout(() => patternInputRef.value?.focus(), 40)
    }
  }
)

onMounted(() => {
  if (props.defaultRoot) root.value = props.defaultRoot
})

function close() {
  emit('close')
}

async function browse() {
  const dir = await window.electronAPI?.openFolderDialog?.()
  if (dir) root.value = dir
}

async function search() {
  if (!pattern.value || !root.value || !window.electronAPI?.findInFiles) return
  isSearching.value = true
  results.value = []
  statusText.value = ''
  try {
    const res = await window.electronAPI.findInFiles({
      root: root.value,
      pattern: pattern.value,
      mask: mask.value,
      useRegex: useRegex.value,
      matchCase: matchCase.value,
    })
    results.value = Array.isArray(res) ? res : []
    if (results.value.length) {
      statusText.value = `${results.value.length} matches`
    } else {
      statusText.value = 'No matches found'
    }
  } finally {
    isSearching.value = false
  }
}

async function replaceInFiles() {
  if (!pattern.value || !root.value || !window.electronAPI?.replaceInFiles) return
  isSearching.value = true
  statusText.value = 'Replacing…'
  try {
    const res = await window.electronAPI.replaceInFiles({
      root: root.value,
      pattern: pattern.value,
      replaceWith: replaceWith.value,
      mask: mask.value,
      useRegex: useRegex.value,
      matchCase: matchCase.value,
    })
    const fileCount = Array.isArray(res?.files) ? res.files.length : 0
    const total = res?.totalReplacements ?? 0
    statusText.value = total
      ? `Replaced ${total} occurrence${total === 1 ? '' : 's'} in ${fileCount} file${fileCount === 1 ? '' : 's'}`
      : 'No occurrences replaced'
  } finally {
    isSearching.value = false
  }
}

function open(result) {
  emit('open-result', result)
}

function fileName(p) {
  const parts = p.split(/[/\\]/)
  return parts[parts.length - 1] || p
}
</script>

