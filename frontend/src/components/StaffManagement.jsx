import React, { useState, useEffect, useMemo } from 'react';
import { fetchUsers, addUser, updateUser, deleteUser } from '../api/users';
import PaginationWow from './PaginationWow';
import '../StaffManagementWow.css';

const StaffManagement = () => {
    const [users, setUsers] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 3;
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    
    // Form state
    const [showForm, setShowForm] = useState(false);
    const [editId, setEditId] = useState(null);
    const [formData, setFormData] = useState({
        employee_code: '',
        email: '',
        password: '',
        full_name: '',
        role: 'staff',
        status: 'active'
    });
    const [formErrors, setFormErrors] = useState({});

    // Validation rules
    const validateForm = (data, isEdit) => {
        const errors = {};
        // 1. Mã nhân viên: chỉ chứa chữ cái, số, dấu gạch dưới
        if (!isEdit) {
            if (!data.employee_code.trim()) {
                errors.employee_code = 'Vui lòng nhập mã nhân viên.';
            } else if (/[^a-zA-Z0-9_]/.test(data.employee_code)) {
                errors.employee_code = 'Mã nhân viên không được chứa ký tự đặc biệt.';
            }
        }
        // 2. Họ tên: tối thiểu 6 ký tự
        if (!data.full_name.trim()) {
            errors.full_name = 'Vui lòng nhập họ và tên.';
        } else if (data.full_name.trim().length < 6) {
            errors.full_name = 'Họ và tên phải có ít nhất 6 ký tự.';
        }
        // 3. Mật khẩu: tối thiểu 6 ký tự (bắt buộc khi thêm mới, tùy chọn khi sửa)
        if (!isEdit || data.password) {
            if (!data.password) {
                errors.password = 'Vui lòng nhập mật khẩu.';
            } else if (data.password.length < 6) {
                errors.password = 'Mật khẩu phải có ít nhất 6 ký tự.';
            }
        }
        return errors;
    };

    const [selectedUser, setSelectedUser] = useState(null);
    const [showDetail, setShowDetail] = useState(false);

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
        setCurrentPage(1);
        loadUsers(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Validate trước khi gửi
        const errors = validateForm(formData, !!editId);
        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }
        setFormErrors({});
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
            setFormData({ employee_code: '', email: '', password: '', full_name: '', role: 'staff', status: 'active' });
            loadUsers(search);
            setTimeout(() => setMessage(''), 4000);
        } catch (err) {
            setError(err.response?.data?.message || 'Có lỗi xảy ra trong quá trình xử lý.');
        }
    };

    const handleEdit = (user) => {
        setEditId(user.user_id);
        setFormData({
            employee_code: user.employee_code,
            email: user.email,
            password: '', 
            full_name: user.full_name,
            role: user.role,
            status: user.status
        });
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const toggleStatus = async (user) => {
        const newStatus = user.status === 'active' ? 'inactive' : 'active';
        try {
            await updateUser(user.user_id, { ...user, status: newStatus });
            setMessage(`✨ Đã ${newStatus === 'active' ? 'mở khóa' : 'khóa'} tài khoản ${user.full_name}.`);
            loadUsers(search);
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            setError('Không thể thay đổi trạng thái tài khoản.');
        }
    };

    const handleViewDetail = (user) => {
        setSelectedUser(user);
        setShowDetail(true);
    };

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentUsers = users.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(users.length / itemsPerPage);

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
                        setFormData({ employee_code: '', email: '', password: '', full_name: '', role: 'staff', status: 'active' });
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
                                <label>Mã nhân viên (Định danh)</label>
                                <div className="wow-input-field-wrapper" style={formErrors.employee_code ? {border:'1.5px solid #ef4444', borderRadius:'14px'} : {}}>
                                    <svg className="wow-field-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                                    <input 
                                        type="text" 
                                        value={formData.employee_code}
                                        onChange={(e) => {
                                            setFormData({...formData, employee_code: e.target.value});
                                            if (formErrors.employee_code) setFormErrors({...formErrors, employee_code: ''});
                                        }}
                                        disabled={!!editId}
                                        placeholder="Chỉ dùng chữ, số, dấu _"
                                    />
                                </div>
                                {formErrors.employee_code && <span style={{color:'#ef4444', fontSize:'0.82rem', marginTop:'0.35rem', display:'block', fontWeight:'600'}}>⚠️ {formErrors.employee_code}</span>}
                            </div>
                            <div className="wow-input-group">
                                <label>Email thư điện tử</label>
                                <div className="wow-input-field-wrapper">
                                    <svg className="wow-field-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                                    <input 
                                        type="email" 
                                        value={formData.email}
                                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                                        placeholder="Email..."
                                        required
                                    />
                                </div>
                            </div>
                            <div className="wow-input-group">
                                <label>Họ và tên <span style={{color:'#94a3b8', fontWeight:'500', fontSize:'0.82rem'}}>(tối thiểu 6 ký tự)</span></label>
                                <div className="wow-input-field-wrapper" style={formErrors.full_name ? {border:'1.5px solid #ef4444', borderRadius:'14px'} : {}}>
                                    <svg className="wow-field-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                    <input 
                                        type="text" 
                                        value={formData.full_name}
                                        onChange={(e) => {
                                            setFormData({...formData, full_name: e.target.value});
                                            if (formErrors.full_name) setFormErrors({...formErrors, full_name: ''});
                                        }}
                                        placeholder="Họ và tên (ít nhất 6 ký tự)..."
                                    />
                                </div>
                                {formErrors.full_name && <span style={{color:'#ef4444', fontSize:'0.82rem', marginTop:'0.35rem', display:'block', fontWeight:'600'}}>⚠️ {formErrors.full_name}</span>}
                            </div>
                            
                            {!editId && (
                                <div className="wow-input-group">
                                    <label>Mật khẩu <span style={{color:'#94a3b8', fontWeight:'500', fontSize:'0.82rem'}}>(tối thiểu 6 ký tự)</span></label>
                                    <div className="wow-input-field-wrapper" style={formErrors.password ? {border:'1.5px solid #ef4444', borderRadius:'14px'} : {}}>
                                        <svg className="wow-field-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                                        <input 
                                            type="password" 
                                            value={formData.password}
                                            onChange={(e) => {
                                                setFormData({...formData, password: e.target.value});
                                                if (formErrors.password) setFormErrors({...formErrors, password: ''});
                                            }}
                                            placeholder="Ít nhất 6 ký tự..."
                                        />
                                    </div>
                                    {formErrors.password && <span style={{color:'#ef4444', fontSize:'0.82rem', marginTop:'0.35rem', display:'block', fontWeight:'600'}}>⚠️ {formErrors.password}</span>}
                                </div>
                            )}
                            <div className="wow-input-group">
                                <label>Vai trò truy cập</label>
                                <div className="wow-input-field-wrapper">
                                    <svg className="wow-field-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
                                    <select 
                                        value={formData.role}
                                        onChange={(e) => setFormData({...formData, role: e.target.value})}
                                    >
                                        <option value="staff">Giảng viên / Nhân sự</option>
                                        <option value="admin">Ban chủ nhiệm (Admin)</option>
                                    </select>
                                </div>
                            </div>
                            <div className="wow-input-group">
                                <label>Trạng thái</label>
                                <div className="wow-input-field-wrapper">
                                    <svg className="wow-field-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                    <select 
                                        value={formData.status}
                                        onChange={(e) => setFormData({...formData, status: e.target.value})}
                                    >
                                        <option value="active">Đang hoạt động</option>
                                        <option value="inactive">Khóa tài khoản</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div style={{marginTop:'3.5rem', textAlign:'center'}}>
                            <button type="submit" className="btn-wow" style={{width:'100%', maxWidth:'450px', justifyContent:'center'}}>
                                <span className="mr-2">{editId ? '💾' : '🚀'}</span>
                                {editId ? 'Cập nhật thông tin nhân sự' : 'Kích hoạt tài khoản nhân sự'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Floating List UI */}
            <div className="wow-list-section">
                <div className="wow-list-header">
                    <h2>Tra cứu nhân sự</h2>
                    <div style={{position:'relative'}}>
                        <input 
                            type="text" 
                            className="wow-search-input"
                            placeholder="Nhập tên, mã NV hoặc email..." 
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
                        <div style={{textAlign:'center', padding:'6rem 3rem', background:'rgba(255,255,255,0.4)', borderRadius:'24px', border:'1px dashed #cbd5e1', animation:'fadeSlideUp 0.5s ease-out'}}>
                            <div style={{fontSize:'3.5rem', marginBottom:'1.5rem', filter:'drop-shadow(0 10px 15px rgba(0,0,0,0.1))'}}>🔍</div>
                            <h3 style={{fontSize:'1.5rem', fontWeight:'800', color:'#1e293b', marginBottom:'0.5rem'}}>Không tìm thấy kết quả</h3>
                            <p style={{fontSize:'1.05rem', color:'#64748b', fontWeight:'500'}}>Rất tiếc, chúng tôi không tìm thấy nhân sự nào khớp với từ khóa "<strong>{search}</strong>".</p>
                            <button 
                                onClick={() => { setSearch(''); loadUsers(''); }}
                                style={{marginTop:'2rem', background:'#f1f5f9', border:'none', padding:'0.75rem 1.5rem', borderRadius:'12px', fontWeight:'700', color:'#475569', cursor:'pointer'}}
                            >
                                Hiển thị tất cả nhân sự
                            </button>
                        </div>
                    ) : (
                        currentUsers.map(u => (
                            <div className="wow-staff-row" key={u.user_id}>
                                <div className="wow-staff-id" onClick={() => handleViewDetail(u)} style={{cursor:'pointer'}}>#ID-{u.id}</div>
                                <div className="wow-staff-info" onClick={() => handleViewDetail(u)} style={{cursor:'pointer'}}>
                                    <div className="wow-staff-avatar">{u.full_name.charAt(0)}</div>
                                    <div className="wow-staff-meta">
                                        <span className="wow-staff-name">{u.full_name}</span>
                                        <span className="wow-staff-username">{u.employee_code} - {u.email}</span>
                                    </div>
                                </div>
                                <div onClick={() => handleViewDetail(u)} style={{cursor:'pointer'}}>
                                    <div className={`wow-role-badge ${u.role === 'admin' ? 'wow-role-admin' : 'wow-role-staff'}`}>
                                        {u.role === 'admin' ? 'Quản trị viên' : 'Nhân sự'}
                                    </div>
                                </div>
                                <div className="wow-status-cell">
                                    <button 
                                        className={`status-indicator ${u.status === 'active' ? 'active' : 'inactive'}`}
                                        onClick={() => toggleStatus(u)}
                                        title={u.status === 'active' ? 'Nhấn để khóa' : 'Nhấn để mở khóa'}
                                    >
                                        <div className="indicator-dot"></div>
                                        {u.status === 'active' ? 'Đang hoạt động' : 'Đã khóa'}
                                    </button>
                                </div>
                                <div className="wow-list-actions">
                                    <button className="btn-icon-wow detail" onClick={() => handleViewDetail(u)} title="Xem chi tiết">
                                        <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {users.length > 0 && (
                    <PaginationWow currentPage={currentPage} totalPages={totalPages} paginate={setCurrentPage} />
                )}

            {/* View Detail Modal */}
            {showDetail && selectedUser && (
                <div className="wow-modal-overlay" onClick={() => setShowDetail(false)}>
                    <div className="wow-modal-content" onClick={e => e.stopPropagation()}>
                        <div className="wow-modal-header">
                            <h3>Hồ sơ nhân sự</h3>
                            <button className="btn-close-wow" onClick={() => setShowDetail(false)}>×</button>
                        </div>
                        <div className="wow-detail-body">
                            <div className="detail-avatar-section">
                                <div className="large-avatar">{selectedUser.full_name.charAt(0)}</div>
                                <h2>{selectedUser.full_name}</h2>
                                <span className={`badge ${selectedUser.role}`}>{selectedUser.role === 'admin' ? 'Quản trị viên' : 'Cán bộ'}</span>
                            </div>
                            <div className="detail-info-grid">
                                <div className="info-item">
                                    <label>Mã định danh</label>
                                    <span>#{selectedUser.employee_code}</span>
                                </div>
                                <div className="info-item">
                                    <label>Thư điện tử</label>
                                    <span>{selectedUser.email}</span>
                                </div>
                                <div className="info-item">
                                    <label>Tình trạng hồ sơ</label>
                                    <span className={`status-text ${selectedUser.status}`}>{selectedUser.status === 'active' ? 'Đang hoạt động' : 'Tạm khóa'}</span>
                                </div>
                                <div className="info-item">
                                    <label>ID Hệ thống</label>
                                    <span>{selectedUser.id}</span>
                                </div>
                            </div>
                        </div>
                        <div className="wow-modal-footer">
                            <button className="btn-wow btn-mini" onClick={() => { setShowDetail(false); handleEdit(selectedUser); }}>
                                Chỉnh sửa thông tin
                            </button>
                            <button className="btn-wow btn-wow-secondary btn-mini" onClick={() => setShowDetail(false)}>
                                Đóng lại
                            </button>
                        </div>
                    </div>
                </div>
            )}

            </div>
        </div>
    );
};

export default StaffManagement;
