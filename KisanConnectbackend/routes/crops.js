// backend/routes/crops.js
const express = require('express');
const db = require('../db');
const auth = require('../middleware/auth');
const router = express.Router();

// Get crops based on user role
router.get('/', auth, async (req, res) => {
  try {
    let result;
    
    if (req.user.role === 'farmer') {
      // Farmers see only their own crops
      result = await db.query(
      'SELECT * FROM crops WHERE user_id = $1 ORDER BY created_at DESC',
        [req.user.id]
    );
    } else if (req.user.role === 'buyer') {
      // Buyers see all available crops
      result = await db.query(`
        SELECT c.*, u.name as farmer_name, c.village as farmer_village
        FROM crops c
        JOIN users u ON c.user_id = u.id
        WHERE c.quantity > 0
        ORDER BY c.created_at DESC
      `);
    } else if (req.user.role === 'admin') {
      // Admins see all crops with farmer info
      result = await db.query(`
        SELECT c.*, u.name as farmer_name, u.email as farmer_email
        FROM crops c
        JOIN users u ON c.user_id = u.id
        ORDER BY c.created_at DESC
      `);
    }
    
    res.json(result.rows);
  } catch (err) {
    console.error('❌ Error fetching crops:', err);
    res.status(500).json({ error: 'Failed to fetch crops' });
  }
});

// Add crop (farmer only)
router.post('/add', auth, async (req, res) => {
    if (req.user.role !== 'farmer') {
      return res.status(403).json({ error: 'Access denied. Farmers only.' });
    }

    const { name, type, price, quantity, village, contact } = req.body;
    const userId = req.user.id;
  
    console.log('📥 Insert values:', { name, type, price, quantity, village, contact, userId });
  
    try {
      const result = await db.query(
        'INSERT INTO crops (name, type, price, quantity, village, contact, user_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
        [name, type, price, quantity, village, contact, userId]
      );
      
      const newCrop = result.rows[0];
      res.json({ message: 'Crop added successfully', crop: newCrop });
    } catch (err) {
      console.error('❌ DB Insert Error:', err);
      res.status(500).json({ error: 'Failed to add crop', details: err.message });
    }
});

// Update crop (farmer can update their own, admin can update any)
router.put('/:id', auth, async (req, res) => {
  const { name, type, price, quantity, village, contact } = req.body;
  const cropId = req.params.id;

  try {
    let result;
    
    if (req.user.role === 'admin') {
      // Admin can update any crop
      result = await db.query(
        'UPDATE crops SET name = $1, type = $2, price = $3, quantity = $4, village = $5, contact = $6 WHERE id = $7 RETURNING *',
        [name, type, price, quantity, village, contact, cropId]
      );
    } else if (req.user.role === 'farmer') {
      // Farmer can only update their own crops
      result = await db.query(
        'UPDATE crops SET name = $1, type = $2, price = $3, quantity = $4, village = $5, contact = $6 WHERE id = $7 AND user_id = $8 RETURNING *',
        [name, type, price, quantity, village, contact, cropId, req.user.id]
    );
    } else {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Crop not found or you do not have permission to edit it' });
    }

    res.json({ message: 'Crop updated successfully', crop: result.rows[0] });
  } catch (err) {
    console.error('❌ DB Update Error:', err);
    res.status(500).json({ error: 'Failed to update crop' });
  }
});

// Delete crop (admin only)
router.delete('/:id', auth, async (req, res) => {
  const cropId = req.params.id;

  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Admins only.' });
  }

  try {
    const result = await db.query('DELETE FROM crops WHERE id = $1 RETURNING *', [cropId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Crop not found' });
    }
    res.json({ message: 'Crop deleted successfully' });
  } catch (err) {
    console.error('❌ DB Delete Error:', err);
    res.status(500).json({ error: 'Failed to delete crop' });
  }
});

// Get single crop
router.get('/:id', auth, async (req, res) => {
  const cropId = req.params.id;

  try {
    let result;
    
    if (req.user.role === 'admin') {
      // Admin can view any crop
      result = await db.query(`
        SELECT c.*, u.name as farmer_name, u.email as farmer_email
        FROM crops c
        JOIN users u ON c.user_id = u.id
        WHERE c.id = $1
      `, [cropId]);
    } else if (req.user.role === 'farmer') {
      // Farmer can only view their own crops
      result = await db.query(
      'SELECT * FROM crops WHERE id = $1 AND user_id = $2',
        [cropId, req.user.id]
    );
    } else if (req.user.role === 'buyer') {
      // Buyer can view any available crop
      result = await db.query(`
        SELECT c.*, u.name as farmer_name, c.village as farmer_village
        FROM crops c
        JOIN users u ON c.user_id = u.id
        WHERE c.id = $1 AND c.quantity > 0
      `, [cropId]);
    }

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Crop not found or you do not have permission to view it' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('❌ Error fetching crop:', err);
    res.status(500).json({ error: 'Failed to fetch crop' });
  }
});

module.exports = router;
