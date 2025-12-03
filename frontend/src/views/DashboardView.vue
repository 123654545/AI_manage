<!-- E:\HTML_learning\AI_manage3\frontend\src\views\DashboardView.vue -->
<template>
  <div class="dashboard-container">
    <!-- 专业版顶部导航栏 -->
    <t-header class="professional-header">
      <div class="header-content">
        <div class="header-left">
          <div class="logo">
            <t-icon name="file-1" class="logo-icon" />
            <span class="logo-text">AI合同分析系统</span>
            <t-tag theme="primary" size="small" variant="light">专业版</t-tag>
          </div>
        </div>
        <div class="header-center">
          <t-nav
            :value="activeNav"
            @change="handleNavChange"
            theme="light"
            size="large"
          >
            <t-nav-item value="dashboard">
              <template #icon>
                <t-icon name="dashboard-1" />
              </template>
              仪表盘
            </t-nav-item>
            <t-nav-item value="contracts">
              <template #icon>
                <t-icon name="file-1" />
              </template>
              合同管理
            </t-nav-item>
            <t-nav-item value="upload">
              <template #icon>
                <t-icon name="upload-1" />
              </template>
              合同上传
            </t-nav-item>
            <t-nav-item value="analytics">
              <template #icon>
                <t-icon name="chart-line" />
              </template>
              统计分析
            </t-nav-item>
          </t-nav>
        </div>
        <div class="header-right">
          <t-space :size="16" align="center">
            <t-badge count="3" theme="danger" offset="[-5, 5]">
              <t-button theme="default" variant="text" shape="circle">
                <t-icon name="notification" />
              </t-button>
            </t-badge>
            <t-dropdown :options="userMenuOptions" @click="handleUserMenuClick">
              <t-button theme="default" variant="text">
                <t-avatar :image="userAvatar" size="small">
                  {{ authStore.user?.email?.charAt(0).toUpperCase() }}
                </t-avatar>
                <span class="user-email">{{ authStore.user?.email }}</span>
                <t-icon name="chevron-down" />
              </t-button>
            </t-dropdown>
          </t-space>
        </div>
      </div>
    </t-header>
      
      <!-- 专业版主内容区 -->
      <t-content class="professional-content">
        <!-- 欢迎横幅 -->
        <t-card class="welcome-banner" :bordered="false">
          <div class="banner-content">
            <div class="banner-text">
              <h2>欢迎使用AI合同分析系统专业版</h2>
              <p>智能解析合同条款，自动识别风险点，助力企业高效管理</p>
            </div>
            <div class="banner-actions">
              <t-button theme="primary" @click="goToUpload">
                <template #icon>
                  <t-icon name="upload-1" />
                </template>
                上传新合同
              </t-button>
              <t-button theme="default" @click="goToAnalytics">
                <template #icon>
                  <t-icon name="chart-line" />
                </template>
                查看分析报告
              </t-button>
            </div>
          </div>
        </t-card>

        <!-- 数据概览 -->
        <div class="data-overview">
          <t-row :gutter="16">
            <t-col :span="6">
              <t-card class="stat-card" :bordered="false">
                <div class="stat-content">
                  <div class="stat-icon primary">
                    <t-icon name="file-1" />
                  </div>
                  <div class="stat-info">
                    <div class="stat-number">{{ stats.totalContracts || 0 }}</div>
                    <div class="stat-label">总合同数</div>
                    <div class="stat-trend">
                      <t-icon name="trending-up" class="trend-up" />
                      <span class="trend-text">+12% 本月</span>
                    </div>
                  </div>
                </div>
              </t-card>
            </t-col>
            <t-col :span="6">
              <t-card class="stat-card" :bordered="false">
                <div class="stat-content">
                  <div class="stat-icon warning">
                    <t-icon name="clock" />
                  </div>
                  <div class="stat-info">
                    <div class="stat-number">{{ stats.pendingContracts || 0 }}</div>
                    <div class="stat-label">待分析</div>
                    <div class="stat-trend">
                      <t-icon name="trending-down" class="trend-down" />
                      <span class="trend-text">-5% 本周</span>
                    </div>
                  </div>
                </div>
              </t-card>
            </t-col>
            <t-col :span="6">
              <t-card class="stat-card" :bordered="false">
                <div class="stat-content">
                  <div class="stat-icon info">
                    <t-icon name="loading" />
                  </div>
                  <div class="stat-info">
                    <div class="stat-number">{{ stats.analyzingContracts || 0 }}</div>
                    <div class="stat-label">分析中</div>
                    <div class="stat-trend">
                      <t-icon name="trending-up" class="trend-up" />
                      <span class="trend-text">+8% 今日</span>
                    </div>
                  </div>
                </div>
              </t-card>
            </t-col>
            <t-col :span="6">
              <t-card class="stat-card" :bordered="false">
                <div class="stat-content">
                  <div class="stat-icon success">
                    <t-icon name="check-circle" />
                  </div>
                  <div class="stat-info">
                    <div class="stat-number">{{ stats.completedContracts || 0 }}</div>
                    <div class="stat-label">已完成</div>
                    <div class="stat-trend">
                      <t-icon name="trending-up" class="trend-up" />
                      <span class="trend-text">+15% 本月</span>
                    </div>
                  </div>
                </div>
              </t-card>
            </t-col>
          </t-row>
        </div>

        <!-- 快速操作面板 -->
        <div class="quick-actions">
          <t-row :gutter="16">
            <t-col :span="8">
              <t-card class="action-card" :bordered="false">
                <div class="action-content">
                  <t-icon name="bar-chart" class="action-icon" />
                  <div class="action-text">
                    <h4>合同分析报告</h4>
                    <p>查看详细的分析统计和趋势</p>
                  </div>
                  <t-button theme="primary" variant="text" @click="goToAnalytics">
                    查看报告
                  </t-button>
                </div>
              </t-card>
            </t-col>
            <t-col :span="8">
              <t-card class="action-card" :bordered="false">
                <div class="action-content">
                  <t-icon name="warning" class="action-icon" />
                  <div class="action-text">
                    <h4>风险合同预警</h4>
                    <p>发现高风险合同并及时处理</p>
                  </div>
                  <t-button theme="warning" variant="text" @click="viewRiskContracts">
                    查看风险
                  </t-button>
                </div>
              </t-card>
            </t-col>
            <t-col :span="8">
              <t-card class="action-card" :bordered="false">
                <div class="action-content">
                  <t-icon name="settings" class="action-icon" />
                  <div class="action-text">
                    <h4>系统设置</h4>
                    <p>配置分析参数和通知设置</p>
                  </div>
                  <t-button theme="default" variant="text" @click="openSettings">
                    系统设置
                  </t-button>
                </div>
              </t-card>
            </t-col>
          </t-row>
        </div>

        <!-- 最近合同列表 -->
        <t-card class="recent-contracts">
          <template #header>
            <div class="contracts-header">
              <h3>最近合同</h3>
              <t-space>
                <t-button theme="primary" @click="goToUpload">
                  <template #icon>
                    <t-icon name="upload-1" />
                  </template>
                  上传新合同
                </t-button>
                <t-button theme="default" @click="goToContracts">
                  <template #icon>
                    <t-icon name="list" />
                  </template>
                  查看全部
                </t-button>
              </t-space>
            </div>
          </template>

          <!-- 搜索和筛选 -->
          <div class="filter-section">
            <t-row :gutter="16">
              <t-col :span="6">
                <t-input
                  v-model="filters.search"
                  placeholder="搜索合同名称"
                  clearable
                  @clear="handleSearch"
                  @enter="handleSearch"
                >
                  <template #prefix-icon>
                    <t-icon name="search" />
                  </template>
                </t-input>
              </t-col>
              <t-col :span="4">
                <t-select
                  v-model="filters.status"
                  placeholder="分析状态"
                  clearable
                  @change="handleFilter"
                  :options="statusOptions"
                />
              </t-col>
              <t-col :span="2">
                <t-button theme="primary" @click="handleSearch" :loading="loading">
                  <template #icon>
                    <t-icon name="search" />
                  </template>
                  搜索
                </t-button>
              </t-col>
            </t-row>
          </div>

          <!-- 合同列表 -->
          <t-table
            :data="contracts"
            :loading="loading"
            empty="暂无合同数据"
            @row-click="viewContract"
            :columns="contractColumns"
            row-key="id"
            size="medium"
            hover
          />

          <!-- 分页 -->
          <div class="pagination-wrapper" v-if="pagination.total > pagination.size">
            <t-pagination
              v-model="pagination.page"
              v-model:pageSize="pagination.size"
              :total="pagination.total"
              :pageSizeOptions="[10, 20, 50]"
              @change="handlePaginationChange"
            />
          </div>
        </t-card>
      </t-content>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { contractAPI } from '@/services/api'
