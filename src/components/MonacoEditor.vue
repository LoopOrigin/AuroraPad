<template>
  <div ref="containerRef" class="monaco-editor-wrapper"></div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import * as monaco from 'monaco-editor'

const props = defineProps({
  modelValue: { type: String, default: '' },
  language: { type: String, default: 'plaintext' },
  theme: { type: String, default: 'vs' },
  wordWrap: { type: Boolean, default: false },
  lineNumbers: { type: [Boolean, String], default: true },
  fontSize: { type: Number, default: 14 },
  readOnly: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue', 'cursor-change', 'focus', 'blur'])

const containerRef = ref(null)
let editor = null
let subscription = null

onMounted(() => {
  if (!containerRef.value) return
  editor = monaco.editor.create(containerRef.value, {
    value: props.modelValue,
    language: props.language,
    theme: props.theme,
    wordWrap: props.wordWrap ? 'on' : 'off',
    lineNumbers: props.lineNumbers === true ? 'on' : (props.lineNumbers === false ? 'off' : props.lineNumbers),
    fontSize: props.fontSize,
    readOnly: props.readOnly,
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    automaticLayout: true,
    padding: { top: 8 },
  })

  subscription = editor.onDidChangeModelContent(() => {
    emit('update:modelValue', editor.getValue())
  })

  editor.onDidChangeCursorPosition(e => {
    emit('cursor-change', { line: e.position.lineNumber, column: e.position.column })
  })

  editor.onDidFocusEditorText(() => emit('focus'))
  editor.onDidBlurEditorText(() => emit('blur'))
})

onBeforeUnmount(() => {
  subscription?.dispose()
  editor?.dispose()
  editor = null
})

watch(() => props.modelValue, (val) => {
  if (editor && editor.getValue() !== val) {
    editor.setValue(val)
  }
})

watch(() => props.language, (val) => {
  if (editor) {
    const model = editor.getModel()
    if (model) monaco.editor.setModelLanguage(model, val)
  }
})

watch(() => props.theme, (val) => {
  if (editor) monaco.editor.setTheme(val)
})

watch(() => props.wordWrap, (val) => {
  if (editor) editor.updateOptions({ wordWrap: val ? 'on' : 'off' })
})

watch(() => props.lineNumbers, (val) => {
  if (editor) editor.updateOptions({ lineNumbers: val === true ? 'on' : (val === false ? 'off' : val) })
})

watch(() => props.fontSize, (val) => {
  if (editor) editor.updateOptions({ fontSize: val })
})

watch(() => props.readOnly, (val) => {
  if (editor) editor.updateOptions({ readOnly: val })
})

defineExpose({
  getEditor: () => editor,
  getValue: () => editor?.getValue() ?? '',
  setValue: (v) => editor?.setValue(v),
  focus: () => editor?.focus(),
  getPosition: () => editor?.getPosition(),
  setPosition: (pos) => editor?.setPosition(pos),
  trigger: (source, handlerId, payload) => editor?.trigger(source, handlerId, payload),
  getModel: () => editor?.getModel(),
  setModel: (model) => editor?.setModel(model),
})
</script>

<style scoped>
.monaco-editor-wrapper {
  width: 100%;
  height: 100%;
}
</style>
