import React, { useState, useEffect, useMemo } from 'react';
import { fetchUsers, addUser, updateUser, deleteUser } from '../api/users';
import '../StaffManagementWow.css';

const StaffManagement = () => {
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    
    // Form state
    const [showForm, setShowForm] = useState(false);
    const [editId, setEditId] = useState(null);
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        full_name: '',
        role: 'staff'
    });

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async (query = '') => {
        setLoading(true);
        try {
            const data = await fetchUsers(query);
            setUsers(data);
            setError('');
        } catch (err) {
            setError('Không thể tải danh sách nhân sự.');
        } finally {
            setLoading(false);
        }
    };

    // Calculate Stats
    const stats = useMemo(() => {
        const now = new Date();
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        
        return {
            total: users.length,
            admins: users.filter(u => u.role === 'admin').length,
            staff: users.filter(u => u.role === 'staff').length,
            recent: users.filter(u => new Date(u.created_at) > sevenDaysAgo).length
        };
    }, [users]);

    const handleSearch = (e) => {
        setSearch(e.target.value);
        loadUsers(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editId) {
                await updateUser(editId, formData);
                setMessage('💾 Cập nhật thông tin nhân sự thành công!');
            } else {
                await addUser(formData);
                setMessage('✨ Đã thêm nhân sự mới vào hệ thống!');
            }
            setShowForm(false);
            setEditId(null);
            setFormData({ username: '', password: '', full_name: '', role: 'staff' });
            loadUsers(search);
            setTimeout(() => setMessage(''), 4000);
        } catch (err) {
            setError(err.response?.data?.message || 'Có lỗi xảy ra trong quá trình xử lý.');
        }
    };

    const handleEdit = (user) => {
        setEditId(user.id);
        setFormData({
            username: user.username,
            password: '', 
            full_name: user.full_name,
            role: user.role
        });
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Hành động này không thể hoàn tác. Bạn có chắc chắn muốn xóa nhân sự này?')) return;
        try {
            await deleteUser(id);
            setMessage('🗑️ Đã gỡ bỏ nhân sự khỏi hệ thống.');
            loadUsers(search);
            setTimeout(() => setMessage(''), 4000);
        } catch (err) {
            setError(err.response?.data?.message || 'Lỗi khi yêu cầu xóa.');
        }
    };

    return (
        <div className="staff-wow-container">
            {/* Immersive Background */}
            <div className="staff-wow-bg"></div>

            {/* Premium Hero Banner */}
            <div className="wow-header">
                <div className="wow-header-left">
                    <h1>Hệ thống Nhân sự</h1>
                    <p>Quản lý đội ngũ cán bộ và giảng viên Khoa IT-STU</p>
                </div>
                <button 
                    className={`btn-wow ${showForm ? 'btn-wow-cancel' : ''}`} 
                    onClick={() => {
                        setShowForm(!showForm);
                        setEditId(null);
                        setFormData({ username: '', password: '', full_name: '', role: 'staff' });
                    }}
                >
                    {showForm ? 'Hủy bỏ thao tác' : (
                        <>
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                            Khai báo nhân sự mới
                        </>
                    )}
                </button>
            </div>

            {message && <div style={{background:'rgba(16,185,129,0.1)', color:'#059669', padding:'1.25rem 2rem', borderRadius:'20px', marginBottom:'2.5rem', border:'1px solid rgba(16,185,129,0.2)', fontWeight:'800', fontSize:'1.05rem', animation:'fadeSlideDown 0.4s ease-out'}}> {message} </div>}
            {error && <div style={{background:'rgba(239,68,68,0.1)', color:'#dc2626', padding:'1.25rem 2rem', borderRadius:'20px', marginBottom:'2.5rem', border:'1px solid rgba(239,68,68,0.2)', fontWeight:'800', fontSize:'1.05rem', animation:'fadeSlideDown 0.4s ease-out'}}> {error} </div>}

            {/* High-End Stats Visualization */}
            <div className="wow-stats-grid">
                <div className="wow-stat-card">
                    <div className="wow-stat-icon icon-indigo">
                        <svg width="28" height="28" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                    </div>
                    <div className="wow-stat-label">Tổng quy mô</div>
                    <div className="wow-stat-value">{stats.total}</div>
                </div>
                <div className="wow-stat-card">
                    <div className="wow-stat-icon icon-purple">
                        <svg width="28" height="28" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
                    </div>
                    <div className="wow-stat-label">Quản trị viên</div>
                    <div className="wow-stat-value">{stats.admins}</div>
                </div>
                <div className="wow-stat-card">
                    <div className="wow-stat-icon icon-cyan">
                        <svg width="28" height="28" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                    </div>
                    <div className="wow-stat-label">Thành viên</div>
                    <div className="wow-stat-value">{stats.staff}</div>
                </div>
                <div className="wow-stat-card">
                    <div className="wow-stat-icon icon-rose">
                        <svg width="28" height="28" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    </div>
                    <div className="wow-stat-label">Mới trong tuần</div>
                    <div className="wow-stat-value">{stats.recent}</div>
                </div>
            </div>

            {/* Immersive Glass Form */}
            {showForm && (
                <div className="wow-form-card">
                    <div className="wow-form-section-header">
                        <div className="wow-form-icon-container">
                            <svg width="32" height="32" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path></svg>
                        </div>
                        <div className="wow-form-title">
                            <h4>{editId ? 'Hiệu chỉnh thông tin' : 'Thiết lập nhân sự mới'}</h4>
                            <p>Cung cấp định danh và phân quyền truy cập hệ thống</p>
                        </div>
                    </div>
                    
                    <form onSubmit={handleSubmit}>
                        <div className="wow-form-grid">
                            <div className="wow-input-group">
                                <label>Tên đăng nhập (Username)</label>
                                <div className="wow-input-field-wrapper">
                                    <svg className="wow-field-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                                    <input 
                                        type="text" 
                                        value={formData.username}
                                        onChange={(e) => setFormData({...formData, username: e.target.value})}
                                        disabled={!!editId}
                                        placeholder="Tên định danh duy nhất..."
                                        required
                                    />
                                </div>
                            </div>
                            <div className="wow-input-group">
                                <label>Họ và tên đầy đủ</label>
                                <div className="wow-input-field-wrapper">
                                    <svg className="wow-field-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                    <input 
                                        type="text" 
                                        value={formData.full_name}
                                        onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                                        placeholder="Nhập tên hiển thị..."
                                        required
                                    />
                                </div>
                            </div>
                            <div className="wow-input-group">
                                <label>Mật khẩu {editId && <span className="opacity-50 text-sm font-medium ml-1">(Để trống nếu giữ nguyên)</span>}</label>
                                <div className="wow-input-field-wrapper">
                                    <svg className="wow-field-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                                    <input 
                                        type="password" 
                                        value={formData.password}
                                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                                        placeholder="••••••••"
                                        required={!editId}
                                    />
                                </div>
                            </div>
                            <div className="wow-input-group">
                                <label>Vai trò hệ thống</label>
                                <div className="wow-input-field-wrapper">
                                    <svg className="wow-field-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
                                    <select 
                                        value={formData.role}
                                        onChange={(e) => setFormData({...formData, role: e.target.value})}
                                    >
                                        <option value="staff">Cán bộ / Giảng viên</option>
                                        <option value="admin">Quản trị viên (Full Access)</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div style={{marginTop:'3.5rem', textAlign:'center'}}>
                            <button type="submit" className="btn-wow" style={{width:'100%', maxWidth:'450px', justifyContent:'center'}}>
                                <span className="mr-2">{editId ? '💾' : '🚀'}</span>
                                {editId ? 'Cập nhật thay đổi ngay' : 'Kích hoạt tài khoản nhân sự'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Floating List UI */}
            <div className="wow-list-section">
                <div className="wow-list-header">
                    <h2>Đội ngũ nhân sự</h2>
                    <div style={{position:'relative'}}>
                        <input 
                            type="text" 
                            className="wow-search-input"
                            placeholder="Tìm kiếm nhân sự thông minh..." 
                            value={search}
                            onChange={handleSearch}
                        />
                        <svg style={{position:'absolute', left:'20px', top:'50%', transform:'translateY(-50%)', color:'#94a3b8', width:'22px', height:'22px'}} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                    </div>
                </div>

                <div style={{display:'flex', flexDirection:'column', gap:'1.25rem'}}>
                    {loading ? (
                        <div style={{textAlign:'center', padding:'5rem', color:'#64748b', fontWeight:'700'}}>⏳ Đang tải dữ liệu đội ngũ...</div>
                    ) : users.length === 0 ? (
                        <div style={{textAlign:'center', padding:'5rem', color:'#64748b', fontWeight:'700'}}>📂 Chưa có nhân sự nào trong danh sách.</div>
                    ) : (
                        users.map(u => (
                            <div className="wow-staff-row" key={u.id}>
                                <div className="wow-staff-id">#ID-{u.id}</div>
                                <div className="wow-staff-info">
                                    <div className="wow-staff-avatar">{u.full_name.charAt(0)}</div>
                                    <div className="wow-staff-meta">
                                        <span className="wow-staff-name">{u.full_name}</span>
                                        <span className="wow-staff-username">@{u.username}</span>
                                    </div>
                                </div>
                                <div>
                                    <div className={`wow-role-badge ${u.role === 'admin' ? 'wow-role-admin' : 'wow-role-staff'}`}>
                                        {u.role === 'admin' ? 'Quản trị viên' : 'Nhân sự'}
                                    </div>
                                </div>
                                <div className="wow-date-cell">
                                    <span style={{marginRight:'8px'}}>📅</span>
                                    {new Date(u.created_at).toLocaleDateString('vi-VN')}
                                </div>
                                <div className="wow-list-actions">
                                    <button className="btn-icon-wow edit" onClick={() => handleEdit(u)} title="Hiệu chỉnh">
                                        <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                                    </button>
                                    <button className="btn-icon-wow delete" onClick={() => handleDelete(u.id)} title="Gỡ bỏ">
                                        <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default StaffManagement;
