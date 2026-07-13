const prisma = require('../config/db');

const createReservation = async (req, res) => {
  try {
    let { date, time, guests, tableId } = req.body;
    const userId = req.user.userId;

    if (!date || !time || !guests) {
      return res.status(400).json({ success: false, message: 'Missing required fields (date, time, guests)' });
    }

    const reservationDate = new Date(date);
    const parsedGuests = parseInt(guests);

    if (tableId) {
      // Check if table exists and has capacity
      const table = await prisma.restaurantTable.findUnique({ where: { id: tableId } });
      if (!table) {
        return res.status(404).json({ success: false, message: 'Table not found' });
      }
      if (parsedGuests > table.capacity) {
        return res.status(400).json({ success: false, message: `Table capacity is only ${table.capacity} guests` });
      }

      // Conflict check
      const existingReservation = await prisma.reservation.findFirst({
        where: {
          tableId,
          date: reservationDate,
          time,
          status: {
            in: ['PENDING', 'CONFIRMED']
          }
        }
      });

      if (existingReservation) {
        return res.status(409).json({ success: false, message: 'Table is already reserved for this date and time' });
      }
    } else {
      // Auto-assign table
      const availableTables = await prisma.restaurantTable.findMany({
        where: {
          capacity: { gte: parsedGuests }
        },
        orderBy: { capacity: 'asc' } // Try to use the smallest table that fits
      });

      let foundTableId = null;
      for (const t of availableTables) {
        const conflict = await prisma.reservation.findFirst({
          where: {
            tableId: t.id,
            date: reservationDate,
            time,
            status: {
              in: ['PENDING', 'CONFIRMED']
            }
          }
        });
        if (!conflict) {
          foundTableId = t.id;
          break;
        }
      }

      if (!foundTableId) {
        return res.status(400).json({ success: false, message: 'No tables available for this date and time' });
      }
      
      tableId = foundTableId;
    }

    const reservation = await prisma.reservation.create({
      data: {
        date: reservationDate,
        time,
        guests: parsedGuests,
        tableId,
        userId,
        status: 'PENDING'
      }
    });

    res.status(201).json({ success: true, data: reservation });
  } catch (error) {
    console.error('Create reservation error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const getMyReservations = async (req, res) => {
  try {
    const userId = req.user.userId;
    const reservations = await prisma.reservation.findMany({
      where: { userId },
      include: { table: true },
      orderBy: [{ date: 'desc' }, { time: 'desc' }]
    });

    res.status(200).json({ success: true, data: reservations });
  } catch (error) {
    console.error('Get my reservations error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const getAllReservations = async (req, res) => {
  try {
    const { date, groupByDate } = req.query;
    
    const filter = {};
    if (date) {
      filter.date = new Date(date);
    }

    const reservations = await prisma.reservation.findMany({
      where: filter,
      include: {
        table: true,
        user: { select: { name: true, phone: true } }
      },
      orderBy: [{ date: 'asc' }, { time: 'asc' }]
    });

    if (groupByDate === 'true') {
      const grouped = reservations.reduce((acc, curr) => {
        const dateKey = curr.date.toISOString().split('T')[0];
        if (!acc[dateKey]) acc[dateKey] = [];
        acc[dateKey].push(curr);
        return acc;
      }, {});
      
      return res.status(200).json({ success: true, data: grouped });
    }

    res.status(200).json({ success: true, data: reservations });
  } catch (error) {
    console.error('Get all reservations error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const updateReservationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const reservation = await prisma.reservation.findUnique({ where: { id } });
    if (!reservation) {
      return res.status(404).json({ success: false, message: 'Reservation not found' });
    }

    const updatedReservation = await prisma.reservation.update({
      where: { id },
      data: { status }
    });

    res.status(200).json({ success: true, data: updatedReservation });
  } catch (error) {
    console.error('Update reservation status error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = {
  createReservation,
  getMyReservations,
  getAllReservations,
  updateReservationStatus
};
