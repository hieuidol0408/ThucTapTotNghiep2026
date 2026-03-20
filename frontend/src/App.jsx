import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Login from './components/Login';
import './App.css';

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
                    <span>IT-STU WORK</span>
                </div>
                <nav className="sidebar-nav">
                    <div className="nav-item active">Dashboard</div>
                    <div className="nav-item">Công việc của tôi</div>
                    <div className="nav-item">Thông báo</div>
                    <div className="nav-item">Báo cáo</div>
                    <div className="nav-item">Cài đặt</div>
                </nav>
                <button className="logout-btn" onClick={logoutUser}>
                    Đăng xuất
                </button>
            </aside>
            
            <main className="main-content">
                <header className="header">
                    <h2>Tổng quan công việc</h2>
                    <div className="user-profile">
                        <div className="user-info text-right mr-2">
                            <div className="font-bold">{user.full_name}</div>
                            <div className="text-xs text-gray-500">{user.role.toUpperCase()}</div>
                        </div>
                        <div className="avatar">
                            {user.full_name.charAt(0)}
                        </div>
                    </div>
                </header>
                
                <div className="page-body">
                    <div className="stats-grid">
                        <div className="stat-card">
                            <div className="stat-label">Tổng công việc</div>
                            <div className="stat-value">12</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-label">Đang thực hiện</div>
                            <div className="stat-value">5</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-label">Đã hoàn thành</div>
                            <div className="stat-value">7</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-label">Trễ hạn</div>
                            <div className="stat-value" style={{color: '#ef4444'}}>0</div>
                        </div>
                    </div>
                    
                    <div className="content-placeholder">
                        <h3>Chưa có dữ liệu danh sách công việc</h3>
                        <p>Thông tin chi tiết về các công việc sẽ được hiển thị tại đây.</p>
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
