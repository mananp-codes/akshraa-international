/**
 * Order API functions
 */

import api from './axiosInstance';

// Create new order (returns Razorpay order ID)
export const createOrder = (orderData) => api.post('/orders', orderData);

// Verify Razorpay payment
export const verifyPayment = (orderId, paymentData) =>
  api.post(`/orders/${orderId}/verify-payment`, paymentData);

// Get current user's orders
export const getMyOrders = () => api.get('/orders/myorders');

// Get single order by ID
export const getOrderById = (id) => api.get(`/orders/${id}`);

// Admin: get all orders
export const getAllOrders = (params) => api.get('/orders', { params });

// Admin: update order status
export const updateOrderStatus = (id, data) => api.put(`/orders/${id}/status`, data);

// Admin: get order stats
export const getOrderStats = () => api.get('/orders/stats');
