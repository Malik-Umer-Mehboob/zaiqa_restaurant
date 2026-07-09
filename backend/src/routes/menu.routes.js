const express = require('express');
const { 
  getAllMenu, 
  getMenuItem, 
  createCategory, 
  updateCategory,
  deleteCategory,
  createMenuItem, 
  updateMenuItem, 
  deleteMenuItem, 
  toggleAvailability 
} = require('../controllers/menu.controller');
const { verifyToken, requireAdmin } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

const router = express.Router();

// Public routes
router.get('/', getAllMenu);
router.get('/:id', getMenuItem);

// Admin routes
router.post('/category', verifyToken, requireAdmin, createCategory);
router.put('/category/:id', verifyToken, requireAdmin, updateCategory);
router.delete('/category/:id', verifyToken, requireAdmin, deleteCategory);
router.post('/item', verifyToken, requireAdmin, upload.single('image'), createMenuItem);
router.put('/item/:id', verifyToken, requireAdmin, upload.single('image'), updateMenuItem);
router.delete('/item/:id', verifyToken, requireAdmin, deleteMenuItem);
router.patch('/item/:id/toggle-availability', verifyToken, requireAdmin, toggleAvailability);

module.exports = router;
