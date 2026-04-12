import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { fetchTasks } from '../api/tasks';
import { generateHRMReport } from '../utils/dashboardExport';
import stuLogo from '../assets/stu_logo.png';
import '../DashboardWow.css';

const StatCardWow = ({ label, value, trend, isUp, icon: Icon, colorClass }) => (
    <div className="wow-stat-card">
        <div className="wow-stat-header">
            <div className={`wow-stat-icon-circ ${colorClass}`}>
                <Icon className="w-7 h-7" />
            </div>
            {trend && (
                <div className={`wow-stat-trend ${isUp ? 'trend-up-wow' : 'trend-down-wow'}`}>
                    {isUp ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
                    ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6"></path></svg>
                    )}
                    <span>{trend}</span>
                </div>
            )}
        </div>
        <div className="wow-stat-body">
            <span className="wow-stat-label">{label}</span>
            <span className="wow-stat-value">{value}</span>
        </div>
    </div>
);

const DashboardHome = ({ user }) => {
    const [recentUsers, setRecentUsers] = useState([]);
    const [statsData, setStatsData] = useState({
        totalUsers: 0,
        totalTasks: 0,
        completedTasks: 0,
        lateTasks: 0,
        percentComplete: 0
    });
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [downloading, setDownloading] = useState(false);
    const [now, setNow] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                const headers = { Authorization: `Bearer ${token}` };
                
                const [usersRes, statsRes, tasksData] = await Promise.all([
                    axios.get('/api/users', { headers }),
                    axios.get('/api/users/stats', { headers }),
                    fetchTasks()
                ]);
                
                setRecentUsers(usersRes.data.slice(-5).reverse());
                setStatsData(statsRes.data);
                setTasks(tasksData);
            } catch (err) {
                console.error('Error fetching dashboard data:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleDownloadReport = async () => {
        console.log('PDF Export V2 Triggered');
        try {
            setDownloading(true);
            await generateHRMReport({
                stats: statsData,
                recentUsers: recentUsers || [],
                tasks: tasks || [],
                logoUrl: stuLogo
            });
            console.log('PDF generation finished successfully');
        } catch (err) {
            console.error('Lỗi xuất PDF:', err);
            alert('Có lỗi xảy ra khi tạo báo cáo PDF. Vui lòng tải lại trang và thử lại.');
        } finally {
            setDownloading(false);
        }
    };

    const statsConfig = [
        { label: 'Tổng nhân viên', value: statsData.totalUsers, trend: '+12%', isUp: true, colorClass: 'icon-blue-dash', icon: (props) => (
            <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
        )},
        { label: 'Công việc mới', value: statsData.totalTasks, trend: '+5%', isUp: true, colorClass: 'icon-indigo-dash', icon: (props) => (
            <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        )},
        { label: 'Hoàn thành', value: statsData.percentComplete + '%', trend: '+8%', isUp: true, colorClass: 'icon-emerald-dash', icon: (props) => (
            <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        )},
        { label: 'Báo cáo trễ', value: statsData.lateTasks.toString().padStart(2, '0'), trend: '-2%', isUp: false, colorClass: 'icon-rose-dash', icon: (props) => (
            <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
        )},
    ];

    return (
        <div className="dashboard-wow-container">
            {/* Mesh Background */}
            <div className="dashboard-wow-bg"></div>

            {/* Premium Welcome Banner */}
            <header className="wow-welcome-banner">
                <div className="wow-welcome-left">
                    <h1>Chào mừng, <span>{user.full_name.split(' ').pop()}</span> ✨</h1>
                    <p>
                        Hôm nay là {now.toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        <span className="wow-live-clock">{now.toLocaleTimeString('vi-VN')}</span>
                    </p>
                </div>
                <div className="wow-welcome-actions">
                    <button 
                        className="btn-wow-secondary" 
                        onClick={handleDownloadReport}
                        disabled={downloading}
                    >
                        {downloading ? 'Đang tạo...' : 'Tải báo cáo'}
                    </button>
                    <Link to="/dashboard/tasks" style={{textDecoration:'none'}}>
                        <button className="btn-wow-primary">Giao việc mới</button>
                    </Link>
                </div>
            </header>

            {/* Stats Grid */}
            <div className="wow-stats-grid">
                {statsConfig.map((s, i) => <StatCardWow key={i} {...s} />)}
            </div>

            {/* Content Grid */}
            <div className="wow-content-grid">
                {/* Performance Chart Widget */}
                <div className="wow-glass-panel">
                    <div className="wow-panel-header">
                        <h3>Hiệu suất làm việc</h3>
                        <select 
                            style={{
                                background: 'rgba(255, 255, 255, 0.8)',
                                border: '1px solid #e2e8f0',
                                padding: '0.4rem 1rem',
                                borderRadius: '12px',
                                fontWeight: 700,
                                color: '#475569',
                                cursor: 'pointer'
                            }}
                        >
                            <option>7 ngày qua</option>
                            <option>30 ngày qua</option>
                        </select>
                    </div>
                    <div className="wow-chart-box">
                        <svg viewBox="0 0 400 150" className="wow-sparkline">
                            <defs>
                                <linearGradient id="wow-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="#4f46e5" />
                                    <stop offset="100%" stopColor="#0ea5e9" />
                                </linearGradient>
                            </defs>
                            <path 
                                d="M0,130 C40,110 80,140 120,90 C160,40 200,80 240,50 C280,20 320,60 360,30 L400,20" 
                                fill="none" 
                                stroke="url(#wow-gradient)" 
                                strokeWidth="6" 
                                strokeLinecap="round"
                            />
                        </svg>
                        <div className="wow-chart-labels">
                            <span>Thứ 2</span><span>Thứ 3</span><span>Thứ 4</span><span>Thứ 5</span><span>Thứ 6</span><span>Thứ 7</span><span>CN</span>
                        </div>
                    </div>
                </div>

                {/* Recent Staff Widget */}
                <div className="wow-glass-panel">
                    <div className="wow-panel-header">
                        <h3>Nhân sự mới</h3>
                        <Link to="/dashboard/staff" style={{color: '#4f46e5', fontWeight: 800, textDecoration: 'none', fontSize: '0.95rem'}}>Xem tất cả</Link>
                    </div>
                    <div className="wow-mini-list">
                        {loading ? (
                            <div style={{textAlign: 'center', padding: '2rem', color: '#94a3b8', fontWeight: 700}}>Đang truy cập dữ liệu...</div>
                        ) : recentUsers.map(u => (
                            <div key={u.id} className="wow-mini-item">
                                <div className="wow-mini-avatar">{u.full_name.charAt(0)}</div>
                                <div className="wow-mini-info">
                                    <span className="wow-mini-name">{u.full_name}</span>
                                    <span className="wow-mini-role">{u.role === 'admin' ? 'Quản trị' : 'Nhân viên'}</span>
                                </div>
                                <span className="wow-mini-date">
                                    {u.created_at ? new Date(u.created_at).toLocaleDateString('vi-VN') : 'Vừa xong'}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardHome;
