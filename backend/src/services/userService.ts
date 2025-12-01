// E:\HTML_learning\AI_manage3\backend\src\services\userService.ts
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { validateEmail, validatePassword } from '../utils/validation'

const prisma = new PrismaClient()
const SALT_ROUNDS = 10

export class UserService {
  // 用户注册
  static async register(email: string, password: string) {
    // 验证邮箱格式
    if (!validateEmail(email)) {
      throw new Error('邮箱格式不正确')
    }

    // 验证密码强度
    const passwordValidation = validatePassword(password)
    if (!passwordValidation.valid) {
      throw new Error(passwordValidation.message)
    }

    // 检查邮箱是否已存在
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      throw new Error('该邮箱已被注册')
    }

    // 密码哈希
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS)

    // 创建用户
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        loginAttempts: 0,
        lockUntil: null
      },
      select: {
        id: true,
        email: true,
        createdAt: true
      }
    })

    return user
  }

  // 用户登录
  static async login(email: string, password: string) {
    // 检查用户是否存在
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      throw new Error('用户不存在')
    }

    // 检查账号是否被锁定
    if (user.lockUntil && user.lockUntil > new Date()) {
      const lockMinutes = Math.ceil((user.lockUntil.getTime() - Date.now()) / 60000)
      throw new Error(`账号已被锁定，请${lockMinutes}分钟后重试`)
    }

    // 验证密码
    const passwordValid = await bcrypt.compare(password, user.passwordHash)
    
    if (!passwordValid) {
      // 增加登录失败次数
      const newLoginAttempts = user.loginAttempts + 1
      let lockUntil = null

      // 如果失败3次，锁定5分钟
      if (newLoginAttempts >= 3) {
        lockUntil = new Date(Date.now() + 5 * 60 * 1000) // 5分钟
      }

      await prisma.user.update({
        where: { id: user.id },
        data: {
          loginAttempts: newLoginAttempts,
          lockUntil
        }
      })

      throw new Error('密码错误')
    }

    // 登录成功，重置登录失败次数
    await prisma.user.update({
      where: { id: user.id },
      data: {
        loginAttempts: 0,
        lockUntil: null,
        updatedAt: new Date()
      }
    })

    return {
      id: user.id,
      email: user.email
    }
  }

  // 获取用户信息
  static async getUserById(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        createdAt: true,
        updatedAt: true
      }
    })

    if (!user) {
      throw new Error('用户不存在')
    }

    return user
  }

  // 修改密码
  static async changePassword(userId: string, oldPassword: string, newPassword: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      throw new Error('用户不存在')
    }

    // 验证原密码
    const oldPasswordValid = await bcrypt.compare(oldPassword, user.passwordHash)
    if (!oldPasswordValid) {
      throw new Error('原密码错误')
    }

    // 验证新密码强度
    const passwordValidation = validatePassword(newPassword)
    if (!passwordValidation.valid) {
      throw new Error(passwordValidation.message)
    }

    // 更新密码
    const newPasswordHash = await bcrypt.hash(newPassword, SALT_ROUNDS)
    
    await prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash: newPasswordHash,
        updatedAt: new Date()
      }
    })

    return { success: true }
  }
}