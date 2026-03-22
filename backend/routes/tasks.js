const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');

// Reuse auth middleware logic from users.js if you have it in a separate file,
// or just re-implement a barebones check for "admin" or logged-in users.
const jwt = require('jsonwebtoken');

// Middleware to authenticate and check roles
const authMiddleware = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Không tìm thấy token truy cập' });
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded.user; // Fixed nested payload
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

// GET all tasks (with assignee details)
router.get('/', authMiddleware, async (req, res) => {
    let db;
    try {
        db = await getDb();
        let query = `
            SELECT 
                t.task_id as id, t.title, t.category, t.description, t.status, 
                t.start_date, t.end_date, t.assignee_id, t.assigner_id, 
                u.full_name as assignee_name, u.employee_code as assignee_username,
                (SELECT progress_percent FROM Task_Progress_Reports WHERE task_id = t.task_id ORDER BY created_at DESC LIMIT 1) as current_progress
            FROM Tasks t
            LEFT JOIN Users u ON t.assignee_id = u.user_id
        `;
        let params = [];

        if (req.user.role === 'staff') {
            query += ` WHERE t.assignee_id = ?`;
            params.push(req.user.id);
        }

        query += ` ORDER BY t.end_date DESC`;
        
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
        const { title, category, description, assignee_id, start_date, end_date } = req.body;

        if (!title || !category || !assignee_id || !start_date || !end_date) {
            return res.status(400).json({ message: 'Vui lòng điền đầy đủ các trường bắt buộc' });
        }

        const assigner_id = req.user.id;

        const query = `
            INSERT INTO Tasks (title, category, description, status, assigner_id, assignee_id, start_date, end_date)
            VALUES (?, ?, ?, 'todo', ?, ?, ?, ?)
        `;
        
        const [result] = await db.execute(query, [title, category, description || null, assigner_id, assignee_id, start_date, end_date]);
        
        res.status(201).json({ 
            message: 'Phân công công việc thành công',
            id: result.insertId 
        });
    } catch (err) {
        console.error('Error creating task:', err);
        res.status(500).json({ message: 'Lỗi máy chủ' });
    } finally {
        if (db) await db.end();
    }
});

// PUT update a task status
// Anyone who is authenticated can update status (if they are assignee or admin)
router.put('/:id/status', authMiddleware, async (req, res) => {
    let db;
    try {
        db = await getDb();
        const { id } = req.params;
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({ message: 'Vui lòng cung cấp trạng thái' });
        }

        // Optional: Check if the user is the assignee or an admin
        const [taskCheck] = await db.query('SELECT * FROM Tasks WHERE task_id = ?', [id]);
        if (taskCheck.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy công việc' });
        }

        const task = taskCheck[0];
        if (req.user.role !== 'admin' && task.assignee_id !== req.user.id) {
            return res.status(403).json({ message: 'Bạn không có quyền cập nhật trạng thái công việc này' });
        }

        const query = `UPDATE Tasks SET status = ? WHERE task_id = ?`;
        await db.execute(query, [status, id]);
        
        res.json({ message: 'Cập nhật trạng thái thành công' });
    } catch (err) {
        console.error('Error updating task status:', err);
        res.status(500).json({ message: 'Lỗi máy chủ' });
    } finally {
        if (db) await db.end();
    }
});

// POST a report for a task
router.post('/:id/reports', authMiddleware, async (req, res) => {
    let db;
    try {
        db = await getDb();
        const { id } = req.params;
        const { progress_percent, report_note } = req.body;

        if (progress_percent === undefined) {
            return res.status(400).json({ message: 'Vui lòng cung cấp phần trăm tiến độ' });
        }

        // Insert report
        const queryReport = `
            INSERT INTO Task_Progress_Reports (task_id, reporter_id, progress_percent, report_note)
            VALUES (?, ?, ?, ?)
        `;
        await db.execute(queryReport, [id, req.user.id, progress_percent, report_note || null]);

        // Auto-update task status if 100%
        if (parseInt(progress_percent) === 100) {
            await db.execute('UPDATE Tasks SET status = "completed" WHERE task_id = ?', [id]);
        } else if (parseInt(progress_percent) > 0) {
            await db.execute('UPDATE Tasks SET status = "in-progress" WHERE task_id = ? AND status = "todo"', [id]);
        }

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
            SELECT r.*, u.full_name as reporter_name 
            FROM Task_Progress_Reports r
            JOIN Users u ON r.reporter_id = u.user_id
            WHERE r.task_id = ?
            ORDER BY r.created_at DESC
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
        const { id } = req.params;
        const query = `DELETE FROM Tasks WHERE task_id = ?`;
        await db.execute(query, [id]);
        res.json({ message: 'Xóa công việc thành công' });
    } catch (err) {
        console.error('Error deleting task:', err);
        res.status(500).json({ message: 'Lỗi máy chủ' });
    } finally {
        if (db) await db.end();
    }
});

module.exports = router;
