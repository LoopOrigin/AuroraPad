<template>
  <div class="toolbar">
    <button type="button" class="toolbar-btn" title="New (Ctrl+N)" @click="emit('new')">
      <span class="toolbar-icon icon-new-file"></span>
    </button>
    <button type="button" class="toolbar-btn" title="Open (Ctrl+O)" @click="emit('open')">
      <span class="toolbar-icon icon-open-file"></span>
    </button>
    <button
      type="button"
      class="toolbar-btn"
      title="Save (Ctrl+S)"
      :disabled="!canSave"
      @click="emit('save')"
    >
      <span class="toolbar-icon icon-save"></span>
    </button>
    <span class="toolbar-sep"></span>
    <button
      type="button"
      class="toolbar-btn"
      title="Save All (Ctrl+Shift+S)"
      :disabled="!canSaveAll"
      @click="emit('save-all')"
    >
      <span class="toolbar-icon icon-save-all"></span>
    </button>
    <span class="toolbar-sep"></span>
    <button
      type="button"
      class="toolbar-btn"
      title="Cut (Ctrl+X)"
      :disabled="!hasEditor"
      @click="emit('cut')"
    >
      <span class="toolbar-icon icon-cut"></span>
    </button>
    <button
      type="button"
      class="toolbar-btn"
      title="Copy (Ctrl+C)"
      :disabled="!hasEditor"
      @click="emit('copy')"
    >
      <span class="toolbar-icon icon-copy"></span>
    </button>
    <button
      type="button"
      class="toolbar-btn"
      title="Paste (Ctrl+V)"
      :disabled="!hasEditor"
      @click="emit('paste')"
    >
      <span class="toolbar-icon icon-paste"></span>
    </button>
    <span class="toolbar-sep"></span>
    <button
      type="button"
      class="toolbar-btn"
      title="Find (Ctrl+F)"
      :disabled="!hasEditor"
      @click="emit('find')"
    >
      <span class="toolbar-icon icon-find"></span>
    </button>
    <button
      type="button"
      class="toolbar-btn"
      title="Replace (Ctrl+H)"
      :disabled="!hasEditor"
      @click="emit('replace')"
    >
      <span class="toolbar-icon icon-replace"></span>
    </button>
    <span class="toolbar-sep"></span>
    <button
      type="button"
      class="toolbar-btn"
      title="Undo (Ctrl+Z)"
      :disabled="!hasEditor"
      @click="emit('undo')"
    >
      <span class="toolbar-icon icon-undo"></span>
    </button>
    <button
      type="button"
      class="toolbar-btn"
      title="Redo (Ctrl+Y)"
      :disabled="!hasEditor"
      @click="emit('redo')"
    >
      <span class="toolbar-icon icon-redo"></span>
    </button>
    <button
      type="button"
      class="toolbar-btn"
      title="Toggle Word Wrap"
      :disabled="!hasEditor"
      @click="emit('toggle-word-wrap')"
    >
      <span class="toolbar-icon icon-word-wrap"></span>
    </button>
    <button
      type="button"
      class="toolbar-btn"
      title="Go To Line (Ctrl+G)"
      :disabled="!hasEditor"
      @click="emit('go-to-line')"
    >
      <span class="toolbar-icon icon-go-to-line"></span>
    </button>
    <span class="toolbar-sep"></span>
    <button
      type="button"
      class="toolbar-btn"
      title="Zoom In"
      :disabled="!hasEditor"
      @click="emit('zoom-in')"
    >
      <span class="toolbar-icon icon-zoom-in"></span>
    </button>
    <button
      type="button"
      class="toolbar-btn"
      title="Zoom Out"
      :disabled="!hasEditor"
      @click="emit('zoom-out')"
    >
      <span class="toolbar-icon icon-zoom-out"></span>
    </button>
    <button
      type="button"
      class="toolbar-btn"
      title="Preferences"
      @click="emit('preferences')"
    >
      <span class="toolbar-icon icon-settings"></span>
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
