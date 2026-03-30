const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const subjectRoutes = require('./routes/subjects');
const taskRoutes = require('./routes/tasks');

const app = express();

// Middleware hỗ trợ CORS (Cho phép Frontend truy cập API) và xử lý JSON
app.use(cors());
app.use(express.json());

// Global Request Logger: Ghi nhận mọi yêu cầu gửi đến Server (Để debug)
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// Định nghĩa các Route chính cho API
app.use('/api/auth', authRoutes); // Tuyến đường xác thực (Login)
app.use('/api/users', userRoutes); // Tuyến đường quản lý nhân sự
app.use('/api/subjects', subjectRoutes); // Tuyến đường quản lý môn học & phân công
app.use('/api/tasks', taskRoutes); // Tuyến đường quản lý công việc (Bạn của user mần)

// Serving Frontend Static Files
const frontendPath = path.join(__dirname, '..', 'frontend', 'dist');
app.use(express.static(frontendPath));

// Client-side Routing Catch-all (SPA fallback)
app.use((req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running at http://localhost:${PORT}`);
    console.log(`Neu khong vao duoc localhost, hay thu: http://127.0.0.1:${PORT}`);
});
app.use('/api/reminders', require('./routes/reminders'));
