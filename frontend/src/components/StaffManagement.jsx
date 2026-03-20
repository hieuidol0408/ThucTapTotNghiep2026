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
                <div className="form-card elevation-2 mb-8">
                    <h4 className="text-lg font-semibold mb-6">{editId ? 'Cập nhật thông tin nhân sự' : 'Thông tin nhân sự mới'}</h4>
                    <form onSubmit={handleSubmit} className="crud-form">
                        <div className="form-grid">
                            <div className="form-group">
                                <label>Tên đăng nhập (Username)</label>
                                <input 
                                    type="text" 
                                    value={formData.username}
                                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                                    disabled={!!editId}
                                    placeholder="Ví dụ: nva_it"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Họ và tên</label>
                                <input 
                                    type="text" 
                                    value={formData.full_name}
                                    onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                                    placeholder="Ví dụ: Nguyễn Văn A"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Mật khẩu {editId && <span className="text-xs opacity-70">(Bỏ trống nếu không đổi)</span>}</label>
                                <input 
                                    type="password" 
                                    value={formData.password}
                                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                                    placeholder="••••••••"
                                    required={!editId}
                                />
                            </div>
                            <div className="form-group">
                                <label>Quyền hạn</label>
                                <div className="select-wrapper">
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
                        <div className="form-actions mt-6">
                            <button type="submit" className="btn-main">
                                {editId ? 'Lưu cập nhật' : 'Xác nhận tạo tài khoản'}
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
