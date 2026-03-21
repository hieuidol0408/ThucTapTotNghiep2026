import React, { useState, useEffect, useMemo } from 'react';
import { fetchSubjects, fetchAssignments, createAssignment, deleteAssignment } from '../api/subjects';
import { fetchUsers } from '../api/users';
import '../SubjectAssignmentWow.css';

const SubjectAssignment = () => {
    // Data
    const [users, setUsers] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [search, setSearch] = useState('');

    // UI State
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [dataLoading, setDataLoading] = useState(true);
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
        setDataLoading(true);
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
            setError('Không thể đồng bộ dữ liệu hệ thống.');
        } finally {
            setDataLoading(false);
        }
    };

    const loadAssignments = async () => {
        try {
            const data = await fetchAssignments();
            setAssignments(data);
        } catch (err) {
            console.error('Failed to reload assignments');
        }
    };

    // Calculate Dynamic Stats
    const stats = useMemo(() => {
        return {
            total: assignments.length,
            activeLecturers: new Set(assignments.map(a => a.user_id)).size,
            uniqueSubjects: new Set(assignments.map(a => a.subject_id)).size,
            totalCredits: assignments.reduce((sum, a) => sum + (a.credits || 0), 0)
        };
    }, [assignments]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await createAssignment({
                user_id: parseInt(formData.user_id),
                subject_id: parseInt(formData.subject_id),
                semester: formData.semester,
                note: formData.note
            });
            setMessage('✨ Phân công chuyên môn thành công rực rỡ!');
            setFormData({ user_id: '', subject_id: '', semester: '', note: '' });
            setShowForm(false);
            loadAssignments();
            setTimeout(() => setMessage(''), 4000);
        } catch (err) {
            setError(err.response?.data?.message || 'Có lỗi xảy ra khi thực hiện phân công.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Bạn có chắc chắn muốn gỡ bỏ phân công này?')) return;
        try {
            await deleteAssignment(id);
            setMessage('🗑️ Đã xóa phân công khỏi cơ sở dữ liệu.');
            loadAssignments();
            setTimeout(() => setMessage(''), 4000);
        } catch (err) {
            setError('Lỗi khi xóa phân công.');
        }
    };

    const handleSearch = (e) => {
        setSearch(e.target.value);
    };

    const filteredAssignments = assignments.filter(a => 
        a.lecturer_name.toLowerCase().includes(search.toLowerCase()) || 
        a.subject_name.toLowerCase().includes(search.toLowerCase()) ||
        a.subject_code.toLowerCase().includes(search.toLowerCase())
    );

    const selectedSubject = subjects.find(s => s.id === parseInt(formData.subject_id));
    const selectedUser = users.find(u => u.id === parseInt(formData.user_id));

    return (
        <div className="subject-wow-container">
            {/* Mesh Background */}
            <div className="subject-wow-bg"></div>

            {/* Premium Hero Banner */}
            <div className="wow-header">
                <div className="wow-header-left">
                    <h1>Phân công môn học</h1>
                    <p>Cổng quản lý và điều phối chuyên môn Khoa IT-STU</p>
                </div>
                <button 
                    className={`btn-wow ${showForm ? 'btn-wow-cancel' : ''}`} 
                    onClick={() => {
                        setShowForm(!showForm);
                        setError('');
                        setFormData({ user_id: '', subject_id: '', semester: '', note: '' });
                    }}
                >
                    {showForm ? 'Đóng lại' : (
                        <>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.7" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                            Giao môn học mới
                        </>
                    )}
                </button>
            </div>

            {message && <div style={{background:'rgba(16,185,129,0.1)', color:'#059669', padding:'1.25rem 2rem', borderRadius:'20px', marginBottom:'2.5rem', border:'1px solid rgba(16,185,129,0.2)', fontWeight:'800', animation:'fadeSlideDown 0.4s ease-out'}}> {message} </div>}
            {error && <div style={{background:'rgba(239,68,68,0.1)', color:'#dc2626', padding:'1.25rem 2rem', borderRadius:'20px', marginBottom:'2.5rem', border:'1px solid rgba(239,68,68,0.2)', fontWeight:'800', animation:'fadeSlideDown 0.4s ease-out'}}> {error} </div>}

            {/* High-End Stats Cards */}
            <div className="wow-stats-grid">
                <div className="wow-stat-card">
                    <div className="wow-stat-icon icon-cyan-wow">
                        <svg width="28" height="28" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
                    </div>
                    <div className="wow-stat-label">Tổng phân công</div>
                    <div className="wow-stat-value">{stats.total}</div>
                </div>
                <div className="wow-stat-card">
                    <div className="wow-stat-icon icon-blue-wow">
                        <svg width="28" height="28" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                    </div>
                    <div className="wow-stat-label">Giảng viên tham gia</div>
                    <div className="wow-stat-value">{stats.activeLecturers}</div>
                </div>
                <div className="wow-stat-card">
                    <div className="wow-stat-icon icon-indigo-wow">
                        <svg width="28" height="28" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
                    </div>
                    <div className="wow-stat-label">Danh mục môn học</div>
                    <div className="wow-stat-value">{stats.uniqueSubjects}</div>
                </div>
                <div className="wow-stat-card">
                    <div className="wow-stat-icon icon-emerald-wow">
                        <svg width="28" height="28" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                    </div>
                    <div className="wow-stat-label">Tổng số tín chỉ</div>
                    <div className="wow-stat-value">{stats.totalCredits}</div>
                </div>
            </div>

            {/* Premium Glass Form Card */}
            {showForm && (
                <div className="wow-form-card">
                    <div className="wow-form-section-header">
                        <div className="wow-form-icon-container">
                            <svg width="32" height="32" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                        </div>
                        <div className="wow-form-title">
                            <h4>Thiết lập phân công mới</h4>
                            <p>Phân bổ khối lượng giảng dạy chuyên môn cho học kỳ</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="wow-form-grid">
                            <div className="wow-input-group">
                                <label>Giảng viên phụ trách</label>
                                <div className="wow-input-field-wrapper">
                                    <svg className="wow-field-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                                    <select
                                        value={formData.user_id}
                                        onChange={e => setFormData({ ...formData, user_id: e.target.value })}
                                        required
                                    >
                                        <option value="">Lựa chọn giảng viên...</option>
                                        {users.map(u => (
                                            <option key={u.id} value={u.id}>{u.full_name} (@{u.username})</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="wow-input-group">
                                <label>Học kỳ triển khai</label>
                                <div className="wow-input-field-wrapper">
                                    <svg className="wow-field-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                    <input
                                        type="text"
                                        value={formData.semester}
                                        onChange={e => setFormData({ ...formData, semester: e.target.value })}
                                        placeholder="Ví dụ: HK2 2024-2025"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="wow-input-group" style={{ gridColumn: '1 / -1' }}>
                                <label>Môn học giảng dạy</label>
                                <div className="wow-input-field-wrapper">
                                    <svg className="wow-field-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
                                    <select
                                        value={formData.subject_id}
                                        onChange={e => setFormData({ ...formData, subject_id: e.target.value })}
                                        required
                                    >
                                        <option value="">Lựa chọn môn học từ danh mục...</option>
                                        {subjects.map(s => (
                                            <option key={s.id} value={s.id}>{s.subject_code} – {s.subject_name} ({s.credits} TC)</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="wow-input-group" style={{ gridColumn: '1 / -1' }}>
                                <label>Ghi chú bổ sung</label>
                                <div className="wow-input-field-wrapper">
                                    <svg className="wow-field-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"></path></svg>
                                    <textarea
                                        value={formData.note}
                                        onChange={e => setFormData({ ...formData, note: e.target.value })}
                                        placeholder="Thông tin thêm về lịch học, phòng máy..."
                                        rows="2"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Preview Panel */}
                        {(selectedUser || selectedSubject || formData.semester) && (
                            <div className="wow-preview-panel mt-8">
                                <div className="wow-preview-header">📋 Tóm tắt phân công</div>
                                <div className="wow-preview-chips">
                                    {selectedUser && <span className="wow-chip wow-chip-blue">👤 {selectedUser.full_name}</span>}
                                    {selectedSubject && <span className="wow-chip wow-chip-green">📚 {selectedSubject.subject_name}</span>}
                                    {formData.semester && <span className="wow-chip wow-chip-orange">📅 {formData.semester}</span>}
                                </div>
                            </div>
                        )}

                        <div className="mt-12 text-center">
                            <button type="submit" className="btn-wow" disabled={loading} style={{ width: '100%', maxWidth: '450px', justifyContent: 'center' }}>
                                <span className="mr-2">🎓</span>
                                {loading ? 'Đang xác lập...' : 'Phê Duyệt Phân Công Ngay'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* List Header */}
            <div className="wow-list-header">
                <h2>Cơ sở dữ liệu phân công</h2>
                <div style={{position:'relative'}}>
                    <input 
                        type="text" 
                        className="wow-search-input"
                        placeholder="Tìm theo tên giảng viên, môn học..." 
                        value={search}
                        onChange={handleSearch}
                    />
                    <svg style={{position:'absolute', left:'20px', top:'50%', transform:'translateY(-50%)', color:'#94a3b8', width:'22px', height:'22px'}} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                </div>
            </div>

            {/* Floating Rows List */}
            <div className="wow-list-section">
                {dataLoading ? (
                    <div className="wow-empty-state">
                        <div className="wow-empty-icon">⏳</div>
                        <h4>Đang truy xuất phân công</h4>
                        <p>Dữ liệu đang được đồng bộ từ trung tâm...</p>
                    </div>
                ) : filteredAssignments.length === 0 ? (
                    <div className="wow-empty-state">
                        <div className="wow-empty-icon">📂</div>
                        <h4>Trống lịch phân công</h4>
                        <p>Hệ thống chưa ghi nhận phân công nào khớp với yêu cầu tìm kiếm</p>
                    </div>
                ) : (
                    filteredAssignments.map(a => (
                        <div className="wow-assignment-row" key={a.id}>
                            <div className="wow-lecturer-cell">
                                <div className="wow-lecturer-avatar">{a.lecturer_name.charAt(0)}</div>
                                <div className="wow-lecturer-meta">
                                    <span className="wow-lecturer-name">{a.lecturer_name}</span>
                                    <span className="wow-lecturer-username">@{a.lecturer_username}</span>
                                </div>
                            </div>

                            <div className="wow-subject-cell">
                                <span className="wow-subject-name">{a.subject_name}</span>
                                <span className="wow-subject-code">{a.subject_code}</span>
                            </div>

                            <div className="wow-credits-badge">{a.credits} Tín chỉ</div>
                            
                            <div className="wow-semester-badge">{a.semester}</div>

                            <div className="wow-date-cell">
                                📅 {new Date(a.assigned_at).toLocaleDateString('vi-VN')}
                            </div>

                            <div className="wow-list-actions">
                                <button className="btn-icon-wow-rect" onClick={() => handleDelete(a.id)} title="Gỡ bỏ phân công">
                                    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default SubjectAssignment;
