import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL
});

export const getTasks    = (projectId, params = {}) => API.get(`/projects/${projectId}/tasks`, { params });
export const createTask  = (projectId, data) => API.post(`/projects/${projectId}/tasks`, data);
export const updateTask  = (id, data) => API.put(`/tasks/${id}`, data);
export const deleteTask  = (id) => API.delete(`/tasks/${id}`);