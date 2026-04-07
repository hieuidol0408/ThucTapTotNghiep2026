const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Database Connection Helper
const getDb = async () => {
    return await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT,
        charset: 'utf8mb4'
    });
};

const isAdmin = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ message: 'Không có token truy cập.' });

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) return res.status(403).json({ message: 'Token không hợp lệ.' });
        
        const user = decoded.user || decoded;
        if (!user || user.role !== 'admin') {
            return res.status(403).json({ message: 'Chỉ Admin mới có quyền truy cập.' });
        }
        
        req.user = user;
        next();
    });
};

// GET /stats
router.get('/stats', isAdmin, async (req, res) => {
    let db;
    try {
        db = await getDb();
        const [nsCount] = await db.execute('SELECT COUNT(*) as count FROM NhanSu');
        
        let cvCount = [{ count: 0 }];
        try {
            [cvCount] = await db.execute('SELECT COUNT(*) as count FROM CongViec');
        } catch (e) {}

        res.json({
            totalUsers: nsCount[0].count,
            totalTasks: cvCount[0].count,
            completedTasks: 0, 
            lateTasks: 0,
            percentComplete: 0
        });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server khi lấy thống kê.' });
    } finally {
        if (db) await db.end();
    }
});

// GET / - List users
router.get('/', isAdmin, async (req, res) => {
    let db;
    try {
        const { search } = req.query;
        db = await getDb();
        
        // Cần map dữ liệu giống API cũ để Frontend khỏi vỡ nát hoặc update frontend
        let query = 'SELECT MaNS as user_id, MaNS as employee_code, Email as email, HoTen as full_name, Quyen as role, NgaySinh FROM NhanSu';
        let params = [];

        if (search) {
            query += ' WHERE MaNS LIKE ? OR HoTen LIKE ? OR Email LIKE ?';
            params = [`%${search}%`, `%${search}%`, `%${search}%`];
        }

        const [users] = await db.execute(query, params);
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server.' });
    } finally {
        if (db) await db.end();
    }
});

// POST / - Add new user
router.post('/', isAdmin, async (req, res) => {
    let db;
    try {
        // Ánh xạ lại từ form frontend
        const { employee_code, email, password, full_name, role } = req.body;
        const MaNS = employee_code;
        const HoTen = full_name;
        const Email = email;
        const Quyen = role;
        const MatKhau = password;
        
        if (!MaNS || !Email || !MatKhau || !HoTen) {
            return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin.' });
        }

        db = await getDb();

        const [existing] = await db.execute('SELECT MaNS FROM NhanSu WHERE MaNS = ? OR Email = ?', [MaNS, Email]);
        if (existing.length > 0) {
            return res.status(400).json({ message: 'Mã nhân sự hoặc Email đã tồn tại.' });
        }

        const hashedPassword = await bcrypt.hash(MatKhau, 10);
        // Default NgaySinh if frontend doesn't send it since it's required (NOT NULL)
        const d = new Date();
        d.setFullYear(d.getFullYear() - 25);
        
        await db.execute(
            'INSERT INTO NhanSu (MaNS, HoTen, Email, MatKhau, Quyen, NgaySinh) VALUES (?, ?, ?, ?, ?, ?)',
            [MaNS, HoTen, Email, hashedPassword, Quyen || 'staff', d]
        );

        res.status(201).json({ message: 'Thêm nhân sự thành công.' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server.' });
    } finally {
        if (db) await db.end();
    }
});

// PUT /:id - Update user
router.put('/:id', isAdmin, async (req, res) => {
    let db;
    try {
        const { id } = req.params; // MaNS
        const { full_name, role, email, password } = req.body;
        
        db = await getDb();

        let query = 'UPDATE NhanSu SET HoTen = ?, Quyen = ?, Email = ?';
        let params = [full_name, role, email];

        if (password && password.length > 0) {
            const hashedPassword = await bcrypt.hash(password, 10);
            query += ', MatKhau = ?';
            params.push(hashedPassword);
        }

        query += ' WHERE MaNS = ?';
        params.push(id);

        await db.execute(query, params);
        res.json({ message: 'Cập nhật nhân sự thành công.' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server.' });
    } finally {
        if (db) await db.end();
    }
});

// DELETE /:id
router.delete('/:id', isAdmin, async (req, res) => {
    res.status(405).json({ message: 'Vô hiệu hóa xóa.' });
});

module.exports = router;
