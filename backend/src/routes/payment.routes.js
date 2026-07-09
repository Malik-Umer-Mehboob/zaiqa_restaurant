const express = require('express');
const router = express.Router();
const { createCheckoutSession, stripeWebhook } = require('../controllers/payment.controller');
const { verifyToken } = require('../middleware/auth.middleware');

// IMPORTANT: Webhook MUST use express.raw() — NOT express.json()
// Stripe sends a raw Buffer body and signs it. If express.json() parses it first,
// the signature verification will ALWAYS fail.
router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  stripeWebhook
);

// All other payment routes use normal JSON body (handled by global express.json())
router.post('/create-checkout-session', verifyToken, createCheckoutSession);

module.exports = router;
