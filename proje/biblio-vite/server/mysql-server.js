const express = require('express');
const cors = require('cors');
const session = require('express-session');
const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');

// Configuration (modifier ou définir les variables d'environnement si nécessaire)
const DB_HOST = process.env.DB_HOST || '127.0.0.1';
const DB_PORT = process.env.DB_PORT || 3306;
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || '';
const DB_NAME = process.env.DB_NAME || 'biblio';
const SERVER_PORT = process.env.PORT || 4000;

async function main() {
  const pool = await mysql.createPool({
    host: DB_HOST,
    port: DB_PORT,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });

  const app = express();
  app.use(express.json());
  app.use(cors({ origin: true, credentials: true }));
  app.use(session({
    secret: process.env.SESSION_SECRET || 'dev-secret-change-me',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
  }));

  // --- Helpers d'authentification ---
  function ensureAuth(req, res, next) {
    if (req.session && req.session.user && req.session.user.id) return next();
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // --- Livres ---
  app.get('/api/books', async (req, res) => {
    try {
      // inclure 'category' et 'category_id' pour que le frontend puisse construire les carrousels
            const q = `SELECT b.id, b.title, b.year, b.rating, b.cover, b.category_id, c.name AS category, b.lecture AS lecture_link
              FROM books b
              LEFT JOIN categories c ON b.category_id = c.id
              ORDER BY b.title`;
      const [rows] = await pool.query(q);
      // mapper les lignes directement
      res.json(rows.map(r => ({
        id: r.id,
        title: r.title,
        year: r.year,
        rating: r.rating,
        cover: r.cover,
        link: r.lecture_link || null,
        category: r.category || null,
        category_id: r.category_id || null
      })));
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'DB error' });
    }
  });

  app.get('/api/books/:id', async (req, res) => {
    try {
      const q = `SELECT b.id, b.title, b.year, b.rating, b.cover, b.category_id, c.name AS category, b.lecture AS lecture_link
             FROM books b LEFT JOIN categories c ON b.category_id = c.id
             WHERE b.id = ?`;
      const [rows] = await pool.query(q, [req.params.id]);
      if (!rows.length) return res.status(404).json({ error: 'Not found' });
      const r = rows[0];
      res.json({ id: r.id, title: r.title, year: r.year, rating: r.rating, cover: r.cover, link: r.lecture_link || null, category: r.category || null, category_id: r.category_id || null });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'DB error' });
    }
  });

  // endpoint pour récupérer le lien de lecture pour un livre
  app.get('/api/lecture/:bookId', async (req, res) => {
    try {
      const [rows] = await pool.query('SELECT lecture FROM books WHERE id = ? LIMIT 1', [req.params.bookId]);
      if (rows && rows.length && rows[0].lecture) return res.json({ link: rows[0].lecture });
      return res.status(404).json({ error: 'not found' });
    } catch (err) {
      console.error('lecture lookup error', err);
      res.status(500).json({ error: 'DB error' });
    }
  });

  // --- Catégories ---
  app.get('/api/categories', async (req, res) => {
    try {
      const [rows] = await pool.query('SELECT id, name, slug FROM categories ORDER BY name');
      res.json(rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'DB error' });
    }
  });

  // --- Favoris ---
  // Récupérer les favoris de l'utilisateur courant
  app.get('/api/favorites', ensureAuth, async (req, res) => {
    try {
      const userId = req.session.user.id;
      const [rows] = await pool.query('SELECT book_id FROM favorites WHERE user_id = ?', [userId]);
      res.json(rows.map(r => r.book_id));
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'DB error' });
    }
  });

  // Ajouter / supprimer un favori (body: { book_id, action: 'add'|'remove' })
  app.post('/api/favorites', ensureAuth, async (req, res) => {
    const { book_id, action } = req.body || {};
    if (!book_id || !['add', 'remove'].includes(action)) {
      return res.status(400).json({ error: 'book_id and action (add/remove) required' });
    }
    const userId = req.session.user.id;
    try {
      if (action === 'add') {
        // éviter les doublons
        await pool.query('INSERT IGNORE INTO favorites (book_id, user_id) VALUES (?, ?)', [book_id, userId]);
      } else {
        await pool.query('DELETE FROM favorites WHERE book_id = ? AND user_id = ?', [book_id, userId]);
      }
      const [rows] = await pool.query('SELECT book_id FROM favorites WHERE user_id = ?', [userId]);
      return res.json(rows.map(r => r.book_id));
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'DB error' });
    }
  });

  // --- Routes d'authentification ---
  app.post('/api/register', async (req, res) => {
    const { username, password } = req.body || {};
    if (!username || !password) return res.status(400).json({ error: 'username and password required' });
    try {
      const hash = await bcrypt.hash(password, 10);
      const [result] = await pool.query('INSERT INTO users (username, password_hash) VALUES (?, ?)', [username, hash]);
      const userId = result.insertId;
      req.session.user = { id: userId, username };
      res.json({ id: userId, username });
    } catch (err) {
      console.error(err);
      if (err && err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'username exists' });
      res.status(500).json({ error: 'DB error' });
    }
  });

  app.post('/api/login', async (req, res) => {
    const { username, password } = req.body || {};
    if (!username || !password) return res.status(400).json({ error: 'username and password required' });
    try {
      const [rows] = await pool.query('SELECT id, username, password_hash FROM users WHERE username = ?', [username]);
      if (!rows.length) return res.status(401).json({ error: 'Invalid credentials' });
      const user = rows[0];
      const ok = await bcrypt.compare(password, user.password_hash);
      if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
      req.session.user = { id: user.id, username: user.username };
      res.json({ id: user.id, username: user.username });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'DB error' });
    }
  });

  app.post('/api/logout', (req, res) => {
    req.session.destroy(err => {
      if (err) return res.status(500).json({ error: 'Logout failed' });
      res.json({ ok: true });
    });
  });

  app.get('/api/me', (req, res) => {
    if (req.session && req.session.user) return res.json(req.session.user);
    return res.status(200).json(null);
  });

  app.listen(SERVER_PORT, () => {
    console.log(`MySQL-backed biblio server listening on http://localhost:${SERVER_PORT}`);
    console.log(`DB: ${DB_USER}@${DB_HOST}:${DB_PORT}/${DB_NAME}`);
  });
}

main().catch(err => {
  console.error('Fatal error starting server:', err);
  process.exit(1);
});
