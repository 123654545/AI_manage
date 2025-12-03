<template>
  <div class="welcome-container">
    <!-- 动态背景效果 -->
    <div class="background-effects">
      <div class="animated-gradient"></div>
      <div class="floating-shapes">
        <div class="shape shape-1"></div>
        <div class="shape shape-2"></div>
        <div class="shape shape-3"></div>
        <div class="shape shape-4"></div>
        <div class="shape shape-5"></div>
        <div class="shape shape-6"></div>
      </div>
    </div>
    
    <!-- 主内容区域 -->
    <div class="welcome-content">
      <!-- 左侧产品展示区 -->
      <div class="showcase-section">
        <!-- 品牌标题 -->
        <div class="brand-header">
          <div class="logo-container">
            <div class="logo-icon">
              <t-icon name="file-text" size="42px" />
            </div>
            <div class="logo-text">
              <span class="brand-name">AI合同分析</span>
              <span class="brand-tagline">智能 · 专业 · 高效</span>
            </div>
          </div>
        </div>
        
        <!-- 主标题区 -->
        <div class="title-section">
          <h1 class="main-title">
            <span class="title-highlight">智能合同分析</span>
            <br>管理平台
          </h1>
          <p class="subtitle">基于深度学习的合同智能识别、风险评估与合规管理系统</p>
        </div>
        
        <!-- 特色功能卡片 -->
        <div class="features-grid">
          <div class="feature-card" v-for="(feature, index) in features" :key="index">
            <div class="feature-icon-wrapper">
              <t-icon :name="feature.icon" size="32px" />
            </div>
            <div class="feature-content">
              <h3 class="feature-title">{{ feature.title }}</h3>
              <p class="feature-desc">{{ feature.description }}</p>
            </div>
          </div>
        </div>
        
        <!-- 统计数据 -->
        <div class="stats-row">
          <div class="stat-item" v-for="(stat, index) in stats" :key="index">
            <div class="stat-number">{{ stat.value }}</div>
            <div class="stat-label">{{ stat.label }}</div>
          </div>
        </div>
      </div>
      
      <!-- 右侧登录注册区 -->
      <div class="auth-section">
        <div class="auth-container">
          <!-- 标题切换 -->
          <div class="auth-header">
            <h2 class="auth-title" :class="{ 'register-active': activeTab === 'register' }">
              {{ activeTab === 'login' ? '欢迎回来' : '创建新账号' }}
            </h2>
            <p class="auth-subtitle">
              {{ activeTab === 'login' ? '登录到您的账户继续' : '注册新账户开始使用' }}
            </p>
          </div>
          
          <!-- 表单切换指示器 -->
          <div class="auth-tabs-indicator">
            <div 
              class="tab-item" 
              :class="{ active: activeTab === 'login' }"
              @click="switchTab('login')"
            >
              登录
            </div>
            <div 
              class="tab-item" 
              :class="{ active: activeTab === 'register' }"
              @click="switchTab('register')"
            >
              注册
            </div>
            <div class="tab-indicator" :class="{ 'register-active': activeTab === 'register' }"></div>
          </div>
          
          <!-- 登录表单 -->
          <div class="form-container" v-show="activeTab === 'login'">
            <t-form
              ref="loginFormRef"
              :model="loginForm"
              :rules="loginRules"
            >
              <div class="input-group">
                <label class="input-label">邮箱地址</label>
                <t-form-item prop="email">
                  <t-input
                    v-model="loginForm.email"
                    placeholder="请输入您的邮箱"
                    size="large"
                    clearable
                  >
                    <template #prefix-icon>
                      <t-icon name="mail" />
                    </template>
                  </t-input>
                </t-form-item>
              </div>
              
              <div class="input-group">
                <label class="input-label">密码</label>
                <t-form-item prop="password">
                  <t-input
                    v-model="loginForm.password"
                    placeholder="请输入您的密码"
                    size="large"
                    type="password"
                    clearable
                  >
                    <template #prefix-icon>
                      <t-icon name="lock-on" />
                    </template>
                  </t-input>
                </t-form-item>
              </div>
              
              <div class="form-options">
                <t-checkbox v-model="loginForm.rememberMe">记住我</t-checkbox>
                <t-link hover="color" theme="primary" class="forgot-link">忘记密码？</t-link>
              </div>
              
              <t-button
                theme="primary"
                size="large"
                block
                :loading="loginLoading"
                class="auth-button"
                @click="handleLogin"
              >
                登录
              </t-button>
            </t-form>
          </div>
          
          <!-- 注册表单 -->
          <div class="form-container" v-show="activeTab === 'register'">
            <t-form
              ref="registerFormRef"
              :model="registerForm"
              :rules="registerRules"
            >
              <div class="input-group">
                <label class="input-label">邮箱地址</label>
                <t-form-item prop="email">
                  <t-input
                    v-model="registerForm.email"
                    placeholder="请输入您的邮箱"
                    size="large"
                    clearable
                  >
                    <template #prefix-icon>
                      <t-icon name="mail" />
                    </template>
                  </t-input>
                </t-form-item>
              </div>
              
              <div class="input-group">
                <label class="input-label">密码</label>
                <t-form-item prop="password">
                  <t-input
                    v-model="registerForm.password"
                    placeholder="请创建密码（至少8位，包含字母和数字）"
                    size="large"
                    type="password"
                    clearable
                  >
                    <template #prefix-icon>
                      <t-icon name="lock-on" />
                    </template>
                  </t-input>
                  <div class="password-strength">
                    <div class="strength-bar">
                      <div 
                        class="strength-fill" 
                        :class="passwordStrengthClass"
                        :style="{ width: passwordStrengthWidth }"
                      ></div>
                    </div>
                    <div class="strength-text">{{ passwordStrengthText }}</div>
                  </div>
                </t-form-item>
              </div>
              
              <div class="input-group">
                <label class="input-label">确认密码</label>
                <t-form-item prop="confirmPassword">
                  <t-input
                    v-model="registerForm.confirmPassword"
                    placeholder="请再次输入密码"
                    size="large"
                    type="password"
                    clearable
                  >
                    <template #prefix-icon>
                      <t-icon name="lock-on" />
                    </template>
                  </t-input>
                </t-form-item>
              </div>
              
              <div class="terms-agreement">
                <t-checkbox v-model="registerForm.agreeTerms">
                  我已阅读并同意
                  <t-link hover="color" theme="primary">服务条款</t-link>
                  和
                  <t-link hover="color" theme="primary">隐私政策</t-link>
                </t-checkbox>
              </div>
              
              <t-button
                theme="primary"
                size="large"
                block
                :loading="registerLoading"
                class="auth-button"
                @click="handleRegister"
              >
                注册
              </t-button>
            </t-form>
          </div>
          
          <!-- 分割线 -->
          <div class="divider-section">
            <span class="divider-text">或使用以下方式</span>
          </div>
          
          <!-- 第三方登录选项 -->
          <div class="social-login">
            <t-button variant="outline" size="large" class="social-btn">
              <t-icon name="desktop" size="20px" />
              企业微信登录
            </t-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { MessagePlugin, type FormInstance } from 'tdesign-vue-next'