import { MessagePlugin } from 'tdesign-vue-next'

const router = useRouter()
const authStore = useAuthStore()

// 导航状态
const activeNav = ref('dashboard')

// 用户菜单选项
const userMenuOptions = ref([
  { content: '个人中心', value: 'profile' },
  { content: '系统设置', value: 'settings' },
  { divider: true },
  { content: '退出登录', value: 'logout' }
])

// 状态选项
const statusOptions = ref([
  { label: '全部状态', value: '' },
  { label: '待分析', value: 'pending' },
  { label: '分析中', value: 'analyzing' },
  { label: '已完成', value: 'completed' }
])

// 统计数据
const stats = ref({
  totalContracts: 0,
  pendingContracts: 0,
  analyzingContracts: 0,
  completedContracts: 0
})

// 合同列表数据
const loading = ref(false)
const contracts = ref<any[]>([])

// 筛选条件
const filters = reactive({
  search: '',
  status: ''
})

// 分页信息
const pagination = reactive({
  page: 1,
  size: 10,
  total: 0
})

// 合同列表列配置
const contractColumns = ref([
  {
    colKey: 'title',
    title: '合同名称',
    width: 300,
    cell: (h: any, { row }: any) => {
      return h('div', { class: 'contract-title' }, [
        h('t-icon', { name: 'file-1', class: 'contract-icon' }),
        h('span', {}, row.originalName || row.fileName)
      ])
    }
  },
  {
    colKey: 'type',
    title: '类型',
    width: 120,
    cell: (h: any, { row }: any) => {
      const typeMap: Record<string, any> = {
        '劳动合同': { theme: 'primary', label: '劳动合同' },
        '采购合同': { theme: 'success', label: '采购合同' },
        '销售合同': { theme: 'warning', label: '销售合同' },
        '租赁合同': { theme: 'info', label: '租赁合同' }
      }
      const typeInfo = typeMap[row.type] || { theme: 'default', label: row.type || '其他' }
      return h('t-tag', { theme: typeInfo.theme, size: 'small', variant: 'light' }, typeInfo.label)
    }
  },
  {
    colKey: 'analysisStatus',
    title: '分析状态',
    width: 120,
    cell: (h: any, { row }: any) => {
      const statusMap: Record<string, any> = {
        'pending': { theme: 'warning', label: '待分析' },
        'analyzing': { theme: 'primary', label: '分析中' },
        'completed': { theme: 'success', label: '已完成' },
        'failed': { theme: 'danger', label: '分析失败' }
      }
      const statusInfo = statusMap[row.analysisStatus] || { theme: 'default', label: row.analysisStatus || '待分析' }
      return h('t-tag', { theme: statusInfo.theme, size: 'small', variant: 'light' }, statusInfo.label)
    }
  },
  {
    colKey: 'uploadedAt',
    title: '上传时间',
    width: 180,
    cell: (h: any, { row }: any) => {
      return formatDate(row.uploadedAt)
    }
  },
  {
    colKey: 'fileSize',
    title: '文件大小',
    width: 100,
    cell: (h: any, { row }: any) => {
      return formatFileSize(row.fileSize)
    }
  },
  {
    colKey: 'actions',
    title: '操作',
    width: 150,
    fixed: 'right',
    cell: (h: any, { row }: any) => {
      const buttons = [
        h('t-button', {
          theme: 'primary',
          size: 'small',
          onClick: () => viewContract(row)
        }, '查看')
      ]
      
      if (row.analysisStatus === 'pending') {
        buttons.push(
          h('t-button', {
            theme: 'success',
            size: 'small',
            onClick: () => startAnalysis(row)
          }, '分析')
        )
      }
      
      return h('t-space', {}, buttons)
    }
  }
])

