<template>
  <div ref="containerRef" class="monaco-editor-wrapper"></div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import * as monaco from 'monaco-editor'

let monacoConfigured = false
const registeredCompletionLanguages = new Set()

function registerKeywordCompletions(languageId, keywords) {
  if (!monaco.languages || registeredCompletionLanguages.has(languageId)) return
  registeredCompletionLanguages.add(languageId)

  monaco.languages.registerCompletionItemProvider(languageId, {
    triggerCharacters: ['.', ' ', ':', '('],
    provideCompletionItems(model, position) {
      const wordInfo = model.getWordUntilPosition(position)
      const range = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: wordInfo.startColumn,
        endColumn: wordInfo.endColumn,
      }
      const prefix = wordInfo.word.toLowerCase()

      const suggestions = keywords
        .filter(kw => !prefix || kw.toLowerCase().startsWith(prefix))
        .map(kw => ({
          label: kw,
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: kw,
          range,
        }))

      return { suggestions }
    },
  })
}

function configureMonaco() {
  if (monacoConfigured) return
  monacoConfigured = true

  if (monaco.languages?.typescript) {
    const { javascriptDefaults, typescriptDefaults, ScriptTarget } = monaco.languages.typescript

    javascriptDefaults.setCompilerOptions({
      allowNonTsExtensions: true,
      target: ScriptTarget.ESNext,
      module: monaco.languages.typescript.ModuleKind.ESNext,
      lib: ['esnext', 'dom'],
    })

    typescriptDefaults.setCompilerOptions({
      allowNonTsExtensions: true,
      target: ScriptTarget.ESNext,
      module: monaco.languages.typescript.ModuleKind.ESNext,
      lib: ['esnext', 'dom'],
    })
  }

  // Lightweight keyword completions for additional languages so autocomplete
  // is helpful even without full language servers.
  registerKeywordCompletions('python', [
    'and', 'as', 'assert', 'async', 'await', 'break', 'class', 'continue', 'def',
    'del', 'elif', 'else', 'except', 'False', 'finally', 'for', 'from', 'global',
    'if', 'import', 'in', 'is', 'lambda', 'None', 'nonlocal', 'not', 'or', 'pass',
    'raise', 'return', 'True', 'try', 'while', 'with', 'yield',
    'print', 'len', 'range', 'list', 'dict', 'set', 'tuple', 'str', 'int', 'float',
  ])

  registerKeywordCompletions('ruby', [
    'BEGIN', 'END', 'alias', 'and', 'begin', 'break', 'case', 'class', 'def', 'defined?',
    'do', 'else', 'elsif', 'end', 'ensure', 'false', 'for', 'if', 'in', 'module',
    'next', 'nil', 'not', 'or', 'redo', 'rescue', 'retry', 'return', 'self', 'super',
    'then', 'true', 'undef', 'unless', 'until', 'when', 'while', 'yield',
    'puts', 'print', 'require', 'include', 'extend',
  ])

  registerKeywordCompletions('go', [
    'break', 'case', 'chan', 'const', 'continue', 'default', 'defer', 'else', 'fallthrough',
    'for', 'func', 'go', 'goto', 'if', 'import', 'interface', 'map', 'package', 'range',
    'return', 'select', 'struct', 'switch', 'type', 'var',
    'append', 'len', 'cap', 'copy', 'delete', 'make', 'new', 'panic', 'recover', 'print', 'println',
  ])

  registerKeywordCompletions('rust', [
    'as', 'async', 'await', 'break', 'const', 'continue', 'crate', 'dyn', 'else', 'enum',
    'extern', 'false', 'fn', 'for', 'if', 'impl', 'in', 'let', 'loop', 'match',
    'mod', 'move', 'mut', 'pub', 'ref', 'return', 'Self', 'self', 'static',
    'struct', 'super', 'trait', 'true', 'type', 'unsafe', 'use', 'where', 'while',
    'Vec', 'String', 'Result', 'Option', 'Ok', 'Err', 'Some', 'None',
  ])

  registerKeywordCompletions('java', [
    'abstract', 'assert', 'boolean', 'break', 'byte', 'case', 'catch', 'char', 'class',
    'const', 'continue', 'default', 'do', 'double', 'else', 'enum', 'extends', 'final',
    'finally', 'float', 'for', 'goto', 'if', 'implements', 'import', 'instanceof',
    'int', 'interface', 'long', 'native', 'new', 'package', 'private', 'protected',
    'public', 'return', 'short', 'static', 'strictfp', 'super', 'switch', 'synchronized',
    'this', 'throw', 'throws', 'transient', 'try', 'void', 'volatile', 'while',
    'String', 'System', 'out', 'println',
  ])

  registerKeywordCompletions('kotlin', [
    'as', 'break', 'class', 'continue', 'do', 'else', 'false', 'for', 'fun', 'if',
    'in', 'interface', 'is', 'null', 'object', 'package', 'return', 'super', 'this',
    'throw', 'true', 'try', 'typealias', 'val', 'var', 'when', 'while',
    'Int', 'String', 'Boolean', 'List', 'Map',
  ])

  registerKeywordCompletions('c', [
    'auto', 'break', 'case', 'char', 'const', 'continue', 'default', 'do', 'double',
    'else', 'enum', 'extern', 'float', 'for', 'goto', 'if', 'inline', 'int', 'long',
    'register', 'restrict', 'return', 'short', 'signed', 'sizeof', 'static', 'struct',
    'switch', 'typedef', 'union', 'unsigned', 'void', 'volatile', 'while',
    'printf', 'scanf', 'malloc', 'free', 'memcpy', 'memset',
  ])

  registerKeywordCompletions('cpp', [
    'alignas', 'alignof', 'and', 'and_eq', 'asm', 'auto', 'bitand', 'bitor', 'bool',
    'break', 'case', 'catch', 'char', 'char16_t', 'char32_t', 'class', 'compl',
    'const', 'constexpr', 'const_cast', 'continue', 'decltype', 'default', 'delete',
    'do', 'double', 'dynamic_cast', 'else', 'enum', 'explicit', 'export', 'extern',
    'false', 'float', 'for', 'friend', 'goto', 'if', 'inline', 'int', 'long',
    'mutable', 'namespace', 'new', 'noexcept', 'nullptr', 'operator', 'or', 'private',
    'protected', 'public', 'register', 'reinterpret_cast', 'return', 'short', 'signed',
    'sizeof', 'static', 'static_cast', 'struct', 'switch', 'template', 'this', 'throw',
    'true', 'try', 'typedef', 'typeid', 'typename', 'union', 'unsigned', 'using',
    'virtual', 'void', 'volatile', 'wchar_t', 'while',
    'std', 'cout', 'cin', 'endl', 'vector', 'string',
  ])

  registerKeywordCompletions('csharp', [
    'abstract', 'as', 'base', 'bool', 'break', 'byte', 'case', 'catch', 'char', 'checked',
    'class', 'const', 'continue', 'decimal', 'default', 'delegate', 'do', 'double',
    'else', 'enum', 'event', 'explicit', 'extern', 'false', 'finally', 'fixed', 'float',
    'for', 'foreach', 'goto', 'if', 'implicit', 'in', 'int', 'interface', 'internal',
    'is', 'lock', 'long', 'namespace', 'new', 'null', 'object', 'operator', 'out',
    'override', 'params', 'private', 'protected', 'public', 'readonly', 'ref', 'return',
    'sbyte', 'sealed', 'short', 'sizeof', 'stackalloc', 'static', 'string', 'struct',
    'switch', 'this', 'throw', 'true', 'try', 'typeof', 'uint', 'ulong', 'unchecked',
    'unsafe', 'ushort', 'using', 'virtual', 'void', 'volatile', 'while',
    'Console', 'WriteLine',
  ])

  registerKeywordCompletions('php', [
    'abstract', 'and', 'array', 'as', 'break', 'callable', 'case', 'catch', 'class',
    'clone', 'const', 'continue', 'declare', 'default', 'do', 'echo', 'else', 'elseif',
    'empty', 'enddeclare', 'endfor', 'endforeach', 'endif', 'endswitch', 'endwhile',
    'eval', 'exit', 'extends', 'final', 'finally', 'for', 'foreach', 'function', 'global',
    'goto', 'if', 'implements', 'include', 'include_once', 'instanceof', 'insteadof',
    'interface', 'isset', 'list', 'namespace', 'new', 'or', 'print', 'private',
    'protected', 'public', 'require', 'require_once', 'return', 'static', 'switch',
    'throw', 'trait', 'try', 'unset', 'use', 'var', 'while', 'xor', 'yield',
  ])

  registerKeywordCompletions('sql', [
    'SELECT', 'FROM', 'WHERE', 'INSERT', 'INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE',
    'CREATE', 'TABLE', 'PRIMARY', 'KEY', 'FOREIGN', 'NOT', 'NULL', 'JOIN', 'INNER',
    'LEFT', 'RIGHT', 'FULL', 'OUTER', 'ON', 'GROUP', 'BY', 'ORDER', 'HAVING', 'LIMIT',
    'OFFSET', 'AS', 'AND', 'OR', 'IN', 'LIKE', 'DISTINCT', 'COUNT', 'AVG', 'SUM', 'MIN', 'MAX',
  ])

  registerKeywordCompletions('shell', [
    'if', 'then', 'else', 'elif', 'fi', 'case', 'esac', 'for', 'select', 'while', 'until',
    'do', 'done', 'in', 'function', 'time',
    'echo', 'printf', 'cd', 'ls', 'pwd', 'cat', 'touch', 'mkdir', 'rm', 'cp', 'mv',
    'grep', 'find', 'head', 'tail',
  ])

  registerKeywordCompletions('powershell', [
    'function', 'if', 'elseif', 'else', 'switch', 'for', 'foreach', 'while', 'do',
    'break', 'continue', 'return', 'try', 'catch', 'finally', 'throw',
    'Get-ChildItem', 'Get-Item', 'Set-Item', 'New-Item', 'Remove-Item',
    'Write-Host', 'Write-Output', 'Write-Error',
  ])

  registerKeywordCompletions('yaml', [
    'true', 'false', 'null', 'yes', 'no', 'on', 'off',
  ])
}

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
  configureMonaco()
  if (!containerRef.value) return
  editor = monaco.editor.create(containerRef.value, {
    value: props.modelValue,
    language: props.language,
    theme: props.theme,
    wordWrap: props.wordWrap ? 'on' : 'off',
    lineNumbers: props.lineNumbers === true ? 'on' : (props.lineNumbers === false ? 'off' : props.lineNumbers),
    fontSize: props.fontSize,
    readOnly: props.readOnly,
    // Disable minimap by default to reduce GPU/CPU usage on large files
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    automaticLayout: true,
    padding: { top: 8 },
    suggestOnTriggerCharacters: true,
    quickSuggestions: true,
    wordBasedSuggestions: 'all',
    tabCompletion: 'on',
    parameterHints: { enabled: true },
    hover: { enabled: true },
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
