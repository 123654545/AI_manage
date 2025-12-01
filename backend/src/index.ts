// E:\HTML_learning\AI_manage3\backend\src\index.ts
import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { PrismaClient } from '@prisma/client'

// 加载环境变量
dotenv.config()

// 初始化
const app = express()
const prisma = new PrismaClient()
const PORT = process.env.PORT || 3000

// 中间件
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'AI Contract Analysis API'
  })
})

// 用户路由
import authRouter from './routes/auth'
app.use('/api/auth', authRouter)

// 错误处理中间件
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack)
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    timestamp: new Date().toISOString()
  })
})

// 404处理
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' })
})

// 启动服务器
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`)
  console.log(`📊 Database connected`)
})

// 优雅关闭
process.on('SIGTERM', async () => {
  await prisma.$disconnect()
  process.exit(0)
})