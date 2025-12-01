// E:\HTML_learning\AI_manage3\frontend\src\stores\auth.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { User } from '@/types/user'

// 先使用本地存储模拟
const mockUser = {
  id: '1',
  email: 'test@example.com'
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(mockUser)
  const token = ref<string | null>(localStorage.getItem('token'))
  const isAuthenticated = ref<boolean>(!!token.value)

  const login = async (email: string, password: string) => {
    // 先使用模拟登录，等后端正常后再对接
    console.log('模拟登录:', email, password)
    
    user.value = { id: '1', email }
    token.value = 'mock-jwt-token-for-test'
    isAuthenticated.value = true
    localStorage.setItem('token', token.value)
    
    return { success: true }
  }

  const logout = () => {
    user.value = null
    token.value = null
    isAuthenticated.value = false
    localStorage.removeItem('token')
  }

  const register = async (email: string, password: string) => {
    console.log('模拟注册:', email, password)
    return { success: true }
  }

  return {
    user,
    token,
    isAuthenticated,
    login,
    logout,
    register
  }
})