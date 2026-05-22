const express = require('express');
const { body, param } = require('express-validator');
const ownerController = require('../controllers/ownerController');
const validateRequest = require('../middleware/validateRequest');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect, authorizeRoles('restaurantOwner', 'admin'));

router.get('/restaurants', ownerController.getMyRestaurants);
router.get('/restaurants/:restaurantId/menu', [param('restaurantId').isMongoId(), validateRequest], ownerController.getRestaurantMenu);
router.post('/restaurants/:restaurantId/food-items', [param('restaurantId').isMongoId(), body('name').notEmpty(), body('price').isNumeric(), body('category').notEmpty(), validateRequest], ownerController.addFoodItem);
router.put('/restaurants/:restaurantId/food-items/:foodItemId', [param('restaurantId').isMongoId(), param('foodItemId').isMongoId(), validateRequest], ownerController.updateFoodItem);
router.delete('/restaurants/:restaurantId/food-items/:foodItemId', [param('restaurantId').isMongoId(), param('foodItemId').isMongoId(), validateRequest], ownerController.deleteFoodItem);
router.patch('/restaurants/:restaurantId/prep-time', [param('restaurantId').isMongoId(), body('prepTimeMinutes').isNumeric(), validateRequest], ownerController.updatePrepTime);
router.get('/orders', ownerController.getIncomingOrders);
router.patch('/orders/:orderId/status', [param('orderId').isMongoId(), validateRequest], ownerController.updateOrderStatus);

module.exports = router;