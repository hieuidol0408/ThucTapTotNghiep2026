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

// Middleware to verify Admin Role
const isAdmin = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ message: 'Không có token truy cập.' });

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            console.error('JWT Verify Error:', err.message);
            return res.status(403).json({ message: 'Token không hợp lệ.' });
        }
        
        // Support both {user: {...}} and {...} structures
        const user = decoded.user || decoded;
        console.log('DEBUG: Authorizing user:', user.username, 'Role:', user.role);

        if (!user || !user.role || user.role.toLowerCase() !== 'admin') {
            console.warn('DEBUG: Authorization failed for role:', user?.role);
            return res.status(403).json({ message: 'Chỉ Admin mới có quyền truy cập.' });
        }
        
        req.user = user;
        next();
    });
};

// GET /stats - Summary statistics for dashboard (phải đặt TRƯỚC /:id)
router.get('/stats', isAdmin, async (req, res) => {
    let db;
    try {
        db = await getDb();
        
        const [userCount] = await db.execute('SELECT COUNT(*) as count FROM Users');
        
        let taskCount = [{ count: 0 }];
        let doneCount = [{ count: 0 }];
        let lateCount = [{ count: 0 }];
        
        try {
            [taskCount] = await db.execute('SELECT COUNT(*) as count FROM Tasks');
            [doneCount] = await db.execute('SELECT COUNT(*) as count FROM Tasks WHERE status = "completed"');
            [lateCount] = await db.execute('SELECT COUNT(*) as count FROM Tasks WHERE status = "late"');
        } catch (e) {
            // Bảng tasks chưa tồn tại thì bỏ qua
        }

        res.json({
            totalUsers: userCount[0].count,
            totalTasks: taskCount[0].count,
            completedTasks: doneCount[0].count,
            lateTasks: lateCount[0].count,
            percentComplete: taskCount[0].count > 0 
                ? Math.round((doneCount[0].count / taskCount[0].count) * 100) 
                : 0
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi server khi lấy thống kê.' });
    } finally {
        if (db) await db.end();
    }
});

// GET / - List users (with optional search)
router.get('/', isAdmin, async (req, res) => {
    let db;
    try {
        const { search } = req.query;
        db = await getDb();
        
        let query = 'SELECT user_id, employee_code, email, full_name, role, status FROM Users';
        let params = [];

        if (search) {
            query += ' WHERE employee_code LIKE ? OR full_name LIKE ? OR email LIKE ?';
            params = [`%${search}%`, `%${search}%`, `%${search}%`];
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
        const { employee_code, email, password, full_name, role, status } = req.body;
        
        if (!employee_code || !email || !password || !full_name) {
            return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin.' });
        }

        db = await getDb();

        // Check if employee_code or email exists
        const [existing] = await db.execute('SELECT user_id FROM Users WHERE employee_code = ? OR email = ?', [employee_code, email]);
        if (existing.length > 0) {
            return res.status(400).json({ message: 'Mã nhân viên hoặc Email đã tồn tại.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await db.execute(
            'INSERT INTO Users (employee_code, email, password_hash, full_name, role, status) VALUES (?, ?, ?, ?, ?, ?)',
            [employee_code, email, hashedPassword, full_name, role || 'staff', status || 'active']
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
        const { full_name, role, email, status, password } = req.body;
        
        db = await getDb();

        // Lấy thông tin user hiện tại nếu cần, hoặc cứ update thẳng
        let query = 'UPDATE Users SET full_name = ?, role = ?, email = ?, status = ?';
        let params = [full_name, role, email, status];

        if (password && password.length > 0) {
            const hashedPassword = await bcrypt.hash(password, 10);
            query += ', password_hash = ?';
            params.push(hashedPassword);
        }

        query += ' WHERE user_id = ?';
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

        await db.execute('DELETE FROM Users WHERE user_id = ?', [id]);
        res.json({ message: 'Xóa nhân sự thành công.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi server khi xóa nhân sự.' });
    } finally {
        if (db) await db.end();
    }
});

// Route /stats đã được chuyển lên trước /:id ở phía trên

module.exports = router;
