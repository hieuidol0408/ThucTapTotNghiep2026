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

-- ================================================
-- Bảng Môn học (subjects)
-- ================================================
CREATE TABLE IF NOT EXISTS subjects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    subject_code VARCHAR(20) NOT NULL UNIQUE,
    subject_name VARCHAR(150) NOT NULL,
    credits INT DEFAULT 3,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Dữ liệu mẫu môn học
INSERT IGNORE INTO subjects (subject_code, subject_name, credits) VALUES
('CNTT101', 'Lập trình căn bản', 3),
('CNTT201', 'Cơ sở dữ liệu', 3),
('CNTT301', 'Lập trình Web', 3),
('CNTT401', 'Trí tuệ nhân tạo', 3),
('CNTT501', 'An toàn thông tin', 3),
('CNTT601', 'Phát triển ứng dụng di động', 3),
('CNTT701', 'Mạng máy tính', 3),
('CNTT801', 'Kiến trúc máy tính', 3);

-- ================================================
-- Bảng Phân công (assignments)
-- ================================================
CREATE TABLE IF NOT EXISTS assignments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    subject_id INT NOT NULL,
    semester VARCHAR(50) NOT NULL,
    note TEXT,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ================================================
-- Bảng Công việc (tasks)
-- ================================================
CREATE TABLE IF NOT EXISTS tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status ENUM('todo', 'completed', 'late') DEFAULT 'todo',
    assigned_to INT NOT NULL,
    due_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE CASCADE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Dữ liệu mẫu cho bảng công việc
INSERT IGNORE INTO tasks (title, description, status, assigned_to, due_date) 
VALUES ('Rà soát cơ sở dữ liệu học kỳ 1', 'Kiểm tra xem csdl có bị sự cố gì không?', 'todo', 1, '2026-10-31');
