const mysql = require('mysql2/promise');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '.env') });

async function setup() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            port: parseInt(process.env.DB_PORT) || 3306
        });

        await connection.query('CREATE DATABASE IF NOT EXISTS qlcongvieckhoa');
        await connection.query('USE qlcongvieckhoa');
        
        await connection.query(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(50) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                full_name VARCHAR(100),
                role ENUM('admin', 'staff') DEFAULT 'staff',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Insert admin user
        const bcrypt = require('bcryptjs');
        const hash = await bcrypt.hash('admin123', 10);
        await connection.query('DELETE FROM users WHERE username = "admin"');
        await connection.query('INSERT INTO users (username, password, full_name, role) VALUES (?, ?, ?, ?)', 
            ['admin', hash, 'Admin IT-STU', 'admin']);

        console.log('Database and Table setup complete via Node!');
        await connection.end();
    } catch (err) {
        console.error('Setup failed:', err.message);
    }
}

setup();
