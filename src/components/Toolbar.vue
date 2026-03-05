<template>
  <div class="toolbar">
    <button type="button" class="toolbar-btn" title="New (Ctrl+N)" @click="emit('new')">
      <i class="fa-solid fa-file toolbar-fa-icon"></i>
    </button>
    <button type="button" class="toolbar-btn" title="Open (Ctrl+O)" @click="emit('open')">
      <i class="fa-solid fa-folder-open toolbar-fa-icon"></i>
    </button>
    <button
      type="button"
      class="toolbar-btn"
      title="Save (Ctrl+S)"
      :disabled="!canSave"
      @click="emit('save')"
    >
      <i class="fa-solid fa-floppy-disk toolbar-fa-icon"></i>
    </button>
    <span class="toolbar-sep"></span>
    <button
      type="button"
      class="toolbar-btn"
      title="Save All (Ctrl+Shift+S)"
      :disabled="!canSaveAll"
      @click="emit('save-all')"
    >
      <i class="fa-solid fa-layer-group toolbar-fa-icon"></i>
    </button>
    <span class="toolbar-sep"></span>
    <button
      type="button"
      class="toolbar-btn"
      title="Cut (Ctrl+X)"
      :disabled="!hasEditor"
      @click="emit('cut')"
    >
      <i class="fa-solid fa-scissors toolbar-fa-icon"></i>
    </button>
    <button
      type="button"
      class="toolbar-btn"
      title="Copy (Ctrl+C)"
      :disabled="!hasEditor"
      @click="emit('copy')"
    >
      <i class="fa-solid fa-copy toolbar-fa-icon"></i>
    </button>
    <button
      type="button"
      class="toolbar-btn"
      title="Paste (Ctrl+V)"
      :disabled="!hasEditor"
      @click="emit('paste')"
    >
      <i class="fa-solid fa-clipboard toolbar-fa-icon"></i>
    </button>
    <span class="toolbar-sep"></span>
    <button
      type="button"
      class="toolbar-btn"
      title="Find (Ctrl+F)"
      :disabled="!hasEditor"
      @click="emit('find')"
    >
      <i class="fa-solid fa-magnifying-glass toolbar-fa-icon"></i>
    </button>
    <button
      type="button"
      class="toolbar-btn"
      title="Replace (Ctrl+H)"
      :disabled="!hasEditor"
      @click="emit('replace')"
    >
      <i class="fa-solid fa-magnifying-glass-arrow-right toolbar-fa-icon"></i>
    </button>
    <span class="toolbar-sep"></span>
    <button
      type="button"
      class="toolbar-btn"
      title="Undo (Ctrl+Z)"
      :disabled="!hasEditor"
      @click="emit('undo')"
    >
      <i class="fa-solid fa-rotate-left toolbar-fa-icon"></i>
    </button>
    <button
      type="button"
      class="toolbar-btn"
      title="Redo (Ctrl+Y)"
      :disabled="!hasEditor"
      @click="emit('redo')"
    >
      <i class="fa-solid fa-rotate-right toolbar-fa-icon"></i>
    </button>
    <button
      type="button"
      class="toolbar-btn"
      title="Toggle Word Wrap"
      :disabled="!hasEditor"
      @click="emit('toggle-word-wrap')"
    >
      <i class="fa-solid fa-align-left toolbar-fa-icon"></i>
    </button>
    <button
      type="button"
      class="toolbar-btn"
      title="Go To Line (Ctrl+G)"
      :disabled="!hasEditor"
      @click="emit('go-to-line')"
    >
      <i class="fa-solid fa-arrow-down-1-9 toolbar-fa-icon"></i>
    </button>
    <span class="toolbar-sep"></span>
    <button
      type="button"
      class="toolbar-btn"
      title="Zoom In"
      :disabled="!hasEditor"
      @click="emit('zoom-in')"
    >
      <i class="fa-solid fa-magnifying-glass-plus toolbar-fa-icon"></i>
    </button>
    <button
      type="button"
      class="toolbar-btn"
      title="Zoom Out"
      :disabled="!hasEditor"
      @click="emit('zoom-out')"
    >
      <i class="fa-solid fa-magnifying-glass-minus toolbar-fa-icon"></i>
    </button>
    <button
      type="button"
      class="toolbar-btn"
      title="Preferences"
      @click="emit('preferences')"
    >
      <i class="fa-solid fa-gear toolbar-fa-icon"></i>
    </button>
  </div>
</template>

<script setup>
defineProps({
  canSave: { type: Boolean, default: false },
  hasEditor: { type: Boolean, default: false },
  canSaveAll: { type: Boolean, default: false },
})

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
  'preferences',
])
</script>
