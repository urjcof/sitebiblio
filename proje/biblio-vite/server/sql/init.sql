-- schéma SQL biblio + données d'exemple
-- Crée la base de données `biblio` avec les tables : books, copies, users, favorites

-- Créer la base de données (si elle n'existe pas)
CREATE DATABASE IF NOT EXISTS `biblio` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `biblio`;

-- Supprimer les tables existantes pour réinitialiser le schéma
DROP TABLE IF EXISTS `favorites`;
DROP TABLE IF EXISTS `copies`;
DROP TABLE IF EXISTS `users`;
DROP TABLE IF EXISTS `books`;

-- Table books
CREATE TABLE `books` (
  `id` VARCHAR(32) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `year` SMALLINT DEFAULT NULL,
  `rating` DECIMAL(3,1) DEFAULT NULL,
  `cover` VARCHAR(512) DEFAULT NULL,
  `category` VARCHAR(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_title` (`title`),
  KEY `idx_category` (`category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table copies (exemplaires physiques individuels d'un livre)
CREATE TABLE `copies` (
  `id` VARCHAR(32) NOT NULL,
  `book_id` VARCHAR(32) NOT NULL,
  `status` VARCHAR(30) NOT NULL DEFAULT 'AVAILABLE',
  PRIMARY KEY (`id`),
  KEY `idx_copy_book` (`book_id`),
  CONSTRAINT `fk_copy_book` FOREIGN KEY (`book_id`) REFERENCES `books` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table users (optionnelle)
CREATE TABLE `users` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(100) NOT NULL,
  `password_hash` VARCHAR(255) DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ux_users_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table favorites (favoris des utilisateurs). user_id peut être NULL pour des listes anonymes
CREATE TABLE `favorites` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `book_id` VARCHAR(32) NOT NULL,
  `user_id` INT DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_fav_book` (`book_id`),
  KEY `idx_fav_user` (`user_id`),
  CONSTRAINT `fk_fav_book` FOREIGN KEY (`book_id`) REFERENCES `books` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_fav_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insérer 30 livres d'exemple (6 catégories × 5 livres)
-- Les chemins des couvertures sont synchronisés exactement avec le dump fourni `biblio (1).sql`
INSERT INTO `books` (`id`,`title`,`year`,`rating`,`cover`,`category`) VALUES
('b1', 'Le Petit Prince', 1943, 8.7, '/covers/tomtom.webp', 'Conte'),
('b10', 'La Guerre des mondes', 1898, 7.9, '/covers/LGDM.jpg', 'Science-fiction'),
('b11', '1984', 1949, 8.5, '/covers/1984.jpg', 'Dystopie'),
('b12', 'Le Meilleur des mondes revisité', 1935, 7.8, '/covers/LMDM.jpg', 'Dystopie'),
('b13', 'Fahrenheit 451', 1953, 8.0, '/covers/Fahr.jpg', 'Dystopie'),
('b14', 'La Servante écarlate', 1985, 8.3, '/covers/Servante.jpg', 'Dystopie'),
('b15', 'Nous autres', 1920, 7.6, '/covers/nousautres.jpg', 'Dystopie'),
('b16', 'Le Rouge et le Noir', 1830, 7.8, '/covers/retn.jpg', 'Roman'),
('b17', 'Les Misérables', 1862, 8.9, '/covers/miserable.jpg', 'Roman'),
('b18', 'Madame Bovary', 1856, 8.0, '/covers/bovary.jpg', 'Roman'),
('b19', 'Germinal', 1885, 8.1, '/covers/germinal.jpg', 'Roman'),
('b2', 'Alice au pays des merveilles', 1865, 7.9, '/covers/alice.webp', 'Conte'),
('b20', 'Le Père Goriot', 1835, 7.7, '/covers/goriot.jpg', 'Roman'),
('b21', 'Voyage au centre de la Terre', 1864, 7.2, '/covers/vacdt.jpg', 'Aventure'),
('b22', 'Le Comte de Monte-Cristo', 1844, 8.6, '/covers/cristo.jpg', 'Aventure'),
('b23', 'L''Île au trésor', 1883, 7.5, '/covers/iletresor.jpg', 'Aventure'),
('b24', 'Robinson Crusoé', 1719, 7.4, '/covers/crusoe.jpg', 'Aventure'),
('b25', 'Vingt mille lieues sous les mers', 1870, 8.3, '/covers/20k.jpg', 'Aventure'),
('b26', 'Candide', 1759, 7.5, '/covers/canide.jpg', 'Philosophie'),
('b27', 'Discours de la méthode', 1637, 7.8, '/covers/methode.jpg', 'Philosophie'),
('b28', 'Le Capital', 1867, 8.2, '/covers/kapital.jpg', 'Philosophie'),
('b29', 'Éthique', 1677, 7.9, '/covers/ethique.jpg', 'Philosophie'),
('b3', 'Le Livre de la Jungle', 1894, 7.6, '/covers/jungle.jpg', 'Conte'),
('b30', 'La République', -380, 8.5, '/covers/repu.jpg', 'Philosophie'),
('b4', 'Contes de Grimm', 1812, 7.4, '/covers/grimm.jpg', 'Conte'),
('b5', 'Les Fables de La Fontaine', 1668, 8.0, '/covers/fontaine.jpg', 'Conte'),
('b6', 'Dune', 1965, 9.1, '/covers/dune.jpg', 'Science-fiction'),
('b7', 'Fondation', 1951, 8.8, '/covers/foncation.jpg', 'Science-fiction'),
('b8', 'Neuromancien', 1984, 8.2, '/covers/neuro.jpg', 'Science-fiction'),
('b9', 'Silence Absolu', 1932, 8.1, '/covers/silence.webp', 'Science-fiction');

-- Créer la table categories et migrer les catégories textuelles vers des catégories normalisées
DROP TABLE IF EXISTS `categories`;
CREATE TABLE `categories` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `slug` VARCHAR(120) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ux_categories_name` (`name`),
  UNIQUE KEY `ux_categories_slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- remplir la table categories à partir des valeurs distinctes de book.category
INSERT INTO `categories` (`name`,`slug`)
SELECT DISTINCT `category`, LOWER(REPLACE(TRIM(`category`), ' ', '-')) FROM `books` WHERE `category` IS NOT NULL AND TRIM(`category`) <> '';

-- ajouter la colonne category_id (clé étrangère) à books et la remplir depuis la table categories
ALTER TABLE `books` ADD COLUMN `category_id` INT NULL, ADD INDEX `idx_books_category_id` (`category_id`);
UPDATE `books` b
JOIN `categories` c ON TRIM(LOWER(b.category)) = TRIM(LOWER(c.name))
SET b.category_id = c.id;
ALTER TABLE `books` ADD CONSTRAINT `fk_book_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL;

-- Insérer un exemplaire par livre (ids c1..c30)
INSERT INTO `copies` (`id`,`book_id`,`status`) VALUES
('c1','b1','AVAILABLE'),
('c2','b2','AVAILABLE'),
('c3','b3','AVAILABLE'),
('c4','b4','AVAILABLE'),
('c5','b5','AVAILABLE'),
('c6','b6','AVAILABLE'),
('c7','b7','AVAILABLE'),
('c8','b8','AVAILABLE'),
('c9','b9','AVAILABLE'),
('c10','b10','AVAILABLE'),
('c11','b11','AVAILABLE'),
('c12','b12','AVAILABLE'),
('c13','b13','AVAILABLE'),
('c14','b14','AVAILABLE'),
('c15','b15','AVAILABLE'),
('c16','b16','AVAILABLE'),
('c17','b17','AVAILABLE'),
('c18','b18','AVAILABLE'),
('c19','b19','AVAILABLE'),
('c20','b20','AVAILABLE'),
('c21','b21','AVAILABLE'),
('c22','b22','AVAILABLE'),
('c23','b23','AVAILABLE'),
('c24','b24','AVAILABLE'),
('c25','b25','AVAILABLE'),
('c26','b26','AVAILABLE'),
('c27','b27','AVAILABLE'),
('c28','b28','AVAILABLE'),
('c29','b29','AVAILABLE'),
('c30','b30','AVAILABLE');

-- Vider la table favorites (vide par défaut)
TRUNCATE TABLE `favorites`;

-- Requêtes rapides de vérification :
-- SELECT COUNT(*) FROM books;
-- SELECT category, COUNT(*) FROM books GROUP BY category;
-- SELECT * FROM books LIMIT 10;

