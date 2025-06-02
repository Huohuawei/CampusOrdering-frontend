import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import './assets/main.css' // 合并 merchant 分支的全局样式

const app = createApp(App)
const pinia = createPinia() // 更清晰的初始化方式（来自 merchant）

// 注册插件（顺序无关紧要，但保持一致性）
app.use(pinia)
app.use(router)
app.use(ElementPlus)

app.mount('#app')