const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const Restaurant = require('../models/Restaurant');
const FoodItem = require('../models/FoodItem');

const createRestaurant = asyncHandler(async (req, res) => {
  const gpsLocation = req.body.gpsLocation;
  const coordinates = gpsLocation?.coordinates;

  if (!gpsLocation || gpsLocation.type !== 'Point' || !Array.isArray(coordinates) || coordinates.length !== 2) {
    throw new ApiError(400, 'GPS location is required');
  }

  const longitude = Number(coordinates[0]);
  const latitude = Number(coordinates[1]);

  if (Number.isNaN(longitude) || Number.isNaN(latitude)) {
    throw new ApiError(400, 'GPS location must contain valid longitude and latitude');
  }

  const restaurant = await Restaurant.create({
    ownerId: req.user._id,
    name: req.body.name,
    address: req.body.address || `GPS location (${latitude.toFixed(5)}, ${longitude.toFixed(5)})`,
    gpsLocation: {
      type: 'Point',
      coordinates: [longitude, latitude],
    },
    prepTimeMinutes: req.body.prepTimeMinutes,
    image: req.body.image,
  });

  res.status(201).json(new ApiResponse(201, restaurant, 'Restaurant created'));
});

const getNearbyRestaurants = asyncHandler(async (req, res) => {
  const latitude = Number(req.query.latitude);
  const longitude = Number(req.query.longitude);
  const maxDistance = Number(req.query.maxDistance || 5000);

  if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
    throw new ApiError(400, 'latitude and longitude are required');
  }

  const restaurants = await Restaurant.aggregate([
    {
      $geoNear: {
        near: { type: 'Point', coordinates: [longitude, latitude] },
        distanceField: 'distance',
        maxDistance,
        spherical: true,
      },
    },
    { $match: { isApproved: true } },
    { $sort: { distance: 1 } },
  ]);

  res.json(new ApiResponse(200, restaurants, 'Nearby restaurants fetched'));
});

const getRestaurantById = asyncHandler(async (req, res) => {
  const restaurant = await Restaurant.findById(req.params.id).populate('menu');
  if (!restaurant) {
    throw new ApiError(404, 'Restaurant not found');
  }

  res.json(new ApiResponse(200, restaurant, 'Restaurant fetched'));
});

const updateRestaurant = asyncHandler(async (req, res) => {
  const restaurant = await Restaurant.findById(req.params.id);

  if (!restaurant) {
    throw new ApiError(404, 'Restaurant not found');
  }

  if (req.user.role !== 'admin' && restaurant.ownerId.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'Not allowed to update this restaurant');
  }

  Object.assign(restaurant, req.body);
  await restaurant.save();

  res.json(new ApiResponse(200, restaurant, 'Restaurant updated'));
});

const approveRestaurant = asyncHandler(async (req, res) => {
  const restaurant = await Restaurant.findByIdAndUpdate(req.params.id, { isApproved: true }, { new: true });

  if (!restaurant) {
    throw new ApiError(404, 'Restaurant not found');
  }

  res.json(new ApiResponse(200, restaurant, 'Restaurant approved'));
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
    isAvailable: req.body.isAvailable,
  });

  restaurant.menu.push(foodItem._id);
  await restaurant.save();

  res.status(201).json(new ApiResponse(201, foodItem, 'Food item added'));
});

const updateFoodItem = asyncHandler(async (req, res) => {
  const foodItem = await FoodItem.findByIdAndUpdate(req.params.foodItemId, req.body, { new: true });
  if (!foodItem) {
    throw new ApiError(404, 'Food item not found');
  }
  res.json(new ApiResponse(200, foodItem, 'Food item updated'));
});

const deleteFoodItem = asyncHandler(async (req, res) => {
  const foodItem = await FoodItem.findByIdAndDelete(req.params.foodItemId);
  if (!foodItem) {
    throw new ApiError(404, 'Food item not found');
  }

  await Restaurant.updateOne({ _id: foodItem.restaurantId }, { $pull: { menu: foodItem._id } });

  res.json(new ApiResponse(200, null, 'Food item deleted'));
});

module.exports = {
  createRestaurant,
  getNearbyRestaurants,
  getRestaurantById,
  updateRestaurant,
  approveRestaurant,
  addFoodItem,
  updateFoodItem,
  deleteFoodItem,
};
