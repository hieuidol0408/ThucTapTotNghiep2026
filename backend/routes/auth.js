const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

// @route   POST api/auth/login
// @desc    Authenticate user & get token
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        // Check if user exists
        const [rows] = await db.execute('SELECT * FROM users WHERE username = ?', [username]);
        
        if (rows.length === 0) {
            return res.status(400).json({ message: 'Tên đăng nhập không tồn tại' });
        }

        const user = rows[0];

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Mật khẩu không chính xác' });
        }

        // Check if user is admin
        if (user.role !== 'admin') {
            return res.status(403).json({ message: 'Lỗi: Tài khoản không có quyền truy cập quản trị.' });
        }

        // Create JWT
        const payload = {
            user: {
                id: user.id,
                username: user.username,
                role: user.role,
                full_name: user.full_name
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '8h' },
            (err, token) => {
                if (err) throw err;
                res.json({ token, user: payload.user });
            }
        );

    } catch (err) {
        console.error('Login Error:', err.message);
        res.status(500).json({ message: 'Lỗi máy chủ: ' + err.message });
    }
});

module.exports = router;
