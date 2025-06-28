// backend/routes/crops.js
const express = require('express');
const db = require('../db');
const auth = require('../middleware/auth');
const router = express.Router();

// Get user's crops (auth required)
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await db.query(
      'SELECT * FROM crops WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('❌ Error fetching crops:', err);
    res.status(500).json({ error: 'Failed to fetch crops' });
  }
});

// Add crop (auth required)
router.post('/add', auth, async (req, res) => {
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

// Update crop (auth required - only owner can update)
router.put('/:id', auth, async (req, res) => {
  const { name, type, price, quantity, village, contact } = req.body;
  const cropId = req.params.id;
  const userId = req.user.id;

  try {
    // First check if the crop belongs to the user
    const checkResult = await db.query(
      'SELECT * FROM crops WHERE id = $1 AND user_id = $2',
      [cropId, userId]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Crop not found or you do not have permission to edit it' });
    }

    const result = await db.query(
      'UPDATE crops SET name = $1, type = $2, price = $3, quantity = $4, village = $5, contact = $6 WHERE id = $7 AND user_id = $8 RETURNING *',
      [name, type, price, quantity, village, contact, cropId, userId]
    );

    res.json({ message: 'Crop updated successfully', crop: result.rows[0] });
  } catch (err) {
    console.error('❌ DB Update Error:', err);
    res.status(500).json({ error: 'Failed to update crop' });
  }
});

// Delete crop (auth required - only owner can delete)
router.delete('/:id', auth, async (req, res) => {
  const cropId = req.params.id;
  const userId = req.user.id;

  try {
    // First check if the crop belongs to the user
    const checkResult = await db.query(
      'SELECT * FROM crops WHERE id = $1 AND user_id = $2',
      [cropId, userId]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Crop not found or you do not have permission to delete it' });
    }

    await db.query(
      'DELETE FROM crops WHERE id = $1 AND user_id = $2',
      [cropId, userId]
    );

    res.json({ message: 'Crop deleted successfully' });
  } catch (err) {
    console.error('❌ DB Delete Error:', err);
    res.status(500).json({ error: 'Failed to delete crop' });
  }
});

// Get single crop (auth required - only owner can view)
router.get('/:id', auth, async (req, res) => {
  const cropId = req.params.id;
  const userId = req.user.id;

  try {
    const result = await db.query(
      'SELECT * FROM crops WHERE id = $1 AND user_id = $2',
      [cropId, userId]
    );

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
