// E:\HTML_learning\AI_manage3\frontend\src\main.ts
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import TDesign from 'tdesign-vue-next'
import 'tdesign-vue-next/es/style/index.css'

import App from './App.vue'
import router from './router'
import { useAuthStore } from './stores/auth'

import './assets/main.css'

const app = createApp(App)
const pinia = createPinia()

// 使用 TDesign
app.use(TDesign)
app.use(pinia)
app.use(router)

// 初始化认证状态
const authStore = useAuthStore()
authStore.checkAuth()

app.mount('#app')