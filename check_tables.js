const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join('c:/Users/HP/OneDrive/Documents/ThucTapTotNghiep/Code/backend', '.env') });

const check = async () => {
    const db = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT
    });
    const [tables] = await db.execute('SHOW TABLES');
    console.log('TABLES:', JSON.stringify(tables));
    await db.end();
};
check();
