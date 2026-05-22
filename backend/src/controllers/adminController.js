const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const User = require('../models/User');
const Restaurant = require('../models/Restaurant');
const Order = require('../models/Order');
const { normalizeRole, normalizeUser } = require('../utils/role');

const groupUsersByRole = (users) => users.reduce(
  (groups, user) => {
    const normalizedRole = normalizeRole(user.role);
    groups[normalizedRole].push(normalizeUser(user));
    return groups;
  },
  {
    customer: [],
    restaurantOwner: [],
    deliveryPartner: [],
    admin: [],
  }
);

const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select('-password').sort({ createdAt: -1 });
  res.json(new ApiResponse(200, groupUsersByRole(users), 'Users fetched'));
});

const getRestaurants = asyncHandler(async (req, res) => {
  const restaurants = await Restaurant.find().populate('ownerId', 'name email role').sort({ createdAt: -1 });
  res.json(new ApiResponse(200, restaurants, 'Restaurants fetched'));
});

const updateRestaurantApproval = asyncHandler(async (req, res) => {
  const restaurant = await Restaurant.findById(req.params.id);

  if (!restaurant) {
    throw new ApiError(404, 'Restaurant not found');
  }

  const { isApproved } = req.body;
  restaurant.isApproved = typeof isApproved === 'boolean' ? isApproved : !restaurant.isApproved;
  await restaurant.save();

  const populatedRestaurant = await Restaurant.findById(restaurant._id).populate('ownerId', 'name email role');
  res.json(new ApiResponse(200, populatedRestaurant, `Restaurant ${restaurant.isApproved ? 'approved' : 'rejected'}`));
});

const getOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find()
    .populate('customerId', 'name email role phone location')
    .populate('restaurantId', 'name address isApproved ownerId')
    .populate('deliveryPartnerId', 'name email role phone')
    .sort({ createdAt: -1 });

  res.json(new ApiResponse(200, orders, 'Orders fetched'));
});

const getDashboardStats = asyncHandler(async (req, res) => {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(startOfDay);
  endOfDay.setDate(endOfDay.getDate() + 1);

  const [totalCustomers, totalRestaurants, totalDeliveryPartners, ordersToday, completedOrders, pendingOrders, revenueToday, totalRevenue, dailyMetrics] = await Promise.all([
    User.countDocuments({ role: 'customer' }),
    Restaurant.countDocuments(),
    User.countDocuments({ role: 'deliveryPartner' }),
    Order.countDocuments({ createdAt: { $gte: startOfDay, $lt: endOfDay } }),
    Order.countDocuments({ status: 'Delivered' }),
    Order.countDocuments({ status: { $in: ['Pending', 'Accepted', 'Preparing', 'On The Way'] } }),
    Order.aggregate([
      { $match: { createdAt: { $gte: startOfDay, $lt: endOfDay } } },
      { $group: { _id: null, revenue: { $sum: '$totalAmount' } } },
    ]),
    Order.aggregate([{ $group: { _id: null, revenue: { $sum: '$totalAmount' } } }]),
    Order.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
          revenue: { $sum: '$totalAmount' },
        },
      },
      { $sort: { _id: 1 } },
    ]),
  ]);

  res.json(
    new ApiResponse(
      200,
      {
        totalCustomers,
        totalRestaurants,
        totalDeliveryPartners,
        ordersToday,
        completedOrders,
        pendingOrders,
        revenueToday: revenueToday[0]?.revenue || 0,
        totalRevenue: totalRevenue[0]?.revenue || 0,
        dailyMetrics,
      },
      'Admin dashboard stats fetched'
    )
  );
});

const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  if (user._id.toString() === req.user._id.toString()) {
    throw new ApiError(400, 'You cannot delete your own account');
  }

  await User.deleteOne({ _id: user._id });
  res.json(new ApiResponse(200, null, 'User deleted'));
});

module.exports = { getUsers, getRestaurants, updateRestaurantApproval, getOrders, getDashboardStats, deleteUser };
