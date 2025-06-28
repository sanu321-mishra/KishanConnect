// backend/routes/crops.js
const express = require('express');
const db = require('../db');
const verifyToken = require('../middleware/auth');
const router = express.Router();

// Add crop (auth required)
router.post('/add', verifyToken, async (req, res) => {
    const { name, type, price, quantity, village, contact } = req.body;
    const userId = req.user?.id;
  
    console.log('📥 Insert values:', { name, type, price, quantity, village, contact, userId });
  
    try {
      await db.query(
        'INSERT INTO crops (name, type, price, quantity, village, contact, user_id) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [name, type, price, quantity, village, contact, userId]
      );
      res.json({ message: 'Crop added' });
    } catch (err) {
      console.error('❌ DB Insert Error:', err);
      res.status(500).json({ error: 'Failed to add crop', details: err.message });
    }
  });  

// Public crop list
router.get('/', async (req, res) => {
  const result = await db.query('SELECT * FROM crops');
  res.json(result.rows);
});

module.exports = router;