// 用户头像计算属性
const userAvatar = computed(() => {
  return authStore.user?.avatar || ''
})

// 导航切换
const handleNavChange = (value: string) => {
  activeNav.value = value
  switch (value) {
    case 'contracts':
      router.push('/contracts')
      break
    case 'upload':
      router.push('/upload')
      break
    case 'analytics':
      MessagePlugin.info('统计分析功能开发中')
      break
  }
}

// 用户菜单点击
const handleUserMenuClick = (data: any) => {
  switch (data.value) {
    case 'profile':
      MessagePlugin.info('个人中心功能开发中')
      break
    case 'settings':
      MessagePlugin.info('系统设置功能开发中')
      break
    case 'logout':
      handleLogout()
      break
  }
}

// 加载统计数据和合同列表
const loadData = async () => {
  await Promise.all([loadStats(), fetchContracts()])
}

// 加载统计数据
const loadStats = async () => {
  try {
    const response = await contractAPI.getContracts()
    if (response.success) {
      const contracts = response.data || []
      
      stats.value.totalContracts = contracts.length
      stats.value.pendingContracts = contracts.filter(c => c.analysisStatus === 'pending' || !c.analysisStatus).length
      stats.value.analyzingContracts = contracts.filter(c => c.analysisStatus === 'analyzing').length
      stats.value.completedContracts = contracts.filter(c => c.analysisStatus === 'completed').length
    }
  } catch (error) {
    console.error('加载统计数据失败:', error)
  }
}

