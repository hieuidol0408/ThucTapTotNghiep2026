import React, { useContext, useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Login from './components/Login';
import StaffManagement from './components/StaffManagement';
import SubjectAssignment from './components/SubjectAssignment';
import DashboardHome from './components/DashboardHome';
import TaskAssignment from './components/TaskAssignment';
import ReminderManagement from './components/ReminderManagement';
import Profile from './components/Profile';
import stuLogo from './assets/stu_logo.png';
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

const IconClipboardList = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" />
    </svg>
);

const IconClock = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
);

// Link Component tùy chỉnh để hiển thị các mục trên thanh Sidebar
const NavItem = ({ icon: Icon, label, path }) => {
    const location = useLocation();
    const isActive = location.pathname === path; // Kiểm tra xem trang hiện tại có trùng với link không
    
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

// Component bảo vệ Route: Chỉ cho phép người dùng đã đăng nhập mới được vào Dashboard
const ProtectedRoute = ({ children }) => {
    const { user, loading } = useContext(AuthContext);
    if (loading) return null; // Chờ hệ thống kiểm tra trạng thái đăng nhập từ LocalStorage
    if (!user) return <Navigate to="/login" />; // Nếu chưa đăng nhập, chuyển hướng về trang Login
    return children;
};

// DashboardHome logic moved to separate file

const getPageTitle = (pathname) => {
    if (pathname === '/dashboard/staff') return 'Quản lý nhân sự';
    if (pathname === '/dashboard/subjects') return 'Quản lý môn học';
    if (pathname === '/dashboard/tasks') return 'Phân công công việc';
    if (pathname === '/dashboard/reminders') return 'Nhắc nhở công việc';
    return 'Trang Chủ';
};

const DashboardLayout = () => {
    const { user, logoutUser } = useContext(AuthContext);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
    const toggleDesktopSidebar = () => setIsDesktopCollapsed(!isDesktopCollapsed);
    const closeSidebar = () => setIsSidebarOpen(false);

    // Close sidebar when route changes on mobile
    useEffect(() => {
        closeSidebar();
    }, [location.pathname]);

    return (
        <div className={`wow-layout-root ${isSidebarOpen ? 'sidebar-open' : ''} ${isDesktopCollapsed ? 'sidebar-desktop-collapsed' : ''}`}>
            {/* Mobile Overlay */}
            {isSidebarOpen && <div className="wow-sidebar-overlay" onClick={closeSidebar}></div>}

            {/* Sidebar - Premium Glassmorphism */}
            <aside className={`wow-sidebar-fixed ${isSidebarOpen ? 'show' : ''}`}>
                <div className="sidebar-logo">
                    <img src={stuLogo} alt="STU Logo" className="logo-img-wow" />
                    <span className="brand-name">STU WORK</span>
                </div>
                
                <nav className="sidebar-nav">
                    <div className="sidebar-section-title">Hệ thống</div>
                    <NavItem icon={IconDashboard} label="Trang Chủ" path="/dashboard" />
                    
                    <div className="sidebar-section-title">Quản lý</div>
                    {user.role === 'admin' && (
                        <NavItem icon={IconUsers} label="Quản lý nhân sự" path="/dashboard/staff" />
                    )}
                    <NavItem 
                        icon={IconBook} 
                        label={user.role === 'admin' ? "Quản lý môn học" : "Môn học của tôi"} 
                        path="/dashboard/subjects" 
                    />
                    <NavItem icon={IconClipboardList} label="Phân công công việc" path="/dashboard/tasks" />
                    {user.role !== 'admin' && (
                        <NavItem icon={IconClock} label="Nhắc nhở công việc" path="/dashboard/reminders" />
                    )}
                </nav>

                <div className="sidebar-footer">
                    <button className="logout-btn" onClick={logoutUser}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" style={{ width: '22px', height: '22px' }}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
                        </svg>
                        <span>Đăng xuất</span>
                    </button>
                </div>
            </aside>

            
            {/* Nội dung chính */}
            <main className="wow-main-area">
                <header className="wow-header-top">
                    <div className="header-left">
                        {/* Toggle button always visible on mobile in the main header */}
                        <button className="mobile-toggle-btn-wow" onClick={toggleSidebar}>
                            {isSidebarOpen ? (
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{width:24,height:24}}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
                            ) : (
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{width:24,height:24}}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16m-7 6h7"></path></svg>
                            )}
                        </button>
                        <button className="desktop-toggle-btn-wow" onClick={toggleDesktopSidebar}>
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{width:24,height:24}}>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16"></path>
                            </svg>
                        </button>
                        <div className="brand-logo-mobile">
                            <img src={stuLogo} alt="Logo" />
                        </div>
                        <div className="title-group-wow">
                            <h2 className="page-title-wow">{getPageTitle(location.pathname)}</h2>
                            <p className="header-subtitle-wow">Chào mừng, {user.full_name.split(' ').pop()}!</p>
                        </div>
                    </div>
                    <div className="user-profile" onClick={() => navigate('/dashboard/profile')} style={{ cursor: 'pointer' }}>
                        <div className="user-info">
                            <div className="user-name">{user.full_name}</div>
                            <div className="user-role-badge">
                                {user.role === 'admin' ? 'Quản trị' : 'Giảng viên'}
                            </div>
                        </div>
                        <div className="avatar-wow" style={user.avatar_url ? {
                            background: `url(${user.avatar_url}) center/cover no-repeat`,
                            border: '2px solid rgba(255,255,255,0.8)'
                        } : {}}>
                            {!user.avatar_url && user.full_name?.charAt(0)}
                        </div>
                    </div>
                </header>
                
                <div className="wow-page-content" key={location.pathname}>
                    <Routes>
                      <Route index element={<DashboardHome user={user} />} />
                      <Route path="staff" element={<StaffManagement />} />
                      <Route path="subjects" element={<SubjectAssignment />} />
                      <Route path="tasks" element={<TaskAssignment />} />
                      {user.role !== 'admin' && (
                          <Route path="reminders" element={<ReminderManagement />} />
                      )}
                      <Route path="profile" element={<Profile />} />
                      <Route path="*" element={<Navigate to="" replace />} />
                    </Routes>
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
