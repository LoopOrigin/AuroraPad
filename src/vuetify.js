import { createVuetify } from 'vuetify'
import { aliases, mdi } from 'vuetify/iconsets/mdi'

export const vuetify = createVuetify({
  theme: {
    defaultTheme: 'auroraDesktopDark',
    themes: {
      auroraDesktopLight: {
        dark: false,
        colors: {
          background: '#f5f7fd',
          surface: '#ffffff',
          'surface-bright': '#f6f8ff',
          'surface-variant': '#e4eaff',
          primary: '#0f63e9',
          secondary: '#7a38eb',
          accent: '#10b9c7',
          success: '#0f8b63',
          warning: '#b56b14',
          error: '#bf2d2d',
          info: '#0f63e9',
          'on-background': '#162347',
          'on-surface': '#162347',
        },
      },
      auroraDesktopDark: {
        dark: true,
        colors: {
          background: '#071120',
          surface: '#0d1830',
          'surface-bright': '#132344',
          'surface-variant': '#1e3159',
          primary: '#27a6ff',
          secondary: '#8a45ff',
          accent: '#0dc9bd',
          success: '#39d6a1',
          warning: '#ffbf6f',
          error: '#ff8c8c',
          info: '#27a6ff',
          'on-background': '#edf4ff',
          'on-surface': '#edf4ff',
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
