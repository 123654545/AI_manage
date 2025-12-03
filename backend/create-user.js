const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function createTestUser() {
  try {
    const hashedPassword = await bcrypt.hash('213007pan', 10);
    const user = await prisma.user.upsert({
      where: { email: 'wang1528766955@qq.com' },
      update: {},
      create: {
        email: 'wang1528766955@qq.com',
        passwordHash: hashedPassword
      }
    });
    console.log('测试用户创建成功:', user.email);
  } catch (error) {
    console.error('创建用户失败:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser();