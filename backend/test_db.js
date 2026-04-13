const mysql = require('mysql2/promise');
require('dotenv').config();

async function testDb() {
    try {
        const connection = await mysql.createConnection({
            host: '127.0.0.1',
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: process.env.DB_NAME,
            port: process.env.DB_PORT
        });
        const [res] = await connection.execute(
            'INSERT INTO NhanSu (MaNS, HoTen, NgaySinh, Email, MatKhau, Quyen) VALUES (?, ?, ?, ?, ?, ?)', 
            ['TEST01', 'Test User', '1990-01-01', 'test@test.com', '123', 'admin']
        );
        console.log("Insert result:", res);
        
        const [rows] = await connection.query('SELECT * FROM nhansu');
        console.log("Rows:", rows.length);
        
        process.exit(0);
    } catch (e) {
        console.error("ERROR:", e);
        process.exit(1);
    }
}
testDb();
