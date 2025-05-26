import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import ElementPlus from 'element-plus'
import { createPinia } from 'pinia'
import 'element-plus/dist/index.css'

const app = createApp(App)

// 正确顺序：注册插件
app.use(router)
app.use(ElementPlus)
app.use(createPinia())

// 最后挂载
app.mount('#app')
