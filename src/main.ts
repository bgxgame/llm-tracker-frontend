// src/main.ts
import { createApp } from 'vue'
import './style.css'
import router from './router'
import App from './App.vue'

// 💡 增加这两行：引入 Vue Flow 必需的样式
import '@vue-flow/core/dist/style.css';
import '@vue-flow/core/dist/theme-default.css'; // 可选，提供默认的节点外观

createApp(App).use(router).mount('#app')