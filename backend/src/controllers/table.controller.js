const prisma = require('../config/db');

const getAllTables = async (req, res) => {
  try {
    const tables = await prisma.restaurantTable.findMany({
      orderBy: { tableNumber: 'asc' }
    });
    res.status(200).json({ success: true, data: tables });
  } catch (error) {
    console.error('Get all tables error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = { getAllTables };
