const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const Coupon = require('../models/Coupon');

const createCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.create(req.body);
  res.status(201).json(new ApiResponse(201, coupon, 'Coupon created'));
});

const getCoupons = asyncHandler(async (req, res) => {
  const coupons = await Coupon.find();
  res.json(new ApiResponse(200, coupons, 'Coupons fetched'));
});

const validateCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findOne({ code: req.params.code.toUpperCase(), active: true });

  if (!coupon || coupon.expiry < new Date()) {
    throw new ApiError(404, 'Coupon is invalid or expired');
  }

  res.json(new ApiResponse(200, coupon, 'Coupon is valid'));
});

module.exports = { createCoupon, getCoupons, validateCoupon };
