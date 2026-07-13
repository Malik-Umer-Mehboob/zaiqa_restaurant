const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixDb() {
  await prisma.menuItem.updateMany({
    where: { name: 'Zinger Cheese Burger' },
    data: { available: true }
  });
  console.log('Fixed Zinger Cheese Burger');
}

fixDb().finally(() => prisma.$disconnect());
