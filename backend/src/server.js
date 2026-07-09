const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
require('dotenv').config();

// Initialize express app
const app = express();
const server = http.createServer(app);

// Setup Socket.io
const io = new Server(server, {
  cors: {
    origin: '*', // Allow all origins for now, configure strictly in production
  },
});

// Make io instance available in req.app.get('io')
app.set('io', io);
// Also expose globally so Stripe webhook controller (no req context) can emit events
global._io = io;

// Middleware
app.use(cors());
app.use(express.json());

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log(`New client connected: ${socket.id}`);

  // Join specific order room
  socket.on('join_order_room', (orderId) => {
    socket.join(`order_${orderId}`);
    console.log(`Client ${socket.id} joined room order_${orderId}`);
  });

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

// Import Routes
const authRoutes = require('./routes/auth.routes');
const menuRoutes = require('./routes/menu.routes');
const ordersRoutes = require('./routes/order.routes');
const reservationRoutes = require('./routes/reservation.routes');
const tableRoutes = require('./routes/table.routes');
const analyticsRoutes = require('./routes/analytics.routes');
// Payment routes — imported BEFORE express.json() is applied on the router level
// (the webhook route applies express.raw() itself, so global json() won't interfere)
const paymentRoutes = require('./routes/payment.routes');
// .env reminder:
//   STRIPE_SECRET_KEY=sk_test_...
//   STRIPE_WEBHOOK_SECRET=whsec_...
//   FRONTEND_URL=http://localhost:3000

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/tables', tableRoutes);
app.use('/api/admin/analytics', analyticsRoutes);
app.use('/api/payments', paymentRoutes);

// Base route
app.get('/', (req, res) => {
  res.send('Zaiqa API is running');
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});