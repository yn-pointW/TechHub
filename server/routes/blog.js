const express = require('express');
const { getDb } = require('../database');

const router = express.Router();

router.get('/', (_req, res) => {
  const db = getDb();
  const rows = db.prepare('SELECT * FROM blog_posts ORDER BY rowid ASC').all();
  res.json(rows);
});

router.get('/:slug', (req, res) => {
  const db = getDb();
  const row = db.prepare('SELECT * FROM blog_posts WHERE slug = ?').get(req.params.slug);
  if (!row) return res.status(404).json({ error: 'Blog post not found' });
  res.json(row);
});

module.exports = router;
