const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');
const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Không tìm thấy token truy cập' });
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded.user;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Token không hợp lệ hoặc đã hết hạn' });
    }
};

const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Truy cập bị từ chối' });
    }
};

const escapeHtml = (text) => {
    if (!text || typeof text !== 'string') return text;
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
};

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

// GET all tasks (CongViec & PhanCongCongViec)
router.get('/', authMiddleware, async (req, res) => {
    let db;
    try {
        db = await getDb();
        let query = `
            SELECT 
                c.MaCV as id, c.MaCV as task_id, c.TenCV as title, c.LoaiCV as category, c.MoTa as description,
                CASE 
                    WHEN (SELECT PhanTramHoanThanh FROM BaoCaoTienDo WHERE MaCV = c.MaCV ORDER BY NgayGui DESC LIMIT 1) = 100 THEN 'completed'
                    WHEN c.NgayKetThuc < NOW() THEN 'late'
                    ELSE 'todo'
                END as status,
                c.NgayBatDau as start_date, c.NgayKetThuc as end_date, 
                p.MaNS as assignee_id,
                n.HoTen as assignee_name, n.MaNS as assignee_username,
                IFNULL((SELECT PhanTramHoanThanh FROM BaoCaoTienDo WHERE MaCV = c.MaCV ORDER BY NgayGui DESC LIMIT 1), 0) as current_progress
            FROM CongViec c
            LEFT JOIN PhanCongCongViec p ON c.MaCV = p.MaCV
            LEFT JOIN NhanSu n ON p.MaNS = n.MaNS
        `;
        let params = [];

        if (req.user.role === 'staff') {
            query += ` WHERE p.MaNS = ?`;
            params.push(req.user.id);
        }

        query += ` ORDER BY c.NgayKetThuc DESC`;
        
        const [tasks] = await db.query(query, params);
        res.json(tasks);
    } catch (err) {
        console.error('Error fetching tasks:', err);
        res.status(500).json({ message: 'Lỗi máy chủ' });
    } finally {
        if (db) await db.end();
    }
});

// POST a new task (Admin only)
router.post('/', [authMiddleware, isAdmin], async (req, res) => {
    let db;
    try {
        db = await getDb();
        let { title, category, description, assignee_id, start_date, end_date } = req.body;

        if (!title || !title.trim()) {
            return res.status(400).json({ message: 'Tên nhiệm vụ không được để trống hoặc chỉ chứa khoảng trắng' });
        }
        title = escapeHtml(title.trim());
        const escapedDescription = escapeHtml(description);

        if (!assignee_id || !start_date || !end_date) {
            return res.status(400).json({ message: 'Vui lòng điền đầy đủ các thông tin bắt buộc' });
        }

        if (!category) {
            return res.status(400).json({ message: 'Vui lòng chọn chuyên môn giảng dạy' });
        }

        const start = new Date(start_date);
        const end = new Date(end_date);
        if (end < start) {
            return res.status(400).json({ message: 'Ngày kết thúc không thể trước ngày bắt đầu' });
        }

        await db.beginTransaction();
        const query = `INSERT INTO CongViec (TenCV, LoaiCV, MoTa, NgayBatDau, NgayKetThuc) VALUES (?, ?, ?, ?, ?)`;
        const [result] = await db.execute(query, [title, category, escapedDescription || null, start_date, end_date]);
        
        const newTaskId = result.insertId;

        const assignQuery = `INSERT INTO PhanCongCongViec (MaNS, MaCV, NgayPhanCong) VALUES (?, ?, CURDATE())`;
        await db.execute(assignQuery, [assignee_id, newTaskId]);

        await db.commit();

        res.status(201).json({ message: 'Phân công công việc thành công', id: newTaskId });
    } catch (err) {
        if (db) await db.rollback();
        console.error('Error creating task:', err);
        res.status(500).json({ message: 'Lỗi máy chủ: ' + (err.message || 'Không xác định') });
    } finally {
        if (db) await db.end();
    }
});

// PUT update a task status -> Dummy, we do not have status anymore, just act happy.
router.put('/:id/status', authMiddleware, async (req, res) => {
   res.json({ message: 'Dự án mới không lưu trạng thái công việc. Sử dụng Báo Cáo Tiến Độ thay thế.' });
});

// POST a report for a task
router.post('/:id/reports', authMiddleware, async (req, res) => {
    let db;
    try {
        db = await getDb();
        const { id } = req.params;
        const { report_note, progress_percent } = req.body;

        if (!report_note || progress_percent === undefined) {
            return res.status(400).json({ message: 'Vui lòng cung cấp nội dung báo cáo và tiến độ' });
        }

        const queryReport = `INSERT INTO BaoCaoTienDo (MaNS, MaCV, NoiDungBaoCao, PhanTramHoanThanh, NgayGui) VALUES (?, ?, ?, ?, ?)`;
        await db.execute(queryReport, [req.user.id, id, report_note, progress_percent, new Date()]);

        res.status(201).json({ message: 'Gửi báo cáo tiến độ thành công' });
    } catch (err) {
        console.error('Error adding report:', err);
        res.status(500).json({ message: 'Lỗi máy chủ' });
    } finally {
        if (db) await db.end();
    }
});

// GET reports for a task
router.get('/:id/reports', authMiddleware, async (req, res) => {
    let db;
    try {
        db = await getDb();
        const { id } = req.params;
        const [reports] = await db.execute(`
            SELECT b.MaBC as id, b.NoiDungBaoCao as report_note, b.NgayGui as created_at, b.PhanTramHoanThanh as progress_percent,
                   u.HoTen as reporter_name 
            FROM BaoCaoTienDo b
            JOIN NhanSu u ON b.MaNS = u.MaNS
            WHERE b.MaCV = ?
            ORDER BY b.NgayGui DESC
        `, [id]);
        res.json(reports);
    } catch (err) {
        console.error('Error fetching reports:', err);
        res.status(500).json({ message: 'Lỗi máy chủ' });
    } finally {
        if (db) await db.end();
    }
});

// DELETE a task (Admin only)
router.delete('/:id', [authMiddleware, isAdmin], async (req, res) => {
    let db;
    try {
        db = await getDb();
        await db.execute(`DELETE FROM CongViec WHERE MaCV = ?`, [req.params.id]);
        res.json({ message: 'Xóa công việc thành công' });
    } catch (err) {
        console.error('Error deleting task:', err);
        res.status(500).json({ message: 'Lỗi máy chủ' });
    } finally {
        if (db) await db.end();
    }
});

module.exports = router;
