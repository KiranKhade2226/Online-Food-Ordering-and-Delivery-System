const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const Restaurant = require('../models/Restaurant');
const FoodItem = require('../models/FoodItem');
const Order = require('../models/Order');

const ownsRestaurant = async (restaurantId, userId) => {
  const restaurant = await Restaurant.findById(restaurantId);
  if (!restaurant) {
    throw new ApiError(404, 'Restaurant not found');
  }

  return restaurant.ownerId.toString() === userId.toString() || restaurant.ownerId.toString() === userId.toString();
};

const getMyRestaurants = asyncHandler(async (req, res) => {
  const restaurants = await Restaurant.find({ ownerId: req.user._id }).populate('menu').sort({ createdAt: -1 });
  res.json(new ApiResponse(200, restaurants, 'Owner restaurants fetched'));
});

const getRestaurantMenu = asyncHandler(async (req, res) => {
  const restaurant = await Restaurant.findById(req.params.restaurantId).populate('menu');
  if (!restaurant) {
    throw new ApiError(404, 'Restaurant not found');
  }

  if (restaurant.ownerId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw new ApiError(403, 'Not allowed to view this restaurant');
  }

  res.json(new ApiResponse(200, restaurant, 'Restaurant menu fetched'));
});

const addFoodItem = asyncHandler(async (req, res) => {
  const restaurant = await Restaurant.findById(req.params.restaurantId);
  if (!restaurant) {
    throw new ApiError(404, 'Restaurant not found');
  }

  if (restaurant.ownerId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw new ApiError(403, 'Not allowed to manage this restaurant');
  }

  const foodItem = await FoodItem.create({
    restaurantId: restaurant._id,
    name: req.body.name,
    price: req.body.price,
    category: req.body.category,
    description: req.body.description,
    image: req.body.image,
    isAvailable: req.body.isAvailable ?? true,
  });

  await Restaurant.updateOne({ _id: restaurant._id }, { $addToSet: { menu: foodItem._id } });
  res.status(201).json(new ApiResponse(201, foodItem, 'Food item added'));
});

const updateFoodItem = asyncHandler(async (req, res) => {
  const foodItem = await FoodItem.findById(req.params.foodItemId);
  if (!foodItem) {
    throw new ApiError(404, 'Food item not found');
  }

  const restaurant = await Restaurant.findById(req.params.restaurantId);
  if (!restaurant || (restaurant.ownerId.toString() !== req.user._id.toString() && req.user.role !== 'admin')) {
    throw new ApiError(403, 'Not allowed to manage this restaurant');
  }

  Object.assign(foodItem, req.body);
  await foodItem.save();

  res.json(new ApiResponse(200, foodItem, 'Food item updated'));
});

const deleteFoodItem = asyncHandler(async (req, res) => {
  const foodItem = await FoodItem.findById(req.params.foodItemId);
  if (!foodItem) {
    throw new ApiError(404, 'Food item not found');
  }

  const restaurant = await Restaurant.findById(req.params.restaurantId);
  if (!restaurant || (restaurant.ownerId.toString() !== req.user._id.toString() && req.user.role !== 'admin')) {
    throw new ApiError(403, 'Not allowed to manage this restaurant');
  }

  await FoodItem.deleteOne({ _id: foodItem._id });
  await Restaurant.updateOne({ _id: restaurant._id }, { $pull: { menu: foodItem._id } });

  res.json(new ApiResponse(200, null, 'Food item deleted'));
});

const updatePrepTime = asyncHandler(async (req, res) => {
  const restaurant = await Restaurant.findById(req.params.restaurantId);
  if (!restaurant) {
    throw new ApiError(404, 'Restaurant not found');
  }

  if (restaurant.ownerId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw new ApiError(403, 'Not allowed to manage this restaurant');
  }

  restaurant.prepTimeMinutes = req.body.prepTimeMinutes;
  await restaurant.save();

  res.json(new ApiResponse(200, restaurant, 'Prep time updated'));
});

const getIncomingOrders = asyncHandler(async (req, res) => {
  const restaurants = await Restaurant.find({ ownerId: req.user._id }).select('_id');
  const restaurantIds = restaurants.map((restaurant) => restaurant._id);

  const orders = await Order.find({ restaurantId: { $in: restaurantIds } })
    .populate('customerId', 'name email phone location')
    .populate('restaurantId', 'name address prepTimeMinutes')
    .populate('deliveryPartnerId', 'name email phone')
    .populate('paymentId')
    .sort({ createdAt: -1 });

  res.json(new ApiResponse(200, orders, 'Incoming orders fetched'));
});

const updateOrderStatus = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.orderId).populate('restaurantId');
  if (!order) {
    throw new ApiError(404, 'Order not found');
  }

  const restaurant = await Restaurant.findById(order.restaurantId._id);
  if (!restaurant || (restaurant.ownerId.toString() !== req.user._id.toString() && req.user.role !== 'admin')) {
    throw new ApiError(403, 'Not allowed to update this order');
  }

  const nextStatus = req.body.action === 'reject' ? 'Cancelled' : req.body.status || 'Preparing';
  order.status = nextStatus;
  order.timeline.push({ status: nextStatus });
  await order.save();

  res.json(new ApiResponse(200, order, 'Order updated'));
});

module.exports = {
  getMyRestaurants,
  getRestaurantMenu,
  addFoodItem,
  updateFoodItem,
  deleteFoodItem,
  updatePrepTime,
  getIncomingOrders,
  updateOrderStatus,
};