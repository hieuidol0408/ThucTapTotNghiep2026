-- SQL Setup for QLCongViecKhoa
SET NAMES 'utf8mb4';
CREATE DATABASE IF NOT EXISTS qlcongvieckhoa CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE qlcongvieckhoa;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    role ENUM('admin', 'staff') DEFAULT 'staff',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Sample admin user (username: admin, password: admin123)
-- The password hash is generated using bcryptjs.
DELETE FROM users WHERE username = 'admin';
INSERT INTO users (username, password, full_name, role) 
VALUES ('admin', '$2b$10$k3Q3XfHCUPkRxFZDwJGQsuMdadIOsHegltSnE/mDc.dKGsrCgkw62', 'Admin IT-STU', 'admin');
