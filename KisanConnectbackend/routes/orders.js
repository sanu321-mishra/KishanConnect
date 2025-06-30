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
    // Get crop details to calculate total price and check availability
    const cropResult = await db.query('SELECT price, quantity FROM crops WHERE id = $1', [crop_id]);
    if (cropResult.rows.length === 0) {
      return res.status(404).json({ error: 'Crop not found' });
    }

    const crop = cropResult.rows[0];
    
    // Check if requested quantity is available
    if (crop.quantity < quantity) {
      return res.status(400).json({ error: 'Insufficient quantity available. Available: ' + crop.quantity + ' kg' });
    }

    const total_price = crop.price * quantity;

    // Start a transaction to ensure data consistency
    const client = await db.connect();
    
    try {
      await client.query('BEGIN');

      // Insert the order
      const result = await client.query(
        'INSERT INTO orders (crop_id, buyer_id, quantity, total_price) VALUES ($1, $2, $3, $4) RETURNING *',
        [crop_id, buyer_id, quantity, total_price]
      );

      // Reduce the crop quantity immediately
      await client.query(
        'UPDATE crops SET quantity = quantity - $1 WHERE id = $2',
        [quantity, crop_id]
      );
      console.log('Crop quantity updated for crop_id:', crop_id);

      // Fetch and log the updated quantity
      const updatedCrop = await client.query('SELECT quantity FROM crops WHERE id = $1', [crop_id]);
      console.log('Updated quantity:', updatedCrop.rows[0].quantity);

      await client.query('COMMIT');

      res.json({ message: 'Order placed successfully', order: result.rows[0] });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }

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
    // First, get the order details to know the crop_id and quantity
    const orderResult = await db.query(`
      SELECT o.*, c.quantity as current_crop_quantity 
      FROM orders o 
      JOIN crops c ON o.crop_id = c.id 
      WHERE o.id = $1
    `, [orderId]);

    if (orderResult.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const order = orderResult.rows[0];
    const cropId = order.crop_id;
    const orderQuantity = order.quantity;
    const currentCropQuantity = order.current_crop_quantity;

    // Check if user has permission to update this order
    let hasPermission = false;
    if (req.user.role === 'admin') {
      hasPermission = true;
    } else if (req.user.role === 'farmer') {
      const farmerCheck = await db.query(
        'SELECT id FROM crops WHERE id = $1 AND user_id = $2',
        [cropId, req.user.id]
      );
      hasPermission = farmerCheck.rows.length > 0;
    }

    if (!hasPermission) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Update order status
    let result;
    if (req.user.role === 'admin') {
      result = await db.query(
        'UPDATE orders SET status = $1 WHERE id = $2 RETURNING *',
        [status, orderId]
      );
    } else if (req.user.role === 'farmer') {
      result = await db.query(`
        UPDATE orders SET status = $1 
        WHERE id = $2 AND crop_id IN (
          SELECT id FROM crops WHERE user_id = $3
        ) RETURNING *
      `, [status, orderId, req.user.id]);
    }

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found or no permission' });
    }

    // Handle quantity changes based on status
    if (status === 'canceled' && order.status === 'pending') {
      // If canceling a pending order, restore the crop quantity
      await db.query(
        'UPDATE crops SET quantity = quantity + $1 WHERE id = $2',
        [orderQuantity, cropId]
      );
    }

    res.json({ message: 'Order status updated', order: result.rows[0] });
  } catch (err) {
    console.error('Error updating order status:', err);
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

// Delete order (buyer can delete their own order)
router.delete('/:id', auth, async (req, res) => {
  const orderId = req.params.id;

  if (req.user.role !== 'buyer') {
    return res.status(403).json({ error: 'Access denied. Buyers only.' });
  }

  try {
    // Check if the order belongs to the buyer and is still pending
    const orderResult = await db.query(
      'SELECT * FROM orders WHERE id = $1 AND buyer_id = $2 AND status = $3',
      [orderId, req.user.id, 'pending']
    );
    if (orderResult.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found or cannot be deleted' });
    }

    // Restore crop quantity if needed
    const order = orderResult.rows[0];
    await db.query(
      'UPDATE crops SET quantity = quantity + $1 WHERE id = $2',
      [order.quantity, order.crop_id]
    );

    // Delete the order
    await db.query('DELETE FROM orders WHERE id = $1', [orderId]);

    res.json({ message: 'Order deleted successfully' });
  } catch (err) {
    console.error('Error deleting order:', err);
    res.status(500).json({ error: 'Failed to delete order' });
  }
});

module.exports = router; 