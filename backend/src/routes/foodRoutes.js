const express = require('express');
const { body, param } = require('express-validator');
const foodController = require('../controllers/foodController');
const validateRequest = require('../middleware/validateRequest');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/restaurant/:restaurantId', [param('restaurantId').isMongoId(), validateRequest], foodController.getFoodItemsByRestaurant);
router.get('/:id', [param('id').isMongoId(), validateRequest], foodController.getFoodItemById);
router.post('/', protect, authorizeRoles('restaurantOwner', 'admin'), [body('restaurantId').isMongoId(), body('name').notEmpty(), body('price').isNumeric(), body('category').notEmpty(), validateRequest], foodController.createFoodItem);
router.put('/:id', protect, authorizeRoles('restaurantOwner', 'admin'), foodController.updateFoodItem);
router.delete('/:id', protect, authorizeRoles('restaurantOwner', 'admin'), foodController.deleteFoodItem);

module.exports = router;