const router = useRouter()
const authStore = useAuthStore()

const activeTab = ref('login')
const loginLoading = ref(false)
const registerLoading = ref(false)

const loginFormRef = ref<FormInstance>()
const registerFormRef = ref<FormInstance>()

const loginForm = reactive({
  email: '',
  password: '',
  rememberMe: false
})

const registerForm = reactive({
  email: '',
  password: '',
  confirmPassword: '',
  agreeTerms: false
})

// 特色功能数据
const features = [
  {
    icon: 'check-circle-filled',
    title: '智能条款识别',
    description: '基于深度学习的合同关键条款自动识别与提取'
  },
  {
    icon: 'chart-line',
    title: '风险分析评估',
    description: '全面的合同风险点识别与量化评估系统'
  },
  {
    icon: 'time-filled',
    title: '关键日期管理',
    description: '自动识别并管理合同中的重要时间节点'
  },
  {
    icon: 'lock-on',
    title: '数据安全保障',
    description: '企业级加密与权限管理，确保合同数据安全'
  }
]

// 统计数据
const stats = [
  { value: '10,000+', label: '合同分析' },
  { value: '99.9%', label: '识别准确率' },
  { value: '24/7', label: '在线服务' }
]

// 登录验证规则
const loginRules = computed(() => ({
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { email: true, message: '请输入正确的邮箱格式', trigger: ['blur', 'change'] }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 8, message: '密码长度不能少于8位', trigger: 'blur' }
  ]
}))

