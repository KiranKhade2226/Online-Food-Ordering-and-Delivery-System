const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const Cart = require('../models/Cart');
const Order = require('../models/Order');
const Payment = require('../models/Payment');
const Coupon = require('../models/Coupon');

const emitOrderUpdate = (req, order, event = 'order-updated') => {
  const io = req.app.get('io');
  if (io && order) {
    io.to(`order:${order._id}`).emit(event, order);
    io.to(`user:${order.customerId}`).emit('notification', {
      type: 'order',
      message: `Order ${order._id} is now ${order.status}`,
      order,
    });
  }
};

const createOrderFromCart = asyncHandler(async (req, res) => {
  const { restaurantId, deliveryAddress, couponCode, notes } = req.body;
  const cart = await Cart.findOne({ customerId: req.user._id });

  if (!cart || cart.items.length === 0) {
    throw new ApiError(400, 'Cart is empty');
  }

  const items = cart.items.map((item) => ({
    foodItemId: item.foodItemId,
    name: item.name,
    price: item.price,
    quantity: item.quantity,
  }));

  let totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (couponCode) {
    const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), active: true });
    if (coupon && coupon.expiry > new Date() && totalAmount >= coupon.minimumOrderAmount) {
      totalAmount = coupon.discountType === 'percent'
        ? totalAmount - (totalAmount * coupon.discountValue) / 100
        : Math.max(0, totalAmount - coupon.discountValue);
    }
  }

  const order = await Order.create({
    customerId: req.user._id,
    restaurantId,
    items,
    totalAmount,
    deliveryAddress,
    couponCode,
    notes,
    timeline: [{ status: 'Pending' }],
  });

  emitOrderUpdate(req, order, 'order-created');
  res.status(201).json(new ApiResponse(201, order, 'Order created'));
});

const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ customerId: req.user._id })
    .populate('restaurantId')
    .populate('paymentId')
    .sort({ createdAt: -1 });

  res.json(new ApiResponse(200, orders, 'Orders fetched'));
});

const getRestaurantOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ restaurantId: req.params.restaurantId }).populate('customerId deliveryPartnerId paymentId');
  res.json(new ApiResponse(200, orders, 'Restaurant orders fetched'));
});

const getPartnerOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ deliveryPartnerId: req.user._id }).populate('customerId restaurantId paymentId');
  res.json(new ApiResponse(200, orders, 'Delivery orders fetched'));
});

const updateOrderStatus = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    throw new ApiError(404, 'Order not found');
  }

  order.status = req.body.status;
  order.timeline.push({ status: req.body.status });
  await order.save();

  emitOrderUpdate(req, order);
  res.json(new ApiResponse(200, order, 'Order status updated'));
});

const assignDeliveryPartner = asyncHandler(async (req, res) => {
  const order = await Order.findByIdAndUpdate(
    req.params.id,
    { deliveryPartnerId: req.body.deliveryPartnerId, status: 'On The Way' },
    { new: true }
  );

  if (!order) {
    throw new ApiError(404, 'Order not found');
  }

  order.timeline.push({ status: 'On The Way' });
  await order.save();
  emitOrderUpdate(req, order);

  res.json(new ApiResponse(200, order, 'Delivery partner assigned'));
});

const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('customerId restaurantId deliveryPartnerId paymentId items.foodItemId');
  if (!order) {
    throw new ApiError(404, 'Order not found');
  }
  res.json(new ApiResponse(200, order, 'Order fetched'));
});

const getDailyStats = asyncHandler(async (req, res) => {
  const stats = await Order.aggregate([
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        totalOrders: { $sum: 1 },
        totalRevenue: { $sum: '$totalAmount' },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  res.json(new ApiResponse(200, stats, 'Daily order stats fetched'));
});

module.exports = {
  createOrderFromCart,
  getMyOrders,
  getRestaurantOrders,
  getPartnerOrders,
  updateOrderStatus,
  assignDeliveryPartner,
  getOrderById,
  getDailyStats,
};
