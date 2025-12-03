// E:\HTML_learning\AI_manage3\frontend\src\stores\auth.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { User } from '@/types/user'
import { authAPI } from '@/services/api'
import { MessagePlugin } from 'tdesign-vue-next'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(localStorage.getItem('token'))
  const isAuthenticated = ref<boolean>(!!token.value)

  // 初始化时检查token有效性
  const checkAuth = async () => {
    if (token.value) {
      try {
        const response = await authAPI.getCurrentUser()
        user.value = response.data
        isAuthenticated.value = true
      } catch (error) {
        // token无效，清除认证状态
        logout()
      }
    }
  }

  const login = async (email: string, password: string) => {
    try {
      const response = await authAPI.login(email, password)
      
      if (response.success) {
        user.value = response.data.user
        token.value = response.data.token
        isAuthenticated.value = true
        localStorage.setItem('token', token.value)
        
        return { success: true }
      } else {
        return { success: false, message: response.error }
      }
    } catch (error: any) {
      console.error('登录失败:', error)
      return { 
        success: false, 
        message: error.message || '登录失败，请重试' 
      }
    }
  }

  const logout = async () => {
    try {
      // 调用后端登出接口
      if (token.value) {
        await authAPI.logout()
      }
    } catch (error) {
      console.error('登出接口调用失败:', error)
    } finally {
      // 无论接口是否成功，都清除本地状态
      user.value = null
      token.value = null
      isAuthenticated.value = false
      localStorage.removeItem('token')
    }
  }

  const register = async (email: string, password: string) => {
    try {
      const response = await authAPI.register(email, password)
      
      if (response.success) {
        return { success: true, message: '注册成功，请登录' }
      } else {
        return { success: false, message: response.error }
      }
    } catch (error: any) {
      console.error('注册失败:', error)
      return { 
        success: false, 
        message: error.message || '注册失败，请重试' 
      }
    }
  }

  return {
    user,
    token,
    isAuthenticated,
    login,
    logout,
    register,
    checkAuth
  }
})