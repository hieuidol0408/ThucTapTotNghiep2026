import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { login } from '../api/auth';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    const { loginUser } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const data = await login(username, password);
            loginUser(data.user, data.token);
            navigate('/dashboard');
        } catch (err) {
            setError(err.message || 'Đăng nhập thất bại');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-overlay"></div>
            <div className="login-box-wrapper">
                <form className="login-form-premium" onSubmit={handleSubmit}>
                    <div className="login-header">
                        <div className="login-logo">IT-STU</div>
                        <h2>Hệ thống Quản lý</h2>
                        <p>Dành cho cán bộ quản lý Khoa IT-STU</p>
                    </div>

                    {error && <div className="error-message-glass">{error}</div>}
                    
                    <div className="form-group-premium">
                        <label>Tên đăng nhập</label>
                        <div className="input-with-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                            </svg>
                            <input 
                                type="text" 
                                value={username} 
                                onChange={(e) => setUsername(e.target.value)} 
                                required 
                                placeholder="Nhập tên đăng nhập..."
                            />
                        </div>
                    </div>
                    
                    <div className="form-group-premium">
                        <label>Mật khẩu</label>
                        <div className="input-with-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                            </svg>
                            <input 
                                type="password" 
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)} 
                                required 
                                placeholder="Nhập mật khẩu..."
                            />
                        </div>
                    </div>
                    
                    <button type="submit" className="login-btn-premium" disabled={loading}>
                        {loading ? (
                            <span className="loader-inline"></span>
                        ) : (
                            '🚀 Đăng Nhập Hệ Thống'
                        )}
                    </button>

                    <div className="login-footer">
                        <p>© 2026 Khoa CNTT - STU</p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
