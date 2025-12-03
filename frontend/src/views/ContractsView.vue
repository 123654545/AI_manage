<template>
  <div class="contracts-container">
    <!-- 专业版顶部导航栏 -->
    <t-layout>
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

      <!-- 主内容区 -->
      <t-content class="professional-content">
        <!-- 页面标题和操作按钮 -->
        <div class="page-header">
          <div class="header-info">
            <h1 class="page-title">合同管理</h1>
            <p class="page-description">专业的企业合同管理系统，支持批量操作和智能分析</p>
          </div>
          <div class="header-actions">
            <t-space>
              <t-button theme="primary" @click="goToUpload">
                <template #icon>
                  <t-icon name="upload-1" />
                </template>
                上传合同
              </t-button>
              <t-button theme="default" @click="batchAnalyze">
                <template #icon>
                  <t-icon name="play-circle" />
                </template>
                批量分析
              </t-button>
              <t-button theme="default" @click="exportData">
                <template #icon>
                  <t-icon name="download" />
                </template>
                导出数据
              </t-button>
            </t-space>
          </div>
        </div>

        <!-- 高级筛选区域 -->
        <t-card class="advanced-filter">
          <div class="filter-content">
            <t-row :gutter="16">
              <t-col :span="6">
                <t-input
                  v-model="filters.search"
                  placeholder="搜索合同名称、关键词或内容"
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
                  v-model="filters.type"
                  placeholder="合同类型"
                  clearable
                  @change="handleFilter"
                  :options="typeOptions"
                />
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
              <t-col :span="4">
                <t-date-range-picker
                  v-model="filters.dateRange"
                  placeholder="上传时间"
                  clearable
                  @change="handleDateChange"
                />
              </t-col>
              <t-col :span="3">
                <t-button theme="primary" @click="handleSearch" :loading="loading">
                  <template #icon>
                    <t-icon name="search" />
                  </template>
                  搜索
                </t-button>
              </t-col>
              <t-col :span="3">
                <t-button theme="default" variant="outline" @click="resetFilters">
                  <template #icon>
                    <t-icon name="refresh" />
                  </template>
                  重置
                </t-button>
              </t-col>
            </t-row>
          </div>
        </t-card>

        <!-- 批量操作栏 -->
        <div v-if="selectedContracts.length > 0" class="batch-actions">
          <t-card class="batch-card">
            <div class="batch-content">
              <t-space align="center">
                <span class="batch-text">已选择 {{ selectedContracts.length }} 个合同</span>
                <t-button theme="primary" size="small" @click="batchAnalyzeSelected">
                  批量分析
                </t-button>
                <t-button theme="default" size="small" @click="batchDownload">
                  批量下载
                </t-button>
                <t-button theme="danger" size="small" @click="batchDelete">
                  批量删除
                </t-button>
                <t-button theme="default" size="small" variant="text" @click="clearSelection">
                  取消选择
                </t-button>
              </t-space>
            </div>
          </t-card>
        </div>

        <!-- 合同列表 -->
        <t-card class="contracts-table">
          <template #header>
            <div class="table-header">
              <div class="header-left">
                <h3>合同列表</h3>
                <span class="list-count">共 {{ pagination.total }} 条记录</span>
              </div>
              <div class="header-right">
                <t-space>
                  <t-button theme="default" variant="outline" @click="toggleColumnSettings">
                    <template #icon>
                      <t-icon name="setting" />
                    </template>
                    列设置
                  </t-button>
                  <t-button theme="default" variant="outline" @click="refreshData">
                    <template #icon>
                      <t-icon name="refresh" />
                    </template>
                    刷新
                  </t-button>
                </t-space>
              </div>
            </div>
          </template>

          <!-- 合同列表 -->
          <t-table
            :data="contracts"
            :loading="loading"
            empty="暂无合同数据"
            :columns="contractColumns"
            row-key="id"
            size="medium"
            hover
            select-on-row-click
            :selected-row-keys="selectedRowKeys"
            @select-change="handleSelectionChange"
          />

          <!-- 分页 -->
          <div class="pagination-wrapper">
            <t-pagination
              v-model="pagination.page"
              v-model:pageSize="pagination.size"
              :total="pagination.total"
              :pageSizeOptions="[10, 20, 50, 100]"
              @change="handlePaginationChange"
            />
          </div>
        </t-card>
      </t-content>
    </t-layout>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { contractAPI } from '@/services/api'
