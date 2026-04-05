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
          background: '#07101a',
          surface: '#101a28',
          'surface-bright': '#172334',
          primary: '#8ceaff',
          secondary: '#5ca9ff',
          accent: '#f2c57c',
          error: '#ff8f8f',
          info: '#8ceaff',
          success: '#6fdf9a',
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
      style: 'letter-spacing: 0.01em; text-transform: none;',
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
