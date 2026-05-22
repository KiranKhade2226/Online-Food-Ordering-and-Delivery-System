const mongoose = require('mongoose');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const Order = require('../models/Order');
const Restaurant = require('../models/Restaurant');

const populateDeliveryOrder = (query) => query
  .populate('customerId', 'name email phone location')
  .populate('restaurantId', 'name address gpsLocation prepTimeMinutes')
  .populate('deliveryPartnerId', 'name email phone')
  .populate('paymentId');

const getAvailableOrders = asyncHandler(async (req, res) => {
  const { latitude, longitude, maxDistance = 5000 } = req.query;

  let orders = [];
  if (latitude && longitude) {
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lng)) {
      throw new ApiError(400, 'Invalid latitude or longitude');
    }

    // Find nearby restaurants using geospatial query
    const nearbyRestaurants = await mongoose.connection.collection('restaurants').aggregate([
      {
        $geoNear: {
          near: { type: 'Point', coordinates: [lng, lat] },
          distanceField: 'distance',
          maxDistance: parseInt(maxDistance),
          spherical: true,
        },
      },
      { $project: { _id: 1, distance: 1 } },
    ]).toArray();

    const nearbyRestaurantIds = nearbyRestaurants.map(r => r._id);

    if (nearbyRestaurantIds.length === 0) {
      return res.json(new ApiResponse(200, [], 'No nearby restaurants with orders'));
    }

    // Get orders from nearby restaurants
    orders = await Order.aggregate([
      {
        $match: {
          restaurantId: { $in: nearbyRestaurantIds },
          status: { $in: ['Accepted', 'Preparing'] },
          $or: [{ deliveryPartnerId: { $exists: false } }, { deliveryPartnerId: null }],
        },
      },
      {
        $addFields: {
          distance: {
            $arrayElemAt: [
              {
                $map: {
                  input: nearbyRestaurants,
                  as: 'rest',
                  in: {
                    $cond: [{ $eq: ['$$rest._id', '$restaurantId'] }, '$$rest.distance', null],
                  },
                },
              },
              0,
            ],
          },
        },
      },
      {
        $lookup: {
          from: 'restaurants',
          localField: 'restaurantId',
          foreignField: '_id',
          as: 'restaurantId',
        },
      },
      { $unwind: { path: '$restaurantId', preserveNullAndEmptyArrays: false } },
      {
        $lookup: {
          from: 'users',
          localField: 'customerId',
          foreignField: '_id',
          as: 'customerId',
        },
      },
      { $unwind: { path: '$customerId', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'users',
          localField: 'deliveryPartnerId',
          foreignField: '_id',
          as: 'deliveryPartnerId',
        },
      },
      { $unwind: { path: '$deliveryPartnerId', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'payments',
          localField: 'paymentId',
          foreignField: '_id',
          as: 'paymentId',
        },
      },
      { $unwind: { path: '$paymentId', preserveNullAndEmptyArrays: true } },
      { $sort: { distance: 1, createdAt: -1 } },
    ]);
  } else {
    // Fallback: fetch all available orders without distance filtering
    orders = await populateDeliveryOrder(
      Order.find({
        status: { $in: ['Accepted', 'Preparing'] },
        $or: [{ deliveryPartnerId: { $exists: false } }, { deliveryPartnerId: null }],
      })
    ).sort({ createdAt: -1 });
  }

  res.json(new ApiResponse(200, orders, 'Available orders fetched'));
});

const getMyDeliveries = asyncHandler(async (req, res) => {
  const orders = await populateDeliveryOrder(
    Order.find({ deliveryPartnerId: req.user._id })
  ).sort({ createdAt: -1 });

  res.json(new ApiResponse(200, orders, 'Delivery history fetched'));
});

const acceptDelivery = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.orderId);
  if (!order) {
    throw new ApiError(404, 'Order not found');
  }

  if (order.status !== 'Accepted' && order.status !== 'Preparing') {
    throw new ApiError(400, 'Order is not available for delivery');
  }

  order.deliveryPartnerId = req.user._id;
  order.status = 'On The Way';
  order.timeline.push({ status: 'On The Way' });
  await order.save();

  const populatedOrder = await populateDeliveryOrder(Order.findById(order._id));
  res.json(new ApiResponse(200, populatedOrder, 'Delivery accepted'));
});

const rejectDelivery = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.orderId);
  if (!order) {
    throw new ApiError(404, 'Order not found');
  }

  if (order.deliveryPartnerId && order.deliveryPartnerId.toString() === req.user._id.toString()) {
    order.deliveryPartnerId = null;
    order.status = 'Accepted';
    order.timeline.push({ status: 'Accepted' });
    await order.save();
  }

  res.json(new ApiResponse(200, order, 'Delivery rejected'));
});

const updateDeliveryStatus = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.orderId);
  if (!order) {
    throw new ApiError(404, 'Order not found');
  }

  if (order.deliveryPartnerId?.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw new ApiError(403, 'Not allowed to update this delivery');
  }

  const status = req.body.status;
  order.status = status;
  order.timeline.push({ status });
  await order.save();

  const populatedOrder = await populateDeliveryOrder(Order.findById(order._id));
  res.json(new ApiResponse(200, populatedOrder, 'Delivery status updated'));
});

module.exports = {
  getAvailableOrders,
  getMyDeliveries,
  acceptDelivery,
  rejectDelivery,
  updateDeliveryStatus,
};