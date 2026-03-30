-- MySQL dump 10.13  Distrib 9.1.0, for Win64 (x86_64)
--
-- Host: localhost    Database: qlcongvieckhoa
-- ------------------------------------------------------
-- Server version	9.1.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `subject_assignments`
--

DROP TABLE IF EXISTS `subject_assignments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `subject_assignments` (
  `assignment_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `subject_id` int NOT NULL,
  `teaching_role` enum('head','lecturer') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'lecturer',
  `semester` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`assignment_id`),
  KEY `user_id` (`user_id`),
  KEY `subject_id` (`subject_id`)
) ENGINE=MyISAM AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `subject_assignments`
--

LOCK TABLES `subject_assignments` WRITE;
/*!40000 ALTER TABLE `subject_assignments` DISABLE KEYS */;
INSERT INTO `subject_assignments` VALUES (1,2,1,'lecturer','Spring 2026'),(2,2,4,'lecturer','Spring 2026'),(3,3,2,'lecturer','Spring 2026'),(4,4,3,'lecturer','Spring 2026'),(5,4,5,'lecturer','Spring 2026');
/*!40000 ALTER TABLE `subject_assignments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `subjects`
--

DROP TABLE IF EXISTS `subjects`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `subjects` (
  `subject_id` int NOT NULL AUTO_INCREMENT,
  `subject_code` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `subject_name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `credits` int NOT NULL DEFAULT '3',
  PRIMARY KEY (`subject_id`),
  UNIQUE KEY `subject_code` (`subject_code`)
) ENGINE=MyISAM AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `subjects`
--

LOCK TABLES `subjects` WRITE;
/*!40000 ALTER TABLE `subjects` DISABLE KEYS */;
INSERT INTO `subjects` VALUES (1,'PRJ301','Java Web Application Development',3),(2,'DBI202','Database Systems (C╞í sß╗ƒ dß╗» liß╗çu)',3),(3,'NWC204','Computer Networking (Mß║íng m├íy t├¡nh)',3),(4,'SWE201','Software Engineering (C├┤ng nghß╗ç PM)',3),(5,'PRN211','C# and .NET Framework',3);
/*!40000 ALTER TABLE `subjects` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `task_progress_reports`
--

DROP TABLE IF EXISTS `task_progress_reports`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `task_progress_reports` (
  `report_id` int NOT NULL AUTO_INCREMENT,
  `task_id` int NOT NULL,
  `reporter_id` int NOT NULL,
  `progress_percent` int DEFAULT NULL,
  `report_note` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`report_id`),
  KEY `task_id` (`task_id`),
  KEY `reporter_id` (`reporter_id`)
) ENGINE=MyISAM AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `task_progress_reports`
--

LOCK TABLES `task_progress_reports` WRITE;
/*!40000 ALTER TABLE `task_progress_reports` DISABLE KEYS */;
INSERT INTO `task_progress_reports` VALUES (1,2,3,50,'─É├ú chß║Ñm xong lß╗¢p thß╗⌐ 2, ─æiß╗âm kh├í cao, dß╗▒ kiß║┐n ho├án th├ánh ─æ├║ng hß║ín ─æß║ºu tuß║ºn sau.','2026-03-22 10:30:00'),(2,3,2,70,'Bß║ún draft ─æ├ú ─æ╞░ß╗úc review lß║ºn 1 bß╗ƒi hß╗Öi ─æß╗ông, ─æang tiß║┐n h├ánh sß╗¡a ─æß╗òi logic chuy├¬n s├óu.','2026-03-20 14:15:00'),(3,4,4,30,'Hß╗Öi tr╞░ß╗¥ng C ch╞░a x├íc nhß║¡n lß╗ïch trß╗æng, cß║ºn gß╗¡i lß║íi c├┤ng v─ân gß║Ñp trong h├┤m nay ─æß╗â th├║c ─æß║⌐y.','2026-03-21 09:00:00'),(4,5,3,100,'Ca thi diß╗àn ra an to├án, kh├┤ng c├│ sinh vi├¬n vi phß║ím quy chß║┐. ─É├ú nß╗Öp to├án bß╗Ö b├ái ni├¬m phong.','2026-05-15 18:00:00');
/*!40000 ALTER TABLE `task_progress_reports` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tasks`
--

DROP TABLE IF EXISTS `tasks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tasks` (
  `task_id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `category` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `start_date` datetime NOT NULL,
  `end_date` datetime NOT NULL,
  `assigner_id` int NOT NULL,
  `assignee_id` int NOT NULL,
  `status` enum('todo','in-progress','completed','late') COLLATE utf8mb4_unicode_ci DEFAULT 'todo',
  PRIMARY KEY (`task_id`),
  KEY `assigner_id` (`assigner_id`),
  KEY `assignee_id` (`assignee_id`)
) ENGINE=MyISAM AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tasks`
--

LOCK TABLES `tasks` WRITE;
/*!40000 ALTER TABLE `tasks` DISABLE KEYS */;
INSERT INTO `tasks` VALUES (1,'Soß║ín ─æß╗ü thi cuß╗æi kß╗│ m├┤n JAVA','Giß║úng dß║íy','Soß║ín 2 m├ú ─æß╗ü thi l├╜ thuyß║┐t v├á thß╗▒c h├ánh, chß║Ñm theo thang ─æiß╗âm 10 (Tr├ính tr├╣ng lß║╖p vß╗¢i ─æß╗ü n─âm ngo├íi).','2026-03-25 08:00:00','2026-04-15 17:00:00',1,2,'todo'),(2,'Chß║Ñm ─æiß╗âm ─æß╗ô ├ín m├┤n DB','Giß║úng dß║íy','Chß║Ñm ─æiß╗âm cho 5 lß╗¢p chuy├¬n ng├ánh ─æß╗ô ├ín c╞í sß╗ƒ dß╗» liß╗çu kß╗│ Spring 2026.','2026-03-20 08:00:00','2026-04-10 17:00:00',1,3,'in-progress'),(3,'Viß║┐t b├ái b├ío khoa hß╗ìc chuß║⌐n ISI','Nghi├¬n cß╗⌐u','Ho├án thiß╗çn bß║ún draft thiß║┐t kß║┐ phß║ºn mß╗üm ─æ├ính gi├í sinh vi├¬n dß╗▒a tr├¬n AI ─æß╗â gß╗¡i hß╗Öi ─æß╗ông x├⌐t duyß╗çt.','2026-03-01 08:00:00','2026-06-30 17:00:00',1,2,'in-progress'),(4,'Tß╗ò chß╗⌐c sß╗▒ kiß╗çn IT Open Day','H├ánh ch├¡nh','Li├¬n hß╗ç hß╗Öi tr╞░ß╗¥ng, kh├ích mß╗¥i chuy├¬n gia v├á chuß║⌐n bß╗ï b├ío gi├í teabreak.','2026-03-10 08:00:00','2026-03-20 17:00:00',1,4,'late'),(5,'Tham gia coi thi kß║┐t th├║c kß╗│','─Éo├án thß╗â','Trß╗▒c coi thi 3 ca ng├áy chß╗º nhß║¡t ng├áy 15/05/2026 tß║íi khu C.','2026-05-15 07:00:00','2026-05-15 17:00:00',1,3,'completed');
/*!40000 ALTER TABLE `tasks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `user_id` int NOT NULL AUTO_INCREMENT,
  `employee_code` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `full_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('admin','staff') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'staff',
  `status` enum('active','inactive') COLLATE utf8mb4_unicode_ci DEFAULT 'active',
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `employee_code` (`employee_code`),
  UNIQUE KEY `email` (`email`)
) ENGINE=MyISAM AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'ADMIN001','Admin IT-STU','admin@stu.edu.vn','$2b$10$MJoL91T3s3bXCFPuvc1/COq3aYV2c8d66PZJiv/JBURg7.X033jPW','admin','active'),(2,'GV001','PGS.TS Nguyß╗àn V─ân A','nguyenvana@stu.edu.vn','$2b$10$MJoL91T3s3bXCFPuvc1/COq3aYV2c8d66PZJiv/JBURg7.X033jPW','staff','active'),(3,'GV002','TS Trß║ºn Thß╗ï B','tranthib@stu.edu.vn','$2b$10$k3Q3XfHCUPkRxFZDwJGQsuMdadIOsHegltSnE/mDc.dKGsrCgkw62','staff','active'),(4,'GV003','ThS L├¬ V─ân C','levanc@stu.edu.vn','$2b$10$k3Q3XfHCUPkRxFZDwJGQsuMdadIOsHegltSnE/mDc.dKGsrCgkw62','staff','active'),(5,'NV004','Phß║ím Thß╗ï D (Gi├ío vß╗Ñ)','phamthid@stu.edu.vn','$2b$10$k3Q3XfHCUPkRxFZDwJGQsuMdadIOsHegltSnE/mDc.dKGsrCgkw62','staff','inactive');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-03-22 20:23:39
DROP TABLE IF EXISTS `reminders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reminders` (
  `reminder_id` int NOT NULL AUTO_INCREMENT,
  `task_id` int NOT NULL,
  `user_id` int NOT NULL,
  `message` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `reminder_time` datetime NOT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`reminder_id`),
  KEY `task_id` (`task_id`),
  KEY `user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

-- ======================================================
-- KẾT THÚC PHẦN CHÈN
-- ======================================================

/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-03-22 20:23:39
