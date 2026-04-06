const googleSiteVerification = process.env.NUXT_PUBLIC_GOOGLE_SITE_VERIFICATION

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
        ...(googleSiteVerification
          ? [{ name: 'google-site-verification', content: googleSiteVerification }]
          : []),
      ],
    },
  },
  runtimeConfig: {
    public: {
      googleAnalyticsId: process.env.NUXT_PUBLIC_GOOGLE_ANALYTICS_ID || 'G-25XBXWX1DB',
      googleTagManagerId: process.env.NUXT_PUBLIC_GOOGLE_TAG_MANAGER_ID || '',
      googleSiteVerification: googleSiteVerification || '',
    },
  },
  nitro: {
    preset: 'static',
  },
})
