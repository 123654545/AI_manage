<template>
  <div class="contract-detail">
    <!-- 专业头部 -->
    <div class="professional-header">
      <div class="header-content">
        <div class="breadcrumb">
          <t-button variant="text" @click="goBack">
            <t-icon name="chevron-left" />
            合同列表
          </t-button>
          <span class="breadcrumb-separator">/</span>
          <span class="current-page">合同详情</span>
        </div>
        <h1 class="header-title">
          <t-icon name="file-text" class="title-icon" />
          {{ contract.originalName || contract.fileName || '合同详情' }}
        </h1>
      </div>
      
      <div class="header-actions">
        <t-button 
          v-if="contract.analysisStatus === 'pending'" 
          theme="success" 
          @click="startAnalysis"
          size="large"
        >
          <t-icon name="play" />
          开始分析
        </t-button>
        <t-button 
          variant="outline" 
          @click="downloadContract"
          size="large"
        >
          <t-icon name="download" />
          下载文件
        </t-button>
      </div>
    </div>

    <!-- 主要内容 -->
    <div class="main-content">
      <!-- 基本信息卡片 -->
      <t-card class="info-card" header="合同基本信息">
        <div class="info-grid">
          <div class="info-section">
            <div class="info-item">
              <label class="info-label">合同名称</label>
              <span class="info-value">{{ contract.originalName || contract.fileName || '未命名' }}</span>
            </div>
            <div class="info-item">
              <label class="info-label">合同类型</label>
              <t-tag 
                :theme="getTypeTagTheme(contract.type)"
                variant="light"
                size="medium"
              >
                {{ contract.type || '未分类' }}
              </t-tag>
            </div>
            <div class="info-item">
              <label class="info-label">分析状态</label>
              <t-tag 
                :theme="getStatusTagTheme(contract.analysisStatus)"
                variant="light"
                size="medium"
              >
                {{ getStatusText(contract.analysisStatus) }}
              </t-tag>
            </div>
          </div>
          
          <div class="info-section">
            <div class="info-item">
              <label class="info-label">文件大小</label>
              <span class="info-value">{{ formatFileSize(contract.fileSize) }}</span>
            </div>
            <div class="info-item">
              <label class="info-label">上传时间</label>
              <span class="info-value">{{ formatDate(contract.uploadedAt) }}</span>
            </div>
            <div class="info-item">
              <label class="info-label">最后更新</label>
              <span class="info-value">{{ formatDate(contract.updatedAt) }}</span>
            </div>
          </div>
        </div>
      </t-card>

      <!-- 分析结果区域 -->
      <div v-if="contract.analysis" class="analysis-section">
        <t-card class="analysis-card" header="AI智能分析报告">
          <template #subtitle>
            <div class="analysis-subtitle">
              <t-icon name="ai" size="16px" />
              <span>分析时间：{{ formatDate(contract.analysis.analyzedAt) }}</span>
              <t-tag size="small" variant="light" theme="primary">
                {{ contract.analysis.aiModel || 'AI模型' }}
              </t-tag>
            </div>
          </template>

          <t-tabs v-model="activeTab" theme="card">
            <t-tab-panel value="keyTerms" label="关键条款">
              <div v-if="contract.analysis.keyTerms && contract.analysis.keyTerms.length > 0" class="terms-grid">
                <div 
                  v-for="(term, index) in formatKeyTerms(contract.analysis.keyTerms)" 
                  :key="index"
                  class="term-card"
                >
                  <t-icon name="file-text" size="20px" class="term-icon" />
                  <div class="term-content">
                    <div class="term-title">{{ term.term }}</div>
                    <div class="term-text">{{ term.content }}</div>
                  </div>
                </div>
              </div>
              <t-empty v-else description="暂无关键条款分析结果">
                <template #icon>
                  <t-icon name="file-text" size="48px" />
                </template>
              </t-empty>
            </t-tab-panel>

            <t-tab-panel value="riskPoints" label="风险识别">
              <div v-if="contract.analysis.riskPoints && contract.analysis.riskPoints.length > 0" class="risks-list">
                <div 
                  v-for="(risk, index) in formatRiskPoints(contract.analysis.riskPoints)" 
                  :key="index"
                  class="risk-item"
                  :class="`risk-${risk.level || 'medium'}`"
                >
                  <div class="risk-header">
                    <t-icon name="warning" size="16px" class="risk-icon" />
                    <span class="risk-title">{{ risk.risk }}</span>
                    <t-tag 
                      :theme="getRiskLevelTagTheme(risk.level)"
                      size="small"
                      variant="light"
                    >
                      {{ risk.level }}
                    </t-tag>
                  </div>
                  <div class="risk-content">
                    <div class="risk-description">{{ risk.description }}</div>
                    <div v-if="risk.suggestion" class="risk-suggestion">
                      <strong>建议：</strong>{{ risk.suggestion }}
                    </div>
                  </div>
                </div>
              </div>
              <t-empty v-else description="暂无风险点分析结果">
                <template #icon>
                  <t-icon name="warning" size="48px" />
                </template>
              </t-empty>
            </t-tab-panel>

            <t-tab-panel value="keyDates" label="关键日期">
              <div v-if="contract.analysis.keyDates && contract.analysis.keyDates.length > 0" class="dates-timeline">
                <t-timeline>
                  <t-timeline-item
                    v-for="(date, index) in formatKeyDates(contract.analysis.keyDates)"
                    :key="index"
                    :label="date.date"
                  >
                    <div class="date-content">
                      <div class="date-event">{{ date.event }}</div>
                      <div v-if="date.importance" class="date-importance">
                        <t-tag 
                          :theme="getImportanceTagTheme(date.importance)"
                          size="small"
                          variant="light"
                        >
                          重要性：{{ date.importance }}
                        </t-tag>
                      </div>
                    </div>
                  </t-timeline-item>
                </t-timeline>
              </div>
              <t-empty v-else description="暂无关键日期分析结果">
                <template #icon>
                  <t-icon name="calendar" size="48px" />
                </template>
              </t-empty>
            </t-tab-panel>

            <t-tab-panel value="rawText" label="原始文本">
              <div v-if="contract.analysis.extractedText" class="text-content">
                <t-textarea
                  v-model="contract.analysis.extractedText"
                  readonly
                  :autosize="{ minRows: 10, maxRows: 20 }"
                  placeholder="无提取文本"
                />
              </div>
              <t-empty v-else description="暂无提取文本">
                <template #icon>
                  <t-icon name="file" size="48px" />
                </template>
              </t-empty>
            </t-tab-panel>
          </t-tabs>
        </t-card>
      </div>

      <!-- 分析状态提示 -->
      <div v-else-if="contract.analysisStatus === 'analyzing'" class="status-card">
        <t-card class="analyzing-card">
          <div class="status-content">
            <t-icon name="loading" size="48px" class="status-icon analyzing" />
            <div class="status-text">
              <h3>AI正在分析合同...</h3>
              <p>请耐心等待分析完成，预计需要1-3分钟</p>
            </div>
          </div>
        </t-card>
      </div>

      <div v-else-if="contract.analysisStatus === 'pending'" class="status-card">
        <t-card class="pending-card">
          <div class="status-content">
            <t-icon name="time" size="48px" class="status-icon pending" />
            <div class="status-text">
              <h3>合同待分析</h3>
              <p>点击"开始分析"按钮，让AI为您深度解析合同内容</p>
            </div>
            <t-button theme="primary" @click="startAnalysis" size="large">
              <t-icon name="play" />
              开始分析
            </t-button>
          </div>
        </t-card>
      </div>

      <div v-else-if="contract.analysisStatus === 'failed'" class="status-card">
        <t-card class="failed-card">
          <div class="status-content">
            <t-icon name="error-circle" size="48px" class="status-icon failed" />
            <div class="status-text">
              <h3>分析失败</h3>
              <p>合同分析过程中出现错误，请重试或联系技术支持</p>
            </div>
            <t-button theme="primary" @click="startAnalysis" size="large">
              <t-icon name="refresh" />
              重新分析
            </t-button>
          </div>
        </t-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { MessagePlugin, DialogPlugin } from 'tdesign-vue-next'
