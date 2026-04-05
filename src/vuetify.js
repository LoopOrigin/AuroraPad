import { createVuetify } from 'vuetify'
import { aliases, mdi } from 'vuetify/iconsets/mdi'

export const vuetify = createVuetify({
  theme: {
    defaultTheme: 'auroraDesktopDark',
    themes: {
      auroraDesktopLight: {
        dark: false,
        colors: {
          background: '#f5f8fc',
          surface: '#ffffff',
          'surface-bright': '#f3f6fb',
          'surface-variant': '#dde7f2',
          primary: '#0b76d1',
          secondary: '#2d9df5',
          accent: '#b47412',
          success: '#197a43',
          warning: '#a05c00',
          error: '#bf2d2d',
          info: '#0b76d1',
          'on-background': '#18202b',
          'on-surface': '#18202b',
        },
      },
      auroraDesktopDark: {
        dark: true,
        colors: {
          background: '#0e141d',
          surface: '#151d28',
          'surface-bright': '#202a37',
          'surface-variant': '#2a3442',
          primary: '#78c9ff',
          secondary: '#9fe1ff',
          accent: '#f3c97a',
          success: '#6fdf9a',
          warning: '#ffd37f',
          error: '#ff8c8c',
          info: '#78c9ff',
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
