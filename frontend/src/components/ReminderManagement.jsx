import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { getUserReminders, createReminder, deleteReminder, toggleReminder } from '../api/reminders';

const ReminderManagement = () => {
    const { user } = useContext(AuthContext); // Lấy user đang đăng nhập
    const [reminders, setReminders] = useState([]);
    const [newReminder, setNewReminder] = useState({ task_id: '', message: '', reminder_time: '' });

    useEffect(() => {
        if (user) loadReminders();
    }, [user]);

    const loadReminders = async () => {
        try {
            const res = await getUserReminders(user.id);
            setReminders(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await createReminder({ ...newReminder, user_id: user.id });
            setNewReminder({ task_id: '', message: '', reminder_time: '' });
            loadReminders();
        } catch (error) {
            console.error("Lỗi tạo nhắc nhở:", error);
        }
    };

    const handleToggle = async (id, currentStatus) => {
        try {
            const newStatus = currentStatus === 1 ? 0 : 1; // Đảo trạng thái
            await toggleReminder(id, newStatus);
            loadReminders(); // Tải lại danh sách
        } catch (error) {
            console.error("Lỗi bật/tắt:", error);
        }
    };

    return (
        <div>
            <h2>Quản lý Nhắc Nhở</h2>
            
            <form onSubmit={handleCreate}>
                <input type="number" placeholder="ID Công việc" value={newReminder.task_id} onChange={e => setNewReminder({...newReminder, task_id: e.target.value})} required />
                <input type="text" placeholder="Nội dung nhắc nhở" value={newReminder.message} onChange={e => setNewReminder({...newReminder, message: e.target.value})} required />
                <input type="datetime-local" value={newReminder.reminder_time} onChange={e => setNewReminder({...newReminder, reminder_time: e.target.value})} required />
                <button type="submit">Tạo nhắc nhở</button>
            </form>

            <ul>
                {reminders.map(rem => (
                    <li key={rem.reminder_id} style={{ opacity: rem.is_active ? 1 : 0.5 }}>
                        <strong>{rem.message}</strong> - Lúc: {new Date(rem.reminder_time).toLocaleString()}
                        
                        <button onClick={() => handleToggle(rem.reminder_id, rem.is_active)}>
                            {rem.is_active ? 'Tắt' : 'Bật'}
                        </button>
                        <button onClick={async () => { await deleteReminder(rem.reminder_id); loadReminders(); }}>
                            Xóa
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ReminderManagement;
