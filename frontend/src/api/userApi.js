/**
 * User/Admin API functions
 */

import api from './axiosInstance';

export const getAllUsers = (params) => api.get('/users', { params });
export const getUserById = (id) => api.get(`/users/${id}`);
export const approveUser = (id, isApproved) => api.put(`/users/${id}/approve`, { isApproved });
export const toggleUserStatus = (id) => api.put(`/users/${id}/activate`);
export const deleteUser = (id) => api.delete(`/users/${id}`);
export const getPendingSellers = () => api.get('/users/sellers/pending');
export const getSellerDashboard = () => api.get('/users/seller/dashboard');
export const getAdminStats = () => api.get('/users/admin/stats');
