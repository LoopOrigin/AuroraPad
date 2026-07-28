import * as monaco from 'monaco-editor'

// Lightweight JS/TS language service configuration to feel more like a full IDE.
// This does not start external language servers, but it enables richer diagnostics
// and IntelliSense inside Monaco's built-in workers.

// JavaScript defaults
monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
  noSemanticValidation: false,
  noSyntaxValidation: false,
})

monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
  allowJs: true,
  checkJs: true,
  target: monaco.languages.typescript.ScriptTarget.ESNext,
  module: monaco.languages.typescript.ModuleKind.ESNext,
  jsx: monaco.languages.typescript.JsxEmit.ReactJSX,
  allowNonTsExtensions: true,
})

// TypeScript defaults
monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
  noSemanticValidation: false,
  noSyntaxValidation: false,
})

monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
  strict: true,
  target: monaco.languages.typescript.ScriptTarget.ESNext,
  module: monaco.languages.typescript.ModuleKind.ESNext,
  jsx: monaco.languages.typescript.JsxEmit.ReactJSX,
  allowNonTsExtensions: true,
})
 
// AuroraPad editor themes (to match UI themes from Preferences)
monaco.editor.defineTheme('aurora-monokai', {
  base: 'vs-dark',
  inherit: true,
  rules: [
    { token: '', foreground: 'F8F8F2', background: '272822' },
    { token: 'comment', foreground: '75715E' },
    { token: 'string', foreground: 'E6DB74' },
    { token: 'keyword', foreground: 'F92672' },
    { token: 'number', foreground: 'AE81FF' },
  ],
  colors: {
    'editor.background': '#272822',
    'editor.foreground': '#F8F8F2',
    'editorLineNumber.foreground': '#8F908A',
    'editorCursor.foreground': '#F8F8F0',
    'editor.selectionBackground': '#49483E',
    'editor.inactiveSelectionBackground': '#3E3D32',
  },
})

monaco.editor.defineTheme('aurora-material-ocean', {
  base: 'vs-dark',
  inherit: true,
  rules: [
    { token: '', foreground: 'EEFFFF', background: '0F111A' },
    { token: 'comment', foreground: '546E7A', fontStyle: 'italic' },
    { token: 'comment.line', foreground: '546E7A', fontStyle: 'italic' },
    { token: 'string', foreground: 'C3E88D' },
    { token: 'string.template', foreground: 'C3E88D' },
    { token: 'keyword', foreground: 'C792EA', fontStyle: 'italic' },
    { token: 'keyword.control', foreground: 'C792EA', fontStyle: 'italic' },
    { token: 'keyword.operator', foreground: '89DDFF' },
    { token: 'number', foreground: 'F78C6C' },
    { token: 'type', foreground: 'FFCB6B' },
    { token: 'class', foreground: 'FFCB6B' },
    { token: 'identifier', foreground: 'EEFFFF' },
    { token: 'function', foreground: '82AAFF' },
    { token: 'variable', foreground: 'EEFFFF' },
    { token: 'variable.parameter', foreground: 'F07178', fontStyle: 'italic' },
    { token: 'variable.other.constant', foreground: 'F78C6C' },
    { token: 'tag', foreground: 'F07178' },
    { token: 'attribute.name', foreground: 'FFCB6B' },
    { token: 'attribute.value', foreground: 'C3E88D' },
    { token: 'delimiter', foreground: '89DDFF' },
    { token: 'operator', foreground: '89DDFF' },
    { token: 'constant', foreground: 'F78C6C' },
    { token: 'constant.language', foreground: 'F78C6C', fontStyle: 'italic' },
    { token: 'regexp', foreground: 'FF5370' },
    { token: 'support.function', foreground: '80CBC4' },
    { token: 'entity.name.function', foreground: '82AAFF' },
    { token: 'storage', foreground: 'C792EA', fontStyle: 'italic' },
  ],
  colors: {
    'editor.background': '#0F111A',
    'editor.foreground': '#EEFFFF',
    'editorLineNumber.foreground': '#3B4261',
    'editorLineNumber.activeForeground': '#717CB4',
    'editorCursor.foreground': '#FFCC00',
    'editor.selectionBackground': '#1C2233',
    'editor.inactiveSelectionBackground': '#151926',
    'editor.selectionHighlightBackground': '#1C2233',
    'editor.lineHighlightBackground': '#111420',
    'editorGutter.background': '#0F111A',
    'editorWidget.background': '#0F111A',
    'editorWidget.border': '#1C2233',
    'editorSuggestWidget.background': '#111420',
    'editorSuggestWidget.border': '#1C2233',
    'editorSuggestWidget.selectedBackground': '#1C2233',
    'editorHoverWidget.background': '#111420',
    'editorHoverWidget.border': '#1C2233',
    'input.background': '#090B0F',
    'input.border': '#1C2233',
    'focusBorder': '#29D4F0',
    'scrollbar.shadow': '#000000',
    'scrollbarSlider.background': '#1C223380',
    'scrollbarSlider.hoverBackground': '#29D4F060',
    'scrollbarSlider.activeBackground': '#29D4F0A0',
    'editorIndentGuide.background1': '#1C2233',
    'editorIndentGuide.activeBackground1': '#29D4F040',
  },
})

monaco.editor.defineTheme('aurora-solarized-dark', {
  base: 'vs-dark',
  inherit: true,
  rules: [
    { token: '', foreground: 'EEE8D5', background: '002B36' },
    { token: 'comment', foreground: '586E75' },
    { token: 'string', foreground: '2AA198' },
    { token: 'keyword', foreground: '859900' },
    { token: 'number', foreground: 'D33682' },
  ],
  colors: {
    'editor.background': '#002B36',
    'editor.foreground': '#EEE8D5',
    'editorLineNumber.foreground': '#586E75',
    'editorCursor.foreground': '#EEE8D5',
    'editor.selectionBackground': '#073642',
    'editor.inactiveSelectionBackground': '#00212B',
  },
})

