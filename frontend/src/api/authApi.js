/**
 * Auth API functions
 */

import api from './axiosInstance';

export const registerUser = (data) => api.post('/auth/register', data);
export const loginUser = (data) => api.post('/auth/login', data);
export const getMe = () => api.get('/auth/me');
export const updateProfile = (data) => api.put('/auth/updateprofile', data);
export const changePassword = (data) => api.put('/auth/changepassword', data);
