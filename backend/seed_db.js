const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

dotenv.config({ path: path.join(__dirname, '.env') });

const seed = async () => {
    try {
        const db = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: process.env.DB_NAME,
            port: process.env.DB_PORT,
            multipleStatements: true, // Cho phép dán nhiều câu lệnh SQL script
            charset: 'utf8mb4'
        });

        console.log('Connected to DB. Running DB Schema rewrite...');

        // Tắt strict foreign keys khi xóa
        await db.execute('SET FOREIGN_KEY_CHECKS = 0');
        
        // Cố gắng xóa các bảng cũ tiếng Anh (nếu có)
        const oldTables = ['Task_Progress_Reports', 'Subject_Assignments', 'Tasks', 'Subjects', 'Users', 'tasks', 'users'];
        for (let tb of oldTables) {
            await db.execute(`DROP TABLE IF EXISTS ${tb}`);
        }

        // Xóa bảng mới (để tạo lại từ đầu nếu cần)
        const newTables = ['BaoCaoTienDo', 'PhanCongCongViec', 'TKB', 'CongViec', 'MonHoc', 'NhanSu'];
        for (let tb of newTables) {
            await db.execute(`DROP TABLE IF EXISTS ${tb}`);
        }

        // Đọc nội dung file database.sql và thực thi
        const sqlSchema = fs.readFileSync(path.join(__dirname, 'database.sql'), 'utf-8');
        await db.query(sqlSchema);
        console.log('Database Schema executed.');

        await db.execute('SET FOREIGN_KEY_CHECKS = 1');

        console.log('Tables created. Adding NhanSu data...');

        // 1. Thêm Nhân Sự (NhanSu)
        const password = await bcrypt.hash('123456', 10);
        const nhansuData = [
            ['AD001', 'Quản Trị Viên', '1980-01-01', 'admin@khoa.edu.vn', password, 'admin'],
            ['GV001', 'Nguyễn Văn An', '1990-05-12', 'nva@khoa.edu.vn', password, 'staff'],
            ['GV002', 'Lê Thị Bình', '1992-08-20', 'ltb@khoa.edu.vn', password, 'staff'],
            ['GV003', 'Trần Văn Cường', '1985-02-15', 'tvc@khoa.edu.vn', password, 'staff'],
            ['GV004', 'Phạm Minh Đức', '1995-12-05', 'pmd@khoa.edu.vn', password, 'staff']
        ];

        for (const u of nhansuData) {
            await db.execute(
                'INSERT INTO NhanSu (MaNS, HoTen, NgaySinh, Email, MatKhau, Quyen) VALUES (?, ?, ?, ?, ?, ?)', 
                u
            );
        }

        console.log('Adding MonHoc data...');
        // 2. Thêm Môn học (MonHoc)
        const monhocData = [
            ['IT001', 'Nhập môn Lập trình', 3],
            ['IT002', 'Cấu trúc dữ liệu và giải thuật', 4],
            ['IT003', 'Hệ quản trị CSDL', 3],
            ['IT004', 'Mạng máy tính', 3]
        ];
        
        for (const m of monhocData) {
            await db.execute(
                'INSERT INTO MonHoc (MaMH, TenMH, SoTinChi) VALUES (?, ?, ?)',
                m
            );
        }

        console.log('Adding CongViec data...');
        // 3. Thêm Công Việc (CongViec)
        const congviecData = [
            ['Soạn thảo văn bản hành chính', 'Cần văn bản báo cáo cho hội đồng', '2026-04-01 08:00:00', '2026-04-10 17:00:00'],
            ['Lập kế hoạch tuần', 'Lên timeline lịch thi', '2026-04-05 08:00:00', '2026-04-12 17:00:00'],
            ['Chấm bài thi giữa kỳ', 'Môn IT001 khoảng 500 bài', '2026-04-06 08:00:00', '2026-04-15 17:00:00']
        ];
        
        for (const cv of congviecData) {
            await db.execute(
                'INSERT INTO CongViec (TenCV, MoTa, NgayBatDau, NgayKetThuc) VALUES (?, ?, ?, ?)',
                cv
            );
        }

        // 4. Thêm TKB (Phân công bộ môn)
        await db.execute("INSERT INTO TKB (MaNS, MaMH, NgayBatDau, NgayKetThuc, Ca, Phong, Thu) VALUES ('GV001', 'IT001', '2026-03-01', '2026-06-30', 1, 'A1-102', 2)");
        await db.execute("INSERT INTO TKB (MaNS, MaMH, NgayBatDau, NgayKetThuc, Ca, Phong, Thu) VALUES ('GV002', 'IT002', '2026-03-01', '2026-06-30', 3, 'A2-205', 4)");

        // 5. Thêm Phân công công việc
        // Từ CongViec list lấy ID 1, 2, 3
        await db.execute("INSERT INTO PhanCongCongViec (MaNS, MaCV, NgayPhanCong) VALUES ('GV001', 1, '2026-04-05')");
        await db.execute("INSERT INTO PhanCongCongViec (MaNS, MaCV, NgayPhanCong) VALUES ('GV002', 2, '2026-04-06')");
        await db.execute("INSERT INTO PhanCongCongViec (MaNS, MaCV, NgayPhanCong) VALUES ('GV003', 3, '2026-04-07')");

        // 6. Thêm Báo cáo tiến độ
        await db.execute("INSERT INTO BaoCaoTienDo (MaNS, MaCV, NoiDungBaoCao, NgayGui) VALUES ('GV001', 1, 'Đã viết xong sườn báo cáo', '2026-04-06 09:30:00')");

        console.log('Seeding completed successfully!');
        await db.end();
    } catch (err) {
        console.error('Seeding ERROR:', err.message);
    }
};
seed();