// 注册验证规则
const registerRules = computed(() => ({
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { email: true, message: '请输入正确的邮箱格式', trigger: ['blur', 'change'] }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 8, message: '密码长度不能少于8位', trigger: 'blur' },
    {
      validator: (val: string) => {
        return /[A-Za-z]/.test(val)
      },
      message: '密码必须包含字母',
      trigger: 'blur'
    },
    {
      validator: (val: string) => {
        return /\d/.test(val)
      },
      message: '密码必须包含数字',
      trigger: 'blur'
    }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    {
      validator: (val: string) => {
        return val === registerForm.password
      },
      message: '两次输入密码不一致',
      trigger: 'blur'
    }
  ]
}))

// 密码强度计算
const passwordStrength = computed(() => {
  const password = registerForm.password
  if (!password) return 0
  
  let strength = 0
  
  // 长度检查
  if (password.length >= 8) strength++
  if (password.length >= 12) strength++
  
  // 字符类型检查
  if (/[a-z]/.test(password)) strength++
  if (/[A-Z]/.test(password)) strength++
  if (/\d/.test(password)) strength++
  if (/[^A-Za-z0-9]/.test(password)) strength++
  
  return Math.min(strength, 4)
})

const passwordStrengthClass = computed(() => {
  const level = passwordStrength.value
  if (level === 0) return ''
  if (level === 1) return 'weak'
  if (level === 2) return 'medium'
  if (level === 3) return 'strong'
  return 'very-strong'
})

const passwordStrengthWidth = computed(() => {
  return `${(passwordStrength.value / 4) * 100}%`
})

const passwordStrengthText = computed(() => {
  const level = passwordStrength.value
  if (level === 0) return '密码强度'
  if (level === 1) return '弱'
  if (level === 2) return '中等'
  if (level === 3) return '强'
  return '非常强'
})

// 切换表单标签
const switchTab = (tab: string) => {
  activeTab.value = tab
}

// 处理登录
const handleLogin = async () => {
  if (!loginFormRef.value) return
  
  try {
    // TDesign 表单验证
    await loginFormRef.value.validate()
    
    loginLoading.value = true
    const result = await authStore.login(loginForm.email, loginForm.password)
    
    if (result.success) {
      MessagePlugin.success('登录成功！')
      router.push('/dashboard')
    } else {
      MessagePlugin.error(result.message || '登录失败')
    }
  } catch (error: any) {
    MessagePlugin.error(error.message || '登录失败')
  } finally {
    loginLoading.value = false
  }
}

// 处理注册
const handleRegister = async () => {
  if (!registerFormRef.value) return
  
  try {
    // 检查是否同意条款
    if (!registerForm.agreeTerms) {
      MessagePlugin.error('请阅读并同意服务条款和隐私政策')
      return
    }
    
    // TDesign 表单验证
    await registerFormRef.value.validate()
    
    registerLoading.value = true
    const result = await authStore.register(registerForm.email, registerForm.password)
    
    if (result.success) {
      MessagePlugin.success('注册成功！')
      activeTab.value = 'login'
      
      // 清空注册表单
      registerForm.email = ''
      registerForm.password = ''
      registerForm.confirmPassword = ''
      registerForm.agreeTerms = false
    } else {
      MessagePlugin.error(result.message || '注册失败')
    }
  } catch (error: any) {
    MessagePlugin.error(error.message || '注册失败')
  } finally {
    registerLoading.value = false
  }
}
</script>

<style scoped lang="scss">
// 背景动画和主容器
.welcome-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  position: relative;
  overflow: hidden;
  background: #f5f7fa;
}

// 背景效果
.background-effects {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  overflow: hidden;
}

