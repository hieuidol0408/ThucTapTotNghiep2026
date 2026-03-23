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

// Middleware to verify Token
const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ message: 'Không có token truy cập.' });

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) return res.status(403).json({ message: 'Token không hợp lệ.' });
        req.user = decoded.user || decoded;
        next();
    });
};

// Middleware to verify Admin Role (Requires verifyToken first)
const isAdmin = (req, res, next) => {
    if (!req.user || !req.user.role || req.user.role.toLowerCase() !== 'admin') {
        return res.status(403).json({ message: 'Chỉ Admin mới có quyền thực hiện hành động này.' });
    }
    next();
};

// --- SUBJECT ASSIGNMENT ROUTES (Place specific /assignments BEFORE generic /:id) ---

// GET /api/subjects/assignments - Lấy danh sách phân công
router.get('/assignments', verifyToken, async (req, res) => {
    let db;
    console.log('DEBUG: Received GET /assignments request');
    try {
        db = await getDb();
        console.log('DEBUG: DB connected for assignments');
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
        
        // Staff only see their own assignments
        if (req.user.role && req.user.role.toLowerCase() === 'staff') {
            query += ` WHERE a.user_id = ?`;
            params.push(req.user.user_id || req.user.id);
        }

        query += ` ORDER BY a.assignment_id DESC`;
        console.log('DEBUG: Executing query for assignments:', query, params);
        
        const [rows] = await db.execute(query, params);
        console.log('DEBUG: Query successful, units found:', rows.length);
        res.json(rows);
    } catch (error) {
        console.error('DEBUG ERROR:', error);
        res.status(500).json({ message: 'Lỗi server khi lấy danh sách phân công.' });
    } finally {
        if (db) {
            await db.end();
            console.log('DEBUG: DB connection closed');
        }
    }
});

// POST /api/subjects/assignments - Tạo phân công mới
router.post('/assignments', verifyToken, isAdmin, async (req, res) => {
    let db;
    try {
        const { user_id, subject_id, teaching_role, semester } = req.body;

        if (!user_id || !subject_id || !teaching_role || !semester) {
            return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin phân công.' });
        }

        db = await getDb();
        
        // Check for existing assignment
        const [existing] = await db.execute(
            'SELECT assignment_id FROM Subject_Assignments WHERE user_id = ? AND subject_id = ? AND semester = ?',
            [user_id, subject_id, semester]
        );
        if (existing.length > 0) {
            return res.status(400).json({ message: 'Môn học này đã được phân công cho giảng viên này trong học kỳ đã chọn.' });
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
router.delete('/assignments/:id', verifyToken, isAdmin, async (req, res) => {
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

// --- MASTER SUBJECT ROUTES ---

// GET /api/subjects - Lấy danh sách môn học
router.get('/', verifyToken, async (req, res) => {
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

// POST /api/subjects - Thêm môn học mới
router.post('/', verifyToken, isAdmin, async (req, res) => {
    let db;
    try {
        const { subject_code, subject_name, credits } = req.body;
        if (!subject_code || !subject_name || !credits) {
            return res.status(400).json({ message: 'Vui lòng điền đầy đủ Mã MH, Tên MH và Số tín chỉ.' });
        }
        db = await getDb();
        const [existing] = await db.execute('SELECT subject_id FROM Subjects WHERE subject_code = ?', [subject_code]);
        if (existing.length > 0) {
            return res.status(400).json({ message: 'Mã môn học này đã tồn tại.' });
        }
        await db.execute(
            'INSERT INTO Subjects (subject_code, subject_name, credits) VALUES (?, ?, ?)',
            [subject_code, subject_name, credits]
        );
        res.status(201).json({ message: 'Thêm môn học mới thành công!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi server khi thêm môn học.' });
    } finally {
        if (db) await db.end();
    }
});

// PUT /api/subjects/:id - Cập nhật môn học
router.put('/:id', verifyToken, isAdmin, async (req, res) => {
    let db;
    try {
        const { id } = req.params;
        const { subject_code, subject_name, credits } = req.body;
        db = await getDb();
        await db.execute(
            'UPDATE Subjects SET subject_code = ?, subject_name = ?, credits = ? WHERE subject_id = ?',
            [subject_code, subject_name, credits, id]
        );
        res.json({ message: 'Cập nhật môn học thành công!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi server khi cập nhật môn học.' });
    } finally {
        if (db) await db.end();
    }
});

// DELETE /api/subjects/:id - Xóa môn học
router.delete('/:id', verifyToken, isAdmin, async (req, res) => {
    let db;
    try {
        const { id } = req.params;
        db = await getDb();
        // Kiểm tra xem môn học có đang được phân công không
        const [assigned] = await db.execute('SELECT assignment_id FROM Subject_Assignments WHERE subject_id = ?', [id]);
        if (assigned.length > 0) {
            return res.status(400).json({ message: 'Không thể xóa môn học đang có dữ liệu phân công.' });
        }
        await db.execute('DELETE FROM Subjects WHERE subject_id = ?', [id]);
        res.json({ message: 'Xóa môn học thành công.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi server khi xóa môn học.' });
    } finally {
        if (db) await db.end();
    }
});

module.exports = router;
