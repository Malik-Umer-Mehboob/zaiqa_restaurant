const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addDefaultTables() {
  const tables = [
    { tableNumber: 1, capacity: 2 },
    { tableNumber: 2, capacity: 4 },
    { tableNumber: 3, capacity: 6 }
  ];

  for (const t of tables) {
    const existing = await prisma.restaurantTable.findFirst({
      where: { tableNumber: t.tableNumber }
    });
    if (!existing) {
      await prisma.restaurantTable.create({ data: t });
      console.log(`Created Table ${t.tableNumber} (Capacity: ${t.capacity})`);
    } else {
      console.log(`Table ${t.tableNumber} already exists.`);
    }
  }
}

addDefaultTables()
  .then(() => console.log('Done'))
  .catch(console.error)
  .finally(() => prisma.$disconnect());
