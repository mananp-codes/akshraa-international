/**
 * Product API functions
 * All product-related HTTP calls to the backend
 */

import api from './axiosInstance';

// Get all products with optional filters
export const getProducts = (params) => api.get('/products', { params });

// Get surplus/deal products for homepage
export const getSurplusDeals = () => api.get('/products/surplus-deals');

// Get featured products for homepage
export const getFeaturedProducts = () => api.get('/products/featured');

// Get single product by ID
export const getProductById = (id) => api.get(`/products/${id}`);

// Create new product (Seller/Admin) - uses FormData for image uploads
export const createProduct = (formData) =>
  api.post('/products', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

// Update product
export const updateProduct = (id, formData) =>
  api.put(`/products/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

// Delete product
export const deleteProduct = (id) => api.delete(`/products/${id}`);

// Add review to product
export const addReview = (id, data) => api.post(`/products/${id}/reviews`, data);

// Delete product image
export const deleteProductImage = (productId, publicId) =>
  api.delete(`/products/${productId}/images/${publicId}`);
