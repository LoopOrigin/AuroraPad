import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import './styles/main.css'
import './monaco-setup'

const app = createApp(App)
app.use(createPinia())
app.mount('#app')
