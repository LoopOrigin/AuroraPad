<template>
  <div class="toolbar">
    <button type="button" class="toolbar-btn" title="New (Ctrl+N)" @click="emit('new')">📄</button>
    <button type="button" class="toolbar-btn" title="Open (Ctrl+O)" @click="emit('open')">📂</button>
    <button type="button" class="toolbar-btn" title="Save (Ctrl+S)" :disabled="!canSave" @click="emit('save')">💾</button>
    <span class="toolbar-sep"></span>
    <button type="button" class="toolbar-btn" title="Cut (Ctrl+X)" :disabled="!hasEditor" @click="emit('cut')">✂</button>
    <button type="button" class="toolbar-btn" title="Copy (Ctrl+C)" :disabled="!hasEditor" @click="emit('copy')">📋</button>
    <button type="button" class="toolbar-btn" title="Paste (Ctrl+V)" :disabled="!hasEditor" @click="emit('paste')">📃</button>
    <span class="toolbar-sep"></span>
    <button type="button" class="toolbar-btn" title="Find (Ctrl+F)" :disabled="!hasEditor" @click="emit('find')">🔍</button>
    <button type="button" class="toolbar-btn" title="Replace (Ctrl+H)" :disabled="!hasEditor" @click="emit('replace')">🔄</button>
  </div>
</template>

<script setup>
defineProps({
  canSave: { type: Boolean, default: false },
  hasEditor: { type: Boolean, default: false },
})

const emit = defineEmits(['new', 'open', 'save', 'cut', 'copy', 'paste', 'find', 'replace'])
</script>
