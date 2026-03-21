const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');
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

// Middleware to verify Admin Role
const isAdmin = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ message: 'Không có token truy cập.' });

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) return res.status(403).json({ message: 'Token không hợp lệ.' });

        const user = decoded.user || decoded;
        if (!user || !user.role || user.role.toLowerCase() !== 'admin') {
            return res.status(403).json({ message: 'Chỉ Admin mới có quyền truy cập.' });
        }

        req.user = user;
        next();
    });
};

// GET /api/subjects - Lấy danh sách môn học
router.get('/', isAdmin, async (req, res) => {
    let db;
    try {
        db = await getDb();
        const [subjects] = await db.execute(
            'SELECT id, subject_code, subject_name, credits FROM subjects ORDER BY subject_code ASC'
        );
        res.json(subjects);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi server khi lấy danh sách môn học.' });
    } finally {
        if (db) await db.end();
    }
});

// GET /api/subjects/assignments - Lấy danh sách phân công (PHẢI ĐẶT TRƯỚC /:id)
router.get('/assignments', isAdmin, async (req, res) => {
    let db;
    try {
        db = await getDb();
        const [rows] = await db.execute(`
            SELECT 
                a.id,
                u.full_name AS lecturer_name,
                u.username AS lecturer_username,
                s.subject_code,
                s.subject_name,
                s.credits,
                a.semester,
                a.note,
                a.assigned_at
            FROM assignments a
            JOIN users u ON a.user_id = u.id
            JOIN subjects s ON a.subject_id = s.id
            ORDER BY a.assigned_at DESC
        `);
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi server khi lấy danh sách phân công.' });
    } finally {
        if (db) await db.end();
    }
});

// POST /api/subjects/assignments - Tạo phân công mới
router.post('/assignments', isAdmin, async (req, res) => {
    let db;
    try {
        const { user_id, subject_id, semester, note } = req.body;

        if (!user_id || !subject_id || !semester) {
            return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin phân công.' });
        }

        db = await getDb();

        // Kiểm tra trùng phân công trong cùng học kỳ
        const [existing] = await db.execute(
            'SELECT id FROM assignments WHERE user_id = ? AND subject_id = ? AND semester = ?',
            [user_id, subject_id, semester]
        );
        if (existing.length > 0) {
            return res.status(400).json({ message: 'Giảng viên này đã được phân công môn học này trong học kỳ đã chọn.' });
        }

        await db.execute(
            'INSERT INTO assignments (user_id, subject_id, semester, note) VALUES (?, ?, ?, ?)',
            [user_id, subject_id, semester, note || null]
        );

        res.status(201).json({ message: 'Phân công môn học thành công!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi server khi tạo phân công.' });
    } finally {
        if (db) await db.end();
    }
});

// DELETE /api/subjects/assignments/:id - Xóa phân công
router.delete('/assignments/:id', isAdmin, async (req, res) => {
    let db;
    try {
        const { id } = req.params;
        db = await getDb();
        await db.execute('DELETE FROM assignments WHERE id = ?', [id]);
        res.json({ message: 'Xóa phân công thành công.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi server khi xóa phân công.' });
    } finally {
        if (db) await db.end();
    }
});

module.exports = router;
