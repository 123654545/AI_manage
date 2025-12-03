// E:\HTML_learning\AI_manage3\frontend\src\services\api.ts
import axios from 'axios'
import type { UploadResult, UploadProgress } from '@/types/file'

const API_BASE_URL = 'http://localhost:3001/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 增加超时时间，适应大文件上传
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器：添加token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器：统一错误处理
api.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    
    const message = error.response?.data?.error || error.message || '请求失败'
    return Promise.reject(new Error(message))
  }
)

// 认证相关API
export const authAPI = {
  // 用户注册
  register: (email: string, password: string) =>
    api.post('/auth/register', { email, password }),
  
  // 用户登录
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  
  // 获取当前用户信息
  getCurrentUser: () =>
    api.get('/auth/me'),
  
  // 修改密码
  changePassword: (oldPassword: string, newPassword: string) =>
    api.post('/auth/change-password', { oldPassword, newPassword }),
  
  // 退出登录
  logout: () =>
    api.post('/auth/logout')
}

// 合同相关API
export const contractAPI = {
  // 获取合同列表（支持分页和筛选）
  getContracts: (params?: { page?: number; size?: number; search?: string; type?: string; status?: string }) =>
    api.get('/contracts', { params }),
  
  // 获取合同详情
  getContract: (id: string) =>
    api.get(`/contracts/${id}`),
  
  // 删除合同
  deleteContract: (id: string) =>
    api.delete(`/contracts/${id}`),
  
  // 获取合同分析结果
  getAnalysis: (contractId: string) =>
    api.get(`/contracts/${contractId}/analysis`),
  
  // 开始分析合同
  startAnalysis: (contractId: string) =>
    api.post(`/contracts/${contractId}/analyze`),
  
  // 下载合同文件
  downloadContract: (contractId: string) =>
    api.get(`/contracts/${contractId}/download`, { responseType: 'blob' })
}

// 文件上传API
export const uploadFile = async (
  file: File,
  onProgress?: (progress: number) => void
): Promise<UploadResult> => {
  const formData = new FormData()
  formData.append('file', file)
  
  return new Promise((resolve, reject) => {
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (progressEvent: any) => {
        if (progressEvent.total && onProgress) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          onProgress(progress)
        }
      }
    }
    
    api.post('/contracts/upload', formData, config)
      .then((response) => {
        resolve(response.data)
      })
      .catch((error) => {
        reject(error)
      })
  })
}

// 通用上传API（支持不同类型的文件上传）
export const uploadFileToUrl = async (
  url: string,
  file: File,
  onProgress?: (progress: number) => void,
  additionalData?: Record<string, any>
): Promise<any> => {
  const formData = new FormData()
  formData.append('file', file)
  
  // 添加额外数据
  if (additionalData) {
    Object.keys(additionalData).forEach(key => {
      formData.append(key, additionalData[key])
    })
  }
  
  return new Promise((resolve, reject) => {
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (progressEvent: any) => {
        if (progressEvent.total && onProgress) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          onProgress(progress)
        }
      }
    }
    
    api.post(url, formData, config)
      .then((response) => {
        resolve(response.data)
      })
      .catch((error) => {
        reject(error)
      })
  })
}

export default api