const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const prisma = require('../config/db');

// POST /api/payments/create-checkout-session
const createCheckoutSession = async (req, res) => {
  const { orderId } = req.body;
  const userId = req.user.userId;

  if (!orderId) {
    return res.status(400).json({ success: false, message: 'orderId is required' });
  }

  try {
    // Fetch order with items & menuItem details from DB
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: { menuItem: true },
        },
      },
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Security: only the order owner or an admin can pay for it
    if (order.userId !== userId && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    // Build Stripe line_items from actual DB prices (never trust client)
    const lineItems = order.items.map((item) => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.menuItem.name,
          ...(item.menuItem.imageUrl ? { images: [item.menuItem.imageUrl] } : {}),
        },
        // Stripe expects price in smallest currency unit (cents)
        unit_amount: Math.round(Number(item.menuItem.price) * 100),
      },
      quantity: item.quantity,
    }));

    // Add tax as a separate line item for transparency
    if (Number(order.tax) > 0) {
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: { name: 'Tax (5%)' },
          unit_amount: Math.round(Number(order.tax) * 100),
        },
        quantity: 1,
      });
    }

    // Add delivery fee if applicable
    if (Number(order.deliveryFee) > 0) {
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: { name: 'Delivery Fee' },
          unit_amount: Math.round(Number(order.deliveryFee) * 100),
        },
        quantity: 1,
      });
    }

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: lineItems,
      // Pass orderId in query params so we can confirm on return
      success_url: `${frontendUrl}/payment-success?orderId=${orderId}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontendUrl}/payment-cancelled?orderId=${orderId}`,
      // Store orderId in metadata for webhook lookup
      metadata: { orderId },
    });

    return res.status(200).json({ success: true, data: { url: session.url } });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return res.status(500).json({ success: false, message: 'Failed to create payment session' });
  }
};

// POST /api/payments/webhook
// NOTE: This handler receives a RAW Buffer body (express.raw middleware applied in routes)
const stripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,             // raw Buffer — crucial for signature verification
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).json({ success: false, message: `Webhook Error: ${err.message}` });
  }

  // Handle the event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const orderId = session.metadata?.orderId;

    if (!orderId) {
      console.error('Webhook: orderId missing from session metadata');
      return res.status(400).json({ success: false, message: 'orderId missing from metadata' });
    }

    try {
      // Update order status from PLACED -> CONFIRMED
      const updatedOrder = await prisma.order.update({
        where: { id: orderId },
        data: { status: 'CONFIRMED' },
      });

      // Emit real-time update to customer's tracking page
      // io is stored on app via app.set('io', io) in server.js
      // We access it via global pattern since webhook doesn't go through express routing normally
      const io = global._io;
      if (io) {
        io.to(`order_${orderId}`).emit('order_status_updated', { status: 'CONFIRMED' });
      }

      console.log(`Order ${orderId} confirmed via Stripe webhook`);
    } catch (dbError) {
      console.error('Webhook: DB update failed:', dbError);
      // Return 500 so Stripe retries
      return res.status(500).json({ success: false, message: 'DB update failed' });
    }
  }

  // Return 200 to acknowledge receipt to Stripe
  res.status(200).json({ received: true });
};

module.exports = { createCheckoutSession, stripeWebhook };
