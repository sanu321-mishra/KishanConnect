const express = require('express');
const Razorpay = require('razorpay');
const db = require('../db');
const auth = require('../middleware/auth');
const router = express.Router();

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create payment order
router.post('/create-order', auth, async (req, res) => {
  if (req.user.role !== 'buyer') {
    return res.status(403).json({ error: 'Access denied. Buyer only.' });
  }

  const { order_id, amount, currency = 'INR' } = req.body;

  try {
    // Verify the order exists and belongs to the buyer
    const orderResult = await db.query(`
      SELECT o.*, c.name as crop_name, c.type as crop_type
      FROM orders o
      JOIN crops c ON o.crop_id = c.id
      WHERE o.id = $1 AND o.buyer_id = $2 AND o.status = 'pending'
    `, [order_id, req.user.id]);

    if (orderResult.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found or not eligible for payment' });
    }

    const order = orderResult.rows[0];

    // Create Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount: amount * 100, // Razorpay expects amount in paise
      currency: currency,
      receipt: `order_${order_id}`,
      notes: {
        order_id: order_id.toString(),
        crop_name: order.crop_name,
        crop_type: order.crop_type,
        buyer_id: req.user.id.toString()
      }
    });

    // Update order with payment details
    await db.query(`
      UPDATE orders 
      SET payment_order_id = $1, payment_status = 'pending'
      WHERE id = $2
    `, [razorpayOrder.id, order_id]);

    res.json({
      order_id: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key_id: process.env.RAZORPAY_KEY_ID
    });

  } catch (error) {
    console.error('Error creating payment order:', error);
    res.status(500).json({ error: 'Failed to create payment order' });
  }
});

// Verify payment
router.post('/verify', auth, async (req, res) => {
  if (req.user.role !== 'buyer') {
    return res.status(403).json({ error: 'Access denied. Buyer only.' });
  }

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, order_id } = req.body;

  try {
    // Verify the payment signature
    const text = `${razorpay_order_id}|${razorpay_payment_id}`;
    const crypto = require('crypto');
    const signature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(text)
      .digest('hex');

    if (signature !== razorpay_signature) {
      return res.status(400).json({ error: 'Invalid payment signature' });
    }

    // Verify the order belongs to the buyer
    const orderResult = await db.query(`
      SELECT * FROM orders 
      WHERE id = $1 AND buyer_id = $2 AND payment_order_id = $3
    `, [order_id, req.user.id, razorpay_order_id]);

    if (orderResult.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Update order with payment details
    await db.query(`
      UPDATE orders 
      SET payment_id = $1, payment_status = 'completed', status = 'confirmed'
      WHERE id = $2
    `, [razorpay_payment_id, order_id]);

    res.json({ 
      success: true, 
      message: 'Payment verified successfully',
      payment_id: razorpay_payment_id
    });

  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ error: 'Failed to verify payment' });
  }
});

// Get payment status
router.get('/status/:order_id', auth, async (req, res) => {
  if (req.user.role !== 'buyer') {
    return res.status(403).json({ error: 'Access denied. Buyer only.' });
  }

  const { order_id } = req.params;

  try {
    const result = await db.query(`
      SELECT payment_status, payment_id, payment_order_id, status
      FROM orders 
      WHERE id = $1 AND buyer_id = $2
    `, [order_id, req.user.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(result.rows[0]);

  } catch (error) {
    console.error('Error fetching payment status:', error);
    res.status(500).json({ error: 'Failed to fetch payment status' });
  }
});

module.exports = router; 