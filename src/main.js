import { createApp } from 'vue'
import { createPinia } from 'pinia' // 1. 引入 Pinia
import './style.css'
import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia()) // 2. 挂载 Pinia
app.use(router)
app.mount('#app')