import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Login from './components/Login';
import StaffManagement from './components/StaffManagement';
import SubjectAssignment from './components/SubjectAssignment';
import DashboardHome from './components/DashboardHome';
import './App.css';

// ... (existing Icons)
const IconDashboard = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H18a2.25 2.25 0 0 1-2.25-2.25v-2.25Z" />
    </svg>
);

const IconUsers = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
    </svg>
);

const IconTasks = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
    </svg>
);

const IconReports = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0v16.5m0 0h13.5m-13.5 0h16.5" />
    </svg>
);

const IconSettings = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 0 0-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 0 0-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 0 0-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 0 0-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 0 0 1.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    </svg>
);

const IconBook = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
    </svg>
);

const NavItem = ({ icon: Icon, label, path }) => {
    const location = useLocation();
    const isActive = location.pathname === path;
    
    return (
        <Link to={path} className={`nav-item ${isActive ? 'active' : ''}`}>
            <Icon className="nav-icon" />
            <span>{label}</span>
        </Link>
    );
};

const StatCard = ({ label, value, icon: Icon, colorClass }) => (
    <div className={`stats-card ${colorClass}`}>
        <div className="card-icon">
            <Icon className="w-6 h-6" />
        </div>
        <div className="card-content">
            <span className="card-label">{label}</span>
            <span className="card-value">{value}</span>
        </div>
    </div>
);

const ProtectedRoute = ({ children }) => {
    const { user, loading } = useContext(AuthContext);
    if (loading) return null; // Chờ load xong từ localStorage
    if (!user) return <Navigate to="/login" />;
    return children;
};

// DashboardHome logic moved to separate file

const DashboardLayout = () => {
    const { user, logoutUser } = useContext(AuthContext);
    const location = useLocation();

    const getPageTitle = () => {
        if (location.pathname === '/dashboard/staff') return 'Quản lý nhân sự';
        if (location.pathname === '/dashboard/subjects') return 'Phân công môn học';
        return 'Tổng quan hệ thống';
    };

    return (
        <div className="dashboard-layout">
            <aside className="sidebar">
                <div className="sidebar-logo">
                    <div className="logo-box">IT</div>
                    <span>STU WORK</span>
                </div>
                <nav className="sidebar-nav">
                    <NavItem icon={IconDashboard} label="Dashboard" path="/dashboard" />
                    <NavItem icon={IconUsers} label="Quản lý nhân sự" path="/dashboard/staff" />
                    <NavItem icon={IconBook} label="Phân công môn học" path="/dashboard/subjects" />
                    <NavItem icon={IconTasks} label="Công việc của tôi" path="/dashboard/tasks" />
                    <NavItem icon={IconReports} label="Báo cáo" path="/dashboard/reports" />
                    <NavItem icon={IconSettings} label="Cài đặt" path="/dashboard/settings" />
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
                        <h2>{getPageTitle()}</h2>
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
                
                <Routes>
                    <Route index element={<DashboardHome user={user} />} />
                    <Route path="staff" element={<StaffManagement />} />
                    <Route path="subjects" element={<SubjectAssignment />} />
                </Routes>
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
                        path="/dashboard/*" 
                        element={
                            <ProtectedRoute>
                                <DashboardLayout />
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
