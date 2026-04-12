const express = require('express');
const router = express.Router();
const db = require('../config/db');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Đảm bảo thư mục uploads tồn tại bằng đường dẫn tuyệt đối
const UPLOAD_DIR = path.join(__dirname, '../uploads');
console.log('[DEBUG] Upload Directory:', UPLOAD_DIR);
if (!fs.existsSync(UPLOAD_DIR)) {
    console.log('[DEBUG] Creating uploads directory...');
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Cấu hình Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        console.log('[DEBUG] Multer Destination requested for:', file.originalname);
        cb(null, UPLOAD_DIR);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const name = 'avatar-' + uniqueSuffix + path.extname(file.originalname);
        console.log('[DEBUG] Multer Generated Filename:', name);
        cb(null, name);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: (req, file, cb) => {
        console.log('[DEBUG] Filtering file:', file.mimetype);
        const allowedTypes = /jpeg|jpg|png|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (extname && mimetype) return cb(null, true);
        console.error('[ERROR] File type not allowed:', file.mimetype);
        cb(new Error('Chỉ cho phép tải lên hình ảnh (jpg, png, webp)!'));
    }
});

// Middleware xác thực Admin
const isAdmin = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ message: 'Không có token truy cập.' });

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) return res.status(403).json({ message: 'Token không hợp lệ.' });
        
        const userData = decoded.user || decoded;
        if (!userData || userData.role !== 'admin') {
            return res.status(403).json({ message: 'Chỉ Admin mới có quyền truy cập.' });
        }
        
        req.user = userData;
        next();
    });
};

// Middleware xác thực Chính chủ hoặc Admin
const isSelfOrAdmin = (req, res, next) => {
    console.log('[DEBUG] isSelfOrAdmin check triggered');
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ message: 'Không có token truy cập.' });

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            console.error('[ERROR] JWT Verify Failed:', err.message);
            return res.status(403).json({ message: 'Token không hợp lệ.' });
        }
        
        const userData = decoded.user || decoded;
        const targetId = req.params.id;
        const currentUserId = userData.id || userData.MaNS || userData.username;

        console.log(`[DEBUG] Identity Check: Current=${currentUserId}, Target=${targetId}, Role=${userData.role}`);

        if (userData && (userData.role === 'admin' || String(currentUserId) === String(targetId))) {
            req.user = userData;
            next();
        } else {
            console.warn(`[WARN] Unauthorized access attempt: ${currentUserId} tried to access ${targetId}`);
            return res.status(403).json({ message: 'Bạn không có quyền thực hiện thao tác này.' });
        }
    });
};

// --- ROUTES ---

// GET /stats
router.get('/stats', isAdmin, async (req, res) => {
    try {
        const [nsCount] = await db.execute('SELECT COUNT(*) as count FROM NhanSu');
        const [cvCount] = await db.execute('SELECT COUNT(*) as count FROM CongViec');
        const [progressStat] = await db.execute(`
            SELECT ROUND(AVG(latest_progress), 0) as avg_progress 
            FROM (
                SELECT c.MaCV, 
                IFNULL((SELECT PhanTramHoanThanh FROM BaoCaoTienDo b WHERE b.MaCV = c.MaCV ORDER BY b.NgayGui DESC LIMIT 1), 0) as latest_progress
                FROM CongViec c
            ) as sub
        `);
        const [lateStat] = await db.execute(`
            SELECT COUNT(*) as count 
            FROM CongViec c 
            WHERE c.NgayKetThuc < NOW() 
            AND IFNULL((SELECT PhanTramHoanThanh FROM BaoCaoTienDo b WHERE b.MaCV = c.MaCV ORDER BY b.NgayGui DESC LIMIT 1), 0) < 100
        `);

        res.json({
            totalUsers: nsCount[0].count,
            totalTasks: cvCount[0].count,
            lateTasks: lateStat[0].count,
            percentComplete: progressStat[0].avg_progress || 0
        });
    } catch (error) {
        console.error('Stats error:', error);
        res.status(500).json({ message: 'Lỗi server khi lấy thống kê.' });
    }
});

