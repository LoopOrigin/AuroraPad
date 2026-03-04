import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import monacoEditorPlugin from 'vite-plugin-monaco-editor'

export default defineConfig({
  plugins: [
    vue(),
    monacoEditorPlugin({ languageWorkers: ['editorWorkerService', 'json', 'typescript'] }),
  ],
  base: './',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
})
