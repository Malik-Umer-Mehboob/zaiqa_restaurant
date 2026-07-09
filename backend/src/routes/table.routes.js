const express = require('express');
const { getAllTables } = require('../controllers/table.controller');
const { verifyToken, requireAdmin } = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/', verifyToken, requireAdmin, getAllTables);

module.exports = router;
