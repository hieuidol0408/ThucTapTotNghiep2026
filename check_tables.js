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
    console.log('--- DB DIAGNOSTICS ---');
    console.log('TABLES:', JSON.stringify(tables.map(t => Object.values(t)[0])));

    const counts = {};
    const tableNames = ['Users', 'Subjects', 'Subject_Assignments', 'Tasks'];
    for (const name of tableNames) {
        try {
            const [rows] = await db.execute(`SELECT COUNT(*) as count FROM ${name}`);
            counts[name] = rows[0].count;
        } catch (e) {
            counts[name] = 'ERROR: ' + e.message;
        }
    }
    console.log('ROW COUNTS:', JSON.stringify(counts, null, 2));

    if (counts['Users'] > 0) {
        const [users] = await db.execute('SELECT user_id, employee_code, full_name FROM Users LIMIT 5');
        console.log('SAMPLED USERS:', JSON.stringify(users, null, 2));
    }
    await db.end();
};
check();
