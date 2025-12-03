import express from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs/promises'
import { authenticate, AuthRequest } from '../middleware/auth'
import { ContractService } from '../services/contractService'

const router = express.Router()

// 确保上传目录存在
const ensureUploadDir = async (dir: string) => {
  try {
    await fs.access(dir)
  } catch {
    await fs.mkdir(dir, { recursive: true })
  }
}

// 配置multer存储
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads')
    await ensureUploadDir(uploadDir)
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    // 生成唯一文件名
    const timestamp = Date.now()
    // 使用Buffer正确处理文件名编码
    const originalName = Buffer.from(file.originalname, 'latin1').toString('utf8')
    const ext = path.extname(originalName)
    const baseName = path.basename(originalName, ext)
    const fileName = `${baseName}_${timestamp}${ext}`
    cb(null, fileName)
  }
})

// 文件过滤器
const fileFilter = (req: any, file: Express.Multer.File, cb: any) => {
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
  
  const allowedExtensions = ['.pdf', '.doc', '.docx']
  const fileExtension = path.extname(file.originalname).toLowerCase()
  
  if (allowedTypes.includes(file.mimetype) && allowedExtensions.includes(fileExtension)) {
    cb(null, true)
  } else {
    cb(new Error('不支持的文件类型。只支持 PDF、DOC、DOCX 格式'), false)
  }
}

// 配置multer
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '20971520'), // 默认20MB
    files: 5 // 最多5个文件
  }
})

// 单文件上传
router.post('/upload', authenticate, upload.single('file'), async (req: AuthRequest, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: '请选择要上传的文件'
      })
    }

    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: '未授权访问'
      })
    }

    // 保存合同记录到数据库
    const contract = await ContractService.createContract({
      userId: req.user.userId,
      fileName: req.file.filename,
      originalName: Buffer.from(req.file.originalname, 'latin1').toString('utf8'),
      fileUrl: `/uploads/${req.file.filename}`,
      fileSize: req.file.size,
      mimeType: req.file.mimetype
    })

    res.json({
      success: true,
      message: '文件上传成功',
      data: {
        id: contract.id,
        fileName: contract.fileName,
        originalName: contract.originalName,
        fileUrl: contract.fileUrl,
        size: contract.fileSize,
        mimeType: contract.mimeType,
        uploadedAt: contract.uploadedAt,
        analysisStatus: contract.analysisStatus
      }
    })

  } catch (error: any) {
    console.error('文件上传错误:', error)
    
    // 如果上传了文件但保存到数据库失败，删除文件
    if (req.file) {
      try {
        await fs.unlink(req.file.path)
      } catch (unlinkError) {
        console.error('删除文件失败:', unlinkError)
      }
    }

    res.status(500).json({
      success: false,
      error: error.message || '文件上传失败'
    })
  }
})

// 获取合同列表
router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: '未授权访问'
      })
    }

    const contracts = await ContractService.getUserContracts(req.user.userId)

    res.json({
      success: true,
      data: contracts
    })

  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || '获取合同列表失败'
    })
  }
})

// 获取合同详情
router.get('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: '未授权访问'
      })
    }

    const contract = await ContractService.getContract(req.params.id, req.user.userId)

    if (!contract) {
      return res.status(404).json({
        success: false,
        error: '合同不存在'
      })
    }

    res.json({
      success: true,
      data: contract
    })

  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || '获取合同详情失败'
    })
  }
})

// 删除合同
router.delete('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: '未授权访问'
      })
    }

    const result = await ContractService.deleteContract(req.params.id, req.user.userId)

    if (!result) {
      return res.status(404).json({
        success: false,
        error: '合同不存在'
      })
    }

    res.json({
      success: true,
      message: '合同删除成功'
    })

  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || '删除合同失败'
    })
  }
})

// 获取合同分析结果
router.get('/:id/analysis', authenticate, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: '未授权访问'
      })
    }

    const analysis = await ContractService.getContractAnalysis(req.params.id, req.user.userId)

    if (!analysis) {
      return res.status(404).json({
        success: false,
        error: '合同分析结果不存在'
      })
    }

    res.json({
      success: true,
      data: analysis
    })

  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || '获取合同分析结果失败'
    })
  }
})

// 下载合同文件
router.get('/:id/download', authenticate, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: '未授权访问'
      })
    }

    const contract = await ContractService.getContract(req.params.id, req.user.userId)

    if (!contract) {
      return res.status(404).json({
        success: false,
        error: '合同不存在'
      })
    }

    const filePath = path.join(process.cwd(), 'uploads', contract.fileName)
    
    // 检查文件是否存在
    try {
      await fs.access(filePath)
    } catch {
      return res.status(404).json({
        success: false,
        error: '文件不存在'
      })
    }

    // 设置下载头
    // 使用fileName，但去掉时间戳部分以获得更清晰的名称
    let downloadName = contract.fileName
    if (downloadName) {
      downloadName = downloadName.replace(/_\d+/, '')
    } else {
      downloadName = 'contract.docx'
    }
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(downloadName)}"`)
    res.setHeader('Content-Type', 'application/octet-stream')

    // 发送文件
    res.sendFile(filePath)

  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || '下载文件失败'
    })
  }
})

export default router