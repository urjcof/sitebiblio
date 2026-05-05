This is a small development server that exposes a simple JSON database for the biblio-vite project.

Endpoints:
- GET /api/books        -> list of books
- GET /api/books/:id    -> single book
- GET /api/favorites    -> list of favorite book ids
- POST /api/favorites   -> body { id: string, value: true|false } to add/remove favorite

Quick start:
1. Open a terminal and go to the server folder:
   cd server
2. Install dependencies:
   npm install
3. Start the server:
   npm start

The server will listen on port 4000 by default. The front-end can call http://localhost:4000/api/... to consume the data.

Note: This is a simple file-based db for development. For production, migrate to a real DB (Postgres, SQLite, etc.).

---

MySQL-backed server (WAMP)

If you imported `server/sql/init.sql` into your WAMP MySQL (phpMyAdmin), you can use the MySQL-backed server that reads/writes the database and provides user accounts.

1. Install the server dependencies (from project `server` folder):

```powershell
cd server
npm install
```

2. Start the MySQL-backed server (default port 4000):

```powershell
npm run start:mysql
```

3. Environment variables (optional):
- DB_HOST (default 127.0.0.1)
- DB_PORT (default 3306)
- DB_USER (default root)
- DB_PASSWORD (default empty)
- DB_NAME (default biblio)
- SESSION_SECRET (change for production)

The server exposes these endpoints used by the front-end:
- GET /api/books
- GET /api/books/:id
- POST /api/register  { username, password }
- POST /api/login     { username, password }
- POST /api/logout
- GET /api/me         -> returns current user or null
- GET /api/favorites  -> (requires auth) returns array of book ids
- POST /api/favorites -> (requires auth) { book_id, action: 'add'|'remove' }

When using the front-end (Vite dev server), ensure requests include credentials (fetch with credentials: 'include') so the session cookie is sent.

