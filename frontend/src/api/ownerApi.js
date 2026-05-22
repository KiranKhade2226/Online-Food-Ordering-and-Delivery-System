import client from './client';

export const createOwnerRestaurant = (payload) => client.post('/restaurants', payload);
export const getOwnerRestaurants = () => client.get('/owner/restaurants');
export const getOwnerOrders = () => client.get('/owner/orders');
export const getOwnerRestaurantMenu = (restaurantId) => client.get(`/owner/restaurants/${restaurantId}/menu`);
export const addOwnerFoodItem = (restaurantId, payload) => client.post(`/owner/restaurants/${restaurantId}/food-items`, payload);
export const updateOwnerFoodItem = (restaurantId, foodItemId, payload) => client.put(`/owner/restaurants/${restaurantId}/food-items/${foodItemId}`, payload);
export const deleteOwnerFoodItem = (restaurantId, foodItemId) => client.delete(`/owner/restaurants/${restaurantId}/food-items/${foodItemId}`);
export const updatePrepTime = (restaurantId, prepTimeMinutes) => client.patch(`/owner/restaurants/${restaurantId}/prep-time`, { prepTimeMinutes });
export const updateOwnerOrderStatus = (orderId, payload) => client.patch(`/owner/orders/${orderId}/status`, payload);