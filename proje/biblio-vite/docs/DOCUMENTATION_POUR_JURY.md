# Documentation du projet — Présentation pour un jury

Résumé
------
Ce document explique l'architecture, le fonctionnement et les choix techniques du projet "Bookboxd" (frontend React + backend minimal). Il contient : instructions d'installation et d'exécution, description des composants clés, notes sur le style/CSS, scénarios de test manuels, et points de présentation pour un jury.

Installation et exécution
-------------------------
Prérequis :
- Node.js (>=18 recommandé)

Étapes pour lancer en local (dossier racine : `proje/proje/biblio-vite`):

```bash
cd proje/proje/biblio-vite
npm install    # une seule fois après clone ou modification de package.json
npm run dev    # démarre Vite en mode développement
```

Si vous voulez lancer l'API de test incluse :

```bash
cd proje/proje/biblio-vite/server
npm install
node index.js  # démarre un serveur minimal (par défaut http://localhost:4000)
```

Structure du dépôt
------------------
- `src/` : code frontend React
  - `main.jsx` : point d'entrée, import CSS global
  - `App.jsx` : wrapper principal (monte `MainPage`)
  - `components/` : composants réutilisables
    - `MainPage.jsx` : page principale, carrousels, recherche et navigation
    - `BookCard.jsx` : carte d'un livre (affiche couverture, actions)
    - `WishlistPage.jsx` : page wishlist (favoris)
    - `AccountPage.jsx` : gestion du compte (login/sessions)
- `public/` : ressources statiques (covers/...)
- `server/` : petit serveur de test / endpoints API
- `docs/` : documentation (ce fichier)

Principes d'architecture
------------------------
- Frontend : React fonctionnel léger, state local via `useState` et `useEffect`.
- Séparation claire : affichage (`components`) vs données (fetch depuis `server` ou fixtures `SAMPLE`).
- Stockage des favoris : priorité au serveur via endpoint `/api/favorites` ; fallback sur `localStorage` en mode déconnecté.

Composants et comportements importants
-------------------------------------
- `MainPage.jsx` :
  - Gère le fetch initial des livres et catégories.
  - Normalise les catégories pour faire des comparaisons robustes (suppression d'accents, minuscules).
  - Implémente plusieurs carrousels (Tendance + catégories) avec une logique de pagination interne `visibleStarts`.
  - `scrollCarousel(index, delta, itemsLength)` : modifie `visibleStarts[index]` pour faire défiler les éléments sur  `PAGE_SIZE` éléments.

- `BookCard.jsx` :
  - Affiche la couverture (`object-fit: cover`) avec plusieurs tailles (`small`, `fullWidth`).
  - Gère le favori localement (`localStorage`) et notifie le parent via `onFavourite`.
  - Expose `onRead` et `onBorrow` hooks pour les actions sur les livres.

CSS et modifications récentes
----------------------------
- Le projet utilisait Tailwind. Sur demande, Tailwind a été retiré et remplacé par un CSS global simple dans `src/index.css`.
  - Fichiers modifiés : `src/index.css`, `postcss.config.cjs`, `package.json`.
  - `tailwind.config.cjs` a été supprimé.
- Pour restaurer l'apparence et les utilitaires, plusieurs classes utilitaires courantes (ex : `.grid-cols-5`, `.relative`, `.justify-center`, `.mb-8`) ont été ajoutées dans `src/index.css`.
- Résultat : carrousels centrés, flèches cliquables, boutons rétablis.

Comportements et résilience
---------------------------
- Favoris : si l'appel au serveur échoue, le système écrit une clé `fav:<book.id>` dans `localStorage` et met à jour l'IU localement.
- Données : si le fetch des livres échoue, on utilise un ensemble `SAMPLE` embarqué pour garantir un rendu.

Scénarios de test manuel (checklist pour le jury)
-----------------------------------------------
1. Installer et démarrer le frontend (`npm run dev`).
2. Vérifier la page d'accueil : 6 carrousels (Tendance + 5 catégories) s'affichent.
3. Tester les flèches gauche/droite : elles font défiler les cartes (fonction `scrollCarousel`).
4. Cliquer sur le cœur d'une `BookCard` : le cœur change d'état; vérifier `localStorage` ou appel `POST /api/favorites` si le serveur est actif.
5. Tester les boutons `Lire` et `Emprunter` : ils déclenchent actuellement un `alert(...)` et mettent à jour l'état local pour `Emprunter`.
6. Tester la recherche : saisir un mot et vérifier que les résultats filtrent par titre ou catégorie.
7. Responsiveness : réduire la largeur de la fenêtre et vérifier l'affichage des cartes et carrousels.

Points à présenter au jury (script court)
----------------------------------------
- Fonctionnalité principale : navigation par carrousels, wishlist et actions sur les livres.
- Robustesse : fallback data (`SAMPLE`) et fallback favoris (`localStorage`).
- Simplicité technique : React sans heavy framework, code lisible et facile à étendre.
- Décisions récentes : retrait de Tailwind pour revenir à du CSS contrôlable et éliminer une erreur PostCSS; démontrer capacité à adapter un projet rapidement.

Améliorations possibles (sujets de discussion)
---------------------------------------------
- Ajouter des tests unitaires (Jest + React Testing Library) pour les composants essentiels.
- Ajouter l'accessibilité (aria-attributes supplémentaires, focus management pour les carrousels).
- Ajouter une persistance complète côté serveur (base de données) et authentification.

Historique des modifications (récentes, utiles pour le jury)
---------------------------------------------------------
- Retiré Tailwind CSS et plugins PostCSS liés.
- Ajout d'utilitaires CSS dans `src/index.css` pour remplacer les classes Tailwind utilisées dans les composants.
- Correction de `package.json` pour réparer le format JSON et supprimer les dépendances Tailwind.

Contact technique
-----------------
Si le jury souhaite une démonstration live de modifications ou d'extensions, je peux :
- montrer le code des composants (`src/components/MainPage.jsx`, `BookCard.jsx`),
- exécuter le serveur backend de test (`server/index.js`),
- expliquer la logique de `visibleStarts` et modifier `PAGE_SIZE` en direct.

Fin

Tutoriel simple — afficher le nom d'un livre dans le header
---------------------------------------------------------
Objectif : montrer rapidement au jury que tu maîtrises la structure du code en affichant le titre d'un livre sélectionné dans l'en-tête (`header`).

Principe :
- On ajoute un état `selectedBook` dans `MainPage` et on passe une fonction `setSelectedBook` aux `BookCard`.
- Lorsqu'on clique sur une carte, on met à jour `selectedBook` et on affiche `selectedBook.title` dans le header.

Étapes (changements SUGGÉRÉS — à appliquer uniquement si tu veux modifier le code) :

1) Dans le fichier [src/components/MainPage.jsx](src/components/MainPage.jsx#L1) :

```jsx
// ajouter en haut du composant MainPage
const [selectedBook, setSelectedBook] = useState(null);
```

2) Toujours dans `MainPage.jsx`, transmettre `setSelectedBook` aux `BookCard` lors du rendu :

