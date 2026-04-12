import React, { useState, useContext, useEffect, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import '../StaffManagementWow.css';

const Profile = () => {
    const { user, updateCurrentUser } = useContext(AuthContext);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const fileInputRef = useRef(null);
    
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
    });
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);

    useEffect(() => {
        if (user) {
            setFormData({
                full_name: user.full_name || '',
                email: user.email || ''
            });
            setAvatarPreview(user.avatar_url || null);
        }
    }, [user]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 10 * 1024 * 1024) {
                setError('Tệp quá lớn. Vui lòng chọn ảnh dưới 10MB.');
                return;
            }
            setAvatarFile(file);
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.full_name.trim().length < 6) {
            setError('Họ và tên phải có ít nhất 6 ký tự.');
            return;
        }

        setLoading(true);
        setError('');
        setMessage('');

        try {
            const data = new FormData();
            data.append('full_name', formData.full_name);
            data.append('email', formData.email);
            data.append('role', user.role);
            if (avatarFile) {
                data.append('avatar', avatarFile);
            }

            const token = localStorage.getItem('token');
            const userId = user.id || user.user_id || user.MaNS;

            const response = await axios.put(`/api/users/${userId}`, data, {
                headers: { 
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`
                }
            });
            
            updateCurrentUser({
                full_name: formData.full_name,
                email: formData.email,
                avatar_url: response.data.avatar_url || user.avatar_url
            });
            setMessage('✨ Cập nhật hồ sơ thành công!');
            setTimeout(() => setMessage(''), 4000);
        } catch (err) {
            console.error('[PROFILE DEBUG] Submit Error:', err);
            if (err.response) {
                console.error('[PROFILE DEBUG] Data:', err.response.data);
                console.error('[PROFILE DEBUG] Status:', err.response.status);
            }
            setError(err.response?.data?.message || 'Có lỗi xảy ra khi cập nhật hồ sơ.');
        } finally {
            setLoading(false);
        }
    };
    
    // Fallback URL for avatar
    const getAvatarSrc = () => {
        if (avatarPreview) {
            return avatarPreview.startsWith('blob:') ? avatarPreview : avatarPreview;
        }
        return null;
    };

    if (!user) return <div className="staff-wow-container"><div className="wow-empty-state">Đang tải dữ liệu...</div></div>;

    return (
        <div className="staff-wow-container">
            <div className="staff-wow-bg"></div>
            
            <div className="wow-header">
                <div className="wow-header-left">
                    <h1>Hồ sơ của tôi</h1>
                    <p>Quản lý thông tin định danh và ảnh đại diện trên hệ thống</p>
                </div>
            </div>

            {message && <div style={{background:'rgba(16,185,129,0.1)', color:'#059669', padding:'1.25rem 2rem', borderRadius:'20px', marginBottom:'2.5rem', border:'1px solid rgba(16,185,129,0.2)', fontWeight:'800', fontSize:'1.05rem', animation:'fadeSlideDown 0.4s ease-out'}}> {message} </div>}
            {error && <div style={{background:'rgba(239,68,68,0.1)', color:'#dc2626', padding:'1.25rem 2rem', borderRadius:'20px', marginBottom:'2.5rem', border:'1px solid rgba(239,68,68,0.2)', fontWeight:'800', fontSize:'1.05rem', animation:'fadeSlideDown 0.4s ease-out'}}> {error} </div>}

            <div className="wow-form-card" style={{maxWidth: '800px', margin: '0 auto'}}>
                <div className="wow-form-section-header" style={{flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '1.5rem'}}>
                    <div className="avatar-upload-container" style={{position: 'relative', cursor: 'pointer'}} onClick={() => fileInputRef.current.click()}>
                        <div className="wow-form-icon-container" style={{
                            width: '120px', 
                            height: '120px', 
                            borderRadius: '35px',
                            background: avatarPreview ? `url(${getAvatarSrc()}) center/cover no-repeat` : 'linear-gradient(135deg, #6366f1, #a855f7)',
                            border: '4px solid white',
                            boxShadow: '0 15px 35px rgba(99, 102, 241, 0.25)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
                        }}>
                            {!avatarPreview && <div style={{color: 'white', fontSize: '3rem', fontWeight: '900'}}>{user.full_name?.charAt(0)}</div>}
                        </div>
                        <div className="upload-badge" style={{
                            position: 'absolute',
                            bottom: '-5px',
                            right: '-5px',
                            background: 'white',
                            width: '38px',
                            height: '38px',
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
                            border: '2px solid #f8fafc'
                        }}>
                            <svg style={{width: '20px', height: '20px', color: '#6366f1'}} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                        </div>
                    </div>
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileChange} 
                        style={{display: 'none'}} 
                        accept="image/*"
                    />
                    <div className="wow-form-title">
                        <h4 style={{fontSize: '1.5rem', marginBottom: '0.25rem'}}>{user.full_name}</h4>
                        <p style={{fontSize: '0.95rem', opacity: 0.7}}>{user.role === 'admin' ? 'Ban chủ nhiệm (Quản trị viên)' : 'Giảng viên khoa CNTT'}</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} style={{marginTop: '2.5rem'}}>
                    <div className="wow-form-grid">
                        <div className="wow-input-group">
                            <label>Họ và tên</label>
                            <div className="wow-input-field-wrapper">
                                <svg className="wow-field-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                                <input 
                                    type="text" 
                                    name="full_name"
                                    value={formData.full_name}
                                    onChange={handleChange}
                                    placeholder="Nhập họ tên đầy đủ..."
                                    required
                                />
                            </div>
                        </div>

                        <div className="wow-input-group">
                            <label>Email liên hệ</label>
                            <div className="wow-input-field-wrapper">
                                <svg className="wow-field-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                                <input 
                                    type="email" 
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="yourname@stu.edu.vn"
                                    required
                                />
                            </div>
                        </div>

                        <div className="wow-input-group">
                            <label>Mã nhân sự (Cố định)</label>
                            <div className="wow-input-field-wrapper" style={{background: 'rgba(0,0,0,0.02)', border: '1.5px dashed rgba(0,0,0,0.1)'}}>
                                <svg className="wow-field-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path></svg>
                                <input 
                                    type="text" 
                                    value={user.employee_code || user.user_id || user.MaNS}
                                    disabled
                                    style={{cursor: 'not-allowed', color: '#64748b', fontWeight: '700'}}
                                />
                            </div>
                        </div>

                        <div className="wow-input-group">
                            <label>Vai trò hệ thống</label>
                            <div className="wow-input-field-wrapper" style={{background: 'rgba(0,0,0,0.02)', border: '1.5px dashed rgba(0,0,0,0.1)'}}>
                                <svg className="wow-field-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
                                <input 
                                    type="text" 
                                    value={user.role === 'admin' ? 'Quản trị viên' : 'Giảng viên / Nhân sự'}
                                    disabled
                                    style={{cursor: 'not-allowed', color: '#64748b', fontWeight: '700'}}
                                />
                            </div>
                        </div>
                    </div>

                    <div style={{marginTop: '3rem', textAlign: 'center'}}>
                        <button type="submit" className="btn-wow" disabled={loading} style={{width: '100%', maxWidth: '400px', height: '60px', borderRadius: '18px', fontSize: '1.1rem', justifyContent: 'center'}}>
                            {loading ? (
                                <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem'}}>
                                    <div className="wow-spinner" style={{width: '20px', height: '20px', border: '3px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite'}}></div>
                                    <span>Đang tối ưu hồ sơ...</span>
                                </div>
                            ) : 'Cập nhật tài khoản cá nhân ✨'}
                        </button>
                    </div>
                </form>

                <div style={{marginTop: '3rem', padding: '1.25rem', background: 'rgba(99, 102, 241, 0.05)', borderRadius: '20px', border: '1px solid rgba(99, 102, 241, 0.1)', textAlign: 'center'}}>
                    <p style={{margin: 0, color: '#4f46e5', fontSize: '0.88rem', fontWeight: '600'}}>
                        💡 Mẹo: Ảnh đại diện nên là ảnh chụp chính diện để đồng nghiệp dễ dàng nhận diện trong quá trình phân công công việc.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Profile;
