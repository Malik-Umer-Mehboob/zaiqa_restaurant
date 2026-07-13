const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function check() {
  const cats = await prisma.menuCategory.findMany({ include: { items: true } });
  console.dir(cats, { depth: null });
}
check().finally(() => prisma.$disconnect());
