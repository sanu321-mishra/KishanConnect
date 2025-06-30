// backend/routes/auth.js
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db');
const auth = require('../middleware/auth');
const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  const { name, email, password, role = 'farmer' } = req.body;
  const hash = await bcrypt.hash(password, 10);

  try {
    await db.query(
      'INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4)',
      [name, email, hash, role]
    );
    res.json({ message: 'User registered' });
  } catch (err) {
    res.status(500).json({ error: 'User already exists or DB error' });
  }
});

// Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
  
    try {
      const userRes = await db.query('SELECT * FROM users WHERE email = $1', [email]);
      const user = userRes.rows[0];
  
      if (!user) {
        console.log('❌ No user found for email:', email);
        return res.status(401).json({ error: 'Invalid credentials' });
      }
  
      console.log('🔐 Comparing password:', password);
      console.log('🧂 Hash in DB:', user.password_hash);
  
      const isMatch = await bcrypt.compare(password, user.password_hash);
      console.log('✅ Password match result:', isMatch);
  
      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
  
      // Include user info and role in token payload
      const token = jwt.sign({ 
        id: user.id, 
        name: user.name, 
        email: user.email,
        role: user.role
      }, process.env.JWT_SECRET, { expiresIn: '1d' });
      
      res.json({ token });
    } catch (err) {
      console.error('Login error:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

// Get current user info
router.get('/me', auth, async (req, res) => {
  try {
    const userRes = await db.query('SELECT id, name, email, role FROM users WHERE id = $1', [req.user.id]);
    const user = userRes.rows[0];
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ user });
  } catch (err) {
    console.error('Get user error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
