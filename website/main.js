import { createApp } from 'vue'
import { createVuetify } from 'vuetify'
import { aliases, mdi } from 'vuetify/iconsets/mdi'
import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'
import WebsiteApp from './WebsiteApp.vue'

const vuetify = createVuetify({
  theme: {
    defaultTheme: 'aurora',
    themes: {
      aurora: {
        dark: true,
        colors: {
          background: '#060d18',
          surface: '#0a1628',
          primary: '#74e6ff',
          secondary: '#5faeff',
          accent: '#f4c98d',
          error: '#ff7b7b',
          info: '#86d7ff',
          success: '#67d8a5',
          warning: '#ffd37f',
        },
      },
    },
  },
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: { mdi },
  },
  defaults: {
    VBtn: {
      rounded: 'pill',
      variant: 'flat',
    },
    VCard: {
      rounded: 'xl',
    },
    VChip: {
      rounded: 'pill',
    },
  },
})

createApp(WebsiteApp).use(vuetify).mount('#website-app')
