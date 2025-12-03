const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkContracts() {
  try {
    const contracts = await prisma.contract.findMany({
      include: {
        user: true,
        analysis: true
      }
    });
    console.log('数据库中的合同记录:');
    contracts.forEach(contract => {
      console.log(`- ID: ${contract.id}`);
      console.log(`  文件名: ${contract.fileName}`);
      console.log(`  标题: ${contract.title}`);
      console.log(`  用户: ${contract.user.email}`);
      console.log(`  上传时间: ${contract.uploadedAt}`);
      console.log(`  分析状态: ${contract.analysisStatus}`);
      console.log('---');
    });
  } catch (error) {
    console.error('查询失败:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkContracts();