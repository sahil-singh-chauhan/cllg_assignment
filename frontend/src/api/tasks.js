import api from './axios';
export const getTasks          = ()                   => api.get('/tasks');
export const createTask        = (data)               => api.post('/tasks', data);
export const updateTaskStatus  = (taskId, status)     => api.patch(`/tasks/${taskId}/status`, { status });
