const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'techhub.db');

let db;

function getDb() {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
  }
  return db;
}

function initDb() {
  const db = getDb();

  db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      icon TEXT,
      iconColor TEXT,
      parentId TEXT,
      subcategories TEXT NOT NULL DEFAULT '[]',
      filterGroups TEXT NOT NULL DEFAULT '[]',
      sortOrder INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      brand TEXT NOT NULL,
      category TEXT NOT NULL,
      subcategory TEXT,
      price REAL NOT NULL,
      oldPrice REAL,
      discount INTEGER,
      images TEXT NOT NULL DEFAULT '[]',
      specs TEXT NOT NULL DEFAULT '{}',
      description TEXT,
      stock INTEGER NOT NULL DEFAULT 0,
      rating REAL NOT NULL DEFAULT 0,
      reviewCount INTEGER NOT NULL DEFAULT 0,
      badges TEXT NOT NULL DEFAULT '[]',
      colors TEXT NOT NULL DEFAULT '[]',
      storageOptions TEXT NOT NULL DEFAULT '[]',
      cashback REAL,
      monthlyPayment REAL,
      isActive INTEGER NOT NULL DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      phone TEXT,
      passwordHash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user',
      avatar TEXT,
      addresses TEXT NOT NULL DEFAULT '[]',
      createdAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      items TEXT NOT NULL DEFAULT '[]',
      status TEXT NOT NULL DEFAULT 'new',
      total REAL NOT NULL,
      discount REAL NOT NULL DEFAULT 0,
      deliveryAddress TEXT NOT NULL DEFAULT '{}',
      paymentMethod TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      FOREIGN KEY (userId) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id TEXT PRIMARY KEY,
      productId TEXT NOT NULL,
      userId TEXT NOT NULL,
      userName TEXT NOT NULL,
      rating INTEGER NOT NULL,
      text TEXT,
      helpful INTEGER NOT NULL DEFAULT 0,
      createdAt TEXT NOT NULL,
      FOREIGN KEY (productId) REFERENCES products(id)
    );

    CREATE TABLE IF NOT EXISTS blog_posts (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      category TEXT,
      image TEXT,
      excerpt TEXT,
      date TEXT,
      slug TEXT NOT NULL UNIQUE
    );
  `);

  seedData(db);
  return db;
}

function seedData(db) {
  const categoryCount = db.prepare('SELECT COUNT(*) as c FROM categories').get();
  if (categoryCount.c > 0) return;

  const insertCategory = db.prepare(`
    INSERT INTO categories (id, name, slug, icon, iconColor, parentId, subcategories, filterGroups, sortOrder)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const categories = [
    { id: 'cat-1', name: 'Телефоны и планшеты', slug: 'telefoane', icon: 'Smartphone', iconColor: '#00d4aa', parentId: null, sortOrder: 1,
      subcategories: [
        { id: 'sub-1', name: 'Смартфоны', slug: 'smartphone', productCount: 2091 },
        { id: 'sub-2', name: 'Кнопочные телефоны', slug: 'button-phones', productCount: 45 },
        { id: 'sub-3', name: 'Планшеты', slug: 'tablets', productCount: 312 },
        { id: 'sub-4', name: 'Радиотелефоны', slug: 'dect-phones', productCount: 28 },
      ],
      filterGroups: [
        { id: 'f1', name: 'Производитель', type: 'checkbox', options: ['Samsung', 'Apple', 'Xiaomi', 'Realme', 'Motorola', 'Huawei', 'OnePlus', 'Google'] },
        { id: 'f2', name: 'Preț', type: 'range', options: { min: 0, max: 40000, step: 500, unit: 'lei' } },
      ]
    },
    { id: 'cat-2', name: 'Ноутбуки', slug: 'laptopuri', icon: 'Laptop', iconColor: '#3b82f6', parentId: null, sortOrder: 2,
      subcategories: [
        { id: 'sub-5', name: 'Игровые', slug: 'gaming', productCount: 234 },
        { id: 'sub-6', name: 'Ультрабуки', slug: 'ultrabook', productCount: 456 },
        { id: 'sub-7', name: 'Для бизнеса', slug: 'business', productCount: 189 },
        { id: 'sub-8', name: 'Для учебы', slug: 'student', productCount: 144 },
      ], filterGroups: []
    },
    { id: 'cat-3', name: 'Гаджеты', slug: 'gadgets', icon: 'Gamepad2', iconColor: '#f97316', parentId: null, sortOrder: 3,
      subcategories: [
        { id: 'sub-9', name: 'Игровые консоли', slug: 'consoles', productCount: 67 },
        { id: 'sub-10', name: 'Экшн-камеры', slug: 'action-cameras', productCount: 89 },
        { id: 'sub-11', name: 'Дроны', slug: 'drones', productCount: 34 },
        { id: 'sub-12', name: 'Умный дом', slug: 'smart-home', productCount: 156 },
      ], filterGroups: []
    },
    { id: 'cat-4', name: 'Apple', slug: 'apple', icon: 'Apple', iconColor: '#f5f5f5', parentId: null, sortOrder: 4,
      subcategories: [
        { id: 'sub-13', name: 'iPhone', slug: 'iphone', productCount: 145 },
        { id: 'sub-14', name: 'MacBook', slug: 'macbook', productCount: 89 },
        { id: 'sub-15', name: 'iPad', slug: 'ipad', productCount: 67 },
        { id: 'sub-16', name: 'AirPods', slug: 'airpods', productCount: 34 },
        { id: 'sub-17', name: 'Apple Watch', slug: 'apple-watch', productCount: 56 },
      ], filterGroups: []
    },
    { id: 'cat-5', name: 'Аудио', slug: 'audio', icon: 'Headphones', iconColor: '#a855f7', parentId: null, sortOrder: 5,
      subcategories: [
        { id: 'sub-18', name: 'Наушники', slug: 'headphones', productCount: 567 },
        { id: 'sub-19', name: 'Колонки', slug: 'speakers', productCount: 234 },
        { id: 'sub-20', name: 'Звуковые бары', slug: 'soundbars', productCount: 89 },
        { id: 'sub-21', name: 'Микрофоны', slug: 'microphones', productCount: 45 },
      ], filterGroups: []
    },
    { id: 'cat-6', name: 'Смарт-часы', slug: 'smartwatch', icon: 'Watch', iconColor: '#22c55e', parentId: null, sortOrder: 6,
      subcategories: [
        { id: 'sub-22', name: 'Apple Watch', slug: 'apple-watch', productCount: 56 },
        { id: 'sub-23', name: 'Samsung Galaxy Watch', slug: 'galaxy-watch', productCount: 34 },
        { id: 'sub-24', name: 'Xiaomi', slug: 'xiaomi-watch', productCount: 67 },
        { id: 'sub-25', name: 'Фитнес-браслеты', slug: 'fitness-bands', productCount: 123 },
      ], filterGroups: []
    },
    { id: 'cat-7', name: 'Пылесосы', slug: 'vacuum', icon: 'Bot', iconColor: '#06b6d4', parentId: null, sortOrder: 7,
      subcategories: [
        { id: 'sub-26', name: 'Робот-пылесосы', slug: 'robot-vacuum', productCount: 189 },
        { id: 'sub-27', name: 'Беспроводные', slug: 'cordless', productCount: 234 },
        { id: 'sub-28', name: 'Моющие', slug: 'washing', productCount: 45 },
      ], filterGroups: []
    },
    { id: 'cat-8', name: 'Электротранспорт', slug: 'transport', icon: 'Zap', iconColor: '#eab308', parentId: null, sortOrder: 8,
      subcategories: [
        { id: 'sub-29', name: 'Электросамокаты', slug: 'scooters', productCount: 234 },
        { id: 'sub-30', name: 'Электровелосипеды', slug: 'e-bikes', productCount: 89 },
        { id: 'sub-31', name: 'Гироскутеры', slug: 'hoverboards', productCount: 45 },
        { id: 'sub-32', name: 'Моноколеса', slug: 'unicycles', productCount: 23 },
      ], filterGroups: []
    },
    { id: 'cat-9', name: 'ТВ и фото', slug: 'tv-photo', icon: 'Tv', iconColor: '#ec4899', parentId: null, sortOrder: 9,
      subcategories: [
        { id: 'sub-33', name: 'Телевизоры', slug: 'tvs', productCount: 456 },
        { id: 'sub-34', name: 'Проекторы', slug: 'projectors', productCount: 67 },
        { id: 'sub-35', name: 'Фотоаппараты', slug: 'cameras', productCount: 89 },
      ], filterGroups: []
    },
    { id: 'cat-10', name: 'Аксессуары', slug: 'accessories', icon: 'Cable', iconColor: '#f43f5e', parentId: null, sortOrder: 10,
      subcategories: [
        { id: 'sub-37', name: 'Чехлы', slug: 'cases', productCount: 1234 },
        { id: 'sub-38', name: 'Зарядные устройства', slug: 'chargers', productCount: 567 },
        { id: 'sub-39', name: 'Кабели', slug: 'cables', productCount: 345 },
        { id: 'sub-40', name: 'Защитные стекла', slug: 'screen-protectors', productCount: 890 },
      ], filterGroups: []
    },
  ];

  const imgs = {
    'samsung': ['https://images.unsplash.com/photo-1610945265078-3858a0b5d8f4?w=400&h=400&fit=crop', 'https://images.unsplash.com/photo-1610945264803-c22b62d2a7b3?w=400&h=400&fit=crop'],
    'iphone': ['https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400&h=400&fit=crop', 'https://images.unsplash.com/photo-1696446701796-da61225697cc?w=400&h=400&fit=crop'],
    'xiaomi': ['https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=400&h=400&fit=crop', 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop'],
    'realme': ['https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=400&h=400&fit=crop', 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop'],
    'motorola': ['https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=400&h=400&fit=crop', 'https://images.unsplash.com/photo-1565058688627-399dce937fb7?w=400&h=400&fit=crop'],
    'macbook': ['https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=400&h=400&fit=crop', 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=400&fit=crop'],
    'airpods': ['https://images.unsplash.com/photo-1603351154351-5cfb3d04ef30?w=400&h=400&fit=crop', 'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=400&h=400&fit=crop'],
    'watch': ['https://images.unsplash.com/photo-1546868871-af0de7f65f7e?w=400&h=400&fit=crop', 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=400&h=400&fit=crop'],
    'headphones': ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop', 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400&h=400&fit=crop'],
    'tablet': ['https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=400&fit=crop', 'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=400&h=400&fit=crop'],
    'default': ['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop', 'https://images.unsplash.com/photo-1580910051074-3eb6948e2c63?w=400&h=400&fit=crop'],
  };

  const products = [
    { id: 'p1', name: 'Samsung Galaxy S23 128 GB Phantom Black', brand: 'Samsung', category: 'telefoane', subcategory: 'smartphone', price: 10999, oldPrice: 13999, discount: 21, images: imgs.samsung, specs: { 'Экран': '6.1" Dynamic AMOLED 2X', 'Процессор': 'Snapdragon 8 Gen 2', 'Оперативная память': '8 ГБ', 'Встроенная память': '128 ГБ', 'Аккумулятор': '3900 мАч', 'ОС': 'Android 13', 'NFC': 'Есть', 'Вес': '168 г' }, description: 'Флагманский смартфон Samsung Galaxy S23 с мощным процессором Snapdragon 8 Gen 2 и продвинутой камерой.', stock: 45, rating: 4.8, reviewCount: 324, badges: ['popular', 'sale'], colors: [{ name: 'Phantom Black', hex: '#1a1a1a', image: '' }, { name: 'Cream', hex: '#f5f5dc', image: '' }], storageOptions: ['128 ГБ', '256 ГБ'], cashback: 330, monthlyPayment: 917, isActive: true },
    { id: 'p2', name: 'iPhone 15 128 GB Black', brand: 'Apple', category: 'telefoane', subcategory: 'smartphone', price: 17999, oldPrice: null, discount: null, images: imgs.iphone, specs: { 'Экран': '6.1" Super Retina XDR OLED', 'Процессор': 'Apple A16 Bionic', 'Оперативная память': '6 ГБ', 'Встроенная память': '128 ГБ', 'Аккумулятор': '3349 мАч', 'ОС': 'iOS 17', 'NFC': 'Есть', 'Вес': '171 г' }, description: 'iPhone 15 с динамическим островом, камерой 48 МП и портом USB-C.', stock: 32, rating: 4.9, reviewCount: 512, badges: ['popular', 'new'], colors: [{ name: 'Black', hex: '#1a1a1a', image: '' }, { name: 'Blue', hex: '#6b7f9e', image: '' }], storageOptions: ['128 ГБ', '256 ГБ', '512 ГБ'], cashback: 540, monthlyPayment: 1500, isActive: true },
    { id: 'p3', name: 'Xiaomi 13 256 GB Black', brand: 'Xiaomi', category: 'telefoane', subcategory: 'smartphone', price: 12999, oldPrice: 15999, discount: 19, images: imgs.xiaomi, specs: { 'Экран': '6.36" AMOLED', 'Процессор': 'Snapdragon 8 Gen 2', 'Оперативная память': '8 ГБ', 'Встроенная память': '256 ГБ', 'Аккумулятор': '4500 мАч', 'ОС': 'Android 13', 'NFC': 'Есть', 'Вес': '189 г' }, description: 'Компактный флагман Xiaomi 13 с камерой Leica и ярким AMOLED-экраном 120 Гц.', stock: 28, rating: 4.7, reviewCount: 198, badges: ['sale', 'popular'], colors: [{ name: 'Black', hex: '#1a1a1a', image: '' }, { name: 'White', hex: '#ffffff', image: '' }], storageOptions: ['128 ГБ', '256 ГБ'], cashback: 390, monthlyPayment: 1083, isActive: true },
    { id: 'p4', name: 'Realme GT Neo 5 256 GB Black', brand: 'Realme', category: 'telefoane', subcategory: 'smartphone', price: 8999, oldPrice: 10599, discount: 15, images: imgs.realme, specs: { 'Экран': '6.74" AMOLED', 'Процессор': 'Snapdragon 8+ Gen 1', 'Оперативная память': '12 ГБ', 'Встроенная память': '256 ГБ', 'Аккумулятор': '5000 мАч', 'ОС': 'Android 13' }, description: 'Realme GT Neo 5 с рекордной зарядкой 240W и дисплеем 144 Гц.', stock: 15, rating: 4.6, reviewCount: 87, badges: ['sale', 'limited'], colors: [{ name: 'Black', hex: '#1a1a1a', image: '' }, { name: 'White', hex: '#f0f0f0', image: '' }], storageOptions: ['256 ГБ', '512 ГБ'], cashback: 270, monthlyPayment: 750, isActive: true },
    { id: 'p5', name: 'Motorola Edge 40 Pro 256 GB Blue', brand: 'Motorola', category: 'telefoane', subcategory: 'smartphone', price: 11999, oldPrice: 14999, discount: 20, images: imgs.motorola, specs: { 'Экран': '6.67" pOLED', 'Процессор': 'Snapdragon 8 Gen 2', 'Оперативная память': '12 ГБ', 'Встроенная память': '256 ГБ', 'Аккумулятор': '4600 мАч', 'ОС': 'Android 13' }, description: 'Motorola Edge 40 Pro с изогнутым дисплеем 165 Гц и камерой Hasselblad.', stock: 12, rating: 4.5, reviewCount: 64, badges: ['sale', 'limited'], colors: [{ name: 'Blue', hex: '#4a6fa5', image: '' }, { name: 'Black', hex: '#1a1a1a', image: '' }], storageOptions: ['256 ГБ'], cashback: 360, monthlyPayment: 1000, isActive: true },
    { id: 'p6', name: 'Samsung Galaxy A54 128 GB White', brand: 'Samsung', category: 'telefoane', subcategory: 'smartphone', price: 6599, oldPrice: 7999, discount: 18, images: imgs.samsung, specs: { 'Экран': '6.4" Super AMOLED', 'Процессор': 'Exynos 1380', 'Оперативная память': '6 ГБ', 'Встроенная память': '128 ГБ', 'Аккумулятор': '5000 мАч', 'ОС': 'Android 13' }, description: 'Samsung Galaxy A54 — отличный смартфон среднего класса с дисплеем 120 Гц.', stock: 67, rating: 4.6, reviewCount: 278, badges: ['popular', 'sale'], colors: [{ name: 'White', hex: '#f5f5f5', image: '' }, { name: 'Black', hex: '#1a1a1a', image: '' }], storageOptions: ['128 ГБ', '256 ГБ'], cashback: 198, monthlyPayment: 550, isActive: true },
    { id: 'p7', name: 'iPhone 14 128 GB Midnight', brand: 'Apple', category: 'telefoane', subcategory: 'smartphone', price: 13999, oldPrice: 15999, discount: 13, images: imgs.iphone, specs: { 'Экран': '6.1" Super Retina XDR OLED', 'Процессор': 'Apple A15 Bionic', 'Оперативная память': '6 ГБ', 'Встроенная память': '128 ГБ', 'Аккумулятор': '3279 мАч', 'ОС': 'iOS 16' }, description: 'iPhone 14 с системой камер на два объектива и режимом Action mode.', stock: 23, rating: 4.8, reviewCount: 892, badges: ['sale', 'popular'], colors: [{ name: 'Midnight', hex: '#1a1a1a', image: '' }, { name: 'Starlight', hex: '#f5f5f0', image: '' }], storageOptions: ['128 ГБ', '256 ГБ', '512 ГБ'], cashback: 420, monthlyPayment: 1167, isActive: true },
    { id: 'p8', name: 'Google Pixel 8 128 GB Obsidian', brand: 'Google', category: 'telefoane', subcategory: 'smartphone', price: 11999, oldPrice: null, discount: null, images: imgs.samsung, specs: { 'Экран': '6.2" Actua OLED', 'Процессор': 'Google Tensor G3', 'Оперативная память': '8 ГБ', 'Встроенная память': '128 ГБ', 'Аккумулятор': '4575 мАч', 'ОС': 'Android 14' }, description: 'Google Pixel 8 с лучшей камерой для фото благодаря AI-обработке Tensor G3.', stock: 18, rating: 4.7, reviewCount: 156, badges: ['new', 'popular'], colors: [{ name: 'Obsidian', hex: '#1a1a1a', image: '' }, { name: 'Hazel', hex: '#8b9a7d', image: '' }], storageOptions: ['128 ГБ', '256 ГБ'], cashback: 360, monthlyPayment: 1000, isActive: true },
    { id: 'p9', name: 'OnePlus 11 256 GB Black', brand: 'OnePlus', category: 'telefoane', subcategory: 'smartphone', price: 10999, oldPrice: 13999, discount: 21, images: imgs.xiaomi, specs: { 'Экран': '6.7" AMOLED', 'Процессор': 'Snapdragon 8 Gen 2', 'Оперативная память': '12 ГБ', 'Встроенная память': '256 ГБ', 'Аккумулятор': '5000 мАч', 'ОС': 'Android 13' }, description: 'OnePlus 11 с камерой Hasselblad и зарядкой 100W.', stock: 8, rating: 4.6, reviewCount: 112, badges: ['sale', 'limited'], colors: [{ name: 'Black', hex: '#1a1a1a', image: '' }, { name: 'Green', hex: '#4a5d4e', image: '' }], storageOptions: ['256 ГБ'], cashback: 330, monthlyPayment: 917, isActive: true },
    { id: 'p10', name: 'Nothing Phone 2 256 GB White', brand: 'Nothing', category: 'telefoane', subcategory: 'smartphone', price: 9999, oldPrice: null, discount: null, images: imgs.realme, specs: { 'Экран': '6.7" LTPO OLED', 'Процессор': 'Snapdragon 8+ Gen 1', 'Оперативная память': '12 ГБ', 'Встроенная память': '256 ГБ', 'Аккумулятор': '4700 мАч', 'ОС': 'Android 13' }, description: 'Nothing Phone 2 с уникальным дизайном Glyph Interface и чистым Android.', stock: 21, rating: 4.5, reviewCount: 203, badges: ['popular'], colors: [{ name: 'White', hex: '#f5f5f5', image: '' }, { name: 'Dark Gray', hex: '#3a3a3a', image: '' }], storageOptions: ['128 ГБ', '256 ГБ'], cashback: 300, monthlyPayment: 833, isActive: true },
    { id: 'p11', name: 'MacBook Air 13" M2 256 GB Midnight', brand: 'Apple', category: 'laptopuri', subcategory: 'ultrabook', price: 21999, oldPrice: 25999, discount: 15, images: imgs.macbook, specs: { 'Экран': '13.6" Liquid Retina', 'Процессор': 'Apple M2', 'Оперативная память': '8 ГБ', 'Встроенная память': '256 ГБ SSD', 'Аккумулятор': 'до 18 часов', 'Вес': '1.24 кг', 'ОС': 'macOS Ventura' }, description: 'Сверхлёгкий и мощный MacBook Air на чипе M2 с дисплеем Liquid Retina.', stock: 14, rating: 4.9, reviewCount: 445, badges: ['popular', 'sale'], colors: [{ name: 'Midnight', hex: '#1a1a2e', image: '' }, { name: 'Starlight', hex: '#f5f0e8', image: '' }], storageOptions: ['256 ГБ', '512 ГБ'], cashback: 660, monthlyPayment: 1833, isActive: true },
    { id: 'p12', name: 'AirPods Pro 2nd Gen', brand: 'Apple', category: 'audio', subcategory: 'headphones', price: 4599, oldPrice: 5399, discount: 15, images: imgs.airpods, specs: { 'Тип': 'Внутриканальные TWS', 'Шумоподавление': 'Active ANC', 'Bluetooth': '5.3', 'Аккумулятор': 'до 6 часов + 30 с кейсом', 'Защита': 'IPX4' }, description: 'AirPods Pro второго поколения с улучшенным ANC и пространственным аудио.', stock: 89, rating: 4.8, reviewCount: 1203, badges: ['popular', 'sale'], colors: [{ name: 'White', hex: '#f5f5f5', image: '' }], storageOptions: [], cashback: 138, monthlyPayment: 383, isActive: true },
    { id: 'p13', name: 'Samsung Galaxy Watch 6 Classic 47mm', brand: 'Samsung', category: 'smartwatch', subcategory: 'galaxy-watch', price: 5999, oldPrice: 6999, discount: 14, images: imgs.watch, specs: { 'Экран': '1.47" Super AMOLED', 'Процессор': 'Exynos W930', 'Оперативная память': '2 ГБ', 'Аккумулятор': '425 мАч', 'Защита': 'IP68 + 5ATM', 'Вес': '59 г' }, description: 'Galaxy Watch 6 Classic с вращающимся безелем и отслеживанием сна.', stock: 34, rating: 4.7, reviewCount: 187, badges: ['sale'], colors: [{ name: 'Black', hex: '#1a1a1a', image: '' }, { name: 'Silver', hex: '#c0c0c0', image: '' }], storageOptions: ['47 мм', '43 мм'], cashback: 180, monthlyPayment: 500, isActive: true },
    { id: 'p14', name: 'Sony WH-1000XM5 Black', brand: 'Sony', category: 'audio', subcategory: 'headphones', price: 6999, oldPrice: 8999, discount: 22, images: imgs.headphones, specs: { 'Тип': 'Полноразмерные', 'Шумоподавление': 'Active ANC', 'Bluetooth': '5.2', 'Кодеки': 'LDAC, AAC, SBC', 'Аккумулятор': 'до 30 часов', 'Вес': '250 г' }, description: 'Лучшие наушники с шумоподавлением Sony WH-1000XM5 с 8 микрофонами.', stock: 19, rating: 4.8, reviewCount: 678, badges: ['popular', 'sale'], colors: [{ name: 'Black', hex: '#1a1a1a', image: '' }, { name: 'Silver', hex: '#d4d4d4', image: '' }], storageOptions: [], cashback: 210, monthlyPayment: 583, isActive: true },
    { id: 'p15', name: 'Xiaomi Pad 6 128 GB Gray', brand: 'Xiaomi', category: 'telefoane', subcategory: 'tablets', price: 5599, oldPrice: 6599, discount: 15, images: imgs.tablet, specs: { 'Экран': '11" IPS LCD', 'Процессор': 'Snapdragon 870', 'Оперативная память': '6 ГБ', 'Встроенная память': '128 ГБ', 'Аккумулятор': '8840 мАч', 'ОС': 'Android 13' }, description: 'Xiaomi Pad 6 с дисплеем 144 Гц и стереодинамиками Dolby Atmos.', stock: 42, rating: 4.6, reviewCount: 145, badges: ['sale'], colors: [{ name: 'Gray', hex: '#808080', image: '' }, { name: 'Gold', hex: '#d4af37', image: '' }], storageOptions: ['128 ГБ', '256 ГБ'], cashback: 168, monthlyPayment: 467, isActive: true },
    { id: 'p16', name: 'iPad Air 5 64 GB Space Gray', brand: 'Apple', category: 'apple', subcategory: 'ipad', price: 10999, oldPrice: null, discount: null, images: imgs.tablet, specs: { 'Экран': '10.9" Liquid Retina', 'Процессор': 'Apple M1', 'Оперативная память': '8 ГБ', 'Встроенная память': '64 ГБ', 'Аккумулятор': 'до 10 часов', 'ОС': 'iPadOS 16' }, description: 'iPad Air с чипом M1 и поддержкой Apple Pencil 2. Идеален для творчества.', stock: 27, rating: 4.8, reviewCount: 389, badges: ['popular'], colors: [{ name: 'Space Gray', hex: '#4a4a4a', image: '' }, { name: 'Blue', hex: '#6b8cae', image: '' }], storageOptions: ['64 ГБ', '256 ГБ'], cashback: 330, monthlyPayment: 917, isActive: true },
    { id: 'p17', name: 'Dyson V15 Detect Absolute', brand: 'Dyson', category: 'vacuum', subcategory: 'cordless', price: 12999, oldPrice: 15999, discount: 19, images: imgs.default, specs: { 'Тип': 'Беспроводной вертикальный', 'Мощность': '240 AW', 'Аккумулятор': 'до 60 минут', 'Ёмкость': '0.77 л', 'Вес': '3.1 кг', 'Фильтр': 'HEPA H13' }, description: 'Dyson V15 Detect с лазерным обнаружением пыли и LCD-экраном.', stock: 11, rating: 4.9, reviewCount: 234, badges: ['sale', 'popular'], colors: [{ name: 'Nickel/Yellow', hex: '#c0c0c0', image: '' }], storageOptions: [], cashback: 390, monthlyPayment: 1083, isActive: true },
    { id: 'p18', name: 'Xiaomi Electric Scooter 4 Pro', brand: 'Xiaomi', category: 'transport', subcategory: 'scooters', price: 9999, oldPrice: 11999, discount: 17, images: imgs.default, specs: { 'Скорость': '25 км/ч', 'Запас хода': 'до 55 км', 'Мощность': '700 Вт', 'Вес': '17 кг', 'Защита': 'IP54' }, description: 'Электросамокат Xiaomi 4 Pro с увеличенным запасом хода и двойной подвеской.', stock: 16, rating: 4.5, reviewCount: 89, badges: ['sale'], colors: [{ name: 'Black', hex: '#1a1a1a', image: '' }], storageOptions: [], cashback: 300, monthlyPayment: 833, isActive: true },
    { id: 'p19', name: 'Samsung Galaxy Buds 2 Pro', brand: 'Samsung', category: 'audio', subcategory: 'headphones', price: 2599, oldPrice: 3599, discount: 28, images: imgs.airpods, specs: { 'Тип': 'Внутриканальные TWS', 'Шумоподавление': 'Active ANC', 'Bluetooth': '5.3', 'Аккумулятор': 'до 5 часов + 15 с кейсом', 'Защита': 'IPX7' }, description: 'Galaxy Buds 2 Pro с интеллектуальным ANC и звуком Hi-Fi.', stock: 56, rating: 4.6, reviewCount: 312, badges: ['sale', 'popular'], colors: [{ name: 'Graphite', hex: '#3a3a3a', image: '' }, { name: 'White', hex: '#f5f5f5', image: '' }], storageOptions: [], cashback: 78, monthlyPayment: 217, isActive: true },
    { id: 'p20', name: 'Apple Watch Series 9 45mm', brand: 'Apple', category: 'apple', subcategory: 'apple-watch', price: 8999, oldPrice: null, discount: null, images: imgs.watch, specs: { 'Экран': '1.9" Retina LTPO OLED', 'Процессор': 'Apple S9', 'Аккумулятор': 'до 18 часов', 'Защита': 'IP6X + 50 м', 'Вес': '51.5 г' }, description: 'Apple Watch Series 9 с чипом S9 и жестом Double Tap.', stock: 38, rating: 4.8, reviewCount: 267, badges: ['popular', 'new'], colors: [{ name: 'Midnight', hex: '#1a1a1a', image: '' }, { name: 'Starlight', hex: '#f5f0e8', image: '' }], storageOptions: ['41 мм', '45 мм'], cashback: 270, monthlyPayment: 750, isActive: true },
    { id: 'p21', name: 'LG OLED C3 55"', brand: 'LG', category: 'tv-photo', subcategory: 'tvs', price: 25999, oldPrice: 33999, discount: 24, images: imgs.default, specs: { 'Экран': '55" OLED evo', 'Разрешение': '4K Ultra HD', 'Частота': '120 Гц', 'Smart TV': 'webOS 23', 'Звук': 'Dolby Atmos, 40W' }, description: 'LG OLED C3 с самоосвещаемыми пикселями и поддержкой 4K 120 Гц.', stock: 7, rating: 4.9, reviewCount: 156, badges: ['sale', 'limited'], colors: [{ name: 'Black', hex: '#1a1a1a', image: '' }], storageOptions: [], cashback: 780, monthlyPayment: 2167, isActive: true },
    { id: 'p22', name: 'Huawei FreeBuds Pro 3', brand: 'Huawei', category: 'audio', subcategory: 'headphones', price: 2999, oldPrice: 3999, discount: 25, images: imgs.airpods, specs: { 'Тип': 'Внутриканальные TWS', 'Шумоподавление': 'Active ANC', 'Bluetooth': '5.2', 'Аккумулятор': 'до 6.5 часов + 22 с кейсом', 'Защита': 'IP54' }, description: 'Huawei FreeBuds Pro 3 с аудио высокого разрешения и интеллектуальным ANC.', stock: 43, rating: 4.5, reviewCount: 98, badges: ['sale'], colors: [{ name: 'Black', hex: '#1a1a1a', image: '' }, { name: 'White', hex: '#f5f5f5', image: '' }], storageOptions: [], cashback: 90, monthlyPayment: 250, isActive: true },
    { id: 'p23', name: 'Asus ROG Zephyrus G14', brand: 'Asus', category: 'laptopuri', subcategory: 'gaming', price: 25999, oldPrice: 29999, discount: 13, images: imgs.macbook, specs: { 'Экран': '14" IPS', 'Процессор': 'AMD Ryzen 9 7940HS', 'Видеокарта': 'RTX 4060 8 ГБ', 'Оперативная память': '16 ГБ', 'Встроенная память': '1 ТБ SSD', 'ОС': 'Windows 11' }, description: 'Компактный игровой ноутбук ROG Zephyrus G14 с видеокартой RTX 4060.', stock: 9, rating: 4.7, reviewCount: 134, badges: ['sale', 'limited'], colors: [{ name: 'Eclipse Gray', hex: '#3a3a3a', image: '' }], storageOptions: ['512 ГБ', '1 ТБ'], cashback: 780, monthlyPayment: 2167, isActive: true },
    { id: 'p24', name: 'Samsung Galaxy Tab S9 128 GB', brand: 'Samsung', category: 'telefoane', subcategory: 'tablets', price: 11999, oldPrice: 13999, discount: 14, images: imgs.tablet, specs: { 'Экран': '11" Dynamic AMOLED 2X', 'Процессор': 'Snapdragon 8 Gen 2', 'Оперативная память': '8 ГБ', 'Аккумулятор': '8400 мАч', 'Защита': 'IP68', 'ОС': 'Android 13' }, description: 'Galaxy Tab S9 с AMOLED-экраном 120 Гц и чипом Snapdragon 8 Gen 2.', stock: 22, rating: 4.7, reviewCount: 178, badges: ['sale'], colors: [{ name: 'Graphite', hex: '#3a3a3a', image: '' }, { name: 'Beige', hex: '#d4c4a8', image: '' }], storageOptions: ['128 ГБ', '256 ГБ'], cashback: 360, monthlyPayment: 1000, isActive: true },
  ];

  const insertProduct = db.prepare(`
    INSERT INTO products (id, name, brand, category, subcategory, price, oldPrice, discount, images, specs, description, stock, rating, reviewCount, badges, colors, storageOptions, cashback, monthlyPayment, isActive)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertUser = db.prepare(`
    INSERT INTO users (id, name, email, phone, passwordHash, role, avatar, addresses, createdAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertOrder = db.prepare(`
    INSERT INTO orders (id, userId, items, status, total, discount, deliveryAddress, paymentMethod, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertReview = db.prepare(`
    INSERT INTO reviews (id, productId, userId, userName, rating, text, helpful, createdAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const seedAll = db.transaction(() => {
    for (const cat of categories) {
      insertCategory.run(cat.id, cat.name, cat.slug, cat.icon, cat.iconColor, cat.parentId,
        JSON.stringify(cat.subcategories), JSON.stringify(cat.filterGroups), cat.sortOrder);
    }

    for (const p of products) {
      insertProduct.run(
        p.id, p.name, p.brand, p.category, p.subcategory,
        p.price, p.oldPrice, p.discount,
        JSON.stringify(p.images), JSON.stringify(p.specs),
        p.description, p.stock, p.rating, p.reviewCount,
        JSON.stringify(p.badges), JSON.stringify(p.colors),
        JSON.stringify(p.storageOptions), p.cashback, p.monthlyPayment,
        p.isActive ? 1 : 0
      );
    }

    const userHash = bcrypt.hashSync('password123', 10);
    const adminHash = bcrypt.hashSync('admin123', 10);

    insertUser.run('u1', 'Ion Popescu', 'user@techhub.ru', '+373 69 123-456', userHash, 'user', null,
      JSON.stringify([{ id: 'addr1', city: 'Chișinău', street: 'str. Ștefan cel Mare', building: '1', apartment: '42', isDefault: true }]),
      '2024-06-15T10:00:00Z');

    insertUser.run('u2', 'Admin TechHub', 'admin@techhub.ru', '+373 69 765-432', adminHash, 'admin', null,
      JSON.stringify([{ id: 'addr3', city: 'Chișinău', street: 'bd. Decebal', building: '1', apartment: '1', isDefault: true }]),
      '2024-01-01T00:00:00Z');

    insertOrder.run('ord-12345', 'u1',
      JSON.stringify([{ productId: 'p1', name: 'Samsung Galaxy S23', image: imgs.samsung[0], price: 10999, quantity: 1, color: 'Phantom Black', storage: '128 ГБ' }]),
      'delivered', 15599, 3000,
      JSON.stringify({ city: 'Chișinău', street: 'str. Ștefan cel Mare', building: '1', apartment: '42' }),
      'Card', '2025-01-10T14:30:00Z', '2025-01-14T10:00:00Z');

    insertOrder.run('ord-12346', 'u1',
      JSON.stringify([{ productId: 'p2', name: 'iPhone 15 128 GB Black', image: imgs.iphone[0], price: 17999, quantity: 1, color: 'Black', storage: '128 ГБ' }]),
      'shipped', 17999, 0,
      JSON.stringify({ city: 'Chișinău', street: 'str. Ștefan cel Mare', building: '1', apartment: '42' }),
      'Card', '2025-02-01T09:15:00Z', '2025-02-03T16:00:00Z');

    insertReview.run('r1', 'p1', 'u1', 'Алексей К.', 5, 'Отличный телефон! Камера просто супер, особенно ночная съемка.', 24, '2024-12-15T10:00:00Z');
    insertReview.run('r2', 'p1', 'u1', 'Мария С.', 4, 'Хороший смартфон, но немного дороговат. Дисплей яркий и четкий.', 12, '2024-11-20T14:30:00Z');
    insertReview.run('r3', 'p2', 'u1', 'Дмитрий В.', 5, 'iPhone 15 — лучший! Перешел с Android, не жалею.', 45, '2024-10-05T09:00:00Z');
    insertReview.run('r4', 'p12', 'u1', 'Елена П.', 5, 'Шумоподавление на высоте! В метро ни одного лишнего звука.', 67, '2024-09-12T16:00:00Z');
  });

  seedAll();
  console.log('Database seeded successfully');
}

function parseProduct(row) {
  if (!row) return null;
  return {
    ...row,
    images: JSON.parse(row.images || '[]'),
    specs: JSON.parse(row.specs || '{}'),
    badges: JSON.parse(row.badges || '[]'),
    colors: JSON.parse(row.colors || '[]'),
    storageOptions: JSON.parse(row.storageOptions || '[]'),
    isActive: Boolean(row.isActive),
  };
}

function parseCategory(row) {
  if (!row) return null;
  return {
    ...row,
    subcategories: JSON.parse(row.subcategories || '[]'),
    filterGroups: JSON.parse(row.filterGroups || '[]'),
  };
}

function parseOrder(row) {
  if (!row) return null;
  return {
    ...row,
    items: JSON.parse(row.items || '[]'),
    deliveryAddress: JSON.parse(row.deliveryAddress || '{}'),
  };
}

function parseUser(row) {
  if (!row) return null;
  const { passwordHash, ...rest } = row;
  return {
    ...rest,
    addresses: JSON.parse(row.addresses || '[]'),
  };
}

module.exports = { initDb, getDb, parseProduct, parseCategory, parseOrder, parseUser };