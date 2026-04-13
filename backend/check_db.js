const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkDb() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: process.env.DB_NAME,
            port: process.env.DB_PORT
        });
        const [tables] = await connection.query('SHOW TABLES');
        console.log("Tables:");
        for (const row of tables) {
            const tableName = Object.values(row)[0];
            const [countRes] = await connection.query(`SELECT COUNT(*) as cnt FROM \`${tableName}\``);
            console.log(`- ${tableName}: ${countRes[0].cnt} rows`);
        }
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
checkDb();
