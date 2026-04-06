import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import monacoEditorPlugin from 'vite-plugin-monaco-editor'
import { resolve } from 'path'
import vuetify, { transformAssetUrls } from 'vite-plugin-vuetify'

export default defineConfig(({ mode }) => {
  const websiteOnly = mode === 'website'

  return {
    root: websiteOnly ? resolve(__dirname, 'website') : __dirname,
    plugins: [
      vue({
        template: { transformAssetUrls },
      }),
      vuetify({ autoImport: true }),
      ...(!websiteOnly
        ? [
            // Enable the full set of standard Monaco workers for maximum language support
            monacoEditorPlugin({
              languageWorkers: ['editorWorkerService', 'typescript', 'json', 'html', 'css'],
            }),
          ]
        : []),
    ],
    base: './',
    build: {
      outDir: websiteOnly ? resolve(__dirname, 'dist-website') : 'dist',
      emptyOutDir: true,
      rollupOptions: websiteOnly
        ? undefined
        : {
            input: {
              app: resolve(__dirname, 'index.html'),
              website: resolve(__dirname, 'website/index.html'),
            },
          },
    },
  }
})
