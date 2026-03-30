import axios from 'axios';

const API_URL = 'http://localhost:5000/api/reminders';

export const getUserReminders = async (userId) => axios.get(`${API_URL}/user/${userId}`);
export const createReminder = async (data) => axios.post(API_URL, data);
export const updateReminder = async (id, data) => axios.put(`${API_URL}/${id}`, data);
export const deleteReminder = async (id) => axios.delete(`${API_URL}/${id}`);
export const toggleReminder = async (id, is_active) => axios.patch(`${API_URL}/${id}/toggle`, { is_active });
