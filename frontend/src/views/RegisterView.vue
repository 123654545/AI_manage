<template>
  <div class="register-container">
    <!-- 动态背景 -->
    <div class="background-animation">
      <div class="circle circle-1"></div>
      <div class="circle circle-2"></div>
      <div class="circle circle-3"></div>
    </div>
    
    <div class="register-card">
      <div class="register-header">
        <div class="logo-wrapper">
          <t-icon name="user-add" size="48px" class="logo-icon" />
        </div>
        <h1 class="system-title">注册新账号</h1>
        <p class="system-description">开始您的智能合同管理之旅</p>
      </div>

      <t-form 
        ref="registerFormRef" 
        :model="registerForm" 
        :rules="registerRules" 
        class="register-form"
        layout="vertical"
      >
        <t-form-item prop="email">
          <t-input
            v-model="registerForm.email"
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
            v-model="registerForm.password"
            type="password"
            placeholder="请输入密码（至少8位，包含字母和数字）"
            size="large"
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

        <t-form-item prop="confirmPassword">
          <t-input
            v-model="registerForm.confirmPassword"
            type="password"
            placeholder="请确认密码"
            size="large"
            clearable
          >
            <template #prefix-icon>
              <t-icon name="lock-on" />
            </template>
          </t-input>
        </t-form-item>

        <t-form-item>
          <t-button
            theme="primary"
            size="large"
            :loading="loading"
            @click="handleRegister"
            class="register-button"
          >
            注册
          </t-button>
        </t-form-item>
      </t-form>

      <div class="register-footer">
        <span>已有账号？</span>
        <t-link hover="color" theme="primary" @click="goToLogin">
          立即登录
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

const registerFormRef = ref<FormInstance>()
const loading = ref(false)

const registerForm = reactive({
  email: '',
  password: '',
  confirmPassword: ''
})

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
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) strength++
  
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

const handleRegister = async () => {
  if (!registerFormRef.value) return
  
  try {
    // TDesign 表单验证
    await registerFormRef.value.validate()
    
    loading.value = true
    
    console.log('开始注册:', registerForm.email)
    
    const result = await authStore.register(registerForm.email, registerForm.password)
    
    console.log('注册结果:', result)
    
    if (result.success) {
      MessagePlugin.success('注册成功！')
      router.push('/login')
    } else {
      MessagePlugin.error(`注册失败: ${result.message || '未知错误'}`)
    }
  } catch (error: any) {
    console.error('注册错误:', error)
    MessagePlugin.error(`注册失败: ${error.message || '请检查输入'}`)
  } finally {
    loading.value = false
  }
}

const goToLogin = () => {
  router.push('/login')
}
</script>

<style scoped lang="scss">
.register-container {
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

.register-card {
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

.register-header {
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

.register-form {
  margin-top: 32px;
  
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
        
        &.weak {
          background: #e34d59;
        }
        
        &.medium {
          background: #ed7b2f;
        }
        
        &.strong {
          background: #00a870;
        }
        
        &.very-strong {
          background: #0052d9;
        }
      }
    }
    
    .strength-text {
      font-size: 12px;
      color: #86909c;
    }
  }
  
  .register-button {
    width: 100%;
    margin-top: 24px;
    font-size: 16px;
    font-weight: 500;
    height: 48px;
  }
}

.register-footer {
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
  .register-container {
    padding: 16px;
  }
  
  .register-card {
    padding: 40px 30px;
  }
  
  .register-header {
    .system-title {
      font-size: 24px;
    }
    
    .system-description {
      font-size: 15px;
    }
  }
}

@media (max-width: 480px) {
  .register-container {
    padding: 0;
  }
  
  .register-card {
    border-radius: 0;
    min-height: 100vh;
    padding: 50px 24px;
    box-shadow: none;
  }
}
</style>