const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');
const jwt = require('jsonwebtoken');
require('dotenv').config();

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

// --- TKB (Đóng vai trò phân công giảng dạy) ---

router.get('/assignments', verifyToken, async (req, res) => {
    let db;
    try {
        db = await getDb();
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
            params.push(req.user.id); // Trùng với payload
        }
        
        const [rows] = await db.execute(query, params);
        // Transform id to a composite string since it has compound key
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
        res.status(500).json({ message: 'Lỗi server.' });
    } finally {
        if (db) await db.end();
    }
});

router.post('/assignments', verifyToken, isAdmin, async (req, res) => {
    let db;
    try {
        const { user_id, subject_id, ngay_bat_dau, ngay_ket_thuc, ca, phong, thu } = req.body;
        db = await getDb();
        
        await db.execute(
            'INSERT INTO TKB (MaNS, MaMH, NgayBatDau, NgayKetThuc, Ca, Phong, Thu) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [user_id, subject_id, ngay_bat_dau || new Date(), ngay_ket_thuc || new Date(), ca || 1, phong || 'A1', thu || 2]
        );
        res.status(201).json({ message: 'Phân công môn học thành công!' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server.' });
    } finally {
        if (db) await db.end();
    }
});

router.delete('/assignments/:id', verifyToken, isAdmin, async (req, res) => {
    let db;
    try {
        const idParts = req.params.id.split('_');
        if (idParts.length !== 2) return res.status(400).json({ message: 'ID không hợp lệ.'});
        
        db = await getDb();
        await db.execute('DELETE FROM TKB WHERE MaNS = ? AND MaMH = ?', [idParts[0], idParts[1]]);
        res.json({ message: 'Xóa phân công thành công.' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server.' });
    } finally {
        if (db) await db.end();
    }
});

router.put('/assignments/:id', verifyToken, isAdmin, async (req, res) => {
    let db;
    try {
        const idParts = req.params.id.split('_');
        if (idParts.length !== 2) return res.status(400).json({ message: 'ID không hợp lệ.'});
        
        const { ngay_bat_dau, ngay_ket_thuc, ca, phong, thu } = req.body;
        db = await getDb();
        
        await db.execute(
            'UPDATE TKB SET NgayBatDau = ?, NgayKetThuc = ?, Ca = ?, Phong = ?, Thu = ? WHERE MaNS = ? AND MaMH = ?',
            [ngay_bat_dau, ngay_ket_thuc, ca, phong, thu, idParts[0], idParts[1]]
        );
        res.json({ message: 'Cập nhật phân công thành công!' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server.' });
    } finally {
        if (db) await db.end();
    }
});

// --- MON HOC ---

router.get('/', verifyToken, async (req, res) => {
    let db;
    try {
        db = await getDb();
        const [subjects] = await db.execute('SELECT MaMH as id, MaMH as subject_code, TenMH as subject_name, SoTinChi as credits FROM MonHoc');
        res.json(subjects);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server.' });
    } finally {
        if (db) await db.end();
    }
});

router.post('/', verifyToken, isAdmin, async (req, res) => {
    let db;
    try {
        const { subject_code, subject_name, credits } = req.body;
        db = await getDb();
        await db.execute(
            'INSERT INTO MonHoc (MaMH, TenMH, SoTinChi) VALUES (?, ?, ?)',
            [subject_code, subject_name, credits]
        );
        res.status(201).json({ message: 'Thêm môn học mới thành công!' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server.' });
    } finally {
        if (db) await db.end();
    }
});

router.put('/:id', verifyToken, isAdmin, async (req, res) => {
    let db;
    try {
        const { id } = req.params;
        const { subject_name, credits } = req.body;
        db = await getDb();
        await db.execute(
            'UPDATE MonHoc SET TenMH = ?, SoTinChi = ? WHERE MaMH = ?',
            [subject_name, credits, id]
        );
        res.json({ message: 'Cập nhật môn học thành công!' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server.' });
    } finally {
        if (db) await db.end();
    }
});

router.delete('/:id', verifyToken, isAdmin, async (req, res) => {
    let db;
    try {
        db = await getDb();
        await db.execute('DELETE FROM MonHoc WHERE MaMH = ?', [req.params.id]);
        res.json({ message: 'Xóa môn học thành công.' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server.' });
    } finally {
        if (db) await db.end();
    }
});

module.exports = router;