import { contractAPI } from '@/services/api'

const route = useRoute()
const router = useRouter()

const contractId = ref(route.params.id as string)
const contract = ref<any>({})
const activeTab = ref('keyTerms')

// 获取合同详情
const fetchContractDetail = async () => {
  try {
    const response = await contractAPI.getContract(contractId.value)
    contract.value = response.data
  } catch (error: any) {
    console.error('获取合同详情失败:', error)
    MessagePlugin.error(error.message || '获取合同详情失败')
  }
}

// 开始分析
const startAnalysis = async () => {
  try {
    await contractAPI.startAnalysis(contractId.value)
    MessagePlugin.success('分析已开始')
    fetchContractDetail()
  } catch (error: any) {
    console.error('启动分析失败:', error)
    MessagePlugin.error(error.message || '启动分析失败')
  }
}

// 下载合同
const downloadContract = async () => {
  try {
    const response = await contractAPI.downloadContract(contractId.value)
    const url = window.URL.createObjectURL(new Blob([response]))
    const link = document.createElement('a')
    link.href = url
    // 使用fileName作为下载文件名，但去掉时间戳部分以获得更清晰的名称
    let downloadName = contract.value.fileName || 'contract.docx'
    // 移除时间戳部分 (如果存在)
    downloadName = downloadName.replace(/_\d+/, '')
    link.download = downloadName
    link.click()
    window.URL.revokeObjectURL(url)
    MessagePlugin.success('下载成功')
  } catch (error: any) {
    console.error('下载失败:', error)
    MessagePlugin.error('下载失败')
  }
}

