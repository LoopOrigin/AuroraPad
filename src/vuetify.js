import { createVuetify } from 'vuetify'
import { aliases, mdi } from 'vuetify/iconsets/mdi'

export const vuetify = createVuetify({
  theme: {
    defaultTheme: 'auroraDesktop',
    themes: {
      auroraDesktop: {
        dark: true,
        colors: {
          background: '#141922',
          surface: '#1b212c',
          'surface-bright': '#252c39',
          primary: '#58b6ff',
          secondary: '#7ad7ff',
          accent: '#d6a34a',
          success: '#63d471',
          warning: '#ffcb6b',
          error: '#ff7a7a',
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
    VDialog: {
      scrim: 'rgba(8, 12, 18, 0.68)',
    },
    VCard: {
      rounded: 'xl',
      elevation: 16,
    },
    VBtn: {
      rounded: 'lg',
      variant: 'flat',
    },
    VTextField: {
      variant: 'outlined',
      density: 'comfortable',
      hideDetails: 'auto',
    },
    VSelect: {
      variant: 'outlined',
      density: 'comfortable',
      hideDetails: 'auto',
    },
    VSwitch: {
      color: 'primary',
      hideDetails: true,
      inset: true,
    },
  },
})
