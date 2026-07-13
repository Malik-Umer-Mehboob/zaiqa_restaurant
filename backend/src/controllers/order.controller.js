const prisma = require('../config/db');

const createOrder = async (req, res) => {
  try {
    // Note: deliveryAddress is not in the Prisma schema, so we skip saving it.
    const { orderType, items, deliveryAddress } = req.body;
    const userId = req.user.userId; // from verifyToken payload

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Order items are required' });
    }

    // Get item IDs
    const itemIds = items.map(item => item.menuItemId);
    
    // Fetch all items from DB to get actual prices
    const menuItems = await prisma.menuItem.findMany({
      where: {
        id: { in: itemIds },
        isDeleted: false,
        available: true
      }
    });

    // Create a map for quick price lookup
    const priceMap = {};
    menuItems.forEach(item => {
      priceMap[item.id] = parseFloat(item.price);
    });

    let subtotal = 0;
    const orderItemsData = [];

    for (const item of items) {
      const price = priceMap[item.menuItemId];
      if (price === undefined) {
        return res.status(400).json({ success: false, message: `Menu item not found: ${item.menuItemId}` });
      }

      subtotal += price * item.quantity;
      orderItemsData.push({
        menuItemId: item.menuItemId,
        quantity: item.quantity,
        price: price, // store historical price
        customizations: item.customizations || null,
      });
    }

    // Calculate tax and total
    const TAX_RATE = 0.05; // 5% tax example
    const tax = subtotal * TAX_RATE;
    const deliveryFee = orderType === 'DELIVERY' ? 5.00 : 0.00; // Sample delivery fee
    const total = subtotal + tax + deliveryFee;

    // Use Prisma transaction
    const order = await prisma.$transaction(async (prismaClient) => {
      const newOrder = await prismaClient.order.create({
        data: {
          orderType,
          subtotal,
          tax,
          deliveryFee,
          total,
          userId,
          status: 'PLACED',
          items: {
            create: orderItemsData
          }
        },
        include: {
          items: true
        }
      });
      return newOrder;
    });

    res.status(201).json({ success: true, data: order });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: { menuItem: true }
        },
        user: {
          select: { name: true, email: true, phone: true }
        }
      }
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Check ownership
    if (order.userId !== req.user.userId && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    console.error('Get order by ID error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const getMyOrders = async (req, res) => {
  try {
    const userId = req.user.userId;
    const orders = await prisma.order.findMany({
      where: { userId },
      include: {
        items: { include: { menuItem: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    console.error('Get my orders error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const getAllOrders = async (req, res) => {
  try {
    const { status, orderType } = req.query;
    
    const filter = {};
    if (status) filter.status = status;
    if (orderType) filter.orderType = orderType;

    const orders = await prisma.order.findMany({
      where: filter,
      include: {
        user: { select: { name: true, phone: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ success: false, message: 'Status is required' });
    }

    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { status }
    });

    // Emit real-time socket event
    const io = req.app.get('io');
    if (io) {
      io.to(`order_${id}`).emit('order_status_updated', { status });
    }

    res.status(200).json({ success: true, data: updatedOrder });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = {
  createOrder,
  getOrderById,
  getMyOrders,
  getAllOrders,
  updateOrderStatus
};
