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

