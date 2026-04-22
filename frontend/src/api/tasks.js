import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:5000' });

export const getTasks    = (projectId, params = {}) => API.get(`/projects/${projectId}/tasks`, { params });
export const createTask  = (projectId, data) => API.post(`/projects/${projectId}/tasks`, data);
export const updateTask  = (id, data) => API.put(`/tasks/${id}`, data);
export const deleteTask  = (id) => API.delete(`/tasks/${id}`);