// GET / - List users
router.get('/', isAdmin, async (req, res) => {
    try {
        const { search, status } = req.query;
        let query = 'SELECT MaNS as user_id, MaNS as employee_code, Email as email, HoTen as full_name, Quyen as role, NgaySinh, HinhAnh as avatar_url, TrangThai as status FROM NhanSu';
        let params = [];
        let whereClauses = [];

        if (search) {
            whereClauses.push('(MaNS LIKE ? OR HoTen LIKE ? OR Email LIKE ?)');
            params.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }

        if (status) {
            whereClauses.push('TrangThai = ?');
            params.push(status);
        }

        if (whereClauses.length > 0) {
            query += ' WHERE ' + whereClauses.join(' AND ');
        }

        const [users] = await db.execute(query, params);
        res.json(users);
    } catch (error) {
        console.error('Fetch users error:', error);
        res.status(500).json({ message: 'Lỗi server khi lấy danh sách nhân sự.' });
    }
});

// POST / - Add new user
router.post('/', isAdmin, async (req, res) => {
    try {
        const { employee_code, email, password, full_name, role, status } = req.body;
        if (!employee_code || !email || !password || !full_name) {
            return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin.' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const d = new Date();
        d.setFullYear(d.getFullYear() - 25);
        await db.execute(
            'INSERT INTO NhanSu (MaNS, HoTen, Email, MatKhau, Quyen, NgaySinh, TrangThai) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [employee_code, full_name, email, hashedPassword, role || 'staff', d, status || 'active']
        );
        res.status(201).json({ message: 'Thêm nhân sự thành công.' });
    } catch (error) {
        console.error('Post error:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            if (error.sqlMessage.includes('nhansu.Email')) {
                return res.status(409).json({ message: 'Email này đã được sử dụng bởi nhân sự khác.' });
            }
            if (error.sqlMessage.includes('PRIMARY')) {
                return res.status(409).json({ message: 'Mã nhân sự này đã tồn tại trong hệ thống.' });
            }
            return res.status(409).json({ message: 'Dữ liệu bị trùng lặp: ' + error.sqlMessage });
        }
        res.status(500).json({ message: 'Lỗi server khi thêm nhân sự.' });
    }
});

// PUT /:id - Update user (Self or Admin) + Avatar
router.put('/:id', (req, res, next) => {
    console.log(`[DEBUG] PUT Request received for ID: ${req.params.id}`);
    upload.single('avatar')(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            console.error('[ERROR] Multer Error:', err.code, err.message);
            if (err.code === 'LIMIT_FILE_SIZE') return res.status(400).json({ message: 'Tệp quá lớn. Giới hạn 10MB.' });
            return res.status(400).json({ message: `Lỗi tải tệp: ${err.message}` });
        } else if (err) {
            console.error('[ERROR] Custom Upload Error:', err.message);
            return res.status(400).json({ message: err.message });
        }
        console.log('[DEBUG] File upload processed successfully');
        next();
    });
}, isSelfOrAdmin, async (req, res) => {
    try {
        const { id } = req.params; 
        const { full_name, email, role, status } = req.body;
        const avatarFile = req.file;

        console.log('[DEBUG] Updating DB for User:', id);
        console.log('[DEBUG] Fields:', { full_name, email, status, hasFile: !!avatarFile });

        if (!full_name || full_name.trim().length < 6) {
            return res.status(400).json({ message: 'Họ và tên phải có ít nhất 6 ký tự.' });
        }

        let query = 'UPDATE NhanSu SET HoTen = ?, Email = ?, Quyen = ?, TrangThai = ?';
        let params = [full_name, email, role || 'staff', status || 'active'];

        if (avatarFile) {
            const avatarUrl = `/uploads/${avatarFile.filename}`;
            query += ', HinhAnh = ?';
            params.push(avatarUrl);
        }

        query += ' WHERE MaNS = ?';
        params.push(id);

        const [result] = await db.execute(query, params);
        console.log('[DEBUG] DB Update Result:', result.affectedRows, 'rows affected');
        
        res.json({ 
            message: 'Cập nhật hồ sơ thành công!',
            avatar_url: avatarFile ? `/uploads/${avatarFile.filename}` : undefined
        });
    } catch (error) {
        console.error('[FATAL ERROR] Update Route crashed:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'Email này đã được sử dụng bởi nhân sự khác.' });
        }
        res.status(500).json({ message: 'Lỗi máy chủ nghiêm trọng khi cập nhật hồ sơ.' });
    }
});

module.exports = router;
