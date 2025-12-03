<template>
  <div class="upload-view">
    <!-- 专业头部区域 -->
    <div class="professional-header">
      <div class="header-content">
        <h1 class="header-title">
          <t-icon name="upload" class="title-icon" />
          合同智能上传
        </h1>
        <p class="header-subtitle">上传您的合同文件，AI 将为您进行深度智能分析</p>
      </div>
      <div class="header-stats">
        <div class="stat-item">
          <span class="stat-value">{{ recentUploads.length }}</span>
          <span class="stat-label">已上传文件</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">{{ completedAnalysisCount }}</span>
          <span class="stat-label">已完成分析</span>
        </div>
      </div>
    </div>

    <!-- 主上传区域 -->
    <div class="upload-container">
      <div class="upload-area-wrapper">
        <div class="upload-area">
          <div class="upload-icon">
            <t-icon name="upload-cloud" size="48px" />
          </div>
          <h3 class="upload-title">拖拽文件到此处上传</h3>
          <p class="upload-description">支持 PDF、DOC、DOCX 格式，单个文件最大 20MB</p>
          <t-button variant="outline" size="large" class="upload-btn">
            <t-icon name="folder-open" />
            选择文件
          </t-button>
        </div>
      </div>

      <FileUpload
        :allowed-types="['pdf', 'doc', 'docx']"
        :max-size="20 * 1024 * 1024"
        :multiple="true"
        :max-count="5"
        @upload-start="handleUploadStart"
        @upload-success="handleUploadSuccess"
        @upload-error="handleUploadError"
        @file-remove="handleFileRemove"
      />
    </div>

    <!-- 最近上传文件 -->
    <div v-if="recentUploads.length > 0" class="recent-uploads-section">
      <div class="section-header">
        <h2 class="section-title">
          <t-icon name="time" />
          最近上传
        </h2>
        <t-button variant="text" @click="loadRecentUploads">
          <t-icon name="refresh" />
          刷新
        </t-button>
      </div>

      <div class="upload-list">
        <div 
          v-for="upload in recentUploads" 
          :key="upload.id"
          class="upload-item-card"
          :class="getStatusClass(upload.analysisStatus)"
        >
          <div class="file-info-section">
            <div class="file-icon">
              <t-icon name="file" size="24px" />
            </div>
            <div class="file-details">
              <h4 class="file-name">{{ upload.fileName || upload.originalName || upload.title }}</h4>
              <div class="file-meta">
                <span class="upload-time">{{ formatDateTime(upload.uploadTime) }}</span>
                <span class="file-size">{{ formatFileSize(upload.fileSize || 0) }}</span>
              </div>
            </div>
          </div>

          <div class="status-section">
            <t-tag 
              :theme="getStatusTheme(upload.analysisStatus)"
              size="medium"
              variant="light"
            >
              {{ getStatusText(upload.analysisStatus) }}
            </t-tag>
          </div>

          <div class="actions-section">
            <t-button 
              v-if="upload.analysisStatus === 'completed'"
              size="small" 
              variant="outline"
              @click="viewAnalysis(upload.id)"
            >
              <t-icon name="view" />
              查看分析
            </t-button>
            <t-button 
              size="small" 
              variant="outline"
              @click="downloadFile(upload.id)"
            >
              <t-icon name="download" />
              下载
            </t-button>
            <t-button 
              size="small" 
              variant="outline"
              theme="danger"
              @click="deleteContract(upload.id)"
            >
              <t-icon name="delete" />
              删除
            </t-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 分析结果对话框 -->
    <t-dialog
      v-model:visible="analysisDialogVisible"
      header="合同分析报告"
      width="900px"
      :close-on-overlay-click="false"
      :confirm-on-enter="false"
    >
      <div v-if="currentAnalysis" class="analysis-content">
        <!-- 分析概览 -->
        <div class="analysis-overview">
          <div class="overview-item">
            <t-icon name="file-text" size="24px" />
            <div>
              <div class="overview-label">文件名称</div>
              <div class="overview-value">{{ currentAnalysis.fileName }}</div>
            </div>
          </div>
          <div class="overview-item">
            <t-icon name="time" size="24px" />
            <div>
              <div class="overview-label">分析时间</div>
              <div class="overview-value">{{ formatDateTime(currentAnalysis.analyzedAt) }}</div>
            </div>
          </div>
          <div class="overview-item">
            <t-icon name="ai" size="24px" />
            <div>
              <div class="overview-label">AI 模型</div>
              <div class="overview-value">{{ currentAnalysis.aiModel }}</div>
            </div>
          </div>
        </div>

        <!-- 关键条款 -->
        <t-card v-if="currentAnalysis.keyTerms" class="analysis-section" header="关键条款识别">
          <div class="key-terms-grid">
            <div 
              v-for="(term, index) in currentAnalysis.keyTerms"
              :key="index"
              class="term-card"
            >
              <t-icon name="file-text" size="16px" />
              <span class="term-text">{{ term }}</span>
            </div>
          </div>
        </t-card>

        <!-- 风险点 -->
        <t-card v-if="currentAnalysis.riskPoints" class="analysis-section" header="风险识别">
          <div class="risk-points-list">
            <div 
              v-for="(risk, index) in currentAnalysis.riskPoints"
              :key="index"
              class="risk-item"
            >
              <t-icon name="warning" size="16px" class="risk-icon" />
              <div class="risk-content">
                <div class="risk-title">{{ risk.title || risk }}</div>
                <div class="risk-description" v-if="risk.description">{{ risk.description }}</div>
              </div>
            </div>
          </div>
        </t-card>

        <!-- 关键日期 -->
        <t-card v-if="currentAnalysis.keyDates" class="analysis-section" header="关键时间节点">
          <t-timeline>
            <t-timeline-item
              v-for="(date, index) in currentAnalysis.keyDates"
              :key="index"
              :label="date.date"
            >
              <div class="date-content">
                <div class="date-title">{{ date.type || date.title }}</div>
                <div class="date-description" v-if="date.description">{{ date.description }}</div>
              </div>
            </t-timeline-item>
          </t-timeline>
        </t-card>
      </div>

      <template #footer>
        <t-button @click="analysisDialogVisible = false">关闭</t-button>
      </template>
    </t-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { MessagePlugin, DialogPlugin } from 'tdesign-vue-next'
