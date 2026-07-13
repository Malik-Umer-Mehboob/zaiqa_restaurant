const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { createMenuItem } = require('./src/controllers/menu.controller');

async function testCreate() {
  const req = {
    body: {
      name: 'Another Burger',
      description: 'Test',
      price: '15.99',
      categoryId: 'a3a2545e-0f68-4c89-b8a6-1d2e787ddd1e',
      available: 'true'
    }
  };
  
  const res = {
    status: function(code) {
      return {
        json: function(data) {
          console.log('Status:', code);
          console.log('Data:', data);
        }
      };
    }
  };

  await createMenuItem(req, res);
}

testCreate().finally(() => prisma.$disconnect());
