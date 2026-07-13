const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function findDupes() {
  const items = await prisma.menuItem.findMany();
  console.dir(items.map(i => ({ id: i.id, name: i.name, price: Number(i.price), isDeleted: i.isDeleted, available: i.available })), { depth: null });
}
findDupes().finally(() => prisma.$disconnect());
