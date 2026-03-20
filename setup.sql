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

-- Dữ liệu mẫu (Sample data) cho chức năng Quản lý danh sách nhân sự
-- Mật khẩu mặc định là: admin123 (dùng chung mã băm bcrypt với admin)
INSERT IGNORE INTO users (username, password, full_name, role) VALUES 
('nguyenvana', '$2b$10$k3Q3XfHCUPkRxFZDwJGQsuMdadIOsHegltSnE/mDc.dKGsrCgkw62', 'Nguyễn Văn A', 'staff'),
('tranthib', '$2b$10$k3Q3XfHCUPkRxFZDwJGQsuMdadIOsHegltSnE/mDc.dKGsrCgkw62', 'Trần Thị B', 'staff'),
('levanc', '$2b$10$k3Q3XfHCUPkRxFZDwJGQsuMdadIOsHegltSnE/mDc.dKGsrCgkw62', 'Lê Văn C', 'staff'),
('phamthid', '$2b$10$k3Q3XfHCUPkRxFZDwJGQsuMdadIOsHegltSnE/mDc.dKGsrCgkw62', 'Phạm Thị D', 'staff'),
('hoange', '$2b$10$k3Q3XfHCUPkRxFZDwJGQsuMdadIOsHegltSnE/mDc.dKGsrCgkw62', 'Hoàng Văn E', 'staff');