.animated-gradient {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  opacity: 0.9;
  animation: gradientShift 15s ease-in-out infinite;
}

@keyframes gradientShift {
  0%, 100% { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
  25% { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); }
  50% { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); }
  75% { background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); }
}

.floating-shapes {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.shape {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  animation: float 20s infinite ease-in-out;
  
  &.shape-1 {
    width: 300px;
    height: 300px;
    top: -150px;
    right: -150px;
    animation-delay: 0s;
  }
  
  &.shape-2 {
    width: 200px;
    height: 200px;
    bottom: -100px;
    left: -100px;
    animation-delay: 2s;
    animation-direction: reverse;
  }
  
  &.shape-3 {
    width: 150px;
    height: 150px;
    top: 50%;
    left: -75px;
    animation-delay: 4s;
  }
  
  &.shape-4 {
    width: 250px;
    height: 250px;
    top: 30%;
    right: -100px;
    animation-delay: 1s;
    animation-direction: reverse;
  }
  
  &.shape-5 {
    width: 120px;
    height: 120px;
    bottom: 20%;
    right: 15%;
    animation-delay: 3s;
  }
  
  &.shape-6 {
    width: 180px;
    height: 180px;
    top: 10%;
    left: 20%;
    animation-delay: 5s;
  }
}

@keyframes float {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(10deg); }
}

// 主内容区域
.welcome-content {
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  width: 100%;
  max-width: 1400px;
  background: white;
  border-radius: 24px;
  box-shadow: 0 30px 60px rgba(0, 0, 0, 0.12);
  overflow: hidden;
  position: relative;
  z-index: 1;
  margin: 20px;
}

// 左侧产品展示区
.showcase-section {
  padding: 60px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 5px;
    background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  }
}

// 品牌标题
.brand-header {
  margin-bottom: 40px;
}

.logo-container {
  display: flex;
  align-items: center;
  gap: 16px;
}

.logo-icon {
  width: 64px;
  height: 64px;
  background: rgba(102, 126, 234, 0.1);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #667eea;
}

.logo-text {
  display: flex;
  flex-direction: column;
}

.brand-name {
  font-size: 24px;
  font-weight: 700;
  color: #1a202c;
  letter-spacing: -0.5px;
}

.brand-tagline {
  font-size: 14px;
  color: #718096;
  margin-top: 2px;
  letter-spacing: 2px;
}

// 主标题区
.title-section {
  margin-bottom: 50px;
}

.main-title {
  font-size: 48px;
  font-weight: 800;
  color: #1a202c;
  line-height: 1.2;
  margin-bottom: 20px;
  letter-spacing: -0.5px;
}

.title-highlight {
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.subtitle {
  font-size: 20px;
  color: #4a5568;
  line-height: 1.6;
  max-width: 90%;
}

// 特色功能卡片
.features-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 40px;
}

.feature-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  border: 1px solid #f0f0f0;
  display: flex;
  align-items: flex-start;
  gap: 16px;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
  }
}

.feature-icon-wrapper {
  width: 48px;
  height: 48px;
  background: rgba(102, 126, 234, 0.1);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #667eea;
  flex-shrink: 0;
}

.feature-content {
  flex: 1;
}

.feature-title {
  font-size: 18px;
  font-weight: 600;
  color: #2d3748;
  margin: 0 0 6px 0;
}

.feature-desc {
  font-size: 14px;
  color: #4a5568;
  margin: 0;
  line-height: 1.5;
}

// 统计数据
.stats-row {
  display: flex;
  gap: 40px;
  justify-content: center;
}

.stat-item {
  text-align: center;
}

.stat-number {
  font-size: 28px;
  font-weight: 700;
  color: #667eea;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 16px;
  color: #4a5568;
  font-weight: 500;
}

// 右侧登录注册区
.auth-section {
  padding: 50px 40px;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
}

.auth-container {
  width: 100%;
  max-width: 420px;
}

// 认证标题
.auth-header {
  text-align: center;
  margin-bottom: 30px;
}

.auth-title {
  font-size: 28px;
  font-weight: 700;
  color: #1a202c;
  margin-bottom: 8px;
  transition: color 0.3s ease;
  
  &.register-active {
    color: #667eea;
  }
}

