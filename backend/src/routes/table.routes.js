const express = require('express');
const { getAllTables, createTable, updateTable, deleteTable } = require('../controllers/table.controller');
const { verifyToken, requireAdmin } = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/', verifyToken, requireAdmin, getAllTables);
router.post('/', verifyToken, requireAdmin, createTable);
router.put('/:id', verifyToken, requireAdmin, updateTable);
router.delete('/:id', verifyToken, requireAdmin, deleteTable);

module.exports = router;
