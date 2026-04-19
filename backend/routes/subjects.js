const express = require('express');
const router = express.Router();
const db = require('../config/db');
const jwt = require('jsonwebtoken');

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

const isAdmin = (req, res, next) => {
    if (!req.user || !req.user.role || req.user.role.toLowerCase() !== 'admin') {
        return res.status(403).json({ message: 'Chỉ Admin mới có quyền thao tác.' });
    }
    next();
};

const sanitizeXSS = (str) => {
    if (typeof str !== 'string') return str;
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
};

const roomRegex = /^[a-zA-Z0-9.\-_ ]+$/;

// --- TKB (Đóng vai trò phân công giảng dạy) ---

router.get('/assignments', verifyToken, async (req, res) => {
    try {
        let query = `
            SELECT 
                t.MaNS, t.MaMH, t.NgayBatDau, t.NgayKetThuc, t.Ca, t.Phong, t.Thu,
                n.HoTen AS lecturer_name,
                n.MaNS AS lecturer_username,
                m.TenMH AS subject_name,
                m.SoTinChi AS credits
            FROM TKB t
            JOIN NhanSu n ON t.MaNS = n.MaNS
            JOIN MonHoc m ON t.MaMH = m.MaMH
        `;
        let params = [];
        
        if (req.user.role && req.user.role.toLowerCase() === 'staff') {
            query += ` WHERE t.MaNS = ?`;
            params.push(req.user.id);
        }
        
        const [rows] = await db.execute(query, params);
        const results = rows.map(r => ({
           id: `${r.MaNS}_${r.MaMH}`,
           user_id: r.MaNS,
           subject_id: r.MaMH,
           lecturer_name: r.lecturer_name,
           lecturer_username: r.lecturer_username,
           subject_code: r.MaMH,
           subject_name: r.subject_name,
           credits: r.credits,
           NgayBatDau: r.NgayBatDau,
           NgayKetThuc: r.NgayKetThuc,
           Ca: r.Ca,
           Phong: r.Phong,
           Thu: r.Thu
        }));
        res.json(results);
    } catch (error) {
        console.error('Assignment fetch error:', error);
        res.status(500).json({ message: 'Lỗi server.' });
    }
});

router.post('/assignments', verifyToken, isAdmin, async (req, res) => {
    try {
        const { user_id, subject_id, ngay_bat_dau, ngay_ket_thuc, ca, phong, thu } = req.body;

        const checkQuery = `
            SELECT 1 FROM TKB 
            WHERE MaNS = ? AND Thu = ? AND Ca = ?
            AND (NgayBatDau <= ? AND NgayKetThuc >= ?)
            LIMIT 1
        `;
        const [existing] = await db.execute(checkQuery, [user_id, thu, ca, ngay_ket_thuc, ngay_bat_dau]);

        if (existing.length > 0) {
            return res.status(400).json({ message: 'Trùng lịch giảng dạy của Giảng viên' });
        }
        
        await db.execute(
            'INSERT INTO TKB (MaNS, MaMH, NgayBatDau, NgayKetThuc, Ca, Phong, Thu) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [user_id, subject_id, ngay_bat_dau || new Date(), ngay_ket_thuc || new Date(), ca || 1, sanitizeXSS(phong) || 'A1', thu || 2]
        );
        res.status(201).json({ message: 'Phân công môn học thành công!' });
    } catch (error) {
        console.error('Assignment error:', error);
        res.status(500).json({ message: 'Lỗi server.' });
    }
});

router.delete('/assignments/:id', verifyToken, isAdmin, async (req, res) => {
    try {
        const idParts = req.params.id.split('_');
        if (idParts.length !== 2) return res.status(400).json({ message: 'ID không hợp lệ.'});
        
        await db.execute('DELETE FROM TKB WHERE MaNS = ? AND MaMH = ?', [idParts[0], idParts[1]]);
        res.json({ message: 'Xóa phân công thành công.' });
    } catch (error) {
        console.error('Delete assignment error:', error);
        res.status(500).json({ message: 'Lỗi server.' });
    }
});

