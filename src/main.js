import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import './styles/main.css'
import '@fortawesome/fontawesome-free/css/all.min.css'
import '@xterm/xterm/css/xterm.css'
import 'vuetify/styles'
import './monaco-setup'
import { vuetify } from './vuetify'
import { useSettingsStore } from './stores/settings'
import { watch } from 'vue'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(vuetify)

const settingsStore = useSettingsStore(pinia)
const syncVuetifyTheme = (theme) => {
  vuetify.theme.global.name.value = theme === 'light' ? 'auroraDesktopLight' : 'auroraDesktopDark'
}

syncVuetifyTheme(settingsStore.theme)
watch(() => settingsStore.theme, syncVuetifyTheme)

app.mount('#app')
