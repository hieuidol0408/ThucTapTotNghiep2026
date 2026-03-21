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
        // Lấy tất cả task, join với users để lấy full_name
        const query = `
            SELECT t.*, u.full_name as assignee_name, u.username as assignee_username
            FROM tasks t
            LEFT JOIN users u ON t.assigned_to = u.id
            ORDER BY t.created_at DESC
        `;
        const [tasks] = await db.query(query);
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
        const { title, description, assigned_to, due_date } = req.body;

        if (!title || !assigned_to || !due_date) {
            return res.status(400).json({ message: 'Vui lòng điền đầy đủ các trường bắt buộc' });
        }

        const query = `
            INSERT INTO tasks (title, description, status, assigned_to, due_date)
            VALUES (?, ?, 'todo', ?, ?)
        `;
        
        const [result] = await db.execute(query, [title, description || null, assigned_to, due_date]);
        
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
        const [taskCheck] = await db.query('SELECT * FROM tasks WHERE id = ?', [id]);
        if (taskCheck.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy công việc' });
        }

        const task = taskCheck[0];
        if (req.user.role !== 'admin' && task.assigned_to !== req.user.id) {
            return res.status(403).json({ message: 'Bạn không có quyền cập nhật trạng thái công việc này' });
        }

        const query = `UPDATE tasks SET status = ? WHERE id = ?`;
        await db.execute(query, [status, id]);
        
        res.json({ message: 'Cập nhật trạng thái thành công' });
    } catch (err) {
        console.error('Error updating task status:', err);
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
        const query = `DELETE FROM tasks WHERE id = ?`;
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
