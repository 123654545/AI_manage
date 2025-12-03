// 文件上传相关类型定义

export interface UploadResult {
  url: string
  fileName: string
  originalName: string
  size: number
  mimeType: string
  uploadedAt: string
}

export interface UploadProgress {
  loaded: number
  total: number
  percentage: number
}

export interface UploadError {
  message: string
  code?: string
  file?: File
}

export interface FileValidationRule {
  type: 'size' | 'type' | 'count'
  message: string
  valid: boolean
}

export interface UploadedFile {
  id: string
  name: string
  originalName: string
  size: number
  type: string
  url: string
  uploadedAt: Date
  status: 'uploading' | 'success' | 'error'
  error?: string
}