import axios from 'axios';

const API_URL = '/api/users';

const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return { Authorization: `Bearer ${token}` };
};

export const fetchUsers = async (search = '') => {
    const response = await axios.get(`${API_URL}?search=${search}`, { headers: getAuthHeader() });
    return response.data;
};

export const addUser = async (userData) => {
    const response = await axios.post(API_URL, userData, { headers: getAuthHeader() });
    return response.data;
};

export const updateUser = async (id, userData) => {
    const response = await axios.put(`${API_URL}/${id}`, userData, { headers: getAuthHeader() });
    return response.data;
};

export const deleteUser = async (id) => {
    const response = await axios.delete(`${API_URL}/${id}`, { headers: getAuthHeader() });
    return response.data;
};
