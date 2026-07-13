const prisma = require('../config/db');

const getSalesAnalytics = async (req, res) => {
  try {
    const { range } = req.query; // daily, weekly, monthly
    
    // Determine the date limit based on range
    let startDate = new Date();
    if (range === 'weekly') {
      startDate.setDate(startDate.getDate() - 7);
    } else if (range === 'monthly') {
      startDate.setMonth(startDate.getMonth() - 1);
    } else {
      // default to daily (last 7 days for a daily trend chart)
      startDate.setDate(startDate.getDate() - 7);
    }

    // Since Prisma groupBy doesn't natively support grouping by Date parts (like day/month) 
    // without raw SQL, and we want to keep it robust across DBs for this prototype, 
    // we'll fetch the recent orders and reduce in JS.
    const orders = await prisma.order.findMany({
      where: {
        status: 'COMPLETED',
        createdAt: { gte: startDate }
      },
      select: {
        createdAt: true,
        total: true
      },
      orderBy: { createdAt: 'asc' }
    });

    const groupedData = orders.reduce((acc, order) => {
      // Format date as YYYY-MM-DD for Recharts
      const dateKey = order.createdAt.toISOString().split('T')[0];
      
      if (!acc[dateKey]) {
        acc[dateKey] = { date: dateKey, total: 0 };
      }
      acc[dateKey].total += parseFloat(order.total);
      
      return acc;
    }, {});

    const result = Object.values(groupedData);

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error('Get sales analytics error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const getTopItems = async (req, res) => {
  try {
    // Prisma groupBy to get top items by quantity
    const topOrderItems = await prisma.orderItem.groupBy({
      by: ['menuItemId'],
      _sum: {
        quantity: true,
        price: true,
      },
      orderBy: {
        _sum: {
          quantity: 'desc',
        },
      },
      take: 5,
    });

    // Fetch the actual menu item details
    const itemIds = topOrderItems.map(item => item.menuItemId);
    
    const menuItems = await prisma.menuItem.findMany({
      where: { id: { in: itemIds } },
      select: { id: true, name: true, imageUrl: true }
    });

    // Merge the data
    const result = topOrderItems.map(orderItem => {
      const menuItem = menuItems.find(m => m.id === orderItem.menuItemId);
      return {
        id: orderItem.menuItemId,
        name: menuItem ? menuItem.name : 'Unknown Item',
        imageUrl: menuItem ? menuItem.imageUrl : null,
        totalSold: orderItem._sum.quantity,
        revenue: orderItem._sum.price ? parseFloat(orderItem._sum.price) : 0
      };
    });

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error('Get top items error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const getOrderDistribution = async (req, res) => {
  try {
    const distribution = await prisma.order.groupBy({
      by: ['orderType'],
      _count: {
        id: true,
      },
    });

    // Format for Recharts Pie Chart
    const result = distribution.map(d => ({
      name: d.orderType,
      value: d._count.id
    }));

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error('Get order distribution error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = {
  getSalesAnalytics,
  getTopItems,
  getOrderDistribution
};
