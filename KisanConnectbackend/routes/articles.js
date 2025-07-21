const express = require('express');
const db = require('../db');
const auth = require('../middleware/auth');
const router = express.Router();

// Get all articles (public for authenticated users)
router.get('/', auth, async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM articles ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching articles:', err);
    res.status(500).json({ error: 'Failed to fetch articles' });
  }
});

// Get single article by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM articles WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Article not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching article:', err);
    res.status(500).json({ error: 'Failed to fetch article' });
  }
});

// Add article (admin only)
router.post('/', auth, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Admins only.' });
  }
  const { title, content, category } = req.body;
  try {
    const result = await db.query(
      'INSERT INTO articles (title, content, category, created_at, updated_at, author_id) VALUES ($1, $2, $3, NOW(), NOW(), $4) RETURNING *',
      [title, content, category, req.user.id]
    );
    res.status(201).json({ message: 'Article created', article: result.rows[0] });
  } catch (err) {
    console.error('Error creating article:', err);
    res.status(500).json({ error: 'Failed to create article' });
  }
});

// Update article (admin only)
router.put('/:id', auth, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Admins only.' });
  }
  const { title, content, category } = req.body;
  try {
    const result = await db.query(
      'UPDATE articles SET title = $1, content = $2, category = $3, updated_at = NOW() WHERE id = $4 RETURNING *',
      [title, content, category, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Article not found' });
    }
    res.json({ message: 'Article updated', article: result.rows[0] });
  } catch (err) {
    console.error('Error updating article:', err);
    res.status(500).json({ error: 'Failed to update article' });
  }
});

// Delete article (admin only)
router.delete('/:id', auth, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Admins only.' });
  }
  try {
    const result = await db.query('DELETE FROM articles WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Article not found' });
    }
    res.json({ message: 'Article deleted' });
  } catch (err) {
    console.error('Error deleting article:', err);
    res.status(500).json({ error: 'Failed to delete article' });
  }
});

module.exports = router; 