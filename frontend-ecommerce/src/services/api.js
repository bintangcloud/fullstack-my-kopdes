import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
  headers: { 'Content-Type': 'application/json' }
});

export const getProducts = () => api.get('/products').then(res => res.data);
export const checkout = (data) => api.post('/checkout', data);
export const submitReview = (productId, data) => api.post(`/products/${productId}/reviews`, data);