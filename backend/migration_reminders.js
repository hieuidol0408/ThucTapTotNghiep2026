const mysql = require('mysql2/promise');
require('dotenv').config();

async function migrate() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT
    });

    try {
        console.log('Creating reminders table...');
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS reminders (
                reminder_id INT AUTO_INCREMENT PRIMARY KEY,
                task_id INT,
                user_id CHAR(10) NOT NULL,
                message TEXT NOT NULL,
                reminder_time DATETIME NOT NULL,
                is_active TINYINT(1) DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES NhanSu(MaNS) ON DELETE CASCADE
            )
        `);
        console.log('Success!');
    } catch (error) {
        console.error('Migration error:', error);
    } finally {
        await connection.end();
    }
}

migrate();
