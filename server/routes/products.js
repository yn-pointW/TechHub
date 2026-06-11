const express = require('express');
const { getDb, parseProduct } = require('../database');
const { adminMiddleware } = require('../middleware/auth');

const router = express.Router();

router.get('/', (req, res) => {
  const db = getDb();
  const { category, subcategory, search, filter, sort, limit, offset } = req.query;

  let query = 'SELECT * FROM products WHERE isActive = 1';
  const params = [];

  if (category) { query += ' AND category = ?'; params.push(category); }
  if (subcategory) { query += ' AND subcategory = ?'; params.push(subcategory); }
  if (search) {
    query += ' AND (LOWER(name) LIKE ? OR LOWER(brand) LIKE ?)';
    params.push(`%${search.toLowerCase()}%`, `%${search.toLowerCase()}%`);
  }
  if (filter === 'sale') { query += ' AND oldPrice IS NOT NULL AND oldPrice > price'; }
  else if (filter === 'new') { query += " AND badges LIKE '%\"new\"%'"; }
  else if (filter === 'limited') { query += " AND badges LIKE '%\"limited\"%'"; }

  switch (sort) {
    case 'newest': query += ' ORDER BY rowid DESC'; break;
    case 'expensive': query += ' ORDER BY price DESC'; break;
    case 'cheap': query += ' ORDER BY price ASC'; break;
    case 'discount': query += ' ORDER BY discount DESC NULLS LAST'; break;
    default: query += ' ORDER BY rating DESC, reviewCount DESC';
  }

  const total = db.prepare(`SELECT COUNT(*) as c FROM (${query})`).get(...params).c;

  const lim = parseInt(limit) || 100;
  const off = parseInt(offset) || 0;
  query += ` LIMIT ? OFFSET ?`;
  params.push(lim, off);

  const rows = db.prepare(query).all(...params);
  res.json({ products: rows.map(parseProduct), total });
});

router.get('/:id', (req, res) => {
  const db = getDb();
  const row = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Product not found' });
  res.json(parseProduct(row));
});

router.post('/', adminMiddleware, (req, res) => {
  const db = getDb();
  const p = req.body;
  const id = `p_${Date.now()}`;

  db.prepare(`
    INSERT INTO products (id, name, brand, category, subcategory, price, oldPrice, discount, images, specs, description, stock, rating, reviewCount, badges, colors, storageOptions, cashback, monthlyPayment, isActive)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id, p.name, p.brand, p.category, p.subcategory || '',
    p.price, p.oldPrice || null, p.discount || null,
    JSON.stringify(p.images || []), JSON.stringify(p.specs || {}),
    p.description || '', p.stock || 0, p.rating || 0, p.reviewCount || 0,
    JSON.stringify(p.badges || []), JSON.stringify(p.colors || []),
    JSON.stringify(p.storageOptions || []), p.cashback || null, p.monthlyPayment || null,
    p.isActive !== false ? 1 : 0
  );

  const row = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
  res.status(201).json(parseProduct(row));
});

router.put('/:id', adminMiddleware, (req, res) => {
  const db = getDb();
  const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Product not found' });

  const current = parseProduct(existing);
  const p = req.body;

  // Merge: only override fields explicitly present in body
  const merged = {
    name: p.name ?? current.name,
    brand: p.brand ?? current.brand,
    category: p.category ?? current.category,
    subcategory: p.subcategory ?? current.subcategory ?? '',
    price: p.price ?? current.price,
    oldPrice: p.oldPrice !== undefined ? p.oldPrice : current.oldPrice,
    discount: p.discount !== undefined ? p.discount : current.discount,
    images: p.images ?? current.images,
    specs: p.specs ?? current.specs,
    description: p.description ?? current.description ?? '',
    stock: p.stock ?? current.stock,
    rating: p.rating !== undefined ? p.rating : current.rating,
    reviewCount: p.reviewCount !== undefined ? p.reviewCount : current.reviewCount,
    badges: p.badges ?? current.badges,
    colors: p.colors ?? current.colors,
    storageOptions: p.storageOptions ?? current.storageOptions,
    cashback: p.cashback !== undefined ? p.cashback : current.cashback,
    monthlyPayment: p.monthlyPayment !== undefined ? p.monthlyPayment : current.monthlyPayment,
    isActive: p.isActive !== undefined ? p.isActive : current.isActive,
  };

  db.prepare(`
    UPDATE products SET name=?, brand=?, category=?, subcategory=?, price=?, oldPrice=?, discount=?,
    images=?, specs=?, description=?, stock=?, rating=?, reviewCount=?, badges=?, colors=?,
    storageOptions=?, cashback=?, monthlyPayment=?, isActive=?
    WHERE id=?
  `).run(
    merged.name, merged.brand, merged.category, merged.subcategory,
    merged.price, merged.oldPrice, merged.discount,
    JSON.stringify(merged.images), JSON.stringify(merged.specs),
    merged.description, merged.stock, merged.rating, merged.reviewCount,
    JSON.stringify(merged.badges), JSON.stringify(merged.colors),
    JSON.stringify(merged.storageOptions), merged.cashback, merged.monthlyPayment,
    merged.isActive ? 1 : 0, req.params.id
  );

  const row = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  res.json(parseProduct(row));
});

router.delete('/:id', adminMiddleware, (req, res) => {
  const db = getDb();
  db.prepare('UPDATE products SET isActive = 0 WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

router.get('/:id/reviews', (req, res) => {
  const db = getDb();
  const rows = db.prepare('SELECT * FROM reviews WHERE productId = ? ORDER BY createdAt DESC').all(req.params.id);
  res.json(rows);
});

module.exports = router;