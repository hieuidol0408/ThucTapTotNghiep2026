import axios from 'axios';

const API_URL = '/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    headers: { Authorization: `Bearer ${token}` }
  };
};

export const getUserReminders = async (userId) => axios.get(`${API_URL}/reminders/user/${userId}`, getAuthHeaders());
export const createReminder = async (data) => axios.post(`${API_URL}/reminders`, data, getAuthHeaders());
export const updateReminder = async (id, data) => axios.put(`${API_URL}/reminders/${id}`, data, getAuthHeaders());
export const deleteReminder = async (id) => axios.delete(`${API_URL}/reminders/${id}`, getAuthHeaders());
export const toggleReminder = async (id, is_active) => axios.patch(`${API_URL}/reminders/${id}/toggle`, { is_active }, getAuthHeaders());
