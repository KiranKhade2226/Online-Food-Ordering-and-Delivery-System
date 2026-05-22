const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const FoodItem = require('../models/FoodItem');
const Restaurant = require('../models/Restaurant');

const getFoodItemsByRestaurant = asyncHandler(async (req, res) => {
  const items = await FoodItem.find({ restaurantId: req.params.restaurantId });
  res.json(new ApiResponse(200, items, 'Food items fetched'));
});

const getFoodItemById = asyncHandler(async (req, res) => {
  const foodItem = await FoodItem.findById(req.params.id);
  if (!foodItem) {
    throw new ApiError(404, 'Food item not found');
  }
  res.json(new ApiResponse(200, foodItem, 'Food item fetched'));
});

const createFoodItem = asyncHandler(async (req, res) => {
  const restaurant = await Restaurant.findById(req.body.restaurantId);
  if (!restaurant) {
    throw new ApiError(404, 'Restaurant not found');
  }

  const foodItem = await FoodItem.create(req.body);
  restaurant.menu.push(foodItem._id);
  await restaurant.save();

  res.status(201).json(new ApiResponse(201, foodItem, 'Food item created'));
});

const updateFoodItem = asyncHandler(async (req, res) => {
  const foodItem = await FoodItem.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!foodItem) {
    throw new ApiError(404, 'Food item not found');
  }
  res.json(new ApiResponse(200, foodItem, 'Food item updated'));
});

const deleteFoodItem = asyncHandler(async (req, res) => {
  const foodItem = await FoodItem.findByIdAndDelete(req.params.id);
  if (!foodItem) {
    throw new ApiError(404, 'Food item not found');
  }

  await Restaurant.updateOne({ _id: foodItem.restaurantId }, { $pull: { menu: foodItem._id } });
  res.json(new ApiResponse(200, null, 'Food item deleted'));
});

module.exports = {
  getFoodItemsByRestaurant,
  getFoodItemById,
  createFoodItem,
  updateFoodItem,
  deleteFoodItem,
};
