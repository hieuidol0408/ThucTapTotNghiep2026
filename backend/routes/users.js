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
        port: process.env.DB_PORT
    });
};

// Middleware to verify Admin Role
const isAdmin = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ message: 'Không có token truy cập.' });

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: 'Token không hợp lệ.' });
        if (user.role !== 'admin') return res.status(403).json({ message: 'Chỉ Admin mới có quyền truy cập.' });
        req.user = user;
        next();
    });
};

// GET / - List users (with optional search)
router.get('/', isAdmin, async (req, res) => {
    let db;
    try {
        const { search } = req.query;
        db = await getDb();
        
        let query = 'SELECT id, username, full_name, role, created_at FROM users';
        let params = [];

        if (search) {
            query += ' WHERE username LIKE ? OR full_name LIKE ?';
            params = [`%${search}%`, `%${search}%`];
        }

        const [users] = await db.execute(query, params);
        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi server khi lấy danh sách nhân sự.' });
    } finally {
        if (db) await db.end();
    }
});

// POST / - Add new user
router.post('/', isAdmin, async (req, res) => {
    let db;
    try {
        const { username, password, full_name, role } = req.body;
        
        if (!username || !password || !full_name) {
            return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin.' });
        }

        db = await getDb();

        // Check if username exists
        const [existing] = await db.execute('SELECT id FROM users WHERE username = ?', [username]);
        if (existing.length > 0) {
            return res.status(400).json({ message: 'Tên đăng nhập đã tồn tại.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await db.execute(
            'INSERT INTO users (username, password, full_name, role) VALUES (?, ?, ?, ?)',
            [username, hashedPassword, full_name, role || 'staff']
        );

        res.status(201).json({ message: 'Thêm nhân sự thành công.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi server khi thêm nhân sự.' });
    } finally {
        if (db) await db.end();
    }
});

// PUT /:id - Update user
router.put('/:id', isAdmin, async (req, res) => {
    let db;
    try {
        const { id } = req.params;
        const { full_name, role, password } = req.body;
        
        db = await getDb();

        let query = 'UPDATE users SET full_name = ?, role = ?';
        let params = [full_name, role];

        if (password && password.length > 0) {
            const hashedPassword = await bcrypt.hash(password, 10);
            query += ', password = ?';
            params.push(hashedPassword);
        }

        query += ' WHERE id = ?';
        params.push(id);

        await db.execute(query, params);
        res.json({ message: 'Cập nhật nhân sự thành công.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi server khi cập nhật nhân sự.' });
    } finally {
        if (db) await db.end();
    }
});

// DELETE /:id - Delete user
router.delete('/:id', isAdmin, async (req, res) => {
    let db;
    try {
        const { id } = req.params;
        db = await getDb();

        // Prevent deleting yourself (optional but safe)
        if (parseInt(id) === req.user.id) {
            return res.status(400).json({ message: 'Bạn không thể tự xóa tài khoản của mình.' });
        }

        await db.execute('DELETE FROM users WHERE id = ?', [id]);
        res.json({ message: 'Xóa nhân sự thành công.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi server khi xóa nhân sự.' });
    } finally {
        if (db) await db.end();
    }
});

module.exports = router;
