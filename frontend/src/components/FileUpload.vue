<template>
  <div class="file-upload-container">
    <div
      class="upload-area"
      :class="{
        'drag-over': isDragOver,
        'uploading': isUploading
      }"
      @click="triggerFileInput"
      @dragover.prevent="handleDragOver"
      @dragleave.prevent="handleDragLeave"
      @drop.prevent="handleDrop"
    >
      <div class="upload-content">
        <t-icon 
          class="upload-icon" 
          :size="48" 
          :color="isUploading ? '#0052d9' : '#c0c4cc'"
          name="upload"
        />
        
        <div class="upload-text">
          <template v-if="!isUploading">
            <p class="primary-text">点击或拖拽文件到此处上传</p>
            <p class="secondary-text">支持 {{ allowedTypes.join('、') }} 格式，文件大小不超过 {{ formatFileSize(maxSize) }}</p>
          </template>
          <template v-else>
            <p class="uploading-text">正在上传文件...</p>
          </template>
        </div>
        
        <input
          ref="fileInput"
          type="file"
          class="file-input"
          :accept="acceptString"
          :multiple="multiple"
          @change="handleFileSelect"
          :disabled="isUploading"
        />
      </div>
    </div>

    <!-- 上传进度条 -->
    <div v-if="isUploading || uploadProgress > 0" class="upload-progress">
      <t-progress
        :percentage="uploadProgress"
        :status="uploadProgress === 100 ? 'success' : undefined"
        :stroke-width="8"
        :show-text="true"
      >
        <template #text="{ percentage }">
          <span class="progress-text">{{ percentage }}%</span>
        </template>
      </t-progress>
      <p class="progress-info">
        {{ currentFileInfo.name }} - {{ formatFileSize(currentFileInfo.uploaded) }} / {{ formatFileSize(currentFileInfo.size) }}
      </p>
    </div>

    <!-- 已上传文件列表 -->
    <div v-if="uploadedFiles.length > 0" class="uploaded-files">
      <h4>已上传文件</h4>
      <t-table :data="uploadedFiles" style="width: 100%">
        <t-table-column prop="name" label="文件名" min-width="200">
          <template #default="{ row }">
            <t-icon name="file" />
            <span class="file-name">{{ row.name }}</span>
          </template>
        </t-table-column>
        <t-table-column prop="size" label="大小" width="120">
          <template #default="{ row }">
            {{ formatFileSize(row.size) }}
          </template>
        </t-table-column>
        <t-table-column prop="uploadTime" label="上传时间" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.uploadTime) }}
          </template>
        </t-table-column>
        <t-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <t-tag :theme="row.status === 'success' ? 'success' : 'danger'">
              {{ row.status === 'success' ? '成功' : '失败' }}
            </t-tag>
          </template>
        </t-table-column>
        <t-table-column label="操作" width="120">
          <template #default="{ row, $index }">
            <t-button
              theme="danger"
              size="small"
              @click="removeFile($index)"
            >
              删除
            </t-button>
          </template>
        </t-table-column>
      </t-table>
    </div>

    <!-- 错误提示 -->
    <t-alert
      v-if="errorMessage"
      :message="errorMessage"
      theme="error"
      :closable="true"
      @close="clearError"
      class="error-alert"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { MessagePlugin, DialogPlugin } from 'tdesign-vue-next'
import { uploadFile } from '@/services/api'
import type { UploadResult } from '@/types/file'

interface FileItem {
  file: File
  name: string
  size: number
  uploadTime: Date
  status: 'uploading' | 'success' | 'error'
  url?: string
  error?: string
}

const props = defineProps({
  // 允许的文件类型
  allowedTypes: {
    type: Array as () => string[],
    default: () => ['pdf', 'doc', 'docx']
  },
  // 最大文件大小（字节）
  maxSize: {
    type: Number,
    default: 20 * 1024 * 1024 // 20MB
  },
  // 是否多选
  multiple: {
    type: Boolean,
    default: false
  },
  // 最大上传数量
  maxCount: {
    type: Number,
    default: 10
  }
})

const emit = defineEmits<{
  uploadStart: [file: File]
  uploadSuccess: [result: UploadResult]
  uploadError: [error: string, file: File]
  fileRemove: [index: number]
}>()

// 响应式状态
const fileInput = ref<HTMLInputElement>()
const isDragOver = ref(false)
const isUploading = ref(false)
const uploadProgress = ref(0)
const errorMessage = ref('')
const uploadedFiles = ref<FileItem[]>([])

const currentFileInfo = reactive({
  name: '',
  size: 0,
  uploaded: 0
})

// 计算属性
const acceptString = computed(() => {
  return props.allowedTypes.map(type => `.${type}`).join(',')
})

// 拖放事件处理
const handleDragOver = () => {
  isDragOver.value = true
}

const handleDragLeave = () => {
  isDragOver.value = false
}

const handleDrop = (event: DragEvent) => {
  isDragOver.value = false
  
  const files = event.dataTransfer?.files
  if (files && files.length > 0) {
    handleFiles(files)
  }
}

// 文件选择处理
const triggerFileInput = () => {
  if (!isUploading.value) {
    fileInput.value?.click()
  }
}

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  const files = target.files
  if (files && files.length > 0) {
    handleFiles(files)
  }
  // 清空input值，允许重复选择同一文件
  target.value = ''
}

