const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const Review = require('../models/Review');

const addReview = asyncHandler(async (req, res) => {
  const review = await Review.create({
    rating: req.body.rating,
    comment: req.body.comment,
    userId: req.user._id,
    restaurantId: req.body.restaurantId,
    orderId: req.body.orderId,
  });

  res.status(201).json(new ApiResponse(201, review, 'Review added'));
});

const getRestaurantReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ restaurantId: req.params.restaurantId }).populate('userId', 'name');
  res.json(new ApiResponse(200, reviews, 'Reviews fetched'));
});

const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) {
    throw new ApiError(404, 'Review not found');
  }

  if (review.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw new ApiError(403, 'Not allowed to delete this review');
  }

  await review.deleteOne();
  res.json(new ApiResponse(200, null, 'Review deleted'));
});

module.exports = { addReview, getRestaurantReviews, deleteReview };
