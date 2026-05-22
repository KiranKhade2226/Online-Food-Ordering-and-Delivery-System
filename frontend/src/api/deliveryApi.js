import client from './client';

export const getAvailableDeliveryOrders = (latitude, longitude, maxDistance = 5000) => 
  client.get('/delivery/orders/available', { params: { latitude, longitude, maxDistance } });
export const getMyDeliveries = () => client.get('/delivery/orders/me');
export const acceptDeliveryOrder = (orderId) => client.patch(`/delivery/orders/${orderId}/accept`);
export const rejectDeliveryOrder = (orderId) => client.patch(`/delivery/orders/${orderId}/reject`);
export const updateDeliveryOrderStatus = (orderId, status) => client.patch(`/delivery/orders/${orderId}/status`, { status });