const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const DB_FILE = path.join(__dirname, 'db.json');

function readDB(){
  try { return JSON.parse(fs.readFileSync(DB_FILE, 'utf8')); }
  catch(e){ return { books: [], favorites: [], categories: [] }; }
}
function writeDB(db){
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf8');
}

// Mode MySQL : tenter de se connecter si les variables d'environnement sont présentes ; sinon utiliser db.json
let useMySQL = false;
let mysqlPool = null;
// store de sessions en mémoire (développement)
const sessions = {};

function parseCookies(req) {
  const header = req.headers && req.headers.cookie;
  const out = {};
  if (!header) return out;
  header.split(';').forEach(pair => {
    const idx = pair.indexOf('=');
    if (idx < 0) return;
    const k = pair.slice(0, idx).trim();
    const v = pair.slice(idx + 1).trim();
    out[k] = decodeURIComponent(v);
  });
  return out;
}
async function tryConnectMySQL() {
  const cfg = {
    host: process.env.MYSQL_HOST || 'localhost',
    port: process.env.MYSQL_PORT ? Number(process.env.MYSQL_PORT) : 3306,
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'biblio',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  };
  try {
    const mysql = require('mysql2/promise');
    mysqlPool = mysql.createPool(cfg);
    // requête de test rapide
    const [rows] = await mysqlPool.query('SELECT 1');
    useMySQL = true;
    console.log('Connected to MySQL at', cfg.host + ':' + cfg.port, 'db=', cfg.database);
  } catch (err) {
    console.warn('MySQL not available, falling back to db.json', err && err.message);
    useMySQL = false;
    mysqlPool = null;
  }
}

// Aide : récupérer les livres depuis MySQL ou depuis db.json
async function fetchBooksFromDB() {
  if (useMySQL && mysqlPool) {
    const q = `SELECT b.id,b.title,b.year,b.rating,b.cover,b.category,b.category_id, c.name AS category_name
               FROM books b LEFT JOIN categories c ON b.category_id = c.id`;
    const [rows] = await mysqlPool.query(q);
    // récupérer les copies pour tous les ids retournés
    const ids = rows.map(r => r.id);
    let copies = [];
    if (ids.length) {
      const [crows] = await mysqlPool.query('SELECT id,book_id,status FROM copies WHERE book_id IN (?)', [ids]);
      copies = crows;
    }
    return rows.map(r => ({
      id: r.id,
      title: r.title,
      year: r.year,
      rating: r.rating,
      cover: r.cover,
      category: r.category_name || r.category || null,
      category_id: r.category_id || null,
      copies: copies.filter(c => c.book_id === r.id).map(c => ({ id: c.id, status: c.status }))
    }));
  }
  const db = readDB();
  return db.books || [];
}

async function fetchCategoriesFromDB() {
  if (useMySQL && mysqlPool) {
    const [rows] = await mysqlPool.query('SELECT id,name,slug FROM categories');
    return rows;
  }
  const db = readDB();
  return db.categories || [];
}

async function fetchFavoritesFromDB() {
  if (useMySQL && mysqlPool) {
    const [rows] = await mysqlPool.query("SELECT book_id FROM favorites");
    return Array.from(new Set(rows.map(r => r.book_id)));
  }
  const db = readDB();
  return db.favorites || [];
}

app.get('/api/books', async (req, res) => {
  try {
    const books = await fetchBooksFromDB();
    res.json(books);
  } catch (err) { res.status(500).json({ error: 'server error' }); }
});

// Endpoints d'auth : register, login, me, logout
app.post('/api/register', async (req, res) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) return res.status(400).json({ error: 'username and password required' });
    if (useMySQL && mysqlPool) {
      // vérifier l'existence
      const [existing] = await mysqlPool.query('SELECT id FROM users WHERE username = ?', [username]);
      if (existing && existing.length) return res.status(400).json({ error: 'user exists' });
      const [ins] = await mysqlPool.query('INSERT INTO users (username, password_hash) VALUES (?, ?)', [username, password]);
      const uid = ins.insertId;
      const user = { id: uid, username };
      const sid = String(Date.now()) + '-' + Math.random().toString(36).slice(2, 10);
      sessions[sid] = user;
      res.setHeader('Set-Cookie', `sid=${encodeURIComponent(sid)}; HttpOnly; Path=/; Max-Age=86400`);
      return res.json(user);
    }
    const db = readDB();
    db.users = db.users || [];
    if (db.users.find(u => u.username === username)) return res.status(400).json({ error: 'user exists' });
    const newUser = { id: (db.users.length ? Math.max(...db.users.map(u => u.id || 0)) + 1 : 1), username, password_hash: password };
    db.users.push(newUser);
    writeDB(db);
    const sid = String(Date.now()) + '-' + Math.random().toString(36).slice(2, 10);
    sessions[sid] = { id: newUser.id, username };
    res.setHeader('Set-Cookie', `sid=${encodeURIComponent(sid)}; HttpOnly; Path=/; Max-Age=86400`);
    return res.json({ id: newUser.id, username });
  } catch (err) { console.error('register error', err && err.message); res.status(500).json({ error: 'server error' }); }
});

