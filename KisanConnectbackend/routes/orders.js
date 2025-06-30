// backend/routes/orders.js
const express = require('express');
const db = require('../db');
const auth = require('../middleware/auth');
const router = express.Router();

// Get all orders (admin only)
router.get('/admin', auth, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Admin only.' });
  }

  try {
    const result = await db.query(`
      SELECT o.*, c.name as crop_name, c.type as crop_type, 
             u.name as buyer_name, f.name as farmer_name
      FROM orders o
      JOIN crops c ON o.crop_id = c.id
      JOIN users u ON o.buyer_id = u.id
      JOIN users f ON c.user_id = f.id
      ORDER BY o.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching orders:', err);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Get orders for buyer (their own orders)
router.get('/buyer', auth, async (req, res) => {
  if (req.user.role !== 'buyer') {
    return res.status(403).json({ error: 'Access denied. Buyer only.' });
  }

  try {
    const result = await db.query(`
      SELECT o.*, c.name as crop_name, c.type as crop_type, f.name as farmer_name
      FROM orders o
      JOIN crops c ON o.crop_id = c.id
      JOIN users f ON c.user_id = f.id
      WHERE o.buyer_id = $1
      ORDER BY o.created_at DESC
    `, [req.user.id]);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching buyer orders:', err);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Get orders for farmer (orders for their crops)
router.get('/farmer', auth, async (req, res) => {
  if (req.user.role !== 'farmer') {
    return res.status(403).json({ error: 'Access denied. Farmer only.' });
  }

  try {
    const result = await db.query(`
      SELECT o.*, c.name as crop_name, c.type as crop_type, u.name as buyer_name
      FROM orders o
      JOIN crops c ON o.crop_id = c.id
      JOIN users u ON o.buyer_id = u.id
      WHERE c.user_id = $1
      ORDER BY o.created_at DESC
    `, [req.user.id]);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching farmer orders:', err);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Place order (buyer only)
router.post('/place', auth, async (req, res) => {
  if (req.user.role !== 'buyer') {
    return res.status(403).json({ error: 'Access denied. Buyer only.' });
  }

  const { crop_id, quantity } = req.body;
  const buyer_id = req.user.id;

  try {
    // Get crop details to calculate total price
    const cropResult = await db.query('SELECT price FROM crops WHERE id = $1', [crop_id]);
    if (cropResult.rows.length === 0) {
      return res.status(404).json({ error: 'Crop not found' });
    }

    const crop = cropResult.rows[0];
    const total_price = crop.price * quantity;

    const result = await db.query(
      'INSERT INTO orders (crop_id, buyer_id, quantity, total_price) VALUES ($1, $2, $3, $4) RETURNING *',
      [crop_id, buyer_id, quantity, total_price]
    );

    res.json({ message: 'Order placed successfully', order: result.rows[0] });
  } catch (err) {
    console.error('Error placing order:', err);
    res.status(500).json({ error: 'Failed to place order' });
  }
});

// Update order status (farmer or admin)
router.put('/:id/status', auth, async (req, res) => {
  const { status } = req.body;
  const orderId = req.params.id;

  if (!['pending', 'confirmed', 'delivered', 'canceled'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  try {
    let result;
    if (req.user.role === 'admin') {
      // Admin can update any order
      result = await db.query(
        'UPDATE orders SET status = $1 WHERE id = $2 RETURNING *',
        [status, orderId]
      );
    } else if (req.user.role === 'farmer') {
      // Farmer can only update orders for their crops
      result = await db.query(`
        UPDATE orders SET status = $1 
        WHERE id = $2 AND crop_id IN (
          SELECT id FROM crops WHERE user_id = $3
        ) RETURNING *
      `, [status, orderId, req.user.id]);
    } else {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found or no permission' });
    }

    res.json({ message: 'Order status updated', order: result.rows[0] });
  } catch (err) {
    console.error('Error updating order status:', err);
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

module.exports = router; 