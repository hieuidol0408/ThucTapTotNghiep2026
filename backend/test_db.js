const mysql = require('mysql2/promise');
const path = require('path');
const dotenv = require('dotenv');

// Load .env relative to this script's location
dotenv.config({ path: path.join(__dirname, '.env') });

async function testConn() {
    console.log('Testing with USER:', process.env.DB_USER);
    console.log('Testing with DB_NAME:', process.env.DB_NAME);
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
