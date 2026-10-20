<template>
  <div class="toolbar">
    <button type="button" class="toolbar-btn" :title="`New (${cmdCtrl}+N)`" @click="emit('new')">
      <i class="mdi mdi-file-outline toolbar-icon"></i>
    </button>
    <button type="button" class="toolbar-btn" :title="`Open (${cmdCtrl}+O)`" @click="emit('open')">
      <i class="mdi mdi-folder-open toolbar-icon"></i>
    </button>
    <button
      type="button"
      class="toolbar-btn"
      :title="`Save (${cmdCtrl}+S)`"
      :disabled="!canSave"
      @click="emit('save')"
    >
      <i class="mdi mdi-content-save toolbar-icon"></i>
    </button>
    <span class="toolbar-sep"></span>
    <button
      type="button"
      class="toolbar-btn"
      :title="`Save All (${cmdCtrl}+Shift+S)`"
      :disabled="!canSaveAll"
      @click="emit('save-all')"
    >
      <i class="mdi mdi-layers-triple toolbar-icon"></i>
    </button>
    <span class="toolbar-sep"></span>
    <button
      type="button"
      class="toolbar-btn"
      :title="`Cut (${cmdCtrl}+X)`"
      :disabled="!hasEditor"
      @click="emit('cut')"
    >
      <i class="mdi mdi-content-cut toolbar-icon"></i>
    </button>
    <button
      type="button"
      class="toolbar-btn"
      :title="`Copy (${cmdCtrl}+C)`"
      :disabled="!hasEditor"
      @click="emit('copy')"
    >
      <i class="mdi mdi-content-copy toolbar-icon"></i>
    </button>
    <button
      type="button"
      class="toolbar-btn"
      :title="`Paste (${cmdCtrl}+V)`"
      :disabled="!hasEditor"
      @click="emit('paste')"
    >
      <i class="mdi mdi-clipboard-outline toolbar-icon"></i>
    </button>
    <span class="toolbar-sep"></span>
    <button
      type="button"
      class="toolbar-btn"
      :title="`Find (${cmdCtrl}+F)`"
      :disabled="!hasEditor"
      @click="emit('find')"
    >
      <i class="mdi mdi-magnify toolbar-icon"></i>
    </button>
    <button
      type="button"
      class="toolbar-btn"
      :title="`Replace (${cmdCtrl}+H)`"
      :disabled="!hasEditor"
      @click="emit('replace')"
    >
      <i class="mdi mdi-find-replace toolbar-icon"></i>
    </button>
    <span class="toolbar-sep"></span>
    <button
      type="button"
      class="toolbar-btn"
      :title="`Undo (${cmdCtrl}+Z)`"
      :disabled="!hasEditor"
      @click="emit('undo')"
    >
      <i class="mdi mdi-undo-variant toolbar-icon"></i>
    </button>
    <button
      type="button"
      class="toolbar-btn"
      :title="`Redo (${cmdCtrl}+Y)`"
      :disabled="!hasEditor"
      @click="emit('redo')"
    >
      <i class="mdi mdi-redo-variant toolbar-icon"></i>
    </button>
    <button
      type="button"
      class="toolbar-btn"
      :class="{ active: wordWrap }"
      title="Toggle Word Wrap"
      :disabled="!hasEditor"
      @click="emit('toggle-word-wrap')"
    >
      <i class="mdi mdi-wrap toolbar-icon"></i>
    </button>
    <button
      type="button"
      class="toolbar-btn"
      :title="`Go To Line (${cmdCtrl}+G)`"
      :disabled="!hasEditor"
      @click="emit('go-to-line')"
    >
      <i class="mdi mdi-format-list-numbered toolbar-icon"></i>
    </button>
    <span class="toolbar-sep"></span>
    <button
      type="button"
      class="toolbar-btn"
      :title="`Zoom In (${cmdCtrl}++)`"
      :disabled="!hasEditor"
      @click="emit('zoom-in')"
    >
      <i class="mdi mdi-magnify-plus-outline toolbar-icon"></i>
    </button>
    <button
      type="button"
      class="toolbar-btn"
      :title="`Zoom Out (${cmdCtrl}+-)`"
      :disabled="!hasEditor"
      @click="emit('zoom-out')"
    >
      <i class="mdi mdi-magnify-minus-outline toolbar-icon"></i>
    </button>
    <button
      type="button"
      class="toolbar-btn toolbar-eol-btn"
      :title="`EOL: ${eolLabel} — click to convert to ${nextEolLabel}`"
      :disabled="!hasEditor"
      @click="emit('convert-eol')"
    >
      {{ eolLabel }}
    </button>
    <span class="toolbar-sep"></span>
    <button
      type="button"
      class="toolbar-btn"
      title="Preferences"
      @click="emit('preferences')"
    >
      <i class="mdi mdi-cog toolbar-icon"></i>
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  canSave: { type: Boolean, default: false },
  hasEditor: { type: Boolean, default: false },
  canSaveAll: { type: Boolean, default: false },
  wordWrap: { type: Boolean, default: false },
  eolMode: { type: String, default: 'LF' },
})

const eolLabel = computed(() => props.eolMode || 'LF')
const nextEolLabel = computed(() => {
  if (props.eolMode === 'LF') return 'CRLF'
  if (props.eolMode === 'CRLF') return 'CR'
  return 'LF'
})

const isMac = navigator.userAgent.toLowerCase().includes('mac')
const cmdCtrl = isMac ? 'Cmd' : 'Ctrl'

const emit = defineEmits([
  'new',
  'open',
  'save',
  'save-all',
  'cut',
  'copy',
  'paste',
  'find',
  'replace',
  'undo',
  'redo',
  'toggle-word-wrap',
  'go-to-line',
  'zoom-in',
  'zoom-out',
  'convert-eol',
  'preferences',
])
</script>

<style scoped>
.toolbar-eol-btn {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.03em;
  min-width: 36px;
  padding: 0 6px;
  font-family: monospace;
}
</style>
