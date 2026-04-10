const mysql = require('mysql2/promise');

async function main() {
  const db = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'qlkhoa',
    port: 3306,
  });

  const sql = `
    INSERT INTO NhanSu (MaNS, HoTen, NgaySinh, Email, MatKhau, Quyen)
    VALUES (?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      HoTen = VALUES(HoTen),
      NgaySinh = VALUES(NgaySinh),
      Email = VALUES(Email),
      MatKhau = VALUES(MatKhau),
      Quyen = VALUES(Quyen)
  `;

  await db.execute(sql, [
    'ADMIN0001',
    'Administrator',
    '1990-01-01',
    'admin@qlkhoa.local',
    '$2b$10$H.KfbEegs2ZHlDJNe57eJuVgIiN4oKpBeiHiPyiaiXD.3XsxRixWm',
    'admin',
  ]);

  const [rows] = await db.execute(
    'SELECT MaNS, HoTen, Email, Quyen FROM NhanSu WHERE MaNS = ?',
    ['ADMIN0001']
  );

  console.log(JSON.stringify(rows, null, 2));
  await db.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
