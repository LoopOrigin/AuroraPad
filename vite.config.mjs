import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import monacoEditorPluginModule from 'vite-plugin-monaco-editor'
import vuetify, { transformAssetUrls } from 'vite-plugin-vuetify'

const monacoEditorPlugin =
  monacoEditorPluginModule?.default?.default ??
  monacoEditorPluginModule?.default ??
  monacoEditorPluginModule

export default defineConfig({
  plugins: [
    vue({
      template: { transformAssetUrls },
    }),
    vuetify({ autoImport: true }),
    monacoEditorPlugin({
      // The plugin's built-in worker map omits `.js` extensions, which breaks
      // against current monaco-editor package layouts during production builds.
      languageWorkers: [],
      customWorkers: [
        { label: 'editorWorkerService', entry: 'monaco-editor/esm/vs/editor/editor.worker.js' },
        { label: 'typescript', entry: 'monaco-editor/esm/vs/language/typescript/ts.worker.js' },
        { label: 'json', entry: 'monaco-editor/esm/vs/language/json/json.worker.js' },
        { label: 'html', entry: 'monaco-editor/esm/vs/language/html/html.worker.js' },
        { label: 'css', entry: 'monaco-editor/esm/vs/language/css/css.worker.js' },
      ],
    }),
  ],
  base: './',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    target: 'esnext',
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/vuetify')) return 'vendor-vuetify'
          if (id.includes('node_modules/vue/') || id.includes('node_modules/@vue/')) return 'vendor-vue'
          if (id.includes('node_modules/pinia') || id.includes('node_modules/@vueuse')) return 'vendor-state'
        },
      },
    },
  },
})