import FileUpload from '@/components/FileUpload.vue'
import { contractAPI } from '@/services/api'
import type { UploadResult } from '@/types/file'

const router = useRouter()

// 响应式数据
const analysisDialogVisible = ref(false)
const currentAnalysis = ref<any>(null)
const recentUploads = ref<any[]>([])

// 计算属性
const completedAnalysisCount = computed(() => {
  return recentUploads.value.filter(upload => upload.analysisStatus === 'completed').length
})

// 上传事件处理
const handleUploadStart = (file: File) => {
  console.log('开始上传:', file.name)
  MessagePlugin.loading('文件上传中...')
}

const handleUploadSuccess = (result: UploadResult) => {
  console.log('上传成功:', result)
  MessagePlugin.closeAll()
  MessagePlugin.success('文件上传成功')
  loadRecentUploads()
}

const handleUploadError = (error: string, file: File) => {
  console.error('上传失败:', error, file)
  MessagePlugin.closeAll()
  MessagePlugin.error(`上传失败: ${error}`)
}

const handleFileRemove = (index: number) => {
  console.log('文件被移除:', index)
}

// 加载最近上传的文件
const loadRecentUploads = async () => {
  try {
    const response = await contractAPI.getContracts()
    recentUploads.value = response.data || []
  } catch (error) {
    console.error('获取合同列表失败:', error)
  }
}

// 查看分析结果
const viewAnalysis = async (contractId: string) => {
  try {
    const response = await contractAPI.getAnalysis(contractId)
    currentAnalysis.value = response.data
    analysisDialogVisible.value = true
  } catch (error) {
    MessagePlugin.error('获取分析结果失败')
  }
}

// 下载文件
const downloadFile = (contractId: string) => {
  window.open(`http://localhost:3001/api/contracts/${contractId}/download`, '_blank')
}

// 删除合同
const deleteContract = async (contractId: string) => {
  try {
    const confirm = await DialogPlugin.confirm({
      header: '确认删除',
      body: '确定要删除这个合同吗？此操作不可恢复。',
      confirmBtn: '确定',
      cancelBtn: '取消',
      theme: 'warning'
    })

    if (confirm) {
      await contractAPI.deleteContract(contractId)
      MessagePlugin.success('合同删除成功')
      loadRecentUploads()
    }
  } catch (error) {
    MessagePlugin.error('删除失败')
  }
}

// 工具函数
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const formatDateTime = (date: string | Date): string => {
  return new Date(date).toLocaleString('zh-CN')
}

const getStatusTheme = (status: string): string => {
  switch (status) {
    case 'completed': return 'success'
    case 'processing': return 'warning'
    case 'failed': return 'danger'
    case 'pending': return 'primary'
    default: return 'default'
  }
}

const getStatusClass = (status: string): string => {
  switch (status) {
    case 'completed': return 'status-completed'
    case 'processing': return 'status-processing'
    case 'failed': return 'status-failed'
    case 'pending': return 'status-pending'
    default: return 'status-default'
  }
}

const getStatusText = (status: string): string => {
  switch (status) {
    case 'completed': return '分析完成'
    case 'processing': return '分析中'
    case 'failed': return '分析失败'
    case 'pending': return '待分析'
    default: return '未知状态'
  }
}

// 组件挂载时加载数据
onMounted(() => {
  loadRecentUploads()
})
</script>

<style scoped lang="scss">
.upload-view {
  padding: 0;
  background: #f5f7fa;
  min-height: 100vh;
}

// 专业头部区域
.professional-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 40px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  .header-content {
    .header-title {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 28px;
      font-weight: 600;
      margin: 0 0 8px 0;
      
      .title-icon {
        font-size: 32px;
      }
    }
    
    .header-subtitle {
      font-size: 16px;
      opacity: 0.9;
      margin: 0;
    }
  }
  
  .header-stats {
    display: flex;
    gap: 32px;
    
    .stat-item {
      text-align: center;
      
      .stat-value {
        display: block;
        font-size: 32px;
        font-weight: 700;
        line-height: 1;
      }
      
      .stat-label {
        font-size: 14px;
        opacity: 0.8;
      }
    }
  }
}

