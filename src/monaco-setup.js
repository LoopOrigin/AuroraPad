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

