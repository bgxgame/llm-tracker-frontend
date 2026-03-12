// src/main.ts
import { createApp } from 'vue'
import { createPinia } from 'pinia' // 💡 引入 Pinia
import './style.css'
import router from './router'
import App from './App.vue'

// 引入样式
import '@vue-flow/core/dist/style.css';
import '@vue-flow/core/dist/theme-default.css';

const app = createApp(App)
const pinia = createPinia() // 💡 创建实例

app.use(pinia)  // 💡 必须先注册 Pinia
app.use(router) // 💡 再注册 Router
app.mount('#app')