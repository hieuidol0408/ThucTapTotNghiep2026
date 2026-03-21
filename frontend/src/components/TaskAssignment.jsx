import React, { useState, useEffect, useMemo } from 'react';
import { fetchTasks, createTask, deleteTask } from '../api/tasks';
import { fetchUsers } from '../api/users';
import '../TaskAssignmentWow.css';

const TaskAssignment = () => {
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  
  // Form state
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assigned_to: '',
    due_date: '',
    status: 'todo'
  });
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Fetch initial data
  useEffect(() => {
    loadUsers();
    loadTasks();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await fetchUsers();
      setUsers(data);
    } catch (err) {
      console.error('Failed to load users:', err);
    }
  };

  const loadTasks = async () => {
    try {
      setLoading(true);
      const data = await fetchTasks();
      setTasks(data);
      setError('');
    } catch (err) {
      setError('Lấy danh sách công việc thất bại');
    } finally {
      setLoading(false);
    }
  };

  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : {};
  const currentRole = user?.role;

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.assigned_to || !formData.due_date) {
      setError('Vui lòng điền các trường bắt buộc');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await createTask(formData);
      setMessage('Giao công việc mới cực mượt thành công!');
      
      // Reset form & reload
      setFormData({
        title: '',
        description: '',
        assigned_to: '',
        due_date: '',
        status: 'todo'
      });
      setShowForm(false);
      loadTasks();
      
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Giao công việc thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa công việc này?')) return;
    try {
      await deleteTask(id);
      setTasks(tasks.filter(t => t.id !== id));
      setMessage('Đã xóa công việc khỏi hệ thống.');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      alert('Lỗi khi xóa công việc');
    }
  };


  const handleSearch = (e) => {
    setSearch(e.target.value);
  };

  const filteredTasks = tasks.filter(task => 
    task.title.toLowerCase().includes(search.toLowerCase()) || 
    (task.assignee_name && task.assignee_name.toLowerCase().includes(search.toLowerCase()))
  );

  // Derive stats
  const stats = useMemo(() => {
    return {
      total: tasks.length,
      todo: tasks.filter(t => t.status === 'todo').length,
      done: tasks.filter(t => t.status === 'completed').length,
      late: tasks.filter(t => t.status === 'late').length,
    };
  }, [tasks]);

  const getStatusWowClass = (status) => {
    switch (status) {
      case 'todo': return 'bw-todo-visual';
      case 'completed': return 'bw-completed-visual';
      case 'late': return 'bw-late-visual';
      default: return 'bw-todo-visual';
    }
  };

  const StatusIcon = ({ status }) => {
    switch (status) {
      case 'todo': return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
      );
      case 'completed': return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
        </svg>
      );
      case 'late': return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
        </svg>
      );
      default: return null;
    }
  };

  const formatDateString = (dateString) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    return d.toLocaleDateString('vi-VN');
  };

  return (
    <div className="task-wow-container">
        {/* Jaw-Dropping Background Element */}
        <div className="task-wow-bg"></div>

        {/* Hero Banner inside the page */}
        <div className="wow-header">
            <div className="wow-header-left">
                <h1>Không gian phân công</h1>
                <p>Nơi theo dõi tiến độ và giao việc mượt mà nhất</p>
            </div>
            
            {currentRole === 'admin' && (
                <button 
                    className={`btn-wow ${showForm ? 'btn-wow-cancel' : ''}`} 
                    onClick={() => {
                        setShowForm(!showForm);
                        setError('');
                        setFormData({ title: '', description: '', assigned_to: '', due_date: '', status: 'todo' });
                    }}
                >
                    {showForm ? 'Đóng lại' : (
                        <>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                            Giao Việc Mới Trực Quan
                        </>
                    )}
                </button>
            )}
        </div>

        {message && <div style={{background:'rgba(16,185,129,0.1)', color:'#059669', padding:'1rem 2rem', borderRadius:'16px', marginBottom:'2rem', border:'1px solid rgba(16,185,129,0.2)', fontWeight:'700'}}>{message}</div>}
        {error && <div style={{background:'rgba(239,68,68,0.1)', color:'#dc2626', padding:'1rem 2rem', borderRadius:'16px', marginBottom:'2rem', border:'1px solid rgba(239,68,68,0.2)', fontWeight:'700'}}>{error}</div>}

        {/* Floating Stat Cards Level 99 */}
        <div className="wow-stats-grid">
            <div className="wow-stat">
                <div className="wow-stat-icon-wrapper icon-blue">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>
                </div>
                <div className="wow-stat-label">Tổng khối lượng</div>
                <div className="wow-stat-val">{stats.total}</div>
            </div>
            <div className="wow-stat">
                <div className="wow-stat-icon-wrapper icon-purple">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                </div>
                <div className="wow-stat-label">Cần thực hiện</div>
                <div className="wow-stat-val">{stats.todo}</div>
            </div>
            <div className="wow-stat">
                <div className="wow-stat-icon-wrapper icon-green">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                </div>
                <div className="wow-stat-label">Đã hoàn tất</div>
                <div className="wow-stat-val">{stats.done}</div>
            </div>
            <div className="wow-stat">
                <div className="wow-stat-icon-wrapper icon-red">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                </div>
                <div className="wow-stat-label">Bị trễ hạn</div>
                <div className="wow-stat-val">{stats.late}</div>
            </div>
        </div>

        {/* Glass Form Modal */}
        {showForm && currentRole === 'admin' && (
            <div className="wow-form-card">
                <div className="wow-form-header">
                    <h4>📝 Khởi tạo nhiệm vụ mới</h4>
                    <p>Hệ thống tự động thông báo và theo dõi mốc thời gian hoàn thành</p>
                </div>
                
                <form onSubmit={handleSubmit}>
                    <div className="wow-form-grid">
                        <div className="wow-form-group" style={{ gridColumn: '1 / -1' }}>
                            <label>Tên nhiệm vụ <span className="text-red-500 ml-1">*</span></label>
                            <div className="wow-input-wrapper">
                                <svg className="wow-input-icon" width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9"></path></svg>
                                <input 
                                    type="text" 
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    placeholder="Ví dụ: Rà soát cơ sở dữ liệu học kỳ 1"
                                    required
                                />
                            </div>
                        </div>

                        <div className="wow-form-group" style={{ gridColumn: '1 / -1' }}>
                            <label>Mô tả và yêu cầu</label>
                            <div className="wow-input-wrapper textarea">
                                <svg className="wow-input-icon" width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h7"></path></svg>
                                <textarea 
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    placeholder="Ghi chú chi tiết các tài liệu liên quan..."
                                    rows="3"
                                />
                            </div>
                        </div>

                        <div className="wow-form-group">
                            <label>Chỉ định nhân sự <span className="text-red-500 ml-1">*</span></label>
                            <div className="wow-input-wrapper">
                                <svg className="wow-input-icon" width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                                <select 
                                    name="assigned_to"
                                    value={formData.assigned_to}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="">Lựa chọn người phụ trách...</option>
                                    {users.map(u => (
                                        <option key={u.id} value={u.id}>{u.full_name} (@{u.username})</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="wow-form-group">
                            <label>Kỳ hạn chót (Deadline) <span className="text-red-500 ml-1">*</span></label>
                            <div className="wow-input-wrapper">
                                <svg className="wow-input-icon" width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                <input 
                                    type="date"
                                    name="due_date" 
                                    value={formData.due_date}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="wow-form-group">
                            <label>Trạng thái ban đầu</label>
                            <div className="wow-input-wrapper">
                                <span className="wow-input-icon" style={{fontSize: '1.2rem'}}>
                                    {formData.status === 'todo' && '🕒'}
                                    {formData.status === 'in-progress' && '⚡'}
                                    {formData.status === 'completed' && '✅'}
                                    {formData.status === 'late' && '🔥'}
                                </span>
                                <select 
                                    name="status"
                                    value={formData.status}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="todo">Cần làm</option>
                                    <option value="completed">Hoàn tất</option>
                                    <option value="late">Trễ hạn</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div style={{ marginTop: '3rem', textAlign: 'center' }}>
                        <button type="submit" className="btn-wow" disabled={loading} style={{ width: '100%', maxWidth: '400px', display: 'flex', justifyContent: 'center' }}>
                            <span className="mr-2">🚀</span>
                            {loading ? 'Hệ thống đang xử lý...' : 'Xác Lập Nhiệm Vụ Ngay'}
                        </button>
                    </div>
                </form>
            </div>
        )}

        {/* Floating List UI */}
        <div className="wow-list-header">
            <h3>Nhiệm vụ hệ thống</h3>
            <div className="search-container" style={{maxWidth: '300px', flex:1, marginLeft:'2rem'}}>
                <input 
                    type="text" 
                    placeholder="Tìm kiếm thông minh..." 
                    value={search}
                    onChange={handleSearch}
                    style={{width: '100%', padding:'0.75rem 1rem 0.75rem 3rem', borderRadius:'14px', border:'none', background:'rgba(255,255,255,0.8)', boxShadow:'0 4px 15px rgba(0,0,0,0.05)'}}
                    title="Bạn có thể tìm bằng tên việc hoặc người nhận"
                />
                <svg style={{position:'absolute', left:'14px', top:'50%', transform:'translateY(-50%)', color:'#94a3b8', width:'20px', height:'20px'}} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </div>
            <button onClick={loadTasks} style={{marginLeft:'1rem', background:'rgba(255,255,255,0.8)', border:'none', padding:'0.75rem 1.25rem', borderRadius:'14px', fontWeight:'700', color:'#4f46e5', cursor:'pointer', boxShadow:'0 4px 15px rgba(0,0,0,0.05)', display:'flex', alignItems:'center', gap:'8px', transition:'all 0.2s'}}>
                <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                Làm mới
            </button>
        </div>

        <div className="wow-list-container">
            {loading ? (
                <div className="wow-empty-state">
                    <div className="wow-empty-icon">⏳</div>
                    <h4>Đang đồng bộ dữ liệu</h4>
                    <p>Vui lòng chờ trong giây lát...</p>
                </div>
            ) : filteredTasks.length === 0 ? (
                <div className="wow-empty-state">
                    <div className="wow-empty-icon">📂</div>
                    <h4>Không gian trống trải</h4>
                    <p>Chưa có nhiệm vụ nào được ghi nhận trên hệ thống</p>
                </div>
            ) : (
                filteredTasks.map(task => (
                    <div className="wow-task-row" key={task.id}>
                        <div className="task-title-cell">
                            <div className="task-wow-title">{task.title}</div>
                            {task.description && (
                                <div className="task-wow-desc">{task.description}</div>
                            )}
                        </div>
                        
                        <div className="wow-assignee-cell">
                            <div className="wow-avatar">{task.assignee_name?.charAt(0) || '?'}</div>
                            <div className="wow-assignee-info">
                                <span className="wow-assignee-name">{task.assignee_name}</span>
                                <span className="wow-assignee-tag">@{task.assignee_username}</span>
                            </div>
                        </div>

                        <div className="date-cell">
                            <span className="wow-date" title="Hạn chót hoàn thành">📅 {formatDateString(task.due_date)}</span>
                        </div>

                        <div className="status-cell">
                            <div className={`badge-wow-visual ${getStatusWowClass(task.status)}`} style={{ cursor: 'default' }}>
                                <StatusIcon status={task.status} />
                                <span>
                                    {task.status === 'todo' && 'Cần làm'}
                                    {task.status === 'completed' && 'Hoàn tất'}
                                    {task.status === 'late' && 'Trễ hạn'}
                                </span>
                            </div>
                        </div>

                        <div className="actions-cell">
                            {currentRole === 'admin' ? (
                                <button className="btn-icon-wow delete" onClick={() => handleDelete(task.id)} title="Gỡ bỏ nhiệm vụ">
                                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                </button>
                            ) : (
                                <span style={{width:'44px'}}></span>
                            )}
                        </div>
                    </div>
                ))
            )}
        </div>
    </div>
  );
};

export default TaskAssignment;
