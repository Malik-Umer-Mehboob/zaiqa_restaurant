const express = require('express');
const { 
  createReservation, 
  getMyReservations, 
  getAllReservations, 
  updateReservationStatus 
} = require('../controllers/reservation.controller');
const { verifyToken, requireAdmin } = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/my-reservations', verifyToken, getMyReservations);
router.post('/', verifyToken, createReservation);

router.get('/', verifyToken, requireAdmin, getAllReservations);
router.patch('/:id/status', verifyToken, requireAdmin, updateReservationStatus);

module.exports = router;
