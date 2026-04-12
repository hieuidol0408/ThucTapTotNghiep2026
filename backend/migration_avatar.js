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
        console.log('Adding HinhAnh column to NhanSu table...');
        await connection.execute('ALTER TABLE NhanSu ADD COLUMN HinhAnh VARCHAR(255) DEFAULT NULL');
        console.log('Success!');
    } catch (error) {
        if (error.code === 'ER_DUP_COLUMN_NAME') {
            console.log('Column HinhAnh already exists.');
        } else {
            console.error('Migration error:', error);
        }
    } finally {
        await connection.end();
    }
}

migrate();
