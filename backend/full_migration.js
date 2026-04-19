const mysql = require('mysql2/promise');
require('dotenv').config();

async function migrate() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT,
        ssl: {
            rejectUnauthorized: false
        }
    });

    try {
        console.log('Running comprehensive migration...');

        // 1. Add HinhAnh to NhanSu
        try {
            await connection.execute('ALTER TABLE NhanSu ADD COLUMN HinhAnh VARCHAR(255) DEFAULT NULL');
            console.log('Added HinhAnh to NhanSu');
        } catch (e) {
            if (e.code === 'ER_DUP_FIELDNAME' || e.code === 'ER_DUP_COLUMN_NAME') console.log('HinhAnh already exists');
            else throw e;
        }

        // 2. Add TrangThai to NhanSu
        try {
            await connection.execute("ALTER TABLE NhanSu ADD COLUMN TrangThai VARCHAR(20) DEFAULT 'active'");
            console.log('Added TrangThai to NhanSu');
        } catch (e) {
            if (e.code === 'ER_DUP_FIELDNAME' || e.code === 'ER_DUP_COLUMN_NAME') console.log('TrangThai already exists');
            else throw e;
        }

        // 3. Create reminders table
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS reminders (
                reminder_id INT AUTO_INCREMENT PRIMARY KEY,
                user_id CHAR(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
                message TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
                reminder_time DATETIME NOT NULL,
                is_active TINYINT(1) DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES NhanSu(MaNS) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        console.log('Verified reminders table');

        console.log('Migration completed successfully!');
    } catch (error) {
        console.error('Migration error:', error);
    } finally {
        await connection.end();
    }
}

migrate();
