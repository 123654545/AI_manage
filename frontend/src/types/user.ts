// E:\HTML_learning\AI_manage3\frontend\src\types\user.ts
export interface User {
  id: string
  email: string
  name?: string
  createdAt?: string
}

export interface LoginForm {
  email: string
  password: string
  rememberMe?: boolean
}

export interface RegisterForm extends LoginForm {
  confirmPassword: string
}