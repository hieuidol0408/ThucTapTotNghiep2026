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
        // Kiểm tra xem Nhân Sự có tồn tại không (bằng MaNS hoặc Email)
        const [rows] = await db.execute('SELECT * FROM NhanSu WHERE MaNS = ? OR Email = ?', [username, username]);
        
        if (rows.length === 0) {
            return res.status(400).json({ message: 'Tên đăng nhập hoặc mã không tồn tại' });
        }

        const user = rows[0];

        // So sánh mật khẩu
        const isMatch = await bcrypt.compare(password, user.MatKhau);
        if (!isMatch) {
            return res.status(400).json({ message: 'Mật khẩu không chính xác' });
        }

        // Tạo JWT Payload (Lưu giữ thông tin Tiếng Việt)
        const payload = {
            user: {
                id: user.MaNS, 
                username: user.MaNS,
                email: user.Email,
                role: user.Quyen,
                full_name: user.HoTen
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
