const express = require('express');
const { getDb, parseOrder } = require('../database');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const router = express.Router();

router.get('/', adminMiddleware, (req, res) => {
  const db = getDb();
  const { status } = req.query;
  let query = 'SELECT * FROM orders ORDER BY createdAt DESC';
  const params = [];
  if (status && status !== 'all') {
    query = 'SELECT * FROM orders WHERE status = ? ORDER BY createdAt DESC';
    params.push(status);
  }
  const rows = db.prepare(query).all(...params);
  res.json(rows.map(parseOrder));
});

router.get('/my', authMiddleware, (req, res) => {
  const db = getDb();
  const rows = db.prepare('SELECT * FROM orders WHERE userId = ? ORDER BY createdAt DESC').all(req.user.id);
  res.json(rows.map(parseOrder));
});

router.post('/', authMiddleware, (req, res) => {
  const db = getDb();
  const { items, total, discount, deliveryAddress, paymentMethod } = req.body;
  const id = `ord-${Date.now()}`;
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO orders (id, userId, items, status, total, discount, deliveryAddress, paymentMethod, createdAt, updatedAt)
    VALUES (?, ?, ?, 'new', ?, ?, ?, ?, ?, ?)
  `).run(id, req.user.id, JSON.stringify(items || []), total || 0, discount || 0,
    JSON.stringify(deliveryAddress || {}), paymentMethod || 'Карта', now, now);

  const row = db.prepare('SELECT * FROM orders WHERE id = ?').get(id);
  res.status(201).json(parseOrder(row));
});

router.put('/:id/status', adminMiddleware, (req, res) => {
  const { status } = req.body;
  const validStatuses = ['new', 'processing', 'shipped', 'delivered', 'cancelled'];
  if (!validStatuses.includes(status)) return res.status(400).json({ error: 'Invalid status' });

  const db = getDb();
  db.prepare('UPDATE orders SET status = ?, updatedAt = ? WHERE id = ?').run(status, new Date().toISOString(), req.params.id);
  const row = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Order not found' });
  res.json(parseOrder(row));
});

module.exports = router;