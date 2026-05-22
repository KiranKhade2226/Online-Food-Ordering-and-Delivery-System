import client from './client';

export const getAdminStats = () => client.get('/admin/stats');
export const getAdminUsers = () => client.get('/admin/users');
export const getAdminRestaurants = () => client.get('/admin/restaurants');
export const getAdminOrders = () => client.get('/admin/orders');
export const updateRestaurantApproval = (id, isApproved) => client.put(`/admin/restaurants/${id}/approve`, { isApproved });
export const deleteAdminUser = (id) => client.delete(`/admin/users/${id}`);