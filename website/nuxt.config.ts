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
      script: [
        {
          src: 'https://www.googletagmanager.com/gtag/js?id=G-25XBXWX1DB',
          async: true,
        },
        {
          innerHTML: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-25XBXWX1DB');
          `,
        },
      ],
    },
  },
  nitro: {
    preset: 'static',
  },
})
