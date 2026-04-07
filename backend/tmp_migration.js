const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });

async function migrate() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT,
    });

    try {
        console.log('Migrating database...');
        await connection.execute('ALTER TABLE BaoCaoTienDo ADD COLUMN PhanTramHoanThanh INT DEFAULT 0 AFTER NoiDungBaoCao');
        console.log('Migration successful: Added PhanTramHoanThanh to BaoCaoTienDo');
    } catch (err) {
        if (err.code === 'ER_DUP_COLUMN_NAME') {
            console.log('Column PhanTramHoanThanh already exists.');
        } else {
            console.error('Migration failed:', err);
        }
    } finally {
        await connection.end();
    }
}

migrate();