router.put('/assignments/:id', verifyToken, isAdmin, async (req, res) => {
    try {
        const idParts = req.params.id.split('_');
        if (idParts.length !== 2) return res.status(400).json({ message: 'ID không hợp lệ.'});
        
        const { ngay_bat_dau, ngay_ket_thuc, ca, phong, thu } = req.body;
        
        if (new Date(ngay_ket_thuc) < new Date(ngay_bat_dau)) {
            return res.status(400).json({ message: 'Thời gian kết thúc phải lớn hơn hoặc bằng thời gian bắt đầu.' });
        }

        if (thu !== undefined && (thu < 2 || thu > 7)) {
            return res.status(400).json({ message: 'Thứ phải nằm trong khoảng từ 2 đến 7.' });
        }

        if (phong && !roomRegex.test(phong)) {
            return res.status(400).json({ message: 'Tên phòng học không nên chứa kí tự đặc biệt.' });
        }
        
        const checkQuery = `
            SELECT 1 FROM TKB 
            WHERE MaNS = ? AND Thu = ? AND Ca = ?
            AND (NgayBatDau <= ? AND NgayKetThuc >= ?)
            AND NOT (MaNS = ? AND MaMH = ?)
            LIMIT 1
        `;
        const [existing] = await db.execute(checkQuery, [idParts[0], thu, ca, ngay_ket_thuc, ngay_bat_dau, idParts[0], idParts[1]]);

        if (existing.length > 0) {
            return res.status(400).json({ message: 'Trùng lịch giảng dạy của Giảng viên' });
        }
        
        await db.execute(
            'UPDATE TKB SET NgayBatDau = ?, NgayKetThuc = ?, Ca = ?, Phong = ?, Thu = ? WHERE MaNS = ? AND MaMH = ?',
            [ngay_bat_dau, ngay_ket_thuc, ca, sanitizeXSS(phong), thu, idParts[0], idParts[1]]
        );
        res.json({ message: 'Cập nhật phân công thành công!' });
    } catch (error) {
        console.error('Update assignment error:', error);
        res.status(500).json({ message: 'Lỗi server.' });
    }
});

// --- MON HOC ---

router.get('/', verifyToken, async (req, res) => {
    try {
        const [subjects] = await db.execute('SELECT MaMH as id, MaMH as subject_code, TenMH as subject_name, SoTinChi as credits FROM MonHoc');
        res.json(subjects);
    } catch (error) {
        console.error('Fetch subjects error:', error);
        res.status(500).json({ message: 'Lỗi server.' });
    }
});

router.post('/', verifyToken, isAdmin, async (req, res) => {
    try {
        const { subject_code, subject_name, credits } = req.body;
        
        const codeRegex = /^[a-zA-Z0-9.\-_]+$/;
        if (subject_code && !codeRegex.test(subject_code)) {
            return res.status(400).json({ message: 'Mã môn học không thể chứa kí tự đặc biệt.' });
        }

        const nameRegex = /^[\p{L}\p{N}\s.\-_()]+$/u;
        if (subject_name && !nameRegex.test(subject_name)) {
            return res.status(400).json({ message: 'Tên môn học không nên chứa kí tự đặc biệt.' });
        }

        const [existing] = await db.execute('SELECT 1 FROM MonHoc WHERE MaMH = ?', [subject_code]);
        if (existing.length > 0) {
            return res.status(400).json({ message: 'Mã môn học đã tồn tại' });
        }

        await db.execute(
            'INSERT INTO MonHoc (MaMH, TenMH, SoTinChi) VALUES (?, ?, ?)',
            [sanitizeXSS(subject_code), sanitizeXSS(subject_name), credits]
        );
        res.status(201).json({ message: 'Thêm môn học mới thành công!' });
    } catch (error) {
        console.error('Create subject error:', error);
        res.status(500).json({ message: 'Lỗi server.' });
    }
});

router.put('/:id', verifyToken, isAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { subject_name, credits } = req.body;
        
        await db.execute(
            'UPDATE MonHoc SET TenMH = ?, SoTinChi = ? WHERE MaMH = ?',
            [sanitizeXSS(subject_name), credits, id]
        );
        res.json({ message: 'Cập nhật môn học thành công!' });
    } catch (error) {
        console.error('Update subject error:', error);
        res.status(500).json({ message: 'Lỗi server.' });
    }
});

router.delete('/:id', verifyToken, isAdmin, async (req, res) => {
    try {
        await db.execute('DELETE FROM MonHoc WHERE MaMH = ?', [req.params.id]);
        res.json({ message: 'Xóa môn học thành công.' });
    } catch (error) {
        console.error('Delete subject error:', error);
        res.status(500).json({ message: 'Lỗi server.' });
    }
});

module.exports = router;
