const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });

const seed = async () => {
    try {
        const db = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: process.env.DB_NAME,
            port: process.env.DB_PORT,
            charset: 'utf8mb4'
        });

        console.log('Connected to DB. Fixing character sets...');

        // 0. Fix Database and existing tables to support Vietnamese
        await db.execute('ALTER DATABASE qlcongvieckhoa CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
        await db.execute('ALTER TABLE users CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
        
        // 1. Drop and Recreate tasks table with utf8mb4
        await db.execute('DROP TABLE IF EXISTS tasks');
        await db.execute(`
            CREATE TABLE tasks (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                description TEXT,
                status ENUM('todo', 'in-progress', 'completed', 'late') DEFAULT 'todo',
                assigned_to INT,
                due_date DATE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL
            ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
        `);

        console.log('Tables fixed. Adding users...');

        // 2. Add Users
        const password = await bcrypt.hash('123456', 10);
        const users = [
            ['nva', password, 'Nguyễn Văn An', 'staff'],
            ['ltb', password, 'Lê Thị Bình', 'staff'],
            ['trc', password, 'Trần Văn Cường', 'staff'],
            ['pmd', password, 'Phạm Minh Đức', 'staff'],
            ['hth', password, 'Hoàng Thu Hà', 'staff'],
            ['vtl', password, 'Vũ Tiến Lộc', 'staff'],
            ['dkp', password, 'Đặng Kim Phượng', 'staff'],
            ['qtt', password, 'Quách Thành Tâm', 'staff'],
            ['lxh', password, 'Lý Xuân Hòa', 'staff'],
            ['bnm', password, 'Bùi Ngọc Mai', 'staff']
        ];

        for (const u of users) {
          try {
              await db.execute('INSERT INTO users (username, password, full_name, role) VALUES (?, ?, ?, ?)', u);
              console.log(`Added user: ${u[0]}`);
          } catch (e) { 
              // console.log(`User ${u[0]} exists.`);
          }
        }

        // 3. Add Tasks
        const [userRows] = await db.execute('SELECT id FROM users WHERE role = "staff"');
        const userIds = userRows.map(u => u.id);

        if (userIds.length > 0) {
            const taskTitles = [
                'Soạn thảo văn bản hành chính', 'Lập kế hoạch tuần', 'Họp hội đồng khoa',
                'Kiểm tra thiết bị phòng máy', 'Cập nhật website khoa', 'Chấm bài thi giữa kỳ',
                'Tổ chức hội thảo nghiên cứu', 'Quản lý hồ sơ sinh viên', 'Chuẩn bị tài liệu giảng dạy',
                'Vệ sinh phòng thực hành', 'Hỗ trợ sinh viên đăng ký học', 'Lên danh sách thi tốt nghiệp'
            ];

            for (let i = 1; i <= 25; i++) {
                const title = taskTitles[i % taskTitles.length] + ' #' + i;
                const status = ['todo', 'in-progress', 'completed', 'late'][Math.floor(Math.random() * 4)];
                const userId = userIds[Math.floor(Math.random() * userIds.length)];
                const dueDate = new Date();
                dueDate.setDate(dueDate.getDate() + (Math.floor(Math.random() * 20) - 5)); 
                
                await db.execute('INSERT INTO tasks (title, status, assigned_to, due_date) VALUES (?, ?, ?, ?)', [
                    title, status, userId, dueDate
                ]);
            }
            console.log('Added 25 sample tasks with Vietnamese text.');
        }

        console.log('Seeding completed successfully!');
        await db.end();
    } catch (err) {
        console.error('Seeding ERROR:', err.message);
    }
};
seed();
