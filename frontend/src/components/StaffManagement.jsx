import React, { useState, useEffect } from 'react';
import { fetchUsers, addUser, updateUser, deleteUser } from '../api/users';

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

    const handleSearch = (e) => {
        setSearch(e.target.value);
        loadUsers(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editId) {
                await updateUser(editId, formData);
                setMessage('Cập nhật thành công!');
            } else {
                await addUser(formData);
                setMessage('Thêm nhân sự mới thành công!');
            }
            setShowForm(false);
            setEditId(null);
            setFormData({ username: '', password: '', full_name: '', role: 'staff' });
            loadUsers(search);
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Có lỗi xảy ra.');
        }
    };

    const handleEdit = (user) => {
        setEditId(user.id);
        setFormData({
            username: user.username,
            password: '', // Don't show old password
            full_name: user.full_name,
            role: user.role
        });
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa nhân sự này?')) return;
        try {
            await deleteUser(id);
            setMessage('Xóa nhân sự thành công!');
            loadUsers(search);
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Lỗi khi xóa.');
        }
    };

    return (
        <div className="staff-management animate-in">
            <div className="section-header">
                <div>
                    <h3 className="text-2xl font-bold">Quản lý nhân sự</h3>
                    <p className="text-muted">Danh sách cán bộ quản lý và nhân viên Khoa IT-STU</p>
                </div>
                <button 
                    className={`btn-primary ${showForm ? 'btn-cancel' : ''}`} 
                    onClick={() => {
                        setShowForm(!showForm);
                        setEditId(null);
                        setFormData({ username: '', password: '', full_name: '', role: 'staff' });
                    }}
                >
                    {showForm ? 'Hủy bỏ' : (
                        <span className="flex items-center">
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                            Thêm nhân sự
                        </span>
                    )}
                </button>
            </div>

            {message && <div className="alert-box success-alert">{message}</div>}
            {error && <div className="alert-box error-alert">{error}</div>}

            {showForm && (
                <div className="form-card animate-in mb-8">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                            <svg width="24" height="24" className="form-header-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path></svg>
                        </div>
                        <h4 className="text-xl font-bold text-slate-800">{editId ? 'Cập nhật thông tin nhân sự' : 'Thông tin nhân sự mới'}</h4>
                    </div>
                    
                    <form onSubmit={handleSubmit} className="crud-form">
                        <div className="form-grid">
                            <div className="form-group-premium">
                                <label>Tên đăng nhập (Username)</label>
                                <div className="input-with-icon">
                                    <svg width="20" height="20" className="input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                                    <input 
                                        type="text" 
                                        value={formData.username}
                                        onChange={(e) => setFormData({...formData, username: e.target.value})}
                                        disabled={!!editId}
                                        placeholder="Ví dụ: nva_it"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="form-group-premium">
                                <label>Họ và tên</label>
                                <div className="input-with-icon">
                                    <svg width="20" height="20" className="input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a5 5 0 00-5 5h10a5 5 0 00-5-5zM2 17a2 2 0 100-4 2 2 0 000 4zM18 17a2 2 0 100-4 2 2 0 000 4z"></path></svg>
                                    <input 
                                        type="text" 
                                        value={formData.full_name}
                                        onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                                        placeholder="Ví dụ: Nguyễn Văn A"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="form-group-premium">
                                <label>Mật khẩu {editId && <span className="text-xs opacity-70">(Bỏ trống nếu không đổi)</span>}</label>
                                <div className="input-with-icon">
                                    <svg width="20" height="20" className="input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                                    <input 
                                        type="password" 
                                        value={formData.password}
                                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                                        placeholder="••••••••"
                                        required={!editId}
                                    />
                                </div>
                            </div>
                            <div className="form-group-premium">
                                <label>Quyền hạn</label>
                                <div className="input-with-icon">
                                    <svg width="20" height="20" className="input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
                                    <select 
                                        value={formData.role}
                                        onChange={(e) => setFormData({...formData, role: e.target.value})}
                                    >
                                        <option value="staff">Nhân viên (Staff)</option>
                                        <option value="admin">Quản trị viên (Admin)</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="form-actions-premium mt-8">
                            <button type="submit" className="btn-main-premium">
                                <span className="mr-2">{editId ? '💾' : '✨'}</span>
                                {editId ? 'Lưu cập nhật thay đổi' : 'Xác nhận khởi tạo tài khoản'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="table-wrapper elevation-1">
                <div className="table-header-ui">
                    <div className="search-container">
                        <svg className="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                        <input 
                            type="text" 
                            placeholder="Tìm theo tên hoặc username..." 
                            value={search}
                            onChange={handleSearch}
                        />
                    </div>
                </div>

                <div className="table-responsive">
                    <table className="modern-table">
                        <thead>
                            <tr>
                                <th>#ID</th>
                                <th>Thông tin nhân sự</th>
                                <th>Quyền hạn</th>
                                <th>Ngày tham gia</th>
                                <th className="text-right">Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="5" className="text-center py-10">Đang tải dữ liệu...</td></tr>
                            ) : users.length === 0 ? (
                                <tr><td colSpan="5" className="text-center py-10">Không tìm thấy nhân sự phù hợp</td></tr>
                            ) : (
                                users.map(u => (
                                    <tr key={u.id}>
                                        <td><span className="text-xs text-muted">ID: {u.id}</span></td>
                                        <td>
                                            <div className="user-entity">
                                                <div className="entity-avatar">{u.full_name.charAt(0)}</div>
                                                <div className="entity-info">
                                                    <span className="entity-name">{u.full_name}</span>
                                                    <span className="entity-username">@{u.username}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`badge ${u.role === 'admin' ? 'badge-admin' : 'badge-staff'}`}>
                                                {u.role === 'admin' ? 'Quản trị' : 'Nhân viên'}
                                            </span>
                                        </td>
                                        <td>{new Date(u.created_at).toLocaleDateString('vi-VN')}</td>
                                        <td>
                                            <div className="table-actions">
                                                <button className="icon-btn edit" onClick={() => handleEdit(u)} title="Sửa">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                                                </button>
                                                <button className="icon-btn delete" onClick={() => handleDelete(u.id)} title="Xóa">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default StaffManagement;