// 上传容器
.upload-container {
  padding: 32px 24px;
  max-width: 1200px;
  margin: 0 auto;
  
  .upload-area-wrapper {
    margin-bottom: 32px;
    
    .upload-area {
      background: white;
      border: 2px dashed #e1e5e9;
      border-radius: 12px;
      padding: 48px 24px;
      text-align: center;
      transition: all 0.3s ease;
      
      &:hover {
        border-color: #0052d9;
        box-shadow: 0 8px 24px rgba(0, 82, 217, 0.1);
      }
      
      .upload-icon {
        color: #0052d9;
        margin-bottom: 16px;
      }
      
      .upload-title {
        font-size: 20px;
        font-weight: 600;
        color: #1d2129;
        margin: 0 0 8px 0;
      }
      
      .upload-description {
        color: #86909c;
        font-size: 14px;
        margin: 0 0 24px 0;
      }
      
      .upload-btn {
        border-color: #0052d9;
        color: #0052d9;
      }
    }
  }
}

// 最近上传区域
.recent-uploads-section {
  max-width: 1200px;
  margin: 0 auto 32px;
  padding: 0 24px;
  
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    
    .section-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 20px;
      font-weight: 600;
      color: #1d2129;
      margin: 0;
    }
  }
  
  .upload-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
    
    .upload-item-card {
      background: white;
      border-radius: 8px;
      padding: 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
      transition: all 0.3s ease;
      
      &:hover {
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
        transform: translateY(-2px);
      }
      
      &.status-completed {
        border-left: 4px solid #00a870;
      }
      
      &.status-processing {
        border-left: 4px solid #ed7b2f;
      }
      
      &.status-failed {
        border-left: 4px solid #e34d59;
      }
      
      &.status-pending {
        border-left: 4px solid #0052d9;
      }
      
      .file-info-section {
        display: flex;
        align-items: center;
        gap: 16px;
        flex: 1;
        
        .file-icon {
          color: #0052d9;
        }
        
        .file-details {
          .file-name {
            font-size: 16px;
            font-weight: 500;
            color: #1d2129;
            margin: 0 0 4px 0;
          }
          
          .file-meta {
            display: flex;
            gap: 16px;
            font-size: 12px;
            color: #86909c;
          }
        }
      }
      
      .status-section {
        margin: 0 24px;
      }
      
      .actions-section {
        display: flex;
        gap: 8px;
      }
    }
  }
}

// 分析内容样式
.analysis-content {
  max-height: 70vh;
  overflow-y: auto;
  
  .analysis-overview {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 24px;
    margin-bottom: 32px;
    
    .overview-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px;
      background: #f5f7fa;
      border-radius: 8px;
      
      .overview-label {
        font-size: 12px;
        color: #86909c;
        margin-bottom: 4px;
      }
      
      .overview-value {
        font-size: 14px;
        font-weight: 500;
        color: #1d2129;
      }
    }
  }
  
  .analysis-section {
    margin-bottom: 24px;
    
    .key-terms-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 12px;
      
      .term-card {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 12px;
        background: #f5f7fa;
        border-radius: 6px;
        font-size: 14px;
        color: #1d2129;
      }
    }
    
    .risk-points-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
      
      .risk-item {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        padding: 16px;
        background: #fff7e6;
        border-radius: 6px;
        
        .risk-icon {
          color: #ed7b2f;
          margin-top: 2px;
        }
        
        .risk-content {
          .risk-title {
            font-weight: 500;
            color: #1d2129;
            margin-bottom: 4px;
          }
          
          .risk-description {
            font-size: 14px;
            color: #86909c;
          }
        }
      }
    }
    
    .date-content {
      .date-title {
        font-weight: 500;
        color: #1d2129;
        margin-bottom: 4px;
      }
      
      .date-description {
        font-size: 14px;
        color: #86909c;
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .professional-header {
    flex-direction: column;
    text-align: center;
    gap: 24px;
    padding: 32px 16px;
    
    .header-content {
      .header-title {
        font-size: 24px;
        justify-content: center;
      }
    }
    
    .header-stats {
      gap: 24px;
      
      .stat-item {
        .stat-value {
          font-size: 24px;
        }
      }
    }
  }
  
  .upload-container {
    padding: 24px 16px;
  }
  
  .recent-uploads-section {
    padding: 0 16px;
    
    .upload-item-card {
      flex-direction: column;
      align-items: stretch;
      gap: 16px;
      
      .file-info-section {
        .file-details {
          .file-meta {
            flex-direction: column;
            gap: 4px;
          }
        }
      }
      
      .status-section {
        margin: 0;
        align-self: flex-start;
      }
      
      .actions-section {
        justify-content: center;
      }
    }
  }
  
  .analysis-overview {
    grid-template-columns: 1fr !important;
  }
}

@media (max-width: 480px) {
  .upload-area {
    padding: 32px 16px !important;
  }
}
</style>