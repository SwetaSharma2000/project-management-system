import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:5000' });

export const getProjects  = (page = 1, limit = 10) => API.get(`/projects?page=${page}&limit=${limit}`);
export const getProject   = (id) => API.get(`/projects/${id}`);
export const createProject = (data) => API.post('/projects', data);
export const deleteProject = (id) => API.delete(`/projects/${id}`);