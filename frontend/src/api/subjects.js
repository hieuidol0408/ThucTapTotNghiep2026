import axios from 'axios';

const API_URL = '/api/subjects';

const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return { Authorization: `Bearer ${token}` };
};

// Lấy danh sách môn học
export const fetchSubjects = async () => {
    const response = await axios.get(API_URL, { headers: getAuthHeader() });
    return response.data;
};

// Lấy danh sách phân công
export const fetchAssignments = async () => {
    const response = await axios.get(`${API_URL}/assignments`, { headers: getAuthHeader() });
    return response.data;
};

// Tạo phân công mới
export const createAssignment = async (data) => {
    const response = await axios.post(`${API_URL}/assignments`, data, { headers: getAuthHeader() });
    return response.data;
};

// Xóa phân công
export const deleteAssignment = async (id) => {
    const response = await axios.delete(`${API_URL}/assignments/${id}`, { headers: getAuthHeader() });
    return response.data;
};
