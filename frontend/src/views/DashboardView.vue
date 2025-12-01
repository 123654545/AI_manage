<!-- E:\HTML_learning\AI_manage3\frontend\src\views\DashboardView.vue -->
<template>
  <div class="dashboard-container">
    <el-container>
      <el-header class="header">
        <div class="header-left">
          <h2>AI合同分析系统</h2>
        </div>
        <div class="header-right">
          <el-dropdown>
            <span class="user-info">
              {{ authStore.user?.email }}
              <el-icon><arrow-down /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="goToProfile">个人中心</el-dropdown-item>
                <el-dropdown-item divided @click="handleLogout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>
      
      <el-main>
        <div class="welcome-card">
          <el-card>
            <h3>欢迎使用AI合同分析系统</h3>
            <p>Day 1：用户认证系统已完成</p>
            <p>Day 2：将实现合同上传和管理功能</p>
            <el-button type="primary" @click="goToUpload" :disabled="true">
              上传合同（开发中）
            </el-button>
          </el-card>
        </div>
      </el-main>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { ArrowDown } from '@element-plus/icons-vue'

const router = useRouter()
const authStore = useAuthStore()

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}

const goToProfile = () => {
  ElMessage.info('个人中心功能开发中')
}

const goToUpload = () => {
  ElMessage.info('合同上传功能开发中')
}
</script>

<style scoped>
.dashboard-container {
  min-height: 100vh;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: white;
  border-bottom: 1px solid #e4e7ed;
  padding: 0 24px;
}

.header-left h2 {
  margin: 0;
  color: #303133;
}

.header-right .user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.header-right .user-info:hover {
  background-color: #f5f7fa;
}

.welcome-card {
  max-width: 600px;
  margin: 60px auto;
  text-align: center;
}

.welcome-card h3 {
  margin-bottom: 16px;
  color: #303133;
}

.welcome-card p {
  margin-bottom: 12px;
  color: #606266;
}
</style>