import { MessagePlugin, DialogPlugin } from 'tdesign-vue-next'

const router = useRouter()
const authStore = useAuthStore()

// 导航状态
const activeNav = ref('contracts')

// 用户菜单选项
const userMenuOptions = ref([
  { content: '个人中心', value: 'profile' },
  { content: '系统设置', value: 'settings' },
  { divider: true },
  { content: '退出登录', value: 'logout' }
])

// 筛选选项
const typeOptions = ref([
  { label: '全部类型', value: '' },
  { label: '劳动合同', value: '劳动合同' },
  { label: '采购合同', value: '采购合同' },
  { label: '销售合同', value: '销售合同' },
  { label: '租赁合同', value: '租赁合同' },
  { label: '其他', value: '其他' }
])

const statusOptions = ref([
  { label: '全部状态', value: '' },
  { label: '待分析', value: 'pending' },
  { label: '分析中', value: 'analyzing' },
  { label: '已完成', value: 'completed' },
  { label: '分析失败', value: 'failed' }
])

// 筛选条件
const filters = reactive({
  search: '',
  type: '',
  status: '',
  dateRange: []
})

// 分页信息
const pagination = reactive({
  page: 1,
  size: 10,
  total: 0
})

// 合同列表数据
const loading = ref(false)
const contracts = ref<any[]>([])

// 选择相关
const selectedRowKeys = ref<string[]>([])
const selectedContracts = computed(() => {
  return contracts.value.filter(contract => selectedRowKeys.value.includes(contract.id))
})

// 合同列表列配置
const contractColumns = ref([
  {
    colKey: 'selection',
    type: 'multiple',
    width: 60,
    fixed: 'left'
  },
  {
    colKey: 'title',
    title: '合同名称',
    width: 300,
    fixed: 'left',
    cell: (h: any, { row }: any) => {
      return (
        <div class="contract-title" @click="viewContract(row)">
          <t-icon name="file-1" class="contract-icon" />
          <span class="title-text">{row.originalName || row.fileName}</span>
        </div>
      )
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
        '租赁合同': { theme: 'info', label: '租赁合同' },
        '其他': { theme: 'default', label: '其他' }
      }
      const typeInfo = typeMap[row.type] || { theme: 'default', label: row.type || '其他' }
      return (
        <t-tag theme={typeInfo.theme} size="small" variant="light">
          {typeInfo.label}
        </t-tag>
      )
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
      return (
        <t-tag theme={statusInfo.theme} size="small" variant="light">
          {statusInfo.label}
        </t-tag>
      )
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
    colKey: 'riskLevel',
    title: '风险等级',
    width: 100,
    cell: (h: any, { row }: any) => {
      const riskMap: Record<string, any> = {
        'high': { theme: 'danger', label: '高风险' },
        'medium': { theme: 'warning', label: '中风险' },
        'low': { theme: 'success', label: '低风险' },
        'none': { theme: 'default', label: '无风险' }
      }
      const riskInfo = riskMap[row.riskLevel] || { theme: 'default', label: '未知' }
      return (
        <t-tag theme={riskInfo.theme} size="small" variant="light">
          {riskInfo.label}
        </t-tag>
      )
    }
  },
  {
    colKey: 'actions',
    title: '操作',
    width: 200,
    fixed: 'right',
    cell: (h: any, { row }: any) => {
      return (
        <t-space>
          <t-button theme="primary" size="small" @click="viewContract(row)">
            查看详情
          </t-button>
          {row.analysisStatus === 'pending' && (
            <t-button theme="success" size="small" @click="startAnalysis(row)">
              开始分析
            </t-button>
          )}
          <t-dropdown trigger="click" :options="actionMenuOptions" @click="(data: any) => handleActionMenuClick(data, row)">
            <t-button theme="default" size="small" variant="text">
              <t-icon name="more" />
            </t-button>
          </t-dropdown>
        </t-space>
      )
    }
  }
])

// 操作菜单选项
const actionMenuOptions = ref([
  { content: '下载文件', value: 'download' },
  { content: '重新分析', value: 'reanalyze' },
  { divider: true },
  { content: '删除合同', value: 'delete' }
])

// 用户头像计算属性
const userAvatar = computed(() => {
  return authStore.user?.avatar || ''
})

