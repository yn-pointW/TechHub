const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDb } = require('./database');

const app = express();
const PORT = process.env.PORT || 3001;

// 1. НАСТРОЙКА CORS: В продакшене разрешаем запросы отовсюду (или можно указать твой url на render)
const allowedOrigins = [
  'http://localhost:3000', 
  'http://127.0.0.1:3000',
  'https://techhub-p7f8.onrender.com' // Добавь свой продакшн URL для надежности
];
app.use(cors({ 
  origin: process.env.NODE_ENV === 'production' ? true : allowedOrigins, 
  credentials: true 
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Static file serving for uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Initialize database
initDb();

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/users', require('./routes/users'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/blog', require('./routes/blog'));

app.get('/api/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// --- ДОБАВЛЕНО ДЛЯ ПРОДАКШЕНА (РАЗДАЧА ФРОНТЕНДА) ---
if (process.env.NODE_ENV === 'production') {
  // Указываем экспрессу отдавать собранную статику из папки app/dist
  // Путь поднимается на уровень выше из папки server и идет в app/dist
  app.use(express.static(path.join(__dirname, '../app/dist')));

  // Любой GET-запрос, который не совпал с API выше, перенаправляем на index.html фронтенда
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../app/dist/index.html'));
  });
}
// -----------------------------------------------------

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`TechHub API server running on port ${PORT}`);
});
