import React, { useState, useEffect } from 'react';
import axios from 'axios';

const IconTrendUp = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
);

const StatCard = ({ label, value, trend, icon: Icon, gradient }) => (
    <div className={`premium-card ${gradient}`}>
        <div className="card-header">
            <div className="card-icon-wrapper">
                <Icon className="w-6 h-6 text-white" />
            </div>
            {trend && (
                <div className="card-trend">
                    <IconTrendUp />
                    <span>{trend}</span>
                </div>
            )}
        </div>
        <div className="card-body">
            <h4 className="card-label">{label}</h4>
            <h2 className="card-value">{value}</h2>
        </div>
    </div>
);

const DashboardHome = ({ user }) => {
    const [recentUsers, setRecentUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Chào buổi sáng';
        if (hour < 18) return 'Chào buổi chiều';
        return 'Chào buổi tối';
    };

    useEffect(() => {
        const fetchRecent = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get('/api/users', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setRecentUsers(response.data.slice(0, 5)); // Get last 5
            } catch (err) {
                console.error('Error fetching recent users:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchRecent();
    }, []);

    const stats = [
        { label: 'Tổng nhân viên', value: '124', trend: '+12%', icon: (props) => (
            <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
        ), gradient: 'g-blue' },
        { label: 'Công việc mới', value: '45', trend: '+5%', icon: (props) => (
            <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        ), gradient: 'g-indigo' },
        { label: 'Hoàn thành', value: '89%', trend: '+8%', icon: (props) => (
            <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        ), gradient: 'g-green' },
        { label: 'Báo cáo trễ', value: '03', trend: '-2%', icon: (props) => (
            <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
        ), gradient: 'g-red' },
    ];

    return (
        <div className="dashboard-home animate-in">
            <header className="welcome-section">
                <div className="welcome-text">
                    <h1>{getGreeting()}, <span className="highlight-text">{user.full_name}</span> ✨</h1>
                    <p>Hôm nay là {new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
                <div className="quick-actions">
                    <button className="btn-secondary">Tải báo cáo</button>
                    <button className="btn-primary">Tạo công việc mới</button>
                </div>
            </header>

            <div className="stats-grid-modern">
                {stats.map((s, i) => <StatCard key={i} {...s} />)}
            </div>

            <div className="dashboard-content-grid">
                <div className="content-card chart-widget">
                    <div className="card-header-ui">
                        <h3>Hiệu suất làm việc</h3>
                        <select className="select-minimal">
                            <option>7 ngày qua</option>
                            <option>30 ngày qua</option>
                        </select>
                    </div>
                    <div className="mock-chart-container">
                        <svg viewBox="0 0 400 150" className="sparkline-main">
                            <path 
                                d="M0,120 Q50,80 100,100 T200,40 T300,60 T400,20" 
                                fill="none" 
                                stroke="url(#gradient-line)" 
                                strokeWidth="4" 
                                strokeLinecap="round"
                            />
                            <defs>
                                <linearGradient id="gradient-line" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="#4f46e5" />
                                    <stop offset="100%" stopColor="#9333ea" />
                                </linearGradient>
                            </defs>
                        </svg>
                        <div className="chart-labels">
                            <span>T2</span><span>T3</span><span>T4</span><span>T5</span><span>T6</span><span>T7</span><span>CN</span>
                        </div>
                    </div>
                </div>

                <div className="content-card recent-staff-widget">
                    <div className="card-header-ui">
                        <h3>Nhân sự mới cập nhật</h3>
                        <a href="/dashboard/staff" className="link-more">Xem tất cả</a>
                    </div>
                    <div className="mini-staff-list">
                        {loading ? (
                            <div className="loading-mini">Đang tải...</div>
                        ) : recentUsers.map(u => (
                            <div key={u.id} className="mini-staff-item">
                                <div className="mini-avatar">{u.full_name.charAt(0)}</div>
                                <div className="mini-info">
                                    <span className="name">{u.full_name}</span>
                                    <span className="role">{u.role === 'admin' ? 'Quản trị' : 'Nhân viên'}</span>
                                </div>
                                <span className="time">{new Date(u.created_at).toLocaleDateString('vi-VN')}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardHome;
