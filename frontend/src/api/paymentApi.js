import client from './client';

export const createPaymentOrder = (orderId) => client.post('/payments/create-order', { orderId });
export const verifyPayment = (payload) => client.post('/payments/verify', payload);
export const getPaymentStatus = (orderId) => client.get(`/payments/${orderId}`);