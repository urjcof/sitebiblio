# Documentation du projet BOOKBOXD

## But du projet
Application de catalogue de livres (SPA React) avec un backend Express utilisant une base MySQL. Le front communique avec une API REST.

## Architecture & fichiers clés
- `package.json` : scripts de développement (`dev`, `build`, `preview`) et dépendances (React, Vite, Tailwind).
- `server/index.js` : serveur Express principal — implémentation MySQL-only (pool `mysql2/promise`), endpoints API (books, categories, favorites, auth via `express-session` et `bcrypt`).
- `server/mysql-server.js` : ancienne alternative similaire (peut être supprimée si vous préférez centraliser sur `server/index.js`).
- Frontend :
  - `src/main.jsx` : point d'entrée Vite/React.
  - `src/App.jsx` : wrapper minimal qui monte `MainPage`.
  - `src/components/MainPage.jsx` : composant principal (chargement des livres, carrousels, recherche, navigation vers compte/wishlist).
  - `src/components/BookCard.jsx` : affichage d'une fiche livre (couverture, titre, note, actions Lire/Emprunter, gestion du favori).
  - `src/components/WishlistPage.jsx` : page wishlist, utilise `localStorage` ou `favoritesSet` serveur.
  - `src/components/AccountPage.jsx` : gestion login/register/logout et récupération du user via `/api/me`.
- `public/covers/*` : images de couvertures.

## Détails technique — serveur
- Démarrage : `node server/index.js` ; le serveur nécessite une base MySQL disponible et se connecte via un pool `mysql2/promise`.
- Stockage : requêtes et persistance côté MySQL (tables `books`, `categories`, `users`, `favorites`, ...).
- Sessions & auth :
  - `index.js` utilise `express-session` (cookie de session) et `bcrypt` pour le hachage des mots de passe.
- Endpoints exposés (résumé) :
  - `GET /api/books` — liste des livres.
  - `GET /api/books/:id` — détail livre.
  - `GET /api/categories` — catégories.
  - `GET /api/favorites` — favoris (retourne tableau d'ids).
  - `POST /api/favorites` — body `{ book_id, action: 'add'|'remove' }`.
  - Auth : `POST /api/register`, `POST /api/login`, `POST /api/logout`, `GET /api/me`.

### Remarques de sécurité
- Les mots de passe sont hachés avec `bcrypt` avant stockage dans la base de données.
- Pour la production, configurez un `SESSION_SECRET` fort, activez `cookie.secure` si vous servez sur HTTPS et utilisez un store persistant pour les sessions (Redis, base SQL). 

## Détails technique — frontend
- Base API : `import.meta.env.VITE_API_BASE` ou `http://localhost:4000` par défaut.
- Chargement des données : `MainPage` charge `/api/books` et `/api/categories` au montage ; si échec, utilise le tableau `SAMPLE` intégré.
- Comportements clefs :
  - Carrousels : 7 carrousels (Tendance + 6 catégories prédéfinies). Pagination locale par tranche (`PAGE_SIZE = 5`).
  - Recherche : filtre local sur le titre et la catégorie.
  - Favoris : synchronisation avec le backend via `/api/favorites` (requêtes envoyées avec `credentials: 'include'`). Si non-auth, fallback sur `localStorage` (`fav:<book.id>`).
  - Auth : `AccountPage` gère login/register. Après connexion, `MainPage` récupère les favori serveur via `GET /api/favorites`.
- Lazy loading : `WishlistPage` est importée via `React.lazy` et rendu sous `Suspense`.

### Exemple: afficher un champ de la base dans l'en-tête

- Ajout d'un état `featuredTitle` :

```js
const [featuredTitle, setFeaturedTitle] = useState(null);
```

- Après le chargement des livres, définir `featuredTitle` sur le premier titre (ou sur un livre d'exemple) :

```js
setBooks(arr.length ? arr : SAMPLE);
setFeaturedTitle((arr && arr.length ? arr[0].title : (SAMPLE[0] && SAMPLE[0].title)) || null);
```

- Rendu dans l'en-tête :

```jsx
<div className="text-3xl ...">
  <div className="flex flex-col">
    <span>BOOKBOXD</span>
    {featuredTitle && <span className="text-xs text-neutral-400 mt-1">Exemple : {featuredTitle}</span>}
  </div>
</div>
```

Cet exemple sert à montrer comment exposer des données provenant de la base et les insérer dans l'UI (header, badge, etc.). Vous pouvez remplacer `arr[0]` par toute logique pour sélectionner un livre en particulier (le plus récent, le plus noté, une sélection aléatoire, etc.).

## Comment exécuter le projet (dev)
Prérequis : Node.js

1. Installer les dépendances frontend :

```bash
npm install
```

2. Lancer le backend (MySQL requis) :

```powershell
# Exemple PowerShell : définir les vars puis lancer
$env:DB_HOST='127.0.0.1'; $env:DB_USER='root'; $env:DB_PASSWORD=''; $env:DB_NAME='biblio'; node server/index.js
```

`server/index.js` attend une base MySQL contenant les tables utilisées (`books`, `categories`, `users`, `favorites`).

3. Lancer le front Vite :

```bash
npm run dev
```

- Le front sera généralement disponible sur `http://localhost:5173`.
- L'API attendue par défaut est `http://localhost:4000` (changer via `VITE_API_BASE`).

## Résultat attendu à l'exécution
- Interface BOOKBOXD affichant :
  - Carrousels (Tendance + catégories), chaque livre affiché via `BookCard`.
  - Recherche fonctionnelle, boutons `Lire` et `Emprunter` (actions d'exemple qui déclenchent des `alert()` dans le frontend).
  - Wishlist: stockage local si non connecté, ou synchronisé avec le serveur si connecté.
  - Authentification: inscription et connexion créent une session (cookie `sid`) et permettent d'utiliser les favoris serveur.

## Améliorations recommandées
- Hacher les mots de passe même en dev, améliorer la validation côté serveur.
- Remplacer sessions en mémoire par un store persistant (Redis) pour la production.
- Ajouter tests unitaires pour API et composants React.
- Rendre les carrousels accessibles au clavier.

## Fichiers à consulter
- Serveur : `server/index.js`, `server/mysql-server.js`
- Frontend : `src/components/MainPage.jsx`, `src/components/BookCard.jsx`, `src/components/AccountPage.jsx`, `src/components/WishlistPage.jsx`

---

Si vous voulez, je peux :
- mettre ce contenu dans `README.md` à la place du contenu actuel, ou
- committer ces changements, ou
- lancer le serveur et le front dans des terminaux pour vérifier (je peux fournir les commandes).
