import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    headers: { Authorization: `Bearer ${token}` }
  };
};

export const fetchTasks = async () => {
  const response = await axios.get(`${API_URL}/tasks`, getAuthHeaders());
  return response.data;
};

export const createTask = async (taskData) => {
  const response = await axios.post(`${API_URL}/tasks`, taskData, getAuthHeaders());
  return response.data;
};

export const updateTaskStatus = async (id, status) => {
  const response = await axios.put(`${API_URL}/tasks/${id}/status`, { status }, getAuthHeaders());
  return response.data;
};

export const deleteTask = async (id) => {
  const response = await axios.delete(`${API_URL}/tasks/${id}`, getAuthHeaders());
  return response.data;
};
