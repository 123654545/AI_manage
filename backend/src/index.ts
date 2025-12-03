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
const PORT = process.env.PORT || 3001

// 中间件
app.use(cors({
  origin: function (origin, callback) {
    // 允许所有本地开发环境端口
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:5175',
      'http://localhost:5176',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:5174',
      'http://127.0.0.1:5175',
      'http://127.0.0.1:5176'
    ];
    
    // 允许来自环境变量配置的URL
    if (process.env.FRONTEND_URL) {
      allowedOrigins.push(process.env.FRONTEND_URL);
    }
    
    // 允许没有origin的请求（如移动端或curl请求）
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
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

// 合同路由
import contractRouter from './routes/contracts'
app.use('/api/contracts', contractRouter)

// 静态文件服务（用于文件下载）
app.use('/uploads', express.static('uploads'))

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