BTS SERVICES INFORMATIQUES AUX ORGANISATIONS — SESSION 2025
ANNEXE 9-1-B : Fiche descriptive de réalisation professionnelle (recto/verso)
Épreuve E6 - Conception et développement d’applications (option SLAM)


DESCRIPTION D’UNE RÉALISATION PROFESSIONNELLE
N° réalisation :
Nom, prénom : Lemarchand Léo
N° candidat :
Épreuve ponctuelle 	X Contrôle en cours de formation 
Date : 02 / 12 / 2025
Organisation support de la réalisation professionnelle : Projet personnel "biblio-vite"

Intitulé de la réalisation professionnelle : Mise en place et développement d'une application de catalogue de livres (frontend React + backend MySQL/Node)

Période de réalisation : ........................................  Lieu : ...................................................................................
Modalité : 	  X Seul(e) 	 	 En équipe

Compétences travaillées :
- Concevoir et développer une solution applicative
- Assurer la maintenance corrective ou évolutive d’une solution applicative
- Gérer les données

Conditions de réalisation (ressources fournies, résultats attendus) :
- Base de données MySQL (schéma fourni `server/sql/init.sql`), jeu de données 30 livres
- Accès à un poste Windows et environnement WAMP pour la base
- Résultat attendu : frontend fonctionnel (Vite + React) affichant "Tendance" et 6 carrousels de catégories, recherche, gestion des favoris, endpoints API REST


**Description des ressources documentaires, matérielles et logicielles utilisées**

Ressources documentaires
- README du projet (`README.md`) présent dans le dépôt : description du projet, scripts et instructions de démarrage.
- Script SQL d'initialisation : `server/sql/init.sql` (schéma des tables, insertions d'exemples, migration des catégories).
- Fichier mock : `server/db.json` (jeu de données JSON utilisé pour le développement sans BDD). 
- Documentation technique consultée :
  - Documentation React (https://react.dev / https://reactjs.org)
  - Documentation Vite (https://vitejs.dev)
  - Documentation Tailwind CSS (https://tailwindcss.com)
  - Documentation MySQL (https://dev.mysql.com)
  - Documentation Node.js / Express (https://nodejs.org / https://expressjs.com)
  - Documentation mysql2 (npm package) pour accès MySQL depuis Node
  - Articles et tutoriels utilisés pour la mise en place de sessions, CORS et authentification (bcrypt, express-session)
  - Références MDN pour JavaScript et fetch API

Ressources matérielles
- Poste de développement : PC portable / poste de bureau sous Windows (WAMP installé pour MySQL/Apache).
- Espace disque local contenant le projet et les assets (dossier `public/covers/` pour les images de couvertures).
- Navigateur web moderne (Chrome/Edge/Firefox) pour tester l'application web.

Ressources logicielles
- Environnement runtime :
  - Node.js (version compatible, installé sur la machine)
  - npm (gestionnaire de paquets)
- Serveur de base de données :
  - MySQL (via WAMP) pour la base `biblio` et import du fichier `init.sql`
  - phpMyAdmin (optionnel) pour import et inspection des tables
- Serveur de développement / API :
  - Express (Node.js) — code serveur présent dans `server/index.js` et `server/mysql-server.js`
  - mysql2 (package npm) pour connexion MySQL depuis Node
  - bcrypt (pour hash de mots de passe), express-session (pour sessions)
- Frontend :
  - Vite (outil de bundling et dev server)
  - React (bibliothèque UI)
  - Tailwind CSS + PostCSS + Autoprefixer
  - ESLint (linting)
- Outils de développement :
  - Visual Studio Code (éditeur recommandé)
  - PowerShell / cmd.exe (terminal sous Windows)
  - Git (contrôle de versions)
  - curl (ou équivalent) pour tester endpoints API

Fichiers et dossiers de référence dans le projet
- `src/` : code frontend React (composants, pages)
- `public/covers/` : images de couvertures utilisées par les fiches livres
- `server/index.js`, `server/mysql-server.js` : serveurs de développement (express) — lecture soit de `db.json`, soit de MySQL
- `server/db.json` : jeu de données mock
- `server/sql/init.sql` : script d'initialisation MySQL (création de tables et insertion des 30 livres)
- `package.json` (racine) : scripts frontend (vite)
- `server/package.json` : scripts backend (node, start:mysql)

Remarques pratiques
- Pendant le développement, j'ai alternativement utilisé le mock (`db.json`) et la BDD MySQL selon les besoins de test. Le script `init.sql` permet de recréer la base localement.
- Les dépendances npm se gèrent via `npm install` dans la racine (frontend) et dans `server/` (backend).


---

(Je peux insérer cette section directement dans la fiche complète — voulez-vous que j'écrive le fichier `docs/E6_fiche_Lemarchand_Leo.md` avec l'ensemble du recto/verso rempli, ou seulement ajouter/modifier cette section ?)