```jsx
<BookCard
  book={b}
  onRead={onRead}
  onBorrow={onBorrow}
  onFavourite={...}
  onClick={() => setSelectedBook(b)} // <-- ajout
/>
```

3) Dans le header de `MainPage.jsx`, afficher le titre si `selectedBook` existe :

```jsx
<header className="...">
  <div>
    <div className="text-3xl">BOOKBOXD</div>
    {selectedBook && (
      <div className="text-sm text-neutral-400">Sélectionné : {selectedBook.title}</div>
    )}
  </div>
  ...
</header>
```

Notes et variations :
- Tu peux utiliser un modal ou un drawer au lieu d'afficher directement le titre dans le header.
- Si tu veux que la sélection survive au rechargement, sérialise `selectedBook.id` dans `localStorage` et restaure-le au montage (`useEffect`).

Expliquer ça au jury :
- Montre où est stocké l'état (`useState`) et comment un `prop` (`onClick`/`onFavourite`) permet la communication parent-enfant.
- Explique la politique de fallback (`SAMPLE`) et le choix d'une approche simple et testable.

Exemple 2 — afficher le nom d'utilisateur dans le header
------------------------------------------------------
Objectif : afficher le nom de l'utilisateur connecté dans le header pour montrer la gestion d'état global/local et la communication entre composants.

Principe :
- On ajoute un état `user` (ou `currentUser`) dans `MainPage` ou un contexte React si tu veux partager au-delà de la page.
- Lorsqu'un utilisateur se connecte (simulé par `AccountPage`), on appelle `setUser({ id, name })` pour mettre à jour l'état.
- Le header lit `user.name` et l'affiche.

Étapes (changements SUGGÉRÉS) :

1) Dans [src/components/MainPage.jsx](src/components/MainPage.jsx#L1) :

```jsx
// ajouter en haut du composant MainPage
const [user, setUser] = useState(null);
```

2) Fournir `onAuthChange` (ou passer `setUser`) à `AccountPage` :

```jsx
<AccountPage onAuthChange={(u) => { setUser(u); handleAuthChange(u); }} />
```

3) Afficher le nom dans le header :

```jsx
<header className="...">
  <div>
    <div className="text-3xl">BOOKBOXD</div>
    {user ? (
      <div className="text-sm text-neutral-400">Connecté en tant que {user.name}</div>
    ) : (
      <div className="text-sm text-neutral-400">Invité</div>
    )}
  </div>
  ...
</header>
```

Variantes et bonnes pratiques :
- Pour un projet réel, utilise un contexte (`React.createContext`) ou un gestionnaire d'état (Redux, Zustand) si `user` est utilisé dans plusieurs composants.
- Garde les informations sensibles côté serveur — dans le frontend, stocke uniquement un `user.id` ou un token et restaure via une requête sécurisée.

À dire au jury : explique la différence entre état local (`useState`) et état partagé (Context/Redux), et montre comment l'UI se met à jour automatiquement quand `setUser` est appelé.