// 文件验证和处理
const handleFiles = async (files: FileList) => {
  clearError()
  
  const fileList = Array.from(files)
  
  // 检查文件数量限制
  if (!props.multiple && fileList.length > 1) {
    showError('只能选择一个文件')
    return
  }
  
  if (uploadedFiles.value.length + fileList.length > props.maxCount) {
    showError(`最多只能上传 ${props.maxCount} 个文件`)
    return
  }
  
  // 验证并处理每个文件
  for (const file of fileList) {
    if (!validateFile(file)) {
      continue
    }
    
    await uploadSingleFile(file)
  }
}

const validateFile = (file: File): boolean => {
  // 检查文件类型
  const fileExtension = file.name.split('.').pop()?.toLowerCase()
  if (!fileExtension || !props.allowedTypes.includes(fileExtension)) {
    showError(`文件类型不支持，请选择 ${props.allowedTypes.join('、')} 格式的文件`)
    return false
  }
  
  // 检查文件大小
  if (file.size > props.maxSize) {
    showError(`文件大小不能超过 ${formatFileSize(props.maxSize)}`)
    return false
  }
  
  return true
}

// 上传单个文件
const uploadSingleFile = async (file: File) => {
  isUploading.value = true
  uploadProgress.value = 0
  errorMessage.value = ''
  
  // 设置当前文件信息
  currentFileInfo.name = file.name
  currentFileInfo.size = file.size
  currentFileInfo.uploaded = 0
  
  // 添加到文件列表
  const fileItem: FileItem = {
    file,
    name: file.name,
    size: file.size,
    uploadTime: new Date(),
    status: 'uploading'
  }
  uploadedFiles.value.push(fileItem)
  
  emit('uploadStart', file)
  
  try {
    const result = await uploadFile(file, (progress) => {
      uploadProgress.value = progress
      currentFileInfo.uploaded = Math.floor((file.size * progress) / 100)
    })
    
    // 更新文件状态
    const index = uploadedFiles.value.findIndex(item => item.file === file)
    if (index !== -1) {
      uploadedFiles.value[index] = {
        ...uploadedFiles.value[index],
        status: 'success',
        url: result.url
      }
    }
    
    emit('uploadSuccess', result)
    MessagePlugin.success(`${file.name} 上传成功`)
    
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : '上传失败'
    
    // 更新文件状态
    const index = uploadedFiles.value.findIndex(item => item.file === file)
    if (index !== -1) {
      uploadedFiles.value[index] = {
        ...uploadedFiles.value[index],
        status: 'error',
        error: errorMsg
      }
    }
    
    showError(errorMsg)
    emit('uploadError', errorMsg, file)
    
  } finally {
    isUploading.value = false
    uploadProgress.value = 0
  }
}

// 文件操作
const removeFile = async (index: number) => {
  try {
    const confirm = await DialogPlugin.confirm({
      header: '确认删除',
      body: '确定要删除这个文件吗？',
      confirmBtn: '确定',
      cancelBtn: '取消',
      theme: 'warning'
    })
    
    uploadedFiles.value.splice(index, 1)
    emit('fileRemove', index)
    MessagePlugin.success('文件删除成功')
    
  } catch {
    // 用户取消删除
  }
}

const clearError = () => {
  errorMessage.value = ''
}

const showError = (message: string) => {
  errorMessage.value = message
  MessagePlugin.error(message)
}

// 工具函数
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const formatDateTime = (date: Date): string => {
  return date.toLocaleString('zh-CN')
}
</script>

<style scoped>
.file-upload-container {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
}

.upload-area {
  border: 2px dashed #dcdfe6;
  border-radius: 8px;
  padding: 40px 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background-color: #fafafa;
  position: relative;
  overflow: hidden;
}

.upload-area:hover {
  border-color: #0052d9;
  background-color: #f0f9ff;
}

.upload-area.drag-over {
  border-color: #0052d9;
  background-color: #ecf5ff;
  border-style: solid;
}

.upload-area.uploading {
  border-color: #0052d9;
  background-color: #ecf5ff;
  cursor: not-allowed;
}

.upload-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.upload-icon {
  transition: all 0.3s ease;
}

.upload-text {
  line-height: 1.6;
}

.primary-text {
  font-size: 16px;
  color: #303133;
  margin: 0 0 8px 0;
  font-weight: 500;
}

.secondary-text {
  font-size: 14px;
  color: #909399;
  margin: 0;
}

.uploading-text {
  font-size: 16px;
  color: #0052d9;
  margin: 0;
  font-weight: 500;
}

.file-input {
  display: none;
}

.upload-progress {
  margin-top: 20px;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
  border: 1px solid #e4e7ed;
}

.progress-text {
  font-weight: 600;
  color: #0052d9;
}

.progress-info {
  margin-top: 12px;
  font-size: 14px;
  color: #606266;
  text-align: center;
}

.uploaded-files {
  margin-top: 30px;
}

.uploaded-files h4 {
  margin-bottom: 16px;
  color: #303133;
  font-weight: 600;
}

.file-name {
  margin-left: 8px;
}

.error-alert {
  margin-top: 16px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .upload-area {
    padding: 30px 16px;
  }
  
  .primary-text {
    font-size: 14px;
  }
  
  .secondary-text {
    font-size: 12px;
  }
  
  .upload-progress {
    padding: 16px;
  }
}
</style>