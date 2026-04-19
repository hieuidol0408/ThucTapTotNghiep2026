const express = require('express');
const router = express.Router();
const db = require('../config/db');
const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {

// GET all tasks (CongViec & PhanCongCongViec)
router.get('/', authMiddleware, async (req, res) => {
    try {
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
        // No manual connection close needed
    }
});

// POST a new task (Admin only)
router.post('/', [authMiddleware, isAdmin], async (req, res) => {
    try {
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
        // No manual connection close needed
    }
});

// PUT update a task status -> Dummy, we do not have status anymore, just act happy.
router.put('/:id/status', authMiddleware, async (req, res) => {
   res.json({ message: 'Dự án mới không lưu trạng thái công việc. Sử dụng Báo Cáo Tiến Độ thay thế.' });
});

// POST a report for a task
router.post('/:id/reports', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const { report_note, progress_percent } = req.body;

        if (!report_note || progress_percent === undefined) {
            return res.status(400).json({ message: 'Vui lòng cung cấp nội dung báo cáo và tiến độ' });
        }

        // Ràng buộc nghiệp vụ: Không chứa ký tự đặc biệt nguy hiểm hoặc không hợp lệ
        const noteRegex = /^[\p{L}\p{N}\s\.,!?\-'":()/]+$/u;
        if (!noteRegex.test(report_note)) {
            return res.status(400).json({ message: 'Kí tự không hợp lệ' });
        }

        // Ràng buộc nghiệp vụ: Không được giảm tiến độ
        const [latestProgress] = await db.execute('SELECT MAX(PhanTramHoanThanh) as maxProgress FROM BaoCaoTienDo WHERE MaCV = ?', [id]);
        if (latestProgress[0].maxProgress !== null && progress_percent < latestProgress[0].maxProgress) {
            return res.status(400).json({ message: 'Không được giảm tiến độ' });
        }

        // Ràng buộc nghiệp vụ: Kiểm tra trùng tiến độ
        const [duplicate] = await db.execute('SELECT 1 FROM BaoCaoTienDo WHERE MaCV = ? AND PhanTramHoanThanh = ?', [id, progress_percent]);
        if (duplicate.length > 0) {
            return res.status(400).json({ message: 'Tiến độ hiện tại đã bị trùng' });
        }

        // Ràng buộc nghiệp vụ: Kiểm tra trùng ghi chú
        const [duplicateNote] = await db.execute('SELECT 1 FROM BaoCaoTienDo WHERE MaCV = ? AND NoiDungBaoCao = ?', [id, report_note]);
        if (duplicateNote.length > 0) {
            return res.status(400).json({ message: 'Phần ghi chú không được phép trùng với báo cáo trước đó' });
        }

        const queryReport = `INSERT INTO BaoCaoTienDo (MaNS, MaCV, NoiDungBaoCao, PhanTramHoanThanh, NgayGui) VALUES (?, ?, ?, ?, ?)`;
        await db.execute(queryReport, [req.user.id, id, report_note, progress_percent, new Date()]);

        res.status(201).json({ message: 'Gửi báo cáo tiến độ thành công' });
    } catch (err) {
        console.error('Error adding report:', err);
        res.status(500).json({ message: 'Lỗi máy chủ' });
        // No manual connection close needed
    }
});

// GET reports for a task
router.get('/:id/reports', authMiddleware, async (req, res) => {
    try {
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
        // No manual connection close needed
    }
});

// DELETE a task (Admin only)
router.delete('/:id', [authMiddleware, isAdmin], async (req, res) => {
    try {
        await db.execute(`DELETE FROM CongViec WHERE MaCV = ?`, [req.params.id]);
        res.json({ message: 'Xóa công việc thành công' });
    } catch (err) {
        console.error('Error deleting task:', err);
        res.status(500).json({ message: 'Lỗi máy chủ' });
        // No manual connection close needed
    }
});

module.exports = router;
