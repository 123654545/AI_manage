// E:\HTML_learning\AI_manage3\backend\src\routes\auth.ts
import express from 'express'
import { UserService } from '../services/userService'
import { generateToken } from '../utils/jwt'
import { authenticate, AuthRequest } from '../middleware/auth'

const router = express.Router()

// 用户注册
router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      res.status(400).json({ error: '邮箱和密码不能为空' })
      return
    }

    const user = await UserService.register(email, password)
    
    res.status(201).json({
      success: true,
      message: '注册成功',
      data: user
    })
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    })
  }
})

// 用户登录
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      res.status(400).json({ error: '邮箱和密码不能为空' })
      return
    }

    const user = await UserService.login(email, password)
    
    // 生成JWT令牌
    const token = generateToken({
      userId: user.id,
      email: user.email
    })

    res.json({
      success: true,
      message: '登录成功',
      data: {
        user,
        token
      }
    })
  } catch (error: any) {
    res.status(401).json({
      success: false,
      error: error.message
    })
  }
})

// 获取当前用户信息
router.get('/me', authenticate, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: '未授权' })
      return
    }

    const user = await UserService.getUserById(req.user.userId)
    
    res.json({
      success: true,
      data: user
    })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

// 修改密码
router.post('/change-password', authenticate, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: '未授权' })
      return
    }

    const { oldPassword, newPassword } = req.body

    if (!oldPassword || !newPassword) {
      res.status(400).json({ error: '原密码和新密码不能为空' })
      return
    }

    const result = await UserService.changePassword(
      req.user.userId,
      oldPassword,
      newPassword
    )

    res.json({
      success: true,
      message: '密码修改成功',
      data: result
    })
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    })
  }
})

// 退出登录
router.post('/logout', authenticate, async (req: AuthRequest, res) => {
  res.json({
    success: true,
    message: '退出成功'
  })
})

export default router