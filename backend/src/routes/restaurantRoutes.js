const express = require('express');
const { body, param } = require('express-validator');
const restaurantController = require('../controllers/restaurantController');
const validateRequest = require('../middleware/validateRequest');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/nearby', restaurantController.getNearbyRestaurants);
router.get('/:id', [param('id').isMongoId(), validateRequest], restaurantController.getRestaurantById);

router.post(
  '/',
  protect,
  authorizeRoles('restaurantOwner', 'admin'),
  [body('name').notEmpty(), body('address').notEmpty(), validateRequest],
  restaurantController.createRestaurant
);

router.put('/:id', protect, authorizeRoles('restaurantOwner', 'admin'), restaurantController.updateRestaurant);
router.patch('/:id/approve', protect, authorizeRoles('admin'), restaurantController.approveRestaurant);

router.post('/:restaurantId/food-items', protect, authorizeRoles('restaurantOwner', 'admin'), restaurantController.addFoodItem);
router.put('/:restaurantId/food-items/:foodItemId', protect, authorizeRoles('restaurantOwner', 'admin'), restaurantController.updateFoodItem);
router.delete('/:restaurantId/food-items/:foodItemId', protect, authorizeRoles('restaurantOwner', 'admin'), restaurantController.deleteFoodItem);

module.exports = router;
