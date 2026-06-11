const express = require('express');
const { getDb, parseCategory } = require('../database');

const router = express.Router();

router.get('/', (req, res) => {
  const db = getDb();
  const rows = db.prepare('SELECT * FROM categories ORDER BY sortOrder ASC').all();
  const countStmt = db.prepare('SELECT COUNT(*) as c FROM products WHERE category = ? AND subcategory = ? AND isActive = 1');
  const categories = rows.map(row => {
    const cat = parseCategory(row);
    cat.subcategories = cat.subcategories.map(sub => ({
      ...sub,
      productCount: countStmt.get(cat.slug, sub.slug)?.c || 0,
    }));
    return cat;
  });
  res.json(categories);
});

router.get('/:slug', (req, res) => {
  const db = getDb();
  const row = db.prepare('SELECT * FROM categories WHERE slug = ?').get(req.params.slug);
  if (!row) return res.status(404).json({ error: 'Category not found' });
  res.json(parseCategory(row));
});

module.exports = router;