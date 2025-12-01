// E:\HTML_learning\AI_manage3\frontend\src\plugins\element-plus.ts
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import type { App } from 'vue'

export default {
  install(app: App) {
    app.use(ElementPlus)
    
    // 注册所有图标
    for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
      app.component(key, component)
    }
    
    // 全局挂载ElMessage
    app.config.globalProperties.$message = ElementPlus.ElMessage
    app.config.globalProperties.$notify = ElementPlus.ElNotification
    app.config.globalProperties.$messageBox = ElementPlus.ElMessageBox
  }
}