const mysql = require('mysql2/promise');
require('dotenv').config();

async function createDb() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            port: process.env.DB_PORT
        });
        await connection.query('CREATE DATABASE IF NOT EXISTS qlkhoa;');
        console.log("Database qlkhoa created.");
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
createDb();
