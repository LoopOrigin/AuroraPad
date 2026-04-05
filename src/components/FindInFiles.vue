<template>
  <v-dialog :model-value="visible" max-width="980" @update:model-value="!$event && close()">
    <v-card class="aurora-dialog">
      <v-toolbar color="transparent" density="comfortable">
        <v-toolbar-title>Find in Files</v-toolbar-title>
        <v-spacer />
        <v-btn icon="mdi-close" variant="text" @click="close" />
      </v-toolbar>
      <v-card-text class="dialog-body">
        <v-row dense>
          <v-col cols="12" md="5">
            <div class="settings-group">
              <div class="settings-group-title">Search Setup</div>
              <v-text-field
                ref="patternInputRef"
                v-model="pattern"
                label="Find what"
                placeholder="Text or regex to search for"
                @keydown.enter.prevent="search"
              />
              <v-text-field
                v-model="replaceWith"
                label="Replace with"
                placeholder="Replacement text"
              />
              <v-text-field
                v-model="mask"
                label="Filters"
                placeholder="*.*"
                hint="Semicolon-separated masks, e.g. *.js;*.ts;*.vue"
                persistent-hint
              />
              <div class="find-root-row">
                <v-text-field
                  v-model="root"
                  class="flex-grow-1"
                  label="Directory"
                  placeholder="Select folder…"
                />
                <v-btn variant="tonal" color="secondary" prepend-icon="mdi-folder-open-outline" @click="browse">
                  Browse
                </v-btn>
              </div>
              <v-switch v-model="matchCase" label="Match case" />
              <v-switch v-model="useRegex" label="Regular expression" />
            </div>
          </v-col>
          <v-col cols="12" md="7">
            <div class="settings-group">
              <div class="settings-group-title">Results</div>
              <div class="find-results-surface">
                <div v-if="isSearching" class="find-in-files-status">Searching…</div>
                <div v-else-if="!results.length" class="find-in-files-status">No results yet. Enter a search and press Find All.</div>
                <v-list v-else class="dialog-list" bg-color="transparent">
                  <v-list-item
                    v-for="(r, idx) in results"
                    :key="idx"
                    class="dialog-list-item find-result-item"
                    :title="r.path"
                    @click="open(r)"
                  >
                    <v-list-item-title>
                      {{ fileName(r.path) }}
                      <span class="find-in-files-result-location">({{ r.line }} : {{ r.column }})</span>
                    </v-list-item-title>
                    <v-list-item-subtitle>
                      {{ r.path }}
                    </v-list-item-subtitle>
                    <template #append>
                      <span class="find-preview">{{ r.preview }}</span>
                    </template>
                  </v-list-item>
                </v-list>
              </div>
            </div>
          </v-col>
        </v-row>
      </v-card-text>
      <v-card-actions class="dialog-actions">
        <span class="find-in-files-count">{{ statusText }}</span>
        <v-spacer />
        <v-btn color="secondary" variant="tonal" :disabled="!pattern || !root || isSearching" @click="search">
          Find All
        </v-btn>
        <v-btn color="primary" :disabled="!pattern || !root || isSearching" @click="replaceInFiles">
          Replace in Files
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, watch, onMounted, nextTick } from 'vue'

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
      nextTick(() => {
        patternInputRef.value?.focus?.()
      })
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
    if (res?.error) {
      results.value = []
      statusText.value = res.error
      return
    }
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
    if (res?.error) {
      statusText.value = res.error
      return
    }
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
