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
  </div>
</template>

<script setup>
defineProps({
  canSave: { type: Boolean, default: false },
  hasEditor: { type: Boolean, default: false },
})

const emit = defineEmits(['new', 'open', 'save', 'cut', 'copy', 'paste', 'find', 'replace'])
</script>
