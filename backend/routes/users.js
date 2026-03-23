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

// Middleware kiểm tra quyền Admin: Chỉ cho phép Ban chủ nhiệm Khoa truy cập
const isAdmin = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ message: 'Không có token truy cập.' });

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            console.error('JWT Verify Error:', err.message);
            return res.status(403).json({ message: 'Token không hợp lệ.' });
        }
        
        const user = decoded.user || decoded;
        // Kiểm tra xem người dùng có phải là Admin không
        if (!user || !user.role || user.role.toLowerCase() !== 'admin') {
            return res.status(403).json({ message: 'Chỉ Admin mới có quyền truy cập.' });
        }
        
        req.user = user;
        next();
    });
};

// GET /stats - Lấy thông tin thống kê tổng hợp để hiển thị trên Dashboard (Widget)
router.get('/stats', isAdmin, async (req, res) => {
    let db;
    try {
        db = await getDb();
        
        // Đếm tổng số nhân sự
        const [userCount] = await db.execute('SELECT COUNT(*) as count FROM Users');
        
        let taskCount = [{ count: 0 }];
        let doneCount = [{ count: 0 }];
        let lateCount = [{ count: 0 }];
        
        try {
            // Đếm số lượng công việc theo các trạng thái khác nhau
            [taskCount] = await db.execute('SELECT COUNT(*) as count FROM Tasks');
            [doneCount] = await db.execute('SELECT COUNT(*) as count FROM Tasks WHERE status = "completed"');
            [lateCount] = await db.execute('SELECT COUNT(*) as count FROM Tasks WHERE status = "late"');
        } catch (e) {
            // Bỏ qua lỗi nếu bảng Tasks chưa được tạo (cho teammate mần sau)
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

// DELETE /:id - Xóa nhân sự (Disabled - Dùng chức năng Khóa hồ sơ thay thế)
router.delete('/:id', isAdmin, async (req, res) => {
    res.status(405).json({ message: 'Chức năng xóa nhân sự đã bị vô hiệu hóa. Vui lòng sử dụng chức năng Khóa hồ sơ.' });
});

// Route /stats đã được chuyển lên trước /:id ở phía trên

module.exports = router;
