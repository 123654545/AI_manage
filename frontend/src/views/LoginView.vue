<template>
  <div class="login-container">
    <!-- 动态背景 -->
    <div class="background-animation">
      <div class="circle circle-1"></div>
      <div class="circle circle-2"></div>
      <div class="circle circle-3"></div>
    </div>
    
    <div class="login-card">
      <div class="login-header">
        <div class="logo-wrapper">
          <t-icon name="file-text" size="48px" class="logo-icon" />
        </div>
        <h1 class="system-title">AI合同分析系统</h1>
        <p class="system-description">智能解析 · 风险预警 · 高效管理</p>
      </div>

      <t-form 
        ref="loginFormRef" 
        :model="loginForm" 
        :rules="loginRules" 
        class="login-form"
        layout="vertical"
      >
        <t-form-item prop="email">
          <t-input
            v-model="loginForm.email"
            placeholder="请输入邮箱"
            size="large"
            clearable
          >
            <template #prefix-icon>
              <t-icon name="mail" />
            </template>
          </t-input>
        </t-form-item>

        <t-form-item prop="password">
          <t-input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            size="large"
            clearable
          >
            <template #prefix-icon>
              <t-icon name="lock-on" />
            </template>
          </t-input>
        </t-form-item>

        <div class="form-options">
          <t-checkbox v-model="loginForm.rememberMe">记住我</t-checkbox>
          <t-link hover="color" theme="primary" class="forgot-password">
            忘记密码？
          </t-link>
        </div>

        <t-form-item>
          <t-button
            theme="primary"
            size="large"
            :loading="loading"
            @click="handleLogin"
            class="login-button"
          >
            登录
          </t-button>
        </t-form-item>
      </t-form>

      <div class="login-footer">
        <span>还没有账号？</span>
        <t-link hover="color" theme="primary" @click="goToRegister">
          立即注册
        </t-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { MessagePlugin } from 'tdesign-vue-next'
import { useAuthStore } from '@/stores/auth'
import type { FormInstance } from 'tdesign-vue-next'

const router = useRouter()
const authStore = useAuthStore()

const loginFormRef = ref<FormInstance>()
const loading = ref(false)

const loginForm = reactive({
  email: '',
  password: '',
  rememberMe: false
})

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

const handleLogin = async () => {
  if (!loginFormRef.value) return
  
  try {
    // TDesign 表单验证
    await loginFormRef.value.validate()
    
    loading.value = true
    
    console.log('开始登录:', loginForm.email)
    
    const result = await authStore.login(loginForm.email, loginForm.password)
    
    console.log('登录结果:', result)
    
    if (result.success) {
      MessagePlugin.success('登录成功！')
      router.push('/dashboard')
    } else {
      MessagePlugin.error(`登录失败: ${result.message || '用户名或密码错误'}`)
    }
  } catch (error: any) {
    console.error('登录错误:', error)
    MessagePlugin.error(`登录失败: ${error.message || '请检查输入'}`)
  } finally {
    loading.value = false
  }
}

const goToRegister = () => {
  router.push('/register')
}
</script>

<style scoped lang="scss">
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1d2b64 0%, #2c3e50 100%);
  padding: 20px;
  position: relative;
  overflow: hidden;
}

// 动态背景效果
.background-animation {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: 1;
  
  .circle {
    position: absolute;
    border-radius: 50%;
    opacity: 0.1;
    background: white;
    
    &.circle-1 {
      width: 300px;
      height: 300px;
      top: -150px;
      right: -150px;
      animation: float 20s infinite ease-in-out;
    }
    
    &.circle-2 {
      width: 200px;
      height: 200px;
      bottom: -100px;
      left: -100px;
      animation: float 15s infinite ease-in-out reverse;
    }
    
    &.circle-3 {
      width: 150px;
      height: 150px;
      top: 50%;
      left: -75px;
      animation: float 25s infinite ease-in-out;
    }
    
    @keyframes float {
      0%, 100% { transform: translateY(0) rotate(0deg); }
      50% { transform: translateY(-20px) rotate(10deg); }
    }
  }
}

.login-card {
  width: 100%;
  max-width: 420px;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 50px 40px;
  box-shadow: 0 25px 80px rgba(0, 0, 0, 0.15);
  z-index: 2;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #667eea, #764ba2);
  }
}

.login-header {
  text-align: center;
  margin-bottom: 40px;
  
  .logo-wrapper {
    margin-bottom: 24px;
    
    .logo-icon {
      color: #667eea;
    }
  }
  
  .system-title {
    font-size: 28px;
    font-weight: 700;
    color: #1a202c;
    margin-bottom: 12px;
    letter-spacing: -0.5px;
  }
  
  .system-description {
    font-size: 16px;
    color: #4a5568;
    margin: 0;
    line-height: 1.5;
  }
}

.login-form {
  margin-top: 32px;
  
  .form-options {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 16px 0;
  }
  
  .login-button {
    width: 100%;
    margin-top: 24px;
    font-size: 16px;
    font-weight: 500;
    height: 48px;
  }
}

.login-footer {
  text-align: center;
  margin-top: 32px;
  font-size: 16px;
  color: #4a5568;
  
  span {
    margin-right: 8px;
  }
}

// 响应式设计
@media (max-width: 768px) {
  .login-container {
    padding: 16px;
  }
  
  .login-card {
    padding: 40px 30px;
  }
  
  .login-header {
    .system-title {
      font-size: 24px;
    }
    
    .system-description {
      font-size: 15px;
    }
  }
}

@media (max-width: 480px) {
  .login-container {
    padding: 0;
  }
  
  .login-card {
    border-radius: 0;
    min-height: 100vh;
    padding: 50px 24px;
    box-shadow: none;
  }
}
</style>