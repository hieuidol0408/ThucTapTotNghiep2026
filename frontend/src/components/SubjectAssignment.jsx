import React, { useState, useEffect, useContext } from 'react';
import { fetchSubjects, fetchAssignments, createAssignment, updateAssignment, deleteAssignment, createSubject, updateSubject, deleteSubject } from '../api/subjects';
import { fetchUsers } from '../api/users';
import { AuthContext } from '../context/AuthContext';
import '../SubjectAssignmentWow.css';

const SubjectAssignment = () => {
    const { user } = useContext(AuthContext);
    const isAdmin = user?.role === 'admin';

    // State for Tabs
    const [activeTab, setActiveTab] = useState('assignment'); // 'assignment' or 'management'

    // Data State
    const [subjects, setSubjects] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [lecturers, setLecturers] = useState([]);
    const [loading, setLoading] = useState(true);

    // Form State (Assignment)
    const [assignForm, setAssignForm] = useState({
        id: null,
        user_id: '',
        subject_id: '',
        ngay_bat_dau: '',
        ngay_ket_thuc: '',
        ca: 1,
        phong: '',
        thu: 2
    });

    // Form State (Subject Management)
    const [subjectForm, setSubjectForm] = useState({
        id: null,
        subject_code: '',
        subject_name: '',
        credits: 3
    });

    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    // useEffect: Tự động chạy khi component được nạp (mount) lần đầu
    useEffect(() => {
        loadData();
    }, []);

    // loadData: Hàm chính để tải tất cả dữ liệu từ API về Frontend
    const loadData = async () => {
        setLoading(true);
        try {
            // Tải song song: Danh sách phân công, Danh mục môn học, và Danh sách giảng viên
            const [subjs, assigns, users] = await Promise.all([
                fetchSubjects(),
                fetchAssignments(),
                isAdmin ? fetchUsers() : Promise.resolve([])
            ]);
            setSubjects(subjs);
            setAssignments(assigns);
            if (isAdmin) {
                setLecturers(users.filter(u => u.role === 'staff' || u.role === 'admin'));
            }
            console.log('DEBUG: Subjects:', subjs);
            console.log('DEBUG: Assignments:', assigns);
            console.log('DEBUG: Lecturers:', users);
        } catch (err) {
            console.error('DEBUG FETCH ERROR:', err);
            setError('Không thể tải dữ liệu môn học.');
        } finally {
            setLoading(false);
        }
    };

    // --- HANDLERS FOR ASSIGNMENT ---

    // handleAssignSubmit: Xử lý khi Admin nhấn "Giao việc" (Phân công môn học)
    const handleAssignSubmit = async (e) => {
        e.preventDefault();
        try {
            if (assignForm.id) {
                await updateAssignment(assignForm.id, assignForm);
                setMessage('📝 Đã cập nhật phân công giảng dạy!');
            } else {
                await createAssignment(assignForm);
                setMessage('🎯 Đã phân công môn học thành công!');
            }
            loadData();
            setAssignForm({
                id: null,
                user_id: '',
                subject_id: '',
                ngay_bat_dau: '',
                ngay_ket_thuc: '',
                ca: 1,
                phong: '',
                thu: 2
            });
            setTimeout(() => setMessage(''), 4000);
        } catch (err) {
            setError(err.response?.data?.message || 'Lỗi khi phân công.');
            setTimeout(() => setError(''), 4000);
        }
    };

    // handleDeleteAssignment: Xóa một bản ghi phân công
    const handleDeleteAssignment = async (id) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa phân công này?')) return;
        try {
            await deleteAssignment(id);
            setMessage('🗑️ Đã xóa phân công.');
            loadData();
            setTimeout(() => setMessage(''), 4000);
        } catch (err) {
            setError('Lỗi khi xóa phân công.');
            setTimeout(() => setError(''), 4000);
        }
    };

    const handleEditAssignment = (a) => {
        setAssignForm({
            id: a.id,
            user_id: a.user_id,
            subject_id: a.subject_id,
            ngay_bat_dau: a.NgayBatDau ? new Date(a.NgayBatDau).toISOString().split('T')[0] : '',
            ngay_ket_thuc: a.NgayKetThuc ? new Date(a.NgayKetThuc).toISOString().split('T')[0] : '',
            ca: a.Ca,
            phong: a.Phong,
            thu: a.Thu
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // --- HANDLERS FOR SUBJECT MANAGEMENT ---

    const handleSubjectSubmit = async (e) => {
        e.preventDefault();
        try {
            if (subjectForm.id) {
                await updateSubject(subjectForm.id, subjectForm);
                setMessage('📝 Đã cập nhật môn học.');
            } else {
                await createSubject(subjectForm);
                setMessage('✨ Đã thêm môn học mới vào danh mục.');
            }
            loadData();
            setSubjectForm({ id: null, subject_code: '', subject_name: '', credits: 3 });
            setTimeout(() => setMessage(''), 4000);
        } catch (err) {
            setError(err.response?.data?.message || 'Lỗi khi lưu môn học.');
            setTimeout(() => setError(''), 4000);
        }
    };

    const handleEditSubject = (subj) => {
        setSubjectForm({
            id: subj.id,
            subject_code: subj.subject_code,
            subject_name: subj.subject_name,
            credits: subj.credits
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDeleteSubject = async (id) => {
        if (!window.confirm('Xóa môn học này sẽ ảnh hưởng đến danh mục. Bạn có chắc không?')) return;
        try {
            await deleteSubject(id);
            setMessage('🗑️ Đã xóa môn học khỏi danh mục.');
            loadData();
            setTimeout(() => setMessage(''), 4000);
        } catch (err) {
            setError(err.response?.data?.message || 'Không thể xóa môn học (có thể đang được phân công).');
            setTimeout(() => setError(''), 4000);
        }
    };

    if (loading) return <div className="loading-wow">Đang tải dữ liệu...</div>;

    return (
        <div className="subject-wow-container">
            <div className="subject-wow-bg"></div>

            <div className="wow-header-card">
                <div className="wow-header-content">
                    <h1 className="wow-main-title">Quản lý môn học</h1>
                    <p className="wow-sub-title">Quản lý danh mục và phân công giảng dạy cho toàn Khoa.</p>
                </div>
                {isAdmin && (
                    <div className="wow-tabs">
                        <button 
                            className={`tab-btn ${activeTab === 'assignment' ? 'active' : ''}`}
                            onClick={() => setActiveTab('assignment')}
                        >
                            Phân công giảng dạy
                        </button>
                        <button 
                            className={`tab-btn ${activeTab === 'management' ? 'active' : ''}`}
                            onClick={() => setActiveTab('management')}
                        >
                            Quản lý danh mục
                        </button>
                    </div>
                )}
            </div>

            {message && <div className="wow-alert success">{message}</div>}
            {error && <div className="wow-alert error">{error}</div>}

            {isAdmin && activeTab === 'assignment' && (
                <div className="wow-form-card">
                    <div className="wow-form-section-header">
                        <div className="wow-form-icon-container">
                            <svg width="32" height="32" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
                        </div>
                        <div className="wow-form-title">
                            <h4>{assignForm.id ? "Hiệu chỉnh Phân công" : "Giao việc Giảng dạy"}</h4>
                            <p>{assignForm.id ? "Cập nhật lại thời gian và địa điểm giảng dạy." : "Chọn giảng viên và vai trò tương ứng cho môn học."}</p>
                        </div>
                    </div>

                    <form onSubmit={handleAssignSubmit} className="wow-form-grid">
                        <div className="wow-input-group">
                            <label>Giảng viên</label>
                            <div className="wow-input-field-wrapper">
                                <select 
                                    value={assignForm.user_id} 
                                    onChange={(e) => setAssignForm({...assignForm, user_id: e.target.value})}
                                    required
                                >
                                    <option value="">-- Chọn giảng viên --</option>
                                    {lecturers.map(l => (
                                        <option key={l.user_id} value={l.user_id} disabled={assignForm.id && assignForm.user_id !== l.user_id}>
                                            {l.full_name} ({l.employee_code})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="wow-input-group">
                            <label>Môn học</label>
                            <div className="wow-input-field-wrapper">
                                <select 
                                    value={assignForm.subject_id} 
                                    onChange={(e) => setAssignForm({...assignForm, subject_id: e.target.value})}
                                    required
                                >
                                    <option value="">-- Chọn môn học --</option>
                                    {subjects.map(s => (
                                        <option key={s.id} value={s.id} disabled={assignForm.id && assignForm.subject_id !== s.id}>
                                            {s.subject_name} ({s.subject_code})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="wow-input-group">
                            <label>Thời gian bắt đầu</label>
                            <div className="wow-input-field-wrapper">
                                <input 
                                    type="date"
                                    value={assignForm.ngay_bat_dau} 
                                    onChange={(e) => setAssignForm({...assignForm, ngay_bat_dau: e.target.value})}
                                    required
                                />
                            </div>
                        </div>

                        <div className="wow-input-group">
                            <label>Thời gian kết thúc</label>
                            <div className="wow-input-field-wrapper">
                                <input 
                                    type="date"
                                    value={assignForm.ngay_ket_thuc} 
                                    onChange={(e) => setAssignForm({...assignForm, ngay_ket_thuc: e.target.value})}
                                    required
                                />
                            </div>
                        </div>

                        <div className="wow-input-group">
                            <label>Thứ (2-7)</label>
                            <div className="wow-input-field-wrapper">
                                <input 
                                    type="number"
                                    min="2" max="8"
                                    value={assignForm.thu} 
                                    onChange={(e) => setAssignForm({...assignForm, thu: e.target.value})}
                                    required
                                />
                            </div>
                        </div>

                        <div className="wow-input-group">
                            <label>Ca học</label>
                            <div className="wow-input-field-wrapper">
                                <input 
                                    type="number"
                                    min="1" max="10"
                                    value={assignForm.ca} 
                                    onChange={(e) => setAssignForm({...assignForm, ca: e.target.value})}
                                    required
                                />
                            </div>
                        </div>

                        <div className="wow-input-group" style={{gridColumn: 'span 2'}}>
                            <label>Phòng học</label>
                            <div className="wow-input-field-wrapper">
                                <input 
                                    type="text"
                                    placeholder="VD: A1-102"
                                    value={assignForm.phong} 
                                    onChange={(e) => setAssignForm({...assignForm, phong: e.target.value})}
                                    required
                                />
                            </div>
                        </div>

                        <div className="wow-form-actions" style={{ gridColumn: 'span 2', display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                            {assignForm.id && (
                                <button type="button" className="btn-wow btn-wow-cancel" onClick={() => setAssignForm({id:null, user_id:'', subject_id:'', ngay_bat_dau:'', ngay_ket_thuc:'', ca:1, phong:'', thu:2})}>
                                    Hủy
                                </button>
                            )}
                            <button type="submit" className="btn-wow">
                                <span>{assignForm.id ? "Lưu thay đổi" : "Phân công ngay"}</span>
                                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"></path></svg>
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {isAdmin && activeTab === 'management' && (
                <div className="wow-form-card">
                    <div className="wow-form-section-header">
                        <div className="wow-form-icon-container">
                            <svg width="32" height="32" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
                        </div>
                        <div className="wow-form-title">
                            <h4>{subjectForm.id ? "Hiệu chỉnh Môn học" : "Thêm Môn học Mới"}</h4>
                            <p>Cập nhật danh mục môn học đào tạo của Khoa.</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubjectSubmit} className="wow-form-grid">
                        <div className="wow-input-group">
                            <label>Mã môn học</label>
                            <div className="wow-input-field-wrapper">
                                <input 
                                    type="text" 
                                    placeholder="VD: IT001" 
                                    value={subjectForm.subject_code}
                                    onChange={(e) => setSubjectForm({...subjectForm, subject_code: e.target.value.toUpperCase()})}
                                    required
                                />
                            </div>
                        </div>
                        <div className="wow-input-group">
                            <label>Tên môn học</label>
                            <div className="wow-input-field-wrapper">
                                <input 
                                    type="text" 
                                    placeholder="VD: Lập trình Web" 
                                    value={subjectForm.subject_name}
                                    onChange={(e) => setSubjectForm({...subjectForm, subject_name: e.target.value})}
                                    required
                                />
                            </div>
                        </div>
                        <div className="wow-input-group">
                            <label>Số tín chỉ</label>
                            <div className="wow-input-field-wrapper">
                                <input 
                                    type="number" 
                                    value={subjectForm.credits}
                                    onChange={(e) => setSubjectForm({...subjectForm, credits: e.target.value})}
                                    required
                                    min="1"
                                />
                            </div>
                        </div>
                        <div className="wow-form-actions" style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', justifyContent: 'flex-end' }}>
                            {subjectForm.id && (
                                <button type="button" className="btn-wow btn-wow-cancel" onClick={() => setSubjectForm({id:null, subject_code:'', subject_name:'', credits:3})}>
                                    Hủy
                                </button>
                            )}
                            <button type="submit" className="btn-wow">
                                <span>{subjectForm.id ? "Cập nhật" : "Thêm vào danh mục"}</span>
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="wow-list-section">
                <div className="wow-list-header">
                    <h2>{activeTab === 'assignment' ? (isAdmin ? "Danh sách Phân công" : "Môn học của tôi") : "Danh mục Môn học"}</h2>
                </div>

                {activeTab === 'assignment' ? (
                    assignments.length > 0 ? (
                        assignments.map((a, idx) => (
                            <div key={a.id} className="wow-assignment-row" style={{ animationDelay: `${idx * 0.05}s` }}>
                                <div className="wow-lecturer-cell">
                                    <div className="wow-lecturer-avatar">{a.lecturer_name.charAt(0)}</div>
                                    <div className="wow-lecturer-meta">
                                        <span className="wow-lecturer-name">{a.lecturer_name}</span>
                                        <span className="wow-lecturer-username">{a.lecturer_username}</span>
                                    </div>
                                </div>
                                <div className="wow-subject-cell">
                                    <span className="wow-subject-name">{a.subject_name}</span>
                                    <span className="wow-subject-code">{a.subject_code}</span>
                                </div>
                                <div className="wow-credits-badge">Thứ {a.Thu} - Ca {a.Ca}</div>
                                <div className="wow-semester-badge">Phòng: {a.Phong}</div>
                                <div className="wow-role-cell">
                                    <span style={{fontSize:'0.8rem', color:'#64748b'}}>
                                        {new Date(a.NgayBatDau).toLocaleDateString()} - {new Date(a.NgayKetThuc).toLocaleDateString()}
                                    </span>
                                </div>
                                {isAdmin && (
                                    <div className="wow-list-actions">
                                        <button className="btn-icon-wow edit-blue" onClick={() => handleEditAssignment(a)} title="Sửa phân công" style={{ marginRight: '0.5rem' }}>
                                            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                                        </button>
                                        <button className="btn-icon-wow-rect" onClick={() => handleDeleteAssignment(a.id)} title="Xóa phân công">
                                            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="wow-empty-state">
                            <div className="wow-empty-icon">📂</div>
                            <h4>Chưa có dữ liệu phân công</h4>
                            <p>Các môn học được phân công sẽ hiển thị ở đây.</p>
                        </div>
                    )
                ) : (
                    subjects.length > 0 ? (
                        subjects.map((s, idx) => (
                            <div key={s.id} className="wow-assignment-row management" style={{ animationDelay: `${idx * 0.05}s` }}>
                                <div className="wow-subject-cell">
                                    <span className="wow-subject-name">{s.subject_name}</span>
                                    <span className="wow-subject-code">{s.subject_code}</span>
                                </div>
                                <div className="wow-credits-badge">{s.credits} Tín chỉ</div>
                                <div style={{ gridColumn: 'span 2' }}></div> {/* Spacer */}
                                <div className="wow-list-actions">
                                    <button className="btn-icon-wow edit-blue" onClick={() => handleEditSubject(s)} title="Sửa môn học" style={{ marginRight: '0.5rem' }}>
                                        <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                                    </button>
                                    <button className="btn-icon-wow-rect" onClick={() => handleDeleteSubject(s.id)} title="Xóa môn học">
                                        <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="wow-empty-state">
                            <div className="wow-empty-icon">📚</div>
                            <h4>Danh mục môn học trống</h4>
                            <p>Vui lòng thêm môn học mới để bắt đầu phân công.</p>
                        </div>
                    )
                )}
            </div>
        </div>
    );
};

export default SubjectAssignment;