// 返回合同列表
const goBack = () => {
  router.push('/contracts')
}

// 格式化数据
const formatKeyTerms = (keyTerms: any) => {
  if (!keyTerms) return []
  if (Array.isArray(keyTerms)) return keyTerms
  return Object.keys(keyTerms).map(key => ({
    term: key,
    content: keyTerms[key]
  }))
}

const formatRiskPoints = (riskPoints: any) => {
  if (!riskPoints) return []
  if (Array.isArray(riskPoints)) return riskPoints
  return Object.keys(riskPoints).map(key => ({
    risk: key,
    ...riskPoints[key]
  }))
}

const formatKeyDates = (keyDates: any) => {
  if (!keyDates) return []
  if (Array.isArray(keyDates)) return keyDates
  return Object.keys(keyDates).map(key => ({
    date: key,
    ...keyDates[key]
  }))
}

// 获取类型标签主题
const getTypeTagTheme = (type: string) => {
  const typeMap: Record<string, string> = {
    '劳动合同': 'primary',
    '采购合同': 'success',
    '销售合同': 'warning',
    '租赁合同': 'default',
    '其他': 'default'
  }
  return typeMap[type] || 'default'
}

// 获取状态标签主题
const getStatusTagTheme = (status: string) => {
  const statusMap: Record<string, string> = {
    'pending': 'warning',
    'analyzing': 'primary',
    'completed': 'success',
    'failed': 'danger'
  }
  return statusMap[status] || 'default'
}

// 获取状态文本
const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    'pending': '待分析',
    'analyzing': '分析中',
    'completed': '已完成',
    'failed': '分析失败'
  }
  return statusMap[status] || status
}

// 获取风险等级标签主题
const getRiskLevelTagTheme = (level: string) => {
  const levelMap: Record<string, string> = {
    '高': 'danger',
    '中': 'warning',
    '低': 'success'
  }
  return levelMap[level] || 'default'
}

// 获取重要性标签主题
const getImportanceTagTheme = (importance: string) => {
  const importanceMap: Record<string, string> = {
    '高': 'danger',
    '中': 'warning',
    '低': 'success'
  }
  return importanceMap[importance] || 'default'
}

// 格式化日期
const formatDate = (date: string) => {
  return date ? new Date(date).toLocaleString('zh-CN') : '未知'
}

// 格式化文件大小
const formatFileSize = (size: number) => {
  if (!size) return '未知'
  const units = ['B', 'KB', 'MB', 'GB']
  let unitIndex = 0
  let fileSize = size
  
  while (fileSize >= 1024 && unitIndex < units.length - 1) {
    fileSize /= 1024
    unitIndex++
  }
  
  return `${fileSize.toFixed(1)} ${units[unitIndex]}`
}

// 页面加载时获取数据
onMounted(() => {
  fetchContractDetail()
})
</script>

<style scoped lang="scss">
.contract-detail {
  min-height: 100vh;
  background: #f5f7fa;
}

// 专业头部
.professional-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 24px 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  .header-content {
    .breadcrumb {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 12px;
      font-size: 14px;
      opacity: 0.8;
      
      .breadcrumb-separator {
        opacity: 0.5;
      }
    }
    
    .header-title {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 28px;
      font-weight: 600;
      margin: 0;
      
      .title-icon {
        font-size: 32px;
      }
    }
  }
  
  .header-actions {
    display: flex;
    gap: 16px;
  }
}

