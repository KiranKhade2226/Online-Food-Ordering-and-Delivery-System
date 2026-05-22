const crypto = require('crypto');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const Order = require('../models/Order');
const Payment = require('../models/Payment');
const { getRazorpayClient } = require('../services/razorpayService');

const createPaymentOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.body.orderId);
  if (!order) {
    throw new ApiError(404, 'Order not found');
  }

  const razorpay = getRazorpayClient();
  if (!razorpay) {
    throw new ApiError(500, 'Razorpay is not configured');
  }

  const razorpayOrder = await razorpay.orders.create({
    amount: Math.round(order.totalAmount * 100),
    currency: 'INR',
    receipt: `order_${order._id}`,
  });

  const payment = await Payment.findOneAndUpdate(
    { orderId: order._id },
    {
      orderId: order._id,
      status: 'pending',
      method: 'razorpay',
      razorpayOrderId: razorpayOrder.id,
      amount: order.totalAmount,
      currency: 'INR',
      rawPayload: razorpayOrder,
    },
    { new: true, upsert: true }
  );

  res.json(new ApiResponse(200, { razorpayOrder, payment, keyId: process.env.RAZORPAY_KEY_ID }, 'Payment order created'));
});

const verifyPayment = asyncHandler(async (req, res) => {
  const razorpayOrderId = req.body.razorpayOrderId || req.body.razorpay_order_id;
  const razorpayPaymentId = req.body.razorpayPaymentId || req.body.razorpay_payment_id;
  const razorpaySignature = req.body.razorpaySignature || req.body.razorpay_signature;
  const orderId = req.body.orderId;

  const generatedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest('hex');

  if (generatedSignature !== razorpaySignature) {
    const failedPayment = await Payment.findOneAndUpdate(
      { razorpayOrderId },
      { status: 'failed', rawPayload: req.body },
      { new: true }
    );

    throw new ApiError(400, 'Payment verification failed', { payment: failedPayment });
  }

  const payment = await Payment.findOneAndUpdate(
    { razorpayOrderId },
    {
      status: 'paid',
      razorpayPaymentId,
      razorpaySignature,
      rawPayload: req.body,
    },
    { new: true }
  );

  const order = await Order.findByIdAndUpdate(orderId, { paymentId: payment?._id }, { new: true });
  if (req.app.get('io') && order) {
    req.app.get('io').to(`order:${order._id}`).emit('payment-updated', { payment, order });
  }

  res.json(new ApiResponse(200, { payment, order }, 'Payment verified'));
});

const getPaymentStatus = asyncHandler(async (req, res) => {
  const payment = await Payment.findOne({ orderId: req.params.orderId });
  if (!payment) {
    throw new ApiError(404, 'Payment not found');
  }

  res.json(new ApiResponse(200, payment, 'Payment status fetched'));
});

module.exports = { createPaymentOrder, verifyPayment, getPaymentStatus };