// 获取合同列表
const fetchContracts = async () => {
  try {
    loading.value = true
    const response = await contractAPI.getContracts({
      page: pagination.page,
      size: pagination.size,
      search: filters.search,
      status: filters.status
    })
    
    contracts.value = response.data?.contracts || response.data || []
    pagination.total = contracts.value.length
  } catch (error: any) {
    console.error('获取合同列表失败:', error)
    contracts.value = []
    pagination.total = 0
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.page = 1
  fetchContracts()
}

// 筛选
const handleFilter = () => {
  pagination.page = 1
  fetchContracts()
}

// 分页处理
const handlePaginationChange = (pageInfo: any) => {
  pagination.page = pageInfo.current
  pagination.size = pageInfo.pageSize
  fetchContracts()
}

// 查看合同详情
const viewContract = (contract: any) => {
  router.push(`/contracts/${contract.id}`)
}

// 开始分析
const startAnalysis = async (contract: any) => {
  try {
    await contractAPI.startAnalysis(contract.id)
    MessagePlugin.success('分析已开始')
    await Promise.all([fetchContracts(), loadStats()])
  } catch (error: any) {
    console.error('启动分析失败:', error)
    MessagePlugin.error(error.message || '启动分析失败')
  }
}

// 格式化日期
const formatDate = (date: string) => {
  return new Date(date).toLocaleString('zh-CN')
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

// 退出登录
const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}

// 页面跳转函数
const goToUpload = () => {
  router.push('/upload')
}

const goToContracts = () => {
  router.push('/contracts')
}

const goToAnalytics = () => {
  MessagePlugin.info('统计分析功能开发中')
}

const viewRiskContracts = () => {
  MessagePlugin.info('风险合同查看功能开发中')
}

const openSettings = () => {
  MessagePlugin.info('系统设置功能开发中')
}

onMounted(() => {
  loadData()
})

import { onActivated } from 'vue'
onActivated(() => {
  loadData()
})
</script>

<style scoped lang="scss">
.dashboard-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
}

// 专业版头部样式
.professional-header {
  background: linear-gradient(135deg, #0052d9 0%, #4364f7 50%, #6fb1fc 100%);
  box-shadow: 0 4px 12px rgba(0, 82, 217, 0.15);
  
  .header-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 24px;
    height: 64px;
  }
  
  .header-left {
    .logo {
      display: flex;
      align-items: center;
      gap: 12px;
      
      .logo-icon {
        font-size: 28px;
        color: white;
      }
      
      .logo-text {
        font-size: 20px;
        font-weight: 600;
        color: white;
        letter-spacing: 0.5px;
      }
    }
  }
  
  .header-center {
    flex: 1;
    max-width: 500px;
    margin: 0 32px;
    
    :deep(.t-nav) {
      background: transparent;
      
      .t-nav-item {
        color: rgba(255, 255, 255, 0.8);
        
        &:hover,
        &.t-is-active {
          color: white;
          background: rgba(255, 255, 255, 0.1);
        }
      }
    }
  }
  
  .header-right {
    .user-email {
      color: white;
      margin: 0 8px;
      font-size: 14px;
    }
    
    :deep(.t-button) {
      color: white;
      
      &:hover {
        background: rgba(255, 255, 255, 0.1);
      }
    }
  }
}

