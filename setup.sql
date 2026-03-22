-- SQL Setup for QLCongViecKhoa (Updated Schema based on ER Diagram)
SET NAMES 'utf8mb4';
CREATE DATABASE IF NOT EXISTS qlcongvieckhoa CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE qlcongvieckhoa;

-- ================================================
-- Table: Users
-- ================================================
CREATE TABLE IF NOT EXISTS Users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    employee_code VARCHAR(20) NOT NULL UNIQUE,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'staff') NOT NULL DEFAULT 'staff',
    status ENUM('active', 'inactive') DEFAULT 'active'
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Sample admin user (password: admin123, hash generated using bcryptjs)
INSERT IGNORE INTO Users (employee_code, full_name, email, password_hash, role, status) 
VALUES ('ADMIN001', 'Admin IT-STU', 'admin@stu.edu.vn', '$2b$10$k3Q3XfHCUPkRxFZDwJGQsuMdadIOsHegltSnE/mDc.dKGsrCgkw62', 'admin', 'active');

-- ================================================
-- Table: Subjects
-- ================================================
CREATE TABLE IF NOT EXISTS Subjects (
    subject_id INT AUTO_INCREMENT PRIMARY KEY,
    subject_code VARCHAR(20) NOT NULL UNIQUE,
    subject_name VARCHAR(150) NOT NULL,
    credits INT NOT NULL DEFAULT 3
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ================================================
-- Table: Subject_Assignments
-- ================================================
CREATE TABLE IF NOT EXISTS Subject_Assignments (
    assignment_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    subject_id INT NOT NULL,
    teaching_role ENUM('head', 'lecturer') NOT NULL DEFAULT 'lecturer',
    semester VARCHAR(50) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES Subjects(subject_id) ON DELETE CASCADE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ================================================
-- Table: Tasks
-- ================================================
CREATE TABLE IF NOT EXISTS Tasks (
    task_id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT,
    start_date DATETIME NOT NULL,
    end_date DATETIME NOT NULL,
    assigner_id INT NOT NULL,
    assignee_id INT NOT NULL,
    status ENUM('todo', 'in-progress', 'completed', 'late') DEFAULT 'todo',
    FOREIGN KEY (assigner_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (assignee_id) REFERENCES Users(user_id) ON DELETE CASCADE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ================================================
-- Table: Task_Progress_Reports
-- ================================================
CREATE TABLE IF NOT EXISTS Task_Progress_Reports (
    report_id INT AUTO_INCREMENT PRIMARY KEY,
    task_id INT NOT NULL,
    reporter_id INT NOT NULL,
    progress_percent INT,
    report_note TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES Tasks(task_id) ON DELETE CASCADE,
    FOREIGN KEY (reporter_id) REFERENCES Users(user_id) ON DELETE CASCADE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
