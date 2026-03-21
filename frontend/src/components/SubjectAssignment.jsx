import React, { useState, useEffect } from 'react';
import { fetchSubjects, fetchAssignments, createAssignment, deleteAssignment } from '../api/subjects';
import { fetchUsers } from '../api/users';

const SubjectAssignment = () => {
    const [activeTab, setActiveTab] = useState('assign');

    // Data
    const [users, setUsers] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [assignments, setAssignments] = useState([]);

    // State
    const [loading, setLoading] = useState(false);
    const [tableLoading, setTableLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    // Form state
    const [formData, setFormData] = useState({
        user_id: '',
        subject_id: '',
        semester: '',
        note: ''
    });

    useEffect(() => {
        loadInitialData();
    }, []);

    const loadInitialData = async () => {
        try {
            const [usersData, subjectsData, assignmentsData] = await Promise.all([
                fetchUsers(),
                fetchSubjects(),
                fetchAssignments()
            ]);
            setUsers(usersData);
            setSubjects(subjectsData);
            setAssignments(assignmentsData);
        } catch (err) {
            setError('Không thể tải dữ liệu. Vui lòng thử lại.');
        } finally {
            setTableLoading(false);
        }
    };

    const loadAssignments = async () => {
        setTableLoading(true);
        try {
            const data = await fetchAssignments();
            setAssignments(data);
        } catch (err) {
            setError('Không thể tải danh sách phân công.');
        } finally {
            setTableLoading(false);
        }
    };

    const showMessage = (msg, isError = false) => {
        if (isError) {
            setError(msg);
            setMessage('');
        } else {
            setMessage(msg);
            setError('');
        }
        setTimeout(() => { setMessage(''); setError(''); }, 4000);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await createAssignment({
                user_id: parseInt(formData.user_id),
                subject_id: parseInt(formData.subject_id),
                semester: formData.semester,
                note: formData.note
            });
            showMessage('✅ Phân công môn học thành công!');
            setFormData({ user_id: '', subject_id: '', semester: '', note: '' });
            loadAssignments();
        } catch (err) {
            showMessage(err.response?.data?.message || 'Có lỗi xảy ra khi phân công.', true);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa phân công này?')) return;
        try {
            await deleteAssignment(id);
            showMessage('Xóa phân công thành công!');
            loadAssignments();
        } catch (err) {
            showMessage(err.response?.data?.message || 'Lỗi khi xóa phân công.', true);
        }
    };

    const selectedSubject = subjects.find(s => s.id === parseInt(formData.subject_id));
    const selectedUser = users.find(u => u.id === parseInt(formData.user_id));

    return (
        <div className="staff-management animate-in">
            {/* Header */}
            <div className="section-header">
                <div>
                    <h3 className="text-2xl font-bold">Phân công môn học</h3>
                    <p className="text-muted">Quản lý phân công giảng dạy cho giảng viên Khoa IT-STU</p>
                </div>
            </div>

            {/* Alerts */}
            {message && <div className="alert-box success-alert mb-4">{message}</div>}
            {error && <div className="alert-box error-alert mb-4">{error}</div>}

            {/* Tab Navigation */}
            <div className="tab-nav">
                <button
                    className={`tab-btn ${activeTab === 'assign' ? 'active' : ''}`}
                    onClick={() => setActiveTab('assign')}
                >
                    <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{display:'inline', marginRight:6, verticalAlign:'middle'}}>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Giao môn học cho giảng viên
                </button>
                <button
                    className={`tab-btn ${activeTab === 'list' ? 'active' : ''}`}
                    onClick={() => { setActiveTab('list'); loadAssignments(); }}
                >
                    <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{display:'inline', marginRight:6, verticalAlign:'middle'}}>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    Xem danh sách phân công
                </button>
            </div>

            {/* ===== TAB 1: ASSIGN ===== */}
            {activeTab === 'assign' && (
                <div className="form-card animate-in">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                            <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                        </div>
                        <div>
                            <h4 className="text-xl font-bold text-slate-800">Giao môn học cho giảng viên</h4>
                            <p style={{fontSize:'0.875rem', color:'#64748b', marginTop:2}}>Chọn giảng viên và môn học để tạo phân công</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="form-grid">
                            {/* Giảng viên */}
                            <div className="form-group-premium">
                                <label>Giảng viên</label>
                                <div className="input-with-icon">
                                    <svg width="20" height="20" className="input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    <select
                                        value={formData.user_id}
                                        onChange={e => setFormData({ ...formData, user_id: e.target.value })}
                                        required
                                    >
                                        <option value="">-- Chọn giảng viên --</option>
                                        {users.map(u => (
                                            <option key={u.id} value={u.id}>{u.full_name} (@{u.username})</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Môn học */}
                            <div className="form-group-premium">
                                <label>Môn học</label>
                                <div className="input-with-icon">
                                    <svg width="20" height="20" className="input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                    </svg>
                                    <select
                                        value={formData.subject_id}
                                        onChange={e => setFormData({ ...formData, subject_id: e.target.value })}
                                        required
                                    >
                                        <option value="">-- Chọn môn học --</option>
                                        {subjects.map(s => (
                                            <option key={s.id} value={s.id}>{s.subject_code} – {s.subject_name} ({s.credits} TC)</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Học kỳ */}
                            <div className="form-group-premium">
                                <label>Học kỳ</label>
                                <div className="input-with-icon">
                                    <svg width="20" height="20" className="input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <input
                                        type="text"
                                        value={formData.semester}
                                        onChange={e => setFormData({ ...formData, semester: e.target.value })}
                                        placeholder="Ví dụ: HK1 2024-2025"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Ghi chú */}
                            <div className="form-group-premium">
                                <label>Ghi chú <span style={{fontWeight:400, opacity:0.6, fontSize:'0.8rem'}}>(tùy chọn)</span></label>
                                <div className="input-with-icon">
                                    <svg width="20" height="20" className="input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{top:'1rem', transform:'none'}}>
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                                    </svg>
                                    <input
                                        type="text"
                                        value={formData.note}
                                        onChange={e => setFormData({ ...formData, note: e.target.value })}
                                        placeholder="Ghi chú thêm (nếu có)..."
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Preview Card */}
                        {(selectedUser || selectedSubject || formData.semester) && (
                            <div className="assignment-preview">
                                <p className="preview-title">📋 Xem trước phân công</p>
                                <div className="preview-content">
                                    {selectedUser && <span className="preview-chip chip-blue">👤 {selectedUser.full_name}</span>}
                                    {selectedSubject && <span className="preview-chip chip-green">📚 {selectedSubject.subject_name}</span>}
                                    {formData.semester && <span className="preview-chip chip-orange">📅 {formData.semester}</span>}
                                </div>
                            </div>
                        )}

                        <div className="form-actions-premium mt-8">
                            <button type="submit" className="btn-main-premium" disabled={loading}>
                                {loading ? (
                                    <span className="flex items-center gap-2">
                                        <span className="loader-inline" style={{borderTopColor:'#fff', width:18, height:18}}></span>
                                        Đang xử lý...
                                    </span>
                                ) : (
                                    <>
                                        <span className="mr-2">🎓</span>
                                        Xác nhận phân công
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* ===== TAB 2: LIST ===== */}
            {activeTab === 'list' && (
                <div className="table-wrapper elevation-1 animate-in">
                    <div className="table-header-ui" style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                        <div>
                            <span style={{fontWeight:700, fontSize:'1rem', color:'#1e293b'}}>Danh sách phân công</span>
                            <span style={{marginLeft:12, background:'#e0e7ff', color:'#4338ca', padding:'2px 10px', borderRadius:20, fontSize:'0.8rem', fontWeight:700}}>
                                {assignments.length} phân công
                            </span>
                        </div>
                        <button className="btn-primary" style={{padding:'0.5rem 1.25rem', fontSize:'0.875rem'}} onClick={loadAssignments}>
                            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Làm mới
                        </button>
                    </div>

                    <div className="table-responsive">
                        <table className="modern-table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Giảng viên</th>
                                    <th>Môn học</th>
                                    <th>Số TC</th>
                                    <th>Học kỳ</th>
                                    <th>Ghi chú</th>
                                    <th>Ngày phân công</th>
                                    <th className="text-right">Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tableLoading ? (
                                    <tr><td colSpan="8" className="text-center py-10">Đang tải dữ liệu...</td></tr>
                                ) : assignments.length === 0 ? (
                                    <tr>
                                        <td colSpan="8">
                                            <div className="empty-assignment-state">
                                                <div style={{fontSize:'3rem', marginBottom:'1rem'}}>📭</div>
                                                <h4>Chưa có phân công nào</h4>
                                                <p>Chuyển sang tab <strong>"Giao môn học"</strong> để tạo phân công đầu tiên.</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    assignments.map((a, idx) => (
                                        <tr key={a.id}>
                                            <td><span className="text-xs text-muted">{idx + 1}</span></td>
                                            <td>
                                                <div className="user-entity">
                                                    <div className="entity-avatar" style={{background:'#dbeafe', color:'#1d4ed8'}}>
                                                        {a.lecturer_name.charAt(0)}
                                                    </div>
                                                    <div className="entity-info">
                                                        <span className="entity-name">{a.lecturer_name}</span>
                                                        <span className="entity-username">@{a.lecturer_username}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div>
                                                    <div style={{fontWeight:600, color:'#1e293b', fontSize:'0.9rem'}}>{a.subject_name}</div>
                                                    <div style={{fontSize:'0.75rem', color:'#64748b', marginTop:2}}>
                                                        <span style={{background:'#f1f5f9', padding:'1px 6px', borderRadius:6, fontFamily:'monospace'}}>{a.subject_code}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <span className="badge-credits">{a.credits} TC</span>
                                            </td>
                                            <td>
                                                <span className="badge-semester">{a.semester}</span>
                                            </td>
                                            <td>
                                                <span style={{fontSize:'0.875rem', color:'#64748b'}}>
                                                    {a.note || <em style={{opacity:0.4}}>—</em>}
                                                </span>
                                            </td>
                                            <td style={{fontSize:'0.875rem', color:'#64748b'}}>
                                                {new Date(a.assigned_at).toLocaleDateString('vi-VN')}
                                            </td>
                                            <td>
                                                <div className="table-actions">
                                                    <button className="icon-btn delete" onClick={() => handleDelete(a.id)} title="Xóa phân công">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
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
            )}
        </div>
    );
};

export default SubjectAssignment;
