const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const category = await prisma.menuCategory.findFirst({
    where: { name: 'Gourmet Burgers' },
    include: {
      items: true
    }
  });
  console.dir(category, { depth: null });
}

main().catch(console.error).finally(() => prisma.$disconnect());
