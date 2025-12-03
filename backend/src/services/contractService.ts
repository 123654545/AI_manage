import { PrismaClient } from '@prisma/client'
import path from 'path'

const prisma = new PrismaClient()

export class ContractService {
  // 创建合同记录
  static async createContract(contractData: {
    userId: string
    fileName: string
    originalName: string
    fileUrl: string
    fileSize: number
    mimeType: string
  }) {
    // 从文件名中提取基础名称作为标题，去除时间戳和扩展名
    const title = contractData.originalName.replace(/\.[^/.]+$/, "") // 移除扩展名作为标题
      .replace(/_\d+$/, "") // 移除末尾的时间戳（如果存在）
    
    const contract = await prisma.contract.create({
      data: {
        userId: contractData.userId,
        fileName: contractData.fileName,
        fileUrl: contractData.fileUrl,
        title: title,
        type: this.getContractType(contractData.originalName),
        uploadedAt: new Date()
      },
      select: {
        id: true,
        fileName: true,
        fileUrl: true,
        title: true,
        type: true,
        uploadedAt: true,
        analysisStatus: true
      }
    })

    return {
      ...contract,
      fileSize: contractData.fileSize,
      mimeType: contractData.mimeType,
      originalName: contractData.originalName,
      fileName: contractData.fileName
    }
  }

  // 获取用户的所有合同
  static async getUserContracts(userId: string) {
    const contracts = await prisma.contract.findMany({
      where: { userId },
      include: {
        analysis: {
          select: {
            id: true,
            keyTerms: true,
            riskPoints: true,
            keyDates: true,
            analyzedAt: true,
            aiModel: true
          }
        }
      },
      orderBy: {
        uploadedAt: 'desc'
      }
    })

    return contracts.map(contract => {
      // 如果title字段为空或乱码，则从fileName中提取基础名称
      let displayName = contract.title
      if (!displayName || displayName.includes('�') || /[\x00-\x1F\x7F-\x9F]/.test(displayName)) {
        // 如果title包含乱码字符，则从fileName中提取基础名称（去掉时间戳）
        displayName = contract.fileName.replace(/_\d+(\.[^.]+)$/, '$1')
      }
      
      return {
        ...contract,
        originalName: displayName // 使用处理后的名称作为显示名称
      }
    })
  }

  // 获取单个合同
  static async getContract(contractId: string, userId: string) {
    const contract = await prisma.contract.findFirst({
      where: {
        id: contractId,
        userId
      },
      include: {
        analysis: {
          select: {
            id: true,
            keyTerms: true,
            riskPoints: true,
            keyDates: true,
            analyzedAt: true,
            aiModel: true
          }
        }
      }
    })

    return contract
  }

  // 删除合同
  static async deleteContract(contractId: string, userId: string): Promise<boolean> {
    const contract = await prisma.contract.findFirst({
      where: {
        id: contractId,
        userId
      }
    })

    if (!contract) {
      return false
    }

    try {
      // 删除数据库记录（级联删除分析记录）
      await prisma.contract.delete({
        where: { id: contractId }
      })

      // 删除文件系统中的文件
      const fs = require('fs/promises')
      const path = require('path')
      const filePath = path.join(process.cwd(), 'uploads', contract.fileName)
      
      try {
        await fs.unlink(filePath)
      } catch (error) {
        console.warn('文件删除失败:', error)
      }

      return true
    } catch (error) {
      console.error('删除合同失败:', error)
      return false
    }
  }

  // 获取合同分析结果
  static async getContractAnalysis(contractId: string, userId: string) {
    const contract = await prisma.contract.findFirst({
      where: {
        id: contractId,
        userId
      },
      include: {
        analysis: true
      }
    })

    if (!contract || !contract.analysis) {
      return null
    }

    return contract.analysis
  }

  // 更新合同分析状态
  static async updateAnalysisStatus(contractId: string, status: string) {
    await prisma.contract.update({
      where: { id: contractId },
      data: { analysisStatus: status }
    })
  }

  // 保存合同分析结果
  static async saveAnalysisResult(analysisData: {
    contractId: string
    extractedText: string
    keyTerms: any
    riskPoints: any
    keyDates: any
    aiModel: string
  }) {
    await prisma.contractAnalysis.upsert({
      where: {
        contractId: analysisData.contractId
      },
      update: {
        extractedText: analysisData.extractedText,
        keyTerms: analysisData.keyTerms,
        riskPoints: analysisData.riskPoints,
        keyDates: analysisData.keyDates,
        analyzedAt: new Date(),
        aiModel: analysisData.aiModel
      },
      create: {
        contractId: analysisData.contractId,
        extractedText: analysisData.extractedText,
        keyTerms: analysisData.keyTerms,
        riskPoints: analysisData.riskPoints,
        keyDates: analysisData.keyDates,
        analyzedAt: new Date(),
        aiModel: analysisData.aiModel
      }
    })

    // 更新合同状态为分析完成
    await this.updateAnalysisStatus(analysisData.contractId, 'completed')
  }

  // 根据文件扩展名确定合同类型
  private static getContractType(fileName: string): string {
    const extension = fileName.toLowerCase().split('.').pop()
    
    switch (extension) {
      case 'pdf':
        return 'PDF文档'
      case 'doc':
      case 'docx':
        return 'Word文档'
      case 'txt':
        return '文本文档'
      default:
        return '其他'
    }
  }
}