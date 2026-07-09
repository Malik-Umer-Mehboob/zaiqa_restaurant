const express = require('express');
const { 
  getSalesAnalytics, 
  getTopItems, 
  getOrderDistribution 
} = require('../controllers/analytics.controller');
const { verifyToken, requireAdmin } = require('../middleware/auth.middleware');

const router = express.Router();

// All analytics routes require admin privileges
router.use(verifyToken, requireAdmin);

router.get('/sales', getSalesAnalytics);
router.get('/top-items', getTopItems);
router.get('/order-distribution', getOrderDistribution);

module.exports = router;
