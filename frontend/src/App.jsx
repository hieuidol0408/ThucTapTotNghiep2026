import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Login from './components/Login';
import './App.css';

// --- Icons (SVG Heroicons) ---
const IconDashboard = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
    </svg>
);

const IconTasks = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.375M9 18h3.375m-3.375-3h1.5m2.25 2.25h1.5m1.125-1.35 1.125 1.125 3.375-3.375M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
    </svg>
);

const IconReports = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
    </svg>
);

const IconSettings = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 0 1 0 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 0 1 0-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    </svg>
);

const NavItem = ({ icon: Icon, label, active = false }) => (
    <div className={`nav-item ${active ? 'active' : ''}`}>
        <Icon />
        <span>{label}</span>
    </div>
);

const StatCard = ({ label, value, icon: Icon, colorClass }) => (
    <div className={`stat-card ${colorClass}`}>
        <div className="stat-icon">
            <Icon />
        </div>
        <div className="stat-content">
            <div className="stat-label">{label}</div>
            <div className="stat-value">{value}</div>
        </div>
    </div>
);

const ProtectedRoute = ({ children }) => {
    const { user, loading } = useContext(AuthContext);
    if (loading) return <div className="loading-screen">Đang tải...</div>;
    if (!user) return <Navigate to="/login" />;
    return children;
};

const Dashboard = () => {
    const { user, logoutUser } = useContext(AuthContext);
    
    return (
        <div className="dashboard-layout">
            <aside className="sidebar">
                <div className="sidebar-logo">
                    <div className="logo-box">IT</div>
                    <span>STU WORK</span>
                </div>
                <nav className="sidebar-nav">
                    <NavItem icon={IconDashboard} label="Dashboard" active />
                    <NavItem icon={IconTasks} label="Công việc của tôi" />
                    <NavItem icon={IconReports} label="Báo cáo" />
                    <NavItem icon={IconSettings} label="Cài đặt" />
                </nav>
                <div className="sidebar-footer">
                    <button className="logout-btn" onClick={logoutUser}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
                        </svg>
                        Đăng xuất
                    </button>
                </div>
            </aside>
            
            <main className="main-content">
                <header className="header">
                    <div className="header-left">
                        <h2>Tổng quan hệ thống</h2>
                        <p className="header-subtitle">Chào mừng trở lại, {user.full_name}!</p>
                    </div>
                    <div className="user-profile">
                        <div className="user-info">
                            <span className="user-name">{user.full_name}</span>
                            <span className="user-role badge">{user.role === 'admin' ? 'Quản trị viên' : 'Nhân viên'}</span>
                        </div>
                        <div className="avatar">
                            {user.full_name.charAt(0)}
                        </div>
                    </div>
                </header>
                
                <div className="page-body">
                    <div className="stats-grid">
                        <StatCard label="Tổng công việc" value="12" icon={IconTasks} colorClass="c-blue" />
                        <StatCard label="Đang thực hiện" value="5" icon={IconDashboard} colorClass="c-orange" />
                        <StatCard label="Đã hoàn thành" value="7" icon={IconTasks} colorClass="c-green" />
                        <StatCard label="Trễ hạn" value="0" icon={IconReports} colorClass="c-red" />
                    </div>
                    
                    <div className="data-section">
                        <div className="section-header">
                            <h3>Lịch trình gần đây</h3>
                            <button className="btn-small">Xem tất cả</button>
                        </div>
                        <div className="empty-state">
                            <div className="empty-icon">📂</div>
                            <h4>Chưa có dữ liệu danh sách công việc</h4>
                            <p>Thông tin chi tiết về các công việc sẽ được hiển thị tại đây khi hệ thống có dữ liệu.</p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route 
                        path="/dashboard" 
                        element={
                            <ProtectedRoute>
                                <Dashboard />
                            </ProtectedRoute>
                        } 
                    />
                    <Route path="/" element={<Navigate to="/login" />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;
