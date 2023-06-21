-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Jun 21, 2023 at 08:21 AM
-- Server version: 10.11.4-MariaDB-1
-- PHP Version: 8.2.7

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `rt_bot`
--

-- --------------------------------------------------------

--
-- Table structure for table `madoc`
--

CREATE TABLE `madoc` (
  `id` int(11) NOT NULL,
  `user_id` varchar(255) NOT NULL,
  `madoc_link` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `sws`
--

CREATE TABLE `sws` (
  `id` int(11) NOT NULL,
  `user_id` varchar(255) NOT NULL,
  `institution_code` varchar(255) NOT NULL,
  `identifier_code` varchar(255) NOT NULL,
  `pin_code` varchar(255) NOT NULL,
  `signature` text NOT NULL,
  `md5` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `madoc`
--
ALTER TABLE `madoc`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `sws`
--
ALTER TABLE `sws`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `madoc`
--
ALTER TABLE `madoc`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `sws`
--
ALTER TABLE `sws`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
