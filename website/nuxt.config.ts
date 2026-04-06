export default defineNuxtConfig({
  compatibilityDate: '2026-04-06',
  devtools: { enabled: false },
  srcDir: '.',
  modules: [],
  css: [],
  app: {
    head: {
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'theme-color', content: '#07101a' },
      ],
    },
  },
  nitro: {
    preset: 'static',
  },
})