// 主内容区
.professional-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}

// 欢迎横幅
.welcome-banner {
  background: linear-gradient(135deg, #0052d9 0%, #4364f7 100%);
  color: white;
  margin-bottom: 24px;
  
  .banner-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 32px 40px;
    
    .banner-text {
      h2 {
        margin: 0 0 8px 0;
        font-size: 28px;
        font-weight: 600;
      }
      
      p {
        margin: 0;
        font-size: 16px;
        opacity: 0.9;
      }
    }
    
    .banner-actions {
      display: flex;
      gap: 16px;
    }
  }
}

// 数据概览
.data-overview {
  margin-bottom: 24px;
  
  .stat-card {
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    transition: all 0.3s ease;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
    }
    
    .stat-content {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 20px;
      
      .stat-icon {
        width: 64px;
        height: 64px;
        border-radius: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 28px;
        color: white;
        
        &.primary {
          background: linear-gradient(135deg, #0052d9, #4364f7);
        }
        
        &.warning {
          background: linear-gradient(135deg, #e37318, #ed7b2d);
        }
        
        &.info {
          background: linear-gradient(135deg, #00a870, #00ba7c);
        }
        
        &.success {
          background: linear-gradient(135deg, #00a870, #00ba7c);
        }
      }
      
      .stat-info {
        flex: 1;
        
        .stat-number {
          font-size: 32px;
          font-weight: 700;
          color: #1d2129;
          line-height: 1;
          margin-bottom: 4px;
        }
        
        .stat-label {
          font-size: 14px;
          color: #86909c;
          margin-bottom: 8px;
        }
        
        .stat-trend {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          
          .trend-up {
            color: #00ba7c;
          }
          
          .trend-down {
            color: #f53f3f;
          }
          
          .trend-text {
            color: #86909c;
          }
        }
      }
    }
  }
}

// 快速操作面板
.quick-actions {
  margin-bottom: 24px;
  
  .action-card {
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    transition: all 0.3s ease;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
    }
    
    .action-content {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 20px;
      
      .action-icon {
        font-size: 32px;
        color: #0052d9;
        width: 48px;
        height: 48px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(0, 82, 217, 0.1);
        border-radius: 12px;
      }
      
      .action-text {
        flex: 1;
        
        h4 {
          margin: 0 0 4px 0;
          font-size: 16px;
          font-weight: 600;
          color: #1d2129;
        }
        
        p {
          margin: 0;
          font-size: 14px;
          color: #86909c;
        }
      }
    }
  }
}

// 最近合同列表
.recent-contracts {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  
  :deep(.t-card__header) {
    padding: 20px 24px;
    border-bottom: 1px solid #f2f3f5;
    
    .contracts-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      
      h3 {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
        color: #1d2129;
      }
    }
  }
  
  .filter-section {
    padding: 20px 24px 0;
    margin-bottom: 0;
  }
  
  :deep(.t-table) {
    .contract-title {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      transition: color 0.2s;
      
      &:hover {
        color: #0052d9;
      }
      
      .contract-icon {
        color: #86909c;
      }
    }
  }
  
  .pagination-wrapper {
    padding: 20px 24px;
    border-top: 1px solid #f2f3f5;
    display: flex;
    justify-content: center;
  }
}

// 响应式设计
@media (max-width: 768px) {
  .professional-content {
    padding: 16px;
  }
  
  .welcome-banner {
    .banner-content {
      flex-direction: column;
      text-align: center;
      gap: 20px;
      padding: 24px;
      
      .banner-actions {
        justify-content: center;
      }
    }
  }
  
  .data-overview .t-col,
  .quick-actions .t-col {
    margin-bottom: 16px;
  }
  
  .contracts-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
    text-align: center;
  }
}
</style>