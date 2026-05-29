-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1:3306
-- Généré le : ven. 29 mai 2026 à 12:33
-- Version du serveur : 8.4.7
-- Version de PHP : 8.3.28

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `biblio`
--

-- --------------------------------------------------------

--
-- Structure de la table `books`
--

DROP TABLE IF EXISTS `books`;
CREATE TABLE IF NOT EXISTS `books` (
  `id` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `year` smallint DEFAULT NULL,
  `rating` decimal(3,1) DEFAULT NULL,
  `cover` varchar(512) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `lecture` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `category` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `category_id` int DEFAULT NULL,
  `AccesLivre` varchar(250) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_title` (`title`),
  KEY `idx_category` (`category`),
  KEY `idx_books_category_id` (`category_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `books`
--

INSERT INTO `books` (`id`, `title`, `year`, `rating`, `cover`, `lecture`, `category`, `category_id`, `AccesLivre`) VALUES
('b1', 'Le Petit Prince', 1943, 8.7, '/covers/tomtom.webp', '/book/st_exupery_le_petit_prince.pdf', 'Conte', 2, ''),
('b10', 'La Guerre des mondes', 1898, 7.9, '/covers/LGDM.jpg', '', 'Science-fiction', 6, ''),
('b11', '1984', 1949, 8.5, '/covers/1984.jpg', '', 'Dystopie', 3, ''),
('b12', 'Le Meilleur des mondes revisité', 1935, 7.8, '/covers/LMDM.jpg', '', 'Dystopie', 3, ''),
('b13', 'Fahrenheit 451', 1953, 8.0, '/covers/Fahr.jpg', '', 'Dystopie', 3, ''),
('b14', 'La Servante écarlate', 1985, 8.3, '/covers/Servante.jpg', '', 'Dystopie', 3, ''),
('b15', 'Nous autres', 1920, 7.6, '/covers/nousautres.jpg', '', 'Dystopie', 3, ''),
('b16', 'Le Rouge et le Noir', 1830, 7.8, '/covers/retn.jpg', '', 'Roman', 5, ''),
('b17', 'Les Misérables', 1862, 8.9, '/covers/miserable.jpg', '', 'Roman', 5, ''),
('b18', 'Madame Bovary', 1856, 8.0, '/covers/bovary.jpg', '', 'Roman', 5, ''),
('b19', 'Germinal', 1885, 8.1, '/covers/germinal.jpg', '', 'Roman', 5, ''),
('b2', 'Alice au pays des merveilles', 1865, 7.9, '/covers/alice.webp', '', 'Conte', 2, ''),
('b20', 'Le Père Goriot', 1835, 7.7, '/covers/goriot.jpg', '', 'Roman', 5, ''),
('b21', 'Voyage au centre de la Terre', 1864, 7.2, '/covers/vacdt.jpg', '', 'Aventure', 1, ''),
('b22', 'Le Comte de Monte-Cristo', 1844, 8.6, '/covers/cristo.jpg', '', 'Aventure', 1, ''),
('b23', 'L\'Île au trésor', 1883, 7.5, '/covers/iletresor.jpg', '', 'Aventure', 1, ''),
('b24', 'Robinson Crusoé', 1719, 7.4, '/covers/crusoe.jpg', '', 'Aventure', 1, ''),
('b25', 'Vingt mille lieues sous les mers', 1870, 8.3, '/covers/20k.jpg', '', 'Aventure', 1, ''),
('b26', 'Candide', 1759, 7.5, '/covers/canide.jpg', '', 'Philosophie', 4, ''),
('b27', 'Discours de la méthode', 1637, 7.8, '/covers/methode.jpg', '', 'Philosophie', 4, ''),
('b28', 'Le Capital', 1867, 8.2, '/covers/kapital.jpg', '', 'Philosophie', 4, ''),
('b29', 'Éthique', 1677, 7.9, '/covers/ethique.jpg', '', 'Philosophie', 4, ''),
('b3', 'Le Livre de la Jungle', 1894, 7.6, '/covers/jungle.jpg', '', 'Conte', 2, ''),
('b30', 'La République', -380, 8.5, '/covers/repu.jpg', '', 'Philosophie', 4, ''),
('b4', 'Contes de Grimm', 1812, 7.4, '/covers/grimm.jpg', '', 'Conte', 2, ''),
('b5', 'Les Fables de La Fontaine', 1668, 8.0, '/covers/fontaine.jpg', '', 'Conte', 2, ''),
('b6', 'Dune', 1965, 9.1, '/covers/dune.jpg', '', 'Science-fiction', 6, ''),
('b7', 'Fondation', 1951, 8.8, '/covers/foncation.jpg', '', 'Science-fiction', 6, ''),
('b8', 'Neuromancien', 1984, 8.2, '/covers/neuro.jpg', '', 'Science-fiction', 6, ''),
('b9', 'Silence Absolu', 1932, 8.1, '/covers/silence.webp', '', 'Science-fiction', 6, '');

-- --------------------------------------------------------

--
-- Structure de la table `categories`
--

DROP TABLE IF EXISTS `categories`;
CREATE TABLE IF NOT EXISTS `categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ux_categories_name` (`name`),
  UNIQUE KEY `ux_categories_slug` (`slug`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `categories`
--

INSERT INTO `categories` (`id`, `name`, `slug`) VALUES
(1, 'Aventure', 'aventure'),
(2, 'Conte', 'conte'),
(3, 'Dystopie', 'dystopie'),
(4, 'Philosophie', 'philosophie'),
(5, 'Roman', 'roman'),
(6, 'Science-fiction', 'science-fiction');

-- --------------------------------------------------------

--
-- Structure de la table `copies`
--

DROP TABLE IF EXISTS `copies`;
CREATE TABLE IF NOT EXISTS `copies` (
  `id` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL,
  `book_id` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'AVAILABLE',
  PRIMARY KEY (`id`),
  KEY `idx_copy_book` (`book_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `copies`
--

INSERT INTO `copies` (`id`, `book_id`, `status`) VALUES
('c1', 'b1', 'AVAILABLE'),
('c10', 'b10', 'AVAILABLE'),
('c11', 'b11', 'AVAILABLE'),
('c12', 'b12', 'AVAILABLE'),
('c13', 'b13', 'AVAILABLE'),
('c14', 'b14', 'AVAILABLE'),
('c15', 'b15', 'AVAILABLE'),
('c16', 'b16', 'AVAILABLE'),
('c17', 'b17', 'AVAILABLE'),
('c18', 'b18', 'AVAILABLE'),
('c19', 'b19', 'AVAILABLE'),
('c2', 'b2', 'AVAILABLE'),
('c20', 'b20', 'AVAILABLE'),
('c21', 'b21', 'AVAILABLE'),
('c22', 'b22', 'AVAILABLE'),
('c23', 'b23', 'AVAILABLE'),
('c24', 'b24', 'AVAILABLE'),
('c25', 'b25', 'AVAILABLE'),
('c26', 'b26', 'AVAILABLE'),
('c27', 'b27', 'AVAILABLE'),
('c28', 'b28', 'AVAILABLE'),
('c29', 'b29', 'AVAILABLE'),
('c3', 'b3', 'AVAILABLE'),
('c30', 'b30', 'AVAILABLE'),
('c4', 'b4', 'AVAILABLE'),
('c5', 'b5', 'AVAILABLE'),
('c6', 'b6', 'AVAILABLE'),
('c7', 'b7', 'AVAILABLE'),
('c8', 'b8', 'AVAILABLE'),
('c9', 'b9', 'AVAILABLE');

-- --------------------------------------------------------

--
-- Structure de la table `favorites`
--

DROP TABLE IF EXISTS `favorites`;
CREATE TABLE IF NOT EXISTS `favorites` (
  `id` int NOT NULL AUTO_INCREMENT,
  `book_id` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` int DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_fav_book` (`book_id`),
  KEY `idx_fav_user` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `favorites`
--

INSERT INTO `favorites` (`id`, `book_id`, `user_id`, `created_at`) VALUES
(1, 'b10', 1, '2025-12-01 15:57:21'),
(2, 'b11', 1, '2025-12-01 15:57:25'),
(3, 'b28', 1, '2025-12-01 15:57:27'),
(4, 'b30', 1, '2025-12-01 15:57:28'),
(5, 'b12', 2, '2025-12-01 15:59:59'),
(6, 'b29', 2, '2025-12-01 16:00:02'),
(8, 'b11', 3, '2026-04-27 22:18:52'),
(9, 'b1', 3, '2026-04-27 22:18:54');

-- --------------------------------------------------------

--
-- Structure de la table `users`
--

DROP TABLE IF EXISTS `users`;
CREATE TABLE IF NOT EXISTS `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ux_users_username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `users`
--

INSERT INTO `users` (`id`, `username`, `password_hash`, `created_at`) VALUES
(1, 'leo', '$2b$10$7Q3JSVrNiHr3YZUoGzEYTe4WhadPZa.OJrIE/b13gJWEDHxwPR5ze', '2025-12-01 15:57:12'),
(2, 'brr', '$2b$10$xrzKEqU2E9xcCtWnuVBns.wBntUv1/c8Psc9LxrgOUU0WcoLvhjLu', '2025-12-01 15:59:53'),
(3, 'leola6t', '$2b$10$F98oWF0DkOTwAUeHPo84GOPraEGHvmiB7NKmvcRqE.ClagI//osCC', '2026-04-27 22:18:44'),
(5, 'leo2', '$2b$10$3mL3V16QIEFxl2pRaYyXb.z0150UubKN4HLiZOEPwWHlpkC/5gm.e', '2026-05-29 12:00:58');

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `books`
--
ALTER TABLE `books`
  ADD CONSTRAINT `fk_book_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL;

--
-- Contraintes pour la table `copies`
--
ALTER TABLE `copies`
  ADD CONSTRAINT `fk_copy_book` FOREIGN KEY (`book_id`) REFERENCES `books` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `favorites`
--
ALTER TABLE `favorites`
  ADD CONSTRAINT `fk_fav_book` FOREIGN KEY (`book_id`) REFERENCES `books` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_fav_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
