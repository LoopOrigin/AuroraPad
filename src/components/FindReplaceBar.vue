<template>
  <div v-if="visible" class="find-replace-bar">
    <input
      ref="findInputRef"
      v-model="findText"
      type="text"
      placeholder="Find"
      class="find-input"
      @keydown.enter="findNext"
      @keydown.esc="close"
    />
    <input
      v-model="replaceText"
      type="text"
      placeholder="Replace"
      class="replace-input"
      @keydown.enter="replaceNext"
    />
    <label>
      <input v-model="useRegex" type="checkbox" />
      Regex
    </label>
    <label>
      <input v-model="caseSensitive" type="checkbox" />
      Match case
    </label>
    <label>
      <input v-model="wholeWord" type="checkbox" />
      Whole word
    </label>
    <button type="button" @click="findPrev">↑ Prev</button>
    <button type="button" @click="findNext">↓ Next</button>
    <button type="button" @click="replaceNext">Replace</button>
    <button type="button" @click="replaceAll">Replace All</button>
    <button type="button" class="close-btn" @click="close">Close</button>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useTabsStore } from '../stores/tabs'

const props = defineProps({
  visible: { type: Boolean, default: false },
  replaceMode: { type: Boolean, default: false },
  editorRef: { type: Object, default: null },
})

const emit = defineEmits(['close'])

const tabsStore = useTabsStore()
const findText = ref('')
const replaceText = ref('')
const useRegex = ref(false)
const caseSensitive = ref(false)
const wholeWord = ref(false)
const findInputRef = ref(null)

watch(() => props.visible, (v) => {
  if (v) setTimeout(() => findInputRef.value?.focus(), 50)
})

function getEditor() {
  return props.editorRef?.getEditor?.() ?? null
}

function getFindOptions() {
  return {
    find: findText.value,
    replace: replaceText.value,
    regex: useRegex.value,
    caseSensitive: caseSensitive.value,
    wholeWord: wholeWord.value,
  }
}

function findNext() {
  const editor = getEditor()
  if (!editor) return
  editor.trigger('find', 'actions.find', getFindOptions())
}

function findPrev() {
  const editor = getEditor()
  if (!editor) return
  editor.trigger('find', 'editor.action.previousMatchFindAction', getFindOptions())
}

function replaceNext() {
  const editor = getEditor()
  if (!editor) return
  editor.trigger('find', 'editor.action.replaceOne', getFindOptions())
}

function replaceAll() {
  const editor = getEditor()
  if (!editor) return
  editor.trigger('find', 'editor.action.replaceAll', getFindOptions())
}

function close() {
  emit('close')
}
</script>

<style scoped>
.find-input, .replace-input { width: 180px; }
</style>
