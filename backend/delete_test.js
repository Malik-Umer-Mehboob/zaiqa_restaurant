const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function deleteTestBurger() {
  await prisma.menuItem.deleteMany({
    where: {
      name: {
        contains: 'Another Burger'
      }
    }
  });
  console.log("Deleted test burger");
}

deleteTestBurger().finally(() => prisma.$disconnect());
