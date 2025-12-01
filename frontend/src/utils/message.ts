// E:\HTML_learning\AI_manage3\frontend\src\utils\message.ts

// 简单版本：使用alert作为后备
export const showMessage = {
  success: (message: string) => {
    try {
      // 尝试使用ElMessage
      import('element-plus').then(({ ElMessage }) => {
        ElMessage.success(message)
      }).catch(() => {
        // 如果失败，使用alert
        alert(`✅ ${message}`)
      })
    } catch (error) {
      alert(`✅ ${message}`)
    }
  },
  
  error: (message: string) => {
    try {
      import('element-plus').then(({ ElMessage }) => {
        ElMessage.error(message)
      }).catch(() => {
        alert(`❌ ${message}`)
      })
    } catch (error) {
      alert(`❌ ${message}`)
    }
  },
  
  warning: (message: string) => {
    try {
      import('element-plus').then(({ ElMessage }) => {
        ElMessage.warning(message)
      }).catch(() => {
        alert(`⚠️ ${message}`)
      })
    } catch (error) {
      alert(`⚠️ ${message}`)
    }
  },
  
  info: (message: string) => {
    try {
      import('element-plus').then(({ ElMessage }) => {
        ElMessage.info(message)
      }).catch(() => {
        alert(`ℹ️ ${message}`)
      })
    } catch (error) {
      alert(`ℹ️ ${message}`)
    }
  }
}