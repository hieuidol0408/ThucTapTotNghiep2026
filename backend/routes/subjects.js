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
            'SELECT subject_id as id, subject_code, subject_name, credits FROM Subjects ORDER BY subject_code ASC'
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
        let query = `
            SELECT 
                a.assignment_id as id,
                u.full_name AS lecturer_name,
                u.employee_code AS lecturer_username,
                s.subject_code,
                s.subject_name,
                s.credits,
                a.semester,
                a.teaching_role
            FROM Subject_Assignments a
            JOIN Users u ON a.user_id = u.user_id
            JOIN Subjects s ON a.subject_id = s.subject_id
        `;
        let params = [];
        
        if (req.user.role === 'staff') {
            query += ` WHERE a.user_id = ?`;
            params.push(req.user.id);
        }

        query += ` ORDER BY a.assignment_id DESC`;
        
        const [rows] = await db.execute(query, params);
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
        const { user_id, subject_id, teaching_role, semester, note } = req.body;

        if (!user_id || !subject_id || !teaching_role || !semester) {
            return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin phân công (Giảng viên, Môn học, Vai trò, Học kỳ).' });
        }

        db = await getDb();

        // Kiểm tra trùng phân công trong cùng học kỳ
        const [existing] = await db.execute(
            'SELECT assignment_id FROM Subject_Assignments WHERE user_id = ? AND subject_id = ? AND semester = ?',
            [user_id, subject_id, semester]
        );
        if (existing.length > 0) {
            return res.status(400).json({ message: 'Giảng viên này đã được phân công môn học này trong học kỳ đã chọn.' });
        }

        await db.execute(
            'INSERT INTO Subject_Assignments (user_id, subject_id, teaching_role, semester) VALUES (?, ?, ?, ?)',
            [user_id, subject_id, teaching_role, semester]
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
        await db.execute('DELETE FROM Subject_Assignments WHERE assignment_id = ?', [id]);
        res.json({ message: 'Xóa phân công thành công.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi server khi xóa phân công.' });
    } finally {
        if (db) await db.end();
    }
});

module.exports = router;
