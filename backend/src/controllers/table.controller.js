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

const createTable = async (req, res) => {
  try {
    const { tableNumber, capacity } = req.body;

    if (!tableNumber || !capacity) {
      return res.status(400).json({ success: false, message: 'Table number and capacity are required' });
    }

    const existingTable = await prisma.restaurantTable.findFirst({
      where: { tableNumber: parseInt(tableNumber) }
    });

    if (existingTable) {
      return res.status(400).json({ success: false, message: 'A table with this number already exists' });
    }

    const table = await prisma.restaurantTable.create({
      data: {
        tableNumber: parseInt(tableNumber),
        capacity: parseInt(capacity)
      }
    });

    res.status(201).json({ success: true, data: table });
  } catch (error) {
    console.error('Create table error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const updateTable = async (req, res) => {
  try {
    const { id } = req.params;
    const { tableNumber, capacity } = req.body;

    const existingTable = await prisma.restaurantTable.findUnique({ where: { id } });
    if (!existingTable) {
      return res.status(404).json({ success: false, message: 'Table not found' });
    }

    if (tableNumber && parseInt(tableNumber) !== existingTable.tableNumber) {
      const duplicateTable = await prisma.restaurantTable.findFirst({
        where: { tableNumber: parseInt(tableNumber) }
      });
      if (duplicateTable) {
        return res.status(400).json({ success: false, message: 'A table with this number already exists' });
      }
    }

    const updatedTable = await prisma.restaurantTable.update({
      where: { id },
      data: {
        tableNumber: tableNumber ? parseInt(tableNumber) : existingTable.tableNumber,
        capacity: capacity ? parseInt(capacity) : existingTable.capacity
      }
    });

    res.status(200).json({ success: true, data: updatedTable });
  } catch (error) {
    console.error('Update table error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const deleteTable = async (req, res) => {
  try {
    const { id } = req.params;

    const existingTable = await prisma.restaurantTable.findUnique({ where: { id } });
    if (!existingTable) {
      return res.status(404).json({ success: false, message: 'Table not found' });
    }

    // Check if table has active or future reservations
    const activeReservations = await prisma.reservation.count({
      where: {
        tableId: id,
        status: { in: ['PENDING', 'CONFIRMED'] }
      }
    });

    if (activeReservations > 0) {
      return res.status(400).json({ success: false, message: 'Cannot delete — table has active reservations' });
    }

    await prisma.restaurantTable.delete({ where: { id } });

    res.status(200).json({ success: true, message: 'Table deleted successfully' });
  } catch (error) {
    console.error('Delete table error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = { getAllTables, createTable, updateTable, deleteTable };
