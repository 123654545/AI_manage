// E:\HTML_learning\AI_manage3\backend\src\middleware\auth.ts
import { Request, Response, NextFunction } from 'express'
import { verifyToken } from '../utils/jwt'

export interface AuthRequest extends Request {
  user?: {
    userId: string
    email: string
  }
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: '未授权访问，请先登录' })
      return
    }

    const token = authHeader.split(' ')[1]
    const decoded = verifyToken(token)
    
    req.user = decoded
    next()
  } catch (error) {
    res.status(401).json({ error: '令牌无效或已过期' })
  }
}