// 导航切换
const handleNavChange = (value: string) => {
  activeNav.value = value
  switch (value) {
    case 'dashboard':
      router.push('/dashboard')
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

// 获取合同列表
const fetchContracts = async () => {
  try {
    loading.value = true
    const response = await contractAPI.getContracts({
      page: pagination.page,
      size: pagination.size,
      search: filters.search,
      type: filters.type,
      status: filters.status
    })
    
    contracts.value = response.data || []
    pagination.total = contracts.value.length
  } catch (error: any) {
    console.error('获取合同列表失败:', error)
    MessagePlugin.error(error.message || '获取合同列表失败')
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

// 日期筛选
const handleDateChange = (value: any) => {
  filters.dateRange = value
  handleSearch()
}

// 重置筛选
const resetFilters = () => {
  filters.search = ''
  filters.type = ''
  filters.status = ''
  filters.dateRange = []
  pagination.page = 1
  fetchContracts()
}

// 分页处理
const handlePaginationChange = (pageInfo: any) => {
  pagination.page = pageInfo.current
  pagination.size = pageInfo.pageSize
  fetchContracts()
}

// 选择变化
const handleSelectionChange = (keys: string[]) => {
  selectedRowKeys.value = keys
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
    fetchContracts()
  } catch (error: any) {
    console.error('启动分析失败:', error)
    MessagePlugin.error(error.message || '启动分析失败')
  }
}

// 操作菜单点击
const handleActionMenuClick = (data: any, contract: any) => {
  switch (data.value) {
    case 'download':
      downloadContract(contract)
      break
    case 'reanalyze':
      startAnalysis(contract)
      break
    case 'delete':
      deleteContract(contract)
      break
  }
}

// 下载合同
const downloadContract = async (contract: any) => {
  try {
    const response = await contractAPI.downloadContract(contract.id)
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    // 优先使用title或originalName作为下载文件名，如果没有则使用fileName
    const downloadName = contract.title || contract.originalName || contract.fileName || 'contract.docx'
    link.download = downloadName
    link.click()
    window.URL.revokeObjectURL(url)
    MessagePlugin.success('下载成功')
  } catch (error: any) {
    console.error('下载失败:', error)
    MessagePlugin.error('下载失败')
  }
}

// 删除合同
const deleteContract = async (contract: any) => {
  const dialog = DialogPlugin.confirm({
    header: '确认删除',
    body: `确定要删除合同 "${contract.title || contract.fileName}" 吗？此操作不可恢复。`,
    confirmBtn: '确定删除',
    cancelBtn: '取消',
    onConfirm: async () => {
      try {
        await contractAPI.deleteContract(contract.id)
        MessagePlugin.success('删除成功')
        fetchContracts()
        dialog.destroy()
      } catch (error: any) {
        console.error('删除失败:', error)
        MessagePlugin.error(error.message || '删除失败')
      }
    },
    onClose: () => {
      dialog.destroy()
    }
  })
}

// 批量操作
const batchAnalyzeSelected = async () => {
  if (selectedContracts.value.length === 0) {
    MessagePlugin.warning('请先选择要分析的合同')
    return
  }
  
  try {
    const contractIds = selectedContracts.value.map(c => c.id)
    await Promise.all(contractIds.map(id => contractAPI.startAnalysis(id)))
    MessagePlugin.success(`已开始分析 ${selectedContracts.value.length} 个合同`)
    clearSelection()
    fetchContracts()
  } catch (error: any) {
    console.error('批量分析失败:', error)
    MessagePlugin.error(error.message || '批量分析失败')
  }
}

const batchDownload = () => {
  MessagePlugin.info('批量下载功能开发中')
}

const batchDelete = () => {
  if (selectedContracts.value.length === 0) {
    MessagePlugin.warning('请先选择要删除的合同')
    return
  }
  
  const dialog = DialogPlugin.confirm({
    header: '确认批量删除',
    body: `确定要删除选中的 ${selectedContracts.value.length} 个合同吗？此操作不可恢复。`,
    confirmBtn: '确定删除',
    cancelBtn: '取消',
    onConfirm: async () => {
      try {
        const contractIds = selectedContracts.value.map(c => c.id)
        await Promise.all(contractIds.map(id => contractAPI.deleteContract(id)))
        MessagePlugin.success(`已删除 ${selectedContracts.value.length} 个合同`)
        clearSelection()
        fetchContracts()
        dialog.destroy()
      } catch (error: any) {
        console.error('批量删除失败:', error)
        MessagePlugin.error(error.message || '批量删除失败')
      }
    },
    onClose: () => {
      dialog.destroy()
    }
  })
}

// 其他功能
const batchAnalyze = () => {
  MessagePlugin.info('批量分析功能开发中')
}

const exportData = () => {
  MessagePlugin.info('数据导出功能开发中')
}

const toggleColumnSettings = () => {
  MessagePlugin.info('列设置功能开发中')
}

const refreshData = () => {
  fetchContracts()
  MessagePlugin.success('数据已刷新')
}

const clearSelection = () => {
  selectedRowKeys.value = []
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

// 页面导航
const goToUpload = () => {
  router.push('/upload')
}

// 退出登录
const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}

// 页面加载时获取数据
onMounted(() => {
  fetchContracts()
})

import { onActivated } from 'vue'
onActivated(() => {
  fetchContracts()
})
</script>

<style scoped lang="scss">
.contracts-container {
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

// 页面标题和操作按钮
.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 24px;
  
  .header-info {
    .page-title {
      margin: 0 0 8px 0;
      font-size: 32px;
      font-weight: 700;
      color: #1d2129;
      line-height: 1.2;
    }
    
    .page-description {
      margin: 0;
      font-size: 16px;
      color: #86909c;
      line-height: 1.5;
    }
  }
  
  .header-actions {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
    justify-content: flex-end;
  }
}

// 高级筛选区域
.advanced-filter {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  margin-bottom: 24px;
  
  .filter-content {
    padding: 20px;
  }
}

// 批量操作栏
.batch-actions {
  margin-bottom: 16px;
  
  .batch-card {
    background: linear-gradient(135deg, #e8f4ff 0%, #f0f9ff 100%);
    border: 1px solid #b3d8ff;
    border-radius: 8px;
    
    .batch-content {
      padding: 16px 20px;
      
      .batch-text {
        font-size: 14px;
        font-weight: 500;
        color: #0052d9;
      }
    }
  }
}

// 合同列表表格
.contracts-table {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  
  :deep(.t-card__header) {
    padding: 20px 24px;
    border-bottom: 1px solid #f2f3f5;
    
    .table-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      
      .header-left {
        display: flex;
        align-items: center;
        gap: 16px;
        
        h3 {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
          color: #1d2129;
        }
        
        .list-count {
          font-size: 14px;
          color: #86909c;
          font-weight: normal;
        }
      }
      
      .header-right {
        display: flex;
        gap: 12px;
      }
    }
  }
  
  // 表格内容区域
  :deep(.t-table) {
    .contract-title {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      transition: color 0.2s;
      padding: 8px 0;
      
      &:hover {
        color: #0052d9;
        
        .contract-icon {
          color: #0052d9;
        }
      }
      
      .contract-icon {
        color: #86909c;
        font-size: 16px;
        transition: color 0.2s;
      }
      
      .title-text {
        font-weight: 500;
        max-width: 250px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
    
    // 行悬停效果
    :deep(.t-table__row) {
      transition: background-color 0.2s;
      
      &:hover {
        background-color: #f8fafc;
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
  
  .page-header {
    flex-direction: column;
    gap: 16px;
    text-align: center;
    
    .header-actions {
      justify-content: center;
    }
  }
  
  .advanced-filter {
    .filter-content {
      padding: 16px;
    }
    
    .t-col {
      margin-bottom: 12px;
    }
  }
  
  .contracts-table {
    :deep(.t-card__header) {
      padding: 16px;
      
      .table-header {
        flex-direction: column;
        gap: 16px;
        align-items: stretch;
        text-align: center;
        
        .header-left {
          justify-content: center;
        }
        
        .header-right {
          justify-content: center;
        }
      }
    }
  }
  
  .batch-actions {
    .batch-card .batch-content {
      padding: 12px 16px;
      text-align: center;
    }
  }
}

@media (max-width: 480px) {
  .professional-header {
    .header-content {
      padding: 0 16px;
      flex-wrap: wrap;
      height: auto;
      min-height: 64px;
      
      .header-center {
        order: 3;
        width: 100%;
        margin: 8px 0 0 0;
        
        :deep(.t-nav) {
          justify-content: center;
          
          .t-nav-item {
            flex: 1;
            text-align: center;
          }
        }
      }
      
      .header-right {
        margin-left: auto;
      }
    }
  }
  
  .page-header .page-title {
    font-size: 24px;
  }
}
</style>