.auth-subtitle {
  font-size: 16px;
  color: #4a5568;
  margin: 0;
}

// 表单标签切换
.auth-tabs-indicator {
  display: flex;
  background: #f7fafc;
  border-radius: 12px;
  padding: 4px;
  margin-bottom: 30px;
  position: relative;
}

.tab-item {
  flex: 1;
  text-align: center;
  padding: 12px;
  font-size: 16px;
  font-weight: 500;
  color: #718096;
  cursor: pointer;
  border-radius: 8px;
  transition: color 0.3s ease;
  position: relative;
  z-index: 2;
  
  &.active {
    color: white;
  }
}

.tab-indicator {
  position: absolute;
  top: 4px;
  left: 4px;
  width: calc(50% - 4px);
  height: calc(100% - 8px);
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px;
  transition: transform 0.3s ease;
  
  &.register-active {
    transform: translateX(calc(100% + 8px));
  }
}

// 表单容器
.form-container {
  .input-group {
    margin-bottom: 24px;
    
    .input-label {
      display: block;
      font-size: 16px;
      font-weight: 500;
      color: #2d3748;
      margin-bottom: 8px;
    }
  }
  
  .form-options {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 16px 0;
  }
  
  .forgot-link {
    font-size: 14px;
  }
}

// 密码强度指示器
.password-strength {
  margin-top: 8px;
  
  .strength-bar {
    height: 4px;
    background: #f0f0f0;
    border-radius: 2px;
    margin-bottom: 4px;
    overflow: hidden;
    
    .strength-fill {
      height: 100%;
      border-radius: 2px;
      transition: all 0.3s ease;
      
      &.weak { background: #e34d59; }
      &.medium { background: #ed7b2f; }
      &.strong { background: #00a870; }
      &.very-strong { background: #0052d9; }
    }
  }
  
  .strength-text {
    font-size: 12px;
    color: #86909c;
  }
}

// 服务条款
.terms-agreement {
  margin: 16px 0;
  font-size: 14px;
  color: #4a5568;
}

// 认证按钮
.auth-button {
  width: 100%;
  margin-top: 24px;
  height: 48px;
  font-size: 16px;
  font-weight: 600;
}

// 分割线
.divider-section {
  text-align: center;
  margin: 30px 0;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 0;
    right: 0;
    height: 1px;
    background: #e2e8f0;
  }
  
  .divider-text {
    display: inline-block;
    padding: 0 16px;
    background: white;
    position: relative;
    color: #a0aec0;
    font-size: 14px;
  }
}

// 第三方登录
.social-login {
  .social-btn {
    width: 100%;
    border: 1px solid #e2e8f0;
    gap: 8px;
    color: #4a5568;
    
    &:hover {
      border-color: #cbd5e0;
      color: #2d3748;
    }
  }
}

// 响应式设计
@media (max-width: 1024px) {
  .welcome-content {
    grid-template-columns: 1fr;
    max-width: 700px;
  }
  
  .showcase-section {
    padding: 40px 30px;
  }
  
  .features-grid {
    grid-template-columns: 1fr;
  }
  
  .auth-section {
    padding: 40px 30px;
  }
}

@media (max-width: 768px) {
  .welcome-container {
    padding: 0;
  }
  
  .welcome-content {
    border-radius: 0;
    margin: 0;
    min-height: 100vh;
  }
  
  .showcase-section {
    padding: 30px 20px;
  }
  
  .main-title {
    font-size: 32px;
  }
  
  .stats-row {
    gap: 20px;
  }
  
  .auth-section {
    padding: 30px 20px;
  }
  
  .auth-container {
    max-width: 100%;
  }
}

@media (max-width: 480px) {
  .showcase-section {
    padding: 20px;
  }
  
  .brand-name {
    font-size: 20px;
  }
  
  .main-title {
    font-size: 28px;
  }
  
  .subtitle {
    font-size: 16px;
  }
  
  .feature-card {
    padding: 16px;
  }
  
  .auth-section {
    padding: 20px;
  }
}
</style>