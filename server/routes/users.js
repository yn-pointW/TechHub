const express = require('express');
const { getDb, parseUser } = require('../database');
const { adminMiddleware } = require('../middleware/auth');

const router = express.Router();

router.get('/', adminMiddleware, (req, res) => {
  const db = getDb();
  const rows = db.prepare('SELECT * FROM users ORDER BY createdAt DESC').all();
  res.json(rows.map(parseUser));
});

module.exports = router;