import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { getUserReminders, createReminder, deleteReminder, toggleReminder } from '../api/reminders';
import { fetchTasks } from '../api/tasks';
import PaginationWow from './PaginationWow';
import './ReminderWow.css';

const ReminderManagement = () => {
    const { user } = useContext(AuthContext);
    const [reminders, setReminders] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [newReminder, setNewReminder] = useState({ task_id: '', message: '', reminder_time: '' });
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 3;

    const loadInitialData = React.useCallback(async () => {
        setLoading(true);
        try {
            const [remindersRes, tasksRes] = await Promise.all([
                getUserReminders(user.id),
                fetchTasks()
            ]);
            
            // Đề phòng trường hợp Backend trả về file HTML (chưa restart server.js) thay vì mảng JSON
            const validReminders = Array.isArray(remindersRes?.data) ? remindersRes.data : [];
            const validTasks = Array.isArray(tasksRes) ? tasksRes : [];

            setReminders(validReminders);
            
            // Lọc ra các công việc (tasks) được giao cho giảng viên hiện tại
            // LƯU Ý: API backend trả về trường 'assignee_id', thay vì 'assigned_to'
            const myTasks = validTasks.filter(t => t.assignee_id === user.id);
            setTasks(myTasks);
            
            if (myTasks.length > 0) {
                setNewReminder(prev => ({ ...prev, task_id: myTasks[0].task_id }));
            }
        } catch (error) {
            console.error("Lỗi tải dữ liệu:", error);
        }
        setLoading(false);
    }, [user.id]);

    useEffect(() => {
        if (user) {
            loadInitialData();
        }
    }, [user, loadInitialData]);

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await createReminder({ ...newReminder, user_id: user.id });
            setNewReminder({ ...newReminder, message: '', reminder_time: '' }); // Giữ lại task_id
            
            // Tải lại chỉ danh sách reminders
            const res = await getUserReminders(user.id);
            setReminders(res.data);
        } catch (error) {
            console.error("Lỗi tạo nhắc nhở:", error);
            alert("Lỗi tạo nhắc nhở. Vui lòng thử lại!");
        }
    };

    const handleToggle = async (id, currentStatus) => {
        try {
            const newStatus = currentStatus === 1 ? 0 : 1;
            await toggleReminder(id, newStatus);
            // Cập nhật state cục bộ để giao diện phản hồi nhanh thay vì gọi API lại
            setReminders(reminders.map(r => r.reminder_id === id ? { ...r, is_active: newStatus } : r));
        } catch (error) {
            console.error("Lỗi bật/tắt:", error);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa nhắc nhở này?")) return;
        try {
            await deleteReminder(id);
            setReminders(reminders.filter(r => r.reminder_id !== id));
        } catch (error) {
            console.error("Lỗi xóa nhắc nhở:", error);
        }
    };

    const getTaskSubjectName = (taskId) => {
        const t = tasks.find(x => x.task_id === taskId);
        return t ? t.title : "Công việc chung";
    };

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentReminders = reminders.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(reminders.length / itemsPerPage);

    return (
        <div className="reminder-page-body">
            <div className="wow-header">
                <div className="wow-header-left">
                    <h1>Lịch Nhắc Nhở</h1>
                    <p>Quản lý hộp thư báo thức cá nhân của bạn</p>
                </div>
            </div>

            <div className="reminder-grid">
                {/* Cột Trái: Thêm mới */}
                <div className="glass-card-wow">
                    <h3>
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="24" height="24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                        </svg>
                        Tạo Lịch Mới
                    </h3>

                    <form onSubmit={handleCreate}>
                        <div className="form-group-wow">
                            <label>Chọn Công Việc</label>
                            <select 
                                className="form-control-wow" 
                                value={newReminder.task_id} 
                                onChange={e => setNewReminder({...newReminder, task_id: e.target.value})} 
                                required
                            >
                                {tasks.length === 0 && <option value="">Không có công việc nào</option>}
                                {tasks.map(t => (
                                    <option key={t.task_id} value={t.task_id}>
                                        {t.title} {t.category ? `- ${t.category}` : ''}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group-wow">
                            <label>Nội Dung Ghi Chú</label>
                            <input 
                                type="text" 
                                className="form-control-wow" 
                                placeholder="Ví dụ: Nộp bảng điểm..." 
                                value={newReminder.message} 
                                onChange={e => setNewReminder({...newReminder, message: e.target.value})} 
                                required 
                            />
                        </div>

                        <div className="form-group-wow">
                            <label>Hẹn Giờ Báo Thức</label>
                            <input 
                                type="datetime-local" 
                                className="form-control-wow" 
                                value={newReminder.reminder_time} 
                                onChange={e => setNewReminder({...newReminder, reminder_time: e.target.value})} 
                                required 
                            />
                        </div>

                        <button type="submit" className="btn-primary-wow" disabled={tasks.length === 0}>
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                            </svg>
                            Thêm Báo Thức
                        </button>
                    </form>
                </div>

                {/* Cột Phải: Danh sách */}
                <div className="glass-card-wow">
                    <h3>
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="24" height="24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        Danh Sách Báo Thức
                    </h3>

                    {loading ? (
                        <p style={{textAlign: 'center', color: '#64748b', padding: '2rem'}}>Đang tải dữ liệu...</p>
                    ) : reminders.length === 0 ? (
                        <div className="empty-reminders">
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="64" height="64">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
                            </svg>
                            <h4>Chưa có báo thức nào</h4>
                            <p>Hãy tạo lịch nhắc nhở đầu tiên để không quên việc nhé!</p>
                        </div>
                    ) : (
                        <div className="reminder-list-wow">
                            {currentReminders.map(rem => (
                                <div key={rem.reminder_id} className={`reminder-item-wow ${!rem.is_active ? 'inactive' : ''}`}>
                                    <div className="reminder-info">
                                        <div className="reminder-msg">{rem.message}</div>
                                        <div style={{display: 'flex', gap: '10px', alignItems: 'center'}}>
                                            <span className="reminder-time-badge">
                                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="14" height="14">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                                </svg>
                                                {new Date(rem.reminder_time).toLocaleString('vi-VN', {hour: '2-digit', minute:'2-digit', day:'2-digit', month:'2-digit', year:'numeric'})}
                                            </span>
                                            <span style={{fontSize: '0.8rem', color: '#64748b', fontWeight: '600'}}>
                                                Môn: {getTaskSubjectName(rem.task_id)}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="reminder-actions">
                                        {/* Toggle Switch */}
                                        <label className="switch-wow" title={rem.is_active ? "Tắt báo thức" : "Bật báo thức"}>
                                            <input 
                                                type="checkbox" 
                                                checked={rem.is_active === 1} 
                                                onChange={() => handleToggle(rem.reminder_id, rem.is_active)} 
                                            />
                                            <span className="slider-wow"></span>
                                        </label>

                                        <button className="btn-icon-wow btn-delete-wow" title="Xóa rác" onClick={() => handleDelete(rem.reminder_id)}>
                                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    
                    {reminders.length > 0 && (
                        <PaginationWow currentPage={currentPage} totalPages={totalPages} paginate={setCurrentPage} />
                    )}
                </div>
            </div>
        </div>
    );
};

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, errorInfo: error.toString() };
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: '2rem', color: 'red' }}>
                    <h2>Oops! Component crashed!</h2>
                    <pre style={{ whiteSpace: 'pre-wrap', background: '#ffebee', padding: '10px' }}>
                        {this.state.errorInfo}
                    </pre>
                </div>
            );
        }
        return <ReminderManagement />;
    }
}

export default ErrorBoundary;
