const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'backend', '.env') });

async function testConn() {
    console.log('Testing with USER:', process.env.DB_USER);
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: process.env.DB_NAME
        });
        console.log('Connection successful!');
        await connection.end();
    } catch (err) {
        console.error('Connection failed:', err.message);
    }
}

testConn();
