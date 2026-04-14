const express = require('express');
const router = express.Router();
const db = require('../config/db');
const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Không tìm thấy token truy cập' });
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ message: 'Token không hợp lệ' });
    }
};

// Lấy danh sách nhắc nhở của một user
router.get('/user/:userId', authMiddleware, async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM reminders WHERE user_id = ? ORDER BY reminder_time ASC', [req.params.userId]);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 1. Tạo nhắc nhở
router.post('/', authMiddleware, async (req, res) => {
    const { task_id, user_id, message, reminder_time } = req.body;
    try {
        const [result] = await db.query(
            'INSERT INTO reminders (task_id, user_id, message, reminder_time) VALUES (?, ?, ?, ?)',
            [task_id, user_id, message, reminder_time]
        );
        res.status(201).json({ message: 'Tạo nhắc nhở thành công', id: result.insertId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. Cập nhật nhắc nhở
router.put('/:id', authMiddleware, async (req, res) => {
    const { message, reminder_time } = req.body;
    try {
        await db.query(
            'UPDATE reminders SET message = ?, reminder_time = ? WHERE reminder_id = ?',
            [message, reminder_time, req.params.id]
        );
        res.json({ message: 'Cập nhật thành công' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. Xóa nhắc nhở
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        await db.query('DELETE FROM reminders WHERE reminder_id = ?', [req.params.id]);
        res.json({ message: 'Đã xóa nhắc nhở' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 4. Bật/tắt nhắc nhở
router.patch('/:id/toggle', authMiddleware, async (req, res) => {
    const { is_active } = req.body; // truyền lên 1 hoặc 0
    try {
        await db.query('UPDATE reminders SET is_active = ? WHERE reminder_id = ?', [is_active, req.params.id]);
        res.json({ message: is_active ? 'Đã bật nhắc nhở' : 'Đã tắt nhắc nhở' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
