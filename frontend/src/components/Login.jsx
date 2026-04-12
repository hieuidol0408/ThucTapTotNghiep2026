import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { login } from '../api/auth';
import '../super-login.css';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    const { loginUser } = useContext(AuthContext);
    const navigate = useNavigate();

    // Check for remembered username on mount
    React.useEffect(() => {
        const savedUsername = localStorage.getItem('rememberedUsername');
        if (savedUsername) {
            setUsername(savedUsername);
            setRememberMe(true);
        }
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const data = await login(username, password);
            
            // Handle Remember Me preference
            if (rememberMe) {
                localStorage.setItem('rememberedUsername', username);
            } else {
                localStorage.removeItem('rememberedUsername');
            }

            loginUser(data.user, data.token);
            navigate('/dashboard');
        } catch (err) {
            setError(err.message || 'Đăng nhập thất bại');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="super-login-container">
            <div className="bg-shape bg-shape-1"></div>
            <div className="bg-shape bg-shape-2"></div>
            
            <div className="super-login-card">
                <div className="super-login-left">
                    <img src="/assets/auth-hero.png" alt="Hero" className="super-hero-img" />
                    <div className="super-hero-overlay">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <div style={{ fontSize: '0.95rem', textTransform: 'uppercase', letterSpacing: '2px', color: '#a5b4fc', fontWeight: '800' }}>
                                Tên Đề tài
                            </div>
                            <h3 style={{ fontSize: '2.2rem', fontWeight: '800', lineHeight: '1.2', margin: 0, padding: 0, textTransform: 'none' }}>
                                Viết ứng dụng <br/>
                                <span style={{ color: '#e0e7ff' }}>QLCongViecKhoa</span>
                            </h3>
                            <div style={{ width: '40px', height: '4px', background: '#8b5cf6', borderRadius: '4px', marginTop: '8px', marginBottom: '4px' }}></div>
                            <p style={{ fontSize: '1.1rem', color: '#cbd5e1', lineHeight: '1.6', margin: 0, fontWeight: '500' }}>
                                Quản lý công việc nhân sự tại Khoa IT-STU
                            </p>
                        </div>
                    </div>
                </div>
                
                <div className="super-login-right">
                    <div className="super-brand">
                        <div className="super-logo-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 9.75 16.5 12l-2.25 2.25m-4.5 0L7.5 12l2.25-2.25M6 20.25h12A2.25 2.25 0 0 0 20.25 18V6A2.25 2.25 0 0 0 18 3.75H6A2.25 2.25 0 0 0 3.75 6v12A2.25 2.25 0 0 0 6 20.25Z" />
                            </svg>
                        </div>
                        <span>IT-STU Workplace</span>
                    </div>
                    
                    <div className="super-login-headings">
                        <h2>Chào mừng trở lại! 👋</h2>
                        <p>Đăng nhập để vào hệ thống quản lý khoa Công Nghệ Thông Tin.</p>
                    </div>

                    {error && (
                        <div className="super-error-box">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3Z" />
                            </svg>
                            {error}
                        </div>
                    )}
                    
                    <form onSubmit={handleSubmit}>
                        <div className="super-input-group">
                            <label>Tên đăng nhập</label>
                            <div className="super-input-wrapper">
                                <span className="super-input-icon">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                                    </svg>
                                </span>
                                <input 
                                    type="text" 
                                    value={username} 
                                    onChange={(e) => setUsername(e.target.value)} 
                                    required 
                                    placeholder="Ví dụ: AD001, GV005"
                                />
                            </div>
                        </div>
                        
                        <div className="super-input-group">
                            <label>Mật khẩu</label>
                            <div className="super-input-wrapper">
                                <span className="super-input-icon">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                                    </svg>
                                </span>
                                <input 
                                    type="password" 
                                    value={password} 
                                    onChange={(e) => setPassword(e.target.value)} 
                                    required 
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>
                        
                        <div className="super-form-actions">
                            <label className="super-checkbox">
                                <input 
                                    type="checkbox" 
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                />
                                <span>Ghi nhớ phiên đăng nhập</span>
                            </label>
                        </div>
                        
                        <button type="submit" className="super-submit-btn" disabled={loading}>
                            {loading ? (
                                <span className="loader-inline"></span>
                            ) : (
                                'Khởi Động Hệ Thống 🚀'
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>

    );
};

export default Login;