// 主内容区域
.main-content {
  padding: 32px 40px;
  max-width: 1400px;
  margin: 0 auto;
}

// 信息卡片
.info-card {
  margin-bottom: 32px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border-radius: 8px;
  overflow: hidden;
  
  .info-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 32px;
    
    .info-section {
      display: flex;
      flex-direction: column;
      gap: 16px;
      
      .info-item {
        display: flex;
        align-items: center;
        gap: 16px;
        
        .info-label {
          min-width: 80px;
          color: #86909c;
          font-size: 14px;
        }
        
        .info-value {
          font-size: 16px;
          color: #1d2129;
          font-weight: 500;
        }
      }
    }
  }
}

// 分析区域
.analysis-section {
  margin-bottom: 32px;
  
  .analysis-card {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    border-radius: 8px;
    overflow: hidden;
    
    .analysis-subtitle {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      color: #86909c;
      
      span {
        margin-left: 4px;
      }
    }
    
    .terms-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
      gap: 16px;
      
      .term-card {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        padding: 16px;
        background: #f5f7fa;
        border-radius: 6px;
        transition: all 0.3s ease;
        
        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        }
        
        .term-icon {
          color: #0052d9;
          margin-top: 2px;
        }
        
        .term-content {
          .term-title {
            font-weight: 500;
            color: #1d2129;
            margin-bottom: 8px;
          }
          
          .term-text {
            font-size: 14px;
            color: #4e5969;
            line-height: 1.5;
          }
        }
      }
    }
    
    .risks-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
      
      .risk-item {
        padding: 16px;
        border-radius: 6px;
        transition: all 0.3s ease;
        
        &.risk-高 {
          background: rgba(227, 77, 89, 0.1);
          border-left: 4px solid #e34d59;
        }
        
        &.risk-中 {
          background: rgba(237, 123, 47, 0.1);
          border-left: 4px solid #ed7b2f;
        }
        
        &.risk-低 {
          background: rgba(0, 168, 112, 0.1);
          border-left: 4px solid #00a870;
        }
        
        .risk-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
          
          .risk-icon {
            color: #ed7b2f;
          }
          
          .risk-title {
            font-weight: 500;
            color: #1d2129;
          }
        }
        
        .risk-content {
          .risk-description {
            font-size: 14px;
            color: #4e5969;
            line-height: 1.5;
            margin-bottom: 8px;
          }
          
          .risk-suggestion {
            font-size: 14px;
            color: #4e5969;
            padding-top: 8px;
            border-top: 1px dashed #e7e7e7;
          }
        }
      }
    }
    
    .dates-timeline {
      padding: 16px 0;
    }
    
    .date-content {
      .date-event {
        font-weight: 500;
        color: #1d2129;
        margin-bottom: 4px;
      }
    }
    
    .text-content {
      padding: 0 8px;
    }
  }
}

// 状态卡片
.status-card {
  margin-bottom: 32px;
  
  .status-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 48px 0;
    text-align: center;
    gap: 16px;
    
    .status-icon {
      &.analyzing {
        color: #0052d9;
        animation: rotate 2s linear infinite;
      }
      
      &.pending {
        color: #ed7b2f;
      }
      
      &.failed {
        color: #e34d59;
      }
    }
    
    .status-text {
      h3 {
        font-size: 20px;
        font-weight: 600;
        color: #1d2129;
        margin: 0 0 8px 0;
      }
      
      p {
        font-size: 16px;
        color: #86909c;
        margin: 0;
      }
    }
  }
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

// 响应式设计
@media (max-width: 768px) {
  .professional-header {
    flex-direction: column;
    gap: 16px;
    padding: 24px 16px;
    text-align: center;
    
    .header-content {
      width: 100%;
      
      .breadcrumb {
        justify-content: center;
      }
      
      .header-title {
        justify-content: center;
        font-size: 24px;
        
        .title-icon {
          font-size: 28px;
        }
      }
    }
    
    .header-actions {
      width: 100%;
      justify-content: center;
    }
  }
  
  .main-content {
    padding: 24px 16px;
  }
  
  .info-grid {
    grid-template-columns: 1fr !important;
    gap: 24px !important;
  }
  
  .terms-grid {
    grid-template-columns: 1fr !important;
  }
}
</style>