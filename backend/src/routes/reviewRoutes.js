const express = require('express');
const { body, param } = require('express-validator');
const reviewController = require('../controllers/reviewController');
const validateRequest = require('../middleware/validateRequest');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, authorizeRoles('customer'), [body('restaurantId').isMongoId(), body('rating').isInt({ min: 1, max: 5 }), validateRequest], reviewController.addReview);
router.get('/restaurant/:restaurantId', [param('restaurantId').isMongoId(), validateRequest], reviewController.getRestaurantReviews);
router.delete('/:id', protect, authorizeRoles('customer', 'admin'), reviewController.deleteReview);

module.exports = router;
