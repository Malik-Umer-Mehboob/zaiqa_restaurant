const express = require('express');
const { 
  createOrder, 
  getOrderById, 
  getMyOrders, 
  getAllOrders, 
  updateOrderStatus 
} = require('../controllers/order.controller');
const { verifyToken, requireAdmin } = require('../middleware/auth.middleware');

const router = express.Router();

// Admin routes
router.get('/', verifyToken, requireAdmin, getAllOrders);
router.patch('/:id/status', verifyToken, requireAdmin, updateOrderStatus);

// Public / Customer routes (require login)
// Note: /my-orders is placed before /:id to avoid being interpreted as a dynamic parameter
router.get('/my-orders', verifyToken, getMyOrders);
router.post('/', verifyToken, createOrder);
router.get('/:id', verifyToken, getOrderById);

module.exports = router;