app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) return res.status(400).json({ error: 'username and password required' });
    if (useMySQL && mysqlPool) {
      const [rows] = await mysqlPool.query('SELECT id,username,password_hash FROM users WHERE username = ?', [username]);
      const u = rows && rows[0];
      if (!u || String(u.password_hash) !== String(password)) return res.status(401).json({ error: 'invalid credentials' });
      const user = { id: u.id, username: u.username };
      const sid = String(Date.now()) + '-' + Math.random().toString(36).slice(2, 10);
      sessions[sid] = user;
      res.setHeader('Set-Cookie', `sid=${encodeURIComponent(sid)}; HttpOnly; Path=/; Max-Age=86400`);
      return res.json(user);
    }
    const db = readDB();
    db.users = db.users || [];
    const u = db.users.find(x => x.username === username && String(x.password_hash || '') === String(password));
    if (!u) return res.status(401).json({ error: 'invalid credentials' });
    const user = { id: u.id, username: u.username };
    const sid = String(Date.now()) + '-' + Math.random().toString(36).slice(2, 10);
    sessions[sid] = user;
    res.setHeader('Set-Cookie', `sid=${encodeURIComponent(sid)}; HttpOnly; Path=/; Max-Age=86400`);
    return res.json(user);
  } catch (err) { console.error('login error', err && err.message); res.status(500).json({ error: 'server error' }); }
});

app.post('/api/logout', async (req, res) => {
  try {
    const cookies = parseCookies(req);
    const sid = cookies.sid;
    if (sid && sessions[sid]) delete sessions[sid];
    res.setHeader('Set-Cookie', 'sid=; HttpOnly; Path=/; Max-Age=0');
    return res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: 'server error' }); }
});

app.get('/api/me', async (req, res) => {
  try {
    const cookies = parseCookies(req);
    const sid = cookies.sid;
    if (sid && sessions[sid]) return res.json(sessions[sid]);
    return res.status(401).json(null);
  } catch (err) { res.status(500).json({ error: 'server error' }); }
});

app.get('/api/categories', async (req, res) => {
  try {
    const cats = await fetchCategoriesFromDB();
    res.json(cats);
  } catch (err) { res.status(500).json({ error: 'server error' }); }
});

app.get('/api/books/:id', async (req, res) => {
  try {
    const books = await fetchBooksFromDB();
    const b = books.find(x => x.id === req.params.id);
    if (!b) return res.status(404).json({ error: 'not found' });
    res.json(b);
  } catch (err) { res.status(500).json({ error: 'server error' }); }
});

app.get('/api/favorites', async (req, res) => {
  try {
    const favs = await fetchFavoritesFromDB();
    res.json(favs);
  } catch (err) { res.status(500).json({ error: 'server error' }); }
});

app.post('/api/favorites', async (req, res) => {
  try {
    // supporte à la fois { book_id, action: 'add'|'remove' } et { id, value: true|false }
    const body = req.body || {};
    const bookId = body.book_id || body.id;
    const action = body.action || (typeof body.value !== 'undefined' ? (body.value ? 'add' : 'remove') : null);
    if (!bookId || !action) return res.status(400).json({ error: 'book_id and action required' });

    if (useMySQL && mysqlPool) {
      if (action === 'add') {
        // éviter les doublons
        await mysqlPool.query('INSERT INTO favorites (book_id) SELECT ? WHERE NOT EXISTS (SELECT 1 FROM favorites WHERE book_id = ?)', [bookId, bookId]);
      } else {
        await mysqlPool.query('DELETE FROM favorites WHERE book_id = ?', [bookId]);
      }
      const favs = await fetchFavoritesFromDB();
      return res.json(favs);
    }

    // repli sur fichier
    const db = readDB();
    db.favorites = db.favorites || [];
    const exists = db.favorites.includes(bookId);
    if (action === 'add' && !exists) db.favorites.push(bookId);
    if (action === 'remove' && exists) db.favorites = db.favorites.filter(x => x !== bookId);
    writeDB(db);
    res.json(db.favorites);
  } catch (err) {
    console.error('fav error', err && err.message);
    res.status(500).json({ error: 'server error' });
  }
});

// initialiser la tentative de connexion MySQL puis démarrer le serveur
const port = process.env.PORT || 4000;
tryConnectMySQL().then(() => {
  app.listen(port, () => console.log(`Server listening on http://localhost:${port} (mysql:${useMySQL})`));
}).catch(e => {
  console.error('Failed to initialize MySQL probe', e && e.message);
  app.listen(port, () => console.log(`Server listening on http://localhost:${port}`));
});
