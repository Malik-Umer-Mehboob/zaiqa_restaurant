const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  const items = await prisma.menuItem.findMany({ include: { orderItems: true } });
  console.log('=== Current MenuItem State ===');
  items.forEach(i => {
    console.log('Name: ' + i.name);
    console.log('  available=' + i.available + ', isDeleted=' + i.isDeleted + ', orderItemsCount=' + i.orderItems.length);
    console.log('  categoryId=' + i.categoryId);
  });

  const cats = await prisma.menuCategory.findMany();
  console.log('\n=== Categories ===');
  for (const cat of cats) {
    const active = await prisma.menuItem.count({ where: { categoryId: cat.id, isDeleted: false } });
    const soft = await prisma.menuItem.count({ where: { categoryId: cat.id, isDeleted: true } });
    console.log(cat.name + ' (id=' + cat.id + '): active=' + active + ', soft-deleted=' + soft);
  }
}

test().catch(console.error).finally(() => prisma.$disconnect());
